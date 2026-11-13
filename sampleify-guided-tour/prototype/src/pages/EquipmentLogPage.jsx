import { useEffect, useMemo, useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal/Modal';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import { FormElement, ToastNotification } from '../components/FormControls';
import {
  equipmentLogInstruments,
  equipmentLogProducts,
  getBatchesForProduct,
  getInstrumentLabel,
  getProductLabel,
  initialOngoingLogs,
  initialRecordedLogs,
} from '../data/equipmentLogsData';
import './all-samples-listing-page.scss';
import './equipment-log-page.scss';

const CURRENT_USER = 'Rishabh Gangwar';

const initialFilters = {
  instrumentName: '',
  productName: '',
  date: '',
};



// Render a stored 24h "HH:MM" time as a 12h "hh:MM AM/PM" string for display.
// The stored value stays 24h so column sorting keeps working on the raw value.
function formatTime12h(time) {
  const [hoursRaw, minutes] = String(time ?? '').split(':');
  const hours = Number(hoursRaw);

  if (Number.isNaN(hours) || minutes === undefined) {
    return time ?? '';
  }

  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;

  return `${String(displayHours).padStart(2, '0')}:${minutes} ${period}`;
}

// Elapsed "HH:MM:SS" since a log started, ticking once a second. Start time is
// interpreted against the log's date so a card opened later still reads right.
function useElapsedRunTime(dateDisplay, startTime) {
  const startMs = useMemo(() => {
    const [day, month, year] = String(dateDisplay ?? '').split('/').map(Number);
    const [hours, minutes] = String(startTime ?? '').split(':').map(Number);
    if (!day || !month || !year) return null;
    return new Date(year, month - 1, day, hours || 0, minutes || 0, 0).getTime();
  }, [dateDisplay, startTime]);

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timerId = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timerId);
  }, []);

  if (startMs === null) return '00:00:00';

  const elapsedSeconds = Math.max(0, Math.floor((now - startMs) / 1000));
  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;

  return [hours, minutes, seconds].map((unit) => String(unit).padStart(2, '0')).join(':');
}

const RECORDED_COLUMNS = [
  { key: 'srNo', label: 'Sr No.', sortable: true, type: 'number' },
  { key: 'date', label: 'Date', sortable: true, type: 'date' },
  { key: 'startTime', label: 'Start Time', sortable: true, type: 'time' },
  { key: 'endTime', label: 'End Time', sortable: true, type: 'time' },
  { key: 'instrumentName', label: 'Instrument', sortable: true, type: 'text' },
  { key: 'productName', label: 'Product Name', sortable: true, type: 'text' },
  { key: 'batchNo', label: 'Batch No', sortable: true, type: 'text' },
  { key: 'testValue', label: 'Test Value', sortable: true, type: 'text' },
  { key: 'doneBy', label: 'Done by', sortable: true, type: 'text' },
];

function getTodayDisplayDate() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  return `${day}/${month}/${year}`;
}

function getNowTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Comparable value for a column, keyed by its declared type so dates and times
// sort chronologically rather than as plain strings.
function getSortableValue(log, column) {
  const raw = log[column.key];

  if (column.type === 'number') {
    return Number(raw) || 0;
  }

  if (column.type === 'date') {
    const [day, month, year] = String(raw ?? '').split('/').map(Number);
    if (!day || !month || !year) return 0;
    return new Date(year, month - 1, day).getTime();
  }

  if (column.type === 'time') {
    const [hours, minutes] = String(raw ?? '').split(':').map(Number);
    return (Number(hours) || 0) * 60 + (Number(minutes) || 0);
  }

  return String(raw ?? '').toLowerCase();
}

function MetaRow({ label, value }) {
  return (
    <div className="smplfy-equipment-log-meta-row d-flex gap-2">
      <span className="smplfy-equipment-log-meta-label">{label}:</span>
      <span className="smplfy-equipment-log-meta-value">{value}</span>
    </div>
  );
}

