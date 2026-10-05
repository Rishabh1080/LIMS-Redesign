import { useEffect, useMemo, useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import DataTable from '../components/DataTable';
import { FormElement } from '../components/FormControls';
import NavSelector from '../components/NavSelector/NavSelector';
import ParameterCircles from '../components/ParameterCircles/ParameterCircles';
import SecondaryButton from '../components/SecondaryButton';
import {
  allInwardSamplesDb,
  countApprovedParameters,
  getInwardById,
  parseDisplayDate,
  toParameterCircles,
} from '../data/inwardsDb';
import './all-samples-listing-page.scss';
import './all-products-page.scss';

/*
 * All samples listing.
 *
 * One row per sample. A sample is one product of an inward, so both identifiers
 * are on the row and both link out: the sample id to the sample, the inward id
 * to the consignment it arrived in. Progress is the sample's testing parameters,
 * so a row with more parameters has more to complete.
 */

const samples = allInwardSamplesDb;

const PAGE_SIZE_OPTIONS = [10, 25, 50];

const quickFilterOptions = [
  { key: 'all', label: 'All', days: null },
  { key: 'today', label: 'Today', days: 0 },
  { key: 'last-7', label: 'Last 7 days', days: 7 },
  { key: 'last-30', label: 'Last 30 days', days: 30 },
];

const emptyFilters = {
  category: '',
  status: '',
  customerName: '',
  receivedDate: '',
};

const uniqueSorted = (values) => [...new Set(values)].sort();

const filterConfig = [
  {
    key: 'category',
    label: 'Category',
    type: 'dropdown',
    placeholder: 'All categories',
    options: uniqueSorted(samples.map((sample) => sample.category)),
  },
  {
    key: 'status',
    label: 'Status',
    type: 'dropdown',
    placeholder: 'All statuses',
    options: uniqueSorted(samples.map((sample) => sample.status)),
  },
  {
    key: 'customerName',
    label: 'Customer',
    type: 'text',
    placeholder: 'Search customer',
  },
  {
    key: 'receivedDate',
    label: 'Received Date',
    type: 'date',
    placeholder: 'DD/MM/YYYY',
  },
];

// Midnight today, so "Today" means the calendar day rather than the last 24 hours.
function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function matchesQuickFilter(sample, filterKey) {
  const option = quickFilterOptions.find((entry) => entry.key === filterKey);
  if (!option || option.days === null) return true;

  const received = parseDisplayDate(sample.receivedDate);
  if (!received) return false;

  const today = startOfToday();
  const earliest = new Date(today);
  earliest.setDate(earliest.getDate() - option.days);

  return received >= earliest && received <= today;
}

function matchesFilters(sample, filters) {
  if (filters.category && sample.category !== filters.category) return false;
  if (filters.status && sample.status !== filters.status) return false;
  if (filters.receivedDate && sample.receivedDate !== filters.receivedDate) return false;
  if (filters.customerName
    && !sample.customerName.toLowerCase().includes(filters.customerName.toLowerCase())) return false;

  return true;
}

function matchesSearch(sample, query) {
  if (!query) return true;

  return [
    sample.id,
    sample.inwardId,
    sample.productName,
    sample.category,
    sample.customerName,
    sample.createdOn,
    sample.status,
  ]
    .join(' ')
    .toLowerCase()
    .includes(query);
}

function ListingSearch({ searchValue, onSearchChange, onOpenFilters, activeFilterCount }) {
  return (
    <section className="smplfy-all-samples-search bg-white">
      <div className="container-fluid px-4">
        <div className="row h-100 align-items-center gx-3">
          <div className="col-xl-5 col-lg-6 col-12">
            <div className="input-group flex-nowrap">
              <span className="input-group-text text-secondary">
                <AppIcon name="search" />
              </span>
              <input
                className="smplfy-form-control form-control"
                type="text"
                value={searchValue}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search in All samples"
                aria-label="Search samples"
              />
              <button className="smplfy-btn btn btn-primary" aria-label="Search samples">
                <AppIcon name="chevron-right" />
              </button>
            </div>
          </div>
          <div className="col-auto">
            <button
              type="button"
              className="smplfy-btn btn btn-link text-secondary text-decoration-none border-0 bg-transparent shadow-none"
              onClick={onOpenFilters}
            >
              <AppIcon name="filter" />
              <span>All Filters{activeFilterCount ? ` (${activeFilterCount})` : ''}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function QuickFilters({ activeFilter, counts, onFilterChange }) {
  return (
    <div className="smplfy-all-samples-quick-filters nav nav-pills p-1 bg-white border rounded d-inline-flex align-items-center flex-wrap gap-1 mb-3">
      {quickFilterOptions.map((option) => (
        <NavSelector
          key={option.key}
          size="medium"
          className="text-nowrap"
          active={activeFilter === option.key}
          onClick={() => onFilterChange(option.key)}
        >
          <span className="d-inline-flex align-items-center gap-2">
            <span>{option.label}</span>
            <span className="smplfy-all-samples-nav-count">{counts[option.key] ?? 0}</span>
          </span>
        </NavSelector>
      ))}
    </div>
  );
}

function ActiveFilterPills({ appliedFilters, onRemoveFilter }) {
  const activeEntries = filterConfig
    .map((filter) => ({ ...filter, value: appliedFilters[filter.key] }))
    .filter((filter) => Boolean(filter.value));

  if (!activeEntries.length) return null;

  return (
    <div className="d-flex flex-wrap gap-2 mb-3">
      {activeEntries.map((filter) => (
        <div
          className="smplfy-badge badge text-secondary bg-white border border-secondary-subtle d-inline-flex align-items-center gap-2"
          key={filter.key}
        >
          <span>{`${filter.label}: ${filter.value}`}</span>
          <button
            type="button"
            className="btn-close"
            aria-label={`Remove ${filter.label} filter`}
            onClick={() => onRemoveFilter(filter.key)}
          />
        </div>
      ))}
    </div>
  );
}

function FiltersDrawer({ open, draftFilters, onChange, onApply, onClear, onCancel }) {
  if (!open) return null;

  return (
    <>
      <div className="offcanvas-backdrop fade show" onClick={onCancel} />
      <aside
        className="smplfy-all-samples-offcanvas offcanvas offcanvas-end show"
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
        aria-labelledby="all-samples-table-filters-title"
      >
        <div className="offcanvas-header border-bottom">
          <h2 className="offcanvas-title h5 mb-0" id="all-samples-table-filters-title">All Filters</h2>
          <button type="button" className="btn-close" aria-label="Close filters" onClick={onCancel} />
        </div>

        <div className="offcanvas-body d-flex flex-column gap-3">
          {filterConfig.map((filter) => (
            <FormElement
              key={filter.key}
              type={filter.type}
              label={filter.label}
              inputProps={{
                state: draftFilters[filter.key] ? 'filled' : 'default',
                value: draftFilters[filter.key],
                placeholder: filter.placeholder,
                options: filter.options,
                onChange: (event) => onChange(filter.key, event.target.value),
              }}
            />
          ))}
        </div>

        <div className="d-flex justify-content-between gap-3 border-top">
          <SecondaryButton onClick={onClear}>Clear all</SecondaryButton>
          <button type="button" className="smplfy-btn btn btn-primary" onClick={onApply}>
            Apply
          </button>
        </div>
      </aside>
    </>
  );
}

/*
 * Testing progress for one sample: a circle per parameter, coloured by its
 * status, plus the approved count so the row is still readable without hovering.
 */
function SampleProgress({ parameters }) {
  const total = parameters.length;
  const approved = countApprovedParameters(parameters);

  if (!total) {
    return <span className="text-secondary">No parameters</span>;
  }

  return (
    <div className="smplfy-sample-progress">
      <ParameterCircles
        parameters={toParameterCircles(parameters)}
        className="flex-nowrap overflow-visible"
      />
      <span className="smplfy-sample-progress-count text-secondary text-nowrap">
        {approved}/{total} Approved
      </span>
    </div>
  );
}

function Pagination({ page, pageCount, pageSize, totalCount, rangeStart, rangeEnd, onPageChange, onPageSizeChange }) {
  // Windowed page numbers so a long list does not produce a runaway control.
  const pageNumbers = useMemo(() => {
    const windowSize = 5;
    let start = Math.max(1, page - Math.floor(windowSize / 2));
    const end = Math.min(pageCount, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [page, pageCount]);

  return (
    <div className="smplfy-inward-pagination">
      <div className="smplfy-inward-pagination-summary">
        {totalCount
          ? `Showing ${rangeStart}\u2013${rangeEnd} of ${totalCount}`
          : 'No samples to show'}
      </div>

      <div className="smplfy-inward-pagination-controls">
        <label className="smplfy-inward-pagination-size">
          <span>Rows per page</span>
          <select
            className="form-select form-select-sm"
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </label>

        <nav aria-label="All samples pages">
          <ul className="pagination pagination-sm mb-0">
            <li className={`page-item${page === 1 ? ' disabled' : ''}`}>
              <button
                type="button"
                className="page-link"
                aria-label="Previous page"
                disabled={page === 1}
                onClick={() => onPageChange(page - 1)}
              >
                <AppIcon name="chevron-left" size={16} stroke={2} />
              </button>
            </li>
            {pageNumbers.map((pageNumber) => (
              <li className={`page-item${pageNumber === page ? ' active' : ''}`} key={pageNumber}>
                <button
                  type="button"
                  className="page-link"
                  aria-label={`Page ${pageNumber}`}
                  aria-current={pageNumber === page ? 'page' : undefined}
                  onClick={() => onPageChange(pageNumber)}
                >
                  {pageNumber}
                </button>
              </li>
            ))}
            <li className={`page-item${page >= pageCount ? ' disabled' : ''}`}>
              <button
                type="button"
                className="page-link"
                aria-label="Next page"
                disabled={page >= pageCount}
                onClick={() => onPageChange(page + 1)}
              >
                <AppIcon name="chevron-right" size={16} stroke={2} />
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default function AllSamplesTablePage({
  onNavigate,
  onOpenSample,
  onOpenInward,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  sidebarBadgeCounts,
}) {
  const [searchValue, setSearchValue] = useState('');
  const [quickFilter, setQuickFilter] = useState('all');
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);
  const [draftFilters, setDraftFilters] = useState(emptyFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [page, setPage] = useState(1);

  const normalizedQuery = searchValue.trim().toLowerCase();

  // Each pill reports how many rows it would show under the current search and
  // filters, so the counts stay meaningful as the view narrows.
  const quickFilterCounts = useMemo(() => {
    const base = samples.filter(
      (sample) => matchesSearch(sample, normalizedQuery) && matchesFilters(sample, appliedFilters),
    );

    return quickFilterOptions.reduce((counts, option) => {
      counts[option.key] = base.filter((sample) => matchesQuickFilter(sample, option.key)).length;
      return counts;
    }, {});
  }, [normalizedQuery, appliedFilters]);

  const filteredSamples = useMemo(
    () => samples.filter((sample) => (
      matchesSearch(sample, normalizedQuery)
      && matchesFilters(sample, appliedFilters)
      && matchesQuickFilter(sample, quickFilter)
    )),
    [normalizedQuery, appliedFilters, quickFilter],
  );

  const totalCount = filteredSamples.length;
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));

  // Narrowing the results can strand the viewer past the last page.
  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const visibleSamples = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredSamples.slice(start, start + pageSize);
  }, [filteredSamples, page, pageSize]);

  const activeFilterCount = Object.values(appliedFilters).filter(Boolean).length;
  const rangeStart = totalCount ? (page - 1) * pageSize + 1 : 0;
  const rangeEnd = Math.min(page * pageSize, totalCount);

  const applyFilters = (nextFilters) => {
    setAppliedFilters(nextFilters);
    setDraftFilters(nextFilters);
    setPage(1);
  };

  const openInward = (inwardId) => {
    const inward = getInwardById(inwardId);
    if (inward) onOpenInward?.(inward);
  };

  return (
    <AppChrome
      activeNav="all-samples-table"
      onNavigate={onNavigate}
      breadcrumbs={[{ key: 'all-samples-table', label: 'All samples', current: true }]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      sidebarBadgeCounts={sidebarBadgeCounts}
      pageHeader={
        <ListingSearch
          searchValue={searchValue}
          activeFilterCount={activeFilterCount}
          onSearchChange={(value) => {
            setSearchValue(value);
            setPage(1);
          }}
          onOpenFilters={() => {
            setDraftFilters(appliedFilters);
            setFiltersOpen(true);
          }}
        />
      }
    >
      <main className="smplfy-all-products-page bg-body-tertiary flex-grow-1">
        <div className="container-fluid px-4">
          <div className="pt-4 pb-4">
            <QuickFilters
              activeFilter={quickFilter}
              counts={quickFilterCounts}
              onFilterChange={(key) => {
                setQuickFilter(key);
                setPage(1);
              }}
            />

            <ActiveFilterPills
              appliedFilters={appliedFilters}
              onRemoveFilter={(filterKey) => applyFilters({ ...appliedFilters, [filterKey]: '' })}
            />

            {visibleSamples.length ? (
              <>
                <DataTable>
                  <thead>
                    <tr>
                      <th scope="col">Sample ID</th>
                      <th scope="col">Inward ID</th>
                      <th scope="col">Created</th>
                      <th scope="col">Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleSamples.map((sample) => (
                      <tr key={sample.id}>
                        <td>
                          <button
                            type="button"
                            className="smplfy-link link-primary btn btn-link p-0 text-start text-decoration-none"
                            onClick={() => onOpenSample?.({ sampleId: sample.id })}
                          >
                            {sample.id}
                          </button>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="smplfy-link link-primary btn btn-link p-0 text-start text-decoration-none"
                            onClick={() => openInward(sample.inwardId)}
                          >
                            {sample.inwardId}
                          </button>
                        </td>
                        <td className="text-nowrap">{sample.createdOn}</td>
                        <td>
                          <SampleProgress parameters={sample.parameters} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </DataTable>

                <Pagination
                  page={page}
                  pageCount={pageCount}
                  pageSize={pageSize}
                  totalCount={totalCount}
                  rangeStart={rangeStart}
                  rangeEnd={rangeEnd}
                  onPageChange={setPage}
                  onPageSizeChange={(size) => {
                    setPageSize(size);
                    setPage(1);
                  }}
                />
              </>
            ) : (
              <div className="smplfy-card card">
                <div className="card-body d-flex align-items-center justify-content-center text-secondary fw-medium">
                  No samples found for this view.
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <FiltersDrawer
        open={filtersOpen}
        draftFilters={draftFilters}
        onChange={(key, value) => setDraftFilters((current) => ({ ...current, [key]: value }))}
        onApply={() => {
          applyFilters(draftFilters);
          setFiltersOpen(false);
        }}
        onClear={() => {
          applyFilters(emptyFilters);
          setFiltersOpen(false);
        }}
        onCancel={() => {
          setDraftFilters(appliedFilters);
          setFiltersOpen(false);
        }}
      />
    </AppChrome>
  );
}
