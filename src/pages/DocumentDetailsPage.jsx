import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import SecondaryButton from '../components/SecondaryButton';
import './sample-details-page.scss';
import './document-details-page.scss';

const fallbackDocument = {
  id: 'visit-tvs-motors',
  name: 'Visit to TVS Motors',
  description: 'Customer visit report and meeting notes.',
  categoryName: 'SOP Documents',
  subCategoryName: 'Visit Report',
  createdOn: '12/02/26 12:36 PM',
  fileName: 'visit-to-tvs-motors.pdf',
};

const documentActivityItems = [
  {
    label: 'Document opened',
    time: '12:36 PM',
    date: '12/02/26',
    person: 'Rishabh Gangwar',
    tone: 'info',
  },
  {
    label: 'Document approved',
    time: '12:18 PM',
    date: '12/02/26',
    person: 'Document Controller',
    tone: 'success',
  },
  {
    label: 'Document uploaded',
    time: '11:42 AM',
    date: '12/02/26',
    person: 'Quality Analyst',
    tone: 'neutral',
  },
];

function DocumentDetailsHeader({ document, onBack }) {
  return (
    <section className="smplfy-sample-details-header bg-white border-bottom">
      <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
        <div className="d-flex align-items-start gap-3 min-w-0">
          <SecondaryButton
            size="medium"
            leftIcon="chevron-left"
            className="px-0 flex-shrink-0"
            aria-label="Go back"
            onClick={onBack}
          />

          <div className="d-flex flex-column min-w-0">
            <h1 className="h5 mb-0 fw-semibold text-dark text-truncate">{document.name}</h1>
            <div className="d-inline-flex gap-2 text-secondary fw-medium mt-2">
              <span>{document.createdOn}</span>
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-3 flex-wrap">
          <SecondaryButton leftIcon="download" size="large">
            Download
          </SecondaryButton>
        </div>
      </div>
    </section>
  );
}

function DocumentContentCard() {
  return (
    <div className="smplfy-card card overflow-hidden">
      <section>
        <div className="card-header d-flex align-items-center">
          <h2 className="card-title mb-0">Preview</h2>
        </div>
        <div className="smplfy-document-details-preview d-flex flex-column align-items-center justify-content-center text-center">
          <AppIcon name="file-text" size={48} className="text-primary mb-3" />
          <div className="fw-semibold text-dark">Document preview</div>
          <div className="text-secondary mt-1">Record Entire Screen</div>
        </div>
      </section>
    </div>
  );
}

function RequestTrailCard() {
  return (
    <section className="smplfy-card card smplfy-sample-details-action is-resolved overflow-hidden">
      <div className="card-header d-flex align-items-center gap-3">
        <AppIcon name="check" size={24} stroke={2} />
        <span>No pending actions</span>
      </div>
      <div className="card-body">
        <p className="mb-0">No pending actions required from your end</p>
      </div>
    </section>
  );
}

function DocumentActivityRail() {
  return (
    <section className="smplfy-sample-details-activity">
      <div className="d-flex align-items-center justify-content-between">
        <h2>Activity</h2>
        <button className="smplfy-btn btn btn-link p-0 border-0 text-decoration-underline" type="button">See all</button>
      </div>
      <ol className="smplfy-sample-details-timeline list-unstyled mb-0">
        {documentActivityItems.map((item) => (
          <li className={`is-${item.tone}`} key={item.label}>
            <span />
            <div>
              <div>{item.label}</div>
              <div>
                <span>{item.time}</span>
                <span>{item.date}</span>
                {item.person ? <span>{item.person}</span> : null}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function DocumentDetailsPage({
  document,
  sourcePage = 'document-management',
  sourceLabel = 'Document Management',
  onBack,
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  sidebarBadgeCounts,
}) {
  const resolvedDocument = {
    ...fallbackDocument,
    ...document,
    createdOn: document?.createdOn || fallbackDocument.createdOn,
  };

  return (
    <AppChrome
      activeNav={sourcePage}
      onNavigate={onNavigate}
      breadcrumbs={[
        { key: sourcePage, label: sourceLabel },
        { key: 'document-details', label: resolvedDocument.name, current: true },
      ]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      sidebarBadgeCounts={sidebarBadgeCounts}
      pageHeader={<DocumentDetailsHeader document={resolvedDocument} onBack={onBack} />}
    >
      <main className="smplfy-sample-details-page smplfy-document-details-page bg-body-tertiary p-4 min-vh-100">
        <div className="smplfy-sample-details-layout d-grid">
          <div className="smplfy-sample-details-main-panel">
            <DocumentContentCard />
          </div>

          <aside className="smplfy-sample-details-rail">
            <RequestTrailCard />
            <DocumentActivityRail />
          </aside>
        </div>
      </main>
    </AppChrome>
  );
}
