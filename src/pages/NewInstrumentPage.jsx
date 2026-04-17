import { useEffect, useState } from 'react';
import AppIcon from '../components/AppIcon';
import { FormElement } from '../components/FormControls';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import Stepper from '../components/Stepper/Stepper';
import './new-instrument-page.css';

const wizardSteps = [
  'Basic Details',
  'Calibration Details',
  'Preventive Maintenance',
  'Breakdown Details',
  'Additional Details',
];

const roleOptions = ['Lab Manager', 'Technician', 'Quality Analyst', 'Supervisor'];

const initialFormValues = {
  // Step 1
  name: '',
  uniqueKey: '',
  serialNumber: '',
  make: '',
  model: '',
  allowAccessTo: '',
  description: '',
  // Step 2
  calibLastPerformedOn: '',
  calibFrequency: '',
  calibRemindBeforeDays: '',
  calibReminderFrequency: '',
  calibAllowAccessTo: '',
  calibAllowAccessTo2: '',
  calibAllowAccessTo3: '',
  // Step 3
  pmLastPerformedOn: '',
  pmFrequency: '',
  pmRemindBeforeDays: '',
  pmReminderFrequency: '',
  pmAllowAccessTo: '',
  pmAllowAccessTo2: '',
  pmAllowAccessTo3: '',
  // Step 4
  bdAllowAccessTo: '',
  bdAllowAccessTo2: '',
  bdAllowAccessTo3: '',
  // Step 5
  costOfEquipment: '',
  referencePurchaseFile: '',
  currentLocation: '',
  manufacturerSupplier: '',
};

function isFilledValue(value) {
  return Boolean(String(value ?? '').trim());
}

function getInputProps(key, formValues, onFieldChange) {
  return {
    value: formValues[key] ?? '',
    onChange: (e) => onFieldChange(key, e.target.value),
  };
}

function StepRail({ currentStep, onStepChange }) {
  const items = wizardSteps.map((label, index) => ({
    label,
    state: index < currentStep ? 'completed' : index === currentStep ? 'active' : 'default',
  }));

  return (
    <aside className="new-instrument-rail">
      <div className="new-instrument-rail__heading">
        <h1 className="new-instrument-rail__title">New Instrument</h1>
      </div>
      <Stepper items={items} onItemClick={onStepChange} />
    </aside>
  );
}

function TopBar({ onBack }) {
  return (
    <header className="new-instrument-topbar">
      <div className="new-instrument-topbar__breadcrumbs">
        <button className="new-instrument-topbar__crumb new-instrument-topbar__crumb-button is-home" aria-label="Go home" onClick={onBack}>
          <AppIcon name="home" />
        </button>
        <AppIcon name="chevron-right" />
        <button className="new-instrument-topbar__crumb new-instrument-topbar__crumb-button" onClick={onBack}>
          Instruments
        </button>
        <AppIcon name="chevron-right" />
        <span className="new-instrument-topbar__crumb is-current">New Instrument</span>
      </div>
      <div className="new-instrument-topbar__actions">
        <div className="new-instrument-topbar__pill">
          <AppIcon name="activity" />
          <span>No Active Alerts</span>
        </div>
        <button className="new-instrument-topbar__chip btn smplfy-secondary-button smplfy-secondary-button--large smplfy-secondary-button--tone-neutral smplfy-secondary-button--has-left-icon">
          <AppIcon name="phone" />
          <span>+91-6358273804</span>
        </button>
        <button className="new-instrument-topbar__icon btn smplfy-secondary-button smplfy-secondary-button--large smplfy-secondary-button--tone-neutral smplfy-secondary-button--icon-only" aria-label="Notifications">
          <AppIcon name="bell" />
        </button>
        <button className="new-instrument-topbar__avatar btn smplfy-secondary-button smplfy-secondary-button--large smplfy-secondary-button--tone-neutral">DC</button>
      </div>
    </header>
  );
}

