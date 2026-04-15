import { useEffect, useState } from 'react';
import AppIcon from '../components/AppIcon';
import Checkbox from '../components/Checkbox/Checkbox';
import { FormElement } from '../components/FormControls';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import Stepper from '../components/Stepper/Stepper';
import './new-sample-customer-details.css';

const wizardSteps = [
  'Customer Details',
  'Basic Details',
  'Product Details',
  'Additional Details',
];

const basicDetailsRows = [
  ['Sampling Plan & Procedure', 'eg. Carpet Static Loading Machine'],
  ['Sample Creation Date & Time', '11:23 AM 19 March 2026', 'calendar'],
  ['Representative', 'Consumer Sample', 'chevron-down'],
  ['Statement of Conformity', 'Yes', 'chevron-down'],
  ['Receipt Mode', 'Select a', 'chevron-down'],
  ['Nature of Sample', 'Select a', 'chevron-down'],
  ['Brand Name', 'Select a', 'chevron-down'],
  ['Packaging Condition', 'Select a', 'chevron-down'],
];

const additionalDetailsRows = [
  ['Mode of Sample Receipt', 'Consumer Sample', 'chevron-down'],
  ['Tentative Reporting Date', 'Select date', 'calendar'],
  ['Amount (Inc. of all taxes)', 'Total amounts'],
  ['Received By', 'Select a user', 'chevron-down'],
];

const parameterRows = [
  {
    parameter: 'Bursting Strength',
    method: 'IS 1963',
    size: '12 g',
    charges: '250',
    time: '5 days',
  },
  {
    parameter: 'Colour Fastness',
    method: 'AATCC 61',
    size: '10 g',
    charges: '300',
    time: '3 days',
  },
  {
    parameter: 'Abrasion Resistance',
    method: 'ISO 12947',
    size: '14 g',
    charges: '450',
    time: '7 days',
  },
];

const stepFields = [
  [
    { key: 'sampleType', label: 'Sample Type', type: 'dropdown', mandatory: true, placeholder: 'Select sample type' },
    { key: 'receivingDate', label: 'Receiving Date', type: 'date', mandatory: true, placeholder: 'Select date' },
    {
      key: 'customer',
      label: 'Customer',
      type: 'dropdown',
      mandatory: true,
      placeholder: 'Select a Customer or create new',
    },
    { key: 'customerAddress', label: 'Customer Address', type: 'text', mandatory: true, placeholder: '' },
  ],
  basicDetailsRows.map(([label, placeholder, icon], index) => ({
    key: `basic-${index}`,
    label,
    type: icon === 'calendar' ? 'date' : icon === 'chevron-down' ? 'dropdown' : 'text',
    mandatory: false,
    placeholder,
  })),
  [
    { key: 'category', label: 'Category', type: 'dropdown', mandatory: true, placeholder: 'Select sample category' },
    { key: 'product', label: 'Product', type: 'dropdown', mandatory: true, placeholder: 'Select product' },
    { key: 'description', label: 'Description', type: 'text', mandatory: false, placeholder: 'Sample Description' },
    { key: 'quantity', label: 'Quantity', type: 'text', mandatory: true, placeholder: '0' },
    {
      key: 'sampleSize',
      label: 'Sample Size',
      type: 'split',
      mandatory: true,
      placeholder: 'Value',
      unitPlaceholder: 'Unit',
    },
    { key: 'quality', label: 'Quality', type: 'text', mandatory: false, placeholder: 'Quality of sample' },
    {
      key: 'identificationMark',
      label: 'Identification Mark',
      type: 'text',
      mandatory: false,
      placeholder: 'if any',
    },
    { key: 'condition', label: 'Condition', type: 'text', mandatory: false, placeholder: 'eg. good, fair' },
    { key: 'imageUpload', label: 'Image Upload', type: 'text', mandatory: false, placeholder: 'if any' },
  ],
  additionalDetailsRows.map(([label, placeholder, icon], index) => ({
    key: `additional-${index}`,
    label,
    type: icon === 'calendar' ? 'date' : icon === 'chevron-down' ? 'dropdown' : 'text',
    mandatory: false,
    placeholder,
  })),
];

