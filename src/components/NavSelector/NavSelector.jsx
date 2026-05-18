import './NavSelector.scss';
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
  const normalizedSize = String(size || 'large').toLowerCase();
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
        'smplfy-nav-link',
        'nav-link',
        active && 'active',
        normalizedSize === 'medium' && 'smplfy-nav-link-medium',
        className,
      )}
      aria-current={active ? 'page' : undefined}
      {...props}
    >
      <span className="d-inline-flex align-items-center">{resolvedLabel}</span>
      {hasBadge ? (
        <Badge tone="danger" size="small" shape="circle">
          {normalizedCount}
        </Badge>
      ) : null}
    </button>
  );
}
