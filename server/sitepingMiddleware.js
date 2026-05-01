import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const defaultDataFile = path.resolve(process.cwd(), '.siteping', 'feedbacks.json');
const feedbackTypes = new Set(['question', 'change', 'bug', 'other']);
const feedbackStatuses = new Set(['open', 'resolved']);

export function sitepingApiPlugin(options = {}) {
  const middleware = createSitepingMiddleware(options);

  return {
    name: 'siteping-api',
    configureServer(server) {
      server.middlewares.use('/api/siteping', middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/siteping', middleware);
    },
  };
}

export function createSitepingMiddleware(options = {}) {
  const dataFile = options.dataFile || defaultDataFile;
  return createSitepingHandler({
    loadFeedbacks: () => loadFeedbacksFromFile(dataFile),
    saveFeedbacks: (feedbacks) => saveFeedbacksToFile(dataFile, feedbacks),
  });
}

export function createSitepingHandler({ loadFeedbacks, saveFeedbacks }) {
  let writeQueue = Promise.resolve();

  const withStore = (mutator) => {
    const run = writeQueue.then(async () => {
      const feedbacks = await loadFeedbacks();
      const result = await mutator(feedbacks);
      await saveFeedbacks(feedbacks);
      return result;
    });

    writeQueue = run.catch(() => {});
    return run;
  };

  return async function sitepingMiddleware(req, res) {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    try {
      if (req.method === 'GET') {
        const requestUrl = new URL(req.url || '/', 'http://siteping.local');
        const feedbacks = await loadFeedbacks();
        sendJson(res, 200, queryFeedbacks(feedbacks, requestUrl.searchParams));
        return;
      }

      if (req.method === 'POST') {
        const body = await readJsonBody(req);
        const created = await withStore((feedbacks) => {
          const existing = feedbacks.find((item) => item.clientId === body.clientId);

          if (existing) {
            return existing;
          }

          const feedback = createFeedback(body);
          feedbacks.unshift(feedback);
          return feedback;
        });

        sendJson(res, 201, created);
        return;
      }

      if (req.method === 'PATCH') {
        const body = await readJsonBody(req);
        const updated = await withStore((feedbacks) => updateFeedback(feedbacks, body));

        sendJson(res, 200, updated);
        return;
      }

      if (req.method === 'DELETE') {
        const body = await readJsonBody(req);

        await withStore((feedbacks) => {
          if (body.deleteAll) {
            deleteAllFeedbacks(feedbacks, body.projectName);
            return null;
          }

          deleteFeedback(feedbacks, body);
          return null;
        });

        sendJson(res, 200, { ok: true });
        return;
      }

      sendJson(res, 405, { error: 'Method not allowed' });
    } catch (error) {
      const status = error.statusCode || 500;
      sendJson(res, status, {
        error: status === 500 ? 'SitePing API error' : error.message,
      });
    }
  };
}

async function loadFeedbacksFromFile(dataFile) {
  try {
    const raw = await fs.readFile(dataFile, 'utf8');
    const data = JSON.parse(raw);

    return Array.isArray(data) ? data : [];
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }

    throw error;
  }
}

async function saveFeedbacksToFile(dataFile, feedbacks) {
  await fs.mkdir(path.dirname(dataFile), { recursive: true });
  await fs.writeFile(dataFile, `${JSON.stringify(feedbacks, null, 2)}\n`);
}

function queryFeedbacks(feedbacks, searchParams) {
  const projectName = searchParams.get('projectName');
  const type = searchParams.get('type');
  const status = searchParams.get('status');
  const search = searchParams.get('search')?.toLowerCase();
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const limit = Math.min(Math.max(1, Number(searchParams.get('limit')) || 50), 100);

  if (!projectName) {
    throw httpError(400, 'projectName is required');
  }

  let results = feedbacks.filter((feedback) => feedback.projectName === projectName);

  if (type) {
    results = results.filter((feedback) => feedback.type === type);
  }

  if (status) {
    results = results.filter((feedback) => feedback.status === status);
  }

  if (search) {
    results = results.filter((feedback) => feedback.message.toLowerCase().includes(search));
  }

  const total = results.length;
  const start = (page - 1) * limit;

  return {
    feedbacks: results.slice(start, start + limit),
    total,
  };
}

