import { useEffect, useMemo, useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import DataTable from '../components/DataTable';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import StatusPill from '../components/StatusPill';
import { ToastNotification } from '../components/FormControls';
import { defaultTrainings, getTrainingStatus } from './TrainingsPage';
import './sample-details-page.scss';
import './training-details-page.scss';

const dayInMs = 24 * 60 * 60 * 1000;

function parseDisplayDate(value) {
  const [day, month, year] = String(value).split('/').map(Number);
  return new Date(year, month - 1, day);
}

function formatDisplayDate(date) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function getDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getCurrentTime() {
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date());
}

function createAttendanceRows(training) {
  const startDate = parseDisplayDate(training.startDate);
  const endDate = parseDisplayDate(training.endDate);
  const totalDays = Math.max(Math.round((endDate - startDate) / dayInMs) + 1, 1);

  return Array.from({ length: totalDays }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    const displayDate = formatDisplayDate(date);
    const record = training.attendanceRecords?.[displayDate] ?? {};

    return {
      id: `${training.id}-day-${index + 1}`,
      day: index + 1,
      date: displayDate,
      dateKey: getDateKey(date),
      checkIn: record.checkIn ?? '',
      checkOut: record.checkOut ?? '',
    };
  });
}

function TrainingDetailsHeader({ training, onBack }) {
  const status = getTrainingStatus(training);

  return (
    <section className="smplfy-sample-details-header bg-white border-bottom">
      <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
        <div className="d-flex align-items-center gap-3 min-w-0">
          <SecondaryButton
            size="medium"
            leftIcon="chevron-left"
            className="px-0 flex-shrink-0"
            aria-label="Go back"
            onClick={onBack}
          />
          <div className="d-flex flex-column min-w-0 gap-1">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <h1 className="h5 mb-0 fw-semibold text-dark text-truncate">{training.name}</h1>
              <StatusPill color={status.color} styleType={status.styleType}>
                {status.label}
              </StatusPill>
            </div>
            <div className="d-inline-flex gap-2 text-secondary fw-medium">
              <span>{training.startDate}</span>
              <span>-</span>
              <span>{training.endDate}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AttendanceCard({ rows, onCheckIn, onCheckOut, onUnavailableCheckIn }) {
  const todayKey = getDateKey(new Date());

  return (
    <section className="smplfy-card card overflow-hidden">
      <div className="card-header bg-white d-flex align-items-center px-3 py-3">
        <h2 className="h6 mb-0 fw-semibold text-dark">Attendance</h2>
      </div>
      <div className="card-body p-3">
        <DataTable className="smplfy-training-attendance-table">
          <thead>
            <tr>
              <th scope="col">Day</th>
              <th scope="col">Date</th>
              <th scope="col">Check-in time</th>
              <th scope="col">Check-out time</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isToday = row.dateKey === todayKey;

              return (
                <tr key={row.id}>
                  <td>{row.day}</td>
                  <td className="text-nowrap">{row.date}</td>
                  <td className="text-nowrap">{row.checkIn || '-'}</td>
                  <td className="text-nowrap">{row.checkOut || '-'}</td>
                  <td className="text-nowrap">
                    {!isToday ? (
                      <span
                        className="d-inline-flex"
                        role="button"
                        tabIndex={0}
                        aria-label={`Check in unavailable for day ${row.day}`}
                        onClick={onUnavailableCheckIn}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            onUnavailableCheckIn();
                          }
                        }}
                      >
                        <PrimaryButton size="medium" disabled>
                          Check in
                        </PrimaryButton>
                      </span>
                    ) : null}
                    {isToday && !row.checkIn ? (
                      <PrimaryButton size="medium" onClick={() => onCheckIn(row.id)}>
                        Check in
                      </PrimaryButton>
                    ) : null}
                    {isToday && row.checkIn && !row.checkOut ? (
                      <PrimaryButton size="medium" onClick={() => onCheckOut(row.id)}>
                        Check out
                      </PrimaryButton>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </DataTable>
      </div>
    </section>
  );
}

function AssessmentsCard({ assessments, onStart }) {
  return (
    <section className="smplfy-card card overflow-hidden">
      <div className="card-header bg-white d-flex align-items-center px-3 py-3">
        <h2 className="h6 mb-0 fw-semibold text-dark">Assessments</h2>
      </div>
      <div className="card-body p-3">
        <DataTable className="smplfy-training-assessment-table">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">From</th>
              <th scope="col">To</th>
              <th scope="col">Status</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {assessments.map((assessment, index) => {
              const isCompleted = assessment.status === 'completed';

              return (
                <tr key={assessment.id}>
                  <td className="fw-semibold">{assessment.name || `Assessment ${index + 1}`}</td>
                  <td className="text-nowrap">{assessment.from}</td>
                  <td className="text-nowrap">{assessment.to}</td>
                  <td>
                    <StatusPill
                      color={isCompleted ? 'green' : 'yellow'}
                      styleType={isCompleted ? 'neutral' : 'strong'}
                    >
                      {isCompleted ? 'Completed' : 'Pending'}
                    </StatusPill>
                  </td>
                  <td className="text-nowrap">
                    {isCompleted ? (
                      <SecondaryButton size="medium" onClick={() => {}}>
                        View result
                      </SecondaryButton>
                    ) : (
                      <PrimaryButton size="medium" onClick={() => onStart(assessment.id)}>
                        Start
                      </PrimaryButton>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </DataTable>
      </div>
    </section>
  );
}

export default function TrainingDetailsPage({
  training = defaultTrainings[0],
  onBack,
  onStartAssessment,
  completedAssessmentIds = [],
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  sidebarBadgeCounts,
}) {
  const initialAttendanceRows = useMemo(() => createAttendanceRows(training), [training]);
  const [attendanceRows, setAttendanceRows] = useState(initialAttendanceRows);
  const [attendanceErrorVisible, setAttendanceErrorVisible] = useState(false);
  const resolvedAssessments = useMemo(() => (training.assessments ?? []).map((assessment) => (
    completedAssessmentIds.includes(assessment.id)
      ? { ...assessment, status: 'completed', scoreAvailable: true }
      : assessment
  )), [completedAssessmentIds, training.assessments]);
  const [assessments, setAssessments] = useState(resolvedAssessments);

  useEffect(() => {
    setAttendanceRows(initialAttendanceRows);
    setAssessments(resolvedAssessments);
  }, [initialAttendanceRows, resolvedAssessments]);

  const updateAttendanceTime = (rowId, field) => {
    setAttendanceRows((currentRows) => currentRows.map((row) => (
      row.id === rowId ? { ...row, [field]: getCurrentTime() } : row
    )));
  };

  return (
    <AppChrome
      activeNav="trainings"
      onNavigate={onNavigate}
      breadcrumbs={[
        { key: 'trainings', label: 'Trainings' },
        { key: 'training-details', label: training.name, current: true },
      ]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      sidebarBadgeCounts={sidebarBadgeCounts}
      pageHeader={<TrainingDetailsHeader training={training} onBack={onBack} />}
    >
      <main className="smplfy-sample-details-page bg-body-tertiary p-4 min-vh-100">
        <div
          className="container-fluid px-0 d-flex flex-column gap-3"
          style={{ maxWidth: 'max-content' }}
        >
          <AttendanceCard
            rows={attendanceRows}
            onCheckIn={(rowId) => updateAttendanceTime(rowId, 'checkIn')}
            onCheckOut={(rowId) => updateAttendanceTime(rowId, 'checkOut')}
            onUnavailableCheckIn={() => setAttendanceErrorVisible(true)}
          />
          {assessments.length ? (
            <AssessmentsCard assessments={assessments} onStart={onStartAssessment} />
          ) : null}
        </div>
      </main>

      <ToastNotification
        state={attendanceErrorVisible ? 'default' : 'gone'}
        tone="error"
        message="Check-in is only available for today's training session."
        className="position-fixed bottom-0 start-0 m-4"
        onClose={() => setAttendanceErrorVisible(false)}
      />
    </AppChrome>
  );
}
