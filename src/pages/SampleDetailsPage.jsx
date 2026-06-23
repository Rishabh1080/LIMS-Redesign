import { useEffect, useRef, useState } from 'react';
import AppIcon from '../components/AppIcon';
import AppChrome from '../components/AppChrome/AppChrome';
import Checkbox from '../components/Checkbox/Checkbox';
import Modal from '../components/Modal/Modal';
import { FormElement, ToastNotification } from '../components/FormControls';
import MoreActionButton from '../components/MoreActionButton';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import DataTable from '../components/DataTable';
import StatusPill from '../components/StatusPill';
import { getAnalyticsElapsedTime, trackEvent } from '../analytics/posthog';
import { getStatusPresentation } from '../status/statusRegistry';
import './sample-details-page.scss';

const carpetImage =
  'data:image/png;base64,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';

const toastMessageByKey = {
  'sample-created': 'Sample Created.',
  'review-request-success': 'Review Request sent successfully.',
  'approval-action-success': 'Approval action completed successfully.',
};

const sampleHeaderActionItems = [
  { key: 'create-amendment', label: 'Create Amendment', leftIcon: 'edit' },
  { key: 'create-complaint', label: 'Create Complaint', leftIcon: 'alert-circle' },
  { key: 'add-final-comments', label: 'Add final comments', leftIcon: 'file-text' },
  { key: 'acknowledgement-receipt', label: 'Acknowledgement Receipt', leftIcon: 'file-text' },
  { key: 'proforma-invoice', label: 'Proforma Invoice', leftIcon: 'file-text' },
];

const basicSampleDetails = [
  { label: 'Sample Receive Date', value: '14-05-2026' },
  { label: 'Due Date', value: '11-06-2026' },
  { label: 'Customer Name', value: 'Indian Art Gallery, Bhadohi' },
  { label: 'Customer Address', value: 'Carpet City Chauri Road Bhadohi' },
  { label: 'Customer Representative Name', value: 'Indian Art Gallery' },
  { label: 'CR Contact Number', value: '8840498586' },
  { label: 'Customer Request Letter', value: '-' },
  { label: 'Request Received Mode', value: 'In-Person' },
  { label: 'Sample Registration Date', value: '2026-05-15' },
  { label: 'Customer Representative Email ID', value: 'NA' },
  { label: 'Customer Reference', value: 'Carpet' },
  { label: '', value: '' },
];

const productDetails = [
  { label: 'Sample Qty.', value: '1' },
  { label: 'Sample Size', value: '190' },
  { label: 'Quality', value: 'Hand Tufted (Round)' },
  { label: 'Identification', value: 'Maze Colour: Camel' },
  { label: 'Condition', value: 'OK' },
  { label: 'Description', value: 'Hand Tufted Carpet' },
];

const parameterRows = [
  {
    sr: '1',
    parameter: 'Surface flammability of carpets and rugs',
    testMethod: '16 CFR Part 1631',
    size: '0',
    charges: '3800',
    estTime: '3',
  },
  {
    sr: '2',
    parameter: 'Quantitative chemical analysis for Overall composition of carpet',
    testMethod: 'IS 2006:1988',
    size: '0',
    charges: '2000',
    estTime: '3',
  },
  {
    sr: '3',
    parameter: 'Colour fastness to rubbing ( Dry & Wet)',
    testMethod: '16 CFR Part 1631',
    size: '0',
    charges: '3800',
    estTime: '3',
  },
];

const products = [
  { id: 'product-1', name: 'Carpets and Rugs' },
  { id: 'product-2', name: 'Carpets and Rugs' },
];

const activityItems = [
  {
    label: 'Approval Pending',
    time: '12:36 PM',
    date: '15/06/26',
    tone: 'neutral',
  },
  {
    label: 'Sample Analysis Completed',
    time: '12:36 PM',
    date: '15/06/26',
    person: 'who’s name goes here?',
    tone: 'success',
  },
  {
    label: 'Sample Under Analysis',
    time: '12:36 PM',
    date: '15/06/26',
    person: 'who’s name goes here?',
    tone: 'warning',
  },
  {
    label: 'Sample Reviewed',
    time: '12:36 PM',
    date: '15/06/26',
    person: 'who reviewed',
    tone: 'warning',
  },
  {
    label: 'Sample Created',
    time: '12:36 PM',
    date: '14/06/26',
    person: 'Person who created',
    tone: 'info',
  },
];

