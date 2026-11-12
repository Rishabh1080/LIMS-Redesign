import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  IconArrowRight,
  IconExternalLink,
  IconFileCertificate,
  IconListCheck,
  IconRotateClockwise2,
  IconShieldCheck,
  IconTool,
  IconUsers,
} from '@tabler/icons-react';
import { useLims } from '../store/LimsStore';
import { cx, pluralize } from '../lib/format';
import { usePrefersReducedMotion } from '../lib/hooks';
import { useTour } from './TourProvider';

const DialogExit = createContext((fn) => fn());

/** Buttons inside a tour dialog call exit(fn): the dialog animates out, then fn runs. */
function useExit() {
  return useContext(DialogExit);
}

function TourDialog({ labelledBy, onEscape, className, children, decoration }) {
  const cardRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();
  const [leaving, setLeaving] = useState(false);
  const leavingRef = useRef(false);

  const exit = useCallback(
    (fn) => {
      if (leavingRef.current) return;
      leavingRef.current = true;
      setLeaving(true);
      window.setTimeout(() => fn?.(), reducedMotion ? 0 : 170);
    },
    [reducedMotion],
  );

  useEffect(() => {
    const target = cardRef.current?.querySelector('[data-autofocus]') ?? cardRef.current?.querySelector('button');
    target?.focus({ preventScroll: true });
  }, []);

  return (
    <DialogExit.Provider value={exit}>
      <div className={cx('sgt-tour-layer', 'sgt-tour-layer--dialog', leaving && 'is-leaving')}>
        <div className="sgt-tour-blocker sgt-tour-blocker--full" aria-hidden="true" />
        {decoration}
        <div
          ref={cardRef}
          className={cx('sgt-tour-dialog', className)}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.stopPropagation();
              exit(onEscape);
            }
          }}
        >
          {children}
        </div>
      </div>
    </DialogExit.Provider>
  );
}

function CheckBadge({ burst = false }) {
  return (
    <span className="sgt-check-badge-wrap">
      {burst ? (
        <span className="sgt-burst" aria-hidden="true">
          {Array.from({ length: 10 }, (_, index) => (
            <span key={index} style={{ '--a': `${index * 36}deg`, '--d': `${(index % 3) * 40}ms` }} />
          ))}
        </span>
      ) : null}
      <svg className="sgt-check-badge" viewBox="0 0 64 64" aria-hidden="true">
        <circle className="sgt-check-badge__ring" cx="32" cy="32" r="28" />
        <path className="sgt-check-badge__tick" d="M20 33.5l8 8 16-17" />
      </svg>
    </span>
  );
}

/** A dialog button that plays the exit animation before running its action. */
function ExitButton({ run, children, ...props }) {
  const exit = useExit();
  return (
    <button type="button" {...props} onClick={() => exit(run)}>
      {children}
    </button>
  );
}

const CONFETTI_COLORS = ['#ffbd2e', '#021d49', '#1379f0', '#4db04f', '#ff9800', '#94ccf9'];

/** One short shower at the very end. Brand colours only; skipped under reduced motion. */
function Confetti({ count = 64 }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => ({
        id: index,
        x: Math.random() * 100,
        delay: Math.random() * 0.45,
        duration: 1.5 + Math.random() * 1.1,
        drift: (Math.random() - 0.5) * 140,
        rotate: (Math.random() - 0.5) * 900,
        color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
        round: index % 4 === 0,
        size: 6 + Math.round(Math.random() * 5),
      })),
    [count],
  );

  return (
    <div className="sgt-confetti" aria-hidden="true">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className={cx('sgt-confetti__piece', piece.round && 'is-round')}
          style={{
            left: `${piece.x}%`,
            width: piece.size,
            height: piece.round ? piece.size : piece.size * 0.45,
            background: piece.color,
            '--delay': `${piece.delay}s`,
            '--dur': `${piece.duration}s`,
            '--drift': `${piece.drift}px`,
            '--rot': `${piece.rotate}deg`,
          }}
        />
      ))}
    </div>
  );
}

/** The first thing after setup: say hello, name the first task, start it. */
export function TourIntro() {
  const { chapters, ctx, actions } = useTour();
  const first = chapters[0];

  return (
    <TourDialog labelledBy="sgt-intro-title" onEscape={actions.dismissIntro} className="sgt-intro">
      <span className="sgt-eyebrow sgt-eyebrow--brand">Your lab is ready</span>
      <h2 className="sgt-tour-dialog__title" id="sgt-intro-title">
        Welcome in{ctx.firstName ? `, ${ctx.firstName}` : ''}.
      </h2>
      <p className="sgt-tour-dialog__lead">
        First, log a customer’s samples as a new inward. Then take it all the way to its COA: review, allocation, results and approval. About 10 minutes.
      </p>
      <div className="sgt-tour-dialog__buttons">
        <ExitButton className="sgt-btn sgt-btn--ghost" run={actions.dismissIntro}>
          I’ll look around first
        </ExitButton>
        <ExitButton className="sgt-btn sgt-btn--brand" data-autofocus run={() => actions.startChapter(first.id)}>
          {first.title}
          <IconArrowRight size={18} stroke={2} aria-hidden="true" />
        </ExitButton>
      </div>
    </TourDialog>
  );
}

