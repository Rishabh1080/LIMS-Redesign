import { useEffect, useMemo, useRef, useState } from 'react';
import {
  IconAlertCircle,
  IconBuildingWarehouse,
  IconChartBar,
  IconCloudDataConnection,
  IconExternalLink,
  IconFileDescription,
  IconDotsVertical,
  IconFlask,
  IconLogout2,
  IconPlus,
  IconSearch,
  IconTool,
} from '@tabler/icons-react';
import { useLims } from '../../store/LimsStore';
import { getCategorySummary, getDashboardMetrics } from '../../store/selectors';
import { useNow, usePrefersReducedMotion } from '../../lib/hooks';
import { cx, firstName, greetingFor } from '../../lib/format';
import { Button } from '../components/ui';

const healthItems = [
  { key: 'env', label: 'Env. Data', status: '2 Alerts', tone: 'danger', icon: IconCloudDataConnection, module: 'Environment monitoring' },
  { key: 'instruments', label: 'Instruments', status: '2 Alerts', tone: 'danger', icon: IconTool, module: 'Instrument & calibration management' },
  { key: 'inventory', label: 'Inventory', status: '1 Alert', tone: 'danger', icon: IconBuildingWarehouse, module: 'Inventory management' },
  { key: 'documents', label: 'Documents', status: 'Up to Date', tone: 'success', icon: IconFileDescription, module: 'Document control' },
];

const STATUS_COLORS = {
  pending: '#1379f0',
  underAnalysis: '#f2c94c',
  completed: '#4caf50',
};

// What each number showed the last time the visitor looked, kept for the
// session, so the dashboard can count from there to the new value.
const lastSeen = new Map();
const COUNT_MS = 700;

/**
 * A KPI number that counts from its last-seen value to the current one and
 * briefly highlights the tile when it changed. Waits until the LIMS is on
 * screen (not while the setup overlay still covers it).
 */
