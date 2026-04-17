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
  size = 'default',
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) {
  const resolvedLabel = children ?? label;
  const hasLabel = Boolean(resolvedLabel);
  const hasLeftIcon = Boolean(leftIcon);
  const hasRightIcon = Boolean(rightIcon);
  const iconOnly = !hasLabel;
  const resolvedSize = String(size || 'default').toLowerCase();
  const isSmall = resolvedSize === 'small';
  const variantClass =
    styleVariant && styleVariant !== 'default'
      ? `smplfy-primary-button--${styleVariant.toLowerCase()}`
      : '';
  const sizeClass = size && size !== 'default' ? `smplfy-primary-button--${size.toLowerCase()}` : '';
  const buttonStyle = hasLabel
    ? hasLeftIcon && hasRightIcon
      ? {
          '--primary-button-padding-inline-start': isSmall
            ? 'var(--smplfy-component-button-space-padding-inline-small-leading-icon-start)'
            : 'var(--smplfy-component-button-space-padding-inline-both-icons)',
          '--primary-button-padding-inline-end': isSmall
            ? 'var(--smplfy-component-button-space-padding-inline-small-leading-icon-start)'
            : 'var(--smplfy-component-button-space-padding-inline-both-icons)',
        }
      : hasLeftIcon
        ? {
            '--primary-button-padding-inline-start': isSmall
              ? 'var(--smplfy-component-button-space-padding-inline-small-leading-icon-start)'
              : 'var(--smplfy-component-button-space-padding-inline-leading-icon-start)',
            '--primary-button-padding-inline-end': isSmall
              ? 'var(--smplfy-component-button-space-padding-inline-small-leading-icon-end)'
              : 'var(--smplfy-component-button-space-padding-inline-leading-icon-end)',
          }
        : hasRightIcon
          ? {
              '--primary-button-padding-inline-start': isSmall
                ? 'var(--smplfy-component-button-space-padding-inline-small-leading-icon-end)'
                : 'var(--smplfy-component-button-space-padding-inline-trailing-icon-start)',
              '--primary-button-padding-inline-end': isSmall
                ? 'var(--smplfy-component-button-space-padding-inline-small-leading-icon-start)'
                : 'var(--smplfy-component-button-space-padding-inline-trailing-icon-end)',
            }
          : {
              '--primary-button-padding-inline-start':
                'var(--smplfy-component-button-space-padding-inline-label-only)',
              '--primary-button-padding-inline-end':
                'var(--smplfy-component-button-space-padding-inline-label-only)',
            }
    : undefined;

  return (
    <button
      type={type}
      disabled={disabled}
      style={buttonStyle}
      className={joinClasses(
        'btn',
        'smplfy-primary-button',
        variantClass,
        sizeClass,
        hasLeftIcon && 'smplfy-primary-button--has-left-icon',
        hasRightIcon && 'smplfy-primary-button--has-right-icon',
        iconOnly && 'smplfy-primary-button--icon-only',
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
