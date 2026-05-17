import { useEffect, useMemo, useState } from 'react';
import posthog from 'posthog-js';

const POSTHOG_TOKEN = import.meta.env.VITE_PUBLIC_POSTHOG_TOKEN;
const POSTHOG_HOST = import.meta.env.VITE_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

export const SAMPLE_FORM_EXPERIMENT_FLAG =
  import.meta.env.VITE_PUBLIC_SAMPLE_FORM_EXPERIMENT_FLAG || 'sample-creation-form-experiment';

const SAMPLE_FORM_OVERRIDE_PARAM = 'sampleFormVariant';
const SAMPLE_FORM_OVERRIDE_KEY = 'lims:sample-form-variant';

let hasInitialized = false;

function cleanProperties(properties) {
  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined && value !== null),
  );
}

function isBrowser() {
  return typeof window !== 'undefined';
}

export function getAnalyticsNow() {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

export function getAnalyticsElapsedTime(startedAt) {
  return Math.max(0, Math.round(getAnalyticsNow() - startedAt));
}

export function createAnalyticsSessionId(prefix = 'analytics-session') {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function isAnalyticsEnabled() {
  return Boolean(POSTHOG_TOKEN) && isBrowser();
}

export function initAnalytics() {
  if (!isAnalyticsEnabled()) {
    return null;
  }

  if (hasInitialized) {
    return posthog;
  }

  posthog.init(POSTHOG_TOKEN, {
    api_host: POSTHOG_HOST,
    defaults: '2025-05-24',
    capture_pageview: false,
    capture_pageleave: true,
    autocapture: true,
    capture_performance: true,
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: '[data-analytics-sensitive="true"]',
    },
    loaded: (client) => {
      if (import.meta.env.DEV && import.meta.env.VITE_POSTHOG_DEBUG === 'true') {
        client.debug();
      }
    },
  });

  hasInitialized = true;
  return posthog;
}

export function trackEvent(eventName, properties = {}) {
  if (!isAnalyticsEnabled()) {
    return;
  }

  posthog.capture(eventName, cleanProperties(properties));
}

export function trackPageView(pageName, properties = {}) {
  trackEvent('$pageview', {
    page_name: pageName,
    ...properties,
  });
}

function normalizeVariant(value, fallback) {
  if (value === true) {
    return 'enabled';
  }

  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  return fallback;
}

function getSampleFormVariantOverride() {
  if (!isBrowser()) {
    return null;
  }

  const params = new URLSearchParams(window.location.search);
  const urlOverride = params.get(SAMPLE_FORM_OVERRIDE_PARAM);

  if (urlOverride) {
    window.localStorage.setItem(SAMPLE_FORM_OVERRIDE_KEY, urlOverride);
    return urlOverride;
  }

  return window.localStorage.getItem(SAMPLE_FORM_OVERRIDE_KEY);
}

function getStableFallbackVariant(flagKey, fallback) {
  if (!isBrowser()) {
    return fallback;
  }

  const storageKey = `lims:${flagKey}:fallback-variant`;
  const current = window.localStorage.getItem(storageKey);

  if (current) {
    return current;
  }

  const nextVariant = Math.random() < 0.5 ? 'form-a' : 'form-b';
  window.localStorage.setItem(storageKey, nextVariant);
  return nextVariant;
}

export function useFeatureFlagVariant(flagKey, fallback = 'form-a') {
  const localFallback = useMemo(
    () => getSampleFormVariantOverride() || getStableFallbackVariant(flagKey, fallback),
    [fallback, flagKey],
  );
  const [variantState, setVariantState] = useState({
    isReady: !isAnalyticsEnabled(),
    variant: localFallback,
  });

  useEffect(() => {
    if (!isAnalyticsEnabled()) {
      setVariantState({ isReady: true, variant: localFallback });
      return undefined;
    }

    const updateVariant = () => {
      const posthogVariant = posthog.getFeatureFlag(flagKey);
      setVariantState({
        isReady: true,
        variant: normalizeVariant(posthogVariant, localFallback),
      });
    };

    updateVariant();
    const unsubscribe = posthog.onFeatureFlags(updateVariant);

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [flagKey, localFallback]);

  return variantState;
}
