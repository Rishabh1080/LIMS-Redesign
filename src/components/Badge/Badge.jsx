import './Badge.css';

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

export default function Badge({
  children,
  tone = 'danger',
  size = 'small',
  shape = 'circle',
  className = '',
}) {
  return (
    <span
      className={joinClasses(
        'smplfy-badge',
        `smplfy-badge--${tone}`,
        `smplfy-badge--${size}`,
        `smplfy-badge--${shape}`,
        className,
      )}
    >
      {children}
    </span>
  );
}
