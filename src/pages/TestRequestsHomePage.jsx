import { useEffect, useMemo, useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
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
import './test-requests-listing-page.css';
import './test-requests-home-page.css';

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
  const gridClass = `tr-allocation-table tr-allocation-table--${activeTab}`;

  return (
    <div className="tr-allocation-modal" role="dialog" aria-modal="true" aria-labelledby="tr-allocation-title">
      <div className="tr-allocation-modal__backdrop" onClick={onCancel} />
      <div className="tr-allocation-modal__card">
        <div className="tr-allocation-modal__header">
          <div className="tr-allocation-modal__title-row">
            <AppIcon name="user-plus" size={24} className="tr-allocation-modal__title-icon" />
            <h2 id="tr-allocation-title">Allocate Test Request</h2>
          </div>
          <button className="tr-allocation-modal__close btn" aria-label="Close modal" onClick={onCancel}>
            <AppIcon name="close" size={24} />
          </button>
        </div>

        <div className="tr-allocation-modal__body">
          <div className="tr-allocation-modal__main">
            <div className="tr-allocation-modal__details">
              <div className="tr-allocation-modal__detail-row">
                <div className="tr-allocation-modal__detail-label">Test Parameter</div>
                <div className="tr-allocation-modal__detail-value">{details.parameter}</div>
              </div>
              <div className="tr-allocation-modal__detail-row">
                <div className="tr-allocation-modal__detail-label">MoA</div>
                <div className="tr-allocation-modal__detail-value">{details.moa}</div>
              </div>
              <div className="tr-allocation-modal__detail-row">
                <div className="tr-allocation-modal__detail-label">Template</div>
                <div className="tr-allocation-modal__detail-value">{details.template}</div>
              </div>
            </div>

            <div className="tr-allocation-modal__tabs-section">
              <div className="tr-allocation-modal__tabs">
                {allocationTabs.map((tab) => (
                  <NavSelector
                    key={tab.key}
                    size="medium"
                    className="tr-allocation-modal__tab"
                    active={activeTab === tab.key}
                    onClick={() => onTabChange(tab.key)}
                  >
                    {tab.label}
                  </NavSelector>
                ))}
              </div>

              <div className="tr-allocation-modal__table-wrap">
                <div className={`${gridClass} tr-allocation-table__head`}>
                  {table.columns.map((column) => (
                    <div key={column}>{column}</div>
                  ))}
                </div>
                <div className="tr-allocation-modal__table-body">
                  {table.rows.map((row, rowIndex) => (
                    <div className={`${gridClass} tr-allocation-table__row`} key={`${activeTab}-${rowIndex}`}>
                      {row.map((cell, cellIndex) => (
                        <div
                          key={`${activeTab}-${rowIndex}-${cellIndex}`}
                          className={cell === 'Link' ? 'tr-allocation-table__link' : ''}
                        >
                          {cell}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="tr-allocation-modal__side">
            <div className="tr-allocation-modal__form">
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

            <div className="tr-allocation-modal__actions">
              <SecondaryButton leftIcon="close" size="large" className="tr-allocation-modal__cancel" onClick={onCancel}>
                Cancel
              </SecondaryButton>
              <PrimaryButton leftIcon="user-plus" onClick={onSubmit}>
                Allocate
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TestRequestsHomeHeader({ activeTab, countsByTab, onTabChange }) {
  return (
    <section className="test-requests-home-tabs">
      <div className="container-fluid h-100 px-4">
        <div className="row h-100 gx-0 align-items-stretch flex-nowrap">
          <div className="col">
            <div className="test-requests-home-tabs__group">
              {testRequestsHomeTabs.map((tab) => (
                <NavSelector
                  key={tab.key}
                  className="test-requests-home-tabs__item"
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
      bodyClassName="test-request-approval-modal__body"
      actionsClassName="test-request-approval-modal__actions"
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
      <div className="test-request-approval-modal__detail-row">
        <div className="test-request-approval-modal__detail-label">Test Request ID</div>
        <div className="test-request-approval-modal__detail-value">{requestId}</div>
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
    </Modal>
  );
}

function TestRequestHomeCard({ row, showStatus, showApprovalActions, onAllocate, onView, onPositiveAction, onReject }) {
  const statusPresentation = getStatusPresentation('testRequest', row.status);
  const positiveActionLabel = row.approvalAction === 'approve' ? 'Approve' : 'Review';

  return (
    <article className={`test-requests-home-card ${showStatus ? 'has-status' : 'no-status'}`}>
      <div className="test-requests-home-card__cell is-id">
        <button type="button" className="tr-link test-requests-home-card__link" onClick={() => onView(row)}>
          {row.id}
        </button>
      </div>

      {showStatus ? (
        <div className="test-requests-home-card__cell is-status">
          <div className="tr-request-status-cell">
            <StatusPill color={statusPresentation.color} styleType={statusPresentation.styleType}>
              {statusPresentation.label}
            </StatusPill>
          </div>
        </div>
      ) : null}

      <div className="test-requests-home-card__cell is-product">{row.product}</div>

      <div className="test-requests-home-card__cell is-date">{row.reportingDate}</div>

      <div className="test-requests-home-card__cell is-age">{row.age}</div>

      <div className="test-requests-home-card__cell is-actions">
        <div className="tr-request-actions">
          {row.action === 'allocate' ? <AllocateTestRequestButton size="medium" onClick={() => onAllocate(row)} /> : null}
          <ViewTestRequestButton size="medium" onClick={() => onView(row)} />
          {showApprovalActions ? (
            <PrimaryButton
              size="medium"
              leftIcon="check"
              styleVariant="positive"
              className="tr-primary-action"
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
              className="tr-primary-action"
              onClick={() => onReject(row)}
            >
              Reject
            </PrimaryButton>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function TestRequestsHomeBody({ rows, showStatus, activeTab, onAllocate, onView, onPositiveAction, onReject }) {
  return (
    <main className="test-requests-home-page">
      <div className="container-fluid px-4">
        <div className="test-requests-home-table">
          <div className={`test-requests-home-legend ${showStatus ? 'has-status' : 'no-status'}`}>
            <div className="test-requests-home-legend__item is-id">Test Request ID</div>
            {showStatus ? <div className="test-requests-home-legend__item is-status">Status</div> : null}
            <div className="test-requests-home-legend__item is-product">Product</div>
            <div className="test-requests-home-legend__item is-date">Target Reporting Date</div>
            <div className="test-requests-home-legend__item is-age">Age</div>
            <div className="test-requests-home-legend__item is-actions">Actions</div>
          </div>

          <div className="test-requests-home-list">
            {rows.map((row) => (
              <TestRequestHomeCard
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
          </div>
        </div>
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
        className="tr-job-created-toast"
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
