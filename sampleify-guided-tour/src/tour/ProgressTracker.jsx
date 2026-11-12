import { useEffect, useId, useRef, useState } from 'react';
import { IconCheck, IconPlayerPause, IconPlayerPlay, IconRotateClockwise2, IconRoute, IconX } from '@tabler/icons-react';
import { cx } from '../lib/format';
import { useTour } from './TourProvider';

function ProgressRing({ ratio, size = 36, stroke = 3.5, className }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  return (
    <svg className={cx('sgt-ring', className)} width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle className="sgt-ring__track" cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} />
      <circle
        className="sgt-ring__value"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - ratio)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

function chapterState(tour, chapter) {
  if (tour.completed[chapter.id]) return 'done';
  if (tour.chapterId === chapter.id && (tour.status === 'running' || tour.status === 'paused')) {
    return tour.status === 'running' ? 'active' : tour.stepIndex > 0 ? 'paused' : 'next';
  }
  return 'todo';
}

function chapterMeta(tour, chapter, status) {
  if (status === 'done') return 'Done · Retry';
  if (status === 'active') return `Step ${tour.stepIndex + 1} of ${chapter.steps.length}`;
  if (status === 'paused') return `Paused at step ${tour.stepIndex + 1} of ${chapter.steps.length}`;
  return `${chapter.steps.length} steps · ${chapter.duration}`;
}

function useCta() {
  const { tour, chapters, actions } = useTour();
  const current = chapters.find((entry) => entry.id === tour.chapterId) ?? chapters[0];
  switch (tour.status) {
    case 'intro':
      return { label: 'Start the tour', icon: IconPlayerPlay, run: () => actions.startChapter(chapters[0].id) };
    case 'running':
      return { label: 'Pause tour', icon: IconPlayerPause, run: actions.pause, quiet: true };
    case 'celebrating':
      return { label: 'Continue', icon: IconPlayerPlay, run: actions.continueAfterCelebration };
    case 'completed':
      return { label: 'Replay the tour', icon: IconRotateClockwise2, run: actions.restart, quiet: true };
    default:
      return { label: tour.stepIndex > 0 ? `Resume: ${current.title}` : `Start: ${current.title}`, icon: IconPlayerPlay, run: actions.resume };
  }
}

/** Chapter ids that became done since the last render, for a one-time check pop. */
function useJustCompleted(completed) {
  const previousRef = useRef(completed);
  const [fresh, setFresh] = useState([]);

  useEffect(() => {
    const added = Object.keys(completed).filter((id) => completed[id] && !previousRef.current[id]);
    previousRef.current = completed;
    if (!added.length) return undefined;
    setFresh(added);
    const timer = window.setTimeout(() => setFresh([]), 1200);
    return () => window.clearTimeout(timer);
  }, [completed]);

  return fresh;
}

