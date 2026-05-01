import { useMemo, useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import NavSelector from '../components/NavSelector';
import SecondaryButton from '../components/SecondaryButton';
import { allSamplesDb } from '../data/samplesDb';
import { requestCategories, requestSections, requestsForMeBySection } from '../data/requestsForMeData';
import { allTestRequestBuckets } from '../data/testRequestsHomeData';
import './dashboard-page.css';

const dashboardModules = [
  {
    key: 'samples',
    label: 'Samples',
    icon: 'workspace',
    title: 'Samples Dashboard',
    description: 'Manage all sample related information here',
    actionLabel: 'All Samples',
    actionTarget: 'all-samples',
  },
  {
    key: 'instruments',
    label: 'Instruments',
    icon: 'tool',
    title: 'Instruments Dashboard',
    description: 'Monitor equipment availability, calibration status, and maintenance signals here',
    actionLabel: 'Instruments',
    actionTarget: 'instruments',
  },
  {
    key: 'inventory',
    label: 'Inventory',
    icon: 'database',
    title: 'Inventory Dashboard',
    description: 'Track material availability, expiry exposure, and stock risks across the lab',
    actionLabel: 'Materials',
    actionTarget: 'materials',
  },
  {
    key: 'documents',
    label: 'Documents',
    icon: 'file-text',
    title: 'Documents Dashboard',
    description: 'Keep document updates, approval requests, and review pressure visible in one place',
    actionLabel: 'Requests',
    actionTarget: 'requests-for-me',
  },
  {
    key: 'invoice',
    label: 'Invoice',
    icon: 'clipboard-text',
    title: 'Invoice Dashboard',
    description: 'Review release readiness signals that affect customer-facing completion and dispatch',
    actionLabel: 'Workspace',
    actionTarget: 'samples-workspace',
  },
];

const alertFilterOptions = [
  { key: 'all', label: 'All' },
  { key: 'high', label: 'Severe' },
  { key: 'medium', label: 'Med Priority' },
];

function parseDate(value) {
  const normalizedValue = String(value ?? '').trim();

  if (!normalizedValue) {
    return new Date('1970-01-01T00:00:00');
  }

  const [datePart] = normalizedValue.split(',');
  const trimmedDatePart = datePart.trim();
  const slashParts = trimmedDatePart.split('/');

  if (slashParts.length === 3) {
    const [day, month, year] = slashParts;
    return new Date(`${year}-${month}-${day}T00:00:00`);
  }

  const parsed = new Date(trimmedDatePart);
  return Number.isNaN(parsed.getTime()) ? new Date('1970-01-01T00:00:00') : parsed;
}

function buildCount(value) {
  return String(value ?? 0);
}

function extractTimeLabel(value, fallback = '02:34 PM') {
  const normalizedValue = String(value ?? '').trim();

  if (!normalizedValue) {
    return fallback;
  }

  const meridiemMatch = normalizedValue.match(/(\d{1,2}:\d{2}\s?(?:AM|PM))/i);

  if (meridiemMatch) {
    return meridiemMatch[1].toUpperCase();
  }

  const twentyFourHourMatch = normalizedValue.match(/(\d{1,2}):(\d{2})/);

  if (!twentyFourHourMatch) {
    return fallback;
  }

  const hourValue = Number(twentyFourHourMatch[1]);
  const minuteValue = twentyFourHourMatch[2];
  const period = hourValue >= 12 ? 'PM' : 'AM';
  const normalizedHour = hourValue % 12 || 12;

  return `${normalizedHour}:${minuteValue} ${period}`;
}

function groupRowsIntoColumns(rows) {
  return [rows.slice(0, 3), rows.slice(3, 6)];
}

function ModuleTabs({ activeModuleKey, onChange }) {
  return (
    <section className="dashboard-tabs">
      <div className="container-fluid h-100 px-0">
        <div className="dashboard-tabs__rail">
          {dashboardModules.map((module) => (
            <NavSelector
              key={module.key}
              active={module.key === activeModuleKey}
              onClick={() => onChange(module.key)}
            >
              <span className="dashboard-tabs__label">
                <AppIcon name={module.icon} size={16} />
                <span>{module.label}</span>
              </span>
            </NavSelector>
          ))}
        </div>
      </div>
    </section>
  );
}

function PrimaryCard({ module, onNavigate }) {
  return (
    <article className="dashboard-surface dashboard-primary-card">
      <div className="dashboard-primary-card__lead">
        <div className="dashboard-primary-card__icon">
          <AppIcon name={module.icon} size={22} />
        </div>
        <div className="dashboard-primary-card__copy">
          <h1>{module.title}</h1>
          <p>{module.description}</p>
        </div>
      </div>

      <div className="dashboard-primary-card__actions">
        <SecondaryButton
          size="medium"
          rightIcon="external-link"
          onClick={() => onNavigate?.(module.actionTarget)}
        >
          {module.actionLabel}
        </SecondaryButton>
      </div>
    </article>
  );
}

function MetricCard({ title, actionTarget, rows, onNavigate }) {
  const [leftRows, rightRows] = groupRowsIntoColumns(rows);

  return (
    <article className="dashboard-surface dashboard-metric-card">
      <div className="dashboard-metric-card__header">
        <div className="dashboard-metric-card__title-row">
          <AppIcon name="workspace" size={18} />
          <h2>{title}</h2>
        </div>

        <button
          type="button"
          className="btn dashboard-metric-card__icon-button"
          aria-label={`Go to ${title}`}
          onClick={() => onNavigate?.(actionTarget)}
        >
          <AppIcon name="external-link" size={16} />
        </button>
      </div>

      <div className="dashboard-metric-card__body">
        <div className="dashboard-metric-card__column">
          {leftRows.map((row) => (
            <div className="dashboard-metric-card__stat" key={row.label}>
              <span className="dashboard-metric-card__label">{row.label}</span>
              <span className="dashboard-metric-card__value">{row.value}</span>
            </div>
          ))}
        </div>

        <div className="dashboard-metric-card__column">
          {rightRows.map((row) => (
            <div className="dashboard-metric-card__stat" key={row.label}>
              <span className="dashboard-metric-card__label">{row.label}</span>
              <span className="dashboard-metric-card__value">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

function AlertsPanel({ items, filterKey, onFilterChange, onNavigate }) {
  const visibleItems = items.filter((item) => filterKey === 'all' || item.priority === filterKey);
  const groupedItems = visibleItems.reduce((accumulator, item) => {
    accumulator[item.group] = [...(accumulator[item.group] ?? []), item];
    return accumulator;
  }, {});

  return (
    <aside className="dashboard-surface dashboard-alerts">
      <div className="dashboard-alerts__header">
        <div className="dashboard-alerts__title-row">
          <AppIcon name="alert-circle" size={18} />
          <h2>Alerts</h2>
        </div>

        <button
          type="button"
          className="btn dashboard-metric-card__icon-button"
          aria-label="Go to Requests for Me"
        >
          <AppIcon name="external-link" size={16} />
        </button>
      </div>

      <div className="dashboard-alerts__filters">
        {alertFilterOptions.map((option) => (
          <button
            key={option.key}
            type="button"
            className={`btn dashboard-alerts__filter ${filterKey === option.key ? 'is-active' : ''}`}
            onClick={() => onFilterChange(option.key)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="dashboard-alerts__groups">
        {Object.entries(groupedItems).map(([groupName, groupItems]) => (
          <section className="dashboard-alerts__group" key={groupName}>
            <div className="dashboard-alerts__group-title">
              <span>{groupName}</span>
            </div>

            <div className="dashboard-alerts__list">
              {groupItems.map((item) => (
                <div className="dashboard-alerts__item" key={item.id}>
                  <div className="dashboard-alerts__item-icon">
                    <AppIcon name={item.icon} size={14} />
                  </div>
                  <div className="dashboard-alerts__item-copy">
                    <div className="dashboard-alerts__item-title">{item.title}</div>
                    <div className="dashboard-alerts__item-detail">{item.detail}</div>
                  </div>
                  <div className="dashboard-alerts__item-trailing">
                    <div className="dashboard-alerts__item-time">{item.time}</div>
                    <button
                      type="button"
                      className="btn dashboard-metric-card__icon-button dashboard-alerts__item-action"
                      aria-label={`Open ${item.group}`}
                      onClick={() =>
                        onNavigate?.('requests-for-me', {
                          initialSection: item.alertCenterSection,
                          highlightedAlertId: item.id,
                        })
                      }
                    >
                      <AppIcon name="external-link" size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}

function buildModuleCards({
  activeSamples,
  retainedSamplesCount,
  samplesByMode,
  samplesByStatus,
  testRequestsByBucket,
  requestTotal,
  materialAlerts,
  instrumentAlerts,
  envAlerts,
  documentAlerts,
  requestSectionsTotal,
  instruments,
  trainings,
}) {
  const highPriorityAlertsCount = [...materialAlerts, ...instrumentAlerts, ...envAlerts, ...documentAlerts].filter(
    (item) => item.priority === 'high',
  ).length;
  const mediumPriorityAlertsCount = [...materialAlerts, ...instrumentAlerts, ...envAlerts, ...documentAlerts].filter(
    (item) => item.priority === 'medium',
  ).length;
  const calibratedCount = instruments.filter((instrument) => instrument.calibrated === 'Yes').length;
  const uncalibratedCount = instruments.filter((instrument) => instrument.calibrated === 'No').length;
  const maintenanceCount = instrumentAlerts.filter((item) => item.type === 'maintenance').length;
  const breakdownCount = instrumentAlerts.filter((item) => item.type === 'breakdown').length;
  const lowStockCount = materialAlerts.filter((item) => item.title.toLowerCase().includes('low stock')).length;
  const expiredMaterialCount = materialAlerts.filter((item) => item.title.toLowerCase().includes('expired')).length;
  const openSampleCount = (samplesByStatus.Pending ?? 0) + (samplesByStatus['Under Analysis'] ?? 0);

  return {
    samples: [
      {
        title: 'Sample Status',
        actionTarget: 'all-samples',
        rows: [
          { label: 'Pending', value: buildCount(samplesByStatus.Pending ?? 0) },
          { label: 'Under Analysis', value: buildCount(samplesByStatus['Under Analysis'] ?? 0) },
          { label: 'Completed', value: buildCount(samplesByStatus.Completed ?? 0) },
          { label: 'Online', value: buildCount(samplesByMode.Online ?? 0) },
          { label: 'Pickup', value: buildCount(samplesByMode.Pickup ?? 0) },
          { label: 'Retained', value: buildCount(retainedSamplesCount) },
        ],
      },
      {
        title: 'Test Request Queue',
        actionTarget: 'test-requests-home',
        rows: [
          { label: 'Pending Allocation', value: buildCount(testRequestsByBucket['pending-for-allocation'] ?? 0) },
          { label: 'Under Testing', value: buildCount(testRequestsByBucket['allocated-to-me'] ?? 0) },
          { label: 'Pending Approval', value: buildCount(testRequestsByBucket['pending-for-approval'] ?? 0) },
          { label: 'Queue Total', value: buildCount(allTestRequestBuckets.length) },
          { label: 'My Requests', value: buildCount(requestTotal) },
          { label: 'High Priority', value: buildCount(highPriorityAlertsCount) },
        ],
      },
      {
        title: 'Operational Signals',
        actionTarget: 'requests-for-me',
        rows: [
          { label: 'Requests', value: buildCount(requestSectionsTotal.requests ?? 0) },
          { label: 'Material Alerts', value: buildCount(materialAlerts.length) },
          { label: 'Instrument Alerts', value: buildCount(instrumentAlerts.length) },
          { label: 'Env. Alerts', value: buildCount(envAlerts.length) },
          { label: 'Document Alerts', value: buildCount(documentAlerts.length) },
          { label: 'Med Priority', value: buildCount(mediumPriorityAlertsCount) },
        ],
      },
      {
        title: 'Lab Readiness',
        actionTarget: 'samples-workspace',
        rows: [
          { label: 'Active Samples', value: buildCount(openSampleCount) },
          { label: 'Completed Samples', value: buildCount(samplesByStatus.Completed ?? 0) },
          { label: 'Tracked Records', value: buildCount(activeSamples.length) },
          { label: 'Instruments Due', value: buildCount(instrumentAlerts.length) },
          { label: 'Trainings', value: buildCount(trainings.length) },
          { label: 'Needs Review', value: buildCount(highPriorityAlertsCount + mediumPriorityAlertsCount) },
        ],
      },
    ],
    instruments: [
      {
        title: 'Instrument Fleet',
        actionTarget: 'instruments',
        rows: [
          { label: 'Registered', value: buildCount(instruments.length) },
          { label: 'Calibrated', value: buildCount(calibratedCount) },
          { label: 'Uncalibrated', value: buildCount(uncalibratedCount) },
          { label: 'Maintenance', value: buildCount(maintenanceCount) },
          { label: 'Breakdown', value: buildCount(breakdownCount) },
          { label: 'Active Alerts', value: buildCount(instrumentAlerts.length) },
        ],
      },
      {
        title: 'Testing Impact',
        actionTarget: 'test-requests-home',
        rows: [
          { label: 'Open Samples', value: buildCount(openSampleCount) },
          { label: 'Pending Allocation', value: buildCount(testRequestsByBucket['pending-for-allocation'] ?? 0) },
          { label: 'Under Testing', value: buildCount(testRequestsByBucket['allocated-to-me'] ?? 0) },
          { label: 'High Priority', value: buildCount(highPriorityAlertsCount) },
          { label: 'Material Risks', value: buildCount(materialAlerts.length) },
          { label: 'Env. Risks', value: buildCount(envAlerts.length) },
        ],
      },
      {
        title: 'Readiness Signals',
        actionTarget: 'requests-for-me',
        rows: [
          { label: 'Documents', value: buildCount(documentAlerts.length) },
          { label: 'My Requests', value: buildCount(requestTotal) },
          { label: 'Trainings', value: buildCount(trainings.length) },
          { label: 'Low Stock', value: buildCount(lowStockCount) },
          { label: 'Expired Lots', value: buildCount(expiredMaterialCount) },
          { label: 'Priority Load', value: buildCount(highPriorityAlertsCount + mediumPriorityAlertsCount) },
        ],
      },
      {
        title: 'Support Load',
        actionTarget: 'trainings',
        rows: [
          { label: 'This Week Trainings', value: buildCount(Math.min(trainings.length, 2)) },
          { label: 'Upcoming Sessions', value: buildCount(trainings.length) },
          { label: 'Requests', value: buildCount(requestSectionsTotal.requests ?? 0) },
          { label: 'Completed Samples', value: buildCount(samplesByStatus.Completed ?? 0) },
          { label: 'Pending Approval', value: buildCount(testRequestsByBucket['pending-for-approval'] ?? 0) },
          { label: 'Queue Total', value: buildCount(allTestRequestBuckets.length) },
        ],
      },
    ],
    inventory: [
      {
        title: 'Inventory Health',
        actionTarget: 'materials',
        rows: [
          { label: 'Material Alerts', value: buildCount(materialAlerts.length) },
          { label: 'Low Stock', value: buildCount(lowStockCount) },
          { label: 'Expired', value: buildCount(expiredMaterialCount) },
          { label: 'High Priority', value: buildCount(materialAlerts.filter((item) => item.priority === 'high').length) },
          { label: 'Med Priority', value: buildCount(materialAlerts.filter((item) => item.priority === 'medium').length) },
          { label: 'Open Samples', value: buildCount(openSampleCount) },
        ],
      },
      {
        title: 'Testing Dependency',
        actionTarget: 'samples-workspace',
        rows: [
          { label: 'Pending Samples', value: buildCount(samplesByStatus.Pending ?? 0) },
          { label: 'Under Analysis', value: buildCount(samplesByStatus['Under Analysis'] ?? 0) },
          { label: 'Under Testing', value: buildCount(testRequestsByBucket['allocated-to-me'] ?? 0) },
          { label: 'Pending Allocation', value: buildCount(testRequestsByBucket['pending-for-allocation'] ?? 0) },
          { label: 'Pending Approval', value: buildCount(testRequestsByBucket['pending-for-approval'] ?? 0) },
          { label: 'Completed', value: buildCount(samplesByStatus.Completed ?? 0) },
        ],
      },
      {
        title: 'Cross-team Alerts',
        actionTarget: 'requests-for-me',
        rows: [
          { label: 'Instruments', value: buildCount(instrumentAlerts.length) },
          { label: 'Documents', value: buildCount(documentAlerts.length) },
          { label: 'Env. Data', value: buildCount(envAlerts.length) },
          { label: 'My Requests', value: buildCount(requestTotal) },
          { label: 'Sample Requests', value: buildCount(requestCategories.find((item) => item.key === 'samples')?.count ?? 0) },
          { label: 'Datasheet Requests', value: buildCount(requestCategories.find((item) => item.key === 'datasheet')?.count ?? 0) },
        ],
      },
      {
        title: 'Readiness Snapshot',
        actionTarget: 'materials',
        rows: [
          { label: 'Tracked Materials', value: buildCount(materialAlerts.length) },
          { label: 'Priority Load', value: buildCount(highPriorityAlertsCount + mediumPriorityAlertsCount) },
          { label: 'Retained Samples', value: buildCount(retainedSamplesCount) },
          { label: 'Trainings', value: buildCount(trainings.length) },
          { label: 'Calibrated', value: buildCount(calibratedCount) },
          { label: 'Uncalibrated', value: buildCount(uncalibratedCount) },
        ],
      },
    ],
    documents: [
      {
        title: 'Document Control',
        actionTarget: 'requests-for-me',
        rows: [
          { label: 'Document Alerts', value: buildCount(documentAlerts.length) },
          { label: 'High Priority', value: buildCount(documentAlerts.filter((item) => item.priority === 'high').length) },
          { label: 'Med Priority', value: buildCount(documentAlerts.filter((item) => item.priority === 'medium').length) },
          { label: 'My Requests', value: buildCount(requestTotal) },
          { label: 'Sample Requests', value: buildCount(requestCategories.find((item) => item.key === 'samples')?.count ?? 0) },
          { label: 'Datasheet Requests', value: buildCount(requestCategories.find((item) => item.key === 'datasheet')?.count ?? 0) },
        ],
      },
      {
        title: 'Approval Pressure',
        actionTarget: 'test-requests-home',
        rows: [
          { label: 'Pending Approval', value: buildCount(testRequestsByBucket['pending-for-approval'] ?? 0) },
          { label: 'Pending Allocation', value: buildCount(testRequestsByBucket['pending-for-allocation'] ?? 0) },
          { label: 'Under Testing', value: buildCount(testRequestsByBucket['allocated-to-me'] ?? 0) },
          { label: 'Completed', value: buildCount(samplesByStatus.Completed ?? 0) },
          { label: 'Open Samples', value: buildCount(openSampleCount) },
          { label: 'Total Queue', value: buildCount(allTestRequestBuckets.length) },
        ],
      },
      {
        title: 'Associated Risks',
        actionTarget: 'requests-for-me',
        rows: [
          { label: 'Materials', value: buildCount(materialAlerts.length) },
          { label: 'Instruments', value: buildCount(instrumentAlerts.length) },
          { label: 'Env. Data', value: buildCount(envAlerts.length) },
          { label: 'High Priority', value: buildCount(highPriorityAlertsCount) },
          { label: 'Med Priority', value: buildCount(mediumPriorityAlertsCount) },
          { label: 'Trainings', value: buildCount(trainings.length) },
        ],
      },
      {
        title: 'System Snapshot',
        actionTarget: 'samples-workspace',
        rows: [
          { label: 'Tracked Records', value: buildCount(activeSamples.length) },
          { label: 'Retained', value: buildCount(retainedSamplesCount) },
          { label: 'Requests', value: buildCount(requestSectionsTotal.requests ?? 0) },
          { label: 'Calibrated', value: buildCount(calibratedCount) },
          { label: 'Uncalibrated', value: buildCount(uncalibratedCount) },
          { label: 'Trainings', value: buildCount(trainings.length) },
        ],
      },
    ],
    invoice: [
      {
        title: 'Release Readiness',
        actionTarget: 'all-samples',
        rows: [
          { label: 'Completed Samples', value: buildCount(samplesByStatus.Completed ?? 0) },
          { label: 'Open Samples', value: buildCount(openSampleCount) },
          { label: 'Retained', value: buildCount(retainedSamplesCount) },
          { label: 'Pending Approval', value: buildCount(testRequestsByBucket['pending-for-approval'] ?? 0) },
          { label: 'Under Testing', value: buildCount(testRequestsByBucket['allocated-to-me'] ?? 0) },
          { label: 'Queue Total', value: buildCount(allTestRequestBuckets.length) },
        ],
      },
      {
        title: 'Customer-facing Signals',
        actionTarget: 'requests-for-me',
        rows: [
          { label: 'My Requests', value: buildCount(requestTotal) },
          { label: 'Documents', value: buildCount(documentAlerts.length) },
          { label: 'Env. Alerts', value: buildCount(envAlerts.length) },
          { label: 'High Priority', value: buildCount(highPriorityAlertsCount) },
          { label: 'Med Priority', value: buildCount(mediumPriorityAlertsCount) },
          { label: 'Material Risks', value: buildCount(materialAlerts.length) },
        ],
      },
      {
        title: 'Dispatch Constraints',
        actionTarget: 'materials',
        rows: [
          { label: 'Low Stock', value: buildCount(lowStockCount) },
          { label: 'Expired', value: buildCount(expiredMaterialCount) },
          { label: 'Maintenance', value: buildCount(maintenanceCount) },
          { label: 'Breakdown', value: buildCount(breakdownCount) },
          { label: 'Uncalibrated', value: buildCount(uncalibratedCount) },
          { label: 'Trainings', value: buildCount(trainings.length) },
        ],
      },
      {
        title: 'System Load',
        actionTarget: 'samples-workspace',
        rows: [
          { label: 'Pending Samples', value: buildCount(samplesByStatus.Pending ?? 0) },
          { label: 'Under Analysis', value: buildCount(samplesByStatus['Under Analysis'] ?? 0) },
          { label: 'Requests', value: buildCount(requestSectionsTotal.requests ?? 0) },
          { label: 'Documents', value: buildCount(documentAlerts.length) },
          { label: 'Instruments', value: buildCount(instrumentAlerts.length) },
          { label: 'Env. Data', value: buildCount(envAlerts.length) },
        ],
      },
    ],
  };
}

export default function DashboardPage({
  instruments = [],
  trainings = [],
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  sidebarBadgeCounts,
}) {
  const [activeModuleKey, setActiveModuleKey] = useState('samples');
  const [alertFilterKey, setAlertFilterKey] = useState('all');

  const derivedState = useMemo(() => {
    const activeSamples = allSamplesDb.filter((sample) => !['retained', 'disposed'].includes(sample.category));
    const retainedSamplesCount = allSamplesDb.filter((sample) => sample.category === 'retained').length;
    const samplesByStatus = activeSamples.reduce((accumulator, sample) => {
      accumulator[sample.status] = (accumulator[sample.status] ?? 0) + 1;
      return accumulator;
    }, {});
    const samplesByMode = activeSamples.reduce((accumulator, sample) => {
      accumulator[sample.requestMode] = (accumulator[sample.requestMode] ?? 0) + 1;
      return accumulator;
    }, {});
    const testRequestsByBucket = allTestRequestBuckets.reduce((accumulator, request) => {
      accumulator[request.bucket] = (accumulator[request.bucket] ?? 0) + 1;
      return accumulator;
    }, {});

    const materialAlerts = requestsForMeBySection['material-alerts'] ?? [];
    const instrumentAlerts = requestsForMeBySection['instrument-alerts'] ?? [];
    const envAlerts = requestsForMeBySection['env-data-alerts'] ?? [];
    const documentAlerts = requestsForMeBySection['document-alerts'] ?? [];
    const requestTotal = requestSections.reduce((sum, section) => sum + (section.count ?? 0), 0);
    const requestSectionsTotal = requestSections.reduce((accumulator, section) => {
      accumulator[section.key] = section.count ?? 0;
      return accumulator;
    }, {});

    return {
      activeSamples,
      retainedSamplesCount,
      samplesByStatus,
      samplesByMode,
      testRequestsByBucket,
      materialAlerts,
      instrumentAlerts,
      envAlerts,
      documentAlerts,
      requestTotal,
      requestSectionsTotal,
    };
  }, []);

  const moduleMap = Object.fromEntries(dashboardModules.map((module) => [module.key, module]));
  const activeModule = moduleMap[activeModuleKey] ?? dashboardModules[0];
  const moduleCards = buildModuleCards({
    ...derivedState,
    instruments,
    trainings,
  })[activeModuleKey];

  const alertItems = [
    ...derivedState.materialAlerts.map((item) => ({
      id: item.id,
      group: 'Materials',
      title: item.title,
      detail: item.comments,
      time: extractTimeLabel(item.requestedOn, '12:56 PM'),
      priority: item.priority,
      icon: 'materials',
      alertCenterSection: 'material-alerts',
    })),
    ...derivedState.instrumentAlerts.map((item) => ({
      id: item.id,
      group: 'Instruments',
      title: item.type === 'breakdown' ? 'Breakdown' : 'Maintenance',
      detail: item.instrumentName,
      time: extractTimeLabel(item.alertRaisedOn, '02:34 PM'),
      priority: item.priority,
      icon: 'tool',
      alertCenterSection: 'instrument-alerts',
    })),
    ...derivedState.envAlerts.map((item) => ({
      id: item.id,
      group: 'Environmental Data',
      title: item.labName,
      detail: `Data update missed by ${item.priority === 'high' ? '2h 5m' : '1d'}`,
      time: extractTimeLabel(item.due, '02:34 PM'),
      priority: item.priority,
      icon: 'cloud-data',
      alertCenterSection: 'env-data-alerts',
    })),
  ];

  return (
    <AppChrome
      activeNav="dashboard"
      onNavigate={onNavigate}
      breadcrumbs={[{ key: 'dashboard', label: 'Dashboard', current: true }]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      sidebarBadgeCounts={sidebarBadgeCounts}
      pageHeader={<ModuleTabs activeModuleKey={activeModuleKey} onChange={setActiveModuleKey} />}
    >
      <main className="dashboard-page">
        <div className="container-fluid px-0">
          <section className="dashboard-layout">
            <div className="dashboard-layout__main">
              <div className="dashboard-layout__primary">
                <PrimaryCard module={activeModule} onNavigate={onNavigate} />
              </div>

              <div className="dashboard-layout__cards">
                <div className="dashboard-layout__card dashboard-layout__card--a">
                  <MetricCard {...moduleCards[0]} onNavigate={onNavigate} />
                </div>

                <div className="dashboard-layout__card dashboard-layout__card--b">
                  <MetricCard {...moduleCards[1]} onNavigate={onNavigate} />
                </div>

                <div className="dashboard-layout__card dashboard-layout__card--c">
                  <MetricCard {...moduleCards[2]} onNavigate={onNavigate} />
                </div>

                <div className="dashboard-layout__card dashboard-layout__card--d">
                  <MetricCard {...moduleCards[3]} onNavigate={onNavigate} />
                </div>
              </div>
            </div>

            <div className="dashboard-layout__alerts">
              <AlertsPanel
                items={alertItems}
                filterKey={alertFilterKey}
                onFilterChange={setAlertFilterKey}
                onNavigate={onNavigate}
              />
            </div>
          </section>
        </div>
      </main>
    </AppChrome>
  );
}
