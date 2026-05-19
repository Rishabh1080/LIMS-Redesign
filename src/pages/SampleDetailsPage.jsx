import { useEffect, useRef, useState } from 'react';
import AppIcon from '../components/AppIcon';
import AppChrome from '../components/AppChrome/AppChrome';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal/Modal';
import { FormElement, ToastNotification } from '../components/FormControls';
import MoreActionButton from '../components/MoreActionButton';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import StatusPill from '../components/StatusPill';
import { getAnalyticsElapsedTime, trackEvent } from '../analytics/posthog';
import { getStatusPresentation } from '../status/statusRegistry';
import './sample-details-page.scss';

const toastMessageByKey = {
  'sample-created': 'Sample Created.',
  'review-request-success': 'Review Request sent successfully.',
};

const barcodePattern = [
  2, 1, 1, 3, 1, 2, 1, 1, 2, 1, 3, 1, 1, 2, 1, 2, 1, 1, 3, 1, 2, 1, 1, 2, 1, 3, 1, 1, 2, 1, 2, 1, 1, 3, 1, 2, 1, 1, 2, 1,
  3, 1, 1, 2, 1, 2, 1, 1, 3, 1, 2, 1,
];

const productSections = [
  {
    product: 'Yarns & Chords',
    sampleQty: '1',
    sampleSize: '200',
    quality: 'Yarn',
    description: 'Lot - 2',
    identification: 'White',
    condition: 'ok',
  },
  {
    product: 'Yarns & Chords',
    sampleQty: '1',
    sampleSize: '200',
    quality: 'Yarn',
    description: 'Lot - 3',
    identification: 'White',
    condition: 'OK',
  },
];

const imageSummaryRows = ['Yarns & Chords', 'Yarns & Chords'];

const parameterRows = [
  {
    product: 'Yarns & Chords',
    parameter: 'Quantitative chemical analysis of mixtures',
    testMethod: 'IS 2006:1988',
    size: '',
    charges: '800',
    estTime: '4',
  },
  {
    product: 'Yarns & Chords',
    parameter: 'Quantitative chemical analysis of mixtures',
    testMethod: 'IS 2006:1988',
    size: '',
    charges: '800',
    estTime: '0',
  },
];

const sampleHeaderActionItems = [
  { key: 'create-amendment', label: 'Create Amendment', leftIcon: 'edit' },
  { key: 'create-complaint', label: 'Create Complaint', leftIcon: 'alert-circle' },
  { key: 'add-final-comments', label: 'Add final comments', leftIcon: 'file-text' },
  { key: 'acknowledgement-receipt', label: 'Acknowledgement Receipt', leftIcon: 'file-text' },
  { key: 'proforma-invoice', label: 'Proforma Invoice', leftIcon: 'file-text' },
];

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

