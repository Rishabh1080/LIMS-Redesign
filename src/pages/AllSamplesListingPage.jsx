import { useEffect, useMemo, useRef, useState } from 'react';
import AppIcon from '../components/AppIcon';
import AppChrome from '../components/AppChrome/AppChrome';
import Checkbox from '../components/Checkbox/Checkbox';
import { FormElement, ToastNotification } from '../components/FormControls';
import Modal from '../components/Modal/Modal';
import NavSelector from '../components/NavSelector';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import SampleCard, { SampleCardViewToggle } from '../components/SampleCard/SampleCard';
import { getSamplesByCategory, sampleCategories } from '../data/samplesDb';
import '../styles.css';
import './all-samples-listing-page.css';

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

function ListingSearch({ activeTab, searchValue, onSearchChange, onOpenFilters, actions = null }) {
  const activeCategoryLabel =
    sampleCategories.find((tab) => tab.key === activeTab)?.label ?? 'All Samples';

  return (
    <section className="all-samples-search">
      <div className="container-fluid px-4 h-100">
        <div className="row h-100 align-items-center gx-3">
          <div className="col">
            <div className="all-samples-search__toolbar">
              <div className="all-samples-search__left">
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
                <button className="btn all-samples-search__filters" onClick={onOpenFilters}>
                  <AppIcon name="filter" />
                  <span>All Filters</span>
                </button>
              </div>
              <div className="all-samples-search__right">{actions}</div>
            </div>
          </div>
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

function ListingBody({ samples, onOpenSample, onEditSample, viewMode, onViewModeChange }) {
  return (
    <main className="all-samples-page">
      <div className="container-fluid px-4">
        <div className="all-samples-page__content">
          <div className="all-samples-page__header">
            <span>{samples.length} Total Samples</span>
            <SampleCardViewToggle value={viewMode} onChange={onViewModeChange} />
          </div>

          <div className="all-samples-page__list">
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
              <div className="all-samples-page__empty">No samples found for this view.</div>
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
    <main className="all-samples-page all-samples-page--retained">
      <div className="container-fluid px-4">
        <div className="retained-samples">
          <div className="retained-samples__legend retained-samples__grid">
            <div className="retained-samples__checkbox-cell retained-samples__checkbox-cell--legend">
              <Checkbox
                checked={allSelected}
                ariaLabel="Select all retained samples"
                onChange={onToggleAll}
              />
            </div>
            <div className="retained-samples__cell retained-samples__cell--id retained-samples__cell--legend">Remnant ID</div>
            <div className="retained-samples__cell retained-samples__cell--meta retained-samples__cell--legend">Tested At</div>
            <div className="retained-samples__cell retained-samples__cell--meta retained-samples__cell--legend">Tested By</div>
            <div className="retained-samples__cell retained-samples__cell--meta retained-samples__cell--legend">Retention Date</div>
            <div className="retained-samples__cell retained-samples__cell--action retained-samples__cell--legend">Action</div>
          </div>

          <div className="retained-samples__rows">
            {samples.length ? (
              samples.map((sample) => (
                <article className="retained-samples__row retained-samples__grid" key={sample.id}>
                  <div className="retained-samples__checkbox-cell">
                    <Checkbox
                      checked={selectedIds.includes(sample.id)}
                      ariaLabel={`Select ${sample.remnantId ?? sample.id}`}
                      onChange={(nextChecked) => onToggleSample(sample.id, nextChecked)}
                    />
                  </div>
                  <div className="retained-samples__cell retained-samples__cell--id">
                    <a
                      href="/"
                      className="retained-samples__link"
                      onClick={(event) => {
                        event.preventDefault();
                        onOpenSample?.(sample.id, {
                          sourcePage: 'all-samples',
                          sampleStatus: sample.status,
                          createdOn: sample.createdOn,
                        });
                      }}
                    >
                      {sample.remnantId ?? sample.id}
                    </a>
                  </div>
                  <div className="retained-samples__cell retained-samples__cell--meta">{sample.testedAt}</div>
                  <div className="retained-samples__cell retained-samples__cell--meta">{sample.testedBy}</div>
                  <div className="retained-samples__cell retained-samples__cell--meta">{sample.retentionDate}</div>
                  <div className="retained-samples__cell retained-samples__cell--action retained-samples__actions">
                    <SecondaryButton
                      size="medium"
                      leftIcon="trash"
                      className="retained-samples__action-button"
                      onClick={() => onOpenDisposeModal([sample])}
                    >
                      Dispose
                    </SecondaryButton>
                    <SecondaryButton
                      size="medium"
                      leftIcon="send"
                      className="retained-samples__action-button"
                    >
                      Send for IQC
                    </SecondaryButton>
                  </div>
                </article>
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

function DisposedListing({ samples, onOpenSample }) {
  return (
    <main className="all-samples-page all-samples-page--disposed">
      <div className="container-fluid px-4">
        <div className="disposed-samples">
          <div className="disposed-samples__legend disposed-samples__grid">
            <div className="disposed-samples__cell disposed-samples__cell--id disposed-samples__cell--legend">
              Remnant ID
            </div>
            <div className="disposed-samples__cell disposed-samples__cell--meta disposed-samples__cell--legend">
              Tested At
            </div>
            <div className="disposed-samples__cell disposed-samples__cell--meta disposed-samples__cell--legend">
              Retention Date
            </div>
            <div className="disposed-samples__cell disposed-samples__cell--meta disposed-samples__cell--legend">
              Disposal Date
            </div>
            <div className="disposed-samples__cell disposed-samples__cell--remarks disposed-samples__cell--legend">
              Disposal Remarks
            </div>
            <div className="disposed-samples__cell disposed-samples__cell--action disposed-samples__cell--legend">
              Action
            </div>
          </div>

          <div className="disposed-samples__rows">
            {samples.length ? (
              samples.map((sample) => (
                <article className="disposed-samples__row disposed-samples__grid" key={sample.id}>
                  <div className="disposed-samples__cell disposed-samples__cell--id">
                    <a
                      href="/"
                      className="disposed-samples__link"
                      onClick={(event) => {
                        event.preventDefault();
                        onOpenSample?.(sample.id, {
                          sourcePage: 'all-samples',
                          sampleStatus: sample.status,
                          createdOn: sample.createdOn,
                        });
                      }}
                    >
                      {sample.remnantId ?? sample.id}
                    </a>
                  </div>
                  <div className="disposed-samples__cell disposed-samples__cell--meta">{sample.testedAt}</div>
                  <div className="disposed-samples__cell disposed-samples__cell--meta">{sample.retentionDate}</div>
                  <div className="disposed-samples__cell disposed-samples__cell--meta">{sample.disposalDate}</div>
                  <div className="disposed-samples__cell disposed-samples__cell--remarks">
                    {sample.disposalRemarks}
                  </div>
                  <div className="disposed-samples__cell disposed-samples__cell--action disposed-samples__actions">
                    <SecondaryButton
                      size="medium"
                      leftIcon="arrow-up-right"
                      className="disposed-samples__action-button"
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
                  </div>
                </article>
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

  const handleTableWheel = (event) => {
    const element = event.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = element;
    const deltaY = event.deltaY;
    const atTop = scrollTop <= 0;
    const atBottom = scrollTop + clientHeight >= scrollHeight - 1;

    if ((deltaY < 0 && atTop) || (deltaY > 0 && atBottom)) {
      event.preventDefault();
    }
  };

  return (
    <Modal
      open={open}
      title="Dispose Sample"
      titleId="dispose-samples-modal-title"
      titleIcon="trash"
      onClose={onCancel}
      size="lg"
      bodyClassName="dispose-samples-modal__body"
      actionsClassName="dispose-samples-modal__actions"
      actions={
        <>
          <SecondaryButton leftIcon="close" size="large" className="dispose-samples-modal__cancel" onClick={onCancel}>
            Cancel
          </SecondaryButton>
          <PrimaryButton leftIcon="trash" styleVariant="destructive" onClick={onSubmit}>
            Dispose
          </PrimaryButton>
        </>
      }
    >
      <div className="dispose-samples-modal__content">
        <div className="dispose-samples-modal__alert">
          <span className="dispose-samples-modal__alert-icon" aria-hidden="true">
            <AppIcon name="alert-circle" size={24} />
          </span>
          <span>{message}</span>
        </div>

        <div className="dispose-samples-modal__table">
          <div className="dispose-samples-modal__table-head">
            <span>Sr.</span>
            <span>Remnant ID</span>
            <span>Tested At</span>
            <span>Retention Date</span>
          </div>
          <div className="dispose-samples-modal__table-body" onWheel={handleTableWheel}>
            {samples.map((sample, index) => (
              <div className="dispose-samples-modal__table-row" key={sample.id}>
                <span>{index + 1}</span>
                <span>{sample.remnantId ?? sample.id}</span>
                <span>{sample.testedAt}</span>
                <span>{sample.retentionDate}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dispose-samples-modal__field">
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
        className="retained-samples__toast"
        onClose={() => setToastVisible(false)}
      />
    </AppChrome>
  );
}
