import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import {
  clearLocalSampleFlowEvents,
  downloadLocalSampleFlowEvents,
  getLocalSampleFlowEvents,
  summarizeLocalSampleFlowEvents,
} from './localSampleFlowAnalytics';
import './sample-flow-dashboard.css';

const root = document.getElementById('app');

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatDuration(milliseconds) {
  if (!Number.isFinite(milliseconds)) return '—';
  if (milliseconds < 1000) return `${milliseconds} ms`;
  const seconds = Math.round(milliseconds / 1000);
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

function stat(label, value, hint) {
  return `
    <article class="stat-card">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      <small>${escapeHtml(hint)}</small>
    </article>
  `;
}

function signalList(summary) {
  if (!summary.totalStarted) {
    return '<p class="empty">No creation sessions yet. Run the sample flow, then return here.</p>';
  }

  const signals = [];
  if (summary.completionRate < 70) {
    signals.push(`${summary.completionRate}% completion is the clearest signal to investigate.`);
  }
  if (summary.dropOffs[0]) {
    signals.push(`Most exits happen around ${summary.dropOffs[0].name} (${summary.dropOffs[0].count}).`);
  }
  if (summary.hesitationsByStep[0]) {
    signals.push(`${summary.hesitationsByStep[0].name} has the most long pauses (${summary.hesitationsByStep[0].count}).`);
  }
  if (summary.backtracksByStep[0]) {
    signals.push(`${summary.backtracksByStep[0].name} triggers the most backtracking (${summary.backtracksByStep[0].count}).`);
  }
  if (summary.revisitedFields[0]) {
    signals.push(`${summary.revisitedFields[0].name} is the most revisited field (${summary.revisitedFields[0].count} repeat focuses).`);
  }
  if (!signals.length) {
    signals.push('No strong friction signal yet. A few more observed sessions will make patterns more useful.');
  }

  return `<ul class="signal-list">${signals.map((signal) => `<li>${escapeHtml(signal)}</li>`).join('')}</ul>`;
}

function rankedList(items, emptyText, valueRenderer = (item) => item.count) {
  if (!items.length) return `<p class="empty">${escapeHtml(emptyText)}</p>`;
  const highest = Math.max(...items.slice(0, 5).map((item) => valueRenderer(item)), 1);

  return `
    <ol class="ranked-list">
      ${items.slice(0, 5).map((item) => {
        const value = valueRenderer(item);
        return `
          <li>
            <div><span>${escapeHtml(item.name)}</span><strong>${escapeHtml(value)}</strong></div>
            <i style="--bar-width: ${Math.max(4, Math.round((value / highest) * 100))}%"></i>
          </li>
        `;
      }).join('')}
    </ol>
  `;
}

function funnelRows(summary) {
  const steps = [
    { name: 'Form started', sessions: summary.totalStarted },
    ...summary.funnel,
    { name: 'Sample submitted', sessions: summary.totalCompleted },
  ];
  const denominator = Math.max(summary.totalStarted, 1);

  return steps.map((step) => `
    <div class="funnel-row">
      <span>${escapeHtml(step.name)}</span>
      <div><i style="--bar-width: ${Math.max(2, Math.round((step.sessions / denominator) * 100))}%"></i></div>
      <strong>${step.sessions}</strong>
    </div>
  `).join('');
}

function recentEventRows(events) {
  if (!events.length) {
    return '<tr><td colspan="4" class="empty">No events recorded.</td></tr>';
  }

  return events.slice(-12).reverse().map((event) => `
    <tr>
      <td>${escapeHtml(new Date(event.timestamp).toLocaleTimeString())}</td>
      <td>${escapeHtml(event.name)}</td>
      <td>${escapeHtml(event.properties?.step_name || '—')}</td>
      <td>${escapeHtml(event.properties?.field_key || '—')}</td>
    </tr>
  `).join('');
}

function render() {
  const events = getLocalSampleFlowEvents();
  const summary = summarizeLocalSampleFlowEvents(events);

  root.innerHTML = `
    <main class="dashboard-shell">
      <header>
        <div>
          <p class="eyebrow">Zero-config usability telemetry</p>
          <h1>Sample creation flow</h1>
          <p class="lede">Private to this browser. Form values and customer/sample data are never recorded.</p>
        </div>
        <div class="actions">
          <a class="button secondary" href="/">Open LIMS</a>
          <button class="button secondary" id="refresh-button">Refresh</button>
          <button class="button primary" id="export-button">Export JSON</button>
        </div>
      </header>

      <section class="stats-grid">
        ${stat('Sessions started', summary.totalStarted, `${summary.eventCount} total events`)}
        ${stat('Completion', `${summary.completionRate}%`, `${summary.totalCompleted} submitted`)}
        ${stat('Median time', formatDuration(summary.medianCompletionMs), 'Completed sessions only')}
        ${stat('Exited', summary.totalCancelled + summary.totalAbandoned, `${summary.totalCancelled} cancelled · ${summary.totalAbandoned} abandoned`)}
      </section>

      <section class="panel signals">
        <div class="section-heading">
          <div><p class="eyebrow">Start here</p><h2>Likely UX signals</h2></div>
          <span>Directional, not statistical proof</span>
        </div>
        ${signalList(summary)}
      </section>

      <div class="two-column">
        <section class="panel">
          <div class="section-heading"><h2>Flow funnel</h2><span>Unique form sessions</span></div>
          <div class="funnel">${funnelRows(summary)}</div>
        </section>
        <section class="panel">
          <div class="section-heading"><h2>Drop-off step</h2><span>Cancelled, abandoned, or unfinished</span></div>
          ${rankedList(summary.dropOffs, 'No exits recorded yet.')}
        </section>
      </div>

      <div class="three-column">
        <section class="panel">
          <div class="section-heading"><h2>Hesitations</h2><span>30s on step or 15s idle</span></div>
          ${rankedList(summary.hesitationsByStep, 'No long pauses detected.')}
        </section>
        <section class="panel">
          <div class="section-heading"><h2>Backtracks</h2><span>Previous or earlier step</span></div>
          ${rankedList(summary.backtracksByStep, 'No backtracking recorded.')}
        </section>
        <section class="panel">
          <div class="section-heading"><h2>Revisited fields</h2><span>Focused more than once</span></div>
          ${rankedList(summary.revisitedFields, 'No repeat field visits recorded.')}
        </section>
      </div>

      <section class="panel">
        <div class="section-heading"><h2>Slowest fields</h2><span>Average focused time; use as a clue, not a verdict</span></div>
        ${rankedList(
          summary.slowFields,
          'No field timing data yet.',
          (item) => item.averageMs,
        ).replaceAll(/<strong>(\d+)<\/strong>/g, (_, value) => `<strong>${formatDuration(Number(value))}</strong>`)}
      </section>

      <section class="panel event-panel">
        <div class="section-heading">
          <div><h2>Recent events</h2><span>Newest first</span></div>
          <button class="text-button" id="clear-button">Clear test data</button>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Time</th><th>Event</th><th>Step</th><th>Field</th></tr></thead>
            <tbody>${recentEventRows(events)}</tbody>
          </table>
        </div>
      </section>
    </main>
  `;

  document.getElementById('refresh-button').addEventListener('click', render);
  document.getElementById('export-button').addEventListener('click', downloadLocalSampleFlowEvents);
  document.getElementById('clear-button').addEventListener('click', () => {
    if (window.confirm('Clear all locally recorded sample-flow analytics?')) {
      clearLocalSampleFlowEvents();
      render();
    }
  });
}

window.addEventListener('storage', render);
window.addEventListener('lims:sample-analytics-event', render);
render();
