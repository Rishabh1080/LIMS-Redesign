import { useEffect, useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import MoreActionButton from '../components/MoreActionButton';
import NavSelector from '../components/NavSelector';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import { FormElement, ToastNotification } from '../components/FormControls';
import Modal from '../components/Modal/Modal';
import qrCode from '../../assets/qr.png';
import './instrument-details-page.css';

const serviceTypeOptions = ['Calibration', 'Breakdown', 'Maintenance', 'Service'];

const initialServiceDraft = {
  serviceType: serviceTypeOptions[0],
  vendor: '',
  nextServiceOn: '',
  attachment: null,
  details: '',
};

function NewServiceModal({ open, instrumentName, onCancel, onSubmit }) {
  const [draft, setDraft] = useState(initialServiceDraft);
  const [errors, setErrors] = useState({});

  const update = (field, value) => {
    setDraft((c) => ({ ...c, [field]: value }));
    if (errors[field]) setErrors((c) => { const n = { ...c }; delete n[field]; return n; });
  };

  const handleSubmit = () => {
    const nextErrors = {};
    if (!draft.nextServiceOn) nextErrors.nextServiceOn = 'Next service date is required.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setDraft(initialServiceDraft);
    setErrors({});
    onSubmit();
  };

  const handleCancel = () => {
    setDraft(initialServiceDraft);
    setErrors({});
    onCancel();
  };

  if (!open) return null;

  return (
    <Modal
      open={open}
      title="New Service"
      titleId="new-service-modal-title"
      titleIcon="settings"
      onClose={handleCancel}
      size="md"
      actions={
        <>
          <SecondaryButton leftIcon="close" size="large" onClick={handleCancel}>Cancel</SecondaryButton>
          <PrimaryButton leftIcon="save" onClick={handleSubmit}>Submit</PrimaryButton>
        </>
      }
    >
      <form
        className="new-service-modal__form"
        onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
      >
        <div className="new-service-modal__grid">
          <div className="new-service-modal__field new-service-modal__field--full">
            <div className="new-service-modal__label-row">
              <span className="new-service-modal__label">Type of Service</span>
              <span className="new-service-modal__required">*</span>
            </div>

            <div className="new-service-modal__type-selector" role="tablist" aria-label="Type of Service">
              {serviceTypeOptions.map((option) => {
                const isActive = draft.serviceType === option;

                return (
                  <NavSelector
                    key={option}
                    type="button"
                    size="medium"
                    active={isActive}
                    className="new-service-modal__type-option"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => update('serviceType', option)}
                  >
                    {option}
                  </NavSelector>
                );
              })}
            </div>
          </div>
          <div className="new-service-modal__field">
            <FormElement
              type="text"
              label="Vendor"
              inputProps={{
                value: draft.vendor,
                placeholder: 'eg.',
                onChange: (e) => update('vendor', e.target.value),
              }}
            />
          </div>
          <div className="new-service-modal__field">
            <FormElement
              type="date"
              mandatory
              label="Next Service On"
              message={errors.nextServiceOn}
              messageTone="error"
              inputProps={{
                value: draft.nextServiceOn,
                placeholder: 'Select date',
                onChange: (e) => update('nextServiceOn', e.target.value),
              }}
            />
          </div>
          <div className="new-service-modal__field">
            <FormElement
              type="file"
              label="Attachments"
              inputProps={{
                value: draft.attachment,
                placeholder: 'Choose files',
                onChange: (e) => update('attachment', e.target.value),
              }}
            />
          </div>
        </div>
        <div>
          <FormElement
            type="text"
            label="Details and Summary"
            inputProps={{
              value: draft.details,
              placeholder: 'Enter the details of the service',
              onChange: (e) => update('details', e.target.value),
            }}
          />
        </div>
      </form>
    </Modal>
  );
}

const mockRecords = [
  { id: 1, type: 'IN', quantity: '19', supplierBatch: '01-04-2026', transactionDate: '01-04-2026', expiryDate: '-', cost: '-', by: 'Deepak Cyblt' },
  { id: 2, type: 'OUT', quantity: '19', supplierBatch: '01-04-2026', transactionDate: '01-04-2026', expiryDate: '-', cost: '-', by: 'Deepak Cyblt' },
  { id: 3, type: 'OUT- Damaged', quantity: '19', supplierBatch: '01-04-2026', transactionDate: '01-04-2026', expiryDate: '-', cost: '-', by: 'Deepak Cyblt' },
];

