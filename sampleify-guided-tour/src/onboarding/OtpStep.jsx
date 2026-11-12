import { useEffect, useRef, useState } from 'react';
import { IconArrowLeft, IconCircleCheck } from '@tabler/icons-react';
import { otpLength, verifyOtp } from '../services/auth';
import { formatIndianMobile } from '../lib/format';

const RESEND_AFTER_SEC = 30;

export function emptyOtp() {
  return Array.from({ length: otpLength }, () => '');
}

export function OtpStep({ phone, digits, setDigits, onVerified, onAccepted, onChangeNumber, onResend }) {
  const inputsRef = useRef([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [shaking, setShaking] = useState(false);
  const [resendIn, setResendIn] = useState(RESEND_AFTER_SEC);
  const [resending, setResending] = useState(false);
  const code = digits.join('');

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const id = window.setTimeout(() => setResendIn((value) => value - 1), 1000);
    return () => window.clearTimeout(id);
  }, [resendIn]);

  useEffect(() => {
    if (code.length !== otpLength || status !== 'idle') return undefined;
    let cancelled = false;
    setStatus('verifying');
    verifyOtp(phone, code).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setStatus('success');
        onAccepted?.();
        // Long enough for the boxes to ripple green and the preview to tick.
        window.setTimeout(onVerified, 900);
        return;
      }
      setStatus('idle');
      setError(
        result.reason === 'expired'
          ? 'That code has expired. Tap Resend code for a new one.'
          : 'That code doesn’t match. Check the message and try again.',
      );
      setShaking(true);
      window.setTimeout(() => setShaking(false), 450);
      setDigits(emptyOtp());
      // Inputs are disabled while verifying; focus once they re-enable.
      window.setTimeout(() => inputsRef.current[0]?.focus(), 30);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const focusBox = (index) => {
    const node = inputsRef.current[Math.max(0, Math.min(otpLength - 1, index))];
    node?.focus();
    node?.select();
  };

  const fillFrom = (start, text) => {
    const next = [...digits];
    text.split('').forEach((char, offset) => {
      if (start + offset < otpLength) next[start + offset] = char;
    });
    setDigits(next);
    focusBox(start + text.length);
  };

  const handleChange = (index, raw) => {
    const value = raw.replace(/\D/g, '');
    if (error) setError(null);
    if (value.length > 1) {
      fillFrom(index, value.slice(0, otpLength - index));
      return;
    }
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (value) focusBox(index + 1);
  };

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      event.preventDefault();
      const next = [...digits];
      next[index - 1] = '';
      setDigits(next);
      focusBox(index - 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      focusBox(index - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      focusBox(index + 1);
    }
  };

  const resend = async () => {
    setResending(true);
    setError(null);
    setDigits(emptyOtp());
    await onResend();
    setResending(false);
    setResendIn(RESEND_AFTER_SEC);
    focusBox(0);
  };

  const busy = status === 'verifying' || status === 'success';

  return (
    <div className="sgt-onb-question">
      <h1 className="sgt-onb__title" id="sgt-onb-otp-title">Enter the {otpLength}-digit code</h1>
      <p className="sgt-onb__lead">
        Sent to <strong className="sgt-onb__strong">+91 {formatIndianMobile(phone)}</strong>.{' '}
        <button type="button" className="sgt-onb__link" onClick={onChangeNumber}>
          Change number
        </button>
      </p>

      <div
        className={`sgt-otp${error ? ' is-invalid' : ''}${shaking ? ' is-shaking' : ''}${status === 'success' ? ' is-success' : ''}`}
        role="group"
        aria-labelledby="sgt-onb-otp-title"
      >
        {digits.map((digit, index) => (
          <input
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            ref={(node) => {
              inputsRef.current[index] = node;
            }}
            className="sgt-otp__box"
            style={{ '--i': index }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            maxLength={otpLength}
            value={digit}
            disabled={busy}
            aria-label={`Digit ${index + 1} of ${otpLength}`}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onFocus={(event) => event.target.select()}
          />
        ))}
      </div>

      <div className="sgt-otp__status" aria-live="polite">
        {status === 'verifying' ? (
          <span className="sgt-otp__checking">
            <span className="sgt-spinner" aria-hidden="true" />
            Checking code…
          </span>
        ) : status === 'success' ? (
          <span className="sgt-otp__ok">
            <IconCircleCheck size={18} stroke={2} aria-hidden="true" />
            Verified. Setting up your lab…
          </span>
        ) : error ? (
          <span className="sgt-onb__error" role="alert">{error}</span>
        ) : null}
      </div>

      <div className="sgt-otp__resend">
        {resendIn > 0 ? (
          <span>Resend code in 0:{String(resendIn).padStart(2, '0')}</span>
        ) : (
          <button type="button" className="sgt-onb__link" onClick={resend} disabled={resending || busy}>
            {resending ? 'Sending…' : 'Resend code'}
          </button>
        )}
      </div>

      <button type="button" className="sgt-onb__back" onClick={onChangeNumber} disabled={busy}>
        <IconArrowLeft size={16} stroke={2} aria-hidden="true" />
        Back
      </button>
    </div>
  );
}
