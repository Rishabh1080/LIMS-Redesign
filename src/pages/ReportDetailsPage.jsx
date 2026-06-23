import { useMemo, useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import { FormElement } from '../components/FormControls';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import { getReportById } from '../data/reportsData';
import './sample-details-page.scss';

const defaultReportConfig = {
  date: '',
  sampleCategory: '',
  product: '',
  batchNo: '',
  parameters: '',
};

const reportOptions = {
  sampleCategory: ['Consumer Sample', 'Client Sample', 'Retention Sample', 'Market Sample'],
  product: ['DPONATE 2000', 'Organic Intermediate', 'Sodium Hydroxide', 'Eriochrome Black T Indicator'],
  batchNo: ['B240301', 'C240412', 'L250214', 'R250118'],
  parameters: ['Assay', 'pH', 'Viscosity', 'Moisture', 'Appearance'],
};

function ReportDetailsHeader({ report, onBack, onConfigure }) {
  return (
    <section className="smplfy-sample-details-header bg-white border-bottom">
      <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
        <div className="d-flex align-items-center gap-3 min-w-0">
          <SecondaryButton
            size="medium"
            leftIcon="chevron-left"
            className="px-0 flex-shrink-0"
            aria-label="Go back"
            onClick={onBack}
          />
          <div className="d-flex flex-column min-w-0">
            <h1 className="h5 mb-0 fw-semibold text-dark text-truncate">{report.name}</h1>
            <div className="d-inline-flex gap-2 text-secondary fw-medium">
              <span>Report Details</span>
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-3 flex-wrap">
          <SecondaryButton leftIcon="settings" size="large" onClick={onConfigure}>
            Configure
          </SecondaryButton>
          <PrimaryButton leftIcon="download" size="large">
            Download as PDF
          </PrimaryButton>
        </div>
      </div>
    </section>
  );
}

function ReportConfigToolbar({ values, onChange, onApply, applyDisabled }) {
  return (
    <section className="d-flex flex-column gap-4 pb-4">
      <div className="row align-items-center gx-2 gy-3">
        <div className="col-auto">
          <label className="smplfy-form-label form-label mb-0" htmlFor="report-date-range">
            Date range
          </label>
        </div>
        <div className="col-12 col-md-4 col-xl-3">
          <FormElement
            type="date"
            inputProps={{
              id: 'report-date-range',
              value: values.date,
              state: 'filled',
              onChange: (event) => onChange('date', event.target.value),
            }}
          />
        </div>
        <div className="col-auto">
          <PrimaryButton leftIcon="refresh" disabled={applyDisabled} onClick={onApply}>
            Apply
          </PrimaryButton>
        </div>
      </div>
    </section>
  );
}

function ReportFiltersDrawer({ open, values, onChange, onApply, onCancel }) {
  if (!open) {
    return null;
  }

  return (
    <>
      <div className="offcanvas-backdrop fade show" onClick={onCancel} />
      <aside className="smplfy-all-samples-offcanvas offcanvas offcanvas-end show" tabIndex="-1" role="dialog" aria-modal="true" aria-labelledby="report-filters-title">
        <div className="offcanvas-header border-bottom">
          <h2 className="offcanvas-title h5 mb-0" id="report-filters-title">Configure Report</h2>
          <button type="button" className="btn-close" aria-label="Close configure panel" onClick={onCancel} />
        </div>

        <div className="offcanvas-body d-flex flex-column gap-3">
          <FormElement
            type="dropdown"
            label="Sample category"
            inputProps={{
              value: values.sampleCategory,
              placeholder: 'Select sample category',
              options: reportOptions.sampleCategory,
              onChange: (event) => onChange('sampleCategory', event.target.value),
            }}
          />
          <FormElement
            type="dropdown"
            label="Product"
            inputProps={{
              value: values.product,
              placeholder: 'Select product',
              options: reportOptions.product,
              onChange: (event) => onChange('product', event.target.value),
            }}
          />
          <FormElement
            type="dropdown"
            label="Batch No./Lot No."
            inputProps={{
              value: values.batchNo,
              placeholder: 'Select batch/lot',
              options: reportOptions.batchNo,
              onChange: (event) => onChange('batchNo', event.target.value),
            }}
          />
          <FormElement
            type="dropdown"
            label="Parameters"
            inputProps={{
              value: values.parameters,
              placeholder: 'Select parameter',
              options: reportOptions.parameters,
              onChange: (event) => onChange('parameters', event.target.value),
            }}
          />
        </div>

        <div className="d-flex justify-content-between gap-3 border-top">
          <SecondaryButton onClick={onCancel}>
            Cancel
          </SecondaryButton>
          <PrimaryButton onClick={onApply}>
            Apply
          </PrimaryButton>
        </div>
      </aside>
    </>
  );
}

function ReportTemplateCard({ refreshKey }) {
  return (
    <section className="smplfy-card card overflow-hidden">
      <div className="card-header d-flex align-items-center">
        <h2 className="card-title mb-0">Template content</h2>
      </div>
      <div
        key={refreshKey}
        className="card-body d-flex flex-column align-items-center justify-content-center text-center"
        style={{ minHeight: 520 }}
      >
        <AppIcon name="file-text" size={48} className="text-primary mb-3" />
        <div className="fw-semibold text-dark">Report template content</div>
      </div>
    </section>
  );
}

export default function ReportDetailsPage({
  report,
  onBack,
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  sidebarBadgeCounts,
}) {
  const resolvedReport = useMemo(
    () => report ?? getReportById(),
    [report],
  );
  const [draftConfig, setDraftConfig] = useState(defaultReportConfig);
  const [appliedConfig, setAppliedConfig] = useState(defaultReportConfig);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const isDateRangeDirty = draftConfig.date !== appliedConfig.date;

  const handleConfigChange = (field, value) => {
    setDraftConfig((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleApply = () => {
    setAppliedConfig(draftConfig);
    setFiltersOpen(false);
    setRefreshKey((current) => current + 1);
  };

  return (
    <AppChrome
      activeNav="reports"
      onNavigate={onNavigate}
      breadcrumbs={[
        { key: 'reports', label: 'Reports' },
        { key: 'report-details', label: resolvedReport.name, current: true },
      ]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      sidebarBadgeCounts={sidebarBadgeCounts}
      pageHeader={(
        <ReportDetailsHeader
          report={resolvedReport}
          onBack={onBack}
          onConfigure={() => setFiltersOpen(true)}
        />
      )}
    >
      <main className="smplfy-sample-details-page bg-body-tertiary p-4 min-vh-100">
        <div className="container-fluid px-0 d-flex flex-column gap-3">
          <ReportConfigToolbar
            values={draftConfig}
            onChange={handleConfigChange}
            onApply={handleApply}
            applyDisabled={!isDateRangeDirty}
          />
          <ReportTemplateCard refreshKey={refreshKey} />
        </div>
      </main>
      <ReportFiltersDrawer
        open={filtersOpen}
        values={draftConfig}
        onChange={handleConfigChange}
        onApply={handleApply}
        onCancel={() => {
          setDraftConfig(appliedConfig);
          setFiltersOpen(false);
        }}
      />
    </AppChrome>
  );
}
