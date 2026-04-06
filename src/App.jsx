import AllSamplesListingPage from './pages/AllSamplesListingPage';
import { useState } from 'react';
import NewSampleCustomerDetailsPage from './pages/NewSampleCustomerDetailsPage';
import SampleDetailsPage from './pages/SampleDetailsPage';
import SampleWorkspacePage from './pages/SampleWorkspacePage';
import TestRequestsListingPage from './pages/TestRequestsListingPage';

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
    const { sourcePage = 'all-samples' } = options;

    setTestRequestsState({
      sampleId,
      sourcePage,
    });
    setActivePage('test-requests');
  };

  const handleNavigate = (nextPage) => {
    if (nextPage === 'samples-workspace') {
      setActivePage('workspace');
      return;
    }

    if (nextPage === 'all-samples') {
      setActivePage('all-samples');
    }
  };

  if (activePage === 'sample-details') {
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
        onBack={() => setActivePage('sample-details')}
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
