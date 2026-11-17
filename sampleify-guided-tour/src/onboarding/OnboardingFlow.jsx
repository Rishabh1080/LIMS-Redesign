import { useEffect, useRef, useState } from 'react';
import { logoSrc as logo } from '../assets';
import { sendOtp } from '../services/auth';
import { markSetupVerified, startSetup } from '../services/setups';
import { cx } from '../lib/format';
import { WelcomeStep } from './WelcomeStep';
import { NameStep } from './NameStep';
import { DomainStep } from './DomainStep';
import { PhoneStep } from './PhoneStep';
import { OtpStep, emptyOtp } from './OtpStep';
import { SmsToast } from './SmsToast';
import { usePrefersReducedMotion } from '../lib/hooks';
import { STAGE_EXIT_MS, StageTransition } from './StageTransition';
import { LabPreview } from './LabPreview';
import { domainIdFor, domainIdsOf } from '../store/domains';

const QUESTION_STEPS = ['name', 'lab', 'phone', 'otp'];
const ORDER = ['welcome', ...QUESTION_STEPS];
// Questions that sit beside the live lab preview. The lab-type grid needs the full width.
const PREVIEW_STEPS = ['name', 'phone', 'otp'];
const SMS_DELIVERY_DELAY_MS = 900;

const layoutOf = (step) => {
  if (step === 'welcome') return 'welcome';
  return PREVIEW_STEPS.includes(step) ? 'preview' : 'wide';
};

/**
 * Welcome -> name -> lab type -> phone -> OTP. Calls onProgress with partial answers so a
 * refresh resumes at the right question, and onComplete once verified.
 */