function DetailsHeader({
  sampleId,
  sampleStatus,
  reviewRequested,
  createdOn,
  onBack,
  onEditSample,
  onRequestReview,
  onOpenTestRequests,
  onOpenCoaReport,
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
            <div className="d-inline-flex gap-2 text-secondary fw-medium mt-2">
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

function BarcodeBlock() {
  let x = 0;

  return (
    <div className="smplfy-sample-report-barcode d-flex flex-column align-items-end gap-1 mb-2" aria-hidden="true">
      <svg width="320" height="52" viewBox="0 0 320 52" role="img" focusable="false">
        <rect x="0" y="0" width="320" height="52" fill="#fff" />
        {barcodePattern.map((width, index) => {
          const isBar = index % 2 === 0;
          const currentX = x;
          x += width + 1;

          if (!isBar) {
            return null;
          }

          return <rect key={`${index}-${width}`} x={currentX} y="4" width={width} height="40" rx="0.5" fill="#1c2126" />;
        })}
      </svg>
      <div className="smplfy-sample-report-barcode-code small text-dark fw-medium">a3642e1ecc4c4ec4d5272292</div>
    </div>
  );
}

function ProductSectionRows({ section }) {
  return (
    <>
      <tr>
        <td className="fw-semibold" rowSpan={4}>
          {section.product}
        </td>
        <td rowSpan={4}>{section.sampleQty}</td>
        <td rowSpan={4}>{section.sampleSize}</td>
        <td rowSpan={4}>{section.quality}</td>
        <td className="text-center" rowSpan={4}>
          <button
            className="smplfy-sample-report-image-button smplfy-btn btn btn-primary"
            type="button"
            aria-label={`Download image for ${section.product}`}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                d="M12 4v8m0 0 3-3m-3 3-3-3M5 16.5V19h14v-2.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </td>
      </tr>
      <tr>
        <th scope="row">Description</th>
        <td colSpan={3}>{section.description}</td>
      </tr>
      <tr>
        <th scope="row">Identification</th>
        <td colSpan={3}>{section.identification}</td>
      </tr>
      <tr>
        <th scope="row">Condition</th>
        <td colSpan={3}>{section.condition}</td>
      </tr>
    </>
  );
}

function SampleReportCard() {
  return (
    <section className="smplfy-sample-report-card smplfy-card card shadow-sm">
      <div className="card-body">
      <BarcodeBlock />

      <div className="smplfy-sample-report-section">
        <h2 className="smplfy-sample-report-title h5 text-center text-decoration-underline mb-3">Product Data</h2>

          <DataTable className="smplfy-sample-report-table table-bordered">
            <thead>
              <tr>
                <th scope="col">Product</th>
                <th scope="col">Sample Qty.</th>
                <th scope="col">Sample Size</th>
                <th scope="col">Quality</th>
                <th scope="col">Image</th>
              </tr>
            </thead>
            <tbody>
              {productSections.map((section) => (
                <ProductSectionRows key={`${section.product}-${section.description}`} section={section} />
              ))}
            </tbody>
          </DataTable>

        <div className="smplfy-sample-report-table-compact mt-3">
          <DataTable className="smplfy-sample-report-table smplfy-sample-report-table-summary table-bordered">
            <thead>
              <tr>
                <th scope="col">Product</th>
                <th scope="col">Image</th>
              </tr>
            </thead>
            <tbody>
              {imageSummaryRows.map((product, index) => (
                <tr key={`${product}-${index}`}>
                  <td>{product}</td>
                  <td className="text-center">
                    <button
                      className="smplfy-sample-report-image-button smplfy-btn btn btn-primary"
                      type="button"
                      aria-label={`Download image for ${product}`}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path
                          d="M12 4v8m0 0 3-3m-3 3-3-3M5 16.5V19h14v-2.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.9"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        </div>
      </div>

      <div className="smplfy-sample-report-section mt-4">
        <h2 className="smplfy-sample-report-title h5 text-center text-decoration-underline mb-3">Parameter Data</h2>

          <DataTable className="smplfy-sample-report-table table-bordered">
            <thead>
              <tr>
                <th scope="col">Product</th>
                <th scope="col">Parameter</th>
                <th scope="col">Test Method</th>
                <th scope="col">Size</th>
                <th scope="col">Charges</th>
                <th scope="col">Est. Time</th>
              </tr>
            </thead>
            <tbody>
              {parameterRows.map((row) => (
                <tr key={`${row.product}-${row.estTime}`}>
                  <td>{row.product}</td>
                  <td>{row.parameter}</td>
                  <td>{row.testMethod}</td>
                  <td>{row.size}</td>
                  <td>{row.charges}</td>
                  <td>{row.estTime}</td>
                </tr>
              ))}
            </tbody>
          </DataTable>
      </div>
      </div>
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
          reviewRequested={reviewRequested}
          createdOn={createdOn}
          onBack={onBack}
          onEditSample={onEditSample}
          onRequestReview={() => setReviewModalOpen(true)}
          onOpenTestRequests={onOpenTestRequests}
          onOpenCoaReport={onOpenCoaReport}
        />
      }
    >
      <main className="smplfy-sample-details-page bg-body-tertiary p-4 min-vh-100">
        <div className="d-flex flex-column gap-3">
          <div className="d-flex flex-column gap-3">
            <SampleReportCard />
          </div>
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

      <ToastNotification
        state={toastVisible ? 'default' : 'gone'}
        message={toastMessage}
        className="position-fixed bottom-0 start-0 m-4"
        onClose={() => setToastVisible(false)}
      />
    </AppChrome>
  );
}
