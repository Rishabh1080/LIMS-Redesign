import { useEffect, useRef, useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import { FormElement, ToastNotification } from '../components/FormControls';
import LoadingAnimation from '../components/LoadingAnimation/LoadingAnimation';
import Modal from '../components/Modal/Modal';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import StatusPill from '../components/StatusPill';
import TestRequestApprovalActionModal from '../components/TestRequestApprovalActionModal';
import { getStatusPresentation } from '../status/statusRegistry';
import './tr-details-page.scss';

const toastMessageByKey = {
  'datasheet-updated': 'datasheet updated successfully.',
  'method-added': 'new method added successfully.',
  'method-deleted': 'method deleted.',
  'tr-submitted': 'Test request sent for review successfully.',
  'approval-action-success': 'Approval action completed successfully.',
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
    label: 'Method 1: IS 1963',
    hasNabl: true,
  },
];

const methodMetadataByName = {
  'IS 1963': { hasNabl: true },
  'ASTM D1298': { hasNabl: false },
  'ASTM D445': { hasNabl: true },
  'IP 123': { hasNabl: false },
  'AATCC 61': { hasNabl: true },
};

const trActivityItemsByStage = {
  submitted: [
    {
      label: 'Review Pending',
      time: '12:36 PM',
      date: '15/06/26',
      person: 'Technical Manager',
      tone: 'neutral',
    },
    {
      label: 'Test Request Submitted',
      time: '12:18 PM',
      date: '15/06/26',
      person: 'Lab Analyst',
      tone: 'success',
    },
    {
      label: 'Results Added',
      time: '11:42 AM',
      date: '15/06/26',
      person: 'Lab Analyst',
      tone: 'info',
    },
    {
      label: 'Method Added',
      time: '10:14 AM',
      date: '15/06/26',
      person: 'Lab Analyst',
      tone: 'info',
    },
    {
      label: 'Test Request Created',
      time: '10:13 AM',
      date: '15/06/26',
      person: 'Sample Desk',
      tone: 'info',
    },
  ],
  'in-progress': [
    {
      label: 'Results Pending',
      time: '12:36 PM',
      date: '15/06/26',
      person: 'Lab Analyst',
      tone: 'warning',
    },
    {
      label: 'Datasheet Opened',
      time: '12:12 PM',
      date: '15/06/26',
      person: 'Lab Analyst',
      tone: 'info',
    },
    {
      label: 'Method Added',
      time: '10:14 AM',
      date: '15/06/26',
      person: 'Lab Analyst',
      tone: 'success',
    },
    {
      label: 'Test Request Created',
      time: '10:13 AM',
      date: '15/06/26',
      person: 'Sample Desk',
      tone: 'info',
    },
  ],
  default: [
    {
      label: 'Testing Pending',
      time: '10:13 AM',
      date: '15/06/26',
      person: 'Lab Analyst',
      tone: 'warning',
    },
    {
      label: 'Method Assigned',
      time: '10:13 AM',
      date: '15/06/26',
      person: 'Sample Desk',
      tone: 'info',
    },
    {
      label: 'Test Request Created',
      time: '10:13 AM',
      date: '15/06/26',
      person: 'Sample Desk',
      tone: 'info',
    },
  ],
};

function getTrActionDetails(workflowStage, methodCount) {
  if (workflowStage === 'submitted') {
    return {
      title: 'Review Pending',
      due: '(1 day)',
      requestedBy: 'Technical Manager',
      requestedOn: '15 June 2026, 12:36',
      comments: 'Review submitted test request',
    };
  }

  if (workflowStage === 'in-progress') {
    return {
      title: 'Action Required',
      due: '(2 days)',
      requestedBy: 'Lab Manager',
      requestedOn: '15 June 2026, 12:36',
      comments: methodCount > 1 ? 'Add results for assigned methods' : 'Add results and send for review',
    };
  }

  return {
    title: 'Action Required',
    due: '(3 days)',
    requestedBy: 'Sample Desk',
    requestedOn: '15 June 2026, 10:13',
    comments: 'Start testing for this request',
  };
}

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
      cardClassName="smplfy-remnant-modal"
      actionsClassName="justify-content-between"
      actions={
        <>
          <PrimaryButton styleVariant="red" className="w-100" onClick={() => onSubmit(false)}>
            Not Available
          </PrimaryButton>
          <PrimaryButton styleVariant="positive" className="w-100" onClick={() => onSubmit(true)}>
            Yes, Available
          </PrimaryButton>
        </>
      }
    >
      <p className="text-secondary mb-0">
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

