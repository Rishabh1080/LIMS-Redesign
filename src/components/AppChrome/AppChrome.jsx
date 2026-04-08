import { useState } from 'react';
import companyLogo from '../../../assets/logo-l.png';
import AppIcon from '../AppIcon';
import SecondaryButton from '../SecondaryButton';
import '../../styles.css';

const navigationSections = [
  {
    title: 'HOME',
    items: [{ label: 'Dashboard', icon: 'home', key: 'dashboard' }],
  },
  {
    title: 'LIMS',
    items: [
      { label: 'Requests for me', icon: 'requests-for-me', key: 'requests-for-me' },
      { label: 'Test Requests', icon: 'test-requests', key: 'test-requests-home' },
      { label: 'Samples Workspace', icon: 'workspace', key: 'samples-workspace' },
      { label: 'All Samples', icon: 'all-samples', key: 'all-samples' },
    ],
  },
];

function Sidebar({ activeNav, collapsed = false, onItemClick, onNavigate }) {
  return (
    <aside className={`lims-sidebar d-flex flex-column ${collapsed ? 'is-collapsed' : ''}`}>
      <div className="sidebar-brand d-flex align-items-center border-bottom">
        <div className="brand-block d-flex align-items-center">
          <img className="brand-mark" src={companyLogo} alt="Deepak ChemTech logo" />
          <div className="brand-copy">
            <div>Deepak ChemTech</div>
            <div>Pvt. Ltd.</div>
          </div>
        </div>
      </div>

      <div className="sidebar-nav flex-grow-1">
        {navigationSections.map((section) => (
          <section className="sidebar-section" key={section.title}>
            <div className="sidebar-label">
              <span>{section.title}</span>
            </div>
            <div className="d-grid gap-1">
              {section.items.map((item) => (
                <button
                  key={item.key}
                  className={`sidebar-link btn text-start ${item.key === activeNav ? 'is-active' : ''}`}
                  title={collapsed ? item.label : undefined}
                  aria-label={item.label}
                  onClick={() => {
                    onNavigate?.(item.key);
                    onItemClick?.();
                  }}
                >
                  <AppIcon name={item.icon} />
                  <span className="sidebar-link-text">{item.label}</span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}

function GlobalHeader({ mobileSidebarOpen, onToggleSidebar, breadcrumbs = [], onNavigate }) {
  return (
    <header className="global-header">
      <div className="container-fluid h-100">
        <div className="row h-100 align-items-center justify-content-between gx-0">
          <div className="col-auto">
            <div className="header-breadcrumb-shell d-flex align-items-center">
              <div className="header-nav-toggle-wrap">
                <button
                  className="header-nav-toggle btn"
                  aria-label={mobileSidebarOpen ? 'Close navigation' : 'Toggle navigation'}
                  aria-expanded={mobileSidebarOpen}
                  onClick={onToggleSidebar}
                >
                  <AppIcon name={mobileSidebarOpen ? 'close' : 'menu'} />
                </button>
              </div>

              <div className="header-breadcrumb d-flex align-items-center">
                <button
                  className="header-home btn d-flex align-items-center"
                  aria-label="Go to Samples Workspace"
                  onClick={() => onNavigate?.('samples-workspace')}
                >
                  <AppIcon name="home" />
                </button>

                {breadcrumbs.length ? <span className="header-breadcrumb__divider">{'>'}</span> : null}

                {breadcrumbs.map((crumb, index) => (
                  <div className="header-breadcrumb__item" key={`${crumb.label}-${index}`}>
                    {crumb.current ? (
                      <span className="header-breadcrumb__text is-current">{crumb.label}</span>
                    ) : (
                      <button
                        className="btn header-breadcrumb__text"
                        onClick={() => onNavigate?.(crumb.key)}
                      >
                        {crumb.label}
                      </button>
                    )}

                    {index < breadcrumbs.length - 1 ? (
                      <span className="header-breadcrumb__divider">{'>'}</span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-auto">
            <div className="header-actions d-flex align-items-center">
              <div className="status-pill">
                <AppIcon name="activity" />
                <span className="status-pill-label">No Active Alerts</span>
              </div>
              <button className="header-chip btn">
                <AppIcon name="phone" />
                <span className="header-chip-label">+91-6358273804</span>
              </button>
              <SecondaryButton size="large" className="header-icon" aria-label="Notifications">
                <AppIcon name="bell" />
              </SecondaryButton>
              <button className="header-avatar btn">DC</button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function AppChrome({
  activeNav,
  pageHeader = null,
  children,
  onNavigate,
  breadcrumbs = [],
  sidebarCollapsed = false,
  onSidebarCollapsedChange,
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    if (window.innerWidth < 992) {
      setMobileSidebarOpen((current) => !current);
      return;
    }

    onSidebarCollapsedChange?.(!sidebarCollapsed);
  };

  return (
    <div className="container-fluid lims-app px-0">
      <div
        className={`sidebar-backdrop ${mobileSidebarOpen ? 'is-visible' : ''}`}
        onClick={() => setMobileSidebarOpen(false)}
      />

      <div className={`sidebar-shell sidebar-shell-mobile ${mobileSidebarOpen ? 'is-open' : ''}`}>
        <Sidebar
          activeNav={activeNav}
          onNavigate={onNavigate}
          onItemClick={() => setMobileSidebarOpen(false)}
        />
      </div>

      <div
        className={`sidebar-shell sidebar-shell-desktop ${sidebarCollapsed ? 'is-collapsed' : ''}`}
      >
        <Sidebar activeNav={activeNav} collapsed={sidebarCollapsed} onNavigate={onNavigate} />
      </div>

      <div className="lims-main min-vh-100">
        <GlobalHeader
          mobileSidebarOpen={mobileSidebarOpen}
          onToggleSidebar={handleToggleSidebar}
          breadcrumbs={breadcrumbs}
          onNavigate={onNavigate}
        />
        {pageHeader ? <div className="lims-page-header-slot">{pageHeader}</div> : null}
        <div className="lims-main-content">{children}</div>
      </div>
    </div>
  );
}