function MetricValue({ metricKey, value, visible, onChanged }) {
  const reducedMotion = usePrefersReducedMotion();
  const [shown, setShown] = useState(() => (lastSeen.has(metricKey) ? lastSeen.get(metricKey) : 0));
  const shownRef = useRef(shown);
  shownRef.current = shown;

  useEffect(() => {
    if (!visible) return undefined;
    const from = shownRef.current;
    if (from === value || reducedMotion) {
      setShown(value);
      lastSeen.set(metricKey, value);
      return undefined;
    }
    if (lastSeen.has(metricKey)) onChanged?.(metricKey);
    const start = performance.now();
    let frame = 0;
    const tick = (time) => {
      const t = Math.min(1, (time - start) / COUNT_MS);
      const eased = 1 - (1 - t) ** 3;
      setShown(Math.round(from + (value - from) * eased));
      if (t < 1) frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(frame);
      lastSeen.set(metricKey, value);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, visible, reducedMotion, metricKey]);

  useEffect(() => () => lastSeen.set(metricKey, value), [metricKey, value]);

  return shown;
}

function CardHeader({ icon: Icon, title, action }) {
  return (
    <div className="sgt-dash-card__header">
      <div className="sgt-dash-card__heading">
        <Icon size={18} stroke={1.9} aria-hidden="true" />
        <h2 className="sgt-dash-card__title">{title}</h2>
      </div>
      {action}
    </div>
  );
}

function StackedBarChart({ rows }) {
  const width = 720;
  const height = 280;
  const padding = { top: 16, right: 12, bottom: 44, left: 40 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const maxValue = Math.max(2, ...rows.map((row) => row.pending + row.underAnalysis + row.completed));
  const scaleMax = Math.ceil(maxValue / 2) * 2;
  const ticks = Array.from({ length: scaleMax / 2 + 1 }, (_, index) => index * 2);
  const slot = innerWidth / Math.max(rows.length, 1);
  const barWidth = Math.min(40, slot * 0.42);
  const y = (value) => padding.top + innerHeight - (value / scaleMax) * innerHeight;

  return (
    <svg
      className="sgt-chart"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Samples by category: ${rows
        .map((row) => `${row.category} ${row.pending} pending, ${row.underAnalysis} under analysis, ${row.completed} completed`)
        .join('; ')}`}
    >
      {ticks.map((tick) => (
        <g key={tick}>
          <line x1={padding.left} x2={width - padding.right} y1={y(tick)} y2={y(tick)} className="sgt-chart__grid" />
          <text x={padding.left - 10} y={y(tick) + 4} className="sgt-chart__tick" textAnchor="end">
            {tick}
          </text>
        </g>
      ))}
      <line x1={padding.left} x2={padding.left} y1={padding.top} y2={padding.top + innerHeight} className="sgt-chart__axis" />
      {rows.map((row, index) => {
        const x = padding.left + slot * index + slot / 2 - barWidth / 2;
        let cursor = 0;
        const segments = [
          ['pending', row.pending],
          ['underAnalysis', row.underAnalysis],
          ['completed', row.completed],
        ];
        return (
          <g key={row.category}>
            <g className="sgt-chart__bar" style={{ animationDelay: `${index * 60}ms` }}>
              {segments.map(([key, value]) => {
                if (!value) return null;
                const top = y(cursor + value);
                const bottom = y(cursor);
                cursor += value;
                return <rect key={key} x={x} y={top} width={barWidth} height={bottom - top} fill={STATUS_COLORS[key]} />;
              })}
            </g>
            <text x={x + barWidth / 2} y={height - padding.bottom + 18} textAnchor="middle" className="sgt-chart__label">
              {row.category}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function Donut({ totals }) {
  const values = [
    ['pending', totals.pending],
    ['underAnalysis', totals.underAnalysis],
    ['completed', totals.completed],
  ];
  const total = values.reduce((sum, [, value]) => sum + value, 0) || 1;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <svg className="sgt-donut" viewBox="0 0 140 140" aria-hidden="true">
      <circle cx="70" cy="70" r={radius} className="sgt-donut__track" />
      {values.map(([key, value]) => {
        const length = (value / total) * circumference;
        const node = (
          <circle
            key={key}
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke={STATUS_COLORS[key]}
            strokeWidth="18"
            strokeDasharray={`${length} ${circumference - length}`}
            strokeDashoffset={-offset}
            transform="rotate(-90 70 70)"
            className="sgt-donut__segment"
          />
        );
        offset += length;
        return node;
      })}
    </svg>
  );
}

export function DashboardPage({ profile, visible = true }) {
  const { state, actions, dispatch } = useLims();
  const now = useNow(30000);
  const [changed, setChanged] = useState(null);
  const metrics = useMemo(() => getDashboardMetrics(state.data, now), [state.data, now]);
  const summary = useMemo(() => getCategorySummary(state.data), [state.data]);
  const totalSamples = summary.totals.pending + summary.totals.underAnalysis + summary.totals.completed;

  const notInDemo = (module) =>
    dispatch({ type: 'toast/show', payload: { message: `${module} is part of the full Sampleify product. This demo covers inwards and test requests.` } });

  const metricItems = [
    { key: 'today', value: metrics.receivedToday, label: 'Samples received today', go: () => actions.navigate('inwards', { filter: 'today' }) },
    { key: 'delayed', value: metrics.delayedSamples, label: 'Delayed samples', tone: metrics.delayedSamples ? 'danger' : null, go: () => actions.navigate('inwards') },
    { key: 'allocate', value: metrics.toAllocate, label: 'Test requests to allocate', go: () => actions.navigate('test-requests', { tab: 'pending' }) },
    { key: 'approval', value: metrics.awaitingApproval, label: 'Awaiting approval', go: () => actions.navigate('test-requests', { tab: 'approval' }) },
  ];

  return (
    <div className="sgt-content">
      <div className={cx('sgt-dashboard', visible && 'is-live')}>
        <div className="sgt-dashboard__greeting">
          <h1 className="sgt-dashboard__hello">
            {greetingFor(now)}, {firstName(profile.name)}
          </h1>
          <p className="sgt-dashboard__date">
            {new Date(now).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="sgt-dash-grid">
          <section className="sgt-dash-card sgt-dash-grid__health" data-tour="dash-health" aria-labelledby="sgt-dash-health">
            <div className="sgt-dash-card__header">
              <div className="sgt-dash-card__heading">
                <IconTool size={18} stroke={1.9} aria-hidden="true" />
                <h2 className="sgt-dash-card__title" id="sgt-dash-health">Laboratory Health</h2>
              </div>
            </div>
            <div className="sgt-dash-card__body sgt-health-grid">
              {healthItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    type="button"
                    key={item.key}
                    className={cx('sgt-health-tile', `sgt-health-tile--${item.tone}`)}
                    onClick={() => notInDemo(item.module)}
                  >
                    <span className="sgt-health-tile__name">
                      <Icon size={20} stroke={1.8} aria-hidden="true" />
                      <span className="sgt-health-tile__label" title={item.label}>{item.label}</span>
                    </span>
                    <span className={cx('sgt-pill', 'sgt-health-tile__status', item.tone === 'danger' ? 'sgt-pill--solid-red' : 'sgt-pill--green')}>{item.status}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="sgt-dash-card sgt-dash-grid__metrics" data-tour="dash-metrics" aria-label="Key numbers">
            <div className="sgt-dash-card__body sgt-metric-grid">
              {metricItems.map((item) => (
                <div
                  className={cx('sgt-metric', item.tone && `sgt-metric--${item.tone}`, changed === item.key && 'is-changed')}
                  key={item.key}
                  onAnimationEnd={(event) => {
                    if (event.animationName === 'sgt-metric-flash') setChanged(null);
                  }}
                >
                  <button type="button" className="sgt-metric__link" aria-label={`Open ${item.label}`} onClick={item.go}>
                    <IconExternalLink size={16} stroke={1.8} />
                  </button>
                  <div className="sgt-metric__value" aria-live="polite">
                    <MetricValue metricKey={item.key} value={item.value} visible={visible} onChanged={setChanged} />
                  </div>
                  <div className="sgt-metric__label">{item.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Same card, buttons and order as the product's dashboard (src/pages/DashboardPage.jsx). */}
          <section className="sgt-dash-card sgt-dash-grid__quick" data-tour="dash-quick-actions" aria-labelledby="sgt-dash-quick">
            <div className="sgt-dash-card__header">
              <div className="sgt-dash-card__heading">
                <IconFlask size={18} stroke={1.9} aria-hidden="true" />
                <h2 className="sgt-dash-card__title" id="sgt-dash-quick">Quick Actions</h2>
              </div>
              <button type="button" className="sgt-dash-card__more" aria-label="More actions" onClick={() => notInDemo('More quick actions')}>
                <IconDotsVertical size={20} stroke={1.8} />
              </button>
            </div>
            <div className="sgt-dash-card__body sgt-quick-actions">
              <Button icon={IconPlus} block data-tour="dash-new-inward" onClick={() => actions.navigate('new-inward')}>
                New Inward
              </Button>
              <Button variant="secondary" size="sm" icon={IconSearch} block onClick={() => actions.navigate('inwards')}>
                Search Samples
              </Button>
              <Button variant="secondary" size="sm" icon={IconLogout2} block onClick={() => notInDemo('Leave records')}>
                Add Leave Record
              </Button>
              <Button variant="secondary" size="sm" icon={IconAlertCircle} block onClick={() => notInDemo('Instrument breakdowns')}>
                Report Breakdown
              </Button>
            </div>
          </section>

          <section className="sgt-dash-card sgt-dash-grid__summary" data-tour="dash-summary" aria-labelledby="sgt-dash-summary">
            <CardHeader
              icon={IconChartBar}
              title="Samples Summary"
              action={(
                <Button variant="secondary" size="sm" iconRight={IconExternalLink} onClick={() => actions.navigate('inwards')}>
                  View all inwards
                </Button>
              )}
            />
            <div className="sgt-dash-card__body sgt-summary">
              <div className="sgt-summary__chart">
                <StackedBarChart rows={summary.rows} />
              </div>
              <div className="sgt-summary__donut">
                <Donut totals={summary.totals} />
                <ul className="sgt-legend">
                  <li><span className="sgt-legend__dot" style={{ background: STATUS_COLORS.pending }} />Pending<span>{summary.totals.pending}</span></li>
                  <li><span className="sgt-legend__dot" style={{ background: STATUS_COLORS.underAnalysis }} />Under Analysis<span>{summary.totals.underAnalysis}</span></li>
                  <li><span className="sgt-legend__dot" style={{ background: STATUS_COLORS.completed }} />Completed<span>{summary.totals.completed}</span></li>
                  <li className="sgt-legend__total">Total<span>{totalSamples}</span></li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        <p className="sgt-dashboard__footnote">
          <IconFlask size={14} stroke={1.8} aria-hidden="true" />
          Demo workspace. Every customer, analyst and result here is sample data, saved only in this browser.
        </p>
      </div>
    </div>
  );
}
