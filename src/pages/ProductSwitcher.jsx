import { useEffect, useMemo, useRef, useState } from 'react';
import AppIcon from '../components/AppIcon';

// A compact "switch product" control that sits beside a product's name: an
// up/down chevron button that opens a small popover with a search box and the
// list of products. Replaces a prev/next pager — with hundreds of products,
// jumping by name or code beats stepping one at a time.
//
// Keyboard: the search box is focused on open; Up/Down move through matches,
// Enter picks the highlighted one, Esc closes.
export default function ProductSwitcher({ products, currentId, onSelect }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const q = query.trim().toLowerCase();
  const matches = useMemo(() => (
    q
      ? products.filter((product) => product.name.toLowerCase().includes(q) || product.code.toLowerCase().includes(q))
      : products
  ), [products, q]);

  const close = () => { setOpen(false); setQuery(''); };

  const choose = (product) => {
    close();
    if (product && product.id !== currentId) onSelect?.(product.id);
  };

  // Open: focus the search and start on the current product.
  useEffect(() => {
    if (!open) return;
    const start = Math.max(0, products.findIndex((product) => product.id === currentId));
    setActive(start);
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // A new query re-starts the highlight at the first match.
  useEffect(() => { setActive(0); }, [q]);

  // Close on outside click / Esc.
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (event) => { if (!rootRef.current?.contains(event.target)) close(); };
    const onKey = (event) => { if (event.key === 'Escape') close(); };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Keep the highlighted row in view.
  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelectorAll('.smplfy-prod-switch-item')[active]?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  const onInputKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((i) => (matches.length ? (i + 1) % matches.length : 0));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((i) => (matches.length ? (i - 1 + matches.length) % matches.length : 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (matches[active]) choose(matches[active]);
    }
  };

  return (
    <div className="smplfy-prod-switch" ref={rootRef}>
      <button
        type="button"
        className={`smplfy-prod-switch-btn${open ? ' is-open' : ''}`}
        aria-label="Switch product"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? close() : setOpen(true))}
      >
        <AppIcon name="selector" size={18} />
      </button>

      {open ? (
        <div className="smplfy-prod-switch-menu" role="dialog" aria-label="Switch product">
          <div className="smplfy-prod-switch-search">
            <AppIcon name="search" size={16} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Find product…"
              aria-label="Find product"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onInputKeyDown}
            />
            <kbd className="smplfy-prod-switch-esc">Esc</kbd>
          </div>

          <ul className="smplfy-prod-switch-list" role="listbox" ref={listRef}>
            {matches.length ? matches.map((product, index) => (
              <li
                key={product.id}
                role="option"
                aria-selected={product.id === currentId}
                className={`smplfy-prod-switch-item${index === active ? ' is-active' : ''}`}
                onMouseEnter={() => setActive(index)}
                onClick={() => choose(product)}
              >
                <span className="smplfy-prod-switch-name">{product.name}</span>
                <span className="smplfy-prod-switch-code">{product.code}</span>
                {product.id === currentId ? <AppIcon name="check" size={16} stroke={2.2} /> : null}
              </li>
            )) : (
              <li className="smplfy-prod-switch-empty">No products match “{query.trim()}”.</li>
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
