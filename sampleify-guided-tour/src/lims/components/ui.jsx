import { useEffect, useId, useRef } from 'react';
import {
  IconCheck,
  IconChecks,
  IconClock,
  IconFlask,
  IconUserCheck,
  IconX,
} from '@tabler/icons-react';
import { cx } from '../../lib/format';
import { TR_STATUS } from '../../store/catalog';

export function Button({
  variant = 'primary',
  size,
  icon: Icon,
  iconRight: IconRight,
  block = false,
  className,
  children,
  type = 'button',
  ...rest
}) {
  return (
    <button
      type={type}
      className={cx(
        'sgt-btn',
        `sgt-btn--${variant}`,
        size && `sgt-btn--${size}`,
        Icon && children && 'sgt-btn--icon-left',
        block && 'sgt-btn--block',
        className,
      )}
      {...rest}
    >
      {Icon ? <Icon size={size === 'xs' ? 15 : 18} stroke={1.9} aria-hidden="true" /> : null}
      {children}
      {IconRight ? <IconRight size={size === 'xs' ? 15 : 18} stroke={1.9} aria-hidden="true" /> : null}
    </button>
  );
}

export function Pill({ tone = 'gray', icon: Icon, children, className, ...rest }) {
  return (
    <span className={cx('sgt-pill', `sgt-pill--${tone}`, className)} {...rest}>
      {Icon ? <Icon size={13} stroke={2} aria-hidden="true" /> : null}
      {children}
    </span>
  );
}

export function TrStatusPill({ status }) {
  const presentation = TR_STATUS[status] ?? TR_STATUS.not_allocated;
  return <Pill tone={presentation.tone}>{presentation.label}</Pill>;
}

export function SampleStatusPill({ status }) {
  const tone = status === 'Completed' ? 'green' : status === 'Pending' ? 'blue' : 'yellow';
  return <Pill tone={tone}>{status}</Pill>;
}

/** Label + control + helper/error, matching smplfy FormElement. */
export function Field({ label, required, helper, error, htmlFor, className, children, ...rest }) {
  return (
    <div className={cx('sgt-field', className)} {...rest}>
      {label ? (
        <label className="sgt-field__label" htmlFor={htmlFor}>
          {label}
          {required ? <span className="sgt-field__required" aria-hidden="true">*</span> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <span className="sgt-field__error" role="alert">{error}</span>
      ) : helper ? (
        <span className="sgt-field__helper">{helper}</span>
      ) : null}
    </div>
  );
}

export function Select({ value, onChange, options, placeholder, invalid, className, ...rest }) {
  return (
    <select
      className={cx('sgt-select', !value && placeholder && 'is-placeholder', invalid && 'is-invalid', className)}
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
      aria-invalid={invalid || undefined}
      {...rest}
    >
      {placeholder ? (
        <option value="" disabled>
          {placeholder}
        </option>
      ) : null}
      {options.map((option) => {
        const normalized = typeof option === 'string' ? { value: option, label: option } : option;
        return (
          <option key={normalized.value} value={normalized.value} disabled={normalized.disabled}>
            {normalized.label}
          </option>
        );
      })}
    </select>
  );
}

export function Checkbox({ checked, indeterminate = false, onChange, label, disabled, ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <span className="sgt-check">
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.checked)}
        aria-label={label}
        {...rest}
      />
      <span className="sgt-check__box" aria-hidden="true">
        {checked ? <IconCheck size={12} stroke={3} /> : indeterminate ? <span className="sgt-check__dash" /> : null}
      </span>
    </span>
  );
}

export function Radio({ checked, onChange, label, disabled, name, ...rest }) {
  return (
    <span className="sgt-check">
      <input
        type="radio"
        name={name}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange?.()}
        aria-label={label}
        {...rest}
      />
      <span className="sgt-radio__dot" aria-hidden="true" />
    </span>
  );
}

