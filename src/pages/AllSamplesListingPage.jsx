import { useMemo, useState } from 'react';
import AppIcon from '../components/AppIcon';
import AppChrome from '../components/AppChrome/AppChrome';
import { FormElement } from '../components/FormControls';
import NavSelector from '../components/NavSelector';
import ParameterCircles from '../components/ParameterCircles';
import SecondaryButton from '../components/SecondaryButton';
import StatusPill from '../components/StatusPill';
import { getSamplesByCategory, sampleCategories } from '../data/samplesDb';
import '../styles.css';
import './all-samples-listing-page.css';

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

function ListingTabs({ activeTab, onTabChange }) {
  const leftTabs = sampleCategories.filter((tab) => tab.group === 'left');
  const rightTabs = sampleCategories.filter((tab) => tab.group === 'right');

  return (
    <section className="all-samples-tabs">
      <div className="container-fluid h-100 px-4">
        <div className="row h-100 gx-0 align-items-stretch flex-nowrap">
          <div className="col">
            <div className="all-samples-tabs__group">
              {leftTabs.map((tab) => (
                <NavSelector
                  key={tab.key}
                  className="all-samples-tabs__item"
                  active={activeTab === tab.key}
                  onClick={() => onTabChange(tab.key)}
                >
                  {tab.label}
                </NavSelector>
              ))}
            </div>
          </div>

          <div className="col-auto ms-auto">
            <div className="all-samples-tabs__group is-right">
              {rightTabs.map((tab) => (
                <NavSelector
                  key={tab.key}
                  className="all-samples-tabs__item"
                  active={activeTab === tab.key}
                  onClick={() => onTabChange(tab.key)}
                >
                  {tab.label}
                </NavSelector>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ListingSearch({ activeTab, searchValue, onSearchChange, onOpenFilters }) {
  const activeCategoryLabel =
    sampleCategories.find((tab) => tab.key === activeTab)?.label ?? 'All Samples';

  return (
    <section className="all-samples-search">
      <div className="container-fluid px-4 h-100">
        <div className="row h-100 align-items-center gx-3">
          <div className="col-xl-5 col-lg-6">
            <div className="all-samples-search__shell">
              <div className="all-samples-search__field">
                <AppIcon name="search" />
                <input
                  className="all-samples-search__input"
                  type="text"
                  value={searchValue}
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder={`Search in ${activeCategoryLabel}`}
                />
              </div>
              <button className="btn all-samples-search__submit" aria-label="Search samples">
                <AppIcon name="chevron-right" />
              </button>
            </div>
          </div>

          <div className="col-auto">
            <button className="btn all-samples-search__filters" onClick={onOpenFilters}>
              <AppIcon name="filter" />
              <span>All Filters</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function ActiveFilterPills({ appliedFilters, onRemoveFilter }) {
  const activeEntries = filterConfig
    .map((filter) => ({ ...filter, value: appliedFilters[filter.key] }))
    .filter((filter) => Boolean(filter.value));

  if (!activeEntries.length) {
    return null;
  }

  return (
    <section className="all-samples-filters-applied">
      <div className="container-fluid px-4">
        <div className="all-samples-filters-applied__inner">
        {activeEntries.map((filter) => (
          <div className="all-samples-filter-pill" key={filter.key}>
            <span>{`${filter.label}: ${filter.value}`}</span>
            <button
              className="btn all-samples-filter-pill__close"
              aria-label={`Remove ${filter.label} filter`}
              onClick={() => onRemoveFilter(filter.key)}
            >
              <AppIcon name="close" />
            </button>
          </div>
        ))}
        </div>
      </div>
    </section>
  );
}

function FiltersDrawer({ open, draftFilters, onChange, onApply, onCancel }) {
  return (
    <>
      <div className={`all-samples-filters-backdrop ${open ? 'is-visible' : ''}`} onClick={onCancel} />
      <aside className={`all-samples-filters-drawer ${open ? 'is-open' : ''}`}>
        <div className="all-samples-filters-drawer__header">
          <h2>All Filters</h2>
          <button className="btn all-samples-filters-drawer__close" aria-label="Close filters" onClick={onCancel}>
            <AppIcon name="close" />
          </button>
        </div>

        <div className="all-samples-filters-drawer__body">
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

        <div className="all-samples-filters-drawer__footer">
          <SecondaryButton className="all-samples-filters-drawer__cancel" onClick={onCancel}>
            Cancel
          </SecondaryButton>
          <button className="btn all-samples-filters-drawer__apply" onClick={onApply}>
            Apply
          </button>
        </div>
      </aside>
    </>
  );
}

function ListingCard({ sample, onOpenSample }) {
  const isOpenable = sample.status === 'Under Analysis' || sample.status === 'Pending';

  return (
    <article className="all-samples-card">
      <div className="row g-0 align-items-stretch">
        <div className="col-xl-3 col-lg-6">
          <div className="all-samples-card__col is-primary">
            {isOpenable ? (
              <a
                href="/"
                onClick={(event) => {
                  event.preventDefault();
                  onOpenSample?.(sample.id, {
                    sourcePage: 'all-samples',
                    sampleStatus: sample.status,
                    createdOn: sample.createdOn,
                  });
                }}
                className="all-samples-card__id"
              >
                {sample.id}
              </a>
            ) : (
              <span className="all-samples-card__id">{sample.id}</span>
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

        <div className="col-xl-3 col-lg-6">
          <div className="all-samples-card__col is-meta has-divider">
            <div className="sample-details-stack">
              <div className="meta-block">
                <div className="meta-label">Customer Representative</div>
                <div className="meta-value">{sample.representative}</div>
              </div>

              <div className="all-samples-card__meta-row row g-3 sample-details-row">
                <div className="col-6">
                  <div className="meta-block">
                    <div className="meta-label">Reference</div>
                    <div className="meta-value">{sample.reference}</div>
                  </div>
                </div>

                <div className="col-6">
                  <div className="meta-block">
                    <div className="meta-label">Request Mode</div>
                    <div className="meta-value">{sample.requestMode}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-lg-6">
          <div className="all-samples-card__col is-dates has-divider">
            <div className="sample-details-stack sample-dates-row">
              <div className="meta-block">
                <div className="meta-label">Created on</div>
                <div className="meta-value">{sample.createdOn}</div>
              </div>
              <div className="meta-block">
                <div className="meta-label">Reporting Date</div>
                <div className="meta-value">{sample.reportingDate}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-lg-6">
          <div className="all-samples-card__col is-parameters has-divider">
            <div className="meta-label">Parameters</div>
            <ParameterCircles parameters={sample.parameters} />
          </div>
        </div>
      </div>
    </article>
  );
}

function ListingBody({ samples, onOpenSample }) {
  return (
    <main className="all-samples-page">
      <div className="container-fluid px-4">
        <div className="all-samples-page__content">
        <div className="all-samples-page__header">
          <span>{samples.length} Total Samples</span>
        </div>

        <div className="all-samples-page__list">
          {samples.length ? (
            samples.map((sample, index) => (
              <ListingCard sample={sample} onOpenSample={onOpenSample} key={`${sample.id}-${index}`} />
            ))
          ) : (
            <div className="all-samples-page__empty">No samples found for this view.</div>
          )}
        </div>
        </div>
      </div>
    </main>
  );
}

export default function AllSamplesListingPage({
  onNavigate,
  onOpenSample,
  sidebarCollapsed,
  onSidebarCollapsedChange,
}) {
  const [activeTab, setActiveTab] = useState('all-samples');
  const [searchValue, setSearchValue] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({
    status: '',
    requestMode: '',
    representative: '',
    reference: '',
    createdOn: '',
    reportingDate: '',
  });
  const [draftFilters, setDraftFilters] = useState(appliedFilters);

  const visibleSamples = useMemo(() => {
    const categorySamples = getSamplesByCategory(activeTab);
    const query = searchValue.trim().toLowerCase();
    return categorySamples.filter((sample) => {
      const matchesSearch = !query
        || [
          sample.id,
          sample.representative,
          sample.reference,
          sample.requestMode,
          sample.status,
          sample.reportingDate,
          sample.createdOn,
        ]
          .join(' ')
          .toLowerCase()
          .includes(query);

      const matchesFilters = Object.entries(appliedFilters).every(([key, filterValue]) => {
        if (!filterValue) {
          return true;
        }

        const sampleValue = String(sample[key] ?? '').toLowerCase();
        return sampleValue.includes(String(filterValue).toLowerCase());
      });

      return matchesSearch && matchesFilters;
    });
  }, [activeTab, searchValue, appliedFilters]);

  return (
    <AppChrome
      activeNav="all-samples"
      onNavigate={onNavigate}
      breadcrumbs={[{ key: 'all-samples', label: 'All Samples', current: true }]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      pageHeader={
        <ListingTabs
          activeTab={activeTab}
          onTabChange={(nextTab) => {
            setActiveTab(nextTab);
            setSearchValue('');
            setAppliedFilters({
              status: '',
              requestMode: '',
              representative: '',
              reference: '',
              createdOn: '',
              reportingDate: '',
            });
            setDraftFilters({
              status: '',
              requestMode: '',
              representative: '',
              reference: '',
              createdOn: '',
              reportingDate: '',
            });
          }}
        />
      }
    >
      <ListingSearch
        activeTab={activeTab}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onOpenFilters={() => {
          setDraftFilters(appliedFilters);
          setFiltersOpen(true);
        }}
      />
      <ActiveFilterPills
        appliedFilters={appliedFilters}
        onRemoveFilter={(filterKey) => {
          const nextFilters = { ...appliedFilters, [filterKey]: '' };
          setAppliedFilters(nextFilters);
          setDraftFilters(nextFilters);
        }}
      />
      <ListingBody
        samples={visibleSamples}
        onOpenSample={onOpenSample}
      />
      <FiltersDrawer
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
