import { memo } from 'react';
import './form-controls.scss';

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

export default memo(function InputFieldText({
  state = 'default',
  filled = false,
  value = '',
  placeholder = '',
  className = '',
  variant = 'default',
  type = 'text',
  disabled = false,
  onChange,
  ...props
}) {
  const isDisabled = disabled || state === 'disabled';
  const isInvalid = state === 'error';
  const isFilled = filled || Boolean(value);
  const isTableCell = variant === 'table-cell';

  return (
    <input
      className={joinClasses(
        'smplfy-form-control',
        'form-control',
        isInvalid && 'is-invalid',
        !isFilled && 'smplfy-form-empty',
        state === 'hover' && 'smplfy-form-hover',
        state === 'focused' && 'smplfy-form-focused',
        isTableCell && 'smplfy-field-table-cell',
        className,
      )}
      type={type}
      value={value}
      placeholder={placeholder}
      disabled={isDisabled}
      onChange={onChange}
      {...props}
    />
  );
});
