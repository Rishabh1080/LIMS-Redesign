import { useEffect, useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import DataTable from '../components/DataTable';
import { FormElement, ToastNotification } from '../components/FormControls';
import Modal from '../components/Modal/Modal';
import NavSelector from '../components/NavSelector';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import qrCode from '../../assets/qr.png';
import './material-details-page.scss';

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
      actions={
        <>
          <SecondaryButton leftIcon="close" size="large" onClick={onCancel}>Cancel</SecondaryButton>
          <PrimaryButton type="submit" form="material-details-transaction-form" leftIcon="save">Save</PrimaryButton>
        </>
      }
    >
      <form
        id="material-details-transaction-form"
        className="d-flex flex-column gap-3"
        onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
      >
        <div className="nav nav-pills p-1 bg-body-tertiary border rounded" role="tablist" aria-label="Transaction type">
          {transactionTypeOptions.map((option) => (
            <NavSelector
              key={option.key}
              type="button"
              size="medium"
              role="tab"
              aria-selected={values.type === option.key}
              active={values.type === option.key}
              className="flex-fill"
              onClick={() => onChange('type', option.key)}
            >
              {option.label}
            </NavSelector>
          ))}
        </div>
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <FormElement type="text" mandatory label="Quantity" message={errors.quantity} messageTone="error"
              inputProps={{ value: values.quantity, placeholder: 'eg.', onChange: (e) => onChange('quantity', e.target.value), onBlur: () => onBlur('quantity', values.quantity) }} />
          </div>
          <div className="col-12 col-md-6">
            <FormElement type="text" mandatory label="Cost" message={errors.cost} messageTone="error"
              inputProps={{ value: values.cost, placeholder: 'eg.', onChange: (e) => onChange('cost', e.target.value), onBlur: () => onBlur('cost', values.cost) }} />
          </div>
          {isIn ? (
            <div className="col-12 col-md-6">
              <FormElement type="date" label="Expiry Date"
                inputProps={{ value: values.expiryDate, placeholder: 'DD/MM/YYYY', onChange: (e) => onChange('expiryDate', e.target.value) }} />
            </div>
          ) : (
            <div className="col-12 col-md-6">
              <FormElement type="dropdown" mandatory label="Supplier" message={errors.supplier} messageTone="error"
                inputProps={{ value: values.supplier, placeholder: 'Select a supplier', options: supplierOptions, onChange: (e) => onChange('supplier', e.target.value), onBlur: () => onBlur('supplier', values.supplier) }} />
            </div>
          )}
          <div className="col-12 col-md-6">
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
    <section className="bg-white border-bottom px-4 py-3">
      <div className="container-fluid px-0">
        <div className="row align-items-center justify-content-between gx-0 gy-3">
          <div className="col-auto d-flex align-items-center gap-3">
            <SecondaryButton
              leftIcon="chevron-left"
              onClick={onBack}
              aria-label="Go back"
            />
            <h1 className="h5 mb-0 fw-semibold text-dark">{materialName}</h1>
          </div>
          <div className="col-auto d-flex align-items-center gap-3">
            <SecondaryButton leftIcon="printer">
              Print QR
            </SecondaryButton>
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
    <div className="d-flex flex-column align-items-start gap-1">
      <div className="d-flex align-items-end gap-2 py-2">
        <span className="display-5 lh-1 mb-0 fw-normal text-dark">{value}</span>
        <span className="small text-secondary pb-1">{unit}</span>
      </div>
      <span className="small text-secondary">{label}</span>
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
      <main className="smplfy-material-details-page bg-body-tertiary p-4 min-vh-100">
        <div className="container-fluid px-0 d-flex flex-column gap-3">

          <div className="row g-2 align-items-stretch">
            <div className="col-12 col-xl">
              <div className="smplfy-card card h-100">
                <div className="card-body row g-0 align-items-center">
                  <div className="col-12 col-lg-6 px-3">
                    <h2 className="fs-2 fw-normal lh-sm mb-2 text-dark">{materialName}</h2>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className="text-secondary">Unique Key:</span>
                      <span className="fw-bold text-secondary">{uniqueKey}</span>
                    </div>
                    <p className="mb-0 text-secondary">{description}</p>
                  </div>
                  <div className="col-12 col-lg-6 d-flex align-items-center justify-content-around gap-3 flex-wrap">
                    <StatBlock value={currentQty} unit={unit} label="Current Quantity" />
                    <StatBlock value={minQty} unit={unit} label="Min Quantity" />
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
              <div className="fw-medium text-dark mb-3">{filteredRecords.length} Transactions</div>
              <DataTable>
                <thead>
                  <tr>
                    <th scope="col">Sr.</th>
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
                  {filteredRecords.map((record, index) => (
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
        className="position-fixed bottom-0 start-0 m-4"
        onClose={() => setToastVisible(false)}
      />
    </AppChrome>
  );
}
