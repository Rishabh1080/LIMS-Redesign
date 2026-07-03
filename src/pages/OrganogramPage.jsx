import { useCallback, useRef } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import SmplfyOrganogram from '../components/Organogram';
import './organogram-page.scss';

const organogramData = {
  id: 'ceo',
  name: 'Amit Mehra',
  role: 'CEO',
  children: [
    {
      id: 'quality_manager',
      name: 'Neha Sharma',
      role: 'Quality Manager',
      children: [],
    },
    {
      id: 'technical_manager',
      name: 'Rahul Verma',
      role: 'Technical Manager',
      children: [
        {
          id: 'senior_analyst_1',
          name: 'Priya Nair',
          role: 'Senior Analyst',
          children: [],
        },
        {
          id: 'analyst_1',
          name: 'Karan Gupta',
          role: 'Chemical Analyst',
          children: [],
        },
        {
          id: 'analyst_2',
          name: 'Ananya Singh',
          role: 'Microbiology Analyst',
          children: [],
        },
        {
          id: 'analyst_3',
          name: 'Rohit Bansal',
          role: 'Instrument Analyst',
          children: [],
        },
        {
          id: 'lab_technician',
          name: 'Mehul Shah',
          role: 'Lab Technician',
          children: [],
        },
      ],
    },
  ],
};

function OrganogramHeader() {
  return (
    <section className="bg-white border-bottom px-4 py-3">
      <div className="container-fluid px-0">
        <div className="row align-items-center gx-0">
          <div className="col-auto">
            <h1 className="h5 mb-0 fw-semibold text-dark">Organogram</h1>
          </div>
        </div>
      </div>
    </section>
  );
}

function OrganogramChart() {
  const organogramRef = useRef(null);

  const handleZoomIn = useCallback(() => {
    organogramRef.current?.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    organogramRef.current?.zoomOut();
  }, []);

  const handleFit = useCallback(() => {
    organogramRef.current?.fitScreen();
  }, []);

  const handleDownload = useCallback(() => {
    organogramRef.current?.download();
  }, []);

  return (
    <div className="smplfy-organogram-chart-scroll">
      <div
        className="position-absolute top-0 end-0 m-3 d-flex align-items-center gap-2"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="smplfy-btn btn btn-outline-secondary btn-sm p-0 d-inline-flex align-items-center justify-content-center smplfy-organogram-control-btn"
          aria-label="Zoom in"
          onClick={handleZoomIn}
        >
          <AppIcon name="zoom-in" size={16} />
        </button>
        <button
          type="button"
          className="smplfy-btn btn btn-outline-secondary btn-sm p-0 d-inline-flex align-items-center justify-content-center smplfy-organogram-control-btn"
          aria-label="Zoom out"
          onClick={handleZoomOut}
        >
          <AppIcon name="zoom-out" size={16} />
        </button>
        <button
          type="button"
          className="smplfy-btn btn btn-outline-secondary btn-sm p-0 d-inline-flex align-items-center justify-content-center smplfy-organogram-control-btn"
          aria-label="Zoom to fit"
          onClick={handleFit}
        >
          <AppIcon name="arrows-maximize" size={16} />
        </button>
        <button
          type="button"
          className="smplfy-btn btn btn-outline-secondary btn-sm p-0 d-inline-flex align-items-center justify-content-center smplfy-organogram-control-btn"
          aria-label="Download organogram"
          onClick={handleDownload}
        >
          <AppIcon name="download" size={16} />
        </button>
      </div>
      <SmplfyOrganogram
        ref={organogramRef}
        data={organogramData}
        ariaLabel="Company organogram"
      />
    </div>
  );
}

export default function OrganogramPage({
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  sidebarBadgeCounts,
}) {
  return (
    <AppChrome
      activeNav="organogram"
      onNavigate={onNavigate}
      breadcrumbs={[{ key: 'organogram', label: 'Organogram', current: true }]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      sidebarBadgeCounts={sidebarBadgeCounts}
      pageHeader={<OrganogramHeader />}
    >
      <main className="smplfy-organogram-page bg-white">
        <OrganogramChart />
      </main>
    </AppChrome>
  );
}
