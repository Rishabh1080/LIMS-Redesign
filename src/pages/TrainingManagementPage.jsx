import AppChrome from '../components/AppChrome/AppChrome';
import DataTable from '../components/DataTable';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import StatusPill from '../components/StatusPill';
import { defaultTrainings } from './TrainingsPage';

function parseDisplayDate(value) {
  const [day, month, year] = String(value).split('/').map(Number);
  return new Date(year, month - 1, day);
}

export function getManagedTrainingStatus(training) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = parseDisplayDate(training.startDate);
  const endDate = parseDisplayDate(training.endDate);

  if (today < startDate) {
    return { label: 'Upcoming', color: 'yellow', styleType: 'neutral' };
  }

  if (today <= endDate) {
    return { label: 'Ongoing', color: 'green', styleType: 'strong' };
  }

  return { label: 'Completed', color: 'green', styleType: 'neutral' };
}

function TrainingManagementHeader({ onCreate }) {
  return (
    <section className="bg-white border-bottom px-4 py-3">
      <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
        <h1 className="h5 mb-0 fw-semibold text-dark">Training &amp; Assessment Management</h1>
        <PrimaryButton leftIcon="plus" onClick={onCreate}>
          New Training
        </PrimaryButton>
      </div>
    </section>
  );
}

export default function TrainingManagementPage({
  trainings = defaultTrainings,
  onOpenTraining,
  onDeleteTraining,
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  sidebarBadgeCounts,
}) {
  return (
    <AppChrome
      activeNav="design-handoff"
      onNavigate={onNavigate}
      breadcrumbs={[
        { key: 'design-handoff', label: 'Design Handoff' },
        { key: 'training-management', label: 'Training & Assessment Management', current: true },
      ]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      sidebarBadgeCounts={sidebarBadgeCounts}
      pageHeader={<TrainingManagementHeader onCreate={() => {}} />}
    >
      <main className="bg-body-tertiary p-4 min-vh-100">
        <div className="container-fluid px-0">
          <DataTable>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Training period</th>
                <th scope="col">Status</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {trainings.map((training) => {
                const status = getManagedTrainingStatus(training);

                return (
                  <tr key={training.id}>
                    <td className="fw-semibold">{training.name}</td>
                    <td className="text-nowrap">{training.startDate} - {training.endDate}</td>
                    <td>
                      <StatusPill color={status.color} styleType={status.styleType}>
                        {status.label}
                      </StatusPill>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2 text-nowrap">
                        <SecondaryButton
                          size="medium"
                          leftIcon="external-link"
                          onClick={() => onOpenTraining?.(training.id)}
                        >
                          View
                        </SecondaryButton>
                        <SecondaryButton size="medium" leftIcon="edit" onClick={() => {}}>
                          Edit
                        </SecondaryButton>
                        <SecondaryButton
                          size="medium"
                          tone="destructive"
                          leftIcon="trash"
                          onClick={() => onDeleteTraining?.(training.id)}
                        >
                          Delete
                        </SecondaryButton>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </DataTable>
        </div>
      </main>
    </AppChrome>
  );
}
