/*
 * POST /api/setup/verified
 *
 * Called after the OTP is accepted. Marks the setup verified and starts the
 * phone number's OTP-free window (OTP_FREE_DAYS from now).
 *
 * TEMPORARY: the OTP is still the dummy one in src/services/auth.js, checked in
 * the browser, so this endpoint takes the browser's word for it. When the real
 * OTP provider is wired in, verification moves to the server and this endpoint
 * is replaced by one that checks the code with the provider first.
 *
 * Body: { setupId }
 * 200:  { ok: true, otpFreeUntil }
 */
import { ObjectId } from 'mongodb';
import { getDb, otpFreeDays } from '../_lib/db.js';
import { badRequest, clientIp, handle, readJson, sendJson } from '../_lib/http.js';

export default handle('POST', async (req, res) => {
  const body = await readJson(req);
  if (!ObjectId.isValid(body.setupId)) throw badRequest('invalid_setup');
  const setupId = new ObjectId(body.setupId);

  const db = await getDb();
  const setups = db.collection('setups');
  const now = new Date();

  // Only a setup that is still waiting for its OTP, and only within an hour of starting.
  const setup = await setups.findOneAndUpdate(
    { _id: setupId, status: 'phone_entered', startedAt: { $gte: new Date(now.getTime() - 60 * 60 * 1000) } },
    { $set: { status: 'verified', verifiedAt: now, lastActiveAt: now, updatedAt: now } },
    { returnDocument: 'after' },
  );
  if (!setup) throw Object.assign(new Error('setup_not_pending'), { status: 409 });

  const otpFreeUntil = new Date(now.getTime() + otpFreeDays() * 24 * 60 * 60 * 1000);
  // The user's window and the log entry are independent: write them together.
  await Promise.all([
    db.collection('users').updateOne({ _id: setup.userId }, { $set: { otpVerifiedAt: now, otpFreeUntil, updatedAt: now } }),
    db.collection('otp_events').insertOne({
      phone: setup.phone,
      setupId,
      type: 'verify',
      result: 'verified',
      provider: 'none',
      ip: clientIp(req),
      createdAt: now,
    }),
  ]);

  return sendJson(res, 200, { ok: true, otpFreeUntil: otpFreeUntil.toISOString() });
});
