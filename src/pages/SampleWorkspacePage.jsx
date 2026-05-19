import { useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import SampleCard, { SampleCardViewToggle } from '../components/SampleCard/SampleCard';
import { sampleCards } from '../sampleWorkspaceData';
import '../styles.scss';
import './sample-workspace-page.scss';

const filterConfig = [
  {
    key: 'status',
    label: 'Status',
    type: 'dropdown',
    placeholder: 'Select status',
    options: ['Pending', 'Completed', 'Under Analysis'],
  },
  {
    key: 'requestMode',
    label: 'Request Mode',
    type: 'dropdown',
    placeholder: 'Select request mode',
    options: ['Online', 'Pickup'],
  },
  {
    key: 'representative',
    label: 'Customer Representative',
    type: 'text',
    placeholder: 'Search representative',
  },
  {
    key: 'reference',
    label: 'Reference',
    type: 'text',
    placeholder: 'Search reference',
  },
  {
    key: 'createdOn',
    label: 'Created On',
    type: 'date',
    placeholder: 'Select created date',
  },
  {
    key: 'reportingDate',
    label: 'Reporting Date',
    type: 'date',
    placeholder: 'Select reporting date',
  },
];

const initialFilters = {
  status: '',
  requestMode: '',
  representative: '',
  reference: '',
  createdOn: '',
  reportingDate: '',
};

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

function PageHeader({ onNewSample }) {
  return (
    <div className="page-header">
      <div className="container-fluid h-100">
        <div className="row h-100 align-items-center justify-content-between gx-0">
          <div className="col-auto">
            <h1 className="page-title mb-0">Samples Workspace</h1>
          </div>
          <div className="col-auto">
            <PrimaryButton leftIcon="plus" onClick={onNewSample}>
              New Sample
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function getDateOnly(value) {
  const normalizedValue = String(value ?? '').trim();

  if (!normalizedValue) {
    return '';
  }

  return normalizedValue.split(',')[0]?.trim() ?? normalizedValue;
}

function SearchHero({ searchValue, onSearchChange, onOpenFilters, appliedFilters, onRemoveFilter }) {
  const activeEntries = filterConfig
    .map((filter) => ({ ...filter, value: appliedFilters[filter.key] }))
    .filter((filter) => Boolean(filter.value));

  return (
    <section className="smplfy-sample-search">
      <div className="container-fluid px-4">
        <div className="row justify-content-center">
          <div className="col-12">
            <div className="row smplfy-sample-search-row justify-content-center align-items-center g-3">
              <div className="col-lg-6 col-xl-5">
                <div className="smplfy-sample-search-group input-group">
                  <span className="input-group-text">
                    <AppIcon name="search" />
                  </span>
                  <input
                    className="smplfy-form-control form-control"
                    type="text"
                    value={searchValue}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="Search Samples"
                  />
                  <button className="smplfy-btn btn btn-primary" aria-label="Search samples">
                    <AppIcon name="chevron-right" />
                  </button>
                </div>
              </div>
              <div className="col-auto">
                <button
                  className="smplfy-btn btn btn-link text-secondary text-decoration-none border-0 bg-transparent shadow-none"
                  onClick={onOpenFilters}
                >
                  <AppIcon name="filter" />
                  <span>All Filters</span>
                </button>
              </div>
            </div>

            {activeEntries.length ? (
              <div className="smplfy-sample-filter-list">
                <div className="d-flex flex-wrap align-items-center gap-3">
                  {activeEntries.map((filter) => (
                    <div className="smplfy-badge badge text-secondary bg-white border border-secondary-subtle" key={filter.key}>
                      <span>{`${filter.label}: ${filter.value}`}</span>
                      <button
                        className="btn-close"
                        aria-label={`Remove ${filter.label} filter`}
                        onClick={() => onRemoveFilter(filter.key)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function FilterControl({ filter, value, onChange }) {
  const controlId = `sample-filter-${filter.key}`;

  return (
    <div className="smplfy-form-field">
      <label className="smplfy-form-label form-label" htmlFor={controlId}>
        {filter.label}
      </label>
      {filter.type === 'dropdown' ? (
        <select
          id={controlId}
          className="smplfy-form-select form-select"
          value={value}
          onChange={(event) => onChange(filter.key, event.target.value)}
        >
          <option value="">{filter.placeholder}</option>
          {filter.options.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      ) : (
        <input
          id={controlId}
          className="smplfy-form-control form-control"
          type={filter.type === 'date' ? 'date' : 'text'}
          value={value}
          placeholder={filter.type === 'date' ? undefined : filter.placeholder}
          onChange={(event) => onChange(filter.key, event.target.value)}
        />
      )}
    </div>
  );
}

function FiltersDrawer({ open, draftFilters, onChange, onApply, onCancel }) {
  return (
    <>
      <div className={joinClasses('smplfy-offcanvas-backdrop', 'offcanvas-backdrop', 'fade', open ? 'show' : '')} onClick={onCancel} />
      <aside
        className={joinClasses('smplfy-offcanvas', 'offcanvas', 'offcanvas-end', open ? 'show' : '')}
        tabIndex={-1}
        aria-hidden={open ? undefined : 'true'}
        aria-modal={open ? 'true' : undefined}
        aria-labelledby="sample-filters-title"
      >
        <div className="offcanvas-header">
          <h2 id="sample-filters-title" className="offcanvas-title">All Filters</h2>
          <button className="btn-close" aria-label="Close filters" onClick={onCancel} />
        </div>

        <div className="offcanvas-body">
          {filterConfig.map((filter) => (
            <FilterControl
              key={filter.key}
              filter={filter}
              value={draftFilters[filter.key]}
              onChange={onChange}
            />
          ))}
        </div>

        <div className="smplfy-offcanvas-footer">
          <SecondaryButton onClick={onCancel}>
            Cancel
          </SecondaryButton>
          <button className="smplfy-btn btn btn-primary" onClick={onApply}>
            Apply
          </button>
        </div>
      </aside>
    </>
  );
}

function SamplesPanel({
  samples,
  hasActiveQuery,
  onOpenSample,
  onEditSample,
  onResetSearch,
  viewMode,
  onViewModeChange,
}) {
  const title = hasActiveQuery ? `${samples.length} results found` : 'Recent samples';

  return (
    <section className="smplfy-samples-panel">
      <div className="container-fluid px-0">
        <div className="row align-items-center justify-content-between gx-0 gap-3 pb-2">
          <div className="col-auto d-flex align-items-center gap-3 flex-wrap">
            <h2 className="mb-0">{title}</h2>
            <SampleCardViewToggle value={viewMode} onChange={onViewModeChange} />
          </div>
          <div className="col-auto">
            <button className="smplfy-btn btn btn-link p-0" onClick={onResetSearch}>
              Clear all
            </button>
          </div>
        </div>

        <div className="row g-3 mt-0">
          {samples.map((sample, index) => (
            <div className="col-12" key={`${sample.id}-${index}`}>
              <SampleCard
                sample={sample}
                onOpenSample={onOpenSample}
                onEditSample={onEditSample}
                sourcePage="samples-workspace"
                viewMode={viewMode}
                extraMetaFields={sample.extraMetaFields}
                extraDateFields={sample.extraDateFields}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function SampleWorkspacePage({
  onNewSample,
  onOpenSample,
  onEditSample,
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  sampleCardViewMode,
  onSampleCardViewModeChange,
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [searchValue, setSearchValue] = useState('');

  const handleOpenFilters = () => {
    setDraftFilters(appliedFilters);
    setFiltersOpen(true);
  };

  const handleCloseFilters = () => {
    setDraftFilters(appliedFilters);
    setFiltersOpen(false);
  };

  const handleApplyFilters = () => {
    setAppliedFilters(draftFilters);
    setFiltersOpen(false);
  };

  const normalizedSearchValue = searchValue.trim().toLowerCase();
  const hasActiveFilters = Object.values(appliedFilters).some(Boolean);
  const hasActiveQuery = Boolean(normalizedSearchValue) || hasActiveFilters;

  const filteredSamples = sampleCards.filter((sample) => {
    const matchesSearch =
      !normalizedSearchValue ||
      [
        sample.id,
        sample.representative,
        sample.reference,
        sample.requestMode,
        sample.status,
      ].some((value) => String(value ?? '').toLowerCase().includes(normalizedSearchValue));

    const matchesFilters = filterConfig.every((filter) => {
      const appliedValue = appliedFilters[filter.key];

      if (!appliedValue) {
        return true;
      }

      if (filter.key === 'createdOn' || filter.key === 'reportingDate') {
        return getDateOnly(sample[filter.key]) === appliedValue;
      }

      return String(sample[filter.key] ?? '').toLowerCase().includes(String(appliedValue).toLowerCase());
    });

    return matchesSearch && matchesFilters;
  });

  return (
    <AppChrome
      activeNav="samples-workspace"
      onNavigate={onNavigate}
      breadcrumbs={[{ key: 'samples-workspace', label: 'Samples Workspace', current: true }]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      pageHeader={<PageHeader onNewSample={onNewSample} />}
    >
      <main className="d-flex flex-column">
        <SearchHero
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onOpenFilters={handleOpenFilters}
          appliedFilters={appliedFilters}
          onRemoveFilter={(key) => {
            const nextFilters = { ...appliedFilters, [key]: '' };
            setAppliedFilters(nextFilters);
            setDraftFilters(nextFilters);
          }}
        />
        <SamplesPanel
          samples={filteredSamples}
          hasActiveQuery={hasActiveQuery}
          onOpenSample={onOpenSample}
          onEditSample={onEditSample}
          viewMode={sampleCardViewMode}
          onViewModeChange={onSampleCardViewModeChange}
          onResetSearch={() => {
            setSearchValue('');
            setAppliedFilters(initialFilters);
            setDraftFilters(initialFilters);
          }}
        />
      </main>

      <FiltersDrawer
        open={filtersOpen}
        draftFilters={draftFilters}
        onChange={(key, value) => setDraftFilters((current) => ({ ...current, [key]: value }))}
        onApply={handleApplyFilters}
        onCancel={handleCloseFilters}
      />
    </AppChrome>
  );
}
