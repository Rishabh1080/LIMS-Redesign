import { useEffect, useState } from 'react';
import AppIcon from '../AppIcon';
import './form-controls.css';

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

export default function InputFieldDropdown({
  state = 'default',
  value = '',
  placeholder = '',
  options = [],
  className = '',
  onChange,
  ...props
}) {
  const [selectedValue, setSelectedValue] = useState(value);
  useEffect(() => {
    setSelectedValue(value);
  }, [value]);
  const isDisabled = state === 'disabled';
  const isFilled = state === 'filled' || state === 'active-multiselect' || Boolean(selectedValue);
  const resolvedOptions = options.length
    ? options
    : ['Consumer Sample', 'Client Sample', 'Retention Sample', 'Market Sample'];

  return (
    <div
      className={joinClasses(
        'smplfy-input-field',
        `smplfy-input-field--${isDisabled ? 'disabled' : 'default'}`,
        isFilled ? 'smplfy-input-field--filled' : 'smplfy-input-field--empty',
        className,
      )}
    >
      <div className="smplfy-input-field__shell">
        <select
          className="smplfy-input-field__control smplfy-input-field__control--select"
          value={selectedValue}
          disabled={isDisabled}
          onChange={(event) => {
            setSelectedValue(event.target.value);
            onChange?.(event);
          }}
          {...props}
        >
          <option value="">{placeholder}</option>
          {resolvedOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <span className="smplfy-input-field__icon" aria-hidden="true">
          <AppIcon name="chevron-down" />
        </span>
      </div>
    </div>
  );
}
