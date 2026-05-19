import { useEffect, useRef, useState } from 'react';
import Checkbox from '../components/Checkbox/Checkbox';
import AppChrome from '../components/AppChrome/AppChrome';
import DataTable from '../components/DataTable';
import { FormElement, InputFieldDropdown, ToastNotification } from '../components/FormControls';
import Modal from '../components/Modal/Modal';
import NavSelector from '../components/NavSelector';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import StatusPill from '../components/StatusPill';
import { AllocateTestRequestButton, ViewTestRequestButton } from '../components/TestRequestActions';
import { getStatusPresentation } from '../status/statusRegistry';
import './test-requests-listing-page.scss';

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
    <section className="smplfy-tr-listing-header bg-white border-bottom">
      <div className="d-flex align-items-center gap-3">
        <SecondaryButton size="medium" className="smplfy-tr-listing-header-back" leftIcon="chevron-left" aria-label="Go back" onClick={onBack} />
        <h1 className="h5 mb-0 fw-semibold text-dark">All Test Requests</h1>
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

  return (
    <Modal
      open={open}
      title="Allocate Test Request"
      titleId="tr-allocation-title"
      titleIcon="user-plus"
      onClose={onCancel}
      size="xl"
      cardClassName="smplfy-tr-allocation-modal-dialog"
      bodyClassName="smplfy-tr-allocation-modal-body"
    >
      <div className="smplfy-tr-allocation-layout">
        <div className="smplfy-tr-allocation-main">
          <div className="smplfy-tr-allocation-details">
            <dl className="mb-0">
              <div className="smplfy-tr-allocation-detail-row">
                <dt>Test Parameter</dt>
                <dd>{details.parameter}</dd>
              </div>
              <div className="smplfy-tr-allocation-detail-row">
                <dt>MoA</dt>
                <dd>{details.moa}</dd>
              </div>
              <div className="smplfy-tr-allocation-detail-row">
                <dt>Template</dt>
                <dd>{details.template}</dd>
              </div>
            </dl>
          </div>

          <div className="smplfy-tr-allocation-tabs-section">
            <div className="smplfy-tr-allocation-tabs nav nav-tabs border-0" role="tablist" aria-label="Allocation resources">
              {allocationTabs.map((tab) => (
                <NavSelector
                  key={tab.key}
                  size="medium"
                  className="smplfy-tr-allocation-tab"
                  active={activeTab === tab.key}
                  onClick={() => onTabChange(tab.key)}
                >
                  {tab.label}
                </NavSelector>
              ))}
            </div>

            <div className="smplfy-tr-allocation-table-wrap">
              <DataTable className={`smplfy-tr-allocation-table smplfy-tr-allocation-table-${activeTab}`}>
                <thead>
                  <tr>
                    {table.columns.map((column) => (
                      <th scope="col" key={column}>{column}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row, rowIndex) => (
                    <tr key={`${activeTab}-${rowIndex}`}>
                      {row.map((cell, cellIndex) => (
                        <td key={`${activeTab}-${rowIndex}-${cellIndex}`}>
                          {cell === 'Link' ? (
                            <button type="button" className="smplfy-link link-primary btn btn-link p-0 text-start text-decoration-none">
                              Link
                            </button>
                          ) : cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </DataTable>
            </div>
          </div>
        </div>

        <aside className="smplfy-tr-allocation-side">
          <div className="smplfy-tr-allocation-form">
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

          <div className="smplfy-tr-allocation-actions">
            <SecondaryButton leftIcon="close" size="large" className="smplfy-tr-allocation-cancel" onClick={onCancel}>
              Cancel
            </SecondaryButton>
            <PrimaryButton leftIcon="user-plus" onClick={onSubmit}>
              Allocate
            </PrimaryButton>
          </div>
        </aside>
      </div>
    </Modal>
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
    <Modal
      open={open}
      title="Allocate Job"
      titleId="tr-job-allocation-title"
      titleIcon="user-plus"
      onClose={onCancel}
      size="md"
      cardClassName="smplfy-tr-job-allocation-modal-dialog"
      bodyClassName="smplfy-tr-job-allocation-modal-body"
      actionsClassName="smplfy-tr-job-allocation-actions justify-content-between"
      actions={
        <>
          <SecondaryButton leftIcon="close" size="large" className="smplfy-tr-job-allocation-cancel" onClick={onCancel}>
            Cancel
          </SecondaryButton>
          <PrimaryButton leftIcon="user-plus" onClick={onSubmit}>
            Allocate
          </PrimaryButton>
        </>
      }
    >
      <div className="smplfy-tr-job-allocation-content">
        <div className="smplfy-tr-job-allocation-job-row">
          <span className="smplfy-tr-job-allocation-job-label">Job ID:</span>
          <span className="smplfy-tr-job-allocation-job-value">{jobId}</span>
        </div>

        <div className="smplfy-tr-job-allocation-fields">
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
    </Modal>
  );
}

function InlineSelect({ label, placeholder, value, onChange, options, error = false }) {
  return (
    <div className="d-flex align-items-center gap-2">
      <label className="form-label mb-0 text-secondary fw-medium text-nowrap">{label}</label>
      <InputFieldDropdown
        state={error ? 'error' : value ? 'filled' : 'default'}
        value={value}
        placeholder={placeholder}
        options={options}
        onChange={(event) => onChange(event.target.value)}
      />
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
    <section className="smplfy-tr-listing-card smplfy-card card border-0">
      <div className="card-body">
        <div className="smplfy-tr-listing-selection-header d-flex align-items-center justify-content-between gap-3 border-bottom">
        <div className="smplfy-tr-listing-selection-controls d-flex align-items-center gap-3 flex-wrap">
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
          <div className="smplfy-tr-listing-selection-actions d-flex align-items-center gap-2 flex-wrap">
            <SecondaryButton
              leftIcon="close"
              size="large"
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

        <DataTable className="smplfy-tr-listing-table smplfy-tr-listing-table-selection">
          <thead>
            <tr>
              <th scope="col" className="text-center">
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
              </th>
              <th scope="col">Test Request ID</th>
              <th scope="col">Parameter</th>
              <th scope="col">Test Method</th>
              <th scope="col">Product</th>
              <th scope="col">Age</th>
              <th scope="col">Target Reporting Date</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((row) => (
              <tr key={row.id + row.parameter}>
                <td className="text-center">
                  <Checkbox
                    checked={selectedRequestIds.includes(row.id)}
                    disabled={row.allocated}
                    ariaLabel={`Select ${row.id}`}
                    onChange={(nextChecked) => onToggleRequest(row.id, nextChecked)}
                  />
                </td>
                <td className="text-nowrap">
                  <a
                    href="/"
                    className="smplfy-link link-primary p-0"
                    onClick={(event) => {
                      event.preventDefault();
                      onOpenTrDetails?.(row.id, row.status);
                    }}
                  >
                    <span>{row.id}</span>
                  </a>
                </td>
                <td className="text-nowrap">{row.parameter}</td>
                <td className="text-nowrap">{row.testMethod}</td>
                <td className="text-nowrap">{row.product}</td>
                <td className="text-nowrap">{row.age}</td>
                <td className="text-nowrap">{getDateOnly(row.reportingDate)}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>
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
    <section className="smplfy-tr-listing-card smplfy-card card border-0">
      <div className="card-header bg-transparent d-flex align-items-center justify-content-between gap-3">
        <div className="fw-medium">{requests.length} Test Requests</div>
        {readOnly ? null : (
          <PrimaryButton leftIcon="plus" size="large" onClick={() => onCreateJobModeChange(true)}>
            Create Job
          </PrimaryButton>
        )}
      </div>

      <div className="card-body">
        <DataTable className="smplfy-tr-listing-table smplfy-tr-listing-table-requests">
          <thead>
            <tr>
              <th scope="col">Test Request ID</th>
              <th scope="col">Status</th>
              <th scope="col">Parameter</th>
              <th scope="col">Test Method</th>
              <th scope="col">Product</th>
              <th scope="col">Age</th>
              <th scope="col">Target Reporting Date</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((row) => (
              <tr key={row.id + row.parameter}>
                <td className="text-nowrap">
                  <a
                    href="/"
                    className="smplfy-link link-primary p-0"
                    onClick={(event) => {
                      event.preventDefault();
                      onOpenTrDetails?.(row.id, row.status);
                    }}
                  >
                    <span>{row.id}</span>
                  </a>
                </td>
                <td className="text-nowrap">
                  <StatusPill
                    color={getStatusPresentation('testRequest', row.status).color}
                    styleType={getStatusPresentation('testRequest', row.status).styleType}
                  >
                    {getStatusPresentation('testRequest', row.status).label}
                  </StatusPill>
                </td>
                <td className="text-nowrap">{row.parameter}</td>
                <td className="text-nowrap">{row.testMethod}</td>
                <td className="text-nowrap">{row.product}</td>
                <td className="text-nowrap">{row.age}</td>
                <td className="text-nowrap">{getDateOnly(row.reportingDate)}</td>
                <td className="text-nowrap">
                  <div className="d-flex align-items-center gap-2 flex-nowrap">
                    {!readOnly && !row.allocated ? <AllocateTestRequestButton size="medium" onClick={() => onAllocate(row)} /> : null}
                    <ViewTestRequestButton size="medium" iconOnly={!row.allocated} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </div>
    </section>
  );
}

function JobsCard({ jobs, onAllocate, onOpenTrDetails, readOnly = false }) {
  return (
    <section className="smplfy-tr-listing-card smplfy-card card border-0">
      <div className="card-header bg-transparent d-flex align-items-center">
        <div className="fw-medium">{jobs.length} Jobs</div>
      </div>

      <div className="card-body">
        <DataTable className="smplfy-tr-listing-table smplfy-tr-listing-table-jobs">
          <thead>
            <tr>
              <th scope="col">Test Request ID</th>
              <th scope="col">Status</th>
              <th scope="col">Product</th>
              <th scope="col">Age</th>
              <th scope="col">Target Reporting Date</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((row, index) => (
              <tr key={row.status + index}>
                <td className="text-nowrap">
                  <a
                    href="/"
                    className="smplfy-link link-primary p-0"
                    onClick={(event) => {
                      event.preventDefault();
                      onOpenTrDetails?.(row.id, row.status);
                    }}
                  >
                    <span>{row.id}</span>
                  </a>
                </td>
                <td className="text-nowrap">
                  <StatusPill
                    color={getStatusPresentation('testRequest', row.status).color}
                    styleType={getStatusPresentation('testRequest', row.status).styleType}
                  >
                    {getStatusPresentation('testRequest', row.status).label}
                  </StatusPill>
                </td>
                <td className="text-nowrap">{row.product}</td>
                <td className="text-nowrap">{row.age}</td>
                <td className="text-nowrap">{getDateOnly(row.reportingDate)}</td>
                <td className="text-nowrap">
                  <div className="d-flex align-items-center gap-2 flex-nowrap">
                    {!readOnly && row.action === 'allocate' ? <AllocateTestRequestButton size="medium" onClick={() => onAllocate(row)} /> : null}
                    <ViewTestRequestButton size="medium" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
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

    // Jobs in "Pending for allocation" should open the test request allocation modal
    setAllocationTargetId(row.id);
    setAllocationDetails({
      id: row.id,
      parameter: 'Multiple Parameters',
      moa: 'Wet Chemistry',
      template: allocationTemplate,
    });
    setAllocationTab('analyst');
    setAllocateTo('');
    setReviewer('');
    setInstrument('');
    setAllocationModalOpen(true);
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
      <main className="smplfy-tr-listing-page bg-body-tertiary min-vh-100 d-flex flex-column gap-3">
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
        className="position-fixed bottom-0 start-0 m-4"
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
