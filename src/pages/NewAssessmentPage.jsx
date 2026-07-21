import { useEffect, useMemo, useRef, useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import { FormElement, ToastNotification } from '../components/FormControls';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import { defaultTrainings } from './TrainingsPage';
import './new-assessment-page.scss';

function getNextAssessmentName(trainingId, trainings) {
  const training = trainings.find((item) => item.id === trainingId);
  const nextNumber = (training?.assessments?.length ?? 0) + 1;
  return `Assessment ${nextNumber}`;
}

function toInputDate(value = '') {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const [day, month, year] = String(value).split('/');
  return day && month && year ? `${year}-${month}-${day}` : '';
}

function NewAssessmentHeader({ editMode, onBack }) {
  return (
    <section className="d-flex align-items-center justify-content-between gap-3 bg-white border-bottom flex-wrap px-4 py-3">
      <div className="d-flex align-items-center gap-3 min-w-0">
        <SecondaryButton
          size="medium"
          leftIcon="chevron-left"
          className="px-0 flex-shrink-0"
          aria-label="Go back"
          onClick={onBack}
        />
        <h1 className="h5 fw-semibold text-body mb-0">
          {editMode ? 'Edit Assessment' : 'New Assessment'}
        </h1>
      </div>

      <PrimaryButton type="submit" form="new-assessment-form" leftIcon="save">
        {editMode ? 'Save changes' : 'Submit'}
      </PrimaryButton>
    </section>
  );
}

export default function NewAssessmentPage({
  trainings = defaultTrainings,
  mode = 'create',
  initialTrainingId = '',
  assessment = null,
  onSubmitAssessment,
  onBack,
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  sidebarBadgeCounts,
}) {
  const editMode = mode === 'edit';
  const fileInputRef = useRef(null);
  const [trainingId, setTrainingId] = useState(initialTrainingId);
  const [name, setName] = useState(assessment?.name ?? 'Assessment 1');
  const [description, setDescription] = useState(assessment?.description ?? '');
  const [fromDate, setFromDate] = useState(toInputDate(assessment?.from));
  const [toDate, setToDate] = useState(toInputDate(assessment?.to));
  const [questionsFile, setQuestionsFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const trainingOptions = useMemo(() => trainings.map((training) => ({
    value: training.id,
    label: training.name,
  })), [trainings]);

  useEffect(() => {
    setTrainingId(initialTrainingId);
    setName(assessment?.name ?? (
      initialTrainingId ? getNextAssessmentName(initialTrainingId, trainings) : 'Assessment 1'
    ));
    setDescription(assessment?.description ?? '');
    setFromDate(toInputDate(assessment?.from));
    setToDate(toInputDate(assessment?.to));
    setQuestionsFile(null);
    setToastVisible(false);
  }, [assessment?.id, initialTrainingId, mode]);

  const selectQuestionsFile = (file) => {
    if (!file) return;
    setQuestionsFile(file);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmitAssessment?.({
      ...assessment,
      trainingId,
      name,
      description,
      from: fromDate,
      to: toDate,
    });
    setToastVisible(true);
  };

  return (
    <AppChrome
      activeNav="design-handoff"
      onNavigate={onNavigate}
      breadcrumbs={[
        { key: 'design-handoff', label: 'Design Handoff' },
        {
          key: editMode ? 'edit-assessment' : 'new-assessment',
          label: editMode ? 'Edit Assessment' : 'New Assessment',
          current: true,
        },
      ]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      sidebarBadgeCounts={sidebarBadgeCounts}
      pageHeader={<NewAssessmentHeader editMode={editMode} onBack={onBack} />}
    >
      <main className="smplfy-new-assessment-page bg-body-tertiary p-4 min-vh-100">
        <form
          id="new-assessment-form"
          className="container-fluid px-0 d-flex flex-column gap-3"
          style={{ maxWidth: 'max-content' }}
          onSubmit={handleSubmit}
        >
          <section className="smplfy-card card overflow-hidden">
            <div className="card-header bg-white d-flex align-items-center px-3 py-3">
              <h2 className="h6 mb-0 fw-semibold text-dark">Assessment details</h2>
            </div>
            <div className="card-body p-4">
              <div className="row g-3">
                <div className="col-12 col-lg-6">
                  <FormElement
                    type="dropdown"
                    mandatory
                    label="Training"
                    inputProps={{
                      value: trainingId,
                      disabled: editMode,
                      placeholder: 'Select training',
                      options: trainingOptions,
                      onChange: (event) => {
                        const nextTrainingId = event.target.value;
                        setTrainingId(nextTrainingId);
                        setName(getNextAssessmentName(nextTrainingId, trainings));
                      },
                    }}
                  />
                </div>
                <div className="col-12 col-lg-6">
                  <FormElement
                    mandatory
                    label="Name"
                    inputProps={{
                      value: name,
                      placeholder: 'Assessment name',
                      onChange: (event) => setName(event.target.value),
                    }}
                  />
                </div>
                <div className="col-12">
                  <FormElement
                    label="Description"
                    inputProps={{
                      value: description,
                      placeholder: 'Add a short description',
                      onChange: (event) => setDescription(event.target.value),
                    }}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <FormElement
                    type="date"
                    mandatory
                    label="From"
                    inputProps={{
                      value: fromDate,
                      onChange: (event) => setFromDate(event.target.value),
                    }}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <FormElement
                    type="date"
                    mandatory
                    label="To"
                    inputProps={{
                      value: toDate,
                      onChange: (event) => setToDate(event.target.value),
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="smplfy-card card overflow-hidden">
            <div className="card-header bg-white d-flex align-items-center justify-content-between gap-3 px-3 py-3 flex-wrap">
              <h2 className="h6 mb-0 fw-semibold text-dark">Questions</h2>
              <SecondaryButton size="medium" leftIcon="download" type="button">
                Download sample Excel
              </SecondaryButton>
            </div>
            <div className="card-body p-4">
              <div
                className={`smplfy-assessment-upload-zone rounded d-flex flex-column align-items-center justify-content-center text-center p-5 ${isDragging ? 'is-dragging' : ''}`}
                onDragEnter={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragOver={(event) => event.preventDefault()}
                onDragLeave={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) {
                    setIsDragging(false);
                  }
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDragging(false);
                  selectQuestionsFile(event.dataTransfer.files?.[0]);
                }}
              >
                <p className="mb-1 fw-medium text-dark">
                  {questionsFile ? questionsFile.name : 'Drag and drop questions Excel here or'}
                </p>
                {!questionsFile ? (
                  <button
                    type="button"
                    className="btn btn-link p-0 text-decoration-none"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose from system
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-link p-0 text-decoration-none"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose another file
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  className="visually-hidden"
                  type="file"
                  accept=".xls,.xlsx"
                  onChange={(event) => selectQuestionsFile(event.target.files?.[0])}
                />
              </div>
            </div>
          </section>
        </form>
      </main>

      <ToastNotification
        state={toastVisible ? 'default' : 'gone'}
        message={editMode ? 'Assessment updated successfully.' : 'Assessment created successfully.'}
        className="position-fixed bottom-0 start-0 m-4"
        onClose={() => setToastVisible(false)}
      />
    </AppChrome>
  );
}
