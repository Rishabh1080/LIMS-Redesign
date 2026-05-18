import './Badge.scss';

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

export default function Badge({
  children,
  tone = 'danger',
  size = 'small',
  shape = 'circle',
  className = '',
  ...props
}) {
  const bootstrapToneClass = tone === 'danger' ? 'text-bg-danger' : `text-bg-${tone}`;
  const shapeClass = shape === 'circle' ? 'rounded-circle' : '';

  return (
    <span
      className={joinClasses(
        'smplfy-badge',
        'badge',
        bootstrapToneClass,
        shapeClass,
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
