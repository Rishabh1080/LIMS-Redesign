import { useEffect, useRef, useState } from 'react';
import Checkbox from '../components/Checkbox/Checkbox';
import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import { FormElement, ToastNotification } from '../components/FormControls';
import NavSelector from '../components/NavSelector';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import StatusPill from '../components/StatusPill';
import { AllocateTestRequestButton, ViewTestRequestButton } from '../components/TestRequestActions';
import { getStatusPresentation } from '../status/statusRegistry';
import './test-requests-listing-page.css';

const targetReportingDate = '31/03/2026';

function getDateOnly(value) {
  const normalizedValue = String(value ?? '').trim();

  if (!normalizedValue) {
    return '';
  }

  const [beforeComma] = normalizedValue.split(',');
  const dateMatch = beforeComma.match(/\d{2}\s*\/\s*\d{2}\s*\/\s*\d{4}/);

  return dateMatch ? dateMatch[0].replace(/\s+/g, '') : beforeComma.trim();
}

const initialRequestRows = [
  {
    id: 'URLS/26/ULRS/O/2026/30/330',
    status: 'Not allocated',
    allocated: false,
    parameter: 'Total Iron as Fe',
    testMethod: 'IS:3025 (Part 53) 2024',
    product: 'Boiler Water',
    age: '30 min ago',
    reportingDate: targetReportingDate,
  },
  {
    id: 'URLS/26/ULRS/O/2026/30/331',
    status: 'Not allocated',
    allocated: false,
    parameter: 'Total Hardness as CaCO3',
    testMethod: 'IS:3025 (Part 53) 2024',
    product: 'Boiler Water',
    age: '30 min ago',
    reportingDate: targetReportingDate,
  },
  {
    id: 'URLS/26/ULRS/O/2026/30/332',
    status: 'Not allocated',
    allocated: false,
    parameter: 'Total Dissolved Solids',
    testMethod: 'IS:3025 (Part 53) 2024',
    product: 'Boiler Water',
    age: '30 min ago',
    reportingDate: targetReportingDate,
  },
  {
    id: 'URLS/26/ULRS/O/2026/30/333',
    status: 'Not allocated',
    allocated: false,
    parameter: 'Total Alkalinity as CaCO3',
    testMethod: 'IS:3025 (Part 53) 2024',
    product: 'Boiler Water',
    age: '30 min ago',
    reportingDate: targetReportingDate,
  },
  {
    id: 'URLS/26/ULRS/O/2026/30/334',
    status: 'Not allocated',
    allocated: false,
    parameter: 'Dissolved Oxygen',
    testMethod: 'IS:3025 (Part 53) 2024',
    product: 'Boiler Water',
    age: '30 min ago',
    reportingDate: targetReportingDate,
  },
];

const initialJobRows = [
  {
    id: 'URLS/O/26-27',
    status: 'Not allocated',
    product: 'Boiler Water',
    age: '30 minutes ago',
    reportingDate: targetReportingDate,
    action: 'allocate',
  },
  {
    id: 'URLS/O/26-27',
    status: 'Result Under Testing',
    product: 'Boiler Water',
    age: '30 minutes ago',
    reportingDate: targetReportingDate,
    action: 'view',
  },
  {
    id: 'URLS/O/26-27',
    status: 'Result Under Approval',
    product: 'Boiler Water',
    age: '30 minutes ago',
    reportingDate: targetReportingDate,
    action: 'view',
  },
  {
    id: 'URLS/O/26-27',
    status: 'Rejected',
    product: 'Boiler Water',
    age: '30 minutes ago',
    reportingDate: targetReportingDate,
    action: 'view',
  },
  {
    id: 'URLS/O/26-27',
    status: 'Approved',
    product: 'Boiler Water',
    age: '30 minutes ago',
    reportingDate: targetReportingDate,
    action: 'view',
  },
];

const allocationTabs = [
  { key: 'analyst', label: 'Analysts' },
  { key: 'instrument', label: 'Instrument' },
  { key: 'material', label: 'Material' },
];

