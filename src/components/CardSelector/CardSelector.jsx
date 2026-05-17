import RadioButton from '../RadioButton';
import './CardSelector.scss';

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

export default function CardSelector({
  title,
  description,
  state = 'default',
  selected = false,
  className = '',
  onClick,
  ...props
}) {
  const resolvedState = selected ? 'active' : state;
  const isActive = resolvedState === 'active';
  const radioState = resolvedState === 'active' ? 'default' : resolvedState;

  return (
    <button
      type="button"
      className={joinClasses('smplfy-card', 'card', 'btn', isActive && 'active', className)}
      aria-pressed={isActive}
      data-state={resolvedState}
      onClick={onClick}
      {...props}
    >
      <div className="smplfy-card__head">
        <RadioButton selected={selected} state={radioState} ariaLabel={title} />
        <span className="smplfy-card__title card-title">{title}</span>
      </div>
      <div className="smplfy-card__description card-text">{description}</div>
    </button>
  );
}
