import './RadioButton.css';

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

export default function RadioButton({
  selected = false,
  state = 'default',
  className = '',
  ariaLabel,
  onClick,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={joinClasses('smplfy-radio-button', `smplfy-radio-button--${state}`, selected && 'is-selected', className)}
      aria-label={ariaLabel}
      aria-pressed={selected}
      onClick={onClick}
      {...props}
    >
      <span className="smplfy-radio-button__ring" />
      <span className="smplfy-radio-button__dot" />
    </button>
  );
}
