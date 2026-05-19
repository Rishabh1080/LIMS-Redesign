import { useEffect, useMemo, useRef, useState } from 'react';
import AppIcon from '../components/AppIcon';
import AppChrome from '../components/AppChrome/AppChrome';
import Checkbox from '../components/Checkbox/Checkbox';
import DataTable from '../components/DataTable';
import { FormElement, ToastNotification } from '../components/FormControls';
import Modal from '../components/Modal/Modal';
import NavSelector from '../components/NavSelector';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import SampleCard, { SampleCardViewToggle } from '../components/SampleCard/SampleCard';
import { getSamplesByCategory, sampleCategories } from '../data/samplesDb';
import '../styles.scss';
import './all-samples-listing-page.scss';

const extraMetaFieldSets = [
  [
    { label: 'Sample Category', value: 'IQC Sample' },
    { label: 'Priority', value: 'High' },
  ],
  [
    { label: 'Sample Category', value: 'ILC Sample' },
    { label: 'Priority', value: 'Medium' },
  ],
  [
    { label: 'Sample Category', value: 'PT Sample' },
    { label: 'Priority', value: 'Urgent' },
  ],
  [
    { label: 'Sample Category', value: 'Amendment Sample' },
    { label: 'Priority', value: 'Low' },
  ],
];

const extraDateFieldSets = [
  [
    { label: 'Collection Date', value: '22/02/2026, 06:15' },
    { label: 'Turnaround', value: '5 Days' },
  ],
  [
    { label: 'Collection Date', value: '22/02/2026, 07:10' },
    { label: 'Turnaround', value: '4 Days' },
  ],
  [
    { label: 'Collection Date', value: '23/02/2026, 08:25' },
    { label: 'Turnaround', value: '3 Days' },
  ],
  [
    { label: 'Collection Date', value: '24/02/2026, 09:05' },
    { label: 'Turnaround', value: '6 Days' },
  ],
];

function getSeedValue(sample) {
  return `${sample.id}|${sample.reference}|${sample.status}|${sample.createdOn}`;
}

function getDeterministicIndex(seed, length) {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  return length ? hash % length : 0;
}

