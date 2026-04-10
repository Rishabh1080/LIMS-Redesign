import { useMemo, useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import NavSelector from '../components/NavSelector';
import {
  getRequestsForCategory,
  getRequestsForSection,
  requestCategories,
  requestSections,
} from '../data/requestsForMeData';
import '../styles.css';
import './requests-for-me-page.css';

function RequestsHeader({ activeSection, onSectionChange }) {
  return (
    <section className="requests-for-me-tabs">
      <div className="container-fluid h-100 px-4">
        <div className="row h-100 gx-0 align-items-stretch flex-nowrap">
          <div className="col">
            <div className="requests-for-me-tabs__group">
              {requestSections.map((section) => (
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

function RequestCard({ request }) {
  return (
    <article className="requests-for-me-card">
      <div className="requests-for-me-card__main">
        <div className="requests-for-me-card__title-row">
          <h3 className="requests-for-me-card__title">{request.title}</h3>
          <button type="button" className="requests-for-me-card__open">
            <span>Open</span>
            <AppIcon name="chevron-right" size={12} />
          </button>
        </div>

        <div className="requests-for-me-card__workflow">
          {`${request.sourceState} \u2192 ${request.targetState}`}
        </div>

        <div className="requests-for-me-card__footer">
          <button type="button" className="requests-for-me-card__link">
            <span>{request.approverLabel}</span>
            <AppIcon name="chevron-down" size={12} />
          </button>
          <span className="requests-for-me-card__progress">{`(${request.approverProgress})`}</span>
          <button type="button" className="requests-for-me-card__remind">
            <span>{request.reminderLabel}</span>
            <AppIcon name="calendar" size={12} />
          </button>
        </div>
      </div>

      <div className="requests-for-me-card__meta">
        <div className="requests-for-me-card__date">{request.requestedOn}</div>
        <div className="requests-for-me-card__person">
          <span className="requests-for-me-card__avatar">{request.requestedByInitials}</span>
          <span className="requests-for-me-card__name">{request.requestedByName}</span>
        </div>
        <div className="requests-for-me-card__comments">{request.comments}</div>
      </div>

      <div className="requests-for-me-card__actions">
        <button type="button" className="requests-for-me-card__action is-accept">
          <span>Accept</span>
          <AppIcon name="check" size={16} />
        </button>
        <button type="button" className="requests-for-me-card__action is-reject">
          <span>Reject</span>
          <AppIcon name="close" size={16} />
        </button>
      </div>
    </article>
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

function EnvDataAlertsSection({ rows }) {
  return (
    <AlertSection
      rows={rows}
      columns="40px minmax(0, 1.8fr) minmax(0, 1.2fr) minmax(0, 1.6fr) minmax(0, 1.6fr) 176px"
      legend={['#', 'Lab', 'Alert Raised On', 'Last Update', 'Due', 'Action']}
      RowComponent={EnvDataAlertRow}
    />
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

function RequestsBody({ activeSection, activeCategory }) {
  const rows = useMemo(() => {
    if (activeSection === 'requests') {
      return getRequestsForCategory(activeCategory);
    }

    return getRequestsForSection(activeSection);
  }, [activeSection, activeCategory]);

  return (
    <main className="requests-for-me-page">
      <div className="container-fluid px-4">
      {activeSection === 'material-alerts' ? (
        <MaterialAlertsSection rows={rows} />
      ) : activeSection === 'instrument-alerts' ? (
        <InstrumentAlertsSection rows={rows} />
      ) : activeSection === 'env-data-alerts' ? (
        <EnvDataAlertsSection rows={rows} />
      ) : activeSection === 'document-alerts' ? (
        <DocumentAlertsSection rows={rows} />
      ) : (
        <div className="requests-for-me-panel">
            <div className="requests-for-me-panel__legend">
              <div className="requests-for-me-panel__legend-item is-primary">Request Info</div>
              <div className="requests-for-me-panel__legend-item is-date">Requested On</div>
              <div className="requests-for-me-panel__legend-item is-actions">Action</div>
            </div>

            <div className="requests-for-me-panel__list">
              {rows.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function RequestsForMePage({
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
}) {
  const [activeSection, setActiveSection] = useState('requests');
  const [activeCategory, setActiveCategory] = useState('all');

  return (
    <AppChrome
      activeNav="requests-for-me"
      onNavigate={onNavigate}
      breadcrumbs={[{ key: 'requests-for-me', label: 'Requests for me', current: true }]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      pageHeader={
        <RequestsHeader
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
      <RequestsBody activeSection={activeSection} activeCategory={activeCategory} />
    </AppChrome>
  );
}
