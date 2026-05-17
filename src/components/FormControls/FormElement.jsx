import { useId } from 'react';
import InputFieldDate from './InputFieldDate';
import InputFieldDropdown from './InputFieldDropdown';
import InputFieldFile from './InputFieldFile';
import InputFieldSplitSelector from './InputFieldSplitSelector';
import InputFieldText from './InputFieldText';
import './form-controls.scss';

const inputByType = {
  text: InputFieldText,
  dropdown: InputFieldDropdown,
  date: InputFieldDate,
  file: InputFieldFile,
  split: InputFieldSplitSelector,
};

export default function FormElement({
  type = 'text',
  mandatory = false,
  label,
  helperText,
  message,
  messageTone = 'helper',
  inputProps = {},
  className = '',
}) {
  const InputComponent = inputByType[type] ?? InputFieldText;
  const generatedId = useId();
  const inputId = inputProps.id ?? `field-${generatedId}`;
  const helperId = helperText ? `${inputId}-helper` : undefined;
  const messageId = message ? `${inputId}-message` : undefined;
  const isInvalid = Boolean(message && messageTone === 'error');
  const describedBy = [inputProps['aria-describedby'], helperId, messageId]
    .filter(Boolean)
    .join(' ') || undefined;
  const resolvedInputProps = {
    ...inputProps,
    id: inputId,
    required: inputProps.required ?? mandatory,
    state: inputProps.state ?? (isInvalid ? 'error' : undefined),
    'aria-invalid': inputProps['aria-invalid'] ?? (isInvalid ? 'true' : undefined),
    'aria-describedby': describedBy,
  };

  return (
    <div className={`smplfy-form-field ${className}`.trim()}>
      {label ? (
        <div className="smplfy-form-label-row">
          <label className="smplfy-form-label form-label" htmlFor={inputId}>
            {label}
          </label>
          {mandatory ? <span className="smplfy-form-required">*</span> : null}
        </div>
      ) : null}

      <InputComponent {...resolvedInputProps} />

      {helperText ? (
        <div id={helperId} className="smplfy-form-text form-text">
          {helperText}
        </div>
      ) : null}

      {message ? (
        <div
          id={messageId}
          className={`smplfy-form-feedback ${
            messageTone === 'error' ? 'invalid-feedback' : 'form-text'
          }`}
          data-smplfy-tone={messageTone}
        >
          {message}
        </div>
      ) : null}
    </div>
  );
}
