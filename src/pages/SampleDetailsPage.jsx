import { useEffect, useState } from 'react';
import AppIcon from '../components/AppIcon';
import AppChrome from '../components/AppChrome/AppChrome';
import { FormElement, ToastNotification } from '../components/FormControls';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import companyLogo from '../../assets/logo-l.png';
import './sample-details-page.css';

const toastMessageByKey = {
  'sample-created': 'Sample Created.',
  'review-request-success': 'Review Request sent successfully.',
};

const reportCards = [
  { key: 'card-1', withLogo: true, tableOnly: false },
  { key: 'card-2', withLogo: false, tableOnly: true },
  { key: 'card-3', withLogo: false, tableOnly: false },
  { key: 'card-4', withLogo: false, tableOnly: true },
  { key: 'card-5', withLogo: false, tableOnly: true },
];

const signatureItems = [
  ['Analysed by', 'Person’s Name'],
  ['Format Approved by', 'QA'],
  ['Format Approved by', 'QA'],
  ['Format Approved by', 'QA'],
  ['Date', '13/03/2026'],
];

const auditRows = [
  ['Job Created', 'Universal Admin created job for product.', '“Auto comment for approval.”', '09/03/2026 12:45', 'NA'],
  ['Allocated', 'TestRequest allocated to Universal Admin for testing by Universal Admin.', 'NA', '09/03/2026 12:45', '2 days'],
  ['Submitted', 'TestRequest is submitted for approval by Universal Admin', 'NA', '09/03/2026 12:45', '2 days'],
  ['Reviewed', 'TestRequest was Reviewed by Technical Manager and sent for approval of Universal Admin.', 'NA', '09/03/2026 12:45', '2 days'],
  ['Approved', 'TestRequest was Approved by Universal Admin', 'NA', '09/03/2026 12:45', '2 days'],
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
  onRequestReview,
  onOpenTestRequests,
}) {
  const isUnderAnalysis = sampleStatus === 'Under Analysis';
  const { date, time } = splitDateTime(createdOn);
  const badgeClass = isUnderAnalysis
    ? 'sample-details-page-header__badge--analysis'
    : reviewRequested
      ? 'sample-details-page-header__badge--review'
      : 'sample-details-page-header__badge--draft';
  const badgeLabel = isUnderAnalysis ? 'Under Analysis' : reviewRequested ? 'Sent for review' : 'Draft';

  return (
    <section className="sample-details-page-header">
      <div className="sample-details-page-header__row">
        <div className="sample-details-page-header__breadcrumbs">
          <AppIcon name="home" />
          <AppIcon name="chevron-right" />
          <span>All Samples</span>
          <AppIcon name="chevron-right" />
          <span className="is-current">{sampleId}</span>
        </div>
      </div>

      <div className="sample-details-page-header__row is-main">
        <div className="sample-details-page-header__title-block">
          <button
            className="sample-details-page-header__back btn"
            aria-label="Go back"
            onClick={onBack}
          >
            <AppIcon name="chevron-left" />
          </button>

          <div className="sample-details-page-header__title-copy">
            <div className="sample-details-page-header__title-row">
              <h1>{sampleId}</h1>
              <span
                className={`sample-details-page-header__badge ${badgeClass}`}
              >
                {badgeLabel}
              </span>
            </div>
            <div className="sample-details-page-header__timestamp">
              <span>{date}</span>
              <span>{time}</span>
            </div>
          </div>
        </div>

        <div className="sample-details-page-header__cta-group">
          {isUnderAnalysis ? (
            <PrimaryButton
              leftIcon="workspace"
              className="sample-details-page-header__primary"
              onClick={onOpenTestRequests}
            >
              Test Requests
            </PrimaryButton>
          ) : reviewRequested ? null : (
            <PrimaryButton
              leftIcon="check"
              className="sample-details-page-header__primary"
              onClick={onRequestReview}
            >
              Send for Review
            </PrimaryButton>
          )}
          <button className="sample-details-page-header__secondary btn">
            <AppIcon name="file-text" />
            <span>COA Report</span>
          </button>
          <button className="sample-details-page-header__more btn" aria-label="More actions">
            <AppIcon name="more" />
          </button>
        </div>
      </div>
    </section>
  );
}

