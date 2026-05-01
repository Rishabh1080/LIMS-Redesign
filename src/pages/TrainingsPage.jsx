import AppChrome from '../components/AppChrome/AppChrome';
import SecondaryButton from '../components/SecondaryButton';
import './trainings-page.css';

export const defaultTrainings = [
  {
    id: 'training-001',
    name: 'GLP Induction',
    description: 'Foundational training covering laboratory safety, documentation expectations, and good laboratory practices.',
    startDate: '05/04/2026',
    endDate: '06/04/2026',
  },
  {
    id: 'training-002',
    name: 'Instrument Calibration Basics',
    description: 'Introductory session on calibration workflows, traceability records, and preventive maintenance checkpoints.',
    startDate: '11/04/2026',
    endDate: '12/04/2026',
  },
  {
    id: 'training-003',
    name: 'Sample Handling & Storage',
    description: 'Covers receipt, labeling, chain of custody, and storage requirements for incoming samples.',
    startDate: '15/04/2026',
    endDate: '15/04/2026',
  },
  {
    id: 'training-004',
    name: 'Quality Documentation Review',
    description: 'Workshop on maintaining audit-ready records, controlled formats, and review checkpoints.',
    startDate: '19/04/2026',
    endDate: '20/04/2026',
  },
  {
    id: 'training-005',
    name: 'Method Validation Refresher',
    description: 'Refresher module for accuracy, precision, linearity, and routine documentation of validation evidence.',
    startDate: '24/04/2026',
    endDate: '25/04/2026',
  },
];

function TrainingsHeader() {
  return (
    <section className="trainings-page-header">
      <div className="container-fluid h-100 px-0">
        <div className="row h-100 align-items-center gx-0">
          <div className="col-auto">
            <h1 className="trainings-page-header__title">Trainings</h1>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function TrainingsPage({
  trainings = defaultTrainings,
  onOpenAttendance,
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  sidebarBadgeCounts,
}) {
  return (
    <AppChrome
      activeNav="trainings"
      onNavigate={onNavigate}
      breadcrumbs={[{ key: 'trainings', label: 'Trainings', current: true }]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      sidebarBadgeCounts={sidebarBadgeCounts}
      pageHeader={<TrainingsHeader />}
    >
      <main className="trainings-page">
        <div className="container-fluid px-0">
          <section className="trainings-listing">
            <div className="trainings-listing__legend trainings-listing__grid">
              <div className="trainings-listing__cell trainings-listing__cell--name">Name</div>
              <div className="trainings-listing__cell trainings-listing__cell--description">Description</div>
              <div className="trainings-listing__cell trainings-listing__cell--start-date">Start Date</div>
              <div className="trainings-listing__cell trainings-listing__cell--end-date">End Date</div>
              <div className="trainings-listing__cell trainings-listing__cell--actions">Actions</div>
            </div>

            <div className="trainings-listing__rows">
              {trainings.map((training) => (
                <article className="trainings-listing__row trainings-listing__grid" key={training.id}>
                  <div className="trainings-listing__cell trainings-listing__cell--name">
                    <span className="trainings-listing__name">{training.name}</span>
                  </div>
                  <div className="trainings-listing__cell trainings-listing__cell--description">
                    {training.description}
                  </div>
                  <div className="trainings-listing__cell trainings-listing__cell--start-date">
                    {training.startDate}
                  </div>
                  <div className="trainings-listing__cell trainings-listing__cell--end-date">
                    {training.endDate}
                  </div>
                  <div className="trainings-listing__cell trainings-listing__cell--actions trainings-listing__actions">
                    <SecondaryButton
                      size="medium"
                      leftIcon="external-link"
                      onClick={() => onOpenAttendance?.(training.id, training.name)}
                    >
                      View
                    </SecondaryButton>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
    </AppChrome>
  );
}
