import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IconDeviceLaptop, IconRefresh } from '@tabler/icons-react';
import { useLims } from '../store/LimsStore';
import { useTour } from '../tour/TourProvider';
import { FabTracker, SidebarTracker } from '../tour/ProgressTracker';
import { cx, labNameOf } from '../lib/format';
import { useViewportWidth } from '../lib/hooks';
import { Header, Sidebar } from './Shell';
import { Button, Modal, Toast } from './components/ui';
import { DashboardPage } from './pages/DashboardPage';
import { InwardsPage } from './pages/InwardsPage';
import { NewInwardPage } from './pages/NewInwardPage';
import { InwardDetailsPage } from './pages/InwardDetailsPage';
import { TestRequestsPage } from './pages/TestRequestsPage';

function breadcrumbsFor(nav) {
  switch (nav.page) {
    case 'inwards':
      return [{ label: 'All inwards' }];
    case 'new-inward':
      return [{ label: 'All inwards', page: 'inwards' }, { label: 'New Inward' }];
    case 'inward-details':
      return [{ label: 'All inwards', page: 'inwards' }, { label: nav.params?.inwardId ?? 'Inward' }];
    case 'test-requests':
      return [{ label: 'Test Requests' }];
    default:
      return [];
  }
}

export function SmallScreenNotice({ onContinue }) {
  return (
    <div className="sgt-small-screen" role="dialog" aria-modal="true" aria-labelledby="sgt-small-title">
      <div className="sgt-small-screen__card">
        <IconDeviceLaptop size={32} stroke={1.6} aria-hidden="true" />
        <h2 id="sgt-small-title">Best on a bigger screen</h2>
        <p>The tour runs a full LIMS workspace with tables and side panels. Open this page on a laptop or desktop for the best experience.</p>
        <button type="button" className="sgt-btn sgt-btn--brand sgt-btn--block" onClick={onContinue}>
          Continue anyway
        </button>
      </div>
    </div>
  );
}

export function LimsApp({ profile, supportPhone, trackerPlacement, onStartOver, inert = false }) {
  const { state, pack, dispatch, actions } = useLims();
  const tour = useTour();
  const [confirmStartOver, setConfirmStartOver] = useState(false);
  // Below laptop width the sidebar stays as an icon rail so the work area keeps its room.
  const narrow = useViewportWidth() < 1024;
  const collapsed = state.ui.sidebarCollapsed || narrow;
  const page = state.nav.page;
  const pendingTrs = useMemo(() => state.data.trs.filter((tr) => tr.status === 'not_allocated').length, [state.data.trs]);
  const labName = labNameOf(profile);
  const appRef = useRef(null);

  // `inert` as a DOM property works the same on React 18 and 19.
  useEffect(() => {
    if (appRef.current) appRef.current.inert = inert;
  }, [inert]);

  const hideToast = useCallback((id) => dispatch({ type: 'toast/hide', payload: { id } }), [dispatch]);
  const notImplemented = (feature) =>
    dispatch({ type: 'toast/show', payload: { message: `${feature} are part of the full Sampleify product.` } });

  let content = null;
  if (page === 'inwards') content = <InwardsPage />;
  else if (page === 'new-inward') content = <NewInwardPage />;
  else if (page === 'inward-details') content = <InwardDetailsPage />;
  else if (page === 'test-requests') content = <TestRequestsPage />;
  else content = <DashboardPage profile={profile} visible={!inert} />;

  return (
    <div ref={appRef} className={cx('sgt-app', collapsed && 'is-collapsed')} aria-hidden={inert || undefined}>
      <Sidebar
        page={page}
        collapsed={collapsed}
        labName={labName}
        labTag={pack.tag}
        badges={{ pendingTrs }}
        onNavigate={(key) => actions.navigate(key, key === 'test-requests' ? { tab: state.ui.trTab } : {})}
        tracker={trackerPlacement === 'sidebar' ? <SidebarTracker collapsed={collapsed} /> : null}
      />
      <div className="sgt-main">
        <Header
          breadcrumbs={breadcrumbsFor(state.nav)}
          profile={profile}
          supportPhone={supportPhone}
          collapsed={collapsed}
          onToggleSidebar={() => dispatch({ type: 'ui/patch', payload: { sidebarCollapsed: !collapsed } })}
          onNavigate={(key) => actions.navigate(key)}
          onRestartTour={tour.actions.restart}
          onStartOver={() => setConfirmStartOver(true)}
          onNotImplemented={notImplemented}
        />
        <div className="sgt-page" key={page === 'inward-details' ? `${page}-${state.nav.params?.inwardId}` : page}>
          {content}
        </div>
      </div>

      <Toast toast={state.ui.toast} onClose={hideToast} />
      {trackerPlacement === 'fab' ? <FabTracker /> : null}

      <Modal
        open={confirmStartOver}
        width={464}
        icon={IconRefresh}
        title="Start over?"
        onClose={() => setConfirmStartOver(false)}
        footer={(
          <div className="sgt-modal__footer">
            <Button variant="secondary" onClick={() => setConfirmStartOver(false)}>
              Cancel
            </Button>
            <Button
              data-autofocus
              onClick={() => {
                setConfirmStartOver(false);
                onStartOver();
              }}
            >
              Start over
            </Button>
          </div>
        )}
      >
        <div className="sgt-modal__body">
          This clears your name, number, tour progress and everything you created in this demo, then takes you back to the welcome screen.
        </div>
      </Modal>
    </div>
  );
}
