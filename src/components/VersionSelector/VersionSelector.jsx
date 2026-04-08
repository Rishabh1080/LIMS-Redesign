import { useEffect, useRef, useState } from 'react';
import SecondaryButton from '../SecondaryButton';
import './VersionSelector.css';

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

export default function VersionSelector({
  value,
  options = [],
  className = '',
  disabled = false,
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

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

  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  return (
    <div ref={rootRef} className={joinClasses('smplfy-version-selector', className)}>
      <SecondaryButton
        size="medium"
        rightIcon="chevron-down"
        disabled={disabled}
        className={joinClasses('smplfy-version-selector__button', open && 'is-open')}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {selectedOption?.label ?? ''}
      </SecondaryButton>

      {open ? (
        <div className="smplfy-version-selector__menu" role="menu" aria-label="Select version">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="menuitemradio"
              aria-checked={option.value === value}
              className={joinClasses(
                'smplfy-version-selector__item',
                option.value === value && 'is-selected',
              )}
              onClick={() => {
                setOpen(false);
                if (option.value !== value) {
                  onChange?.(option.value);
                }
              }}
            >
              <span className="smplfy-version-selector__item-label">{option.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
