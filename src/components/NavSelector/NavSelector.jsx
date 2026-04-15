import './NavSelector.css';
import Badge from '../Badge';

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

export default function NavSelector({
  children,
  label,
  count,
  size = 'large',
  active = false,
  className = '',
  type = 'button',
  ...props
}) {
  const resolvedLabel = children ?? label;
  const normalizedCount = typeof count === 'string' ? count.trim() : count;
  const hasBadge =
    normalizedCount !== undefined &&
    normalizedCount !== null &&
    normalizedCount !== '' &&
    normalizedCount !== 0 &&
    normalizedCount !== '0';

  return (
    <button
      type={type}
      className={joinClasses(
        'btn',
        'smplfy-nav-selector',
        `smplfy-nav-selector--${size.toLowerCase()}`,
        active && 'is-active',
        hasBadge && 'smplfy-nav-selector--with-badge',
        className,
      )}
      {...props}
    >
      <span className="smplfy-nav-selector__label">{resolvedLabel}</span>
      {hasBadge ? (
        <Badge className="smplfy-nav-selector__badge" tone="danger" size="small" shape="circle">
          {normalizedCount}
        </Badge>
      ) : null}
    </button>
  );
}
