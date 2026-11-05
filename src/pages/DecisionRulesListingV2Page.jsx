import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useSuperHoverRef } from 'super-hover/react';
import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import DataTable from '../components/DataTable';
import MoreActionButton from '../components/MoreActionButton';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import SplitSecondaryButton from '../components/SplitSecondaryButton';
import Modal from '../components/Modal/Modal';
import Checkbox from '../components/Checkbox/Checkbox';
import SearchSelectFilter from '../components/SearchSelectFilter';
import { buildFlatRules, buildNestedRules } from '../data/decisionRulesData';
import './new-tr-page.scss';
import './decision-rules-listing-page.scss';
import './decision-rules-listing-v2-page.scss';

const FLAT_RULES = buildFlatRules();
const NESTED_RULES = buildNestedRules();

// filter: 'text' matches as a substring; 'select' is an exact-match dropdown
// built from the column's distinct values; omitted = not filterable.
const COLUMNS = [
  { key: 'product', label: 'Product', weight: 20, filter: 'select' },
  { key: 'parameter', label: 'Parameter', weight: 22, filter: 'select' },
  { key: 'sampleCategory', label: 'Sample Category', weight: 10, filter: 'select' },
  { key: 'moa', label: 'MoA', weight: 16, filter: 'select' },
  { key: 'cutOff', label: 'Cut Off', weight: 6 },
  { key: 'min', label: 'Min', weight: 5.5 },
  { key: 'max', label: 'Max', weight: 5.5 },
  { key: 'template', label: 'Template', weight: 7 },
];

// Distinct values for the select filters, from both datasets (incl. children).
const allValuesFor = (key) => {
  const set = new Set();
  FLAT_RULES.forEach((rule) => set.add(rule[key]));
  NESTED_RULES.forEach((rule) => {
    set.add(rule[key]);
    rule.children.forEach((child) => set.add(child[key]));
  });
  return [...set];
};
// Distinct values for every filterable column; the quick-row filters are all
// searchable dropdowns in V2, so each needs its option list.
const SELECT_OPTIONS = COLUMNS.reduce((acc, column) => {
  if (column.filter) {
    acc[column.key] = allValuesFor(column.key)
      .filter((value) => value !== '' && value != null)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }
  return acc;
}, {});

const ACTIONS_WIDTH_PX = 156;
const MIN_COLUMN_WIDTH_PX = 80;
const KEYBOARD_RESIZE_STEP_PX = 16;
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// Column layout is remembered per browser (shared key with V1 is intentional:
// the columns are identical, so a width tweak carries across).
const WIDTHS_STORAGE_KEY = 'lims:decision-rules:column-widths';
const HIDDEN_STORAGE_KEY = 'lims:decision-rules:hidden-columns';
const LOCKED_COLUMN_KEYS = ['product'];

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
    // Storage unavailable: layout just won't persist.
  }
}

const defaultColumnWidths = () => Object.fromEntries(COLUMNS.map((column) => [column.key, column.weight]));

function loadColumnWidths() {
  const stored = readStored(WIDTHS_STORAGE_KEY, {});
  return Object.fromEntries(COLUMNS.map((column) => {
    const value = Number(stored?.[column.key]);
    return [column.key, Number.isFinite(value) && value > 0 ? value : column.weight];
  }));
}

function loadHiddenColumns() {
  const stored = readStored(HIDDEN_STORAGE_KEY, []);
  if (!Array.isArray(stored)) return [];
  return stored.filter((key) => (
    COLUMNS.some((column) => column.key === key) && !LOCKED_COLUMN_KEYS.includes(key)
  ));
}

// Drag a column's right edge by `delta` px; width comes from (or returns to)
// the neighbours. Nothing shrinks below the minimum. (Same as V1.)
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