const sampleApprovalChecklist = [
  { key: 'parametersPresent', label: 'All parameters information is present ?' },
  { key: 'sampleImagesPresent', label: 'Sample Images are present ?' },
  { key: 'customerInfoPresent', label: 'Customer information is present ?' },
  { key: 'nablMarked', label: 'NABL marking is done' },
];

const initialSampleApprovalChecklistState = sampleApprovalChecklist.reduce((accumulator, item) => {
  accumulator[item.key] = false;
  return accumulator;
}, {});

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

function splitDateTime(createdOn) {
  const parts = String(createdOn ?? '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    date: parts[0] || '06/03/2026',
    time: parts[1] || '10:13',
  };
}

function FieldValue({ label, value }) {
  return (
    <div className="col p-2">
      {label ? <dt className="text-secondary fw-normal mb-1">{label}</dt> : null}
      {value ? <dd className="fw-medium text-truncate mb-0">{value}</dd> : null}
    </div>
  );
}

function DetailGrid({ items, columns = 4 }) {
  return (
    <dl className={joinClasses('smplfy-sample-details-fields', 'row', `row-cols-${columns}`, 'g-0', 'mb-0')}>
      {items.map((item, index) => (
        <FieldValue key={`${item.label}-${index}`} label={item.label} value={item.value} />
      ))}
    </dl>
  );
}

function DetailsHeader({
  sampleId,
  sampleStatus,
  createdOn,
  reviewRequested,
  onBack,
  onEditSample,
  onOpenTestRequests,
  onOpenCoaReport,
  onRequestReview,
}) {
  const isPending = sampleStatus === 'Pending';
  const isUnderAnalysis = sampleStatus === 'Under Analysis';
  const isCompleted = sampleStatus === 'Completed';
  const { date, time } = splitDateTime(createdOn);
  const statusPresentation = getStatusPresentation('sample', sampleStatus);

  return (
    <section className="smplfy-sample-details-header bg-white border-bottom">
      <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
        <div className="d-flex align-items-start gap-3">
          <SecondaryButton
            size="medium"
            leftIcon="chevron-left"
            className="px-0 flex-shrink-0"
            aria-label="Go back"
            onClick={onBack}
          />

          <div className="d-flex flex-column">
            <div className="d-flex align-items-center gap-2">
              <h1 className="h5 mb-0 fw-semibold text-dark">{sampleId}</h1>
              <StatusPill color={statusPresentation.color} styleType={statusPresentation.styleType}>
                {statusPresentation.label}
              </StatusPill>
            </div>
            <div className="d-inline-flex gap-2 text-secondary fw-medium">
              <span>{date}</span>
              <span>{time}</span>
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-3 flex-wrap">
          {isCompleted ? (
            <>
              <PrimaryButton
                leftIcon="file-text"
                onClick={onOpenCoaReport}
              >
                COA Report
              </PrimaryButton>
              <SecondaryButton
                leftIcon="clipboard-text"
                size="large"
                onClick={onOpenTestRequests}
              >
                Test Requests
              </SecondaryButton>
            </>
          ) : isUnderAnalysis ? (
            <>
              <PrimaryButton
                leftIcon="file-text"
                onClick={onOpenCoaReport}
              >
                COA Report
              </PrimaryButton>
              <SecondaryButton
                leftIcon="workspace"
                size="large"
                onClick={onOpenTestRequests}
              >
                Test Requests
              </SecondaryButton>
            </>
          ) : reviewRequested ? null : (
            <>
              <PrimaryButton
                leftIcon="check"
                onClick={onRequestReview}
              >
                Send for Review
              </PrimaryButton>
              {isPending ? (
                <SecondaryButton
                  leftIcon="edit"
                  size="large"
                  onClick={onEditSample}
                >
                  Edit
                </SecondaryButton>
              ) : null}
            </>
          )}
          <MoreActionButton items={sampleHeaderActionItems} />
        </div>
      </div>
    </section>
  );
}

function BasicSampleDetails() {
  return (
    <section>
      <div className="card-header">
        <h2 className="card-title mb-0">Basic Sample Details</h2>
      </div>
      <div className="card-body p-0">
        <DetailGrid items={basicSampleDetails} columns={4} />
      </div>
    </section>
  );
}

