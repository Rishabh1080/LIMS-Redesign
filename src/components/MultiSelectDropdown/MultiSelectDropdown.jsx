import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import AppIcon from '../AppIcon';
import Checkbox from '../Checkbox/Checkbox';
import './MultiSelectDropdown.scss';

const MAX_VISIBLE_CHIPS = 2;

// Multi-select dropdown with search, Select all and Clear all. Portals its menu
// so table-row overflow never clips it; positions against the trigger.
//
// display="count" (default): the trigger reads "Placeholder" / the value / "N selected".
// display="chips": the trigger shows the first selections as removable chips + "+N more".
export default function MultiSelectDropdown({
  value = [],
  options = [],
  placeholder = 'Select',
  ariaLabel,
  display = 'count',
  id,
  onChange,
}) {
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const searchRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [menuStyle, setMenuStyle] = useState({});
  const [selected, setSelected] = useState(value);

  const filtered = query.trim()
    ? options.filter((option) => option.toLowerCase().includes(query.trim().toLowerCase()))
    : options;
  const allFilteredSelected = filtered.length > 0 && filtered.every((option) => selected.includes(option));

  const label = selected.length === 0
    ? placeholder
    : selected.length === 1
      ? selected[0]
      : `${selected.length} selected`;

  useEffect(() => {
    if (!open) return undefined;

    const position = () => {
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect) return;
      const gap = 6;
      const width = Math.max(rect.width, 240);
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
      }
    };
    const onKey = (event) => { if (event.key === 'Escape') setOpen(false); };

    position();
    const frame = window.requestAnimationFrame(() => searchRef.current?.focus());
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', position);
    window.addEventListener('scroll', position, true);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', position);
      window.removeEventListener('scroll', position, true);
    };
  }, [open]);

  const commit = (next) => {
    setSelected(next);
    onChange?.(next);
  };

  const toggle = (option) => {
    commit(selected.includes(option) ? selected.filter((entry) => entry !== option) : [...selected, option]);
  };

  const selectAll = () => commit([...new Set([...selected, ...filtered])]);
  const clearAll = () => commit([]);

  const showChips = display === 'chips' && selected.length > 0;

  return (
    <div
      ref={rootRef}
      className={`smplfy-select-field smplfy-rich-dropdown-field dropdown${open ? ' show' : ''}${selected.length ? '' : ' smplfy-form-empty'}`}
    >
      <button
        id={id}
        type="button"
        className="smplfy-rich-dropdown-trigger smplfy-form-control form-control btn"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((current) => !current)}
      >
        {showChips ? (
          <span className="smplfy-rich-dropdown-value smplfy-multiselect-chips">
            {selected.slice(0, MAX_VISIBLE_CHIPS).map((option) => (
              <span key={option} className="smplfy-multiselect-chip">
                <span className="smplfy-multiselect-chip-label">{option}</span>
                <span
                  role="button"
                  tabIndex={-1}
                  className="smplfy-multiselect-chip-remove"
                  aria-label={`Remove ${option}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggle(option);
                  }}
                >
                  <AppIcon name="close" size={12} stroke={2} />
                </span>
              </span>
            ))}
            {selected.length > MAX_VISIBLE_CHIPS ? (
              <span className="smplfy-multiselect-chip is-more">
                {`+${selected.length - MAX_VISIBLE_CHIPS} more`}
              </span>
            ) : null}
          </span>
        ) : (
          <span className={`smplfy-rich-dropdown-value${selected.length ? '' : ' text-secondary'}`}>{label}</span>
        )}
        <span className="smplfy-rich-dropdown-chevron" aria-hidden="true">
          <AppIcon name={open ? 'chevron-up' : 'chevron-down'} />
        </span>
      </button>

      {open ? createPortal(
        <div
          ref={menuRef}
          className="smplfy-rich-dropdown-menu smplfy-card card position-fixed shadow smplfy-multiselect-menu"
          style={menuStyle}
          role="listbox"
          aria-multiselectable="true"
        >
          <div className="smplfy-rich-dropdown-search">
            <div className="input-group">
              <span className="input-group-text" aria-hidden="true">
                <AppIcon name="search" size={16} />
              </span>
              <input
                ref={searchRef}
                type="search"
                className="smplfy-form-control form-control"
                placeholder="Search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onClick={(event) => event.stopPropagation()}
              />
            </div>
          </div>

          <div className="smplfy-multiselect-actions d-flex align-items-center justify-content-between">
            <button type="button" className="btn btn-link p-0 text-decoration-none" onClick={selectAll} disabled={allFilteredSelected}>
              Select all
            </button>
            <button type="button" className="btn btn-link p-0 text-decoration-none text-secondary" onClick={clearAll} disabled={!selected.length}>
              Clear all
            </button>
          </div>

          <div className="list-group list-group-flush overflow-auto smplfy-multiselect-list">
            {filtered.length ? filtered.map((option) => (
              <label key={option} className="smplfy-multiselect-option list-group-item d-flex align-items-center gap-2">
                <Checkbox checked={selected.includes(option)} aria-label={option} onChange={() => toggle(option)} />
                <span>{option}</span>
              </label>
            )) : (
              <div className="smplfy-rich-dropdown-empty text-secondary" role="status">No results found</div>
            )}
          </div>
        </div>,
        document.body,
      ) : null}
    </div>
  );
}
