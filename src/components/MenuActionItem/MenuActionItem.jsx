import AppIcon from '../AppIcon';
import './MenuActionItem.css';

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

export default function MenuActionItem({
  label,
  leftIcon,
  state = 'Default',
  className = '',
  onClick,
  ...props
}) {
  return (
    <button
      type="button"
      className={joinClasses('smplfy-menu-action-item', `smplfy-menu-action-item--${state}`, className)}
      onClick={onClick}
      {...props}
    >
      {leftIcon ? (
        <span className="smplfy-menu-action-item__icon" aria-hidden="true">
          <AppIcon name={leftIcon} size={16} />
        </span>
      ) : null}
      {label ? <span className="smplfy-menu-action-item__label">{label}</span> : null}
    </button>
  );
}
