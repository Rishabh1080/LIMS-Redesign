import { useEffect, useRef, useState } from 'react';
import {
  IconActivity,
  IconBell,
  IconBuildingWarehouse,
  IconChevronDown,
  IconChevronRight,
  IconClipboardList,
  IconHome,
  IconMenu2,
  IconPhone,
  IconRefresh,
  IconRotateClockwise2,
  IconUser,
} from '@tabler/icons-react';
import { logoSrc as logo } from '../assets';
import { cx, firstName, formatIndianMobile } from '../lib/format';

const navSections = [
  {
    title: 'Home',
    items: [{ key: 'dashboard', label: 'Dashboard', icon: IconHome, tour: 'nav-dashboard' }],
  },
  {
    title: 'LIMS',
    items: [
      { key: 'test-requests', label: 'Test Requests', icon: IconClipboardList, tour: 'nav-test-requests', badgeKey: 'pendingTrs' },
      { key: 'inwards', label: 'All inwards', icon: IconBuildingWarehouse, tour: 'nav-inwards' },
    ],
  },
];

const activeNavByPage = {
  dashboard: 'dashboard',
  inwards: 'inwards',
  'new-inward': 'inwards',
  'inward-details': 'inwards',
  'test-requests': 'test-requests',
};

export function Sidebar({ page, collapsed, labName, labTag, badges = {}, onNavigate, tracker }) {
  const activeKey = activeNavByPage[page];

  return (
    <aside className={cx('sgt-sidebar', collapsed && 'is-collapsed')} aria-label="Sidebar">
      <div className="sgt-sidebar__brand">
        <span className="sgt-sidebar__logo-wrap">
          <img className="sgt-sidebar__logo" src={logo} alt="" />
        </span>
        <div className="sgt-sidebar__brand-copy">
          <div className="sgt-sidebar__brand-name" title={labName}>{labName}</div>
          <div className="sgt-sidebar__brand-sub">{labTag} · Demo</div>
        </div>
      </div>

      <nav className="sgt-sidebar__nav" aria-label="Main" data-tour="sidebar-nav">
        {navSections.map((section) => (
          <section className="sgt-sidebar__section" key={section.title}>
            <h2 className="sgt-sidebar__label">{section.title}</h2>
            <ul className="sgt-sidebar__list">
              {section.items.map((item) => {
                const Icon = item.icon;
                const badge = item.badgeKey ? badges[item.badgeKey] : 0;
                const active = activeKey === item.key;
                return (
                  <li key={item.key}>
                    <button
                      type="button"
                      className={cx('sgt-sidebar__link', active && 'is-active')}
                      aria-current={active ? 'page' : undefined}
                      data-tour={item.tour}
                      title={collapsed ? item.label : undefined}
                      onClick={() => onNavigate(item.key)}
                    >
                      <span className="sgt-sidebar__icon">
                        <Icon size={20} stroke={1.8} aria-hidden="true" />
                        {badge ? <span className="sgt-sidebar__dot" aria-hidden="true" /> : null}
                      </span>
                      <span className="sgt-sidebar__text">{item.label}</span>
                      {badge ? (
                        <span className="sgt-count-badge sgt-sidebar__badge" aria-label={`${badge} pending`}>
                          {badge}
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </nav>

      {tracker}
    </aside>
  );
}

function ProfileMenu({ profile, onRestartTour, onStartOver }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const handle = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const handleKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handle);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div className="sgt-profile" ref={rootRef}>
      <button
        type="button"
        className="sgt-btn sgt-btn--neutral sgt-btn--icon-left sgt-profile__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <IconUser size={18} stroke={1.9} aria-hidden="true" />
        <span className="sgt-profile__name">{profile.name}</span>
        <IconChevronDown size={16} stroke={2} aria-hidden="true" />
      </button>
      {open ? (
        <div className="sgt-menu" role="menu">
          <div className="sgt-menu__header">
            <div className="sgt-menu__title">{profile.name}</div>
            <div className="sgt-menu__sub">+91 {formatIndianMobile(profile.phone)} · Verified</div>
          </div>
          <button
            type="button"
            role="menuitem"
            className="sgt-menu__item"
            onClick={() => {
              setOpen(false);
              onRestartTour();
            }}
          >
            <IconRotateClockwise2 size={16} stroke={1.9} aria-hidden="true" />
            Restart guided tour
          </button>
          <button
            type="button"
            role="menuitem"
            className="sgt-menu__item sgt-menu__item--danger"
            onClick={() => {
              setOpen(false);
              onStartOver();
            }}
          >
            <IconRefresh size={16} stroke={1.9} aria-hidden="true" />
            Start over from the beginning
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function Header({ breadcrumbs, profile, supportPhone, collapsed, onToggleSidebar, onNavigate, onRestartTour, onStartOver, onNotImplemented }) {
  return (
    <header className="sgt-header">
      <div className="sgt-header__left">
        <button
          type="button"
          className="sgt-header__toggle"
          aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
          aria-expanded={!collapsed}
          onClick={onToggleSidebar}
        >
          <IconMenu2 size={20} stroke={1.8} />
        </button>
        <nav className="sgt-breadcrumbs" aria-label="Breadcrumb">
          <button type="button" className="sgt-breadcrumbs__home" aria-label="Go to Dashboard" onClick={() => onNavigate('dashboard')}>
            <IconHome size={18} stroke={1.8} />
          </button>
          {breadcrumbs.map((crumb, index) => (
            <span className="sgt-breadcrumbs__item" key={`${crumb.label}-${index}`}>
              <IconChevronRight size={14} stroke={2} className="sgt-breadcrumbs__divider" aria-hidden="true" />
              {crumb.page ? (
                <button type="button" className="sgt-breadcrumbs__link" onClick={() => onNavigate(crumb.page)}>
                  {crumb.label}
                </button>
              ) : (
                <span className="sgt-breadcrumbs__current" aria-current="page">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>

      <div className="sgt-header__right">
        <span className="sgt-header__alerts">
          <IconActivity size={18} stroke={1.9} aria-hidden="true" />
          <span>No Active Alerts</span>
        </span>
        <span className="sgt-header__chip">
          <IconPhone size={18} stroke={1.8} aria-hidden="true" />
          <span>{supportPhone}</span>
        </span>
        <button
          type="button"
          className="sgt-btn sgt-btn--neutral sgt-btn--square"
          aria-label="Notifications"
          onClick={() => onNotImplemented('Notifications')}
        >
          <IconBell size={18} stroke={1.8} />
        </button>
        <ProfileMenu profile={{ ...profile, name: profile.name || firstName(profile.name) }} onRestartTour={onRestartTour} onStartOver={onStartOver} />
      </div>
    </header>
  );
}
