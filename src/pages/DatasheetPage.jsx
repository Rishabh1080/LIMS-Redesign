import { useEffect, useRef, useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import LoadingAnimation from '../components/LoadingAnimation/LoadingAnimation';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import './datasheet-page.scss';

function PageHeader({ datasheetId, loading, onBack, onRefresh, onSave }) {
  return (
    <section className="d-flex align-items-center justify-content-between gap-3 bg-white border-bottom flex-wrap px-4 py-3">
      <div className="d-flex align-items-center gap-3 min-w-0">
        <SecondaryButton size="medium" className="px-0 flex-shrink-0" aria-label="Go back" onClick={onBack}>
          <AppIcon name="chevron-left" />
        </SecondaryButton>
        <h1 className="h5 fw-semibold text-body mb-0">{datasheetId}</h1>
      </div>

      <div className="d-flex align-items-center gap-3 flex-wrap">
        <SecondaryButton leftIcon="calendar">
          Calculate
        </SecondaryButton>
        <SecondaryButton
          size="large"
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
      <main className="smplfy-datasheet-page d-flex bg-body-tertiary p-4 min-vh-100">
        {loadingRefresh ? (
          <LoadingAnimation title="Refreshing datasheet" />
        ) : (
          <div className="smplfy-card card flex-fill align-items-center justify-content-center text-center text-secondary">
            Template content will be added here
          </div>
        )}
      </main>
    </AppChrome>
  );
}
