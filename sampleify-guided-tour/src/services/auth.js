/**
 * Dummy OTP adapter.
 *
 * This is the only place that knows how codes are sent and verified. To go
 * live, replace these two functions with calls to your SMS / OTP provider
 * (e.g. via your own API route) and keep the same return shapes.
 */

const OTP_LENGTH = 6;
const SIMULATED_DELAY_MS = 650;

let lastIssued = null;

function randomCode() {
  let code = '';
  for (let index = 0; index < OTP_LENGTH; index += 1) {
    // First digit never 0 so the code reads naturally.
    code += String(index === 0 ? 1 + Math.floor(Math.random() * 9) : Math.floor(Math.random() * 10));
  }
  return code;
}

/**
 * @param {string} phone 10-digit Indian mobile number.
 * @returns {Promise<{ ok: true, demoCode: string, expiresInSec: number }>}
 *   `demoCode` exists only in this dummy implementation so the UI can show a
 *   simulated SMS. A real implementation must NOT return the code.
 */
export async function sendOtp(phone) {
  await new Promise((resolve) => { setTimeout(resolve, SIMULATED_DELAY_MS); });
  lastIssued = { phone, code: randomCode(), issuedAt: Date.now() };
  return { ok: true, demoCode: lastIssued.code, expiresInSec: 600 };
}

/**
 * @returns {Promise<{ ok: boolean, reason?: 'mismatch' | 'expired' | 'not_sent' }>}
 */
export async function verifyOtp(phone, code) {
  await new Promise((resolve) => { setTimeout(resolve, SIMULATED_DELAY_MS); });
  if (!lastIssued || lastIssued.phone !== phone) return { ok: false, reason: 'not_sent' };
  if (Date.now() - lastIssued.issuedAt > 10 * 60 * 1000) return { ok: false, reason: 'expired' };
  if (String(code) !== lastIssued.code) return { ok: false, reason: 'mismatch' };
  return { ok: true };
}

export const otpLength = OTP_LENGTH;
