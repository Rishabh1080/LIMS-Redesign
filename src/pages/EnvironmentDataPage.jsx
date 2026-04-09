import { useEffect, useMemo, useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import { FormElement } from '../components/FormControls';
import Modal from '../components/Modal/Modal';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import './environment-data-page.css';

const defaultEnvironmentLogs = [
  {
    id: 'env-log-001',
    recordedBy: 'Lab Analyst',
    recordedAt: '06/03/2026, 08:15',
    temperature: '24.3',
    humidity: '48%',
    location: 'Main Laboratory',
  },
  {
    id: 'env-log-002',
    recordedBy: 'Shift Supervisor',
    recordedAt: '06/03/2026, 10:30',
    temperature: '25.1',
    humidity: '51%',
    location: 'Humidity Chamber',
  },
  {
    id: 'env-log-003',
    recordedBy: 'Quality Officer',
    recordedAt: '06/03/2026, 12:05',
    temperature: '24.8',
    humidity: '46%',
    location: 'Sample Receiving Bay',
  },
  {
    id: 'env-log-004',
    recordedBy: 'Lab Analyst',
    recordedAt: '06/03/2026, 14:20',
    temperature: '25.0',
    humidity: '49%',
    location: 'Instrument Room',
  },
  {
    id: 'env-log-005',
    recordedBy: 'Shift Supervisor',
    recordedAt: '06/03/2026, 16:45',
    temperature: '24.6',
    humidity: '50%',
    location: 'Main Laboratory',
  },
];

const initialDraft = {
  recordingDateTime: '',
  temperature: '',
  relativeHumidity: '',
  location: '',
};

const locationOptions = ['Main Laboratory', 'Humidity Chamber', 'Sample Receiving Bay', 'Instrument Room'];

const temperaturePattern = /^\d+(\.\d+)?$/;
const relativeHumidityPattern = /^\d+(\.\d+)?%$/;

function validateTemperature(value) {
  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return null;
  }

  return temperaturePattern.test(trimmedValue) ? null : 'Temperature must be a decimal number.';
}

function validateRelativeHumidity(value) {
  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return null;
  }

  const normalizedValue = trimmedValue.endsWith('%') ? trimmedValue : `${trimmedValue}%`;
  return relativeHumidityPattern.test(normalizedValue) ? null : 'Relative humidity must be a number followed by %.';
}

function EnvironmentDataHeader({ onAddDataLog }) {
  return (
    <section className="environment-data-page-header">
      <div className="container-fluid h-100 px-0">
        <div className="row h-100 align-items-center justify-content-between gx-0">
          <div className="col-auto">
            <h1 className="environment-data-page-header__title">Environment Data</h1>
          </div>

          <div className="col-auto">
            <PrimaryButton leftIcon="plus" onClick={onAddDataLog}>
              Add Data Log
            </PrimaryButton>
          </div>
        </div>
      </div>
    </section>
  );
}

function EnvironmentDataFormModal({
  open,
  values,
  errors,
  onChange,
  onBlur,
  onCancel,
  onSubmit,
}) {
  if (!open) {
    return null;
  }

  return (
    <Modal
      open={open}
      title="Add Data Log"
      titleId="environment-data-modal-title"
      titleIcon="cloud-data"
      onClose={onCancel}
      size="md"
      bodyClassName="environment-data-modal__body"
      actionsClassName="environment-data-modal__actions"
      actions={
        <>
          <SecondaryButton leftIcon="close" size="large" className="environment-data-modal__cancel" onClick={onCancel}>
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" form="environment-data-form" leftIcon="save">
            Submit
          </PrimaryButton>
        </>
      }
    >
      <form
        id="environment-data-form"
        className="environment-data-modal__form"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div className="environment-data-modal__field environment-data-modal__field--full">
          <FormElement
            type="text"
            mandatory
            label="Recording date and time"
            message={errors.recordingDateTime}
            messageTone="error"
              inputProps={{
                value: values.recordingDateTime,
                placeholder: '06/03/2026, 10:13',
                onChange: (event) => onChange('recordingDateTime', event.target.value),
                onBlur: () => onBlur('recordingDateTime', values.recordingDateTime),
              }}
            />
          </div>

        <div className="environment-data-modal__grid">
          <div className="environment-data-modal__field">
            <FormElement
              type="text"
              label="Temperature"
              message={errors.temperature}
              messageTone="error"
              inputProps={{
                value: values.temperature,
                placeholder: '24.3',
                onChange: (event) => onChange('temperature', event.target.value),
                onBlur: () => onBlur('temperature', values.temperature),
              }}
            />
          </div>

          <div className="environment-data-modal__field">
            <FormElement
              type="text"
              label="Relative humidity"
              message={errors.relativeHumidity}
              messageTone="error"
              inputProps={{
                value: values.relativeHumidity,
                placeholder: '48%',
                onChange: (event) => onChange('relativeHumidity', event.target.value),
                onBlur: () => onBlur('relativeHumidity', values.relativeHumidity),
              }}
            />
          </div>
        </div>

        <div className="environment-data-modal__field environment-data-modal__field--full">
          <FormElement
            type="dropdown"
            label="Location"
            inputProps={{
              value: values.location,
              placeholder: 'Select location',
              options: locationOptions,
              onChange: (event) => onChange('location', event.target.value),
            }}
          />
        </div>
      </form>
    </Modal>
  );
}

function EnvironmentDataEmptyState() {
  return (
    <div className="environment-data-page__empty">
      <div className="environment-data-page__empty-icon">
        <AppIcon name="cloud-data" size={24} />
      </div>
      <div className="environment-data-page__empty-title">No environment data logs</div>
      <div className="environment-data-page__empty-copy">
        New logs added through the primary action will appear here.
      </div>
    </div>
  );
}

