import { useEffect, useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import { FormElement, ToastNotification } from '../components/FormControls';
import Modal from '../components/Modal/Modal';
import NavSelector from '../components/NavSelector';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import qrCode from '../../assets/qr.png';
import './material-details-page.css';

const mockRecords = [
  { id: 1, type: 'IN', quantity: '2500 mL', supplierBatch: 'Merck / B240301', transactionDate: '01/03/2026', expiryDate: '01/03/2028', cost: '₹ 480', by: 'Deepak Cybit' },
  { id: 2, type: 'OUT', quantity: '500 mL', supplierBatch: 'Merck / B240301', transactionDate: '10/03/2026', expiryDate: '-', cost: '-', by: 'Ravi Sharma' },
  { id: 3, type: 'OUT', quantity: '500 mL', supplierBatch: 'Merck / B240301', transactionDate: '18/03/2026', expiryDate: '-', cost: '-', by: 'Priya Nair' },
  { id: 4, type: 'IN', quantity: '5000 mL', supplierBatch: 'SD Fine / C240412', transactionDate: '01/04/2026', expiryDate: '01/04/2028', cost: '₹ 920', by: 'Deepak Cybit' },
  { id: 5, type: 'OUT', quantity: '1000 mL', supplierBatch: 'SD Fine / C240412', transactionDate: '05/04/2026', expiryDate: '-', cost: '-', by: 'Ravi Sharma' },
  { id: 6, type: 'OUT - Damaged', quantity: '250 mL', supplierBatch: 'SD Fine / C240412', transactionDate: '08/04/2026', expiryDate: '-', cost: '-', by: 'Priya Nair' },
  { id: 7, type: 'OUT', quantity: '750 mL', supplierBatch: 'SD Fine / C240412', transactionDate: '12/04/2026', expiryDate: '-', cost: '-', by: 'Ravi Sharma' },
];

const transactionTypeOptions = [
  { key: 'in', label: 'In' },
  { key: 'out', label: 'Out' },
  { key: 'out-damaged', label: 'Out - Damaged' },
];
const supplierOptions = ['Merck Life Science', 'SD Fine Chemicals', 'Loba Chemie', 'Rankem', 'Qualigens'];
const initialTransactionDraft = { type: 'in', quantity: '', cost: '', supplier: '', batchSerialNumber: '', expiryDate: '' };

function TransactionModal({ open, materialName, values, errors, onChange, onBlur, onCancel, onSubmit }) {
  if (!open) return null;
  const isIn = values.type === 'in';
  return (
    <Modal
      open={open}
      title={`New Transaction (${materialName})`}
      titleId="material-details-transaction-modal-title"
      titleIcon="refresh"
      onClose={onCancel}
      size="md"
      bodyClassName="materials-transaction-modal__body"
      actions={
        <>
          <SecondaryButton leftIcon="close" size="large" onClick={onCancel}>Cancel</SecondaryButton>
          <PrimaryButton type="submit" form="material-details-transaction-form" leftIcon="save">Save</PrimaryButton>
        </>
      }
    >
      <form
        id="material-details-transaction-form"
        className="materials-transaction-modal__form"
        onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
      >
        <div className="materials-transaction-modal__type-selector" role="tablist">
          {transactionTypeOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              role="tab"
              aria-selected={values.type === option.key}
              className={['materials-transaction-modal__type-option', values.type === option.key ? 'is-active' : ''].filter(Boolean).join(' ')}
              onClick={() => onChange('type', option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="materials-transaction-modal__grid">
          <div className="materials-transaction-modal__field">
            <FormElement type="text" mandatory label="Quantity" message={errors.quantity} messageTone="error"
              inputProps={{ value: values.quantity, placeholder: 'eg.', onChange: (e) => onChange('quantity', e.target.value), onBlur: () => onBlur('quantity', values.quantity) }} />
          </div>
          <div className="materials-transaction-modal__field">
            <FormElement type="text" mandatory label="Cost" message={errors.cost} messageTone="error"
              inputProps={{ value: values.cost, placeholder: 'eg.', onChange: (e) => onChange('cost', e.target.value), onBlur: () => onBlur('cost', values.cost) }} />
          </div>
          {isIn ? (
            <div className="materials-transaction-modal__field">
              <FormElement type="date" label="Expiry Date"
                inputProps={{ value: values.expiryDate, placeholder: 'DD/MM/YYYY', onChange: (e) => onChange('expiryDate', e.target.value) }} />
            </div>
          ) : (
            <div className="materials-transaction-modal__field">
              <FormElement type="dropdown" mandatory label="Supplier" message={errors.supplier} messageTone="error"
                inputProps={{ value: values.supplier, placeholder: 'Select a supplier', options: supplierOptions, onChange: (e) => onChange('supplier', e.target.value), onBlur: () => onBlur('supplier', values.supplier) }} />
            </div>
          )}
          <div className="materials-transaction-modal__field">
            <FormElement type="text" mandatory label="Batch/Serial No." message={errors.batchSerialNumber} messageTone="error"
              inputProps={{ value: values.batchSerialNumber, placeholder: 'eg.', onChange: (e) => onChange('batchSerialNumber', e.target.value), onBlur: () => onBlur('batchSerialNumber', values.batchSerialNumber) }} />
          </div>
        </div>
      </form>
    </Modal>
  );
}

function MaterialDetailsHeader({ materialName, onBack, onNewTransaction }) {
  return (
    <section className="material-details-page-header">
      <div className="container-fluid h-100 px-0">
        <div className="row h-100 align-items-center justify-content-between gx-0">
          <div className="col-auto d-flex align-items-center gap-3">
            <SecondaryButton
              leftIcon="chevron-left"
              className="material-details-back"
              onClick={onBack}
              aria-label="Go back"
            />
            <h1 className="material-details-page-header__title">{materialName}</h1>
          </div>
          <div className="col-auto">
            <PrimaryButton leftIcon="plus" onClick={onNewTransaction}>
              New Transaction
            </PrimaryButton>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatBlock({ value, unit, label }) {
  return (
    <div className="material-details-stat">
      <div className="material-details-stat__value-row">
        <span className="material-details-stat__value">{value}</span>
        <span className="material-details-stat__unit">{unit}</span>
      </div>
      <span className="material-details-stat__label">{label}</span>
    </div>
  );
}

export default function MaterialDetailsPage({
  materialId = 'material-001',
  materialName = 'Sodium Hydroxide (NaOH)',
  uniqueKey = 'NaOH-5P',
  description = '5% concentrated solution used for pH adjustment and titration. Reorder when stock falls below 500 mL.',
  currentQty = 2500,
  minQty = 500,
  unit = 'mL',
  records = mockRecords,
  initialToast = null,
  onBack,
  onTransactionComplete,
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
}) {
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [transactionDraft, setTransactionDraft] = useState(initialTransactionDraft);
  const [transactionErrors, setTransactionErrors] = useState({});
  const [activeTab, setActiveTab] = useState('all');

  const tabFilterMap = { all: null, in: 'IN', out: 'OUT', 'out-damaged': 'OUT - Damaged' };
  const filteredRecords = tabFilterMap[activeTab]
    ? records.filter((r) => r.type.toUpperCase() === tabFilterMap[activeTab].toUpperCase())
    : records;

  const tabs = [
    { key: 'all', label: 'All Transactions' },
    { key: 'in', label: 'In' },
    { key: 'out', label: 'Out' },
    { key: 'out-damaged', label: 'Out - Damaged' },
  ];

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

  const handleTransactionBlur = (field, value) => {
    if (!value?.trim()) {
      setTransactionErrors((c) => ({ ...c, [field]: `${field} is required.` }));
    }
  };

  const handleTransactionSubmit = () => {
    const isIn = transactionDraft.type === 'in';
    const nextErrors = {
      quantity: transactionDraft.quantity.trim() ? null : 'Quantity is required.',
      cost: transactionDraft.cost.trim() ? null : 'Cost is required.',
      ...(!isIn && { supplier: transactionDraft.supplier ? null : 'Supplier is required.' }),
      batchSerialNumber: transactionDraft.batchSerialNumber.trim() ? null : 'Batch/Serial No. is required.',
    };

    setTransactionErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setTransactionModalOpen(false);
    setTransactionDraft(initialTransactionDraft);
    onTransactionComplete?.();
  };

  return (
    <AppChrome
      activeNav="materials"
      onNavigate={onNavigate}
      breadcrumbs={[
        { key: 'materials', label: 'Materials' },
        { key: 'material-details', label: materialName, current: true },
      ]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      pageHeader={
        <MaterialDetailsHeader
          materialName={materialName}
          onBack={onBack}
          onNewTransaction={() => setTransactionModalOpen(true)}
        />
      }
    >
      <main className="material-details-page">
        <div className="container-fluid px-0 d-flex flex-column" style={{ gap: '16px' }}>

          <div className="material-details-summary">
            <div className="material-details-info-card">
              <div className="material-details-info-card__content">
                <h2 className="material-details-info-card__title">{materialName}</h2>
                <div className="material-details-info-card__key-row">
                  <span className="material-details-meta-label">Unique Key:</span>
                  <span className="material-details-meta-value">{uniqueKey}</span>
                </div>
                <p className="material-details-info-card__description">{description}</p>
              </div>
              <div className="material-details-info-card__stats">
                <StatBlock value={currentQty} unit={unit} label="Current Quantity" />
                <StatBlock value={minQty} unit={unit} label="Min Quantity" />
              </div>
            </div>

            <div className="material-details-qr-card">
              <img src={qrCode} alt="QR Code" width={120} height={120} />
            </div>
          </div>

          <div className="material-details-records-card">
            <div className="material-details-tabs">
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

            <div className="material-details-records-header">
              <span className="material-details-records-count">{filteredRecords.length} Transactions</span>
            </div>

            <div className="material-details-table-wrapper">
              <div className="material-details-table">
                <div className="material-details-table__head">
                  <span>Sr.</span>
                  <span>Type</span>
                  <span>Quantity</span>
                  <span>Supplier/Batch</span>
                  <span>Transaction Date</span>
                  <span>Expiry Date</span>
                  <span>Cost(s)</span>
                  <span>By</span>
                </div>
                <div className="material-details-table__body">
                  {filteredRecords.map((record, index) => (
                    <div className="material-details-table__row" key={record.id}>
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

      <TransactionModal
        open={transactionModalOpen}
        materialName={materialName}
        values={transactionDraft}
        errors={transactionErrors}
        onChange={(field, value) => setTransactionDraft((c) => ({ ...c, [field]: value }))}
        onBlur={handleTransactionBlur}
        onCancel={() => { setTransactionModalOpen(false); setTransactionDraft(initialTransactionDraft); setTransactionErrors({}); }}
        onSubmit={handleTransactionSubmit}
      />

      <ToastNotification
        state={toastVisible ? 'default' : 'gone'}
        message={toastMessage}
        className="material-created-toast"
        onClose={() => setToastVisible(false)}
      />
    </AppChrome>
  );
}
