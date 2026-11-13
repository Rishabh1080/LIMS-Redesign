import AppChrome from '../components/AppChrome/AppChrome';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import './sample-details-page.scss';

function ProformaInvoiceHeader({ sampleId, onBack }) {
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
          <h1 className="h5 mb-0 fw-semibold text-dark text-truncate">
            Proforma Invoice {sampleId}
          </h1>
        </div>

        <div className="d-flex align-items-center gap-3 flex-wrap">
          <PrimaryButton leftIcon="save" size="large">
            Record Payment
          </PrimaryButton>
          <SecondaryButton leftIcon="edit" size="large">
            Edit
          </SecondaryButton>
          <SecondaryButton leftIcon="printer" size="large">
            Print
          </SecondaryButton>
        </div>
      </div>
    </section>
  );
}

export default function ProformaInvoicePage({
  sampleId = 'IICT/2025-2026/1101',
  sourcePage = 'all-samples',
  onBack,
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  sidebarBadgeCounts,
}) {
  const sourceLabel = sourcePage === 'all-samples' ? 'All Samples' : 'Samples Workspace';
  const activeNav = sourcePage === 'all-samples' ? 'all-samples' : 'samples-workspace';

  return (
    <AppChrome
      activeNav={activeNav}
      onNavigate={onNavigate}
      breadcrumbs={[
        { key: sourcePage, label: sourceLabel },
        { key: sampleId, label: sampleId },
        { key: 'proforma-invoice', label: 'Proforma Invoice', current: true },
      ]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      sidebarBadgeCounts={sidebarBadgeCounts}
      pageHeader={<ProformaInvoiceHeader sampleId={sampleId} onBack={onBack} />}
    >
      <main className="smplfy-sample-details-page bg-body-tertiary p-4 min-vh-100">
        <section className="smplfy-card card overflow-hidden min-vh-100" aria-label="Proforma invoice content" />
      </main>
    </AppChrome>
  );
}
