/*
 * GET /api/admin/setups
 *
 * Every recorded setup, newest first, as a plain HTML table (or JSON with
 * ?format=json). Protected by HTTP Basic auth: any username, password =
 * ADMIN_PASSWORD. Without ADMIN_PASSWORD set, the page is disabled.
 *
 * Optional query: ?phone=9876543210  ?limit=200 (max 1000)
 */
import crypto from 'node:crypto';
import { getDb } from '../_lib/db.js';
import { handle, normalisePhone, sendJson } from '../_lib/http.js';

function authorised(req) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const header = String(req.headers.authorization ?? '');
  if (!header.startsWith('Basic ')) return false;
  const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
  const password = decoded.slice(decoded.indexOf(':') + 1);
  const a = crypto.createHash('sha256').update(password).digest();
  const b = crypto.createHash('sha256').update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

const IST = { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
const when = (date) => (date ? new Date(date).toLocaleString('en-IN', IST) : '');

function page(rows, filter) {
  const body = rows
    .map(
      (row) => `<tr>
<td>${escapeHtml(when(row.createdAt))}</td>
<td class="mono">${escapeHtml(row.phone)}</td>
<td>${escapeHtml(row.name)}</td>
<td>${escapeHtml(row.labName)}</td>
<td>${escapeHtml((row.labTypes ?? []).join(', '))}</td>
<td><span class="pill ${row.status === 'verified' ? 'ok' : 'wait'}">${row.status === 'verified' ? 'Verified' : 'Phone entered'}</span>${row.otpSkipped ? ' <span class="pill skip">OTP skipped</span>' : ''}</td>
<td>${escapeHtml(row.client?.utm?.source || row.client?.referrer || '')}</td>
</tr>`,
    )
    .join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>Guided tour setups</title>
<style>
body{font:14px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",Inter,sans-serif;color:#0b1b33;margin:24px;background:#f6f7f9}
h1{font-size:18px;margin:0 0 4px}p{margin:0 0 16px;color:#5b6676}
form{margin:0 0 16px;display:flex;gap:8px}input{padding:6px 10px;border:1px solid #cfd5df;border-radius:8px;font:inherit}
button{padding:6px 12px;border:0;border-radius:8px;background:#06182f;color:#fff;font:inherit;cursor:pointer}
table{border-collapse:collapse;width:100%;background:#fff;border:1px solid #e3e7ee;border-radius:10px;overflow:hidden}
th,td{padding:9px 12px;text-align:left;border-bottom:1px solid #eef1f5;vertical-align:top}
th{background:#f1f3f7;font-size:12px;text-transform:uppercase;letter-spacing:.03em;color:#5b6676}
.mono{font-family:ui-monospace,Menlo,monospace}.pill{display:inline-block;padding:1px 8px;border-radius:999px;font-size:12px}
.ok{background:#e5f5ea;color:#1f7a3f}.wait{background:#fff4dc;color:#8a5a00}.skip{background:#eaf1ff;color:#1a55c4}
</style></head><body>
<h1>Guided tour setups</h1><p>${rows.length} shown, newest first. Times in IST.</p>
<form method="get"><input name="phone" placeholder="Filter by phone" value="${escapeHtml(filter)}"><button>Filter</button></form>
<table><thead><tr><th>When</th><th>Phone</th><th>Name</th><th>Lab name</th><th>Lab types</th><th>Status</th><th>Source</th></tr></thead>
<tbody>${body || '<tr><td colspan="7">No setups yet.</td></tr>'}</tbody></table></body></html>`;
}

export default handle('GET', async (req, res) => {
  if (!authorised(req)) {
    res.statusCode = 401;
    res.setHeader('WWW-Authenticate', 'Basic realm="Sampleify tour admin", charset="UTF-8"');
    res.setHeader('Cache-Control', 'no-store');
    return res.end(process.env.ADMIN_PASSWORD ? 'Password required' : 'Admin page is disabled (ADMIN_PASSWORD is not set)');
  }

  const url = new URL(req.url, 'http://local');
  const rawPhone = url.searchParams.get('phone') ?? '';
  const phone = rawPhone ? normalisePhone(rawPhone) : null;
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit')) || 200, 1), 1000);

  const db = await getDb();
  const rows = await db
    .collection('setups')
    .find(phone ? { phone } : rawPhone ? { _id: null } : {}, { projection: { userId: 0 } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();

  if (url.searchParams.get('format') === 'json') return sendJson(res, 200, { setups: rows });

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  return res.end(page(rows, rawPhone));
});
