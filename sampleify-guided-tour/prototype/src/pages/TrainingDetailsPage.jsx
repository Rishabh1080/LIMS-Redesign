import { useEffect, useMemo, useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import DataTable from '../components/DataTable';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import StatusPill from '../components/StatusPill';
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

function AttendanceCard({ rows, onCheckIn, onCheckOut }) {
  const todayKey = getDateKey(new Date());
  const todayRow = rows.find((row) => row.dateKey === todayKey) ?? null;

  // The action only ever applies to today, so it lives in the header rather
  // than per-row: check in if not yet done, check out once checked in, and
  // disabled when there's no session today or the day is already complete.
  let headerAction = null;

  if (!todayRow) {
    headerAction = (
      <PrimaryButton size="medium" disabled title="No training session today">
        Check in
      </PrimaryButton>
    );
  } else if (!todayRow.checkIn) {
    headerAction = (
      <PrimaryButton size="medium" onClick={() => onCheckIn(todayRow.id)}>
        Check in
      </PrimaryButton>
    );
  } else if (!todayRow.checkOut) {
    headerAction = (
      <PrimaryButton size="medium" onClick={() => onCheckOut(todayRow.id)}>
        Check out
      </PrimaryButton>
    );
  } else {
    headerAction = (
      <PrimaryButton size="medium" disabled title="Attendance complete for today">
        Checked out
      </PrimaryButton>
    );
  }

  return (
    <section className="smplfy-card card overflow-hidden">
      <div className="card-header bg-white d-flex align-items-center justify-content-between gap-3 px-3 py-3">
        <h2 className="h6 mb-0 fw-semibold text-dark">Attendance</h2>
        {headerAction}
      </div>
      <div className="card-body p-3">
        <DataTable className="smplfy-training-attendance-table">
          <thead>
            <tr>
              <th scope="col">Sr</th>
              <th scope="col">Date</th>
              <th scope="col">Check-in</th>
              <th scope="col">Check-out</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.day}</td>
                <td className="text-nowrap">{row.date}</td>
                <td className="text-nowrap">{row.checkIn || '-'}</td>
                <td className="text-nowrap">{row.checkOut || '-'}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </div>
    </section>
  );
}

function TrainingEmptyState({ icon, title, description }) {
  return (
    <div className="smplfy-training-empty-state">
      <span className="smplfy-training-empty-state-icon" aria-hidden="true">
        <AppIcon name={icon} size={24} stroke={1.6} />
      </span>
      <p className="smplfy-training-empty-state-title">{title}</p>
      {description ? (
        <p className="smplfy-training-empty-state-text">{description}</p>
      ) : null}
    </div>
  );
}

function AssessmentsCard({ assessments, onStart }) {
  return (
    <section className="smplfy-card card overflow-hidden">
      <div className="card-header bg-white d-flex align-items-center px-3 py-3">
        <h2 className="h6 mb-0 fw-semibold text-dark">Assessments</h2>
      </div>
      <div className="card-body p-3">
        {assessments.length ? (
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
        ) : (
          <TrainingEmptyState
            icon="checklist"
            title="No assessments yet"
            description="Assessments for this training will show up here once they're added."
          />
        )}
      </div>
    </section>
  );
}

function DocumentsCard({ documents }) {
  return (
    <section className="smplfy-card card overflow-hidden">
      <div className="card-header bg-white d-flex align-items-center px-3 py-3">
        <h2 className="h6 mb-0 fw-semibold text-dark">Documents</h2>
      </div>
      <div className="card-body p-3">
        {documents.length ? (
          <div className="smplfy-training-documents-grid">
            {documents.map((document) => (
              <DocumentTile key={document.id} document={document} />
            ))}
          </div>
        ) : (
          <TrainingEmptyState
            icon="file-text"
            title="No documents uploaded"
            description="Documents shared for this training will appear here."
          />
        )}
      </div>
    </section>
  );
}

function openDocument(document) {
  if (document.url && document.url !== '#') {
    window.open(document.url, '_blank', 'noopener,noreferrer');
  }
}

function downloadDocument(document) {
  if (!document.url || document.url === '#') return;

  const anchor = window.document.createElement('a');
  anchor.href = document.url;
  anchor.download = document.name || '';
  // rel keeps the forced-download path from leaking an opener reference.
  anchor.rel = 'noopener';
  window.document.body.appendChild(anchor);
  anchor.click();
  window.document.body.removeChild(anchor);
}

function DocumentTile({ document }) {
  const open = () => openDocument(document);

  return (
    // A div (not a button) so the download control can live inside it without
    // nesting interactive elements. The tile itself opens the doc on click or
    // Enter/Space; the download button stops propagation so it doesn't open.
    <div
      className="smplfy-training-document-tile card"
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          open();
        }
      }}
      title={`Open ${document.name}`}
    >
      <button
        type="button"
        className="smplfy-training-document-download"
        aria-label={`Download ${document.name}`}
        title={`Download ${document.name}`}
        onClick={(event) => {
          event.stopPropagation();
          // Drop focus so a mouse click doesn't leave the button stuck visible
          // (focus-visible won't trigger for pointer input, so it just hides).
          event.currentTarget.blur();
          downloadDocument(document);
        }}
      >
        <AppIcon name="download" size={18} stroke={1.8} />
      </button>

      <div className="smplfy-training-document-preview">
        {document.previewUrl ? (
          <img src={document.previewUrl} alt="" className="smplfy-training-document-preview-image" />
        ) : (
          <div className="smplfy-training-document-preview-fallback">
            <AppIcon name="file-text" size={40} stroke={1.5} />
            <span className="smplfy-training-document-type">{document.type}</span>
          </div>
        )}
      </div>
      <div className="smplfy-training-document-meta">
        <span className="smplfy-training-document-name text-truncate" title={document.name}>
          {document.name}
        </span>
        <span className="smplfy-training-document-size text-secondary">{document.size}</span>
      </div>
    </div>
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
  const resolvedAssessments = useMemo(() => (training.assessments ?? []).map((assessment) => (
    completedAssessmentIds.includes(assessment.id)
      ? { ...assessment, status: 'completed', scoreAvailable: true }
      : assessment
  )), [completedAssessmentIds, training.assessments]);
  const [assessments, setAssessments] = useState(resolvedAssessments);
  const documents = training.documents ?? [];

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
        <div className="container-fluid px-0">
          <div className="row g-3">
            {/* 70% — assessments on top, documents below. Both cards always
                render; each shows its own empty state when it has no data. */}
            <div className="col-12 col-xl-8 smplfy-training-details-70 d-flex flex-column gap-3">
              <AssessmentsCard assessments={assessments} onStart={onStartAssessment} />
              <DocumentsCard documents={documents} />
            </div>

            {/* 30% — attendance. */}
            <div className="col-12 col-xl-4 smplfy-training-details-30 d-flex flex-column gap-3">
              <AttendanceCard
                rows={attendanceRows}
                onCheckIn={(rowId) => updateAttendanceTime(rowId, 'checkIn')}
                onCheckOut={(rowId) => updateAttendanceTime(rowId, 'checkOut')}
              />
            </div>
          </div>
        </div>
      </main>
    </AppChrome>
  );
}
