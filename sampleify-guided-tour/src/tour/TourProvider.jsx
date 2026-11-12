import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLims } from '../store/LimsStore';
import { readJSON, writeJSON } from '../lib/storage';
import { sleep, usePrefersReducedMotion } from '../lib/hooks';

const TourContext = createContext(null);

class AssistCancelled extends Error {}

const STATUSES = ['intro', 'running', 'paused', 'celebrating', 'completed'];

function createInitialTour(chapters) {
  return {
    status: 'intro',
    chapterId: chapters[0].id,
    stepIndex: 0,
    completed: {},
    startedAt: null,
    completedAt: null,
    celebratedChapterId: null,
    wrapUpDismissed: false,
  };
}

function sanitizeTour(saved, chapters) {
  if (!saved || !STATUSES.includes(saved.status)) return null;
  const chapter = chapters.find((entry) => entry.id === saved.chapterId);
  if (!chapter) return null;
  const stepIndex = Math.min(Math.max(0, Number(saved.stepIndex) || 0), chapter.steps.length - 1);
  // A refresh mid-step resumes the step. A refresh on the celebration card
  // resumes there too, so nothing is lost.
  return { ...createInitialTour(chapters), ...saved, stepIndex };
}

const toArray = (value) => (value == null ? [] : Array.isArray(value) ? value : [value]);

export function resolveStepValue(value, state, ctx) {
  return typeof value === 'function' ? value(state, ctx) : value;
}

