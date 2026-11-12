import { useEffect, useLayoutEffect, useRef, useState } from 'react';

/** Matches --sgt-duration-exit (170ms) plus a frame of slack. */
export const STAGE_EXIT_MS = 190;

/**
 * Directional transition between onboarding questions. The outgoing screen
 * stays mounted under its own key (so it never remounts or steals focus) and
 * slides out while the next one slides in from the other side. Forward moves
 * left, back moves right, so the visitor always knows which way they went.
 *
 * `hold` keeps the incoming screen invisible and out of layout. The flow uses
 * it when the page layout itself changes (e.g. the live preview column comes
 * or goes), so the outgoing screen can leave in the layout it was drawn in.
 */
export function StageTransition({ stepKey, direction, hold = false, children }) {
  const committedRef = useRef(children);
  const [shownKey, setShownKey] = useState(stepKey);
  const [leaving, setLeaving] = useState(null);

  // Derived state: when the key changes, keep the last committed frame as the
  // leaving one in the same render, so React never unmounts it early.
  if (shownKey !== stepKey) {
    setShownKey(stepKey);
    setLeaving({ key: shownKey, node: committedRef.current, direction });
  }

  useLayoutEffect(() => {
    committedRef.current = children;
  });

  useEffect(() => {
    if (!leaving) return undefined;
    const id = window.setTimeout(() => setLeaving(null), STAGE_EXIT_MS);
    return () => window.clearTimeout(id);
  }, [leaving]);

  // Steps focus themselves on mount. A quick back-and-forth can hand the incoming
  // screen the instance that was still leaving (same key), which doesn't remount,
  // so move focus out of the leaving frame ourselves. Runs after the child effects.
  const enteringRef = useRef(null);
  const firstRenderRef = useRef(true);
  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }
    const frame = enteringRef.current;
    const active = document.activeElement;
    if (!frame || frame.contains(active)) return;
    const lost = !active || active === document.body || active.closest?.('.sgt-stage-frame.is-leaving');
    if (lost) frame.querySelector('input:not([disabled]), h1[tabindex="-1"]')?.focus({ preventScroll: true });
  }, [stepKey]);

  return (
    <div className="sgt-stage-stack">
      {leaving && leaving.key !== stepKey ? (
        <div key={leaving.key} className="sgt-stage-frame is-leaving" data-dir={leaving.direction} aria-hidden="true">
          {leaving.node}
        </div>
      ) : null}
      <div
        key={stepKey}
        ref={enteringRef}
        className={`sgt-stage-frame is-entering${hold ? ' is-held' : ''}`}
        data-dir={direction}
      >
        {children}
      </div>
    </div>
  );
}
