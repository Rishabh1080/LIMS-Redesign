import { useEffect, useState } from 'react';
import { FormElement } from '../FormControls';
import Modal from '../Modal/Modal';
import PrimaryButton from '../PrimaryButton/PrimaryButton';
import SecondaryButton from '../SecondaryButton';

/*
 * Customer quick-add / details modal.
 *
 * Same field set in both modes. In "create" mode it starts blank and adds a new
 * customer; in "details" mode it is prefilled from the selected customer and
 * stays editable, so the primary action updates rather than creates.
 */

const emptyDraft = {
  name: '',
  legalName: '',
  gstNumber: '',
  contactPerson: '',
  email: '',
  phone: '',
  billToAddress: '',
  shipToAddress: '',
};

const textFields = [
  ['name', 'Name'],
  ['legalName', 'Legal Name'],
  ['gstNumber', 'GST Number'],
  ['contactPerson', 'Contact Person'],
  ['email', 'Contact Person Email'],
  ['phone', 'Contact Person Phone'],
];

function toDraft(customer) {
  if (!customer) return emptyDraft;

  return Object.keys(emptyDraft).reduce((draft, key) => {
    draft[key] = customer[key] ?? '';
    return draft;
  }, {});
}

export default function CustomerModal({
  open,
  mode = 'create',
  customer = null,
  onClose,
  onSubmit,
}) {
  const isDetails = mode === 'details';
  const [draft, setDraft] = useState(emptyDraft);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    setDraft(isDetails ? toDraft(customer) : emptyDraft);
    setErrors({});
  }, [open, isDetails, customer]);

  const updateDraft = (key, value) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const handleSubmit = () => {
    const nextErrors = Object.keys(emptyDraft).reduce((result, key) => {
      if (!String(draft[key] ?? '').trim()) result[key] = 'This field is required.';
      return result;
    }, {});

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    onSubmit?.({ ...draft });
  };

  return (
    <Modal
      open={open}
      title={isDetails ? 'Customer details' : 'Quick Add Customer'}
      titleId="customer-modal-title"
      titleIcon={isDetails ? 'info-circle' : 'plus'}
      size="large"
      cardClassName="smplfy-quick-add-customer-modal"
      onClose={onClose}
      actions={(
        <>
          <SecondaryButton leftIcon="close" onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton leftIcon="save" onClick={handleSubmit}>
            {isDetails ? 'Update' : 'Add Customer'}
          </PrimaryButton>
        </>
      )}
    >
      <form
        id="customer-modal-form"
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        <div className="row g-4">
          {textFields.map(([key, label]) => (
            <div className="col-12 col-md-6" key={key}>
              <FormElement
                type="text"
                mandatory
                label={label}
                message={errors[key]}
                messageTone="error"
                inputProps={{
                  value: draft[key],
                  placeholder: key === 'gstNumber' ? 'e.g. 24AABCU9603R1ZM' : undefined,
                  onChange: (event) => updateDraft(key, event.target.value),
                }}
              />
            </div>
          ))}

          <div className="col-12 col-md-6">
            <FormElement
              type="textarea"
              mandatory
              label="Bill to Address"
              message={errors.billToAddress}
              messageTone="error"
              inputProps={{
                value: draft.billToAddress,
                rows: 3,
                onChange: (event) => updateDraft('billToAddress', event.target.value),
              }}
            />
          </div>

          <div className="col-12 col-md-6">
            <FormElement
              type="textarea"
              mandatory
              label="Ship to Address"
              message={errors.shipToAddress}
              messageTone="error"
              inputProps={{
                value: draft.shipToAddress,
                rows: 3,
                onChange: (event) => updateDraft('shipToAddress', event.target.value),
              }}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
