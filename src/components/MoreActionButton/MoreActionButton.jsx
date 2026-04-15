import { useEffect, useRef, useState } from 'react';
import AppIcon from '../AppIcon';
import MenuActionItem from '../MenuActionItem';
import './MoreActionButton.css';

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

export default function MoreActionButton({ className = '', items, ...props }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const menuItems = items ?? [
    { key: 'print', label: 'Print', leftIcon: 'printer' },
    { key: 'configure', label: 'Configure', leftIcon: 'settings' },
  ];

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={joinClasses('smplfy-more-action-items', open && 'is-open', className)}>
      <button
        type="button"
        className="smplfy-more-action-button btn smplfy-secondary-button smplfy-secondary-button--large smplfy-secondary-button--tone-neutral smplfy-secondary-button--icon-only"
        aria-label="More actions"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        {...props}
      >
        <AppIcon name="more" size={20} />
      </button>

      {open ? (
        <div className="smplfy-more-action-items__menu" role="menu" aria-label="More actions">
          {menuItems.map((item) => (
            <MenuActionItem
              key={item.key}
              label={item.label}
              leftIcon={item.leftIcon}
              role="menuitem"
              onClick={() => {
                item.onClick?.();
                setOpen(false);
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
