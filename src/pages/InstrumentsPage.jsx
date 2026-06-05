import { useEffect, useRef, useState } from 'react';
import { GaugeChart } from 'echarts/charts';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import DataTable from '../components/DataTable';
import { ToastNotification } from '../components/FormControls';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import { initialInstrumentServices } from '../data/instrumentServices';
import './instruments-page.scss';

echarts.use([GaugeChart, CanvasRenderer]);

const defaultInstruments = [
  { id: 'inst-001', name: 'Stabinger Viscometer', lastServiceOn: '14/04/2026', calibrated: 'Yes', nextServiceOn: '14/10/2026' },
  { id: 'inst-002', name: 'UV-Vis Spectrophotometer', lastServiceOn: '02/03/2026', calibrated: 'No', nextServiceOn: '02/09/2026' },
  { id: 'inst-003', name: 'Gas Chromatograph', lastServiceOn: '18/01/2026', calibrated: 'Yes', nextServiceOn: '18/07/2026' },
  { id: 'inst-004', name: 'Atomic Absorption Spectrometer', lastServiceOn: '05/04/2026', calibrated: 'No', nextServiceOn: '05/10/2026' },
  { id: 'inst-005', name: 'pH Meter', lastServiceOn: '22/03/2026', calibrated: 'Yes', nextServiceOn: '22/06/2026' },
];

const instrumentHealth = {
  calibrated: 27,
  total: 30,
};

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

function getServiceTypeTone(serviceType) {
  const normalizedType = String(serviceType ?? '').toLowerCase();

  if (normalizedType === 'calibration') return 'primary';
  if (normalizedType === 'breakdown') return 'danger';
  if (normalizedType === 'maintenance') return 'warning';

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
    const dateDifference = getServiceDateValue(secondService.serviceDate) - getServiceDateValue(firstService.serviceDate);

    if (dateDifference !== 0) {
      return dateDifference;
    }

    return String(secondService.id ?? '').localeCompare(String(firstService.id ?? ''));
  });
}

function formatShortDate(date) {
  const [day, month, year] = String(date ?? '').split('/');

  if (!day || !month || !year) {
    return date;
  }

  return `${day}/${month}/${year.slice(-2)}`;
}

function InstrumentsHeader({ onNewInstrument, onCalibrationSchedule }) {
  return (
    <section className="bg-white border-bottom px-4 py-3">
      <div className="container-fluid px-0">
        <div className="row align-items-center justify-content-between gx-0 gy-3">
          <div className="col-auto">
            <h1 className="h5 mb-0 fw-semibold text-dark">Instrument Management</h1>
          </div>
          <div className="col-auto d-flex align-items-center gap-3">
            <SecondaryButton leftIcon="calendar" onClick={onCalibrationSchedule}>
              Calibration Schedule
            </SecondaryButton>
            <PrimaryButton leftIcon="plus" onClick={onNewInstrument}>
              New Instrument
            </PrimaryButton>
          </div>
        </div>
      </div>
    </section>
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

function InstrumentUpdateRow({ service, onOpenService }) {
  const serviceType = service.serviceType || service.type;
  const tone = getServiceTypeTone(serviceType);

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
      <span
        className={joinClasses(
          'badge',
          'rounded-pill',
          'px-3',
          'py-2',
          'fw-medium',
          getUpdateBadgeClass(tone),
        )}
      >
        {serviceType}
      </span>
      <span className="flex-grow-1 text-truncate fw-medium">
        {service.instrumentName}
      </span>
      <time className="text-nowrap fw-normal">
        {formatShortDate(service.serviceDate)}
      </time>
      <SecondaryButton
        size="medium"
        className="px-2"
        aria-label={`Open ${String(serviceType).toLowerCase()} service for ${service.instrumentName}`}
        onClick={() =>
          onOpenService?.(
            {
              ...service,
              serviceType,
            },
            {
              instrumentId: service.instrumentId,
              instrumentName: service.instrumentName,
            },
          )
        }
      >
        <AppIcon name="external-link" size={18} />
      </SecondaryButton>
    </li>
  );
}

function InstrumentUpdatesCard({ services, onOpenService, onOpenAllServices }) {
  const sortedServices = getReverseChronologicalServices(services);

  return (
    <section className="smplfy-card card">
      <div className="card-header bg-white d-flex align-items-center justify-content-between gap-3">
        <InstrumentCardTitle>Updates ({services.length})</InstrumentCardTitle>
        <SecondaryButton size="medium" rightIcon="external-link" onClick={onOpenAllServices}>
          All services
        </SecondaryButton>
      </div>
      <div className="card-body p-0 overflow-auto">
        <ul className="list-group list-group-flush">
          {sortedServices.map((service) => (
            <InstrumentUpdateRow key={service.id} service={service} onOpenService={onOpenService} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function InstrumentDashboardCards({ services, onOpenService, onOpenAllServices }) {
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
  onCalibrationSchedule,
  onOpenInstrument,
  onOpenService,
  onOpenAllServices,
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  initialToast = null,
  services = initialInstrumentServices,
}) {
  const [visibleInstruments, setVisibleInstruments] = useState(instruments);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    setVisibleInstruments(instruments);
  }, [instruments]);

  useEffect(() => {
    if (!initialToast) return undefined;

    let frameId = window.requestAnimationFrame(() => {
      setToastMessage(initialToast);
      setToastVisible(true);
      window.setTimeout(() => setToastVisible(false), 5000);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

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
          onCalibrationSchedule={onCalibrationSchedule}
        />
      }
    >
      <main className="smplfy-instruments-page bg-body-tertiary p-4 min-vh-100">
        <div className="container-fluid px-0 d-grid gap-3">
          <InstrumentDashboardCards
            services={services}
            onOpenService={onOpenService}
            onOpenAllServices={onOpenAllServices}
          />

          <DataTable>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Last Service on</th>
                <th scope="col">Calibrated?</th>
                <th scope="col">Next Service on</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {visibleInstruments.map((instrument) => (
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
                      <SecondaryButton
                        size="medium"
                        leftIcon="edit"
                        onClick={() => onEditInstrument?.(instrument.id)}
                      >
                        Edit
                      </SecondaryButton>
                      <SecondaryButton
                        size="medium"
                        leftIcon="trash"
                        onClick={() => onDeleteInstrument?.(instrument.id)}
                      >
                        Delete
                      </SecondaryButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        </div>
      </main>

      <ToastNotification
        state={toastVisible ? 'default' : 'gone'}
        message={toastMessage}
        onClose={() => setToastVisible(false)}
      />
    </AppChrome>
  );
}
