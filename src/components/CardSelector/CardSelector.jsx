import RadioButton from '../RadioButton';
import './CardSelector.css';

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
  const radioState = resolvedState === 'active' ? 'default' : resolvedState;

  return (
    <button
      type="button"
      className={joinClasses('smplfy-card-selector', `smplfy-card-selector--${resolvedState}`, className)}
      onClick={onClick}
      {...props}
    >
      <div className="smplfy-card-selector__head">
        <RadioButton selected={selected} state={radioState} ariaLabel={title} />
        <span className="smplfy-card-selector__title">{title}</span>
      </div>
      <div className="smplfy-card-selector__description">{description}</div>
    </button>
  );
}
