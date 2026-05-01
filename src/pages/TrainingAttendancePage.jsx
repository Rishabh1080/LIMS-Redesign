import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import SecondaryButton from '../components/SecondaryButton';
import './training-attendance-page.css';

const defaultAttendanceRows = [
  { id: 'attendance-001', date: '05/04/2026', inTime: '09:30 AM', outTime: '11:00 AM' },
  { id: 'attendance-002', date: '05/04/2026', inTime: '02:00 PM', outTime: '04:00 PM' },
  { id: 'attendance-003', date: '06/04/2026', inTime: '09:45 AM', outTime: '11:15 AM' },
  { id: 'attendance-004', date: '06/04/2026', inTime: '01:30 PM', outTime: '03:00 PM' },
  { id: 'attendance-005', date: '07/04/2026', inTime: '10:00 AM', outTime: '12:00 PM' },
];

function AttendanceHeader({ title, onBack }) {
  return (
    <section className="training-attendance-page-header">
      <div className="training-attendance-page-header__title-wrap">
        <SecondaryButton
          size="medium"
          className="training-attendance-page-header__back"
          aria-label="Go back"
          onClick={onBack}
        >
          <AppIcon name="chevron-left" />
        </SecondaryButton>
        <div className="training-attendance-page-header__copy">
          <h1>{title}</h1>
          <p>Attendance Schedule</p>
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
      <main className="training-attendance-page">
        <div className="container-fluid px-0">
          <section className="training-attendance-listing">
            <div className="training-attendance-listing__legend training-attendance-listing__grid">
              <div className="training-attendance-listing__cell training-attendance-listing__cell--sr">Sr No.</div>
              <div className="training-attendance-listing__cell training-attendance-listing__cell--date">Date</div>
              <div className="training-attendance-listing__cell training-attendance-listing__cell--in-time">In Time</div>
              <div className="training-attendance-listing__cell training-attendance-listing__cell--out-time">Out Time</div>
              <div className="training-attendance-listing__cell training-attendance-listing__cell--actions">Action</div>
            </div>

            <div className="training-attendance-listing__rows">
              {attendanceRows.map((row, index) => (
                <article className="training-attendance-listing__row training-attendance-listing__grid" key={row.id}>
                  <div className="training-attendance-listing__cell training-attendance-listing__cell--sr">{index + 1}</div>
                  <div className="training-attendance-listing__cell training-attendance-listing__cell--date">{row.date}</div>
                  <div className="training-attendance-listing__cell training-attendance-listing__cell--in-time">{row.inTime}</div>
                  <div className="training-attendance-listing__cell training-attendance-listing__cell--out-time">{row.outTime}</div>
                  <div className="training-attendance-listing__cell training-attendance-listing__cell--actions training-attendance-listing__actions">
                    <SecondaryButton size="medium" leftIcon="check">
                      Mark Attendance
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