const initialFormValues = {
  sampleType: 'Consumer Sample',
  receivingDate: '19 March 2026',
  customer: '',
  customerAddress: '',
  category: '',
  product: '',
  description: '',
  quantity: '',
  sampleSize: { value: '', unit: '' },
  quality: '',
  identificationMark: '',
  condition: '',
  imageUpload: '',
  'basic-0': '',
  'basic-1': '',
  'basic-2': '',
  'basic-3': '',
  'basic-4': '',
  'basic-5': '',
  'basic-6': '',
  'basic-7': '',
  'additional-0': '',
  'additional-1': '',
  'additional-2': '',
  'additional-3': '',
};

function getSampleDisplayName(sample) {
  return sample?.id || 'New Sample';
}

function getSampleType(sample) {
  if (sample?.extraMetaFields?.[0]?.value) {
    return sample.extraMetaFields[0].value;
  }

  switch (sample?.category) {
    case 'iqc-samples':
      return 'IQC Sample';
    case 'ilc-samples':
      return 'ILC Sample';
    case 'pt-samples':
      return 'PT Sample';
    case 'amendment-samples':
      return 'Amendment Sample';
    case 'complaint':
      return 'Complaint Sample';
    default:
      return 'Consumer Sample';
  }
}

function buildEditFormValues(sample) {
  if (!sample) {
    return initialFormValues;
  }

  const receivingDate = String(sample.createdOn ?? '').split(',')[0]?.trim() || initialFormValues.receivingDate;
  const reportingDate = String(sample.reportingDate ?? '').split(',')[0]?.trim() || '28/02/2026';

  return {
    ...initialFormValues,
    sampleType: getSampleType(sample),
    receivingDate,
    customer: sample.representative ?? 'Anita Desai',
    customerAddress: `${sample.representative ?? 'Customer'} Address`,
    category: getSampleType(sample),
    product: sample.reference ?? sample.id ?? 'Sample Product',
    description: `Sample ${sample.id ?? ''}`.trim(),
    quantity: '1',
    sampleSize: { value: '200', unit: 'g' },
    quality: 'Standard',
    identificationMark: sample.id ?? '',
    condition: 'Good',
    imageUpload: 'sample-image.jpg',
    'basic-0': 'Standard Sampling Plan',
    'basic-1': sample.createdOn ?? '11:23 AM 19 March 2026',
    'basic-2': sample.representative ?? 'Consumer Sample',
    'basic-3': 'Yes',
    'basic-4': sample.requestMode ?? 'Online',
    'basic-5': 'Routine',
    'basic-6': sample.reference ?? 'Brand A',
    'basic-7': 'Good',
    'additional-0': sample.requestMode ?? 'Online',
    'additional-1': reportingDate,
    'additional-2': '2500',
    'additional-3': 'Front Desk',
  };
}

function buildParameterFormRows(mode) {
  const checked = mode === 'edit';

  return parameterRows.map((row) => ({
    ...row,
    checked,
  }));
}

function isFilledValue(type, value) {
  if (type === 'split') {
    return Boolean(value?.value?.toString().trim()) && Boolean(value?.unit?.toString().trim());
  }

  return Boolean(value?.toString().trim());
}

function getFieldState(type, value, hasError) {
  if (hasError) {
    return 'error';
  }

  return isFilledValue(type, value) ? 'filled' : 'default';
}

function getFieldInputProps(field, formValues, onFieldChange, hasError) {
  const value = formValues[field.key];
  const baseState = getFieldState(field.type, value, hasError);

  if (field.type === 'split') {
    return {
      state: baseState,
      value: value?.value ?? '',
      unit: value?.unit ?? '',
      placeholder: field.placeholder,
      unitPlaceholder: field.unitPlaceholder,
      onChange: (event) =>
        onFieldChange(field.key, {
          value: event.target.value,
          unit: event.target.unit,
        }),
    };
  }

  return {
    state: baseState,
    value: value ?? '',
    placeholder: field.placeholder,
    onChange: (event) => onFieldChange(field.key, event.target.value),
  };
}