function createFeedback(body) {
  const now = new Date().toISOString();
  const id = makeId();

  validateFeedbackPayload(body);

  return {
    id,
    projectName: body.projectName,
    type: body.type,
    message: body.message,
    status: 'open',
    url: body.url,
    viewport: body.viewport,
    userAgent: body.userAgent,
    authorName: body.authorName,
    authorEmail: body.authorEmail,
    clientId: body.clientId,
    resolvedAt: null,
    createdAt: now,
    updatedAt: now,
    annotations: body.annotations.map((annotation) => flattenAnnotation(annotation, id, now)),
  };
}

function updateFeedback(feedbacks, body) {
  if (!body.id || !body.projectName || !feedbackStatuses.has(body.status)) {
    throw httpError(400, 'id, projectName, and a valid status are required');
  }

  const feedback = feedbacks.find(
    (item) => item.id === body.id && item.projectName === body.projectName,
  );

  if (!feedback) {
    throw httpError(404, 'Feedback not found');
  }

  feedback.status = body.status;
  feedback.resolvedAt = body.status === 'resolved' ? new Date().toISOString() : null;
  feedback.updatedAt = new Date().toISOString();

  return feedback;
}

function deleteFeedback(feedbacks, body) {
  if (!body.id || !body.projectName) {
    throw httpError(400, 'id and projectName are required');
  }

  const index = feedbacks.findIndex(
    (item) => item.id === body.id && item.projectName === body.projectName,
  );

  if (index === -1) {
    throw httpError(404, 'Feedback not found');
  }

  feedbacks.splice(index, 1);
}

function deleteAllFeedbacks(feedbacks, projectName) {
  if (!projectName) {
    throw httpError(400, 'projectName is required');
  }

  for (let index = feedbacks.length - 1; index >= 0; index -= 1) {
    if (feedbacks[index].projectName === projectName) {
      feedbacks.splice(index, 1);
    }
  }
}

function validateFeedbackPayload(body) {
  if (!body.projectName || !feedbackTypes.has(body.type) || !body.message || !body.clientId) {
    throw httpError(400, 'projectName, type, message, and clientId are required');
  }

  if (!Array.isArray(body.annotations)) {
    throw httpError(400, 'annotations must be an array');
  }
}

function flattenAnnotation(annotation, feedbackId, now) {
  const anchor = annotation.anchor || annotation;
  const rect = annotation.rect || annotation;

  return {
    id: makeId(),
    feedbackId,
    cssSelector: anchor.cssSelector || '',
    xpath: anchor.xpath || '',
    textSnippet: anchor.textSnippet || '',
    elementTag: anchor.elementTag || '',
    elementId: anchor.elementId || null,
    textPrefix: anchor.textPrefix || '',
    textSuffix: anchor.textSuffix || '',
    fingerprint: anchor.fingerprint || '',
    neighborText: anchor.neighborText || '',
    xPct: Number(rect.xPct) || 0,
    yPct: Number(rect.yPct) || 0,
    wPct: Number(rect.wPct) || 0,
    hPct: Number(rect.hPct) || 0,
    scrollX: Number(annotation.scrollX) || 0,
    scrollY: Number(annotation.scrollY) || 0,
    viewportW: Number(annotation.viewportW) || 0,
    viewportH: Number(annotation.viewportH) || 0,
    devicePixelRatio: Number(annotation.devicePixelRatio) || 1,
    createdAt: now,
  };
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';

    req.on('data', (chunk) => {
      raw += chunk;

      if (raw.length > 1_000_000) {
        reject(httpError(413, 'Request body too large'));
        req.destroy();
      }
    });

    req.on('end', () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(httpError(400, 'Invalid JSON body'));
      }
    });

    req.on('error', reject);
  });
}

function makeId() {
  try {
    return randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
