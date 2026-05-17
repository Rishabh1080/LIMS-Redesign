import { useEffect, useState } from 'react';
import './form-controls.scss';

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

export default function InputFieldText({
  state = 'default',
  filled = false,
  value = '',
  placeholder = '',
  className = '',
  type = 'text',
  disabled = false,
  onChange,
  ...props
}) {
  const [inputValue, setInputValue] = useState(value);
  useEffect(() => {
    setInputValue(value);
  }, [value]);
  const isDisabled = disabled || state === 'disabled';
  const isInvalid = state === 'error';
  const isFilled = filled || Boolean(inputValue);

  return (
    <input
      className={joinClasses(
        'smplfy-form-control',
        'form-control',
        isInvalid && 'is-invalid',
        className,
      )}
      type={type}
      value={inputValue}
      placeholder={placeholder}
      disabled={isDisabled}
      data-filled={isFilled ? 'true' : 'false'}
      data-field-state={state}
      onChange={(event) => {
        setInputValue(event.target.value);
        onChange?.(event);
      }}
      {...props}
    />
  );
}
