/*
 * MongoDB connection for the /api functions (see docs/DATABASE.md).
 *
 * Serverless functions are re-used between requests, so the client is cached on
 * globalThis and connects once per instance. Indexes are created on first use,
 * in the background.
 * Files under api/_lib are not deployed as endpoints (leading underscore).
 */
import { MongoClient } from 'mongodb';

const cache = globalThis.__sgtMongo ?? (globalThis.__sgtMongo = { client: null, connecting: null, indexed: false });

export function otpFreeDays() {
  const days = Number(process.env.OTP_FREE_DAYS);
  return Number.isFinite(days) && days >= 0 ? days : 7;
}

export async function getDb() {
  const uri = process.env.MONGODB_URI;
  const name = process.env.MONGODB_DB;
  if (!uri || !name) throw Object.assign(new Error('Database is not configured'), { status: 503 });

  if (!cache.client) {
    cache.connecting ??= new MongoClient(uri, { serverSelectionTimeoutMS: 8000, maxPoolSize: 5 })
      .connect()
      .then((client) => {
        cache.client = client;
        return client;
      })
      .finally(() => {
        cache.connecting = null;
      });
    await cache.connecting;
  }

  const db = cache.client.db(name);
  // Indexes are created once per instance in the background, not awaited: they
  // already exist after the first run, and creating them is idempotent. A
  // request shouldn't wait on them.
  if (!cache.indexed) {
    cache.indexed = true;
    ensureIndexes(db).catch((error) => {
      cache.indexed = false;
      console.error('[api] ensureIndexes', error.name, error.message);
    });
  }
  return db;
}

async function ensureIndexes(db) {
  await Promise.all([
    db.collection('users').createIndex({ phone: 1 }, { unique: true }),
    db.collection('setups').createIndex({ userId: 1, createdAt: -1 }),
    db.collection('setups').createIndex({ createdAt: -1 }),
    db.collection('setups').createIndex({ phone: 1 }),
    db.collection('otp_events').createIndex({ phone: 1, createdAt: -1 }),
    db.collection('otp_events').createIndex({ ip: 1, createdAt: -1 }),
    // Old OTP events delete themselves after 90 days.
    db.collection('otp_events').createIndex({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 }),
  ]);
}
