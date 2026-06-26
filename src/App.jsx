import AllSamplesListingPage from './pages/AllSamplesListingPage';
import { useEffect, useRef, useState } from 'react';
import AdminHubPage from './pages/AdminHubPage';
import NewSampleCustomerDetailsPage from './pages/NewSampleCustomerDetailsPage';
import CoaReportSelectionPage from './pages/CoaReportSelectionPage';
import CustomFormListingPage from './pages/CustomFormListingPage';
import DashboardPage from './pages/DashboardPage';
import DatasheetPage from './pages/DatasheetPage';
import DocumentDetailsPage from './pages/DocumentDetailsPage';
import DocumentManagementPage from './pages/DocumentManagementPage';
import EnvironmentDataPage from './pages/EnvironmentDataPage';
import FinalisedReportPage from './pages/FinalisedReportPage';
import LeaveRecordsPage from './pages/LeaveRecordsPage';
import MaterialsPage from './pages/MaterialsPage';
import MaterialDetailsPage from './pages/MaterialDetailsPage';
import AllServicesPage from './pages/AllServicesPage';
import InstrumentsPage from './pages/InstrumentsPage';
import InstrumentDetailsPage from './pages/InstrumentDetailsPage';
import NewInstrumentPage from './pages/NewInstrumentPage';
import OrganogramPage from './pages/OrganogramPage';
import TrainingAttendancePage from './pages/TrainingAttendancePage';
import TrainingsPage, { defaultTrainings } from './pages/TrainingsPage';
import RequestsForMePage from './pages/RequestsForMePage';
import ReportDetailsPage from './pages/ReportDetailsPage';
import ReportsPage from './pages/ReportsPage';
import SampleDetailsPage from './pages/SampleDetailsPage';
import SampleWorkspacePage from './pages/SampleWorkspacePage';
import ServiceDetailsPage from './pages/ServiceDetailsPage';
import StockReportPage from './pages/StockReportPage';
import TempReportPage from './pages/TempReportPage';
import TestRequestsHomePage from './pages/TestRequestsHomePage';
import TestRequestsListingPage from './pages/TestRequestsListingPage';
import TrDetailsPage from './pages/TrDetailsPage';
import { initialInstrumentServices, isBreakdownServiceType } from './data/instrumentServices';
import {
  createAnalyticsSessionId,
  getAnalyticsElapsedTime,
  getAnalyticsNow,
  trackEvent,
  trackPageView,
} from './analytics/posthog';
import { requestSections } from './data/requestsForMeData';

function getInitialPage() {
  if (typeof window !== 'undefined' && window.location.hash === '#admin-hub') {
    return 'admin-hub';
  }

  return 'dashboard';
}

