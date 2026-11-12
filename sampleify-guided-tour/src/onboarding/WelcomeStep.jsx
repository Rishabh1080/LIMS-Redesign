import { IconArrowRight, IconFlask, IconHandClick, IconRocket } from '@tabler/icons-react';

// What the test drive gives a lab owner, in their terms. Each line is true of the demo.
const points = [
  {
    icon: IconFlask,
    title: 'Built around your lab',
    text: 'Your lab’s name, the samples you test and a team with the right authorisations.',
  },
  {
    icon: IconHandClick,
    title: 'Hands-on, not a video',
    text: 'Log a sample, book its tests and hand them to an analyst yourself.',
  },
  {
    icon: IconRocket,
    title: 'What go-live looks like',
    text: 'The same screens your front desk and analysts would use from day one.',
  },
];

function PreviewCollage() {
  return (
    <div className="sgt-collage" aria-hidden="true">
      <div className="sgt-collage__window">
        <div className="sgt-collage__rail">
          <span className="sgt-collage__rail-dot is-active" />
          <span className="sgt-collage__rail-dot" />
          <span className="sgt-collage__rail-dot" />
        </div>
        <div className="sgt-collage__screen">
          <div className="sgt-collage__bar" />
          <div className="sgt-collage__metrics">
            {[['12', 'Received today'], ['3', 'To allocate'], ['0', 'Delayed']].map(([value, label]) => (
              <div className="sgt-collage__metric" key={label}>
                <span className="sgt-collage__metric-value">{value}</span>
                <span className="sgt-collage__metric-label">{label}</span>
              </div>
            ))}
          </div>
          <div className="sgt-collage__chart">
            {[46, 72, 38, 88, 60, 54].map((height, index) => (
              <span key={index} style={{ height: `${height}%`, animationDelay: `${index * 90}ms` }} />
            ))}
          </div>
        </div>
      </div>

      <div className="sgt-collage__card sgt-collage__card--sample">
        <div className="sgt-collage__card-row">
          <span className="sgt-collage__id">INW/2026/0149</span>
          <span className="sgt-collage__pill">Pending</span>
        </div>
        <span className="sgt-collage__muted">Turmeric Powder · 3 tests</span>
        <div className="sgt-collage__circles">
          <span className="is-done" />
          <span className="is-testing" />
          <span />
        </div>
      </div>

      <div className="sgt-collage__card sgt-collage__card--analyst">
        <span className="sgt-collage__avatar">PN</span>
        <span className="sgt-collage__who">
          <span className="sgt-collage__name">Priya Nair</span>
          <span className="sgt-collage__muted">Senior Chemist · 3 open</span>
        </span>
        <span className="sgt-collage__ok">Authorised</span>
      </div>
    </div>
  );
}

export function WelcomeStep({ onStart }) {
  return (
    <div className="sgt-onb-welcome">
      <div className="sgt-onb-welcome__copy">
        <h1 className="sgt-onb__title">See your lab run on Sampleify.</h1>
        <p className="sgt-onb__lead">Set up your own lab in a minute, then run a day’s work through it.</p>
        <ul className="sgt-onb-welcome__points">
          {points.map(({ icon: Icon, title, text }) => (
            <li key={title} className="sgt-onb-welcome__point">
              <span className="sgt-onb-welcome__point-icon" aria-hidden="true">
                <Icon size={18} stroke={1.8} />
              </span>
              <span className="sgt-onb-welcome__point-copy">
                <span className="sgt-onb-welcome__point-title">{title}</span>
                <span className="sgt-onb-welcome__point-text">{text}</span>
              </span>
            </li>
          ))}
        </ul>
        <div className="sgt-onb__actions">
          <button type="button" className="sgt-btn sgt-btn--brand sgt-btn--lg" onClick={onStart}>
            Let’s begin
            <IconArrowRight size={18} stroke={2} aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="sgt-onb-welcome__visual">
        <PreviewCollage />
      </div>
    </div>
  );
}
