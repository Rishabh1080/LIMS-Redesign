import { useEffect, useState } from 'react';
import AppIcon from '../AppIcon';
import './form-controls.scss';

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

export default function InputFieldDropdown({
  state = 'default',
  value = '',
  placeholder = '',
  options = [],
  className = '',
  disabled = false,
  onChange,
  ...props
}) {
  const [selectedValue, setSelectedValue] = useState(value);
  useEffect(() => {
    setSelectedValue(value);
  }, [value]);
  const isDisabled = disabled || state === 'disabled';
  const isInvalid = state === 'error';
  const isFilled = state === 'filled' || state === 'active-multiselect' || Boolean(selectedValue);
  const resolvedOptions = options.length
    ? options
    : ['Consumer Sample', 'Client Sample', 'Retention Sample', 'Market Sample'];

  return (
    <div
      className={joinClasses(
        'smplfy-select-field',
        className,
      )}
      data-filled={isFilled ? 'true' : 'false'}
      data-field-state={state}
    >
      <select
        className={joinClasses(
          'smplfy-form-select',
          'form-select',
          isInvalid && 'is-invalid',
        )}
        value={selectedValue}
        disabled={isDisabled}
        onChange={(event) => {
          setSelectedValue(event.target.value);
          onChange?.(event);
        }}
        {...props}
      >
        <option value="">{placeholder}</option>
        {resolvedOptions.map((option) => {
          const optionValue = typeof option === 'object' ? option.value : option;
          const optionLabel = typeof option === 'object' ? option.label : option;

          return (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          );
        })}
      </select>
      <span className="smplfy-select-icon" aria-hidden="true">
        <AppIcon name="chevron-down" />
      </span>
    </div>
  );
}
