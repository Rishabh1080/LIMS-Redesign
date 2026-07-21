import { useEffect, useMemo, useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import DataTable from '../components/DataTable';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import StatusPill from '../components/StatusPill';
import { defaultTrainings } from './TrainingsPage';
import { getManagedTrainingStatus } from './TrainingManagementPage';
import './sample-details-page.scss';
import './admin-training-details-page.scss';

const attendees = [
  { id: 'attendee-1', name: 'Aditi Rao' },
  { id: 'attendee-2', name: 'Karan Mehta' },
  { id: 'attendee-3', name: 'Neha Sharma' },
  { id: 'attendee-4', name: 'Vikram Singh' },
  { id: 'attendee-5', name: 'Pooja Nair' },
];

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

function createTrainingDays(training) {
  const startDate = parseDisplayDate(training.startDate);
  const endDate = parseDisplayDate(training.endDate);
  const totalDays = Math.max(Math.round((endDate - startDate) / dayInMs) + 1, 1);

  return Array.from({ length: totalDays }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);

    return {
      value: formatDisplayDate(date),
      label: `Day ${index + 1}: ${formatDisplayDate(date)}`,
    };
  });
}

function createAttendanceRecords(training) {
  return createTrainingDays(training).reduce((records, day, dayIndex) => {
    records[day.value] = attendees.reduce((dayRecords, attendee, attendeeIndex) => {
      const isMissing = (dayIndex + attendeeIndex) % 5 === 0;
      dayRecords[attendee.id] = {
        checkIn: isMissing ? '' : `09:${String(5 + attendeeIndex * 4).padStart(2, '0')}`,
        checkOut: isMissing ? '' : `17:${String(10 + attendeeIndex * 5).padStart(2, '0')}`,
      };
      return dayRecords;
    }, {});
    return records;
  }, {});
}

function cloneAttendance(records) {
  return Object.fromEntries(Object.entries(records).map(([date, dayRecords]) => [
    date,
    Object.fromEntries(Object.entries(dayRecords).map(([attendeeId, record]) => [
      attendeeId,
      { ...record },
    ])),
  ]));
}

function AdminTrainingHeader({ training, onBack, onCreateAssessment, onEdit, onDelete }) {
  const status = getManagedTrainingStatus(training);

  return (
    <section className="smplfy-sample-details-header bg-white border-bottom">
      <div className="d-flex align-items-center justify-content-between gap-3">
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

        <div className="d-flex align-items-center gap-2 flex-shrink-0">
          <PrimaryButton size="medium" leftIcon="plus" onClick={onCreateAssessment}>
            New assessment
          </PrimaryButton>
          <SecondaryButton size="medium" leftIcon="edit" onClick={onEdit}>
            Edit
          </SecondaryButton>
          <SecondaryButton size="medium" tone="destructive" leftIcon="trash" onClick={onDelete}>
            Delete
          </SecondaryButton>
        </div>
      </div>
    </section>
  );
}

