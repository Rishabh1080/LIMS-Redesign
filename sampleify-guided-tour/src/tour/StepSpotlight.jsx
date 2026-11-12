import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { IconArrowLeft, IconArrowRight, IconBulb, IconCheck, IconPlayerPause, IconSparkles, IconX } from '@tabler/icons-react';
import { useLims } from '../store/LimsStore';
import { usePrefersReducedMotion } from '../lib/hooks';
import { cx } from '../lib/format';
import { resolveStepValue, useTour } from './TourProvider';
import { computeCardPosition, useTargetRect } from './useTargetRect';

const pageLabels = {
  dashboard: 'the Dashboard',
  inwards: 'All inwards',
  'new-inward': 'the New Inward form',
  'inward-details': 'the inward you created',
  'test-requests': 'Test Requests',
};

const toArray = (value) => (value == null ? [] : Array.isArray(value) ? value : [value]);

// Step-to-step choreography: the card is swallowed by the spotlight, the
// spotlight travels to the next target, and the next card grows out of it.
const SWALLOW_MS = 130;
const HOLD_MS = 90; // spotlight waits this long before it travels
const MOVE_MS = 240; // matches .sgt-spotlight.is-moving
const EMERGE_MS = 180;
const SETTLE_MS = 40;
const MAX_WAIT_MS = 1500;
const EASE_IN = 'cubic-bezier(0.4, 0, 1, 1)';
const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';

/** Transform that maps box `from` onto box `to` (transform-origin 0 0). */
function mapBox(from, to) {
  const sx = Math.max(0.04, to.width / from.width);
  const sy = Math.max(0.04, to.height / from.height);
  return `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${sx}, ${sy})`;
}

/** A frozen copy of the outgoing card that shrinks into the spotlight and is removed. */
function swallow(snapshot, into, layer) {
  if (!snapshot || !layer) return;
  const ghost = snapshot.node;
  ghost.removeAttribute('role');
  ghost.setAttribute('aria-hidden', 'true');
  ghost.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
  ghost.classList.add('sgt-coach--ghost');
  ghost.classList.remove('is-waiting');
  layer.appendChild(ghost);
  const from = snapshot.rect;
  const target = into ?? { left: from.left + from.width * 0.1, top: from.top + from.height * 0.1, width: from.width * 0.8, height: from.height * 0.8 };
  const animation = ghost.animate(
    [
      { transform: 'none', opacity: 1, borderRadius: '14px' },
      { transform: mapBox(from, target), opacity: 0, borderRadius: '12px' },
    ],
    { duration: SWALLOW_MS, easing: EASE_IN, fill: 'forwards' },
  );
  const remove = () => ghost.remove();
  animation.onfinish = remove;
  animation.oncancel = remove;
}

/** Four click-catchers around the spotlight (five when the target is look-only). */
function Blockers({ rect, blockTarget, onBlockedClick, onWheel }) {
  if (!rect) {
    return <div className="sgt-tour-blocker sgt-tour-blocker--full" onClick={onBlockedClick} onWheel={onWheel} aria-hidden="true" />;
  }
  const { top, left, width, height, vw, vh } = rect;
  const pieces = [
    { top: 0, left: 0, width: vw, height: top },
    { top: top + height, left: 0, width: vw, height: Math.max(0, vh - top - height) },
    { top, left: 0, width: left, height },
    { top, left: left + width, width: Math.max(0, vw - left - width), height },
  ];
  if (blockTarget) pieces.push({ top, left, width, height });

  return pieces.map((style, index) => (
    <div key={index} className="sgt-tour-blocker" style={style} onClick={onBlockedClick} onWheel={onWheel} aria-hidden="true" />
  ));
}

