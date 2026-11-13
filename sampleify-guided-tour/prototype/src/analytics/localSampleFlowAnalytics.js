const STORAGE_KEY = 'lims:sample-flow-analytics:v1';
const MAX_EVENTS = 2500;
const SAMPLE_EVENT_PREFIXES = ['sample_form_', 'sample_creation_flow_'];

function isBrowser() {
  return typeof window !== 'undefined';
}

function isSampleFlowEvent(eventName) {
  return SAMPLE_EVENT_PREFIXES.some((prefix) => eventName.startsWith(prefix));
}

function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `sample-event-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function readEvents() {
  if (!isBrowser()) {
    return [];
  }

  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function writeEvents(events) {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
  } catch {
    // Analytics must never interrupt the sample flow if storage is unavailable.
  }
}

function getSessionId(event) {
  return event.properties?.form_session_id
    || event.properties?.sample_creation_flow_session_id
    || event.id;
}

function groupCount(events, getKey) {
  return events.reduce((counts, event) => {
    const key = getKey(event);
    if (!key) return counts;
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
}

function sortCounts(counts) {
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : Math.round((sorted[middle - 1] + sorted[middle]) / 2);
}

function uniqueSessionCount(events) {
  return new Set(events.map(getSessionId)).size;
}

function lastMeaningfulEvent(sessionEvents) {
  return [...sessionEvents]
    .reverse()
    .find((event) => Number.isInteger(event.properties?.step_index));
}

function buildFieldFocusSummary(events) {
  const blurEvents = events.filter((event) => (
    event.name === 'sample_form_field_blurred'
    && event.properties?.field_key
    && Number.isFinite(event.properties?.focus_duration_ms)
  ));
  const durationsByField = blurEvents.reduce((groups, event) => {
    const fieldKey = event.properties.field_key;
    if (!groups[fieldKey]) groups[fieldKey] = [];
    groups[fieldKey].push(event.properties.focus_duration_ms);
    return groups;
  }, {});

  return Object.entries(durationsByField)
    .map(([name, durations]) => ({
      name,
      observations: durations.length,
      averageMs: Math.round(durations.reduce((sum, duration) => sum + duration, 0) / durations.length),
      medianMs: median(durations),
    }))
    .sort((a, b) => b.averageMs - a.averageMs);
}

function buildRevisitedFieldSummary(events) {
  const focusCounts = {};

  events
    .filter((event) => event.name === 'sample_form_field_focused' && event.properties?.field_key)
    .forEach((event) => {
      const pairKey = `${getSessionId(event)}::${event.properties.field_key}`;
      focusCounts[pairKey] = (focusCounts[pairKey] || 0) + 1;
    });

  const revisits = Object.entries(focusCounts).reduce((counts, [pairKey, count]) => {
    if (count < 2) return counts;
    const fieldKey = pairKey.split('::').at(-1);
    counts[fieldKey] = (counts[fieldKey] || 0) + count - 1;
    return counts;
  }, {});

  return sortCounts(revisits);
}

export function recordLocalSampleFlowEvent(eventName, properties = {}) {
  if (!isBrowser() || !isSampleFlowEvent(eventName)) {
    return;
  }

  const events = readEvents();
  const previous = events.at(-1);
  const now = Date.now();
  const isImmediateDuplicate = previous
    && previous.name === eventName
    && now - new Date(previous.timestamp).getTime() < 250
    && previous.properties?.form_session_id === properties.form_session_id
    && previous.properties?.step_index === properties.step_index;

  if (isImmediateDuplicate) {
    return;
  }

  const event = {
    id: createId(),
    name: eventName,
    timestamp: new Date(now).toISOString(),
    path: `${window.location.pathname}${window.location.search}${window.location.hash}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    properties,
  };

  events.push(event);
  writeEvents(events);
  window.dispatchEvent(new CustomEvent('lims:sample-analytics-event', { detail: event }));
}

export function getLocalSampleFlowEvents() {
  return readEvents();
}

export function clearLocalSampleFlowEvents() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('lims:sample-analytics-cleared'));
}

