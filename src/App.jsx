import AllSamplesListingPage from './pages/AllSamplesListingPage';
import { useState } from 'react';
import NewSampleCustomerDetailsPage from './pages/NewSampleCustomerDetailsPage';
import CoaReportSelectionPage from './pages/CoaReportSelectionPage';
import DatasheetPage from './pages/DatasheetPage';
import EnvironmentDataPage from './pages/EnvironmentDataPage';
import FinalisedReportPage from './pages/FinalisedReportPage';
import LeaveRecordsPage from './pages/LeaveRecordsPage';
import MaterialsPage from './pages/MaterialsPage';
import MaterialDetailsPage from './pages/MaterialDetailsPage';
import InstrumentsPage from './pages/InstrumentsPage';
import InstrumentDetailsPage from './pages/InstrumentDetailsPage';
import NewInstrumentPage from './pages/NewInstrumentPage';
import RequestsForMePage from './pages/RequestsForMePage';
import SampleDetailsPage from './pages/SampleDetailsPage';
import SampleWorkspacePage from './pages/SampleWorkspacePage';
import TempReportPage from './pages/TempReportPage';
import TestRequestsHomePage from './pages/TestRequestsHomePage';
import TestRequestsListingPage from './pages/TestRequestsListingPage';
import TrDetailsPage from './pages/TrDetailsPage';
import { requestSections } from './data/requestsForMeData';

