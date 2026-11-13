import { useEffect, useRef } from 'react';
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

const FOCUSABLE_SELECTOR = 'a[href], button:not(:disabled), textarea:not(:disabled), input:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])';

function useFocusTrap(ref, open) {
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!open || !ref.current) return;

    previousFocusRef.current = document.activeElement;

    const firstFocusable = ref.current.querySelector(FOCUSABLE_SELECTOR);
    if (firstFocusable) {
      requestAnimationFrame(() => firstFocusable.focus());
    }

    const handleKeyDown = (event) => {
      if (event.key !== 'Tab') return;

      const focusableElements = ref.current.querySelectorAll(FOCUSABLE_SELECTOR);
      if (!focusableElements.length) return;

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previousFocusRef.current && previousFocusRef.current.focus) {
        previousFocusRef.current.focus();
      }
    };
  }, [open, ref]);
}

export default function Modal({
  open,
  title,
  titleId,
  titleIcon,
  subtitle,
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
  const modalRef = useRef(null);
  useFocusTrap(modalRef, open);

  if (!open) {
    return null;
  }

  const sizeClass = sizeClassByName[String(size || 'md').toLowerCase()] ?? '';

  return (
    <div ref={modalRef} className="smplfy-modal modal show d-block" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="modal-backdrop show" onClick={onClose} />
      <div className={joinClasses('modal-dialog modal-dialog-centered', sizeClass, cardClassName)}>
        <div className={joinClasses('modal-content', className)}>
          <div className="modal-header">
            <div className="d-flex align-items-center gap-2 flex-grow-1 min-w-0">
              {titleIcon ? <AppIcon name={titleIcon} size={24} className="flex-shrink-0" /> : null}
              <div className="smplfy-modal-title-stack d-flex flex-column min-w-0 flex-grow-1">
                <div className="smplfy-modal-title-line d-flex align-items-center gap-2 min-w-0">
                  <h2 className="modal-title" id={titleId}>{title}</h2>
                  {titleExtra ? <div className="ms-2">{titleExtra}</div> : null}
                </div>
                {subtitle ? <div className="smplfy-modal-subtitle">{subtitle}</div> : null}
              </div>
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
