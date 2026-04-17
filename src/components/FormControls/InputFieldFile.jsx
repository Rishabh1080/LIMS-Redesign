import { useEffect, useMemo, useRef, useState } from 'react';
import AppIcon from '../AppIcon';
import './form-controls.css';

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

function getDisplayValue(value) {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (value?.name) {
    return value.name;
  }

  return '';
}

export default function InputFieldFile({
  state = 'default',
  value = null,
  placeholder = '',
  accept = '.pdf,.doc,.docx',
  className = '',
  onChange,
  ...props
}) {
  const inputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(value);
  const displayValue = useMemo(() => getDisplayValue(selectedFile), [selectedFile]);

  useEffect(() => {
    setSelectedFile(value);
  }, [value]);

  const isDisabled = state === 'disabled';
  const isFilled = state === 'filled' || Boolean(displayValue);

  return (
    <div
      className={joinClasses(
        'smplfy-input-field',
        `smplfy-input-field--${state === 'error' ? 'error' : isDisabled ? 'disabled' : 'default'}`,
        isFilled ? 'smplfy-input-field--filled' : 'smplfy-input-field--empty',
        className,
      )}
    >
      <button
        type="button"
        className="btn smplfy-input-field__shell smplfy-input-field__shell--file"
        disabled={isDisabled}
        onClick={() => inputRef.current?.click()}
      >
        <span
          className={joinClasses(
            'smplfy-input-field__control',
            'smplfy-input-field__control--file-display',
            !displayValue && 'smplfy-input-field__control--file-placeholder',
          )}
        >
          {displayValue || placeholder}
        </span>
        <span className="smplfy-input-field__icon smplfy-input-field__icon--file" aria-hidden="true">
          <AppIcon name="file-description" />
        </span>
      </button>

      <input
        ref={inputRef}
        className="smplfy-input-field__native-file"
        type="file"
        accept={accept}
        disabled={isDisabled}
        onChange={(event) => {
          const nextFile = event.target.files?.[0] ?? null;
          setSelectedFile(nextFile);
          onChange?.({
            ...event,
            target: {
              ...event.target,
              value: nextFile,
            },
          });
        }}
        {...props}
      />
    </div>
  );
}
