import { useEffect, useMemo, useRef, useState } from 'react';
import { SAMPLE_FORM_EXPERIMENT_FLAG, trackEvent, useFeatureFlagVariant } from '../analytics/posthog';
import AppIcon from '../components/AppIcon';
import Checkbox from '../components/Checkbox/Checkbox';
import { FormElement } from '../components/FormControls';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import Stepper from '../components/Stepper/Stepper';
import './new-sample-customer-details.scss';

const wizardSteps = [
  'Customer Details',
  'Basic Details',
  'Product Details',
  'Additional Details',
];

const sampleFormName = 'sample_creation';

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

const fieldMetaByKey = stepFields.reduce((fieldsByKey, fields, stepIndex) => {
  fields.forEach((field) => {
    fieldsByKey[field.key] = {
      ...field,
      stepIndex,
      stepName: wizardSteps[stepIndex],
    };
  });

  return fieldsByKey;
}, {});

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

function getNow() {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

function getElapsedTime(startedAt) {
  return Math.max(0, Math.round(getNow() - startedAt));
}

function createFormSessionId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `sample-form-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getStepName(stepIndex) {
  return wizardSteps[stepIndex] ?? `Step ${stepIndex + 1}`;
}

function getStepFieldSummary(stepIndex, formValues) {
  const fields = stepFields[stepIndex] ?? [];
  const requiredFields = fields.filter((field) => field.mandatory);
  const missingRequiredFields = requiredFields.filter((field) => !isFilledValue(field.type, formValues[field.key]));

  return {
    field_count: fields.length,
    required_field_count: requiredFields.length,
    missing_required_field_count: missingRequiredFields.length,
    missing_required_fields: missingRequiredFields.map((field) => field.key),
  };
}

function getParameterSummary(parameterFormRows) {
  return {
    parameter_count: parameterFormRows.length,
    selected_parameter_count: parameterFormRows.filter((row) => row.checked).length,
  };
}

function getFieldInteractionSummary(fieldChangeCounts) {
  const entries = Object.entries(fieldChangeCounts);
  const repeatedlyEditedFields = entries
    .filter(([, count]) => count >= 3)
    .map(([fieldKey]) => fieldKey);

  return {
    changed_field_count: entries.length,
    field_change_counts: fieldChangeCounts,
    repeatedly_edited_fields: repeatedlyEditedFields,
  };
}

function getFieldState(type, value, hasError) {
  if (hasError) {
    return 'error';
  }

  return isFilledValue(type, value) ? 'filled' : 'default';
}

function getFieldInputProps(field, formValues, onFieldChange, hasError, onFieldFocus, onFieldBlur) {
  const value = formValues[field.key];
  const baseState = getFieldState(field.type, value, hasError);
  const analyticsProps = {
    onFocus: () => onFieldFocus?.(field.key),
    onBlur: () => onFieldBlur?.(field.key),
  };

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
      ...analyticsProps,
    };
  }

  return {
    state: baseState,
    value: value ?? '',
    placeholder: field.placeholder,
    onChange: (event) => onFieldChange(field.key, event.target.value),
    ...analyticsProps,
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
        <button className="smplfy-btn btn btn-outline-secondary new-sample-topbar__chip">
          <AppIcon name="phone" />
          <span>+91-6358273804</span>
        </button>
        <button className="smplfy-btn btn btn-outline-secondary new-sample-topbar__icon" aria-label="Notifications">
          <AppIcon name="bell" />
        </button>
        <button className="smplfy-btn btn btn-outline-secondary new-sample-topbar__avatar">DC</button>
      </div>
    </header>
  );
}

function CustomerDetailsSection({ formValues, fieldErrors, onFieldChange, onFieldFocus, onFieldBlur }) {
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
            inputProps={getFieldInputProps(
              stepFields[0][0],
              formValues,
              onFieldChange,
              Boolean(fieldErrors.sampleType),
              onFieldFocus,
              onFieldBlur,
            )}
          />
        </div>

        <div className="col-lg-6">
          <FormElement
            type="date"
            mandatory
            label="Receiving Date"
            message={fieldErrors.receivingDate}
            messageTone="error"
            inputProps={getFieldInputProps(
              stepFields[0][1],
              formValues,
              onFieldChange,
              Boolean(fieldErrors.receivingDate),
              onFieldFocus,
              onFieldBlur,
            )}
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
                inputProps={getFieldInputProps(
                  stepFields[0][2],
                  formValues,
                  onFieldChange,
                  Boolean(fieldErrors.customer),
                  onFieldFocus,
                  onFieldBlur,
                )}
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
            inputProps={getFieldInputProps(
              stepFields[0][3],
              formValues,
              onFieldChange,
              Boolean(fieldErrors.customerAddress),
              onFieldFocus,
              onFieldBlur,
            )}
          />
        </div>
      </div>
    </div>
  );
}

function BasicDetailsSection({ formValues, fieldErrors, onFieldChange, onFieldFocus, onFieldBlur }) {
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
              inputProps={getFieldInputProps(
                field,
                formValues,
                onFieldChange,
                Boolean(fieldErrors[field.key]),
                onFieldFocus,
                onFieldBlur,
              )}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductDetailsSection({
  formValues,
  fieldErrors,
  onFieldChange,
  onFieldFocus,
  onFieldBlur,
  parameterFormRows,
  onParameterRowChange,
}) {
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
            inputProps={getFieldInputProps(
              stepFields[2][0],
              formValues,
              onFieldChange,
              Boolean(fieldErrors.category),
              onFieldFocus,
              onFieldBlur,
            )}
          />
        </div>

        <div className="col-lg-6">
          <FormElement
            type="dropdown"
            mandatory
            label="Product"
            message={fieldErrors.product}
            messageTone="error"
            inputProps={getFieldInputProps(
              stepFields[2][1],
              formValues,
              onFieldChange,
              Boolean(fieldErrors.product),
              onFieldFocus,
              onFieldBlur,
            )}
          />
        </div>

        <div className="col-12">
          <FormElement
            type="text"
            label="Description"
            inputProps={getFieldInputProps(
              stepFields[2][2],
              formValues,
              onFieldChange,
              false,
              onFieldFocus,
              onFieldBlur,
            )}
          />
        </div>

        <div className="col-lg-6">
          <FormElement
            type="text"
            mandatory
            label="Quantity"
            message={fieldErrors.quantity}
            messageTone="error"
            inputProps={getFieldInputProps(
              stepFields[2][3],
              formValues,
              onFieldChange,
              Boolean(fieldErrors.quantity),
              onFieldFocus,
              onFieldBlur,
            )}
          />
        </div>

        <div className="col-lg-6">
          <FormElement
            type="split"
            mandatory
            label="Sample Size"
            message={fieldErrors.sampleSize}
            messageTone="error"
            inputProps={getFieldInputProps(
              stepFields[2][4],
              formValues,
              onFieldChange,
              Boolean(fieldErrors.sampleSize),
              onFieldFocus,
              onFieldBlur,
            )}
          />
        </div>

        <div className="col-lg-6">
          <FormElement
            type="text"
            label="Quality"
            inputProps={getFieldInputProps(
              stepFields[2][5],
              formValues,
              onFieldChange,
              false,
              onFieldFocus,
              onFieldBlur,
            )}
          />
        </div>

        <div className="col-lg-6">
          <FormElement
            type="text"
            label="Identification Mark"
            inputProps={getFieldInputProps(
              stepFields[2][6],
              formValues,
              onFieldChange,
              false,
              onFieldFocus,
              onFieldBlur,
            )}
          />
        </div>

        <div className="col-lg-6">
          <FormElement
            type="text"
            label="Condition"
            inputProps={getFieldInputProps(
              stepFields[2][7],
              formValues,
              onFieldChange,
              false,
              onFieldFocus,
              onFieldBlur,
            )}
          />
        </div>

        <div className="col-lg-6">
          <FormElement
            type="text"
            label="Image Upload"
            inputProps={getFieldInputProps(
              stepFields[2][8],
              formValues,
              onFieldChange,
              false,
              onFieldFocus,
              onFieldBlur,
            )}
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

function AdditionalDetailsSection({ formValues, fieldErrors, onFieldChange, onFieldFocus, onFieldBlur }) {
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
              inputProps={getFieldInputProps(
                field,
                formValues,
                onFieldChange,
                Boolean(fieldErrors[field.key]),
                onFieldFocus,
                onFieldBlur,
              )}
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
  onFieldFocus,
  onFieldBlur,
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
      onFieldFocus={onFieldFocus}
      onFieldBlur={onFieldBlur}
    />,
    <BasicDetailsSection
      key="basic"
      formValues={formValues}
      fieldErrors={fieldErrors}
      onFieldChange={onFieldChange}
      onFieldFocus={onFieldFocus}
      onFieldBlur={onFieldBlur}
    />,
    <ProductDetailsSection
      key="product"
      formValues={formValues}
      fieldErrors={fieldErrors}
      onFieldChange={onFieldChange}
      onFieldFocus={onFieldFocus}
      onFieldBlur={onFieldBlur}
      parameterFormRows={parameterFormRows}
      onParameterRowChange={onParameterRowChange}
    />,
    <AdditionalDetailsSection
      key="additional"
      formValues={formValues}
      fieldErrors={fieldErrors}
      onFieldChange={onFieldChange}
      onFieldFocus={onFieldFocus}
      onFieldBlur={onFieldBlur}
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
  sampleCreationFlowSessionId = null,
  onSampleFormVariantChange,
  onBackToWorkspace,
  onComplete,
}) {
  const { isReady: isExperimentReady, variant: formVariant } = useFeatureFlagVariant(
    SAMPLE_FORM_EXPERIMENT_FLAG,
    'form-a',
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [formValues, setFormValues] = useState(mode === 'edit' ? buildEditFormValues(sample) : initialFormValues);
  const [parameterFormRows, setParameterFormRows] = useState(buildParameterFormRows(mode));
  const [fieldErrors, setFieldErrors] = useState({});
  const sampleTitle = mode === 'edit' ? getSampleDisplayName(sample) : 'New Sample';
  const currentCrumbLabel = mode === 'edit' ? `Edit ${sampleTitle}` : 'New Sample';
  const formSessionRef = useRef(createFormSessionId());
  const startedAtRef = useRef(getNow());
  const stepStartedAtRef = useRef(getNow());
  const lastInteractionAtRef = useRef(getNow());
  const trackedStartRef = useRef(false);
  const lastViewedStepRef = useRef(null);
  const outcomeRef = useRef(null);
  const fieldChangeCountsRef = useRef({});
  const fieldFocusStateRef = useRef({});
  const parameterFormRowsRef = useRef(parameterFormRows);
  const analyticsContext = useMemo(() => ({
    form_name: sampleFormName,
    form_variant: formVariant,
    experiment_flag: SAMPLE_FORM_EXPERIMENT_FLAG,
    experiment_ready: isExperimentReady,
    mode,
    parent_label: parentLabel,
    sample_present: Boolean(sample),
    sample_creation_flow_session_id: sampleCreationFlowSessionId,
  }), [formVariant, isExperimentReady, mode, parentLabel, sample, sampleCreationFlowSessionId]);
  const analyticsContextRef = useRef(analyticsContext);
  analyticsContextRef.current = analyticsContext;
  parameterFormRowsRef.current = parameterFormRows;

  const captureFormEvent = (eventName, properties = {}) => {
    trackEvent(eventName, {
      ...analyticsContextRef.current,
      form_session_id: formSessionRef.current,
      elapsed_ms: getElapsedTime(startedAtRef.current),
      ...properties,
    });
  };

  const captureHesitationIfNeeded = (actionName) => {
    const stepDurationMs = getElapsedTime(stepStartedAtRef.current);
    const idleBeforeActionMs = getElapsedTime(lastInteractionAtRef.current);

    if (stepDurationMs < 30000 && idleBeforeActionMs < 15000) {
      return;
    }

    captureFormEvent('sample_form_hesitation_detected', {
      action_name: actionName,
      step_index: currentStep,
      step_name: getStepName(currentStep),
      step_duration_ms: stepDurationMs,
      idle_before_action_ms: idleBeforeActionMs,
    });
  };

  useEffect(() => {
    if (isExperimentReady && mode === 'create') {
      onSampleFormVariantChange?.(formVariant);
    }
  }, [formVariant, isExperimentReady, mode, onSampleFormVariantChange]);

  useEffect(() => {
    formSessionRef.current = createFormSessionId();
    startedAtRef.current = getNow();
    stepStartedAtRef.current = getNow();
    lastInteractionAtRef.current = getNow();
    trackedStartRef.current = false;
    lastViewedStepRef.current = null;
    outcomeRef.current = null;
    fieldChangeCountsRef.current = {};
    fieldFocusStateRef.current = {};
    setCurrentStep(0);
    setFormValues(mode === 'edit' ? buildEditFormValues(sample) : initialFormValues);
    setParameterFormRows(buildParameterFormRows(mode));
    setFieldErrors({});
  }, [mode, sample]);

  useEffect(() => {
    if (!isExperimentReady || trackedStartRef.current) {
      return;
    }

    const now = getNow();
    trackedStartRef.current = true;
    startedAtRef.current = now;
    stepStartedAtRef.current = now;
    lastInteractionAtRef.current = now;
    lastViewedStepRef.current = currentStep;

    captureFormEvent('sample_form_experiment_assigned', {
      flag_key: SAMPLE_FORM_EXPERIMENT_FLAG,
      variant: formVariant,
    });
    captureFormEvent('sample_form_started', {
      step_count: wizardSteps.length,
      ...getStepFieldSummary(currentStep, formValues),
      ...getParameterSummary(parameterFormRows),
    });
    captureFormEvent('sample_form_step_viewed', {
      step_index: currentStep,
      step_name: getStepName(currentStep),
      ...getStepFieldSummary(currentStep, formValues),
    });
  }, [currentStep, formValues, formVariant, isExperimentReady, parameterFormRows]);

  useEffect(() => {
    if (!trackedStartRef.current || lastViewedStepRef.current === currentStep) {
      return;
    }

    lastViewedStepRef.current = currentStep;
    stepStartedAtRef.current = getNow();

    captureFormEvent('sample_form_step_viewed', {
      step_index: currentStep,
      step_name: getStepName(currentStep),
      ...getStepFieldSummary(currentStep, formValues),
    });
  }, [currentStep, formValues]);

  useEffect(() => () => {
    if (!trackedStartRef.current || outcomeRef.current) {
      return;
    }

    trackEvent('sample_form_abandoned', {
      ...analyticsContextRef.current,
      form_session_id: formSessionRef.current,
      elapsed_ms: getElapsedTime(startedAtRef.current),
      step_index: lastViewedStepRef.current,
      step_name: getStepName(lastViewedStepRef.current ?? 0),
      ...getFieldInteractionSummary(fieldChangeCountsRef.current),
      ...getParameterSummary(parameterFormRowsRef.current),
    });
  }, []);

  const handleFieldChange = (key, value) => {
    const fieldMeta = fieldMetaByKey[key] ?? {};
    const previousChangeCount = fieldChangeCountsRef.current[key] ?? 0;
    const nextChangeCount = previousChangeCount + 1;
    fieldChangeCountsRef.current = {
      ...fieldChangeCountsRef.current,
      [key]: nextChangeCount,
    };
    lastInteractionAtRef.current = getNow();

    if (previousChangeCount === 0) {
      captureFormEvent('sample_form_field_changed', {
        field_key: key,
        field_type: fieldMeta.type,
        step_index: fieldMeta.stepIndex,
        step_name: fieldMeta.stepName,
        change_count: nextChangeCount,
      });
    } else if ([3, 5, 10].includes(nextChangeCount) || nextChangeCount % 20 === 0) {
      captureFormEvent('sample_form_field_reedited', {
        field_key: key,
        field_type: fieldMeta.type,
        step_index: fieldMeta.stepIndex,
        step_name: fieldMeta.stepName,
        change_count: nextChangeCount,
      });
    }

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

  const handleFieldFocus = (key) => {
    const fieldMeta = fieldMetaByKey[key] ?? {};
    const now = getNow();

    lastInteractionAtRef.current = now;
    fieldFocusStateRef.current[key] = {
      startedAt: now,
      changeCountAtFocus: fieldChangeCountsRef.current[key] ?? 0,
    };

    captureFormEvent('sample_form_field_focused', {
      field_key: key,
      field_type: fieldMeta.type,
      step_index: fieldMeta.stepIndex,
      step_name: fieldMeta.stepName,
    });
  };

  const handleFieldBlur = (key) => {
    const fieldMeta = fieldMetaByKey[key] ?? {};
    const focusState = fieldFocusStateRef.current[key];
    const currentChangeCount = fieldChangeCountsRef.current[key] ?? 0;

    lastInteractionAtRef.current = getNow();

    captureFormEvent('sample_form_field_blurred', {
      field_key: key,
      field_type: fieldMeta.type,
      step_index: fieldMeta.stepIndex,
      step_name: fieldMeta.stepName,
      focus_duration_ms: focusState ? getElapsedTime(focusState.startedAt) : undefined,
      changed_during_focus: focusState ? currentChangeCount > focusState.changeCountAtFocus : undefined,
      change_count: currentChangeCount,
    });

    delete fieldFocusStateRef.current[key];
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

    if (Object.keys(nextErrors).length > 0) {
      captureFormEvent('sample_form_validation_failed', {
        step_index: stepIndex,
        step_name: getStepName(stepIndex),
        error_count: Object.keys(nextErrors).length,
        error_fields: Object.keys(nextErrors),
      });
    }

    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = () => {
    // Validation is temporarily disabled.
    // if (!validateStep(currentStep)) {
    //   return;
    // }

    captureHesitationIfNeeded('next');
    captureFormEvent('sample_form_step_completed', {
      step_index: currentStep,
      step_name: getStepName(currentStep),
      step_duration_ms: getElapsedTime(stepStartedAtRef.current),
      ...getStepFieldSummary(currentStep, formValues),
      ...getFieldInteractionSummary(fieldChangeCountsRef.current),
    });
    lastInteractionAtRef.current = getNow();

    setCurrentStep((step) => Math.min(wizardSteps.length - 1, step + 1));
  };

  const handleComplete = () => {
    // Validation is temporarily disabled.
    // if (!validateStep(currentStep)) {
    //   return;
    // }

    captureHesitationIfNeeded('complete');
    if (mode === 'create') {
      captureFormEvent('sample_creation_flow_submit_clicked', {
        step_index: currentStep,
        step_name: getStepName(currentStep),
        total_duration_ms: getElapsedTime(startedAtRef.current),
        step_duration_ms: getElapsedTime(stepStartedAtRef.current),
        ...getStepFieldSummary(currentStep, formValues),
        ...getFieldInteractionSummary(fieldChangeCountsRef.current),
        ...getParameterSummary(parameterFormRows),
      });
    }

    outcomeRef.current = 'completed';
    captureFormEvent('sample_form_completed', {
      step_index: currentStep,
      step_name: getStepName(currentStep),
      total_duration_ms: getElapsedTime(startedAtRef.current),
      step_duration_ms: getElapsedTime(stepStartedAtRef.current),
      ...getStepFieldSummary(currentStep, formValues),
      ...getFieldInteractionSummary(fieldChangeCountsRef.current),
      ...getParameterSummary(parameterFormRows),
    });
    lastInteractionAtRef.current = getNow();

    onComplete?.();
  };

  const handlePrev = () => {
    captureHesitationIfNeeded('previous');

    setCurrentStep((step) => {
      const nextStep = Math.max(0, step - 1);

      if (nextStep !== step) {
        captureFormEvent('sample_form_backtracked', {
          from_step_index: step,
          from_step_name: getStepName(step),
          to_step_index: nextStep,
          to_step_name: getStepName(nextStep),
          step_duration_ms: getElapsedTime(stepStartedAtRef.current),
        });
      }

      return nextStep;
    });
    lastInteractionAtRef.current = getNow();
  };

  const handleCancel = () => {
    outcomeRef.current = 'cancelled';
    captureFormEvent('sample_form_cancelled', {
      step_index: currentStep,
      step_name: getStepName(currentStep),
      total_duration_ms: getElapsedTime(startedAtRef.current),
      step_duration_ms: getElapsedTime(stepStartedAtRef.current),
      ...getFieldInteractionSummary(fieldChangeCountsRef.current),
      ...getParameterSummary(parameterFormRows),
    });
    lastInteractionAtRef.current = getNow();
    onBackToWorkspace?.();
  };

  const handleStepChange = (stepIndex) => {
    if (stepIndex === currentStep) {
      return;
    }

    captureFormEvent('sample_form_step_jumped', {
      from_step_index: currentStep,
      from_step_name: getStepName(currentStep),
      to_step_index: stepIndex,
      to_step_name: getStepName(stepIndex),
      step_duration_ms: getElapsedTime(stepStartedAtRef.current),
    });
    lastInteractionAtRef.current = getNow();
    setCurrentStep(stepIndex);
  };

  const handleParameterRowChange = (rowIndex, field, value) => {
    lastInteractionAtRef.current = getNow();
    captureFormEvent('sample_form_parameter_changed', {
      row_index: rowIndex,
      field_key: field,
      ...getParameterSummary(parameterFormRows),
    });

    setParameterFormRows((current) =>
      current.map((row, index) => (
        index === rowIndex
          ? { ...row, [field]: value }
          : row
      )),
    );
  };

  return (
    <div className="new-sample-page" data-sample-form-variant={formVariant}>
      <TopBar parentLabel={parentLabel} currentLabel={currentCrumbLabel} onBack={handleCancel} />
      <main className="new-sample-page__content">
        <CustomerForm
          currentStep={currentStep}
          formValues={formValues}
          fieldErrors={fieldErrors}
          onFieldChange={handleFieldChange}
          onFieldFocus={handleFieldFocus}
          onFieldBlur={handleFieldBlur}
          onPrev={handlePrev}
          onNext={handleNext}
          onComplete={handleComplete}
          onCancel={handleCancel}
          mode={mode}
          sampleTitle={sampleTitle}
          onStepChange={handleStepChange}
          parameterFormRows={parameterFormRows}
          onParameterRowChange={handleParameterRowChange}
        />
      </main>
    </div>
  );
}
