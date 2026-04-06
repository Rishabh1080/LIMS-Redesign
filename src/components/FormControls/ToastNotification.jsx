import AppIcon from '../AppIcon';
import './form-controls.css';

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

export default function ToastNotification({
  state = 'default',
  message = 'Sample Created.',
  className = '',
  onClose,
  ...props
}) {
  return (
    <div className={joinClasses('smplfy-toast', state === 'gone' && 'smplfy-toast--gone', className)} {...props}>
      <div className="smplfy-toast__content">
        <span className="smplfy-toast__icon" aria-hidden="true">
          <AppIcon name="checks" />
        </span>
        <span>{message}</span>
      </div>

      <button className="btn smplfy-toast__close" aria-label="Dismiss notification" onClick={onClose}>
        <AppIcon name="close" />
      </button>
    </div>
  );
}
