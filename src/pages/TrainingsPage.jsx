import AppChrome from '../components/AppChrome/AppChrome';
import DataTable from '../components/DataTable';
import SecondaryButton from '../components/SecondaryButton';

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
    <section className="bg-white border-bottom px-4 py-3">
      <div className="container-fluid px-0">
        <div className="row align-items-center gx-0">
          <div className="col-auto">
            <h1 className="h5 mb-0 fw-semibold text-dark">Trainings</h1>
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
      <main className="bg-body-tertiary p-4 min-vh-100">
        <div className="container-fluid px-0">
          <DataTable>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Description</th>
                <th scope="col">Start Date</th>
                <th scope="col">End Date</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {trainings.map((training) => (
                <tr key={training.id}>
                  <td>
                    <span className="text-primary fw-semibold">{training.name}</span>
                  </td>
                  <td>
                    {training.description}
                  </td>
                  <td className="text-nowrap">
                    {training.startDate}
                  </td>
                  <td className="text-nowrap">
                    {training.endDate}
                  </td>
                  <td className="text-nowrap">
                    <SecondaryButton
                      size="medium"
                      leftIcon="external-link"
                      onClick={() => onOpenAttendance?.(training.id, training.name)}
                    >
                      View
                    </SecondaryButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        </div>
      </main>
    </AppChrome>
  );
}
