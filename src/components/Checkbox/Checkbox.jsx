import './Checkbox.css';

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

export default function Checkbox({
  checked = false,
  onChange,
  className = '',
  ariaLabel,
  disabled = false,
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      className={joinClasses('smplfy-checkbox', checked && 'is-checked', className)}
      onClick={() => {
        if (disabled) {
          return;
        }

        onChange?.(!checked);
      }}
    >
      <span className="smplfy-checkbox__box">
        <svg
          className="smplfy-checkbox__tick"
          width="6"
          height="4"
          viewBox="0 0 6 4"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M1 2L2.4 3.3L5 1" />
        </svg>
      </span>
    </button>
  );
}
