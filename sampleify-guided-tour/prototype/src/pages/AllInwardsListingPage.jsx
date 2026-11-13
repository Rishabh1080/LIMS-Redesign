import { useMemo, useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import { FormElement } from '../components/FormControls';
import NavSelector from '../components/NavSelector/NavSelector';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import SampleCard from '../components/SampleCard/SampleCard';
import {
  allInwardsDb,
  getInwardParameters,
  parseDisplayDate,
  toParameterCircles,
} from '../data/inwardsDb';
import '../styles.scss';
import './all-samples-listing-page.scss';

/*
 * All inwards listing.
 *
 * One card per inward, using the same "data grid" card style the samples
 * listing offers (the third of its three view toggles), so the two listings
 * read identically. The identifier on the card is the inward id, and opening
 * it goes to the inward details page; the samples it produced are listed
 * there, one per product.
 */

const inwards = allInwardsDb;

const quickFilterOptions = [
  { key: 'all', label: 'All', days: null, countLabel: 'total inwards' },
  { key: 'today', label: 'Today', days: 0, countLabel: 'inwards received today' },
  { key: 'last-7', label: 'Last 7 days', days: 7, countLabel: 'inwards in the last 7 days' },
  { key: 'last-30', label: 'Last 30 days', days: 30, countLabel: 'inwards in the last 30 days' },
];

const emptyFilters = {
  status: '',
  category: '',
  representativeName: '',
  customerReference: '',
  receivedDate: '',
};

const uniqueSorted = (values) => [...new Set(values)].sort();

const filterConfig = [
  {
    key: 'status',
    label: 'Status',
    type: 'dropdown',
    placeholder: 'Select status',
    options: uniqueSorted(inwards.map((inward) => inward.status)),
  },
  {
    key: 'category',
    label: 'Category',
    type: 'dropdown',
    placeholder: 'Select category',
    options: uniqueSorted(inwards.flatMap((inward) => inward.categories)),
  },
  {
    key: 'representativeName',
    label: 'Customer Representative',
    type: 'text',
    placeholder: 'Search representative',
  },
  {
    key: 'customerReference',
    label: 'Reference',
    type: 'text',
    placeholder: 'Search reference',
  },
  {
    key: 'receivedDate',
    label: 'Received Date',
    type: 'date',
    placeholder: 'DD/MM/YYYY',
  },
];

function getQuickFilterOption(filterKey) {
  return quickFilterOptions.find((option) => option.key === filterKey) ?? quickFilterOptions[0];
}

// Midnight today, so "Today" means the calendar day rather than the last 24 hours.
function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function matchesQuickFilter(inward, filterKey) {
  const option = getQuickFilterOption(filterKey);
  if (option.days === null) return true;

  const received = parseDisplayDate(inward.receivedDate);
  if (!received) return false;

  const today = startOfToday();
  const earliest = new Date(today);
  earliest.setDate(earliest.getDate() - option.days);

  return received >= earliest && received <= today;
}

function matchesFilters(inward, filters) {
  // An inward matches a category when any of its products carries it.
  if (filters.category && !inward.categories.includes(filters.category)) return false;
  if (filters.status && inward.status !== filters.status) return false;
  if (filters.receivedDate && inward.receivedDate !== filters.receivedDate) return false;

  return ['representativeName', 'customerReference'].every((key) => {
    if (!filters[key]) return true;
    return String(inward[key] ?? '').toLowerCase().includes(filters[key].toLowerCase());
  });
}

function matchesSearch(inward, query) {
  if (!query) return true;

  return [
    inward.id,
    inward.customerName,
    inward.representativeName,
    inward.customerReference,
    inward.receivedMode,
    inward.status,
    inward.receivedDate,
    ...inward.categories,
    ...inward.products.map((product) => `${product.name} ${product.sampleId}`),
  ]
    .join(' ')
    .toLowerCase()
    .includes(query);
}

/*
 * Maps an inward onto the shape SampleCard reads, so the inward listing reuses
 * the sample card rather than growing a second card component that would drift
 * from it.
 */
function toCardModel(inward) {
  return {
    id: inward.id,
    status: inward.status,
    representative: inward.representativeName,
    reference: inward.customerReference,
    requestMode: inward.receivedMode,
    createdOn: inward.createdOn,
    reportingDate: inward.dueDate,
    parameters: toParameterCircles(getInwardParameters(inward)),
  };
}

function getCardExtras(inward) {
  const sampleCount = inward.products.length;

  return {
    extraMetaFields: [
      { label: 'Customer', value: inward.customerName },
      { label: 'Samples', value: `${sampleCount} ${sampleCount === 1 ? 'sample' : 'samples'}` },
    ],
    extraDateFields: [{ label: 'Received Date', value: inward.receivedDate }],
  };
}

function ListingSearch({ searchValue, onSearchChange, onOpenFilters, activeFilterCount, onNewInward }) {
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
                placeholder="Search in All inwards"
                aria-label="Search inwards"
              />
              <button className="smplfy-btn btn btn-primary" aria-label="Search inwards">
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
          <div className="col d-flex justify-content-end gap-2">
            <PrimaryButton leftIcon="plus" onClick={onNewInward}>
              New inward
            </PrimaryButton>
          </div>
        </div>
      </div>
    </section>
  );
}

