import AppIcon from '../AppIcon';
import './modal.css';

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

export default function Modal({
  open,
  title,
  titleId,
  titleIcon,
  titleExtra,
  onClose,
  children,
  actions,
  size = 'md',
  className = '',
  cardClassName = '',
  bodyClassName = '',
  actionsClassName = '',
  showCloseButton = true,
  closeLabel = 'Close modal',
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="app-modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="app-modal__backdrop" onClick={onClose} />
      <div className={joinClasses('app-modal__card', `app-modal__card--${size}`, cardClassName, className)}>
        <div className="app-modal__header">
          <div className="app-modal__title-row">
            {titleIcon ? <AppIcon name={titleIcon} size={24} className="app-modal__title-icon" /> : null}
            <h2 id={titleId}>{title}</h2>
            {titleExtra ? <div className="app-modal__title-extra">{titleExtra}</div> : null}
          </div>

          {showCloseButton ? (
            <button
              type="button"
              className="btn app-modal__close"
              aria-label={closeLabel}
              onClick={onClose}
            >
              <AppIcon name="close" size={24} />
            </button>
          ) : null}
        </div>

        <div className={joinClasses('app-modal__body', bodyClassName)}>{children}</div>

        {actions ? <div className={joinClasses('app-modal__actions', actionsClassName)}>{actions}</div> : null}
      </div>
    </div>
  );
}
