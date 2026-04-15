import { useMemo, useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import { FormElement } from '../components/FormControls';
import Modal from '../components/Modal/Modal';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import NavSelector from '../components/NavSelector';
import SecondaryButton from '../components/SecondaryButton';
import StatusPill from '../components/StatusPill';
import { getStatusPresentation } from '../status/statusRegistry';
import {
  getRequestsForCategory,
  getRequestsForSection,
  requestCategories,
  requestSections,
} from '../data/requestsForMeData';
import '../styles.css';
import './requests-for-me-page.css';

function normalizeRetentionLabel(value) {
  return value === 'To be retained' ? 'Retained' : value;
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
    <section className="requests-for-me-tabs">
      <div className="container-fluid h-100 px-4">
        <div className="row h-100 gx-0 align-items-stretch flex-nowrap">
          <div className="col">
            <div className="requests-for-me-tabs__group">
              {sections.map((section) => (
                <NavSelector
                  key={section.key}
                  className="requests-for-me-tabs__item"
                  active={activeSection === section.key}
                  count={section.count}
                  onClick={() => onSectionChange(section.key)}
                >
                  <span className="requests-for-me-tabs__label">
                    <AppIcon name={section.icon} size={14} />
                    <span>{section.label}</span>
                  </span>
                </NavSelector>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryFilter({ activeCategory, onCategoryChange }) {
  return (
    <section className="requests-for-me-categories">
      <div className="container-fluid px-4">
        <div className="requests-for-me-categories__inner">
          <div className="requests-for-me-categories__label">Categories:</div>
          <div className="requests-for-me-categories__rail">
            {requestCategories.map((category) => (
              <button
                key={category.key}
                type="button"
                className={`requests-for-me-category-chip ${activeCategory === category.key ? 'is-active' : ''}`}
                onClick={() => onCategoryChange(category.key)}
              >
                <AppIcon name={category.icon} size={16} stroke={1.8} />
                <span>{`${category.label} (${category.count})`}</span>
              </button>
            ))}
          </div>
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
    <article className="requests-for-me-request-card">
      <div className="requests-for-me-request-card__item">
        <button type="button" className="tr-link requests-for-me-request-card__title" onClick={() => onOpenDetails(request)}>
          {title}
        </button>
      </div>

      <div className="requests-for-me-request-card__transition">
        <StatusPill color={sourceState.color} styleType={sourceState.styleType}>
          {sourceState.label}
        </StatusPill>
        <span className="requests-for-me-request-card__state-arrow">→</span>
        <StatusPill color={targetState.color} styleType={targetState.styleType}>
          {targetState.label}
        </StatusPill>
      </div>

      <div className="requests-for-me-request-card__days">{requestDays}</div>

      <div className="requests-for-me-request-card__raised">
        <span>{request.requestedOn}</span>
      </div>

      <div className="requests-for-me-request-card__actions">
        <SecondaryButton
          size="small"
          tone="info"
          leftIcon="arrow-up-right"
          className="requests-for-me-request-card__action-button"
          onClick={() => onOpenDetails(request)}
        >
          View
        </SecondaryButton>
        <SecondaryButton
          size="small"
          tone="success"
          leftIcon="check"
          className="requests-for-me-request-card__action-button"
        >
          Approve
        </SecondaryButton>
        <SecondaryButton
          size="small"
          tone="danger"
          leftIcon="close"
          className="requests-for-me-request-card__action-button"
        >
          Reject
        </SecondaryButton>
      </div>
    </article>
  );
}

function RequestDetailsModal({ request, onClose }) {
  if (!request) {
    return null;
  }

  const title = normalizeRetentionLabel(request.title);

  return (
    <Modal
      open={Boolean(request)}
      title={title}
      titleId="request-details-title"
      size="xl"
      onClose={onClose}
      cardClassName="requests-for-me-request-modal__card"
      bodyClassName="requests-for-me-request-modal__body"
      actionsClassName="requests-for-me-request-modal__actions"
      actions={
        <>
          <PrimaryButton
            styleVariant="red"
            size="small"
            className="requests-for-me-request-modal__action is-reject"
          >
            Reject
          </PrimaryButton>
          <PrimaryButton
            styleVariant="positive"
            size="small"
            className="requests-for-me-request-modal__action is-accept"
          >
            Accept
          </PrimaryButton>
        </>
      }
    >
      <div className="requests-for-me-request-modal__content">
        <div className="requests-for-me-request-modal__summary">
          <div className="requests-for-me-request-modal__summary-row">
            <div className="requests-for-me-request-modal__summary-label">Request by</div>
            <div className="requests-for-me-request-modal__summary-value">{request.requestedByName}</div>
          </div>
          <div className="requests-for-me-request-modal__summary-row">
            <div className="requests-for-me-request-modal__summary-label">Requested on</div>
            <div className="requests-for-me-request-modal__summary-value">{request.requestedOn}</div>
          </div>
          <div className="requests-for-me-request-modal__summary-row">
            <div className="requests-for-me-request-modal__summary-label">Comment</div>
            <div className="requests-for-me-request-modal__summary-value">
              {normalizeRetentionLabel(request.comments)}
            </div>
          </div>
        </div>

        <div className="requests-for-me-request-modal__body-grid">
          <div className="requests-for-me-request-modal__main">
            <div className="requests-for-me-request-modal__section-head">
              <div className="requests-for-me-request-modal__tab">Everyone Needs to approve</div>
              <div className="requests-for-me-request-modal__responded">6/12 Responded</div>
              <SecondaryButton size="small" className="requests-for-me-request-modal__remind">
                Remind All
              </SecondaryButton>
            </div>

            <div className="requests-for-me-request-modal__table-wrap">
              <div className="requests-for-me-request-modal__table-head">
                <span>Sr.</span>
                <span>Approver Name</span>
                <span>Status</span>
                <span>Days taken</span>
                <span>Decision on</span>
                <span>Comments</span>
              </div>

              <div className="requests-for-me-request-modal__table-body">
                {requestApprovalRows.map((row) => (
                  <div key={`${request.id}-${row.sr}`} className="requests-for-me-request-modal__table-row">
                    <span>{row.sr}</span>
                    <span>{row.approverName}</span>
                    <span>{row.status}</span>
                    <span>{row.daysTaken}</span>
                    <span>{row.decisionOn}</span>
                    <span>{row.comments}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="requests-for-me-request-modal__sidebar">
            <FormElement
              type="text"
              mandatory
              label="Comment"
              inputProps={{
                value: normalizeRetentionLabel(request.comments),
                placeholder: 'eg.',
                onChange: () => {},
              }}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}

function MaterialAlertRow({ alert, index }) {
  const isHighPriority = alert.priority === 'high';

  return (
    <article
      className={`requests-for-me-alert-row ${isHighPriority ? 'is-high' : 'is-medium'}`}
      style={{ '--alert-row-columns': '40px minmax(0, 1.8fr) minmax(0, 1.15fr) minmax(0, 1fr) minmax(0, 0.8fr) minmax(0, 0.85fr) minmax(0, 1.25fr) minmax(0, 0.8fr) 176px' }}
    >
      <div className="requests-for-me-alert-row__cell is-index">{index}</div>
      <div className="requests-for-me-alert-row__cell is-entity">{alert.entityName}</div>
      <div className="requests-for-me-alert-row__cell is-alert-type">{alert.alertType}</div>
      <div className="requests-for-me-alert-row__cell is-batch">{alert.batchNo}</div>
      <div className="requests-for-me-alert-row__cell is-min">{alert.minQuantity}</div>
      <div className="requests-for-me-alert-row__cell is-current">{alert.currentQuantity}</div>
      <div className="requests-for-me-alert-row__cell is-raised">{alert.alertRaisedOn}</div>
      <div className="requests-for-me-alert-row__cell is-days">{alert.daysSince}</div>
      <div className="requests-for-me-alert-row__cell is-action">
        <button type="button" className="requests-for-me-alert-row__action">
          <AppIcon name={alert.actionIcon} size={14} />
          <span>{alert.actionLabel}</span>
        </button>
      </div>
    </article>
  );
}

function AlertSection({ rows, columns, legend, RowComponent }) {
  return (
    <div className="requests-for-me-panel requests-for-me-panel--alerts">
      <div className="requests-for-me-alerts" style={{ '--alert-row-columns': columns }}>
        <div className="requests-for-me-alerts__legend row g-0 align-items-end">
          {legend.map((label, index) => (
            <div
              key={label}
              className={`requests-for-me-alerts__legend-item ${index === 0 ? 'is-index' : `is-${index}`}`}
            >
              {label}
            </div>
          ))}
        </div>

        <div className="requests-for-me-alerts__rows">
          {rows.map((alert, index) => (
            <RowComponent key={alert.id} alert={alert} index={index + 1} />
          ))}
        </div>
      </div>
    </div>
  );
}

function EnvDataAlertsEmptyState() {
  return (
    <div className="requests-for-me-alerts-empty-state">
      <div className="requests-for-me-alerts-empty-state__badge">System healthy</div>

      <div className="requests-for-me-alerts-empty-state__icon-shell" aria-hidden="true">
        <span className="requests-for-me-alerts-empty-state__halo requests-for-me-alerts-empty-state__halo--outer" />
        <span className="requests-for-me-alerts-empty-state__halo requests-for-me-alerts-empty-state__halo--inner" />
        <div className="requests-for-me-alerts-empty-state__icon">
          <AppIcon name="cloud-data" size={32} stroke={1.9} />
        </div>
      </div>

      <div className="requests-for-me-alerts-empty-state__title">All environment data is up to date</div>
      <div className="requests-for-me-alerts-empty-state__copy">
        Every monitored lab has a fresh reading logged on time.
      </div>
    </div>
  );
}

function EnvDataAlertsModeSwitch({ mode, onToggle }) {
  const nextMode = mode === 'empty' ? 'content' : 'empty';
  const buttonLabel = mode === 'empty' ? 'Show test alerts' : 'Show empty state';

  return (
    <div className="requests-for-me-alerts__mode-switch" aria-label="Env data alerts preview mode">
      <button type="button" className="requests-for-me-alerts__mode-switch-button" onClick={() => onToggle(nextMode)}>
        {buttonLabel}
      </button>
    </div>
  );
}

function EnvDataAlertsSection({ rows, mode, onModeChange }) {
  const isEmpty = rows.length === 0;

  return (
    <div className={`requests-for-me-panel requests-for-me-panel--alerts ${isEmpty ? 'is-empty' : ''}`.trim()}>
      <div className="requests-for-me-alerts" style={{ '--alert-row-columns': '40px minmax(0, 1.8fr) minmax(0, 1.2fr) minmax(0, 1.6fr) minmax(0, 1.6fr) 176px' }}>
        {!isEmpty ? (
          <>
            <div className="requests-for-me-alerts__legend row g-0 align-items-end">
              {['#', 'Lab', 'Alert Raised On', 'Last Update', 'Due', 'Action'].map((label, index) => (
                <div
                  key={label}
                  className={`requests-for-me-alerts__legend-item ${index === 0 ? 'is-index' : `is-${index}`}`}
                >
                  {label}
                </div>
              ))}
            </div>

            <div className="requests-for-me-alerts__rows">
              {rows.map((alert, index) => (
                <EnvDataAlertRow key={alert.id} alert={alert} index={index + 1} />
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

function MaterialAlertsSection({ rows }) {
  return (
    <AlertSection
      rows={rows}
      columns="40px minmax(0, 1.8fr) minmax(0, 1.15fr) minmax(0, 1fr) minmax(0, 0.8fr) minmax(0, 0.85fr) minmax(0, 1.25fr) minmax(0, 0.8fr) 176px"
      legend={['#', 'Name', 'Alert Type', 'Batch No.', 'Min Qty', 'Current Qty', 'Alert Raised On', 'Days Since', 'Action']}
      RowComponent={MaterialAlertRow}
    />
  );
}

function InstrumentAlertRow({ alert, index }) {
  const actionLabel = alert.type === 'breakdown' ? 'View Service' : 'Generate Service';
  const actionIcon = alert.type === 'breakdown' ? 'eye' : 'plus';
  const serviceDue = alert.type === 'breakdown' ? '' : alert.serviceDue;

  return (
    <article
      className={`requests-for-me-alert-row ${alert.priority === 'high' ? 'is-high' : 'is-medium'}`}
      style={{ '--alert-row-columns': '40px minmax(0, 1.8fr) minmax(0, 1fr) minmax(0, 1.15fr) minmax(0, 0.7fr) minmax(0, 1fr) minmax(0, 1fr) 176px' }}
    >
      <div className="requests-for-me-alert-row__cell is-index">{index}</div>
      <div className="requests-for-me-alert-row__cell is-entity">{alert.instrumentName}</div>
      <div className="requests-for-me-alert-row__cell is-alert-type">{alert.type}</div>
      <div className="requests-for-me-alert-row__cell is-raised">{alert.alertRaisedOn}</div>
      <div className="requests-for-me-alert-row__cell is-days">{alert.daysSince}</div>
      <div className="requests-for-me-alert-row__cell is-min">{alert.lastService}</div>
      <div className="requests-for-me-alert-row__cell is-current">{serviceDue}</div>
      <div className="requests-for-me-alert-row__cell is-action">
        <button type="button" className="requests-for-me-alert-row__action">
          <AppIcon name={actionIcon} size={14} />
          <span>{actionLabel}</span>
        </button>
      </div>
    </article>
  );
}

function InstrumentAlertsSection({ rows }) {
  return (
    <AlertSection
      rows={rows}
      columns="40px minmax(0, 1.8fr) minmax(0, 1fr) minmax(0, 1.15fr) minmax(0, 0.7fr) minmax(0, 1fr) minmax(0, 1fr) 176px"
      legend={['#', 'Name', 'Type', 'Alert Raised On', 'Days Since', 'Last Service', 'Service Due', 'Action']}
      RowComponent={InstrumentAlertRow}
    />
  );
}

function EnvDataAlertRow({ alert, index }) {
  return (
    <article
      className={`requests-for-me-alert-row ${alert.priority === 'high' ? 'is-high' : 'is-medium'}`}
      style={{ '--alert-row-columns': '40px minmax(0, 1.8fr) minmax(0, 1.2fr) minmax(0, 1.6fr) minmax(0, 1.6fr) 176px' }}
    >
      <div className="requests-for-me-alert-row__cell is-index">{index}</div>
      <div className="requests-for-me-alert-row__cell is-entity">{alert.labName}</div>
      <div className="requests-for-me-alert-row__cell is-raised">{alert.alertRaisedOn}</div>
      <div className="requests-for-me-alert-row__cell is-min">{alert.lastUpdate}</div>
      <div className="requests-for-me-alert-row__cell is-current">{alert.due}</div>
      <div className="requests-for-me-alert-row__cell is-action">
        <button type="button" className="requests-for-me-alert-row__action">
          <AppIcon name="plus" size={14} />
          <span>{alert.actionLabel}</span>
        </button>
      </div>
    </article>
  );
}

function DocumentAlertRow({ alert, index }) {
  return (
    <article
      className={`requests-for-me-alert-row ${alert.priority === 'high' ? 'is-high' : 'is-medium'}`}
      style={{ '--alert-row-columns': '40px minmax(0, 2fr) minmax(0, 1.5fr) minmax(0, 1.5fr) 176px' }}
    >
      <div className="requests-for-me-alert-row__cell is-index">{index}</div>
      <div className="requests-for-me-alert-row__cell is-entity">{alert.docName}</div>
      <div className="requests-for-me-alert-row__cell is-raised">{alert.lastUpdate}</div>
      <div className="requests-for-me-alert-row__cell is-current">{alert.due}</div>
      <div className="requests-for-me-alert-row__cell is-action">
        <button type="button" className="requests-for-me-alert-row__action">
          <AppIcon name="file-text" size={14} />
          <span>{alert.actionLabel}</span>
        </button>
      </div>
    </article>
  );
}

function DocumentAlertsSection({ rows }) {
  return (
    <AlertSection
      rows={rows}
      columns="40px minmax(0, 2fr) minmax(0, 1.5fr) minmax(0, 1.5fr) 176px"
      legend={['#', 'Doc Name', 'Last Update', 'Expiry Date', 'Action']}
      RowComponent={DocumentAlertRow}
    />
  );
}

export default function RequestsForMePage({
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
}) {
  const [activeSection, setActiveSection] = useState('requests');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [envDataAlertsMode, setEnvDataAlertsMode] = useState('empty');

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
      <main className="requests-for-me-page">
        <div className="container-fluid px-4">
          {activeSection === 'material-alerts' ? (
            <MaterialAlertsSection rows={requestRows} />
          ) : activeSection === 'instrument-alerts' ? (
            <InstrumentAlertsSection rows={requestRows} />
          ) : activeSection === 'env-data-alerts' ? (
            <EnvDataAlertsSection rows={requestRows} mode={envDataAlertsMode} onModeChange={setEnvDataAlertsMode} />
          ) : activeSection === 'document-alerts' ? (
            <DocumentAlertsSection rows={requestRows} />
          ) : (
            <div className="requests-for-me-panel requests-for-me-panel--requests">
              <div className="requests-for-me-panel__legend">
                <div className="requests-for-me-panel__legend-item is-item">Item</div>
                <div className="requests-for-me-panel__legend-item is-transition">Transition Request</div>
                <div className="requests-for-me-panel__legend-item is-days">Days</div>
                <div className="requests-for-me-panel__legend-item is-raised">Raised on</div>
                <div className="requests-for-me-panel__legend-item is-actions">Actions</div>
              </div>

              <div className="requests-for-me-panel__list">
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
