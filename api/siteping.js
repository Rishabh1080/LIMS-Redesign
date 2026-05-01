import { createSitepingHandler } from '../server/sitepingMiddleware.js';

const defaultRedisKey = 'siteping:lims-v3:feedbacks';

function getRedisConfig() {
  const url =
    process.env.KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN;
  const key = process.env.SITEPING_REDIS_KEY || defaultRedisKey;

  return { url, token, key };
}

async function redisCommand(command) {
  const { url, token } = getRedisConfig();

  if (!url || !token) {
    const error = new Error(
      'SitePing shared storage is not configured. Set KV_REST_API_URL and KV_REST_API_TOKEN in Vercel.',
    );
    error.statusCode = 503;
    throw error;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.error) {
    const error = new Error(payload.error || 'Redis request failed');
    error.statusCode = response.status || 500;
    throw error;
  }

  return payload.result;
}

const handler = createSitepingHandler({
  async loadFeedbacks() {
    const { key } = getRedisConfig();
    const raw = await redisCommand(['GET', key]);

    if (!raw) {
      return [];
    }

    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return Array.isArray(data) ? data : [];
  },
  async saveFeedbacks(feedbacks) {
    const { key } = getRedisConfig();
    await redisCommand(['SET', key, JSON.stringify(feedbacks)]);
  },
});

export default handler;
