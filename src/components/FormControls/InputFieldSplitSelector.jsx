import { useEffect, useState } from 'react';
import InputFieldRichDropdown from './InputFieldRichDropdown';
import './form-controls.scss';

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

export default function InputFieldSplitSelector({
  state = 'default',
  value = '',
  unit = '',
  units = ['g', 'kg', 'ml', 'L'],
  placeholder = 'Value',
  unitPlaceholder = 'Unit',
  className = '',
  disabled = false,
  onChange,
  onFocus,
  onBlur,
  ...props
}) {
  const [inputValue, setInputValue] = useState(value);
  const [selectedUnit, setSelectedUnit] = useState(unit);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    setSelectedUnit(unit);
  }, [unit]);

  const isDisabled = disabled || state === 'disabled';
  const isInvalid = state === 'error';
  const isFilled = state === 'filled' || state === 'expanded' || Boolean(inputValue) || Boolean(selectedUnit);

  return (
    <div
      className={joinClasses(
        'smplfy-split-field',
        'input-group',
        isInvalid && 'is-invalid',
        !isFilled && 'smplfy-form-empty',
        state === 'hover' && 'smplfy-form-hover',
        state === 'focused' && 'smplfy-form-focused',
        className,
      )}
    >
      <input
        className={joinClasses(
          'smplfy-form-control',
          'form-control',
          isInvalid && 'is-invalid',
        )}
        type="text"
        value={inputValue}
        placeholder={placeholder}
        disabled={isDisabled}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={(event) => {
          const nextValue = event.target.value;
          setInputValue(nextValue);
          onChange?.({
            target: {
              value: nextValue,
              unit: selectedUnit,
            },
          });
        }}
        {...props}
      />
      <InputFieldRichDropdown
        className="smplfy-split-unit-dropdown"
        value={selectedUnit}
        options={units}
        placeholder={unitPlaceholder}
        disabled={isDisabled}
        state={isInvalid ? 'error' : undefined}
        aria-label={props['aria-label'] ? `${props['aria-label']} unit` : 'Unit'}
        onBlur={onBlur}
        onChange={(event) => {
          const nextUnit = event.target.value;
          setSelectedUnit(nextUnit);
          onChange?.({
            target: {
              value: inputValue,
              unit: nextUnit,
            },
          });
        }}
      />
    </div>
  );
}
