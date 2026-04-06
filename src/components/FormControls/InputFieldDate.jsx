import { useEffect, useMemo, useRef, useState } from 'react';
import AppIcon from '../AppIcon';
import './form-controls.css';

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

function pad(value) {
  return String(value).padStart(2, '0');
}

function toIsoDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toDisplayDate(date) {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

function parseVisibleDate(value) {
  const trimmed = value.trim();

  if (!trimmed) {
    return { display: '', iso: '' };
  }

  const dateTimeMatch = trimmed.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[\s,]+(\d{1,2}):(\d{2}))?$/
  );

  if (dateTimeMatch) {
    const [, day, month, year] = dateTimeMatch;
    const parsed = new Date(Number(year), Number(month) - 1, Number(day));

    if (
      parsed.getFullYear() === Number(year) &&
      parsed.getMonth() === Number(month) - 1 &&
      parsed.getDate() === Number(day)
    ) {
      return { display: trimmed, iso: toIsoDate(parsed) };
    }
  }

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    const parsed = new Date(Number(year), Number(month) - 1, Number(day));

    if (
      parsed.getFullYear() === Number(year) &&
      parsed.getMonth() === Number(month) - 1 &&
      parsed.getDate() === Number(day)
    ) {
      return { display: toDisplayDate(parsed), iso: trimmed };
    }
  }

  const fallback = new Date(trimmed);
  if (!Number.isNaN(fallback.getTime())) {
    return { display: trimmed, iso: toIsoDate(fallback) };
  }

  return null;
}

export default function InputFieldDate({
  state = 'default',
  value = '',
  placeholder = '',
  className = '',
  onChange,
  onBlur,
  ...props
}) {
  const pickerRef = useRef(null);
  const visibleInputRef = useRef(null);
  const initialParsed = useMemo(() => parseVisibleDate(value) ?? { display: value, iso: '' }, [value]);
  const [textValue, setTextValue] = useState(initialParsed.display);
  const [pickerValue, setPickerValue] = useState(initialParsed.iso);
  const [lastValidText, setLastValidText] = useState(initialParsed.display);
  const [lastValidPickerValue, setLastValidPickerValue] = useState(initialParsed.iso);

  useEffect(() => {
    const parsed = parseVisibleDate(value) ?? { display: value, iso: '' };
    setTextValue(parsed.display);
    setPickerValue(parsed.iso);
    setLastValidText(parsed.display);
    setLastValidPickerValue(parsed.iso);
  }, [value]);

  const isDisabled = state === 'disabled';
  const isFilled = state === 'filled' || Boolean(textValue);
  const visualState = isDisabled
    ? 'disabled'
    : state === 'hover'
      ? 'hover'
      : state === 'focused'
        ? 'focused'
        : state === 'error'
          ? 'error'
          : 'default';

  return (
    <div
      className={joinClasses(
        'smplfy-input-field',
        'smplfy-input-field--date-field',
        `smplfy-input-field--${visualState}`,
        isFilled ? 'smplfy-input-field--filled' : 'smplfy-input-field--empty',
        className,
      )}
    >
      <div className="smplfy-input-field__shell smplfy-input-field__shell--date">
        <input
          ref={visibleInputRef}
          className="smplfy-input-field__control smplfy-input-field__control--date-text"
          type="text"
          inputMode="numeric"
          value={textValue}
          placeholder={placeholder}
          disabled={isDisabled}
          onChange={(event) => {
            setTextValue(event.target.value);
            onChange?.(event);
          }}
          onBlur={(event) => {
            const parsed = parseVisibleDate(event.target.value);

            if (parsed) {
              setTextValue(parsed.display);
              setPickerValue(parsed.iso);
              setLastValidText(parsed.display);
              setLastValidPickerValue(parsed.iso);
            } else if (event.target.value.trim()) {
              setTextValue(lastValidText);
              setPickerValue(lastValidPickerValue);
            } else {
              setTextValue('');
              setPickerValue('');
              setLastValidText('');
              setLastValidPickerValue('');
            }

            onBlur?.(event);
          }}
          {...props}
        />

        <button
          type="button"
          className="btn smplfy-input-field__action smplfy-input-field__action--date"
          aria-label="Open date picker"
          disabled={isDisabled}
          onClick={() => {
            pickerRef.current?.showPicker?.();
            pickerRef.current?.focus();
          }}
        >
          <input
            ref={pickerRef}
            className="smplfy-input-field__native-picker"
            type="date"
            tabIndex={-1}
            aria-hidden="true"
            value={pickerValue}
            disabled={isDisabled}
            onChange={(event) => {
              setPickerValue(event.target.value);

              if (event.target.value) {
                const [year, month, day] = event.target.value.split('-').map(Number);
                const nextDate = new Date(year, month - 1, day);
                const nextDisplay = toDisplayDate(nextDate);
                setTextValue(nextDisplay);
                setLastValidText(nextDisplay);
                setLastValidPickerValue(event.target.value);
                onChange?.({ target: { value: nextDisplay } });
              } else {
                onChange?.({ target: { value: '' } });
              }

              visibleInputRef.current?.focus();
            }}
          />
          <AppIcon name="calendar" className="smplfy-input-field__calendar" />
        </button>
      </div>
    </div>
  );
}