function OngoingLogCard({ log, testValue, onTestValueChange, onFinish }) {
  const runTime = useElapsedRunTime(log.date, log.startTime);
  const [hasError, setHasError] = useState(false);
  const [shaking, setShaking] = useState(false);

  const triggerError = () => {
    setHasError(true);
    setShaking(true);
    window.setTimeout(() => setShaking(false), 450);
  };

  const handleFinish = () => {
    if (!testValue.trim()) {
      triggerError();
      return;
    }
    onFinish(log.id);
  };

  const handleChange = (event) => {
    if (hasError) {
      setHasError(false);
    }
    onTestValueChange(log.id, event.target.value);
  };

  return (
    <article className="smplfy-card card smplfy-equipment-log-ongoing-card overflow-hidden p-0 w-100">
      <div className="card-header bg-transparent d-flex align-items-center justify-content-between gap-2">
        <span className="smplfy-equipment-log-ongoing-name d-flex align-items-center gap-2 min-w-0">
          <AppIcon name="tool" size={20} stroke={1.8} className="flex-shrink-0" />
          <span className="text-truncate">{log.instrumentName}</span>
        </span>
        <span className="smplfy-equipment-log-runtime d-inline-flex align-items-center gap-2 flex-shrink-0">
          <span className="smplfy-equipment-log-runtime-dot" aria-hidden="true" />
          <time className="smplfy-equipment-log-runtime-value">{runTime}</time>
        </span>
      </div>

      <div className="card-body d-grid gap-2">
        <MetaRow label="Product" value={log.productName} />
        <MetaRow label="Batch No" value={log.batchNo} />
        <MetaRow label="Done by" value={log.doneBy} />
      </div>

      <div className="card-footer bg-transparent d-grid gap-2">
        <span className="smplfy-equipment-log-field-label">Test Value</span>
        <div className="d-flex align-items-start gap-2">
          <FormElement
            className={`flex-grow-1${shaking ? ' smplfy-equipment-log-shake' : ''}`}
            inputProps={{
              value: testValue,
              placeholder: 'Enter test value',
              state: hasError ? 'error' : testValue.trim() ? 'filled' : 'default',
              'aria-invalid': hasError ? 'true' : undefined,
              onChange: handleChange,
            }}
          />
          <PrimaryButton
            leftIcon="save"
            className="flex-shrink-0"
            onClick={handleFinish}
          >
            Finish
          </PrimaryButton>
        </div>
      </div>
    </article>
  );
}

function SortableHeader({ column, sortState, onSort }) {
  if (!column.sortable) {
    return <th scope="col">{column.label}</th>;
  }

  const isActive = sortState.key === column.key;
  const direction = isActive ? sortState.direction : null;
  const ariaSort = isActive ? (direction === 'asc' ? 'ascending' : 'descending') : 'none';

  return (
    <th scope="col" aria-sort={ariaSort}>
      <button
        type="button"
        className="smplfy-equipment-log-sort-btn"
        onClick={() => onSort(column.key)}
      >
        <span>{column.label}</span>
        <AppIcon
          name={isActive && direction === 'asc' ? 'chevron-up' : 'chevron-down'}
          size={14}
          stroke={2}
          className={isActive ? '' : 'smplfy-equipment-log-sort-icon-idle'}
        />
      </button>
    </th>
  );
}

function EquipmentLogSearchBar({ searchValue, onSearchChange, onOpenFilters, activeFilterCount }) {
  return (
    <div className="row align-items-center gx-3 gy-2">
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
            placeholder="Search in Equipment Log"
            aria-label="Search equipment logs"
          />
          <button className="smplfy-btn btn btn-primary" aria-label="Search equipment logs">
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
  );
}

function ActiveFilterPills({ filterConfig, appliedFilters, onRemoveFilter }) {
  const activeEntries = filterConfig
    .map((filter) => ({ ...filter, value: appliedFilters[filter.key] }))
    .filter((filter) => Boolean(filter.value));

  if (!activeEntries.length) return null;

  return (
    <div className="d-flex flex-wrap gap-2">
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

function EquipmentLogFilterDrawer({ open, filterConfig, draftFilters, onChange, onApply, onCancel }) {
  if (!open) {
    return null;
  }

  return (
    <>
      <div className="offcanvas-backdrop fade show" onClick={onCancel} />
      <aside
        className="smplfy-all-samples-offcanvas offcanvas offcanvas-end show"
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
        aria-labelledby="equipment-log-filters-title"
      >
        <div className="offcanvas-header border-bottom">
          <h2 className="offcanvas-title h5 mb-0" id="equipment-log-filters-title">All Filters</h2>
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
                searchable: filter.searchable,
                searchPlaceholder: filter.searchPlaceholder,
                onChange: (event) => onChange(filter.key, event.target.value),
              }}
            />
          ))}
        </div>

        <div className="d-flex justify-content-between gap-3 border-top p-3">
          <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
          <button type="button" className="smplfy-btn btn btn-primary" onClick={onApply}>Apply</button>
        </div>
      </aside>
    </>
  );
}

