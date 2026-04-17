import { useEffect, useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import { FormElement, ToastNotification } from '../components/FormControls';
import Modal from '../components/Modal/Modal';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import './materials-page.css';

const defaultMaterials = [
  {
    id: 'material-001',
    name: 'Sodium Hydroxide (NaOH)',
    description: '5% concentrated solution used for pH adjustment and titration. Reorder when stock falls below 500 mL.',
    key: 'NaOH-5P',
    created: '02/01/2026',
  },
  {
    id: 'material-002',
    name: 'Sulphuric Acid (H₂SO₄)',
    description: '0.02N standard solution for alkalinity titration per IS:3025. Store in acid cabinet away from bases.',
    key: 'H2SO4-02N',
    created: '05/01/2026',
  },
  {
    id: 'material-003',
    name: 'EDTA Disodium Salt',
    description: '0.01M solution for hardness determination. Prepare fresh monthly and store at room temperature.',
    key: 'EDTA-01M',
    created: '10/01/2026',
  },
  {
    id: 'material-004',
    name: 'Potassium Permanganate (KMnO₄)',
    description: 'Used for COD and oxidisability tests. Standardise against oxalic acid before each batch of tests.',
    key: 'KMnO4-STD',
    created: '12/01/2026',
  },
  {
    id: 'material-005',
    name: 'Eriochrome Black T Indicator',
    description: 'Powder indicator for total hardness titration. Keep dry and away from moisture. Replace if colour fades.',
    key: 'EBT-IND',
    created: '15/01/2026',
  },
  {
    id: 'material-006',
    name: 'Ammonium Buffer Solution (pH 10)',
    description: 'Buffer for hardness and calcium titrations. Prepared from NH₄Cl and NH₄OH. Check pH before use.',
    key: 'NH4-BUF',
    created: '18/01/2026',
  },
  {
    id: 'material-007',
    name: 'Phenolphthalein Indicator',
    description: '1% solution in ethanol. Used for P-alkalinity and CO₂ determination. Discard if solution turns pink at rest.',
    key: 'PHPH-1P',
    created: '20/01/2026',
  },
  {
    id: 'material-008',
    name: 'Methyl Orange Indicator',
    description: '0.05% aqueous solution for M-alkalinity and total alkalinity titrations. Stable for 6 months.',
    key: 'MO-005P',
    created: '22/01/2026',
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
const supplierOptions = ['Merck Life Science', 'SD Fine Chemicals', 'Loba Chemie', 'Rankem', 'Qualigens'];
const initialTransactionDraft = {
  type: 'in',
  quantity: '',
  cost: '',
  supplier: '',
  batchSerialNumber: '',
  expiryDate: '',
};

function formatDate(date = new Date()) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear());
  return `${day}/${month}/${year}`;
}

function MaterialsHeader({ onNewMaterial }) {
  return (
    <section className="materials-page-header">
      <div className="container-fluid h-100 px-0">
        <div className="row h-100 align-items-center justify-content-between gx-0">
          <div className="col-auto">
            <h1 className="materials-page-header__title">Material Management</h1>
          </div>

          <div className="col-auto">
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
      bodyClassName="materials-modal__body"
      actionsClassName="materials-modal__actions"
      actions={
        <>
          <SecondaryButton leftIcon="close" size="large" className="materials-modal__cancel" onClick={onCancel}>
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
        className="materials-modal__form"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div className="materials-modal__field materials-modal__field--full">
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

        <div className="materials-modal__grid">
          <div className="materials-modal__field">
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

          <div className="materials-modal__field">
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

          <div className="materials-modal__field">
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

          <div className="materials-modal__field">
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

        <div className="materials-modal__field materials-modal__field--full">
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

  return (
    <Modal
      open={open}
      title={`New Transaction (${material.name})`}
      titleId="materials-transaction-modal-title"
      titleIcon="refresh"
      onClose={onCancel}
      size="md"
      bodyClassName="materials-transaction-modal__body"
      actions={
        <>
          <SecondaryButton
            leftIcon="close"
            size="large"
            className="materials-transaction-modal__cancel"
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
        className="materials-transaction-modal__form"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div className="materials-transaction-modal__type-selector" role="tablist" aria-label="Transaction type">
          {transactionTypeOptions.map((option) => {
            const isActive = values.type === option.key;
            return (
              <button
                key={option.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={['materials-transaction-modal__type-option', isActive ? 'is-active' : ''].filter(Boolean).join(' ')}
                onClick={() => onChange('type', option.key)}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="materials-transaction-modal__grid">
          <div className="materials-transaction-modal__field">
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

          <div className="materials-transaction-modal__field">
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

          {isIn ? (
            <div className="materials-transaction-modal__field">
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
          ) : (
            <div className="materials-transaction-modal__field">
              <FormElement
                type="dropdown"
                mandatory
                label="Supplier"
                message={errors.supplier}
                messageTone="error"
                inputProps={{
                  value: values.supplier,
                  placeholder: 'Select a supplier',
                  options: supplierOptions,
                  onChange: (event) => onChange('supplier', event.target.value),
                  onBlur: () => onBlur('supplier', values.supplier),
                }}
              />
            </div>
          )}

          <div className="materials-transaction-modal__field">
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
        </div>
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
      description: draft.description.trim() || 'Material description goes here',
      key: draft.uniqueKey.trim(),
      created: formatDate(),
    };

    setVisibleMaterials((current) => [nextMaterial, ...current]);
    onNewMaterial?.(nextMaterial);
    closeModal();
  };

  const handleTransactionSubmit = () => {
    const isIn = transactionDraft.type === 'in';
    const nextErrors = {
      quantity: validateTransactionField('quantity', transactionDraft.quantity),
      cost: validateTransactionField('cost', transactionDraft.cost),
      supplier: isIn ? null : validateTransactionField('supplier', transactionDraft.supplier),
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
        cost: transactionDraft.cost.trim(),
        supplier: transactionDraft.supplier,
        batchSerialNumber: transactionDraft.batchSerialNumber.trim(),
      },
    });
    closeTransactionModal();
    window.requestAnimationFrame(() => {
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
      pageHeader={<MaterialsHeader onNewMaterial={openModal} />}
    >
      <main className="materials-page">
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
          <section className="materials-listing">
            <div className="materials-listing__legend materials-listing__grid">
              <div className="materials-listing__cell materials-listing__cell--name">Name</div>
              <div className="materials-listing__cell materials-listing__cell--description">Description</div>
              <div className="materials-listing__cell materials-listing__cell--key">Key</div>
              <div className="materials-listing__cell materials-listing__cell--created">Created</div>
              <div className="materials-listing__cell materials-listing__cell--actions">Action</div>
            </div>

            <div className="materials-listing__rows">
              {visibleMaterials.map((material) => (
                <article className="materials-listing__row materials-listing__grid" key={material.id}>
                  <div className="materials-listing__cell materials-listing__cell--name">
                    <a
                      href="/"
                      className="materials-listing__link"
                      onClick={(event) => { event.preventDefault(); onOpenMaterial?.(material.id, material.name); }}
                    >
                      {material.name}
                    </a>
                  </div>
                  <div className="materials-listing__cell materials-listing__cell--description">
                    {material.description}
                  </div>
                  <div className="materials-listing__cell materials-listing__cell--key">{material.key}</div>
                  <div className="materials-listing__cell materials-listing__cell--created">{material.created}</div>
                  <div className="materials-listing__cell materials-listing__cell--actions materials-listing__actions">
                    <SecondaryButton
                      size="medium"
                      leftIcon="edit"
                      className="materials-listing__action-button"
                      onClick={() => onEditMaterial?.(material.id)}
                    >
                      Edit
                    </SecondaryButton>
                    <SecondaryButton
                      size="medium"
                      leftIcon="trash"
                      className="materials-listing__action-button"
                      onClick={() => onDeleteMaterial?.(material.id)}
                    >
                      Delete
                    </SecondaryButton>
                    <PrimaryButton
                      size="medium"
                      className="materials-listing__action-button materials-listing__action-button--primary"
                      leftIcon="plus"
                      onClick={() => openTransactionModal(material)}
                    >
                      New Transaction
                    </PrimaryButton>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>

      <ToastNotification
        state={toastVisible ? 'default' : 'gone'}
        message="Transaction added successfully."
        className="material-created-toast"
        onClose={() => setToastVisible(false)}
      />
    </AppChrome>
  );
}
