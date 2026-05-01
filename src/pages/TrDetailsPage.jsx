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
import './tr-details-page.css';

const toastMessageByKey = {
  'datasheet-updated': 'datasheet updated successfully.',
  'method-added': 'new method added successfully.',
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
      bodyClassName="add-method-modal__body"
      actionsClassName="add-method-modal__actions"
      actions={
        <>
          <SecondaryButton leftIcon="close" size="large" className="add-method-modal__cancel" onClick={onCancel}>
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
        className="add-method-modal__form"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div className="add-method-modal__request-id">
          <span className="add-method-modal__request-id-label">Test Request ID:</span>
          <span className="add-method-modal__request-id-value">{requestId}</span>
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
    <section className="tr-details-page-header">
      <div className="tr-details-page-header__title-wrap">
        <SecondaryButton size="medium" className="tr-details-page-header__back" aria-label="Go back" onClick={onBack}>
          <AppIcon name="chevron-left" />
        </SecondaryButton>
        <div className="tr-details-page-header__title-copy">
          <div className="tr-details-page-header__title-row">
            <h1>{requestId}</h1>
            <StatusPill color={resolvedStatusPresentation.color} styleType={resolvedStatusPresentation.styleType}>
              {resolvedStatusPresentation.label}
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
      <main className={`tr-details-page ${methods.length > 1 ? '' : 'tr-details-page--single-method'}`.trim()}>
        {methods.length > 1 ? (
          <>
            <aside className="tr-details-methods-sidebar">
              <section className="tr-details-methods-group is-expanded">
                <button
                  type="button"
                  className="tr-details-methods-group__header"
                  aria-expanded="true"
                >
                  <div className="tr-details-methods-group__header-copy">
                    <div className="tr-details-methods-group__title">Test Methods ({methods.length})</div>
                  </div>
                  <AppIcon name="chevron-down" className="tr-details-methods-group__chevron" />
                </button>

                <div className="tr-details-methods-group__rows">
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

            <section className="tr-details-page__content">
              <div className="tr-details-page__placeholder">
                Template content will be added here
              </div>
            </section>
          </>
        ) : (
          <section className="tr-details-page__content">
            <div className="tr-details-page__placeholder">
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
        className="tr-details-page__toast"
        onClose={() => setToastVisible(false)}
      />
    </AppChrome>
  );
}
