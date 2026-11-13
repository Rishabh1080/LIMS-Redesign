import AppIcon from '../AppIcon';

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

const variantClassByStyle = {
  default: 'btn-primary',
  primary: 'btn-primary',
  positive: 'btn-success',
  success: 'btn-success',
  destructive: 'btn-danger',
  danger: 'btn-danger',
  red: 'btn-danger',
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
  const hasClassVariant = bootstrapVariantClassPattern.test(className);
  const hasClassSize = bootstrapSizeClassPattern.test(className);
  const variantClass = hasClassVariant
    ? ''
    : variantClassByStyle[String(styleVariant || 'default').toLowerCase()] ?? 'btn-primary';
  const sizeClass = hasClassSize ? '' : getSizeClass(size);

  return (
    <button
      type={type}
      disabled={disabled}
      className={joinClasses(
        'smplfy-btn',
        'btn',
        variantClass,
        sizeClass,
        className,
      )}
      {...props}
    >
      {leftIcon ? <AppIcon name={leftIcon} /> : null}
      {hasLabel ? <span>{resolvedLabel}</span> : null}
      {rightIcon ? <AppIcon name={rightIcon} /> : null}
    </button>
  );
}
