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
