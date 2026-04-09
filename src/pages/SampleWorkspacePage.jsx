import { useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import { FormElement } from '../components/FormControls';
import ParameterCircles from '../components/ParameterCircles';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import StatusPill from '../components/StatusPill';
import { sampleCards } from '../sampleWorkspaceData';
import '../styles.css';
import './sample-workspace-page.css';

const sampleStatusVariantMap = {
  success: { color: 'green', styleType: 'strong' },
  warning: { color: 'orange', styleType: 'neutral' },
  pending: { color: 'blue', styleType: 'neutral' },
};

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
    <section className="search-hero">
      <div className="container-fluid px-4">
        <div className="row justify-content-center">
          <div className="col-12">
            <div className="row search-row justify-content-center align-items-center g-3">
              <div className="col-lg-6 col-xl-5">
                <div className="search-shell d-flex align-items-center">
                  <div className="search-field d-flex align-items-center flex-grow-1">
                    <AppIcon name="search" />
                    <input
                      className="workspace-search-input"
                      type="text"
                      value={searchValue}
                      onChange={(event) => onSearchChange(event.target.value)}
                      placeholder="Search Samples"
                    />
                  </div>
                  <button className="btn search-submit" aria-label="Search samples">
                    <AppIcon name="chevron-right" />
                  </button>
                </div>
              </div>
              <div className="col-auto">
                <button className="btn filter-trigger" onClick={onOpenFilters}>
                  <AppIcon name="filter" />
                  <span>All Filters</span>
                </button>
              </div>
            </div>

            {activeEntries.length ? (
              <div className="workspace-filters-applied">
                <div className="workspace-filters-applied__inner">
                  {activeEntries.map((filter) => (
                    <div className="workspace-filter-pill" key={filter.key}>
                      <span>{`${filter.label}: ${filter.value}`}</span>
                      <button
                        className="btn workspace-filter-pill__close"
                        aria-label={`Remove ${filter.label} filter`}
                        onClick={() => onRemoveFilter(filter.key)}
                      >
                        <AppIcon name="close" />
                      </button>
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

function FiltersDrawer({ open, draftFilters, onChange, onApply, onCancel }) {
  return (
    <>
      <div className={`workspace-filters-backdrop ${open ? 'is-visible' : ''}`} onClick={onCancel} />
      <aside className={`workspace-filters-drawer ${open ? 'is-open' : ''}`}>
        <div className="workspace-filters-drawer__header">
          <h2>All Filters</h2>
          <button className="btn workspace-filters-drawer__close" aria-label="Close filters" onClick={onCancel}>
            <AppIcon name="close" />
          </button>
        </div>

        <div className="workspace-filters-drawer__body">
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

        <div className="workspace-filters-drawer__footer">
          <SecondaryButton className="workspace-filters-drawer__cancel" onClick={onCancel}>
            Cancel
          </SecondaryButton>
          <button className="btn workspace-filters-drawer__apply" onClick={onApply}>
            Apply
          </button>
        </div>
      </aside>
    </>
  );
}

function SampleCard({ sample, onOpenSample }) {
  const isOpenable = sample.status === 'Under Analysis' || sample.status === 'Pending';
  const metaRows = [
    [
      { label: 'Reference', value: sample.reference },
      { label: 'Request Mode', value: sample.requestMode },
    ],
    ...(sample.extraMetaFields?.length ? [sample.extraMetaFields] : []),
  ];
  const dateRows = [
    [{ label: 'Reporting Date', value: sample.reportingDate }],
    ...(sample.extraDateFields?.length ? [sample.extraDateFields] : []),
  ];

  return (
    <article className="sample-card">
      <div className="row g-0 align-items-stretch">
        <div className="col-xl-3 col-lg-4">
          <div className="sample-column sample-primary h-100">
            <div className="sample-primary-header">
              {isOpenable ? (
                <a
                  href="/"
                  onClick={(event) => {
                    event.preventDefault();
                    onOpenSample?.(sample.id, {
                      sourcePage: 'samples-workspace',
                      sampleStatus: sample.status,
                      createdOn: sample.createdOn,
                    });
                  }}
                  className="sample-id"
                >
                  {sample.id}
                </a>
              ) : (
                <span className="sample-id">{sample.id}</span>
              )}
              <StatusPill
                className="status-badge"
                color={(sampleStatusVariantMap[sample.statusTone] ?? sampleStatusVariantMap.pending).color}
                styleType={(sampleStatusVariantMap[sample.statusTone] ?? sampleStatusVariantMap.pending).styleType}
              >
                {sample.status}
              </StatusPill>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-lg-4">
          <div className="sample-column sample-meta h-100 sample-divider">
            <div className="sample-details-stack">
              <div className="meta-block">
                <div className="meta-label">Customer Representative</div>
                <div className="meta-value">{sample.representative}</div>
              </div>

              {metaRows.map((row, rowIndex) => (
                <div className="sample-details-row" key={`meta-row-${sample.id}-${rowIndex}`}>
                  {row.map((item) => (
                    <div className={row.length === 1 ? 'sample-details-cell is-full' : 'sample-details-cell'} key={item.label}>
                      <div className="meta-block">
                        <div className="meta-label">{item.label}</div>
                        <div className="meta-value">{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-lg-4">
          <div className="sample-column sample-dates h-100 sample-divider">
            <div className="sample-details-stack">
              <div className="meta-block">
                <div className="meta-label">Created on</div>
                <div className="meta-value">{sample.createdOn}</div>
              </div>
              {dateRows.map((row, rowIndex) => (
                <div className="sample-details-row" key={`date-row-${sample.id}-${rowIndex}`}>
                  {row.map((item) => (
                    <div className={row.length === 1 ? 'sample-details-cell is-full' : 'sample-details-cell'} key={item.label}>
                      <div className="meta-block">
                        <div className="meta-label">{item.label}</div>
                        <div className="meta-value">{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-12">
          <div className="sample-column sample-parameters h-100 sample-divider">
            <div className="meta-label">Parameters</div>
            <ParameterCircles parameters={sample.parameters} />
          </div>
        </div>
      </div>
    </article>
  );
}

function SamplesPanel({ samples, hasActiveQuery, onOpenSample, onResetSearch }) {
  const title = hasActiveQuery ? `${samples.length} results found` : 'Recent samples';

  return (
    <section className="samples-panel">
      <div className="container-fluid px-0">
        <div className="row align-items-center justify-content-between gx-0 panel-header">
          <div className="col-auto">
            <div className="panel-title">{title}</div>
          </div>
          <div className="col-auto">
            <button className="btn clear-link" onClick={onResetSearch}>
              Clear all
            </button>
          </div>
        </div>

        <div className="row g-3 mt-0">
          {samples.map((sample, index) => (
            <div className="col-12" key={`${sample.id}-${index}`}>
              <SampleCard sample={sample} onOpenSample={onOpenSample} />
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
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
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
      <main className="page-body">
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
