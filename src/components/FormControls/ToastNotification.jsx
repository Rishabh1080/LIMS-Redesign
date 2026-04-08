import AppIcon from '../AppIcon';
import './form-controls.css';

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

export default function ToastNotification({
  state = 'default',
  tone = 'success',
  message = 'Sample Created.',
  className = '',
  onClose,
  ...props
}) {
  const iconName = tone === 'error' ? 'alert-circle' : 'checks';

  return (
    <div
      className={joinClasses(
        'smplfy-toast',
        tone !== 'success' && `smplfy-toast--${tone}`,
        state === 'gone' && 'smplfy-toast--gone',
        className,
      )}
      role="status"
      aria-live="polite"
      {...props}
    >
      <div className="smplfy-toast__content">
        <span className="smplfy-toast__icon" aria-hidden="true">
          <AppIcon name={iconName} />
        </span>
        <span>{message}</span>
      </div>

      <button className="btn smplfy-toast__close" aria-label="Dismiss notification" onClick={onClose}>
        <AppIcon name="close" />
      </button>
    </div>
  );
}