const allocationTableByTab = {
  analyst: {
    columns: ['Sr.', 'User Name', '# of TR for Parameter', 'Last Tested On', 'Worload (Man Days)', 'Has Valid Certification?', 'On leave?', 'Workload Sheet'],
    rows: [
      ['1', 'Technical Assistant', '19', '01-04-2026', '115506', 'No', 'No', 'Link'],
      ['2', 'Technical Assistant', '19', '01-04-2026', '115506', 'No', 'No', 'Link'],
      ['3', 'Technical Assistant', '19', '01-04-2026', '115506', 'No', 'No', 'Link'],
      ['4', 'Technical Assistant', '19', '01-04-2026', '115506', 'No', 'No', 'Link'],
      ['4', 'Technical Assistant', '19', '01-04-2026', '115506', 'No', 'No', 'Link'],
      ['4', 'Technical Assistant', '19', '01-04-2026', '115506', 'No', 'No', 'Link'],
      ['4', 'Technical Assistant', '19', '01-04-2026', '115506', 'No', 'No', 'Link'],
      ['4', 'Technical Assistant', '19', '01-04-2026', '115506', 'No', 'No', 'Link'],
      ['4', 'Technical Assistant', '19', '01-04-2026', '115506', 'No', 'No', 'Link'],
      ['4', 'Technical Assistant', '19', '01-04-2026', '115506', 'No', 'No', 'Link'],
      ['4', 'Technical Assistant', '19', '01-04-2026', '115506', 'No', 'No', 'Link'],
      ['4', 'Technical Assistant', '19', '01-04-2026', '115506', 'No', 'No', 'Link'],
      ['4', 'Technical Assistant', '19', '01-04-2026', '115506', 'No', 'No', 'Link'],
      ['4', 'Technical Assistant', '19', '01-04-2026', '115506', 'No', 'No', 'Link'],
    ],
  },
  instrument: {
    columns: ['Sr.', 'Instrument Name', 'Last Calibrated At', 'Overall Workload'],
    rows: [
      ['1', 'Technical Assistant', '01-04-2026', '12'],
      ['2', 'Technical Assistant', '01-04-2026', '12'],
      ['3', 'Technical Assistant', '01-04-2026', '12'],
    ],
  },
  material: {
    columns: ['Sr.', 'Material Name', 'Required Quantity', 'Available Quantity'],
    rows: [
      ['1', '5% Concentrated NaOH', '1000', '2500'],
      ['2', '5% Concentrated NaOH', '1000', '2500'],
      ['3', '5% Concentrated NaOH', '1000', '2500'],
      ['4', '5% Concentrated NaOH', '1000', '2500'],
    ],
  },
};

const allocationTemplate = 'Worksheet & Raw Data Register- NABL(Total Alkalinity as CaCO3 mg/l)';

function buildRequestRows(viewMode) {
  if (viewMode === 'approved') {
    return initialRequestRows.map((row) => ({
      ...row,
      status: 'Approved',
      allocated: true,
    }));
  }

  return initialRequestRows;
}

function buildJobRows(viewMode) {
  if (viewMode === 'approved') {
    return initialJobRows.map((row) => ({
      ...row,
      status: 'Approved',
      action: 'view',
    }));
  }

  return initialJobRows;
}

function PageHeader({ onBack }) {
  return (
    <section className="tr-listing-page-header">
      <div className="tr-listing-page-header__title-wrap">
        <SecondaryButton size="medium" className="tr-listing-page-header__back" aria-label="Go back" onClick={onBack}>
          <AppIcon name="chevron-left" />
        </SecondaryButton>
        <h1>All Test Requests</h1>
      </div>
    </section>
  );
}

