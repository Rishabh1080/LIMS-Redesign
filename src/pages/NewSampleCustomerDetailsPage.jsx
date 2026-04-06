import { useState } from 'react';
import AppIcon from '../components/AppIcon';
import { FormElement } from '../components/FormControls';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
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
  ['Bursting Strength', 'IS 1963', '12 g', '250', '5 days'],
  ['Colour Fastness', 'AATCC 61', '10 g', '300', '3 days'],
  ['Abrasion Resistance', 'ISO 12947', '14 g', '450', '7 days'],
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

function StepRail({ currentStep }) {
  const items = wizardSteps.map((label, index) => ({
    label,
    state: index < currentStep ? 'completed' : index === currentStep ? 'active' : 'default',
  }));

  return (
    <aside className="new-sample-rail">
      <div className="new-sample-rail__heading">
        <h1 className="new-sample-rail__title">New Sample</h1>
      </div>
      <Stepper items={items} />
    </aside>
  );
}

function TopBar({ onBackToWorkspace }) {
  return (
    <header className="new-sample-topbar">
      <div className="new-sample-topbar__breadcrumbs">
        <button
          className="new-sample-topbar__crumb new-sample-topbar__crumb-button is-home"
          aria-label="Go to Samples Workspace"
          onClick={onBackToWorkspace}
        >
          <AppIcon name="home" />
        </button>
        <AppIcon name="chevron-right" />
        <button className="new-sample-topbar__crumb new-sample-topbar__crumb-button" onClick={onBackToWorkspace}>
          Samples Workspace
        </button>
        <AppIcon name="chevron-right" />
        <span className="new-sample-topbar__crumb is-current">New Sample</span>
      </div>

      <div className="new-sample-topbar__actions">
        <div className="new-sample-topbar__pill">
          <AppIcon name="activity" />
          <span>No Active Alerts</span>
        </div>
        <button className="new-sample-topbar__chip btn">
          <AppIcon name="phone" />
          <span>+91-6358273804</span>
        </button>
        <button className="new-sample-topbar__icon btn" aria-label="Notifications">
          <AppIcon name="bell" />
        </button>
        <button className="new-sample-topbar__avatar btn">DC</button>
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

function ProductDetailsSection({ formValues, fieldErrors, onFieldChange }) {
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
          <div className="new-sample-checkbox" />
          <div>Parameter</div>
          <div>Test Method</div>
          <div>Req. Size</div>
          <div>Charges</div>
          <div>Est. Time</div>
          <button className="new-sample-product-head__delete btn" aria-label="Delete parameter group">
            <AppIcon name="trash" />
          </button>
        </div>

        {parameterRows.map(([parameter, method, size, charges, time]) => (
          <div className="new-sample-parameter-table__row" key={parameter}>
            <div className="new-sample-checkbox" />
            <div className="new-sample-parameter-input is-placeholder">{parameter}</div>
            <div className="new-sample-parameter-input is-placeholder">{method}</div>
            <div className="new-sample-parameter-input is-placeholder">{size}</div>
            <div className="new-sample-parameter-input is-placeholder">{charges}</div>
            <div className="new-sample-parameter-input is-placeholder">{time}</div>
            <button className="new-sample-product-head__delete btn" aria-label={`Delete ${parameter}`}>
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

function WizardFooter({ currentStep, onPrev, onNext, onComplete }) {
  const prevLabel = currentStep > 0 ? wizardSteps[currentStep - 1] : 'Cancel';
  const isLast = currentStep === wizardSteps.length - 1;

  return (
    <div className="new-sample-card__footer">
      <button className="new-sample-cancel btn" onClick={currentStep > 0 ? onPrev : undefined}>
        <AppIcon name="chevron-left" />
        <span>{prevLabel}</span>
      </button>

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

function CustomerForm({ currentStep, formValues, fieldErrors, onFieldChange, onPrev, onNext, onComplete }) {
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
        <StepRail currentStep={currentStep} />

        <div className="new-sample-form">
          <div className="new-sample-form__stage">{sections[currentStep]}</div>
          <WizardFooter
            currentStep={currentStep}
            onPrev={onPrev}
            onNext={onNext}
            onComplete={onComplete}
          />
        </div>
      </div>
    </section>
  );
}

export default function NewSampleCustomerDetailsPage({ onBackToWorkspace, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formValues, setFormValues] = useState(initialFormValues);
  const [fieldErrors, setFieldErrors] = useState({});

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

  return (
    <div className="new-sample-page">
      <TopBar onBackToWorkspace={onBackToWorkspace} />
      <main className="new-sample-page__content">
        <CustomerForm
          currentStep={currentStep}
          formValues={formValues}
          fieldErrors={fieldErrors}
          onFieldChange={handleFieldChange}
          onPrev={() => setCurrentStep((step) => Math.max(0, step - 1))}
          onNext={handleNext}
          onComplete={handleComplete}
        />
      </main>
    </div>
  );
}