function StepRail({ currentStep, title, mode, onStepChange }) {
  const items = wizardSteps.map((label, index) => ({
    label,
    state: mode === 'edit'
      ? 'completed'
      : index < currentStep
        ? 'completed'
        : index === currentStep
          ? 'active'
          : 'default',
  }));

  return (
    <aside className={`new-sample-rail ${mode === 'edit' ? 'new-sample-rail--edit' : ''}`.trim()}>
      <div className={`new-sample-rail__heading ${mode === 'edit' ? 'new-sample-rail__heading--edit' : ''}`.trim()}>
        <h1 className="new-sample-rail__title">{title}</h1>
      </div>
      <Stepper items={items} onItemClick={onStepChange} />
    </aside>
  );
}

function TopBar({ parentLabel, currentLabel, onBack }) {
  return (
    <header className="new-sample-topbar">
      <div className="new-sample-topbar__breadcrumbs">
        <button
          className="new-sample-topbar__crumb new-sample-topbar__crumb-button is-home"
          aria-label={`Go to ${parentLabel}`}
          onClick={onBack}
        >
          <AppIcon name="home" />
        </button>
        <AppIcon name="chevron-right" />
        <button className="new-sample-topbar__crumb new-sample-topbar__crumb-button" onClick={onBack}>
          {parentLabel}
        </button>
        <AppIcon name="chevron-right" />
        <span className="new-sample-topbar__crumb is-current">{currentLabel}</span>
      </div>

      <div className="new-sample-topbar__actions">
        <div className="new-sample-topbar__pill">
          <AppIcon name="activity" />
          <span>No Active Alerts</span>
        </div>
        <button className="new-sample-topbar__chip btn smplfy-secondary-button smplfy-secondary-button--large smplfy-secondary-button--tone-neutral smplfy-secondary-button--has-left-icon">
          <AppIcon name="phone" />
          <span>+91-6358273804</span>
        </button>
        <button className="new-sample-topbar__icon btn smplfy-secondary-button smplfy-secondary-button--large smplfy-secondary-button--tone-neutral smplfy-secondary-button--icon-only" aria-label="Notifications">
          <AppIcon name="bell" />
        </button>
        <button className="new-sample-topbar__avatar btn smplfy-secondary-button smplfy-secondary-button--large smplfy-secondary-button--tone-neutral">DC</button>
      </div>
    </header>
  );
}

function CustomerDetailsSection({ formValues, fieldErrors, onFieldChange }) {
  return (
    <div className="container-fluid new-sample-form__content">
      <div className="row g-4">
        <div className="col-lg-6">
          <FormElement
            type="dropdown"
            mandatory
            label="Sample Type"
            message={fieldErrors.sampleType}
            messageTone="error"
            inputProps={getFieldInputProps(stepFields[0][0], formValues, onFieldChange, Boolean(fieldErrors.sampleType))}
          />
        </div>

        <div className="col-lg-6">
          <FormElement
            type="date"
            mandatory
            label="Receiving Date"
            message={fieldErrors.receivingDate}
            messageTone="error"
            inputProps={getFieldInputProps(stepFields[0][1], formValues, onFieldChange, Boolean(fieldErrors.receivingDate))}
          />
        </div>

        <div className="col-12">
          <div className="new-sample-customer-row">
            <div className="new-sample-customer-row__field">
              <FormElement
                type="dropdown"
                mandatory
                label="Customer"
                message={fieldErrors.customer}
                messageTone="error"
                inputProps={getFieldInputProps(stepFields[0][2], formValues, onFieldChange, Boolean(fieldErrors.customer))}
              />
            </div>
            <PrimaryButton className="new-sample-add-button" aria-label="Add customer" leftIcon="plus" />
          </div>
        </div>

        <div className="col-12">
          <FormElement
            type="text"
            mandatory
            label="Customer Address"
            message={fieldErrors.customerAddress}
            messageTone="error"
            inputProps={getFieldInputProps(stepFields[0][3], formValues, onFieldChange, Boolean(fieldErrors.customerAddress))}
          />
        </div>
      </div>
    </div>
  );
}

