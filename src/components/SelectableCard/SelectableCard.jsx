import RadioButton from '../RadioButton';
import './SelectableCard.css';

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
      className={joinClasses('smplfy-selectable-card', selected && 'is-selected', className)}
      onClick={onClick}
      {...props}
    >
      <div className="smplfy-selectable-card__head">
        <RadioButton checked={selected} ariaLabel={title} />
        <span className="smplfy-selectable-card__title">{title}</span>
      </div>
      <div className="smplfy-selectable-card__description">{description}</div>
    </button>
  );
}
