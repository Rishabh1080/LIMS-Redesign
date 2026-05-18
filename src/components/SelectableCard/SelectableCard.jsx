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
      className={joinClasses('smplfy-card', 'card', 'btn', 'smplfy-card-relaxed', selected && 'active', className)}
      aria-pressed={selected}
      onClick={onClick}
      {...props}
    >
      <div className="card-body">
        <RadioButton checked={selected} ariaLabel={title} />
        <span className="card-title">{title}</span>
      </div>
      <div className="card-text">{description}</div>
    </button>
  );
}
