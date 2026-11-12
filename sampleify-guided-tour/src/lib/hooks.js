import { useEffect, useRef, useState } from 'react';

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);

  return reduced;
}

export function useViewportWidth() {
  const [width, setWidth] = useState(() => (typeof window === 'undefined' ? 1440 : window.innerWidth));

  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return width;
}

/** Re-renders every `intervalMs` so relative times ("5 min ago") stay fresh. */
export function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);

  return now;
}

export function useLatest(value) {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

export const sleep = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });
