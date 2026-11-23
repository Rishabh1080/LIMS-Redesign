// Decision Rules, Version 3: one product's rules.
//
// The V2 rules table, scoped to a product: nested rules (when switched on from the listing),
// quick filters plus the More panel, resizable and hideable columns,
// pagination, and click-to-edit. The Product column is gone because the page
// is the product. The header carries only what someone working on rules needs:
// the product's name and code, a switcher to jump to another product by name,
// and how many rules still lack limits (a one-click filter).
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useSuperHoverRef } from 'super-hover/react';
import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import Checkbox from '../components/Checkbox/Checkbox';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal/Modal';
import MoreActionButton from '../components/MoreActionButton';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SearchSelectFilter from '../components/SearchSelectFilter';
import SecondaryButton from '../components/SecondaryButton';
import SplitSecondaryButton from '../components/SplitSecondaryButton';
import {
  deleteNestedRule,
  deleteRule,
  getListOrder,
  getNestedEnabled,
  getProduct,
  getProducts,
  isWithoutLimits,
  summarise,
} from '../data/decisionRulesV3Data';
import ProductSwitcher from './ProductSwitcher';
import { TableFooter, fullDate, plural, relativeDay } from './decisionRulesV3Shared';
import './new-tr-page.scss';
import './decision-rules-listing-page.scss';
import './decision-rules-listing-v2-page.scss';
import './decision-rules-v3-page.scss';

const COLUMNS = [
  { key: 'parameter', label: 'Parameter', weight: 26, filter: true, all: 'All parameters' },
  { key: 'moa', label: 'MoA', weight: 16, filter: true, all: 'All MoAs' },
  { key: 'cutOff', label: 'Cut Off', weight: 8 },
  { key: 'min', label: 'Min', weight: 9 },
  { key: 'max', label: 'Max', weight: 9 },
  { key: 'template', label: 'Template', weight: 10 },
];
const LOCKED_COLUMN_KEYS = ['parameter'];
const ACTIONS_WIDTH_PX = 156;
const MIN_COLUMN_WIDTH_PX = 80;
const KEYBOARD_RESIZE_STEP_PX = 16;
const PAGE_SIZES = [10, 25, 50, 100];
const WIDTHS_KEY = 'lims:decision-rules-v3:column-widths';
const HIDDEN_KEY = 'lims:decision-rules-v3:hidden-columns';
// Sub-rules inherit MoA from their parent rule: shown as a dash.
const CHILD_DASH_KEYS = ['moa'];

function readStored(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function writeStored(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable: the layout just won't persist.
  }
}
const defaultWidths = () => Object.fromEntries(COLUMNS.map((column) => [column.key, column.weight]));
function loadWidths() {
  const stored = readStored(WIDTHS_KEY, {});
  return Object.fromEntries(COLUMNS.map((column) => {
    const value = Number(stored?.[column.key]);
    return [column.key, Number.isFinite(value) && value > 0 ? value : column.weight];
  }));
}
function loadHidden() {
  const stored = readStored(HIDDEN_KEY, []);
  return Array.isArray(stored) ? stored.filter((key) => COLUMNS.some((c) => c.key === key) && !LOCKED_COLUMN_KEYS.includes(key)) : [];
}

// Drag a column's right edge by `delta` px; width comes from (or returns to)
// the neighbours, and nothing shrinks below the minimum. (As in V1/V2.)
function resizeColumns(startPx, index, delta, min = MIN_COLUMN_WIDTH_PX) {
  const next = [...startPx];
  const last = startPx.length - 1;
  if (last < 1) return next;
  const donors = index < last
    ? Array.from({ length: last - index }, (_, i) => index + 1 + i)
    : Array.from({ length: index }, (_, i) => index - 1 - i);
  let applied;
  if (delta >= 0) {
    let remaining = Math.min(delta, donors.reduce((sum, d) => sum + Math.max(0, startPx[d] - min), 0));
    applied = remaining;
    donors.forEach((d) => {
      const take = Math.min(remaining, Math.max(0, startPx[d] - min));
      next[d] = startPx[d] - take;
      remaining -= take;
    });
  } else {
    applied = -Math.min(-delta, Math.max(0, startPx[index] - min));
    next[donors[0]] = startPx[donors[0]] - applied;
  }
  next[index] = startPx[index] + applied;
  return next;
}

export default function DecisionRulesV3ProductPage({
  productId,
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  sidebarBadgeCounts,
}) {
  // The store is mutated on delete; bump `version` to re-read it.
  const [version, setVersion] = useState(0);
  // A fresh copy each time, so everything derived from it recomputes after a delete.
  const product = useMemo(() => {
    const found = getProduct(productId);
    return found ? { ...found } : null;
  }, [productId, version]); // eslint-disable-line react-hooks/exhaustive-deps
  const stats = useMemo(() => (product ? summarise(product) : null), [product]);
  // Products offered by the switcher, in the order the listing was last shown
  // in (so it matches what you were just browsing); all products otherwise.
  const switcherProducts = useMemo(() => {
    const all = getProducts();
    const order = getListOrder();
    if (!order?.length) return all;
    const byId = new Map(all.map((item) => [item.id, item]));
    return order.map((id) => byId.get(id)).filter(Boolean);
  }, []);

  // Nesting is a lab-wide setting, switched on the product listing.
  const nested = getNestedEnabled();
  const [expanded, setExpanded] = useState({});
  const [filters, setFilters] = useState({});
  const [withoutLimitsOnly, setWithoutLimitsOnly] = useState(false);
  const [panelFilters, setPanelFilters] = useState({});
  const [draftPanel, setDraftPanel] = useState({});
  const [panelOpen, setPanelOpen] = useState(false);
  const [activePanelCol, setActivePanelCol] = useState(COLUMNS[0].key);
  const [facetQuery, setFacetQuery] = useState('');
  const [openFilter, setOpenFilter] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [pendingDelete, setPendingDelete] = useState(null);
  const facetSearchRef = useRef(null);

  const [colWidths, setColWidths] = useState(loadWidths);
  const [hidden, setHidden] = useState(loadHidden);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tableWidth, setTableWidth] = useState(0);
  const [resizingKey, setResizingKey] = useState(null);
  const [edgeIndex, setEdgeIndex] = useState(null);
  const dragRef = useRef(null);

  // A new product starts with a clean slate.
  useEffect(() => {
    setFilters({});
    setPanelFilters({});
    setWithoutLimitsOnly(false);
    setExpanded({});
    setPage(1);
  }, [productId]);

  useEffect(() => { if (!resizingKey) writeStored(WIDTHS_KEY, colWidths); }, [colWidths, resizingKey]);
  useEffect(() => { writeStored(HIDDEN_KEY, hidden); }, [hidden]);
  useEffect(() => () => document.body.classList.remove('smplfy-dr-resizing'), []);
  useEffect(() => {
    if (!panelOpen) return undefined;
    const frame = requestAnimationFrame(() => facetSearchRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [panelOpen, activePanelCol]);

  // --- Table sizing (as V2) --------------------------------------------------
  const tableWrapRef = useRef(null);
  const theadRef = useRef(null);
  const superHoverRef = useSuperHoverRef();
  const setTableWrap = useCallback((node) => {
    tableWrapRef.current = node;
    superHoverRef(node);
  }, [superHoverRef]);
  useLayoutEffect(() => {
    const thead = theadRef.current;
    const wrap = tableWrapRef.current;
    if (!thead || !wrap) return undefined;
    const sync = () => {
      wrap.style.setProperty('--smplfy-dr-head-height', `${thead.offsetHeight}px`);
      setTableWidth(Math.floor(wrap.getBoundingClientRect().width));
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(wrap);
    const scroller = wrap.closest('.lims-main-content');
    const updateStuck = () => {
      const th = thead.querySelector('th');
      if (!scroller || !th) return;
      wrap.classList.toggle('is-head-stuck', th.getBoundingClientRect().top <= scroller.getBoundingClientRect().top + 0.5);
    };
    updateStuck();
    scroller?.addEventListener('scroll', updateStuck, { passive: true });
    window.addEventListener('resize', updateStuck);
    return () => {
      observer.disconnect();
      scroller?.removeEventListener('scroll', updateStuck);
      window.removeEventListener('resize', updateStuck);
    };
  }, [product]);

  const columns = useMemo(() => COLUMNS.filter((column) => !hidden.includes(column.key)), [hidden]);
  const columnPx = useMemo(() => {
    const dataWidth = tableWidth - ACTIONS_WIDTH_PX;
    if (dataWidth <= 0 || !columns.length) return null;
    const total = columns.reduce((sum, column) => sum + colWidths[column.key], 0);
    const widths = columns.map((column) => Math.floor((colWidths[column.key] / total) * dataWidth));
    widths[widths.length - 1] += dataWidth - widths.reduce((sum, width) => sum + width, 0);
    return widths;
  }, [columns, colWidths, tableWidth]);
  const edgeLeft = columnPx && edgeIndex !== null && edgeIndex < columnPx.length
    ? columnPx.slice(0, edgeIndex + 1).reduce((sum, width) => sum + width, 0)
    : null;

  const beginResize = (index) => {
    if (!columnPx) return null;
    const keys = columns.map((column) => column.key);
    const totalWeight = keys.reduce((sum, key) => sum + colWidths[key], 0);
    return { index, keys, startPx: columnPx, scale: totalWeight / (tableWidth - ACTIONS_WIDTH_PX) };
  };
  const applyResize = (drag, delta) => {
    const nextPx = resizeColumns(drag.startPx, drag.index, delta);
    setColWidths((current) => {
      const next = { ...current };
      drag.keys.forEach((key, i) => { next[key] = nextPx[i] * drag.scale; });
      return next;
    });
  };
  const resizeHandlers = (index) => ({
    onPointerEnter: () => { if (!dragRef.current) setEdgeIndex(index); },
    onPointerLeave: () => { if (!dragRef.current) setEdgeIndex(null); },
    onFocus: () => setEdgeIndex(index),
    onBlur: () => setEdgeIndex(null),
    onPointerDown: (event) => {
      const drag = beginResize(index);
      if (!drag) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      dragRef.current = { ...drag, startX: event.clientX };
      setResizingKey(columns[index].key);
      document.body.classList.add('smplfy-dr-resizing');
    },
    onPointerMove: (event) => {
      const drag = dragRef.current;
      if (drag) applyResize(drag, event.clientX - drag.startX);
    },
    onPointerUp: (event) => endResize(event),
    onPointerCancel: (event) => endResize(event),
    onKeyDown: (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      const drag = beginResize(index);
      if (!drag) return;
      event.preventDefault();
      applyResize(drag, event.key === 'ArrowRight' ? KEYBOARD_RESIZE_STEP_PX : -KEYBOARD_RESIZE_STEP_PX);
    },
  });
  function endResize(event) {
    if (!dragRef.current) return;
    dragRef.current = null;
    const handle = event.currentTarget;
    if (handle.hasPointerCapture?.(event.pointerId)) handle.releasePointerCapture(event.pointerId);
    document.body.classList.remove('smplfy-dr-resizing');
    setResizingKey(null);
    requestAnimationFrame(() => { if (!handle.matches(':hover')) setEdgeIndex(null); });
  }

  // --- Filtering -------------------------------------------------------------
  const matches = useCallback((rule) => {
    if (withoutLimitsOnly && !isWithoutLimits(rule)) return false;
    const passes = (set) => Object.entries(set).every(([key, values]) => !values?.length || values.includes(String(rule[key] ?? '')));
    return passes(filters) && passes(panelFilters);
  }, [filters, panelFilters, withoutLimitsOnly]);

  // Standalone rules only: what the table shows while nesting is off.
  const standaloneRows = useMemo(() => (product ? product.rules.filter(matches) : []), [product, matches]);

  // Nesting on: nested rules (kept if the parent or any sub-rule matches) and
  // standalone rules as single rows. The "without limits" filter only looks at sub-rules.
  const nestedItems = useMemo(() => {
    if (!product) return [];
    const parents = product.nestedRules
      .map((parent) => {
        const parentMatches = !withoutLimitsOnly && matches(parent);
        const kids = parent.children.filter(matches);
        if (!parentMatches && !kids.length) return null;
        return { ...parent, children: parentMatches && !kids.length ? parent.children : kids };
      })
      .filter(Boolean);
    return [...parents, ...product.rules.filter(matches)];
  }, [product, matches, withoutLimitsOnly]);

  // While a filter narrows a nested rule, show it open so the matches are visible.
  const narrowing = Boolean(withoutLimitsOnly || Object.values(filters).some((v) => v?.length) || Object.values(panelFilters).some((v) => v?.length));

  const items = nested ? nestedItems : standaloneRows;
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, pageCount);
  const first = total ? (currentPage - 1) * pageSize : 0;
  const pageRows = items.slice(first, first + pageSize);
  const noun = nested ? ['row', 'rows'] : ['rule', 'rules'];
  const summary = total
    ? `Showing ${first + 1}-${Math.min(first + pageSize, total)} of ${total} ${total === 1 ? noun[0] : noun[1]}`
    : 'No rules to show';

  const allRuleRows = useMemo(() => (product ? (nested ? [...product.rules, ...product.nestedRules, ...product.nestedRules.flatMap((parent) => parent.children)] : product.rules) : []), [product, nested]);
  const optionsFor = (key) => [...new Set(allRuleRows.map((rule) => String(rule[key] ?? '')).filter((value) => value && value !== '-'))]
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const facetRows = useMemo(() => {
    if (!nested) return standaloneRows;
    return nestedItems.flatMap((item) => (item.isParent ? [item, ...item.children] : [item]));
  }, [nested, standaloneRows, nestedItems]);
  const facetFor = (key) => {
    const counts = new Map();
    facetRows.forEach((rule) => {
      const value = String(rule[key] ?? '');
      counts.set(value, (counts.get(value) ?? 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true })).map(([value, count]) => ({ value, count }));
  };

  const quickCount = Object.values(filters).filter((v) => v?.length).length;
  const panelCount = Object.values(panelFilters).filter((v) => v?.length).length;
  const activeFilterCount = quickCount + panelCount + (withoutLimitsOnly ? 1 : 0);
  const setFilter = (key, values) => { setFilters((current) => ({ ...current, [key]: values })); setPage(1); };
  const clearFilters = () => { setFilters({}); setPanelFilters({}); setWithoutLimitsOnly(false); setPage(1); };
  const openPanel = () => { setDraftPanel(panelFilters); setFacetQuery(''); setPanelOpen(true); };
  const applyPanel = () => {
    setPanelFilters(Object.fromEntries(Object.entries(draftPanel).filter(([, v]) => v?.length)));
    setPanelOpen(false);
    setPage(1);
  };

  // --- Actions ---------------------------------------------------------------
  const returnTo = { page: 'decision-rules-v3-product', options: { productId } };
  const editRule = (rule) => {
    if (window.getSelection()?.toString()) return;
    onNavigate?.('decision-rule-edit', { rule, returnTo });
  };
  const newRule = () => onNavigate?.('decision-rule-edit', {
    rule: { product: product?.name, sampleCategory: product?.sampleCategory },
    returnTo,
  });
  const confirmDelete = () => {
    if (!pendingDelete) return;
    if (pendingDelete.kind === 'nested') deleteNestedRule(productId, pendingDelete.id);
    else deleteRule(productId, pendingDelete.id);
    setPendingDelete(null);
    setVersion((value) => value + 1);
  };
  const goTo = (id) => onNavigate?.('decision-rules-v3-product', { productId: id });

  if (!product) {
    return (
      <AppChrome activeNav="design-handoff" onNavigate={onNavigate} breadcrumbs={[{ key: 'decision-rules-listing-v3', label: 'Decision Rules' }]} sidebarCollapsed={sidebarCollapsed} onSidebarCollapsedChange={onSidebarCollapsedChange} sidebarBadgeCounts={sidebarBadgeCounts}>
        <main className="smplfy-dr-page bg-white p-4 min-vh-100">
          <div className="smplfy-dr-empty py-5">
            <div className="smplfy-dr-empty-text text-secondary">This product could not be found.</div>
            <SecondaryButton onClick={() => onNavigate?.('decision-rules-listing-v3')}>Back to products</SecondaryButton>
          </div>
        </main>
      </AppChrome>
    );
  }

  const renderCell = (rule, column, { parent = false, child = false } = {}) => {
    if (child && CHILD_DASH_KEYS.includes(column.key)) return <span className="smplfy-dr3-inherit">-</span>;
    if (column.key === 'parameter') {
      if (parent) {
        return (
          <span className="smplfy-dr3-nested-name">
            <span className="smplfy-dr-parent-name">{rule.parameter}</span>
            <span className="smplfy-dr3-nested-count">{plural(rule.children.length, 'sub-rule')}</span>
          </span>
        );
      }
      return (
        <span className="smplfy-dr3-param">
          <span>{rule.parameter}</span>
        </span>
      );
    }
    if ((column.key === 'min' || column.key === 'max') && isWithoutLimits(rule)) {
      return column.key === 'min' ? <span className="smplfy-dr3-unset">Not set</span> : <span className="smplfy-dr3-inherit">-</span>;
    }
    if (parent && (column.key === 'min' || column.key === 'max')) return <span className="smplfy-dr3-inherit">-</span>;
    return rule[column.key];
  };

  const actionsCell = (target, label) => (
    <td>
      <div className="d-flex align-items-center gap-2">
        <SecondaryButton size="medium" leftIcon="edit" className="smplfy-dr-edit">Edit</SecondaryButton>
        <div onClick={(event) => event.stopPropagation()}>
          <MoreActionButton
            size="medium"
            menuAlign="end"
            aria-label={`More actions for ${label}`}
            items={[{ key: 'delete', label: 'Delete', leftIcon: 'trash', className: 'smplfy-dr-menu-delete', onClick: () => setPendingDelete(target) }]}
          />
        </div>
      </div>
    </td>
  );

  const leafRow = (rule, { child = false } = {}) => (
    <tr
      key={rule.id}
      data-super-hover
      className={`smplfy-dr-row${child ? ' smplfy-dr-child-row' : ''}${isWithoutLimits(rule) ? ' is-unset' : ''}`}
      onClick={() => editRule(rule)}
    >
      {columns.map((column, index) => (
        <td key={column.key} className={child && index === 0 ? 'smplfy-dr-child-lead' : undefined}>
          {renderCell(rule, column, { child })}
        </td>
      ))}
      {actionsCell({ kind: 'rule', id: rule.id, label: rule.parameter }, rule.parameter)}
    </tr>
  );

  const nestedRows = (parent) => {
    const open = narrowing || Boolean(expanded[parent.id]);
    return (
      <tbody key={parent.id} className={`smplfy-dr-nest-group${open ? ' is-expanded' : ''}`}>
        <tr
          data-super-hover
          className={`smplfy-dr-row smplfy-dr-parent-row${open ? ' is-expanded' : ''}`}
          aria-expanded={open}
          onClick={() => setExpanded((current) => ({ ...current, [parent.id]: !open }))}
        >
          {columns.map((column, index) => (
            <td key={column.key}>
              {index === 0 ? (
                <span className="smplfy-dr-parent-lead">
                  <AppIcon name={open ? 'chevron-down' : 'chevron-right'} size={16} stroke={2} />
                  {renderCell(parent, column, { parent: true })}
                </span>
              ) : renderCell(parent, column, { parent: true })}
            </td>
          ))}
          {actionsCell({ kind: 'nested', id: parent.id, label: parent.parameter }, parent.parameter)}
        </tr>
        {open ? parent.children.map((child) => leafRow(child, { child: true })) : null}
      </tbody>
    );
  };

  const colSpan = columns.length + 1;
  const emptyRow = (
    <tbody>
      <tr>
        <td colSpan={colSpan} className="py-5">
          <div className="smplfy-dr-empty">
            {stats.ruleCount ? (
              <>
                <div className="smplfy-dr-empty-text text-secondary">No rules match these filters.</div>
                <SecondaryButton size="medium" onClick={clearFilters}>Clear filters</SecondaryButton>
              </>
            ) : (
              <>
                <div className="smplfy-dr-empty-text text-secondary">{product.name} has no decision rules yet.</div>
                <PrimaryButton size="medium" leftIcon="plus" onClick={newRule}>Add the first rule</PrimaryButton>
              </>
            )}
          </div>
        </td>
      </tr>
    </tbody>
  );

  return (
    <AppChrome
      activeNav="design-handoff"
      onNavigate={onNavigate}
      breadcrumbs={[
        { key: 'design-handoff', label: 'Design Handoff' },
        { key: 'decision-rules-listing-v3', label: 'Decision Rules' },
        { key: product.id, label: product.name, current: true },
      ]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      sidebarBadgeCounts={sidebarBadgeCounts}
      pageHeader={(
        <section className="smplfy-dr3-header bg-white border-bottom px-4 py-3">
          <div className="d-flex align-items-start justify-content-between flex-wrap gap-3">
            <div className="d-flex align-items-start gap-3 min-w-0">
              <SecondaryButton
                size="medium"
                leftIcon="chevron-left"
                className="px-0 flex-shrink-0"
                aria-label="Back to products"
                onClick={() => onNavigate?.('decision-rules-listing-v3')}
              />
              <div className="min-w-0">
                <div className="d-flex align-items-center gap-1 min-w-0">
                  <h1 className="h5 mb-0 fw-semibold text-dark smplfy-dr3-title">{product.name}</h1>
                  <ProductSwitcher products={switcherProducts} currentId={productId} onSelect={goTo} />
                </div>
                <p className="smplfy-dr3-meta mb-0">
                  <span>{product.code}</span>
                </p>
              </div>
            </div>
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <SecondaryButton leftIcon="table">Bulk Update</SecondaryButton>
              <SplitSecondaryButton
                label="New"
                leftIcon="plus"
                className="smplfy-dr-split"
                menuAlign="end"
                onPrimaryClick={newRule}
                toggleLabel="More ways to add decision rules"
                menuLabel="New decision rule options"
                menuItems={[{ key: 'bulk-upload', label: 'Bulk Upload', icon: 'upload' }]}
              />
            </div>
          </div>
        </section>
      )}
    >
      <main className="smplfy-dr-page smplfy-dr3-page bg-white p-4 min-vh-100">
        <div className="d-flex flex-column gap-3">
          <div className="smplfy-dr3-stats" aria-label="About these rules">
            {stats.withoutLimits ? (
              <button
                type="button"
                className={`smplfy-dr3-stat-filter${withoutLimitsOnly ? ' is-on' : ''}`}
                aria-pressed={withoutLimitsOnly}
                onClick={() => { setWithoutLimitsOnly((value) => !value); setPage(1); }}
              >
                <AppIcon name="alert-triangle" size={14} stroke={2} />
                <span><strong>{stats.withoutLimits}</strong> without limits</span>
                {withoutLimitsOnly ? <AppIcon name="close" size={12} stroke={2.2} /> : null}
              </button>
            ) : stats.ruleCount ? (
              <span className="smplfy-dr3-stat-ok"><AppIcon name="check" size={14} stroke={2.2} />All rules have limits</span>
            ) : null}
            <span className="smplfy-dr3-stat-muted" title={fullDate(product.updatedOn)}>
              Updated {(() => { const when = relativeDay(product.updatedOn); return /^(Today|Yesterday|\d+ days ago)$/.test(when) ? when.toLowerCase() : `on ${when}`; })()} by {product.updatedBy}
            </span>
          </div>

          <div className="smplfy-dr-filters d-flex align-items-end flex-wrap gap-3">
            {COLUMNS.filter((column) => column.filter && !hidden.includes(column.key)).map((column) => (
              <div key={column.key} className="smplfy-dr-filter">
                <label className="smplfy-dr-filter-label" htmlFor={`dr3-filter-${column.key}`}>{column.label}</label>
                <SearchSelectFilter
                  id={`dr3-filter-${column.key}`}
                  value={filters[column.key] ?? []}
                  options={optionsFor(column.key)}
                  placeholder={column.all}
                  ariaLabel={`Filter by ${column.label.toLowerCase()}`}
                  isOpen={openFilter === column.key}
                  onOpenChange={(next) => setOpenFilter(next ? column.key : null)}
                  onChange={(values) => setFilter(column.key, values)}
                />
              </div>
            ))}
            <div className="smplfy-new-tr-filter position-relative smplfy-dr-more-filter">
              <SecondaryButton
                size="medium"
                tone="neutral"
                leftIcon="filter"
                className={`smplfy-new-tr-filter-btn${panelCount ? ' is-active' : ''}`}
                aria-expanded={panelOpen}
                onClick={() => (panelOpen ? setPanelOpen(false) : openPanel())}
              >
                {`More${panelCount ? ` (${panelCount})` : ''}`}
              </SecondaryButton>
              {panelOpen ? (
                <>
                  <div className="smplfy-new-tr-filter-backdrop" onClick={() => setPanelOpen(false)} aria-hidden="true" />
                  <div className="smplfy-new-tr-filter-panel card shadow" role="dialog" aria-label="More filters">
                    <div className="smplfy-new-tr-filter-head d-flex align-items-center">
                      <span className="fw-semibold text-dark">Filters</span>
                    </div>
                    <div className="smplfy-new-tr-filter-body d-flex">
                      <div className="smplfy-new-tr-filter-cols d-flex flex-column">
                        {COLUMNS.map((column) => (
                          <button
                            key={column.key}
                            type="button"
                            className={`smplfy-new-tr-filter-col${activePanelCol === column.key ? ' is-active' : ''}`}
                            onClick={() => { setActivePanelCol(column.key); setFacetQuery(''); }}
                          >
                            <span>{column.label}</span>
                            {draftPanel[column.key]?.length ? <span className="smplfy-new-tr-filter-col-badge">{draftPanel[column.key].length}</span> : null}
                          </button>
                        ))}
                      </div>
                      <div className="smplfy-new-tr-filter-values d-flex flex-column">
                        {(() => {
                          const facet = facetFor(activePanelCol);
                          const allValues = facet.map((item) => item.value);
                          const checked = draftPanel[activePanelCol] ?? [];
                          const q = facetQuery.trim().toLowerCase();
                          const shown = q ? facet.filter((item) => (item.value || '—').toLowerCase().includes(q)) : facet;
                          const toggle = (value) => setDraftPanel((current) => {
                            const existing = current[activePanelCol] ?? [];
                            return { ...current, [activePanelCol]: existing.includes(value) ? existing.filter((e) => e !== value) : [...existing, value] };
                          });
                          return (
                            <>
                              <div className="smplfy-dr-facet-search">
                                <span className="smplfy-dr-facet-search-icon" aria-hidden="true"><AppIcon name="search" size={16} /></span>
                                <input
                                  ref={facetSearchRef}
                                  type="search"
                                  className="smplfy-dr-facet-search-input"
                                  placeholder="Search"
                                  aria-label={`Search ${COLUMNS.find((c) => c.key === activePanelCol)?.label ?? ''} values`}
                                  value={facetQuery}
                                  onChange={(event) => setFacetQuery(event.target.value)}
                                  onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); applyPanel(); } }}
                                />
                              </div>
                              <div className="smplfy-dr-facet-list">
                                <label className="smplfy-new-tr-filter-opt d-flex align-items-center gap-2">
                                  <Checkbox
                                    checked={allValues.length > 0 && checked.length === allValues.length}
                                    aria-label="All"
                                    onChange={() => setDraftPanel((current) => ({ ...current, [activePanelCol]: checked.length === allValues.length ? [] : allValues }))}
                                  />
                                  <span className="flex-grow-1">All</span>
                                  <span className="text-secondary">{facetRows.length}</span>
                                </label>
                                {shown.length ? shown.map((item) => (
                                  <label key={item.value || '—'} className="smplfy-new-tr-filter-opt d-flex align-items-center gap-2">
                                    <Checkbox checked={checked.includes(item.value)} aria-label={item.value || 'blank'} onChange={() => toggle(item.value)} />
                                    <span className="flex-grow-1">{item.value || '—'}</span>
                                    <span className="text-secondary">{item.count}</span>
                                  </label>
                                )) : <div className="smplfy-dr-facet-empty text-secondary">No matches</div>}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                    <div className="smplfy-new-tr-filter-footer d-flex align-items-center justify-content-between">
                      <button
                        type="button"
                        className="btn btn-link p-0 text-secondary text-decoration-none smplfy-new-tr-filter-clear"
                        disabled={!Object.values(draftPanel).some((v) => v?.length)}
                        onClick={() => setDraftPanel({})}
                      >
                        Clear all filters
                      </button>
                      <PrimaryButton size="medium" onClick={applyPanel}>Apply</PrimaryButton>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
            <button type="button" className="smplfy-dr-filter-clear" disabled={!activeFilterCount} onClick={clearFilters}>
              <AppIcon name="close" size={14} stroke={2} />
              <span>Reset</span>
            </button>
          </div>

          <div className="smplfy-dr-table-wrap" ref={setTableWrap}>
            {edgeLeft !== null ? <span className="smplfy-dr-edge-line" style={{ left: `${edgeLeft}px` }} aria-hidden="true" /> : null}
            <DataTable className="smplfy-dr-table">
              <colgroup>
                {columns.map((column, index) => (
                  <col key={column.key} style={columnPx ? { width: `${columnPx[index]}px` } : undefined} />
                ))}
                <col style={{ width: `${ACTIONS_WIDTH_PX}px` }} />
              </colgroup>
              <thead ref={theadRef}>
                <tr>
                  {columns.map((column, index) => (
                    <th scope="col" key={column.key}>
                      {nested && column.key === 'parameter' ? 'Parameter/Sub-parameter' : column.label}
                      <span
                        role="separator"
                        aria-orientation="vertical"
                        aria-label={`Resize ${column.label} column`}
                        tabIndex={0}
                        className="smplfy-dr-resizer"
                        {...resizeHandlers(index)}
                      />
                    </th>
                  ))}
                  <th scope="col">
                    <div className="smplfy-dr-actions-head">
                      <span>Actions</span>
                      <button type="button" className="smplfy-dr-col-settings-btn" aria-label="Table settings" title="Table settings" onClick={() => setSettingsOpen(true)}>
                        <AppIcon name="settings" size={16} />
                      </button>
                    </div>
                  </th>
                </tr>
              </thead>
              {!pageRows.length ? emptyRow : nested ? (
                pageRows.map((item) => (item.isParent ? nestedRows(item) : (
                  <tbody key={item.id} className="smplfy-dr-nest-group">{leafRow(item)}</tbody>
                )))
              ) : (
                <tbody>{pageRows.map((rule) => leafRow(rule))}</tbody>
              )}
            </DataTable>
          </div>

          <TableFooter
            label="Decision rule pages"
            summary={summary}
            page={currentPage}
            pageCount={pageCount}
            onPage={setPage}
            pageSize={pageSize}
            pageSizes={PAGE_SIZES}
            onPageSize={(size) => { setPageSize(size); setPage(1); }}
          />
        </div>

        <Modal
          open={settingsOpen}
          title="Table columns"
          titleId="dr3-column-settings-title"
          titleIcon="settings"
          size="md"
          onClose={() => setSettingsOpen(false)}
          actions={(
            <>
              <SecondaryButton onClick={() => { setColWidths(defaultWidths()); setHidden([]); }}>Reset to default</SecondaryButton>
              <PrimaryButton onClick={() => setSettingsOpen(false)}>Done</PrimaryButton>
            </>
          )}
        >
          <ul className="smplfy-dr-colset list-unstyled mb-0 d-grid gap-2">
            {COLUMNS.filter((column) => !LOCKED_COLUMN_KEYS.includes(column.key)).map((column) => (
              <li key={column.key}>
                <label className="smplfy-dr-colset-row">
                  <Checkbox
                    checked={!hidden.includes(column.key)}
                    aria-label={column.label}
                    onChange={() => setHidden((current) => (current.includes(column.key) ? current.filter((k) => k !== column.key) : [...current, column.key]))}
                  />
                  <span className="flex-grow-1">{column.label}</span>
                </label>
              </li>
            ))}
          </ul>
        </Modal>

        <Modal
          open={Boolean(pendingDelete)}
          title={pendingDelete?.kind === 'nested' ? 'Delete nested rule?' : 'Delete decision rule?'}
          titleId="dr3-delete-title"
          titleIcon="trash"
          size="md"
          onClose={() => setPendingDelete(null)}
          actions={(
            <>
              <SecondaryButton onClick={() => setPendingDelete(null)}>Cancel</SecondaryButton>
              <PrimaryButton className="smplfy-dr3-danger" onClick={confirmDelete}>Delete</PrimaryButton>
            </>
          )}
        >
          <p className="mb-0">
            {pendingDelete?.kind === 'nested'
              ? `“${pendingDelete?.label}” and all of its sub-rules will be removed from ${product.name}.`
              : `The rule for “${pendingDelete?.label}” will be removed from ${product.name}.`}
          </p>
        </Modal>
      </main>
    </AppChrome>
  );
}
