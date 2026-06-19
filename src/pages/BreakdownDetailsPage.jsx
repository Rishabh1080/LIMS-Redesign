import { useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import { ToastNotification } from '../components/FormControls';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import ResolveBreakdownModal from '../components/ResolveBreakdownModal';
import SecondaryButton from '../components/SecondaryButton';

function formatIsoDateForDisplay(value) {
  if (!value) return '-';

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
  }

  return value;
}

function BreakdownDetailsHeader({ onBack, onResolve, resolved }) {
  return (
    <section className="bg-white border-bottom px-4 py-3">
      <div className="container-fluid px-0">
        <div className="row align-items-center justify-content-between gx-0 gy-3">
          <div className="col-auto d-flex align-items-center gap-3">
            <SecondaryButton
              size="medium"
              leftIcon="chevron-left"
              className="px-0 flex-shrink-0"
              onClick={onBack}
              aria-label="Go back"
            />
            <h1 className="h5 mb-0 fw-semibold text-dark">Breakdown Details</h1>
          </div>
          {!resolved ? (
            <div className="col-auto">
              <PrimaryButton leftIcon="check" onClick={onResolve}>
                Resolve Breakdown
              </PrimaryButton>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default function BreakdownDetailsPage({
  service,
  instrumentId,
  instrumentName,
  onBack,
  onServiceUpdate,
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  sidebarBadgeCounts,
}) {
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const isResolved = Boolean(service?.resolvedOn);

  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(false);

    window.requestAnimationFrame(() => {
      setToastVisible(true);
      window.setTimeout(() => setToastVisible(false), 5000);
    });
  };

  const handleResolveBreakdown = (draft) => {
    if (!service) {
      setResolveModalOpen(false);
      return;
    }

    onServiceUpdate?.({
      ...service,
      status: 'Pending',
      stage: 'pending-default',
      resolvedOn: new Date().toLocaleDateString('en-GB'),
      resolutionServiceDate: formatIsoDateForDisplay(draft.serviceDate),
      resolutionVendor: draft.vendor,
      resolutionAttachment: draft.attachment,
      resolutionCost: draft.cost,
      resolutionComments: draft.comments,
    });
    setResolveModalOpen(false);
    showToast('Breakdown resolved.');
  };

  return (
    <AppChrome
      activeNav="instruments"
      onNavigate={onNavigate}
      breadcrumbs={[
        { key: 'instruments', label: 'Instruments' },
        { key: 'instrument-details', label: instrumentName || instrumentId || 'Instrument' },
        { key: 'breakdown-details', label: 'Breakdown Details', current: true },
      ]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      sidebarBadgeCounts={sidebarBadgeCounts}
      pageHeader={
        <BreakdownDetailsHeader
          onBack={onBack}
          onResolve={() => setResolveModalOpen(true)}
          resolved={isResolved}
        />
      }
    >
      <main className="bg-body-tertiary p-4 min-vh-100" />

      <ResolveBreakdownModal
        open={resolveModalOpen}
        breakdownDate={service?.breakdownDate}
        onCancel={() => setResolveModalOpen(false)}
        onSubmit={handleResolveBreakdown}
      />

      <ToastNotification
        state={toastVisible ? 'default' : 'gone'}
        message={toastMessage}
        className="position-fixed bottom-0 start-0 m-4"
        onClose={() => setToastVisible(false)}
      />
    </AppChrome>
  );
}
