import AppIcon from '../AppIcon';
import './MenuActionItem.scss';

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

export default function MenuActionItem({
  label,
  leftIcon,
  state: _state = 'Default',
  className = '',
  onClick,
  ...props
}) {
  return (
    <button
      type="button"
      className={joinClasses('smplfy-dropdown-item', 'dropdown-item', className)}
      onClick={onClick}
      {...props}
    >
      {leftIcon ? (
        <span className="smplfy-dropdown-item__icon" aria-hidden="true">
          <AppIcon name={leftIcon} size={16} />
        </span>
      ) : null}
      {label ? <span className="smplfy-dropdown-item__label">{label}</span> : null}
    </button>
  );
}
