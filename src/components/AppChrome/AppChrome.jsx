import { IconFolder } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import companyLogo from '../../../assets/logo-l.png';
import Badge from '../Badge';
import AppIcon from '../AppIcon';
import SecondaryButton from '../SecondaryButton';
import { requestSections } from '../../data/requestsForMeData';
import { allTestRequestBuckets } from '../../data/testRequestsHomeData';
import '../../styles.scss';

const archivedNavigationItems = [
  { label: 'Document Management', icon: 'file-description', key: 'document-management' },
  { label: 'Document Management 3', icon: 'file-description', key: 'document-management-3' },
];

const navigationSections = [
  {
    title: 'HOME',
    items: [
      { label: 'Dashboard', icon: 'home', key: 'dashboard' },
    ],
  },
  {
    title: 'LIMS',
    items: [
      { label: 'Requests for me', icon: 'requests-for-me', key: 'requests-for-me', badgeKey: 'requests-for-me' },
      { label: 'Test Requests', icon: 'test-requests', key: 'test-requests-home', badgeKey: 'test-requests-home' },
      { label: 'Document Management', icon: 'file-description', key: 'document-management-2' },
      { label: 'Samples Workspace', icon: 'workspace', key: 'samples-workspace' },
      { label: 'All Samples', icon: 'all-samples', key: 'all-samples' },
      { label: 'Environment Data', icon: 'cloud-data', key: 'environment-data' },
      { label: 'Leave Records', icon: 'leave-records', key: 'leave-records' },
      { label: 'Materials', icon: 'materials', key: 'materials' },
      { label: 'Instruments', icon: 'tool', key: 'instruments' },
      { label: 'Trainings', icon: 'checklist', key: 'trainings' },
      { label: 'Reports', icon: 'file-text', key: 'reports' },
      { label: 'Organogram', icon: 'admin-personnel', key: 'organogram' },
      { label: 'Daily Checks', icon: 'checklist', key: 'daily-check' },
      { label: 'Supplier Management', icon: 'materials', key: 'supplier-management' },
    ],
  },
];

const adminHubNavigationItem = {
  label: 'Admin Hub',
  icon: 'admin-hub',
  key: 'admin-hub',
  opensInNewTab: true,
};

function SidebarNavButton({
  item,
  activeNav,
  collapsed = false,
  onItemClick,
  onNavigate,
  onTooltipShow,
  onTooltipHide,
  badgeCounts = {},
  className = '',
}) {
  const hasBadge = Boolean(badgeCounts[item.badgeKey]);
  const showIcon = Boolean(item.icon);
  const tooltipLabel = item.opensInNewTab ? `${item.label} - opens in a new tab` : item.label;

  return (
    <button
      key={item.key}
      className={`sidebar-link btn text-start ${
        item.key === activeNav ? 'is-active' : ''
      } ${hasBadge ? 'smplfy-sidebar-link-with-badge' : ''} ${
        collapsed && hasBadge ? 'smplfy-sidebar-link-with-dot' : ''
      } ${className}`}
      aria-label={item.opensInNewTab ? `${item.label} (opens in a new tab)` : item.label}
      onMouseEnter={(event) => onTooltipShow?.(tooltipLabel, event)}
      onMouseLeave={onTooltipHide}
      onFocus={(event) => onTooltipShow?.(tooltipLabel, event)}
      onBlur={onTooltipHide}
      onClick={() => {
        onNavigate?.(item.key, { newTab: item.opensInNewTab });
        onItemClick?.();
      }}
    >
      {showIcon ? (
        <span className="smplfy-sidebar-link-icon">
          <AppIcon name={item.icon} size={20} />
          {collapsed && hasBadge ? <span className="smplfy-sidebar-link-dot" /> : null}
        </span>
      ) : null}
      {collapsed && item.initials ? (
        <span className="smplfy-sidebar-child-initials" aria-hidden="true">
          {item.initials}
        </span>
      ) : null}
      <span className="sidebar-link-text">{item.label}</span>
      {hasBadge && !collapsed ? (
        <Badge className="smplfy-sidebar-link-badge" tone="danger" size="small" shape="circle">
          {badgeCounts[item.badgeKey]}
        </Badge>
      ) : null}
      {item.opensInNewTab && !collapsed ? (
        <span className="smplfy-sidebar-link-external" aria-hidden="true">
          <AppIcon name="external-link" size={14} stroke={2} />
        </span>
      ) : null}
      <span className="smplfy-sidebar-link-tooltip" role="tooltip">
        {item.opensInNewTab ? `${item.label} - opens in a new tab` : item.label}
      </span>
    </button>
  );
}

