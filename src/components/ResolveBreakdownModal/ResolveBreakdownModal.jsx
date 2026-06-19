import { useEffect, useState } from 'react';
import { FormElement } from '../FormControls';
import Modal from '../Modal/Modal';
import PrimaryButton from '../PrimaryButton/PrimaryButton';
import SecondaryButton from '../SecondaryButton';

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

const vendorOptions = [
  'Anton Paar India',
  'Shimadzu Scientific Instruments',
  'Agilent Technologies',
  'PerkinElmer Service',
  'Mettler Toledo Support',
];

function getInitialResolveBreakdownDraft() {
  return {
    serviceDate: '',
    vendor: '',
    attachment: null,
    cost: '',
    comments: '',
  };
}

function getInrDigits(value) {
  return String(value ?? '').replace(/\D/g, '').replace(/^0+(?=\d)/, '');
}

function formatInrAmount(value) {
  const digits = getInrDigits(value);

  if (!digits) return '';
  if (digits.length <= 3) return digits;

  const lastThreeDigits = digits.slice(-3);
  const leadingDigits = digits.slice(0, -3);
  const groupedLeadingDigits = leadingDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ',');

  return `${groupedLeadingDigits},${lastThreeDigits}`;
}

export default function ResolveBreakdownModal({
  open,
  breakdownDate = '',
  onCancel,
  onSubmit,
}) {
  const [draft, setDraft] = useState(getInitialResolveBreakdownDraft);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setDraft(getInitialResolveBreakdownDraft());
      setErrors({});
    }
  }, [open]);

  const update = (field, value) => {
    setDraft((current) => ({
      ...current,
      [field]: value,
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

    if (!draft.serviceDate) nextErrors.serviceDate = 'Service date is required.';
    if (!draft.vendor) nextErrors.vendor = 'Vendor is required.';
    if (!draft.cost) nextErrors.cost = 'Cost is required.';
    if (!draft.comments.trim()) nextErrors.comments = 'Comments are required.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    onSubmit?.(draft);
  };

  return (
    <Modal
      open={open}
      title="Resolve Breakdown"
      titleId="resolve-breakdown-title"
      titleIcon="check"
      onClose={onCancel}
      size="lg"
      actionsClassName="border-top"
      actions={
        <>
          <SecondaryButton leftIcon="close" onClick={onCancel}>Cancel</SecondaryButton>
          <PrimaryButton leftIcon="check" onClick={handleSubmit}>Resolve Breakdown</PrimaryButton>
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
          <div className="col-12 col-md-6">
            <FormElement
              type="text"
              label="Breakdown date"
              inputProps={{
                value: breakdownDate || '-',
                disabled: true,
              }}
            />
          </div>
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
              mandatory
              label="Vendor"
              message={errors.vendor}
              messageTone="error"
              inputProps={{
                value: draft.vendor,
                placeholder: 'Select vendor',
                options: vendorOptions,
                onChange: (event) => update('vendor', event.target.value),
              }}
            />
          </div>
          <div className="col-12 col-md-6">
            <div className="smplfy-form-field">
              <div className="smplfy-form-label-row">
                <label className="smplfy-form-label form-label" htmlFor="resolve-breakdown-cost">
                  Cost (INR)
                </label>
                <span className="smplfy-form-required">*</span>
              </div>
              <div
                className={joinClasses(
                  'input-group',
                  !draft.cost && 'smplfy-form-empty',
                  errors.cost && 'is-invalid',
                )}
              >
                <span className="input-group-text" aria-hidden="true">₹</span>
                <input
                  id="resolve-breakdown-cost"
                  className={joinClasses(
                    'smplfy-form-control',
                    'form-control',
                    errors.cost && 'is-invalid',
                    !draft.cost && 'smplfy-form-empty',
                  )}
                  type="text"
                  inputMode="numeric"
                  value={formatInrAmount(draft.cost)}
                  placeholder="Amount in INR"
                  aria-invalid={errors.cost ? 'true' : undefined}
                  aria-describedby={errors.cost ? 'resolve-breakdown-cost-message' : undefined}
                  onChange={(event) => update('cost', getInrDigits(event.target.value))}
                />
              </div>
              {errors.cost ? (
                <div id="resolve-breakdown-cost-message" className="smplfy-form-feedback invalid-feedback">
                  {errors.cost}
                </div>
              ) : null}
            </div>
          </div>
          <div className="col-12">
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

        <FormElement
          type="textarea"
          mandatory
          label="Comments"
          message={errors.comments}
          messageTone="error"
          inputProps={{
            value: draft.comments,
            placeholder: 'Add resolution comments',
            rows: 5,
            onChange: (event) => update('comments', event.target.value),
          }}
        />
      </form>
    </Modal>
  );
}
