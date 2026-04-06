import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import './test-requests-listing-page.css';

const requestRows = [
  {
    id: 'URLS/26/ULRS/O/2026/30/330',
    status: 'Not allocated',
    parameter: 'Total Iron as Fe',
    testMethod: 'IS:3025 (Part 53) 2024',
    product: 'Boiler Water',
    age: '30 min ago',
    reportingDate: '31/ 03/ 2026 05:30',
  },
  {
    id: 'URLS/26/ULRS/O/2026/30/331',
    status: 'Not allocated',
    parameter: 'Total Hardness as CaCO3',
    testMethod: 'IS:3025 (Part 53) 2024',
    product: 'Boiler Water',
    age: '30 min ago',
    reportingDate: '31/ 03/ 2026 05:30',
  },
  {
    id: 'URLS/26/ULRS/O/2026/30/332',
    status: 'Not allocated',
    parameter: 'Total Dissolved Solids',
    testMethod: 'IS:3025 (Part 53) 2024',
    product: 'Boiler Water',
    age: '30 min ago',
    reportingDate: '31/ 03/ 2026 05:30',
  },
  {
    id: 'URLS/26/ULRS/O/2026/30/333',
    status: 'Not allocated',
    parameter: 'Total Alkalinity as CaCO3',
    testMethod: 'IS:3025 (Part 53) 2024',
    product: 'Boiler Water',
    age: '30 min ago',
    reportingDate: '31/ 03/ 2026 05:30',
  },
  {
    id: 'URLS/26/ULRS/O/2026/30/334',
    status: 'Not allocated',
    parameter: 'Dissolved Oxygen',
    testMethod: 'IS:3025 (Part 53) 2024',
    product: 'Boiler Water',
    age: '30 min ago',
    reportingDate: '31/ 03/ 2026 05:30',
  },
];

const jobRows = [
  {
    id: 'URLS/O/26-27',
    status: 'Datasheet Created/Not allocated',
    tone: 'neutral',
    product: 'Boiler Water',
    age: '30 minutes ago',
    reportingDate: '31/ 03/ 2026 05:30',
    action: 'allocate',
  },
  {
    id: 'URLS/O/26-27',
    status: 'Under Testing',
    tone: 'info',
    product: 'Boiler Water',
    age: '30 minutes ago',
    reportingDate: '31/ 03/ 2026 05:30',
    action: 'view',
  },
  {
    id: 'URLS/O/26-27',
    status: 'Under Approval',
    tone: 'warning',
    product: 'Boiler Water',
    age: '30 minutes ago',
    reportingDate: '31/ 03/ 2026 05:30',
    action: 'view',
  },
  {
    id: 'URLS/O/26-27',
    status: 'Rejected',
    tone: 'danger',
    product: 'Boiler Water',
    age: '30 minutes ago',
    reportingDate: '31/ 03/ 2026 05:30',
    action: 'view',
  },
  {
    id: 'URLS/O/26-27',
    status: 'Approved',
    tone: 'success',
    product: 'Boiler Water',
    age: '30 minutes ago',
    reportingDate: '31/ 03/ 2026 05:30',
    action: 'view',
  },
];

function PageHeader({ onBack }) {
  return (
    <section className="tr-listing-page-header">
      <div className="tr-listing-page-header__title-wrap">
        <button className="tr-listing-page-header__back btn" aria-label="Go back" onClick={onBack}>
          <AppIcon name="chevron-left" />
        </button>
        <h1>All Test Requests</h1>
      </div>
    </section>
  );
}

function RequestStatusPill({ children, tone = 'neutral' }) {
  return <span className={`tr-pill tr-pill--${tone}`}>{children}</span>;
}

function ExternalViewButton() {
  return (
    <button className="tr-action-icon btn" aria-label="Open request">
      <AppIcon name="more" size={16} />
    </button>
  );
}

function ViewButton() {
  return (
    <button className="tr-secondary-action btn">
      <AppIcon name="more" size={16} />
      <span>View</span>
    </button>
  );
}

function AllocateButton() {
  return (
    <button className="tr-primary-action btn">
      <AppIcon name="workspace" size={16} />
      <span>Allocate</span>
    </button>
  );
}

function RequestsCard() {
  return (
    <section className="tr-card tr-card--requests">
      <div className="tr-card__header">
        <div className="tr-card__title">5 Test Requests</div>
        <PrimaryButton leftIcon="plus">Create Job</PrimaryButton>
      </div>

      <div className="tr-grid tr-grid--requests tr-grid--head">
        <div>Test Request ID</div>
        <div>Status</div>
        <div>Parameter</div>
        <div>Test Method</div>
        <div>Product</div>
        <div>Age</div>
        <div>Target Reporting Date</div>
        <div>Action</div>
      </div>

      <div className="tr-card__rows">
        {requestRows.map((row) => (
          <div className="tr-grid tr-grid--requests tr-grid--row" key={row.id + row.parameter}>
            <a href="/" className="tr-link" onClick={(event) => event.preventDefault()}>
              {row.id}
            </a>
            <div className="tr-request-status-cell">
              <RequestStatusPill>{row.status}</RequestStatusPill>
            </div>
            <div className="tr-cell--truncate">{row.parameter}</div>
            <div className="tr-cell--truncate">{row.testMethod}</div>
            <div>{row.product}</div>
            <div>{row.age}</div>
            <div>{row.reportingDate}</div>
            <div className="tr-request-actions">
              <AllocateButton />
              <ExternalViewButton />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function JobsCard() {
  return (
    <section className="tr-card tr-card--jobs">
      <div className="tr-card__header tr-card__header--simple">
        <div className="tr-card__title">5 Jobs</div>
      </div>

      <div className="tr-grid tr-grid--jobs tr-grid--head">
        <div>Test Request ID</div>
        <div>Status</div>
        <div>Product</div>
        <div>Age</div>
        <div>Target Reporting Date</div>
        <div>Action</div>
      </div>

      <div className="tr-card__rows">
        {jobRows.map((row, index) => (
          <div className="tr-grid tr-grid--jobs tr-grid--row" key={row.status + index}>
            <a href="/" className="tr-link" onClick={(event) => event.preventDefault()}>
              {row.id}
            </a>
            <div className="tr-job-status-cell">
              <RequestStatusPill tone={row.tone}>{row.status}</RequestStatusPill>
            </div>
            <div>{row.product}</div>
            <div>{row.age}</div>
            <div>{row.reportingDate}</div>
            <div className="tr-job-actions">
              {row.action === 'allocate' ? <AllocateButton /> : null}
              <ViewButton />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function TestRequestsListingPage({
  sampleId = 'IICT/2025-2026/1101',
  onBack,
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
}) {
  return (
    <AppChrome
      activeNav="all-samples"
      onNavigate={onNavigate}
      breadcrumbs={[
        { key: 'all-samples', label: 'All Samples' },
        { key: sampleId, label: sampleId },
        { key: 'all-test-requests', label: 'All Test Requests', current: true },
      ]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
    >
      <PageHeader onBack={onBack} />

      <main className="tr-listing-page">
        <RequestsCard />
        <JobsCard />
      </main>
    </AppChrome>
  );
}