export default function App() {
  const [activePage, setActivePage] = useState('workspace');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sampleCardViewMode, setSampleCardViewMode] = useState('grid');
  const [sampleEditorState, setSampleEditorState] = useState({
    mode: 'create',
    sample: null,
    sourcePage: 'samples-workspace',
    parentLabel: 'Samples Workspace',
  });
  const requestsForMeSidebarBadgeCount = requestSections.reduce(
    (sum, section) => sum + (section.count ?? 0),
    0,
  );
  const [sampleDetailsState, setSampleDetailsState] = useState({
    sampleId: 'IICT/2025-2026/1101',
    initialToast: null,
    sourcePage: 'samples-workspace',
    sampleStatus: 'Pending',
    createdOn: '06/03/2026, 10:13',
    sample: null,
  });
  const [testRequestsState, setTestRequestsState] = useState({
    sampleId: 'IICT/2025-2026/1101',
    sourcePage: 'all-samples',
    viewMode: 'standard',
  });
  const [coaReportState, setCoaReportState] = useState({
    sampleId: 'IICT/2025-2026/1101',
    sourcePage: 'samples-workspace',
    reportId: 'URLS/2026/64',
  });
  const [tempReportState, setTempReportState] = useState({
    sampleId: 'IICT/2025-2026/1101',
    sourcePage: 'samples-workspace',
    reportId: 'URLS/2026/64',
  });
  const [finalisedReportState, setFinalisedReportState] = useState({
    sampleId: 'IICT/2025-2026/1101',
    sourcePage: 'samples-workspace',
    reportId: 'URLS/2026/64',
    origin: 'temp-report',
  });
  const [instrumentToast, setInstrumentToast] = useState(null);
  const [instrumentDetailsState, setInstrumentDetailsState] = useState({ id: null, name: '', initialToast: null });
  const [materialDetailsState, setMaterialDetailsState] = useState({ id: null, name: '', initialToast: null });
  const [trDetailsState, setTrDetailsState] = useState({
    sampleId: 'IICT/2025-2026/1101',
    sourcePage: 'all-samples',
    requestId: 'URLS/26/ULRS/O/2026/30/330',
    workflowStage: 'default',
    initialToast: null,
    remnantAvailable: null,
  });
  const [datasheetState, setDatasheetState] = useState({
    sampleId: 'IICT/2025-2026/1101',
    sourcePage: 'all-samples',
    datasheetId: 'URLS/TR/00031',
  });

  const openSampleDetails = (sampleId, options = {}) => {
    const {
      initialToast = null,
      sourcePage = 'samples-workspace',
      sampleStatus = 'Pending',
      createdOn = '06/03/2026, 10:13',
      sample = null,
    } = options;

    setSampleDetailsState({
      sampleId,
      initialToast,
      sourcePage,
      sampleStatus,
      createdOn,
      sample,
    });
    setActivePage('sample-details');
  };

  const openInstrumentDetails = (instrumentId, instrumentName, options = {}) => {
    const { initialToast = null } = options;

    setInstrumentDetailsState({
      id: instrumentId,
      name: instrumentName,
      initialToast,
    });
    setActivePage('instrument-details');
  };

  const openMaterialDetails = (materialId, materialName, options = {}) => {
    const { initialToast = null } = options;

    setMaterialDetailsState({
      id: materialId,
      name: materialName,
      initialToast,
    });
    setActivePage('material-details');
  };

  const openTestRequests = (sampleId, options = {}) => {
    const { sourcePage = 'all-samples', viewMode = 'standard' } = options;

    setTestRequestsState({
      sampleId,
      sourcePage,
      viewMode,
    });
    setActivePage('test-requests');
  };

  const openCoaReport = (sampleId, options = {}) => {
    const { sourcePage = 'samples-workspace', reportId = 'URLS/2026/64' } = options;

    setCoaReportState({
      sampleId,
      sourcePage,
      reportId,
    });
    setActivePage('coa-report-selection');
  };

  const openTempReport = (sampleId, options = {}) => {
    const { sourcePage = 'samples-workspace', reportId = 'URLS/2026/64' } = options;
    setSidebarCollapsed(true);

    setTempReportState({
      sampleId,
      sourcePage,
      reportId,
    });
    setActivePage('temp-report');
  };

  const openFinalisedReport = (sampleId, options = {}) => {
    const { sourcePage = 'samples-workspace', reportId = 'URLS/2026/64', origin = 'temp-report' } = options;
    setSidebarCollapsed(true);
    setFinalisedReportState({ sampleId, sourcePage, reportId, origin });
    setActivePage('finalised-report');
  };

  const openTrDetails = (sampleId, options = {}) => {
    const { sourcePage = 'all-samples', requestId = 'URLS/26/ULRS/O/2026/30/330' } = options;
    setTrDetailsState((current) => ({
      sampleId,
      sourcePage,
      requestId,
      workflowStage: current.requestId === requestId ? current.workflowStage : 'default',
      initialToast: null,
      remnantAvailable: current.requestId === requestId ? current.remnantAvailable : null,
    }));
    setActivePage('tr-details');
  };

  const openDatasheet = (sampleId, options = {}) => {
    const { sourcePage = 'all-samples', datasheetId = 'URLS/TR/00031' } = options;
    setDatasheetState({ sampleId, sourcePage, datasheetId });
    setActivePage('datasheet');
  };

  const openNewSample = (options = {}) => {
    const { sourcePage = 'samples-workspace' } = options;
    const parentLabel = sourcePage === 'all-samples' ? 'All Samples' : 'Samples Workspace';

    setSampleEditorState({
      mode: 'create',
      sample: null,
      sourcePage,
      parentLabel,
    });
    setActivePage('new-sample-customer-details');
  };

  const openEditSample = (sample, options = {}) => {
    if (!sample) {
      return;
    }

    const { sourcePage = 'samples-workspace' } = options;
    const parentLabel = sourcePage === 'all-samples' ? 'All Samples' : 'Samples Workspace';

    setSampleEditorState({
      mode: 'edit',
      sample,
      sourcePage,
      parentLabel,
    });
    setActivePage('new-sample-customer-details');
  };

  const handleDatasheetSave = () => {
    setTrDetailsState((current) => ({
      ...current,
      workflowStage: current.workflowStage === 'submitted' ? 'submitted' : 'in-progress',
      initialToast: 'datasheet-updated',
    }));
    setActivePage('tr-details');
  };

  const handleTrReviewSubmit = (remnantAvailable) => {
    setTrDetailsState((current) => ({
      ...current,
      workflowStage: 'submitted',
      initialToast: null,
      remnantAvailable,
    }));
  };

  const handleNavigate = (nextPage) => {
    if (nextPage === 'samples-workspace') {
      setActivePage('workspace');
      return;
    }

    if (nextPage === 'requests-for-me') {
      setActivePage('requests-for-me');
      return;
    }

    if (nextPage === 'test-requests-home') {
      setActivePage('test-requests-home');
      return;
    }

    if (nextPage === 'environment-data') {
      setActivePage('environment-data');
      return;
    }

    if (nextPage === 'leave-records') {
      setActivePage('leave-records');
      return;
    }

    if (nextPage === 'materials') {
      setActivePage('materials');
      return;
    }

    if (nextPage === 'instruments') {
      setActivePage('instruments');
      return;
    }

    if (nextPage === 'new-instrument') {
      setActivePage('new-instrument');
      return;
    }

    if (nextPage === 'all-samples') {
      setActivePage('all-samples');
    }
  };

  if (activePage === 'sample-details') {
    const isCompletedSample = sampleDetailsState.sampleStatus === 'Completed';

    return (
      <SampleDetailsPage
        sampleId={sampleDetailsState.sampleId}
        initialToast={sampleDetailsState.initialToast}
        sourcePage={sampleDetailsState.sourcePage}
        sampleStatus={sampleDetailsState.sampleStatus}
        createdOn={sampleDetailsState.createdOn}
        sample={sampleDetailsState.sample}
        onBack={() =>
          setActivePage(sampleDetailsState.sourcePage === 'all-samples' ? 'all-samples' : 'workspace')
        }
        onEditSample={() =>
          openEditSample(
            sampleDetailsState.sample ?? {
              id: sampleDetailsState.sampleId,
              status: sampleDetailsState.sampleStatus,
              createdOn: sampleDetailsState.createdOn,
            },
            { sourcePage: sampleDetailsState.sourcePage },
          )
        }
        onOpenTestRequests={() =>
          openTestRequests(sampleDetailsState.sampleId, {
            sourcePage: sampleDetailsState.sourcePage,
            viewMode: isCompletedSample ? 'approved' : 'standard',
          })
        }
        onOpenCoaReport={() =>
          isCompletedSample
            ? openFinalisedReport(sampleDetailsState.sampleId, {
                sourcePage: sampleDetailsState.sourcePage,
                origin: 'sample-details',
              })
            : openCoaReport(sampleDetailsState.sampleId, {
                sourcePage: sampleDetailsState.sourcePage,
              })
        }
        onNavigate={handleNavigate}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarCollapsedChange={setSidebarCollapsed}
        sidebarBadgeCounts={{ 'requests-for-me': requestsForMeSidebarBadgeCount }}
      />
    );
  }

  if (activePage === 'test-requests') {
    return (
      <TestRequestsListingPage
        sampleId={testRequestsState.sampleId}
        sourcePage={testRequestsState.sourcePage}
        viewMode={testRequestsState.viewMode}
        onBack={() => setActivePage('sample-details')}
        onOpenTrDetails={(requestId) =>
          openTrDetails(testRequestsState.sampleId, {
            sourcePage: testRequestsState.sourcePage,
            requestId,
          })
        }
        onNavigate={handleNavigate}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarCollapsedChange={setSidebarCollapsed}
        sidebarBadgeCounts={{ 'requests-for-me': requestsForMeSidebarBadgeCount }}
      />
    );
  }

  if (activePage === 'tr-details') {
    return (
        <TrDetailsPage
          sampleId={trDetailsState.sampleId}
          sourcePage={trDetailsState.sourcePage}
          requestId={trDetailsState.requestId}
          workflowStage={trDetailsState.workflowStage}
          initialToast={trDetailsState.initialToast}
          onBack={() =>
            setActivePage(
              trDetailsState.sourcePage === 'test-requests-home' ? 'test-requests-home' : 'test-requests',
            )
          }
          onOpenDatasheet={() =>
            openDatasheet(trDetailsState.sampleId, {
              sourcePage: trDetailsState.sourcePage,
            })
          }
          onInitialToastConsumed={() =>
            setTrDetailsState((current) => ({
              ...current,
              initialToast: null,
            }))
          }
          onSubmitForReview={handleTrReviewSubmit}
          onNavigate={handleNavigate}
          sidebarCollapsed={sidebarCollapsed}
          onSidebarCollapsedChange={setSidebarCollapsed}
          sidebarBadgeCounts={{ 'requests-for-me': requestsForMeSidebarBadgeCount }}
        />
    );
  }

  if (activePage === 'datasheet') {
    return (
        <DatasheetPage
          sampleId={datasheetState.sampleId}
          sourcePage={datasheetState.sourcePage}
          datasheetId={datasheetState.datasheetId}
          onBack={() => setActivePage('tr-details')}
          onSave={handleDatasheetSave}
          onNavigate={handleNavigate}
          sidebarCollapsed={sidebarCollapsed}
          onSidebarCollapsedChange={setSidebarCollapsed}
          sidebarBadgeCounts={{ 'requests-for-me': requestsForMeSidebarBadgeCount }}
        />
    );
  }

  if (activePage === 'coa-report-selection') {
    return (
      <CoaReportSelectionPage
        sampleId={coaReportState.sampleId}
        sourcePage={coaReportState.sourcePage}
        reportId={coaReportState.reportId}
        onBack={() => setActivePage('sample-details')}
        onGenerate={() =>
          openTempReport(coaReportState.sampleId, {
            sourcePage: coaReportState.sourcePage,
            reportId: coaReportState.reportId,
          })
        }
        onFinalize={() =>
          openFinalisedReport(coaReportState.sampleId, {
            sourcePage: coaReportState.sourcePage,
            reportId: coaReportState.reportId,
          })
        }
        onNavigate={handleNavigate}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarCollapsedChange={setSidebarCollapsed}
        sidebarBadgeCounts={{ 'requests-for-me': requestsForMeSidebarBadgeCount }}
      />
    );
  }

  if (activePage === 'temp-report') {
    return (
      <TempReportPage
        sampleId={tempReportState.sampleId}
        sourcePage={tempReportState.sourcePage}
        reportId={tempReportState.reportId}
        onBack={() => setActivePage('coa-report-selection')}
        onFinalize={() =>
          openFinalisedReport(tempReportState.sampleId, {
            sourcePage: tempReportState.sourcePage,
            reportId: tempReportState.reportId,
          })
        }
        onNavigate={handleNavigate}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarCollapsedChange={setSidebarCollapsed}
        sidebarBadgeCounts={{ 'requests-for-me': requestsForMeSidebarBadgeCount }}
      />
    );
  }

  if (activePage === 'finalised-report') {
    return (
      <FinalisedReportPage
        sampleId={finalisedReportState.sampleId}
        sourcePage={finalisedReportState.sourcePage}
        reportId={finalisedReportState.reportId}
        onBack={() =>
          setActivePage(finalisedReportState.origin === 'sample-details' ? 'sample-details' : 'temp-report')
        }
        onNavigate={handleNavigate}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarCollapsedChange={setSidebarCollapsed}
        sidebarBadgeCounts={{ 'requests-for-me': requestsForMeSidebarBadgeCount }}
      />
    );
  }

  if (activePage === 'all-samples') {
    return (
      <AllSamplesListingPage
        onNavigate={handleNavigate}
        onOpenSample={openSampleDetails}
        onEditSample={openEditSample}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarCollapsedChange={setSidebarCollapsed}
        sidebarBadgeCounts={{ 'requests-for-me': requestsForMeSidebarBadgeCount }}
        sampleCardViewMode={sampleCardViewMode}
        onSampleCardViewModeChange={setSampleCardViewMode}
      />
    );
  }

  if (activePage === 'requests-for-me') {
    return (
      <RequestsForMePage
        onNavigate={handleNavigate}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarCollapsedChange={setSidebarCollapsed}
        sidebarBadgeCounts={{ 'requests-for-me': requestsForMeSidebarBadgeCount }}
      />
    );
  }

  if (activePage === 'test-requests-home') {
    return (
      <TestRequestsHomePage
        onNavigate={handleNavigate}
        onOpenTrDetails={openTrDetails}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarCollapsedChange={setSidebarCollapsed}
        sidebarBadgeCounts={{ 'requests-for-me': requestsForMeSidebarBadgeCount }}
      />
    );
  }

  if (activePage === 'environment-data') {
    return (
      <EnvironmentDataPage
        onNavigate={handleNavigate}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarCollapsedChange={setSidebarCollapsed}
        sidebarBadgeCounts={{ 'requests-for-me': requestsForMeSidebarBadgeCount }}
      />
    );
  }

  if (activePage === 'leave-records') {
    return (
      <LeaveRecordsPage
        onNavigate={handleNavigate}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarCollapsedChange={setSidebarCollapsed}
        sidebarBadgeCounts={{ 'requests-for-me': requestsForMeSidebarBadgeCount }}
      />
    );
  }

  if (activePage === 'materials') {
    return (
      <MaterialsPage
        onNavigate={handleNavigate}
        onOpenMaterial={(id, name) => openMaterialDetails(id, name)}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarCollapsedChange={setSidebarCollapsed}
        sidebarBadgeCounts={{ 'requests-for-me': requestsForMeSidebarBadgeCount }}
      />
    );
  }

  if (activePage === 'material-details') {
    return (
      <MaterialDetailsPage
        key={`${materialDetailsState.id}-${materialDetailsState.initialToast}`}
        materialId={materialDetailsState.id}
        materialName={materialDetailsState.name}
        initialToast={materialDetailsState.initialToast}
        onBack={() => setActivePage('materials')}
        onTransactionComplete={() => openMaterialDetails(materialDetailsState.id, materialDetailsState.name, { initialToast: 'Transaction added successfully.' })}
        onNavigate={handleNavigate}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarCollapsedChange={setSidebarCollapsed}
        sidebarBadgeCounts={{ 'requests-for-me': requestsForMeSidebarBadgeCount }}
      />
    );
  }

  if (activePage === 'instruments') {
    return (
      <InstrumentsPage
        onNavigate={handleNavigate}
        onNewInstrument={() => setActivePage('new-instrument')}
        onOpenInstrument={(id, name) => openInstrumentDetails(id, name)}
        initialToast={instrumentToast}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarCollapsedChange={setSidebarCollapsed}
        sidebarBadgeCounts={{ 'requests-for-me': requestsForMeSidebarBadgeCount }}
      />
    );
  }

  if (activePage === 'instrument-details') {
    return (
      <InstrumentDetailsPage
        key={`${instrumentDetailsState.id}-${instrumentDetailsState.initialToast}`}
        instrumentId={instrumentDetailsState.id}
        instrumentName={instrumentDetailsState.name}
        initialToast={instrumentDetailsState.initialToast}
        onBack={() => setActivePage('instruments')}
        onNavigate={handleNavigate}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarCollapsedChange={setSidebarCollapsed}
        sidebarBadgeCounts={{ 'requests-for-me': requestsForMeSidebarBadgeCount }}
      />
    );
  }

  if (activePage === 'new-instrument') {
    return (
      <NewInstrumentPage
        onBack={() => setActivePage('instruments')}
        onComplete={(instrumentData) => {
          openInstrumentDetails('INST-2026-001', instrumentData?.name || 'New Instrument', {
            initialToast: 'Instrument Created Successfully.',
          });
        }}
      />
    );
  }

  if (activePage === 'new-sample-customer-details') {
    return (
      <NewSampleCustomerDetailsPage
        mode={sampleEditorState.mode}
        sample={sampleEditorState.sample}
        parentLabel={sampleEditorState.parentLabel}
        onBackToWorkspace={() =>
          setActivePage(sampleEditorState.sourcePage === 'all-samples' ? 'all-samples' : 'workspace')
        }
        onComplete={() => {
          if (sampleEditorState.mode === 'edit' && sampleEditorState.sample) {
            openSampleDetails(sampleEditorState.sample.id, {
              initialToast: 'Sample Updated.',
              sourcePage: sampleEditorState.sourcePage,
              sampleStatus: sampleEditorState.sample.status ?? 'Pending',
              createdOn: sampleEditorState.sample.createdOn ?? '06/03/2026, 10:13',
            });
            return;
          }

          openSampleDetails('IICT/2025-2026/1101', {
            initialToast: 'sample-created',
            sourcePage: sampleEditorState.sourcePage,
            sampleStatus: 'Pending',
            createdOn: '06/03/2026, 10:13',
          });
        }}
      />
    );
  }

  return (
      <SampleWorkspacePage
        onNewSample={() => openNewSample({ sourcePage: 'samples-workspace' })}
        onEditSample={openEditSample}
        onOpenSample={openSampleDetails}
        onNavigate={handleNavigate}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarCollapsedChange={setSidebarCollapsed}
        sidebarBadgeCounts={{ 'requests-for-me': requestsForMeSidebarBadgeCount }}
        sampleCardViewMode={sampleCardViewMode}
        onSampleCardViewModeChange={setSampleCardViewMode}
      />
  );
}
