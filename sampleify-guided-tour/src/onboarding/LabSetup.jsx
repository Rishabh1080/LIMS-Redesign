import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { IconCheck } from '@tabler/icons-react';
import { logoSrc as logo } from '../assets';
import { usePrefersReducedMotion } from '../lib/hooks';
import { cx } from '../lib/format';

function tasksFor(pack) {
  return [
    'Creating your lab workspace',
    'Adding customers, analysts and instruments',
    `Loading ${pack.methodsLine}`,
    'Preparing your guided tour',
  ];
}

const TASK_MS = 650;
const HOLD_MS = 450;
const ZOOM_MS = 640;
const REVEAL_MS = 280;

// Matches the real shell (lims.css) so the zoomed skeleton lands on it exactly.
const SIDEBAR = 256;
const HEADER = 64;

/**
 * "Setting up your lab": a scaled-down skeleton of the LIMS assembles as each
 * task completes, then zooms to fill the screen. Its sidebar and header land
 * exactly where the real ones are, and the overlay fades to reveal the live
 * app that has been mounted underneath all along.
 */
export function LabSetup({ labName, pack, onDone }) {
  const reducedMotion = usePrefersReducedMotion();
  const tasks = tasksFor(pack);
  const [viewport] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  const canZoom = !reducedMotion && viewport.w >= 1024;
  const frameW = canZoom ? Math.min(680, viewport.w * 0.48) : Math.min(360, viewport.w * 0.86);
  const k = canZoom ? frameW / viewport.w : frameW / 1280;
  const frameH = canZoom ? viewport.h * k : frameW * 0.62;
  const [done, setDone] = useState(0);
  const [phase, setPhase] = useState('build');
  const [zoomStyle, setZoomStyle] = useState(null);
  const frameRef = useRef(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  const speed = reducedMotion ? 0.35 : 1;
  const ready = done >= tasks.length;

  // Build timeline.
  useEffect(() => {
    if (phase !== 'build') return undefined;
    if (ready) {
      const id = window.setTimeout(() => setPhase(canZoom ? 'zoom' : 'reveal'), HOLD_MS * speed);
      return () => window.clearTimeout(id);
    }
    const id = window.setTimeout(() => setDone((value) => value + 1), TASK_MS * speed);
    return () => window.clearTimeout(id);
  }, [done, phase, ready, canZoom, speed]);

  // Zoom: measure where the frame is, then transform it onto the viewport.
  useLayoutEffect(() => {
    if (phase !== 'zoom' || !frameRef.current) return undefined;
    const rect = frameRef.current.getBoundingClientRect();
    const scale = viewport.w / rect.width;
    const frame = window.requestAnimationFrame(() => {
      setZoomStyle({ transform: `translate(${-rect.left}px, ${-rect.top}px) scale(${scale})` });
    });
    const id = window.setTimeout(() => setPhase('reveal'), ZOOM_MS + 40);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(id);
    };
  }, [phase, viewport.w]);

  useEffect(() => {
    if (phase !== 'reveal') return undefined;
    const id = window.setTimeout(() => doneRef.current(), reducedMotion ? 120 : REVEAL_MS);
    return () => window.clearTimeout(id);
  }, [phase, reducedMotion]);

  const status = ready ? `${labName} is ready` : tasks[done];

  return (
    <div className={cx('sgt-setup', `is-${phase}`)} role="status" aria-live="polite">
      <div className="sgt-onb__bg" aria-hidden="true" />
      <div className="sgt-setup__inner">
        <h1 className="sgt-setup__title">
          Setting up {labName}
        </h1>

        <div
          ref={frameRef}
          className={cx('sgt-sf', done >= 1 && 'has-1', done >= 2 && 'has-2', done >= 3 && 'has-3', done >= 4 && 'has-4')}
          style={{
            width: frameW,
            height: frameH,
            '--k': k,
            '--sidebar': `${SIDEBAR * k}px`,
            '--header': `${HEADER * k}px`,
            ...zoomStyle,
          }}
          aria-hidden="true"
        >
          <div className="sgt-sf__sidebar">
            <div className="sgt-sf__brand">
              <span className="sgt-sf__logo">
                <img src={logo} alt="" />
              </span>
              <span className="sgt-sf__bar sgt-sf__bar--light" style={{ width: '46%' }} />
            </div>
            <div className="sgt-sf__nav">
              {[0, 1, 2].map((index) => (
                <span key={index} className={cx('sgt-sf__nav-row', index === 0 && 'is-active')} style={{ '--i': index }} />
              ))}
            </div>
            <div className="sgt-sf__tracker">
              <span className="sgt-sf__tracker-bar" />
              {[0, 1, 2].map((index) => (
                <span key={index} className="sgt-sf__bar sgt-sf__bar--light" style={{ width: `${70 - index * 10}%` }} />
              ))}
            </div>
          </div>
          <div className="sgt-sf__main">
            <div className="sgt-sf__header">
              {[0, 1, 2].map((index) => (
                <span key={index} className="sgt-sf__chip" style={{ '--i': index }} />
              ))}
            </div>
            <div className="sgt-sf__content">
              <span className="sgt-sf__bar sgt-sf__bar--title" />
              <div className="sgt-sf__tiles">
                {[0, 1, 2, 3].map((index) => (
                  <span key={index} className="sgt-sf__tile" style={{ '--i': index }}>
                    <span className="sgt-sf__tile-value" />
                  </span>
                ))}
              </div>
              <div className="sgt-sf__chart">
                {[46, 72, 38, 88, 60, 54].map((height, index) => (
                  <span key={index} style={{ height: `${height}%`, '--i': index }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="sgt-setup__status">
          <span className={cx('sgt-setup__status-icon', ready && 'is-ready')} aria-hidden="true">
            {ready ? <IconCheck size={13} stroke={3} /> : <span className="sgt-spinner" />}
          </span>
          <span key={status} className="sgt-setup__status-text">
            {status}
          </span>
        </div>
        <ol className="sgt-setup__pips" aria-label={`${Math.min(done, tasks.length)} of ${tasks.length} done`}>
          {tasks.map((task, index) => (
            <li key={task} className={cx(index < done && 'is-done', index === done && 'is-active')} />
          ))}
        </ol>
      </div>
    </div>
  );
}
