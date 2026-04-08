import { useMemo, useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import NavSelector from '../components/NavSelector';
import StatusPill from '../components/StatusPill';
import { AllocateTestRequestButton, ViewTestRequestButton } from '../components/TestRequestActions';
import {
  allTestRequestBuckets,
  getTestRequestsForTab,
  testRequestsHomeTabs,
} from '../data/testRequestsHomeData';
import './test-requests-listing-page.css';
import './test-requests-home-page.css';

function TestRequestsHomeHeader({ activeTab, countsByTab, onTabChange }) {
  return (
    <section className="test-requests-home-tabs">
      <div className="container-fluid h-100 px-4">
        <div className="row h-100 gx-0 align-items-stretch flex-nowrap">
          <div className="col">
            <div className="test-requests-home-tabs__group">
              {testRequestsHomeTabs.map((tab) => (
                <NavSelector
                  key={tab.key}
                  className="test-requests-home-tabs__item"
                  active={activeTab === tab.key}
                  count={tab.key === 'all-test-requests' ? undefined : countsByTab[tab.key]}
                  onClick={() => onTabChange(tab.key)}
                >
                  {tab.label}
                </NavSelector>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestRequestHomeCard({ row, showStatus, onAllocate, onView }) {
  return (
    <article className={`test-requests-home-card ${showStatus ? 'has-status' : 'no-status'}`}>
      <div className="test-requests-home-card__cell is-id">
        <button type="button" className="tr-link test-requests-home-card__link" onClick={() => onView(row)}>
          {row.id}
        </button>
      </div>

      {showStatus ? (
        <div className="test-requests-home-card__cell is-status">
          <div className="tr-request-status-cell">
            <StatusPill color={row.pillColor} styleType={row.pillStyle}>
              {row.status}
            </StatusPill>
          </div>
        </div>
      ) : null}

      <div className="test-requests-home-card__cell is-product">{row.product}</div>

      <div className="test-requests-home-card__cell is-date">{row.reportingDate}</div>

      <div className="test-requests-home-card__cell is-age">{row.age}</div>

      <div className="test-requests-home-card__cell is-actions">
        <div className="tr-request-actions">
          {row.action === 'allocate' ? <AllocateTestRequestButton onClick={() => onAllocate(row)} /> : null}
          <ViewTestRequestButton />
        </div>
      </div>
    </article>
  );
}

function TestRequestsHomeBody({ rows, showStatus, onAllocate, onView }) {
  return (
    <main className="test-requests-home-page">
      <div className="container-fluid px-4">
        <div className="test-requests-home-table">
          <div className={`test-requests-home-legend ${showStatus ? 'has-status' : 'no-status'}`}>
            <div className="test-requests-home-legend__item is-id">Test Request ID</div>
            {showStatus ? <div className="test-requests-home-legend__item is-status">Status</div> : null}
            <div className="test-requests-home-legend__item is-product">Product</div>
            <div className="test-requests-home-legend__item is-date">Target Reporting Date</div>
            <div className="test-requests-home-legend__item is-age">Age</div>
            <div className="test-requests-home-legend__item is-actions">Actions</div>
          </div>

          <div className="test-requests-home-list">
            {rows.map((row) => (
              <TestRequestHomeCard
                key={row.id}
                row={row}
                showStatus={showStatus}
                onAllocate={onAllocate}
                onView={onView}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function TestRequestsHomePage({
  onNavigate,
  onOpenTrDetails,
  sidebarCollapsed,
  onSidebarCollapsedChange,
}) {
  const [rows, setRows] = useState(allTestRequestBuckets);
  const [activeTab, setActiveTab] = useState('allocated-to-me');

  const countsByTab = useMemo(
    () => ({
      'allocated-to-me': rows.filter((row) => row.bucket === 'allocated-to-me').length,
      'pending-for-allocation': rows.filter((row) => row.bucket === 'pending-for-allocation').length,
      'pending-for-approval': rows.filter((row) => row.bucket === 'pending-for-approval').length,
    }),
    [rows],
  );

  const visibleRows = useMemo(() => getTestRequestsForTab(activeTab, rows), [activeTab, rows]);
  const showStatus = activeTab === 'all-test-requests';

  const handleAllocate = (row) => {
    setRows((current) =>
      current.map((item) =>
        item.id === row.id
          ? {
              ...item,
              bucket: 'allocated-to-me',
              status: 'Result Under Testing',
              pillColor: 'blue',
              pillStyle: 'neutral',
              age: 'Just now',
              action: 'view',
            }
          : item,
      ),
    );
    setActiveTab('allocated-to-me');
  };

  return (
    <AppChrome
      activeNav="test-requests-home"
      onNavigate={onNavigate}
      breadcrumbs={[{ key: 'test-requests-home', label: 'Test Requests', current: true }]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      pageHeader={
        <TestRequestsHomeHeader
          activeTab={activeTab}
          countsByTab={countsByTab}
          onTabChange={setActiveTab}
        />
      }
    >
      <TestRequestsHomeBody
        rows={visibleRows}
        showStatus={showStatus}
        onAllocate={handleAllocate}
        onView={(row) =>
          onOpenTrDetails?.('IICT/2025-2026/1101', {
            sourcePage: 'test-requests-home',
            requestId: row.id,
          })
        }
      />
    </AppChrome>
  );
}
