/*
 * Tutorial Inward Details: a copy of the prototype's SampleDetailsPage (the
 * prototype's "sample" is the tutorial's inward). Tutorial-only changes:
 *  - review, approval and the activity trail are driven by the tutorial's
 *    state (props) instead of fixed local data, so each step shows up
 *  - the review modal picks the next state ("Under Allocation")
 *  - "Under Allocation" is treated like Under Analysis for the header buttons
 * Markup and classes are the prototype's.
 */
import { useContext, useEffect, useRef, useState } from 'react';
import AppIcon from '@proto/components/AppIcon';
import AppChrome, { TutorialChromeContext } from './TutorialChrome';
import SampleApprovalModal from './SampleApprovalModal';
import Modal from '@proto/components/Modal/Modal';
import { FormElement, ToastNotification } from '@proto/components/FormControls';
import MoreActionButton from '@proto/components/MoreActionButton';
import PrimaryButton from '@proto/components/PrimaryButton/PrimaryButton';
import SecondaryButton from '@proto/components/SecondaryButton';
import StatusPill from '@proto/components/StatusPill';
import { getAnalyticsElapsedTime, trackEvent } from '@proto/analytics/posthog';
import { getStatusPresentation } from '@proto/status/statusRegistry';
import { isSampleDelayed } from '@proto/utils/sampleDelay';
import { getInwardById, getInwardBySampleId, getProductBySampleId } from '@proto/data/inwardsDb';
import {
  DetailGrid,
  ProductCard,
  buildInwardDetailItems,
} from '@proto/pages/inwardDetailSections';
import '@proto/pages/sample-details-page.scss';
import '@proto/pages/product-details-page.scss';

// Stands in for samples that predate the inward flow, so every sample page has
// a coherent inward to show and link to.
const FALLBACK_INWARD_ID = 'INW/2026/0147';

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

const tutorialStatusPresentation = {
  'Under Allocation': { label: 'Under Allocation', color: 'yellow', styleType: 'neutral' },
};

function DetailsHeader({
  sampleId,
  sampleStatus,
  createdOn,
  reportingDate,
  delayed,
  reviewRequested,
  onBack,
  onEditSample,
  onOpenTestRequests,
  onOpenCoaReport,
  onOpenProformaInvoice,
  onRequestReview,
}) {
  const isPending = sampleStatus === 'Pending';
  const isUnderAnalysis = sampleStatus === 'Under Analysis' || sampleStatus === 'Under Allocation';
  const isCompleted = sampleStatus === 'Completed';
  const { date, time } = splitDateTime(createdOn);
  const statusPresentation = tutorialStatusPresentation[sampleStatus] ?? getStatusPresentation('sample', sampleStatus);
  const isDelayed = isSampleDelayed({ reportingDate, delayed });
  const headerActionItems = sampleHeaderActionItems.map((item) => (
    item.key === 'proforma-invoice'
      ? { ...item, onClick: onOpenProformaInvoice }
      : item
  ));

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
              {isDelayed ? (
                <StatusPill
                  color="red"
                  styleType="solid"
                  className="d-inline-flex align-items-center gap-1 text-white"
                >
                  <AppIcon name="hourglass-low" size={14} stroke={2} />
                  Delayed
                </StatusPill>
              ) : null}
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
          <MoreActionButton items={headerActionItems} />
        </div>
      </div>
    </section>
  );
}

function DetailsAccordion({ id, title, expanded, onToggle, children, className = '' }) {
  const headingId = `${id}-heading`;
  const panelId = `${id}-panel`;

  return (
    <section
      className={`smplfy-card card overflow-hidden smplfy-sample-details-accordion${expanded ? ' is-expanded' : ''}${className ? ` ${className}` : ''}`}
    >
      <div className="card-header p-0" id={headingId}>
        <button
          type="button"
          className="smplfy-sample-details-accordion-toggle"
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={onToggle}
        >
          <span className="card-title mb-0">{title}</span>
          <AppIcon name={expanded ? 'chevron-up' : 'chevron-down'} size={20} stroke={2} />
        </button>
      </div>
      {expanded ? (
        <div
          className="card-body p-0"
          id={panelId}
          role="region"
          aria-labelledby={headingId}
        >
          {children}
        </div>
      ) : null}
    </section>
  );
}

