import './Checkbox.scss';

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

export default function Checkbox({
  checked = false,
  onChange,
  className = '',
  ariaLabel,
  'aria-label': ariaLabelAttribute,
  disabled = false,
  invalid = false,
  type: _type,
  ...props
}) {
  const resolvedAriaLabel = ariaLabel ?? ariaLabelAttribute;

  return (
    <input
      {...props}
      type="checkbox"
      checked={checked}
      aria-label={resolvedAriaLabel}
      aria-invalid={props['aria-invalid'] ?? (invalid ? 'true' : undefined)}
      disabled={disabled}
      readOnly={onChange ? undefined : true}
      className={joinClasses(
        'smplfy-form-check-input',
        'form-check-input',
        invalid ? 'is-invalid' : '',
        className,
      )}
      onChange={(event) => {
        onChange?.(event.target.checked, event);
      }}
    />
  );
}