function ListingQuickFilters({ activeFilter, counts, onFilterChange }) {
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
        aria-labelledby="all-inwards-filters-title"
      >
        <div className="offcanvas-header border-bottom">
          <h2 className="offcanvas-title h5 mb-0" id="all-inwards-filters-title">All Filters</h2>
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

export default function AllInwardsListingPage({
  onNavigate,
  onOpenInward,
  onNewInward,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  sidebarBadgeCounts,
}) {
  const [searchValue, setSearchValue] = useState('');
  const [quickFilter, setQuickFilter] = useState('all');
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);
  const [draftFilters, setDraftFilters] = useState(emptyFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const normalizedQuery = searchValue.trim().toLowerCase();

  const searchedInwards = useMemo(
    () => inwards.filter(
      (inward) => matchesSearch(inward, normalizedQuery) && matchesFilters(inward, appliedFilters),
    ),
    [normalizedQuery, appliedFilters],
  );

  // Each pill reports how many rows it would show under the current search and
  // filters, so the counts stay meaningful as the view narrows.
  const quickFilterCounts = useMemo(
    () => quickFilterOptions.reduce((counts, option) => {
      counts[option.key] = searchedInwards.filter((inward) => matchesQuickFilter(inward, option.key)).length;
      return counts;
    }, {}),
    [searchedInwards],
  );

  const visibleInwards = useMemo(
    () => searchedInwards.filter((inward) => matchesQuickFilter(inward, quickFilter)),
    [searchedInwards, quickFilter],
  );

  const activeFilterCount = Object.values(appliedFilters).filter(Boolean).length;
  const countLabel = `${visibleInwards.length} ${getQuickFilterOption(quickFilter).countLabel}`;

  const applyFilters = (nextFilters) => {
    setAppliedFilters(nextFilters);
    setDraftFilters(nextFilters);
  };

  // SampleCard hands back the card's identifier; resolve it to the inward it came from.
  const handleOpenCard = (inwardId) => {
    const inward = inwards.find((entry) => entry.id === inwardId);
    if (inward) onOpenInward?.(inward);
  };

  return (
    <AppChrome
      activeNav="all-products"
      onNavigate={onNavigate}
      breadcrumbs={[{ key: 'all-products', label: 'All inwards', current: true }]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      sidebarBadgeCounts={sidebarBadgeCounts}
      pageHeader={
        <ListingSearch
          searchValue={searchValue}
          activeFilterCount={activeFilterCount}
          onNewInward={onNewInward}
          onSearchChange={setSearchValue}
          onOpenFilters={() => {
            setDraftFilters(appliedFilters);
            setFiltersOpen(true);
          }}
        />
      }
    >
      <main className="smplfy-all-samples-page bg-body-tertiary flex-grow-1">
        <div className="container-fluid px-4">
          <div className="w-100 pb-4">
            <ListingQuickFilters
              activeFilter={quickFilter}
              counts={quickFilterCounts}
              onFilterChange={setQuickFilter}
            />

            <ActiveFilterPills
              appliedFilters={appliedFilters}
              onRemoveFilter={(filterKey) => applyFilters({ ...appliedFilters, [filterKey]: '' })}
            />

            <div className="pb-2">
              <span className="small text-secondary fw-normal smplfy-all-samples-count-label">{countLabel}</span>
            </div>

            <div className="vstack gap-3">
              {visibleInwards.length ? (
                visibleInwards.map((inward) => {
                  const { extraMetaFields, extraDateFields } = getCardExtras(inward);

                  return (
                    <SampleCard
                      key={inward.id}
                      sample={toCardModel(inward)}
                      sourcePage="all-products"
                      viewMode="grid"
                      extraMetaFields={extraMetaFields}
                      extraDateFields={extraDateFields}
                      onOpenSample={handleOpenCard}
                    />
                  );
                })
              ) : (
                <div className="smplfy-card card">
                  <div className="card-body d-flex align-items-center justify-content-center text-secondary fw-medium">
                    No inwards found for this view.
                  </div>
                </div>
              )}
            </div>
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
