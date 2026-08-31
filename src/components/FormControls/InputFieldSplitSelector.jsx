import { memo } from 'react';
import InputFieldRichDropdown from './InputFieldRichDropdown';
import './form-controls.scss';

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

export default memo(function InputFieldSplitSelector({
  state = 'default',
  value = '',
  unit = '',
  units = ['g', 'kg', 'ml', 'L'],
  placeholder = 'Value',
  unitPlaceholder = 'Unit',
  unitSuggestion = '',
  className = '',
  disabled = false,
  onChange,
  onFocus,
  onBlur,
  ...props
}) {
  const isDisabled = disabled || state === 'disabled';
  const isInvalid = state === 'error';
  const isFilled = state === 'filled' || state === 'expanded' || Boolean(value) || Boolean(unit);

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
        value={value}
        placeholder={placeholder}
        disabled={isDisabled}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={(event) => {
          onChange?.({
            target: {
              value: event.target.value,
              unit,
            },
          });
        }}
        {...props}
      />
      <InputFieldRichDropdown
        className="smplfy-split-unit-dropdown"
        value={unit}
        options={units}
        placeholder={unitPlaceholder}
        suggestion={unitSuggestion}
        disabled={isDisabled}
        state={isInvalid ? 'error' : undefined}
        aria-label={props['aria-label'] ? `${props['aria-label']} unit` : 'Unit'}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={(event) => {
          onChange?.({
            target: {
              value,
              unit: event.target.value,
            },
          });
        }}
      />
    </div>
  );
});
