import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import { sampleCards } from '../sampleWorkspaceData';
import '../styles.css';

const paletteClassMap = {
  slate: 'dot-slate',
  sky: 'dot-sky',
  amber: 'dot-amber',
  coral: 'dot-coral',
  mint: 'dot-mint',
  sage: 'dot-sage',
  green: 'dot-green',
};

function PageHeader({ onNewSample }) {
  return (
    <div className="page-header">
      <div className="container-fluid h-100">
        <div className="row h-100 align-items-center justify-content-between gx-0">
          <div className="col-auto">
            <h1 className="page-title mb-0">Samples Workspace</h1>
          </div>
          <div className="col-auto">
            <PrimaryButton leftIcon="plus" onClick={onNewSample}>
              New Sample
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchHero() {
  return (
    <section className="search-hero">
      <div className="container-fluid px-4">
        <div className="row justify-content-center">
          <div className="col-12">
            <div className="row search-row justify-content-center align-items-center g-3">
              <div className="col-lg-6 col-xl-5">
                <div className="search-shell d-flex align-items-center">
                  <div className="search-field d-flex align-items-center flex-grow-1">
                    <AppIcon name="search" />
                    <span>Search Samples</span>
                  </div>
                  <button className="btn search-submit" aria-label="Search samples">
                    <AppIcon name="chevron-right" />
                  </button>
                </div>
              </div>
              <div className="col-auto">
                <button className="btn filter-trigger">
                  <AppIcon name="filter" />
                  <span>All Filters</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SampleCard({ sample, onOpenSample }) {
  const isOpenable = sample.status === 'Under Analysis' || sample.status === 'Pending';

  return (
    <article className="sample-card">
      <div className="row g-0 align-items-stretch">
        <div className="col-xl-3 col-lg-4">
          <div className="sample-column sample-primary h-100">
            <div className="sample-primary-header">
              {isOpenable ? (
                <a
                  href="/"
                  onClick={(event) => {
                    event.preventDefault();
                    onOpenSample?.(sample.id, {
                      sourcePage: 'samples-workspace',
                      sampleStatus: sample.status,
                      createdOn: sample.createdOn,
                    });
                  }}
                  className="sample-id"
                >
                  {sample.id}
                </a>
              ) : (
                <span className="sample-id">{sample.id}</span>
              )}
              <div className={`status-badge status-${sample.statusTone}`}>{sample.status}</div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-lg-4">
          <div className="sample-column sample-meta h-100 sample-divider">
            <div className="row g-0">
              <div className="col-12">
                <div className="meta-block">
                  <div className="meta-label">Customer Representative</div>
                  <div className="meta-value">{sample.representative}</div>
                </div>
              </div>
              <div className="col-6 pe-3">
                <div className="meta-block">
                  <div className="meta-label">Reference</div>
                  <div className="meta-value">{sample.reference}</div>
                </div>
              </div>
              <div className="col-6">
                <div className="meta-block">
                  <div className="meta-label">Request Mode</div>
                  <div className="meta-value">{sample.requestMode}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-lg-4">
          <div className="sample-column sample-dates h-100 sample-divider">
            <div className="sample-dates-row">
              <div className="meta-block">
                <div className="meta-label">Created on</div>
                <div className="meta-value">{sample.createdOn}</div>
              </div>
              <div className="meta-block">
                <div className="meta-label">Reporting Date</div>
                <div className="meta-value">{sample.reportingDate}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-12">
          <div className="sample-column sample-parameters h-100 sample-divider">
            <div className="meta-label">Parameters</div>
            <div className="parameter-dots">
              {sample.parameters.map((tone, index) => (
                <span
                  key={`${sample.status}-${index}`}
                  className={`parameter-dot ${paletteClassMap[tone]}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function SamplesPanel({ onOpenSample }) {
  return (
    <section className="samples-panel">
      <div className="container-fluid px-0">
        <div className="row align-items-center justify-content-between gx-0 panel-header">
          <div className="col-auto">
            <div className="panel-title">Recent samples</div>
          </div>
          <div className="col-auto">
            <button className="btn clear-link">Clear all</button>
          </div>
        </div>

        <div className="row g-3 mt-0">
          {sampleCards.map((sample, index) => (
            <div className="col-12" key={`${sample.id}-${index}`}>
              <SampleCard sample={sample} onOpenSample={onOpenSample} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function SampleWorkspacePage({
  onNewSample,
  onOpenSample,
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
}) {
  return (
    <AppChrome
      activeNav="samples-workspace"
      onNavigate={onNavigate}
      breadcrumbs={[{ key: 'samples-workspace', label: 'Samples Workspace', current: true }]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      pageHeader={<PageHeader onNewSample={onNewSample} />}
    >
      <main className="page-body">
        <SearchHero />
        <SamplesPanel onOpenSample={onOpenSample} />
      </main>
    </AppChrome>
  );
}
