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
  const bootstrapShapeClass = shape === 'circle' || shape === 'pill' ? 'rounded-pill' : '';

  return (
    <span
      className={joinClasses(
        'smplfy-badge',
        'badge',
        bootstrapToneClass,
        bootstrapShapeClass,
        className,
      )}
      data-smplfy-size={size}
      data-smplfy-shape={shape}
      {...props}
    >
      {children}
    </span>
  );
}
