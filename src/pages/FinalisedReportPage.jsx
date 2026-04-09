import { useEffect, useMemo, useRef, useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import LoadingAnimation from '../components/LoadingAnimation/LoadingAnimation';
import MoreActionButton from '../components/MoreActionButton';
import ReportSelector from '../components/ReportSelector';
import SecondaryButton from '../components/SecondaryButton';
import SplitSecondaryButton from '../components/SplitSecondaryButton';
import VersionSelector from '../components/VersionSelector/VersionSelector';
import './finalised-report-page.css';

const finalisedRows = [
  { key: 'cooling-tower-water-1', label: 'Cooling Tower Water', hasNabl: true },
  { key: 'cooling-tower-water-2', label: 'Cooling Tower Water', hasNabl: true },
  { key: 'etp-feed-water', label: 'ETP Feed Water', hasNabl: true },
];

const finalisedGroupDefinitions = [
  { id: 'product-wise', title: 'Product Wise Reports (3)', rows: finalisedRows },
  { id: 'consolidated', title: 'Consolidated Reports (3)', rows: finalisedRows },
  { id: 'parameter-wise', title: 'Parameter Wise Reports (3)', rows: finalisedRows },
];

const versionOptions = [
  { value: 'v1-23-feb-2026', label: 'V1 - 23 Feb 2026' },
  { value: 'v2-03-mar-2026', label: 'V2 - 03 Mar 2026' },
  { value: 'v3-15-mar-2026', label: 'V3 - 15 Mar 2026' },
];

function PageHeader({ reportId, version, loading, onBack, onVersionChange }) {
  return (
    <section className="finalised-report-page-header">
      <div className="finalised-report-page-header__title-wrap">
        <SecondaryButton
          size="medium"
          className="finalised-report-page-header__back"
          aria-label="Go back"
          onClick={onBack}
        >
          <AppIcon name="chevron-left" />
        </SecondaryButton>
        <h1>{reportId}</h1>
        <VersionSelector
          value={version}
          options={versionOptions}
          disabled={loading}
          className="finalised-report-page-header__version"
          onChange={onVersionChange}
        />
      </div>

      <div className="finalised-report-page-header__actions">
        <SplitSecondaryButton label="Print" leftIcon="file-text" />
        <SecondaryButton leftIcon="edit" className="finalised-report-page-header__edit">
          Edit Parameters
        </SecondaryButton>
        <MoreActionButton />
      </div>
    </section>
  );
}

export default function FinalisedReportPage({
  sampleId = 'IICT/2025-2026/1101',
  reportId = 'URLS/2026/64',
  sourcePage = 'all-samples',
  onBack,
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
}) {
  const refreshTimerRef = useRef(0);
  const reportGroups = useMemo(
    () =>
      finalisedGroupDefinitions.map((group) => ({
        ...group,
        rows: group.rows.map((row) => ({
          ...row,
          id: `${group.id}-${row.key}`,
        })),
      })),
    [],
  );
  const [expandedGroupId, setExpandedGroupId] = useState(reportGroups[0]?.id ?? '');
  const [selectedReportId, setSelectedReportId] = useState(reportGroups[0]?.rows[0]?.id ?? '');
  const [selectedVersion, setSelectedVersion] = useState(versionOptions[0]?.value ?? '');
  const [loadingVersion, setLoadingVersion] = useState(false);
  const sourceLabel = sourcePage === 'all-samples' ? 'All Samples' : 'Samples Workspace';
  const activeNav = sourcePage === 'all-samples' ? 'all-samples' : 'samples-workspace';
  const selectedReport =
    reportGroups.flatMap((group) => group.rows).find((row) => row.id === selectedReportId) ??
    reportGroups[0]?.rows[0];
  const selectedVersionLabel =
    versionOptions.find((option) => option.value === selectedVersion)?.label ?? versionOptions[0]?.label;

  useEffect(() => {
    return () => {
      window.clearTimeout(refreshTimerRef.current);
    };
  }, []);

  const handleVersionChange = (version) => {
    window.clearTimeout(refreshTimerRef.current);
    setLoadingVersion(true);
    refreshTimerRef.current = window.setTimeout(() => {
      setSelectedVersion(version);
      setExpandedGroupId(reportGroups[0]?.id ?? '');
      setSelectedReportId(reportGroups[0]?.rows[0]?.id ?? '');
      setLoadingVersion(false);
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
          loading={loadingVersion}
          onBack={onBack}
          onVersionChange={handleVersionChange}
        />
      }
    >
      <main className="finalised-report-page">
        {loadingVersion ? (
          <LoadingAnimation title="Refreshing report version" />
        ) : (
          <>
            <aside className="finalised-report-sidebar">
              {reportGroups.map((group) => (
                <section className={`finalised-report-group ${group.id === expandedGroupId ? 'is-expanded' : ''}`} key={group.id}>
                  <button
                    type="button"
                    className="finalised-report-group__header btn"
                    onClick={() => {
                      setExpandedGroupId(group.id);
                      setSelectedReportId(group.rows[0]?.id ?? '');
                    }}
                    aria-expanded={group.id === expandedGroupId}
                  >
                    <div>
                      <div className="finalised-report-group__title">{group.title}</div>
                      <div className="finalised-report-group__subtitle">Select a report to view</div>
                    </div>
                    <AppIcon name={group.id === expandedGroupId ? 'chevron-up' : 'chevron-down'} />
                  </button>

                  {group.id === expandedGroupId ? (
                    <div className="finalised-report-group__rows">
                      {group.rows.map((row) => (
                        <ReportSelector
                          key={row.id}
                          label={row.label}
                          state={row.id === selectedReportId ? 'active' : 'default'}
                          hasNabl={row.hasNabl}
                          onClick={() => setSelectedReportId(row.id)}
                        />
                      ))}
                    </div>
                  ) : null}
                </section>
              ))}
            </aside>

            <section className="finalised-report-preview">
              <div className="finalised-report-preview__placeholder">
                Template content for {selectedReport?.label ?? 'the selected report'} in {selectedVersionLabel} shows
                up in this container
              </div>
            </section>
          </>
        )}
      </main>
    </AppChrome>
  );
}
