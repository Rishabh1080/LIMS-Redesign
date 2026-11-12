/**
 * Public configuration for <SampleifyGuidedTour config={...} />.
 * Every key is optional; anything omitted falls back to these defaults.
 */
export const defaultConfig = {
  /** Namespace for every localStorage key the tour writes. Bump to invalidate old progress. */
  storageKey: 'sampleify-tour:v1',

  /** Where "Book a live demo" goes (opens in a new tab). */
  ctaUrl: 'https://www.sampleify.in/',
  ctaLabel: 'Book a live demo',

  /** Sampleify's support line, shown in the LIMS header like the real product. Not the visitor's number. */
  supportPhone: '+91-6358273804',

  /** Where the tour progress lives: 'fab' (bottom-right button, default) or 'sidebar'. */
  trackerPlacement: 'fab',

  /** Read ?reset=1 and ?tracker=fab|sidebar from the URL. */
  readUrlParams: true,

  /**
   * Analytics hook. Called as onEvent(name, props).
   * Names: tour_started, onboarding_step_completed, chapter_started, step_completed,
   * chapter_completed, tour_completed, tour_paused, tour_resumed, cta_clicked, tour_reset.
   */
  onEvent: () => {},

  /**
   * Called once after the (dummy) OTP is verified, with { name, labName, phone, labType, labTypes, labTypeLabel }.
   * Name, lab name and phone are personal data: the tour itself never sends them anywhere.
   * Wire this to your CRM if and when you decide to.
   */
  onLeadCaptured: () => {},
};

export function resolveConfig(config = {}) {
  const merged = { ...defaultConfig, ...config };
  if (!['sidebar', 'fab'].includes(merged.trackerPlacement)) merged.trackerPlacement = 'fab';
  if (typeof merged.onEvent !== 'function') merged.onEvent = defaultConfig.onEvent;
  if (typeof merged.onLeadCaptured !== 'function') merged.onLeadCaptured = defaultConfig.onLeadCaptured;
  return merged;
}
