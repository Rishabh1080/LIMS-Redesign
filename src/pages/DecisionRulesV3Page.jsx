// Decision Rules, Version 3: the index of products.
//
// A lab has 100-500 products, so this page is a dense, searchable table rather
// than a grid: search is the main way in, with sample-category and discipline
// filters, quick views for the work that's outstanding, and sortable columns.
// Each row says how complete that product's rules are; opening it shows the
// product's rules (DecisionRulesV3ProductPage).
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSuperHoverRef } from 'super-hover/react';
import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import DataTable from '../components/DataTable';
import NavSelector from '../components/NavSelector/NavSelector';
import SearchSelectFilter from '../components/SearchSelectFilter';
import SecondaryButton from '../components/SecondaryButton';
import SplitSecondaryButton from '../components/SplitSecondaryButton';
import { DISCIPLINES, SAMPLE_CATEGORIES, getNestedEnabled, getProducts, setListOrder, setNestedEnabled, summarise } from '../data/decisionRulesV3Data';
import { Highlight, TableFooter, SHOW_VERSION_SWITCHER, VersionDropdown, fullDate, plural } from './decisionRulesV3Shared';
import './new-tr-page.scss';
import './all-samples-listing-page.scss';
import './decision-rules-listing-page.scss';
import './decision-rules-listing-v2-page.scss';
import './decision-rules-v3-page.scss';

const PAGE_SIZES = [25, 50, 100];

// Search, view, filters, sort and page survive a trip into a product and back.
let savedState = null;
const initial = (key, fallback) => (savedState && key in savedState ? savedState[key] : fallback);

const VIEWS = [
  { key: 'all', label: 'All products', test: () => true },
  { key: 'needs-limits', label: 'Needs limits', test: (row) => row.withoutLimits > 0 },
  { key: 'no-rules', label: 'No rules', test: (row) => row.ruleCount === 0 },
];

const COLUMNS = [
  { key: 'name', label: 'Product', sortable: true },
  { key: 'sampleCategory', label: 'Category', sortable: true },
  { key: 'discipline', label: 'Discipline', sortable: true },
  { key: 'ruleCount', label: 'Rules', sortable: true, numeric: true },
  { key: 'updatedOn', label: 'Last updated', sortable: true },
];

const compare = (a, b) => (typeof a === 'number' ? a - b : String(a).localeCompare(String(b), undefined, { numeric: true }));
const sortValue = (row, key) => {
  if (key === 'updatedOn') return new Date(row.updatedOn).getTime();
  return row[key];
};

