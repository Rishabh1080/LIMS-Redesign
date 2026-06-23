import { useEffect, useMemo, useRef, useState } from 'react';
import { GaugeChart } from 'echarts/charts';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import DataTable from '../components/DataTable';
import InstrumentStatusPill, { getInstrumentStatus } from '../components/InstrumentStatusPill';
import { FormElement, ToastNotification } from '../components/FormControls';
import NewServiceModal from '../components/NewServiceModal';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import ReportBreakdownConfirmationModal from '../components/ReportBreakdownConfirmationModal';
import ResolveBreakdownModal from '../components/ResolveBreakdownModal';
import SecondaryButton from '../components/SecondaryButton';
import { getServiceTimelineDate, initialInstrumentServices, isBreakdownServiceType } from '../data/instrumentServices';
import './instruments-page.scss';

echarts.use([GaugeChart, CanvasRenderer]);

const defaultInstruments = [
  { id: 'inst-001', name: 'Stabinger Viscometer', lab: 'Central Lab', uid: 'SVM4K9', serialNo: 'AP-3001-26', make: 'Anton Paar', modelNo: 'SVM 3001', lastServiceOn: '14/04/2026', calibrated: 'Yes', nextServiceOn: '14/10/2026' },
  { id: 'inst-002', name: 'UV-Vis Spectrophotometer', lab: 'Analytical Lab', uid: 'UV9P2Q', serialNo: 'SH-1900-26', make: 'Shimadzu', modelNo: 'UV-1900i', lastServiceOn: '02/03/2026', calibrated: 'No', nextServiceOn: '02/09/2026' },
  { id: 'inst-003', name: 'Gas Chromatograph', lab: 'Organic Lab', uid: 'GC8A41', serialNo: 'AG-8890-26', make: 'Agilent', modelNo: '8890', lastServiceOn: '18/01/2026', calibrated: 'Yes', nextServiceOn: '18/07/2026' },
  { id: 'inst-004', name: 'Atomic Absorption Spectrometer', lab: 'Metals Lab', uid: 'AAS73X', serialNo: 'PE-900T-26', make: 'PerkinElmer', modelNo: 'PinAAcle 900T', lastServiceOn: '05/04/2026', calibrated: 'No', nextServiceOn: '05/10/2026' },
  { id: 'inst-005', name: 'pH Meter', lab: 'QC Lab', uid: 'PHM62D', serialNo: 'MT-SC-26', make: 'Mettler Toledo', modelNo: 'SevenCompact', lastServiceOn: '22/03/2026', calibrated: 'Yes', nextServiceOn: '22/06/2026' },
];

const instrumentHealth = {
  calibrated: 27,
  total: 30,
};

const initialInstrumentFilters = {
  status: '',
  lab: '',
  calibrated: '',
  make: '',
};

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

function getUniqueOptions(items, key) {
  return Array.from(new Set(items.map((item) => item[key]).filter(Boolean))).sort((first, second) =>
    String(first).localeCompare(String(second)),
  );
}

function getServiceTypeTone(serviceType) {
  const normalizedType = String(serviceType ?? '').toLowerCase();

  if (normalizedType === 'calibration') return 'primary';
  if (normalizedType === 'breakdown') return 'danger';
  if (normalizedType === 'maintenance' || normalizedType === 'preventive maintenance') return 'warning';

  return 'secondary';
}

function getServiceDateValue(date) {
  const [day, month, year] = String(date ?? '').split('/').map(Number);

  if (!day || !month || !year) {
    return 0;
  }

  return new Date(year, month - 1, day).getTime();
}

function getReverseChronologicalServices(services) {
  return [...services].sort((firstService, secondService) => {
    const dateDifference = getServiceDateValue(getServiceTimelineDate(secondService)) - getServiceDateValue(getServiceTimelineDate(firstService));

    if (dateDifference !== 0) {
      return dateDifference;
    }

    return String(secondService.id ?? '').localeCompare(String(firstService.id ?? ''));
  });
}

function getTodayIsoDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatIsoDateForDisplay(value) {
  const [year, month, day] = String(value ?? '').split('-');

  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

function getUnresolvedBreakdownService(services, instrumentId) {
  return getReverseChronologicalServices(services).find((service) => (
    service.instrumentId === instrumentId
    && isBreakdownServiceType(service.serviceType || service.type)
    && !service.resolvedOn
  ));
}

function formatShortDate(date) {
  const [day, month, year] = String(date ?? '').split('/');

  if (!day || !month || !year) {
    return date;
  }

  return `${day}/${month}/${year.slice(-2)}`;
}

function InstrumentsHeader({ onNewInstrument, onNewService }) {
  return (
    <section className="bg-white border-bottom px-4 py-3">
      <div className="container-fluid px-0">
        <div className="row align-items-center justify-content-between gx-0 gy-3">
          <div className="col-auto">
            <h1 className="h5 mb-0 fw-semibold text-dark">Instrument Management</h1>
          </div>
          <div className="col-auto d-flex align-items-center gap-3">
            <PrimaryButton leftIcon="plus" onClick={onNewService}>
              New Service
            </PrimaryButton>
            <SecondaryButton leftIcon="plus" onClick={onNewInstrument}>
              New Instrument
            </SecondaryButton>
          </div>
        </div>
      </div>
    </section>
  );
}

function InstrumentTableToolbar({
  searchInputValue,
  appliedSearchValue,
  onSearchInputChange,
  onSearchSubmit,
  onRemoveSearch,
  onOpenFilters,
  filterConfig,
  appliedFilters,
  onRemoveFilter,
  resultCount,
}) {
  const activeEntries = filterConfig
    .map((filter) => ({ ...filter, value: appliedFilters[filter.key] }))
    .filter((filter) => Boolean(filter.value));
  const trimmedSearchValue = appliedSearchValue.trim();
  const resultLabel = trimmedSearchValue
    ? `${resultCount} ${resultCount === 1 ? 'result' : 'results'} found for "${trimmedSearchValue}"`
    : activeEntries.length
      ? `${resultCount} ${resultCount === 1 ? 'result' : 'results'} found`
      : `Listing ${resultCount} ${resultCount === 1 ? 'instrument' : 'instruments'}`;
  const displayedEntries = trimmedSearchValue
    ? [
        {
          key: 'search',
          label: 'Search',
          value: trimmedSearchValue,
          onRemove: onRemoveSearch,
        },
        ...activeEntries,
      ]
    : activeEntries;

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
                placeholder="Search instruments"
                onChange={(event) => onSearchInputChange(event.target.value)}
              />
              <button type="submit" className="smplfy-btn btn btn-primary" aria-label="Search instruments">
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

        {displayedEntries.length ? (
          <div className="d-flex flex-wrap align-items-center gap-2">
            {displayedEntries.map((filter) => (
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
      <div className="smplfy-instruments-count-label text-secondary fw-medium">{resultLabel}</div>
    </section>
  );
}

function InstrumentFiltersDrawer({ open, filterConfig, draftFilters, onChange, onApply, onCancel }) {
  if (!open) {
    return null;
  }

  return (
    <>
      <div className="offcanvas-backdrop fade show" onClick={onCancel} />
      <aside className="smplfy-all-samples-offcanvas offcanvas offcanvas-end show" tabIndex="-1" role="dialog" aria-modal="true" aria-labelledby="instrument-filters-title">
        <div className="offcanvas-header border-bottom">
          <h2 className="offcanvas-title h5 mb-0" id="instrument-filters-title">All Filters</h2>
          <button type="button" className="btn-close" aria-label="Close filters" onClick={onCancel} />
        </div>

        <div className="offcanvas-body d-flex flex-column gap-3">
          {filterConfig.map((filter) => (
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
          <button type="button" className="smplfy-btn btn btn-primary" onClick={onApply}>
            Apply
          </button>
        </div>
      </aside>
    </>
  );
}

function InstrumentCardTitle({ children }) {
  return (
    <h2 className="h5 mb-0 d-flex align-items-center gap-2 fw-semibold text-dark">
      <AppIcon name="tool" size={22} stroke={1.9} />
      <span>{children}</span>
    </h2>
  );
}

function InstrumentHealthGauge({ calibrated, total }) {
  const chartRef = useRef(null);
  const value = total > 0 ? Math.round((calibrated / total) * 100) : 0;

  useEffect(() => {
    const chartNode = chartRef.current;

    if (!chartNode) return undefined;

    const chart = echarts.init(chartNode, null, { renderer: 'canvas' });

    chart.clear();
    chart.setOption({
      animation: false,
      series: [
        {
          type: 'gauge',
          silent: true,
          startAngle: 180,
          endAngle: 0,
          min: 0,
          max: 100,
          center: ['50%', '76%'],
          radius: '110%',
          progress: {
            show: false,
          },
          axisLine: {
            roundCap: true,
            lineStyle: {
              width: 18,
              color: [
                [value / 100, '#00b83f'],
                [1, '#c6f5d0'],
              ],
            },
          },
          pointer: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            show: false,
          },
          axisLabel: {
            show: false,
          },
          anchor: {
            show: false,
          },
          title: {
            show: false,
            formatter: '',
          },
          detail: {
            show: false,
            formatter: '',
            valueAnimation: false,
          },
          data: [
            {
              value,
              name: '',
            },
          ],
        },
      ],
    }, { notMerge: true, lazyUpdate: false });

    const resizeObserver = new ResizeObserver(() => chart.resize());
    resizeObserver.observe(chartNode);

    return () => {
      resizeObserver.disconnect();
      chart.dispose();
    };
  }, [value]);

  return (
    <div
      className="smplfy-instruments-health-meter position-relative"
      role="img"
      aria-label={`${value}% calibrated. ${calibrated} of ${total} instruments are calibrated.`}
    >
      <div ref={chartRef} className="smplfy-instruments-health-chart" aria-hidden="true" />
      <div className="smplfy-instruments-health-copy position-absolute start-50 translate-middle text-center" aria-hidden="true">
        <div className="smplfy-instruments-health-value">{value}%</div>
        <div className="smplfy-instruments-health-label">CALIBRATED</div>
      </div>
    </div>
  );
}

function InstrumentHealthCard() {
  return (
    <section className="smplfy-card card">
      <div className="card-header bg-white d-flex align-items-center">
        <InstrumentCardTitle>Instrument Health</InstrumentCardTitle>
      </div>
      <div className="card-body d-flex flex-column align-items-center justify-content-center text-center">
        <InstrumentHealthGauge
          calibrated={instrumentHealth.calibrated}
          total={instrumentHealth.total}
        />
        <span className="badge rounded-pill bg-success-subtle border border-success-subtle text-success px-3 py-2 fw-medium">
          {instrumentHealth.calibrated}/{instrumentHealth.total} Instruments are calibrated.
        </span>
      </div>
    </section>
  );
}

function getUpdateBadgeClass(tone) {
  if (tone === 'primary') return 'text-primary bg-primary-subtle border border-primary';
  if (tone === 'danger') return 'text-danger bg-danger-subtle border border-danger';
  if (tone === 'warning') return 'text-warning bg-warning-subtle border border-warning';

  return 'text-secondary bg-secondary-subtle border border-secondary';
}

function InstrumentUpdateRow({ service, onOpenService, onCreateFromAlert, onResolveBreakdown }) {
  const serviceType = service.serviceType || service.type;
  const tone = getServiceTypeTone(serviceType);
  const isBreakdown = isBreakdownServiceType(serviceType);

  return (
    <li
      className={joinClasses(
        'list-group-item',
        'd-flex',
        'align-items-center',
        'gap-3',
        'px-3',
        'py-3',
      )}
    >
      <span className="flex-grow-1 d-flex align-items-center gap-2 min-w-0">
        <span className="text-truncate fw-medium">
          {service.instrumentName}
        </span>
        <span
          className={joinClasses(
            'badge',
            'rounded-pill',
            'px-3',
            'py-2',
            'fw-medium',
            'flex-shrink-0',
            getUpdateBadgeClass(tone),
          )}
        >
          {serviceType}
        </span>
      </span>
      <time className="text-nowrap fw-normal">
        {formatShortDate(getServiceTimelineDate(service))}
      </time>
      {isBreakdown ? (
        <PrimaryButton
          size="medium"
          leftIcon="check"
          className="px-2"
          aria-label={`Resolve breakdown for ${service.instrumentName}`}
          onClick={() => onResolveBreakdown?.(service)}
        />
      ) : (
        <SecondaryButton
          size="medium"
          className="px-2"
          aria-label={`Create service for ${service.instrumentName}`}
          onClick={() => onCreateFromAlert?.(service)}
        >
          <AppIcon name="plus" size={18} />
        </SecondaryButton>
      )}
    </li>
  );
}

function InstrumentUpdatesCard({ services, onOpenService, onOpenAllServices, onCreateFromAlert, onResolveBreakdown }) {
  const alertServices = services.filter((service) => (
    !isBreakdownServiceType(service.serviceType || service.type) || !service.resolvedOn
  ));
  const sortedServices = getReverseChronologicalServices(alertServices);

  return (
    <section className="smplfy-card card">
      <div className="card-header bg-white d-flex align-items-center justify-content-between gap-3">
        <InstrumentCardTitle>Alerts ({alertServices.length})</InstrumentCardTitle>
        <div className="d-flex align-items-center gap-2">
          <SecondaryButton size="medium" className="px-2" aria-label="Calendar">
            <AppIcon name="calendar" size={18} />
          </SecondaryButton>
          <SecondaryButton size="medium" rightIcon="external-link" onClick={onOpenAllServices}>
            All services
          </SecondaryButton>
        </div>
      </div>
      <div className="card-body p-0 overflow-auto">
        <ul className="list-group list-group-flush">
          {sortedServices.map((service) => (
            <InstrumentUpdateRow
              key={service.id}
              service={service}
              onOpenService={onOpenService}
              onCreateFromAlert={onCreateFromAlert}
              onResolveBreakdown={onResolveBreakdown}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}

function InstrumentDashboardCards({ services, onOpenService, onOpenAllServices, onCreateFromAlert, onResolveBreakdown }) {
  return (
    <div className="smplfy-instruments-dashboard-cards row g-3 align-items-start">
      <div className="col-12 col-xl-7">
        <InstrumentHealthCard />
      </div>
      <div className="col-12 col-xl-5">
        <InstrumentUpdatesCard
          services={services}
          onOpenService={onOpenService}
          onOpenAllServices={onOpenAllServices}
          onCreateFromAlert={onCreateFromAlert}
          onResolveBreakdown={onResolveBreakdown}
        />
      </div>
    </div>
  );
}

export default function InstrumentsPage({
  instruments = defaultInstruments,
  onNewInstrument,
  onEditInstrument,
  onDeleteInstrument,
  onOpenInstrument,
  onOpenService,
  onOpenAllServices,
  onCreateService,
  onServiceUpdate,
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  initialToast = null,
  services = initialInstrumentServices,
}) {
  const [visibleInstruments, setVisibleInstruments] = useState(instruments);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [serviceModalInstrumentId, setServiceModalInstrumentId] = useState('');
  const [serviceModalServiceType, setServiceModalServiceType] = useState('');
  const [reportBreakdownInstrumentId, setReportBreakdownInstrumentId] = useState('');
  const [resolveBreakdownServiceId, setResolveBreakdownServiceId] = useState('');
  const [searchInputValue, setSearchInputValue] = useState('');
  const [appliedSearchValue, setAppliedSearchValue] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(initialInstrumentFilters);
  const [draftFilters, setDraftFilters] = useState(initialInstrumentFilters);

  useEffect(() => {
    const normalizedSearchValue = appliedSearchValue.trim().toLowerCase();

    setVisibleInstruments(instruments.filter((instrument) => {
      const instrumentStatus = getInstrumentStatus(instrument.id, services) === 'breakdown' ? 'Breakdown' : 'Working';
      const searchableValues = [
        instrument.name,
        instrument.lab,
        instrument.uid,
        instrument.serialNo,
        instrument.make,
        instrument.modelNo,
        instrument.lastServiceOn,
        instrument.calibrated,
        instrument.nextServiceOn,
        instrumentStatus,
      ];
      const matchesSearch =
        !normalizedSearchValue ||
        searchableValues.some((value) => String(value ?? '').toLowerCase().includes(normalizedSearchValue));
      const matchesFilters =
        (!appliedFilters.status || instrumentStatus === appliedFilters.status)
        && (!appliedFilters.lab || instrument.lab === appliedFilters.lab)
        && (!appliedFilters.calibrated || instrument.calibrated === appliedFilters.calibrated)
        && (!appliedFilters.make || instrument.make === appliedFilters.make);

      return matchesSearch && matchesFilters;
    }));
  }, [appliedFilters, appliedSearchValue, instruments, services]);

  useEffect(() => {
    if (!initialToast) return undefined;

    let frameId = window.requestAnimationFrame(() => {
      setToastMessage(initialToast);
      setToastVisible(true);
      window.setTimeout(() => setToastVisible(false), 5000);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const instrumentOptions = instruments.map((instrument) => ({
    value: instrument.id,
    label: instrument.name,
  }));
  const filterConfig = useMemo(() => [
    {
      key: 'status',
      label: 'Status',
      placeholder: 'All statuses',
      options: ['Working', 'Breakdown'],
    },
    {
      key: 'lab',
      label: 'Lab',
      placeholder: 'All labs',
      options: getUniqueOptions(instruments, 'lab'),
    },
    {
      key: 'calibrated',
      label: 'Calibrated?',
      placeholder: 'Any calibration state',
      options: ['Yes', 'No'],
    },
    {
      key: 'make',
      label: 'Make',
      placeholder: 'All makes',
      options: getUniqueOptions(instruments, 'make'),
    },
  ], [instruments]);

  const openFilters = () => {
    setDraftFilters(appliedFilters);
    setFiltersOpen(true);
  };

  const closeFilters = () => {
    setDraftFilters(appliedFilters);
    setFiltersOpen(false);
  };

  const applyFilters = () => {
    setAppliedFilters(draftFilters);
    setFiltersOpen(false);
  };

  const removeFilter = (filterKey) => {
    const nextFilters = { ...appliedFilters, [filterKey]: '' };
    setAppliedFilters(nextFilters);
    setDraftFilters(nextFilters);
  };

  const applySearch = () => {
    setAppliedSearchValue(searchInputValue.trim());
  };

  const removeSearch = () => {
    setSearchInputValue('');
    setAppliedSearchValue('');
  };

  const openNewServiceModal = (instrumentId = '', serviceType = '') => {
    setServiceModalInstrumentId(instrumentId);
    setServiceModalServiceType(serviceType);
    setServiceModalOpen(true);
  };

  const handleCreateService = (draft) => {
    const createdService = onCreateService?.(draft);
    setServiceModalOpen(false);

    if (createdService) {
      setToastMessage('Service created successfully.');
      setToastVisible(false);
      window.requestAnimationFrame(() => {
        setToastVisible(true);
        window.setTimeout(() => setToastVisible(false), 5000);
      });
    }
  };

  const selectedBreakdownInstrument = instruments.find((instrument) => instrument.id === reportBreakdownInstrumentId)
    ?? visibleInstruments.find((instrument) => instrument.id === reportBreakdownInstrumentId);
  const selectedResolveService = services.find((service) => service.id === resolveBreakdownServiceId);

  const handleConfirmReportBreakdown = () => {
    if (!selectedBreakdownInstrument) return;

    const createdService = onCreateService?.({
      instrumentId: selectedBreakdownInstrument.id,
      serviceType: 'Breakdown',
      serviceDate: getTodayIsoDate(),
      details: `Breakdown reported for ${selectedBreakdownInstrument.name}.`,
    });

    setReportBreakdownInstrumentId('');

    if (createdService) {
      setToastMessage('Instrument marked as broken.');
      setToastVisible(false);
      window.requestAnimationFrame(() => {
        setToastVisible(true);
        window.setTimeout(() => setToastVisible(false), 5000);
      });
    }
  };

  const handleResolveBreakdown = (draft) => {
    if (!selectedResolveService) return;

    onServiceUpdate?.({
      ...selectedResolveService,
      status: 'Pending',
      stage: 'pending-default',
      resolvedOn: new Date().toLocaleDateString('en-GB'),
      resolutionServiceDate: formatIsoDateForDisplay(draft.serviceDate),
      resolutionVendor: draft.vendor,
      resolutionAttachment: draft.attachment,
      resolutionCost: draft.cost,
      resolutionComments: draft.comments,
    });

    setResolveBreakdownServiceId('');
    setToastMessage('Breakdown resolved.');
    setToastVisible(false);
    window.requestAnimationFrame(() => {
      setToastVisible(true);
      window.setTimeout(() => setToastVisible(false), 5000);
    });
  };

  return (
    <AppChrome
      activeNav="instruments"
      onNavigate={onNavigate}
      breadcrumbs={[{ key: 'instruments', label: 'Instruments', current: true }]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      pageHeader={
        <InstrumentsHeader
          onNewInstrument={onNewInstrument}
          onNewService={() => openNewServiceModal()}
        />
      }
    >
      <main className="smplfy-instruments-page bg-body-tertiary p-4 min-vh-100">
        <div className="container-fluid px-0 d-grid gap-3">
          <InstrumentDashboardCards
            services={services}
            onOpenService={onOpenService}
            onOpenAllServices={onOpenAllServices}
            onCreateFromAlert={(service) => openNewServiceModal(service.instrumentId, service.serviceType || service.type)}
            onResolveBreakdown={(service) => setResolveBreakdownServiceId(service.id)}
          />

          <InstrumentTableToolbar
            searchInputValue={searchInputValue}
            appliedSearchValue={appliedSearchValue}
            onSearchInputChange={setSearchInputValue}
            onSearchSubmit={applySearch}
            onRemoveSearch={removeSearch}
            onOpenFilters={openFilters}
            filterConfig={filterConfig}
            appliedFilters={appliedFilters}
            onRemoveFilter={removeFilter}
            resultCount={visibleInstruments.length}
          />

          <DataTable stickyActionColumn>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Status</th>
                <th scope="col">Lab</th>
                <th scope="col">UID</th>
                <th scope="col">Serial no</th>
                <th scope="col">Make</th>
                <th scope="col">Model</th>
                <th scope="col">Last Service on</th>
                <th scope="col">Calibrated?</th>
                <th scope="col">Next Service on</th>
                <th scope="col" className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {visibleInstruments.map((instrument) => {
                const instrumentStatus = getInstrumentStatus(instrument.id, services);
                const unresolvedBreakdownService = getUnresolvedBreakdownService(services, instrument.id);
                const isInstrumentBreakdown = instrumentStatus === 'breakdown' && unresolvedBreakdownService;

                return (
                <tr key={instrument.id}>
                  <td>
                    <a
                      href="/"
                      className="smplfy-link link-primary p-0"
                      onClick={(e) => { e.preventDefault(); onOpenInstrument?.(instrument.id, instrument.name); }}
                    >
                      <span>{instrument.name}</span>
                    </a>
                  </td>
                  <td className="text-nowrap">
                    <InstrumentStatusPill status={instrumentStatus} />
                  </td>
                  <td className="text-nowrap">
                    {instrument.lab}
                  </td>
                  <td className="text-nowrap">
                    {instrument.uid}
                  </td>
                  <td className="text-nowrap">
                    {instrument.serialNo}
                  </td>
                  <td className="text-nowrap">
                    {instrument.make}
                  </td>
                  <td className="text-nowrap">
                    {instrument.modelNo}
                  </td>
                  <td className="text-nowrap">
                    {instrument.lastServiceOn}
                  </td>
                  <td className="text-nowrap">
                    {instrument.calibrated}
                  </td>
                  <td className="text-nowrap">
                    {instrument.nextServiceOn}
                  </td>
                  <td className="text-nowrap">
                    <div className="d-flex align-items-center gap-2 flex-nowrap">
                      {isInstrumentBreakdown ? (
                        <PrimaryButton
                          size="medium"
                          leftIcon="check"
                          onClick={() => setResolveBreakdownServiceId(unresolvedBreakdownService.id)}
                        >
                          Resolve
                        </PrimaryButton>
                      ) : (
                        <SecondaryButton
                          size="medium"
                          tone="danger"
                          leftIcon="alert-circle"
                          onClick={() => setReportBreakdownInstrumentId(instrument.id)}
                        >
                          Report Breakdown
                        </SecondaryButton>
                      )}
                      <SecondaryButton
                        size="medium"
                        leftIcon="edit"
                        onClick={() => onEditInstrument?.(instrument.id)}
                      >
                        Edit
                      </SecondaryButton>
                      <SecondaryButton
                        size="medium"
                        tone="danger"
                        leftIcon="trash"
                        aria-label={`Delete ${instrument.name}`}
                        onClick={() => onDeleteInstrument?.(instrument.id)}
                      />
                    </div>
                  </td>
                </tr>
                );
              })}
              {visibleInstruments.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center text-secondary">
                    No instruments found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </DataTable>
        </div>
      </main>

      <NewServiceModal
        open={serviceModalOpen}
        instrumentOptions={instrumentOptions}
        initialInstrumentId={serviceModalInstrumentId}
        initialServiceType={serviceModalServiceType}
        showInstrumentField
        onCancel={() => setServiceModalOpen(false)}
        onSubmit={handleCreateService}
      />

      <ReportBreakdownConfirmationModal
        open={Boolean(selectedBreakdownInstrument)}
        instrumentName={selectedBreakdownInstrument?.name}
        onCancel={() => setReportBreakdownInstrumentId('')}
        onConfirm={handleConfirmReportBreakdown}
      />

      <ResolveBreakdownModal
        open={Boolean(selectedResolveService)}
        breakdownDate={selectedResolveService?.breakdownDate}
        onCancel={() => setResolveBreakdownServiceId('')}
        onSubmit={handleResolveBreakdown}
      />

      <InstrumentFiltersDrawer
        open={filtersOpen}
        filterConfig={filterConfig}
        draftFilters={draftFilters}
        onChange={(key, value) => setDraftFilters((current) => ({ ...current, [key]: value }))}
        onApply={applyFilters}
        onCancel={closeFilters}
      />

      <ToastNotification
        state={toastVisible ? 'default' : 'gone'}
        message={toastMessage}
        className="position-fixed bottom-0 start-0 m-4"
        onClose={() => setToastVisible(false)}
      />
    </AppChrome>
  );
}
