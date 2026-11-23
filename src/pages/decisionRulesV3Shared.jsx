// Pieces shared by the two Decision Rules V3 pages: the version switcher,
// pagination, dates and plurals.
import { useEffect, useRef, useState } from 'react';
import AppIcon from '../components/AppIcon';

export const VERSIONS = [
  { key: 'v3', label: 'Version 3', page: 'decision-rules-listing-v3' },
  { key: 'v2', label: 'Version 2', page: 'decision-rules-listing-v2' },
  { key: 'v1', label: 'Version 1', page: 'decision-rules-listing' },
];

// The published build (vercel) offers Version 3 only. Dev builds keep the
// version switcher and Versions 1 and 2. To see them in a built copy, build with
// VITE_SHOW_ALL_VERSIONS=true.
export const SHOW_VERSION_SWITCHER = !import.meta.env.PROD || import.meta.env.VITE_SHOW_ALL_VERSIONS === 'true';

export function VersionDropdown({ current = 'v3', onNavigate }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (event) => { if (!rootRef.current?.contains(event.target)) setOpen(false); };
    const onKey = (event) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  const label = VERSIONS.find((version) => version.key === current)?.label ?? 'Version';
  return (
    <div ref={rootRef} className={`smplfy-dropdown dropdown smplfy-dr-version${open ? ' show' : ''}`}>
      <button
        type="button"
        className="smplfy-btn btn btn-outline-secondary btn-sm dropdown-toggle smplfy-dr-version-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span>{label}</span>
        <AppIcon name={open ? 'chevron-up' : 'chevron-down'} size={16} />
      </button>
      {open ? (
        <div className="smplfy-dropdown-menu dropdown-menu show smplfy-dr-version-menu" role="menu">
          {VERSIONS.map((version) => (
            <button
              key={version.key}
              type="button"
              role="menuitemradio"
              aria-checked={version.key === current}
              className={`smplfy-dropdown-item dropdown-item${version.key === current ? ' is-current' : ''}`}
              onClick={() => {
                setOpen(false);
                if (version.key !== current) onNavigate?.(version.page);
              }}
            >
              <span>{version.label}</span>
              {version.key === current ? <AppIcon name="check" size={16} /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function getPageItems(page, pageCount) {
  if (pageCount <= 9) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const windowSize = 7;
  let start = Math.max(2, page - Math.floor(windowSize / 2));
  const end = Math.min(pageCount, start + windowSize - 1);
  start = Math.max(2, end - windowSize + 1);
  const items = [1];
  if (start > 2) items.push('ellipsis-start');
  for (let number = start; number <= end; number += 1) items.push(number);
  if (end < pageCount) {
    if (end < pageCount - 1) items.push('ellipsis-end');
    items.push(pageCount);
  }
  return items;
}

/** The V1/V2 footer: summary, page buttons, page size. */
export function TableFooter({ summary, page, pageCount, onPage, pageSize, pageSizes, onPageSize, label }) {
  return (
    <div className="smplfy-dr-footer d-flex align-items-center justify-content-between flex-wrap gap-3">
      <span className="smplfy-dr-summary text-secondary" aria-live="polite">{summary}</span>
      <nav aria-label={label} className="smplfy-dr-pagination d-flex align-items-center gap-1">
        <button type="button" className="smplfy-dr-page-btn" aria-label="Previous page" disabled={page === 1} onClick={() => onPage(page - 1)}>
          <AppIcon name="chevron-left" size={14} />
        </button>
        {getPageItems(page, pageCount).map((item) => (
          typeof item === 'number' ? (
            <button
              key={item}
              type="button"
              className={`smplfy-dr-page-btn${item === page ? ' is-active' : ''}`}
              aria-current={item === page ? 'page' : undefined}
              onClick={() => onPage(item)}
            >
              {item}
            </button>
          ) : <span key={item} className="smplfy-dr-page-btn is-ellipsis" aria-hidden="true">…</span>
        ))}
        <button type="button" className="smplfy-dr-page-btn" aria-label="Next page" disabled={page >= pageCount} onClick={() => onPage(page + 1)}>
          <AppIcon name="chevron-right" size={14} />
        </button>
      </nav>
      <label className="smplfy-dr-page-size d-flex align-items-center gap-2 mb-0">
        <span className="text-secondary">Per page</span>
        <select className="form-select form-select-sm" value={pageSize} onChange={(event) => onPageSize(Number(event.target.value))}>
          {pageSizes.map((size) => <option key={size} value={size}>{size}</option>)}
        </select>
      </label>
    </div>
  );
}

export const plural = (count, one, many = `${one}s`) => `${count} ${count === 1 ? one : many}`;

const dayFormat = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

/** "Today", "Yesterday", "5 days ago", then a date. */
export function relativeDay(iso) {
  const then = new Date(iso);
  const start = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const days = Math.round((start(new Date()) - start(then)) / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  return dayFormat.format(then);
}

export const fullDate = (iso) => dayFormat.format(new Date(iso));

/** Wraps the matched part of `text` in <mark>. */
export function Highlight({ text, query }) {
  const needle = query.trim().toLowerCase();
  if (!needle) return text;
  const at = text.toLowerCase().indexOf(needle);
  if (at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <mark className="smplfy-dr3-mark">{text.slice(at, at + needle.length)}</mark>
      {text.slice(at + needle.length)}
    </>
  );
}
