import { useEffect, useRef, useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import { ToastNotification } from '../components/FormControls';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import StatusPill from '../components/StatusPill';
import './tr-details-page.css';

const toastMessageByKey = {
  'datasheet-updated': 'datasheet updated successfully.',
};

function RemnantModal({ open, onCancel, onSubmit }) {
  if (!open) {
    return null;
  }

  return (
    <div className="remnant-modal__backdrop" role="presentation" onClick={onCancel}>
      <div
        className="remnant-modal__card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="remnant-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="remnant-modal__header">
          <h2 id="remnant-modal-title">Remnant available?</h2>
          <button type="button" className="btn remnant-modal__close" aria-label="Close modal" onClick={onCancel}>
            <AppIcon name="close" />
          </button>
        </div>
        <p className="remnant-modal__copy">
          If there&apos;s any sample left after testing, select Yes. Otherwise, select Not available.
        </p>
        <div className="remnant-modal__actions">
          <PrimaryButton styleVariant="red" className="remnant-modal__action" onClick={() => onSubmit(false)}>
            Not Available
          </PrimaryButton>
          <PrimaryButton styleVariant="positive" className="remnant-modal__action" onClick={() => onSubmit(true)}>
            Yes, Available
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function PageHeader({ requestId, workflowStage, onBack, onOpenDatasheet, onOpenRemnantModal }) {
  const isSubmitted = workflowStage === 'submitted';
  const isReadyForReview = workflowStage === 'in-progress';

  return (
    <section className="tr-details-page-header">
      <div className="tr-details-page-header__title-wrap">
        <SecondaryButton size="medium" className="tr-details-page-header__back" aria-label="Go back" onClick={onBack}>
          <AppIcon name="chevron-left" />
        </SecondaryButton>
        <div className="tr-details-page-header__title-copy">
          <div className="tr-details-page-header__title-row">
            <h1>{requestId}</h1>
            <StatusPill color={isSubmitted ? 'orange' : 'gray'} styleType="neutral">
              {isSubmitted ? 'Submitted' : 'Not submiited'}
            </StatusPill>
          </div>
          <div className="tr-details-page-header__timestamp">
            <span>06/03/2026</span>
            <span>10:13</span>
          </div>
        </div>
      </div>

      <div className="tr-details-page-header__actions">
        {isSubmitted ? (
          <PrimaryButton leftIcon="printer">Print</PrimaryButton>
        ) : isReadyForReview ? (
          <>
            <SecondaryButton leftIcon="plus" onClick={onOpenDatasheet}>
              Add Results
            </SecondaryButton>
            <PrimaryButton leftIcon="send" onClick={onOpenRemnantModal}>
              Send for Review
            </PrimaryButton>
          </>
        ) : (
          <PrimaryButton leftIcon="plus" onClick={onOpenDatasheet}>
            Add Results
          </PrimaryButton>
        )}
      </div>
    </section>
  );
}

export default function TrDetailsPage({
  sampleId = 'IICT/2025-2026/1101',
  requestId = 'URLS/26/ULRS/O/2026/30/330',
  sourcePage = 'all-samples',
  workflowStage = 'default',
  initialToast = null,
  onBack,
  onOpenDatasheet,
  onInitialToastConsumed,
  onSubmitForReview,
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
}) {
  const toastTimerRef = useRef(0);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState(toastMessageByKey['datasheet-updated']);
  const [remnantModalOpen, setRemnantModalOpen] = useState(false);
  const sourceLabelByPage = {
    'all-samples': 'All Samples',
    'samples-workspace': 'Samples Workspace',
    'test-requests-home': 'Test Requests',
  };
  const activeNavByPage = {
    'all-samples': 'all-samples',
    'samples-workspace': 'samples-workspace',
    'test-requests-home': 'test-requests-home',
  };
  const sourceLabel = sourceLabelByPage[sourcePage] ?? 'Samples Workspace';
  const activeNav = activeNavByPage[sourcePage] ?? 'samples-workspace';

  useEffect(() => {
    return () => {
      window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!initialToast) {
      setToastVisible(false);
      return undefined;
    }

    window.clearTimeout(toastTimerRef.current);
    setToastMessage(toastMessageByKey[initialToast] ?? initialToast);
    setToastVisible(true);
    onInitialToastConsumed?.();
    toastTimerRef.current = window.setTimeout(() => setToastVisible(false), 5000);

    return () => {
      window.clearTimeout(toastTimerRef.current);
    };
  }, [initialToast, onInitialToastConsumed]);

  const handleRemnantSubmit = (remnantAvailable) => {
    setRemnantModalOpen(false);
    onSubmitForReview?.(remnantAvailable);
  };

  return (
    <AppChrome
      activeNav={activeNav}
      onNavigate={onNavigate}
      breadcrumbs={[
        { key: sourcePage, label: sourceLabel },
        { key: sampleId, label: sampleId },
        { key: 'tr-details', label: 'Test Request', current: true },
      ]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      pageHeader={
        <PageHeader
          requestId={requestId}
          workflowStage={workflowStage}
          onBack={onBack}
          onOpenDatasheet={onOpenDatasheet}
          onOpenRemnantModal={() => setRemnantModalOpen(true)}
        />
      }
    >
      <main className="tr-details-page">
        <div className="tr-details-page__placeholder">
          Template content will be added here
        </div>
      </main>

      <RemnantModal
        open={remnantModalOpen}
        onCancel={() => setRemnantModalOpen(false)}
        onSubmit={handleRemnantSubmit}
      />

      <ToastNotification
        state={toastVisible ? 'default' : 'gone'}
        message={toastMessage}
        className="tr-details-page__toast"
        onClose={() => setToastVisible(false)}
      />
    </AppChrome>
  );
}