function AllocationModal({
  open,
  activeTab,
  details,
  allocateTo,
  reviewer,
  instrument,
  onSubmit,
  onTabChange,
  onAllocateToChange,
  onReviewerChange,
  onInstrumentChange,
  onCancel,
}) {
  if (!open) {
    return null;
  }

  const table = allocationTableByTab[activeTab];
  const gridClass = `tr-allocation-table tr-allocation-table--${activeTab}`;

  return (
    <div className="tr-allocation-modal" role="dialog" aria-modal="true" aria-labelledby="tr-allocation-title">
      <div className="tr-allocation-modal__backdrop" onClick={onCancel} />
      <div className="tr-allocation-modal__card">
        <div className="tr-allocation-modal__header">
          <div className="tr-allocation-modal__title-row">
            <AppIcon name="user-plus" size={24} className="tr-allocation-modal__title-icon" />
            <h2 id="tr-allocation-title">Allocate Test Request</h2>
          </div>
          <button className="tr-allocation-modal__close btn" aria-label="Close modal" onClick={onCancel}>
            <AppIcon name="close" size={24} />
          </button>
        </div>

        <div className="tr-allocation-modal__body">
          <div className="tr-allocation-modal__main">
            <div className="tr-allocation-modal__details">
              <div className="tr-allocation-modal__detail-row">
                <div className="tr-allocation-modal__detail-label">Test Parameter</div>
                <div className="tr-allocation-modal__detail-value">{details.parameter}</div>
              </div>
              <div className="tr-allocation-modal__detail-row">
                <div className="tr-allocation-modal__detail-label">MoA</div>
                <div className="tr-allocation-modal__detail-value">{details.moa}</div>
              </div>
              <div className="tr-allocation-modal__detail-row">
                <div className="tr-allocation-modal__detail-label">Template</div>
                <div className="tr-allocation-modal__detail-value">{details.template}</div>
              </div>
            </div>

            <div className="tr-allocation-modal__tabs-section">
              <div className="tr-allocation-modal__tabs">
                {allocationTabs.map((tab) => (
                  <NavSelector
                    key={tab.key}
                    size="medium"
                    className="tr-allocation-modal__tab"
                    active={activeTab === tab.key}
                    onClick={() => onTabChange(tab.key)}
                  >
                    {tab.label}
                  </NavSelector>
                ))}
              </div>

              <div className="tr-allocation-modal__table-wrap">
              <div className={`${gridClass} tr-allocation-table__head`}>
                {table.columns.map((column) => (
                  <div key={column}>{column}</div>
                ))}
              </div>
              <div className="tr-allocation-modal__table-body">
                {table.rows.map((row, rowIndex) => (
                  <div className={`${gridClass} tr-allocation-table__row`} key={`${activeTab}-${rowIndex}`}>
                    {row.map((cell, cellIndex) => (
                      <div
                        key={`${activeTab}-${rowIndex}-${cellIndex}`}
                        className={cell === 'Link' ? 'tr-allocation-table__link' : ''}
                      >
                        {cell}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            </div>
          </div>

          <div className="tr-allocation-modal__side">
            <div className="tr-allocation-modal__form">
              <FormElement
                type="dropdown"
                label="Allocate to"
                inputProps={{
                  value: allocateTo,
                  placeholder: 'Select person',
                  options: ['Universal Admin', 'Technical Manager', 'Quality Team'],
                  onChange: (event) => onAllocateToChange(event.target.value),
                }}
              />
              <FormElement
                type="dropdown"
                label="Reviewer"
                inputProps={{
                  value: reviewer,
                  placeholder: 'Select person',
                  options: ['Universal Admin', 'Technical Manager', 'Quality Team'],
                  onChange: (event) => onReviewerChange(event.target.value),
                }}
              />
              <FormElement
                type="dropdown"
                label="Instrument"
                inputProps={{
                  value: instrument,
                  placeholder: 'Select Instrument',
                  options: ['Instrument A', 'Instrument B', 'Instrument C'],
                  onChange: (event) => onInstrumentChange(event.target.value),
                }}
              />
            </div>

            <div className="tr-allocation-modal__actions">
          <SecondaryButton leftIcon="close" size="large" className="tr-allocation-modal__cancel" onClick={onCancel}>
            Cancel
          </SecondaryButton>
              <PrimaryButton leftIcon="user-plus" onClick={onSubmit}>
                Allocate
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function JobAllocationModal({
  open,
  jobId,
  allocateTo,
  reviewer,
  onAllocateToChange,
  onReviewerChange,
  onCancel,
  onSubmit,
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="tr-job-allocation-modal" role="dialog" aria-modal="true" aria-labelledby="tr-job-allocation-title">
      <div className="tr-job-allocation-modal__backdrop" onClick={onCancel} />
      <div className="tr-job-allocation-modal__card">
        <div className="tr-job-allocation-modal__header">
          <div className="tr-job-allocation-modal__title-row">
            <AppIcon name="user-plus" size={24} className="tr-job-allocation-modal__title-icon" />
            <h2 id="tr-job-allocation-title">Allocate Job</h2>
          </div>
          <button className="tr-job-allocation-modal__close btn" aria-label="Close modal" onClick={onCancel}>
            <AppIcon name="close" size={24} />
          </button>
        </div>

        <div className="tr-job-allocation-modal__body">
          <div className="tr-job-allocation-modal__job-row">
            <span className="tr-job-allocation-modal__job-label">Job ID:</span>
            <span className="tr-job-allocation-modal__job-value">{jobId}</span>
          </div>

          <div className="tr-job-allocation-modal__fields">
            <FormElement
              type="dropdown"
              label="Allocate to"
              inputProps={{
                value: allocateTo,
                placeholder: 'Select person',
                options: ['Universal Admin', 'Technical Manager', 'Quality Team'],
                onChange: (event) => onAllocateToChange(event.target.value),
              }}
            />
            <FormElement
              type="dropdown"
              label="Reviewer"
              inputProps={{
                value: reviewer,
                placeholder: 'Select person',
                options: ['Universal Admin', 'Technical Manager', 'Quality Team'],
                onChange: (event) => onReviewerChange(event.target.value),
              }}
            />
          </div>
        </div>

        <div className="tr-job-allocation-modal__actions">
          <SecondaryButton
            leftIcon="close"
            size="large"
            className="tr-job-allocation-modal__cancel"
            onClick={onCancel}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton leftIcon="user-plus" onClick={onSubmit}>
            Allocate
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function InlineSelect({ label, placeholder, value, onChange, options, error = false }) {
  const fieldStateClass = error
    ? 'smplfy-input-field--error'
    : value
      ? 'smplfy-input-field--filled'
      : 'smplfy-input-field--empty';

  return (
    <div className="tr-inline-select">
      <label className="tr-inline-select__label">{label}</label>
      <div className={`smplfy-input-field smplfy-input-field--default ${fieldStateClass} tr-inline-select__field`}>
        <div className="smplfy-input-field__shell">
          <select
            className="smplfy-input-field__control smplfy-input-field__control--select"
            value={value}
            onChange={(event) => onChange(event.target.value)}
          >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
          </select>
          <span className="smplfy-input-field__icon" aria-hidden="true">
            <AppIcon name="chevron-down" size={20} />
          </span>
        </div>
      </div>
    </div>
  );
}

function RequestsCardSelection({
  requests,
  selectedRequestIds,
  onToggleRequest,
  onCreateJobModeChange,
  onCreateJob,
  onOpenTrDetails,
  assignee,
  reviewer,
  assigneeError,
  reviewerError,
  onAssigneeChange,
  onReviewerChange,
  readOnly = false,
}) {
  return (
    <section className="tr-card tr-card--requests tr-card--selection">
      <div className="tr-card__selection-header">
        <div className="tr-card__selection-controls">
          {readOnly ? null : (
            <>
              <InlineSelect
                label="Assignee:"
                placeholder="Select assignee"
                value={assignee}
                onChange={onAssigneeChange}
                options={['Universal Admin', 'Technical Manager', 'Quality Team']}
                error={assigneeError}
              />
              <InlineSelect
                label="Reviewer:"
                placeholder="Select reviewer"
                value={reviewer}
                onChange={onReviewerChange}
                options={['Universal Admin', 'Technical Manager', 'Quality Team']}
                error={reviewerError}
              />
            </>
          )}
        </div>

        {readOnly ? null : (
          <div className="tr-card__selection-actions">
            <SecondaryButton
              leftIcon="close"
              size="large"
              className="tr-selection-cancel"
              onClick={() => onCreateJobModeChange(false)}
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton leftIcon="plus" onClick={onCreateJob}>
              Create Job
            </PrimaryButton>
          </div>
        )}
      </div>

      <div className="tr-grid tr-grid--selection tr-grid--head">
        <div className="tr-selection-checkbox-head">
          <Checkbox
            checked={
              requests.some((row) => !row.allocated) &&
              selectedRequestIds.length === requests.filter((row) => !row.allocated).length
            }
            ariaLabel="Select all test requests"
            onChange={(nextChecked) => {
              requests.forEach((row) => {
                if (!row.allocated) {
                  onToggleRequest(row.id, nextChecked);
                }
              });
            }}
          />
        </div>
        <div>Test Request ID</div>
        <div>Parameter</div>
        <div>Test Method</div>
        <div>Product</div>
        <div>Age</div>
        <div>Target Reporting Date</div>
      </div>

      <div className="tr-card__rows">
        {requests.map((row) => (
          <div className="tr-grid tr-grid--selection tr-grid--row tr-grid--selection-row" key={row.id + row.parameter}>
            <div className="tr-selection-checkbox-cell">
              <Checkbox
                checked={selectedRequestIds.includes(row.id)}
                disabled={row.allocated}
                ariaLabel={`Select ${row.id}`}
                onChange={(nextChecked) => onToggleRequest(row.id, nextChecked)}
              />
            </div>
            <a
              href="/"
              className="tr-link"
              onClick={(event) => {
                event.preventDefault();
                onOpenTrDetails?.(row.id);
              }}
            >
              {row.id}
            </a>
            <div className="tr-cell--truncate">{row.parameter}</div>
            <div className="tr-cell--truncate">{row.testMethod}</div>
            <div>{row.product}</div>
            <div>{row.age}</div>
            <div>{getDateOnly(row.reportingDate)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function RequestsCard({ requests, createJobMode, onCreateJobModeChange, onCreateJob, onAllocate, onOpenTrDetails, readOnly = false }) {
  const [selectedRequestIds, setSelectedRequestIds] = useState([]);
  const [assignee, setAssignee] = useState('');
  const [reviewer, setReviewer] = useState('');
  const [assigneeError, setAssigneeError] = useState(false);
  const [reviewerError, setReviewerError] = useState(false);

  useEffect(() => {
    setSelectedRequestIds((current) =>
      current.filter((requestId) => requests.some((row) => row.id === requestId && !row.allocated)),
    );
  }, [requests]);

  const handleToggleRequest = (requestId, checked) => {
    setSelectedRequestIds((current) => {
      if (checked) {
        return current.includes(requestId) ? current : [...current, requestId];
      }

      return current.filter((id) => id !== requestId);
    });
  };

  const handleCreateJob = () => {
    const nextAssigneeError = !assignee;
    const nextReviewerError = !reviewer;

    setAssigneeError(nextAssigneeError);
    setReviewerError(nextReviewerError);

    if (nextAssigneeError || nextReviewerError) {
      return;
    }

    onCreateJob(selectedRequestIds, { assignee, reviewer });

    if (selectedRequestIds.length > 0) {
      setSelectedRequestIds([]);
      setAssignee('');
      setReviewer('');
      setAssigneeError(false);
      setReviewerError(false);
    }
  };

  if (createJobMode) {
    return (
      <RequestsCardSelection
        requests={requests}
        selectedRequestIds={selectedRequestIds}
        onToggleRequest={handleToggleRequest}
        onCreateJobModeChange={onCreateJobModeChange}
        onCreateJob={handleCreateJob}
        assignee={assignee}
        reviewer={reviewer}
        assigneeError={assigneeError}
        reviewerError={reviewerError}
        onOpenTrDetails={onOpenTrDetails}
        onAssigneeChange={(value) => {
          setAssignee(value);
          if (value) {
            setAssigneeError(false);
          }
        }}
        onReviewerChange={(value) => {
          setReviewer(value);
          if (value) {
            setReviewerError(false);
          }
        }}
        readOnly={readOnly}
      />
    );
  }

  return (
    <section className="tr-card tr-card--requests">
      <div className="tr-card__header">
        <div className="tr-card__title">{requests.length} Test Requests</div>
        {readOnly ? null : (
          <PrimaryButton leftIcon="plus" onClick={() => onCreateJobModeChange(true)}>
            Create Job
          </PrimaryButton>
        )}
      </div>

      <div className="row gx-0 flex-nowrap tr-table-row tr-table-row--head">
        <div className="col-auto tr-table-cell tr-table-cell--request-id">Test Request ID</div>
        <div className="col-auto tr-table-cell tr-table-cell--status">Status</div>
        <div className="col tr-table-cell tr-table-cell--truncate">Parameter</div>
        <div className="col tr-table-cell tr-table-cell--truncate">Test Method</div>
        <div className="col tr-table-cell tr-table-cell--truncate">Product</div>
        <div className="col tr-table-cell tr-table-cell--truncate">Age</div>
        <div className="col tr-table-cell tr-table-cell--truncate">Target Reporting Date</div>
        <div className="col-auto tr-table-cell tr-table-cell--actions">
          <div className="tr-actions-shell">Action</div>
        </div>
      </div>

      <div className="tr-card__rows">
        {requests.map((row) => (
          <div className="row gx-0 flex-nowrap tr-table-row tr-table-row--body" key={row.id + row.parameter}>
            <div className="col-auto tr-table-cell tr-table-cell--request-id">
              <a
                href="/"
                className="tr-link"
                onClick={(event) => {
                  event.preventDefault();
                  onOpenTrDetails?.(row.id);
                }}
              >
                {row.id}
              </a>
            </div>
            <div className="col-auto tr-table-cell tr-table-cell--status">
              <div className="tr-request-status-cell">
                <StatusPill
                  color={getStatusPresentation('testRequest', row.status).color}
                  styleType={getStatusPresentation('testRequest', row.status).styleType}
                >
                  {getStatusPresentation('testRequest', row.status).label}
                </StatusPill>
              </div>
            </div>
            <div className="col tr-table-cell tr-table-cell--truncate">{row.parameter}</div>
            <div className="col tr-table-cell tr-table-cell--truncate">{row.testMethod}</div>
            <div className="col tr-table-cell tr-table-cell--truncate">{row.product}</div>
            <div className="col tr-table-cell tr-table-cell--truncate">{row.age}</div>
            <div className="col tr-table-cell tr-table-cell--truncate">{getDateOnly(row.reportingDate)}</div>
            <div className="col-auto tr-table-cell tr-table-cell--actions">
              <div className="tr-actions-shell tr-request-actions">
                {!readOnly && !row.allocated ? <AllocateTestRequestButton onClick={() => onAllocate(row)} /> : null}
                <ViewTestRequestButton iconOnly={!row.allocated} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function JobsCard({ jobs, onAllocate, onOpenTrDetails, readOnly = false }) {
  return (
    <section className="tr-card tr-card--jobs">
      <div className="tr-card__header tr-card__header--simple">
        <div className="tr-card__title">{jobs.length} Jobs</div>
      </div>

      <div className="row gx-0 flex-nowrap tr-table-row tr-table-row--head">
        <div className="col-auto tr-table-cell tr-table-cell--request-id">Test Request ID</div>
        <div className="col-auto tr-table-cell tr-table-cell--status">Status</div>
        <div className="col tr-table-cell tr-table-cell--truncate">Product</div>
        <div className="col tr-table-cell tr-table-cell--truncate">Age</div>
        <div className="col tr-table-cell tr-table-cell--truncate">Target Reporting Date</div>
        <div className="col-auto tr-table-cell tr-table-cell--actions">
          <div className="tr-actions-shell">Action</div>
        </div>
      </div>

      <div className="tr-card__rows">
        {jobs.map((row, index) => (
          <div className="row gx-0 flex-nowrap tr-table-row tr-table-row--body" key={row.status + index}>
            <div className="col-auto tr-table-cell tr-table-cell--request-id">
              <a
                href="/"
                className="tr-link"
                onClick={(event) => {
                  event.preventDefault();
                  onOpenTrDetails?.(row.id);
                }}
              >
                {row.id}
              </a>
            </div>
            <div className="col-auto tr-table-cell tr-table-cell--status">
              <div className="tr-job-status-cell">
                <StatusPill
                  color={getStatusPresentation('testRequest', row.status).color}
                  styleType={getStatusPresentation('testRequest', row.status).styleType}
                >
                  {getStatusPresentation('testRequest', row.status).label}
                </StatusPill>
              </div>
            </div>
            <div className="col tr-table-cell tr-table-cell--truncate">{row.product}</div>
            <div className="col tr-table-cell tr-table-cell--truncate">{row.age}</div>
            <div className="col tr-table-cell tr-table-cell--truncate">{getDateOnly(row.reportingDate)}</div>
            <div className="col-auto tr-table-cell tr-table-cell--actions">
              <div className="tr-actions-shell tr-job-actions">
                {!readOnly && row.action === 'allocate' ? <AllocateTestRequestButton onClick={() => onAllocate(row)} /> : null}
                <ViewTestRequestButton />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function TestRequestsListingPage({
  sampleId = 'IICT/2025-2026/1101',
  sourcePage = 'all-samples',
  viewMode = 'standard',
  onBack,
  onOpenTrDetails,
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
}) {
  const [requests, setRequests] = useState(() => buildRequestRows(viewMode));
  const [jobs, setJobs] = useState(() => buildJobRows(viewMode));
  const [createJobMode, setCreateJobMode] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastTone, setToastTone] = useState('success');
  const [toastMessage, setToastMessage] = useState('Job created successfully.');
  const toastTimerRef = useRef(0);
  const [allocationModalOpen, setAllocationModalOpen] = useState(false);
  const [allocationTargetId, setAllocationTargetId] = useState(null);
  const [allocationTab, setAllocationTab] = useState('analyst');
  const [allocationDetails, setAllocationDetails] = useState({
    parameter: 'Volume of 0.02 N H2SO4 Required to Neutralize 100ml. sample of water using mixed indicator, ml',
    moa: 'IS:3025 (Part 53) 2024',
    template: allocationTemplate,
  });
  const [allocateTo, setAllocateTo] = useState('');
  const [reviewer, setReviewer] = useState('');
  const [instrument, setInstrument] = useState('');
  const [jobAllocationModalOpen, setJobAllocationModalOpen] = useState(false);
  const [jobAllocationTargetId, setJobAllocationTargetId] = useState(null);
  const [jobAllocateTo, setJobAllocateTo] = useState('');
  const [jobReviewer, setJobReviewer] = useState('');
  const readOnly = viewMode === 'approved';

  const showToast = (message, tone = 'success') => {
    window.clearTimeout(toastTimerRef.current);
    setToastTone(tone);
    setToastMessage(message);
    setToastVisible(true);
    toastTimerRef.current = window.setTimeout(() => setToastVisible(false), 5000);
  };

  useEffect(() => {
    return () => {
      window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  const handleCreateJob = (selectedRequestIds) => {
    if (readOnly) {
      return;
    }

    if (selectedRequestIds.length === 0) {
      showToast('Select test request to create job', 'error');
      return;
    }

    setRequests((current) => current.filter((row) => !selectedRequestIds.includes(row.id)));
    setJobs((current) => [
      {
        id: 'URLS/O/26-27',
        status: 'Result Under Testing',
        tone: 'info',
        product: 'Boiler Water',
        age: '30 minutes ago',
        reportingDate: targetReportingDate,
        action: 'view',
      },
      ...current,
    ]);
    setCreateJobMode(false);
    showToast('Job created successfully.');
  };

  const handleOpenAllocation = (row) => {
    if (readOnly) {
      return;
    }

    setAllocationTargetId(row.id);
    setAllocationDetails({
      parameter:
        row.parameter ?? 'Volume of 0.02 N H2SO4 Required to Neutralize 100ml. sample of water using mixed indicator, ml',
      moa: row.testMethod ?? 'IS:3025 (Part 53) 2024',
      template: allocationTemplate,
    });
    setAllocationTab('analyst');
    setAllocateTo('');
    setReviewer('');
    setInstrument('');
    setAllocationModalOpen(true);
  };

  const handleOpenJobAllocation = (row) => {
    if (readOnly) {
      return;
    }

    setJobAllocationTargetId(row.id);
    setJobAllocateTo('');
    setJobReviewer('');
    setJobAllocationModalOpen(true);
  };

  const handleSubmitAllocation = () => {
    if (readOnly) {
      setAllocationModalOpen(false);
      return;
    }

    if (!allocationTargetId) {
      setAllocationModalOpen(false);
      return;
    }

    setRequests((current) =>
      current.map((row) =>
        row.id === allocationTargetId
          ? {
              ...row,
              allocated: true,
              status: 'Result Under Testing',
            }
          : row,
      ),
    );
    setAllocationModalOpen(false);
  };

  const handleSubmitJobAllocation = () => {
    if (readOnly) {
      setJobAllocationModalOpen(false);
      return;
    }

    if (!jobAllocationTargetId) {
      setJobAllocationModalOpen(false);
      return;
    }

    setJobs((current) =>
      current.map((row) =>
        row.id === jobAllocationTargetId && row.action === 'allocate'
          ? {
              ...row,
              status: 'Result Under Testing',
              action: 'view',
            }
          : row,
      ),
    );
    setJobAllocationModalOpen(false);
    showToast('Job allocated successfully.');
  };

  const sourceLabel = sourcePage === 'all-samples' ? 'All Samples' : 'Samples Workspace';
  const activeNav = sourcePage === 'all-samples' ? 'all-samples' : 'samples-workspace';

  return (
    <AppChrome
      activeNav={activeNav}
      onNavigate={onNavigate}
      breadcrumbs={[
        { key: sourcePage, label: sourceLabel },
        { key: sampleId, label: sampleId },
        { key: 'all-test-requests', label: 'All Test Requests', current: true },
      ]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      pageHeader={<PageHeader onBack={onBack} />}
    >
      <main className="tr-listing-page">
        {requests.length > 0 ? (
        <RequestsCard
          requests={requests}
          createJobMode={createJobMode}
          onCreateJobModeChange={setCreateJobMode}
          onCreateJob={handleCreateJob}
          onAllocate={handleOpenAllocation}
          onOpenTrDetails={onOpenTrDetails}
          readOnly={readOnly}
        />
      ) : null}
        {jobs.length > 0 ? <JobsCard jobs={jobs} onAllocate={handleOpenJobAllocation} onOpenTrDetails={onOpenTrDetails} readOnly={readOnly} /> : null}
      </main>

      <ToastNotification
        key={`${toastTone}-${toastMessage}`}
        state={toastVisible ? 'default' : 'gone'}
        tone={toastTone}
        message={toastMessage}
        className="tr-job-created-toast"
        onClose={() => setToastVisible(false)}
      />

      <AllocationModal
        open={allocationModalOpen}
        activeTab={allocationTab}
        details={allocationDetails}
        allocateTo={allocateTo}
        reviewer={reviewer}
        instrument={instrument}
        onSubmit={handleSubmitAllocation}
        onTabChange={setAllocationTab}
        onAllocateToChange={setAllocateTo}
        onReviewerChange={setReviewer}
        onInstrumentChange={setInstrument}
        onCancel={() => setAllocationModalOpen(false)}
      />

      <JobAllocationModal
        open={jobAllocationModalOpen}
        jobId={jobAllocationTargetId ?? 'URLS/O/26-27'}
        allocateTo={jobAllocateTo}
        reviewer={jobReviewer}
        onAllocateToChange={setJobAllocateTo}
        onReviewerChange={setJobReviewer}
        onCancel={() => setJobAllocationModalOpen(false)}
        onSubmit={handleSubmitJobAllocation}
      />
    </AppChrome>
  );
}
