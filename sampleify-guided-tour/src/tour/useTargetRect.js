import { useEffect, useRef, useState } from 'react';

const PADDING = 6;
const EDGE = 8;

function escapeAttr(value) {
  if (typeof window !== 'undefined' && window.CSS?.escape) return window.CSS.escape(value);
  return String(value).replace(/"/g, '\\"');
}

/**
 * Targets are `data-tour` ids, or for the prototype's screens (which carry no
 * tour markup): `css:<selector>`, or `text:<selector>|<label>` for the first
 * visible match whose text is exactly <label>.
 *
 * `below:<selector>` is a region, not an element: everything under the bottom
 * edge of the first visible match, to the bottom of the screen. It spotlights a
 * whole page apart from its header.
 */
export function resolveTarget(root, targetId) {
  if (!root || !targetId) return null;
  if (targetId.startsWith('css:')) {
    return [...root.querySelectorAll(targetId.slice(4))].find(isShown) ?? null;
  }
  if (targetId.startsWith('text:')) {
    // text:<selector>|<label>[|<closest ancestor selector to spotlight instead>]
    const [selector, label, closest] = targetId.slice(5).split('|');
    const match = [...root.querySelectorAll(selector)].find((node) => node.textContent.trim() === label && isShown(node)) ?? null;
    return closest ? match?.closest(closest) ?? match : match;
  }
  return root.querySelector(`[data-tour="${escapeAttr(targetId)}"]`);
}

function isShown(node) {
  const rect = node.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

export function findTarget(root, targetId) {
  const element = resolveTarget(root, targetId);
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return null;
  return element;
}

/** The part of `element` actually visible, after every clipping ancestor. */
function visibleRect(element, stopAt) {
  const raw = element.getBoundingClientRect();
  let { top, left, bottom, right } = raw;
  // Fixed-position things (modals) are not clipped by scrolling ancestors.
  if (window.getComputedStyle(element).position === 'fixed') return { raw, top, left, bottom, right };
  let node = element.parentElement;
  while (node && node !== stopAt && node !== document.body) {
    const style = window.getComputedStyle(node);
    if (/(auto|scroll|hidden|clip)/.test(`${style.overflowX} ${style.overflowY}`)) {
      const box = node.getBoundingClientRect();
      top = Math.max(top, box.top);
      left = Math.max(left, box.left);
      bottom = Math.min(bottom, box.bottom);
      right = Math.min(right, box.right);
    }
    if (style.position === 'fixed') break;
    node = node.parentElement;
  }
  return { raw, top, left, bottom, right };
}

function isFullyVisible(rect, viewport) {
  return rect.top >= EDGE && rect.left >= 0 && rect.bottom <= viewport.height - EDGE && rect.right <= viewport.width;
}

function same(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    Math.abs(a.top - b.top) < 0.5 &&
    Math.abs(a.left - b.left) < 0.5 &&
    Math.abs(a.width - b.width) < 0.5 &&
    Math.abs(a.height - b.height) < 0.5 &&
    a.vw === b.vw &&
    a.vh === b.vh
  );
}

/**
 * Tracks the on-screen rectangle of `[data-tour=targetId]` every frame while
 * active, clipped to the viewport and padded for the spotlight. Scrolls the
 * target into view once per step. Reports `missing` if it can't be found.
 */
export function useTargetRect({ rootRef, targetId, stepKey, active, reducedMotion }) {
  const [rect, setRect] = useState(null);
  const [missing, setMissing] = useState(false);
  const scrolledRef = useRef(null);
  // For the guide overlay: when the target last moved, and whether we're scrolling it into view.
  const lastMoveRef = useRef(0);
  const scrollActiveRef = useRef(false);

  useEffect(() => {
    if (!active) {
      setRect(null);
      setMissing(false);
      return undefined;
    }

    let frame = 0;
    let previousRect = null;
    let lastSeen = Date.now();
    const startedAt = Date.now();
    setMissing(false);

    const tick = () => {
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      const below = Boolean(targetId?.startsWith('below:'));
      const element = findTarget(rootRef.current, below ? `css:${targetId.slice(6)}` : targetId);

      if (element) {
        lastSeen = Date.now();
        let visible;
        if (below) {
          const edge = Math.max(0, element.getBoundingClientRect().bottom);
          visible = {
            raw: { top: edge, left: 0, bottom: viewport.height, right: viewport.width, width: viewport.width, height: viewport.height - edge },
            top: edge,
            left: 0,
            bottom: viewport.height,
            right: viewport.width,
          };
        } else {
          visible = visibleRect(element, rootRef.current);
        }
        const { raw } = visible;
        const scrollKey = `${stepKey}|${targetId}`;
        if (scrolledRef.current !== scrollKey) {
          scrolledRef.current = scrollKey;
          if (!below && !isFullyVisible(raw, viewport)) {
            const tall = raw.height > viewport.height * 0.7;
            element.scrollIntoView({ block: tall ? 'start' : 'center', inline: 'nearest', behavior: reducedMotion ? 'auto' : 'smooth' });
            scrollActiveRef.current = true;
            lastMoveRef.current = performance.now();
          }
        }
        // Scrolling is over once the target has sat still for a moment.
        if (scrollActiveRef.current && performance.now() - lastMoveRef.current > 350) scrollActiveRef.current = false;

        const top = Math.max(EDGE, visible.top - (below ? 0 : PADDING));
        const left = Math.max(EDGE, visible.left - PADDING);
        const bottom = Math.min(viewport.height - EDGE, visible.bottom + PADDING);
        const right = Math.min(viewport.width - EDGE, visible.right + PADDING);
        const next =
          bottom > top && right > left
            ? { top, left, width: right - left, height: bottom - top, vw: viewport.width, vh: viewport.height }
            : null;
        if (!same(previousRect, next)) {
          previousRect = next;
          lastMoveRef.current = performance.now();
        }
        setRect((previous) => (same(previous, next) ? previous : next));
        setMissing((previous) => (previous ? false : previous));
      } else {
        // Keep the last position briefly: targets often vanish for a moment
        // (re-render, page change during a "done" beat) and the spotlight
        // shouldn't flicker or jump to the centre.
        const goneFor = Date.now() - Math.max(lastSeen, startedAt);
        if (goneFor > 900) {
          setRect((previous) => (previous === null ? previous : null));
          setMissing((previous) => (previous ? previous : true));
        }
      }

      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [active, rootRef, targetId, stepKey, reducedMotion]);

  return { rect, missing, lastMoveRef, scrollActiveRef };
}

export function computeCardPosition(rect, card, viewport, preferred = 'bottom') {
  const gap = 14;
  const margin = 12;
  const width = card.width || 360;
  const height = card.height || 220;
  const clampLeft = (value) => Math.min(Math.max(margin, value), viewport.width - width - margin);
  const clampTop = (value) => Math.min(Math.max(margin, value), viewport.height - height - margin);

  if (!rect) {
    return { top: clampTop((viewport.height - height) / 2), left: clampLeft((viewport.width - width) / 2), placement: 'center' };
  }

  const candidates = {
    bottom: () => ({ top: rect.top + rect.height + gap, left: clampLeft(rect.left + rect.width / 2 - width / 2), fits: rect.top + rect.height + gap + height <= viewport.height - margin }),
    top: () => ({ top: rect.top - gap - height, left: clampLeft(rect.left + rect.width / 2 - width / 2), fits: rect.top - gap - height >= margin }),
    right: () => ({ top: clampTop(rect.top + rect.height / 2 - height / 2), left: rect.left + rect.width + gap, fits: rect.left + rect.width + gap + width <= viewport.width - margin }),
    left: () => ({ top: clampTop(rect.top + rect.height / 2 - height / 2), left: rect.left - gap - width, fits: rect.left - gap - width >= margin }),
  };

  const order = [preferred, 'bottom', 'top', 'right', 'left'].filter((value, index, list) => candidates[value] && list.indexOf(value) === index);
  for (const placement of order) {
    const candidate = candidates[placement]();
    if (candidate.fits) return { top: candidate.top, left: candidate.left, placement };
  }

  // Nothing fits beside the target (it fills the screen: a whole page, a big
  // modal): sit at the top centre of the screen, over the global header, where
  // it covers the least of the page. The visitor can drag it out of the way.
  return {
    top: margin,
    left: clampLeft(viewport.width / 2 - width / 2),
    placement: 'floating',
  };
}
