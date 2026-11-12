import { IconCircleCheckFilled, IconPhone, IconUser } from '@tabler/icons-react';
import { logoSrc as logo } from '../assets';
import { getPack } from '../store/domains';
import { cx, firstName, greetingFor } from '../lib/format';

/** A field in the mock: a skeleton bar until it has a value, then the value. */
function Slot({ value, width = 64, className }) {
  const filled = Boolean(value);
  return (
    <span className={cx('sgt-lp-slot', filled ? 'is-filled' : 'is-empty', className)} style={filled ? undefined : { width }}>
      {filled ? (
        <span key={filled ? 'filled' : 'empty'} className="sgt-lp-slot__text">
          {value}
        </span>
      ) : null}
    </span>
  );
}

/**
 * The visitor's demo lab, assembling beside the questions. Each answer fills
 * a part of it: your name -> greeting and profile chip, lab name -> sidebar,
 * lab type -> sidebar tag, OTP -> verified tick on the profile chip. The phone
 * chip is Sampleify's support line, as in the real header, so the visitor's
 * number never appears here. The setup screen continues the same picture and
 * zooms it into the real LIMS.
 */
export function LabPreview({ name, labName = '', domain, supportPhone = '+91-6358273804', verified, focus, leaving = false }) {
  const pack = domain ? getPack(domain) : null;
  const first = firstName(name);

  return (
    <div className={leaving ? 'sgt-lp is-leaving' : 'sgt-lp'} aria-hidden="true">
      <div className="sgt-lp__caption">
        <span className="sgt-lp__dot" />
        Your personalised LIMS
      </div>
      <div className="sgt-lp__window">
        <div className="sgt-lp__chrome">
          <span />
          <span />
          <span />
        </div>
        <div className="sgt-lp__body">
          <aside className="sgt-lp__sidebar">
            <div className={cx('sgt-lp__brand', focus === 'lab' && 'is-focus')}>
              <span className="sgt-lp__logo">
                <img src={logo} alt="" />
              </span>
              <span className="sgt-lp__brand-copy">
                <Slot value={labName.trim()} width={72} className="sgt-lp__lab-name" />
                <Slot value={pack ? pack.tag : ''} width={54} className="sgt-lp__lab-tag" />
              </span>
            </div>
            <ul className="sgt-lp__nav">
              <li className="is-active">Dashboard</li>
              <li>Test Requests</li>
              <li>All inwards</li>
            </ul>
            <div className="sgt-lp__tracker">
              <span className="sgt-lp__tracker-label">Guided tour</span>
              <span className="sgt-lp__tracker-bar" />
            </div>
          </aside>
          <div className="sgt-lp__main">
            <div className="sgt-lp__header">
              <span className="sgt-lp__chip">
                <IconPhone size={10} stroke={2} />
                <span className="sgt-lp__support">{supportPhone}</span>
              </span>
              <span className={cx('sgt-lp__chip', focus === 'name' && 'is-focus')}>
                <IconUser size={10} stroke={2} />
                <Slot value={name.trim()} width={44} />
                {verified ? <IconCircleCheckFilled size={11} className="sgt-lp__verified" /> : null}
              </span>
            </div>
            <div className="sgt-lp__greeting">
              <Slot value={first ? `${greetingFor()}, ${first}` : ''} width={110} />
            </div>
            <div className="sgt-lp__tiles">
              {['Received today', 'Delayed', 'To allocate', 'Awaiting approval'].map((label, index) => (
                <div className="sgt-lp__tile" key={label} style={{ '--i': index }}>
                  <span className="sgt-lp__tile-value">{[2, 1, 5, 3][index]}</span>
                  <span className="sgt-lp__tile-label">{label}</span>
                </div>
              ))}
            </div>
            <div className="sgt-lp__chart">
              {[52, 34, 70, 44, 60, 38].map((height, index) => (
                <span key={index} style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