function DeleteMethodModal({ open, method, onCancel, onSubmit }) {
  if (!open || !method) {
    return null;
  }

  return (
    <Modal
      open={open}
      title="Delete method"
      titleId="delete-method-modal-title"
      titleIcon="trash"
      onClose={onCancel}
      size="md"
      cardClassName="smplfy-delete-method-modal"
      actionsClassName="justify-content-between"
      actions={
        <>
          <SecondaryButton leftIcon="close" size="large" onClick={onCancel}>
            Cancel
          </SecondaryButton>
          <PrimaryButton leftIcon="trash" styleVariant="red" onClick={onSubmit}>
            Delete
          </PrimaryButton>
        </>
      }
    >
      <div className="d-grid gap-3">
        <div>
          <p className="mb-2">Are you sure you want to delete this method?</p>
          <p className="text-secondary mb-0">
            The associated datasheet will be lost. This action cannot be undone.
          </p>
        </div>

        <div className="smplfy-tr-delete-method-details border rounded-3 p-3 d-flex align-items-center justify-content-between gap-3">
          <span className="text-truncate">{method.label}</span>
          {method.hasNabl ? (
            <StatusPill color="green" styleType="neutral" className="smplfy-tr-details-method-nabl flex-shrink-0">
              NABL
            </StatusPill>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}

function TrActionRequiredPanel({ workflowStage, methodCount, resolved, onTakeAction }) {
  const actionDetails = getTrActionDetails(workflowStage, methodCount);

  if (resolved) {
    return (
      <section className="smplfy-card card smplfy-tr-details-action is-resolved overflow-hidden">
        <div className="card-header d-flex align-items-center gap-3">
          <AppIcon name="check" size={24} stroke={2} />
          <span>No pending actions</span>
        </div>
        <div className="card-body">
          <p className="mb-0">No pending actions required from your end</p>
        </div>
      </section>
    );
  }

  return (
    <section className="smplfy-card card smplfy-tr-details-action overflow-hidden">
      <div className="card-header d-flex align-items-center gap-3">
        <AppIcon name="alert-circle" size={24} stroke={2} />
        <span>{actionDetails.title}</span>
        <strong>{actionDetails.due}</strong>
      </div>
      <div className="card-body">
        <dl className="mb-0">
          <div>
            <dt>Requested by</dt>
            <dd>{actionDetails.requestedBy}</dd>
          </div>
          <div>
            <dt>Requested on</dt>
            <dd>{actionDetails.requestedOn}</dd>
          </div>
          <div>
            <dt>Comments</dt>
            <dd>{actionDetails.comments}</dd>
          </div>
        </dl>
        <PrimaryButton className="w-100" leftIcon="external-link" size="default" onClick={onTakeAction}>
          Take action
        </PrimaryButton>
      </div>
    </section>
  );
}

function TrActivityRail({ workflowStage }) {
  const activityItems = trActivityItemsByStage[workflowStage] ?? trActivityItemsByStage.default;

  return (
    <section className="smplfy-tr-details-activity">
      <div className="d-flex align-items-center justify-content-between">
        <h2>Activity</h2>
        <button className="smplfy-btn btn btn-link p-0 border-0 text-decoration-underline" type="button">
          See all
        </button>
      </div>
      <ol className="smplfy-tr-details-timeline list-unstyled mb-0">
        {activityItems.map((item) => (
          <li className={`is-${item.tone}`} key={`${item.label}-${item.time}`}>
            <span />
            <div>
              <div>{item.label}</div>
              <div>
                <span>{item.time}</span>
                <span>{item.date}</span>
                {item.person ? <span>{item.person}</span> : null}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function MethodSelector({ methods, selectedMethodId, onSelectMethod, onDeleteMethod }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const selectedMethod = methods.find((method) => method.id === selectedMethodId) ?? methods[0];

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div className="smplfy-tr-details-method-switcher">
      <label className="form-label mb-0" htmlFor="tr-method-selector">
        Select method:
      </label>

      <div ref={rootRef} className={`smplfy-dropdown dropdown${open ? ' show' : ''}`}>
        <button
          id="tr-method-selector"
          type="button"
          className={`smplfy-btn btn dropdown-toggle w-100 d-flex align-items-center justify-content-between${open ? ' show' : ''}`}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          <span className="text-truncate">{selectedMethod?.label ?? 'Select method'}</span>
          <span className="d-inline-flex align-items-center gap-2 flex-shrink-0">
            {selectedMethod?.hasNabl ? (
              <StatusPill color="green" styleType="neutral" className="smplfy-tr-details-method-nabl">
                NABL
              </StatusPill>
            ) : null}
            <AppIcon name="chevron-down" />
          </span>
        </button>

        {open ? (
          <div className="smplfy-dropdown-menu dropdown-menu show w-100" role="menu" aria-label="Select method">
            {methods.map((method) => (
              <button
                key={method.id}
                type="button"
                role="menuitemradio"
                aria-checked={method.id === selectedMethod?.id}
                className={`smplfy-dropdown-item dropdown-item d-flex align-items-center gap-2${method.id === selectedMethod?.id ? ' active' : ''}`}
                onClick={() => {
                  setOpen(false);
                  onSelectMethod(method.id);
                }}
              >
                <span className="text-truncate">{method.label}</span>
                {method.hasNabl ? (
                  <StatusPill color="green" styleType="neutral" className="smplfy-tr-details-method-nabl ms-auto flex-shrink-0">
                    NABL
                  </StatusPill>
                ) : null}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <SecondaryButton
        tone="danger"
        leftIcon="trash"
        className="smplfy-tr-details-delete-method-btn flex-shrink-0 px-0"
        aria-label="Delete method"
        onClick={onDeleteMethod}
      />
    </div>
  );
}

function TrDetailsWorkspace({ methods, selectedMethodId, loadingContent, onSelectMethod, onDeleteMethod }) {
  return (
    <section className="d-flex h-100 flex-column">
      {methods.length > 1 ? (
        <MethodSelector
          methods={methods}
          selectedMethodId={selectedMethodId}
          onSelectMethod={onSelectMethod}
          onDeleteMethod={onDeleteMethod}
        />
      ) : null}

      <div className="smplfy-card card smplfy-tr-details-content flex-fill align-items-center justify-content-center text-center text-secondary">
        {loadingContent ? (
          <LoadingAnimation title="Loading method content" />
        ) : (
          'Template content will be added here'
        )}
      </div>
    </section>
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
      <div className="d-flex align-items-center gap-3 min-w-0">
        <SecondaryButton size="medium" className="px-0 flex-shrink-0" aria-label="Go back" onClick={onBack}>
          <AppIcon name="chevron-left" />
        </SecondaryButton>
        <div className="d-flex flex-column min-w-0">
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <h1 className="h5 fw-semibold text-body mb-0">{requestId}</h1>
            <StatusPill color={resolvedStatusPresentation.color} styleType={resolvedStatusPresentation.styleType}>
              {resolvedStatusPresentation.label}
            </StatusPill>
          </div>
          <div className="d-inline-flex gap-3 text-secondary fw-medium">
            <span>06/03/2026</span>
            <span>10:13</span>
          </div>
        </div>
      </div>

      <div className="d-flex align-items-center gap-3 flex-wrap">
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
  const methodContentTimerRef = useRef(0);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState(toastMessageByKey['datasheet-updated']);
  const [methodContentLoading, setMethodContentLoading] = useState(false);
  const [remnantModalOpen, setRemnantModalOpen] = useState(false);
  const [addMethodModalOpen, setAddMethodModalOpen] = useState(false);
  const [deleteMethodModalOpen, setDeleteMethodModalOpen] = useState(false);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [approvalActionResolved, setApprovalActionResolved] = useState(false);
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
  const selectedMethod = methods.find((method) => method.id === selectedMethodId) ?? methods[0] ?? null;
  useEffect(() => {
    return () => {
      window.clearTimeout(toastTimerRef.current);
      window.clearTimeout(methodContentTimerRef.current);
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

  const handleMethodSelect = (methodId) => {
    if (methodId === selectedMethodId) {
      return;
    }

    window.clearTimeout(methodContentTimerRef.current);
    setSelectedMethodId(methodId);
    setMethodContentLoading(true);
    methodContentTimerRef.current = window.setTimeout(() => {
      setMethodContentLoading(false);
    }, 800);
  };

  const handleMethodSubmit = () => {
    if (!methodDraft) {
      return;
    }

    const methodMetadata = methodMetadataByName[methodDraft] ?? { hasNabl: false };
    const nextMethod = {
      id: `method-${String(methods.length + 1).padStart(3, '0')}`,
      methodName: methodDraft,
      label: `Method ${methods.length + 1}: ${methodDraft}`,
      hasNabl: methodMetadata.hasNabl,
    };

    setMethods((current) => [...current, nextMethod]);
    setSelectedMethodId(nextMethod.id);
    setAddMethodModalOpen(false);
    setMethodDraft('');
    showToast('method-added');
  };

  const handleMethodDelete = () => {
    if (!selectedMethod || methods.length <= 1) {
      setDeleteMethodModalOpen(false);
      return;
    }

    const remainingMethods = methods.filter((method) => method.id !== selectedMethod.id);
    window.clearTimeout(methodContentTimerRef.current);
    setMethods(remainingMethods);
    setSelectedMethodId(remainingMethods[0]?.id ?? '');
    setMethodContentLoading(false);
    setDeleteMethodModalOpen(false);
    showToast('method-deleted');
  };

  const handleSubmitApprovalAction = () => {
    setApprovalActionResolved(true);
    setApprovalModalOpen(false);
    showToast('approval-action-success');
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
      <main className="smplfy-tr-details-page bg-body-tertiary min-vh-100">
        <div className="row g-3 align-items-stretch">
          <section className="col-12 col-xl min-w-0">
            <TrDetailsWorkspace
              methods={methods}
              selectedMethodId={selectedMethodId}
              loadingContent={methodContentLoading}
              onSelectMethod={handleMethodSelect}
              onDeleteMethod={() => setDeleteMethodModalOpen(true)}
            />
          </section>

          <aside className="col-12 col-xl-auto smplfy-tr-details-rail">
            <TrActionRequiredPanel
              workflowStage={workflowStage}
              methodCount={methods.length}
              resolved={approvalActionResolved}
              onTakeAction={() => setApprovalModalOpen(true)}
            />
            <TrActivityRail workflowStage={workflowStage} />
          </aside>
        </div>
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

      <DeleteMethodModal
        open={deleteMethodModalOpen}
        method={selectedMethod}
        onCancel={() => setDeleteMethodModalOpen(false)}
        onSubmit={handleMethodDelete}
      />

      <RemnantModal
        open={remnantModalOpen}
        onCancel={() => setRemnantModalOpen(false)}
        onSubmit={handleRemnantSubmit}
      />

      <TestRequestApprovalActionModal
        action={approvalModalOpen ? 'review' : null}
        requestId={requestId}
        onSubmit={handleSubmitApprovalAction}
        onClose={() => setApprovalModalOpen(false)}
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
