import { useEffect, useState } from 'react';
import './form-controls.scss';

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

export default function InputFieldTextarea({
  state = 'default',
  filled = false,
  value = '',
  placeholder = '',
  className = '',
  disabled = false,
  rows = 5,
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
    <textarea
      className={joinClasses(
        'smplfy-form-control',
        'form-control',
        'smplfy-form-textarea',
        isInvalid && 'is-invalid',
        !isFilled && 'smplfy-form-empty',
        state === 'hover' && 'smplfy-form-hover',
        state === 'focused' && 'smplfy-form-focused',
        className,
      )}
      value={inputValue}
      placeholder={placeholder}
      disabled={isDisabled}
      rows={rows}
      onChange={(event) => {
        setInputValue(event.target.value);
        onChange?.(event);
      }}
      {...props}
    />
  );
}