/* The inward this sample came from. */
function InwardDetailsCard({ inward, onGoToInward }) {
  const items = buildInwardDetailItems(inward);

  return (
    <section className="smplfy-card card overflow-hidden smplfy-sample-details-accordion is-expanded smplfy-sample-details-basic-card smplfy-product-details-sample-card">
      <div className="card-header p-0" id="sample-inward-details-heading">
        <div className="smplfy-product-details-card-header">
          <span className="card-title mb-0">Inward Details</span>
          <SecondaryButton
            size="medium"
            rightIcon="arrow-up-right"
            onClick={() => onGoToInward?.(inward)}
          >
            Go to inward
          </SecondaryButton>
        </div>
      </div>
      <div className="card-body p-0" role="region" aria-labelledby="sample-inward-details-heading">
        <DetailGrid items={items} columns={4} />
      </div>
    </section>
  );
}

/* Same card as a product card on Inward Details, titled for this context. */
function TestingDetailsCard({ product }) {
  if (!product) return null;

  return (
    <section className="smplfy-card card overflow-hidden smplfy-sample-details-accordion is-expanded smplfy-sample-details-testing-card">
      <div className="card-header p-0" id="sample-testing-details-heading">
        <div className="smplfy-product-details-card-header">
          <span className="card-title mb-0">Testing details</span>
        </div>
      </div>
      <div className="card-body p-0" role="region" aria-labelledby="sample-testing-details-heading">
        <div className="smplfy-sample-details-products vstack gap-3">
          <ProductCard product={product} title={product.name} />
        </div>
      </div>
    </section>
  );
}

function AmendmentSampleNotice({ originalSampleId, onOpenOriginalSample }) {
  if (!originalSampleId) {
    return null;
  }

  return (
    <section className="smplfy-card card smplfy-sample-amendment-notice">
      <div className="card-body d-flex align-items-center gap-2 flex-wrap">
        <div className="d-flex align-items-center gap-2 min-w-0">
          <span className="text-dark fw-medium text-truncate">This is an amended sample.</span>
        </div>
        <button
          type="button"
          className="smplfy-btn btn btn-link p-0 border-0 text-decoration-none flex-shrink-0"
          onClick={() => onOpenOriginalSample?.(originalSampleId)}
        >
          View original sample
        </button>
      </div>
    </section>
  );
}

function ActionRequiredPanel({ resolved, request, onTakeAction }) {
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
        <strong>{request?.due ?? '(4 days)'}</strong>
      </div>
      <div className="card-body">
        <dl className="mb-0">
          <div>
            <dt>Requested by</dt>
            <dd>{request?.requestedBy ?? 'Rushabh Hathi'}</dd>
          </div>
          <div>
            <dt>Requested on</dt>
            <dd>{request?.requestedOn ?? '13 June 2026, 13:54'}</dd>
          </div>
          <div>
            <dt>Comments</dt>
            <dd>{request?.comments || 'Approve this sample ASAP'}</dd>
          </div>
        </dl>
        <PrimaryButton className="w-100" leftIcon="external-link" size="default" onClick={onTakeAction}>
          Take action
        </PrimaryButton>
      </div>
    </section>
  );
}

