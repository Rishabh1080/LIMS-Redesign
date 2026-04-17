import InputFieldDate from './InputFieldDate';
import InputFieldDropdown from './InputFieldDropdown';
import InputFieldFile from './InputFieldFile';
import InputFieldSplitSelector from './InputFieldSplitSelector';
import InputFieldText from './InputFieldText';
import './form-controls.css';

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

  return (
    <div className={`smplfy-form-element ${className}`.trim()}>
      <div className="smplfy-form-element__label-row">
        <label className="smplfy-form-element__label">{label}</label>
        {mandatory ? <span className="smplfy-form-element__required">*</span> : null}
      </div>

      <InputComponent {...inputProps} />

      {helperText ? <div className="smplfy-form-element__helper">{helperText}</div> : null}

      {message ? (
        <div className={`smplfy-form-element__message smplfy-form-element__message--${messageTone}`}>
          {message}
        </div>
      ) : null}
    </div>
  );
}
