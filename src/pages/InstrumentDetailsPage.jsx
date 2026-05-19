import { useEffect, useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import DataTable from '../components/DataTable';
import MoreActionButton from '../components/MoreActionButton';
import NavSelector from '../components/NavSelector';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import { FormElement, ToastNotification } from '../components/FormControls';
import Modal from '../components/Modal/Modal';
import qrCode from '../../assets/qr.png';
import './instrument-details-page.scss';

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
        className="d-flex flex-column gap-3"
        onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
      >
        <div className="row g-3">
          <div className="col-12">
            <div className="d-inline-flex align-items-center gap-1 mb-2">
              <span className="form-label mb-0">Type of Service</span>
              <span className="text-danger">*</span>
            </div>

            <div className="nav nav-pills p-1 bg-body-tertiary border rounded" role="tablist" aria-label="Type of Service">
              {serviceTypeOptions.map((option) => {
                const isActive = draft.serviceType === option;

                return (
                  <NavSelector
                    key={option}
                    type="button"
                    size="medium"
                    active={isActive}
                    className="flex-fill"
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
          <div className="col-12 col-md-6">
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
          <div className="col-12 col-md-6">
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
          <div className="col-12 col-md-6">
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
    <section className="bg-white border-bottom px-4 py-3">
      <div className="container-fluid px-0">
        <div className="row align-items-center justify-content-between gx-0 gy-3">
          <div className="col-auto d-flex align-items-center gap-3">
            <SecondaryButton
              leftIcon="chevron-left"
              onClick={onBack}
              aria-label="Go back"
            />
            <h1 className="h5 mb-0 fw-semibold text-dark">{instrumentName}</h1>
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
      <main className="smplfy-instrument-details-page bg-body-tertiary p-4 min-vh-100">
        <div className="container-fluid px-0 d-flex flex-column gap-3">
          <div className="row g-3 align-items-stretch">
            <div className="col-12 col-xl">
              <div className="smplfy-card card h-100">
                <div className="card-body row g-4 align-items-center">
                  <div className="col-12 col-lg-7">
                    <h2 className="fs-2 fw-normal lh-sm mb-2 text-dark">{instrumentName}</h2>
                    <p className="mb-0 text-secondary">{description}</p>
                  </div>
                  <div className="col-12 col-lg-5 d-flex flex-column gap-2">
                    <div className="d-flex align-items-center gap-2">
                      <span className="text-secondary">Make:</span>
                      <span className="fw-bold text-secondary">{make}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span className="text-secondary">Unique Key:</span>
                      <span className="fw-bold text-secondary">{uniqueKey}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span className="text-secondary">Model No:</span>
                      <span className="fw-bold text-secondary">{modelNo}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span className="text-secondary">Serial No:</span>
                      <span className="fw-bold text-secondary">{serialNo}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-xl-auto">
              <div className="smplfy-card card h-100">
                <div className="card-body d-flex align-items-center justify-content-center">
                  <img src={qrCode} alt="QR Code" width={120} height={120} />
                </div>
              </div>
            </div>
          </div>

          <div className="smplfy-card card overflow-hidden">
            <div className="card-header bg-transparent p-0">
              <div className="nav nav-tabs px-4 border-0">
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
            </div>

            <div className="card-body">
              <div className="fw-medium text-dark mb-3">{records.length} Records</div>
              <DataTable>
                <thead>
                  <tr>
                    <th scope="col">Sr</th>
                    <th scope="col">Type</th>
                    <th scope="col">Quantity</th>
                    <th scope="col">Supplier/Batch</th>
                    <th scope="col">Transaction Date</th>
                    <th scope="col">Expiry Date</th>
                    <th scope="col">Cost(s)</th>
                    <th scope="col">By</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record, index) => (
                    <tr key={record.id}>
                      <td>{index + 1}</td>
                      <td>{record.type}</td>
                      <td>{record.quantity}</td>
                      <td>{record.supplierBatch}</td>
                      <td>{record.transactionDate}</td>
                      <td>{record.expiryDate}</td>
                      <td>{record.cost}</td>
                      <td>{record.by}</td>
                    </tr>
                  ))}
                </tbody>
              </DataTable>
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
        className="position-fixed bottom-0 start-0 m-4"
        onClose={() => setToastVisible(false)}
      />
    </AppChrome>
  );
}