export function summarizeLocalSampleFlowEvents(events = readEvents()) {
  const formEvents = events.filter((event) => event.properties?.mode !== 'edit');
  const starts = formEvents.filter((event) => event.name === 'sample_form_started');
  const completed = formEvents.filter((event) => event.name === 'sample_form_completed');
  const cancelled = formEvents.filter((event) => event.name === 'sample_form_cancelled');
  const abandoned = formEvents.filter((event) => event.name === 'sample_form_abandoned');
  const hesitations = formEvents.filter((event) => event.name === 'sample_form_hesitation_detected');
  const backtracks = formEvents.filter((event) => event.name === 'sample_form_backtracked');
  const reedited = formEvents.filter((event) => event.name === 'sample_form_field_reedited');
  const completedDurations = completed
    .map((event) => event.properties?.total_duration_ms)
    .filter(Number.isFinite);
  const startedSessions = new Set(starts.map(getSessionId));
  const sessionGroups = formEvents.reduce((groups, event) => {
    const sessionId = getSessionId(event);
    if (!groups[sessionId]) groups[sessionId] = [];
    groups[sessionId].push(event);
    return groups;
  }, {});
  const unresolvedSessions = Object.entries(sessionGroups).filter(([sessionId, sessionEvents]) => (
    startedSessions.has(sessionId)
    && !sessionEvents.some((event) => [
      'sample_form_completed',
      'sample_form_cancelled',
      'sample_form_abandoned',
    ].includes(event.name))
  ));
  const dropOffCounts = {};

  [...cancelled, ...abandoned, ...unresolvedSessions.map(([, sessionEvents]) => lastMeaningfulEvent(sessionEvents))]
    .filter(Boolean)
    .forEach((event) => {
      const stepName = event.properties?.step_name || `Step ${(event.properties?.step_index ?? 0) + 1}`;
      dropOffCounts[stepName] = (dropOffCounts[stepName] || 0) + 1;
    });

  const totalStarted = uniqueSessionCount(starts);
  const totalCompleted = uniqueSessionCount(completed);
  const stepViews = formEvents.filter((event) => event.name === 'sample_form_step_viewed');
  const funnel = sortCounts(groupCount(stepViews, (event) => event.properties?.step_name))
    .sort((a, b) => {
      const aIndex = stepViews.find((event) => event.properties?.step_name === a.name)?.properties?.step_index ?? 0;
      const bIndex = stepViews.find((event) => event.properties?.step_name === b.name)?.properties?.step_index ?? 0;
      return aIndex - bIndex;
    })
    .map((step) => ({
      ...step,
      sessions: uniqueSessionCount(stepViews.filter((event) => event.properties?.step_name === step.name)),
    }));

  return {
    generatedAt: new Date().toISOString(),
    eventCount: formEvents.length,
    totalStarted,
    totalCompleted,
    totalCancelled: uniqueSessionCount(cancelled),
    totalAbandoned: uniqueSessionCount(abandoned),
    completionRate: totalStarted ? Math.round((totalCompleted / totalStarted) * 100) : 0,
    medianCompletionMs: median(completedDurations),
    funnel,
    dropOffs: sortCounts(dropOffCounts),
    hesitationsByStep: sortCounts(groupCount(hesitations, (event) => event.properties?.step_name)),
    backtracksByStep: sortCounts(groupCount(backtracks, (event) => event.properties?.step_name)),
    reeditedFields: sortCounts(groupCount(reedited, (event) => event.properties?.field_key)),
    revisitedFields: buildRevisitedFieldSummary(formEvents),
    slowFields: buildFieldFocusSummary(formEvents),
    unresolvedSessionCount: unresolvedSessions.length,
  };
}

export function downloadLocalSampleFlowEvents() {
  if (!isBrowser()) return;
  const events = readEvents();
  const blob = new Blob([JSON.stringify({
    exportedAt: new Date().toISOString(),
    summary: summarizeLocalSampleFlowEvents(events),
    events,
  }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `sample-flow-analytics-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function installLocalSampleFlowAnalyticsApi() {
  if (!isBrowser()) return;

  window.limsSampleAnalytics = {
    events: getLocalSampleFlowEvents,
    summary: summarizeLocalSampleFlowEvents,
    download: downloadLocalSampleFlowEvents,
    clear: clearLocalSampleFlowEvents,
  };
}