function BasicDetailsSection({ formValues, fieldErrors, onFieldChange }) {
  return (
    <div className="container-fluid new-instrument-form__content">
      <div className="row g-4">
        <div className="col-12">
          <FormElement
            type="text"
            mandatory
            label="Name"
            message={fieldErrors.name}
            messageTone="error"
            inputProps={{ ...getInputProps('name', formValues, onFieldChange), placeholder: 'eg. Carpet Static Loading Machine' }}
          />
        </div>
        <div className="col-lg-6">
          <FormElement
            type="text"
            mandatory
            label="Unique Key"
            message={fieldErrors.uniqueKey}
            messageTone="error"
            inputProps={{ ...getInputProps('uniqueKey', formValues, onFieldChange), placeholder: 'eg. CSL-01' }}
          />
        </div>
        <div className="col-lg-6">
          <FormElement
            type="text"
            label="Serial Number"
            inputProps={{ ...getInputProps('serialNumber', formValues, onFieldChange), placeholder: 'eg. 37653' }}
          />
        </div>
        <div className="col-lg-6">
          <FormElement
            type="text"
            label="Make"
            inputProps={{ ...getInputProps('make', formValues, onFieldChange), placeholder: 'eg. SDL-UK' }}
          />
        </div>
        <div className="col-lg-6">
          <FormElement
            type="text"
            label="Model"
            inputProps={{ ...getInputProps('model', formValues, onFieldChange), placeholder: 'eg. K 043' }}
          />
        </div>
        <div className="col-12">
          <FormElement
            type="dropdown"
            mandatory
            label="Allow Access to"
            message={fieldErrors.allowAccessTo}
            messageTone="error"
            inputProps={{ ...getInputProps('allowAccessTo', formValues, onFieldChange), placeholder: 'Select role(s)', options: roleOptions }}
          />
        </div>
        <div className="col-12">
          <FormElement
            type="text"
            label="Description"
            inputProps={{ ...getInputProps('description', formValues, onFieldChange), placeholder: 'eg. Technical Manager' }}
          />
        </div>
      </div>
    </div>
  );
}

function CalibrationDetailsSection({ formValues, fieldErrors, onFieldChange }) {
  return (
    <div className="container-fluid new-instrument-form__content">
      <div className="row g-4">
        <div className="col-lg-6">
          <FormElement
            type="text"
            mandatory
            label="Last Performed On"
            message={fieldErrors.calibLastPerformedOn}
            messageTone="error"
            inputProps={{ ...getInputProps('calibLastPerformedOn', formValues, onFieldChange), placeholder: 'eg. CSL-01' }}
          />
        </div>
        <div className="col-lg-6">
          <FormElement
            type="text"
            mandatory
            label="Frequency (In Days)"
            message={fieldErrors.calibFrequency}
            messageTone="error"
            inputProps={{ ...getInputProps('calibFrequency', formValues, onFieldChange), placeholder: 'eg. 37653' }}
          />
        </div>
        <div className="col-lg-6">
          <FormElement
            type="text"
            label="Remind before days"
            inputProps={{ ...getInputProps('calibRemindBeforeDays', formValues, onFieldChange), placeholder: 'eg. SDL-UK' }}
          />
        </div>
        <div className="col-lg-6">
          <FormElement
            type="text"
            label="Reminder frequency"
            inputProps={{ ...getInputProps('calibReminderFrequency', formValues, onFieldChange), placeholder: 'eg. K 043' }}
          />
        </div>
        <div className="col-12">
          <FormElement
            type="dropdown"
            label="Allow Access to"
            inputProps={{ ...getInputProps('calibAllowAccessTo', formValues, onFieldChange), placeholder: 'Select role(s)', options: roleOptions }}
          />
        </div>
        <div className="col-lg-6">
          <FormElement
            type="dropdown"
            mandatory
            label="Allow Access to"
            message={fieldErrors.calibAllowAccessTo2}
            messageTone="error"
            inputProps={{ ...getInputProps('calibAllowAccessTo2', formValues, onFieldChange), placeholder: 'Select role(s)', options: roleOptions }}
          />
        </div>
        <div className="col-lg-6">
          <FormElement
            type="dropdown"
            mandatory
            label="Allow Access to"
            message={fieldErrors.calibAllowAccessTo3}
            messageTone="error"
            inputProps={{ ...getInputProps('calibAllowAccessTo3', formValues, onFieldChange), placeholder: 'Select role(s)', options: roleOptions }}
          />
        </div>
      </div>
    </div>
  );
}

