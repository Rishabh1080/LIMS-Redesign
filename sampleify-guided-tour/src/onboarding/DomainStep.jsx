import { useEffect, useRef } from 'react';
import { IconArrowLeft, IconArrowRight, IconCheck } from '@tabler/icons-react';
import { domainPacks } from '../store/domains';
import { cx, firstName } from '../lib/format';
import { domainArt } from './DomainArt';

function DomainTile({ pack, checked, onToggle }) {
  const Art = domainArt[pack.id];
  return (
    <label className={cx('sgt-domain-tile', `sgt-domain-tile--${pack.id}`, checked && 'is-selected')}>
      <input
        type="checkbox"
        name="sgt-domain"
        value={pack.id}
        checked={checked}
        className="sgt-sr-only"
        onChange={() => onToggle(pack.id)}
      />
      <span className="sgt-domain-tile__art">{Art ? <Art /> : null}</span>
      <span className="sgt-domain-tile__title">{pack.label}</span>
      <span className="sgt-domain-tile__check" aria-hidden="true">
        <IconCheck size={14} stroke={3} />
      </span>
    </label>
  );
}

/** Multi-select. `value` is the picked tile ids in the order they were picked. */
export function DomainStep({ name, value, onChange, onSubmit, onBack }) {
  const headingRef = useRef(null);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  const toggle = (id) => onChange(value.includes(id) ? value.filter((entry) => entry !== id) : [...value, id]);

  const submit = (event) => {
    event.preventDefault();
    if (value.length) onSubmit(value);
  };

  return (
    <form className="sgt-onb-question sgt-onb-question--wide" onSubmit={submit}>
      <span className="sgt-eyebrow sgt-eyebrow--brand">Nice to meet you, {firstName(name)}</span>
      <h1 className="sgt-onb__title" id="sgt-onb-domain-title" ref={headingRef} tabIndex={-1}>
        What does your lab test?
      </h1>
      <p className="sgt-onb__lead sgt-domain-hint" id="sgt-onb-domain-hint">Pick all that apply.</p>

      <fieldset
        className="sgt-domain-fieldset"
        aria-labelledby="sgt-onb-domain-title"
        aria-describedby="sgt-onb-domain-hint"
        onKeyDown={(event) => {
          // Space ticks a tile; Enter continues.
          if (event.key === 'Enter' && event.target.type === 'checkbox') {
            event.preventDefault();
            if (value.length) onSubmit(value);
          }
        }}
      >
        <div className="sgt-domain-grid">
          {domainPacks.map((pack) => (
            <DomainTile key={pack.id} pack={pack} checked={value.includes(pack.id)} onToggle={toggle} />
          ))}
        </div>
      </fieldset>

      <div className="sgt-onb__actions">
        <button type="submit" className="sgt-btn sgt-btn--brand sgt-btn--lg" disabled={!value.length}>
          Continue
          <IconArrowRight size={18} stroke={2} aria-hidden="true" />
        </button>
      </div>
      <button type="button" className="sgt-onb__back" onClick={onBack}>
        <IconArrowLeft size={16} stroke={2} aria-hidden="true" />
        Back
      </button>
    </form>
  );
}