const instrumentCatalog = [
  {
    id: 'inst-001',
    name: 'Stabinger Viscometer',
    description: 'Precision viscosity analyzer used for fuel, oil, and lubricant characterization under controlled lab conditions.',
    make: 'Anton Paar',
    lab: 'Central Lab',
    uid: 'SVM4K9',
    uniqueKey: 'SVM-001',
    modelNo: 'SVM 3001',
    serialNo: 'AP-3001-26',
    dateOfInstallation: '14/01/2026',
    lastServiceOn: '14/04/2026',
    calibrated: 'Yes',
    nextServiceOn: '14/10/2026',
    allowAccessTo: 'Rishabh Gangwar, Deepak Cybit, Priya Nair',
    calibLastPerformedOn: '14/04/2026',
    calibFrequency: '180',
    calibRemindBeforeDays: '15',
    calibReminderFrequency: '7',
    calibAllowAccessTo: 'Lab Manager',
    calibAllowAccessTo2: 'Technician',
    calibAllowAccessTo3: 'Quality Analyst',
    pmLastPerformedOn: '14/04/2026',
    pmFrequency: '90',
    pmRemindBeforeDays: '10',
    pmReminderFrequency: '5',
    pmAllowAccessTo: 'Lab Manager',
    pmAllowAccessTo2: 'Technician',
    pmAllowAccessTo3: 'Supervisor',
    bdAllowAccessTo: 'Lab Manager',
    bdAllowAccessTo2: 'Technician',
    bdAllowAccessTo3: 'Supervisor',
    costOfEquipment: '125000',
    referencePurchaseFile: 'PO-2026-014',
    currentLocation: 'Central Lab',
    manufacturerSupplier: 'Anton Paar India',
  },
  {
    id: 'inst-002',
    name: 'UV-Vis Spectrophotometer',
    description: 'Bench-top absorbance system used for quantitative chemical analysis and method validation.',
    make: 'Shimadzu',
    lab: 'Analytical Lab',
    uid: 'UV9P2Q',
    uniqueKey: 'UVV-002',
    modelNo: 'UV-1900i',
    serialNo: 'SH-1900-26',
    dateOfInstallation: '02/01/2026',
    lastServiceOn: '02/03/2026',
    calibrated: 'No',
    nextServiceOn: '02/09/2026',
  },
  {
    id: 'inst-003',
    name: 'Gas Chromatograph',
    description: 'Used for compositional separation and trace-level analysis of volatile compounds.',
    make: 'Agilent',
    lab: 'Organic Lab',
    uid: 'GC8A41',
    uniqueKey: 'GC-003',
    modelNo: '8890',
    serialNo: 'AG-8890-26',
    dateOfInstallation: '18/11/2025',
    lastServiceOn: '18/01/2026',
    calibrated: 'Yes',
    nextServiceOn: '18/07/2026',
  },
  {
    id: 'inst-004',
    name: 'Atomic Absorption Spectrometer',
    description: 'High-sensitivity elemental analysis system for metals and trace contaminants.',
    make: 'PerkinElmer',
    lab: 'Metals Lab',
    uid: 'AAS73X',
    uniqueKey: 'AAS-004',
    modelNo: 'PinAAcle 900T',
    serialNo: 'PE-900T-26',
    dateOfInstallation: '05/02/2026',
    lastServiceOn: '05/04/2026',
    calibrated: 'No',
    nextServiceOn: '05/10/2026',
  },
  {
    id: 'inst-005',
    name: 'pH Meter',
    description: 'Routine pH measurement instrument used for sample prep, solution verification, and QC checks.',
    make: 'Mettler Toledo',
    lab: 'QC Lab',
    uid: 'PHM62D',
    uniqueKey: 'PHM-005',
    modelNo: 'SevenCompact',
    serialNo: 'MT-SC-26',
    dateOfInstallation: '22/12/2025',
    lastServiceOn: '22/03/2026',
    calibrated: 'Yes',
    nextServiceOn: '22/06/2026',
  },
];

function getInstrumentById(instrumentId) {
  return instrumentCatalog.find((instrument) => instrument.id === instrumentId) ?? null;
}

function formatDateForDisplay(value) {
  if (!value) return '-';

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
  }

  return value;
}

