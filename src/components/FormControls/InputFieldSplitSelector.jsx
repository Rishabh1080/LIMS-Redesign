import { useEffect, useState } from 'react';
import AppIcon from '../AppIcon';
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
        className,
      )}
      data-filled={isFilled ? 'true' : 'false'}
      data-field-state={isDisabled ? 'disabled' : state}
    >
      <input
        className={joinClasses(
          'smplfy-form-control',
          'form-control',
          'smplfy-split-field__input',
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
      <div className="smplfy-split-field__unit">
        <select
          className={joinClasses(
            'smplfy-form-select',
            'form-select',
            'smplfy-split-field__select',
            isInvalid && 'is-invalid',
          )}
          value={selectedUnit}
          disabled={isDisabled}
          onFocus={onFocus}
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
        >
          <option value="">{unitPlaceholder}</option>
          {units.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <AppIcon name="chevron-down" className="smplfy-split-field__chevron" />
      </div>
    </div>
  );
}