function InstrumentDetailsHeader({ instrumentName, onBack, onEditInstrument, onNewService }) {
  const moreActionItems = [
    {
      key: 'edit',
      label: 'Edit',
      leftIcon: 'edit',
      onClick: onEditInstrument,
    },
  ];

  return (
    <section className="instrument-details-page-header">
      <div className="container-fluid h-100 px-0">
        <div className="row h-100 align-items-center justify-content-between gx-0">
          <div className="col-auto d-flex align-items-center gap-3">
            <SecondaryButton
              leftIcon="chevron-left"
              className="instrument-details-back"
              onClick={onBack}
              aria-label="Go back"
            />
            <h1 className="instrument-details-page-header__title">{instrumentName}</h1>
          </div>
          <div className="col-auto d-flex align-items-center gap-3">
            <PrimaryButton leftIcon="plus" onClick={onNewService}>
              New Service
            </PrimaryButton>
            <SecondaryButton leftIcon="printer">
              Print QR
            </SecondaryButton>
            <MoreActionButton items={moreActionItems} />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function InstrumentDetailsPage({
  instrumentId = 'inst-001',
  instrumentName = 'Stabinger Viscometer',
  description = 'Description goes here. This material is of critical importance. Create a new PO if stock reaches 120% of min qty.',
  make = 'Y8k08',
  uniqueKey = 'Y8k08',
  modelNo = 'Y8k08',
  serialNo = 'Y8k08',
  records = mockRecords,
  initialToast = null,
  onEditInstrument,
  onBack,
  onNewService,
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
}) {
  const [activeTab, setActiveTab] = useState('maintenance');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [serviceModalOpen, setServiceModalOpen] = useState(false);

  useEffect(() => {
    if (!initialToast) {
      setToastVisible(false);
      return undefined;
    }

    let frameId = 0;
    let timerId = 0;

    frameId = window.requestAnimationFrame(() => {
      setToastMessage(initialToast);
      setToastVisible(true);
      timerId = window.setTimeout(() => setToastVisible(false), 5000);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timerId);
    };
  }, [initialToast]);

  const tabs = [
    { key: 'calibration', label: 'Calibration' },
    { key: 'maintenance', label: 'Maintenance' },
    { key: 'breakdown', label: 'Breakdown' },
    { key: 'service', label: 'Service' },
  ];

  return (
    <AppChrome
      activeNav="instruments"
      onNavigate={onNavigate}
      breadcrumbs={[
        { key: 'instruments', label: 'Instruments' },
        { key: 'instrument-details', label: instrumentName, current: true },
      ]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      pageHeader={
        <InstrumentDetailsHeader
          instrumentName={instrumentName}
          onBack={onBack}
          onEditInstrument={onEditInstrument}
          onNewService={() => setServiceModalOpen(true)}
        />
      }
    >
      <main className="instrument-details-page">
        <div className="container-fluid px-0 d-flex flex-column" style={{ gap: '16px' }}>
          <div className="instrument-details-summary">
            <div className="instrument-details-info-card">
              <div className="instrument-details-info-card__content">
                <h2 className="instrument-details-info-card__title">{instrumentName}</h2>
                <p className="instrument-details-info-card__description">{description}</p>
              </div>
              <div className="instrument-details-info-card__meta">
                <div className="instrument-details-meta-row">
                  <span className="instrument-details-meta-label">Make:</span>
                  <span className="instrument-details-meta-value">{make}</span>
                </div>
                <div className="instrument-details-meta-row">
                  <span className="instrument-details-meta-label">Unique Key:</span>
                  <span className="instrument-details-meta-value">{uniqueKey}</span>
                </div>
                <div className="instrument-details-meta-row">
                  <span className="instrument-details-meta-label">Model No:</span>
                  <span className="instrument-details-meta-value">{modelNo}</span>
                </div>
                <div className="instrument-details-meta-row">
                  <span className="instrument-details-meta-label">Serial No:</span>
                  <span className="instrument-details-meta-value">{serialNo}</span>
                </div>
              </div>
            </div>

            <div className="instrument-details-qr-card">
              <div className="instrument-details-qr-placeholder">
                <img src={qrCode} alt="QR Code" width={120} height={120} />
              </div>
            </div>
          </div>

          <div className="instrument-details-records-card">
            <div className="instrument-details-tabs">
              {tabs.map((tab) => (
                <NavSelector
                  key={tab.key}
                  active={activeTab === tab.key}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </NavSelector>
              ))}
            </div>

            <div className="instrument-details-records-header">
              <span className="instrument-details-records-count">{records.length} Records</span>
            </div>

            <div className="instrument-details-table-wrapper">
              <div className="instrument-details-table">
                <div className="instrument-details-table__head">
                  <span>Sr</span>
                  <span>Type</span>
                  <span>Quantity</span>
                  <span>Supplier/Batch</span>
                  <span>Transaction Date</span>
                  <span>Expiry Date</span>
                  <span>Cost(s)</span>
                  <span>By</span>
                </div>
                <div className="instrument-details-table__body">
                  {records.map((record, index) => (
                    <div className="instrument-details-table__row" key={record.id}>
                      <span>{index + 1}</span>
                      <span>{record.type}</span>
                      <span>{record.quantity}</span>
                      <span>{record.supplierBatch}</span>
                      <span>{record.transactionDate}</span>
                      <span>{record.expiryDate}</span>
                      <span>{record.cost}</span>
                      <span>{record.by}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <NewServiceModal
        open={serviceModalOpen}
        instrumentName={instrumentName}
        onCancel={() => setServiceModalOpen(false)}
        onSubmit={() => {
          setServiceModalOpen(false);
          setToastMessage('Service created successfully.');
          window.requestAnimationFrame(() => {
            setToastVisible(true);
            window.setTimeout(() => setToastVisible(false), 5000);
          });
        }}
      />

      <ToastNotification
        state={toastVisible ? 'default' : 'gone'}
        message={toastMessage}
        className="instrument-created-toast"
        onClose={() => setToastVisible(false)}
      />
    </AppChrome>
  );
}
