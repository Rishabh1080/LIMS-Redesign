import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useSuperHoverRef } from 'super-hover/react';
import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import DataTable from '../components/DataTable';
import MoreActionButton from '../components/MoreActionButton';
import NavSelector from '../components/NavSelector';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import SplitSecondaryButton from '../components/SplitSecondaryButton';
import Modal from '../components/Modal/Modal';
import Checkbox from '../components/Checkbox/Checkbox';
import { MOAS, PARAMETERS, PRODUCTS, SAMPLE_CATEGORIES } from '../data/decisionRulesData';
import './new-tr-page.scss';
import './decision-rules-listing-page.scss';

// --- Data -----------------------------------------------------------------
// 563 rules spread across many products, each with its own set of
// parameters, so the grouped views look like real data. The last three rules
// mirror the production system's final page exactly.
const TOTAL_RULES = 563;

const LAST_RULES = [
  { product: 'Sodium Chloride', parameter: 'Ash', sampleCategory: 'Raw Material', moa: 'IHL/QC/STP/148', min: '-', max: '0.1' },
  { product: 'Sodium Chloride', parameter: 'pH', sampleCategory: 'Raw Material', moa: 'IHL/QC/STP/149', min: '6.5', max: '8.5' },
  { product: 'Sodium Chloride', parameter: 'Moisture', sampleCategory: 'Raw Material', moa: 'IHL/QC/STP/150', min: '-', max: '1.0' },
];

function buildRules() {
  const rules = [];
  const bodyCount = TOTAL_RULES - LAST_RULES.length;

  // Spread rules across products; each product cycles through the parameter
  // list, and MoA / sample category are assigned in a rotating pattern so the
  // columns have varied, realistic-looking data.
  let seq = 0;
  while (rules.length < bodyCount) {
    const product = PRODUCTS[seq % PRODUCTS.length];
    const parameter = PARAMETERS[seq % PARAMETERS.length];
    rules.push({
      product,
      parameter: parameter.name,
      sampleCategory: SAMPLE_CATEGORIES[seq % SAMPLE_CATEGORIES.length],
      moa: MOAS[seq % MOAS.length],
      min: parameter.min,
      max: parameter.max,
    });
    seq += 1;
  }

  return [...rules, ...LAST_RULES].map((rule, index) => ({
    id: `dr-${index + 1}`,
    sampleCategory: '-',
    moa: 'As per B.P.',
    cutOff: '0',
    template: 'DataSheet',
    ...rule,
  }));
}

const ALL_RULES = buildRules();

// --- Views & columns ------------------------------------------------------
const VIEWS = [
  { key: 'all', label: 'All Rules' },
  { key: 'product', label: 'Product wise', groupBy: 'product', groupNoun: ['product', 'products'] },
  { key: 'parameter', label: 'Parameter wise', groupBy: 'parameter', groupNoun: ['parameter', 'parameters'] },
];

// Widths are relative weights; the grouped-by column is dropped and its share
// is redistributed. Actions keeps a fixed width sized to Edit + the menu.
// filter: 'text' matches as a substring; 'select' is an exact-match dropdown
// built from the column's distinct values; omitted = not filterable.
const COLUMNS = [
  { key: 'product', label: 'Product', weight: 20, filter: 'text' },
  { key: 'parameter', label: 'Parameter', weight: 22, filter: 'text' },
  { key: 'sampleCategory', label: 'Sample Category', weight: 10, filter: 'select' },
  { key: 'moa', label: 'MoA', weight: 16, filter: 'select' },
  { key: 'cutOff', label: 'Cut Off', weight: 6 },
  { key: 'min', label: 'Min', weight: 5.5 },
  { key: 'max', label: 'Max', weight: 5.5 },
  { key: 'template', label: 'Template', weight: 7 },
];

