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
      <div className="smplfy-modal-backdrop modal-backdrop show" onClick={onClose} />
      <div className={joinClasses('smplfy-modal-dialog modal-dialog modal-dialog-centered', sizeClass, cardClassName)}>
        <div className={joinClasses('smplfy-modal-content modal-content', cardClassName, className)}>
          <div className="smplfy-modal-header modal-header">
            <div className="smplfy-modal-title-row">
              {titleIcon ? <AppIcon name={titleIcon} size={24} className="smplfy-modal-title-icon" /> : null}
              <h2 className="smplfy-modal-title modal-title" id={titleId}>{title}</h2>
              {titleExtra ? <div className="smplfy-modal-title-extra">{titleExtra}</div> : null}
            </div>

            {showCloseButton ? (
              <button
                type="button"
                className="smplfy-modal-close btn-close"
                aria-label={closeLabel}
                onClick={onClose}
              >
                <AppIcon name="close" size={24} />
              </button>
            ) : null}
          </div>

          <div className={joinClasses('smplfy-modal-body modal-body', bodyClassName)}>{children}</div>

          {actions ? <div className={joinClasses('smplfy-modal-footer modal-footer', actionsClassName)}>{actions}</div> : null}
        </div>
      </div>
    </div>
  );
}