function SidebarFolderItem({
  item,
  activeNav,
  collapsed = false,
  onItemClick,
  onNavigate,
  onTooltipShow,
  onTooltipHide,
  badgeCounts = {},
}) {
  const hasActiveChild = item.children?.some((child) => child.key === activeNav) ?? false;
  const [expanded, setExpanded] = useState(hasActiveChild);

  useEffect(() => {
    if (hasActiveChild) {
      setExpanded(true);
    }
  }, [hasActiveChild]);

  return (
    <div className="smplfy-sidebar-folder">
      <button
        type="button"
        className={`sidebar-link btn text-start smplfy-sidebar-folder-toggle ${hasActiveChild ? 'is-child-active' : ''}`}
        aria-expanded={expanded}
        aria-controls={`${item.key}-children`}
        onMouseEnter={(event) => onTooltipShow?.(item.label, event)}
        onMouseLeave={onTooltipHide}
        onFocus={(event) => onTooltipShow?.(item.label, event)}
        onBlur={onTooltipHide}
        onClick={() => setExpanded((current) => !current)}
      >
        <span className="smplfy-sidebar-link-icon">
          <IconFolder size={20} stroke={1.8} aria-hidden="true" />
        </span>
        <span className="sidebar-link-text">{item.label}</span>
        <span className="smplfy-sidebar-folder-chevron" aria-hidden="true">
          <AppIcon name={expanded ? 'chevron-down' : 'chevron-right'} size={16} stroke={2} />
        </span>
        <span className="smplfy-sidebar-link-tooltip" role="tooltip">
          {item.label}
        </span>
      </button>

      {expanded ? (
        <div className="smplfy-sidebar-folder-children d-grid gap-1" id={`${item.key}-children`}>
          {item.children.map((child) => (
            <SidebarNavButton
              key={child.key}
              item={child}
              activeNav={activeNav}
              collapsed={collapsed}
              onItemClick={onItemClick}
              onNavigate={onNavigate}
              onTooltipShow={onTooltipShow}
              onTooltipHide={onTooltipHide}
              badgeCounts={badgeCounts}
              className="smplfy-sidebar-folder-child"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Sidebar({ activeNav, collapsed = false, onItemClick, onNavigate, badgeCounts = {} }) {
  const [floatingTooltip, setFloatingTooltip] = useState(null);
  const showFloatingTooltip = (label, event) => {
    if (!collapsed) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    setFloatingTooltip({
      label,
      top: rect.top + rect.height / 2,
    });
  };
  const hideFloatingTooltip = () => {
    setFloatingTooltip(null);
  };

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
              {section.items.map((item) =>
                item.type === 'folder' ? (
                  <SidebarFolderItem
                    key={item.key}
                    item={item}
                    activeNav={activeNav}
                    collapsed={collapsed}
                    onItemClick={onItemClick}
                    onNavigate={onNavigate}
                    onTooltipShow={showFloatingTooltip}
                    onTooltipHide={hideFloatingTooltip}
                    badgeCounts={badgeCounts}
                  />
                ) : (
                  <SidebarNavButton
                    key={item.key}
                    item={item}
                    activeNav={activeNav}
                    collapsed={collapsed}
                    onItemClick={onItemClick}
                    onNavigate={onNavigate}
                    onTooltipShow={showFloatingTooltip}
                    onTooltipHide={hideFloatingTooltip}
                    badgeCounts={badgeCounts}
                  />
                ),
              )}
            </div>
          </section>
        ))}
      </div>
      <div className="sidebar-footer border-top">
        <SidebarNavButton
          item={adminHubNavigationItem}
          activeNav={activeNav}
          collapsed={collapsed}
          onItemClick={onItemClick}
          onNavigate={onNavigate}
          onTooltipShow={showFloatingTooltip}
          onTooltipHide={hideFloatingTooltip}
          badgeCounts={badgeCounts}
        />
      </div>
      {collapsed && floatingTooltip ? (
        <span
          className="smplfy-sidebar-floating-tooltip"
          style={{ top: `${floatingTooltip.top}px` }}
          role="tooltip"
        >
          {floatingTooltip.label}
        </span>
      ) : null}
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
                  aria-label="Go to Dashboard"
                  onClick={() => onNavigate?.('dashboard')}
                >
                  <AppIcon name="home" />
                </button>

                {breadcrumbs.length ? <span className="smplfy-header-breadcrumb-divider">{'>'}</span> : null}

                {breadcrumbs.map((crumb, index) => (
                  <div className="smplfy-header-breadcrumb-item" key={`${crumb.label}-${index}`}>
                    {crumb.current ? (
                      <span className="smplfy-header-breadcrumb-text is-current">{crumb.label}</span>
                    ) : (
                      <button
                        className="btn smplfy-header-breadcrumb-text"
                        onClick={() => onNavigate?.(crumb.key)}
                      >
                        {crumb.label}
                      </button>
                    )}

                    {index < breadcrumbs.length - 1 ? (
                      <span className="smplfy-header-breadcrumb-divider">{'>'}</span>
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
              <SecondaryButton
                size="large"
                tone="neutral"
                leftIcon="phone"
                className="header-chip"
              >
                <span className="header-chip-label">+91-6358273804</span>
              </SecondaryButton>
              <SecondaryButton size="large" tone="neutral" className="header-icon" aria-label="Notifications">
                <AppIcon name="bell" />
              </SecondaryButton>
              <SecondaryButton
                size="large"
                tone="neutral"
                leftIcon="user"
                className="header-profile"
                aria-label="User profile"
              >
                Rishabh Gangwar
              </SecondaryButton>
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
  sidebarBadgeCounts = {},
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const requestsForMeSidebarBadgeCount = requestSections.reduce(
    (sum, section) => sum + (section.count ?? 0),
    0,
  );
  const testRequestsSidebarBadgeCount = allTestRequestBuckets.length;
  const resolvedSidebarBadgeCounts = {
    'requests-for-me': requestsForMeSidebarBadgeCount,
    'test-requests-home': testRequestsSidebarBadgeCount,
    ...sidebarBadgeCounts,
  };

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
          badgeCounts={resolvedSidebarBadgeCounts}
        />
      </div>

      <div
        className={`sidebar-shell sidebar-shell-desktop ${sidebarCollapsed ? 'is-collapsed' : ''}`}
      >
        <Sidebar
          activeNav={activeNav}
          collapsed={sidebarCollapsed}
          onNavigate={onNavigate}
          badgeCounts={resolvedSidebarBadgeCounts}
        />
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
