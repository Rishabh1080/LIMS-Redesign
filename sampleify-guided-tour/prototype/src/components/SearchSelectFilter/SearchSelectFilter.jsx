import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import AppIcon from '../AppIcon';
import Checkbox from '../Checkbox/Checkbox';
import './SearchSelectFilter.scss';

// A combobox-style multi-select filter. The trigger itself is the search input:
// typing filters the list and opens the menu; the menu lists matching options
// (all by default) as a checkbox list, so several can be picked at once. There
// is no separate search field inside the menu.
export default function SearchSelectFilter({
  value = [],
  options = [],
  placeholder = 'All',
  ariaLabel,
  id,
  onChange,
  // Optional controlled open-state so a parent can keep only one filter open.
  isOpen,
  onOpenChange,
}) {
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const inputRef = useRef(null);
  const [internalOpen, setInternalOpen] = useState(false);
  const controlled = isOpen !== undefined;
  const open = controlled ? isOpen : internalOpen;
  const setOpen = (next) => {
    if (controlled) onOpenChange?.(next);
    else setInternalOpen(next);
  };
  const [query, setQuery] = useState('');
  const [menuStyle, setMenuStyle] = useState({});
  // Index of the keyboard-highlighted option in `filtered` (-1 = none).
  const [activeIndex, setActiveIndex] = useState(-1);
  const listRef = useRef(null);

  const q = query.trim().toLowerCase();
  const filtered = q ? options.filter((option) => option.toLowerCase().includes(q)) : options;
  const allFilteredSelected = filtered.length > 0 && filtered.every((option) => value.includes(option));

  useEffect(() => {
    if (!open) return undefined;
    const position = () => {
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect) return;
      const gap = 4;
      const width = rect.width;
      const maxLeft = Math.max(gap, window.innerWidth - width - gap);
      setMenuStyle({
        position: 'fixed',
        top: `${rect.bottom + gap}px`,
        left: `${Math.min(rect.left, maxLeft)}px`,
        width: `${width}px`,
        zIndex: 1065,
      });
    };
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target) && !menuRef.current?.contains(event.target)) {
        setOpen(false);
        setQuery('');
      }
    };
    const onKey = (event) => { if (event.key === 'Escape') { setOpen(false); setQuery(''); } };
    position();
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', position);
    window.addEventListener('scroll', position, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', position);
      window.removeEventListener('scroll', position, true);
    };
  }, [open]);

  // Reset the highlight when the list opens or the filtered set changes.
  useEffect(() => {
    setActiveIndex(open && filtered.length ? 0 : -1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, q]);

  // Keep the highlighted option scrolled into view.
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const el = listRef.current?.querySelectorAll('.smplfy-search-select-option')[activeIndex];
    el?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex]);

  const toggle = (option) => {
    onChange?.(value.includes(option) ? value.filter((entry) => entry !== option) : [...value, option]);
  };

  // Arrow keys move the highlight; Enter toggles the highlighted option.
  const onInputKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!open) { setOpen(true); return; }
      setActiveIndex((i) => (filtered.length ? (i + 1) % filtered.length : -1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) { setOpen(true); return; }
      setActiveIndex((i) => (filtered.length ? (i - 1 + filtered.length) % filtered.length : -1));
    } else if (event.key === 'Enter') {
      if (open && activeIndex >= 0 && filtered[activeIndex]) {
        event.preventDefault();
        toggle(filtered[activeIndex]);
      }
    }
  };
  const selectAll = () => onChange?.([...new Set([...value, ...filtered])]);
  const clearAll = () => onChange?.([]);

  // Show the summary overlay only when there's a selection and the user isn't
  // typing. The first name truncates with a CSS ellipsis at the available
  // width, while "+N more" always stays visible.
  const showSummary = !query && value.length > 0;

  return (
    <div
      ref={rootRef}
      className={`smplfy-search-select${open ? ' is-open' : ''}${value.length ? ' is-active' : ''}`}
    >
      <div
        className="smplfy-search-select-control"
        onClick={() => { setOpen(true); inputRef.current?.focus(); }}
      >
        <input
          ref={inputRef}
          id={id}
          type="text"
          className="smplfy-search-select-input"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={ariaLabel}
          placeholder={showSummary ? '' : placeholder}
          value={query}
          onChange={(event) => { setQuery(event.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onInputKeyDown}
        />
        {showSummary ? (
          <span className="smplfy-search-select-summary" aria-hidden="true">
            <span className="smplfy-search-select-summary-first">{value[0]}</span>
            {value.length > 1 ? (
              <span className="smplfy-search-select-summary-more">{`+${value.length - 1} more`}</span>
            ) : null}
          </span>
        ) : null}
        <span className="smplfy-search-select-chevron" aria-hidden="true">
          <AppIcon name={open ? 'chevron-up' : 'chevron-down'} size={16} />
        </span>
      </div>

      {open ? createPortal(
        <div
          ref={menuRef}
          className="smplfy-search-select-menu smplfy-card card position-fixed shadow"
          style={menuStyle}
          role="listbox"
          aria-multiselectable="true"
        >
          <div className="smplfy-search-select-actions">
            <button type="button" className="btn btn-link p-0 text-decoration-none" onClick={selectAll} disabled={allFilteredSelected}>
              Select all
            </button>
            <button type="button" className="btn btn-link p-0 text-decoration-none text-secondary" onClick={clearAll} disabled={!value.length}>
              Clear all
            </button>
          </div>
          <div className="smplfy-search-select-list" ref={listRef}>
            {filtered.length ? filtered.map((option, index) => (
              <label
                key={option}
                className={`smplfy-search-select-option${index === activeIndex ? ' is-active' : ''}`}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <Checkbox checked={value.includes(option)} aria-label={option} onChange={() => toggle(option)} />
                <span className="flex-grow-1">{option}</span>
              </label>
            )) : (
              <div className="smplfy-search-select-empty" role="status">No matches</div>
            )}
          </div>
        </div>,
        document.body,
      ) : null}
    </div>
  );
}
