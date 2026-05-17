import './StatusPill.scss';

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

const bootstrapColorByName = {
  gray: 'secondary',
  blue: 'primary',
  red: 'danger',
  orange: 'warning',
  green: 'success',
  yellow: 'warning',
};

export default function StatusPill({
  children,
  label,
  color = 'gray',
  styleType = 'neutral',
  className = '',
  ...props
}) {
  const resolvedLabel = children ?? label;
  const bootstrapColor = bootstrapColorByName[color] ?? color;
  const isStrong = styleType === 'strong' || styleType === 'solid';

  return (
    <span
      className={joinClasses(
        'smplfy-badge',
        'badge',
        'rounded-pill',
        isStrong
          ? `text-bg-${bootstrapColor}`
          : `bg-${bootstrapColor}-subtle text-${bootstrapColor}-emphasis border border-${bootstrapColor}-subtle`,
        className,
      )}
      data-smplfy-color={color}
      data-smplfy-style={isStrong ? 'strong' : 'neutral'}
      {...props}
    >
      <span className="smplfy-badge__label">{resolvedLabel}</span>
    </span>
  );
}