function ProductTable() {
  return (
    <div className="table-responsive">
      <DataTable responsive={false} className="table-bordered">
        <colgroup>
          <col />
          <col />
          <col />
          <col />
          <col />
          <col />
        </colgroup>
        <thead>
          <tr>
            <th scope="col">Sr.</th>
            <th scope="col">Parameter</th>
            <th scope="col">Test Method</th>
            <th scope="col">Size</th>
            <th scope="col">Charges</th>
            <th scope="col">Est. Time</th>
          </tr>
        </thead>
        <tbody>
          {parameterRows.map((row) => (
            <tr key={`${row.sr}-${row.parameter}`}>
              <td>{row.sr}</td>
              <td>{row.parameter}</td>
              <td>{row.testMethod}</td>
              <td>{row.size}</td>
              <td className="text-end">{row.charges}</td>
              <td>{row.estTime}</td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </div>
  );
}

function ProductCard({ product }) {
  return (
    <article className="smplfy-card card overflow-hidden">
      <div className="card-header">
        <h3 className="card-title mb-0">{product.name}</h3>
      </div>

      <div className="card-body p-0">
        <div className="row g-0">
          <div className="col">
            <DetailGrid items={productDetails} columns={3} />
          </div>
          <div className="col-auto p-2">
            <div className="text-secondary fw-normal mb-1">Image (Click to expand)</div>
            <img className="img-fluid d-block" src={carpetImage} alt="" />
          </div>
        </div>

        <div className="px-4 pb-3 pt-2">
          <ProductTable />
        </div>
      </div>
    </article>
  );
}

function ProductWiseDetails() {
  return (
    <section>
      <div className="card-header">
        <h2 className="card-title mb-0">Product-wise Details</h2>
      </div>
      <div className="card-body p-0">
        <div className="smplfy-sample-details-products vstack gap-3">
          {products.map((product) => (
            <ProductCard product={product} key={product.id} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ActionRequiredPanel({ resolved, onTakeAction }) {
  if (resolved) {
    return (
      <section className="smplfy-card card smplfy-sample-details-action is-resolved overflow-hidden">
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
    <section className="smplfy-card card smplfy-sample-details-action overflow-hidden">
      <div className="card-header d-flex align-items-center gap-3">
        <AppIcon name="alert-circle" size={24} stroke={2} />
        <span>Action Required</span>
        <strong>(4 days)</strong>
      </div>
      <div className="card-body">
        <dl className="mb-0">
          <div>
            <dt>Requested by</dt>
            <dd>Rushabh Hathi</dd>
          </div>
          <div>
            <dt>Requested on</dt>
            <dd>13 June 2026, 13:54</dd>
          </div>
          <div>
            <dt>Comments</dt>
            <dd>Approve this sample ASAP</dd>
          </div>
        </dl>
        <PrimaryButton className="w-100" leftIcon="external-link" size="default" onClick={onTakeAction}>
          Take action
        </PrimaryButton>
      </div>
    </section>
  );
}

function ActivityRail() {
  return (
    <section className="smplfy-sample-details-activity">
      <div className="d-flex align-items-center justify-content-between">
        <h2>Activity</h2>
        <button className="smplfy-btn btn btn-link p-0 border-0 text-decoration-underline" type="button">See all</button>
      </div>
      <ol className="smplfy-sample-details-timeline list-unstyled mb-0">
        {activityItems.map((item) => (
          <li className={`is-${item.tone}`} key={item.label}>
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

function ReviewRequestModal({ open, sendTo, comments, onSendToChange, onCommentsChange, onCancel, onSubmit }) {
  return (
    <Modal
      open={open}
      title="Request Review"
      titleId="review-request-title"
      titleIcon="user"
      onClose={onCancel}
      size="md"
      actions={
        <>
          <SecondaryButton leftIcon="close" size="large" onClick={onCancel}>
            Cancel
          </SecondaryButton>
          <PrimaryButton leftIcon="send" onClick={onSubmit}>
            Send Request
          </PrimaryButton>
        </>
      }
    >
      <div className="d-flex flex-column gap-4">
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <FormElement
              type="dropdown"
              label="Current state"
              inputProps={{
                state: 'disabled',
                value: 'Pending',
                options: ['Pending'],
              }}
            />
          </div>

          <div className="col-12 col-md-6">
            <FormElement
              type="dropdown"
              label="Send to"
              inputProps={{
                value: sendTo,
                placeholder: 'Select state',
                options: ['Technical Manager', 'Quality Team', 'Review Board'],
                onChange: (event) => onSendToChange(event.target.value),
              }}
            />
          </div>
        </div>

        <div>
          <FormElement
            type="text"
            label="Comments"
            inputProps={{
              value: comments,
              placeholder: 'eg.',
              onChange: (event) => onCommentsChange(event.target.value),
            }}
          />
        </div>
      </div>
    </Modal>
  );
}

function SampleApprovalActionModal({ open, sampleId, onCancel, onSubmit }) {
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState('');
  const [checklistValues, setChecklistValues] = useState(initialSampleApprovalChecklistState);
  const [checklistError, setChecklistError] = useState('');

  useEffect(() => {
    if (!open) {
      setComment('');
      setCommentError('');
      setChecklistValues(initialSampleApprovalChecklistState);
      setChecklistError('');
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const handleChecklistChange = (key, checked) => {
    const nextChecklistValues = {
      ...checklistValues,
      [key]: checked,
    };

    setChecklistValues(nextChecklistValues);

    if (sampleApprovalChecklist.every((item) => nextChecklistValues[item.key])) {
      setChecklistError('');
    }
  };

  const handleAction = (actionType) => {
    let hasError = false;

    if (!comment.trim()) {
      setCommentError('Please add a comment to respond.');
      hasError = true;
    } else {
      setCommentError('');
    }

    if (
      actionType === 'approve'
      && !sampleApprovalChecklist.every((item) => checklistValues[item.key])
    ) {
      setChecklistError('Complete all checks before approving this request.');
      hasError = true;
    } else {
      setChecklistError('');
    }

    if (hasError) return;

    onSubmit?.({
      action: actionType,
      sampleId,
      comment,
      checklistValues,
    });
  };

  return (
    <Modal
      open={open}
      title="Sample Approval"
      titleId="sample-approval-action-title"
      titleIcon="check"
      onClose={onCancel}
      size="md"
      actionsClassName="justify-content-between"
      actions={
        <>
          <PrimaryButton styleVariant="destructive" size="large" onClick={() => handleAction('reject')} leftIcon="close">
            Reject
          </PrimaryButton>
          <PrimaryButton styleVariant="positive" size="large" onClick={() => handleAction('approve')} leftIcon="check">
            Approve
          </PrimaryButton>
        </>
      }
    >
      <div className="d-flex flex-column gap-3">
        <div className="d-flex align-items-center justify-content-between gap-3">
          <div className="text-secondary fw-medium">Sample ID</div>
          <div className="text-dark fw-semibold text-end">{sampleId}</div>
        </div>

        <div className="d-flex flex-column gap-2">
          <label className="smplfy-form-label form-label mb-0" htmlFor="sample-approval-comment">
            Comment <span className="text-danger">*</span>
          </label>
          <input
            id="sample-approval-comment"
            className={joinClasses('smplfy-form-control', 'form-control', commentError ? 'is-invalid' : '')}
            value={comment}
            placeholder="Add a comment to respond"
            onChange={(event) => {
              setComment(event.target.value);
              if (event.target.value.trim()) {
                setCommentError('');
              }
            }}
          />
          {commentError ? <div className="smplfy-form-feedback invalid-feedback d-block">{commentError}</div> : null}
        </div>

        <div className="d-flex flex-column gap-2">
          {sampleApprovalChecklist.map((item) => {
            const isInvalid = Boolean(checklistError && !checklistValues[item.key]);

            return (
              <label className="smplfy-request-checklist-item d-flex align-items-center gap-2" key={item.key}>
                <Checkbox
                  checked={checklistValues[item.key]}
                  invalid={isInvalid}
                  onChange={(nextChecked) => handleChecklistChange(item.key, nextChecked)}
                />
                <span>{item.label}</span>
              </label>
            );
          })}
          {checklistError ? (
            <div className="smplfy-form-feedback invalid-feedback d-block">{checklistError}</div>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}

export default function SampleDetailsPage({
  sampleId = 'IICT/2025-2026/1101',
  initialToast = null,
  sourcePage = 'samples-workspace',
  sampleStatus = 'Pending',
  createdOn = '06/03/2026, 10:13',
  sample = null,
  onBack,
  onEditSample,
  onOpenTestRequests,
  onOpenCoaReport,
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  sampleCreationFlowSessionId = null,
  sampleCreationFlowStartedAt = null,
  sampleCreationFormVariant = null,
}) {
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState(toastMessageByKey['sample-created']);
  const [reviewRequested, setReviewRequested] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [approvalActionModalOpen, setApprovalActionModalOpen] = useState(false);
  const [approvalActionResolved, setApprovalActionResolved] = useState(false);
  const [sendTo, setSendTo] = useState('');
  const [comments, setComments] = useState('');
  const trackedSuccessToastRef = useRef(null);

  useEffect(() => {
    if (!initialToast) {
      setToastVisible(false);
      return undefined;
    }

    let frameId = 0;
    let timerId = 0;

    frameId = window.requestAnimationFrame(() => {
      const nextToastMessage = toastMessageByKey[initialToast] ?? initialToast;
      setToastMessage(nextToastMessage);
      setToastVisible(true);

      if (initialToast === 'sample-created' && sampleCreationFlowSessionId) {
        const trackingKey = `${sampleCreationFlowSessionId}-${initialToast}`;

        if (trackedSuccessToastRef.current !== trackingKey) {
          trackedSuccessToastRef.current = trackingKey;
          trackEvent('sample_creation_flow_success_toast_shown', {
            form_name: 'sample_creation',
            sample_creation_flow_session_id: sampleCreationFlowSessionId,
            sample_creation_flow_elapsed_ms: sampleCreationFlowStartedAt
              ? getAnalyticsElapsedTime(sampleCreationFlowStartedAt)
              : undefined,
            form_variant: sampleCreationFormVariant,
            source_page: sourcePage,
            sample_status: sampleStatus,
            toast_key: initialToast,
            toast_message: nextToastMessage,
          });
        }
      }

      timerId = window.setTimeout(() => setToastVisible(false), 5000);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timerId);
    };
  }, [
    initialToast,
    sampleCreationFlowSessionId,
    sampleCreationFlowStartedAt,
    sampleCreationFormVariant,
    sampleStatus,
    sourcePage,
  ]);

  const showToast = (messageKey) => {
    setToastMessage(toastMessageByKey[messageKey] ?? messageKey);
    setToastVisible(false);

    window.requestAnimationFrame(() => {
      setToastVisible(true);
      window.setTimeout(() => setToastVisible(false), 5000);
    });
  };

  const handleSubmitReviewRequest = () => {
    setReviewRequested(true);
    setReviewModalOpen(false);
    showToast('review-request-success');
  };

  const handleSubmitApprovalAction = () => {
    setApprovalActionResolved(true);
    setApprovalActionModalOpen(false);
    showToast('approval-action-success');
  };

  const sourceLabel = sourcePage === 'all-samples' ? 'All Samples' : 'Samples Workspace';
  const activeNav = sourcePage === 'all-samples' ? 'all-samples' : 'samples-workspace';
  const breadcrumbs = [
    { key: sourcePage, label: sourceLabel },
    { key: sampleId, label: sampleId, current: true },
  ];

  return (
    <AppChrome
      activeNav={activeNav}
      onNavigate={onNavigate}
      breadcrumbs={breadcrumbs}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      pageHeader={
        <DetailsHeader
          sampleId={sampleId}
          sampleStatus={sampleStatus}
          createdOn={createdOn}
          reviewRequested={reviewRequested}
          onBack={onBack}
          onEditSample={onEditSample}
          onOpenTestRequests={onOpenTestRequests}
          onOpenCoaReport={onOpenCoaReport}
          onRequestReview={() => setReviewModalOpen(true)}
        />
      }
    >
      <main className="smplfy-sample-details-page bg-body-tertiary p-4 min-vh-100">
        <div className="smplfy-sample-details-layout d-grid">
          <div className="smplfy-sample-details-main-panel">
            <div className="smplfy-card card overflow-hidden">
              <BasicSampleDetails />
              <ProductWiseDetails />
            </div>
          </div>
          <aside className="smplfy-sample-details-rail">
            <ActionRequiredPanel
              resolved={approvalActionResolved}
              onTakeAction={() => setApprovalActionModalOpen(true)}
            />
            <ActivityRail />
          </aside>
        </div>
      </main>

      <ReviewRequestModal
        open={reviewModalOpen}
        sendTo={sendTo}
        comments={comments}
        onSendToChange={setSendTo}
        onCommentsChange={setComments}
        onCancel={() => setReviewModalOpen(false)}
        onSubmit={handleSubmitReviewRequest}
      />

      <SampleApprovalActionModal
        open={approvalActionModalOpen}
        sampleId={sampleId}
        onCancel={() => setApprovalActionModalOpen(false)}
        onSubmit={handleSubmitApprovalAction}
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