export function TourProvider({ chapters, storageKey, ctx, track, rootRef, suspended = false, children }) {
  const lims = useLims();
  const reducedMotion = usePrefersReducedMotion();
  const [tour, setTour] = useState(() => sanitizeTour(readJSON(storageKey), chapters) ?? createInitialTour(chapters));
  const tourRef = useRef(tour);
  const ctxRef = useRef(ctx);
  ctxRef.current = ctx;
  const trackRef = useRef(track);
  trackRef.current = track;

  const commit = useCallback((next) => {
    tourRef.current = next;
    setTour(next);
  }, []);

  useEffect(() => {
    writeJSON(storageKey, tour);
  }, [storageKey, tour]);

  const chapterIndex = Math.max(0, chapters.findIndex((entry) => entry.id === tour.chapterId));
  const chapter = chapters[chapterIndex];
  const step = tour.status === 'running' && !suspended ? chapter.steps[tour.stepIndex] ?? null : null;
  const stepKey = step ? `${chapter.id}:${step.id}` : null;

  const emit = useCallback((name, props = {}) => trackRef.current?.(name, props), []);

  const nextIncompleteChapter = useCallback(
    (completed, afterId) => {
      const startIndex = afterId ? chapters.findIndex((entry) => entry.id === afterId) + 1 : 0;
      const ordered = [...chapters.slice(startIndex), ...chapters.slice(0, startIndex)];
      return ordered.find((entry) => !completed[entry.id]) ?? null;
    },
    [chapters],
  );

  // ---- navigation through steps ------------------------------------------

  const goNext = useCallback(
    (expectedKey, via = 'next') => {
      const current = tourRef.current;
      if (current.status !== 'running') return;
      const currentChapter = chapters.find((entry) => entry.id === current.chapterId);
      const currentStep = currentChapter?.steps[current.stepIndex];
      if (!currentStep) return;
      if (expectedKey && `${currentChapter.id}:${currentStep.id}` !== expectedKey) return;

      emit('step_completed', { chapter: currentChapter.id, step: currentStep.id, via });

      if (current.stepIndex + 1 < currentChapter.steps.length) {
        commit({ ...current, stepIndex: current.stepIndex + 1 });
        return;
      }

      const completed = { ...current.completed, [currentChapter.id]: true };
      const allDone = chapters.every((entry) => completed[entry.id]);
      emit('chapter_completed', { chapter: currentChapter.id });
      if (allDone && !current.completedAt) {
        emit('tour_completed', {
          durationSec: current.startedAt ? Math.round((Date.now() - current.startedAt) / 1000) : null,
        });
      }
      commit({
        ...current,
        completed,
        status: 'celebrating',
        celebratedChapterId: currentChapter.id,
        completedAt: allDone ? current.completedAt ?? Date.now() : current.completedAt,
      });
    },
    [chapters, commit, emit],
  );

  const goToStep = useCallback(
    (stepId, expectedKey) => {
      const current = tourRef.current;
      if (current.status !== 'running') return;
      const currentChapter = chapters.find((entry) => entry.id === current.chapterId);
      const currentStep = currentChapter?.steps[current.stepIndex];
      if (expectedKey && `${currentChapter.id}:${currentStep?.id}` !== expectedKey) return;
      const index = currentChapter.steps.findIndex((entry) => entry.id === stepId);
      if (index >= 0) commit({ ...current, stepIndex: index });
    },
    [chapters, commit],
  );

  const startChapter = useCallback(
    (chapterId) => {
      const current = tourRef.current;
      const target = chapters.find((entry) => entry.id === chapterId) ?? chapters[0];
      const resumeIndex =
        current.chapterId === target.id && current.status === 'paused' && !current.completed[target.id] ? current.stepIndex : 0;
      if (!current.startedAt) emit('tour_started', { chapter: target.id });
      emit('chapter_started', { chapter: target.id, resumedAtStep: resumeIndex });
      commit({
        ...current,
        status: 'running',
        chapterId: target.id,
        stepIndex: resumeIndex,
        startedAt: current.startedAt ?? Date.now(),
      });
    },
    [chapters, commit, emit],
  );

  const pause = useCallback(() => {
    const current = tourRef.current;
    if (current.status !== 'running') return;
    const currentChapter = chapters.find((entry) => entry.id === current.chapterId);
    emit('tour_paused', { chapter: current.chapterId, step: currentChapter?.steps[current.stepIndex]?.id });
    commit({ ...current, status: 'paused' });
  }, [chapters, commit, emit]);

  const resume = useCallback(() => {
    const current = tourRef.current;
    if (current.status === 'running') return;
    const target = current.completed[current.chapterId] ? nextIncompleteChapter(current.completed, current.chapterId) : chapters.find((entry) => entry.id === current.chapterId);
    if (!target) {
      commit({ ...current, status: 'completed' });
      return;
    }
    emit('tour_resumed', { chapter: target.id });
    startChapter(target.id);
  }, [chapters, commit, emit, nextIncompleteChapter, startChapter]);

  const back = useCallback(() => {
    const current = tourRef.current;
    if (current.status !== 'running' || current.stepIndex === 0) return;
    commit({ ...current, stepIndex: current.stepIndex - 1 });
  }, [commit]);

  const continueAfterCelebration = useCallback(() => {
    const current = tourRef.current;
    const next = nextIncompleteChapter(current.completed, current.celebratedChapterId);
    if (!next) {
      commit({ ...current, status: 'completed', wrapUpDismissed: false });
      return;
    }
    startChapter(next.id);
  }, [commit, nextIncompleteChapter, startChapter]);

  const breakAfterCelebration = useCallback(() => {
    const current = tourRef.current;
    const next = nextIncompleteChapter(current.completed, current.celebratedChapterId);
    if (!next) {
      commit({ ...current, status: 'completed', wrapUpDismissed: true });
      return;
    }
    emit('tour_paused', { chapter: next.id, step: next.steps[0]?.id, reason: 'break_between_chapters' });
    commit({ ...current, status: 'paused', chapterId: next.id, stepIndex: 0 });
  }, [commit, emit, nextIncompleteChapter]);

  const dismissIntro = useCallback(() => {
    const current = tourRef.current;
    emit('tour_paused', { chapter: current.chapterId, reason: 'explore_first' });
    commit({ ...current, status: 'paused', chapterId: chapters[0].id, stepIndex: 0 });
  }, [chapters, commit, emit]);

  const dismissWrapUp = useCallback(() => {
    commit({ ...tourRef.current, wrapUpDismissed: true });
  }, [commit]);

  const restart = useCallback(() => {
    emit('tour_restarted');
    commit({ ...createInitialTour(chapters), status: 'intro' });
  }, [chapters, commit, emit]);

  // ---- per-step lifecycle ------------------------------------------------

  const [entry, setEntry] = useState(null);
  const [assisting, setAssisting] = useState(false);
  const [doneKey, setDoneKey] = useState(null);
  const [ghost, setGhost] = useState(null);
  const assistTokenRef = useRef(0);

  const makeApi = useCallback(
    (token = null) => {
      const guard = () => {
        if (token !== null && assistTokenRef.current !== token) throw new AssistCancelled();
      };
      /**
       * Moves the ghost cursor onto an element (CSS selector, element or
       * finder function) and optionally plays a click. Assists call this before
       * each change so visitors see where the work happens.
       */
      const point = async (target, { click = true, wait = 380 } = {}) => {
        if (reducedMotion) return;
        const root = rootRef.current;
        const element =
          typeof target === 'function' ? target(root) : typeof target === 'string' ? root?.querySelector(target) : target;
        if (!element) return;
        const rect = element.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) {
          element.scrollIntoView({ block: 'center', behavior: 'smooth' });
          await sleep(320);
        }
        const box = element.getBoundingClientRect();
        const x = box.left + Math.min(box.width / 2, 28);
        const y = box.top + box.height / 2;
        setGhost((current) => ({ x, y, from: current ? null : 'assist', clicks: current?.clicks ?? 0 }));
        await sleep(wait);
        guard();
        if (click) setGhost((current) => (current ? { ...current, clicks: current.clicks + 1 } : current));
        await sleep(click ? 140 : 0);
        guard();
      };

      return {
        root: () => rootRef.current,
        guard,
        dispatch: lims.dispatch,
        getState: lims.getState,
        actions: lims.actions,
        navigate: lims.actions.navigate,
        point,
        sleep: async (ms) => {
          await sleep(reducedMotion ? Math.min(ms, 40) : ms);
          guard();
        },
        type: async (setter, text) => {
          if (reducedMotion) {
            setter(text);
            await sleep(20);
            guard();
            return;
          }
          for (let index = 1; index <= text.length; index += 1) {
            setter(text.slice(0, index));
            // eslint-disable-next-line no-await-in-loop
            await sleep(32);
            guard();
          }
        },
      };
    },
    [lims, reducedMotion, rootRef],
  );

  useEffect(() => {
    assistTokenRef.current += 1;
    setAssisting(false);
    setDoneKey(null);
    setGhost(null);
    if (!step) {
      setEntry(null);
      return;
    }

    const state = lims.getState();
    if (step.skipIf?.(state, ctxRef.current)) {
      setEntry(null);
      goNext(stepKey, 'skipped');
      return;
    }

    const pages = toArray(step.page);
    const autoNavigate = step.autoNavigate ?? step.kind === 'info';
    if (autoNavigate && pages.length && !pages.includes(state.nav.page)) {
      lims.actions.navigate(pages[0], pages[0] === 'test-requests' ? { tab: 'pending' } : {});
    }
    step.onEnter?.(makeApi());
    setEntry({ key: stepKey, state: lims.getState(), dom: step.domSnapshot?.(rootRef.current) ?? null });
    // Only re-run when the step itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepKey]);

  // Prototype screens keep some of their state to themselves, so steps can
  // also complete on what's on screen (`doneDom`), checked a few times a second.
  const [domTick, setDomTick] = useState(0);
  useEffect(() => {
    if (!step?.doneDom || doneKey === stepKey) return undefined;
    const id = window.setInterval(() => setDomTick((value) => value + 1), 300);
    return () => window.clearInterval(id);
  }, [step, doneKey, stepKey]);

  // Auto-advance action steps, and recover when a step loses its context
  // (e.g. the visitor closed the allocation modal mid-step).
  useEffect(() => {
    if (!step || !entry || entry.key !== stepKey) return undefined;
    const state = lims.state;
    const isDone =
      step.done?.(state, entry.state, ctxRef.current) || (step.doneDom && step.doneDom(rootRef.current, entry.dom, state));

    if (step.kind === 'action' && isDone) {
      // Latch it: the "done" beat below then runs its own timer.
      if (doneKey !== stepKey) setDoneKey(stepKey);
      return undefined;
    }

    if (step.requires && step.backTo && !step.requires(state)) {
      const id = window.setTimeout(() => goToStep(step.backTo, stepKey), 350);
      return () => window.clearTimeout(id);
    }

    return undefined;
  }, [lims.state, entry, step, stepKey, goToStep, domTick, rootRef, doneKey]);

  // Show a short "done" beat (green ring + tick) before moving on.
  useEffect(() => {
    if (!step || doneKey !== stepKey) return undefined;
    const delay = step.advanceDelay ?? 800;
    const id = window.setTimeout(() => goNext(stepKey, 'auto'), reducedMotion ? Math.min(delay, 450) : delay);
    return () => window.clearTimeout(id);
  }, [doneKey, step, stepKey, goNext, reducedMotion]);

  const runAssist = useCallback(async () => {
    if (!step?.assist) return;
    const token = assistTokenRef.current + 1;
    assistTokenRef.current = token;
    setAssisting(true);
    emit('assist_used', { chapter: chapter.id, step: step.id });
    try {
      await step.assist.run(makeApi(token));
    } catch (error) {
      if (!(error instanceof AssistCancelled)) {
        // eslint-disable-next-line no-console
        console.error('[sampleify-tour] assist failed', error);
      }
    } finally {
      if (assistTokenRef.current === token) {
        setAssisting(false);
        window.setTimeout(() => {
          if (assistTokenRef.current === token) setGhost(null);
        }, 500);
      }
    }
  }, [chapter.id, emit, makeApi, step]);

  const progress = useMemo(() => {
    const total = chapters.length;
    const done = chapters.filter((entry) => tour.completed[entry.id]).length;
    let partial = 0;
    if (!tour.completed[chapter.id] && (tour.status === 'running' || tour.status === 'paused')) {
      partial = tour.stepIndex / chapter.steps.length;
    }
    return { done, total, ratio: Math.min(1, (done + partial) / total) };
  }, [chapters, chapter, tour]);

  const value = useMemo(
    () => ({
      chapters,
      tour,
      chapter,
      chapterIndex,
      step,
      stepKey,
      ctx,
      progress,
      assisting,
      stepDone: Boolean(step && doneKey === stepKey),
      ghost,
      rootRef,
      suspended,
      track: emit,
      actions: {
        startChapter,
        pause,
        resume,
        next: () => goNext(stepKey, 'next'),
        back,
        restart,
        dismissIntro,
        continueAfterCelebration,
        breakAfterCelebration,
        dismissWrapUp,
        runAssist,
      },
    }),
    [
      chapters,
      tour,
      chapter,
      chapterIndex,
      step,
      stepKey,
      ctx,
      progress,
      assisting,
      doneKey,
      ghost,
      rootRef,
      suspended,
      emit,
      startChapter,
      pause,
      resume,
      goNext,
      back,
      restart,
      dismissIntro,
      continueAfterCelebration,
      breakAfterCelebration,
      dismissWrapUp,
      runAssist,
    ],
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTour() {
  const context = useContext(TourContext);
  if (!context) throw new Error('useTour must be used inside <TourProvider>');
  return context;
}