function PreventiveMaintenanceSection({ formValues, fieldErrors, onFieldChange }) {
  return (
    <div className="container-fluid new-instrument-form__content">
      <div className="row g-4">
        <div className="col-lg-6">
          <FormElement
            type="text"
            mandatory
            label="Last Performed On"
            message={fieldErrors.pmLastPerformedOn}
            messageTone="error"
            inputProps={{ ...getInputProps('pmLastPerformedOn', formValues, onFieldChange), placeholder: 'eg. CSL-01' }}
          />
        </div>
        <div className="col-lg-6">
          <FormElement
            type="text"
            mandatory
            label="Frequency (In Days)"
            message={fieldErrors.pmFrequency}
            messageTone="error"
            inputProps={{ ...getInputProps('pmFrequency', formValues, onFieldChange), placeholder: 'eg. 37653' }}
          />
        </div>
        <div className="col-lg-6">
          <FormElement
            type="text"
            label="Remind before days"
            inputProps={{ ...getInputProps('pmRemindBeforeDays', formValues, onFieldChange), placeholder: 'eg. SDL-UK' }}
          />
        </div>
        <div className="col-lg-6">
          <FormElement
            type="text"
            label="Reminder frequency"
            inputProps={{ ...getInputProps('pmReminderFrequency', formValues, onFieldChange), placeholder: 'eg. K 043' }}
          />
        </div>
        <div className="col-12">
          <FormElement
            type="dropdown"
            label="Allow Access to"
            inputProps={{ ...getInputProps('pmAllowAccessTo', formValues, onFieldChange), placeholder: 'Select role(s)', options: roleOptions }}
          />
        </div>
        <div className="col-lg-6">
          <FormElement
            type="dropdown"
            mandatory
            label="Allow Access to"
            message={fieldErrors.pmAllowAccessTo2}
            messageTone="error"
            inputProps={{ ...getInputProps('pmAllowAccessTo2', formValues, onFieldChange), placeholder: 'Select role(s)', options: roleOptions }}
          />
        </div>
        <div className="col-lg-6">
          <FormElement
            type="dropdown"
            mandatory
            label="Allow Access to"
            message={fieldErrors.pmAllowAccessTo3}
            messageTone="error"
            inputProps={{ ...getInputProps('pmAllowAccessTo3', formValues, onFieldChange), placeholder: 'Select role(s)', options: roleOptions }}
          />
        </div>
      </div>
    </div>
  );
}

function BreakdownDetailsSection({ formValues, fieldErrors, onFieldChange }) {
  return (
    <div className="container-fluid new-instrument-form__content">
      <div className="row g-4">
        <div className="col-12">
          <FormElement
            type="dropdown"
            label="Allow Access to"
            inputProps={{ ...getInputProps('bdAllowAccessTo', formValues, onFieldChange), placeholder: 'Select role(s)', options: roleOptions }}
          />
        </div>
        <div className="col-lg-6">
          <FormElement
            type="dropdown"
            mandatory
            label="Allow Access to"
            message={fieldErrors.bdAllowAccessTo2}
            messageTone="error"
            inputProps={{ ...getInputProps('bdAllowAccessTo2', formValues, onFieldChange), placeholder: 'Select role(s)', options: roleOptions }}
          />
        </div>
        <div className="col-lg-6">
          <FormElement
            type="dropdown"
            mandatory
            label="Allow Access to"
            message={fieldErrors.bdAllowAccessTo3}
            messageTone="error"
            inputProps={{ ...getInputProps('bdAllowAccessTo3', formValues, onFieldChange), placeholder: 'Select role(s)', options: roleOptions }}
          />
        </div>
      </div>
    </div>
  );
}