// Distinct values for the select filters, computed once from the full data.
const SELECT_OPTIONS = COLUMNS.reduce((acc, column) => {
  if (column.filter === 'select') {
    acc[column.key] = [...new Set(ALL_RULES.map((rule) => rule[column.key]))]
      .sort((a, b) => a.localeCompare(b));
  }
  return acc;
}, {});

const ACTIONS_WIDTH_PX = 156;
const MIN_COLUMN_WIDTH_PX = 80;
const KEYBOARD_RESIZE_STEP_PX = 16;
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// Column layout is remembered per browser. Widths are stored as relative
// weights (so they scale with the window); hidden columns as a list of keys.
const WIDTHS_STORAGE_KEY = 'lims:decision-rules:column-widths';
const HIDDEN_STORAGE_KEY = 'lims:decision-rules:hidden-columns';
// The primary column can't be hidden (Actions is always shown, too).
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
    // Storage unavailable (private mode / quota): the layout just won't persist.
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

// Drag a column's right edge by `delta` px. The table always fills its
// container, so the width comes from (or goes back to) the neighbours: the
// columns to the right in order, or — for the last column — those to its left.
// Nothing shrinks below the minimum width. Returns the new pixel widths.
function resizeColumns(startPx, index, delta, min = MIN_COLUMN_WIDTH_PX) {
  const next = [...startPx];
  const last = startPx.length - 1;
  if (last < 1) return next;

  const donors = index < last
    ? Array.from({ length: last - index }, (_, i) => index + 1 + i)
    : Array.from({ length: index }, (_, i) => index - 1 - i);

  let applied;
  if (delta >= 0) {
    let remaining = Math.min(
      delta,
      donors.reduce((sum, donor) => sum + Math.max(0, startPx[donor] - min), 0),
    );
    applied = remaining;
    donors.forEach((donor) => {
      const take = Math.min(remaining, Math.max(0, startPx[donor] - min));
      next[donor] = startPx[donor] - take;
      remaining -= take;
    });
  } else {
    applied = -Math.min(-delta, Math.max(0, startPx[index] - min));
    next[donors[0]] = startPx[donors[0]] - applied;
  }

  next[index] = startPx[index] + applied;
  return next;
}

// Page numbers with ellipses: always 1 and the last, plus a window around the
// current page — e.g. 1 … 51 52 53 54 55 56 57.
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

function plural(count, [one, many]) {
  return `${count} ${count === 1 ? one : many}`;
}

const VERSIONS = [
  { key: 'v2', label: 'Version 2', page: 'decision-rules-listing-v2' },
  { key: 'v1', label: 'Version 1', page: 'decision-rules-listing' },
];