export default function EnvironmentDataPage({
  logs = defaultEnvironmentLogs,
  onAddDataLog,
  onDeleteLog,
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
}) {
  const [visibleLogs, setVisibleLogs] = useState(logs);
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState(initialDraft);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setVisibleLogs(logs);
  }, [logs]);

  useEffect(() => {
    if (!modalOpen) {
      setErrors({});
    }
  }, [modalOpen]);

  const logCountLabel = useMemo(() => `${visibleLogs.length} Logs`, [visibleLogs.length]);

  const openModal = () => {
    setDraft(initialDraft);
    setErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setDraft(initialDraft);
    setErrors({});
  };

  const handleDeleteLog = (logId) => {
    setVisibleLogs((current) => current.filter((log) => log.id !== logId));
    onDeleteLog?.(logId);
  };

  const handleFieldChange = (field, value) => {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));

    if (field === 'recordingDateTime' && value.trim()) {
      setErrors((current) => {
        const next = { ...current };
        delete next.recordingDateTime;
        return next;
      });
    }

    if (field === 'temperature') {
      setErrors((current) => {
        const next = { ...current };
        delete next.temperature;
        return next;
      });
    }

    if (field === 'relativeHumidity') {
      setErrors((current) => {
        const next = { ...current };
        delete next.relativeHumidity;
        return next;
      });
    }
  };

  const handleFieldBlur = (field, value) => {
    if (field === 'temperature') {
      const nextError = validateTemperature(value);
      setErrors((current) => {
        const next = { ...current };
        if (nextError) {
          next.temperature = nextError;
        } else {
          delete next.temperature;
        }
        return next;
      });
      return;
    }

    if (field === 'relativeHumidity') {
      const trimmedValue = value.trim();
      if (!trimmedValue) {
        setErrors((current) => {
          const next = { ...current };
          delete next.relativeHumidity;
          return next;
        });
        return;
      }

      const normalizedValue = trimmedValue.endsWith('%') ? trimmedValue : `${trimmedValue}%`;
      const nextError = validateRelativeHumidity(normalizedValue);
      if (!nextError && normalizedValue !== value) {
        setDraft((current) => ({
          ...current,
          relativeHumidity: normalizedValue,
        }));
      }

      setErrors((current) => {
        const next = { ...current };
        if (nextError) {
          next.relativeHumidity = nextError;
        } else {
          delete next.relativeHumidity;
        }
        return next;
      });
    }
  };

  const handleSubmit = () => {
    const nextErrors = {};

    if (!draft.recordingDateTime.trim()) {
      nextErrors.recordingDateTime = 'Recording date and time is required.';
    }

    const temperatureError = validateTemperature(draft.temperature);
    if (temperatureError) {
      nextErrors.temperature = temperatureError;
    }

    const humidityError = validateRelativeHumidity(draft.relativeHumidity);
    if (humidityError) {
      nextErrors.relativeHumidity = humidityError;
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    const nextLog = {
      id: `env-log-${Date.now()}`,
      recordedBy: 'Lab Analyst',
      recordedAt: draft.recordingDateTime.trim(),
      temperature: draft.temperature.trim() || '—',
      humidity: draft.relativeHumidity.trim() || '—',
      location: draft.location.trim() || '—',
    };

    setVisibleLogs((current) => [nextLog, ...current]);
    onAddDataLog?.(nextLog);
    closeModal();
  };

  return (
    <AppChrome
      activeNav="environment-data"
      onNavigate={onNavigate}
      breadcrumbs={[{ key: 'environment-data', label: 'Environment Data', current: true }]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      pageHeader={<EnvironmentDataHeader onAddDataLog={openModal} />}
    >
      <main className="environment-data-page">
        <div className="container-fluid px-0">
          <div className="environment-data-page__count">{logCountLabel}</div>

          <section className="environment-data-table-card">
            {visibleLogs.length ? (
              <div className="environment-data-table-wrap">
                <table className="environment-data-table">
                  <thead>
                    <tr>
                      <th scope="col" className="environment-data-table__col--recorded-by">
                        Recorded By
                      </th>
                      <th scope="col" className="environment-data-table__col--recorded-at">
                        Recorded At
                      </th>
                      <th scope="col" className="environment-data-table__col--temperature">
                        Temperature
                      </th>
                      <th scope="col" className="environment-data-table__col--humidity">
                        Relative Humidity
                      </th>
                      <th scope="col" className="environment-data-table__col--location">
                        Location
                      </th>
                      <th scope="col" className="environment-data-table__col--actions">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="environment-data-table__col--recorded-by">{log.recordedBy}</td>
                        <td className="environment-data-table__col--recorded-at">{log.recordedAt}</td>
                        <td className="environment-data-table__col--temperature">{log.temperature}</td>
                        <td className="environment-data-table__col--humidity">{log.humidity}</td>
                        <td className="environment-data-table__col--location">{log.location}</td>
                        <td className="environment-data-table__col--actions">
                          <PrimaryButton
                            styleVariant="destructive"
                            size="small"
                            leftIcon="trash"
                            aria-label={`Delete environment log recorded by ${log.recordedBy} at ${log.recordedAt}`}
                            onClick={() => handleDeleteLog(log.id)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EnvironmentDataEmptyState />
            )}
          </section>
        </div>
      </main>

      <EnvironmentDataFormModal
        open={modalOpen}
        values={draft}
        errors={errors}
        onChange={handleFieldChange}
        onBlur={handleFieldBlur}
        onCancel={closeModal}
        onSubmit={handleSubmit}
      />
    </AppChrome>
  );
}
