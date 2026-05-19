import { useEffect, useRef, useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import LoadingAnimation from '../components/LoadingAnimation/LoadingAnimation';
import MoreActionButton from '../components/MoreActionButton';
import ReportSelector from '../components/ReportSelector';
import SecondaryButton from '../components/SecondaryButton';
import SplitSecondaryButton from '../components/SplitSecondaryButton';
import VersionSelector from '../components/VersionSelector/VersionSelector';
import './temp-report-page.scss';

const reportRows = [
  { key: 'cooling-tower-water-1', label: 'Cooling Tower Water', hasNabl: true },
  { key: 'cooling-tower-water-2', label: 'Cooling Tower Water', hasNabl: false },
  { key: 'etp-feed-water', label: 'ETP Feed Water', hasNabl: true },
];

const versionOptions = [
  { value: 'v1-23-feb-2026', label: 'V1 - 23 Feb 2026' },
  { value: 'v2-03-mar-2026', label: 'V2 - 03 Mar 2026' },
  { value: 'v3-15-mar-2026', label: 'V3 - 15 Mar 2026' },
];

function PageHeader({ reportId, version, loading, onBack, onFinalize, onVersionChange }) {
  return (
    <section className="bg-white border-bottom d-flex align-items-center justify-content-between gap-3 flex-wrap px-4 py-3">
      <div className="d-flex align-items-center gap-3">
        <SecondaryButton size="medium" leftIcon="chevron-left" aria-label="Go back" onClick={onBack} />
        <h1 className="h6 mb-0 fw-semibold text-dark">{reportId}</h1>
        <VersionSelector
          value={version}
          options={versionOptions}
          disabled={loading}
          onChange={onVersionChange}
        />
      </div>

      <div className="d-flex align-items-center gap-3 flex-wrap">
        <SplitSecondaryButton label="Print" leftIcon="file-text" />
        <SecondaryButton leftIcon="file-text" onClick={onFinalize}>
          Finalize
        </SecondaryButton>
        <MoreActionButton />
      </div>
    </section>
  );
}

export default function TempReportPage({
  sampleId = 'IICT/2025-2026/1101',
  reportId = 'URLS/2026/64',
  sourcePage = 'all-samples',
  onBack,
  onFinalize,
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
}) {
  const refreshTimerRef = useRef(0);
  const finalizeTimerRef = useRef(0);
  const productReportRows = reportRows.map((row) => ({
    ...row,
    id: `product-wise-${row.key}`,
  }));
  const [selectedReportId, setSelectedReportId] = useState(productReportRows[0]?.id ?? '');
  const [selectedVersion, setSelectedVersion] = useState(versionOptions[0]?.value ?? '');
  const [loadingVersion, setLoadingVersion] = useState(false);
  const [loadingFinalize, setLoadingFinalize] = useState(false);
  const sourceLabel = sourcePage === 'all-samples' ? 'All Samples' : 'Samples Workspace';
  const activeNav = sourcePage === 'all-samples' ? 'all-samples' : 'samples-workspace';
  const selectedReport =
    productReportRows.find((row) => row.id === selectedReportId) ?? productReportRows[0];
  const selectedVersionLabel =
    versionOptions.find((option) => option.value === selectedVersion)?.label ?? versionOptions[0]?.label;

  useEffect(() => {
    return () => {
      window.clearTimeout(refreshTimerRef.current);
      window.clearTimeout(finalizeTimerRef.current);
    };
  }, []);

  const handleVersionChange = (version) => {
    window.clearTimeout(refreshTimerRef.current);
    setLoadingVersion(true);
    refreshTimerRef.current = window.setTimeout(() => {
      setSelectedVersion(version);
      setSelectedReportId(productReportRows[0]?.id ?? '');
      setLoadingVersion(false);
    }, 1200);
  };

  const handleFinalizeTransition = () => {
    window.clearTimeout(finalizeTimerRef.current);
    setLoadingFinalize(true);
    finalizeTimerRef.current = window.setTimeout(() => {
      onFinalize?.();
    }, 1200);
  };

  return (
    <AppChrome
      activeNav={activeNav}
      onNavigate={onNavigate}
      breadcrumbs={[
        { key: sourcePage, label: sourceLabel },
        { key: sampleId, label: sampleId },
        { key: reportId, label: reportId, current: true },
      ]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      pageHeader={
        <PageHeader
          reportId={reportId}
          version={selectedVersion}
          loading={loadingVersion || loadingFinalize}
          onBack={onBack}
          onFinalize={handleFinalizeTransition}
          onVersionChange={handleVersionChange}
        />
      }
    >
      <main className="smplfy-temp-report-page bg-body-tertiary p-4 min-vh-100">
        {loadingVersion || loadingFinalize ? (
          <LoadingAnimation
            title={loadingFinalize ? 'Finalising report' : 'Refreshing report version'}
          />
        ) : (
          <div className="smplfy-temp-report-grid row g-3 align-items-stretch">
            <aside className="col-12 col-xl-3 d-flex flex-column gap-3">
              <section className="smplfy-card card overflow-hidden">
                <div className="w-100 d-flex align-items-center justify-content-between text-start">
                  <div className="d-flex flex-column">
                    <div className="fw-semibold text-dark">Product Wise Reports (3)</div>
                    <div className="text-secondary fw-normal mt-1">Select a report to view</div>
                  </div>
                </div>

                <div className="list-group list-group-flush border rounded overflow-hidden">
                  {productReportRows.map((row) => (
                    <ReportSelector
                      key={row.id}
                      label={row.label}
                      state={row.id === selectedReportId ? 'active' : 'default'}
                      hasNabl={row.hasNabl}
                      onClick={() => setSelectedReportId(row.id)}
                    />
                  ))}
                </div>
              </section>
            </aside>

            <section className="col-12 col-xl-9">
              <div className="smplfy-card card h-100">
                <div className="card-body d-flex align-items-center justify-content-center text-center text-secondary fw-medium">
                Template content for {selectedReport?.label ?? 'the selected report'} in {selectedVersionLabel} shows
                up in this container
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </AppChrome>
  );
}