// Header dropdown to switch between design versions. This page is Version 1.
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
        <span>Version 1</span>
        <AppIcon name={open ? 'chevron-up' : 'chevron-down'} size={16} />
      </button>
      {open ? (
        <div className="smplfy-dropdown-menu dropdown-menu show smplfy-dr-version-menu" role="menu">
          {VERSIONS.map((version) => (
            <button
              key={version.key}
              type="button"
              role="menuitemradio"
              aria-checked={version.key === 'v1'}
              className={`smplfy-dropdown-item dropdown-item${version.key === 'v1' ? ' is-current' : ''}`}
              onClick={() => {
                setOpen(false);
                if (version.key !== 'v1') onNavigate?.(version.page);
              }}
            >
              <span>{version.label}</span>
              {version.key === 'v1' ? <AppIcon name="check" size={16} /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function DecisionRulesListingPage({
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  sidebarBadgeCounts,
}) {
  const [viewKey, setViewKey] = useState('all');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [rules, setRules] = useState(ALL_RULES);
  // Per-group UI state, keyed by `${viewKey}:${groupName}`.
  // Groups start collapsed; this tracks the ones the user has opened.
  const [expandedGroups, setExpandedGroups] = useState({});
  // Quick-row filters (live, single value per column), keyed by column key.
  const [filters, setFilters] = useState({});
  // "More" panel: multi-select checkbox facets per column, committed via Apply.
  const [panelFilters, setPanelFilters] = useState({});
  const [draftPanelFilters, setDraftPanelFilters] = useState({});
  const [panelOpen, setPanelOpen] = useState(false);
  const [activeFilterCol, setActiveFilterCol] = useState(null);
  // Search query inside the active column's values list.
  const [facetQuery, setFacetQuery] = useState('');
  // Column layout (persisted): relative widths + which optional columns are hidden.
  const [colWidths, setColWidths] = useState(loadColumnWidths);
  const [hiddenColumns, setHiddenColumns] = useState(loadHiddenColumns);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tableWidth, setTableWidth] = useState(0);
  const [resizingKey, setResizingKey] = useState(null);
  const [edgeIndex, setEdgeIndex] = useState(null);
  const dragRef = useRef(null);

  // Save widths once a drag ends (not on every pointer move), and hidden
  // columns whenever they change.
  useEffect(() => {
    if (!resizingKey) writeStored(WIDTHS_STORAGE_KEY, colWidths);
  }, [colWidths, resizingKey]);

  useEffect(() => {
    writeStored(HIDDEN_STORAGE_KEY, hiddenColumns);
  }, [hiddenColumns]);

  useEffect(() => () => document.body.classList.remove('smplfy-dr-resizing'), []);

  const quickFilterCount = Object.values(filters).filter((value) => value?.trim?.() ?? value).length;
  const panelFilterCount = Object.values(panelFilters).filter((values) => values?.length).length;
  const activeFilterCount = quickFilterCount + panelFilterCount;

  // Sticky group headers sit directly under the sticky table header, so expose
  // the header's real height as a CSS variable (kept current on resize).
  const tableWrapRef = useRef(null);
  const theadRef = useRef(null);

  // Row hover comes from super-hover: it hit-tests every frame, so the active
  // row keeps tracking the pointer while the page scrolls (native :hover
  // doesn't update mid-scroll). Rows opt in with data-super-hover; the active
  // one gets data-super-hover-active. The wrapper needs both this callback ref
  // and our own ref (used to measure the sticky header).
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
    // Also track the table's width: column pixel widths are derived from it.
    const sync = () => {
      wrap.style.setProperty('--smplfy-dr-head-height', `${thead.offsetHeight}px`);
      setTableWidth(Math.floor(table.getBoundingClientRect().width));
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(thead);
    observer.observe(table);
    return () => observer.disconnect();
  }, []);

  const view = VIEWS.find((item) => item.key === viewKey) ?? VIEWS[0];
  const isGrouped = Boolean(view.groupBy);

  const columns = useMemo(
    () => COLUMNS.filter((column) => column.key !== view.groupBy && !hiddenColumns.includes(column.key)),
    [view.groupBy, hiddenColumns],
  );

  // Pixel width per visible column: the stored weights, normalised to fill the
  // space left of the fixed Actions column (so hiding a column or resizing the
  // window re-spreads the width). Rounding leftovers go to the last column.
  const columnPx = useMemo(() => {
    const dataWidth = tableWidth - ACTIONS_WIDTH_PX;
    if (dataWidth <= 0 || !columns.length) return null;
    const total = columns.reduce((sum, column) => sum + colWidths[column.key], 0);
    const widths = columns.map((column) => Math.floor((colWidths[column.key] / total) * dataWidth));
    widths[widths.length - 1] += dataWidth - widths.reduce((sum, width) => sum + width, 0);
    return widths;
  }, [columns, colWidths, tableWidth]);

  // x position of the highlighted column edge, from the live column widths.
  const edgeLeft = columnPx && edgeIndex !== null && edgeIndex < columnPx.length
    ? columnPx.slice(0, edgeIndex + 1).reduce((sum, width) => sum + width, 0)
    : null;

  // Writes a resize back as weights, keeping the visible columns' total weight
  // (and so any hidden columns' relative sizes) unchanged.
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
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    document.body.classList.remove('smplfy-dr-resizing');
    setResizingKey(null);
    // Keep the edge lit only if the pointer is still over the handle.
    if (!event.currentTarget.matches(':hover')) setEdgeIndex(null);
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

  const filteredRules = useMemo(() => {
    const active = COLUMNS
      .filter((column) => (filters[column.key] ?? '').toString().trim())
      .map((column) => ({ column, value: filters[column.key].toString().trim().toLowerCase() }));

    return rules.filter((rule) => {
      const passesQuick = active.every(({ column, value }) => {
        const cell = String(rule[column.key] ?? '').toLowerCase();
        return column.filter === 'select' ? cell === value : cell.includes(value);
      });
      if (!passesQuick) return false;

      // Panel: within a column any selected value matches (OR); across columns
      // all must match (AND).
      return Object.entries(panelFilters).every(([key, values]) => (
        !values?.length || values.includes(String(rule[key] ?? ''))
      ));
    });
  }, [rules, filters, panelFilters]);

  // Distinct values + counts for a column, over the quick-filtered set
  // (but ignoring the panel so a column's own options don't collapse as you pick).
  const facetFor = (colKey) => {
    const counts = new Map();
    filteredRules.forEach((rule) => {
      const value = String(rule[colKey] ?? '');
      counts.set(value, (counts.get(value) ?? 0) + 1);
    });
    return [...counts.entries()]
      .sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }))
      .map(([value, count]) => ({ value, count }));
  };

  // Grouped views: one entry per distinct value, in first-seen order.
  const groups = useMemo(() => {
    if (!isGrouped) return [];
    const map = new Map();
    filteredRules.forEach((rule) => {
      const name = rule[view.groupBy];
      if (!map.has(name)) map.set(name, []);
      map.get(name).push(rule);
    });
    return [...map.entries()].map(([name, groupRules]) => ({ name, rules: groupRules }));
  }, [filteredRules, isGrouped, view.groupBy]);

  // Pagination pages rules in "All", and groups in the grouped views.
  const totalCount = isGrouped ? groups.length : filteredRules.length;
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, pageCount);
  const rangeStart = totalCount ? (currentPage - 1) * pageSize + 1 : 0;
  const rangeEnd = Math.min(currentPage * pageSize, totalCount);
  const pageItems = getPageItems(currentPage, pageCount);
  const sliceStart = rangeStart ? rangeStart - 1 : 0;
  const pageRules = isGrouped ? [] : filteredRules.slice(sliceStart, rangeEnd);
  const pageGroups = isGrouped ? groups.slice(sliceStart, rangeEnd) : [];

  const summary = !totalCount
    ? 'No decision rules to show'
    : isGrouped
      ? `Showing ${rangeStart}-${rangeEnd} of ${plural(totalCount, view.groupNoun)} · ${plural(filteredRules.length, ['decision rule', 'decision rules'])}`
      : `Showing ${rangeStart}-${rangeEnd} of ${totalCount} decision rules`;

  const deleteRule = (id) => setRules((current) => current.filter((rule) => rule.id !== id));

  const switchView = (key) => {
    setViewKey(key);
    setPage(1);
  };

  const setFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setPanelFilters({});
    setPage(1);
  };

  // Columns the "More" panel offers (everything except Actions, and skip the
  // grouped-by column in grouped views since the tab already scopes it).
  const panelColumns = COLUMNS.filter((column) => column.key !== view.groupBy);

  const openPanel = () => {
    setDraftPanelFilters(panelFilters);
    setActiveFilterCol((current) => (current && panelColumns.some((c) => c.key === current)
      ? current
      : panelColumns[0]?.key ?? null));
    setFacetQuery('');
    setPanelOpen(true);
  };

  const selectFilterCol = (key) => {
    setActiveFilterCol(key);
    setFacetQuery('');
  };

  const toggleDraftValue = (colKey, value) => {
    setDraftPanelFilters((current) => {
      const existing = current[colKey] ?? [];
      const next = existing.includes(value)
        ? existing.filter((entry) => entry !== value)
        : [...existing, value];
      return { ...current, [colKey]: next };
    });
  };

  const toggleDraftAll = (colKey, allValues) => {
    setDraftPanelFilters((current) => {
      const existing = current[colKey] ?? [];
      const allChecked = existing.length === allValues.length;
      return { ...current, [colKey]: allChecked ? [] : allValues };
    });
  };

  const applyPanel = () => {
    const cleaned = Object.fromEntries(
      Object.entries(draftPanelFilters).filter(([, values]) => values?.length),
    );
    setPanelFilters(cleaned);
    setPanelOpen(false);
    setPage(1);
  };

  const clearPanelDraft = () => setDraftPanelFilters({});

  const groupStateKey = (name) => `${viewKey}:${name}`;

  const toggleGroup = (name) => {
    const key = groupStateKey(name);
    setExpandedGroups((current) => ({ ...current, [key]: !current[key] }));
  };

  const renderCell = (rule, column) => {
    if (column.key === 'product') {
      return (
        <button type="button" className="smplfy-dr-product-link">
          {rule.product}
        </button>
      );
    }
    return rule[column.key];
  };

  // All rows use the plain white table background (no striping, in any view).
  // A click anywhere on the row opens that rule's edit page (Edit included, it
  // bubbles here). The row menu stops propagation so it doesn't also navigate,
  // and finishing a text selection doesn't count as a click.
  const openRule = (rule) => {
    if (window.getSelection()?.toString()) return;
    onNavigate?.('decision-rule-edit', { rule });
  };

  const renderRuleRow = (rule) => (
    <tr
      key={rule.id}
      data-super-hover
      className="smplfy-dr-row"
      onClick={() => openRule(rule)}
    >
      {columns.map((column) => (
        <td key={column.key}>{renderCell(rule, column)}</td>
      ))}
      <td>
        <div className="d-flex align-items-center gap-2">
          <SecondaryButton size="medium" leftIcon="edit" className="smplfy-dr-edit">Edit</SecondaryButton>
          <div onClick={(event) => event.stopPropagation()}>
            <MoreActionButton
              size="medium"
              menuAlign="end"
              aria-label={`More actions for ${rule.parameter}`}
              items={[
                {
                  key: 'delete',
                  label: 'Delete',
                  leftIcon: 'trash',
                  className: 'smplfy-dr-menu-delete',
                  onClick: () => deleteRule(rule.id),
                },
              ]}
            />
          </div>
        </div>
      </td>
    </tr>
  );

  const colSpan = columns.length + 1;

  return (
    <AppChrome
      activeNav="design-handoff"
      onNavigate={onNavigate}
      breadcrumbs={[
        { key: 'design-handoff', label: 'Design Handoff' },
        { key: 'decision-rules-listing', label: 'Decision Rules', current: true },
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
              <div className="col-auto d-flex align-items-center gap-2">
                <SecondaryButton leftIcon="table">Bulk Update</SecondaryButton>
                <SplitSecondaryButton
                  label="New"
                  leftIcon="plus"
                  className="smplfy-dr-split"
                  menuAlign="end"
                  toggleLabel="More ways to add decision rules"
                  menuLabel="New decision rule options"
                  menuItems={[
                    { key: 'bulk-upload', label: 'Bulk Upload', icon: 'upload' },
                  ]}
                />
              </div>
            </div>
          </div>
        </section>
      )}
    >
      <main className="smplfy-dr-page bg-white p-4 min-vh-100">
        <div className="container-fluid px-0 d-flex flex-column gap-3">
          <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
            <div
              className="nav nav-pills d-inline-flex align-items-center gap-1 p-1 bg-white border rounded"
              role="tablist"
              aria-label="Decision rule views"
            >
              {VIEWS.map((item) => (
                <NavSelector
                  key={item.key}
                  size="medium"
                  role="tab"
                  aria-selected={viewKey === item.key}
                  active={viewKey === item.key}
                  onClick={() => switchView(item.key)}
                >
                  {item.label}
                </NavSelector>
              ))}
            </div>
          </div>

          {/* Column filters — one control per filterable column (the grouped-by
              column's own filter is hidden, since the tab already scopes it).
              Changes apply immediately; Clear all appears when any is set. */}
          <div className="smplfy-dr-filters d-flex align-items-end flex-wrap gap-2">
            {columns.filter((column) => column.filter).map((column) => {
              const value = filters[column.key] ?? '';
              const filled = Boolean(value.toString().trim());
              return (
                <div
                  key={column.key}
                  className={`smplfy-dr-filter${filled ? ' is-filled' : ''}`}
                >
                  <label className="smplfy-dr-filter-label" htmlFor={`dr-filter-${column.key}`}>
                    {column.label}
                  </label>
                  {column.filter === 'select' ? (
                    <select
                      id={`dr-filter-${column.key}`}
                      className="form-select form-select-sm smplfy-dr-filter-control"
                      value={value}
                      onChange={(event) => setFilter(column.key, event.target.value)}
                    >
                      <option value="">All</option>
                      {SELECT_OPTIONS[column.key].map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={`dr-filter-${column.key}`}
                      type="text"
                      className="form-control form-control-sm smplfy-dr-filter-control"
                      value={value}
                      placeholder={`Filter ${column.label.toLowerCase()}`}
                      onChange={(event) => setFilter(column.key, event.target.value)}
                    />
                  )}
                </div>
              );
            })}

            {/* More: the two-pane facet panel with every column (incl. Min/Max). */}
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
                          const shown = query
                            ? facet.filter((item) => (item.value || '—').toLowerCase().includes(query))
                            : facet;
                          return (
                            <>
                              {/* Search pinned to the top; All + items scroll below. */}
                              <div className="smplfy-dr-facet-search">
                                <span className="smplfy-dr-facet-search-icon" aria-hidden="true">
                                  <AppIcon name="search" size={16} />
                                </span>
                                <input
                                  type="search"
                                  className="smplfy-dr-facet-search-input"
                                  placeholder="Search"
                                  aria-label={`Search ${panelColumns.find((c) => c.key === activeFilterCol)?.label ?? ''} values`}
                                  value={facetQuery}
                                  onChange={(event) => setFacetQuery(event.target.value)}
                                />
                              </div>

                              <div className="smplfy-dr-facet-list">
                                {/* All reflects the full set, so it stays visible even while searching. */}
                                <label className="smplfy-new-tr-filter-opt d-flex align-items-center gap-2">
                                  <Checkbox checked={allChecked} aria-label="All" onChange={() => toggleDraftAll(activeFilterCol, allValues)} />
                                  <span className="flex-grow-1">All</span>
                                  <span className="text-secondary">{filteredRules.length}</span>
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
                                )) : (
                                  <div className="smplfy-dr-facet-empty text-secondary">No matches</div>
                                )}
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

            {activeFilterCount ? (
              <button type="button" className="smplfy-dr-filter-clear" onClick={clearFilters}>
                <AppIcon name="close" size={14} stroke={2} />
                <span>{`Clear all${activeFilterCount > 1 ? ` (${activeFilterCount})` : ''}`}</span>
              </button>
            ) : null}

            {/* Table settings: pinned to the right end of the filter row. */}
            <SecondaryButton
              size="medium"
              tone="neutral"
              leftIcon="settings"
              className="smplfy-dr-col-settings ms-auto"
              aria-label="Table settings"
              title="Table settings"
              onClick={() => setSettingsOpen(true)}
            />
          </div>

          <div className="smplfy-dr-table-wrap" ref={setTableWrap}>
            {/* Highlights the whole column edge (header + every row) while its
                resize handle is hovered, focused or being dragged. */}
            {edgeLeft !== null ? (
              <span className="smplfy-dr-edge-line" style={{ left: `${edgeLeft}px` }} aria-hidden="true" />
            ) : null}
            <DataTable className="smplfy-dr-table">
              <colgroup>
                {columns.map((column, index) => (
                  <col
                    key={column.key}
                    style={columnPx ? { width: `${columnPx[index]}px` } : undefined}
                  />
                ))}
                <col style={{ width: `${ACTIONS_WIDTH_PX}px` }} />
              </colgroup>
              <thead ref={theadRef}>
                <tr>
                  {columns.map((column, index) => (
                    <th scope="col" key={column.key}>
                      {column.label}
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
                  ))}
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              {!isGrouped ? (
                <tbody>
                  {pageRules.length
                    ? pageRules.map((rule) => renderRuleRow(rule))
                    : (
                      <tr>
                        <td colSpan={colSpan} className="text-center text-secondary py-4">No decision rules found.</td>
                      </tr>
                    )}
                </tbody>
              ) : null}

              {/* Grouped views: one <tbody> per group. A sticky group header is
                  bounded by its own tbody, so it stays pinned under the table
                  header while its rows scroll, then the next group pushes it out. */}
              {isGrouped && (pageGroups.length ? pageGroups.map((group) => {
                  const stateKey = groupStateKey(group.name);
                  const collapsed = !expandedGroups[stateKey];

                  return (
                    <tbody key={stateKey} className="smplfy-dr-group">
                      <tr className={`smplfy-dr-group-row${collapsed ? '' : ' is-expanded'}`}>
                        <td colSpan={colSpan}>
                          <button
                            type="button"
                            className="smplfy-dr-group-toggle"
                            aria-expanded={!collapsed}
                            onClick={() => toggleGroup(group.name)}
                          >
                            <AppIcon name={collapsed ? 'chevron-right' : 'chevron-down'} size={16} stroke={2} />
                            <span className="smplfy-dr-group-name">{group.name}</span>
                            <span className="smplfy-dr-group-count">{group.rules.length}</span>
                          </button>
                        </td>
                      </tr>

                      {!collapsed && group.rules.map((rule) => renderRuleRow(rule))}
                    </tbody>
                  );
                }) : (
                  <tbody>
                    <tr>
                      <td colSpan={colSpan} className="text-center text-secondary py-4">No decision rules found.</td>
                    </tr>
                  </tbody>
                ))}
            </DataTable>
          </div>

          <div className="smplfy-dr-footer d-flex align-items-center justify-content-between flex-wrap gap-3">
            <span className="smplfy-dr-summary text-secondary">{summary}</span>

            <nav aria-label="Decision rules pages" className="smplfy-dr-pagination d-flex align-items-center gap-1">
              <button
                type="button"
                className="smplfy-dr-page-btn"
                aria-label="Previous page"
                disabled={currentPage === 1}
                onClick={() => setPage(currentPage - 1)}
              >
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
                ) : (
                  <span key={item} className="smplfy-dr-page-btn is-ellipsis" aria-hidden="true">…</span>
                )
              ))}
              <button
                type="button"
                className="smplfy-dr-page-btn"
                aria-label="Next page"
                disabled={currentPage >= pageCount}
                onClick={() => setPage(currentPage + 1)}
              >
                <AppIcon name="chevron-right" size={14} />
              </button>
            </nav>

            <label className="smplfy-dr-page-size d-flex align-items-center gap-2 mb-0">
              <span className="text-secondary">Per page</span>
              <select
                className="form-select form-select-sm"
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPage(1);
                }}
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Column visibility. Changes apply (and are remembered) immediately;
            Product and Actions are always shown, so they aren't listed. */}
        <Modal
          open={settingsOpen}
          title="Table columns"
          titleId="dr-column-settings-title"
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
