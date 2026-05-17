import AppIcon from '../AppIcon';
import './form-controls.scss';

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
        'toast',
        'show',
        className,
      )}
      role="status"
      aria-live="polite"
      data-smplfy-tone={tone}
      data-smplfy-state={state}
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