export function StepSpotlight() {
  const { step, stepKey, chapter, chapterIndex, chapters, tour, ctx, assisting, stepDone, actions, rootRef } = useTour();
  const { state, actions: limsActions } = useLims();
  const reducedMotion = usePrefersReducedMotion();
  const targetId = resolveStepValue(step.target, state, ctx);
  const preferred = resolveStepValue(step.placement, state, ctx) ?? 'bottom';
  const { rect, missing } = useTargetRect({ rootRef, targetId, stepKey, active: true, reducedMotion });
  const cardRef = useRef(null);
  const nextRef = useRef(null);
  const layerRef = useRef(null);
  const [cardSize, setCardSize] = useState({ width: 360, height: 220 });
  const [moving, setMoving] = useState(false);
  const [nudged, setNudged] = useState(false);

  // When the step changes, keep showing the old spotlight for a beat (the card
  // is being swallowed into it), and keep the new card hidden until the
  // spotlight has arrived. Derived in render so no frame shows the new card early.
  const [shownKey, setShownKey] = useState(stepKey);
  const [held, setHeld] = useState(null);
  const [revealed, setRevealed] = useState(reducedMotion);
  const lastSpotRef = useRef(null);
  const snapshotRef = useRef(null);
  if (shownKey !== stepKey) {
    setShownKey(stepKey);
    if (!reducedMotion) {
      setRevealed(false);
      setHeld(lastSpotRef.current ? { rect: lastSpotRef.current } : null);
    }
  }

  const title = resolveStepValue(step.title, state, ctx);
  const body = resolveStepValue(step.body, state, ctx);
  const why = resolveStepValue(step.why, state, ctx);
  const hint = resolveStepValue(step.hint, state, ctx);
  const isAction = step.kind === 'action';
  const previous = chapter.steps[tour.stepIndex - 1];
  const canGoBack = Boolean(previous && previous.kind === 'info');
  const pages = toArray(step.page);
  const wrongPage = pages.length > 0 && !pages.includes(state.nav.page);

  // Measure the card every render so placement accounts for its real height.
  useLayoutEffect(() => {
    const node = cardRef.current;
    if (!node) return;
    const { offsetWidth: width, offsetHeight: height } = node;
    setCardSize((current) => (current.width === width && current.height === height ? current : { width, height }));
  });

  useEffect(() => {
    setMoving(true);
    const id = window.setTimeout(() => setMoving(false), HOLD_MS + MOVE_MS + 80);
    if (!isAction) nextRef.current?.focus({ preventScroll: true });
    return () => window.clearTimeout(id);
  }, [stepKey, targetId, isAction]);

  const viewport = { width: rect?.vw ?? window.innerWidth, height: rect?.vh ?? window.innerHeight };
  const shownRect = missing ? null : rect;
  // What the spotlight draws: the old target while the card is swallowed, then the new one.
  const spotRect = held ? held.rect : shownRect;
  const position = computeCardPosition(shownRect, cardSize, viewport, preferred);

  // 1. Step changed: shrink the outgoing card into the old spotlight.
  useLayoutEffect(() => {
    if (reducedMotion) return;
    swallow(snapshotRef.current, lastSpotRef.current, layerRef.current);
    snapshotRef.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepKey]);

  // Remember the visible card and spotlight, for the next swallow.
  useLayoutEffect(() => {
    if (!held) lastSpotRef.current = spotRect;
    if (revealed && !held && cardRef.current && !reducedMotion) {
      snapshotRef.current = { node: cardRef.current.cloneNode(true), rect: cardRef.current.getBoundingClientRect() };
    }
  });

  // 2. Release the held spotlight so it travels to the new target.
  useEffect(() => {
    if (!held) return undefined;
    const id = window.setTimeout(() => setHeld(null), HOLD_MS);
    return () => window.clearTimeout(id);
  }, [held]);

  // 3. Reveal the card once the spotlight has stopped moving.
  const spotChangedAtRef = useRef(0);
  useLayoutEffect(() => {
    spotChangedAtRef.current = performance.now();
  }, [spotRect]);

  useEffect(() => {
    if (reducedMotion) {
      setRevealed(true);
      return undefined;
    }
    const startedAt = performance.now();
    let frame = 0;
    const wait = () => {
      const now = performance.now();
      const moved = spotChangedAtRef.current > startedAt + HOLD_MS - 20;
      const settled = now - spotChangedAtRef.current >= (moved ? MOVE_MS : 0) + SETTLE_MS;
      if ((now - startedAt >= HOLD_MS + SETTLE_MS && settled) || now - startedAt > MAX_WAIT_MS) {
        setRevealed(true);
        return;
      }
      frame = window.requestAnimationFrame(wait);
    };
    frame = window.requestAnimationFrame(wait);
    return () => window.cancelAnimationFrame(frame);
  }, [stepKey, reducedMotion]);

  // 4. Grow the new card out of the spotlight.
  useLayoutEffect(() => {
    if (!revealed || reducedMotion || !cardRef.current) return;
    const node = cardRef.current;
    const box = node.getBoundingClientRect();
    const from = spotRect ?? { left: box.left + box.width * 0.06, top: box.top + box.height * 0.06, width: box.width * 0.88, height: box.height * 0.88 };
    node.style.transformOrigin = '0 0';
    const animation = node.animate(
      [
        { transform: mapBox(box, from), opacity: 0 },
        { transform: 'none', opacity: 1 },
      ],
      { duration: EMERGE_MS, easing: EASE_OUT },
    );
    const reset = () => {
      node.style.transformOrigin = '';
    };
    animation.onfinish = reset;
    animation.oncancel = reset;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed]);

  // Pointer on the card's edge, aimed at the target's centre.
  let arrowStyle = null;
  if (shownRect && ['top', 'bottom', 'left', 'right'].includes(position.placement)) {
    const horizontal = position.placement === 'top' || position.placement === 'bottom';
    const span = horizontal ? cardSize.width : cardSize.height;
    const centre = horizontal
      ? shownRect.left + shownRect.width / 2 - position.left
      : shownRect.top + shownRect.height / 2 - position.top;
    arrowStyle = { '--sgt-arrow': `${Math.min(Math.max(centre, 22), span - 22)}px` };
  }

  const nudge = () => {
    setNudged(true);
    window.setTimeout(() => setNudged(false), 450);
  };

  // Blockers swallow wheel events; forward them so the page still scrolls.
  const forwardWheel = (event) => {
    const scroller = rootRef.current?.querySelector('.sgt-content');
    scroller?.scrollBy({ top: event.deltaY, left: 0 });
  };

  const takeMeThere = () => {
    const page = pages[0];
    if (page === 'inward-details') {
      const ids = state.data.userInwardIds;
      if (ids.length) limsActions.navigate('inward-details', { inwardId: ids[ids.length - 1] });
      return;
    }
    limsActions.navigate(page, page === 'test-requests' ? { tab: 'pending' } : {});
  };

  let status = null;
  if (missing && wrongPage) {
    status = (
      <div className="sgt-coach__missing">
        <span>This step happens on {pageLabels[pages[0]] ?? 'another page'}.</span>
        <button type="button" className="sgt-btn sgt-btn--secondary sgt-btn--xs" onClick={takeMeThere}>
          Take me there
        </button>
      </div>
    );
  } else if (missing) {
    status = (
      <div className="sgt-coach__missing">
        <span>We can’t spot this on screen right now.</span>
        {step.assist ? null : (
          <button type="button" className="sgt-btn sgt-btn--secondary sgt-btn--xs" onClick={actions.next}>
            Skip this step
          </button>
        )}
      </div>
    );
  } else if (isAction && stepDone) {
    status = (
      <p className="sgt-coach__done" role="status">
        <span className="sgt-coach__done-icon" aria-hidden="true">
          <IconCheck size={13} stroke={3} />
        </span>
        {step.doneText ?? 'Done. Nice work.'}
      </p>
    );
  } else if (isAction && hint) {
    status = (
      <p className="sgt-coach__hint">
        <span className="sgt-coach__pulse" aria-hidden="true" />
        Your turn: {hint}
      </p>
    );
  }

  return (
    <div className="sgt-tour-layer" ref={layerRef} data-phase={held ? 'swallow' : revealed ? 'shown' : 'travel'}>
      <Blockers rect={shownRect} blockTarget={!isAction && !step.interactive} onBlockedClick={nudge} onWheel={forwardWheel} />
      {spotRect ? (
        <div
          className={cx('sgt-spotlight', isAction && revealed && 'is-action', stepDone && 'is-done', moving && 'is-moving')}
          style={{ top: spotRect.top, left: spotRect.left, width: spotRect.width, height: spotRect.height }}
          aria-hidden="true"
        />
      ) : null}

      <div
        ref={cardRef}
        className={cx('sgt-coach', !revealed && 'is-waiting', nudged && 'is-nudged', stepDone && 'is-done', `is-${position.placement}`, arrowStyle && 'has-arrow')}
        style={{ top: position.top, left: position.left, ...arrowStyle }}
        role="dialog"
        aria-modal="false"
        aria-labelledby="sgt-coach-title"
        aria-describedby="sgt-coach-body"
        data-tour-card=""
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.stopPropagation();
            actions.pause();
          }
        }}
      >
        <div className="sgt-coach__top">
          <span className="sgt-coach__chapter" title={`Chapter ${chapterIndex + 1} of ${chapters.length}: ${chapter.title}`}>
            <span className="sgt-sr-only">Chapter </span>
            {chapterIndex + 1}/{chapters.length} · {chapter.title}
          </span>
          <button type="button" className="sgt-coach__close" aria-label="Pause tour" title="Pause tour" onClick={actions.pause}>
            <IconX size={16} stroke={2} />
          </button>
        </div>

        <div className="sgt-coach__content" key={`${stepKey}|${title}`}>
          <h2 className="sgt-coach__title" id="sgt-coach-title">{title}</h2>
          <p className="sgt-coach__body" id="sgt-coach-body">{body}</p>
          {why ? (
            <p className="sgt-coach__why">
              <IconBulb size={16} stroke={1.9} aria-hidden="true" />
              <span>
                <strong>Why it matters.</strong> {why}
              </span>
            </p>
          ) : null}
          {status}
        </div>

        <div className="sgt-coach__footer">
          <div className="sgt-coach__progress">
            <span className="sgt-coach__count">
              {tour.stepIndex + 1} / {chapter.steps.length}
            </span>
            <span className="sgt-coach__bar" aria-hidden="true">
              <span style={{ width: `${((tour.stepIndex + 1) / chapter.steps.length) * 100}%` }} />
            </span>
          </div>
          <div className="sgt-coach__actions">
            <button type="button" className="sgt-coach__text-btn" onClick={actions.pause}>
              <IconPlayerPause size={14} stroke={2} aria-hidden="true" />
              Pause
            </button>
            <span className="sgt-coach__spacer" />
            {canGoBack ? (
              <button type="button" className="sgt-btn sgt-btn--ghost sgt-btn--sm sgt-btn--square" aria-label="Previous step" onClick={actions.back}>
                <IconArrowLeft size={16} stroke={2} />
              </button>
            ) : null}
            {step.assist && !stepDone ? (
              <button type="button" className="sgt-btn sgt-btn--secondary sgt-btn--sm sgt-coach__assist" onClick={actions.runAssist} disabled={assisting}>
                {assisting ? <span className="sgt-spinner" aria-hidden="true" /> : <IconSparkles size={16} stroke={1.9} aria-hidden="true" />}
                {assisting ? 'Working…' : step.assist.label}
              </button>
            ) : null}
            {!isAction ? (
              <button ref={nextRef} type="button" className="sgt-btn sgt-btn--brand sgt-btn--sm sgt-coach__next" onClick={actions.next}>
                {step.nextLabel ?? 'Next'}
                <IconArrowRight size={16} stroke={2} aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="sgt-sr-only" aria-live="polite">
        {`Step ${tour.stepIndex + 1} of ${chapter.steps.length}: ${title}`}
      </div>
    </div>
  );
}
