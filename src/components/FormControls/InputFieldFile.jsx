import { useEffect, useMemo, useRef, useState } from 'react';
import AppIcon from '../AppIcon';
import './form-controls.scss';

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
  disabled = false,
  onChange,
  ...props
}) {
  const inputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(value);
  const displayValue = useMemo(() => getDisplayValue(selectedFile), [selectedFile]);

  useEffect(() => {
    setSelectedFile(value);
  }, [value]);

  const isDisabled = disabled || state === 'disabled';
  const isInvalid = state === 'error';
  const isFilled = state === 'filled' || Boolean(displayValue);

  return (
    <div
      className={joinClasses(
        'smplfy-file-field',
        'input-group',
        isInvalid && 'is-invalid',
        className,
      )}
      data-filled={isFilled ? 'true' : 'false'}
      data-field-state={isDisabled ? 'disabled' : state}
    >
      <button
        type="button"
        className={joinClasses(
          'smplfy-file-display',
          'form-control',
          'btn',
          isInvalid && 'is-invalid',
        )}
        disabled={isDisabled}
        onClick={() => inputRef.current?.click()}
      >
        <span
          className={joinClasses(
            'smplfy-file-display__text',
            !displayValue && 'smplfy-file-display__text--placeholder',
          )}
        >
          {displayValue || placeholder}
        </span>
      </button>

      <button
        type="button"
        className="smplfy-file-button btn"
        disabled={isDisabled}
        aria-label="Choose file"
        onClick={() => inputRef.current?.click()}
      >
        <span className="smplfy-file-button__icon" aria-hidden="true">
          <AppIcon name="file-description" />
        </span>
      </button>

      <input
        ref={inputRef}
        className="smplfy-file-field__native-file"
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
