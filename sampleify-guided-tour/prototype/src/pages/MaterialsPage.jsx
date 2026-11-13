import { useEffect, useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import DataTable from '../components/DataTable';
import { FormElement, ToastNotification } from '../components/FormControls';
import Modal from '../components/Modal/Modal';
import NavSelector from '../components/NavSelector';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import { getMaterialBatchOptions } from '../data/materialBatches';

export const defaultMaterials = [
  {
    id: 'material-001',
    name: 'Sodium Hydroxide (NaOH)',
    classification: 'Chemicals',
    description: '5% concentrated solution used for pH adjustment and titration. Reorder when stock falls below 500 mL.',
    key: 'NaOH-5P',
    created: '02/01/2026',
    currentQuantity: 2500,
    minQuantity: 500,
    unit: 'mL',
  },
  {
    id: 'material-002',
    name: 'Sulphuric Acid (H₂SO₄)',
    classification: 'Chemicals',
    description: '0.02N standard solution for alkalinity titration per IS:3025. Store in acid cabinet away from bases.',
    key: 'H2SO4-02N',
    created: '05/01/2026',
    currentQuantity: 320,
    minQuantity: 500,
    unit: 'mL',
  },
  {
    id: 'material-003',
    name: 'EDTA Disodium Salt',
    classification: 'Chemicals',
    description: '0.01M solution for hardness determination. Prepare fresh monthly and store at room temperature.',
    key: 'EDTA-01M',
    created: '10/01/2026',
    currentQuantity: 1400,
    minQuantity: 300,
    unit: 'g',
  },
  {
    id: 'material-004',
    name: 'Potassium Permanganate (KMnO₄)',
    classification: 'Chemicals',
    description: 'Used for COD and oxidisability tests. Standardise against oxalic acid before each batch of tests.',
    key: 'KMnO4-STD',
    created: '12/01/2026',
    currentQuantity: 180,
    minQuantity: 250,
    unit: 'g',
  },
  {
    id: 'material-005',
    name: 'Eriochrome Black T Indicator',
    classification: 'Indicators',
    description: 'Powder indicator for total hardness titration. Keep dry and away from moisture. Replace if colour fades.',
    key: 'EBT-IND',
    created: '15/01/2026',
    currentQuantity: 75,
    minQuantity: 50,
    unit: 'g',
  },
  {
    id: 'material-006',
    name: 'Ammonium Buffer Solution (pH 10)',
    classification: 'Reagents',
    description: 'Buffer for hardness and calcium titrations. Prepared from NH₄Cl and NH₄OH. Check pH before use.',
    key: 'NH4-BUF',
    created: '18/01/2026',
    currentQuantity: 900,
    minQuantity: 1000,
    unit: 'mL',
  },
  {
    id: 'material-007',
    name: 'Phenolphthalein Indicator',
    classification: 'Indicators',
    description: '1% solution in ethanol. Used for P-alkalinity and CO₂ determination. Discard if solution turns pink at rest.',
    key: 'PHPH-1P',
    created: '20/01/2026',
    currentQuantity: 4,
    minQuantity: 2,
    unit: 'bottles',
  },
  {
    id: 'material-008',
    name: 'Methyl Orange Indicator',
    classification: 'Glassware',
    description: '0.05% aqueous solution for M-alkalinity and total alkalinity titrations. Stable for 6 months.',
    key: 'MO-005P',
    created: '22/01/2026',
    currentQuantity: 12,
    minQuantity: 6,
    unit: 'bottles',
  },
];

const initialDraft = {
  name: '',
  uniqueKey: '',
  unit: '',
  initialQuantity: '',
  minQuantity: '',
  description: '',
};

const unitOptions = ['Kgs', 'Grams', 'Litres', 'Millilitres', 'Units', 'Packets', 'Boxes'];
const transactionTypeOptions = [
  { key: 'in', label: 'In' },
  { key: 'out', label: 'Out' },
  { key: 'out-damaged', label: 'Out - Damaged' },
];
const batchDropdownOptions = getMaterialBatchOptions();
const initialTransactionDraft = {
  type: 'in',
  quantity: '',
  cost: '',
  supplier: '',
  batchSerialNumber: '',
  expiryDate: '',
  makeSupplier: '',
};

function findBatchOption(value) {
  return batchDropdownOptions.find((option) => option.value === value) ?? null;
}

function formatAvailableQuantity(batch, unit) {
  if (!batch) {
    return '-';
  }

  const amount = Number(batch.availableQuantity).toLocaleString('en-IN');
  return unit ? `${amount} ${unit}` : amount;
}

function formatDate(date = new Date()) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear());
  return `${day}/${month}/${year}`;
}