function TrackerContent({ theme, titleId, onAfterAction }) {
  const { chapters, tour, progress, actions } = useTour();
  const fresh = useJustCompleted(tour.completed);
  const percent = Math.round(progress.ratio * 100);
  const cta = useCta();
  const CtaIcon = cta.icon;
  const after = (fn) => () => {
    fn();
    onAfterAction?.();
  };

  return (
    <div className={cx('sgt-tracker', `sgt-tracker--${theme}`)}>
      <div className="sgt-tracker__head">
        <h2 className="sgt-tracker__title" id={titleId}>Guided tour</h2>
        <span className="sgt-tracker__count">
          <span className="sgt-tracker__percent" key={percent}>{percent}%</span> · {progress.done}/{progress.total} tasks
        </span>
      </div>
      <div
        className="sgt-tracker__bar"
        role="progressbar"
        aria-label="Tour progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress.ratio * 100)}
      >
        <span style={{ width: `${progress.ratio * 100}%` }} />
      </div>
      <ol className="sgt-tracker__list">
        {chapters.map((chapter, index) => {
          const status = chapterState(tour, chapter);
          return (
            <li key={chapter.id}>
              <button
                type="button"
                className={cx('sgt-tracker__item', `is-${status}`, fresh.includes(chapter.id) && 'is-fresh')}
                aria-current={status === 'active' ? 'step' : undefined}
                onClick={after(() => actions.startChapter(chapter.id))}
              >
                <span className="sgt-tracker__icon" aria-hidden="true">
                  {status === 'done' ? <IconCheck size={13} stroke={3} /> : index + 1}
                </span>
                <span className="sgt-tracker__text">
                  <span className="sgt-tracker__name">{chapter.title}</span>
                  <span className="sgt-tracker__meta">{chapterMeta(tour, chapter, status)}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <button type="button" className={cx('sgt-tracker__cta', cta.quiet && 'is-quiet')} onClick={after(cta.run)}>
        <CtaIcon size={15} stroke={2} aria-hidden="true" />
        <span>{cta.label}</span>
      </button>
    </div>
  );
}

function usePopover() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return { open, setOpen, rootRef };
}

/** Bottom half of the sidebar. Collapses to a progress ring with a popover. */
export function SidebarTracker({ collapsed }) {
  const { progress } = useTour();
  const titleId = useId();
  const popover = usePopover();

  if (!collapsed) {
    return (
      <section className="sgt-sidebar__tracker" data-tour="tour-tracker" aria-labelledby={titleId}>
        <TrackerContent theme="dark" titleId={titleId} />
      </section>
    );
  }

  return (
    <div className="sgt-sidebar__tracker sgt-sidebar__tracker--collapsed" ref={popover.rootRef} data-tour="tour-tracker">
      <button
        type="button"
        className="sgt-tracker-ring-btn"
        aria-expanded={popover.open}
        aria-label={`Guided tour, ${Math.round(progress.ratio * 100)}% complete`}
        onClick={() => popover.setOpen((value) => !value)}
      >
        <ProgressRing ratio={progress.ratio} size={40} />
        <IconRoute size={18} stroke={1.9} className="sgt-tracker-ring-btn__icon" aria-hidden="true" />
      </button>
      {popover.open ? (
        <div className="sgt-tracker-pop sgt-tracker-pop--sidebar" role="dialog" aria-labelledby={titleId}>
          <TrackerContent theme="light" titleId={titleId} onAfterAction={() => popover.setOpen(false)} />
        </div>
      ) : null}
    </div>
  );
}

/** Bottom-right floating button with a popover (trackerPlacement: 'fab'). */
export function FabTracker() {
  const { progress, tour } = useTour();
  const titleId = useId();
  const popover = usePopover();
  const label = tour.status === 'completed' ? 'Tour done' : `Tour ${progress.done}/${progress.total}`;

  return (
    <div className="sgt-fab-wrap" ref={popover.rootRef}>
      {popover.open ? (
        <div className="sgt-tracker-pop sgt-tracker-pop--fab" role="dialog" aria-labelledby={titleId}>
          <button type="button" className="sgt-tracker-pop__close sgt-icon-btn" aria-label="Close" onClick={() => popover.setOpen(false)}>
            <IconX size={16} stroke={2} />
          </button>
          <TrackerContent theme="light" titleId={titleId} onAfterAction={() => popover.setOpen(false)} />
        </div>
      ) : null}
      <button
        type="button"
        className="sgt-fab"
        data-tour="tour-fab"
        aria-expanded={popover.open}
        aria-label={`Guided tour, ${Math.round(progress.ratio * 100)}% complete`}
        onClick={() => popover.setOpen((value) => !value)}
      >
        <span className="sgt-fab__ring">
          <ProgressRing ratio={progress.ratio} size={40} stroke={3.5} />
          <IconRoute size={18} stroke={1.9} className="sgt-fab__icon" aria-hidden="true" />
        </span>
        <span className="sgt-fab__label">{label}</span>
      </button>
    </div>
  );
}
