import { useEffect, useRef, useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import CardSelector from '../components/CardSelector';
import InputFieldDropdown from '../components/FormControls/InputFieldDropdown';
import LoadingAnimation from '../components/LoadingAnimation/LoadingAnimation';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import './coa-report-selection-page.css';

const reportTypeOptions = [
  {
    key: 'consolidated',
    title: 'Consolidated',
    description: 'A single COA for all the parameters tested. Single ULR/TC number.',
  },
  {
    key: 'product-wise',
    title: 'Product Wise',
    description: 'Unique COA for each product.\nUnique ULR/TC number for each COA.',
  },
  {
    key: 'parameter-wise',
    title: 'Parameter Wise',
    description: 'Unique COA for each parameter.\nUnique ULR/TC number for each COA.',
  },
];

const templateRows = [
  { key: 'cooling-water-tower', label: 'Cooling Water Tower' },
  { key: 'etp-feed-water', label: 'ETP Feed Water' },
];

const templateOptions = ['Test Report Universal (Main_template)'];

function PageHeader({ reportId, canSubmit, onBack, onGenerate, onFinalize }) {
  return (
    <section className="coa-report-page-header">
      <div className="coa-report-page-header__title-wrap">
        <SecondaryButton size="medium" className="coa-report-page-header__back" aria-label="Go back" onClick={onBack}>
          <AppIcon name="chevron-left" />
        </SecondaryButton>
        <h1>{reportId}</h1>
      </div>

      <div className="coa-report-page-header__actions">
        <PrimaryButton leftIcon="file-text" disabled={!canSubmit} onClick={canSubmit ? onFinalize : undefined}>
          Finalise
        </PrimaryButton>
        <SecondaryButton leftIcon="file-text" disabled={!canSubmit} onClick={canSubmit ? onGenerate : undefined}>
          Generate
        </SecondaryButton>
      </div>
    </section>
  );
}

function TemplateRow({ label, value, onChange }) {
  return (
    <div className="coa-template-row">
      <div className="coa-template-row__label">{label}</div>
      <InputFieldDropdown
        state={value ? 'filled' : 'default'}
        value={value}
        placeholder="Select Template"
        options={templateOptions}
        className="coa-template-row__field"
        onChange={onChange}
      />
    </div>
  );
}

export default function CoaReportSelectionPage({
  sampleId = 'IICT/2025-2026/1101',
  reportId = 'URLS/2026/64',
  sourcePage = 'all-samples',
  onBack,
  onGenerate,
  onFinalize,
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
}) {
  const transitionTimerRef = useRef(0);
  const [selectedReportType, setSelectedReportType] = useState('');
  const [templateSelections, setTemplateSelections] = useState({
    'cooling-water-tower': '',
    'etp-feed-water': '',
  });
  const [loadingAction, setLoadingAction] = useState('');

  const sourceLabel = sourcePage === 'all-samples' ? 'All Samples' : 'Samples Workspace';
  const activeNav = sourcePage === 'all-samples' ? 'all-samples' : 'samples-workspace';
  const showTemplates = Boolean(selectedReportType);
  const canSubmit = showTemplates && Object.values(templateSelections).every(Boolean);

  useEffect(() => {
    return () => {
      window.clearTimeout(transitionTimerRef.current);
    };
  }, []);

  const startTransition = (action) => {
    if (!canSubmit) {
      return;
    }

    window.clearTimeout(transitionTimerRef.current);
    setLoadingAction(action);
    transitionTimerRef.current = window.setTimeout(() => {
      if (action === 'generate') {
        onGenerate?.();
      } else {
        onFinalize?.();
      }
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
          canSubmit={canSubmit}
          onBack={onBack}
          onGenerate={() => startTransition('generate')}
          onFinalize={() => startTransition('finalize')}
        />
      }
    >
      <main className="coa-report-page">
        {loadingAction ? (
          <LoadingAnimation
            title={loadingAction === 'generate' ? 'Generating report' : 'Finalising report'}
          />
        ) : (
          <section className="coa-report-panel">
            <div className="coa-report-panel__title">Select Report Type</div>

            <div className="coa-report-panel__body">
              <div className="coa-report-panel__options">
                {reportTypeOptions.map((option) => (
                  <CardSelector
                    key={option.key}
                    title={option.title}
                    description={option.description}
                    selected={selectedReportType === option.key}
                    onClick={() => {
                      setSelectedReportType(option.key);
                      setTemplateSelections({
                        'cooling-water-tower': '',
                        'etp-feed-water': 'Test Report Universal (Main_template)',
                      });
                    }}
                  />
                ))}
              </div>

              <div className="coa-report-panel__templates">
                {showTemplates ? (
                  <>
                    <div className="coa-report-panel__templates-title">Select Templates</div>
                    <div className="coa-report-panel__templates-list">
                      {templateRows.map((row) => (
                        <TemplateRow
                          key={row.key}
                          label={row.label}
                          value={templateSelections[row.key]}
                          onChange={(event) =>
                            setTemplateSelections((current) => ({
                              ...current,
                              [row.key]: event.target.value,
                            }))
                          }
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="coa-report-panel__placeholder">
                    Select a <span className="coa-report-panel__placeholder-emphasis">Report type</span> to continue
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </main>
    </AppChrome>
  );
}
