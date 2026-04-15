import { useEffect, useState } from 'react';
import AppIcon from '../components/AppIcon';
import AppChrome from '../components/AppChrome/AppChrome';
import Modal from '../components/Modal/Modal';
import { FormElement, ToastNotification } from '../components/FormControls';
import MoreActionButton from '../components/MoreActionButton';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import StatusPill from '../components/StatusPill';
import { getStatusPresentation } from '../status/statusRegistry';
import './sample-details-page.css';

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
          <SecondaryButton
            size="medium"
            className="sample-details-page-header__back"
            aria-label="Go back"
            onClick={onBack}
          >
            <AppIcon name="chevron-left" />
          </SecondaryButton>

          <div className="sample-details-page-header__title-copy">
            <div className="sample-details-page-header__title-row">
              <h1>{sampleId}</h1>
              <StatusPill color={statusPresentation.color} styleType={statusPresentation.styleType}>
                {statusPresentation.label}
              </StatusPill>
            </div>
            <div className="sample-details-page-header__timestamp">
              <span>{date}</span>
              <span>{time}</span>
            </div>
          </div>
        </div>

        <div className="sample-details-page-header__cta-group">
          {isCompleted ? (
            <>
              <PrimaryButton
                leftIcon="file-text"
                className="sample-details-page-header__primary"
                onClick={onOpenCoaReport}
              >
                COA Report
              </PrimaryButton>
              <SecondaryButton
                leftIcon="clipboard-text"
                size="large"
                className="sample-details-page-header__secondary"
                onClick={onOpenTestRequests}
              >
                Test Requests
              </SecondaryButton>
            </>
          ) : isUnderAnalysis ? (
            <PrimaryButton
              leftIcon="workspace"
              className="sample-details-page-header__primary"
              onClick={onOpenTestRequests}
            >
              Test Requests
            </PrimaryButton>
          ) : reviewRequested ? null : (
            <>
              <PrimaryButton
                leftIcon="check"
                className="sample-details-page-header__primary"
                onClick={onRequestReview}
              >
                Send for Review
              </PrimaryButton>
              {isPending ? (
                <SecondaryButton
                  leftIcon="edit"
                  size="large"
                  className="sample-details-page-header__secondary"
                  onClick={onEditSample}
                >
                  Edit
                </SecondaryButton>
              ) : null}
            </>
          )}
          <MoreActionButton className="sample-details-page-header__more" items={sampleHeaderActionItems} />
        </div>
      </div>
    </section>
  );
}

function BarcodeBlock() {
  let x = 0;

  return (
    <div className="sample-report-card__barcode-block" aria-hidden="true">
      <svg className="sample-report-card__barcode" viewBox="0 0 320 52" role="img" focusable="false">
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
      <div className="sample-report-card__barcode-code">a3642e1ecc4c4ec4d5272292</div>
    </div>
  );
}

function ProductSectionRows({ section }) {
  return (
    <>
      <tr className="sample-report-card__product-row">
        <td className="sample-report-card__product-cell" rowSpan={4}>
          {section.product}
        </td>
        <td rowSpan={4}>{section.sampleQty}</td>
        <td rowSpan={4}>{section.sampleSize}</td>
        <td rowSpan={4}>{section.quality}</td>
        <td className="sample-report-card__image-cell" rowSpan={4}>
          <button
            className="sample-report-card__image-button"
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
    <section className="sample-report-card">
      <BarcodeBlock />

      <div className="sample-report-card__section">
        <h2 className="sample-report-card__section-title">Product Data</h2>

        <div className="sample-report-card__table-wrap">
          <table className="sample-report-card__table sample-report-card__table--product">
            <colgroup>
              <col className="sample-report-card__col sample-report-card__col--product" />
              <col className="sample-report-card__col sample-report-card__col--qty" />
              <col className="sample-report-card__col sample-report-card__col--size" />
              <col className="sample-report-card__col sample-report-card__col--quality" />
              <col className="sample-report-card__col sample-report-card__col--image" />
            </colgroup>
            <thead>
              <tr>
                <th>Product</th>
                <th>Sample Qty.</th>
                <th>Sample Size</th>
                <th>Quality</th>
                <th>Image</th>
              </tr>
            </thead>
            <tbody>
              {productSections.map((section) => (
                <ProductSectionRows key={`${section.product}-${section.description}`} section={section} />
              ))}
            </tbody>
          </table>
        </div>

        <div className="sample-report-card__table-wrap sample-report-card__table-wrap--compact">
          <table className="sample-report-card__table sample-report-card__table--summary">
            <colgroup>
              <col className="sample-report-card__col sample-report-card__col--summary-product" />
              <col className="sample-report-card__col sample-report-card__col--summary-image" />
            </colgroup>
            <thead>
              <tr>
                <th>Product</th>
                <th>Image</th>
              </tr>
            </thead>
            <tbody>
              {imageSummaryRows.map((product, index) => (
                <tr key={`${product}-${index}`}>
                  <td>{product}</td>
                  <td className="sample-report-card__summary-image-cell">
                    <button
                      className="sample-report-card__image-button"
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
          </table>
        </div>
      </div>

      <div className="sample-report-card__section sample-report-card__section--parameter">
        <h2 className="sample-report-card__section-title">Parameter Data</h2>

        <div className="sample-report-card__table-wrap">
          <table className="sample-report-card__table sample-report-card__table--parameter">
            <colgroup>
              <col className="sample-report-card__col sample-report-card__col--parameter-product" />
              <col className="sample-report-card__col sample-report-card__col--parameter-name" />
              <col className="sample-report-card__col sample-report-card__col--parameter-method" />
              <col className="sample-report-card__col sample-report-card__col--parameter-size" />
              <col className="sample-report-card__col sample-report-card__col--parameter-charges" />
              <col className="sample-report-card__col sample-report-card__col--parameter-time" />
            </colgroup>
            <thead>
              <tr>
                <th>Product</th>
                <th>Parameter</th>
                <th>Test Method</th>
                <th>Size</th>
                <th>Charges</th>
                <th>Est. Time</th>
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
          </table>
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
      bodyClassName="review-request-modal__body"
      actionsClassName="review-request-modal__actions"
      actions={
        <>
          <SecondaryButton leftIcon="close" size="large" className="review-request-modal__cancel" onClick={onCancel}>
            Cancel
          </SecondaryButton>
          <PrimaryButton leftIcon="send" onClick={onSubmit}>
            Send Request
          </PrimaryButton>
        </>
      }
    >
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
      <main className="sample-details-page__content">
        <div className="sample-details-page__body">
          <div className="sample-details-page__report-stack">
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
        className="sample-created-toast"
        onClose={() => setToastVisible(false)}
      />
    </AppChrome>
  );
}