export function ChapterComplete() {
  const { chapters, tour, actions } = useTour();
  const index = Math.max(0, chapters.findIndex((entry) => entry.id === tour.celebratedChapterId));
  const chapter = chapters[index];
  const ordered = [...chapters.slice(index + 1), ...chapters.slice(0, index + 1)];
  const next = ordered.find((entry) => !tour.completed[entry.id]) ?? null;

  return (
    <TourDialog labelledBy="sgt-complete-title" onEscape={actions.breakAfterCelebration} className="sgt-complete">
      <CheckBadge burst />
      <span className="sgt-eyebrow sgt-eyebrow--brand">
        {index + 1} of {chapters.length} done
      </span>
      <h2 className="sgt-tour-dialog__title" id="sgt-complete-title">
        {chapter.title}
      </h2>
      <p className="sgt-tour-dialog__lead">{chapter.outcome}</p>
      <ol className="sgt-complete__dots" aria-label="Chapters">
        {chapters.map((entry) => (
          <li key={entry.id} className={cx(tour.completed[entry.id] && 'is-done')} title={entry.title}>
            <span className="sgt-sr-only">
              {entry.title}: {tour.completed[entry.id] ? 'done' : 'not started'}
            </span>
          </li>
        ))}
      </ol>
      <div className="sgt-tour-dialog__buttons sgt-tour-dialog__buttons--center">
        <ExitButton className="sgt-btn sgt-btn--ghost" run={actions.breakAfterCelebration}>
          Take a break
        </ExitButton>
        <ExitButton className="sgt-btn sgt-btn--brand" data-autofocus run={actions.continueAfterCelebration}>
          {next ? `Next: ${next.title}` : 'See your summary'}
          <IconArrowRight size={18} stroke={2} aria-hidden="true" />
        </ExitButton>
      </div>
    </TourDialog>
  );
}

const fullProduct = [
  { icon: IconListCheck, text: 'Result entry with calculations and specification checks' },
  { icon: IconShieldCheck, text: 'Review and approval with a full audit trail' },
  { icon: IconFileCertificate, text: 'NABL-format test reports and COAs in one click' },
  { icon: IconTool, text: 'Instruments, calibration, inventory and documents' },
  { icon: IconUsers, text: 'Trainings, competence records and leave' },
];

export function WrapUp({ ctaUrl, ctaLabel }) {
  const { tour, ctx, actions, track } = useTour();
  const { state } = useLims();

  const stats = useMemo(() => {
    const ids = new Set(state.data.userInwardIds);
    const samples = state.data.samples.filter((sample) => ids.has(sample.inwardId)).length;
    const trs = state.data.trs.filter((tr) => ids.has(tr.inwardId)).length;
    const minutes = tour.startedAt && tour.completedAt ? Math.max(1, Math.round((tour.completedAt - tour.startedAt) / 60000)) : null;
    return { inwards: ids.size, samples, trs, allocated: state.data.userAllocatedTrIds.length, minutes };
  }, [state.data, tour.startedAt, tour.completedAt]);

  return (
    <TourDialog labelledBy="sgt-wrap-title" onEscape={actions.dismissWrapUp} className="sgt-wrap" decoration={<Confetti />}>
      <CheckBadge burst />
      <span className="sgt-eyebrow sgt-eyebrow--brand">Tour complete</span>
      <h2 className="sgt-tour-dialog__title" id="sgt-wrap-title">
        That’s a working day in the lab{ctx.firstName ? `, ${ctx.firstName}` : ''}.
      </h2>
      <p className="sgt-tour-dialog__lead">
        From the front desk to the analyst’s bench, with nothing written on paper and nobody chasing updates.
      </p>
      <dl className="sgt-wrap__stats">
        <div><dt>Inwards logged</dt><dd>{stats.inwards}</dd></div>
        <div><dt>Samples registered</dt><dd>{stats.samples}</dd></div>
        <div><dt>Tests allocated</dt><dd>{stats.allocated}</dd></div>
        <div><dt>Time taken</dt><dd>{stats.minutes ? pluralize(stats.minutes, 'min') : '-'}</dd></div>
      </dl>
      <div className="sgt-wrap__more">
        <h3 className="sgt-wrap__more-title">What the full product adds</h3>
        <ul>
          {fullProduct.map(({ icon: Icon, text }) => (
            <li key={text}>
              <Icon size={16} stroke={1.9} aria-hidden="true" />
              {text}
            </li>
          ))}
        </ul>
      </div>
      <div className="sgt-tour-dialog__buttons sgt-wrap__buttons">
        <ExitButton className="sgt-btn sgt-btn--ghost" run={actions.restart}>
          <IconRotateClockwise2 size={16} stroke={1.9} aria-hidden="true" />
          Replay the tour
        </ExitButton>
        <span className="sgt-coach__spacer" />
        <ExitButton className="sgt-btn sgt-btn--secondary" run={actions.dismissWrapUp}>
          Keep exploring
        </ExitButton>
        <a
          className="sgt-btn sgt-btn--brand"
          href={ctaUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-autofocus
          onClick={() => track('cta_clicked', { cta: 'book_demo', placement: 'wrap_up', url: ctaUrl })}
        >
          {ctaLabel}
          <IconExternalLink size={16} stroke={2} aria-hidden="true" />
        </a>
      </div>
    </TourDialog>
  );
}
