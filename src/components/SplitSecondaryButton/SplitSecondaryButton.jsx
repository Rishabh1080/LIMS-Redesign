import { useEffect, useRef, useState } from 'react';
import AppIcon from '../AppIcon';
import MenuActionItem from '../MenuActionItem';
import './SplitSecondaryButton.css';

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
      className={joinClasses('smplfy-split-secondary-button', menuOpen ? 'is-menu-open' : '', className)}
      {...props}
    >
      <button type="button" className="smplfy-split-secondary-button__primary btn" onClick={onPrimaryClick}>
        <span className="smplfy-split-secondary-button__icon" aria-hidden="true">
          <AppIcon name={leftIcon} size={18} />
        </span>
        <span>{label}</span>
      </button>
      <button
        type="button"
        className="smplfy-split-secondary-button__secondary btn"
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
        <div className="smplfy-split-secondary-button__menu" role="menu" aria-label="Print actions">
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
