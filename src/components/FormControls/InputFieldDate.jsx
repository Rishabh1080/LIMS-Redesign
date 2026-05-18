import { useEffect, useMemo, useRef, useState } from 'react';
import AppIcon from '../AppIcon';
import './form-controls.scss';

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

function toDateFromParts(day, month, year) {
  const parsed = new Date(Number(year), Number(month) - 1, Number(day));

  if (
    parsed.getFullYear() === Number(year) &&
    parsed.getMonth() === Number(month) - 1 &&
    parsed.getDate() === Number(day)
  ) {
    return parsed;
  }

  return null;
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
    const parsed = toDateFromParts(day, month, year);

    if (parsed) {
      return { display: toDisplayDate(parsed), iso: toIsoDate(parsed) };
    }
  }

  const namedMonthMatch = trimmed.match(
    /(?:\d{1,2}:\d{2}\s*(?:am|pm)\s*)?(\d{1,2})\s+([a-z]+)\s+(\d{4})/i
  );

  if (namedMonthMatch) {
    const [, day, monthName, year] = namedMonthMatch;
    const monthIndex = [
      'january',
      'february',
      'march',
      'april',
      'may',
      'june',
      'july',
      'august',
      'september',
      'october',
      'november',
      'december',
    ].indexOf(monthName.toLowerCase());

    if (monthIndex >= 0) {
      const parsed = toDateFromParts(day, monthIndex + 1, year);

      if (parsed) {
        return { display: toDisplayDate(parsed), iso: toIsoDate(parsed) };
      }
    }
  }

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    const parsed = toDateFromParts(day, month, year);

    if (parsed) {
      return { display: toDisplayDate(parsed), iso: trimmed };
    }
  }

  const fallback = new Date(trimmed);
  if (!Number.isNaN(fallback.getTime())) {
    return { display: toDisplayDate(fallback), iso: toIsoDate(fallback) };
  }

  return null;
}

function formatDateInput(value) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);

  return [day, month, year].filter(Boolean).join('/');
}

function createChangeEvent(sourceEvent, value) {
  return {
    ...sourceEvent,
    target: {
      ...sourceEvent.target,
      value,
    },
  };
}

export default function InputFieldDate({
  state = 'default',
  value = '',
  placeholder = 'DD/MM/YYYY',
  className = '',
  disabled = false,
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

  const isDisabled = disabled || state === 'disabled';
  const isFilled = state === 'filled' || Boolean(textValue);
  const isInvalid = state === 'error';
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
        'smplfy-date-field',
        'input-group',
        isInvalid && 'is-invalid',
        !isFilled && 'smplfy-form-empty',
        visualState === 'hover' && 'smplfy-form-hover',
        visualState === 'focused' && 'smplfy-form-focused',
        className,
      )}
    >
      <input
        ref={visibleInputRef}
        className={joinClasses(
          'smplfy-form-control',
          'form-control',
          !isFilled && 'smplfy-form-empty',
          isInvalid && 'is-invalid',
        )}
        type="text"
        inputMode="numeric"
        value={textValue}
        placeholder={placeholder}
        disabled={isDisabled}
        maxLength={10}
        pattern="\d{2}/\d{2}/\d{4}"
        onChange={(event) => {
          const nextValue = formatDateInput(event.target.value);
          setTextValue(nextValue);
          onChange?.(createChangeEvent(event, nextValue));
        }}
        onBlur={(event) => {
          const parsed = parseVisibleDate(event.target.value);

          if (parsed) {
            setTextValue(parsed.display);
            setPickerValue(parsed.iso);
            setLastValidText(parsed.display);
            setLastValidPickerValue(parsed.iso);
            onChange?.(createChangeEvent(event, parsed.display));
          } else if (event.target.value.trim()) {
            setTextValue(lastValidText);
            setPickerValue(lastValidPickerValue);
            onChange?.(createChangeEvent(event, lastValidText));
          } else {
            setTextValue('');
            setPickerValue('');
            setLastValidText('');
            setLastValidPickerValue('');
            onChange?.(createChangeEvent(event, ''));
          }

          onBlur?.(event);
        }}
        {...props}
      />

      <button
        type="button"
        className="smplfy-date-button smplfy-btn btn btn-light"
        aria-label="Open calendar"
        disabled={isDisabled}
        onClick={() => {
          pickerRef.current?.showPicker?.();
          pickerRef.current?.focus();
        }}
      >
        <AppIcon name="calendar" />
      </button>

      <input
        ref={pickerRef}
        className="visually-hidden"
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
            onChange?.(createChangeEvent(event, nextDisplay));
          } else {
            onChange?.(createChangeEvent(event, ''));
          }

          visibleInputRef.current?.focus();
        }}
      />
    </div>
  );
}