function TrainingInfoCard({ training }) {
  const trainingDays = createTrainingDays(training);
  const trainingAttendees = training.attendees?.length ? training.attendees : attendees;

  const trainingInfo = [
    { label: 'Name', value: training.name },
    { label: 'Description', value: training.description || '-' },
    {
      label: 'When',
      value: `${training.startDate} to ${training.endDate} (${trainingDays.length} ${trainingDays.length === 1 ? 'day' : 'days'})`,
    },
    {
      label: 'Attendees',
      value: trainingAttendees
        .map((attendee) => (typeof attendee === 'string' ? attendee : attendee.name))
        .join(', '),
    },
  ];

  return (
    <section className="smplfy-card card overflow-hidden h-100">
      <div className="card-header bg-white d-flex align-items-center px-3 py-3">
        <h2 className="h6 mb-0 fw-semibold text-dark">Training Info</h2>
      </div>
      <div className="card-body p-3">
        <DataTable className="smplfy-admin-training-info-table">
          <tbody>
            {trainingInfo.map((item) => (
              <tr key={item.label}>
                <th scope="row" className="text-secondary fw-medium">{item.label}</th>
                <td>{item.value}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </div>
    </section>
  );
}

function AttendanceCard({ training }) {
  const days = useMemo(() => createTrainingDays(training), [training]);
  const initialRecords = useMemo(() => createAttendanceRecords(training), [training]);
  const [selectedDate, setSelectedDate] = useState(days[0]?.value ?? '');
  const [records, setRecords] = useState(initialRecords);
  const [draftRecords, setDraftRecords] = useState(initialRecords);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setSelectedDate(days[0]?.value ?? '');
    setRecords(initialRecords);
    setDraftRecords(initialRecords);
    setEditing(false);
  }, [days, initialRecords]);

  const visibleRecords = editing ? draftRecords : records;

  const updateTime = (attendeeId, field, value) => {
    setDraftRecords((current) => ({
      ...current,
      [selectedDate]: {
        ...current[selectedDate],
        [attendeeId]: {
          ...current[selectedDate]?.[attendeeId],
          [field]: value,
        },
      },
    }));
  };

  return (
    <section className="smplfy-card card overflow-hidden">
      <div className="card-header bg-white d-flex align-items-center justify-content-between gap-3 px-3 py-3 flex-wrap">
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <h2 className="h6 mb-0 fw-semibold text-dark">Attendance</h2>
          <select
            className="form-select form-select-sm w-auto"
            aria-label="Attendance day"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
          >
            {days.map((day) => (
              <option key={day.value} value={day.value}>{day.label}</option>
            ))}
          </select>
        </div>

        <div className="d-flex align-items-center gap-2">
          {editing ? (
            <>
              <SecondaryButton
                size="medium"
                leftIcon="close"
                onClick={() => {
                  setDraftRecords(cloneAttendance(records));
                  setEditing(false);
                }}
              >
                Cancel
              </SecondaryButton>
              <PrimaryButton
                size="medium"
                leftIcon="save"
                onClick={() => {
                  setRecords(cloneAttendance(draftRecords));
                  setEditing(false);
                }}
              >
                Save
              </PrimaryButton>
            </>
          ) : (
            <SecondaryButton
              size="medium"
              leftIcon="edit"
              onClick={() => {
                setDraftRecords(cloneAttendance(records));
                setEditing(true);
              }}
            >
              Edit
            </SecondaryButton>
          )}
        </div>
      </div>
      <div className="card-body p-3">
        <DataTable className="smplfy-admin-training-attendance-table">
          <thead>
            <tr>
              <th scope="col">Attendee</th>
              <th scope="col">Check-in time</th>
              <th scope="col">Check-out time</th>
            </tr>
          </thead>
          <tbody>
            {attendees.map((attendee) => {
              const record = visibleRecords[selectedDate]?.[attendee.id] ?? {};

              return (
                <tr key={attendee.id}>
                  <td className="fw-semibold">{attendee.name}</td>
                  <td>
                    {editing ? (
                      <input
                        className="form-control form-control-sm"
                        type="time"
                        value={record.checkIn ?? ''}
                        onChange={(event) => updateTime(attendee.id, 'checkIn', event.target.value)}
                      />
                    ) : record.checkIn || '-'}
                  </td>
                  <td>
                    {editing ? (
                      <input
                        className="form-control form-control-sm"
                        type="time"
                        value={record.checkOut ?? ''}
                        onChange={(event) => updateTime(attendee.id, 'checkOut', event.target.value)}
                      />
                    ) : record.checkOut || '-'}
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

function AssessmentsCard({ assessments, onEditAssessment }) {
  return (
    <section className="smplfy-card card overflow-hidden">
      <div className="card-header bg-white d-flex align-items-center px-3 py-3">
        <h2 className="h6 mb-0 fw-semibold text-dark">Assessments ({assessments.length})</h2>
      </div>
      <div className="card-body p-3">
        <DataTable className="smplfy-admin-training-assessment-table">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">From</th>
              <th scope="col">To</th>
              <th scope="col">Status</th>
              <th scope="col">Submissions</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {assessments.length ? assessments.map((assessment, index) => {
              const completed = assessment.status === 'completed';
              const submittedCount = assessment.submissionCount ?? (completed ? 16 : 3 + index * 2);

              return (
                <tr key={assessment.id}>
                  <td className="fw-semibold">{assessment.name || `Assessment ${index + 1}`}</td>
                  <td className="text-nowrap">{assessment.from}</td>
                  <td className="text-nowrap">{assessment.to}</td>
                  <td>
                    <StatusPill
                      color={completed ? 'green' : 'yellow'}
                      styleType={completed ? 'neutral' : 'strong'}
                    >
                      {completed ? 'Completed' : 'Pending'}
                    </StatusPill>
                  </td>
                  <td className="text-nowrap">{Math.min(submittedCount, 16)}/16</td>
                  <td>
                    <SecondaryButton
                      size="medium"
                      leftIcon="edit"
                      onClick={() => onEditAssessment?.(assessment.id)}
                    >
                      Edit
                    </SecondaryButton>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan="6" className="text-secondary text-center py-4">No assessments added.</td>
              </tr>
            )}
          </tbody>
        </DataTable>
      </div>
    </section>
  );
}

export default function AdminTrainingDetailsPage({
  training = defaultTrainings[0],
  onBack,
  onEdit,
  onDelete,
  onCreateAssessment,
  onEditAssessment,
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
        { key: 'training-management', label: 'Training & Assessment Management' },
        { key: 'admin-training-details', label: training.name, current: true },
      ]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      sidebarBadgeCounts={sidebarBadgeCounts}
      pageHeader={(
        <AdminTrainingHeader
          training={training}
          onBack={onBack}
          onCreateAssessment={onCreateAssessment}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    >
      <main className="smplfy-sample-details-page bg-body-tertiary p-4 min-vh-100">
        <div className="container-fluid px-0 d-flex flex-column gap-3 smplfy-admin-training-content">
          <div className="row g-3 align-items-start">
            <div className="col-12 col-xl-6">
              <TrainingInfoCard training={training} />
            </div>
            <div className="col-12 col-xl-6">
              <AttendanceCard training={training} />
            </div>
          </div>
          <AssessmentsCard
            assessments={training.assessments ?? []}
            onEditAssessment={onEditAssessment}
          />
        </div>
      </main>
    </AppChrome>
  );
}
