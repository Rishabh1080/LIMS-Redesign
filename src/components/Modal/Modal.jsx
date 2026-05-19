import AppIcon from '../AppIcon';
import './modal.scss';

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

const sizeClassByName = {
  small: 'modal-sm',
  sm: 'modal-sm',
  md: '',
  default: '',
  large: 'modal-lg',
  lg: 'modal-lg',
  extralarge: 'modal-xl',
  'extra-large': 'modal-xl',
  xl: 'modal-xl',
};

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

  const sizeClass = sizeClassByName[String(size || 'md').toLowerCase()] ?? '';

  return (
    <div className="smplfy-modal modal show d-block" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="modal-backdrop show" onClick={onClose} />
      <div className={joinClasses('modal-dialog modal-dialog-centered', sizeClass, cardClassName)}>
        <div className={joinClasses('modal-content', className)}>
          <div className="modal-header">
            <div className="d-flex align-items-center gap-2 flex-grow-1 min-w-0">
              {titleIcon ? <AppIcon name={titleIcon} size={24} className="flex-shrink-0" /> : null}
              <h2 className="modal-title" id={titleId}>{title}</h2>
              {titleExtra ? <div className="ms-2">{titleExtra}</div> : null}
            </div>

            {showCloseButton ? (
              <button
                type="button"
                className="btn-close"
                aria-label={closeLabel}
                onClick={onClose}
              >
                <AppIcon name="close" size={24} />
              </button>
            ) : null}
          </div>

          <div className={joinClasses('modal-body', bodyClassName)}>{children}</div>

          {actions ? <div className={joinClasses('modal-footer', actionsClassName)}>{actions}</div> : null}
        </div>
      </div>
    </div>
  );
}
