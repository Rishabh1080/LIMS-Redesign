const logs = [
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

const locationOptions = ['Main Laboratory', 'Humidity Chamber', 'Sample Receiving Bay', 'Instrument Room'];
const tablerIconBase = '../node_modules/@tabler/icons/icons/outline';

const logBody = document.getElementById('log-body');
const logCount = document.getElementById('log-count');
const modal = document.getElementById('log-modal');
const openModalButton = document.getElementById('open-modal');
const form = document.getElementById('log-form');
const fields = {
  recordingDateTime: document.getElementById('recordingDateTime'),
  temperature: document.getElementById('temperature'),
  relativeHumidity: document.getElementById('relativeHumidity'),
  location: document.getElementById('location'),
};

const errorNodes = {
  recordingDateTime: document.querySelector('[data-error-for="recordingDateTime"]'),
  temperature: document.querySelector('[data-error-for="temperature"]'),
  relativeHumidity: document.querySelector('[data-error-for="relativeHumidity"]'),
  location: document.querySelector('[data-error-for="location"]'),
};

const temperaturePattern = /^\d+(\.\d+)?$/;
const relativeHumidityPattern = /^\d+(\.\d+)?%$/;

function renderTable() {
  logBody.innerHTML = logs
    .map(
      (log) => `
        <tr>
          <td>${log.recordedBy}</td>
          <td>${log.recordedAt}</td>
          <td>${log.temperature}</td>
          <td>${log.humidity}</td>
          <td>${log.location}</td>
          <td class="col-actions">
            <button class="button button-danger js-delete" type="button" data-id="${log.id}" aria-label="Delete environment log recorded by ${log.recordedBy} at ${log.recordedAt}">
              <span class="button__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" class="icon" focusable="false" aria-hidden="true">
                  <path d="M5 7h14M10 7V5h4v2m-7 0 1 12h8l1-12" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M10 11v5M14 11v5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" />
                </svg>
              </span>
            </button>
          </td>
        </tr>
      `,
    )
    .join('');

  logCount.textContent = `${logs.length} Logs`;
}

async function loadTablerIcon(target) {
  const name = target.dataset.tablerIcon;
  if (!name) {
    return;
  }

  const response = await fetch(`${tablerIconBase}/${name}.svg`);
  if (!response.ok) {
    throw new Error(`Failed to load icon: ${name}`);
  }

  const svg = await response.text();
  target.innerHTML = svg;
}

async function loadAllTablerIcons() {
  const targets = document.querySelectorAll('[data-tabler-icon]');
  await Promise.all(Array.from(targets, loadTablerIcon));
}

function setModalOpen(isOpen) {
  modal.classList.toggle('is-open', isOpen);
  modal.setAttribute('aria-hidden', String(!isOpen));

  if (isOpen) {
    fields.recordingDateTime.focus();
  }
}

function clearErrors() {
  Object.values(errorNodes).forEach((node) => {
    node.textContent = '';
  });
}

function setError(name, message) {
  errorNodes[name].textContent = message || '';
}

function validateTemperature(value) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  return temperaturePattern.test(trimmed) ? null : 'Temperature must be a decimal number.';
}

function validateRelativeHumidity(value) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const normalized = trimmed.endsWith('%') ? trimmed : `${trimmed}%`;
  return relativeHumidityPattern.test(normalized) ? null : 'Relative humidity must end with %.';
}

function onFieldBlur(event) {
  const { name, value } = event.target;

  if (name === 'temperature') {
    const error = validateTemperature(value);
    setError(name, error);
    return;
  }

  if (name === 'relativeHumidity') {
    const trimmed = value.trim();
    if (!trimmed) {
      setError(name, '');
      return;
    }

    const normalized = trimmed.endsWith('%') ? trimmed : `${trimmed}%`;
    const error = validateRelativeHumidity(normalized);
    if (!error && normalized !== value) {
      event.target.value = normalized;
    }
    setError(name, error);
  }
}

function onFieldInput(event) {
  setError(event.target.name, '');
}

function onSubmit(event) {
  event.preventDefault();
  clearErrors();

  const nextErrors = {};
  const recordingDateTime = fields.recordingDateTime.value.trim();
  const temperature = fields.temperature.value.trim();
  const relativeHumidityRaw = fields.relativeHumidity.value.trim();
  const relativeHumidity = relativeHumidityRaw.endsWith('%') ? relativeHumidityRaw : `${relativeHumidityRaw}%`;
  const location = fields.location.value.trim();

  if (!recordingDateTime) {
    nextErrors.recordingDateTime = 'Recording date and time is required.';
  }

  const temperatureError = validateTemperature(temperature);
  if (temperatureError) {
    nextErrors.temperature = temperatureError;
  }

  const humidityError = validateRelativeHumidity(relativeHumidityRaw);
  if (humidityError) {
    nextErrors.relativeHumidity = humidityError;
  }

  if (!location) {
    nextErrors.location = 'Please select a location.';
  }

  Object.entries(nextErrors).forEach(([key, message]) => setError(key, message));

  if (Object.keys(nextErrors).length) {
    return;
  }

  logs.unshift({
    id: `env-log-${Date.now()}`,
    recordedBy: 'Lab Analyst',
    recordedAt: recordingDateTime,
    temperature: temperature || '—',
    humidity: relativeHumidity || '—',
    location,
  });

  renderTable();
  form.reset();
  setModalOpen(false);
}

function onDeleteLog(id) {
  const index = logs.findIndex((item) => item.id === id);
  if (index === -1) {
    return;
  }

  const confirmDelete = window.confirm('Delete this environment log?');
  if (!confirmDelete) {
    return;
  }

  logs.splice(index, 1);
  renderTable();
}

document.addEventListener('click', (event) => {
  const openTarget = event.target.closest('#open-modal');
  const closeTarget = event.target.closest('[data-close-modal]');
  const deleteTarget = event.target.closest('.js-delete');

  if (openTarget) {
    setModalOpen(true);
    return;
  }

  if (closeTarget) {
    setModalOpen(false);
    form.reset();
    clearErrors();
    return;
  }

  if (deleteTarget) {
    onDeleteLog(deleteTarget.dataset.id);
  }
});

form.addEventListener('submit', onSubmit);
form.addEventListener('input', onFieldInput);
form.addEventListener('blur', onFieldBlur, true);

locationOptions.forEach((option) => {
  const exists = Array.from(fields.location.options).some((item) => item.value === option);
  if (!exists) {
    const opt = document.createElement('option');
    opt.value = option;
    opt.textContent = option;
    fields.location.appendChild(opt);
  }
});

renderTable();

loadAllTablerIcons().catch((error) => {
  console.error(error);
});
