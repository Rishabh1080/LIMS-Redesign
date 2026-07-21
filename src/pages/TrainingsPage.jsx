import AppChrome from '../components/AppChrome/AppChrome';
import DataTable from '../components/DataTable';
import SecondaryButton from '../components/SecondaryButton';
import StatusPill from '../components/StatusPill';

export const defaultTrainings = [
  {
    id: 'training-001',
    name: 'GLP Training',
    description: 'Foundational training covering laboratory safety, documentation expectations, and good laboratory practices.',
    startDate: '17/07/2026',
    endDate: '20/07/2026',
    attendanceDates: ['17/07/2026', '18/07/2026', '19/07/2026'],
    attendanceRecords: {
      '17/07/2026': { checkIn: '09:24 AM', checkOut: '05:36 PM' },
      '18/07/2026': { checkIn: '09:18 AM', checkOut: '05:42 PM' },
      '19/07/2026': { checkIn: '09:31 AM', checkOut: '04:58 PM' },
    },
    assessments: [
      {
        id: 'assessment-001',
        name: 'Assessment 1',
        from: '17/07/2026',
        to: '19/07/2026',
        status: 'completed',
        scoreAvailable: true,
      },
      {
        id: 'assessment-001-b',
        name: 'Assessment 2',
        from: '18/07/2026',
        to: '21/07/2026',
        status: 'pending',
        scoreAvailable: false,
      },
      {
        id: 'assessment-001-c',
        name: 'Assessment 3',
        from: '19/07/2026',
        to: '22/07/2026',
        status: 'pending',
        scoreAvailable: false,
      },
      {
        id: 'assessment-001-d',
        name: 'Assessment 4',
        from: '20/07/2026',
        to: '23/07/2026',
        status: 'pending',
        scoreAvailable: false,
      },
    ],
  },
  {
    id: 'training-002',
    name: 'Instrument Calibration Basics',
    description: 'Introductory session on calibration workflows, traceability records, and preventive maintenance checkpoints.',
    startDate: '11/04/2026',
    endDate: '12/04/2026',
    attendanceDates: ['11/04/2026'],
    assessments: [
      {
        id: 'assessment-002',
        name: 'Assessment 1',
        from: '11/04/2026',
        to: '14/04/2026',
        status: 'pending',
        scoreAvailable: false,
      },
    ],
  },
  {
    id: 'training-003',
    name: 'Sample Handling & Storage',
    description: 'Covers receipt, labeling, chain of custody, and storage requirements for incoming samples.',
    startDate: '15/04/2026',
    endDate: '15/04/2026',
    attendanceDates: [],
    assessments: [],
  },
  {
    id: 'training-004',
    name: 'Quality Documentation Review',
    description: 'Workshop on maintaining audit-ready records, controlled formats, and review checkpoints.',
    startDate: '16/07/2026',
    endDate: '18/07/2026',
    attendanceDates: ['16/07/2026', '17/07/2026', '18/07/2026'],
    attendanceRecords: {
      '16/07/2026': { checkIn: '09:16 AM', checkOut: '05:28 PM' },
      '17/07/2026': { checkIn: '09:24 AM', checkOut: '05:36 PM' },
      '18/07/2026': { checkIn: '09:18 AM', checkOut: '05:42 PM' },
    },
    assessments: [
      {
        id: 'assessment-003',
        name: 'Assessment 1',
        from: '18/07/2026',
        to: '21/07/2026',
        status: 'pending',
        scoreAvailable: false,
      },
      {
        id: 'assessment-004',
        name: 'Assessment 2',
        from: '17/07/2026',
        to: '19/07/2026',
        status: 'completed',
        scoreAvailable: true,
      },
    ],
  },
  {
    id: 'training-005',
    name: 'Method Validation Refresher',
    description: 'Refresher module for accuracy, precision, linearity, and routine documentation of validation evidence.',
    startDate: '24/07/2026',
    endDate: '25/07/2026',
    attendanceDates: [],
    assessments: [],
  },
];

function parseDate(dateValue) {
  const [day, month, year] = String(dateValue).split('/').map(Number);
  return new Date(year, month - 1, day);
}

function startOfDay(dateValue) {
  const date = new Date(dateValue);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getInclusiveDayCount(startDate, endDate) {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  const dayInMs = 24 * 60 * 60 * 1000;
  return Math.max(Math.round((end - start) / dayInMs) + 1, 1);
}

export function getTrainingStatus(training) {
  const today = startOfDay(new Date());
  const startDate = parseDate(training.startDate);
  const endDate = parseDate(training.endDate);

  if (today < startDate) {
    return { label: 'Upcoming', color: 'yellow', styleType: 'neutral' };
  }

  if (today >= startDate && today <= endDate) {
    return { label: 'Ongoing', color: 'green', styleType: 'strong' };
  }

  const attendanceCount = training.attendanceDates?.length ?? 0;
  const expectedAttendanceCount = getInclusiveDayCount(training.startDate, training.endDate);

  if (attendanceCount === 0) {
    return { label: 'Missed', color: 'red', styleType: 'neutral' };
  }

  if (attendanceCount < expectedAttendanceCount) {
    return { label: 'Partially complete', color: 'orange', styleType: 'neutral' };
  }

  return { label: 'Complete', color: 'green', styleType: 'neutral' };
}

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
  onOpenTraining,
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
                <th scope="col">Title</th>
                <th scope="col">Status</th>
                <th scope="col">Start Date</th>
                <th scope="col">End Date</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {trainings.map((training) => {
                const status = getTrainingStatus(training);

                return (
                  <tr key={training.id}>
                    <td>
                      <a
                        href={`#${training.id}`}
                        className="link-primary fw-semibold text-decoration-none"
                        onClick={(event) => {
                          event.preventDefault();
                          onOpenTraining?.(training.id);
                        }}
                      >
                        {training.name}
                      </a>
                    </td>
                    <td>
                      <StatusPill color={status.color} styleType={status.styleType}>
                        {status.label}
                      </StatusPill>
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
                        onClick={() => onOpenTraining?.(training.id)}
                      >
                        View
                      </SecondaryButton>
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
