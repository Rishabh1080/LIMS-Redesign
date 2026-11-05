import { useEffect, useMemo, useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import DataTable from '../components/DataTable';
import NavSelector from '../components/NavSelector';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import StatusPill from '../components/StatusPill';
import Checkbox from '../components/Checkbox/Checkbox';
import { FormElement } from '../components/FormControls';
import './new-tr-page.scss';

function parseDeadline(value) {
  const [day, month, year] = String(value ?? '').split('/').map(Number);
  if (!day || !month || !year) return 0;
  return new Date(year, month - 1, day).getTime();
}

// --- Shared dataset -------------------------------------------------------
// One pool of TRs. Tabs and filters are just different slices of this.
const TR_POOL = [
  { id: 'URLS/26/O/2026/30/341', parameter: 'Total Iron as Fe', product: 'Boiler Water', customer: 'Reliance Industries', stage: 'unassigned', allocatedTo: null, enteredBy: null, result: null, spec: null, deadline: '31/03/2026', created: '18/03/2026', mine: false },
  { id: 'URLS/26/O/2026/30/342', parameter: 'Total Hardness as CaCO3', product: 'Boiler Water', customer: 'Tata Chemicals', stage: 'unassigned', allocatedTo: null, enteredBy: null, result: null, spec: null, deadline: '29/03/2026', created: '18/03/2026', mine: false },
  { id: 'URLS/26/O/2026/30/343', parameter: 'Dissolved Oxygen', product: 'Cooling Water', customer: 'Grasim', stage: 'unassigned', allocatedTo: null, enteredBy: null, result: null, spec: null, deadline: '28/03/2026', created: '17/03/2026', mine: false },
  { id: 'URLS/26/O/2026/30/318', parameter: 'pH Value', product: 'Boiler Water', customer: 'Reliance Industries', stage: 'in-progress', allocatedTo: 'You', enteredBy: null, result: null, spec: null, deadline: '27/03/2026', created: '15/03/2026', mine: true },
  { id: 'URLS/26/O/2026/30/319', parameter: 'Turbidity', product: 'Boiler Water', customer: 'Tata Chemicals', stage: 'in-progress', allocatedTo: 'You', enteredBy: null, result: null, spec: null, deadline: '28/03/2026', created: '15/03/2026', mine: true },
  { id: 'URLS/26/O/2026/30/320', parameter: 'Conductivity', product: 'Cooling Water', customer: 'Grasim', stage: 'in-progress', allocatedTo: 'Deepak Cybit', enteredBy: null, result: null, spec: null, deadline: '26/03/2026', created: '14/03/2026', mine: false },
  { id: 'URLS/26/O/2026/30/305', parameter: 'Total Iron as Fe', product: 'Cooling Water', customer: 'Cooling Co.', stage: 'pending-approval', allocatedTo: 'Priya Nair', enteredBy: 'Priya Nair', result: '0.28 mg/L', spec: '≤ 0.30 mg/L', deadline: '24/03/2026', created: '12/03/2026', mine: false, pass: true },
  { id: 'URLS/26/O/2026/30/306', parameter: 'Dissolved Oxygen', product: 'Tata Chemicals', customer: 'Tata Chemicals', stage: 'pending-approval', allocatedTo: 'You', enteredBy: 'You', result: '6.9 mg/L', spec: '≥ 6.0 mg/L', deadline: '25/03/2026', created: '12/03/2026', mine: true, pass: true },
  { id: 'URLS/26/O/2026/30/307', parameter: 'Total Dissolved Solids', product: 'Boiler Water', customer: 'Reliance Industries', stage: 'pending-approval', allocatedTo: 'Ravi Sharma', enteredBy: 'Ravi Sharma', result: '640 mg/L', spec: '≤ 500 mg/L', deadline: '23/03/2026', created: '11/03/2026', mine: false, pass: false },
  { id: 'URLS/26/O/2026/30/298', parameter: 'Turbidity', product: 'Boiler Water', customer: 'Reliance Industries', stage: 'completed', allocatedTo: 'Deepak Cybit', enteredBy: 'Deepak Cybit', result: '1.2 NTU', spec: '≤ 5 NTU', deadline: '20/03/2026', created: '08/03/2026', mine: false, pass: true },
  { id: 'URLS/26/O/2026/30/290', parameter: 'Total Alkalinity as CaCO3', product: 'Cooling Water', customer: 'Grasim', stage: 'completed', allocatedTo: 'You', enteredBy: 'You', result: '88 mg/L', spec: '≤ 200 mg/L', deadline: '18/03/2026', created: '05/03/2026', mine: true, pass: true },
  { id: 'URLS/26/O/2026/30/285', parameter: 'pH Value', product: 'Boiler Water', customer: 'Tata Chemicals', stage: 'completed', allocatedTo: 'Anita Desai', enteredBy: 'Anita Desai', result: '9.4', spec: '6.5 – 8.5', deadline: '16/03/2026', created: '03/03/2026', mine: false, pass: false },
];

const STAGE_PRESENTATION = {
  unassigned: { label: 'Unassigned', color: 'gray', rowTone: 'unallocated' },
  'in-progress': { label: 'In progress', color: 'blue', rowTone: 'mine' },
  'pending-approval': { label: 'Pending approval', color: 'yellow', rowTone: 'approval' },
  completed: { label: 'Completed', color: 'green', rowTone: 'done' },
};

const STAGE_ORDER = ['unassigned', 'in-progress', 'pending-approval', 'completed'];

// --- Column renderers -----------------------------------------------------
function StageCell({ stage }) {
  const presentation = STAGE_PRESENTATION[stage];
  return <StatusPill color={presentation.color} styleType="neutral">{presentation.label}</StatusPill>;
}

function ResultCell({ row }) {
  if (!row.result) return <span className="text-secondary">—</span>;
  if (row.pass === false) {
    return <span className="text-danger fw-medium">{row.result}</span>;
  }
  return <span>{row.result}</span>;
}

// A column is { key, label, render? }. Default render reads row[key].
const COLUMN = {
  id: { key: 'id', label: 'Sample ID', render: (row) => <span className="smplfy-link link-primary fw-medium">{row.id}</span> },
  parameter: { key: 'parameter', label: 'Test Parameters' },
  product: { key: 'product', label: 'Product' },
  customer: { key: 'customer', label: 'Customer' },
  stage: { key: 'stage', label: 'Status', render: (row) => <StageCell stage={row.stage} /> },
  allocatedTo: { key: 'allocatedTo', label: 'Allocated to', render: (row) => row.allocatedTo ?? <span className="text-secondary">Unallocated</span> },
  enteredBy: { key: 'enteredBy', label: 'Entered by', render: (row) => row.enteredBy ?? <span className="text-secondary">—</span> },
  result: { key: 'result', label: 'Result', render: (row) => <ResultCell row={row} /> },
  spec: { key: 'spec', label: 'Spec limit', render: (row) => row.spec ?? <span className="text-secondary">—</span> },
  deadline: { key: 'deadline', label: 'Deadline' },
  created: { key: 'created', label: 'Created date', sortable: true },
};

// The plain value a column filters on (stage shows its human label; blanks
// become a readable "—"/"Unallocated").
function columnFilterValue(row, key) {
  if (key === 'stage') return STAGE_PRESENTATION[row.stage].label;
  if (key === 'allocatedTo') return row.allocatedTo ?? 'Unallocated';
  if (key === 'enteredBy') return row.enteredBy ?? 'Not entered';
  if (key === 'result') return row.result ?? 'No result';
  return row[key] ?? '—';
}

// --- Row actions (CTAs) ---------------------------------------------------
const ACTIONS = {
  claim: () => <PrimaryButton size="medium" leftIcon="plus">Self-allocate</PrimaryButton>,
  allocate: () => <PrimaryButton size="medium" leftIcon="workspace">Allocate</PrimaryButton>,
  work: () => <PrimaryButton size="medium" leftIcon="edit">Enter results</PrimaryButton>,
  approve: () => (
    <div className="d-flex align-items-center gap-2 justify-content-end">
      <SecondaryButton size="medium" tone="neutral">Reject</SecondaryButton>
      <PrimaryButton size="medium" styleVariant="positive" leftIcon="check">Approve</PrimaryButton>
    </div>
  ),
  view: () => <SecondaryButton size="medium" leftIcon="eye">View</SecondaryButton>,
  none: () => null,
};

// --- Tab definitions ------------------------------------------------------
// Each tab: key, label, filter(row) -> boolean, columns[], action, emptyText,
// and optional subFilters (adjacent tab row that narrows further).
const TAB = {
  unassigned: {
    key: 'unassigned',
    label: 'Unassigned',
    filter: (row) => row.stage === 'unassigned',
    columns: ['id', 'parameter', 'product', 'deadline'],
    action: 'claim',
    emptyText: 'No unassigned test requests.',
  },
  pending: {
    key: 'pending',
    label: 'Pending',
    filter: (row) => row.stage === 'in-progress' && row.mine,
    columns: ['id', 'parameter', 'product', 'deadline', 'stage'],
    action: 'work',
    emptyText: 'No pending work assigned to you.',
  },
  completedMine: {
    key: 'completed',
    label: 'Completed',
    filter: (row) => (row.stage === 'completed' || row.stage === 'pending-approval') && row.mine,
    columns: ['id', 'parameter', 'result', 'spec', 'deadline', 'stage'],
    action: 'view',
    emptyText: 'You have not completed any test requests yet.',
  },
  pendingAllocation: {
    key: 'pending-allocation',
    label: 'Pending for allocation',
    filter: (row) => row.stage === 'unassigned',
    columns: ['id', 'parameter', 'product', 'deadline'],
    action: 'allocate',
    emptyText: 'Nothing waiting for allocation.',
  },
  pendingApproval: {
    key: 'pending-approval',
    label: 'Pending for approval',
    filter: (row) => row.stage === 'pending-approval',
    columns: ['id', 'parameter', 'result', 'spec', 'enteredBy', 'deadline'],
    action: 'approve',
    emptyText: 'No results waiting for approval.',
  },
  all: {
    key: 'all',
    label: 'All',
    filter: () => true,
    columns: ['id', 'parameter', 'allocatedTo', 'enteredBy', 'result', 'deadline', 'stage'],
    action: 'view',
    emptyText: 'No test requests found.',
  },
};

const SORT_OPTIONS = [
  { value: 'created-asc', label: 'Created date: Old to new' },
  { value: 'created-desc', label: 'Created date: New to old' },
];

function sortRows(rows, sortBy) {
  return [...rows].sort((first, second) => {
    const diff = parseDeadline(first.created) - parseDeadline(second.created);
    return sortBy === 'created-desc' ? -diff : diff;
  });
}

// --- Archetypes -----------------------------------------------------------
const ARCHETYPES = [
  {
    value: 'analyst-no-self',
    label: 'Analyst (cannot self-allocate)',
    summary: 'TRs arrive pre-allocated. Pending is work to do; Completed is done.',
    tabs: ['pending', 'completedMine'],
  },
  {
    value: 'analyst-self',
    label: 'Analyst (can self-allocate)',
    summary: 'Claim from Unassigned, work from Pending, review in Completed.',
    tabs: ['unassigned', 'pending', 'completedMine'],
  },
  {
    value: 'allocator',
    label: 'Lab Head / QA Manager (allocator only)',
    summary: 'Distribute unallocated work to analysts.',
    tabs: ['pendingAllocation'],
  },
  {
    value: 'allocator-approver',
    label: 'Lab Head / QA Manager (allocator + approver)',
    summary: 'Allocate work and approve results. No personal work queue.',
    tabs: ['pendingApproval', 'pendingAllocation'],
  },
  {
    value: 'approver',
    label: 'Approver only',
    summary: 'Review and sign off on results sent to you.',
    tabs: ['pendingApproval'],
  },
  {
    value: 'analyst-approver',
    label: 'Analyst + Approver',
    summary: 'Work your TRs, approve others, review what you finished.',
    tabs: ['pending', 'pendingApproval', 'completedMine'],
  },
  {
    value: 'admin',
    label: 'Full access (Admin / Lab Owner)',
    summary: 'See and act across the whole pipeline.',
    tabs: ['unassigned', 'pending', 'pendingApproval', 'completedMine', 'all'],
  },
  {
    value: 'viewer',
    label: 'Read-only / Viewer',
    summary: 'Search and view all TRs. No actions.',
    tabs: ['all'],
    readOnly: true,
  },
  {
    value: 'final',
    label: 'Final (unified table)',
    summary: 'One table. Status tabs with dependent sub-filters, sort, and search below.',
    mode: 'final',
    tabs: [],
  },
  {
    value: 'analyst-final',
    label: 'Analyst final',
    summary: 'Analyst view: Pending (claim or work) and Completed. Self-allocate turns into Enter results.',
    mode: 'analyst-final',
    bluePills: true,
    tabs: [],
  },
  {
    value: 'technical-manager',
    label: 'Technical Manager',
    summary: 'Technical Manager view: allocate work and approve results across the lab.',
    mode: 'technical-manager',
    bluePills: true,
    tabs: [],
  },
];

// --- Generic tabbed view (archetypes 1–8) ---------------------------------
function TabbedTrView({ archetype }) {
  const tabs = archetype.tabs.map((tabKey) => TAB[tabKey]);
  const [activeTab, setActiveTab] = useState(tabs[0].key);
  const [sortBy, setSortBy] = useState('created-asc');

  // Keep the active tab valid when the archetype (and its tab set) changes.
  useEffect(() => {
    if (!tabs.some((tab) => tab.key === activeTab)) {
      setActiveTab(tabs[0].key);
    }
  }, [archetype.value]); // eslint-disable-line react-hooks/exhaustive-deps

  const tab = tabs.find((item) => item.key === activeTab) ?? tabs[0];
  const columns = tab.columns.map((key) => COLUMN[key]);
  const action = archetype.readOnly ? 'view' : tab.action;

  const rows = useMemo(
    () => sortRows(TR_POOL.filter(tab.filter), sortBy),
    [tab, sortBy],
  );

  const counts = useMemo(() => {
    const result = {};
    tabs.forEach((item) => { result[item.key] = TR_POOL.filter(item.filter).length; });
    return result;
  }, [tabs]);

  return (
    <div className="d-flex flex-column gap-3">
      <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
        <div className="smplfy-new-tr-tabs nav nav-pills d-inline-flex align-items-center flex-wrap gap-1 p-1 bg-white border rounded">
          {tabs.map((item) => (
            <NavSelector
              key={item.key}
              size="medium"
              active={activeTab === item.key}
              count={counts[item.key]}
              onClick={() => setActiveTab(item.key)}
            >
              {item.label}
            </NavSelector>
          ))}
        </div>

        <div className="smplfy-new-tr-sort d-flex align-items-center gap-2">
          <span className="text-secondary flex-shrink-0 small">Sort by</span>
          <FormElement
            type="dropdown"
            className="mb-0"
            inputProps={{
              state: 'filled',
              value: sortBy,
              options: SORT_OPTIONS,
              onChange: (event) => setSortBy(event.target.value),
            }}
          />
        </div>
      </div>

      <TrTable columns={columns} rows={rows} action={action} emptyText={tab.emptyText} />
    </div>
  );
}

// --- Final unified view (status tabs + dependent sub-filters) -------------
const FINAL_TABS = [
  {
    key: 'pending',
    label: 'Pending',
    filter: (row) => row.stage !== 'completed',
    subFilters: [
      { key: 'all', label: 'All' },
      { key: 'unassigned', label: 'Unassigned', filter: (row) => row.stage === 'unassigned' },
      { key: 'assigned', label: 'Assigned', filter: (row) => row.stage === 'in-progress' },
      { key: 'under-approval', label: 'Under approval', filter: (row) => row.stage === 'pending-approval' },
    ],
  },
  {
    key: 'completed',
    label: 'Completed',
    filter: (row) => row.stage === 'completed',
    subFilters: [],
  },
];

const FINAL_COLUMNS = ['id', 'parameter', 'stage', 'allocatedTo', 'enteredBy', 'result', 'deadline'].map((key) => COLUMN[key]);

// Generic row actions for the original "final" playground view.
function GenericFinalRowActions({ stage }) {
  if (stage === 'unassigned') {
    return (
      <div className="d-flex align-items-center gap-2 justify-content-end">
        <PrimaryButton size="medium" leftIcon="plus">Self-allocate</PrimaryButton>
        <SecondaryButton size="medium" tone="neutral" leftIcon="workspace">Allocate</SecondaryButton>
      </div>
    );
  }
  if (stage === 'in-progress') return ACTIONS.work();
  if (stage === 'pending-approval') return ACTIONS.approve();
  return ACTIONS.view();
}

// Variant config for the live views. Each picks its base rows (which stages
// exist), tabs + sub-filters, table columns, and row-action renderer.
const VIEW_VARIANTS = {
  final: {
    baseFilter: () => true,
    columnKeys: ['id', 'parameter', 'stage', 'allocatedTo', 'enteredBy', 'result', 'deadline'],
    Actions: GenericFinalRowActions,
    tabs: FINAL_TABS,
  },
  'analyst-final': {
    // Analyst never sees approval rows — those have no accept/reject here.
    baseFilter: (row) => row.stage !== 'pending-approval',
    columnKeys: ['id', 'parameter', 'stage', 'result', 'created'],
    Actions: AnalystRowActions,
    tabs: [
      {
        key: 'pending',
        label: 'Pending',
        filter: (row) => row.stage !== 'completed',
        // No Result in Pending — nothing has been entered yet.
        columnKeys: ['id', 'parameter', 'stage', 'created'],
        subFilters: [
          { key: 'all', label: 'All' },
          { key: 'unassigned', label: 'Unassigned', filter: (row) => row.stage === 'unassigned' },
          { key: 'assigned', label: 'Assigned', filter: (row) => row.stage === 'in-progress' },
        ],
      },
      {
        key: 'completed',
        label: 'Completed',
        filter: (row) => row.stage === 'completed',
        columnKeys: ['id', 'parameter', 'stage', 'result', 'created'],
        subFilters: [],
      },
    ],
  },
  'technical-manager': {
    baseFilter: () => true,
    columnKeys: ['id', 'parameter', 'stage', 'allocatedTo', 'result', 'created'],
    Actions: ManagerRowActions,
    tabs: [
      {
        key: 'pending',
        label: 'Pending',
        filter: (row) => row.stage !== 'completed',
        subFilters: [
          { key: 'all', label: 'All' },
          { key: 'unassigned', label: 'Pending allocation', filter: (row) => row.stage === 'unassigned' },
          { key: 'assigned', label: 'In progress', filter: (row) => row.stage === 'in-progress' },
          { key: 'under-approval', label: 'Pending approval', filter: (row) => row.stage === 'pending-approval' },
        ],
      },
      { key: 'completed', label: 'Completed', filter: (row) => row.stage === 'completed', subFilters: [] },
    ],
  },
};

// Analyst row actions. Unassigned rows show ONLY Self-allocate (no Allocate);
// clicking it shows a 400ms in-button spinner, then the row becomes claimed and
// the button turns into "Enter results".
function AnalystRowActions({ stage, id, onClaim }) {
  const [claiming, setClaiming] = useState(false);

  if (stage === 'completed') return ACTIONS.view();

  if (stage === 'in-progress') {
    return <PrimaryButton size="medium" leftIcon="edit">Enter results</PrimaryButton>;
  }

  // stage === 'unassigned'. The loading state overlays a spinner on top of the
  // (hidden) icon+label so the button keeps its exact width/height.
  return (
    <PrimaryButton
      size="medium"
      disabled={claiming}
      className="smplfy-new-tr-claim-btn position-relative"
      onClick={() => {
        setClaiming(true);
        window.setTimeout(() => {
          setClaiming(false);
          onClaim?.([id]);
        }, 400);
      }}
    >
      <span className={`d-inline-flex align-items-center gap-1${claiming ? ' invisible' : ''}`}>
        <AppIcon name="plus" />
        <span>Self-allocate</span>
      </span>
      {claiming ? (
        <span
          className="smplfy-new-tr-claim-spinner spinner-border spinner-border-sm position-absolute top-50 start-50 translate-middle"
          role="status"
          aria-hidden="true"
        />
      ) : null}
    </PrimaryButton>
  );
}

// Technical Manager row actions: allocate unallocated work, approve/reject
// results, view the rest.
function ManagerRowActions({ stage }) {
  if (stage === 'unassigned') {
    return <PrimaryButton size="medium" leftIcon="workspace">Allocate</PrimaryButton>;
  }
  if (stage === 'pending-approval') return ACTIONS.approve();
  return ACTIONS.view();
}

function FinalTrView({ variantKey = 'final', bluePills = false }) {
  const variant = VIEW_VARIANTS[variantKey] ?? VIEW_VARIANTS.final;
  const { tabs } = variant;

  const [activeTab, setActiveTab] = useState(tabs[0].key);
  const [activeSub, setActiveSub] = useState('all');
  const [sortBy, setSortBy] = useState('created-asc');
  const [colSort, setColSort] = useState(null); // clicked header overrides sortBy
  const [searchValue, setSearchValue] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  // Column filters: { [colKey]: string[] of checked values }. draft is edited
  // in the panel; applied drives the table (committed via Apply).
  const [appliedFilters, setAppliedFilters] = useState({});
  const [draftFilters, setDraftFilters] = useState({});
  const [activeFilterCol, setActiveFilterCol] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  // TRs claimed via self-allocate in this session become in-progress, so they
  // drop out of the Unassigned filter. slidingOut animates them out first.
  const [claimedIds, setClaimedIds] = useState([]);
  const [slidingIds, setSlidingIds] = useState([]);

  const activeFilterCount = Object.values(appliedFilters).filter((values) => values?.length).length;

  useEffect(() => {
    setActiveTab(tabs[0].key);
    setActiveSub('all');
    setColSort(null);
    setAppliedFilters({});
    setDraftFilters({});
    setFiltersOpen(false);
    setSelectedIds([]);
    setClaimedIds([]);
    setSlidingIds([]);
  }, [variantKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const tab = tabs.find((item) => item.key === activeTab) ?? tabs[0];
  const columns = (tab.columnKeys ?? variant.columnKeys).map((key) => COLUMN[key]);
  // Filterable columns = the table's columns for this view, minus Sample ID.
  const filterColumns = columns.filter((column) => column.key !== 'id');

  const selectTab = (key) => {
    setActiveTab(key);
    setActiveSub('all');
    setSelectedIds([]);
  };

  const toggleColSort = (key) => {
    setColSort((current) => (
      current && current.key === key
        ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' }
    ));
  };

  const rows = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    const sub = tab.subFilters.find((item) => item.key === activeSub);
    const subFilter = sub?.filter ?? (() => true);
    const matchesSearch = (row) => !query || [row.id, row.customer, row.parameter]
      .some((value) => String(value ?? '').toLowerCase().includes(query));

    const matchesFilters = (row) => Object.entries(appliedFilters).every(([colKey, values]) => (
      !values?.length || values.includes(columnFilterValue(row, colKey))
    ));

    // Apply the session's self-allocate claims: a claimed TR behaves as
    // in-progress (and thus leaves the Unassigned filter).
    const pool = TR_POOL.map((row) => (
      claimedIds.includes(row.id) ? { ...row, stage: 'in-progress' } : row
    ));

    const base = pool.filter((row) => {
      const matches = variant.baseFilter(row) && tab.filter(row) && subFilter(row)
        && matchesSearch(row) && matchesFilters(row);
      // Keep a row that's mid slide-out even if it no longer matches, so the
      // exit animation can play before it disappears.
      return matches || slidingIds.includes(row.id);
    });

    const sorted = colSort
      ? [...base].sort((first, second) => {
        const diff = parseDeadline(first[colSort.key]) - parseDeadline(second[colSort.key]);
        return colSort.direction === 'asc' ? diff : -diff;
      })
      : sortRows(base, sortBy);

    return sorted;
  }, [variant, tab, activeSub, sortBy, colSort, searchValue, appliedFilters, claimedIds, slidingIds]);

  const Actions = variant.Actions;

  // Selection (leftmost checkbox column + floating action bar).
  const visibleIds = rows.map((row) => row.id);
  const selectedVisible = selectedIds.filter((id) => visibleIds.includes(id));
  const allVisibleSelected = visibleIds.length > 0 && selectedVisible.length === visibleIds.length;
  const selectedRows = rows.filter((row) => selectedIds.includes(row.id));

  const toggleRowSelect = (id) => {
    setSelectedIds((current) => (
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]
    ));
  };

  const selectAllVisible = () => setSelectedIds(visibleIds);
  const clearSelection = () => setSelectedIds([]);

  const toggleHeaderSelect = () => {
    setSelectedIds(allVisibleSelected ? [] : visibleIds);
  };

  // Rows in the current tab/sub/search, BEFORE column filters — the universe the
  // filter panel's option counts are drawn from.
  const facetRows = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    const sub = tab.subFilters.find((item) => item.key === activeSub);
    const subFilter = sub?.filter ?? (() => true);
    const matchesSearch = (row) => !query || [row.id, row.customer, row.parameter]
      .some((value) => String(value ?? '').toLowerCase().includes(query));
    const pool = TR_POOL.map((row) => (
      claimedIds.includes(row.id) ? { ...row, stage: 'in-progress' } : row
    ));
    return pool.filter((row) => (
      variant.baseFilter(row) && tab.filter(row) && subFilter(row) && matchesSearch(row)
    ));
  }, [variant, tab, activeSub, searchValue, claimedIds]);

  // Distinct values + counts for a column, within facetRows.
  const facetFor = (colKey) => {
    const counts = new Map();
    facetRows.forEach((row) => {
      const value = columnFilterValue(row, colKey);
      counts.set(value, (counts.get(value) ?? 0) + 1);
    });
    return [...counts.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([value, count]) => ({ value, count }));
  };

  const openFilters = () => {
    setDraftFilters(appliedFilters);
    setActiveFilterCol((current) => current && filterColumns.some((c) => c.key === current)
      ? current
      : filterColumns[0]?.key ?? null);
    setFiltersOpen(true);
  };

  const toggleDraftValue = (colKey, value) => {
    setDraftFilters((current) => {
      const existing = current[colKey] ?? [];
      const next = existing.includes(value)
        ? existing.filter((entry) => entry !== value)
        : [...existing, value];
      return { ...current, [colKey]: next };
    });
  };

  const toggleDraftAll = (colKey, allValues) => {
    setDraftFilters((current) => {
      const existing = current[colKey] ?? [];
      const allChecked = existing.length === allValues.length;
      return { ...current, [colKey]: allChecked ? [] : allValues };
    });
  };

  const applyFilters = () => {
    // Drop empty arrays so activeFilterCount stays accurate.
    const cleaned = Object.fromEntries(
      Object.entries(draftFilters).filter(([, values]) => values?.length),
    );
    setAppliedFilters(cleaned);
    setFiltersOpen(false);
  };

  const clearAllFilters = () => {
    setDraftFilters({});
    setAppliedFilters({});
    setFiltersOpen(false);
  };

  // Self-allocate one or more TRs: slide them out, then mark them claimed.
  const claimRows = (ids) => {
    setSlidingIds((current) => [...new Set([...current, ...ids])]);
    setSelectedIds((current) => current.filter((id) => !ids.includes(id)));
    window.setTimeout(() => {
      setClaimedIds((current) => [...new Set([...current, ...ids])]);
      setSlidingIds((current) => current.filter((id) => !ids.includes(id)));
    }, 320);
  };

  // Context actions for the floating bar. Only offered when every selected TR
  // shares ONE action context (stage). A mixed selection (e.g. unassigned +
  // in-progress) has conflicting actions, so the action center stays empty.
  const stagesSelected = [...new Set(selectedRows.map((row) => row.stage))];
  let bulkActions = [];

  if (stagesSelected.length === 1) {
    const stage = stagesSelected[0];
    const count = selectedRows.length;

    if (variantKey === 'analyst-final') {
      if (stage === 'unassigned') {
        bulkActions = [{ key: 'self-allocate', label: `Self-allocate (${count}) TRs`, icon: 'plus', variant: 'primary' }];
      } else if (stage === 'in-progress') {
        bulkActions = [{ key: 'enter-results', label: `Enter results (${count}) TRs`, icon: 'edit', variant: 'primary' }];
      }
    } else if (variantKey === 'technical-manager') {
      if (stage === 'unassigned') {
        bulkActions = [{ key: 'allocate', label: `Allocate (${count}) TRs`, icon: 'workspace', variant: 'primary' }];
      } else if (stage === 'pending-approval') {
        // Approve + Reject are the same context (approval), so both show.
        bulkActions = [
          { key: 'approve', label: `Approve (${count}) TRs`, icon: 'check', variant: 'positive' },
          { key: 'reject', label: `Reject (${count}) TRs`, icon: 'close', variant: 'neutral' },
        ];
      }
    }
  }

  return (
    <div className={`d-flex flex-column gap-3${bluePills ? ' smplfy-new-tr-blue-pills' : ''}`}>
      {/* Primary tabs + (joined by a divider) the dependent sub-filter tabs */}
      <div className="d-flex align-items-center flex-wrap gap-3">
        <div className="smplfy-new-tr-tabs nav nav-pills d-inline-flex align-items-center flex-wrap gap-1 p-1 bg-white border rounded">
          {tabs.map((item) => (
            <NavSelector
              key={item.key}
              size="medium"
              active={activeTab === item.key}
              count={TR_POOL.filter((row) => variant.baseFilter(row) && item.filter(row)).length}
              className={item.key === 'pending' ? 'smplfy-new-tr-tab-pending' : undefined}
              onClick={() => selectTab(item.key)}
            >
              {item.label}
            </NavSelector>
          ))}
        </div>

        {tab.subFilters.length ? (
          <>
            <span className="smplfy-new-tr-tabs-divider" aria-hidden="true" />
            <div className="smplfy-new-tr-tabs nav nav-pills d-inline-flex align-items-center flex-wrap gap-1 p-1 bg-white border rounded">
              {tab.subFilters.map((sub) => {
                const subFilter = sub.filter ?? (() => true);
                const subCount = TR_POOL.filter((row) => (
                  variant.baseFilter(row) && tab.filter(row) && subFilter(row)
                )).length;
                return (
                  <NavSelector
                    key={sub.key}
                    size="medium"
                    active={activeSub === sub.key}
                    onClick={() => setActiveSub(sub.key)}
                  >
                    {`${sub.label} (${subCount})`}
                  </NavSelector>
                );
              })}
            </div>
          </>
        ) : null}
      </div>

      {/* Search (narrow) + sort in the same row */}
      <div className="d-flex align-items-center flex-wrap gap-3">
        <div className="input-group flex-nowrap smplfy-new-tr-final-search">
          <span className="input-group-text text-secondary">
            <AppIcon name="search" />
          </span>
          <input
            className="smplfy-form-control form-control"
            type="text"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search by sample ID, customer, or parameter"
            aria-label="Search test requests"
          />
        </div>

        <div className="smplfy-new-tr-filter position-relative">
          <SecondaryButton
            size="medium"
            tone="neutral"
            leftIcon="filter"
            className={`smplfy-new-tr-filter-btn${activeFilterCount ? ' is-active' : ''}`}
            aria-expanded={filtersOpen}
            onClick={() => (filtersOpen ? setFiltersOpen(false) : openFilters())}
          >
            {`Filters${activeFilterCount ? ` (${activeFilterCount})` : ''}`}
          </SecondaryButton>
          {filtersOpen ? (
            <>
              <div className="smplfy-new-tr-filter-backdrop" onClick={() => setFiltersOpen(false)} aria-hidden="true" />
              <div className="smplfy-new-tr-filter-panel card shadow" role="dialog" aria-label="Filters">
                <div className="smplfy-new-tr-filter-head d-flex align-items-center">
                  <span className="fw-semibold text-dark">Filters</span>
                </div>

                <div className="smplfy-new-tr-filter-body d-flex">
                  {/* Left: filterable columns of this view */}
                  <div className="smplfy-new-tr-filter-cols d-flex flex-column">
                    {filterColumns.map((column) => {
                      const count = draftFilters[column.key]?.length ?? 0;
                      return (
                        <button
                          key={column.key}
                          type="button"
                          className={`smplfy-new-tr-filter-col${activeFilterCol === column.key ? ' is-active' : ''}`}
                          onClick={() => setActiveFilterCol(column.key)}
                        >
                          <span>{column.label}</span>
                          {count ? <span className="smplfy-new-tr-filter-col-badge">{count}</span> : null}
                        </button>
                      );
                    })}
                  </div>

                  {/* Right: values for the selected column */}
                  <div className="smplfy-new-tr-filter-values d-flex flex-column">
                    {activeFilterCol ? (() => {
                      const facet = facetFor(activeFilterCol);
                      const allValues = facet.map((item) => item.value);
                      const checked = draftFilters[activeFilterCol] ?? [];
                      const allChecked = allValues.length > 0 && checked.length === allValues.length;
                      return (
                        <>
                          <label className="smplfy-new-tr-filter-opt d-flex align-items-center gap-2">
                            <Checkbox checked={allChecked} aria-label="All" onChange={() => toggleDraftAll(activeFilterCol, allValues)} />
                            <span className="flex-grow-1">All</span>
                            <span className="text-secondary">{facetRows.length}</span>
                          </label>
                          {facet.map((item) => (
                            <label key={item.value} className="smplfy-new-tr-filter-opt d-flex align-items-center gap-2">
                              <Checkbox
                                checked={checked.includes(item.value)}
                                aria-label={item.value}
                                onChange={() => toggleDraftValue(activeFilterCol, item.value)}
                              />
                              <span className="flex-grow-1">{item.value}</span>
                              <span className="text-secondary">{item.count}</span>
                            </label>
                          ))}
                        </>
                      );
                    })() : null}
                  </div>
                </div>

                <div className="smplfy-new-tr-filter-footer d-flex align-items-center justify-content-between">
                  <button
                    type="button"
                    className="btn btn-link p-0 text-secondary text-decoration-none smplfy-new-tr-filter-clear"
                    disabled={!Object.values(draftFilters).some((v) => v?.length)}
                    onClick={clearAllFilters}
                  >
                    Clear all filters
                  </button>
                  <PrimaryButton size="medium" onClick={applyFilters}>Apply</PrimaryButton>
                </div>
              </div>
            </>
          ) : null}
        </div>

        <div className="smplfy-new-tr-sort d-flex align-items-center gap-2 ms-auto">
          <span className="text-secondary flex-shrink-0 small">Sort by</span>
          <FormElement
            type="dropdown"
            className="mb-0"
            inputProps={{
              state: 'filled',
              value: sortBy,
              options: SORT_OPTIONS,
              onChange: (event) => {
                setColSort(null);
                setSortBy(event.target.value);
              },
            }}
          />
        </div>
      </div>

      <DataTable className="smplfy-new-tr-table smplfy-new-tr-final-table">
        <thead>
          <tr>
            <th scope="col" className="smplfy-new-tr-select-cell">
              <Checkbox
                checked={allVisibleSelected}
                aria-label="Select all rows"
                onChange={toggleHeaderSelect}
              />
            </th>
            {columns.map((column) => {
              if (!column.sortable) {
                return <th scope="col" key={column.key}>{column.label}</th>;
              }
              const isActive = colSort?.key === column.key;
              const direction = isActive ? colSort.direction : null;
              return (
                <th
                  scope="col"
                  key={column.key}
                  aria-sort={isActive ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  <button type="button" className="smplfy-new-tr-colsort-btn" onClick={() => toggleColSort(column.key)}>
                    <span>{column.label}</span>
                    <AppIcon
                      name={isActive && direction === 'asc' ? 'chevron-up' : 'chevron-down'}
                      size={14}
                      stroke={2}
                      className={isActive ? '' : 'smplfy-new-tr-colsort-idle'}
                    />
                  </button>
                </th>
              );
            })}
            <th scope="col" className="smplfy-new-tr-action-head" aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row) => (
              <tr
                key={row.id}
                className={`smplfy-new-tr-final-row${slidingIds.includes(row.id) ? ' is-sliding-out' : ''}`}
              >
                <td className="smplfy-new-tr-select-cell">
                  <Checkbox
                    checked={selectedIds.includes(row.id)}
                    aria-label={`Select ${row.id}`}
                    onChange={() => toggleRowSelect(row.id)}
                  />
                </td>
                {columns.map((column) => (
                  <td key={column.key} className={column.key === 'created' || column.key === 'deadline' ? 'text-nowrap' : undefined}>
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
                <td className="smplfy-new-tr-action-cell text-end">
                  <Actions stage={row.stage} id={row.id} onClaim={claimRows} />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + 2} className="text-center text-secondary py-4">
                No test requests match this view.
              </td>
            </tr>
          )}
        </tbody>
      </DataTable>

      {selectedIds.length ? (
        <div className="smplfy-new-tr-actionbar" role="region" aria-label="Bulk actions">
          <div className="smplfy-new-tr-actionbar-inner d-flex align-items-center gap-3 flex-wrap">
            <span className="smplfy-new-tr-actionbar-count fw-semibold text-dark">
              {selectedIds.length} selected
            </span>

            <div className="d-flex align-items-center gap-2">
              <SecondaryButton
                size="medium"
                tone="neutral"
                disabled={allVisibleSelected}
                onClick={selectAllVisible}
              >
                Select all
              </SecondaryButton>
              <SecondaryButton size="medium" tone="neutral" onClick={clearSelection}>
                Unselect
              </SecondaryButton>
            </div>

            <div className="smplfy-new-tr-actionbar-sep" aria-hidden="true" />

            <div className="d-flex align-items-center gap-2 flex-wrap ms-auto">
              {bulkActions.length ? (
                bulkActions.map((bulk) => {
                  const Button = bulk.variant === 'neutral' ? SecondaryButton : PrimaryButton;
                  const extra = bulk.variant === 'neutral' ? { tone: 'neutral' } : { styleVariant: bulk.variant };
                  const handleClick = bulk.key === 'self-allocate'
                    ? () => claimRows(selectedRows.map((row) => row.id))
                    : clearSelection;
                  return (
                    <Button
                      key={bulk.key}
                      size="medium"
                      leftIcon={bulk.icon}
                      onClick={handleClick}
                      {...extra}
                    >
                      {bulk.label}
                    </Button>
                  );
                })
              ) : (
                <span className="text-secondary small">No bulk action for this selection.</span>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// --- Shared table (archetype tabs) ----------------------------------------
function TrTable({ columns, rows, action, emptyText }) {
  const renderAction = ACTIONS[action] ?? ACTIONS.view;

  return (
    <DataTable className="smplfy-new-tr-table">
      <thead>
        <tr>
          {columns.map((column) => (
            <th scope="col" key={column.key}>{column.label}</th>
          ))}
          <th scope="col" className="smplfy-new-tr-action-head" aria-label="Actions" />
        </tr>
      </thead>
      <tbody>
        {rows.length ? (
          rows.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => (
                <td key={column.key} className={column.key === 'deadline' ? 'text-nowrap' : undefined}>
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
              <td className="smplfy-new-tr-action-cell text-end">{renderAction()}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={columns.length + 1} className="text-center text-secondary py-4">
              {emptyText}
            </td>
          </tr>
        )}
      </tbody>
    </DataTable>
  );
}

export default function NewTrPage({
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  sidebarBadgeCounts,
}) {
  const [archetypeValue, setArchetypeValue] = useState(ARCHETYPES[0].value);
  const [helpOpen, setHelpOpen] = useState(false);

  const archetype = useMemo(
    () => ARCHETYPES.find((item) => item.value === archetypeValue) ?? ARCHETYPES[0],
    [archetypeValue],
  );

  return (
    <AppChrome
      activeNav="design-handoff"
      onNavigate={onNavigate}
      breadcrumbs={[
        { key: 'design-handoff', label: 'Design Handoff' },
        { key: 'new-tr-page', label: 'New TR Page', current: true },
      ]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      sidebarBadgeCounts={sidebarBadgeCounts}
      pageHeader={(
        <section className="bg-white border-bottom px-4 py-3">
          <div className="container-fluid px-0">
            <div className="row align-items-center justify-content-between gx-0 gy-3">
              <div className="col-auto d-flex align-items-center gap-3">
                <SecondaryButton
                  size="medium"
                  leftIcon="chevron-left"
                  className="px-0 flex-shrink-0"
                  aria-label="Back to Design Handoff"
                  onClick={() => onNavigate?.('design-handoff')}
                />
                <div>
                  <h1 className="h5 mb-0 fw-semibold text-dark">New TR Page</h1>
                  <p className="smplfy-new-tr-subtitle text-secondary mb-0">
                    Design playground — tabbed TR views per user archetype.
                  </p>
                </div>
              </div>
              <div className="col-12 col-md-auto">
                <div className="smplfy-new-tr-archetype-picker d-flex align-items-end gap-2">
                  <FormElement
                    type="dropdown"
                    label="Viewing as"
                    className="mb-0 flex-grow-1"
                    inputProps={{
                      state: 'filled',
                      value: archetypeValue,
                      options: ARCHETYPES.map((item) => ({ value: item.value, label: item.label })),
                      onChange: (event) => setArchetypeValue(event.target.value),
                    }}
                  />
                  <div className="smplfy-new-tr-help position-relative flex-shrink-0">
                    <SecondaryButton
                      size="medium"
                      tone="neutral"
                      className="smplfy-new-tr-help-btn"
                      aria-label="About this archetype"
                      aria-expanded={helpOpen}
                      onClick={() => setHelpOpen((current) => !current)}
                    >
                      <AppIcon name="help" size={18} />
                    </SecondaryButton>
                    {helpOpen ? (
                      <>
                        <div
                          className="smplfy-new-tr-help-backdrop"
                          onClick={() => setHelpOpen(false)}
                          aria-hidden="true"
                        />
                        <div className="smplfy-new-tr-help-popover card shadow" role="dialog" aria-label="Archetype details">
                          <div className="smplfy-new-tr-help-popover-title fw-semibold text-dark">{archetype.label}</div>
                          <p className="smplfy-new-tr-help-popover-summary text-secondary mb-0">{archetype.summary}</p>
                          {archetype.tabs.length ? (
                            <div className="smplfy-new-tr-help-popover-queues">
                              <span className="text-secondary">Tabs shown:</span>
                              <ul className="mb-0">
                                {archetype.tabs.map((tabKey) => (
                                  <li key={tabKey}>{TAB[tabKey].label}</li>
                                ))}
                              </ul>
                            </div>
                          ) : null}
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    >
      <main className="smplfy-new-tr-page bg-body-tertiary p-4 min-vh-100">
        <div className="container-fluid px-0 d-flex flex-column gap-4">
          {VIEW_VARIANTS[archetype.mode] ? (
            <FinalTrView
              key={archetype.mode}
              variantKey={archetype.mode}
              bluePills={Boolean(archetype.bluePills)}
            />
          ) : (
            <TabbedTrView key={archetype.value} archetype={archetype} />
          )}
        </div>
      </main>
    </AppChrome>
  );
}
