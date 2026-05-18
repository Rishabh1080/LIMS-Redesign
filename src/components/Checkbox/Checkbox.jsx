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
      disabled={disabled}
      readOnly={onChange ? undefined : true}
      className={joinClasses(
        'smplfy-form-check-input',
        'form-check-input',
        className,
      )}
      onChange={(event) => {
        onChange?.(event.target.checked, event);
      }}
    />
  );
}
