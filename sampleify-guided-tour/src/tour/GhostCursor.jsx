import { useLayoutEffect, useRef, useState } from 'react';
import { useTour } from './TourProvider';

/**
 * A second cursor that does the work during "Fill for me": it glides to each
 * field and clicks before the value changes, so visitors watch the task being
 * done rather than values appearing out of nowhere. Starts at the button that
 * was pressed. Hidden entirely under reduced motion.
 */
export function GhostCursor() {
  const { ghost, rootRef } = useTour();
  const [pos, setPos] = useState(null);
  const [animate, setAnimate] = useState(false);
  const clicksRef = useRef(0);
  const [pulse, setPulse] = useState(0);

  useLayoutEffect(() => {
    if (!ghost) {
      setPos(null);
      setAnimate(false);
      clicksRef.current = 0;
      return undefined;
    }
    if (!pos) {
      // First appearance: start from the assist button, then glide.
      const button = rootRef.current?.querySelector('.sgt-coach__assist');
      const rect = button?.getBoundingClientRect();
      setAnimate(false);
      setPos(rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : { x: ghost.x, y: ghost.y });
      const frame = window.requestAnimationFrame(() => {
        setAnimate(true);
        setPos({ x: ghost.x, y: ghost.y });
      });
      return () => window.cancelAnimationFrame(frame);
    }
    setAnimate(true);
    setPos({ x: ghost.x, y: ghost.y });
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ghost?.x, ghost?.y, Boolean(ghost)]);

  useLayoutEffect(() => {
    if (!ghost) return;
    if (ghost.clicks !== clicksRef.current) {
      clicksRef.current = ghost.clicks;
      setPulse((value) => value + 1);
    }
  }, [ghost]);

  if (!ghost || !pos) return null;

  return (
    <div
      className={`sgt-ghost${animate ? ' is-moving' : ''}`}
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
      aria-hidden="true"
    >
      {pulse ? <span key={pulse} className="sgt-ghost__ripple" /> : null}
      <svg className="sgt-ghost__arrow" width="22" height="22" viewBox="0 0 22 22" key={`c${pulse}`}>
        <path d="M3 2.5 L3 17.5 L7.2 13.6 L10 19.6 L12.8 18.4 L10.1 12.5 L16 12.5 Z" />
      </svg>
      <span className="sgt-ghost__label">Sampleify</span>
    </div>
  );
}