function ReportHead({ withLogo }) {
  return (
    <div className="sample-report-card__head">
      <div className="sample-report-card__logo-cell">
        {withLogo ? (
          <img className="sample-report-card__logo" src={companyLogo} alt="Deepak Cybit logo" />
        ) : null}
      </div>

      <div className="sample-report-card__title-cell">
        <div className="sample-report-card__title-band">
          universal research laboratory services, lucknow
        </div>
        <div className="sample-report-card__title-band">Summary of test results</div>
      </div>

      <div className="sample-report-card__meta-cell">
        {[
          ['Doc. No.', 'URLS/QP/143/F-06'],
          ['Issue No./Date', '01/08-01/2023'],
          ['Rev. No.', '01'],
          ['Rev. Date', '10-10-2024'],
          ['Page No.', '1 of 1'],
        ].map(([label, value]) => (
          <div className="sample-report-card__meta-row" key={label}>
            <span>{label}</span>
            <span>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportTable() {
  return (
    <div className="sample-report-card__table">
      {[1, 2, 3, 4].map((row) => (
        <div key={row} className="sample-report-card__table-row">
          <div className="sample-report-card__table-index">{row}</div>
          <div className="sample-report-card__table-label">Sample name</div>
          <div className="sample-report-card__table-value">
            universal research laboratory services, lucknow
          </div>
        </div>
      ))}
    </div>
  );
}

function ReportCard({ withLogo, tableOnly }) {
  return (
    <section className={`sample-report-card ${tableOnly ? 'is-table-only' : ''}`}>
      {!tableOnly ? <ReportHead withLogo={withLogo} /> : null}
      <ReportTable />
    </section>
  );
}

function SignatureStrip() {
  return (
    <section className="sample-signature-strip">
      {signatureItems.map(([label, value]) => (
        <div className="sample-signature-strip__item" key={label + value}>
          <div className="sample-signature-strip__label">{label}</div>
          <div className="sample-signature-strip__value">{value}</div>
        </div>
      ))}
    </section>
  );
}

function AuditTrail() {
  return (
    <section className="sample-audit">
      <div className="sample-audit__header">Audit Trail</div>

      <div className="sample-audit__body">
        <div className="sample-audit__timeline">
          <div className="sample-audit__timeline-line" />
          {auditRows.map((row) => (
            <div className="sample-audit__timeline-node" key={row[0]} />
          ))}
        </div>

        <div className="sample-audit__rows">
          {auditRows.map(([status, message, note, timestamp, duration]) => (
            <div className="sample-audit__row" key={status}>
              <div className="sample-audit__status">{status}</div>
              <div className="sample-audit__message">
                <div className="sample-audit__message-line">{message}</div>
                <div className="sample-audit__note">{note}</div>
              </div>
              <div className="sample-audit__meta">
                <div className="sample-audit__timestamp">{timestamp}</div>
                <div className="sample-audit__duration">{duration}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ReviewRequestModal({ open, sendTo, comments, onSendToChange, onCommentsChange, onCancel, onSubmit }) {
  if (!open) {
    return null;
  }

  return (
    <div className="review-request-modal" role="dialog" aria-modal="true" aria-labelledby="review-request-title">
      <div className="review-request-modal__backdrop" onClick={onCancel} />
      <div className="review-request-modal__card">
        <div className="review-request-modal__title-row">
          <AppIcon name="user" size={24} className="review-request-modal__title-icon" />
          <h2 id="review-request-title">Request Review</h2>
        </div>

        <div className="review-request-modal__body">
          <div className="review-request-modal__grid">
            <div className="review-request-modal__field">
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

            <div className="review-request-modal__field">
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

          <div className="review-request-modal__field review-request-modal__field--full">
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

        <div className="review-request-modal__actions">
          <button className="review-request-modal__cancel btn" onClick={onCancel}>
            <AppIcon name="close" />
            <span>Cancel</span>
          </button>
          <PrimaryButton leftIcon="send" onClick={onSubmit}>
            Send Request
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

export default function SampleDetailsPage({
  sampleId = 'IICT/2025-2026/1101',
  initialToast = null,
  sourcePage = 'samples-workspace',
  sampleStatus = 'Draft',
  createdOn = '06/03/2026, 10:13',
  onBack,
  onOpenTestRequests,
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
}) {
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState(toastMessageByKey['sample-created']);
  const [reviewRequested, setReviewRequested] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [sendTo, setSendTo] = useState('');
  const [comments, setComments] = useState('');

  useEffect(() => {
    if (!initialToast) {
      setToastVisible(false);
      return undefined;
    }

    let frameId = 0;
    let timerId = 0;

    frameId = window.requestAnimationFrame(() => {
      setToastMessage(toastMessageByKey[initialToast] ?? initialToast);
      setToastVisible(true);
      timerId = window.setTimeout(() => setToastVisible(false), 5000);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timerId);
    };
  }, [initialToast]);

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
    >
      <DetailsHeader
        sampleId={sampleId}
        sampleStatus={sampleStatus}
        reviewRequested={reviewRequested}
        createdOn={createdOn}
        onBack={onBack}
        onRequestReview={() => setReviewModalOpen(true)}
        onOpenTestRequests={onOpenTestRequests}
      />

      <main className="sample-details-page__content">
        <div className="sample-details-page__body">
          <div className="sample-details-page__report-stack">
            {reportCards.map((card) => (
              <ReportCard key={card.key} withLogo={card.withLogo} tableOnly={card.tableOnly} />
            ))}
          </div>

          <SignatureStrip />
          <AuditTrail />
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
        className="sample-created-toast"
        onClose={() => setToastVisible(false)}
      />
    </AppChrome>
  );
}
