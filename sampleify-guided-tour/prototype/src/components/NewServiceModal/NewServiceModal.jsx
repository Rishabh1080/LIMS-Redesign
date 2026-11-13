import { useEffect, useMemo, useState } from 'react';
import { FormElement } from '../FormControls';
import Modal from '../Modal/Modal';
import PrimaryButton from '../PrimaryButton/PrimaryButton';
import SecondaryButton from '../SecondaryButton';

const serviceTypeOptions = ['Calibration', 'Preventive Maintenance'];
const calibrationTypeOptions = ['Internal Calibration', 'External Calibration'];
const vendorOptions = [
  'Anton Paar India',
  'Shimadzu Scientific Instruments',
  'Agilent Technologies',
  'PerkinElmer Service',
  'Mettler Toledo Support',
];

function resolveInitialServiceType(value) {
  if (!value) return '';
  if (serviceTypeOptions.includes(value)) return value;

  const normalizedValue = String(value ?? '').trim().toLowerCase();

  if (normalizedValue === 'maintenance' || normalizedValue === 'service') {
    return 'Preventive Maintenance';
  }

  return '';
}

function getInitialServiceDraft(initialInstrumentId = '', initialServiceType = '') {
  return {
    instrumentId: initialInstrumentId,
    serviceType: resolveInitialServiceType(initialServiceType),
    calibrationType: '',
    serviceDate: '',
    vendor: '',
    nextServiceOn: '',
    attachment: null,
    details: '',
  };
}

export default function NewServiceModal({
  open,
  instrumentOptions = [],
  initialInstrumentId = '',
  initialServiceType = '',
  showInstrumentField = false,
  instrumentFieldDisabled = false,
  onCancel,
  onSubmit,
}) {
  const initialDraft = useMemo(
    () => getInitialServiceDraft(initialInstrumentId, initialServiceType),
    [initialInstrumentId, initialServiceType],
  );
  const [draft, setDraft] = useState(initialDraft);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setDraft(initialDraft);
      setErrors({});
    }
  }, [initialDraft, open]);

  const update = (field, value) => {
    setDraft((current) => ({
      ...current,
      [field]: value,
      ...(field === 'serviceType' && value !== 'Calibration' ? { calibrationType: '' } : {}),
    }));
    if (errors[field]) {
      setErrors((current) => {
        const nextErrors = { ...current };
        delete nextErrors[field];
        return nextErrors;
      });
    }
  };

  const handleSubmit = () => {
    const nextErrors = {};

    if (showInstrumentField && !draft.instrumentId) {
      nextErrors.instrumentId = 'Instrument is required.';
    }

    if (!draft.serviceType) {
      nextErrors.serviceType = 'Type of service is required.';
    }

    if (!draft.serviceDate) {
      nextErrors.serviceDate = 'Service date is required.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const submittedDraft = { ...draft };
    setDraft(initialDraft);
    setErrors({});
    onSubmit(submittedDraft);
  };

  const handleCancel = () => {
    setDraft(initialDraft);
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
      size="xl"
      actions={
        <>
          <SecondaryButton leftIcon="close" size="large" onClick={handleCancel}>Cancel</SecondaryButton>
          <PrimaryButton leftIcon="save" onClick={handleSubmit}>Submit</PrimaryButton>
        </>
      }
    >
      <form
        className="d-flex flex-column gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        <div className="row g-3">
          <div className="col-12">
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <FormElement
                  type="dropdown"
                  mandatory
                  label="Type of service"
                  message={errors.serviceType}
                  messageTone="error"
                  inputProps={{
                    value: draft.serviceType,
                    placeholder: 'Select service type',
                    options: serviceTypeOptions,
                    onChange: (event) => update('serviceType', event.target.value),
                  }}
                />
              </div>
              <div className="col-12 col-md-6">
                {draft.serviceType === 'Calibration' ? (
                  <FormElement
                    type="dropdown"
                    label="Type of calibration"
                    inputProps={{
                      value: draft.calibrationType,
                      placeholder: 'Select calibration type',
                      options: calibrationTypeOptions,
                      onChange: (event) => update('calibrationType', event.target.value),
                    }}
                  />
                ) : null}
              </div>
            </div>
          </div>

          {showInstrumentField ? (
            <div className="col-12">
              <FormElement
                type="dropdown"
                mandatory
                label="Instrument"
                message={errors.instrumentId}
                messageTone="error"
                inputProps={{
                  value: draft.instrumentId,
                  placeholder: 'Select instrument',
                  options: instrumentOptions,
                  disabled: instrumentFieldDisabled,
                  onChange: (event) => update('instrumentId', event.target.value),
                }}
              />
            </div>
          ) : null}
          <div className="col-12 col-md-6">
            <FormElement
              type="date"
              mandatory
              label="Service date"
              message={errors.serviceDate}
              messageTone="error"
              inputProps={{
                value: draft.serviceDate,
                placeholder: 'Select date',
                onChange: (event) => update('serviceDate', event.target.value),
              }}
            />
          </div>
          <div className="col-12 col-md-6">
            <FormElement
              type="dropdown"
              label="Vendor"
              inputProps={{
                value: draft.vendor,
                placeholder: 'Select vendor',
                options: vendorOptions,
                onChange: (event) => update('vendor', event.target.value),
              }}
            />
          </div>
          <div className="col-12 col-md-6">
            <FormElement
              type="date"
              label="Next service on"
              message={errors.nextServiceOn}
              messageTone="error"
              inputProps={{
                value: draft.nextServiceOn,
                placeholder: 'Select date',
                onChange: (event) => update('nextServiceOn', event.target.value),
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
                onChange: (event) => update('attachment', event.target.value),
              }}
            />
          </div>
        </div>
        <div>
          <FormElement
            type="textarea"
            label="Details and Summary"
            inputProps={{
              value: draft.details,
              placeholder: 'Enter the details of the service',
              rows: 5,
              onChange: (event) => update('details', event.target.value),
            }}
          />
        </div>
      </form>
    </Modal>
  );
}
