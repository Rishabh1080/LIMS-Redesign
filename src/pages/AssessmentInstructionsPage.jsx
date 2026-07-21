import { useEffect, useMemo, useState } from 'react';
import AppIcon from '../components/AppIcon';
import Checkbox from '../components/Checkbox/Checkbox';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import './sample-details-page.scss';
import './assessment-instructions-page.scss';

const instructions = [
  'Each question has one correct answer.',
  'You must answer all questions before submitting.',
  'Review your answers before final submission.',
  'Your score will be displayed after completion.',
  'The quiz can only be submitted once.',
];

const declarations = [
  'I confirm that I have read and understood the instructions provided.',
  'I declare that I am ready to begin the assessment and will answer all questions to the best of my knowledge without assistance from others.',
];

const assessmentQuestions = [
  {
    id: 'question-1',
    prompt: 'ISO/IEC 17025:2017 is applicable to',
    options: [
      'Manufacturing industries only',
      'Testing and calibration laboratories',
      'Hospitals only',
      'Certification bodies only',
    ],
  },
  {
    id: 'question-2',
    prompt: 'What is the primary purpose of equipment calibration?',
    options: [
      'To improve the appearance of equipment',
      'To establish measurement accuracy and traceability',
      'To reduce the number of laboratory records',
      'To avoid preventive maintenance',
    ],
  },
  {
    id: 'question-3',
    prompt: 'Which record provides evidence that a test was performed as required?',
    options: [
      'A completed test worksheet',
      'A supplier quotation',
      'An equipment brochure',
      'A laboratory floor plan',
    ],
  },
  {
    id: 'question-4',
    prompt: 'What should an analyst do before using an instrument?',
    options: [
      'Confirm that it is suitable, calibrated, and available for use',
      'Use it immediately without checking its status',
      'Change its calibration label',
      'Disable all instrument alerts',
    ],
  },
];

const defaultAssessmentDurationSeconds = 15 * 60;

