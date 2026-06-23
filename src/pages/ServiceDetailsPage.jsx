import { useEffect, useMemo, useRef, useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal/Modal';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import StatusPill from '../components/StatusPill';
import { ToastNotification } from '../components/FormControls';
import { isBreakdownServiceType } from '../data/instrumentServices';
import { getStatusPresentation } from '../status/statusRegistry';
import './sample-details-page.scss';

const defaultService = {
  id: 'SVC-2026-001',
  serviceDate: '04/06/2026',
  nextServiceDate: '06/07/2026',
  status: 'Not initialised',
  stage: 'service-created',
  serviceType: 'Calibration',
  summary: 'test',
  details: 'test',
};

const serviceStageConfig = {
  'service-created': {
    status: 'Not initialised',
    editable: false,
    activity: ['Service Created'],
    actionRequired: null,
    cta: 'initialize',
  },
  'pending-default': {
    status: 'Pending',
    editable: true,
    activity: ['Service Initialised', 'Service Created'],
    actionRequired: null,
    cta: 'pending-actions',
  },
  'approval-requested': {
    status: 'Pending',
    editable: false,
    activity: ['Approval Requested', 'Service Initialised', 'Service Created'],
    actionRequired: 'Approval Pending',
    cta: null,
  },
  'approved-under-analysis': {
    status: 'Under analysis',
    editable: true,
    activity: ['Service Approved', 'Approval Requested', 'Service Initialised', 'Service Created'],
    actionRequired: null,
    cta: 'send-for-approval',
  },
  'final-approval-requested': {
    status: 'Under analysis',
    editable: false,
    activity: ['Approval requested', 'Service Approved', 'Approval Requested', 'Service Initialised', 'Service Created'],
    actionRequired: 'Approval Pending',
    cta: null,
  },
  'analysis-done': {
    status: 'Approved',
    editable: false,
    activity: ['Service Concluded', 'Approval requested', 'Service Approved', 'Approval Requested', 'Service Initialised', 'Service Created'],
    actionRequired: null,
    cta: null,
  },
};

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

function normalizeStatus(status) {
  return String(status ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function getInitialServiceStage(service) {
  if (serviceStageConfig[service?.stage]) {
    return service.stage;
  }

  if (service?.finalApprovalRequested) {
    return 'final-approval-requested';
  }

  if (service?.approvalRequested) {
    return 'approval-requested';
  }

  const status = normalizeStatus(service?.status);

  if (status === 'not_initialised') {
    return 'service-created';
  }

  if (status === 'pending') {
    return 'pending-default';
  }

  if (status === 'under_analysis') {
    return 'approved-under-analysis';
  }

  if (status === 'approved') {
    return 'analysis-done';
  }

  return 'service-created';
}

function getStatusForStage(stage, fallbackStatus) {
  return serviceStageConfig[stage]?.status ?? fallbackStatus;
}

function getServiceTypeLabel(service) {
  return service.serviceType || service.type || 'Calibration';
}

function isBreakdownService(service) {
  return isBreakdownServiceType(getServiceTypeLabel(service));
}

function getServiceTypeValue(service) {
  if (service.serviceTypeValue) return service.serviceTypeValue;
  if (service.serviceTypeCode) return service.serviceTypeCode;

  const serviceType = getServiceTypeLabel(service);

  if (normalizeStatus(serviceType) === 'calibration') {
    return 'internalinstrumentcalibration';
  }

  return String(serviceType).toLowerCase().replace(/\s+/g, '');
}

function getBreakdownActivityLabel(label) {
  if (label === 'Service Created') return 'Breakdown reported';
  if (label === 'Service Initialised') return 'Resolution created';

  return label;
}

function getActivityItems(stage, service) {
  const activityDate = service.breakdownDate || service.serviceDate || '06/05/2026';
  const isBreakdown = isBreakdownService(service);
  const timeByLabel = {
    'Service Created': '10:13',
    'Service Initialised': '10:18',
    'Breakdown reported': '10:13',
    'Resolution created': '10:18',
    'Approval Requested': '10:24',
    'Approval requested': '10:34',
    'Service Approved': '10:28',
    'Service Concluded': '10:42',
  };
  const personByLabel = {
    'Service Created': 'Rishabh Gangwar',
    'Service Initialised': 'Rishabh Gangwar',
    'Breakdown reported': 'Rishabh Gangwar',
    'Resolution created': 'Rishabh Gangwar',
    'Approval Requested': 'Rishabh Gangwar',
    'Approval requested': 'Rishabh Gangwar',
    'Service Approved': 'Technical Manager',
    'Service Concluded': 'Quality Team',
  };
  const toneByLabel = {
    'Service Created': 'success',
    'Service Initialised': 'info',
    'Breakdown reported': 'danger',
    'Resolution created': 'info',
    'Approval Requested': 'warning',
    'Approval requested': 'warning',
    'Service Approved': 'success',
    'Service Concluded': 'success',
  };

  return (serviceStageConfig[stage]?.activity ?? serviceStageConfig['service-created'].activity).map((activityLabel) => {
    const label = isBreakdown ? getBreakdownActivityLabel(activityLabel) : activityLabel;

    return {
      label,
      time: timeByLabel[label] ?? '10:13',
      date: activityDate,
      person: personByLabel[label],
      tone: toneByLabel[label] ?? 'info',
    };
  });
}

function createTemplateRow(id) {
  return {
    id: `template-row-${id}`,
    parameter: '',
    moa: '',
    observationResult: '',
  };
}

function normalizeTemplateRows(rows = []) {
  return rows.map((row, index) => ({
    id: row.id ?? `template-row-existing-${index + 1}`,
    parameter: row.parameter ?? '',
    moa: row.moa ?? row.MoA ?? '',
    observationResult: row.observationResult ?? row.observation ?? row.result ?? '',
  }));
}

function ServiceDetailsHeader({
  service,
  serviceStage,
  instrumentName,
  onBack,
  onInitialize,
  onRequestApproval,
  onSendForApproval,
}) {
  const statusPresentation = getStatusPresentation('service', service.status);
  const serviceSummary = `${getServiceTypeLabel(service)} - ${instrumentName}`;
  const cta = serviceStageConfig[serviceStage]?.cta;
  const initializeLabel = isBreakdownService(service) ? 'Resolve' : 'Initialize';

  return (
    <section className="smplfy-sample-details-header bg-white border-bottom">
      <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
        <div className="d-flex align-items-start gap-3 min-w-0">
          <SecondaryButton size="medium" className="px-0 flex-shrink-0" aria-label="Go back" onClick={onBack}>
            <AppIcon name="chevron-left" />
          </SecondaryButton>
          <div className="d-flex flex-column min-w-0">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <h1 className="h5 fw-semibold text-body mb-0">Service Details</h1>
              <StatusPill color={statusPresentation.color} styleType={statusPresentation.styleType}>
                {statusPresentation.label}
              </StatusPill>
            </div>
            <div className="d-inline-flex gap-2 text-secondary fw-medium">
              <span>{serviceSummary}</span>
            </div>
          </div>
        </div>

        {cta ? (
          <div className="d-flex align-items-center gap-3 flex-wrap">
            {cta === 'initialize' ? (
              <PrimaryButton onClick={onInitialize}>{initializeLabel}</PrimaryButton>
            ) : null}
            {cta === 'pending-actions' ? (
              <PrimaryButton onClick={onRequestApproval}>Request Approval</PrimaryButton>
            ) : null}
            {cta === 'send-for-approval' ? (
              <PrimaryButton onClick={onSendForApproval}>Send for approval</PrimaryButton>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ServiceDetailsContent({
  instrumentName,
  values,
}) {
  const rows = values.isBreakdown
    ? [
        { key: 'equipment', label: 'Equipment', value: values.equipment || instrumentName || 'Test' },
        { key: 'serviceType', label: 'Service Type', value: values.serviceType },
        { key: 'summary', label: 'Summary', value: values.summary },
        { key: 'reportedOn', label: 'Reported On', value: values.reportedOn },
        { key: 'breakdownDate', label: 'Breakdown Date', value: values.breakdownDate },
        { key: 'resolvedOn', label: 'Resolved On', value: values.resolvedOn },
        { key: 'attachments', label: 'Attachments', value: values.attachments },
      ]
    : [
        { key: 'equipment', label: 'Equipment', value: values.equipment || instrumentName || 'Test' },
        { key: 'serviceType', label: 'Service Type', value: values.serviceType },
        { key: 'summary', label: 'Summary', value: values.summary },
        { key: 'createdOnDate', label: 'Created On Date', value: values.createdOnDate },
        { key: 'nextServiceOn', label: 'Next Service On', value: values.nextServiceOn },
        { key: 'attachments', label: 'Attachments', value: values.attachments },
      ];
  const rowGroups = [
    rows.slice(0, Math.ceil(rows.length / 2)),
    rows.slice(Math.ceil(rows.length / 2)),
  ];

  return (
    <section>
      <div className="card-body row g-4 align-items-center">
        {rowGroups.map((group, groupIndex) => (
          <div className="col-12 col-lg-6 d-flex flex-column gap-2" key={`service-details-group-${groupIndex}`}>
            {group.map((row) => (
              <div className="d-flex align-items-center gap-2" key={row.label}>
                <span className="text-secondary flex-shrink-0" style={{ width: 112 }}>{row.label}:</span>
                <span className="fw-bold text-secondary">{row.value || '-'}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function ServiceTemplateCard({
  canEdit,
  firstTemplateInputRef,
  isEditing,
  onAddRow,
  onDiscardChanges,
  onRemoveRow,
  onSave,
  onStartEditing,
  onTemplateRowChange,
  templateRows,
}) {
  return (
    <section
      className={joinClasses('smplfy-card card overflow-hidden', isEditing ? 'shadow-lg' : '')}
      role="region"
      aria-label="Service result template"
    >
      <div className="card-header bg-transparent d-flex align-items-center justify-content-between gap-3 p-3">
        <div className="fw-medium">Template</div>
        {canEdit ? (
          <div className="d-flex align-items-center gap-2 flex-wrap">
            {isEditing ? (
              <SecondaryButton size="medium" leftIcon="close" onClick={onDiscardChanges}>
                Discard changes
              </SecondaryButton>
            ) : null}
            {isEditing ? (
              <PrimaryButton size="medium" leftIcon="save" onClick={onSave}>Save</PrimaryButton>
            ) : (
              <PrimaryButton leftIcon="plus" size="medium" onClick={onStartEditing}>
                Add data
              </PrimaryButton>
            )}
          </div>
        ) : null}
      </div>

      <div className="card-body p-4">
        {isEditing ? (
          <div className="d-flex justify-content-end mb-3">
            <SecondaryButton size="medium" leftIcon="plus" onClick={onAddRow}>
              Add row
            </SecondaryButton>
          </div>
        ) : null}

        <DataTable responsive={false} className="table-bordered">
          <thead>
            <tr>
              <th scope="col">S. no.</th>
              <th scope="col">Parameter</th>
              <th scope="col">MoA</th>
              <th scope="col">Observation/Result</th>
            </tr>
          </thead>
          <tbody>
            {templateRows.map((row, index) => (
              <tr key={row.id}>
                <td className="text-nowrap">{index + 1}</td>
                <td>
                  {isEditing ? (
                    <input
                      ref={index === 0 ? firstTemplateInputRef : null}
                      className="form-control"
                      value={row.parameter}
                      onChange={(event) => onTemplateRowChange(row.id, 'parameter', event.target.value)}
                      aria-label={`Parameter ${index + 1}`}
                    />
                  ) : (
                    <span>{row.parameter}</span>
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <input
                      className="form-control"
                      value={row.moa}
                      onChange={(event) => onTemplateRowChange(row.id, 'moa', event.target.value)}
                      aria-label={`MoA ${index + 1}`}
                    />
                  ) : (
                    <span>{row.moa}</span>
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <div className="d-flex align-items-center gap-2">
                      <input
                        className="form-control"
                        value={row.observationResult}
                        onChange={(event) => onTemplateRowChange(row.id, 'observationResult', event.target.value)}
                        aria-label={`Observation/Result ${index + 1}`}
                      />
                      <SecondaryButton
                        size="medium"
                        leftIcon="trash"
                        className="px-2 flex-shrink-0"
                        aria-label={`Remove row ${index + 1}`}
                        onClick={() => onRemoveRow(row.id)}
                      />
                    </div>
                  ) : (
                    <span>{row.observationResult}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </div>
    </section>
  );
}

function getApprovalTransitionCopy(serviceStage) {
  if (serviceStage === 'final-approval-requested') {
    return {
      from: 'under analysis',
      to: 'approved',
    };
  }

  return {
    from: 'not initialised',
    to: 'under analysis',
  };
}

function ApprovalRequestPanel({ serviceStage }) {
  const transitionCopy = getApprovalTransitionCopy(serviceStage);

  return (
    <section className="smplfy-card card smplfy-sample-details-action overflow-hidden">
      <div className="card-header d-flex align-items-center gap-3">
        <div className="d-flex align-items-center gap-2">
          <AppIcon name="alert-circle" size={24} stroke={2} />
          <span>Approval</span>
        </div>
        <strong>Pending</strong>
      </div>
      <div className="card-body">
        <p className="mb-3 text-secondary">
          Rishabh Gangwar has requested to move this service from{' '}
          <span className="fw-semibold">"{transitionCopy.from}"</span>
          {' '}to{' '}
          <span className="fw-semibold">"{transitionCopy.to}"</span>.
        </p>
        <PrimaryButton className="w-100" leftIcon="external-link" size="default">
          Take action
        </PrimaryButton>
      </div>
    </section>
  );
}

function ActivityRail({ items, flushTop = false }) {
  return (
    <section className={joinClasses('smplfy-sample-details-activity', flushTop ? 'mt-0' : '')}>
      <div className="d-flex align-items-center justify-content-between">
        <h2>Activity</h2>
        <button className="smplfy-btn btn btn-link p-0 border-0 text-decoration-underline" type="button">
          See all
        </button>
      </div>
      <ol className="smplfy-sample-details-timeline list-unstyled mb-0">
        {items.map((item) => (
          <li className={`is-${item.tone}`} key={`${item.label}-${item.time}`}>
            <span />
            <div>
              <div>{item.label}</div>
              <div>
                <span>{item.time}</span>
                <span>{item.date}</span>
                {item.person ? <span>{item.person}</span> : null}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

const approvalConfirmationConfig = {
  'request-approval': {
    title: 'Request approval',
    description: 'This service will move to approval pending.',
    primaryLabel: 'Request approval',
  },
  'send-for-approval': {
    title: 'Send for approval',
    description: 'This service will be sent for final approval.',
    primaryLabel: 'Send for approval',
  },
};

function ApprovalConfirmationModal({ action, onCancel, onSubmit }) {
  const config = approvalConfirmationConfig[action];

  return (
    <Modal
      open={Boolean(config)}
      title={config?.title}
      titleId="service-approval-confirmation-title"
      titleIcon="send"
      size="small"
      onClose={onCancel}
      actions={(
        <>
          <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
          <PrimaryButton onClick={onSubmit}>{config?.primaryLabel}</PrimaryButton>
        </>
      )}
    >
      <p className="mb-0 text-secondary">{config?.description}</p>
    </Modal>
  );
}

export default function ServiceDetailsPage({
  service = defaultService,
  instrumentId = 'inst-001',
  instrumentName = 'UV-Vis Spectrophotometer',
  onBack,
  onServiceUpdate,
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  sidebarBadgeCounts,
}) {
  const resolvedService = service ?? defaultService;
  const initialServiceStage = useMemo(() => getInitialServiceStage(resolvedService), [resolvedService]);
  const initialTemplateValues = useMemo(() => ({
    equipment: resolvedService.equipmentName || resolvedService.equipment || instrumentName || 'Test',
    serviceType: getServiceTypeValue(resolvedService),
    summary: resolvedService.summary ?? resolvedService.details ?? 'test',
    createdOnDate: resolvedService.createdOnDate || resolvedService.serviceDate || '04/06/2026',
    nextServiceOn: resolvedService.nextServiceDate || '06/07/2026',
    reportedOn: resolvedService.reportedOn || resolvedService.createdOnDate || '06/05/2026',
    breakdownDate: resolvedService.breakdownDate || resolvedService.serviceDate || '06/05/2026',
    resolvedOn: resolvedService.resolvedOn || '',
    attachments: resolvedService.attachments || '',
    isBreakdown: isBreakdownService(resolvedService),
  }), [instrumentName, resolvedService]);
  const initialTemplateRows = useMemo(
    () => normalizeTemplateRows(resolvedService.templateRows ?? resolvedService.results ?? []),
    [resolvedService],
  );
  const firstTemplateInputRef = useRef(null);
  const nextTemplateRowIdRef = useRef(initialTemplateRows.length + 1);
  const [serviceStage, setServiceStage] = useState(initialServiceStage);
  const [templateValues, setTemplateValues] = useState(initialTemplateValues);
  const [templateRows, setTemplateRows] = useState(initialTemplateRows);
  const [draftTemplateRows, setDraftTemplateRows] = useState(initialTemplateRows);
  const [isTemplateEditing, setIsTemplateEditing] = useState(false);
  const [approvalConfirmationAction, setApprovalConfirmationAction] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const stageConfig = serviceStageConfig[serviceStage] ?? serviceStageConfig['service-created'];
  const currentStatus = getStatusForStage(serviceStage, resolvedService.status);
  const currentService = {
    ...resolvedService,
    status: currentStatus,
    details: templateValues.summary,
  };
  const activityItems = getActivityItems(serviceStage, currentService);
  const showApprovalRequest = Boolean(stageConfig.actionRequired);

  useEffect(() => {
    setServiceStage(initialServiceStage);
    setTemplateValues(initialTemplateValues);
    setTemplateRows(initialTemplateRows);
    setDraftTemplateRows(initialTemplateRows);
    setIsTemplateEditing(false);
    setApprovalConfirmationAction(null);
    setToastVisible(false);
    nextTemplateRowIdRef.current = initialTemplateRows.length + 1;
  }, [initialServiceStage, initialTemplateRows, initialTemplateValues, resolvedService.id]);

  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(false);

    window.requestAnimationFrame(() => {
      setToastVisible(true);
      window.setTimeout(() => setToastVisible(false), 5000);
    });
  };

  const handleOpenApprovalConfirmation = (action) => {
    setApprovalConfirmationAction(action);
  };

  const handleSubmitApprovalConfirmation = () => {
    if (approvalConfirmationAction === 'request-approval') {
      setServiceStage('approval-requested');
      setApprovalConfirmationAction(null);
      showToast('Approval requested successfully.');
      return;
    }

    if (approvalConfirmationAction === 'send-for-approval') {
      setServiceStage('final-approval-requested');
      setApprovalConfirmationAction(null);
      showToast('Service sent for approval successfully.');
    }
  };

  const handleInitialize = () => {
    setServiceStage('pending-default');

    if (templateValues.isBreakdown && !templateValues.resolvedOn) {
      const resolvedOn = new Date().toLocaleDateString('en-GB');

      setTemplateValues((current) => ({
        ...current,
        resolvedOn,
      }));
      onServiceUpdate?.({
        ...resolvedService,
        status: getStatusForStage('pending-default', resolvedService.status),
        stage: 'pending-default',
        resolvedOn,
      });
    }
  };

  const addTemplateRow = () => {
    const nextRow = createTemplateRow(nextTemplateRowIdRef.current);
    nextTemplateRowIdRef.current += 1;
    setDraftTemplateRows((current) => [...current, nextRow]);
  };

  const focusFirstTemplateInput = () => {
    window.requestAnimationFrame(() => {
      firstTemplateInputRef.current?.focus();
    });
  };

  const handleStartTemplateEditing = () => {
    if (!stageConfig.editable) {
      return;
    }

    if (templateRows.length) {
      setDraftTemplateRows(normalizeTemplateRows(templateRows));
    } else {
      const nextRow = createTemplateRow(nextTemplateRowIdRef.current);
      nextTemplateRowIdRef.current += 1;
      setDraftTemplateRows([nextRow]);
    }

    setIsTemplateEditing(true);
    focusFirstTemplateInput();
  };

  const handleSaveTemplateRows = () => {
    if (!isTemplateEditing) {
      return;
    }

    setTemplateRows(normalizeTemplateRows(draftTemplateRows));
    setIsTemplateEditing(false);
  };

  const handleDiscardTemplateChanges = () => {
    setDraftTemplateRows(normalizeTemplateRows(templateRows));
    setIsTemplateEditing(false);
  };

  const handleTemplateRowChange = (rowId, field, value) => {
    setDraftTemplateRows((current) =>
      current.map((row) => (
        row.id === rowId
          ? {
              ...row,
              [field]: value,
            }
          : row
      )),
    );
  };

  const handleRemoveTemplateRow = (rowId) => {
    setDraftTemplateRows((current) => current.filter((row) => row.id !== rowId));
  };

  return (
    <AppChrome
      activeNav="instruments"
      onNavigate={onNavigate}
      breadcrumbs={[
        { key: 'instruments', label: 'Instruments' },
        { key: 'instrument-details', label: instrumentName || instrumentId || 'Instrument' },
        { key: 'service-details', label: resolvedService.id, current: true },
      ]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      sidebarBadgeCounts={sidebarBadgeCounts}
      pageHeader={
        <ServiceDetailsHeader
          service={currentService}
          serviceStage={serviceStage}
          instrumentName={instrumentName}
          onBack={onBack}
          onInitialize={handleInitialize}
          onRequestApproval={() => handleOpenApprovalConfirmation('request-approval')}
          onSendForApproval={() => handleOpenApprovalConfirmation('send-for-approval')}
        />
      }
    >
      <main className="smplfy-sample-details-page bg-body-tertiary p-4 min-vh-100">
        <div className="smplfy-sample-details-layout d-grid">
          <div className="smplfy-sample-details-main-panel">
            <div className="d-grid gap-4">
              <div className="smplfy-card card overflow-hidden" role="region" aria-label="Service details content">
                <ServiceDetailsContent
                  instrumentName={instrumentName}
                  values={templateValues}
                />
              </div>
              <ServiceTemplateCard
                canEdit={stageConfig.editable}
                firstTemplateInputRef={firstTemplateInputRef}
                isEditing={isTemplateEditing}
                onAddRow={addTemplateRow}
                onDiscardChanges={handleDiscardTemplateChanges}
                onRemoveRow={handleRemoveTemplateRow}
                onSave={handleSaveTemplateRows}
                onStartEditing={handleStartTemplateEditing}
                onTemplateRowChange={handleTemplateRowChange}
                templateRows={isTemplateEditing ? draftTemplateRows : templateRows}
              />
            </div>
          </div>
          <aside className="smplfy-sample-details-rail">
            {showApprovalRequest ? <ApprovalRequestPanel serviceStage={serviceStage} /> : null}
            <ActivityRail items={activityItems} flushTop={!showApprovalRequest} />
          </aside>
        </div>
      </main>

      <ApprovalConfirmationModal
        action={approvalConfirmationAction}
        onCancel={() => setApprovalConfirmationAction(null)}
        onSubmit={handleSubmitApprovalConfirmation}
      />

      <ToastNotification
        state={toastVisible ? 'default' : 'gone'}
        message={toastMessage}
        className="position-fixed bottom-0 start-0 m-4"
        onClose={() => setToastVisible(false)}
      />
    </AppChrome>
  );
}