function MaterialsHeader({ onNewMaterial, onStockReport }) {
  return (
    <section className="bg-white border-bottom px-4 py-3">
      <div className="container-fluid px-0">
        <div className="row align-items-center justify-content-between gx-0 gy-3">
          <div className="col-auto">
            <h1 className="h5 mb-0 fw-semibold text-dark">Material Management</h1>
          </div>

          <div className="col-auto d-flex align-items-center gap-3">
            <SecondaryButton leftIcon="file-text" onClick={onStockReport}>
              Stock Report
            </SecondaryButton>
            <PrimaryButton leftIcon="plus" onClick={onNewMaterial}>
              New Material
            </PrimaryButton>
          </div>
        </div>
      </div>
    </section>
  );
}

function MaterialsFormModal({
  open,
  values,
  errors,
  onChange,
  onBlur,
  onCancel,
  onSubmit,
}) {
  if (!open) {
    return null;
  }

  return (
    <Modal
      open={open}
      title="New Material"
      titleId="materials-modal-title"
      titleIcon="materials"
      onClose={onCancel}
      size="md"
      actions={
        <>
          <SecondaryButton leftIcon="close" size="large" onClick={onCancel}>
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" form="materials-form" leftIcon="save">
            Save
          </PrimaryButton>
        </>
      }
    >
      <form
        id="materials-form"
        className="d-flex flex-column gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div>
          <FormElement
            type="text"
            mandatory
            label="Name"
            message={errors.name}
            messageTone="error"
            inputProps={{
              value: values.name,
              placeholder: 'eg.',
              onChange: (event) => onChange('name', event.target.value),
              onBlur: () => onBlur('name', values.name),
            }}
          />
        </div>

        <div className="row g-3">
          <div className="col-12 col-md-6">
            <FormElement
              type="text"
              mandatory
              label="Unique Key"
              message={errors.uniqueKey}
              messageTone="error"
              inputProps={{
                value: values.uniqueKey,
                placeholder: 'eg.',
                onChange: (event) => onChange('uniqueKey', event.target.value),
                onBlur: () => onBlur('uniqueKey', values.uniqueKey),
              }}
            />
          </div>

          <div className="col-12 col-md-6">
            <FormElement
              type="dropdown"
              mandatory
              label="Unit (UoM)"
              message={errors.unit}
              messageTone="error"
              inputProps={{
                value: values.unit,
                placeholder: 'Select a',
                options: unitOptions,
                onChange: (event) => onChange('unit', event.target.value),
                onBlur: () => onBlur('unit', values.unit),
              }}
            />
          </div>

          <div className="col-12 col-md-6">
            <FormElement
              type="text"
              mandatory
              label="Initial Quantity"
              message={errors.initialQuantity}
              messageTone="error"
              inputProps={{
                value: values.initialQuantity,
                placeholder: 'eg.',
                onChange: (event) => onChange('initialQuantity', event.target.value),
                onBlur: () => onBlur('initialQuantity', values.initialQuantity),
              }}
            />
          </div>

          <div className="col-12 col-md-6">
            <FormElement
              type="text"
              mandatory
              label="Min. Quantity"
              message={errors.minQuantity}
              messageTone="error"
              inputProps={{
                value: values.minQuantity,
                placeholder: 'eg.',
                onChange: (event) => onChange('minQuantity', event.target.value),
                onBlur: () => onBlur('minQuantity', values.minQuantity),
              }}
            />
          </div>
        </div>

        <div>
          <FormElement
            type="text"
            label="Description"
            inputProps={{
              value: values.description,
              placeholder: 'eg.',
              onChange: (event) => onChange('description', event.target.value),
            }}
          />
        </div>
      </form>
    </Modal>
  );
}

