import { useMemo, useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import DataTable from '../components/DataTable';
import { ToastNotification } from '../components/FormControls';
import NavSelector from '../components/NavSelector';
import NewServiceModal from '../components/NewServiceModal';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import ResolveBreakdownModal from '../components/ResolveBreakdownModal';
import SecondaryButton from '../components/SecondaryButton';
import StatusPill from '../components/StatusPill';
import { isBreakdownServiceType, normalizeServiceType, serviceTypeTabs } from '../data/instrumentServices';
import { getStatusPresentation } from '../status/statusRegistry';
import './instrument-details-page.scss';

const allServiceTypeTabs = serviceTypeTabs;

function formatIsoDateForDisplay(value) {
  if (!value) return '-';

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
  }

  return value;
}

function AllServicesHeader({ onBack, onNewService }) {
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
            <h1 className="h5 mb-0 fw-semibold text-dark">All Services</h1>
          </div>
          <div className="col-auto d-flex align-items-center gap-3">
            <SecondaryButton leftIcon="calendar">
              Service Schedule
            </SecondaryButton>
            <PrimaryButton leftIcon="plus" onClick={onNewService}>
              New service
            </PrimaryButton>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function AllServicesPage({
  services = [],
  instruments = [],
  activeTab,
  onActiveTabChange,
  onBack,
  onCreateService,
  onServiceUpdate,
  onOpenInstrument,
  onOpenService,
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  sidebarBadgeCounts,
}) {
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [resolveBreakdownServiceId, setResolveBreakdownServiceId] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [localActiveTab, setLocalActiveTab] = useState(allServiceTypeTabs[0]?.key ?? 'calibration');
  const selectedActiveTab = activeTab ?? localActiveTab;
  const resolvedActiveTab = allServiceTypeTabs.some((tab) => tab.key === selectedActiveTab)
    ? selectedActiveTab
    : allServiceTypeTabs[0]?.key ?? 'calibration';
  const instrumentOptions = useMemo(() => (
    instruments.map((instrument) => ({
      value: instrument.id,
      label: instrument.name,
    }))
  ), [instruments]);
  const handleTabChange = (nextTab) => {
    setLocalActiveTab(nextTab);
    onActiveTabChange?.(nextTab);
  };
  const handleCreateService = (draft) => {
    const createdService = onCreateService?.(draft);
    setServiceModalOpen(false);

    if (createdService?.serviceType) {
      handleTabChange(normalizeServiceType(createdService.serviceType));
    }
  };
  const countsByType = useMemo(() => (
    services.reduce((counts, service) => {
      const serviceType = normalizeServiceType(service.serviceType || service.type);
      return {
        ...counts,
        [serviceType]: (counts[serviceType] ?? 0) + 1,
      };
    }, {})
  ), [services]);
  const visibleServices = useMemo(() => (
    services.filter((service) => normalizeServiceType(service.serviceType || service.type) === resolvedActiveTab)
  ), [resolvedActiveTab, services]);
  const isBreakdownTab = isBreakdownServiceType(resolvedActiveTab);
  const selectedResolveService = services.find((service) => service.id === resolveBreakdownServiceId);

  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(false);

    window.requestAnimationFrame(() => {
      setToastVisible(true);
      window.setTimeout(() => setToastVisible(false), 5000);
    });
  };

  const handleResolveBreakdown = (draft) => {
    if (!selectedResolveService) return;

    onServiceUpdate?.({
      ...selectedResolveService,
      status: 'Pending',
      stage: 'pending-default',
      resolvedOn: new Date().toLocaleDateString('en-GB'),
      resolutionServiceDate: formatIsoDateForDisplay(draft.serviceDate),
      resolutionVendor: draft.vendor,
      resolutionAttachment: draft.attachment,
      resolutionCost: draft.cost,
      resolutionComments: draft.comments,
    });

    setResolveBreakdownServiceId('');
    showToast('Breakdown resolved.');
  };

  return (
    <AppChrome
      activeNav="instruments"
      onNavigate={onNavigate}
      breadcrumbs={[
        { key: 'instruments', label: 'Instruments' },
        { key: 'all-services', label: 'All Services', current: true },
      ]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      sidebarBadgeCounts={sidebarBadgeCounts}
      pageHeader={<AllServicesHeader onBack={onBack} onNewService={() => setServiceModalOpen(true)} />}
    >
      <main className="smplfy-instrument-details-page bg-body-tertiary p-4 min-vh-100">
        <div className="container-fluid px-0">
          <div className="smplfy-card card overflow-hidden">
            <div className="card-header bg-transparent p-0">
              <div className="nav nav-tabs px-4 border-0">
                {allServiceTypeTabs.map((tab) => (
                  <NavSelector
                    key={tab.key}
                    active={resolvedActiveTab === tab.key}
                    count={countsByType[tab.key]}
                    onClick={() => handleTabChange(tab.key)}
                  >
                    {tab.label}
                  </NavSelector>
                ))}
              </div>
            </div>

            <div className="card-body">
              <div className="fw-medium text-dark mb-3">{visibleServices.length} Records</div>
              <DataTable>
                <thead>
                  <tr>
                    <th scope="col">Instrument name</th>
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
                  {visibleServices.map((service) => {
                    const statusPresentation = getStatusPresentation('service', service.status);

                    return (
                      <tr key={service.id}>
                        <td>
                          <a
                            href="/"
                            className="smplfy-link link-primary p-0"
                            onClick={(event) => {
                              event.preventDefault();
                              onOpenInstrument?.(service.instrumentId, service.instrumentName);
                            }}
                          >
                            <span>{service.instrumentName}</span>
                          </a>
                        </td>
                        {isBreakdownTab ? (
                          <>
                            <td className="text-nowrap">{service.breakdownDate}</td>
                            <td className="text-nowrap">{service.resolvedOn || '-'}</td>
                          </>
                        ) : (
                          <>
                            <td className="text-nowrap">{service.serviceDate}</td>
                            <td className="text-nowrap">{service.nextServiceDate}</td>
                          </>
                        )}
                        {!isBreakdownTab ? (
                          <td className="text-nowrap">
                            <StatusPill color={statusPresentation.color} styleType={statusPresentation.styleType}>
                              {statusPresentation.label}
                            </StatusPill>
                          </td>
                        ) : null}
                        <td>{service.details}</td>
                        <td className="text-nowrap">
                          {isBreakdownTab && !service.resolvedOn ? (
                            <PrimaryButton
                              size="medium"
                              leftIcon="check"
                              onClick={() => setResolveBreakdownServiceId(service.id)}
                            >
                              Resolve
                            </PrimaryButton>
                          ) : (
                            <SecondaryButton
                              size="medium"
                              leftIcon="eye"
                              onClick={() =>
                                onOpenService?.(service, {
                                  instrumentId: service.instrumentId,
                                  instrumentName: service.instrumentName,
                                  sourcePage: 'all-services',
                                })
                              }
                            >
                              View
                            </SecondaryButton>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {visibleServices.length === 0 ? (
                    <tr>
                      <td colSpan={isBreakdownTab ? 5 : 6} className="text-center text-secondary">
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
        instrumentOptions={instrumentOptions}
        showInstrumentField
        onCancel={() => setServiceModalOpen(false)}
        onSubmit={handleCreateService}
      />

      <ResolveBreakdownModal
        open={Boolean(selectedResolveService)}
        breakdownDate={selectedResolveService?.breakdownDate}
        onCancel={() => setResolveBreakdownServiceId('')}
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