function BasicDetailsSection({ formValues, fieldErrors, onFieldChange }) {
  return (
    <div className="container-fluid new-sample-form__content">
      <div className="row g-4">
        {stepFields[1].map((field) => (
          <div className="col-lg-6" key={field.key}>
            <FormElement
              type={field.type}
              mandatory={field.mandatory}
              label={field.label}
              message={fieldErrors[field.key]}
              messageTone="error"
              inputProps={getFieldInputProps(field, formValues, onFieldChange, Boolean(fieldErrors[field.key]))}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductDetailsSection({ formValues, fieldErrors, onFieldChange, parameterFormRows, onParameterRowChange }) {
  return (
    <div className="container-fluid new-sample-form__content new-sample-form__content--product">
      <div className="new-sample-product-head">
        <div className="new-sample-product-head__title">
          <span className="new-sample-product-head__index">1</span>
          <span>Product 1</span>
        </div>

        <button className="new-sample-product-head__delete btn" aria-label="Delete product">
          <AppIcon name="trash" />
        </button>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <FormElement
            type="dropdown"
            mandatory
            label="Category"
            message={fieldErrors.category}
            messageTone="error"
            inputProps={getFieldInputProps(stepFields[2][0], formValues, onFieldChange, Boolean(fieldErrors.category))}
          />
        </div>

        <div className="col-lg-6">
          <FormElement
            type="dropdown"
            mandatory
            label="Product"
            message={fieldErrors.product}
            messageTone="error"
            inputProps={getFieldInputProps(stepFields[2][1], formValues, onFieldChange, Boolean(fieldErrors.product))}
          />
        </div>

        <div className="col-12">
          <FormElement
            type="text"
            label="Description"
            inputProps={getFieldInputProps(stepFields[2][2], formValues, onFieldChange, false)}
          />
        </div>

        <div className="col-lg-6">
          <FormElement
            type="text"
            mandatory
            label="Quantity"
            message={fieldErrors.quantity}
            messageTone="error"
            inputProps={getFieldInputProps(stepFields[2][3], formValues, onFieldChange, Boolean(fieldErrors.quantity))}
          />
        </div>

        <div className="col-lg-6">
          <FormElement
            type="split"
            mandatory
            label="Sample Size"
            message={fieldErrors.sampleSize}
            messageTone="error"
            inputProps={getFieldInputProps(stepFields[2][4], formValues, onFieldChange, Boolean(fieldErrors.sampleSize))}
          />
        </div>

        <div className="col-lg-6">
          <FormElement
            type="text"
            label="Quality"
            inputProps={getFieldInputProps(stepFields[2][5], formValues, onFieldChange, false)}
          />
        </div>

        <div className="col-lg-6">
          <FormElement
            type="text"
            label="Identification Mark"
            inputProps={getFieldInputProps(stepFields[2][6], formValues, onFieldChange, false)}
          />
        </div>

        <div className="col-lg-6">
          <FormElement
            type="text"
            label="Condition"
            inputProps={getFieldInputProps(stepFields[2][7], formValues, onFieldChange, false)}
          />
        </div>

        <div className="col-lg-6">
          <FormElement
            type="text"
            label="Image Upload"
            inputProps={getFieldInputProps(stepFields[2][8], formValues, onFieldChange, false)}
          />
        </div>
      </div>

      <div className="new-sample-parameter-row">
        <h3>Parameter Data</h3>
        <button className="new-sample-parameter-link btn">Auto-fill parameters</button>
      </div>

      <div className="new-sample-parameter-table">
        <div className="new-sample-parameter-table__header">
          <div className="new-sample-parameter-checkbox-cell">
            <Checkbox
              checked={parameterFormRows.length > 0 && parameterFormRows.every((row) => row.checked)}
              ariaLabel="Select all parameters"
              onChange={(nextChecked) => {
                parameterFormRows.forEach((_, index) => {
                  onParameterRowChange(index, 'checked', nextChecked);
                });
              }}
            />
          </div>
          <div>Parameter</div>
          <div>Test Method</div>
          <div>Req. Size</div>
          <div>Charges</div>
          <div>Est. Time</div>
          <button className="new-sample-product-head__delete btn" aria-label="Delete parameter group">
            <AppIcon name="trash" />
          </button>
        </div>

        {parameterFormRows.map((row, index) => (
          <div className="new-sample-parameter-table__row" key={`${row.parameter}-${index}`}>
            <div className="new-sample-parameter-checkbox-cell">
              <Checkbox
                checked={row.checked}
                ariaLabel={`Select ${row.parameter}`}
                onChange={(nextChecked) => onParameterRowChange(index, 'checked', nextChecked)}
              />
            </div>
            <input
              className="new-sample-parameter-input"
              value={row.parameter}
              onChange={(event) => onParameterRowChange(index, 'parameter', event.target.value)}
            />
            <input
              className="new-sample-parameter-input"
              value={row.method}
              onChange={(event) => onParameterRowChange(index, 'method', event.target.value)}
            />
            <input
              className="new-sample-parameter-input"
              value={row.size}
              onChange={(event) => onParameterRowChange(index, 'size', event.target.value)}
            />
            <input
              className="new-sample-parameter-input"
              value={row.charges}
              onChange={(event) => onParameterRowChange(index, 'charges', event.target.value)}
            />
            <input
              className="new-sample-parameter-input"
              value={row.time}
              onChange={(event) => onParameterRowChange(index, 'time', event.target.value)}
            />
            <button className="new-sample-product-head__delete btn" aria-label={`Delete ${row.parameter}`}>
              <AppIcon name="trash" />
            </button>
          </div>
        ))}

        <button className="new-sample-outline-action btn">
          <AppIcon name="plus" />
          <span>Add New Parameter</span>
        </button>
      </div>

      <div className="new-sample-product-divider" />

      <button className="new-sample-outline-action btn new-sample-outline-action--large">
        <AppIcon name="plus" />
        <span>Add New Product</span>
      </button>
    </div>
  );
}

function AdditionalDetailsSection({ formValues, fieldErrors, onFieldChange }) {
  return (
    <div className="container-fluid new-sample-form__content">
      <div className="row g-4">
        {stepFields[3].map((field) => (
          <div className="col-lg-6" key={field.key}>
            <FormElement
              type={field.type}
              mandatory={field.mandatory}
              label={field.label}
              message={fieldErrors[field.key]}
              messageTone="error"
              inputProps={getFieldInputProps(field, formValues, onFieldChange, Boolean(fieldErrors[field.key]))}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function WizardFooter({ currentStep, onPrev, onNext, onComplete, onCancel, mode }) {
  const prevLabel = currentStep > 0 ? wizardSteps[currentStep - 1] : 'Cancel';
  const isLast = currentStep === wizardSteps.length - 1;
  const handlePrevClick = currentStep > 0 ? onPrev : onCancel;

  if (mode === 'edit') {
    return (
      <div className="new-sample-card__footer">
        <SecondaryButton className="new-sample-cancel" leftIcon="close" onClick={onCancel}>
          Cancel
        </SecondaryButton>
        <PrimaryButton leftIcon="save" onClick={onComplete}>
          Save Changes
        </PrimaryButton>
      </div>
    );
  }

  return (
    <div className="new-sample-card__footer">
      <SecondaryButton className="new-sample-cancel" leftIcon="chevron-left" onClick={handlePrevClick}>
        {prevLabel}
      </SecondaryButton>

      {isLast ? (
        <PrimaryButton leftIcon="save" onClick={onComplete}>
          Save Sample
        </PrimaryButton>
      ) : (
        <PrimaryButton rightIcon="chevron-right" onClick={onNext}>
          Next
        </PrimaryButton>
      )}
    </div>
  );
}

function CustomerForm({
  currentStep,
  formValues,
  fieldErrors,
  onFieldChange,
  onPrev,
  onNext,
  onComplete,
  onCancel,
  mode,
  sampleTitle,
  onStepChange,
  parameterFormRows,
  onParameterRowChange,
}) {
  const sections = [
    <CustomerDetailsSection
      key="customer"
      formValues={formValues}
      fieldErrors={fieldErrors}
      onFieldChange={onFieldChange}
    />,
    <BasicDetailsSection
      key="basic"
      formValues={formValues}
      fieldErrors={fieldErrors}
      onFieldChange={onFieldChange}
    />,
    <ProductDetailsSection
      key="product"
      formValues={formValues}
      fieldErrors={fieldErrors}
      onFieldChange={onFieldChange}
      parameterFormRows={parameterFormRows}
      onParameterRowChange={onParameterRowChange}
    />,
    <AdditionalDetailsSection
      key="additional"
      formValues={formValues}
      fieldErrors={fieldErrors}
      onFieldChange={onFieldChange}
    />,
  ];

  return (
    <section className="new-sample-card">
      <div className="new-sample-card__body">
        <StepRail
          currentStep={currentStep}
          title={sampleTitle}
          mode={mode}
          onStepChange={mode === 'edit' ? onStepChange : undefined}
        />

        <div className="new-sample-form">
          <div className="new-sample-form__stage">{sections[currentStep]}</div>
          <WizardFooter
            currentStep={currentStep}
            onPrev={onPrev}
            onNext={onNext}
            onComplete={onComplete}
            onCancel={onCancel}
            mode={mode}
          />
        </div>
      </div>
    </section>
  );
}

export default function NewSampleCustomerDetailsPage({
  mode = 'create',
  sample = null,
  parentLabel = 'Samples Workspace',
  onBackToWorkspace,
  onComplete,
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formValues, setFormValues] = useState(mode === 'edit' ? buildEditFormValues(sample) : initialFormValues);
  const [parameterFormRows, setParameterFormRows] = useState(buildParameterFormRows(mode));
  const [fieldErrors, setFieldErrors] = useState({});
  const sampleTitle = mode === 'edit' ? getSampleDisplayName(sample) : 'New Sample';
  const currentCrumbLabel = mode === 'edit' ? `Edit ${sampleTitle}` : 'New Sample';

  useEffect(() => {
    setCurrentStep(0);
    setFormValues(mode === 'edit' ? buildEditFormValues(sample) : initialFormValues);
    setParameterFormRows(buildParameterFormRows(mode));
    setFieldErrors({});
  }, [mode, sample]);

  const handleFieldChange = (key, value) => {
    setFormValues((current) => ({
      ...current,
      [key]: value,
    }));

    setFieldErrors((current) => {
      if (!current[key]) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[key];
      return nextErrors;
    });
  };

  const validateStep = (stepIndex) => {
    const nextErrors = {};

    stepFields[stepIndex].forEach((field) => {
      if (!field.mandatory) {
        return;
      }

      if (!isFilledValue(field.type, formValues[field.key])) {
        nextErrors[field.key] = 'This field is required.';
      }
    });

    setFieldErrors((current) => ({
      ...current,
      ...nextErrors,
    }));

    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = () => {
    // Validation is temporarily disabled.
    // if (!validateStep(currentStep)) {
    //   return;
    // }

    setCurrentStep((step) => Math.min(wizardSteps.length - 1, step + 1));
  };

  const handleComplete = () => {
    // Validation is temporarily disabled.
    // if (!validateStep(currentStep)) {
    //   return;
    // }

    onComplete?.();
  };

  const handleParameterRowChange = (rowIndex, field, value) => {
    setParameterFormRows((current) =>
      current.map((row, index) => (
        index === rowIndex
          ? { ...row, [field]: value }
          : row
      )),
    );
  };

  return (
    <div className="new-sample-page">
      <TopBar parentLabel={parentLabel} currentLabel={currentCrumbLabel} onBack={onBackToWorkspace} />
      <main className="new-sample-page__content">
        <CustomerForm
          currentStep={currentStep}
          formValues={formValues}
          fieldErrors={fieldErrors}
          onFieldChange={handleFieldChange}
          onPrev={() => setCurrentStep((step) => Math.max(0, step - 1))}
          onNext={handleNext}
          onComplete={handleComplete}
          onCancel={onBackToWorkspace}
          mode={mode}
          sampleTitle={sampleTitle}
          onStepChange={(stepIndex) => setCurrentStep(stepIndex)}
          parameterFormRows={parameterFormRows}
          onParameterRowChange={handleParameterRowChange}
        />
      </main>
    </div>
  );
}