export default function DecisionRulesV3Page({
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  sidebarBadgeCounts,
}) {
  const [query, setQuery] = useState(() => initial('query', ''));
  const [view, setView] = useState(() => initial('view', 'all'));
  const [filters, setFilters] = useState(() => initial('filters', { sampleCategory: [], discipline: [] }));
  const [openFilter, setOpenFilter] = useState(null);
  const [sort, setSort] = useState(() => initial('sort', { key: 'name', dir: 'asc' }));
  const [page, setPage] = useState(() => initial('page', 1));
  const [pageSize, setPageSize] = useState(() => initial('pageSize', 25));
  useEffect(() => {
    savedState = { query, view, filters, sort, page, pageSize };
  }, [query, view, filters, sort, page, pageSize]);
  const searchRef = useRef(null);
  const superHoverRef = useSuperHoverRef();

  // Summaries are worked out once per visit (rules can change on a product page).
  // Counts follow the nesting setting, so they change when it is switched.
  const [nested, setNested] = useState(() => getNestedEnabled());
  const toggleNested = (value) => {
    setNestedEnabled(value);
    setNested(value);
    setPage(1);
  };
  const rows = useMemo(() => getProducts().map((product) => ({ ...product, ...summarise(product, nested) })), [nested]);

  // "/" jumps to search, as in most data-heavy tools.
  useEffect(() => {
    const onKey = (event) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || document.activeElement?.isContentEditable) return;
      event.preventDefault();
      searchRef.current?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const needle = query.trim().toLowerCase();
  // Search + filters, before the quick view, so each view can show its count.
  const searched = useMemo(() => rows.filter((row) => {
    if (needle && !`${row.name} ${row.code}`.toLowerCase().includes(needle)) return false;
    if (filters.sampleCategory.length && !filters.sampleCategory.includes(row.sampleCategory)) return false;
    if (filters.discipline.length && !filters.discipline.includes(row.discipline)) return false;
    return true;
  }), [rows, needle, filters]);

  const viewCounts = useMemo(
    () => Object.fromEntries(VIEWS.map((entry) => [entry.key, searched.filter(entry.test).length])),
    [searched],
  );

  const visible = useMemo(() => {
    const test = VIEWS.find((entry) => entry.key === view)?.test ?? (() => true);
    const list = searched.filter(test);
    const direction = sort.dir === 'asc' ? 1 : -1;
    return [...list].sort((a, b) => direction * compare(sortValue(a, sort.key), sortValue(b, sort.key)) || compare(a.name, b.name));
  }, [searched, view, sort]);

  // Product pages step through this same list with previous / next.
  useEffect(() => {
    setListOrder(visible.map((row) => row.id));
  }, [visible]);

  const total = visible.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, pageCount);
  const first = total ? (currentPage - 1) * pageSize : 0;
  const pageRows = visible.slice(first, first + pageSize);
  const summary = total
    ? `Showing ${first + 1}-${Math.min(first + pageSize, total)} of ${plural(total, 'product')}`
    : 'No products to show';

  const filterCount = (needle ? 1 : 0) + filters.sampleCategory.length + filters.discipline.length;
  const reset = () => {
    setQuery('');
    setFilters({ sampleCategory: [], discipline: [] });
    setView('all');
    setPage(1);
  };
  const setFilter = (key, values) => {
    setFilters((current) => ({ ...current, [key]: values }));
    setPage(1);
  };
  const toggleSort = (key) => {
    setSort((current) => (current.key === key ? { key, dir: current.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'updatedOn' ? 'desc' : 'asc' }));
    setPage(1);
  };

  const open = (row) => {
    if (window.getSelection()?.toString()) return;
    onNavigate?.('decision-rules-v3-product', { productId: row.id });
  };

  const totals = useMemo(() => rows.reduce((sum, row) => sum + row.ruleCount, 0), [rows]);

  return (
    <AppChrome
      activeNav="design-handoff"
      onNavigate={onNavigate}
      breadcrumbs={[
        { key: 'design-handoff', label: 'Design Handoff' },
        { key: 'decision-rules-listing-v3', label: 'Decision Rules', current: true },
      ]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      sidebarBadgeCounts={sidebarBadgeCounts}
      pageHeader={(
        <section className="bg-white border-bottom px-4 py-3">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div className="d-flex align-items-center gap-3">
              <h1 className="h5 mb-0 fw-semibold text-dark">Decision Rules</h1>
              {SHOW_VERSION_SWITCHER ? <VersionDropdown current="v3" onNavigate={onNavigate} /> : null}
            </div>
            <div className="d-flex align-items-center gap-2">
              <label className="smplfy-dr-nest-switch form-check form-switch mb-0 me-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  checked={nested}
                  onChange={(event) => toggleNested(event.target.checked)}
                />
                <span className="form-check-label">Nested rules</span>
              </label>
              <SecondaryButton leftIcon="table">Bulk Update</SecondaryButton>
              <SplitSecondaryButton
                label="New"
                leftIcon="plus"
                className="smplfy-dr-split"
                menuAlign="end"
                onPrimaryClick={() => onNavigate?.('decision-rule-edit', { rule: null, returnTo: { page: 'decision-rules-listing-v3' } })}
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
          <div className="smplfy-dr3-toolbar">
            <div className="smplfy-dr3-search">
              <span className="smplfy-dr3-search-icon" aria-hidden="true"><AppIcon name="search" size={18} /></span>
              <input
                ref={searchRef}
                type="search"
                className="smplfy-dr3-search-input"
                placeholder="Search products by name or code"
                aria-label="Search products"
                autoComplete="off"
                spellCheck={false}
                value={query}
                onChange={(event) => { setQuery(event.target.value); setPage(1); }}
                onKeyDown={(event) => { if (event.key === 'Escape') setQuery(''); }}
              />
              {query ? null : <kbd className="smplfy-dr3-kbd" aria-hidden="true">/</kbd>}
            </div>
            <div className="smplfy-dr3-toolbar-filters">
              <div className="smplfy-dr3-filter">
                <SearchSelectFilter
                  id="dr3-filter-category"
                  value={filters.sampleCategory}
                  options={SAMPLE_CATEGORIES}
                  placeholder="All categories"
                  ariaLabel="Filter by category"
                  isOpen={openFilter === 'sampleCategory'}
                  onOpenChange={(next) => setOpenFilter(next ? 'sampleCategory' : null)}
                  onChange={(values) => setFilter('sampleCategory', values)}
                />
              </div>
              <div className="smplfy-dr3-filter">
                <SearchSelectFilter
                  id="dr3-filter-discipline"
                  value={filters.discipline}
                  options={DISCIPLINES}
                  placeholder="All disciplines"
                  ariaLabel="Filter by discipline"
                  isOpen={openFilter === 'discipline'}
                  onOpenChange={(next) => setOpenFilter(next ? 'discipline' : null)}
                  onChange={(values) => setFilter('discipline', values)}
                />
              </div>
              <button type="button" className="smplfy-dr-filter-clear" disabled={!filterCount && view === 'all'} onClick={reset}>
                <AppIcon name="close" size={14} stroke={2} />
                <span>Reset</span>
              </button>
            </div>
          </div>

          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div className="smplfy-all-samples-quick-filters nav nav-pills p-1 bg-white border rounded d-inline-flex align-items-center gap-1" role="group" aria-label="Product views">
              {VIEWS.map((entry) => (
                <NavSelector
                  key={entry.key}
                  size="medium"
                  className="text-nowrap"
                  active={view === entry.key}
                  aria-pressed={view === entry.key}
                  onClick={() => { setView(entry.key); setPage(1); }}
                >
                  <span className="d-inline-flex align-items-center gap-2">
                    <span>{entry.label}</span>
                    <span className="smplfy-all-samples-nav-count">{viewCounts[entry.key]}</span>
                  </span>
                </NavSelector>
              ))}
            </div>
            <span className="smplfy-dr3-totals text-secondary">
              {plural(rows.length, 'product')} · {plural(totals, 'rule')}
            </span>
          </div>

          <div className="smplfy-dr-table-wrap smplfy-dr3-table-wrap" ref={superHoverRef}>
            <DataTable className="smplfy-dr-table smplfy-dr3-table">
              <colgroup>
                <col style={{ width: '38%' }} />
                <col style={{ width: '16%' }} />
                <col style={{ width: '16%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '20%' }} />
              </colgroup>
              <thead>
                <tr>
                  {COLUMNS.map((column) => {
                    const active = sort.key === column.key;
                    return (
                      <th
                        key={column.key}
                        scope="col"
                        className={column.numeric ? 'text-end' : undefined}
                        aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                      >
                        <button type="button" className={`smplfy-dr3-sort${active ? ' is-active' : ''}`} onClick={() => toggleSort(column.key)}>
                          <span>{column.label}</span>
                          <AppIcon name={active && sort.dir === 'desc' ? 'chevron-down' : 'chevron-up'} size={14} stroke={2} />
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {pageRows.length ? pageRows.map((row) => (
                  <tr key={row.id} data-super-hover className="smplfy-dr-row smplfy-dr3-row" onClick={() => open(row)}>
                    <td>
                      <div className="smplfy-dr3-product">
                        <button
                          type="button"
                          className="smplfy-dr3-product-name"
                          onClick={(event) => { event.stopPropagation(); open(row); }}
                        >
                          <Highlight text={row.name} query={query} />
                        </button>
                        <span className="smplfy-dr3-product-code"><Highlight text={row.code} query={query} /></span>
                      </div>
                    </td>
                    <td>{row.sampleCategory}</td>
                    <td>{row.discipline}</td>
                    <td className="text-end">
                      <span className="smplfy-dr3-count">{row.ruleCount}</span>
                    </td>
                    <td>
                      <div className="smplfy-dr3-updated">
                        <span>{fullDate(row.updatedOn)}</span>
                      </div>
                      <AppIcon name="chevron-right" size={16} className="smplfy-dr3-row-chevron" aria-hidden="true" />
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={COLUMNS.length} className="py-5">
                      <div className="smplfy-dr-empty">
                        <div className="smplfy-dr-empty-text text-secondary">
                          {needle ? `No products match “${query.trim()}”.` : 'No products in this view.'}
                        </div>
                        {filterCount || view !== 'all' ? (
                          <SecondaryButton size="medium" onClick={reset}>Clear search and filters</SecondaryButton>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </DataTable>
          </div>

          <TableFooter
            label="Product pages"
            summary={summary}
            page={currentPage}
            pageCount={pageCount}
            onPage={setPage}
            pageSize={pageSize}
            pageSizes={PAGE_SIZES}
            onPageSize={(size) => { setPageSize(size); setPage(1); }}
          />
        </div>
      </main>
    </AppChrome>
  );
}
