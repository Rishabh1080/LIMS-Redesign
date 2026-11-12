import { IconX } from '@tabler/icons-react';
import { logoSrc as logo } from '../assets';

/** A simulated SMS notification so the dummy OTP still feels real. */
export function SmsToast({ code, onAutofill, onClose }) {
  return (
    <div className="sgt-sms" role="status" aria-live="polite" aria-label="New text message">
      <span className="sgt-sms__app" aria-hidden="true">
        <img src={logo} alt="" />
      </span>
      <div className="sgt-sms__content">
        <div className="sgt-sms__meta">
          <span className="sgt-sms__sender">SMPLFY</span>
          <span className="sgt-sms__time">Messages · now</span>
        </div>
        <p className="sgt-sms__text">
          <strong className="sgt-sms__code">{code}</strong> is your Sampleify verification code. It expires in 10 minutes. Do not share it with anyone.
        </p>
        <button type="button" className="sgt-sms__fill" onClick={onAutofill}>
          Fill code
        </button>
      </div>
      <button type="button" className="sgt-sms__close" aria-label="Dismiss message" onClick={onClose}>
        <IconX size={14} stroke={2} />
      </button>
    </div>
  );
}
