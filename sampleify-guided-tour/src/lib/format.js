const pad = (value) => String(value).padStart(2, '0');

export function formatDate(iso) {
  if (!iso) return '-';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '-';
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function formatDateTime(iso) {
  if (!iso) return '-';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '-';
  return `${formatDate(iso)}, ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatAge(iso, now = Date.now()) {
  if (!iso) return '-';
  const minutes = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? 'hr' : 'hrs'} ago`;
  const days = Math.round(hours / 24);
  return `${days} ${days === 1 ? 'day' : 'days'} ago`;
}

export function addDays(iso, days) {
  const date = new Date(iso);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export function isSameDay(isoA, isoB) {
  const a = new Date(isoA);
  const b = new Date(isoB);
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

export function greetingFor(now = Date.now()) {
  const hour = new Date(now).getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function firstName(fullName = '') {
  return String(fullName).trim().split(/\s+/)[0] || '';
}

/** The lab's name as entered; visitors saved before it was asked get "<first name>'s Lab". */
export function labNameOf(profile) {
  const entered = String(profile?.labName ?? '').trim();
  if (entered) return entered;
  return `${firstName(profile?.name) || 'Your'}'s Lab`;
}

/** 9876543210 -> "98765 43210" */
export function formatIndianMobile(digits = '') {
  const clean = String(digits).replace(/\D/g, '').slice(0, 10);
  if (clean.length <= 5) return clean;
  return `${clean.slice(0, 5)} ${clean.slice(5)}`;
}

export function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function cx(...values) {
  return values.filter(Boolean).join(' ');
}
