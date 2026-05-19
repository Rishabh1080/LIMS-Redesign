import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import DataTable from '../components/DataTable';
import SecondaryButton from '../components/SecondaryButton';

const defaultAttendanceRows = [
  { id: 'attendance-001', date: '05/04/2026', inTime: '09:30 AM', outTime: '11:00 AM' },
  { id: 'attendance-002', date: '05/04/2026', inTime: '02:00 PM', outTime: '04:00 PM' },
  { id: 'attendance-003', date: '06/04/2026', inTime: '09:45 AM', outTime: '11:15 AM' },
  { id: 'attendance-004', date: '06/04/2026', inTime: '01:30 PM', outTime: '03:00 PM' },
  { id: 'attendance-005', date: '07/04/2026', inTime: '10:00 AM', outTime: '12:00 PM' },
];

function AttendanceHeader({ title, onBack }) {
  return (
    <section className="bg-white border-bottom d-flex align-items-center justify-content-between px-4 py-3">
      <div className="d-flex align-items-start gap-3">
        <SecondaryButton
          size="medium"
          className="p-0 flex-shrink-0"
          aria-label="Go back"
          onClick={onBack}
        >
          <AppIcon name="chevron-left" />
        </SecondaryButton>
        <div className="d-flex flex-column gap-2">
          <h1 className="h5 mb-0 fw-semibold text-dark">{title}</h1>
          <p className="mb-0 text-secondary fw-medium">Attendance Schedule</p>
        </div>
      </div>
    </section>
  );
}

export default function TrainingAttendancePage({
  trainingName = 'Training',
  attendanceRows = defaultAttendanceRows,
  onBack,
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  sidebarBadgeCounts,
}) {
  return (
    <AppChrome
      activeNav="trainings"
      onNavigate={onNavigate}
      breadcrumbs={[
        { key: 'trainings', label: 'Trainings' },
        { key: 'training-attendance', label: trainingName, current: true },
      ]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      sidebarBadgeCounts={sidebarBadgeCounts}
      pageHeader={<AttendanceHeader title={trainingName} onBack={onBack} />}
    >
      <main className="bg-body-tertiary p-4 min-vh-100">
        <div className="container-fluid px-0">
          <DataTable>
            <thead>
              <tr>
                <th scope="col">Sr No.</th>
                <th scope="col">Date</th>
                <th scope="col">In Time</th>
                <th scope="col">Out Time</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRows.map((row, index) => (
                <tr key={row.id}>
                  <td>{index + 1}</td>
                  <td>{row.date}</td>
                  <td>{row.inTime}</td>
                  <td>{row.outTime}</td>
                  <td>
                    <SecondaryButton size="medium" leftIcon="check">
                      Mark Attendance
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
