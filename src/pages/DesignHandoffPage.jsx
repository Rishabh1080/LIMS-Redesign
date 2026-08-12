import { useEffect, useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import Checkbox from '../components/Checkbox/Checkbox';
import { FormElement } from '../components/FormControls';
import Modal from '../components/Modal/Modal';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import StatusPill from '../components/StatusPill';
import errorAccessIllustration from '../../error 1.png';
import errorCooldownIllustration from '../../error 2.png';
import './design-handoff-page.scss';

const badgeColorOptions = [
  { id: 'gray', label: 'Gray', swatch: '#99A0A7' },
  { id: 'blue', label: 'Blue', swatch: '#007BF8' },
  { id: 'orange', label: 'Orange', swatch: '#F68C38' },
  { id: 'yellow', label: 'Yellow', swatch: '#FFD24C' },
  { id: 'red', label: 'Red', swatch: '#FF2725' },
  { id: 'green', label: 'Green', swatch: '#00B242' },
];

const badgeStyleOptions = [
  { id: 'neutral', label: 'Light' },
  { id: 'strong', label: 'Dark' },
];

const nodeActionOptions = [
  'Positive Termination',
  'Show Sample Retest',
  'Show Sample Reissue',
  'Enable Template Validation',
  'Enable Critical Params Validation',
  'Show Sample Edit',
  'Show Add Result',
  'Show Proforma Invoice',
  'Generate Test Request',
  'Require All TRs Allocated',
  'Require All TRs Approved',
  'Fetch Environment Data',
  'Can Work On TR',
  'Final State',
  'Enable Job Card',
];

function DesignHandoffHeader() {
  return (
    <section className="bg-white border-bottom px-4 py-3">
      <div className="container-fluid px-0">
        <div className="row align-items-center gx-0">
          <div className="col-auto">
            <h1 className="h5 mb-0 fw-semibold text-dark">Design Handoff</h1>
          </div>
        </div>
      </div>
    </section>
  );
}

function NodeDetailsModal({ open, onClose }) {
  const [nodeName, setNodeName] = useState('Pending');
  const [badgeColor, setBadgeColor] = useState('gray');
  const [badgeStyle, setBadgeStyle] = useState('neutral');
  const badgePreviewLabel = nodeName.trim() || 'Name';

  return (
    <Modal
      open={open}
      title="Node Details"
      titleId="node-details-handoff-modal-title"
      titleIcon="settings"
      onClose={onClose}
      size="xl"
      cardClassName="smplfy-design-handoff-node-modal-dialog"
      className="smplfy-design-handoff-node-modal"
      actions={(
        <>
          <SecondaryButton leftIcon="close" onClick={onClose}>
            Cancel
          </SecondaryButton>
          <PrimaryButton leftIcon="save" onClick={onClose}>
            Save Node
          </PrimaryButton>
        </>
      )}
    >
      <div className="smplfy-design-handoff-node-body d-flex flex-column gap-4">
        <div className="row g-3 align-items-end">
          <div className="col-12 col-lg-4">
            <FormElement
              type="text"
              mandatory
              label="Name"
              inputProps={{
                state: 'filled',
                value: nodeName,
                onChange: (event) => setNodeName(event.target.value),
              }}
            />
          </div>
          <div className="col-6 col-lg-2">
            <FormElement
              type="number"
              mandatory
              label="Input"
              inputProps={{
                state: 'filled',
                value: '0',
                onChange: () => {},
              }}
            />
          </div>
          <div className="col-6 col-lg-2">
            <FormElement
              type="number"
              mandatory
              label="Output"
              inputProps={{
                state: 'filled',
                value: '1',
                onChange: () => {},
              }}
            />
          </div>
          <div className="col-12 col-lg-4">
            <FormElement
              type="dropdown"
              mandatory
              label="Template"
              inputProps={{
                state: 'default',
                value: '',
                placeholder: 'Select template',
                options: ['TR Approval Template', 'Sample Review Template', 'Final Report Template'],
                onChange: () => {},
              }}
            />
          </div>
        </div>

        <section className="d-flex flex-column gap-3">
          <h3 className="smplfy-design-handoff-section-title mb-0">Badge Style</h3>
          <div className="row g-3 align-items-start">
            <div className="col-12 col-lg-6">
              <div className="smplfy-design-handoff-field-label mb-2">Color</div>
              <div className="smplfy-design-handoff-color-grid">
                {badgeColorOptions.map((colorOption) => (
                  <button
                    key={colorOption.id}
                    type="button"
                    className={`smplfy-design-handoff-color-option btn ${badgeColor === colorOption.id ? 'is-active' : ''}`}
                    aria-label={colorOption.label}
                    aria-pressed={badgeColor === colorOption.id}
                    title={colorOption.label}
                    onClick={() => setBadgeColor(colorOption.id)}
                  >
                    <span
                      className="smplfy-design-handoff-color-swatch"
                      style={{ backgroundColor: colorOption.swatch }}
                      aria-hidden="true"
                    />
                    {badgeColor === colorOption.id ? (
                      <span className="smplfy-design-handoff-selection-mark d-inline-flex align-items-center justify-content-center" aria-hidden="true">
                        <AppIcon name="check" size={12} stroke={2.4} />
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div className="smplfy-design-handoff-field-label mb-2">Style</div>
              <div className="smplfy-design-handoff-style-switcher d-inline-flex align-items-center gap-2">
                {badgeStyleOptions.map((styleOption) => (
                  <button
                    key={styleOption.id}
                    type="button"
                    className={`smplfy-design-handoff-style-option btn ${badgeStyle === styleOption.id ? 'is-active' : ''}`}
                    aria-pressed={badgeStyle === styleOption.id}
                    onClick={() => setBadgeStyle(styleOption.id)}
                  >
                    {styleOption.label}
                    {badgeStyle === styleOption.id ? (
                      <span className="smplfy-design-handoff-selection-mark d-inline-flex align-items-center justify-content-center" aria-hidden="true">
                        <AppIcon name="check" size={12} stroke={2.4} />
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-3">
              <div className="smplfy-design-handoff-field-label mb-2">Preview</div>
              <div className="smplfy-design-handoff-badge-preview d-flex align-items-center">
                <StatusPill color={badgeColor} styleType={badgeStyle}>
                  {badgePreviewLabel}
                </StatusPill>
              </div>
            </div>
          </div>
        </section>

        <section className="d-flex flex-column gap-3">
          <h3 className="smplfy-design-handoff-section-title mb-0">Node Actions</h3>
          <div className="smplfy-design-handoff-action-grid">
            {nodeActionOptions.map((option) => {
              const inputId = `node-action-${option.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

              return (
                <label
                  key={option}
                  className="smplfy-design-handoff-action-option d-flex align-items-center gap-2"
                  htmlFor={inputId}
                >
                  <Checkbox id={inputId} />
                  <span>{option}</span>
                </label>
              );
            })}
          </div>
        </section>
      </div>
    </Modal>
  );
}

function TaskAccessErrorModal({ open, onClose }) {
  return (
    <Modal
      open={open}
      title="Access Error"
      titleId="task-access-error-modal-title"
      onClose={onClose}
      size="md"
      className="smplfy-design-handoff-error-modal"
      showCloseButton={false}
    >
      <div className="smplfy-design-handoff-error-content d-flex flex-column align-items-center text-center">
        <img
          className="smplfy-design-handoff-error-illustration"
          src={errorAccessIllustration}
          alt=""
          aria-hidden="true"
        />
        <h2 className="smplfy-design-handoff-error-title mb-0" id="task-access-error-modal-title">
          Access Error
        </h2>
        <p className="smplfy-design-handoff-error-copy mb-0">
          Aarav Mehta is working on this task right now. Please wait until they finish before accessing it.
        </p>
        <PrimaryButton onClick={onClose}>
          I Understand
        </PrimaryButton>
      </div>
    </Modal>
  );
}

function TaskCooldownErrorModal({ open, onClose }) {
  const [remainingSeconds, setRemainingSeconds] = useState(60);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    setRemainingSeconds(60);
    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [open]);

  return (
    <Modal
      open={open}
      title="Access Error"
      titleId="task-cooldown-error-modal-title"
      onClose={onClose}
      size="md"
      className="smplfy-design-handoff-error-modal"
      showCloseButton={false}
    >
      <div className="smplfy-design-handoff-error-content d-flex flex-column align-items-center text-center">
        <img
          className="smplfy-design-handoff-error-illustration"
          src={errorCooldownIllustration}
          alt=""
          aria-hidden="true"
        />
        <h2 className="smplfy-design-handoff-error-title mb-0" id="task-cooldown-error-modal-title">
          Access Error
        </h2>
        <p className="smplfy-design-handoff-error-copy mb-0">
          Please try again in {remainingSeconds} seconds.
        </p>

        <div className="smplfy-design-handoff-error-divider" aria-hidden="true" />

        <div className="smplfy-design-handoff-error-reasons d-flex flex-column gap-2 text-start">
          <h3 className="smplfy-design-handoff-error-subtitle mb-0">Why am I seeing this?</h3>
          <ul className="smplfy-design-handoff-error-list mb-0">
            <li>This task may already be open in another tab. Close the other tab and try again shortly.</li>
            <li>You may have closed the task without submitting it.</li>
          </ul>
        </div>

        <PrimaryButton onClick={onClose}>
          I Understand
        </PrimaryButton>
      </div>
    </Modal>
  );
}

export default function DesignHandoffPage({
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  sidebarBadgeCounts,
}) {
  const [nodeDetailsModalOpen, setNodeDetailsModalOpen] = useState(false);
  const [taskAccessErrorModalOpen, setTaskAccessErrorModalOpen] = useState(false);
  const [taskCooldownErrorModalOpen, setTaskCooldownErrorModalOpen] = useState(false);
  const handoffItems = [
    {
      key: 'node-details-modal',
      label: 'Node Details Modal',
      onClick: () => setNodeDetailsModalOpen(true),
    },
    {
      key: 'nested-decision-rules',
      label: 'Nested Decision Rules',
      onClick: () => onNavigate?.('nested-decision-rules'),
    },
    {
      key: 'task-access-error',
      label: 'Error 1',
      onClick: () => setTaskAccessErrorModalOpen(true),
    },
    {
      key: 'task-cooldown-error',
      label: 'Error 2',
      onClick: () => setTaskCooldownErrorModalOpen(true),
    },
    {
      key: 'new-assessment',
      label: 'New Assessment',
      onClick: () => onNavigate?.('new-assessment'),
    },
    {
      key: 'training-management',
      label: 'Training & Assessment Management',
      onClick: () => onNavigate?.('training-management'),
    },
  ];

  return (
    <AppChrome
      activeNav="design-handoff"
      onNavigate={onNavigate}
      breadcrumbs={[{ key: 'design-handoff', label: 'Design Handoff', current: true }]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      sidebarBadgeCounts={sidebarBadgeCounts}
      pageHeader={<DesignHandoffHeader />}
    >
      <main className="smplfy-design-handoff-page bg-body-tertiary p-4 min-vh-100">
        <div className="container-fluid px-0">
          <div className="smplfy-design-handoff-list d-flex flex-column gap-2">
            {handoffItems.map((item) => (
              <button
                key={item.key}
                type="button"
                className="smplfy-card card btn smplfy-design-handoff-card text-start"
                onClick={item.onClick}
              >
                <span className="smplfy-design-handoff-card-title text-truncate">
                  {item.label}
                </span>
                <span className="smplfy-design-handoff-card-action text-secondary flex-shrink-0" aria-hidden="true">
                  <AppIcon name="chevron-right" />
                </span>
              </button>
            ))}
          </div>
        </div>
      </main>

      <NodeDetailsModal
        open={nodeDetailsModalOpen}
        onClose={() => setNodeDetailsModalOpen(false)}
      />
      <TaskAccessErrorModal
        open={taskAccessErrorModalOpen}
        onClose={() => setTaskAccessErrorModalOpen(false)}
      />
      <TaskCooldownErrorModal
        open={taskCooldownErrorModalOpen}
        onClose={() => setTaskCooldownErrorModalOpen(false)}
      />
    </AppChrome>
  );
}
