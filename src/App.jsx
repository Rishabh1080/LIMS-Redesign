import AllSamplesListingPage from './pages/AllSamplesListingPage';
import { useState } from 'react';
import NewSampleCustomerDetailsPage from './pages/NewSampleCustomerDetailsPage';
import CoaReportSelectionPage from './pages/CoaReportSelectionPage';
import DatasheetPage from './pages/DatasheetPage';
import EnvironmentDataPage from './pages/EnvironmentDataPage';
import FinalisedReportPage from './pages/FinalisedReportPage';
import RequestsForMePage from './pages/RequestsForMePage';
import SampleDetailsPage from './pages/SampleDetailsPage';
import SampleWorkspacePage from './pages/SampleWorkspacePage';
import TempReportPage from './pages/TempReportPage';
import TestRequestsHomePage from './pages/TestRequestsHomePage';
import TestRequestsListingPage from './pages/TestRequestsListingPage';
import TrDetailsPage from './pages/TrDetailsPage';

export default function App() {
  const [activePage, setActivePage] = useState('workspace');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sampleDetailsState, setSampleDetailsState] = useState({
    sampleId: 'IICT/2025-2026/1101',
    initialToast: null,
    sourcePage: 'samples-workspace',
    sampleStatus: 'Draft',
    createdOn: '06/03/2026, 10:13',
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
      sampleStatus = 'Draft',
      createdOn = '06/03/2026, 10:13',
    } = options;

    setSampleDetailsState({
      sampleId,
      initialToast,
      sourcePage,
      sampleStatus,
      createdOn,
    });
    setActivePage('sample-details');
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
        onBack={() =>
          setActivePage(sampleDetailsState.sourcePage === 'all-samples' ? 'all-samples' : 'workspace')
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
      />
    );
  }

  if (activePage === 'all-samples') {
    return (
      <AllSamplesListingPage
        onNavigate={handleNavigate}
        onOpenSample={openSampleDetails}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarCollapsedChange={setSidebarCollapsed}
      />
    );
  }

  if (activePage === 'requests-for-me') {
    return (
      <RequestsForMePage
        onNavigate={handleNavigate}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarCollapsedChange={setSidebarCollapsed}
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
      />
    );
  }

  if (activePage === 'environment-data') {
    return (
      <EnvironmentDataPage
        onNavigate={handleNavigate}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarCollapsedChange={setSidebarCollapsed}
      />
    );
  }

  if (activePage === 'new-sample-customer-details') {
    return (
      <NewSampleCustomerDetailsPage
        onBackToWorkspace={() => setActivePage('workspace')}
        onComplete={() =>
          openSampleDetails('IICT/2025-2026/1101', {
            initialToast: 'sample-created',
            sourcePage: 'samples-workspace',
            sampleStatus: 'Draft',
            createdOn: '06/03/2026, 10:13',
          })
        }
      />
    );
  }

  return (
    <SampleWorkspacePage
      onNewSample={() => setActivePage('new-sample-customer-details')}
      onOpenSample={openSampleDetails}
      onNavigate={handleNavigate}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={setSidebarCollapsed}
    />
  );
}
