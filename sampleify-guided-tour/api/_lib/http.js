/*
 * Small request/response helpers that work the same on Vercel and in the Vite
 * dev middleware (vite.config.js), using only Node's own req/res.
 */

const MAX_BODY_BYTES = 16 * 1024;

export function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

/** Parsed JSON body. Vercel pre-parses it into req.body; the dev server doesn't. */
export async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw Object.assign(new Error('Body too large'), { status: 413 });
    chunks.push(chunk);
  }
  const text = Buffer.concat(chunks).toString('utf8');
  return text ? JSON.parse(text) : {};
}

export function clientIp(req) {
  const forwarded = String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim();
  return forwarded || req.socket?.remoteAddress || null;
}

/** Runs a handler, turning thrown errors into JSON without leaking details. */
export function handle(method, fn) {
  return async (req, res) => {
    if (req.method !== method) {
      res.setHeader('Allow', method);
      return sendJson(res, 405, { error: 'method_not_allowed' });
    }
    try {
      return await fn(req, res);
    } catch (error) {
      const status = error.status ?? (error instanceof SyntaxError ? 400 : 500);
      if (status >= 500) console.error('[api]', req.url, error.name, error.message);
      const message = status >= 500 ? 'server_error' : error instanceof SyntaxError ? 'invalid_json' : error.message;
      return sendJson(res, status, { error: message });
    }
  };
}

export function badRequest(message) {
  return Object.assign(new Error(message), { status: 400 });
}

const clean = (value, max) => (typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').slice(0, max) : '');

/** Indian 10-digit mobile -> E.164 (+91...). Returns null if invalid. */
export function normalisePhone(value) {
  let digits = String(value ?? '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  return /^[6-9]\d{9}$/.test(digits) ? `+91${digits}` : null;
}

export { clean };