function ActivityRail({ items = activityItems }) {
  return (
    <section className="smplfy-sample-details-activity">
      <div className="d-flex align-items-center justify-content-between">
        <h2>Activity</h2>
        <button className="smplfy-btn btn btn-link p-0 border-0 text-decoration-underline" type="button">See all</button>
      </div>
      <ol className="smplfy-sample-details-timeline list-unstyled mb-0">
        {items.map((item, index) => (
          <li className={`is-${item.tone}`} key={`${item.label}-${index}`}>
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
              label="Next state"
              inputProps={{
                value: sendTo,
                placeholder: 'Select state',
                options: ['Under Allocation'],
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

export default function TutorialInwardDetailsPage({
  sampleId = 'IICT/2025-2026/1101',
  initialToast = null,
  sourcePage = 'samples-workspace',
  sampleStatus = 'Pending',
  createdOn = '06/03/2026, 10:13',
  reportingDate = null,
  delayed,
  sample = null,
  onBack,
  onEditSample,
  onOpenTestRequests,
  onOpenCoaReport,
  onOpenProformaInvoice,
  onOpenOriginalSample,
  onGoToInward,
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  sampleCreationFlowSessionId = null,
  sampleCreationFlowStartedAt = null,
  sampleCreationFormVariant = null,
  // Tutorial state
  inward: inwardOverride = null,
  product: productOverride = null,
  reviewRequest = null,
  approved = false,
  activity,
  onSendForReview,
  onApprove,
}) {
  const { userName } = useContext(TutorialChromeContext);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState(toastMessageByKey['sample-created']);
  const reviewRequested = Boolean(reviewRequest);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [approvalActionModalOpen, setApprovalActionModalOpen] = useState(false);
  const approvalActionResolved = approved || !reviewRequested;
  // Samples created through the inward flow resolve their own inward. The rest
  // are older fixtures with no inward, so they borrow a representative one —
  // the card and the "Go to inward" link then agree on where they point.
  const sampleInward = inwardOverride ?? getInwardBySampleId(sampleId) ?? getInwardById(FALLBACK_INWARD_ID);
  const sampleProduct = productOverride ?? getProductBySampleId(sampleId) ?? sampleInward?.products?.[0] ?? null;
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
    if (!sendTo) return;
    onSendForReview?.({ nextState: sendTo, comments });
    setReviewModalOpen(false);
    showToast('review-request-success');
  };

  const handleSubmitApprovalAction = (result) => {
    onApprove?.(result);
    setApprovalActionModalOpen(false);
    showToast('approval-action-success');
  };

  // Where the viewer came from decides the breadcrumb and which sidebar item
  // stays lit. Samples are reachable from the flat samples table, the card
  // listing, and the workspace.
  const sourceLabelByPage = {
    'all-samples-table': 'All samples',
    'all-samples': 'All inwards',
    'inward-details': 'Inward Details',
  };
  const sourceLabel = sourceLabelByPage[sourcePage] ?? 'Samples Workspace';
  const activeNavByPage = {
    'all-samples-table': 'all-samples-table',
    'all-samples': 'all-samples',
    'inward-details': 'all-products',
  };
  const activeNav = activeNavByPage[sourcePage] ?? 'samples-workspace';
  const isAmendmentSample = sample?.category === 'amendment-samples';
  const originalSampleId = isAmendmentSample ? sample?.originalSampleId : null;
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
          reportingDate={reportingDate ?? sample?.reportingDate}
          delayed={delayed ?? sample?.delayed}
          reviewRequested={reviewRequested}
          onBack={onBack}
          onEditSample={onEditSample}
          onOpenTestRequests={onOpenTestRequests}
          onOpenCoaReport={onOpenCoaReport}
          onOpenProformaInvoice={onOpenProformaInvoice}
          onRequestReview={() => setReviewModalOpen(true)}
        />
      }
    >
      <main className="smplfy-sample-details-page bg-body-tertiary p-4 min-vh-100">
        <div className="smplfy-sample-details-layout d-grid">
          <div className="smplfy-sample-details-main-panel">
            <AmendmentSampleNotice
              originalSampleId={originalSampleId}
              onOpenOriginalSample={onOpenOriginalSample}
            />
            <InwardDetailsCard inward={sampleInward} onGoToInward={onGoToInward} />
            <TestingDetailsCard product={sampleProduct} />
          </div>
          <aside className="smplfy-sample-details-rail">
            <ActionRequiredPanel
              resolved={approvalActionResolved}
              request={reviewRequest}
              onTakeAction={() => setApprovalActionModalOpen(true)}
            />
            <ActivityRail items={activity} />
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

      <SampleApprovalModal
        open={approvalActionModalOpen}
        sampleId={sampleId}
        request={reviewRequest}
        approverName={userName}
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
