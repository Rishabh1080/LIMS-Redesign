import './RadioButton.scss';

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

export default function RadioButton({
  selected,
  checked,
  state = 'default',
  className = '',
  ariaLabel,
  'aria-label': ariaLabelAttribute,
  onClick,
  onChange,
  disabled = false,
  type: _type,
  ...props
}) {
  const isSelected = checked ?? selected ?? false;
  const resolvedAriaLabel = ariaLabel ?? ariaLabelAttribute;

  return (
    <input
      {...props}
      type="radio"
      checked={isSelected}
      aria-label={resolvedAriaLabel}
      disabled={disabled}
      readOnly={onChange ? undefined : true}
      className={joinClasses(
        'smplfy-form-check-input',
        'form-check-input',
        className,
      )}
      onClick={onClick}
      onChange={(event) => {
        onChange?.(event.target.checked, event);
      }}
    />
  );
}
