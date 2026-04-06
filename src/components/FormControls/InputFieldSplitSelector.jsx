import { useEffect, useState } from 'react';
import AppIcon from '../AppIcon';
import './form-controls.css';

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
  onChange,
}) {
  const [inputValue, setInputValue] = useState(value);
  const [selectedUnit, setSelectedUnit] = useState(unit);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    setSelectedUnit(unit);
  }, [unit]);

  const isDisabled = state === 'disabled';
  const isFilled = state === 'filled' || state === 'expanded' || Boolean(inputValue) || Boolean(selectedUnit);

  return (
    <div
      className={joinClasses(
        'smplfy-input-field',
        `smplfy-input-field--${isDisabled ? 'disabled' : 'default'}`,
        isFilled ? 'smplfy-input-field--filled' : 'smplfy-input-field--empty',
        className,
      )}
    >
      <div className="smplfy-input-field__split">
        <input
          className="smplfy-input-field__control smplfy-input-field__control--split"
          type="text"
          value={inputValue}
          placeholder={placeholder}
          disabled={isDisabled}
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
        />
        <div className="smplfy-input-field__split-unit">
          <select
            className="smplfy-input-field__control smplfy-input-field__control--split-select"
            value={selectedUnit}
            disabled={isDisabled}
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
          <AppIcon name="chevron-down" className="smplfy-input-field__split-chevron" />
        </div>
      </div>
    </div>
  );
}
