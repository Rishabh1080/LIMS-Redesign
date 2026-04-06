import { useEffect, useState } from 'react';
import './form-controls.css';

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

export default function InputFieldText({
  state = 'default',
  filled = false,
  value = '',
  placeholder = '',
  className = '',
  onChange,
  ...props
}) {
  const [inputValue, setInputValue] = useState(value);
  useEffect(() => {
    setInputValue(value);
  }, [value]);
  const isDisabled = state === 'disabled';
  const isFilled = filled || Boolean(inputValue);

  return (
    <div
      className={joinClasses(
        'smplfy-input-field',
        `smplfy-input-field--${state === 'error' ? 'error' : isDisabled ? 'disabled' : 'default'}`,
        isFilled ? 'smplfy-input-field--filled' : 'smplfy-input-field--empty',
        className,
      )}
    >
      <div className="smplfy-input-field__shell">
        <input
          className="smplfy-input-field__control"
          type="text"
          value={inputValue}
          placeholder={placeholder}
          disabled={isDisabled}
          onChange={(event) => {
            setInputValue(event.target.value);
            onChange?.(event);
          }}
          {...props}
        />
      </div>
    </div>
  );
}
