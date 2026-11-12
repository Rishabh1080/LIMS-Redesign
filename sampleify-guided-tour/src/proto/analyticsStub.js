// The tutorial never sends analytics from prototype pages. vite.config.js points
// the prototype's analytics/posthog import here.
export const initAnalytics = () => null;
export const trackEvent = () => {};
export const trackPageView = () => {};
export const createAnalyticsSessionId = (prefix = 'session') => `${prefix}-${Date.now()}`;
export const getAnalyticsNow = () => Date.now();
export const getAnalyticsElapsedTime = (startedAt) => (startedAt ? Date.now() - startedAt : undefined);
export const getSampleFormExperimentVariant = () => null;
export default {};
export const SAMPLE_FORM_EXPERIMENT_FLAG = 'sample-creation-form-experiment';
export const isAnalyticsEnabled = () => false;
export const useFeatureFlagVariant = (flagKey, fallback = 'form-a') => fallback;
