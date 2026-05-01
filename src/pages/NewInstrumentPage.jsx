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
const templateOptions = ['Calibration Template', 'Maintenance Template', 'Breakdown Template'];
const workflowOptions = ['Standard Workflow', 'Escalated Workflow', 'Approval Workflow'];

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
  calibRemindTo: '',
  calibTemplate: '',
  calibWorkflow: '',
  // Step 3
  pmLastPerformedOn: '',
  pmFrequency: '',
  pmRemindBeforeDays: '',
  pmReminderFrequency: '',
  pmRemindTo: '',
  pmTemplate: '',
  pmWorkflow: '',
  // Step 4
  bdLastPerformedOn: '',
  bdFrequency: '',
  bdRemindBeforeDays: '',
  bdReminderFrequency: '',
  bdRemindTo: '',
  bdTemplate: '',
  bdWorkflow: '',
  // Step 5
  costOfEquipment: '',
  referencePurchaseFile: '',
  currentLocation: '',
  manufacturerSupplier: '',
};

function getInstrumentDisplayName(instrument) {
  return instrument?.name || 'Instrument';
}

function buildEditFormValues(instrument) {
  if (!instrument) {
    return initialFormValues;
  }

  return {
    ...initialFormValues,
    name: instrument.name ?? '',
    uniqueKey: instrument.uniqueKey ?? '',
    serialNumber: instrument.serialNo ?? '',
    make: instrument.make ?? '',
    model: instrument.modelNo ?? '',
    allowAccessTo: instrument.allowAccessTo ?? roleOptions[0],
    description: instrument.description ?? '',
    calibLastPerformedOn: instrument.calibLastPerformedOn ?? instrument.lastServiceOn ?? '',
    calibFrequency: instrument.calibFrequency ?? '180',
    calibRemindBeforeDays: instrument.calibRemindBeforeDays ?? '15',
    calibReminderFrequency: instrument.calibReminderFrequency ?? '7',
    calibRemindTo: instrument.calibRemindTo ?? roleOptions[0],
    calibTemplate: instrument.calibTemplate ?? templateOptions[0],
    calibWorkflow: instrument.calibWorkflow ?? workflowOptions[0],
    pmLastPerformedOn: instrument.pmLastPerformedOn ?? instrument.lastServiceOn ?? '',
    pmFrequency: instrument.pmFrequency ?? '90',
    pmRemindBeforeDays: instrument.pmRemindBeforeDays ?? '10',
    pmReminderFrequency: instrument.pmReminderFrequency ?? '5',
    pmRemindTo: instrument.pmRemindTo ?? roleOptions[0],
    pmTemplate: instrument.pmTemplate ?? templateOptions[1],
    pmWorkflow: instrument.pmWorkflow ?? workflowOptions[0],
    bdLastPerformedOn: instrument.bdLastPerformedOn ?? instrument.lastServiceOn ?? '',
    bdFrequency: instrument.bdFrequency ?? '30',
    bdRemindBeforeDays: instrument.bdRemindBeforeDays ?? '3',
    bdReminderFrequency: instrument.bdReminderFrequency ?? '1',
    bdRemindTo: instrument.bdRemindTo ?? roleOptions[0],
    bdTemplate: instrument.bdTemplate ?? templateOptions[2],
    bdWorkflow: instrument.bdWorkflow ?? workflowOptions[1],
    costOfEquipment: instrument.costOfEquipment ?? '125000',
    referencePurchaseFile: instrument.referencePurchaseFile ?? 'PO-2026-014',
    currentLocation: instrument.currentLocation ?? 'Central Lab',
    manufacturerSupplier: instrument.manufacturerSupplier ?? 'Anton Paar',
  };
}

function isFilledValue(value) {
  return Boolean(String(value ?? '').trim());
}

function getInputProps(key, formValues, onFieldChange) {
  return {
    value: formValues[key] ?? '',
    onChange: (e) => onFieldChange(key, e.target.value),
  };
}

function StepRail({ currentStep, mode, title, onStepChange }) {
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
    <aside className={`new-instrument-rail ${mode === 'edit' ? 'new-instrument-rail--edit' : ''}`.trim()}>
      <div className={`new-instrument-rail__heading ${mode === 'edit' ? 'new-instrument-rail__heading--edit' : ''}`.trim()}>
        <h1 className="new-instrument-rail__title">{mode === 'edit' ? title : 'New Instrument'}</h1>
      </div>
      <Stepper items={items} onItemClick={onStepChange} />
    </aside>
  );
}

function TopBar({ parentLabel, currentLabel, onBack }) {
  return (
    <header className="new-instrument-topbar">
      <div className="new-instrument-topbar__breadcrumbs">
        <button className="new-instrument-topbar__crumb new-instrument-topbar__crumb-button is-home" aria-label="Go home" onClick={onBack}>
          <AppIcon name="home" />
        </button>
        <AppIcon name="chevron-right" />
        <button className="new-instrument-topbar__crumb new-instrument-topbar__crumb-button" onClick={onBack}>
          {parentLabel}
        </button>
        <AppIcon name="chevron-right" />
        <span className="new-instrument-topbar__crumb is-current">{currentLabel}</span>
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

function MaintenanceScheduleSection({
  prefix,
  formValues,
  fieldErrors,
  onFieldChange,
}) {
  return (
    <div className="container-fluid new-instrument-form__content">
      <div className="row g-4">
        <div className="col-lg-6">
          <FormElement
            type="date"
            label="Last Performed On"
            message={fieldErrors[`${prefix}LastPerformedOn`]}
            messageTone="error"
            inputProps={{
              ...getInputProps(`${prefix}LastPerformedOn`, formValues, onFieldChange),
              placeholder: 'dd/mm/yyyy',
            }}
          />
        </div>
        <div className="col-lg-6">
          <FormElement
            type="text"
            label="Frequency(in days)"
            message={fieldErrors[`${prefix}Frequency`]}
            messageTone="error"
            inputProps={{ ...getInputProps(`${prefix}Frequency`, formValues, onFieldChange), placeholder: '' }}
          />
        </div>
        <div className="col-lg-6">
          <FormElement
            type="text"
            label="Remind Before days"
            inputProps={{ ...getInputProps(`${prefix}RemindBeforeDays`, formValues, onFieldChange), placeholder: '' }}
          />
        </div>
        <div className="col-lg-6">
          <FormElement
            type="text"
            label="Reminder Frequency"
            inputProps={{ ...getInputProps(`${prefix}ReminderFrequency`, formValues, onFieldChange), placeholder: '' }}
          />
        </div>
        <div className="col-12">
          <FormElement
            type="dropdown"
            label="Remind To"
            inputProps={{
              ...getInputProps(`${prefix}RemindTo`, formValues, onFieldChange),
              placeholder: 'Nothing selected',
              options: roleOptions,
            }}
          />
        </div>
        <div className="col-lg-6">
          <FormElement
            type="dropdown"
            label="Template"
            inputProps={{
              ...getInputProps(`${prefix}Template`, formValues, onFieldChange),
              placeholder: 'Select Template',
              options: templateOptions,
            }}
          />
        </div>
        <div className="col-lg-6">
          <FormElement
            type="dropdown"
            label="Workflow"
            inputProps={{
              ...getInputProps(`${prefix}Workflow`, formValues, onFieldChange),
              placeholder: 'Select Workflow',
              options: workflowOptions,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function CalibrationDetailsSection({ formValues, fieldErrors, onFieldChange }) {
  return (
    <MaintenanceScheduleSection
      prefix="calib"
      formValues={formValues}
      fieldErrors={fieldErrors}
      onFieldChange={onFieldChange}
    />
  );
}

function PreventiveMaintenanceSection({ formValues, fieldErrors, onFieldChange }) {
  return (
    <MaintenanceScheduleSection
      prefix="pm"
      formValues={formValues}
      fieldErrors={fieldErrors}
      onFieldChange={onFieldChange}
    />
  );
}

function BreakdownDetailsSection({ formValues, fieldErrors, onFieldChange }) {
  return (
    <MaintenanceScheduleSection
      prefix="bd"
      formValues={formValues}
      fieldErrors={fieldErrors}
      onFieldChange={onFieldChange}
    />
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

function WizardFooter({ currentStep, onPrev, onNext, onComplete, onCancel, mode }) {
  const prevLabel = currentStep > 0 ? wizardSteps[currentStep - 1] : 'Cancel';
  const isLast = currentStep === wizardSteps.length - 1;
  const handlePrevClick = currentStep > 0 ? onPrev : onCancel;

  if (mode === 'edit') {
    return (
      <div className="new-instrument-card__footer">
        <SecondaryButton className="new-instrument-cancel" leftIcon="close" onClick={onCancel}>
          Cancel
        </SecondaryButton>
        <PrimaryButton leftIcon="save" onClick={onComplete}>
          Save Changes
        </PrimaryButton>
      </div>
    );
  }

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

function InstrumentForm({ currentStep, formValues, fieldErrors, onFieldChange, onPrev, onNext, onComplete, onCancel, onStepChange, mode, title }) {
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
        <StepRail currentStep={currentStep} mode={mode} title={title} onStepChange={onStepChange} />
        <div className="new-instrument-form">
          <div className="new-instrument-form__stage">{sections[currentStep]}</div>
          <WizardFooter currentStep={currentStep} onPrev={onPrev} onNext={onNext} onComplete={onComplete} onCancel={onCancel} mode={mode} />
        </div>
      </div>
    </section>
  );
}

export default function NewInstrumentPage({
  mode = 'create',
  instrument = null,
  parentLabel = 'Instruments',
  onBack,
  onComplete,
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formValues, setFormValues] = useState(mode === 'edit' ? buildEditFormValues(instrument) : initialFormValues);
  const [fieldErrors, setFieldErrors] = useState({});
  const instrumentTitle = getInstrumentDisplayName(instrument);
  const currentCrumbLabel = mode === 'edit' ? `Edit ${instrumentTitle}` : 'New Instrument';

  useEffect(() => {
    setCurrentStep(0);
    setFormValues(mode === 'edit' ? buildEditFormValues(instrument) : initialFormValues);
    setFieldErrors({});
  }, [mode, instrument]);

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
    onComplete?.({
      ...instrument,
      ...formValues,
      name: formValues.name,
      uniqueKey: formValues.uniqueKey,
      serialNo: formValues.serialNumber,
      make: formValues.make,
      modelNo: formValues.model,
      description: formValues.description,
      lastServiceOn: formValues.pmLastPerformedOn || formValues.calibLastPerformedOn || instrument?.lastServiceOn || '',
      nextServiceOn: instrument?.nextServiceOn ?? '14/10/2026',
      calibrated: instrument?.calibrated ?? 'Yes',
    });
  };

  return (
    <div className="new-instrument-page">
      <TopBar parentLabel={parentLabel} currentLabel={currentCrumbLabel} onBack={onBack} />
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
          onStepChange={mode === 'edit' ? (stepIndex) => setCurrentStep(stepIndex) : undefined}
          mode={mode}
          title={instrumentTitle}
        />
      </main>
    </div>
  );
}
