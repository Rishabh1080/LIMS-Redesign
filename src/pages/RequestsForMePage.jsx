import { useEffect, useMemo, useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import Modal from '../components/Modal/Modal';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import { getStatusPresentation } from '../status/statusRegistry';
import {
  getRequestsForCategory,
  getRequestsForSection,
  requestCategories,
  requestSections,
} from '../data/requestsForMeData';
import '../styles.scss';
import './requests-for-me-page.scss';

function normalizeRetentionLabel(value) {
  return value === 'To be retained' ? 'Retained' : value;
}

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

const neutralStatusClassByColor = {
  gray: 'text-secondary bg-secondary-subtle border border-secondary-subtle',
  blue: 'text-primary bg-primary-subtle border border-primary-subtle',
  red: 'text-danger bg-danger-subtle border border-danger-subtle',
  orange: 'text-warning bg-warning-subtle border border-warning',
  green: 'text-success bg-success-subtle border border-success-subtle',
  yellow: 'text-warning-emphasis bg-warning-subtle border border-warning-subtle',
};

const strongStatusClassByColor = {
  gray: 'text-bg-secondary',
  blue: 'text-bg-primary',
  red: 'text-bg-danger',
  orange: 'text-bg-warning border border-warning',
  green: 'text-bg-success',
  yellow: 'text-bg-warning border border-warning-subtle',
};

function getStatusBadgeClassName(presentation) {
  const color = presentation.color ?? 'gray';
  const variantClass = presentation.styleType === 'strong'
    ? strongStatusClassByColor[color] ?? strongStatusClassByColor.gray
    : neutralStatusClassByColor[color] ?? neutralStatusClassByColor.gray;

  return joinClasses('smplfy-badge', 'badge', variantClass);
}

function StatusBadge({ presentation }) {
  return (
    <span className={getStatusBadgeClassName(presentation)}>
      {presentation.label}
    </span>
  );
}

function getAlertRowClassName({ priority, highlighted = false, animatedHighlight = false }) {
  const priorityClassName = priority === 'high' ? 'text-bg-danger' : 'text-bg-warning';

  return [
    'smplfy-alert-row',
    'list-group-item',
    priorityClassName,
    highlighted ? 'border-primary' : '',
    animatedHighlight ? 'smplfy-alert-row-arrival' : '',
  ]
    .filter(Boolean)
    .join(' ');
}

const requestApprovalRows = [
  { sr: '1', approverName: 'Technical Assistant', status: 'Approved', daysTaken: '4', decisionOn: '01-04-2026 12:34', comments: 'No comments' },
  { sr: '2', approverName: 'Technical Assistant', status: 'Approved', daysTaken: '4', decisionOn: '01-04-2026 12:34', comments: 'No comments' },
  { sr: '3', approverName: 'Technical Assistant', status: 'Approved', daysTaken: '4', decisionOn: '01-04-2026 12:34', comments: 'No comments' },
  { sr: '4', approverName: 'Technical Assistant', status: 'Approved', daysTaken: '4', decisionOn: '01-04-2026 12:34', comments: 'No comments' },
  { sr: '5', approverName: 'Technical Assistant', status: 'Approved', daysTaken: '4', decisionOn: '01-04-2026 12:34', comments: 'No comments' },
  { sr: '6', approverName: 'Technical Assistant', status: 'Approved', daysTaken: '4', decisionOn: '01-04-2026 12:34', comments: 'No comments' },
  { sr: '7', approverName: 'Technical Assistant', status: 'Approved', daysTaken: '4', decisionOn: '01-04-2026 12:34', comments: 'No comments' },
  { sr: '8', approverName: 'Technical Assistant', status: 'Approved', daysTaken: '4', decisionOn: '01-04-2026 12:34', comments: 'No comments' },
  { sr: '9', approverName: 'Technical Assistant', status: 'Approved', daysTaken: '4', decisionOn: '01-04-2026 12:34', comments: 'No comments' },
  { sr: '10', approverName: 'Technical Assistant', status: 'Approved', daysTaken: '4', decisionOn: '01-04-2026 12:34', comments: 'No comments' },
];

function RequestsHeader({ sections, activeSection, onSectionChange }) {
  return (
    <section className="smplfy-requests-tabs">
      <div className="container-fluid h-100 px-4">
        <div className="row h-100 gx-0 align-items-stretch flex-nowrap">
          <div className="col">
            <nav className="nav" aria-label="Request sections">
              {sections.map((section) => (
                <button
                  key={section.key}
                  type="button"
                  className={joinClasses('smplfy-nav-link', 'nav-link', activeSection === section.key ? 'active' : '')}
                  aria-current={activeSection === section.key ? 'page' : undefined}
                  onClick={() => onSectionChange(section.key)}
                >
                  <span className="d-inline-flex align-items-center gap-2">
                    <AppIcon name={section.icon} size={14} />
                    <span>{section.label}</span>
                  </span>
                  {section.count ? <span className="smplfy-badge badge text-bg-danger">{section.count}</span> : null}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryFilter({ activeCategory, onCategoryChange }) {
  return (
    <section className="smplfy-requests-categories">
      <div className="container-fluid px-4">
        <div className="d-flex align-items-center gap-3">
          <div className="flex-shrink-0 fw-medium text-body">Categories:</div>
          <nav className="nav nav-pills" aria-label="Request categories">
            {requestCategories.map((category) => (
              <button
                key={category.key}
                type="button"
                className={joinClasses('smplfy-nav-link', 'nav-link', activeCategory === category.key ? 'active' : '')}
                aria-current={activeCategory === category.key ? 'page' : undefined}
                onClick={() => onCategoryChange(category.key)}
              >
                <AppIcon name={category.icon} size={16} stroke={1.8} />
                <span>{`${category.label} (${category.count})`}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}

function RequestCard({ request, onOpenDetails }) {
  const title = normalizeRetentionLabel(request.title);
  const sourceState = getStatusPresentation(request.entityType, request.sourceState);
  const targetState = getStatusPresentation(request.entityType, request.targetState);
  const requestDays = request.daysToTransition ?? '4';

  return (
    <article className="smplfy-card card smplfy-request-card">
      <div className="min-w-0">
        <button type="button" className="smplfy-btn btn btn-link" onClick={() => onOpenDetails(request)}>
          {title}
        </button>
      </div>

      <div className="smplfy-state-transition">
        <StatusBadge presentation={sourceState} />
        <span aria-hidden="true">→</span>
        <StatusBadge presentation={targetState} />
      </div>

      <div className="d-flex align-items-center justify-content-center">{requestDays}</div>

      <div className="d-flex align-items-center">
        <span>{request.requestedOn}</span>
      </div>

      <div className="d-flex align-items-center flex-nowrap">
        <SecondaryButton
          size="small"
          tone="info"
          leftIcon="arrow-up-right"
          onClick={() => onOpenDetails(request)}
        >
          View
        </SecondaryButton>
        <SecondaryButton
          size="small"
          tone="success"
          leftIcon="check"
        >
          Approve
        </SecondaryButton>
        <SecondaryButton
          size="small"
          tone="danger"
          leftIcon="close"
        >
          Reject
        </SecondaryButton>
      </div>
    </article>
  );
}

function RequestDetailsModal({ request, onClose }) {
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState('');

  useEffect(() => {
    if (!request) {
      setComment('');
      setCommentError('');
    }
  }, [request]);

  const handleAction = () => {
    if (!comment.trim()) {
      setCommentError('Please add a comment to respond.');
      return;
    }
    setCommentError('');
    onClose();
  };

  if (!request) {
    return null;
  }

  const title = normalizeRetentionLabel(request.title);

  const sourceState = getStatusPresentation(request.entityType, request.sourceState);
  const targetState = getStatusPresentation(request.entityType, request.targetState);

  return (
    <Modal
      open={Boolean(request)}
      title={title}
      titleId="request-details-title"
      size="xl"
      onClose={onClose}
      cardClassName="smplfy-request-modal"
      bodyClassName="p-0 d-flex overflow-hidden"
      titleExtra={
        <div className="smplfy-state-transition">
          <StatusBadge presentation={sourceState} />
          <span aria-hidden="true">→</span>
          <StatusBadge presentation={targetState} />
        </div>
      }
    >
      <section className="d-flex flex-column flex-grow-1 overflow-hidden border-end">
        <dl className="m-0 d-flex flex-column gap-3 border-bottom flex-shrink-0">
          <div className="row g-0 align-items-center">
            <dt className="col-auto mb-0">Request by</dt>
            <dd className="col mb-0">{request.requestedByName}</dd>
          </div>
          <div className="row g-0 align-items-center">
            <dt className="col-auto mb-0">Requested on</dt>
            <dd className="col mb-0">{request.requestedOn}</dd>
          </div>
          <div className="row g-0 align-items-center">
            <dt className="col-auto mb-0">Comment</dt>
            <dd className="col mb-0">
              {normalizeRetentionLabel(request.comments)}
            </dd>
          </div>
        </dl>

        <div className="flex-grow-1 overflow-auto">
          <div className="d-flex align-items-center gap-3 flex-wrap pb-3">
            <div className="smplfy-nav-link nav-link active">Everyone Needs to approve</div>
            <div className="fw-medium">6/12 Responded</div>
            <SecondaryButton size="small" className="ms-auto">
              Remind All
            </SecondaryButton>
          </div>

          <div className="table-responsive overflow-hidden">
            <table className="smplfy-table table table-bordered mb-0 align-middle">
              <thead>
                <tr>
                  <th scope="col">Sr.</th>
                  <th scope="col">Approver Name</th>
                  <th scope="col">Status</th>
                  <th scope="col">Days taken</th>
                  <th scope="col">Decision on</th>
                  <th scope="col">Comments</th>
                </tr>
              </thead>
              <tbody>
              {requestApprovalRows.map((row) => (
                <tr key={`${request.id}-${row.sr}`}>
                  <td>{row.sr}</td>
                  <td>{row.approverName}</td>
                  <td>{row.status}</td>
                  <td>{row.daysTaken}</td>
                  <td>{row.decisionOn}</td>
                  <td>{row.comments}</td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <aside className="d-flex flex-column justify-content-between flex-shrink-0 overflow-hidden">
        <div className="d-flex flex-column gap-4">
          <label className="smplfy-form-label form-label mb-0" htmlFor="request-comment">
            Comment <span className="text-danger">*</span>
          </label>
          <input
            id="request-comment"
            className={joinClasses('smplfy-form-control', 'form-control', commentError ? 'is-invalid' : '')}
            value={comment}
            placeholder="Add a comment to respond"
            onChange={(e) => {
              setComment(e.target.value);
              if (e.target.value.trim()) setCommentError('');
            }}
          />
          {commentError ? <div className="smplfy-form-feedback invalid-feedback d-block">{commentError}</div> : null}
        </div>
        <div className="modal-footer border-top d-flex align-items-center justify-content-between">
          <PrimaryButton styleVariant="destructive" size="large" onClick={handleAction} leftIcon="close">
            Reject
          </PrimaryButton>
          <PrimaryButton styleVariant="positive" size="large" onClick={handleAction} leftIcon="check">
            Approve
          </PrimaryButton>
        </div>
      </aside>
    </Modal>
  );
}

function MaterialAlertRow({ alert, index, highlighted = false, animatedHighlight = false }) {
  return (
    <article
      className={getAlertRowClassName({
        priority: alert.priority,
        highlighted,
        animatedHighlight,
      })}
    >
      <div className="smplfy-alert-cell smplfy-alert-cell-index">{index}</div>
      <div className="smplfy-alert-cell smplfy-alert-cell-entity">{alert.entityName}</div>
      <div className="smplfy-alert-cell">{alert.alertType}</div>
      <div className="smplfy-alert-cell">{alert.batchNo}</div>
      <div className="smplfy-alert-cell">{alert.minQuantity}</div>
      <div className="smplfy-alert-cell">{alert.currentQuantity}</div>
      <div className="smplfy-alert-cell">{alert.alertRaisedOn}</div>
      <div className="smplfy-alert-cell">{alert.daysSince}</div>
      <div className="smplfy-alert-cell smplfy-alert-cell-action">
        <button type="button" className="smplfy-btn btn btn-light smplfy-alert-action">
          <AppIcon name={alert.actionIcon} size={14} />
          <span>{alert.actionLabel}</span>
        </button>
      </div>
    </article>
  );
}

function AlertSection({
  rows,
  layoutClass,
  legend,
  RowComponent,
  highlightedAlertId = null,
  animatedHighlightId = null,
}) {
  return (
    <div className="smplfy-requests-panel smplfy-alerts-panel">
      <div className={joinClasses('smplfy-alerts', layoutClass)}>
        <div className="smplfy-alerts-legend row g-0 align-items-end">
          {legend.map((label, index) => (
            <div
              key={label}
              className={joinClasses('smplfy-alerts-legend-item', index === 0 ? 'smplfy-alerts-legend-index' : '')}
            >
              {label}
            </div>
          ))}
        </div>

        <div className="smplfy-alerts-rows list-group">
          {rows.map((alert, index) => (
            <RowComponent
              key={alert.id}
              alert={alert}
              index={index + 1}
              highlighted={alert.id === highlightedAlertId}
              animatedHighlight={alert.id === animatedHighlightId}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function EnvDataAlertsEmptyState() {
  return (
    <div className="smplfy-card card smplfy-alerts-empty-state">
      <div className="smplfy-badge badge text-bg-success smplfy-alerts-empty-badge">System healthy</div>

      <div className="smplfy-alerts-empty-icon-shell" aria-hidden="true">
        <span className="smplfy-alerts-empty-halo smplfy-alerts-empty-halo-outer" />
        <span className="smplfy-alerts-empty-halo smplfy-alerts-empty-halo-inner" />
        <div className="smplfy-alerts-empty-icon">
          <AppIcon name="cloud-data" size={32} stroke={1.9} />
        </div>
      </div>

      <div className="smplfy-alerts-empty-title">All environment data is up to date</div>
      <div className="smplfy-alerts-empty-copy">
        Every monitored lab has a fresh reading logged on time.
      </div>
    </div>
  );
}

function EnvDataAlertsModeSwitch({ mode, onToggle }) {
  const nextMode = mode === 'empty' ? 'content' : 'empty';
  const buttonLabel = mode === 'empty' ? 'Show test alerts' : 'Show empty state';

  return (
    <div className="smplfy-alerts-mode-switch" aria-label="Env data alerts preview mode">
      <button type="button" className="smplfy-btn btn btn-link smplfy-alerts-mode-button" onClick={() => onToggle(nextMode)}>
        {buttonLabel}
      </button>
    </div>
  );
}

function EnvDataAlertsSection({
  rows,
  mode,
  onModeChange,
  highlightedAlertId = null,
  animatedHighlightId = null,
}) {
  const isEmpty = rows.length === 0;

  return (
    <div className={joinClasses('smplfy-requests-panel', 'smplfy-alerts-panel', isEmpty ? 'smplfy-alerts-panel-empty' : '')}>
      <div className="smplfy-alerts smplfy-alerts-env">
        {!isEmpty ? (
          <>
            <div className="smplfy-alerts-legend row g-0 align-items-end">
              {['#', 'Lab', 'Alert Raised On', 'Last Update', 'Due', 'Action'].map((label, index) => (
                <div
                  key={label}
                  className={joinClasses('smplfy-alerts-legend-item', index === 0 ? 'smplfy-alerts-legend-index' : '')}
                >
                  {label}
                </div>
              ))}
            </div>

            <div className="smplfy-alerts-rows list-group">
              {rows.map((alert, index) => (
                <EnvDataAlertRow
                  key={alert.id}
                  alert={alert}
                  index={index + 1}
                  highlighted={alert.id === highlightedAlertId}
                  animatedHighlight={alert.id === animatedHighlightId}
                />
              ))}
            </div>
          </>
        ) : (
          <EnvDataAlertsEmptyState />
        )}

        <EnvDataAlertsModeSwitch mode={mode} onToggle={onModeChange} />
      </div>
    </div>
  );
}

function MaterialAlertsSection({ rows, highlightedAlertId, animatedHighlightId }) {
  return (
    <AlertSection
      rows={rows}
      highlightedAlertId={highlightedAlertId}
      animatedHighlightId={animatedHighlightId}
      layoutClass="smplfy-alerts-material"
      legend={['#', 'Name', 'Alert Type', 'Batch No.', 'Min Qty', 'Current Qty', 'Alert Raised On', 'Days Since', 'Action']}
      RowComponent={MaterialAlertRow}
    />
  );
}

function InstrumentAlertRow({ alert, index, highlighted = false, animatedHighlight = false }) {
  const actionLabel = alert.type === 'breakdown' ? 'View Service' : 'Generate Service';
  const actionIcon = alert.type === 'breakdown' ? 'eye' : 'plus';
  const serviceDue = alert.type === 'breakdown' ? '' : alert.serviceDue;

  return (
    <article
      className={getAlertRowClassName({
        priority: alert.priority,
        highlighted,
        animatedHighlight,
      })}
    >
      <div className="smplfy-alert-cell smplfy-alert-cell-index">{index}</div>
      <div className="smplfy-alert-cell smplfy-alert-cell-entity">{alert.instrumentName}</div>
      <div className="smplfy-alert-cell">{alert.type}</div>
      <div className="smplfy-alert-cell">{alert.alertRaisedOn}</div>
      <div className="smplfy-alert-cell">{alert.daysSince}</div>
      <div className="smplfy-alert-cell">{alert.lastService}</div>
      <div className="smplfy-alert-cell">{serviceDue}</div>
      <div className="smplfy-alert-cell smplfy-alert-cell-action">
        <button type="button" className="smplfy-btn btn btn-light smplfy-alert-action">
          <AppIcon name={actionIcon} size={14} />
          <span>{actionLabel}</span>
        </button>
      </div>
    </article>
  );
}

function InstrumentAlertsSection({ rows, highlightedAlertId, animatedHighlightId }) {
  return (
    <AlertSection
      rows={rows}
      highlightedAlertId={highlightedAlertId}
      animatedHighlightId={animatedHighlightId}
      layoutClass="smplfy-alerts-instrument"
      legend={['#', 'Name', 'Type', 'Alert Raised On', 'Days Since', 'Last Service', 'Service Due', 'Action']}
      RowComponent={InstrumentAlertRow}
    />
  );
}

function EnvDataAlertRow({ alert, index, highlighted = false, animatedHighlight = false }) {
  return (
    <article
      className={getAlertRowClassName({
        priority: alert.priority,
        highlighted,
        animatedHighlight,
      })}
    >
      <div className="smplfy-alert-cell smplfy-alert-cell-index">{index}</div>
      <div className="smplfy-alert-cell smplfy-alert-cell-entity">{alert.labName}</div>
      <div className="smplfy-alert-cell">{alert.alertRaisedOn}</div>
      <div className="smplfy-alert-cell">{alert.lastUpdate}</div>
      <div className="smplfy-alert-cell">{alert.due}</div>
      <div className="smplfy-alert-cell smplfy-alert-cell-action">
        <button type="button" className="smplfy-btn btn btn-light smplfy-alert-action">
          <AppIcon name="plus" size={14} />
          <span>{alert.actionLabel}</span>
        </button>
      </div>
    </article>
  );
}

function DocumentAlertRow({ alert, index, highlighted = false, animatedHighlight = false }) {
  return (
    <article
      className={getAlertRowClassName({
        priority: alert.priority,
        highlighted,
        animatedHighlight,
      })}
    >
      <div className="smplfy-alert-cell smplfy-alert-cell-index">{index}</div>
      <div className="smplfy-alert-cell smplfy-alert-cell-entity">{alert.docName}</div>
      <div className="smplfy-alert-cell">{alert.lastUpdate}</div>
      <div className="smplfy-alert-cell">{alert.due}</div>
      <div className="smplfy-alert-cell smplfy-alert-cell-action">
        <button type="button" className="smplfy-btn btn btn-light smplfy-alert-action">
          <AppIcon name="file-text" size={14} />
          <span>{alert.actionLabel}</span>
        </button>
      </div>
    </article>
  );
}

function DocumentAlertsSection({ rows, highlightedAlertId, animatedHighlightId }) {
  return (
    <AlertSection
      rows={rows}
      highlightedAlertId={highlightedAlertId}
      animatedHighlightId={animatedHighlightId}
      layoutClass="smplfy-alerts-document"
      legend={['#', 'Doc Name', 'Last Update', 'Expiry Date', 'Action']}
      RowComponent={DocumentAlertRow}
    />
  );
}

export default function RequestsForMePage({
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  initialSection = 'requests',
  highlightedAlertId = null,
}) {
  const [activeSection, setActiveSection] = useState(initialSection);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [envDataAlertsMode, setEnvDataAlertsMode] = useState('empty');
  const [activeHighlightedAlertId, setActiveHighlightedAlertId] = useState(highlightedAlertId);
  const [animatedHighlightId, setAnimatedHighlightId] = useState(highlightedAlertId);

  useEffect(() => {
    setActiveSection(initialSection);
    setActiveHighlightedAlertId(highlightedAlertId);
    setAnimatedHighlightId(highlightedAlertId);
    if (initialSection !== 'requests') {
      setActiveCategory('all');
    }
    if (initialSection === 'env-data-alerts') {
      setEnvDataAlertsMode('content');
    }

    if (!highlightedAlertId) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setAnimatedHighlightId(null);
    }, 900);

    return () => window.clearTimeout(timeoutId);
  }, [initialSection, highlightedAlertId]);

  const sections = useMemo(
    () =>
      requestSections.map((section) =>
        section.key === 'env-data-alerts'
          ? {
              ...section,
              count: envDataAlertsMode === 'content' ? getRequestsForSection('env-data-alerts').length : 0,
            }
          : section,
      ),
    [envDataAlertsMode],
  );

  const requestRows = useMemo(() => {
    if (activeSection === 'requests') {
      return getRequestsForCategory(activeCategory);
    }

    if (activeSection === 'env-data-alerts' && envDataAlertsMode === 'empty') {
      return [];
    }

    return getRequestsForSection(activeSection);
  }, [activeSection, activeCategory, envDataAlertsMode]);

  return (
    <AppChrome
      activeNav="requests-for-me"
      onNavigate={onNavigate}
      breadcrumbs={[{ key: 'requests-for-me', label: 'Requests for me', current: true }]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      pageHeader={
        <RequestsHeader
          sections={sections}
          activeSection={activeSection}
          onSectionChange={(nextSection) => {
            setActiveSection(nextSection);
            if (nextSection !== 'requests') {
              setActiveCategory('all');
            }
          }}
        />
      }
    >
      {activeSection === 'requests' ? (
        <CategoryFilter activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
      ) : null}
      <main className="smplfy-requests-page">
        <div
          className="container-fluid px-4"
          onClickCapture={(event) => {
            if (!activeHighlightedAlertId) {
              return;
            }

            if (event.target.closest('.smplfy-alert-row')) {
              return;
            }

            setActiveHighlightedAlertId(null);
            setAnimatedHighlightId(null);
          }}
        >
          {activeSection === 'material-alerts' ? (
            <MaterialAlertsSection
              rows={requestRows}
              highlightedAlertId={activeHighlightedAlertId}
              animatedHighlightId={animatedHighlightId}
            />
          ) : activeSection === 'instrument-alerts' ? (
            <InstrumentAlertsSection
              rows={requestRows}
              highlightedAlertId={activeHighlightedAlertId}
              animatedHighlightId={animatedHighlightId}
            />
          ) : activeSection === 'env-data-alerts' ? (
            <EnvDataAlertsSection
              rows={requestRows}
              mode={envDataAlertsMode}
              onModeChange={setEnvDataAlertsMode}
              highlightedAlertId={activeHighlightedAlertId}
              animatedHighlightId={animatedHighlightId}
            />
          ) : activeSection === 'document-alerts' ? (
            <DocumentAlertsSection
              rows={requestRows}
              highlightedAlertId={activeHighlightedAlertId}
              animatedHighlightId={animatedHighlightId}
            />
          ) : (
            <div className="smplfy-requests-panel smplfy-requests-list-panel">
              <div className="smplfy-requests-legend">
                <div className="smplfy-requests-legend-item smplfy-requests-legend-item-main">Item</div>
                <div className="smplfy-requests-legend-item">Transition Request</div>
                <div className="smplfy-requests-legend-item smplfy-requests-legend-item-days">Days</div>
                <div className="smplfy-requests-legend-item">Raised on</div>
                <div className="smplfy-requests-legend-item smplfy-requests-legend-item-actions">Actions</div>
              </div>

              <div className="smplfy-requests-list">
                {requestRows.map((request) => (
                  <RequestCard key={request.id} request={request} onOpenDetails={setSelectedRequest} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <RequestDetailsModal request={selectedRequest} onClose={() => setSelectedRequest(null)} />
    </AppChrome>
  );
}
