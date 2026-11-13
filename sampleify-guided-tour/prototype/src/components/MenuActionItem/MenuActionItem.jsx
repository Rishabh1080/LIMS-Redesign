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
        <span className="d-inline-flex align-items-center justify-content-center" aria-hidden="true">
          <AppIcon name={leftIcon} size={16} />
        </span>
      ) : null}
      {label ? <span>{label}</span> : null}
    </button>
  );
}
