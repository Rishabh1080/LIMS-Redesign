import AppIcon from '../AppIcon';
import './PrimaryButton.css';

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

export default function PrimaryButton({
  children,
  label,
  leftIcon,
  rightIcon,
  styleVariant = 'default',
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) {
  const resolvedLabel = children ?? label;
  const hasLabel = Boolean(resolvedLabel);
  const hasLeftIcon = Boolean(leftIcon);
  const hasRightIcon = Boolean(rightIcon);
  const variantClass =
    styleVariant && styleVariant !== 'default'
      ? `smplfy-primary-button--${styleVariant.toLowerCase()}`
      : '';

  return (
    <button
      type={type}
      disabled={disabled}
      className={joinClasses(
        'btn',
        'smplfy-primary-button',
        variantClass,
        hasLeftIcon && 'smplfy-primary-button--has-left-icon',
        hasRightIcon && 'smplfy-primary-button--has-right-icon',
        !hasLabel && 'smplfy-primary-button--icon-only',
        className,
      )}
      {...props}
    >
      {leftIcon ? (
        <span className="smplfy-primary-button__icon" aria-hidden="true">
          <AppIcon name={leftIcon} />
        </span>
      ) : null}

      {hasLabel ? <span className="smplfy-primary-button__label">{resolvedLabel}</span> : null}

      {rightIcon ? (
        <span className="smplfy-primary-button__icon" aria-hidden="true">
          <AppIcon name={rightIcon} />
        </span>
      ) : null}
    </button>
  );
}
