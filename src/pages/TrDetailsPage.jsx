import { useEffect, useRef, useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import { FormElement, ToastNotification } from '../components/FormControls';
import Modal from '../components/Modal/Modal';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import ReportSelector from '../components/ReportSelector';
import SecondaryButton from '../components/SecondaryButton';
import StatusPill from '../components/StatusPill';
import { getStatusPresentation } from '../status/statusRegistry';
import './tr-details-page.scss';

const toastMessageByKey = {
  'datasheet-updated': 'datasheet updated successfully.',
  'method-added': 'new method added successfully.',
  'tr-submitted': 'Test request sent for review successfully.',
};

const methodOptions = [
  'IS 1963',
  'ASTM D1298',
  'ASTM D445',
  'IP 123',
  'AATCC 61',
];

const initialMethods = [
  {
    id: 'method-001',
    methodName: 'IS 1963',
    label: 'Method 1',
  },
];

function RemnantModal({ open, onCancel, onSubmit }) {
  if (!open) {
    return null;
  }

  return (
    <Modal
      open={open}
      title="Remnant available?"
      titleId="remnant-modal-title"
      onClose={onCancel}
      size="md"
      cardClassName="smplfy-remnant-modal-dialog"
      className="smplfy-remnant-modal"
      actionsClassName="smplfy-remnant-modal-actions"
      actions={
        <>
          <PrimaryButton styleVariant="red" className="smplfy-remnant-modal-action w-100" onClick={() => onSubmit(false)}>
            Not Available
          </PrimaryButton>
          <PrimaryButton styleVariant="positive" className="smplfy-remnant-modal-action w-100" onClick={() => onSubmit(true)}>
            Yes, Available
          </PrimaryButton>
        </>
      }
    >
      <p className="smplfy-remnant-modal-copy text-secondary mb-0">
        If there&apos;s any sample left after testing, select Yes. Otherwise, select Not available.
      </p>
    </Modal>
  );
}

function AddMethodModal({ open, requestId, draftValue, onDraftChange, onCancel, onSubmit }) {
  if (!open) {
    return null;
  }

  return (
    <Modal
      open={open}
      title="Add Method"
      titleId="add-method-modal-title"
      titleIcon="plus"
      onClose={onCancel}
      size="md"
      bodyClassName="pt-0"
      actionsClassName="d-flex justify-content-between w-100"
      actions={
        <>
          <SecondaryButton leftIcon="close" size="large" onClick={onCancel}>
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" form="add-method-form" leftIcon="plus" disabled={!draftValue}>
            Add
          </PrimaryButton>
        </>
      }
    >
      <form
        id="add-method-form"
        className="d-grid gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div className="d-flex align-items-baseline gap-2 mt-2 pt-2 text-secondary">
          <span>Test Request ID:</span>
          <span className="fw-bold text-body">{requestId}</span>
        </div>

        <FormElement
          type="dropdown"
          label="Method"
          inputProps={{
            value: draftValue,
            placeholder: 'Select New Method',
            options: methodOptions,
            onChange: (event) => onDraftChange(event.target.value),
          }}
        />
      </form>
    </Modal>
  );
}

function PageHeader({
  requestId,
  requestStatus,
  workflowStage,
  onBack,
  onOpenDatasheet,
  onOpenAddMethodModal,
  onOpenRemnantModal,
}) {
  const isSubmitted = workflowStage === 'submitted';
  const isReadyForReview = workflowStage === 'in-progress';
  const resolvedStatusPresentation = requestStatus
    ? getStatusPresentation('testRequest', requestStatus)
    : {
        label: isSubmitted ? 'Submitted' : 'Not submiited',
        color: isSubmitted ? 'orange' : 'gray',
        styleType: 'neutral',
      };

  return (
    <section className="smplfy-tr-details-header d-flex align-items-center justify-content-between gap-3 bg-white border-bottom flex-wrap">
      <div className="smplfy-tr-details-header-title d-flex align-items-center gap-3 min-w-0">
        <SecondaryButton size="medium" className="smplfy-tr-details-header-back px-0 flex-shrink-0" aria-label="Go back" onClick={onBack}>
          <AppIcon name="chevron-left" />
        </SecondaryButton>
        <div className="d-flex flex-column min-w-0">
          <div className="smplfy-tr-details-title-row d-flex align-items-center gap-3 flex-wrap">
            <h1 className="h5 fw-semibold text-body mb-0">{requestId}</h1>
            <StatusPill color={resolvedStatusPresentation.color} styleType={resolvedStatusPresentation.styleType}>
              {resolvedStatusPresentation.label}
            </StatusPill>
          </div>
          <div className="smplfy-tr-details-timestamp d-inline-flex gap-3 mt-2 text-secondary fw-medium">
            <span>06/03/2026</span>
            <span>10:13</span>
          </div>
        </div>
      </div>

      <div className="smplfy-tr-details-header-actions d-flex align-items-center gap-3 flex-wrap">
        {isSubmitted ? (
          <PrimaryButton leftIcon="printer">Print</PrimaryButton>
        ) : isReadyForReview ? (
          <>
            <SecondaryButton leftIcon="plus" onClick={onOpenAddMethodModal}>
              Add Method
            </SecondaryButton>
            <SecondaryButton leftIcon="plus" onClick={onOpenDatasheet}>
              Add Results
            </SecondaryButton>
            <PrimaryButton leftIcon="send" onClick={onOpenRemnantModal}>
              Send for Review
            </PrimaryButton>
          </>
        ) : (
          <>
            <SecondaryButton leftIcon="plus" onClick={onOpenAddMethodModal}>
              Add Method
            </SecondaryButton>
            <PrimaryButton leftIcon="plus" onClick={onOpenDatasheet}>
              Add Results
            </PrimaryButton>
          </>
        )}
      </div>
    </section>
  );
}

export default function TrDetailsPage({
  sampleId = 'IICT/2025-2026/1101',
  requestId = 'URLS/26/ULRS/O/2026/30/330',
  requestStatus = null,
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
  const [addMethodModalOpen, setAddMethodModalOpen] = useState(false);
  const [methodDraft, setMethodDraft] = useState('');
  const [methods, setMethods] = useState(initialMethods);
  const [selectedMethodId, setSelectedMethodId] = useState(initialMethods[0]?.id ?? '');
  const previousMethodCountRef = useRef(initialMethods.length);
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

  useEffect(() => {
    const previousCount = previousMethodCountRef.current;
    if (methods.length > 1 && previousCount <= 1) {
      onSidebarCollapsedChange?.(true);
    }
    previousMethodCountRef.current = methods.length;
  }, [methods.length, onSidebarCollapsedChange]);

  const handleRemnantSubmit = (remnantAvailable) => {
    setRemnantModalOpen(false);
    onSubmitForReview?.(remnantAvailable);
  };

  const showToast = (toastKey) => {
    window.clearTimeout(toastTimerRef.current);
    setToastMessage(toastMessageByKey[toastKey] ?? toastKey);
    setToastVisible(true);
    toastTimerRef.current = window.setTimeout(() => setToastVisible(false), 5000);
  };

  const handleMethodSubmit = () => {
    if (!methodDraft) {
      return;
    }

    const duplicateCount = methods.filter((method) => method.methodName === methodDraft).length;
    const nextMethod = {
      id: `method-${String(methods.length + 1).padStart(3, '0')}`,
      methodName: methodDraft,
      label: `Method ${methods.length + 1}`,
    };

    setMethods((current) => [...current, nextMethod]);
    setSelectedMethodId(nextMethod.id);
    setAddMethodModalOpen(false);
    setMethodDraft('');
    showToast('method-added');
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
          requestStatus={requestStatus}
          workflowStage={workflowStage}
          onBack={onBack}
          onOpenDatasheet={onOpenDatasheet}
          onOpenAddMethodModal={() => setAddMethodModalOpen(true)}
          onOpenRemnantModal={() => setRemnantModalOpen(true)}
        />
      }
    >
      <main className={`smplfy-tr-details-page bg-body-tertiary min-vh-100 ${methods.length > 1 ? '' : 'smplfy-tr-details-page-single'}`}>
        {methods.length > 1 ? (
          <div className="smplfy-tr-details-grid row g-3 h-100">
            <aside className="col-xl-3 col-12">
              <section className="smplfy-tr-details-methods smplfy-card card overflow-hidden">
                <button
                  type="button"
                  className="smplfy-tr-details-methods-header btn w-100 d-flex align-items-center justify-content-between text-start bg-white border-0 fw-semibold"
                  aria-expanded="true"
                >
                  <span>Test Methods ({methods.length})</span>
                  <AppIcon name="chevron-down" />
                </button>

                <div className="smplfy-tr-details-methods-list list-group list-group-flush m-2 border rounded-3 overflow-hidden">
                  {methods.map((method) => (
                    <ReportSelector
                      key={method.id}
                      label={method.label}
                      state={method.id === selectedMethodId ? 'active' : 'default'}
                      hasNabl={false}
                      onClick={() => setSelectedMethodId(method.id)}
                    />
                  ))}
                </div>
              </section>
            </aside>

            <section className="col-xl-9 col-12 d-flex">
              <div className="smplfy-tr-details-placeholder smplfy-card card flex-fill align-items-center justify-content-center text-center text-secondary">
                Template content will be added here
              </div>
            </section>
          </div>
        ) : (
          <section className="d-flex h-100">
            <div className="smplfy-tr-details-placeholder smplfy-card card flex-fill align-items-center justify-content-center text-center text-secondary">
              Template content will be added here
            </div>
          </section>
        )}
      </main>

      <AddMethodModal
        open={addMethodModalOpen}
        requestId={requestId}
        draftValue={methodDraft}
        onDraftChange={setMethodDraft}
        onCancel={() => {
          setAddMethodModalOpen(false);
          setMethodDraft('');
        }}
        onSubmit={handleMethodSubmit}
      />

      <RemnantModal
        open={remnantModalOpen}
        onCancel={() => setRemnantModalOpen(false)}
        onSubmit={handleRemnantSubmit}
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
