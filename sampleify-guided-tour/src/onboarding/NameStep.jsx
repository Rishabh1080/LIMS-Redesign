import { useRef, useState } from 'react';
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react';

const NAME_PATTERN = /^[\p{L}][\p{L}\s.'-]{1,39}$/u;
const LAB_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N}\s.,&'()/-]{1,59}$/u;

const tidy = (value) => value.trim().replace(/\s+/g, ' ');

export function validateName(value) {
  const trimmed = tidy(value);
  if (trimmed.length < 2) return 'Please enter at least 2 letters.';
  if (trimmed.length > 40) return 'Please keep it under 40 characters.';
  if (!NAME_PATTERN.test(trimmed)) return 'Letters, spaces, dots and hyphens only, please.';
  return null;
}

export function validateLabName(value) {
  const trimmed = tidy(value);
  if (trimmed.length < 2) return 'Please enter your lab’s name.';
  if (trimmed.length > 60) return 'Please keep it under 60 characters.';
  if (!LAB_PATTERN.test(trimmed)) return 'Letters, numbers and simple punctuation only, please.';
  return null;
}

/** Your name and your lab's name. Both fill the live preview as you type. */
export function NameStep({ name, labName, onNameChange, onLabNameChange, onFocusField, onSubmit, onBack }) {
  const [errors, setErrors] = useState({});
  const labRef = useRef(null);

  const submit = (event) => {
    event.preventDefault();
    const next = { name: validateName(name), lab: validateLabName(labName) };
    setErrors(next);
    if (next.name) document.getElementById('sgt-onb-name')?.focus();
    else if (next.lab) labRef.current?.focus();
    else onSubmit({ name: tidy(name), labName: tidy(labName) });
  };

  return (
    <form className="sgt-onb-question" onSubmit={submit} noValidate>
      <h1 className="sgt-onb__title">Set up your lab</h1>

      <div className="sgt-onb-fields">
        <div className="sgt-onb-field">
          <label className="sgt-onb-field__label" htmlFor="sgt-onb-name">Your name</label>
          <input
            id="sgt-onb-name"
            className={`sgt-onb-input${errors.name ? ' is-invalid' : ''}`}
            type="text"
            autoComplete="name"
            autoCapitalize="words"
            spellCheck={false}
            maxLength={40}
            placeholder="e.g. Priya Sharma"
            value={name}
            autoFocus
            aria-describedby={errors.name ? 'sgt-onb-name-error' : undefined}
            aria-invalid={Boolean(errors.name) || undefined}
            onFocus={() => onFocusField?.('name')}
            onKeyDown={(event) => {
              // Enter in the first field moves on to the second while it's still empty.
              if (event.key === 'Enter' && !labName.trim()) {
                event.preventDefault();
                labRef.current?.focus();
              }
            }}
            onChange={(event) => {
              onNameChange(event.target.value);
              if (errors.name) setErrors((current) => ({ ...current, name: null }));
            }}
          />
          {errors.name ? (
            <p className="sgt-onb__error" id="sgt-onb-name-error" role="alert">{errors.name}</p>
          ) : null}
        </div>

        <div className="sgt-onb-field">
          <label className="sgt-onb-field__label" htmlFor="sgt-onb-lab">Lab name</label>
          <input
            ref={labRef}
            id="sgt-onb-lab"
            className={`sgt-onb-input${errors.lab ? ' is-invalid' : ''}`}
            type="text"
            autoComplete="organization"
            autoCapitalize="words"
            spellCheck={false}
            maxLength={60}
            placeholder="e.g. Sharma Testing Laboratories"
            value={labName}
            aria-describedby={errors.lab ? 'sgt-onb-lab-error' : undefined}
            aria-invalid={Boolean(errors.lab) || undefined}
            onFocus={() => onFocusField?.('lab')}
            onChange={(event) => {
              onLabNameChange(event.target.value);
              if (errors.lab) setErrors((current) => ({ ...current, lab: null }));
            }}
          />
          {errors.lab ? (
            <p className="sgt-onb__error" id="sgt-onb-lab-error" role="alert">{errors.lab}</p>
          ) : null}
        </div>
      </div>

      <div className="sgt-onb__actions">
        <button type="submit" className="sgt-btn sgt-btn--brand sgt-btn--lg" disabled={!name.trim() || !labName.trim()}>
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
