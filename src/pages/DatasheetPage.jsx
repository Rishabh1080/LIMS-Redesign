import { useEffect, useRef, useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import LoadingAnimation from '../components/LoadingAnimation/LoadingAnimation';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import './datasheet-page.css';

function PageHeader({ datasheetId, loading, onBack, onRefresh, onSave }) {
  return (
    <section className="datasheet-page-header">
      <div className="datasheet-page-header__title-wrap">
        <SecondaryButton size="medium" className="datasheet-page-header__back" aria-label="Go back" onClick={onBack}>
          <AppIcon name="chevron-left" />
        </SecondaryButton>
        <h1>{datasheetId}</h1>
      </div>

      <div className="datasheet-page-header__actions">
        <SecondaryButton leftIcon="calendar" className="datasheet-page-header__action">
          Calculate
        </SecondaryButton>
        <SecondaryButton
          size="large"
          className="datasheet-page-header__refresh"
          aria-label="Refresh datasheet"
          disabled={loading}
          onClick={onRefresh}
        >
          <AppIcon name="refresh" />
        </SecondaryButton>
        <PrimaryButton leftIcon="save" disabled={loading} onClick={onSave}>
          Save
        </PrimaryButton>
      </div>
    </section>
  );
}

export default function DatasheetPage({
  sampleId = 'IICT/2025-2026/1101',
  datasheetId = 'URLS/TR/00031',
  sourcePage = 'all-samples',
  onBack,
  onSave,
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
}) {
  const refreshTimerRef = useRef(0);
  const [loadingRefresh, setLoadingRefresh] = useState(false);
  const sourceLabel = sourcePage === 'all-samples' ? 'All Samples' : 'Samples Workspace';
  const activeNav = sourcePage === 'all-samples' ? 'all-samples' : 'samples-workspace';

  useEffect(() => {
    return () => {
      window.clearTimeout(refreshTimerRef.current);
    };
  }, []);

  const handleRefresh = () => {
    window.clearTimeout(refreshTimerRef.current);
    setLoadingRefresh(true);
    refreshTimerRef.current = window.setTimeout(() => {
      setLoadingRefresh(false);
    }, 1200);
  };

  return (
    <AppChrome
      activeNav={activeNav}
      onNavigate={onNavigate}
      breadcrumbs={[
        { key: sourcePage, label: sourceLabel },
        { key: sampleId, label: sampleId },
        { key: 'datasheet', label: 'Datasheet', current: true },
      ]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      pageHeader={
        <PageHeader
          datasheetId={datasheetId}
          loading={loadingRefresh}
          onBack={onBack}
          onRefresh={handleRefresh}
          onSave={onSave}
        />
      }
    >
      <main className="datasheet-page">
        {loadingRefresh ? (
          <LoadingAnimation title="Refreshing datasheet" />
        ) : (
          <div className="datasheet-page__placeholder">Template content will be added here</div>
        )}
      </main>
    </AppChrome>
  );
}
