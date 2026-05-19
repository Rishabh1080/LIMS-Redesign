import { useEffect, useMemo, useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import DataTable from '../components/DataTable';
import { FormElement, ToastNotification } from '../components/FormControls';
import NavSelector from '../components/NavSelector';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import StatusPill from '../components/StatusPill';
import { AllocateTestRequestButton, ViewTestRequestButton } from '../components/TestRequestActions';
import Modal from '../components/Modal/Modal';
import { getStatusPresentation } from '../status/statusRegistry';
import {
  allTestRequestBuckets,
  getTestRequestsForTab,
  testRequestsHomeTabs,
} from '../data/testRequestsHomeData';
import './test-requests-home-page.scss';

const allocationTabs = [
  { key: 'analyst', label: 'Analysts' },
  { key: 'instrument', label: 'Instrument' },
  { key: 'material', label: 'Material' },
];

const allocationTableByTab = {
  analyst: {
    columns: ['Sr.', 'User Name', '# of TR for Parameter', 'Last Tested On', 'Worload (Man Days)', 'Has Valid Certification?', 'On leave?', 'Workload Sheet'],
    rows: [
      ['1', 'Technical Assistant', '19', '01-04-2026', '115506', 'No', 'No', 'Link'],
      ['2', 'Technical Assistant', '19', '01-04-2026', '115506', 'No', 'No', 'Link'],
      ['3', 'Technical Assistant', '19', '01-04-2026', '115506', 'No', 'No', 'Link'],
    ],
  },
  instrument: {
    columns: ['Sr.', 'Instrument Name', 'Last Calibrated At', 'Overall Workload'],
    rows: [
      ['1', 'Technical Assistant', '01-04-2026', '12'],
      ['2', 'Technical Assistant', '01-04-2026', '12'],
    ],
  },
  material: {
    columns: ['Sr.', 'Material Name', 'Required Quantity', 'Available Quantity'],
    rows: [
      ['1', '5% Concentrated NaOH', '1000', '2500'],
      ['2', '5% Concentrated NaOH', '1000', '2500'],
    ],
  },
};

function AllocationModal({
  open,
  activeTab,
  details,
  allocateTo,
  reviewer,
  instrument,
  onSubmit,
  onTabChange,
  onAllocateToChange,
  onReviewerChange,
  onInstrumentChange,
  onCancel,
}) {
  if (!open) {
    return null;
  }

  const table = allocationTableByTab[activeTab];

  return (
    <Modal
      open={open}
      title="Allocate Test Request"
      titleId="tr-allocation-title"
      titleIcon="user-plus"
      onClose={onCancel}
      size="xl"
      actionsClassName="justify-content-between"
      actions={
        <>
          <SecondaryButton leftIcon="close" size="large" onClick={onCancel}>
            Cancel
          </SecondaryButton>
          <PrimaryButton leftIcon="user-plus" onClick={onSubmit}>
            Allocate
          </PrimaryButton>
        </>
      }
    >
      <div className="row g-4">
        <div className="col-12 col-xl-8">
          <dl className="row g-2 mb-4">
            <dt className="col-sm-3 text-secondary fw-medium">Test Parameter</dt>
            <dd className="col-sm-9 mb-0 fw-semibold text-dark">{details.parameter}</dd>
            <dt className="col-sm-3 text-secondary fw-medium">MoA</dt>
            <dd className="col-sm-9 mb-0 fw-semibold text-dark">{details.moa}</dd>
            <dt className="col-sm-3 text-secondary fw-medium">Template</dt>
            <dd className="col-sm-9 mb-0 fw-semibold text-dark">{details.template}</dd>
          </dl>

          <div className="nav nav-pills mb-3" role="tablist" aria-label="Allocation resources">
            {allocationTabs.map((tab) => (
              <NavSelector
                key={tab.key}
                size="medium"
                active={activeTab === tab.key}
                onClick={() => onTabChange(tab.key)}
              >
                {tab.label}
              </NavSelector>
            ))}
          </div>

          <DataTable>
            <thead>
              <tr>
                {table.columns.map((column) => (
                  <th scope="col" key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, rowIndex) => (
                <tr key={`${activeTab}-${rowIndex}`}>
                  {row.map((cell, cellIndex) => (
                    <td key={`${activeTab}-${rowIndex}-${cellIndex}`}>
                      {cell === 'Link' ? (
                        <button type="button" className="smplfy-link link-primary btn btn-link p-0 text-start text-decoration-none">
                          Link
                        </button>
                      ) : cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </DataTable>
        </div>

        <div className="col-12 col-xl-4 d-flex flex-column gap-3">
          <FormElement
            type="dropdown"
            label="Allocate to"
            inputProps={{
              value: allocateTo,
              placeholder: 'Select person',
              options: ['Universal Admin', 'Technical Manager', 'Quality Team'],
              onChange: (event) => onAllocateToChange(event.target.value),
            }}
          />
          <FormElement
            type="dropdown"
            label="Reviewer"
            inputProps={{
              value: reviewer,
              placeholder: 'Select person',
              options: ['Universal Admin', 'Technical Manager', 'Quality Team'],
              onChange: (event) => onReviewerChange(event.target.value),
            }}
          />
          <FormElement
            type="dropdown"
            label="Instrument"
            inputProps={{
              value: instrument,
              placeholder: 'Select Instrument',
              options: ['Instrument A', 'Instrument B', 'Instrument C'],
              onChange: (event) => onInstrumentChange(event.target.value),
            }}
          />
        </div>
      </div>
    </Modal>
  );
}

function TestRequestsHomeHeader({ activeTab, countsByTab, onTabChange }) {
  return (
    <section className="smplfy-test-requests-home-tabs bg-white border-bottom">
      <div className="container-fluid px-4">
        <div className="row gx-0 align-items-stretch flex-nowrap">
          <div className="col">
            <div className="smplfy-test-requests-home-tabs-group nav nav-tabs flex-nowrap overflow-auto border-0">
              {testRequestsHomeTabs.map((tab) => (
                <NavSelector
                  key={tab.key}
                  className="smplfy-test-requests-home-tab text-nowrap"
                  active={activeTab === tab.key}
                  count={tab.key === 'all-test-requests' ? undefined : countsByTab[tab.key]}
                  onClick={() => onTabChange(tab.key)}
                >
                  {tab.label}
                </NavSelector>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ApprovalActionModal({ action, requestId, onClose, onSubmit }) {
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState('');
  const [narration, setNarration] = useState('');

  useEffect(() => {
    if (!action || !requestId) {
      setComment('');
      setCommentError('');
      setNarration('');
    }
  }, [action, requestId]);

  if (!action || !requestId) {
    return null;
  }

  const isApprove = action === 'approve';
  const isReview = action === 'review';
  const isPositiveAction = isApprove || isReview;
  const actionLabel = isReview ? 'Review' : isApprove ? 'Approve' : 'Reject';
  const handleSubmit = () => {
    if (!comment.trim()) {
      setCommentError('Comment is required.');
      return;
    }

    setCommentError('');
    onSubmit?.({
      action,
      requestId,
      comment,
      narration,
    });
  };

  return (
    <Modal
      open={Boolean(action && requestId)}
      title={`${actionLabel} Test Request`}
      titleId="test-request-approval-action-title"
      titleIcon={isPositiveAction ? 'check' : 'close'}
      onClose={onClose}
      size="md"
      actionsClassName="justify-content-between"
      actions={
        <>
          <SecondaryButton leftIcon="close" size="large" onClick={onClose}>
            Cancel
          </SecondaryButton>
          <PrimaryButton
            leftIcon={isPositiveAction ? 'check' : 'close'}
            styleVariant={isPositiveAction ? 'positive' : 'destructive'}
            onClick={handleSubmit}
          >
            {actionLabel}
          </PrimaryButton>
        </>
      }
    >
      <div className="d-flex flex-column gap-3">
      <div className="d-flex align-items-center justify-content-between gap-3">
        <div className="text-secondary fw-medium">Test Request ID</div>
        <div className="text-dark fw-semibold text-end">{requestId}</div>
      </div>
      <FormElement
        type="text"
        mandatory
        label="Comment"
        message={commentError}
        messageTone="error"
        inputProps={{
          value: comment,
          placeholder: 'Add comment',
          onChange: (event) => {
            setComment(event.target.value);
            if (commentError) {
              setCommentError('');
            }
          },
        }}
      />
      {isApprove ? (
        <FormElement
          type="text"
          label="Narration"
          inputProps={{
            value: narration,
            placeholder: 'Add narration',
            onChange: (event) => setNarration(event.target.value),
          }}
        />
      ) : null}
      </div>
    </Modal>
  );
}

function TestRequestHomeRow({ row, showStatus, showApprovalActions, onAllocate, onView, onPositiveAction, onReject }) {
  const statusPresentation = getStatusPresentation('testRequest', row.status);
  const positiveActionLabel = row.approvalAction === 'approve' ? 'Approve' : 'Review';

  return (
    <tr>
      <td>
        <button
          type="button"
          className="smplfy-link link-primary btn btn-link p-0 text-start text-decoration-none"
          onClick={() => onView(row)}
        >
          {row.id}
        </button>
      </td>

      {showStatus ? (
        <td>
            <StatusPill color={statusPresentation.color} styleType={statusPresentation.styleType}>
              {statusPresentation.label}
            </StatusPill>
        </td>
      ) : null}

      <td>{row.product}</td>

      <td className="text-nowrap">{row.reportingDate}</td>

      <td className="text-nowrap">{row.age}</td>

      <td className="text-nowrap">
        <div className="d-flex align-items-center gap-2 flex-nowrap">
          {row.action === 'allocate' ? <AllocateTestRequestButton size="medium" onClick={() => onAllocate(row)} /> : null}
          <ViewTestRequestButton size="medium" onClick={() => onView(row)} />
          {showApprovalActions ? (
            <PrimaryButton
              size="medium"
              leftIcon="check"
              styleVariant="positive"
              onClick={() => onPositiveAction(row)}
            >
              {positiveActionLabel}
            </PrimaryButton>
          ) : null}
          {showApprovalActions ? (
            <PrimaryButton
              size="medium"
              leftIcon="close"
              styleVariant="destructive"
              onClick={() => onReject(row)}
            >
            Reject
          </PrimaryButton>
          ) : null}
        </div>
      </td>
    </tr>
  );
}

function TestRequestsHomeBody({ rows, showStatus, activeTab, onAllocate, onView, onPositiveAction, onReject }) {
  return (
    <main className="smplfy-test-requests-home-page bg-body-tertiary flex-grow-1">
      <div className="container-fluid px-4">
        <DataTable className="smplfy-test-requests-home-table">
          <thead>
            <tr>
              <th scope="col">Test Request ID</th>
              {showStatus ? <th scope="col">Status</th> : null}
              <th scope="col">Product</th>
              <th scope="col">Target Reporting Date</th>
              <th scope="col">Age</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <TestRequestHomeRow
                key={row.id}
                row={row}
                showStatus={showStatus}
                showApprovalActions={activeTab === 'pending-for-approval'}
                onAllocate={onAllocate}
                onView={onView}
                onPositiveAction={onPositiveAction}
                onReject={onReject}
              />
            ))}
          </tbody>
        </DataTable>
      </div>
    </main>
  );
}

export default function TestRequestsHomePage({
  onNavigate,
  onOpenTrDetails,
  sidebarCollapsed,
  onSidebarCollapsedChange,
}) {
  const [rows, setRows] = useState(allTestRequestBuckets);
  const [activeTab, setActiveTab] = useState('allocated-to-me');
  
  // Toast notification state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastTone, setToastTone] = useState('success');
  
  // Allocation modal state
  const [allocationModalOpen, setAllocationModalOpen] = useState(false);
  const [allocationTargetId, setAllocationTargetId] = useState(null);
  const [allocationTab, setAllocationTab] = useState('analyst');
  const [allocateTo, setAllocateTo] = useState('');
  const [reviewer, setReviewer] = useState('');
  const [instrument, setInstrument] = useState('');
  const [allocationDetails, setAllocationDetails] = useState({
    parameter: '',
    moa: '',
    template: '',
  });
  const [approvalModalState, setApprovalModalState] = useState({
    action: null,
    requestId: null,
  });

  const countsByTab = useMemo(
    () => ({
      'allocated-to-me': rows.filter((row) => row.bucket === 'allocated-to-me').length,
      'pending-for-allocation': rows.filter((row) => row.bucket === 'pending-for-allocation').length,
      'pending-for-approval': rows.filter((row) => row.bucket === 'pending-for-approval').length,
    }),
    [rows],
  );

  const visibleRows = useMemo(() => getTestRequestsForTab(activeTab, rows), [activeTab, rows]);
  const showStatus = activeTab === 'all-test-requests';

  const showToast = (message, tone = 'success') => {
    setToastMessage(message);
    setToastTone(tone);
    setToastVisible(true);
    window.setTimeout(() => setToastVisible(false), 5000);
  };

  const handleAllocate = (row) => {
    setAllocationTargetId(row.id);
    setAllocationDetails({
      parameter: row.parameter || 'Multiple Parameters',
      moa: row.moa || 'Wet Chemistry',
      template: 'Worksheet & Raw Data Register- NABL',
    });
    setAllocationTab('analyst');
    setAllocateTo('');
    setReviewer('');
    setInstrument('');
    setAllocationModalOpen(true);
  };

  const handleSubmitAllocation = () => {
    setRows((current) =>
      current.map((item) =>
        item.id === allocationTargetId
          ? {
              ...item,
              bucket: 'allocated-to-me',
              status: 'Result Under Testing',
              age: 'Just now',
              action: 'view',
            }
          : item,
      ),
    );
    setAllocationModalOpen(false);
    showToast('Test request allocated successfully.');
  };

  const handleOpenApprovalModal = (action, row) => {
    setApprovalModalState({
      action,
      requestId: row.id,
    });
  };

  const handleSubmitApprovalAction = ({ action, requestId }) => {
    const positiveAction = action === 'review' || action === 'approve';
    const actionLabel = action === 'review' ? 'Review' : action === 'approve' ? 'Approval' : 'Rejection';

    setApprovalModalState({ action: null, requestId: null });
    showToast(
      `${actionLabel} completed successfully for ${requestId}.`,
      positiveAction ? 'success' : 'error',
    );
  };

  return (
    <AppChrome
      activeNav="test-requests-home"
      onNavigate={onNavigate}
      breadcrumbs={[{ key: 'test-requests-home', label: 'Test Requests', current: true }]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      pageHeader={
        <TestRequestsHomeHeader
          activeTab={activeTab}
          countsByTab={countsByTab}
          onTabChange={setActiveTab}
        />
      }
    >
      <TestRequestsHomeBody
        rows={visibleRows}
        showStatus={showStatus}
        activeTab={activeTab}
        onAllocate={handleAllocate}
        onView={(row) =>
          onOpenTrDetails?.('IICT/2025-2026/1101', {
            sourcePage: 'test-requests-home',
            requestId: row.id,
            requestStatus: row.status,
          })
        }
        onPositiveAction={(row) => handleOpenApprovalModal(row.approvalAction ?? 'review', row)}
        onReject={(row) => handleOpenApprovalModal('reject', row)}
      />
      
      <ToastNotification
        key={`${toastTone}-${toastMessage}`}
        state={toastVisible ? 'default' : 'gone'}
        tone={toastTone}
        message={toastMessage}
        className="position-fixed bottom-0 start-0 m-4"
        onClose={() => setToastVisible(false)}
      />
      
      <AllocationModal
        open={allocationModalOpen}
        activeTab={allocationTab}
        details={allocationDetails}
        allocateTo={allocateTo}
        reviewer={reviewer}
        instrument={instrument}
        onSubmit={handleSubmitAllocation}
        onTabChange={setAllocationTab}
        onAllocateToChange={setAllocateTo}
        onReviewerChange={setReviewer}
        onInstrumentChange={setInstrument}
        onCancel={() => setAllocationModalOpen(false)}
      />

      <ApprovalActionModal
        action={approvalModalState.action}
        requestId={approvalModalState.requestId}
        onSubmit={handleSubmitApprovalAction}
        onClose={() => setApprovalModalState({ action: null, requestId: null })}
      />
    </AppChrome>
  );
}
