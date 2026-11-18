/*
 * POST /api/setup/start
 *
 * Called when the visitor submits their phone number. Records the setup (name,
 * lab name, lab types, phone) and applies the OTP rule: a number verified in the
 * last OTP_FREE_DAYS days skips the OTP.
 *
 * Body: { name, labName, labTypes: string[], domain, phone, client: { referrer, utm } }
 * 200:  { setupId, otpRequired: boolean, otpFreeUntil: string | null }
 */
import { ObjectId } from 'mongodb';
import { getDb } from '../_lib/db.js';
import { badRequest, clean, clientIp, handle, normalisePhone, readJson, sendJson } from '../_lib/http.js';

const LAB_TYPE = /^[a-z][a-z0-9-]{1,30}$/;
const HOUR = 60 * 60 * 1000;
// Generous for real people, tight enough to stop a script filling the database.
const MAX_PER_PHONE_PER_HOUR = 10;
const MAX_PER_IP_PER_HOUR = 40;

function rateLimited() {
  return Object.assign(new Error('rate_limited'), { status: 429 });
}

export default handle('POST', async (req, res) => {
  const body = await readJson(req);
  const phone = normalisePhone(body.phone);
  if (!phone) throw badRequest('invalid_phone');
  const name = clean(body.name, 80);
  const labName = clean(body.labName, 120);
  if (!name || !labName) throw badRequest('name_and_lab_name_required');
  const labTypes = (Array.isArray(body.labTypes) ? body.labTypes : [])
    .map((value) => String(value))
    .filter((value) => LAB_TYPE.test(value))
    .slice(0, 12);
  const domain = clean(body.domain, 120);

  const utm = body.client?.utm && typeof body.client.utm === 'object' ? body.client.utm : {};
  const client = {
    userAgent: clean(req.headers['user-agent'], 300),
    referrer: clean(body.client?.referrer, 500),
    utm: { source: clean(utm.source, 100), medium: clean(utm.medium, 100), campaign: clean(utm.campaign, 100) },
  };
  const ip = clientIp(req);

  const db = await getDb();
  const users = db.collection('users');
  const setups = db.collection('setups');
  const events = db.collection('otp_events');
  const now = new Date();

  // Round trip 1: the rate-limit counts and the user upsert run together.
  const since = new Date(now.getTime() - HOUR);
  const [phoneCount, ipCount, user] = await Promise.all([
    events.countDocuments({ phone, type: 'start', createdAt: { $gte: since } }),
    ip ? events.countDocuments({ ip, type: 'start', createdAt: { $gte: since } }) : 0,
    users.findOneAndUpdate(
      { phone },
      {
        $setOnInsert: { phone, otpVerifiedAt: null, otpFreeUntil: null, firstSeenAt: now, createdAt: now },
        $set: { lastSeenAt: now, updatedAt: now },
        $inc: { setupCount: 1 },
      },
      { upsert: true, returnDocument: 'after' },
    ),
  ]);
  if (phoneCount >= MAX_PER_PHONE_PER_HOUR || ipCount >= MAX_PER_IP_PER_HOUR) {
    // Rare path: undo the count taken above and log the refusal.
    await Promise.all([
      users.updateOne({ _id: user._id }, { $inc: { setupCount: -1 } }),
      events.insertOne({ phone, setupId: null, type: 'start', result: 'rate_limited', provider: 'none', ip, createdAt: now }),
    ]);
    throw rateLimited();
  }

  // Round trip 2: the setup and its log entry are written together. The id is
  // made here so the log can point at the setup without waiting for it.
  const otpFree = Boolean(user.otpFreeUntil && user.otpFreeUntil > now);
  const setupId = new ObjectId();
  const setup = {
    _id: setupId,
    userId: user._id,
    phone,
    name,
    labName,
    labTypes,
    domain,
    status: otpFree ? 'verified' : 'phone_entered',
    otpSkipped: otpFree,
    startedAt: now,
    verifiedAt: otpFree ? now : null,
    lastActiveAt: now,
    client,
    progress: { tasksTotal: 7, completedTaskIds: [], currentTaskId: null, currentStepIndex: 0, lastEventAt: null },
    createdAt: now,
    updatedAt: now,
  };
  await Promise.all([
    setups.insertOne(setup),
    events.insertOne({
      phone,
      setupId,
      type: 'start',
      result: otpFree ? 'skipped_within_window' : 'otp_required',
      provider: 'none',
      ip,
      createdAt: now,
    }),
  ]);

  return sendJson(res, 200, {
    setupId: String(setupId),
    otpRequired: !otpFree,
    // Only revealed when it applies, so the response says nothing about a number's history.
    otpFreeUntil: otpFree ? user.otpFreeUntil.toISOString() : null,
  });
});