function MaterialTransactionModal({
  open,
  material,
  values,
  errors,
  onChange,
  onBlur,
  onCancel,
  onSubmit,
}) {
  if (!open || !material) {
    return null;
  }

  const isIn = values.type === 'in';
  const selectedBatch = isIn ? null : findBatchOption(values.batchSerialNumber);

  return (
    <Modal
      open={open}
      title={material.name}
      subtitle="New Transaction"
      titleId="materials-transaction-modal-title"
      titleIcon="arrows-exchange"
      onClose={onCancel}
      size="md"
      actions={
        <>
          <SecondaryButton
            leftIcon="close"
            size="large"
            onClick={onCancel}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" form="materials-transaction-form" leftIcon="save">
            Save
          </PrimaryButton>
        </>
      }
    >
      <form
        id="materials-transaction-form"
        className="d-flex flex-column gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div className="nav nav-pills p-1 bg-body-tertiary border rounded" role="tablist" aria-label="Transaction type">
          {transactionTypeOptions.map((option) => {
            const isActive = values.type === option.key;
            return (
              <NavSelector
                key={option.key}
                type="button"
                size="medium"
                role="tab"
                aria-selected={isActive}
                active={isActive}
                className="flex-fill"
                onClick={() => onChange('type', option.key)}
              >
                {option.label}
              </NavSelector>
            );
          })}
        </div>

        {isIn ? (
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <FormElement
                type="text"
                mandatory
                label="Quantity"
                message={errors.quantity}
                messageTone="error"
                inputProps={{
                  value: values.quantity,
                  placeholder: 'eg.',
                  onChange: (event) => onChange('quantity', event.target.value),
                  onBlur: () => onBlur('quantity', values.quantity),
                }}
              />
            </div>

            <div className="col-12 col-md-6">
              <FormElement
                type="text"
                mandatory
                label="Cost"
                message={errors.cost}
                messageTone="error"
                inputProps={{
                  value: values.cost,
                  placeholder: 'eg.',
                  onChange: (event) => onChange('cost', event.target.value),
                  onBlur: () => onBlur('cost', values.cost),
                }}
              />
            </div>

            <div className="col-12 col-md-6">
              <FormElement
                type="date"
                label="Expiry Date"
                inputProps={{
                  value: values.expiryDate,
                  placeholder: 'DD/MM/YYYY',
                  onChange: (event) => onChange('expiryDate', event.target.value),
                }}
              />
            </div>

            <div className="col-12 col-md-6">
              <FormElement
                type="text"
                mandatory
                label="Batch/Serial No."
                message={errors.batchSerialNumber}
                messageTone="error"
                inputProps={{
                  value: values.batchSerialNumber,
                  placeholder: 'eg.',
                  onChange: (event) => onChange('batchSerialNumber', event.target.value),
                  onBlur: () => onBlur('batchSerialNumber', values.batchSerialNumber),
                }}
              />
            </div>

            <div className="col-12">
              <FormElement
                type="text"
                label="Make/Supplier"
                inputProps={{
                  value: values.makeSupplier,
                  placeholder: 'eg.',
                  onChange: (event) => onChange('makeSupplier', event.target.value),
                }}
              />
            </div>
          </div>
        ) : (
          <div className="row g-3">
            <div className="col-12">
              <FormElement
                type="rich-dropdown"
                mandatory
                label="Batch/Serial No."
                message={errors.batchSerialNumber}
                messageTone="error"
                inputProps={{
                  value: values.batchSerialNumber,
                  placeholder: 'Select batch',
                  options: batchDropdownOptions,
                  onChange: (event) => onChange('batchSerialNumber', event.target.value),
                  onBlur: (event) => onBlur('batchSerialNumber', event?.target?.value ?? values.batchSerialNumber),
                }}
              />
            </div>

            {selectedBatch ? (
              <div className="col-12">
                <div className="rounded border bg-body-tertiary p-3">
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <div className="small text-secondary mb-1">Available quantity</div>
                      <div className="fw-medium text-dark">{formatAvailableQuantity(selectedBatch, material.unit)}</div>
                    </div>
                    <div className="col-12 col-md-6">
                      <div className="small text-secondary mb-1">Supplier</div>
                      <div className="fw-medium text-dark">{selectedBatch.supplier}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="col-12">
              <FormElement
                type="text"
                mandatory
                label="Quantity"
                message={errors.quantity}
                messageTone="error"
                inputProps={{
                  value: values.quantity,
                  placeholder: 'eg.',
                  onChange: (event) => onChange('quantity', event.target.value),
                  onBlur: () => onBlur('quantity', values.quantity),
                }}
              />
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}

export default function MaterialsPage({
  materials = defaultMaterials,
  onNewMaterial,
  onEditMaterial,
  onDeleteMaterial,
  onNewTransaction,
  onOpenMaterial,
  onStockReport,
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
}) {
  const [visibleMaterials, setVisibleMaterials] = useState(materials);
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState(initialDraft);
  const [errors, setErrors] = useState({});
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [transactionDraft, setTransactionDraft] = useState(initialTransactionDraft);
  const [transactionErrors, setTransactionErrors] = useState({});
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    setVisibleMaterials(materials);
  }, [materials]);

  useEffect(() => {
    if (!modalOpen) {
      setErrors({});
    }
  }, [modalOpen]);

  useEffect(() => {
    if (!transactionModalOpen) {
      setTransactionErrors({});
    }
  }, [transactionModalOpen]);

  const openModal = () => {
    setDraft(initialDraft);
    setErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setDraft(initialDraft);
    setErrors({});
  };

  const openTransactionModal = (material) => {
    setSelectedMaterial(material);
    setTransactionDraft(initialTransactionDraft);
    setTransactionErrors({});
    setTransactionModalOpen(true);
  };

  const closeTransactionModal = () => {
    setTransactionModalOpen(false);
    setSelectedMaterial(null);
    setTransactionDraft(initialTransactionDraft);
    setTransactionErrors({});
  };

  const updateDraft = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const updateTransactionDraft = (field, value) => {
    setTransactionDraft((current) => ({ ...current, [field]: value }));
  };

  const validateField = (field, value) => {
    const trimmedValue = String(value ?? '').trim();
    if (!trimmedValue) {
      switch (field) {
        case 'name':
          return 'Name is required.';
        case 'uniqueKey':
          return 'Unique key is required.';
        case 'unit':
          return 'Unit is required.';
        case 'initialQuantity':
          return 'Initial quantity is required.';
        case 'minQuantity':
          return 'Min. quantity is required.';
        default:
          return null;
      }
    }

    return null;
  };

  const handleBlur = (field, value) => {
    const nextError = validateField(field, value);
    setErrors((current) => ({ ...current, [field]: nextError }));
  };

  const validateTransactionField = (field, value) => {
    const trimmedValue = String(value ?? '').trim();
    if (!trimmedValue) {
      switch (field) {
        case 'quantity':
          return 'Quantity is required.';
        case 'cost':
          return 'Cost is required.';
        case 'supplier':
          return 'Supplier is required.';
        case 'batchSerialNumber':
          return 'Batch/Serial No. is required.';
        default:
          return null;
      }
    }

    return null;
  };

  const handleTransactionBlur = (field, value) => {
    const nextError = validateTransactionField(field, value);
    setTransactionErrors((current) => ({ ...current, [field]: nextError }));
  };

  const handleSubmit = () => {
    const nextErrors = {
      name: validateField('name', draft.name),
      uniqueKey: validateField('uniqueKey', draft.uniqueKey),
      unit: validateField('unit', draft.unit),
      initialQuantity: validateField('initialQuantity', draft.initialQuantity),
      minQuantity: validateField('minQuantity', draft.minQuantity),
    };

    setErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    const nextMaterial = {
      id: `material-${Date.now()}`,
      name: draft.name.trim(),
      classification: 'Chemicals',
      description: draft.description.trim() || 'Material description goes here',
      key: draft.uniqueKey.trim(),
      created: formatDate(),
      currentQuantity: Number(draft.initialQuantity) || 0,
      minQuantity: Number(draft.minQuantity) || 0,
      unit: draft.unit,
    };

    setVisibleMaterials((current) => [nextMaterial, ...current]);
    onNewMaterial?.(nextMaterial);
    closeModal();
    window.requestAnimationFrame(() => {
      setToastMessage(`New material added: "${nextMaterial.name}".`);
      setToastVisible(true);
      window.setTimeout(() => setToastVisible(false), 5000);
    });
  };

  const handleTransactionSubmit = () => {
    const isIn = transactionDraft.type === 'in';
    const selectedBatch = isIn ? null : findBatchOption(transactionDraft.batchSerialNumber);
    const nextErrors = {
      quantity: validateTransactionField('quantity', transactionDraft.quantity),
      cost: isIn ? validateTransactionField('cost', transactionDraft.cost) : null,
      supplier: null,
      batchSerialNumber: validateTransactionField('batchSerialNumber', transactionDraft.batchSerialNumber),
    };

    setTransactionErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean) || !selectedMaterial) {
      return;
    }

    onNewTransaction?.({
      materialId: selectedMaterial.id,
      materialName: selectedMaterial.name,
      transaction: {
        ...transactionDraft,
        quantity: transactionDraft.quantity.trim(),
        cost: isIn ? transactionDraft.cost.trim() : '',
        supplier: isIn ? transactionDraft.supplier : selectedBatch?.supplier ?? '',
        batchSerialNumber: transactionDraft.batchSerialNumber.trim(),
        makeSupplier: transactionDraft.makeSupplier.trim(),
      },
    });
    closeTransactionModal();
    window.requestAnimationFrame(() => {
      setToastMessage('Transaction added successfully.');
      setToastVisible(true);
      window.setTimeout(() => setToastVisible(false), 5000);
    });
  };

  return (
    <AppChrome
      activeNav="materials"
      onNavigate={onNavigate}
      breadcrumbs={[{ key: 'materials', label: 'Materials', current: true }]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      pageHeader={<MaterialsHeader onNewMaterial={openModal} onStockReport={onStockReport} />}
    >
      <main className="bg-body-tertiary p-4 min-vh-100">
        <div className="container-fluid px-0">
          <MaterialsFormModal
            open={modalOpen}
            values={draft}
            errors={errors}
            onChange={updateDraft}
            onBlur={handleBlur}
            onCancel={closeModal}
            onSubmit={handleSubmit}
          />
          <MaterialTransactionModal
            open={transactionModalOpen}
            material={selectedMaterial}
            values={transactionDraft}
            errors={transactionErrors}
            onChange={updateTransactionDraft}
            onBlur={handleTransactionBlur}
            onCancel={closeTransactionModal}
            onSubmit={handleTransactionSubmit}
          />
          <DataTable>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Classification</th>
                <th scope="col">Description</th>
                <th scope="col">Key</th>
                <th scope="col">Created</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {visibleMaterials.map((material) => (
                <tr key={material.id}>
                  <td>
                    <a
                      href="/"
                      className="smplfy-link link-primary p-0"
                      onClick={(event) => { event.preventDefault(); onOpenMaterial?.(material.id, material.name); }}
                    >
                      <span>{material.name}</span>
                    </a>
                  </td>
                  <td className="text-nowrap">
                    {material.classification}
                  </td>
                  <td>
                    {material.description}
                  </td>
                  <td className="text-nowrap">{material.key}</td>
                  <td className="text-nowrap">{material.created}</td>
                  <td className="text-nowrap">
                    <div className="d-flex align-items-center gap-2 flex-nowrap">
                      <SecondaryButton
                        size="medium"
                        leftIcon="edit"
                        onClick={() => onEditMaterial?.(material.id)}
                      >
                        Edit
                      </SecondaryButton>
                      <SecondaryButton
                        size="medium"
                        leftIcon="trash"
                        onClick={() => onDeleteMaterial?.(material.id)}
                      >
                        Delete
                      </SecondaryButton>
                      <PrimaryButton
                        size="medium"
                        leftIcon="plus"
                        onClick={() => openTransactionModal(material)}
                      >
                        New Transaction
                      </PrimaryButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        </div>
      </main>

      <ToastNotification
        state={toastVisible ? 'default' : 'gone'}
        message={toastMessage}
        className="position-fixed bottom-0 start-0 m-4"
        onClose={() => setToastVisible(false)}
      />
    </AppChrome>
  );
}
