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
  searchable = false,
  searchPlaceholder = 'Search',
  maxVisibleItems = 4,
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
  const searchInputRef = useRef(null);
  const focusedIndexRef = useRef(-1);
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const isDisabled = disabled || state === 'disabled';
  const isInvalid = state === 'error' || ariaInvalid === 'true';
  const normalizedOptions = normalizeOptions(options);
  const filteredOptions = searchable && searchQuery.trim()
    ? normalizedOptions.filter((option) => {
      const query = searchQuery.trim().toLowerCase();
      const searchableText = [
        option.label,
        option.value,
        option.rightLabel,
        option.searchText,
      ].filter(Boolean).join(' ').toLowerCase();

      return searchableText.includes(query);
    })
    : normalizedOptions;
  const selectedOption = normalizedOptions.find((option) => option.value === value);
  const isFilled = state === 'filled' || Boolean(selectedOption);
  const triggerId = id ?? `rich-dropdown-${generatedId}`;
  const listId = `${triggerId}-listbox`;
  const opensUp = ['top', 'up'].includes(String(menuPlacement).toLowerCase());

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    setSearchQuery('');

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
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        setFocusedIndex((current) => {
          const opts = menuRef.current?.querySelectorAll('.smplfy-rich-dropdown-option');
          const max = (opts?.length ?? 1) - 1;
          return Math.min(max, current + 1);
        });
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setFocusedIndex((current) => Math.max(0, current - 1));
      } else if (event.key === 'Enter') {
        event.preventDefault();
        const opts = menuRef.current?.querySelectorAll('.smplfy-rich-dropdown-option');
        const idx = focusedIndexRef.current;
        if (opts && opts[idx]) {
          opts[idx].click();
        }
      }
    };

    updateMenuPosition();
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);

    const focusFrame = searchable
      ? window.requestAnimationFrame(() => searchInputRef.current?.focus())
      : null;

    setFocusedIndex(() => {
      const currentIndex = filteredOptions.findIndex((opt) => opt.value === value);
      return currentIndex >= 0 ? currentIndex : 0;
    });

    return () => {
      if (focusFrame) {
        window.cancelAnimationFrame(focusFrame);
      }
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
    };
  }, [open, onBlur, opensUp, searchable, value]);

  useEffect(() => {
    if (open) {
      setFocusedIndex(0);
    }
  }, [open, searchQuery]);

  useEffect(() => {
    focusedIndexRef.current = focusedIndex;
  }, [focusedIndex]);

  useEffect(() => {
    if (!open || focusedIndex < 0) return;
    const opts = menuRef.current?.querySelectorAll('.smplfy-rich-dropdown-option');
    if (opts && opts[focusedIndex]) {
      opts[focusedIndex].scrollIntoView({ block: 'nearest' });
    }
  }, [open, focusedIndex]);

  const handleSelect = (nextValue) => {
    onChange?.({ target: { value: nextValue } });
    setOpen(false);
    onBlur?.({ target: { value: nextValue } });

    // Move focus to the next field
    requestAnimationFrame(() => {
      const trigger = rootRef.current?.querySelector('.smplfy-rich-dropdown-trigger');
      if (!trigger) return;

      const form = trigger.closest('form') || document.body;
      const allFocusable = Array.from(form.querySelectorAll(
        'button:not(:disabled):not(.btn-close), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
      ));
      const currentIndex = allFocusable.indexOf(trigger);
      if (currentIndex >= 0 && currentIndex < allFocusable.length - 1) {
        allFocusable[currentIndex + 1].focus();
      }
    });
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
        onKeyDown={(event) => {
          if (!open && (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            setOpen(true);
          }
        }}
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
          style={{
            ...menuStyle,
            '--smplfy-rich-dropdown-visible-items': maxVisibleItems,
          }}
          role="listbox"
          aria-labelledby={triggerId}
        >
          {searchable ? (
            <div className="smplfy-rich-dropdown-search">
              <div className="input-group">
                <span className="input-group-text" aria-hidden="true">
                  <AppIcon name="search" size={16} />
                </span>
                <input
                  ref={searchInputRef}
                  type="search"
                  className="smplfy-form-control form-control"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => {
                    event.stopPropagation();
                    if (event.key === 'Escape') {
                      setOpen(false);
                      onBlur?.({ target: { value } });
                    } else if (event.key === 'ArrowDown') {
                      event.preventDefault();
                      setFocusedIndex((current) => {
                        const max = filteredOptions.length - 1;
                        return Math.min(max, current + 1);
                      });
                    } else if (event.key === 'ArrowUp') {
                      event.preventDefault();
                      setFocusedIndex((current) => Math.max(0, current - 1));
                    } else if (event.key === 'Enter') {
                      event.preventDefault();
                      if (focusedIndex >= 0 && filteredOptions[focusedIndex]) {
                        handleSelect(filteredOptions[focusedIndex].value);
                      }
                    }
                  }}
                  aria-label={searchPlaceholder}
                />
              </div>
            </div>
          ) : null}
          <div className="list-group list-group-flush overflow-auto">
            {filteredOptions.length ? filteredOptions.map((option, index) => {
              const isSelected = option.value === value;
              const isFocused = index === focusedIndex;

              return (
                <button
                  key={option.value}
                  type="button"
                  className={joinClasses(
                    'smplfy-rich-dropdown-option',
                    'list-group-item',
                    'list-group-item-action',
                    isSelected && 'active',
                    isFocused && 'smplfy-rich-dropdown-option-focused',
                  )}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option.value)}
                  onMouseEnter={() => setFocusedIndex(index)}
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
            }) : (
              <div className="smplfy-rich-dropdown-empty text-secondary" role="status">
                No results found
              </div>
            )}
          </div>
        </div>,
        document.body,
      ) : null}
    </div>
  );
}