function formatTimer(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function AssessmentInstructionsHeader({ assessment, training, onBack, remainingSeconds, timed }) {
  return (
    <section className="smplfy-sample-details-header bg-white border-bottom">
      <div className="d-flex align-items-center justify-content-between gap-3 min-w-0">
        <div className="d-flex align-items-center gap-3 min-w-0">
          <SecondaryButton
            size="medium"
            leftIcon="chevron-left"
            className="px-0 flex-shrink-0"
            aria-label="Go back"
            onClick={onBack}
          />
          <div className="d-flex flex-column min-w-0">
            <h1 className="h5 mb-0 fw-semibold text-dark text-truncate">{assessment.name}</h1>
            <div className="d-inline-flex text-secondary fw-medium text-truncate">{training.name}</div>
          </div>
        </div>

        {timed ? (
          <div
            className={`smplfy-assessment-timer d-inline-flex align-items-center gap-2 flex-shrink-0 ${
              remainingSeconds <= 60 ? 'text-danger' : 'text-secondary'
            }`}
            aria-live="polite"
          >
            <AppIcon name="hourglass-low" size={18} />
            <span>{formatTimer(remainingSeconds)}</span>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function InstructionsStep({ understood, onUnderstoodChange, onContinue }) {
  return (
    <>
      <header className="card-header bg-white d-flex align-items-center p-3">
        <h2 className="h6 mb-0 fw-semibold text-dark">Instructions</h2>
      </header>
      <div className="card-body bg-white">
        <div className="smplfy-assessment-instructions-copy d-flex flex-column gap-4">
          <p className="mb-0">
            Read each question carefully and select the correct answer from the available options.
          </p>
          <ol className="mb-0 ps-4">
            {instructions.map((instruction) => (
              <li key={instruction}>{instruction}</li>
            ))}
          </ol>
        </div>
      </div>
      <footer className="card-footer bg-white border-top p-3 d-flex align-items-center justify-content-between gap-3">
        <label className="d-inline-flex align-items-center gap-2 mb-0">
          <Checkbox
            checked={understood}
            onChange={onUnderstoodChange}
            aria-label="I understand the assessment instructions"
          />
          <span className="smplfy-assessment-understand-label">I understand</span>
        </label>
        <PrimaryButton
          rightIcon="chevron-right"
          disabled={!understood}
          onClick={onContinue}
        >
          Continue
        </PrimaryButton>
      </footer>
    </>
  );
}

function DeclarationStep({ checkedItems, onToggle, onStart }) {
  const allChecked = checkedItems.every(Boolean);

  return (
    <>
      <header className="card-header bg-white d-flex align-items-center p-3">
        <h2 className="h6 mb-0 fw-semibold text-dark">Declaration</h2>
      </header>
      <div className="card-body bg-white">
        <div className="smplfy-assessment-declarations d-flex flex-column gap-3">
          {declarations.map((declaration, index) => (
            <label className="d-flex align-items-start gap-3 mb-0" key={declaration}>
              <Checkbox
                checked={checkedItems[index]}
                onChange={(checked) => onToggle(index, checked)}
                aria-label={declaration}
              />
              <span>{declaration}</span>
            </label>
          ))}
        </div>
      </div>
      <footer className="card-footer bg-white border-top p-3 d-flex align-items-center justify-content-end">
        <PrimaryButton
          rightIcon="chevron-right"
          disabled={!allChecked}
          onClick={onStart}
        >
          Start Assessment
        </PrimaryButton>
      </footer>
    </>
  );
}

function QuestionStep({
  question,
  questionIndex,
  questionCount,
  selectedOption,
  onSelect,
  onPrevious,
  onNext,
  onSubmit,
}) {
  const isLastQuestion = questionIndex === questionCount - 1;
  const hasAnswer = Number.isInteger(selectedOption);

  return (
    <>
      <header className="card-header bg-white d-flex align-items-center p-3">
        <h2 className="h6 mb-0 fw-semibold text-dark">Question {questionIndex + 1}</h2>
      </header>
      <div className="card-body bg-white">
        <div className="smplfy-assessment-question d-flex flex-column gap-3">
          <p className="mb-0 fw-medium">{question.prompt}</p>
          <div className="d-flex flex-column gap-3">
            {question.options.map((option, optionIndex) => (
              <label className="d-flex align-items-center gap-3 mb-0" key={option}>
                <Checkbox
                  checked={selectedOption === optionIndex}
                  onChange={(checked) => onSelect(checked ? optionIndex : null)}
                  aria-label={option}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      <footer className="card-footer bg-white border-top p-3 d-flex align-items-center justify-content-between gap-3">
        <SecondaryButton
          leftIcon="chevron-left"
          disabled={questionIndex === 0}
          onClick={onPrevious}
        >
          Previous
        </SecondaryButton>
        <PrimaryButton
          rightIcon={isLastQuestion ? undefined : 'chevron-right'}
          disabled={!hasAnswer}
          onClick={isLastQuestion ? onSubmit : onNext}
        >
          {isLastQuestion ? 'Submit' : 'Next'}
        </PrimaryButton>
      </footer>
    </>
  );
}

export default function AssessmentInstructionsPage({
  assessment,
  training,
  onBack,
  onSubmit,
}) {
  const assessmentDuration = useMemo(
    () => (assessment.durationMinutes ?? 15) * 60 || defaultAssessmentDurationSeconds,
    [assessment.durationMinutes],
  );
  const [stage, setStage] = useState('instructions');
  const [understood, setUnderstood] = useState(false);
  const [checkedDeclarations, setCheckedDeclarations] = useState([false, false]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [remainingSeconds, setRemainingSeconds] = useState(assessmentDuration);

  useEffect(() => {
    setStage('instructions');
    setUnderstood(false);
    setCheckedDeclarations([false, false]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setRemainingSeconds(assessmentDuration);
  }, [assessment.id, assessmentDuration]);

  useEffect(() => {
    if (stage !== 'questions') return undefined;

    const timer = window.setInterval(() => {
      setRemainingSeconds((currentSeconds) => Math.max(currentSeconds - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [stage]);

  const startAssessment = () => {
    setCurrentQuestionIndex(0);
    setRemainingSeconds(assessmentDuration);
    setStage('questions');
  };

  const currentQuestion = assessmentQuestions[currentQuestionIndex];
  const isWorkflowStep = stage !== 'instructions';

  return (
    <div className="smplfy-assessment-flow-shell min-vh-100 d-flex flex-column">
      <AssessmentInstructionsHeader
        assessment={assessment}
        training={training}
        onBack={onBack}
        timed={stage === 'questions'}
        remainingSeconds={remainingSeconds}
      />
      <main className="smplfy-assessment-instructions-page bg-body-tertiary p-4">
        <section
          className={`smplfy-assessment-instructions-card smplfy-card card overflow-hidden mx-auto ${
            isWorkflowStep ? 'is-workflow-step' : ''
          }`}
        >
          {stage === 'instructions' ? (
            <InstructionsStep
              understood={understood}
              onUnderstoodChange={setUnderstood}
              onContinue={() => setStage('declaration')}
            />
          ) : null}

          {stage === 'declaration' ? (
            <DeclarationStep
              checkedItems={checkedDeclarations}
              onToggle={(index, checked) => {
                setCheckedDeclarations((currentItems) => currentItems.map((item, itemIndex) => (
                  itemIndex === index ? checked : item
                )));
              }}
              onStart={startAssessment}
            />
          ) : null}

          {stage === 'questions' ? (
            <QuestionStep
              question={currentQuestion}
              questionIndex={currentQuestionIndex}
              questionCount={assessmentQuestions.length}
              selectedOption={answers[currentQuestion.id]}
              onSelect={(optionIndex) => {
                setAnswers((currentAnswers) => ({
                  ...currentAnswers,
                  [currentQuestion.id]: optionIndex,
                }));
              }}
              onPrevious={() => setCurrentQuestionIndex((index) => Math.max(index - 1, 0))}
              onNext={() => setCurrentQuestionIndex((index) => (
                Math.min(index + 1, assessmentQuestions.length - 1)
              ))}
              onSubmit={() => onSubmit?.(answers)}
            />
          ) : null}
        </section>
      </main>
    </div>
  );
}