export default function EquipmentLogPage({
  recordedLogs = initialRecordedLogs,
  onRecordLog,
  onBulkUpload,
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  sidebarBadgeCounts = {},
}) {
  const [ongoingLogs, setOngoingLogs] = useState(initialOngoingLogs);
  const [ongoingTestValues, setOngoingTestValues] = useState({});
  const [sortState, setSortState] = useState({ key: 'date', direction: 'desc' });

  const [searchValue, setSearchValue] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [draftFilters, setDraftFilters] = useState(initialFilters);

  const [modalOpen, setModalOpen] = useState(false);
  const [draftInstrument, setDraftInstrument] = useState('');
  const [draftProduct, setDraftProduct] = useState('');
  const [draftBatch, setDraftBatch] = useState('');
  const [formError, setFormError] = useState('');

  const [toast, setToast] = useState(null);

  const instrumentOptions = useMemo(
    () => equipmentLogInstruments.map((instrument) => ({ value: instrument.value, label: instrument.label })),
    [],
  );
  const productOptions = useMemo(
    () => equipmentLogProducts.map((product) => ({ value: product.value, label: product.label })),
    [],
  );
  const batchOptions = useMemo(
    () => getBatchesForProduct(draftProduct).map((batch) => ({ value: batch, label: batch })),
    [draftProduct],
  );

  const filterConfig = useMemo(() => [
    {
      key: 'instrumentName',
      label: 'Equipment',
      type: 'dropdown',
      placeholder: 'All equipment',
      options: Array.from(new Set(recordedLogs.map((log) => log.instrumentName))).sort(),
    },
    {
      key: 'productName',
      label: 'Product',
      type: 'dropdown',
      placeholder: 'All products',
      options: Array.from(new Set(recordedLogs.map((log) => log.productName))).sort(),
    },
    {
      key: 'date',
      label: 'Date',
      type: 'date',
      placeholder: 'DD/MM/YYYY',
    },
  ], [recordedLogs]);

  // Decorate recorded logs with their 1-based serial number, apply the active
  // filters, then sort by the active column. Sr No. is a listing artifact so it
  // is assigned before filtering/sorting and never persisted on the log itself.
  const sortedRecordedLogs = useMemo(() => {
    const column = RECORDED_COLUMNS.find((item) => item.key === sortState.key) ?? RECORDED_COLUMNS[1];
    const query = searchValue.trim().toLowerCase();
    const numbered = recordedLogs
      .map((log, index) => ({ ...log, srNo: index + 1 }))
      .filter((log) => {
        const matchesSearch = !query || [
          log.instrumentName,
          log.productName,
          log.batchNo,
          log.testValue,
          log.doneBy,
          log.date,
        ].some((value) => String(value ?? '').toLowerCase().includes(query));

        return matchesSearch
          && (!appliedFilters.instrumentName || log.instrumentName === appliedFilters.instrumentName)
          && (!appliedFilters.productName || log.productName === appliedFilters.productName)
          && (!appliedFilters.date || log.date === appliedFilters.date);
      });

    return [...numbered].sort((first, second) => {
      const firstValue = getSortableValue(first, column);
      const secondValue = getSortableValue(second, column);

      let comparison = 0;
      if (firstValue < secondValue) comparison = -1;
      else if (firstValue > secondValue) comparison = 1;

      return sortState.direction === 'asc' ? comparison : -comparison;
    });
  }, [recordedLogs, sortState, appliedFilters, searchValue]);

  const activeFilterCount = Object.values(appliedFilters).filter(Boolean).length;

  const showToast = (message, tone = 'success') => {
    setToast({ message, tone });
    window.setTimeout(() => setToast(null), 4000);
  };

  const handleSort = (key) => {
    setSortState((current) => {
      if (current.key === key) {
        return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const openFilters = () => {
    setDraftFilters(appliedFilters);
    setFiltersOpen(true);
  };

  const cancelFilters = () => {
    setDraftFilters(appliedFilters);
    setFiltersOpen(false);
  };

  const applyFilters = () => {
    setAppliedFilters(draftFilters);
    setFiltersOpen(false);
  };

  const removeFilter = (key) => {
    const next = { ...appliedFilters, [key]: '' };
    setAppliedFilters(next);
    setDraftFilters(next);
  };

  const changeDraftFilter = (key, value) => {
    setDraftFilters((current) => ({ ...current, [key]: value }));
  };

  const openModal = () => {
    setDraftInstrument('');
    setDraftProduct('');
    setDraftBatch('');
    setFormError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleProductChange = (value) => {
    setDraftProduct(value);
    setDraftBatch('');
    setFormError('');
  };

  const handleStartLog = () => {
    if (!draftInstrument || !draftProduct || !draftBatch) {
      setFormError('Select an instrument, a product and a batch number to start the log.');
      return;
    }

    const newLog = {
      id: `LOG-ONGOING-${Date.now()}`,
      date: getTodayDisplayDate(),
      startTime: getNowTime(),
      instrumentValue: draftInstrument,
      instrumentName: getInstrumentLabel(draftInstrument),
      productValue: draftProduct,
      productName: getProductLabel(draftProduct),
      batchNo: draftBatch,
      doneBy: CURRENT_USER,
    };

    setOngoingLogs((current) => [newLog, ...current]);
    setModalOpen(false);
    showToast('Log started. Record the test value to finish it.');
  };

  const handleTestValueChange = (logId, value) => {
    setOngoingTestValues((current) => ({ ...current, [logId]: value }));
  };

  const handleFinishLog = (logId) => {
    const log = ongoingLogs.find((item) => item.id === logId);
    const testValue = (ongoingTestValues[logId] ?? '').trim();

    if (!log || !testValue) {
      return;
    }

    const recordedLog = {
      id: `LOG-${new Date().getFullYear()}-${String(recordedLogs.length + 1).padStart(4, '0')}`,
      date: log.date,
      startTime: log.startTime,
      endTime: getNowTime(),
      instrumentValue: log.instrumentValue,
      instrumentName: log.instrumentName,
      productValue: log.productValue,
      productName: log.productName,
      batchNo: log.batchNo,
      testValue,
      doneBy: log.doneBy,
    };

    onRecordLog?.(recordedLog);
    setOngoingLogs((current) => current.filter((item) => item.id !== logId));
    setOngoingTestValues((current) => {
      const next = { ...current };
      delete next[logId];
      return next;
    });
    showToast('Log recorded successfully.');
  };

  return (
    <AppChrome
      activeNav="equipment-log"
      onNavigate={onNavigate}
      breadcrumbs={[{ key: 'equipment-log', label: 'Equipment Log', current: true }]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      sidebarBadgeCounts={sidebarBadgeCounts}
      pageHeader={
        <section className="bg-white border-bottom px-4 py-3">
          <div className="container-fluid px-0">
            <div className="row align-items-center justify-content-between gx-0 gy-3">
              <div className="col-auto">
                <h1 className="h5 mb-0 fw-semibold text-dark d-flex align-items-center gap-2">
                  <AppIcon name="clipboard-list" size={22} stroke={1.9} />
                  <span>Equipment Log</span>
                </h1>
              </div>
              <div className="col-auto d-flex align-items-center gap-2">
                <SecondaryButton leftIcon="upload" onClick={onBulkUpload}>
                  Bulk upload
                </SecondaryButton>
                <PrimaryButton leftIcon="plus" onClick={openModal}>
                  New log
                </PrimaryButton>
              </div>
            </div>
          </div>
        </section>
      }
    >
      <main className="smplfy-equipment-log-page bg-body-tertiary p-4 min-vh-100">
        <div className="container-fluid px-0 d-grid gap-4">
          {ongoingLogs.length ? (
            <section className="d-grid gap-3">
              <h2 className="h6 mb-0 fw-semibold text-dark">Ongoing logs ({ongoingLogs.length})</h2>
              <div className="row g-3 row-cols-1 row-cols-md-2 row-cols-xl-3">
                {ongoingLogs.map((log) => (
                  <div className="col d-flex" key={log.id}>
                    <OngoingLogCard
                      log={log}
                      testValue={ongoingTestValues[log.id] ?? ''}
                      onTestValueChange={handleTestValueChange}
                      onFinish={handleFinishLog}
                    />
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="d-grid gap-3">
            <h2 className="h6 mb-0 fw-semibold text-dark">Recorded logs ({recordedLogs.length})</h2>

            <EquipmentLogSearchBar
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              onOpenFilters={openFilters}
              activeFilterCount={activeFilterCount}
            />

            <ActiveFilterPills
              filterConfig={filterConfig}
              appliedFilters={appliedFilters}
              onRemoveFilter={removeFilter}
            />

            <DataTable>
              <thead>
                <tr>
                  {RECORDED_COLUMNS.map((column) => (
                    <SortableHeader
                      key={column.key}
                      column={column}
                      sortState={sortState}
                      onSort={handleSort}
                    />
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedRecordedLogs.length ? (
                  sortedRecordedLogs.map((log) => (
                    <tr key={log.id}>
                      <td>{log.srNo}</td>
                      <td>{log.date}</td>
                      <td>{formatTime12h(log.startTime)}</td>
                      <td>{formatTime12h(log.endTime)}</td>
                      <td>{log.instrumentName}</td>
                      <td>{log.productName}</td>
                      <td>{log.batchNo}</td>
                      <td>{log.testValue}</td>
                      <td>{log.doneBy}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={RECORDED_COLUMNS.length} className="text-center text-secondary py-4">
                      No logs recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </DataTable>
          </section>
        </div>
      </main>

      <Modal
        open={modalOpen}
        title="New equipment log"
        titleId="equipment-log-new-title"
        titleIcon="tool"
        onClose={closeModal}
        actions={
          <>
            <SecondaryButton onClick={closeModal}>Cancel</SecondaryButton>
            <PrimaryButton styleVariant="positive" leftIcon="check" onClick={handleStartLog}>
              Start log
            </PrimaryButton>
          </>
        }
      >
        <div className="d-grid gap-3">
          <FormElement
            label="Date"
            inputProps={{
              value: getTodayDisplayDate(),
              disabled: true,
              state: 'disabled',
            }}
          />

          <FormElement
            type="rich-dropdown"
            label="Instrument"
            mandatory
            inputProps={{
              value: draftInstrument,
              placeholder: 'Search and select an instrument',
              options: instrumentOptions,
              searchable: true,
              searchPlaceholder: 'Search instruments',
              state: draftInstrument ? 'filled' : 'default',
              onChange: (event) => {
                setDraftInstrument(event.target.value);
                setFormError('');
              },
            }}
          />

          <FormElement
            type="rich-dropdown"
            label="Product"
            mandatory
            inputProps={{
              value: draftProduct,
              placeholder: 'Search and select a product',
              options: productOptions,
              searchable: true,
              searchPlaceholder: 'Search products',
              state: draftProduct ? 'filled' : 'default',
              onChange: (event) => handleProductChange(event.target.value),
            }}
          />

          <FormElement
            type="rich-dropdown"
            label="Batch No"
            mandatory
            inputProps={{
              value: draftBatch,
              placeholder: draftProduct ? 'Search and select a batch' : 'Select a product first',
              options: batchOptions,
              searchable: true,
              searchPlaceholder: 'Search batches',
              disabled: !draftProduct,
              state: !draftProduct ? 'disabled' : draftBatch ? 'filled' : 'default',
              onChange: (event) => {
                setDraftBatch(event.target.value);
                setFormError('');
              },
            }}
          />

          {formError ? (
            <div className="smplfy-equipment-log-form-error text-danger" role="alert">
              {formError}
            </div>
          ) : null}
        </div>
      </Modal>

      <EquipmentLogFilterDrawer
        open={filtersOpen}
        filterConfig={filterConfig}
        draftFilters={draftFilters}
        onChange={changeDraftFilter}
        onApply={applyFilters}
        onCancel={cancelFilters}
      />

      {toast ? (
        <div className="smplfy-equipment-log-toast-wrap">
          <ToastNotification
            tone={toast.tone}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        </div>
      ) : null}
    </AppChrome>
  );
}
