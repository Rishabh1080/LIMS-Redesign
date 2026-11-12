import { useState } from 'react';
import { IconArrowLeft, IconArrowRight, IconLock } from '@tabler/icons-react';
import { formatIndianMobile } from '../lib/format';

export function validatePhone(digits) {
  if (digits.length < 10) return 'Enter your 10-digit mobile number.';
  if (!/^[6-9]\d{9}$/.test(digits)) return 'Indian mobile numbers start with 6, 7, 8 or 9.';
  return null;
}

export function PhoneStep({ value, onChange, onSubmit, onBack, sending }) {
  const [error, setError] = useState(null);

  const submit = (event) => {
    event.preventDefault();
    const problem = validatePhone(value);
    setError(problem);
    if (!problem) onSubmit(value);
  };

  return (
    <form className="sgt-onb-question" onSubmit={submit} noValidate>
      <h1 className="sgt-onb__title">
        <label htmlFor="sgt-onb-phone">What’s your mobile number?</label>
      </h1>
      <p className="sgt-onb__lead" id="sgt-onb-phone-help">We’ll text you a code to finish setting up your lab.</p>
      <div className={`sgt-onb-phone${error ? ' is-invalid' : ''}`}>
        <span className="sgt-onb-phone__prefix" aria-hidden="true">+91</span>
        <input
          id="sgt-onb-phone"
          className="sgt-onb-phone__input"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="98765 43210"
          value={formatIndianMobile(value)}
          autoFocus
          aria-describedby={error ? 'sgt-onb-phone-error' : 'sgt-onb-phone-help'}
          aria-invalid={Boolean(error) || undefined}
          onChange={(event) => {
            let digits = event.target.value.replace(/\D/g, '');
            if (digits.length > 10 && digits.startsWith('91')) digits = digits.slice(2);
            onChange(digits.slice(0, 10));
            if (error) setError(null);
          }}
        />
      </div>
      {error ? (
        <p className="sgt-onb__error" id="sgt-onb-phone-error" role="alert">{error}</p>
      ) : null}
      <p className="sgt-onb__privacy">
        <IconLock size={14} stroke={1.9} aria-hidden="true" />
        Used only to verify you. We never share your number.
      </p>
      <div className="sgt-onb__actions">
        <button type="submit" className="sgt-btn sgt-btn--brand sgt-btn--lg" disabled={value.length < 10 || sending}>
          {sending ? <span className="sgt-spinner" aria-hidden="true" /> : null}
          {sending ? 'Sending code…' : 'Send code'}
          {sending ? null : <IconArrowRight size={18} stroke={2} aria-hidden="true" />}
        </button>
      </div>
      <button type="button" className="sgt-onb__back" onClick={onBack}>
        <IconArrowLeft size={16} stroke={2} aria-hidden="true" />
        Back
      </button>
    </form>
  );
}
