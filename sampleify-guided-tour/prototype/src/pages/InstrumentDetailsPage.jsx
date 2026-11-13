import { useEffect, useMemo, useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import BreakdownDetailModal from '../components/BreakdownDetailModal';
import DataTable from '../components/DataTable';
import InstrumentStatusPill, { getInstrumentStatus } from '../components/InstrumentStatusPill';
import MoreActionButton from '../components/MoreActionButton';
import NavSelector from '../components/NavSelector';
import NewServiceModal from '../components/NewServiceModal';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import ReportBreakdownConfirmationModal from '../components/ReportBreakdownConfirmationModal';
import ResolveBreakdownModal from '../components/ResolveBreakdownModal';
import SecondaryButton from '../components/SecondaryButton';
import { ToastNotification } from '../components/FormControls';
import StatusPill from '../components/StatusPill';
import {
  initialInstrumentServices,
  isBreakdownServiceType,
  normalizeServiceType,
  serviceTypeTabs,
} from '../data/instrumentServices';
import { getStatusPresentation } from '../status/statusRegistry';
import qrCode from '../../assets/qr.png';
import './instrument-details-page.scss';

function formatDateForDisplay(value) {
  if (!value) return '-';

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
  }

  return value;
}

function InstrumentDetailsHeader({
  instrumentName,
  status,
  onBack,
  onEditInstrument,
  onNewService,
  onReportBreakdown,
}) {
  const moreActionItems = [
    {
      key: 'edit',
      label: 'Edit',
      leftIcon: 'edit',
      onClick: onEditInstrument,
    },
    ...(status === 'breakdown'
      ? []
      : [{
          key: 'report-breakdown',
          label: 'Report Breakdown',
          leftIcon: 'alert-circle',
          onClick: onReportBreakdown,
        }]),
  ];

  return (
    <section className="bg-white border-bottom px-4 py-3">
      <div className="container-fluid px-0">
        <div className="row align-items-center justify-content-between gx-0 gy-3">
          <div className="col-auto d-flex align-items-center gap-3">
            <SecondaryButton
              size="medium"
              leftIcon="chevron-left"
              className="px-0 flex-shrink-0"
              onClick={onBack}
              aria-label="Go back"
            />
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <h1 className="h5 mb-0 fw-semibold text-dark">{instrumentName}</h1>
              <InstrumentStatusPill status={status} />
            </div>
          </div>
          <div className="col-auto d-flex align-items-center gap-3">
            <PrimaryButton leftIcon="plus" onClick={onNewService}>
              New Service
            </PrimaryButton>
            <SecondaryButton leftIcon="printer">
              Print QR
            </SecondaryButton>
            <MoreActionButton items={moreActionItems} />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function InstrumentDetailsPage({
  instrumentId = 'inst-001',
  instrumentName = 'Stabinger Viscometer',
  description = 'Description goes here. This material is of critical importance. Create a new PO if stock reaches 120% of min qty.',
  make = 'Y8k08',
  uniqueKey = 'Y8k08',
  modelNo = 'Y8k08',
  serialNo = 'Y8k08',
  dateOfInstallation = '-',
  peopleWithAccess = 'Rishabh Gangwar, Deepak Cybit, Priya Nair',
  records = null,
  initialToast = null,
  onEditInstrument,
  onBack,
  onNewService,
  onServiceCreated,
  onServiceUpdate,
  onOpenService,
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
}) {
  const [activeTab, setActiveTab] = useState('maintenance');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [reportBreakdownModalOpen, setReportBreakdownModalOpen] = useState(false);
  const [breakdownDetailRecordId, setBreakdownDetailRecordId] = useState('');
  const [resolveBreakdownRecordId, setResolveBreakdownRecordId] = useState('');
  const resolvedRecords = useMemo(
    () => records ?? initialInstrumentServices.filter((record) => record.instrumentId === instrumentId),
    [instrumentId, records],
  );
  const [serviceRecords, setServiceRecords] = useState(resolvedRecords);

  useEffect(() => {
    if (!initialToast) {
      setToastVisible(false);
      return undefined;
    }

    let frameId = 0;
    let timerId = 0;

    frameId = window.requestAnimationFrame(() => {
      setToastMessage(initialToast);
      setToastVisible(true);
      timerId = window.setTimeout(() => setToastVisible(false), 5000);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timerId);
    };
  }, [initialToast]);

  useEffect(() => {
    setServiceRecords(resolvedRecords);
  }, [resolvedRecords]);

  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(false);

    window.requestAnimationFrame(() => {
      setToastVisible(true);
      window.setTimeout(() => setToastVisible(false), 5000);
    });
  };

  const handleCreateService = (draft) => {
    const now = new Date();
    const isBreakdown = isBreakdownServiceType(draft.serviceType);
    const nextRecord = {
      id: `SVC-${now.getFullYear()}-${String(serviceRecords.length + 1).padStart(3, '0')}`,
      status: 'Not initialised',
      stage: 'service-created',
      details: draft.details || `${draft.serviceType} service created for ${instrumentName}.`,
      summary: draft.details || `${draft.serviceType} service created for ${instrumentName}.`,
      serviceType: draft.serviceType,
      calibrationType: draft.calibrationType,
      vendor: draft.vendor,
      instrumentId,
      instrumentName,
      ...(isBreakdown
        ? {
            reportedOn: now.toLocaleDateString('en-GB'),
            reportedBy: 'Rishabh Gangwar',
            breakdownComments: draft.details || `Breakdown reported for ${instrumentName}.`,
            breakdownDate: formatDateForDisplay(draft.serviceDate),
          }
        : {
            serviceDate: formatDateForDisplay(draft.serviceDate),
            nextServiceDate: formatDateForDisplay(draft.nextServiceOn),
          }),
    };

    setServiceRecords((current) => [nextRecord, ...current]);
    setServiceModalOpen(false);
    onNewService?.(nextRecord);
    onServiceCreated?.(nextRecord);
    setActiveTab(normalizeServiceType(nextRecord.serviceType));
    showToast('Service created successfully.');
  };

  const tabs = serviceTypeTabs;
  const visibleServiceRecords = useMemo(
    () => serviceRecords.filter((record) => normalizeServiceType(record.serviceType || record.type) === activeTab),
    [activeTab, serviceRecords],
  );
  const isBreakdownTab = activeTab === 'breakdown';
  const instrumentStatus = getInstrumentStatus(instrumentId, serviceRecords);
  const activeBreakdownCount = serviceRecords.filter(
    (record) => isBreakdownServiceType(record.serviceType || record.type) && !record.resolvedOn,
  ).length;
  const selectedBreakdownRecord = serviceRecords.find((record) => record.id === breakdownDetailRecordId);
  const selectedResolveRecord = serviceRecords.find((record) => record.id === resolveBreakdownRecordId);

  const handleReportBreakdown = () => {
    const now = new Date();
    const reportedOn = now.toLocaleDateString('en-GB');
    const details = `Breakdown reported for ${instrumentName}.`;
    const breakdownRecord = {
      id: `BD-${Date.now()}`,
      status: 'Not initialised',
      stage: 'service-created',
      serviceType: 'Breakdown',
      instrumentId,
      instrumentName,
      reportedOn,
      reportedBy: 'Rishabh Gangwar',
      breakdownDate: reportedOn,
      breakdownComments: details,
      details,
      summary: details,
    };

    setServiceRecords((current) => [breakdownRecord, ...current]);
    onServiceCreated?.(breakdownRecord);
    setReportBreakdownModalOpen(false);
    setActiveTab('breakdown');
    showToast('Instrument marked as broken.');
  };

  const handleResolveBreakdown = (draft) => {
    if (!selectedResolveRecord) return;

    const updatedRecord = {
      ...selectedResolveRecord,
      status: 'Pending',
      stage: 'pending-default',
      resolvedOn: new Date().toLocaleDateString('en-GB'),
      resolutionServiceDate: formatDateForDisplay(draft.serviceDate),
      resolutionVendor: draft.vendor,
      resolutionAttachment: draft.attachment,
      resolutionCost: draft.cost,
      resolutionComments: draft.comments,
    };

    setServiceRecords((current) => (
      current.map((record) => (record.id === updatedRecord.id ? updatedRecord : record))
    ));
    onServiceUpdate?.(updatedRecord);
    setResolveBreakdownRecordId('');
    showToast('Breakdown resolved.');
  };

  return (
    <AppChrome
      activeNav="instruments"
      onNavigate={onNavigate}
      breadcrumbs={[
        { key: 'instruments', label: 'Instruments' },
        { key: 'instrument-details', label: instrumentName, current: true },
      ]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      pageHeader={
        <InstrumentDetailsHeader
          instrumentName={instrumentName}
          status={instrumentStatus}
          onBack={onBack}
          onEditInstrument={onEditInstrument}
          onNewService={() => setServiceModalOpen(true)}
          onReportBreakdown={() => setReportBreakdownModalOpen(true)}
        />
      }
    >
      <main className="smplfy-instrument-details-page bg-body-tertiary p-4 min-vh-100">
        <div className="container-fluid px-0 d-flex flex-column gap-3">
          <div className="row g-3 align-items-stretch">
            <div className="col-12 col-xl">
              <div className="smplfy-card card h-100">
                <div className="card-body row g-4 align-items-center">
                  <div className="col-12 col-lg-7">
                    <h2 className="fs-2 fw-normal lh-sm mb-2 text-dark">{instrumentName}</h2>
                    <p className="mb-0 text-secondary">{description}</p>
                  </div>
                  <div className="col-12 col-lg-5 d-flex flex-column gap-2">
                    <div className="d-flex align-items-center gap-2">
                      <span className="text-secondary">Make:</span>
                      <span className="fw-bold text-secondary">{make}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span className="text-secondary">Unique Key:</span>
                      <span className="fw-bold text-secondary">{uniqueKey}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span className="text-secondary">Model No:</span>
                      <span className="fw-bold text-secondary">{modelNo}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span className="text-secondary">Serial No:</span>
                      <span className="fw-bold text-secondary">{serialNo}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span className="text-secondary">Date of installation:</span>
                      <span className="fw-bold text-secondary">{dateOfInstallation || '-'}</span>
                    </div>
                  </div>
                </div>
                <div className="smplfy-instrument-details-access px-4 py-3 border-top">
                  <span className="text-secondary">People with access: </span>
                  <span className="fw-bold text-secondary">{peopleWithAccess}</span>
                </div>
              </div>
            </div>

            <div className="col-12 col-xl-auto">
              <div className="smplfy-card card h-100">
                <div className="card-body d-flex align-items-center justify-content-center">
                  <img src={qrCode} alt="QR Code" width={120} height={120} />
                </div>
              </div>
            </div>
          </div>

          <div className="smplfy-card card overflow-hidden">
            <div className="card-header bg-transparent p-0">
              <div className="nav nav-tabs px-4 border-0">
                {tabs.map((tab) => (
                  <NavSelector
                    key={tab.key}
                    active={activeTab === tab.key}
                    count={tab.key === 'breakdown' ? activeBreakdownCount : undefined}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                  </NavSelector>
                ))}
              </div>
            </div>

            <div className="card-body">
              <div className="fw-medium text-dark mb-3">{visibleServiceRecords.length} Records</div>
              <DataTable>
                <thead>
                  <tr>
                    {isBreakdownTab ? (
                      <>
                        <th scope="col">Breakdown date</th>
                        <th scope="col">Resolved on</th>
                      </>
                    ) : (
                      <>
                        <th scope="col">Service date</th>
                        <th scope="col">Next service date</th>
                      </>
                    )}
                    {!isBreakdownTab ? <th scope="col">Status</th> : null}
                    <th scope="col">Details</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleServiceRecords.map((record) => {
                    const statusPresentation = getStatusPresentation('service', record.status);

                    return (
                      <tr key={record.id}>
                        {isBreakdownTab ? (
                          <>
                            <td className="text-nowrap">{record.breakdownDate}</td>
                            <td className="text-nowrap">{record.resolvedOn || '-'}</td>
                          </>
                        ) : (
                          <>
                            <td className="text-nowrap">{record.serviceDate}</td>
                            <td className="text-nowrap">{record.nextServiceDate}</td>
                          </>
                        )}
                        {!isBreakdownTab ? (
                          <td className="text-nowrap">
                            <StatusPill color={statusPresentation.color} styleType={statusPresentation.styleType}>
                              {statusPresentation.label}
                            </StatusPill>
                          </td>
                        ) : null}
                        <td>{record.details}</td>
                        <td className="text-nowrap">
                          <div className="d-flex align-items-center gap-2">
                            <SecondaryButton
                              size="medium"
                              leftIcon="eye"
                              onClick={() => {
                                if (isBreakdownTab) {
                                  setBreakdownDetailRecordId(record.id);
                                  return;
                                }

                                onOpenService?.(record, {
                                  instrumentId,
                                  instrumentName,
                                });
                              }}
                            >
                              View
                            </SecondaryButton>
                            {isBreakdownTab && !record.resolvedOn ? (
                              <PrimaryButton
                                size="medium"
                                leftIcon="check"
                                onClick={() => setResolveBreakdownRecordId(record.id)}
                              >
                                Resolve
                              </PrimaryButton>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {visibleServiceRecords.length === 0 ? (
                    <tr>
                      <td colSpan={isBreakdownTab ? 4 : 5} className="text-center text-secondary">
                        No services found.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </DataTable>
            </div>
          </div>
        </div>
      </main>

      <NewServiceModal
        open={serviceModalOpen}
        instrumentOptions={[
          {
            value: instrumentId,
            label: instrumentName,
          },
        ]}
        initialInstrumentId={instrumentId}
        showInstrumentField
        instrumentFieldDisabled
        onCancel={() => setServiceModalOpen(false)}
        onSubmit={handleCreateService}
      />

      <BreakdownDetailModal
        open={Boolean(selectedBreakdownRecord)}
        breakdown={selectedBreakdownRecord}
        onClose={() => setBreakdownDetailRecordId('')}
      />

      <ReportBreakdownConfirmationModal
        open={reportBreakdownModalOpen}
        instrumentName={instrumentName}
        onCancel={() => setReportBreakdownModalOpen(false)}
        onConfirm={handleReportBreakdown}
      />

      <ResolveBreakdownModal
        open={Boolean(selectedResolveRecord)}
        breakdownDate={selectedResolveRecord?.breakdownDate}
        onCancel={() => setResolveBreakdownRecordId('')}
        onSubmit={handleResolveBreakdown}
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