function formatDateTimeForDisplay(date = new Date()) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${year}, ${hours}:${minutes}`;
}

const initialCustomFormEntries = {
  'environmental-check': [
    { id: 'environmental-check-entry-001', name: 'Morning environmental check', createdAt: '23/06/2026, 09:00', createdBy: 'Rishabh Gangwar' },
    { id: 'environmental-check-entry-002', name: 'Afternoon environmental check', createdAt: '22/06/2026, 14:30', createdBy: 'Priya Nair' },
    { id: 'environmental-check-entry-003', name: 'Evening environmental check', createdAt: '21/06/2026, 17:45', createdBy: 'Deepak Cybit' },
  ],
  'housekeeping-record': [
    { id: 'housekeeping-record-entry-001', name: 'Wet lab housekeeping record', createdAt: '23/06/2026, 10:15', createdBy: 'Rishabh Gangwar' },
    { id: 'housekeeping-record-entry-002', name: 'Instrument room housekeeping record', createdAt: '22/06/2026, 11:20', createdBy: 'Quality Officer' },
  ],
  'weighing-balance-check': [
    { id: 'weighing-balance-check-entry-001', name: 'Analytical balance daily check', createdAt: '23/06/2026, 08:45', createdBy: 'Lab Manager' },
  ],
  'supplier-management': [
    { id: 'supplier-management-entry-001', name: 'Merck Life Science', createdAt: '20/06/2026, 11:30', createdBy: 'Rishabh Gangwar' },
    { id: 'supplier-management-entry-002', name: 'SD Fine Chemicals', createdAt: '18/06/2026, 15:10', createdBy: 'Quality Officer' },
    { id: 'supplier-management-entry-003', name: 'Loba Chemie', createdAt: '16/06/2026, 10:20', createdBy: 'Lab Manager' },
  ],
};

export default function App() {
  const [activePage, setActivePage] = useState(getInitialPage);
  const sampleCreationFlowRef = useRef({
    id: createAnalyticsSessionId('sample-creation-flow'),
    startedAt: getAnalyticsNow(),
    entryPage: getInitialPage(),
    formVariant: null,
  });
  const lastFlowPageRef = useRef(null);
  const lastTrackedSampleFormVariantRef = useRef(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [sampleCardViewMode, setSampleCardViewMode] = useState('grid');
  const [requestsForMeState, setRequestsForMeState] = useState({
    initialSection: 'requests',
    highlightedAlertId: null,
  });
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
  const [instrumentServices, setInstrumentServices] = useState(initialInstrumentServices);
  const [allServicesActiveTab, setAllServicesActiveTab] = useState('calibration');
  const [instrumentDetailsState, setInstrumentDetailsState] = useState({
    id: null,
    name: '',
    instrument: null,
    initialToast: null,
  });
  const [serviceDetailsState, setServiceDetailsState] = useState({
    service: null,
    instrumentId: null,
    instrumentName: '',
    sourcePage: 'instrument-details',
  });
  const [instrumentEditorState, setInstrumentEditorState] = useState({
    mode: 'create',
    instrument: null,
    sourcePage: 'instruments',
    parentLabel: 'Instruments',
  });
  const [materialDetailsState, setMaterialDetailsState] = useState({ id: null, name: '', initialToast: null });
  const [documentDetailsState, setDocumentDetailsState] = useState({
    document: null,
    sourcePage: 'document-management',
    sourceLabel: 'Document Management',
  });
  const [reportDetailsState, setReportDetailsState] = useState({
    report: null,
  });
  const [customFormEntries, setCustomFormEntries] = useState(initialCustomFormEntries);
  const [trDetailsState, setTrDetailsState] = useState({
    sampleId: 'IICT/2025-2026/1101',
    sourcePage: 'all-samples',
    requestId: 'URLS/26/ULRS/O/2026/30/330',
    requestStatus: null,
    workflowStage: 'default',
    initialToast: null,
    remnantAvailable: null,
  });
  const [datasheetState, setDatasheetState] = useState({
    sampleId: 'IICT/2025-2026/1101',
    sourcePage: 'all-samples',
    datasheetId: 'URLS/TR/00031',
  });
  const [trainingAttendanceState, setTrainingAttendanceState] = useState({
    id: null,
    name: 'Training',
  });

  const getSampleCreationFlowProps = (properties = {}) => ({
    form_name: 'sample_creation',
    sample_creation_flow_session_id: sampleCreationFlowRef.current.id,
    sample_creation_flow_elapsed_ms: getAnalyticsElapsedTime(sampleCreationFlowRef.current.startedAt),
    sample_creation_flow_entry_page: sampleCreationFlowRef.current.entryPage,
    form_variant: sampleCreationFlowRef.current.formVariant,
    ...properties,
  });

  useEffect(() => {
    trackPageView(activePage);

    if (activePage === 'dashboard' && lastFlowPageRef.current !== 'dashboard') {
      sampleCreationFlowRef.current = {
        id: createAnalyticsSessionId('sample-creation-flow'),
        startedAt: getAnalyticsNow(),
        entryPage: 'dashboard',
        formVariant: null,
      };
      lastTrackedSampleFormVariantRef.current = null;
      trackEvent('sample_creation_flow_dashboard_landed', getSampleCreationFlowProps({
        page_name: 'dashboard',
      }));
    }

    if (activePage === 'workspace' && lastFlowPageRef.current !== 'workspace') {
      trackEvent('sample_creation_flow_workspace_viewed', getSampleCreationFlowProps({
        page_name: 'samples-workspace',
      }));
    }

    lastFlowPageRef.current = activePage;
  }, [activePage]);

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

    if (initialToast === 'sample-created') {
      trackEvent('sample_creation_flow_sample_details_opened', getSampleCreationFlowProps({
        source_page: sourcePage,
        sample_status: sampleStatus,
        toast_key: initialToast,
      }));
    }

    setActivePage('sample-details');
  };

  const openInstrumentDetails = (instrumentId, instrumentName, options = {}) => {
    const { initialToast = null } = options;
    const instrument = getInstrumentById(instrumentId) ?? {
      id: instrumentId,
      name: instrumentName,
    };

    setInstrumentDetailsState({
      id: instrument.id,
      name: instrument.name,
      instrument,
      initialToast,
    });
    setActivePage('instrument-details');
  };

  const openServiceDetails = (service, options = {}) => {
    if (isBreakdownServiceType(service?.serviceType || service?.type)) {
      return;
    }

    const instrumentId = options.instrumentId ?? service?.instrumentId ?? instrumentDetailsState.id;
    const instrumentName = options.instrumentName ?? service?.instrumentName ?? instrumentDetailsState.name;
    const sourcePage = options.sourcePage ?? (activePage === 'all-services' ? 'all-services' : 'instrument-details');
    const instrument = getInstrumentById(instrumentId) ?? {
      id: instrumentId,
      name: instrumentName,
    };

    if (instrumentId || instrumentName) {
      setInstrumentDetailsState({
        id: instrument.id,
        name: instrument.name,
        instrument,
        initialToast: null,
      });
    }

    setServiceDetailsState({
      service,
      instrumentId: instrument.id,
      instrumentName: instrument.name,
      sourcePage,
    });
    setActivePage('service-details');
  };

  const openDocumentDetails = (document, options = {}) => {
    const sourcePage = options.sourcePage ?? (
      activePage === 'document-management-2' || activePage === 'document-management-3'
        ? activePage
        : 'document-management'
    );
    const sourceLabel = options.sourceLabel ?? (
      sourcePage === 'document-management-2'
        ? 'Document Management'
        : sourcePage === 'document-management-3'
          ? 'Document Management 3'
          : 'Document Management'
    );

    setDocumentDetailsState({
      document,
      sourcePage,
      sourceLabel,
    });
    setActivePage('document-details');
  };

  const openReportDetails = (report) => {
    setReportDetailsState({ report });
    setActivePage('report-details');
  };

  const createCustomFormEntry = (formId, entry) => {
    setCustomFormEntries((current) => ({
      ...current,
      [formId]: [
        {
          id: `${formId}-entry-${Date.now()}`,
          name: entry.name,
          createdAt: formatDateTimeForDisplay(),
          createdBy: 'Rishabh Gangwar',
        },
        ...(current[formId] ?? []),
      ],
    }));
  };

  const handleServiceCreated = (service) => {
    setInstrumentServices((current) => [
      service,
      ...current.filter((currentService) => currentService.id !== service.id),
    ]);
  };

  const handleServiceUpdated = (service) => {
    setInstrumentServices((current) =>
      current.map((currentService) => (
        currentService.id === service.id ? { ...currentService, ...service } : currentService
      )),
    );
    setServiceDetailsState((current) => (
      current.service?.id === service.id
        ? { ...current, service: { ...current.service, ...service } }
        : current
    ));
  };

  const createServiceFromDraft = (draft) => {
    const instrument = getInstrumentById(draft.instrumentId);

    if (!instrument) {
      return null;
    }

    const now = new Date();
    const details = draft.details || `${draft.serviceType} service created for ${instrument.name}.`;
    const isBreakdown = isBreakdownServiceType(draft.serviceType);
    const service = {
      id: `SVC-${now.getFullYear()}-${String(instrumentServices.length + 1).padStart(3, '0')}`,
      status: 'Not initialised',
      stage: 'service-created',
      details,
      summary: details,
      serviceType: draft.serviceType,
      calibrationType: draft.calibrationType,
      vendor: draft.vendor,
      attachment: draft.attachment,
      instrumentId: instrument.id,
      instrumentName: instrument.name,
      ...(isBreakdown
        ? {
            reportedOn: now.toLocaleDateString('en-GB'),
            reportedBy: 'Rishabh Gangwar',
            breakdownComments: details,
            breakdownDate: formatDateForDisplay(draft.serviceDate),
          }
        : {
            serviceDate: formatDateForDisplay(draft.serviceDate),
            nextServiceDate: formatDateForDisplay(draft.nextServiceOn),
          }),
    };

    handleServiceCreated(service);
    return service;
  };

  const openNewInstrument = () => {
    setInstrumentEditorState({
      mode: 'create',
      instrument: null,
      sourcePage: 'instruments',
      parentLabel: 'Instruments',
    });
    setActivePage('new-instrument');
  };

  const openEditInstrument = (instrumentOrId, options = {}) => {
    const { sourcePage = 'instruments' } = options;
    const instrument =
      typeof instrumentOrId === 'string'
        ? getInstrumentById(instrumentOrId)
        : instrumentOrId;

    if (!instrument) {
      return;
    }

    setInstrumentEditorState({
      mode: 'edit',
      instrument,
      sourcePage,
      parentLabel: 'Instruments',
    });
    setActivePage('new-instrument');
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
    const {
      sourcePage = 'all-samples',
      requestId = 'URLS/26/ULRS/O/2026/30/330',
      requestStatus = null,
    } = options;
    setTrDetailsState((current) => ({
      sampleId,
      sourcePage,
      requestId,
      requestStatus,
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

  const openTrainingAttendance = (trainingId, trainingName) => {
    setTrainingAttendanceState({
      id: trainingId,
      name: trainingName,
    });
    setActivePage('training-attendance');
  };

  const openNewSample = (options = {}) => {
    const { sourcePage = 'samples-workspace' } = options;
    const parentLabel = sourcePage === 'all-samples' ? 'All Samples' : 'Samples Workspace';

    trackEvent('sample_creation_flow_new_sample_clicked', getSampleCreationFlowProps({
      from_page: activePage,
      source_page: sourcePage,
      parent_label: parentLabel,
    }));

    setSampleEditorState({
      mode: 'create',
      sample: null,
      sourcePage,
      parentLabel,
    });
    setActivePage('new-sample-customer-details');
  };

  const handleSampleFormVariantChange = (formVariant) => {
    if (!formVariant) {
      return;
    }

    sampleCreationFlowRef.current = {
      ...sampleCreationFlowRef.current,
      formVariant,
    };

    if (lastTrackedSampleFormVariantRef.current === formVariant) {
      return;
    }

    lastTrackedSampleFormVariantRef.current = formVariant;
    trackEvent('sample_creation_flow_variant_assigned', getSampleCreationFlowProps({
      form_variant: formVariant,
    }));
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
      initialToast: 'tr-submitted',
      remnantAvailable,
    }));
  };

  const handleNavigate = (nextPage, options = {}) => {
    if (activePage === 'dashboard' && ['samples-workspace', 'all-samples'].includes(nextPage)) {
      trackEvent('sample_creation_flow_dashboard_navigation_clicked', getSampleCreationFlowProps({
        from_page: activePage,
        to_page: nextPage,
        opens_in_new_tab: Boolean(options.newTab),
      }));
    }

    if (nextPage === 'admin-hub') {
      if (options.newTab && typeof window !== 'undefined') {
        const adminHubUrl = new URL(window.location.href);
        adminHubUrl.hash = 'admin-hub';
        window.open(adminHubUrl.toString(), '_blank', 'noopener,noreferrer');
        return;
      }

      setActivePage('admin-hub');
      return;
    }

    if (nextPage === 'dashboard') {
      setSidebarCollapsed(true);
      setActivePage('dashboard');
      return;
    }

    if (nextPage === 'samples-workspace') {
      setActivePage('workspace');
      return;
    }

    if (nextPage === 'requests-for-me') {
      setRequestsForMeState({
        initialSection: options.initialSection ?? 'requests',
        highlightedAlertId: options.highlightedAlertId ?? null,
      });
      setActivePage('requests-for-me');
      return;
    }

    if (nextPage === 'test-requests-home') {
      setActivePage('test-requests-home');
      return;
    }

    if (
      nextPage === 'document-management'
      || nextPage === 'document-management-2'
      || nextPage === 'document-management-3'
    ) {
      setActivePage(nextPage);
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

    if (nextPage === 'stock-report') {
      setActivePage('stock-report');
      return;
    }

    if (nextPage === 'instruments') {
      setActivePage('instruments');
      return;
    }

    if (nextPage === 'all-services') {
      setActivePage('all-services');
      return;
    }

    if (nextPage === 'instrument-details') {
      setActivePage('instrument-details');
      return;
    }

    if (nextPage === 'trainings') {
      setActivePage('trainings');
      return;
    }

    if (nextPage === 'reports') {
      setActivePage('reports');
      return;
    }

    if (nextPage === 'organogram') {
      setActivePage('organogram');
      return;
    }

    if (
      nextPage === 'daily-check'
      || nextPage === 'quality-objective'
      || nextPage === 'supplier-management'
      || nextPage.startsWith('custom-form-')
    ) {
      setActivePage(nextPage);
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

  if (activePage === 'admin-hub') {
    return <AdminHubPage />;
  }

  if (activePage === 'dashboard') {
    return (
      <DashboardPage
        instruments={instrumentCatalog}
        trainings={defaultTrainings}
        onNavigate={handleNavigate}
        onOpenSample={openSampleDetails}
        onNewSample={openNewSample}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarCollapsedChange={setSidebarCollapsed}
        sidebarBadgeCounts={{ 'requests-for-me': requestsForMeSidebarBadgeCount }}
      />
    );
  }

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
        sampleCreationFlowSessionId={sampleCreationFlowRef.current.id}
        sampleCreationFlowStartedAt={sampleCreationFlowRef.current.startedAt}
        sampleCreationFormVariant={sampleCreationFlowRef.current.formVariant}
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
        onOpenTrDetails={(requestId, requestStatus) =>
          openTrDetails(testRequestsState.sampleId, {
            sourcePage: testRequestsState.sourcePage,
            requestId,
            requestStatus,
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
          requestStatus={trDetailsState.requestStatus}
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
        initialSection={requestsForMeState.initialSection}
        highlightedAlertId={requestsForMeState.highlightedAlertId}
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

  if (activePage === 'document-management') {
    return (
      <DocumentManagementPage
        key="document-management"
        onNavigate={handleNavigate}
        onOpenDocumentDetails={openDocumentDetails}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarCollapsedChange={setSidebarCollapsed}
        sidebarBadgeCounts={{ 'requests-for-me': requestsForMeSidebarBadgeCount }}
      />
    );
  }

  if (activePage === 'document-management-2') {
    return (
      <DocumentManagementPage
        key="document-management-2"
        title="Document Management"
        activeNav="document-management-2"
        combinedMode
        onNavigate={handleNavigate}
        onOpenDocumentDetails={openDocumentDetails}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarCollapsedChange={setSidebarCollapsed}
        sidebarBadgeCounts={{ 'requests-for-me': requestsForMeSidebarBadgeCount }}
      />
    );
  }

  if (activePage === 'document-management-3') {
    return (
      <DocumentManagementPage
        key="document-management-3"
        title="Document Management 3"
        activeNav="document-management-3"
        combinedMode
        stepNavigationMode
        onNavigate={handleNavigate}
        onOpenDocumentDetails={openDocumentDetails}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarCollapsedChange={setSidebarCollapsed}
        sidebarBadgeCounts={{ 'requests-for-me': requestsForMeSidebarBadgeCount }}
      />
    );
  }

  if (activePage === 'document-details') {
    return (
      <DocumentDetailsPage
        document={documentDetailsState.document}
        sourcePage={documentDetailsState.sourcePage}
        sourceLabel={documentDetailsState.sourceLabel}
        onBack={() => setActivePage(documentDetailsState.sourcePage ?? 'document-management')}
        onNavigate={handleNavigate}
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
        onStockReport={() => setActivePage('stock-report')}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarCollapsedChange={setSidebarCollapsed}
        sidebarBadgeCounts={{ 'requests-for-me': requestsForMeSidebarBadgeCount }}
      />
    );
  }

  if (activePage === 'stock-report') {
    return (
      <StockReportPage
        onBack={() => setActivePage('materials')}
        onNavigate={handleNavigate}
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
        services={instrumentServices}
        onNavigate={handleNavigate}
        onNewInstrument={openNewInstrument}
        onEditInstrument={(instrumentId) => openEditInstrument(instrumentId, { sourcePage: 'instruments' })}
        onOpenInstrument={(id, name) => openInstrumentDetails(id, name)}
        onOpenService={openServiceDetails}
        onOpenAllServices={() => setActivePage('all-services')}
        onCreateService={createServiceFromDraft}
        onServiceUpdate={handleServiceUpdated}
        initialToast={instrumentToast}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarCollapsedChange={setSidebarCollapsed}
        sidebarBadgeCounts={{ 'requests-for-me': requestsForMeSidebarBadgeCount }}
      />
    );
  }

  if (activePage === 'all-services') {
    return (
      <AllServicesPage
        services={instrumentServices}
        instruments={instrumentCatalog}
        activeTab={allServicesActiveTab}
        onActiveTabChange={setAllServicesActiveTab}
        onBack={() => setActivePage('instruments')}
        onCreateService={createServiceFromDraft}
        onServiceUpdate={handleServiceUpdated}
        onOpenInstrument={(id, name) => openInstrumentDetails(id, name)}
        onOpenService={openServiceDetails}
        onNavigate={handleNavigate}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarCollapsedChange={setSidebarCollapsed}
        sidebarBadgeCounts={{ 'requests-for-me': requestsForMeSidebarBadgeCount }}
      />
    );
  }

  if (activePage === 'trainings') {
    return (
      <TrainingsPage
        onOpenAttendance={(id, name) => openTrainingAttendance(id, name)}
        onNavigate={handleNavigate}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarCollapsedChange={setSidebarCollapsed}
        sidebarBadgeCounts={{ 'requests-for-me': requestsForMeSidebarBadgeCount }}
      />
    );
  }

  if (activePage === 'training-attendance') {
    return (
      <TrainingAttendancePage
        trainingName={trainingAttendanceState.name}
        onBack={() => setActivePage('trainings')}
        onNavigate={handleNavigate}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarCollapsedChange={setSidebarCollapsed}
        sidebarBadgeCounts={{ 'requests-for-me': requestsForMeSidebarBadgeCount }}
      />
    );
  }

  if (activePage === 'reports') {
    return (
      <ReportsPage
        onOpenReport={openReportDetails}
        onNavigate={handleNavigate}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarCollapsedChange={setSidebarCollapsed}
        sidebarBadgeCounts={{ 'requests-for-me': requestsForMeSidebarBadgeCount }}
      />
    );
  }

  if (activePage === 'report-details') {
    return (
      <ReportDetailsPage
        report={reportDetailsState.report}
        onBack={() => setActivePage('reports')}
        onNavigate={handleNavigate}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarCollapsedChange={setSidebarCollapsed}
        sidebarBadgeCounts={{ 'requests-for-me': requestsForMeSidebarBadgeCount }}
      />
    );
  }

  if (activePage === 'organogram') {
    return (
      <OrganogramPage
        onNavigate={handleNavigate}
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
        description={instrumentDetailsState.instrument?.description}
        make={instrumentDetailsState.instrument?.make}
        uniqueKey={instrumentDetailsState.instrument?.uniqueKey}
        modelNo={instrumentDetailsState.instrument?.modelNo}
        serialNo={instrumentDetailsState.instrument?.serialNo}
        dateOfInstallation={instrumentDetailsState.instrument?.dateOfInstallation}
        peopleWithAccess={instrumentDetailsState.instrument?.allowAccessTo}
        records={instrumentServices.filter((service) => service.instrumentId === instrumentDetailsState.id)}
        initialToast={instrumentDetailsState.initialToast}
        onBack={() => setActivePage('instruments')}
        onServiceCreated={handleServiceCreated}
        onServiceUpdate={handleServiceUpdated}
        onEditInstrument={() =>
          openEditInstrument(instrumentDetailsState.instrument ?? instrumentDetailsState.id, {
            sourcePage: 'instrument-details',
          })
        }
        onOpenService={openServiceDetails}
        onNavigate={handleNavigate}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarCollapsedChange={setSidebarCollapsed}
        sidebarBadgeCounts={{ 'requests-for-me': requestsForMeSidebarBadgeCount }}
      />
    );
  }

  if (activePage === 'service-details') {
    return (
      <ServiceDetailsPage
        service={serviceDetailsState.service}
        instrumentId={serviceDetailsState.instrumentId}
        instrumentName={serviceDetailsState.instrumentName}
        onBack={() =>
          setActivePage(serviceDetailsState.sourcePage === 'all-services' ? 'all-services' : 'instrument-details')
        }
        onServiceUpdate={handleServiceUpdated}
        onNavigate={handleNavigate}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarCollapsedChange={setSidebarCollapsed}
        sidebarBadgeCounts={{ 'requests-for-me': requestsForMeSidebarBadgeCount }}
      />
    );
  }

  if (
    activePage === 'daily-check'
    || activePage === 'quality-objective'
    || activePage === 'supplier-management'
    || activePage.startsWith('custom-form-')
  ) {
    return (
      <CustomFormListingPage
        formType={activePage}
        entriesByFormId={customFormEntries}
        onCreateEntry={createCustomFormEntry}
        onBack={() => setActivePage('daily-check')}
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
        mode={instrumentEditorState.mode}
        instrument={instrumentEditorState.instrument}
        parentLabel={instrumentEditorState.parentLabel}
        onBack={() =>
          setActivePage(
            instrumentEditorState.sourcePage === 'instrument-details' ? 'instrument-details' : 'instruments',
          )
        }
        onComplete={(instrumentData) => {
          const nextId = instrumentData?.id || instrumentEditorState.instrument?.id || 'INST-2026-001';
          const nextName = instrumentData?.name || 'New Instrument';

          setInstrumentDetailsState({
            id: nextId,
            name: nextName,
            instrument: {
              ...(instrumentEditorState.instrument ?? {}),
              ...instrumentData,
              id: nextId,
              name: nextName,
            },
            initialToast:
              instrumentEditorState.mode === 'edit'
                ? 'Instrument Updated Successfully.'
                : 'Instrument Created Successfully.',
          });
          setActivePage('instrument-details');
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
        sampleCreationFlowSessionId={sampleCreationFlowRef.current.id}
        onSampleFormVariantChange={handleSampleFormVariantChange}
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

          trackEvent('sample_creation_flow_create_resolved', getSampleCreationFlowProps({
            source_page: sampleEditorState.sourcePage,
            target_page: 'sample-details',
            sample_status: 'Pending',
            toast_key: 'sample-created',
          }));

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
