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
        className,
      )}
      aria-current={active ? 'page' : undefined}
      data-smplfy-size={normalizedSize}
      data-smplfy-has-badge={hasBadge ? 'true' : undefined}
      {...props}
    >
      <span className="smplfy-nav-link__label">{resolvedLabel}</span>
      {hasBadge ? (
        <Badge className="smplfy-nav-link__badge" tone="danger" size="small" shape="circle">
          {normalizedCount}
        </Badge>
      ) : null}
    </button>
  );
}
