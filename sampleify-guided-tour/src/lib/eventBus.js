// Tiny synchronous pub/sub used to connect the LIMS replica and the tour
// engine without either importing the other.

export function createEventBus() {
  const listeners = new Set();

  return {
    emit(type, payload = {}) {
      const event = { type, payload, at: Date.now() };
      listeners.forEach((listener) => {
        try {
          listener(event);
        } catch (error) {
          // A broken listener must never break the app.
          // eslint-disable-next-line no-console
          console.error('[sampleify-tour] event listener failed', error);
        }
      });
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
