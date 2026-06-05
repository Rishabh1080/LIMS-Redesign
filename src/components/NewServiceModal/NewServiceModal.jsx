import { useEffect, useMemo, useState } from 'react';
import { FormElement } from '../FormControls';
import Modal from '../Modal/Modal';
import NavSelector from '../NavSelector';
import PrimaryButton from '../PrimaryButton/PrimaryButton';
import SecondaryButton from '../SecondaryButton';
import { serviceTypeTabs } from '../../data/instrumentServices';

const serviceTypeOptions = serviceTypeTabs.map((tab) => tab.label);

function getInitialServiceDraft(initialInstrumentId = '') {
  return {
    instrumentId: initialInstrumentId,
    serviceType: serviceTypeOptions[0],
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
  showInstrumentField = false,
  instrumentFieldDisabled = false,
  onCancel,
  onSubmit,
}) {
  const initialDraft = useMemo(
    () => getInitialServiceDraft(initialInstrumentId),
    [initialInstrumentId],
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
    setDraft((current) => ({ ...current, [field]: value }));
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

    if (!draft.nextServiceOn) {
      nextErrors.nextServiceOn = 'Next service date is required.';
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
      size="md"
      actions={
        <>
          <SecondaryButton leftIcon="close" size="large" onClick={handleCancel}>Cancel</SecondaryButton>
          <PrimaryButton leftIcon="save" onClick={handleSubmit}>Submit</PrimaryButton>
        </>
      }
    >
      <form
        className="d-flex flex-column gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        <div className="row g-3">
          <div className="col-12">
            <div className="smplfy-form-label-row mb-2">
              <span className="smplfy-form-label form-label">Type of Service</span>
              <span className="smplfy-form-required">*</span>
            </div>

            <div className="nav nav-pills p-1 bg-body-tertiary border rounded" role="tablist" aria-label="Type of Service">
              {serviceTypeOptions.map((option) => {
                const isActive = draft.serviceType === option;

                return (
                  <NavSelector
                    key={option}
                    type="button"
                    size="medium"
                    active={isActive}
                    className="flex-fill"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => update('serviceType', option)}
                  >
                    {option}
                  </NavSelector>
                );
              })}
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
              type="text"
              label="Vendor"
              inputProps={{
                value: draft.vendor,
                placeholder: 'eg.',
                onChange: (event) => update('vendor', event.target.value),
              }}
            />
          </div>
          <div className="col-12 col-md-6">
            <FormElement
              type="date"
              mandatory
              label="Next Service On"
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
            type="text"
            label="Details and Summary"
            inputProps={{
              value: draft.details,
              placeholder: 'Enter the details of the service',
              onChange: (event) => update('details', event.target.value),
            }}
          />
        </div>
      </form>
    </Modal>
  );
}