export function OnboardingFlow({ initial, presetDomain, supportPhone, onProgress, onComplete, track }) {
  // A returning visitor resumes at the first unanswered question. OTPs are
  // never persisted, so a refresh on the OTP screen lands on the phone step.
  const [step, setStep] = useState(() => {
    if (!initial?.name || !initial?.labName) return initial?.name ? 'name' : 'welcome';
    return initial?.domain ? 'phone' : 'lab';
  });
  const [name, setName] = useState(initial?.name ?? '');
  const [labName, setLabName] = useState(initial?.labName ?? '');
  // Picked tile ids, in the order they were picked (the first one leads).
  const [domains, setDomains] = useState(() => domainIdsOf(initial?.domain ?? presetDomain ?? ''));
  const [nameField, setNameField] = useState('name');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [digits, setDigits] = useState(emptyOtp);
  const [sending, setSending] = useState(false);
  const [sms, setSms] = useState(null);
  const [direction, setDirection] = useState('forward');
  const [verified, setVerified] = useState(false);
  const [phoneError, setPhoneError] = useState(null);
  // The server's record of this setup (api/setup/start), once the phone is in.
  const setupIdRef = useRef(null);
  const smsTimerRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();

  // The page layout (welcome hero, question + preview, full-width grid) lags the step
  // by one exit animation, so the outgoing question leaves in the layout it was drawn
  // in and the incoming one enters in its own. Same-layout moves swap instantly.
  const [layout, setLayout] = useState(() => layoutOf(step));
  const targetLayout = layoutOf(step);
  const holdLayout = layout !== targetLayout;

  useEffect(() => {
    if (!holdLayout) return undefined;
    const id = window.setTimeout(() => setLayout(targetLayout), reducedMotion ? 0 : STAGE_EXIT_MS + 10);
    return () => window.clearTimeout(id);
  }, [holdLayout, targetLayout, reducedMotion]);

  useEffect(() => () => window.clearTimeout(smsTimerRef.current), []);

  const deliverSms = (code) => {
    window.clearTimeout(smsTimerRef.current);
    setSms(null);
    smsTimerRef.current = window.setTimeout(() => setSms({ code, id: Date.now() }), SMS_DELIVERY_DELAY_MS);
  };

  const goTo = (next) => {
    setDirection(ORDER.indexOf(next) >= ORDER.indexOf(step) ? 'forward' : 'back');
    setStep(next);
    if (next !== 'otp') setSms(null);
  };

  const domain = domainIdFor(domains);

  const submitName = (value) => {
    setName(value.name);
    setLabName(value.labName);
    onProgress({ name: value.name, labName: value.labName, step: 'lab' });
    track('onboarding_step_completed', { step: 'name' });
    goTo('lab');
  };

  const submitDomain = (value) => {
    setDomains(value);
    const id = domainIdFor(value);
    onProgress({ name, labName, domain: id, step: 'phone' });
    track('onboarding_step_completed', { step: 'lab', domain: id, labTypes: value });
    goTo('phone');
  };

  const submitPhone = async (value) => {
    setPhone(value);
    setPhoneError(null);
    setSending(true);
    // Record the setup and ask whether this number was verified recently.
    const setup = await startSetup({ name, labName, labTypes: domains, domain, phone: value });
    if (setup.rateLimited) {
      setSending(false);
      setPhoneError('Too many attempts with this number. Please try again in an hour.');
      return;
    }
    setupIdRef.current = setup.setupId;
    onProgress({ name, labName, domain, phone: value, step: 'phone' });
    track('onboarding_step_completed', { step: 'phone' });

    if (!setup.otpRequired) {
      // Verified on this number within the last few days: no new code.
      setSending(false);
      track('onboarding_step_completed', { step: 'otp', skipped: true });
      onComplete({ name, labName, phone: value, domain });
      return;
    }

    const result = await sendOtp(value);
    setSending(false);
    setDigits(emptyOtp());
    goTo('otp');
    if (result.ok) deliverSms(result.demoCode);
  };

  const resend = async () => {
    const result = await sendOtp(phone);
    if (result.ok) deliverSms(result.demoCode);
  };

  const finishVerification = () => {
    track('onboarding_step_completed', { step: 'otp' });
    markSetupVerified(setupIdRef.current);
    setSms(null);
    onComplete({ name, labName, phone, domain });
  };

  const questionIndex = QUESTION_STEPS.indexOf(step);
  const showPreview = layout === 'preview';
  const isVerified = verified && step === 'otp';

  let content;
  if (step === 'welcome') {
    content = (
      <WelcomeStep
        onStart={() => {
          track('onboarding_step_completed', { step: 'welcome' });
          goTo('name');
        }}
      />
    );
  } else if (step === 'name') {
    content = (
      <NameStep
        name={name}
        labName={labName}
        onNameChange={setName}
        onLabNameChange={setLabName}
        onFocusField={setNameField}
        onSubmit={submitName}
        onBack={() => goTo('welcome')}
      />
    );
  } else if (step === 'lab') {
    content = <DomainStep name={name} value={domains} onChange={setDomains} onSubmit={submitDomain} onBack={() => goTo('name')} />;
  } else if (step === 'phone') {
    content = <PhoneStep
        value={phone}
        onChange={(next) => {
          setPhone(next);
          if (phoneError) setPhoneError(null);
        }}
        onSubmit={submitPhone}
        onBack={() => goTo('lab')}
        sending={sending}
        serverError={phoneError}
      />;
  } else {
    content = (
      <OtpStep
        phone={phone}
        digits={digits}
        setDigits={setDigits}
        onVerified={finishVerification}
        onAccepted={() => setVerified(true)}
        onResend={resend}
        onChangeNumber={() => goTo('phone')}
      />
    );
  }

  return (
    <div className={cx('sgt-onb', layout === 'welcome' && 'sgt-onb--welcome')}>
      <div className="sgt-onb__bg" aria-hidden="true" />
      <header className="sgt-onb__header">
        <div className="sgt-onb__brand">
          <img src={logo} alt="" className="sgt-onb__logo" />
          <span className="sgt-onb__wordmark">Sampleify</span>
        </div>
        {questionIndex >= 0 ? (
          <div className="sgt-onb__progress" aria-label={`Step ${questionIndex + 1} of ${QUESTION_STEPS.length}`}>
            <span className="sgt-onb__progress-text" aria-hidden="true">
              {questionIndex + 1} / {QUESTION_STEPS.length}
            </span>
            <ol className="sgt-onb__progress-bars" aria-hidden="true">
              {QUESTION_STEPS.map((entry, index) => (
                <li key={entry} className={cx(index <= questionIndex && 'is-done')} />
              ))}
            </ol>
          </div>
        ) : null}
      </header>

      <main className={cx('sgt-onb__main', showPreview && 'has-preview')}>
        <div className="sgt-onb__stage">
          <StageTransition stepKey={step} direction={direction} hold={holdLayout}>
            {content}
          </StageTransition>
        </div>
        {showPreview ? (
          <LabPreview
            name={name}
            labName={labName}
            domain={domain}
            supportPhone={supportPhone}
            verified={isVerified}
            focus={step === 'name' ? nameField : step}
            leaving={holdLayout}
          />
        ) : null}
      </main>

      {sms && step === 'otp' ? (
        <SmsToast
          key={sms.id}
          code={sms.code}
          onClose={() => setSms(null)}
          onAutofill={() => {
            setDigits(sms.code.split(''));
            setSms(null);
          }}
        />
      ) : null}
    </div>
  );
}
