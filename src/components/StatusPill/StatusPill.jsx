import './StatusPill.css';

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

export default function StatusPill({
  children,
  label,
  color = 'gray',
  styleType = 'neutral',
  className = '',
}) {
  const resolvedLabel = children ?? label;

  return (
    <span
      className={joinClasses(
        'smplfy-status-pill',
        `smplfy-status-pill--${color}`,
        `smplfy-status-pill--${styleType}`,
        className,
      )}
    >
      <span className="smplfy-status-pill__label">{resolvedLabel}</span>
    </span>
  );
}