function getSampleDisplayExtras(sample) {
  const seed = getSeedValue(sample);

  return {
    extraMetaFields: extraMetaFieldSets[getDeterministicIndex(seed, extraMetaFieldSets.length)],
    extraDateFields: extraDateFieldSets[getDeterministicIndex(`${seed}:dates`, extraDateFieldSets.length)],
  };
}

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
    <section className="smplfy-all-samples-tabs bg-white border-bottom">
      <div className="container-fluid px-4">
        <div className="row gx-0 align-items-stretch flex-nowrap">
          <div className="col">
            <div className="smplfy-all-samples-tabs-group nav nav-tabs flex-nowrap overflow-auto border-0">
              {leftTabs.map((tab) => (
                <NavSelector
                  key={tab.key}
                  className="text-nowrap smplfy-all-samples-tab"
                  active={activeTab === tab.key}
                  onClick={() => onTabChange(tab.key)}
                >
                  {tab.label}
                </NavSelector>
              ))}
            </div>
          </div>

          <div className="col-auto ms-auto">
            <div className="smplfy-all-samples-tabs-group nav nav-tabs flex-nowrap justify-content-end border-0">
              {rightTabs.map((tab) => (
                <NavSelector
                  key={tab.key}
                  className="text-nowrap smplfy-all-samples-tab"
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

function ListingSearch({ activeTab, searchValue, onSearchChange, onOpenFilters, actions = null }) {
  const activeCategoryLabel =
    sampleCategories.find((tab) => tab.key === activeTab)?.label ?? 'All Samples';

  return (
    <section className="smplfy-all-samples-search bg-white">
      <div className="container-fluid px-4">
        <div className="row h-100 align-items-center gx-3">
          <div className="col-xl-5 col-lg-6 col-12">
            <div className="smplfy-all-samples-search-group input-group flex-nowrap">
              <span className="input-group-text text-secondary">
                <AppIcon name="search" />
              </span>
              <input
                className="smplfy-form-control form-control"
                type="text"
                value={searchValue}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder={`Search in ${activeCategoryLabel}`}
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
                  <span>All Filters</span>
            </button>
          </div>
          {actions ? <div className="col d-flex justify-content-end">{actions}</div> : null}
        </div>
      </div>
    </section>
  );
}

function getDisposeLabel(selectedCount, totalCount) {
  if (!totalCount || selectedCount === 0 || selectedCount === totalCount) {
    return 'Dispose All';
  }

  return `Dispose ${selectedCount} ${selectedCount === 1 ? 'sample' : 'samples'}`;
}

function getSelectedRetainedSamples(samples, selectedIds) {
  return samples.filter((sample) => selectedIds.includes(sample.id));
}

function ActiveFilterPills({ appliedFilters, onRemoveFilter }) {
  const activeEntries = filterConfig
    .map((filter) => ({ ...filter, value: appliedFilters[filter.key] }))
    .filter((filter) => Boolean(filter.value));

  if (!activeEntries.length) {
    return null;
  }

  return (
    <section className="smplfy-all-samples-filter-pills bg-white">
      <div className="container-fluid px-4">
        <div className="d-flex flex-wrap gap-2 pb-2">
        {activeEntries.map((filter) => (
          <div className="smplfy-badge badge text-secondary bg-white border border-secondary-subtle d-inline-flex align-items-center gap-2" key={filter.key}>
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
      </div>
    </section>
  );
}

function FiltersDrawer({ open, draftFilters, onChange, onApply, onCancel }) {
  if (!open) {
    return null;
  }

  return (
    <>
      <div className="smplfy-all-samples-offcanvas-backdrop offcanvas-backdrop fade show" onClick={onCancel} />
      <aside className="smplfy-all-samples-offcanvas offcanvas offcanvas-end show" tabIndex="-1" role="dialog" aria-modal="true" aria-labelledby="all-samples-filters-title">
        <div className="offcanvas-header border-bottom">
          <h2 className="offcanvas-title h5 mb-0" id="all-samples-filters-title">All Filters</h2>
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

        <div className="smplfy-all-samples-offcanvas-footer d-flex justify-content-between gap-3 border-top">
          <SecondaryButton onClick={onCancel}>
            Cancel
          </SecondaryButton>
          <button type="button" className="smplfy-btn btn btn-primary" onClick={onApply}>
            Apply
          </button>
        </div>
      </aside>
    </>
  );
}

function ListingBody({ samples, onOpenSample, onEditSample, viewMode, onViewModeChange }) {
  return (
    <main className="smplfy-all-samples-page bg-body-tertiary flex-grow-1">
      <div className="container-fluid px-4">
        <div className="w-100">
          <div className="smplfy-all-samples-page-header d-flex align-items-center justify-content-between gap-3 flex-wrap text-secondary fw-medium">
            <span>{samples.length} Total Samples</span>
            <SampleCardViewToggle value={viewMode} onChange={onViewModeChange} />
          </div>

          <div className="smplfy-all-samples-list d-flex flex-column">
            {samples.length ? (
              samples.map((sample, index) => {
                const { extraMetaFields, extraDateFields } = getSampleDisplayExtras(sample);

                return (
                  <SampleCard
                    sample={sample}
                    onOpenSample={onOpenSample}
                    onEditSample={onEditSample}
                    sourcePage="all-samples"
                    viewMode={viewMode}
                    extraMetaFields={extraMetaFields}
                    extraDateFields={extraDateFields}
                    key={`${sample.id}-${index}`}
                  />
                );
              })
            ) : (
              <div className="smplfy-card card">
                <div className="card-body d-flex align-items-center justify-content-center text-secondary fw-medium">
                  No samples found for this view.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function RetainedListing({
  samples,
  selectedIds,
  onToggleSample,
  onToggleAll,
  onOpenDisposeModal,
  onOpenSample,
}) {
  const allSelected = Boolean(samples.length) && selectedIds.length === samples.length;

  return (
    <main className="smplfy-all-samples-page bg-body-tertiary flex-grow-1">
      <div className="container-fluid px-4">
        <div className="pt-4">
          {samples.length ? (
            <DataTable>
              <thead>
                <tr>
                  <th scope="col" className="text-center">
                    <Checkbox
                      checked={allSelected}
                      ariaLabel="Select all retained samples"
                      onChange={onToggleAll}
                    />
                  </th>
                  <th scope="col">Remnant ID</th>
                  <th scope="col">Tested At</th>
                  <th scope="col">Tested By</th>
                  <th scope="col">Retention Date</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {samples.map((sample) => (
                  <tr key={sample.id}>
                    <td className="text-center">
                      <Checkbox
                        checked={selectedIds.includes(sample.id)}
                        ariaLabel={`Select ${sample.remnantId ?? sample.id}`}
                        onChange={(nextChecked) => onToggleSample(sample.id, nextChecked)}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="smplfy-link link-primary btn btn-link p-0 text-start text-decoration-none"
                        onClick={() =>
                          onOpenSample?.(sample.id, {
                            sourcePage: 'all-samples',
                            sampleStatus: sample.status,
                            createdOn: sample.createdOn,
                          })
                        }
                      >
                        {sample.remnantId ?? sample.id}
                      </button>
                    </td>
                    <td>{sample.testedAt}</td>
                    <td>{sample.testedBy}</td>
                    <td>{sample.retentionDate}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <SecondaryButton
                          size="medium"
                          leftIcon="trash"
                          onClick={() => onOpenDisposeModal([sample])}
                        >
                          Dispose
                        </SecondaryButton>
                        <SecondaryButton size="medium" leftIcon="send">
                          Send for IQC
                        </SecondaryButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
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
  );
}

function DisposedListing({ samples, onOpenSample }) {
  return (
    <main className="smplfy-all-samples-page bg-body-tertiary flex-grow-1">
      <div className="container-fluid px-4">
        <div className="pt-4">
          {samples.length ? (
            <DataTable>
              <thead>
                <tr>
                  <th scope="col">Remnant ID</th>
                  <th scope="col">Tested At</th>
                  <th scope="col">Retention Date</th>
                  <th scope="col">Disposal Date</th>
                  <th scope="col">Disposal Remarks</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {samples.map((sample) => (
                  <tr key={sample.id}>
                    <td>
                      <button
                        type="button"
                        className="smplfy-link link-primary btn btn-link p-0 text-start text-decoration-none"
                        onClick={() =>
                          onOpenSample?.(sample.id, {
                            sourcePage: 'all-samples',
                            sampleStatus: sample.status,
                            createdOn: sample.createdOn,
                          })
                        }
                      >
                        {sample.remnantId ?? sample.id}
                      </button>
                    </td>
                    <td>{sample.testedAt}</td>
                    <td>{sample.retentionDate}</td>
                    <td>{sample.disposalDate}</td>
                    <td>{sample.disposalRemarks}</td>
                    <td>
                      <SecondaryButton
                        size="medium"
                        leftIcon="arrow-up-right"
                        onClick={() =>
                          onOpenSample?.(sample.id, {
                            sourcePage: 'all-samples',
                            sampleStatus: sample.status,
                            createdOn: sample.createdOn,
                          })
                        }
                      >
                        Open
                      </SecondaryButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
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
  );
}

function DisposeSamplesModal({
  open,
  samples,
  comment,
  commentError,
  onCommentChange,
  onCancel,
  onSubmit,
}) {
  const disposeCount = samples.length;
  const message = `You're about to dispose ${disposeCount} ${
    disposeCount === 1 ? 'sample' : 'samples'
  }. This action cannot be undone.`;

  return (
    <Modal
      open={open}
      title="Dispose Sample"
      titleId="dispose-samples-modal-title"
      titleIcon="trash"
      onClose={onCancel}
      size="lg"
      bodyClassName="pt-3 pb-4"
      actionsClassName="justify-content-between"
      actions={
        <>
          <SecondaryButton leftIcon="close" size="large" onClick={onCancel}>
            Cancel
          </SecondaryButton>
          <PrimaryButton leftIcon="trash" styleVariant="destructive" onClick={onSubmit}>
            Dispose
          </PrimaryButton>
        </>
      }
    >
      <div className="d-flex flex-column gap-4">
        <div className="alert alert-danger d-flex align-items-center gap-3 mb-0" role="alert">
          <span className="d-inline-flex align-items-center justify-content-center flex-shrink-0" aria-hidden="true">
            <AppIcon name="alert-circle" size={24} />
          </span>
          <span>{message}</span>
        </div>

        <DataTable className="table-sm">
          <thead>
            <tr>
              <th scope="col">Sr.</th>
              <th scope="col">Remnant ID</th>
              <th scope="col">Tested At</th>
              <th scope="col">Retention Date</th>
            </tr>
          </thead>
          <tbody>
            {samples.map((sample, index) => (
              <tr key={sample.id}>
                <td>{index + 1}</td>
                <td>{sample.remnantId ?? sample.id}</td>
                <td>{sample.testedAt}</td>
                <td>{sample.retentionDate}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>

        <div>
          <FormElement
            type="text"
            mandatory
            label="Comment"
            message={commentError ? 'Comment is required before disposing samples.' : ''}
            messageTone="error"
            inputProps={{
              state: commentError ? 'error' : comment ? 'filled' : 'default',
              value: comment,
              placeholder: 'eg.',
              onChange: (event) => onCommentChange(event.target.value),
            }}
          />
        </div>
      </div>
    </Modal>
  );
}

export default function AllSamplesListingPage({
  onNavigate,
  onOpenSample,
  onEditSample,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  sampleCardViewMode,
  onSampleCardViewModeChange,
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
  const [selectedRetainedIds, setSelectedRetainedIds] = useState([]);
  const [disposeModalOpen, setDisposeModalOpen] = useState(false);
  const [disposeModalSamples, setDisposeModalSamples] = useState([]);
  const [disposeComment, setDisposeComment] = useState('');
  const [disposeCommentError, setDisposeCommentError] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('5 Samples Disposed successfully.');
  const toastTimerRef = useRef(0);
  const isRetainedTab = activeTab === 'retained';
  const isDisposedTab = activeTab === 'disposed';

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
          sample.remnantId,
          sample.testedAt,
          sample.testedBy,
          sample.retentionDate,
          sample.disposalDate,
          sample.disposalRemarks,
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

  useEffect(() => {
    if (!isRetainedTab) {
      return;
    }

    const visibleIds = new Set(visibleSamples.map((sample) => sample.id));
    setSelectedRetainedIds((current) => current.filter((sampleId) => visibleIds.has(sampleId)));
  }, [isRetainedTab, visibleSamples]);

  const selectedRetainedSamples = useMemo(
    () => getSelectedRetainedSamples(visibleSamples, selectedRetainedIds),
    [visibleSamples, selectedRetainedIds],
  );
  const disposeButtonLabel = getDisposeLabel(selectedRetainedIds.length, visibleSamples.length);

  const resetRetainedState = () => {
    setSelectedRetainedIds([]);
    setDisposeModalOpen(false);
    setDisposeModalSamples([]);
    setDisposeComment('');
    setDisposeCommentError(false);
  };

  const openDisposeModal = (samples) => {
    if (!samples.length) {
      return;
    }

    setDisposeModalSamples(samples);
    setDisposeComment('');
    setDisposeCommentError(false);
    setDisposeModalOpen(true);
  };

  const showToast = (message) => {
    window.clearTimeout(toastTimerRef.current);
    setToastMessage(message);
    setToastVisible(true);
    toastTimerRef.current = window.setTimeout(() => setToastVisible(false), 5000);
  };

  useEffect(() => {
    return () => {
      window.clearTimeout(toastTimerRef.current);
    };
  }, []);

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
            resetRetainedState();
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
        actions={
          isRetainedTab ? (
            <PrimaryButton
              leftIcon="trash"
              styleVariant="destructive"
              onClick={() => openDisposeModal(selectedRetainedSamples.length ? selectedRetainedSamples : visibleSamples)}
            >
              {disposeButtonLabel}
            </PrimaryButton>
          ) : null
        }
        />
      <ActiveFilterPills
        appliedFilters={appliedFilters}
        onRemoveFilter={(filterKey) => {
          const nextFilters = { ...appliedFilters, [filterKey]: '' };
          setAppliedFilters(nextFilters);
          setDraftFilters(nextFilters);
        }}
      />
      {isRetainedTab ? (
        <RetainedListing
          samples={visibleSamples}
          selectedIds={selectedRetainedIds}
          onToggleSample={(sampleId, checked) => {
            setSelectedRetainedIds((current) => {
              if (checked) {
                return current.includes(sampleId) ? current : [...current, sampleId];
              }

              return current.filter((id) => id !== sampleId);
            });
          }}
          onToggleAll={(checked) =>
            setSelectedRetainedIds(checked ? visibleSamples.map((sample) => sample.id) : [])
          }
          onOpenDisposeModal={openDisposeModal}
          onOpenSample={onOpenSample}
        />
      ) : isDisposedTab ? (
        <DisposedListing
          samples={visibleSamples}
          onOpenSample={onOpenSample}
        />
      ) : (
        <ListingBody
          samples={visibleSamples}
          onOpenSample={onOpenSample}
          onEditSample={onEditSample}
          viewMode={sampleCardViewMode}
          onViewModeChange={onSampleCardViewModeChange}
        />
      )}
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
      <DisposeSamplesModal
        open={disposeModalOpen}
        samples={disposeModalSamples}
        comment={disposeComment}
        commentError={disposeCommentError}
        onCommentChange={(value) => {
          setDisposeComment(value);
          if (disposeCommentError && value.trim()) {
            setDisposeCommentError(false);
          }
        }}
        onCancel={() => {
          setDisposeModalOpen(false);
          setDisposeComment('');
          setDisposeCommentError(false);
        }}
        onSubmit={() => {
          if (!disposeComment.trim()) {
            setDisposeCommentError(true);
            return;
          }

          const disposedCount = disposeModalSamples.length;
          setDisposeModalOpen(false);
          setDisposeComment('');
          setDisposeCommentError(false);
          setSelectedRetainedIds((current) =>
            current.filter((sampleId) => !disposeModalSamples.some((sample) => sample.id === sampleId)),
          );
          showToast(`${disposedCount} ${disposedCount === 1 ? 'Sample' : 'Samples'} Disposed successfully.`);
        }}
      />
      <ToastNotification
        key={toastMessage}
        state={toastVisible ? 'default' : 'gone'}
        message={toastMessage}
        className="position-fixed bottom-0 start-0 m-4"
        onClose={() => setToastVisible(false)}
      />
    </AppChrome>
  );
}
