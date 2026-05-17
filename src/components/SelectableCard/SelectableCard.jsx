import RadioButton from '../RadioButton';
import '../CardSelector/CardSelector.scss';
import './SelectableCard.scss';

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

export default function SelectableCard({
  title,
  description,
  selected = false,
  className = '',
  onClick,
  ...props
}) {
  return (
    <button
      type="button"
      className={joinClasses('smplfy-card', 'card', 'btn', selected && 'active', className)}
      aria-pressed={selected}
      data-state={selected ? 'active' : 'default'}
      data-layout="relaxed"
      onClick={onClick}
      {...props}
    >
      <div className="smplfy-card__head">
        <RadioButton checked={selected} ariaLabel={title} />
        <span className="smplfy-card__title card-title">{title}</span>
      </div>
      <div className="smplfy-card__description card-text">{description}</div>
    </button>
  );
}