function getPageItems(page, pageCount) {
  if (pageCount <= 9) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const windowSize = 7;
  let start = Math.max(2, page - Math.floor(windowSize / 2));
  let end = Math.min(pageCount, start + windowSize - 1);
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

const VERSIONS = [
  { key: 'v2', label: 'Version 2', page: 'decision-rules-listing-v2' },
  { key: 'v1', label: 'Version 1', page: 'decision-rules-listing' },
];

// Small header dropdown to switch between design versions.
function VersionDropdown({ onNavigate }) {
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

  return (
    <div ref={rootRef} className={`smplfy-dropdown dropdown smplfy-dr-version${open ? ' show' : ''}`}>
      <button
        type="button"
        className="smplfy-btn btn btn-outline-secondary btn-sm dropdown-toggle smplfy-dr-version-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span>Version 2</span>
        <AppIcon name={open ? 'chevron-up' : 'chevron-down'} size={16} />
      </button>
      {open ? (
        <div className="smplfy-dropdown-menu dropdown-menu show smplfy-dr-version-menu" role="menu">
          {VERSIONS.map((version) => (
            <button
              key={version.key}
              type="button"
              role="menuitemradio"
              aria-checked={version.key === 'v2'}
              className={`smplfy-dropdown-item dropdown-item${version.key === 'v2' ? ' is-current' : ''}`}
              onClick={() => {
                setOpen(false);
                if (version.key !== 'v2') onNavigate?.(version.page);
              }}
            >
              <span>{version.label}</span>
              {version.key === 'v2' ? <AppIcon name="check" size={16} /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function DecisionRulesListingV2Page({
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  sidebarBadgeCounts,
}) {
  const [nested, setNested] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [flatRules, setFlatRules] = useState(FLAT_RULES);
  const [nestedRules, setNestedRules] = useState(NESTED_RULES);
  const [expandedParents, setExpandedParents] = useState({});

  const [filters, setFilters] = useState({});
  const [panelFilters, setPanelFilters] = useState({});
  const [draftPanelFilters, setDraftPanelFilters] = useState({});
  const [panelOpen, setPanelOpen] = useState(false);
  const [activeFilterCol, setActiveFilterCol] = useState(null);
  const [facetQuery, setFacetQuery] = useState('');
  // Only one quick-filter dropdown open at a time, keyed by column.
  const [openFilterKey, setOpenFilterKey] = useState(null);
  const facetSearchRef = useRef(null);

  const [colWidths, setColWidths] = useState(loadColumnWidths);
  const [hiddenColumns, setHiddenColumns] = useState(loadHiddenColumns);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tableWidth, setTableWidth] = useState(0);
  const [resizingKey, setResizingKey] = useState(null);
  const [edgeIndex, setEdgeIndex] = useState(null);
  const dragRef = useRef(null);

  useEffect(() => {
    if (!resizingKey) writeStored(WIDTHS_STORAGE_KEY, colWidths);
  }, [colWidths, resizingKey]);
  useEffect(() => { writeStored(HIDDEN_STORAGE_KEY, hiddenColumns); }, [hiddenColumns]);
  useEffect(() => () => document.body.classList.remove('smplfy-dr-resizing'), []);

  // When the More panel opens (or the active column changes), focus its search
  // so you can type immediately; Enter then applies (see the input handler).
  useEffect(() => {
    if (!panelOpen) return;
    const frame = requestAnimationFrame(() => facetSearchRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [panelOpen, activeFilterCol]);

  const quickFilterCount = Object.values(filters).filter((value) => value?.length).length;
  const panelFilterCount = Object.values(panelFilters).filter((values) => values?.length).length;
  const activeFilterCount = quickFilterCount + panelFilterCount;

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
    const table = thead?.parentElement;
    if (!thead || !wrap || !table) return undefined;
    const sync = () => {
      wrap.style.setProperty('--smplfy-dr-head-height', `${thead.offsetHeight}px`);
      // Measure the wrapper, not the table: the table's width is derived from
      // columnPx (which is derived from this measurement), so measuring the
      // table creates a feedback loop that grows the table whenever a cell's
      // content nudges it even 1px wider (e.g. expanding a nested row).
      setTableWidth(Math.floor(wrap.getBoundingClientRect().width));
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(wrap);

    // Header rounds its top corners to match the table's rounded top, but once
    // it sticks mid-scroll those corners float over square rows. Toggle a class
    // when the table's top scrolls above the sticky header so the CSS can flatten
    // the corners while stuck.
    const scroller = wrap.closest('.lims-main-content');
    const updateStuck = () => {
      if (!scroller) return;
      // The th cells stick (position: sticky), while the thead element scrolls
      // away. So compare a stuck cell's top to the scroller's top: equal ⇒ stuck.
      const th = thead.querySelector('th');
      if (!th) return;
      const stuck = th.getBoundingClientRect().top <= scroller.getBoundingClientRect().top + 0.5;
      wrap.classList.toggle('is-head-stuck', stuck);
    };
    updateStuck();
    scroller?.addEventListener('scroll', updateStuck, { passive: true });
    window.addEventListener('resize', updateStuck);
    return () => {
      observer.disconnect();
      scroller?.removeEventListener('scroll', updateStuck);
      window.removeEventListener('resize', updateStuck);
    };
  }, []);

  const columns = useMemo(
    () => COLUMNS.filter((column) => !hiddenColumns.includes(column.key)),
    [hiddenColumns],
  );

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

  const applyResize = (drag, delta) => {
    const nextPx = resizeColumns(drag.startPx, drag.index, delta);
    setColWidths((current) => {
      const next = { ...current };
      drag.keys.forEach((key, i) => { next[key] = nextPx[i] * drag.scale; });
      return next;
    });
  };
  const beginResize = (index) => {
    if (!columnPx) return null;
    const keys = columns.map((column) => column.key);
    const totalWeight = keys.reduce((sum, key) => sum + colWidths[key], 0);
    return { index, keys, startPx: columnPx, scale: totalWeight / (tableWidth - ACTIONS_WIDTH_PX) };
  };
  const handleResizeStart = (event, index) => {
    const drag = beginResize(index);
    if (!drag) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { ...drag, startX: event.clientX };
    setResizingKey(columns[index].key);
    document.body.classList.add('smplfy-dr-resizing');
  };
  const handleResizeMove = (event) => {
    const drag = dragRef.current;
    if (drag) applyResize(drag, event.clientX - drag.startX);
  };
  const handleResizeEnd = (event) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    // Release capture first — while captured, the handle still reports :hover
    // even after the cursor left, which left the cursor and edge-highlight
    // stuck. After release, re-check on the next frame against the real cursor.
    const handle = event.currentTarget;
    if (handle.hasPointerCapture?.(event.pointerId)) {
      handle.releasePointerCapture(event.pointerId);
    }
    document.body.classList.remove('smplfy-dr-resizing');
    setResizingKey(null);
    requestAnimationFrame(() => {
      if (!handle.matches(':hover')) setEdgeIndex(null);
    });
  };
  const handleResizeKey = (event, index) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    const drag = beginResize(index);
    if (!drag) return;
    event.preventDefault();
    applyResize(drag, event.key === 'ArrowRight' ? KEYBOARD_RESIZE_STEP_PX : -KEYBOARD_RESIZE_STEP_PX);
  };

  const toggleColumnVisibility = (key) => {
    if (LOCKED_COLUMN_KEYS.includes(key)) return;
    setHiddenColumns((current) => (
      current.includes(key) ? current.filter((entry) => entry !== key) : [...current, key]
    ));
  };
  const resetColumnLayout = () => {
    setColWidths(defaultColumnWidths());
    setHiddenColumns([]);
  };

  // A rule passes the quick-row + panel filters.
  const matches = useCallback((rule) => {
    // Quick-row filters are multi-select: within a column any picked value
    // matches (OR); across columns all must match (AND).
    const quickOk = Object.entries(filters).every(([key, values]) => (
      !values?.length || values.includes(String(rule[key] ?? ''))
    ));
    if (!quickOk) return false;
    return Object.entries(panelFilters).every(([key, values]) => (
      !values?.length || values.includes(String(rule[key] ?? ''))
    ));
  }, [filters, panelFilters]);

  // Flat mode: filter the flat list.
  const filteredFlat = useMemo(() => flatRules.filter(matches), [flatRules, matches]);

  // Nested mode: keep a parent if it matches OR any of its children match;
  // narrow the children shown to those that match (or all, if the parent
  // itself matched and no child filter is active).
  const filteredNested = useMemo(() => {
    return nestedRules
      .map((parent) => {
        const parentMatches = matches(parent);
        const matchedChildren = parent.children.filter(matches);
        if (!parentMatches && matchedChildren.length === 0) return null;
        const children = parentMatches && matchedChildren.length === 0 ? parent.children : matchedChildren;
        return { ...parent, children, visibleChildCount: children.length };
      })
      .filter(Boolean);
  }, [nestedRules, matches]);

  // Facets count over the current dataset (flat rows, or nested parents+children).
  const facetBase = useMemo(() => {
    if (!nested) return filteredFlat;
    const rows = [];
    filteredNested.forEach((parent) => { rows.push(parent); parent.children.forEach((c) => rows.push(c)); });
    return rows;
  }, [nested, filteredFlat, filteredNested]);

  const facetFor = (colKey) => {
    const counts = new Map();
    facetBase.forEach((rule) => {
      const value = String(rule[colKey] ?? '');
      counts.set(value, (counts.get(value) ?? 0) + 1);
    });
    return [...counts.entries()]
      .sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }))
      .map(([value, count]) => ({ value, count }));
  };

  // Pagination: flat rows, or nested parents (children ride along with parent).
  const items = nested ? filteredNested : filteredFlat;
  const totalCount = items.length;
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, pageCount);
  const rangeStart = totalCount ? (currentPage - 1) * pageSize + 1 : 0;
  const rangeEnd = Math.min(currentPage * pageSize, totalCount);
  const pageItems = getPageItems(currentPage, pageCount);
  const pageRows = items.slice(rangeStart ? rangeStart - 1 : 0, rangeEnd);

  const noun = nested ? ['rule group', 'rule groups'] : ['decision rule', 'decision rules'];
  const summary = !totalCount
    ? 'No decision rules to show'
    : `Showing ${rangeStart}-${rangeEnd} of ${totalCount} ${totalCount === 1 ? noun[0] : noun[1]}`;

  const deleteFlat = (id) => setFlatRules((current) => current.filter((rule) => rule.id !== id));
  const deleteNestedParent = (id) => setNestedRules((current) => current.filter((rule) => rule.id !== id));
  const deleteNestedChild = (parentId, childId) => setNestedRules((current) => current.map((parent) => (
    parent.id === parentId ? { ...parent, children: parent.children.filter((c) => c.id !== childId) } : parent
  )));

  const setFilter = (key, values) => {
    setFilters((current) => ({ ...current, [key]: values }));
    setPage(1);
  };
  const clearFilters = () => {
    setFilters({});
    setPanelFilters({});
    setPage(1);
  };

  const panelColumns = COLUMNS;
  const openPanel = () => {
    setDraftPanelFilters(panelFilters);
    setActiveFilterCol((current) => (current && panelColumns.some((c) => c.key === current)
      ? current : panelColumns[0]?.key ?? null));
    setFacetQuery('');
    setPanelOpen(true);
  };
  const selectFilterCol = (key) => { setActiveFilterCol(key); setFacetQuery(''); };
  const toggleDraftValue = (colKey, value) => {
    setDraftPanelFilters((current) => {
      const existing = current[colKey] ?? [];
      const next = existing.includes(value) ? existing.filter((e) => e !== value) : [...existing, value];
      return { ...current, [colKey]: next };
    });
  };
  const toggleDraftAll = (colKey, allValues) => {
    setDraftPanelFilters((current) => {
      const existing = current[colKey] ?? [];
      return { ...current, [colKey]: existing.length === allValues.length ? [] : allValues };
    });
  };
  const applyPanel = () => {
    setPanelFilters(Object.fromEntries(Object.entries(draftPanelFilters).filter(([, v]) => v?.length)));
    setPanelOpen(false);
    setPage(1);
  };
  const clearPanelDraft = () => setDraftPanelFilters({});

  const toggleNested = (on) => {
    setNested(on);
    setPage(1);
    setFilters({});
    setPanelFilters({});
    setExpandedParents({});
  };

  const toggleParent = (id) => setExpandedParents((current) => ({ ...current, [id]: !current[id] }));

  const openRule = (rule) => {
    if (window.getSelection()?.toString()) return;
    onNavigate?.('decision-rule-edit', { rule });
  };

  // Open the new-rule editor pre-filled with the current filter selection.
  // Quick filters are multi-select; a rule holds one value per column, so we
  // seed with the first picked value of each active filter.
  const createWithFilters = () => {
    const seed = {};
    Object.entries(filters).forEach(([key, values]) => {
      if (values?.length) seed[key === 'sampleCategory' ? 'sampleCategory' : key] = values[0];
    });
    Object.entries(panelFilters).forEach(([key, values]) => {
      if (values?.length && seed[key] === undefined) seed[key] = values[0];
    });
    onNavigate?.('decision-rule-edit', { rule: seed });
  };

  // Empty-state cell: message + (when filters are set) a button to create a
  // new rule pre-filled with the chosen combination.
  const emptyState = (
    <td colSpan={columns.length + 1} className="py-4">
      <div className="smplfy-dr-empty">
        <div className="smplfy-dr-empty-text text-secondary">No decision rules found.</div>
        {activeFilterCount ? (
          <PrimaryButton
            size="medium"
            leftIcon="plus"
            className="smplfy-dr-empty-create"
            onClick={createWithFilters}
          >
            Create new with selected combination
          </PrimaryButton>
        ) : null}
      </div>
    </td>
  );

  // Sub-rule rows inherit Product / Sample Category / MoA from their parent, so
  // those cells show a dash; only the sub-parameter (and its limits) are its own.
  const CHILD_DASH_KEYS = ['product', 'sampleCategory', 'moa'];

  const renderCell = (rule, column, { parent = false, child = false } = {}) => {
    if (child && CHILD_DASH_KEYS.includes(column.key)) {
      return '-';
    }
    if (column.key === 'product') {
      return <span className="smplfy-dr-cell-product">{rule.product}</span>;
    }
    if (column.key === 'parameter' && parent) {
      return <span className="smplfy-dr-parent-name">{rule.parameter}</span>;
    }
    return rule[column.key];
  };

  const actionsCell = (onDelete, label) => (
    <td>
      <div className="d-flex align-items-center gap-2">
        <SecondaryButton size="medium" leftIcon="edit" className="smplfy-dr-edit">Edit</SecondaryButton>
        <div onClick={(event) => event.stopPropagation()}>
          <MoreActionButton
            size="medium"
            menuAlign="end"
            aria-label={`More actions for ${label}`}
            items={[{ key: 'delete', label: 'Delete', leftIcon: 'trash', className: 'smplfy-dr-menu-delete', onClick: onDelete }]}
          />
        </div>
      </div>
    </td>
  );

  // Flat / leaf row: click opens edit.
  const renderFlatRow = (rule) => (
    <tr key={rule.id} data-super-hover className="smplfy-dr-row" onClick={() => openRule(rule)}>
      {columns.map((column) => <td key={column.key}>{renderCell(rule, column)}</td>)}
      {actionsCell(() => deleteFlat(rule.id), rule.parameter)}
    </tr>
  );

  // Nested parent row: click toggles expansion (a chevron shows state).
  const renderParentRow = (parent) => {
    const open = Boolean(expandedParents[parent.id]);
    return (
      <tr
        key={parent.id}
        data-super-hover
        className={`smplfy-dr-row smplfy-dr-parent-row${open ? ' is-expanded' : ''}`}
        aria-expanded={open}
        onClick={() => toggleParent(parent.id)}
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
        {actionsCell(() => deleteNestedParent(parent.id), parent.parameter)}
      </tr>
    );
  };

  // Nested child row: indented, click opens edit.
  const renderChildRow = (parent, child) => (
    <tr key={child.id} data-super-hover className="smplfy-dr-row smplfy-dr-child-row" onClick={() => openRule(child)}>
      {columns.map((column, index) => (
        <td key={column.key} className={index === 0 ? 'smplfy-dr-child-lead' : undefined}>
          {renderCell(child, column, { child: true })}
        </td>
      ))}
      {actionsCell(() => deleteNestedChild(parent.id, child.id), child.parameter)}
    </tr>
  );

  const colSpan = columns.length + 1;

  return (
    <AppChrome
      activeNav="design-handoff"
      onNavigate={onNavigate}
      breadcrumbs={[
        { key: 'design-handoff', label: 'Design Handoff' },
        { key: 'decision-rules-listing-v2', label: 'Decision Rules', current: true },
      ]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      sidebarBadgeCounts={sidebarBadgeCounts}
      pageHeader={(
        <section className="bg-white border-bottom px-4 py-3">
          <div className="container-fluid px-0">
            <div className="row align-items-center justify-content-between gx-0 gy-3">
              <div className="col-auto d-flex align-items-center gap-3">
                <h1 className="h5 mb-0 fw-semibold text-dark">Decision Rules</h1>
                <VersionDropdown onNavigate={onNavigate} />
              </div>
              <div className="col-auto d-flex align-items-center gap-3">
                <label className="smplfy-dr-nest-switch form-check form-switch mb-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    checked={nested}
                    onChange={(event) => toggleNested(event.target.checked)}
                  />
                  <span className="form-check-label">Nested rules</span>
                </label>
                <div className="d-flex align-items-center gap-2">
                  <SecondaryButton leftIcon="table">Bulk Update</SecondaryButton>
                  <SplitSecondaryButton
                    label="New"
                    leftIcon="plus"
                    className="smplfy-dr-split"
                    menuAlign="end"
                    onPrimaryClick={() => onNavigate?.('decision-rule-edit', { rule: null })}
                    toggleLabel="More ways to add decision rules"
                    menuLabel="New decision rule options"
                    menuItems={[{ key: 'bulk-upload', label: 'Bulk Upload', icon: 'upload' }]}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    >
      <main className="smplfy-dr-page bg-white p-4 min-vh-100">
        <div className="container-fluid px-0 d-flex flex-column gap-3">
          {/* Quick filter row + More panel + settings. No view tabs in V2. */}
          <div className="smplfy-dr-filters d-flex align-items-end flex-wrap gap-3">
            {COLUMNS.filter((column) => column.filter && !hiddenColumns.includes(column.key)).map((column) => (
              <div key={column.key} className="smplfy-dr-filter">
                <label className="smplfy-dr-filter-label" htmlFor={`drv2-filter-${column.key}`}>{column.label}</label>
                <SearchSelectFilter
                  id={`drv2-filter-${column.key}`}
                  value={filters[column.key] ?? []}
                  options={SELECT_OPTIONS[column.key]}
                  placeholder={`All ${column.label.toLowerCase()}`}
                  ariaLabel={`Filter by ${column.label.toLowerCase()}`}
                  isOpen={openFilterKey === column.key}
                  onOpenChange={(next) => setOpenFilterKey(next ? column.key : null)}
                  onChange={(values) => setFilter(column.key, values)}
                />
              </div>
            ))}

            <div className="smplfy-new-tr-filter position-relative smplfy-dr-more-filter">
              <SecondaryButton
                size="medium"
                tone="neutral"
                leftIcon="filter"
                className={`smplfy-new-tr-filter-btn${panelFilterCount ? ' is-active' : ''}`}
                aria-expanded={panelOpen}
                onClick={() => (panelOpen ? setPanelOpen(false) : openPanel())}
              >
                {`More${panelFilterCount ? ` (${panelFilterCount})` : ''}`}
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
                        {panelColumns.map((column) => {
                          const count = draftPanelFilters[column.key]?.length ?? 0;
                          return (
                            <button
                              key={column.key}
                              type="button"
                              className={`smplfy-new-tr-filter-col${activeFilterCol === column.key ? ' is-active' : ''}`}
                              onClick={() => selectFilterCol(column.key)}
                            >
                              <span>{column.label}</span>
                              {count ? <span className="smplfy-new-tr-filter-col-badge">{count}</span> : null}
                            </button>
                          );
                        })}
                      </div>
                      <div className="smplfy-new-tr-filter-values d-flex flex-column">
                        {activeFilterCol ? (() => {
                          const facet = facetFor(activeFilterCol);
                          const allValues = facet.map((item) => item.value);
                          const checked = draftPanelFilters[activeFilterCol] ?? [];
                          const allChecked = allValues.length > 0 && checked.length === allValues.length;
                          const query = facetQuery.trim().toLowerCase();
                          const shown = query ? facet.filter((item) => (item.value || '—').toLowerCase().includes(query)) : facet;
                          return (
                            <>
                              <div className="smplfy-dr-facet-search">
                                <span className="smplfy-dr-facet-search-icon" aria-hidden="true">
                                  <AppIcon name="search" size={16} />
                                </span>
                                <input
                                  ref={facetSearchRef}
                                  type="search"
                                  className="smplfy-dr-facet-search-input"
                                  placeholder="Search"
                                  aria-label={`Search ${panelColumns.find((c) => c.key === activeFilterCol)?.label ?? ''} values`}
                                  value={facetQuery}
                                  onChange={(event) => setFacetQuery(event.target.value)}
                                  onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                      event.preventDefault();
                                      applyPanel();
                                    }
                                  }}
                                />
                              </div>
                              <div className="smplfy-dr-facet-list">
                                <label className="smplfy-new-tr-filter-opt d-flex align-items-center gap-2">
                                  <Checkbox checked={allChecked} aria-label="All" onChange={() => toggleDraftAll(activeFilterCol, allValues)} />
                                  <span className="flex-grow-1">All</span>
                                  <span className="text-secondary">{facetBase.length}</span>
                                </label>
                                {shown.length ? shown.map((item) => (
                                  <label key={item.value || '—'} className="smplfy-new-tr-filter-opt d-flex align-items-center gap-2">
                                    <Checkbox
                                      checked={checked.includes(item.value)}
                                      aria-label={item.value || 'blank'}
                                      onChange={() => toggleDraftValue(activeFilterCol, item.value)}
                                    />
                                    <span className="flex-grow-1">{item.value || '—'}</span>
                                    <span className="text-secondary">{item.count}</span>
                                  </label>
                                )) : <div className="smplfy-dr-facet-empty text-secondary">No matches</div>}
                              </div>
                            </>
                          );
                        })() : null}
                      </div>
                    </div>
                    <div className="smplfy-new-tr-filter-footer d-flex align-items-center justify-content-between">
                      <button
                        type="button"
                        className="btn btn-link p-0 text-secondary text-decoration-none smplfy-new-tr-filter-clear"
                        disabled={!Object.values(draftPanelFilters).some((v) => v?.length)}
                        onClick={clearPanelDraft}
                      >
                        Clear all filters
                      </button>
                      <PrimaryButton size="medium" onClick={applyPanel}>Apply</PrimaryButton>
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            {/* Always visible; disabled when there is nothing to clear. */}
            <button
              type="button"
              className="smplfy-dr-filter-clear"
              disabled={!activeFilterCount}
              onClick={clearFilters}
            >
              <AppIcon name="close" size={14} stroke={2} />
              <span>Reset</span>
            </button>
          </div>

          <div className="smplfy-dr-table-wrap" ref={setTableWrap}>
            {edgeLeft !== null ? (
              <span className="smplfy-dr-edge-line" style={{ left: `${edgeLeft}px` }} aria-hidden="true" />
            ) : null}
            <DataTable className="smplfy-dr-table">
              <colgroup>
                {columns.map((column, index) => (
                  <col key={column.key} style={columnPx ? { width: `${columnPx[index]}px` } : undefined} />
                ))}
                <col style={{ width: `${ACTIONS_WIDTH_PX}px` }} />
              </colgroup>
              <thead ref={theadRef}>
                <tr>
                  {columns.map((column, index) => {
                    // In nested mode the Parameter column holds both the parent
                    // parameter and its sub-parameters, so label it as such.
                    const headLabel = nested && column.key === 'parameter'
                      ? 'Parameter/Sub-parameter'
                      : column.label;
                    return (
                    <th scope="col" key={column.key}>
                      {headLabel}
                      <span
                        role="separator"
                        aria-orientation="vertical"
                        aria-label={`Resize ${column.label} column`}
                        tabIndex={0}
                        className="smplfy-dr-resizer"
                        onPointerEnter={() => { if (!dragRef.current) setEdgeIndex(index); }}
                        onPointerLeave={() => { if (!dragRef.current) setEdgeIndex(null); }}
                        onFocus={() => setEdgeIndex(index)}
                        onBlur={() => setEdgeIndex(null)}
                        onPointerDown={(event) => handleResizeStart(event, index)}
                        onPointerMove={handleResizeMove}
                        onPointerUp={handleResizeEnd}
                        onPointerCancel={handleResizeEnd}
                        onKeyDown={(event) => handleResizeKey(event, index)}
                      />
                    </th>
                    );
                  })}
                  <th scope="col">
                    <div className="smplfy-dr-actions-head">
                      <span>Actions</span>
                      <button
                        type="button"
                        className="smplfy-dr-col-settings-btn"
                        aria-label="Table settings"
                        title="Table settings"
                        onClick={() => setSettingsOpen(true)}
                      >
                        <AppIcon name="settings" size={16} />
                      </button>
                    </div>
                  </th>
                </tr>
              </thead>
              {/* Nested: one tbody per group so an expanded parent can stick
                  below the header, bounded by its own group — the next group
                  scrolls up and pushes it out. Flat: a single tbody. */}
              {nested ? (
                pageRows.length ? pageRows.map((parent) => {
                  const open = Boolean(expandedParents[parent.id]);
                  return (
                    <tbody key={parent.id} className={`smplfy-dr-nest-group${open ? ' is-expanded' : ''}`}>
                      {renderParentRow(parent)}
                      {open ? parent.children.map((child) => renderChildRow(parent, child)) : null}
                    </tbody>
                  );
                }) : (
                  <tbody>
                    <tr>{emptyState}</tr>
                  </tbody>
                )
              ) : (
                <tbody>
                  {pageRows.length
                    ? pageRows.map((rule) => renderFlatRow(rule))
                    : (<tr>{emptyState}</tr>)}
                </tbody>
              )}
            </DataTable>
          </div>

          <div className="smplfy-dr-footer d-flex align-items-center justify-content-between flex-wrap gap-3">
            <span className="smplfy-dr-summary text-secondary">{summary}</span>
            <nav aria-label="Decision rules pages" className="smplfy-dr-pagination d-flex align-items-center gap-1">
              <button type="button" className="smplfy-dr-page-btn" aria-label="Previous page" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>
                <AppIcon name="chevron-left" size={14} />
              </button>
              {pageItems.map((item) => (
                typeof item === 'number' ? (
                  <button
                    key={item}
                    type="button"
                    className={`smplfy-dr-page-btn${item === currentPage ? ' is-active' : ''}`}
                    aria-current={item === currentPage ? 'page' : undefined}
                    onClick={() => setPage(item)}
                  >
                    {item}
                  </button>
                ) : <span key={item} className="smplfy-dr-page-btn is-ellipsis" aria-hidden="true">…</span>
              ))}
              <button type="button" className="smplfy-dr-page-btn" aria-label="Next page" disabled={currentPage >= pageCount} onClick={() => setPage(currentPage + 1)}>
                <AppIcon name="chevron-right" size={14} />
              </button>
            </nav>
            <label className="smplfy-dr-page-size d-flex align-items-center gap-2 mb-0">
              <span className="text-secondary">Per page</span>
              <select
                className="form-select form-select-sm"
                value={pageSize}
                onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}
              >
                {PAGE_SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size}</option>)}
              </select>
            </label>
          </div>
        </div>

        <Modal
          open={settingsOpen}
          title="Table columns"
          titleId="drv2-column-settings-title"
          titleIcon="settings"
          size="md"
          onClose={() => setSettingsOpen(false)}
          actions={(
            <>
              <SecondaryButton onClick={resetColumnLayout}>Reset to default</SecondaryButton>
              <PrimaryButton onClick={() => setSettingsOpen(false)}>Done</PrimaryButton>
            </>
          )}
        >
          <ul className="smplfy-dr-colset list-unstyled mb-0 d-grid gap-2">
            {COLUMNS.filter((column) => !LOCKED_COLUMN_KEYS.includes(column.key)).map((column) => (
              <li key={column.key}>
                <label className="smplfy-dr-colset-row">
                  <Checkbox
                    checked={!hiddenColumns.includes(column.key)}
                    aria-label={column.label}
                    onChange={() => toggleColumnVisibility(column.key)}
                  />
                  <span className="flex-grow-1">{column.label}</span>
                </label>
              </li>
            ))}
          </ul>
        </Modal>
      </main>
    </AppChrome>
  );
}
