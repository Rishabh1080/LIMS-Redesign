/**
 * Records each onboarding setup on the server (api/setup/*, docs/DATABASE.md)
 * and asks whether this phone number still needs an OTP.
 *
 * Fails open: if the API can't be reached (no database configured, offline,
 * embedded somewhere without /api), the tour carries on and asks for the OTP.
 */
const TIMEOUT_MS = 8000;
const API_BASE = '/api';

async function post(path, body) {
  const controller = typeof AbortController === 'undefined' ? null : new AbortController();
  const timer = controller ? setTimeout(() => controller.abort(), TIMEOUT_MS) : null;
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller?.signal,
    });
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data };
  } catch {
    return { ok: false, status: 0, data: {} };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function clientContext() {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  return {
    referrer: document.referrer || '',
    utm: { source: params.get('utm_source') ?? '', medium: params.get('utm_medium') ?? '', campaign: params.get('utm_campaign') ?? '' },
  };
}

/**
 * @returns {Promise<{ setupId: string | null, otpRequired: boolean, rateLimited?: boolean }>}
 */
export async function startSetup({ name, labName, labTypes, domain, phone }) {
  const result = await post('/setup/start', { name, labName, labTypes, domain, phone, client: clientContext() });
  if (result.ok && result.data.setupId) {
    return { setupId: result.data.setupId, otpRequired: result.data.otpRequired !== false };
  }
  return { setupId: null, otpRequired: true, rateLimited: result.status === 429 };
}

/** Tells the server the OTP was accepted, so the next 7 days skip it. */
export async function markSetupVerified(setupId) {
  if (!setupId) return;
  await post('/setup/verified', { setupId });
}
