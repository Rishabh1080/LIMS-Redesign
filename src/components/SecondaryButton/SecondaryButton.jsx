import AppIcon from '../AppIcon';
import './SecondaryButton.css';

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

export default function SecondaryButton({
  children,
  label,
  leftIcon,
  rightIcon,
  size = 'large',
  tone = 'neutral',
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) {
  const resolvedLabel = children ?? label;
  const hasLabel = Boolean(resolvedLabel);
  const hasLeftIcon = Boolean(leftIcon);
  const hasRightIcon = Boolean(rightIcon);
  const sizeClass = size ? `smplfy-secondary-button--${size.toLowerCase()}` : '';
  const toneClass = tone ? `smplfy-secondary-button--tone-${tone.toLowerCase()}` : '';

  return (
    <button
      type={type}
      disabled={disabled}
      className={joinClasses(
        'btn',
        'smplfy-secondary-button',
        sizeClass,
        toneClass,
        hasLeftIcon && 'smplfy-secondary-button--has-left-icon',
        hasRightIcon && 'smplfy-secondary-button--has-right-icon',
        !hasLabel && 'smplfy-secondary-button--icon-only',
        className,
      )}
      {...props}
    >
      {leftIcon ? (
        <span className="smplfy-secondary-button__icon" aria-hidden="true">
          <AppIcon name={leftIcon} />
        </span>
      ) : null}

      {hasLabel ? <span className="smplfy-secondary-button__label">{resolvedLabel}</span> : null}

      {rightIcon ? (
        <span className="smplfy-secondary-button__icon" aria-hidden="true">
          <AppIcon name={rightIcon} />
        </span>
      ) : null}
    </button>
  );
}
