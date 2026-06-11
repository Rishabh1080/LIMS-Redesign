import { useEffect, useRef } from 'react';
import { BarChart, PieChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import './dashboard-page.scss';

echarts.use([BarChart, PieChart, GridComponent, TooltipComponent, CanvasRenderer]);

const laboratoryHealthItems = [
  { label: 'Env. Data', status: '5 Alerts', tone: 'danger', icon: 'cloud-data', section: 'env-data-alerts' },
  { label: 'Instruments', status: 'Up to Date', tone: 'success', icon: 'tool', section: 'instrument-alerts' },
  { label: 'Inventory', status: '5 Alerts', tone: 'danger', icon: 'materials', section: 'material-alerts' },
  { label: 'Documents', status: 'Up to Date', tone: 'success', icon: 'file-description', section: 'document-alerts' },
];

const summaryMetricItems = [
  { value: '15', label: 'Pending Requests' },
  { value: '15', label: 'Planned IQC' },
  { value: '15', label: 'Samples to be allocated' },
  { value: '15', label: 'Pending Test Requests' },
];

const chartCategories = [
  'Finished\nProduct',
  'Base Oil',
  'Compatability\nTesting',
  'Raw Material',
  'Air',
  'Water',
];

const chartSeries = {
  pending: [12, 25, 25, 25, 10, 50],
  underAnalysis: [18, 25, 10, 54, 10, 0],
  completed: [5, 8, 9, 9, 23, 8],
};

const sampleStatusItems = [
  { label: 'Pending', value: 80, color: '#1379f0' },
  { label: 'Under Analysis', value: 480, color: '#f2c94c' },
  { label: 'Completed', value: 200, color: '#4caf50' },
  { label: 'Total', value: 697, total: true },
];

function ActionCenterCard({ children, className = '' }) {
  return (
    <section className={`smplfy-card card overflow-hidden ${className}`}>
      {children}
    </section>
  );
}

function ActionCenterCardHeader({ title, icon, action }) {
  return (
    <div className="card-header bg-transparent d-flex align-items-center justify-content-between gap-3">
      <div className="d-flex align-items-center gap-2 min-w-0">
        <AppIcon name={icon} size={18} stroke={1.9} />
        <h2 className="smplfy-action-center-title mb-0 text-dark text-truncate">{title}</h2>
      </div>
      {action}
    </div>
  );
}

function HealthTile({ item, onNavigate }) {
  const isDanger = item.tone === 'danger';

  return (
    <button
      type="button"
      className={`smplfy-action-center-health-tile border rounded d-flex align-items-center justify-content-between gap-3 p-3 ${
        isDanger ? 'border-danger-subtle' : 'border-success-subtle'
      }`}
      onClick={() => onNavigate?.('requests-for-me', { initialSection: item.section })}
    >
      <div className="d-flex align-items-center gap-3 min-w-0">
        <AppIcon name={item.icon} size={20} stroke={1.9} />
        <span className="smplfy-action-center-tile-title text-dark text-truncate">{item.label}</span>
      </div>
      <span
        className={`badge rounded-pill border px-3 py-2 ${
          isDanger
            ? 'text-bg-danger border-danger'
            : 'text-success bg-success-subtle border-success'
        }`}
      >
        {item.status}
      </span>
    </button>
  );
}

function LaboratoryHealthCard({ onNavigate }) {
  return (
    <ActionCenterCard className="smplfy-action-center-health-card">
      <ActionCenterCardHeader
        title="Laboratory Health"
        icon="tool"
        action={(
          <SecondaryButton
            size="medium"
            rightIcon="external-link"
            onClick={() => onNavigate?.('requests-for-me')}
          >
            See all alerts
          </SecondaryButton>
        )}
      />
      <div className="card-body p-3">
        <div className="row g-3">
          {laboratoryHealthItems.map((item) => (
            <div className="col-12 col-md-6" key={item.label}>
              <HealthTile item={item} onNavigate={onNavigate} />
            </div>
          ))}
        </div>
      </div>
    </ActionCenterCard>
  );
}

function MetricTile({ item, onNavigate }) {
  return (
    <div className="smplfy-action-center-metric-tile border rounded bg-white position-relative overflow-hidden p-3">
      <button
        type="button"
        className="smplfy-btn btn btn-outline-secondary btn-sm p-0 position-absolute top-0 end-0 mt-2 me-2"
        aria-label={`Go to ${item.label}`}
        onClick={() => onNavigate?.('all-samples')}
      >
        <AppIcon name="external-link" size={16} />
      </button>
      <div className="d-flex flex-column justify-content-end h-100 position-relative">
        <div className="smplfy-action-center-count text-dark">{item.value}</div>
        <div className="smplfy-action-center-label text-dark">{item.label}</div>
      </div>
    </div>
  );
}

function SampleMetricCard({ onNavigate }) {
  return (
    <ActionCenterCard className="smplfy-action-center-metrics-card">
      <div className="card-body p-3 h-100">
        <div className="row row-cols-1 row-cols-md-2 g-3 h-100">
          {summaryMetricItems.map((item) => (
            <div className="col" key={item.label}>
              <MetricTile item={item} onNavigate={onNavigate} />
            </div>
          ))}
        </div>
      </div>
    </ActionCenterCard>
  );
}

function QuickActionsCard({ onNavigate, onNewSample }) {
  return (
    <ActionCenterCard className="smplfy-action-center-quick-card">
      <ActionCenterCardHeader
        title="Quick Actions"
        icon="workspace"
        action={(
          <button type="button" className="btn p-0 border-0 text-secondary" aria-label="More actions">
            <AppIcon name="more" size={20} />
          </button>
        )}
      />
      <div className="card-body d-grid gap-3 p-3">
        <PrimaryButton
          leftIcon="plus"
          className="w-100"
          onClick={() => onNewSample?.({ sourcePage: 'samples-workspace' })}
        >
          New sample
        </PrimaryButton>
        <SecondaryButton
          size="medium"
          leftIcon="search"
          className="w-100 justify-content-center"
          onClick={() => onNavigate?.('samples-workspace')}
        >
          Search Samples
        </SecondaryButton>
        <SecondaryButton
          size="medium"
          leftIcon="leave-records"
          className="w-100 justify-content-center"
          onClick={() => onNavigate?.('leave-records')}
        >
          Add Leave Record
        </SecondaryButton>
        <SecondaryButton
          size="medium"
          leftIcon="alert-circle"
          className="w-100 justify-content-center"
          onClick={() => onNavigate?.('instruments')}
        >
          Report Breakdown
        </SecondaryButton>
      </div>
    </ActionCenterCard>
  );
}

function SamplesBarChart() {
  const chartRef = useRef(null);

  useEffect(() => {
    const chartNode = chartRef.current;

    if (!chartNode) return undefined;

    const chart = echarts.init(chartNode, null, { renderer: 'canvas' });

    chart.setOption({
      animation: false,
      color: ['#1379f0', '#f2c94c', '#4caf50'],
      grid: {
        left: 44,
        right: 8,
        top: 16,
        bottom: 44,
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      xAxis: {
        type: 'category',
        data: chartCategories,
        axisTick: { show: false },
        axisLine: { lineStyle: { color: '#d1d5db' } },
        axisLabel: {
          color: '#4d5561',
          fontFamily: 'Inter',
          fontSize: 10,
          lineHeight: 12,
          interval: 0,
        },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 90,
        interval: 10,
        axisTick: { show: false },
        axisLine: { show: true, lineStyle: { color: '#d1d5db' } },
        splitLine: { lineStyle: { color: '#e6e8eb' } },
        axisLabel: {
          color: '#4d5561',
          fontFamily: 'Inter',
          fontSize: 10,
          lineHeight: 12,
        },
      },
      series: [
        {
          name: 'Pending',
          type: 'bar',
          stack: 'samples',
          barWidth: 32,
          data: chartSeries.pending,
        },
        {
          name: 'Under Analysis',
          type: 'bar',
          stack: 'samples',
          barWidth: 32,
          data: chartSeries.underAnalysis,
        },
        {
          name: 'Completed',
          type: 'bar',
          stack: 'samples',
          barWidth: 32,
          data: chartSeries.completed,
        },
      ],
    });

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, []);

  return <div className="smplfy-action-center-bar-chart" ref={chartRef} aria-label="Samples summary bar chart" />;
}

function SamplesDonutChart() {
  const chartRef = useRef(null);

  useEffect(() => {
    const chartNode = chartRef.current;

    if (!chartNode) return undefined;

    const chart = echarts.init(chartNode, null, { renderer: 'canvas' });

    chart.setOption({
      animation: false,
      color: ['#1379f0', '#f2c94c', '#4caf50'],
      series: [
        {
          type: 'pie',
          radius: ['58%', '82%'],
          center: ['50%', '50%'],
          silent: true,
          avoidLabelOverlap: true,
          label: { show: false },
          labelLine: { show: false },
          data: sampleStatusItems.filter((item) => !item.total).map((item) => ({
            name: item.label,
            value: item.value,
          })),
        },
      ],
    });

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, []);

  return <div className="smplfy-action-center-donut-chart" ref={chartRef} aria-label="Samples summary donut chart" />;
}

function SamplesSummaryCard({ onNavigate }) {
  return (
    <ActionCenterCard className="smplfy-action-center-summary-card">
      <ActionCenterCardHeader
        title="Samples Summary"
        icon="tool"
        action={(
          <SecondaryButton
            size="medium"
            rightIcon="external-link"
            onClick={() => onNavigate?.('all-samples')}
          >
            View all Samples
          </SecondaryButton>
        )}
      />
      <div className="card-body p-3">
        <div className="d-flex align-items-center justify-content-between gap-3 mb-4">
          <div className="d-flex align-items-center gap-2">
            <span className="smplfy-action-center-control-label text-secondary">Filter by:</span>
            <button type="button" className="smplfy-btn btn btn-outline-secondary btn-sm">
              <span>Category</span>
              <AppIcon name="chevron-down" size={18} />
            </button>
          </div>
          <button type="button" className="smplfy-btn btn btn-outline-secondary btn-sm">
            <span>Today</span>
            <AppIcon name="chevron-down" size={18} />
          </button>
        </div>

        <div className="row g-4 align-items-end">
          <div className="col-12 col-xl-8">
            <SamplesBarChart />
          </div>
          <div className="col-12 col-xl-4">
            <div className="border rounded bg-white p-3 mx-xl-auto smplfy-action-center-donut-panel">
              <SamplesDonutChart />
              <div className="d-grid gap-3 mt-3">
                {sampleStatusItems.map((item) => (
                  <div className="d-flex align-items-center justify-content-between gap-3" key={item.label}>
                    <div className="d-flex align-items-center gap-2 min-w-0">
                      {item.total ? null : (
                        <span
                          className="smplfy-action-center-legend-dot rounded-1 flex-shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                      )}
                      <span className="smplfy-action-center-label text-dark text-truncate">{item.label}</span>
                    </div>
                    <span className="smplfy-action-center-label text-dark">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ActionCenterCard>
  );
}

export default function DashboardPage({
  onNavigate,
  onNewSample,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  sidebarBadgeCounts,
}) {
  return (
    <AppChrome
      activeNav="dashboard"
      onNavigate={onNavigate}
      breadcrumbs={[]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      sidebarBadgeCounts={sidebarBadgeCounts}
    >
      <main className="smplfy-action-center bg-body-tertiary p-4 min-vh-100">
        <div className="container-fluid px-0">
          <div className="smplfy-action-center-grid">
            <div className="smplfy-action-center-span-6">
              <LaboratoryHealthCard onNavigate={onNavigate} />
            </div>
            <div className="smplfy-action-center-span-4">
              <SampleMetricCard onNavigate={onNavigate} />
            </div>
            <div className="smplfy-action-center-span-2">
              <QuickActionsCard onNavigate={onNavigate} onNewSample={onNewSample} />
            </div>
            <div className="smplfy-action-center-span-12">
              <SamplesSummaryCard onNavigate={onNavigate} />
            </div>
          </div>
        </div>
      </main>
    </AppChrome>
  );
}
