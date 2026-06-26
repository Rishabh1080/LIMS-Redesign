import { useMemo, useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import { FormElement } from '../components/FormControls';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import { reportItems } from '../data/reportsData';
import './environment-data-page.scss';
import './reports-page.scss';

const reportFilterConfig = [
  {
    key: 'type',
    label: 'Type',
    placeholder: 'Select type',
    options: ['Testing', 'Monitoring', 'Checks', 'Reference'],
  },
];

function ReportsHeader() {
  return (
    <section className="bg-white border-bottom px-4 py-3">
      <div className="container-fluid px-0">
        <div className="row align-items-center gx-0">
          <div className="col-auto">
            <h1 className="h5 mb-0 fw-semibold text-dark">Reports</h1>
          </div>
        </div>
      </div>
    </section>
  );
}

function ReportsToolbar({
  searchInputValue,
  appliedSearchValue,
  appliedFilters,
  resultCount,
  onSearchInputChange,
  onSearchSubmit,
  onOpenFilters,
  onRemoveSearch,
  onRemoveFilter,
}) {
  const activeFilters = reportFilterConfig
    .map((filter) => ({ ...filter, value: appliedFilters[filter.key] }))
    .filter((filter) => Boolean(filter.value));
  const trimmedSearchValue = appliedSearchValue.trim();
  const resultLabel = trimmedSearchValue
    ? `${resultCount} ${resultCount === 1 ? 'result' : 'results'} found for "${trimmedSearchValue}"`
    : activeFilters.length
      ? `${resultCount} ${resultCount === 1 ? 'result' : 'results'} found`
      : `Listing ${resultCount} ${resultCount === 1 ? 'report' : 'reports'}`;
  const displayedFilters = trimmedSearchValue
    ? [
        {
          key: 'search',
          label: 'Search',
          value: trimmedSearchValue,
          onRemove: onRemoveSearch,
        },
        ...activeFilters,
      ]
    : activeFilters;

  return (
    <section className="d-flex flex-column gap-4 pb-4">
      <div className="d-flex flex-column gap-2">
        <form
          className="row align-items-center gx-3 gy-2"
          onSubmit={(event) => {
            event.preventDefault();
            onSearchSubmit();
          }}
        >
          <div className="col-12 col-lg-5">
            <div className="input-group flex-nowrap bg-white border rounded overflow-hidden">
              <span className="input-group-text text-secondary bg-white">
                <AppIcon name="search" />
              </span>
              <input
                className="smplfy-form-control form-control"
                type="search"
                value={searchInputValue}
                placeholder="Search reports"
                onChange={(event) => onSearchInputChange(event.target.value)}
              />
              <button type="submit" className="smplfy-btn btn btn-primary" aria-label="Search reports">
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
              <span>All Filters</span>
            </button>
          </div>
        </form>

        {displayedFilters.length ? (
          <div className="d-flex flex-wrap align-items-center gap-2">
            {displayedFilters.map((filter) => (
              <div
                className="smplfy-badge badge text-secondary bg-white border border-secondary-subtle d-inline-flex align-items-center gap-2"
                key={filter.key}
              >
                <span>{`${filter.label}: ${filter.value}`}</span>
                <button
                  type="button"
                  className="btn-close"
                  aria-label={`Remove ${filter.label} filter`}
                  onClick={() => filter.onRemove?.() ?? onRemoveFilter(filter.key)}
                />
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="small text-secondary fw-medium">{resultLabel}</div>
    </section>
  );
}

function ReportsFiltersDrawer({ open, draftFilters, onChange, onApply, onCancel }) {
  if (!open) {
    return null;
  }

  return (
    <>
      <div className="offcanvas-backdrop fade show" onClick={onCancel} />
      <aside className="smplfy-all-samples-offcanvas offcanvas offcanvas-end show" tabIndex="-1" role="dialog" aria-modal="true" aria-labelledby="reports-filters-title">
        <div className="offcanvas-header border-bottom">
          <h2 className="offcanvas-title h5 mb-0" id="reports-filters-title">All Filters</h2>
          <button type="button" className="btn-close" aria-label="Close filters" onClick={onCancel} />
        </div>

        <div className="offcanvas-body d-flex flex-column gap-3">
          {reportFilterConfig.map((filter) => (
            <FormElement
              key={filter.key}
              type="dropdown"
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
          <SecondaryButton onClick={onCancel}>
            Cancel
          </SecondaryButton>
          <PrimaryButton onClick={onApply}>
            Apply
          </PrimaryButton>
        </div>
      </aside>
    </>
  );
}

export default function ReportsPage({
  reports = reportItems,
  onOpenReport,
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  sidebarBadgeCounts,
}) {
  const [searchInputValue, setSearchInputValue] = useState('');
  const [appliedSearchValue, setAppliedSearchValue] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({ type: '' });
  const [draftFilters, setDraftFilters] = useState(appliedFilters);
  const filteredReports = useMemo(() => {
    const normalizedSearchValue = appliedSearchValue.trim().toLowerCase();

    return reports.filter((report) => {
      const matchesSearch = !normalizedSearchValue
        || report.name.toLowerCase().includes(normalizedSearchValue);
      const matchesType = !appliedFilters.type || report.type === appliedFilters.type;

      return matchesSearch && matchesType;
    });
  }, [appliedFilters, appliedSearchValue, reports]);

  return (
    <AppChrome
      activeNav="reports"
      onNavigate={onNavigate}
      breadcrumbs={[{ key: 'reports', label: 'Reports', current: true }]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      sidebarBadgeCounts={sidebarBadgeCounts}
      pageHeader={<ReportsHeader />}
    >
      <main className="smplfy-environment-data-page bg-body-tertiary p-4 min-vh-100">
        <div className="container-fluid px-0">
          <ReportsToolbar
            searchInputValue={searchInputValue}
            appliedSearchValue={appliedSearchValue}
            appliedFilters={appliedFilters}
            resultCount={filteredReports.length}
            onSearchInputChange={setSearchInputValue}
            onSearchSubmit={() => setAppliedSearchValue(searchInputValue.trim())}
            onOpenFilters={() => {
              setDraftFilters(appliedFilters);
              setFiltersOpen(true);
            }}
            onRemoveSearch={() => {
              setSearchInputValue('');
              setAppliedSearchValue('');
            }}
            onRemoveFilter={(filterKey) => {
              const nextFilters = { ...appliedFilters, [filterKey]: '' };
              setAppliedFilters(nextFilters);
              setDraftFilters(nextFilters);
            }}
          />

          {filteredReports.length ? (
            <div className="smplfy-reports-list">
              {filteredReports.map((report) => (
                <button
                  key={report.id}
                  type="button"
                  className="smplfy-card card smplfy-report-list-card w-100 text-start"
                  onClick={() => onOpenReport?.(report)}
                >
                  <span className="smplfy-report-list-card-title">{report.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="smplfy-card card">
              <div className="card-body text-center text-secondary py-4">
                No reports found.
              </div>
            </div>
          )}
        </div>
      </main>

      <ReportsFiltersDrawer
        open={filtersOpen}
        draftFilters={draftFilters}
        onChange={(key, value) => setDraftFilters((current) => ({ ...current, [key]: value }))}
        onApply={() => {
          setAppliedFilters(draftFilters);
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
