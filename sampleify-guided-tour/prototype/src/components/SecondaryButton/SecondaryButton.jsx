import AppIcon from '../AppIcon';

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

const toneClassByName = {
  default: 'btn-outline-secondary',
  primary: 'btn-outline-primary',
  secondary: 'btn-outline-secondary',
  neutral: 'btn-outline-secondary',
  info: 'btn-outline-info',
  success: 'btn-outline-success',
  positive: 'btn-outline-success',
  danger: 'btn-outline-danger',
  destructive: 'btn-outline-danger',
  red: 'btn-outline-danger',
};

const bootstrapVariantClassPattern = /\bbtn-(primary|secondary|success|danger|warning|info|light|dark|link|outline-[a-z-]+)\b/;
const bootstrapSizeClassPattern = /\bbtn-(sm|lg)\b/;

function getSizeClass(size) {
  const resolvedSize = String(size || 'default').toLowerCase();

  if (resolvedSize === 'small' || resolvedSize === 'medium') {
    return 'btn-sm';
  }

  if (resolvedSize === 'large') {
    return 'btn-lg';
  }

  return '';
}

export default function SecondaryButton({
  children,
  label,
  leftIcon,
  rightIcon,
  size = 'large',
  tone = 'secondary',
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) {
  const resolvedLabel = children ?? label;
  const hasLabel = Boolean(resolvedLabel);
  const shouldWrapLabel = Boolean(leftIcon || rightIcon || label);
  const hasClassVariant = bootstrapVariantClassPattern.test(className);
  const hasClassSize = bootstrapSizeClassPattern.test(className);
  const sizeClass = hasClassSize ? '' : getSizeClass(size);
  const toneClass = hasClassVariant
    ? ''
    : toneClassByName[String(tone || 'secondary').toLowerCase()] ?? 'btn-outline-secondary';

  return (
    <button
      type={type}
      disabled={disabled}
      className={joinClasses(
        'smplfy-btn',
        'btn',
        toneClass,
        sizeClass,
        className,
      )}
      {...props}
    >
      {leftIcon ? <AppIcon name={leftIcon} /> : null}
      {hasLabel ? shouldWrapLabel ? <span>{resolvedLabel}</span> : resolvedLabel : null}
      {rightIcon ? <AppIcon name={rightIcon} /> : null}
    </button>
  );
}