export function Modal({ open, title, icon: Icon, onClose, children, footer, width = 720, className, labelledBy, ...rest }) {
  const fallbackId = useId();
  const titleId = labelledBy ?? `sgt-modal-${fallbackId}`;
  const cardRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const card = cardRef.current;
    const focusable = card?.querySelector('[data-autofocus], button:not([disabled]), select, input');
    focusable?.focus({ preventScroll: true });
    return () => {
      if (previous && typeof previous.focus === 'function' && document.contains(previous)) {
        previous.focus({ preventScroll: true });
      }
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="sgt-modal-layer">
      <div className="sgt-backdrop" onClick={onClose} aria-hidden="true" />
      <div
        ref={cardRef}
        className={cx('sgt-modal', className)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={{ width: `min(${width}px, 100%)` }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.stopPropagation();
            onClose?.();
          }
        }}
        {...rest}
      >
        <div className="sgt-modal__header">
          <h2 className="sgt-modal__title" id={titleId}>
            {Icon ? <Icon size={24} stroke={1.8} aria-hidden="true" /> : null}
            {title}
          </h2>
          <button type="button" className="sgt-icon-btn" aria-label="Close" onClick={onClose}>
            <IconX size={22} stroke={1.9} />
          </button>
        </div>
        {children}
        {footer}
      </div>
    </div>
  );
}

export function Drawer({ open, onClose, header, footer, children, className, ...rest }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const target = panelRef.current?.querySelector('input, button:not([disabled])');
    target?.focus({ preventScroll: true });
  }, [open]);

  if (!open) return null;

  return (
    <div className="sgt-drawer-layer">
      <div className="sgt-backdrop" onClick={onClose} aria-hidden="true" />
      <aside
        ref={panelRef}
        className={cx('sgt-drawer', className)}
        role="dialog"
        aria-modal="true"
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.stopPropagation();
            onClose?.();
          }
        }}
        {...rest}
      >
        <div className="sgt-drawer__header">
          {header}
          <button type="button" className="sgt-icon-btn" aria-label="Close" onClick={onClose}>
            <IconX size={22} stroke={1.9} />
          </button>
        </div>
        <div className="sgt-drawer__body">{children}</div>
        {footer ? <div className="sgt-drawer__footer">{footer}</div> : null}
      </aside>
    </div>
  );
}

export function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined;
    const id = window.setTimeout(() => onClose(toast.id), 5000);
    return () => window.clearTimeout(id);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className="sgt-toast" role="status" aria-live="polite" key={toast.id}>
      <span className="sgt-toast__icon" aria-hidden="true">
        <IconCheck size={15} stroke={3} />
      </span>
      <p className="sgt-toast__message">{toast.message}</p>
      <button type="button" className="sgt-icon-btn" aria-label="Dismiss notification" onClick={() => onClose(toast.id)}>
        <IconX size={18} stroke={1.9} />
      </button>
    </div>
  );
}

const circleIcons = {
  not_allocated: IconClock,
  under_testing: IconFlask,
  under_approval: IconUserCheck,
  approved: IconChecks,
};

export function ParameterCircles({ trs }) {
  return (
    <ul className="sgt-param-circles" aria-label="Test status">
      {trs.map((tr) => {
        const Icon = circleIcons[tr.status] ?? IconClock;
        const label = `${tr.parameter}: ${TR_STATUS[tr.status]?.label ?? tr.status}`;
        return (
          <li key={tr.id} className={cx('sgt-param-circle', `sgt-param-circle--${tr.status}`)} title={label}>
            <Icon size={13} stroke={2.2} aria-hidden="true" />
            <span className="sgt-sr-only">{label}</span>
          </li>
        );
      })}
    </ul>
  );
}

export function MetaItem({ label, value }) {
  return (
    <dl className="sgt-meta">
      <dt>{label}</dt>
      <dd title={typeof value === 'string' ? value : undefined}>{value || '-'}</dd>
    </dl>
  );
}
