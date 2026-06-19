import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import AppIcon from '../AppIcon';
import './form-controls.scss';

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

function normalizeOptions(options) {
  return options.map((option) => {
    if (typeof option === 'object') {
      return option;
    }

    return {
      value: option,
      label: option,
    };
  });
}

export default function InputFieldRichDropdown({
  state = 'default',
  value = '',
  placeholder = '',
  options = [],
  className = '',
  disabled = false,
  menuPlacement = 'bottom',
  onChange,
  onBlur,
  id,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  required: _required,
  ...props
}) {
  const generatedId = useId();
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const isDisabled = disabled || state === 'disabled';
  const isInvalid = state === 'error' || ariaInvalid === 'true';
  const normalizedOptions = normalizeOptions(options);
  const selectedOption = normalizedOptions.find((option) => option.value === value);
  const isFilled = state === 'filled' || Boolean(selectedOption);
  const triggerId = id ?? `rich-dropdown-${generatedId}`;
  const listId = `${triggerId}-listbox`;
  const opensUp = ['top', 'up'].includes(String(menuPlacement).toLowerCase());

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const updateMenuPosition = () => {
      const rect = rootRef.current?.getBoundingClientRect();

      if (!rect) {
        return;
      }

      setMenuStyle({
        position: 'fixed',
        top: opensUp ? 'auto' : `${rect.bottom + 8}px`,
        bottom: opensUp ? `${window.innerHeight - rect.top + 8}px` : 'auto',
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        zIndex: 1065,
      });
    };

    const handlePointerDown = (event) => {
      if (
        !rootRef.current?.contains(event.target)
        && !menuRef.current?.contains(event.target)
      ) {
        setOpen(false);
        onBlur?.({ target: { value } });
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        onBlur?.({ target: { value } });
      }
    };

    updateMenuPosition();
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
    };
  }, [open, onBlur, opensUp, value]);

  const handleSelect = (nextValue) => {
    onChange?.({ target: { value: nextValue } });
    setOpen(false);
    onBlur?.({ target: { value: nextValue } });
  };

  return (
    <div
      ref={rootRef}
      className={joinClasses(
        'smplfy-select-field',
        'smplfy-rich-dropdown-field',
        'dropdown',
        opensUp && 'dropup',
        open && 'show',
        !isFilled && 'smplfy-form-empty',
        state === 'hover' && 'smplfy-form-hover',
        state === 'focused' && 'smplfy-form-focused',
        className,
      )}
    >
      <button
        id={triggerId}
        type="button"
        className={joinClasses(
          'smplfy-rich-dropdown-trigger',
          'smplfy-form-control',
          'form-control',
          'btn',
          isInvalid && 'is-invalid',
        )}
        disabled={isDisabled}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        onClick={() => setOpen((current) => !current)}
        {...props}
      >
        <span className={joinClasses('smplfy-rich-dropdown-value', !selectedOption && 'text-secondary')}>
          {selectedOption?.label ?? placeholder}
        </span>
        {selectedOption?.rightLabel ? (
          <span className="smplfy-rich-dropdown-meta">
            {selectedOption.warning ? (
              <span className="d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0" aria-hidden="true">
                <AppIcon name="alert-circle" />
              </span>
            ) : null}
            <span>{selectedOption.rightLabel}</span>
          </span>
        ) : null}
        <span className="smplfy-rich-dropdown-chevron" aria-hidden="true">
          <AppIcon name={open ? 'chevron-up' : 'chevron-down'} />
        </span>
      </button>

      {open ? createPortal(
        <div
          ref={menuRef}
          id={listId}
          className={joinClasses(
            'smplfy-rich-dropdown-menu',
            'smplfy-card',
            'card',
            'position-fixed',
            'shadow',
          )}
          style={menuStyle}
          role="listbox"
          aria-labelledby={triggerId}
        >
          <div className="list-group list-group-flush overflow-auto">
            {normalizedOptions.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  className={joinClasses(
                    'smplfy-rich-dropdown-option',
                    'list-group-item',
                    'list-group-item-action',
                    isSelected && 'active',
                  )}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option.value)}
                >
                  <span className="smplfy-rich-dropdown-option-label">{option.label}</span>
                  {option.rightLabel ? (
                    <span className="smplfy-rich-dropdown-option-meta">
                      {option.warning ? (
                        <span className="d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0" aria-hidden="true">
                          <AppIcon name="alert-circle" />
                        </span>
                      ) : null}
                      <span>{option.rightLabel}</span>
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>,
        document.body,
      ) : null}
    </div>
  );
}