function AdditionalDetailsSection({ formValues, onFieldChange }) {
  return (
    <div className="container-fluid new-instrument-form__content">
      <div className="row g-4">
        <div className="col-lg-6">
          <FormElement
            type="text"
            label="Cost of Equipment"
            inputProps={{ ...getInputProps('costOfEquipment', formValues, onFieldChange), placeholder: 'Cost in INR' }}
          />
        </div>
        <div className="col-lg-6">
          <FormElement
            type="text"
            label="Reference to the Purchase file"
            inputProps={{ ...getInputProps('referencePurchaseFile', formValues, onFieldChange), placeholder: '' }}
          />
        </div>
        <div className="col-lg-6">
          <FormElement
            type="text"
            label="Current Location"
            inputProps={{ ...getInputProps('currentLocation', formValues, onFieldChange), placeholder: 'eg. Dahej Plant' }}
          />
        </div>
        <div className="col-lg-6">
          <FormElement
            type="text"
            label="Name of the Manufacturer/Supplier"
            inputProps={{ ...getInputProps('manufacturerSupplier', formValues, onFieldChange), placeholder: 'eg. EG' }}
          />
        </div>
      </div>
    </div>
  );
}

function WizardFooter({ currentStep, onPrev, onNext, onComplete, onCancel }) {
  const prevLabel = currentStep > 0 ? wizardSteps[currentStep - 1] : 'Cancel';
  const isLast = currentStep === wizardSteps.length - 1;
  const handlePrevClick = currentStep > 0 ? onPrev : onCancel;

  return (
    <div className="new-instrument-card__footer">
      <SecondaryButton className="new-instrument-cancel" leftIcon="chevron-left" onClick={handlePrevClick}>
        {prevLabel}
      </SecondaryButton>
      {isLast ? (
        <PrimaryButton leftIcon="save" onClick={onComplete}>
          Save Instrument
        </PrimaryButton>
      ) : (
        <PrimaryButton rightIcon="chevron-right" onClick={onNext}>
          Next
        </PrimaryButton>
      )}
    </div>
  );
}

function InstrumentForm({ currentStep, formValues, fieldErrors, onFieldChange, onPrev, onNext, onComplete, onCancel, onStepChange }) {
  const sections = [
    <BasicDetailsSection key="basic" formValues={formValues} fieldErrors={fieldErrors} onFieldChange={onFieldChange} />,
    <CalibrationDetailsSection key="calibration" formValues={formValues} fieldErrors={fieldErrors} onFieldChange={onFieldChange} />,
    <PreventiveMaintenanceSection key="preventive" formValues={formValues} fieldErrors={fieldErrors} onFieldChange={onFieldChange} />,
    <BreakdownDetailsSection key="breakdown" formValues={formValues} fieldErrors={fieldErrors} onFieldChange={onFieldChange} />,
    <AdditionalDetailsSection key="additional" formValues={formValues} onFieldChange={onFieldChange} />,
  ];

  return (
    <section className="new-instrument-card">
      <div className="new-instrument-card__body">
        <StepRail currentStep={currentStep} onStepChange={onStepChange} />
        <div className="new-instrument-form">
          <div className="new-instrument-form__stage">{sections[currentStep]}</div>
          <WizardFooter currentStep={currentStep} onPrev={onPrev} onNext={onNext} onComplete={onComplete} onCancel={onCancel} />
        </div>
      </div>
    </section>
  );
}

export default function NewInstrumentPage({ onBack, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formValues, setFormValues] = useState(initialFormValues);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleFieldChange = (key, value) => {
    setFormValues((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => {
      if (!current[key]) return current;
      const nextErrors = { ...current };
      delete nextErrors[key];
      return nextErrors;
    });
  };

  const handleNext = () => {
    setCurrentStep((step) => Math.min(wizardSteps.length - 1, step + 1));
  };

  const handleComplete = () => {
    onComplete?.({ name: formValues.name });
  };

  return (
    <div className="new-instrument-page">
      <TopBar onBack={onBack} />
      <main className="new-instrument-page__content">
        <InstrumentForm
          currentStep={currentStep}
          formValues={formValues}
          fieldErrors={fieldErrors}
          onFieldChange={handleFieldChange}
          onPrev={() => setCurrentStep((step) => Math.max(0, step - 1))}
          onNext={handleNext}
          onComplete={handleComplete}
          onCancel={onBack}
          onStepChange={(stepIndex) => setCurrentStep(stepIndex)}
        />
      </main>
    </div>
  );
}
