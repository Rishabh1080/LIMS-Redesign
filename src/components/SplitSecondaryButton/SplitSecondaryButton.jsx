import { useEffect, useRef, useState } from 'react';
import AppIcon from '../AppIcon';
import MenuActionItem from '../MenuActionItem';
import './SplitSecondaryButton.scss';

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

export default function SplitSecondaryButton({
  label,
  leftIcon,
  className = '',
  menuItems,
  onPrimaryClick,
  onSecondaryClick,
  ...props
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const rootRef = useRef(null);
  const resolvedMenuItems = menuItems ?? [
    { key: 'print', label: 'Print', icon: 'printer' },
    { key: 'configure', label: 'Configure', icon: 'settings' },
  ];

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [menuOpen]);

  return (
    <div
      ref={rootRef}
      className={joinClasses('smplfy-btn-group', 'btn-group', menuOpen && 'show', className)}
      {...props}
    >
      <button
        type="button"
        className="smplfy-btn btn btn-primary"
        onClick={onPrimaryClick}
      >
        {leftIcon ? <AppIcon name={leftIcon} size={18} aria-hidden="true" /> : null}
        <span>{label}</span>
      </button>
      <button
        type="button"
        className="smplfy-btn btn btn-primary dropdown-toggle dropdown-toggle-split"
        onClick={(event) => {
          onSecondaryClick?.(event);
          setMenuOpen((current) => !current);
        }}
        aria-label="More print actions"
        aria-expanded={menuOpen}
        aria-haspopup="menu"
      >
        <AppIcon name="chevron-down" size={18} />
      </button>

      {menuOpen ? (
        <div
          className="smplfy-dropdown-menu dropdown-menu show"
          role="menu"
          aria-label="Print actions"
        >
          {resolvedMenuItems.map((item) => (
            <MenuActionItem
              key={item.key}
              label={item.label}
              leftIcon={item.icon}
              role="menuitem"
              onClick={() => {
                item.onClick?.();
                setMenuOpen(false);
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
