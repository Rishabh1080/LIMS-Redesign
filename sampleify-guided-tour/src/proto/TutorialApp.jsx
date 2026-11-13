/*
 * The LIMS inside the tutorial: the prototype's own pages, wired together the
 * way the prototype's App.jsx wires them, plus the state the tutorial needs to
 * carry an inward from creation to its COA. The prototype's "sample" is the
 * tutorial's inward: the sample card listing is All inwards, and the sample
 * details page (copied as ./InwardDetailsPage) is Inward Details.
 *
 * Every milestone is reported through `onEvent`, which the guided tour uses to
 * know a task step is done.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DashboardPage from '@proto/pages/DashboardPage';
import AllInwardsListingPage from './AllInwardsListingPage';
import NewInwardPage from '@proto/pages/NewInwardPage';
import TestRequestsListingPage from './TestRequestsListingPage';
import TrDetailsPage from './TrDetailsPage';
import DatasheetPage from './DatasheetPage';
import CoaReportSelectionPage from '@proto/pages/CoaReportSelectionPage';
import FinalisedReportPage from './FinalisedReportPage';
import { getInwardById } from '@proto/data/inwardsDb';
import InwardDetailsPage from './InwardDetailsPage';
import { TutorialChromeContext } from './TutorialChrome';

export { INITIAL_PROTO_STATE } from './state';

const pad2 = (value) => String(value).padStart(2, '0');
function stamp(date = new Date()) {
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}, ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}
function activityStamp(date = new Date()) {
  const hours = date.getHours();
  const time = `${pad2(((hours + 11) % 12) + 1)}:${pad2(date.getMinutes())} ${hours < 12 ? 'AM' : 'PM'}`;
  return { time, date: `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${String(date.getFullYear()).slice(2)}` };
}
function longStamp(date = new Date()) {
  return `${date.getDate()} ${date.toLocaleString('en-IN', { month: 'long' })} ${date.getFullYear()}, ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}


const logEntry = (label, tone, person) => ({ label, tone, person, ...activityStamp() });

/** The visitor's inward in the shape the All inwards listing reads. */
function listingEntry(inward) {
  const card = inward.card;
  const details = inward.details ?? {};
  return {
    id: inward.id,
    status: inward.status,
    representativeName: card.representative,
    customerReference: card.reference,
    receivedMode: card.requestMode,
    createdOn: card.createdOn,
    dueDate: card.reportingDate.split(',')[0].replaceAll('/', '-'),
    receivedDate: card.createdOn.split(',')[0],
    customerName: details.customerName ?? '',
    categories: [...new Set((details.products ?? []).map((product) => product.category))],
    products: [
      {
        name: details.products?.[0]?.name ?? 'Sample',
        sampleId: inward.id,
        parameters: card.parameters.map((status, index) => ({ parameter: `Parameter ${index + 1}`, status })),
      },
    ],
  };
}

function cardFor(id, status, parameterCount, userName) {
  const tone = { Pending: 'pending', 'Under Allocation': 'warning', 'Under Analysis': 'warning', Completed: 'success' }[status] ?? 'pending';
  const parameterStatus = status === 'Completed' ? 'Approved' : status === 'Pending' ? 'Not allocated' : 'Under Testing';
  const now = new Date();
  return {
    id,
    tutorial: true,
    status,
    statusTone: tone,
    representative: userName,
    reference: 'Walk-in',
    requestMode: 'In person',
    createdOn: stamp(now),
    reportingDate: stamp(new Date(now.getTime() + 3 * 86400000)),
    parameters: Array.from({ length: Math.max(1, parameterCount) }, () => parameterStatus),
    category: 'all-samples',
    delayed: false,
  };
}

export function TutorialApp({ state, setState, onEvent, labName, userName, supportPhone, onRestartTour, onStartOver, inert = false }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const rootRef = useRef(null);
  const emit = useCallback((type, payload = {}) => onEvent?.(type, payload), [onEvent]);
  const chrome = useMemo(
    () => ({ labName, userName, supportPhone, onRestartTour, onStartOver }),
    [labName, userName, supportPhone, onRestartTour, onStartOver],
  );

  useEffect(() => {
    if (rootRef.current) rootRef.current.inert = inert;
  }, [inert]);

  const listing = useMemo(() => state.inwards.map(listingEntry), [state.inwards]);

  useEffect(() => {
    emit('page', { page: state.page });
  }, [state.page, emit]);

  // Allocation and test request approval happen inside prototype pages' own
  // state; pick them up here so the activity trail and the tour stay in step.
  const currentId = state.currentInwardId;
  useEffect(() => {
    if (state.page !== 'test-requests') return undefined;
    const countAllocate = () =>
      [...(rootRef.current?.querySelectorAll('.smplfy-tr-listing-page table button') ?? [])].filter((button) => button.textContent.trim() === 'Allocate').length;
    let initial = null;
    const id = window.setInterval(() => {
      const count = countAllocate();
      if (initial === null) {
        initial = count;
        return;
      }
      if (count < initial) {
        initial = count;
        setState((s) => ({
          ...s,
          inwards: s.inwards.map((inward) =>
            inward.id === currentId
              ? { ...inward, trs: { ...inward.trs, allocated: true }, activity: [{ label: 'Test Request Allocated', tone: 'warning', person: userName, ...activityStamp() }, ...inward.activity] }
              : inward,
          ),
        }));
        emit('tr-allocated');
      }
    }, 300);
    return () => window.clearInterval(id);
  }, [state.page, currentId, setState, emit, userName]);

  useEffect(() => {
    const onReviewed = (event) => {
      const approvedResult = !event.detail || event.detail.action !== 'reject';
      setState((s) => ({
        ...s,
        inwards: s.inwards.map((inward) =>
          inward.id === currentId
            ? { ...inward, trs: { ...inward.trs, approved: approvedResult }, activity: [{ label: approvedResult ? 'Test Request Approved' : 'Test Request Rejected', tone: approvedResult ? 'success' : 'neutral', person: userName, ...activityStamp() }, ...inward.activity] }
            : inward,
        ),
      }));
      if (approvedResult) setState((s) => ({ ...s, tr: { ...s.tr, log: [logEntry('Test Request Approved', 'success', userName), ...(s.tr.log ?? [])] } }));
      emit(approvedResult ? 'tr-approved' : 'tr-rejected');
    };
    window.addEventListener('sgt:tr-reviewed', onReviewed);
    return () => window.removeEventListener('sgt:tr-reviewed', onReviewed);
  }, [currentId, setState, emit, userName]);

  const go = (page, patch = {}) => setState((current) => ({ ...current, ...patch, page }));
  const current = state.inwards.find((inward) => inward.id === state.currentInwardId) ?? null;

  const updateInward = (id, update) =>
    setState((s) => ({ ...s, inwards: s.inwards.map((inward) => (inward.id === id ? update(inward) : inward)) }));
  const addActivity = (inward, label, tone, person = userName) => ({
    ...inward,
    activity: [{ label, tone, person, ...activityStamp() }, ...inward.activity],
  });
  const setStatus = (inward, status) => ({
    ...inward,
    status,
    card: { ...inward.card, ...cardFor(inward.id, status, inward.card.parameters.length, userName), createdOn: inward.card.createdOn, reportingDate: inward.card.reportingDate },
  });

  const handleNavigate = (nextPage) => {
    if (nextPage === 'dashboard') return go('dashboard');
    if (nextPage === 'all-samples') return go('all-samples');
    return undefined;
  };

  const openNewInward = () => {
    // The tutorial always uses the "Default" New Inward (Sample info / Testing Details tabs).
    try {
      window.localStorage.setItem('lims.newInward.pageVersion', 'default');
    } catch {
      // ignore
    }
    go('new-inward');
  };

  const handleInwardCreated = (payload) => {
    const products = payload?.products ?? [];
    const parameterCount = products.reduce((sum, product) => sum + (product.parameters ?? []).filter((row) => String(row?.parameter ?? '').trim()).length, 0) || 3;
    const number = 149 + state.inwards.length;
    const id = `INW/2026/${String(number).padStart(4, '0')}`;
    const base = getInwardById('INW/2026/0147');
    const inward = {
      id,
      status: 'Pending',
      card: cardFor(id, 'Pending', parameterCount, userName),
      details: base ? { ...base, id, receivedBy: userName } : null,
      reviewRequest: null,
      approved: false,
      activity: [{ label: 'Inward Created', tone: 'info', person: userName, ...activityStamp() }],
      trs: { allocated: false, resultsAdded: false, submitted: false, approved: false },
      coa: false,
    };
    setState((s) => ({ ...s, inwards: [inward, ...s.inwards], currentInwardId: id, page: 'all-samples', listingToast: '1 inward created' }));
    emit('inward-created', { id });
  };

  const openInward = (sampleId) => {
    const own = state.inwards.find((inward) => inward.id === sampleId);
    go('inward-details', { currentInwardId: own ? own.id : state.currentInwardId, externalSampleId: own ? null : sampleId });
    emit('inward-opened', { id: sampleId });
  };

  let page = null;
  const common = {
    onNavigate: handleNavigate,
    sidebarCollapsed,
    onSidebarCollapsedChange: setSidebarCollapsed,
  };

  if (state.page === 'dashboard') {
    page = <DashboardPage {...common} onNewInward={openNewInward} />;
  } else if (state.page === 'all-samples') {
    page = (
      <AllInwardsListingPage
        {...common}
        extraInwards={listing}
        onOpenInward={(entry) => openInward(entry.id)}
        onNewInward={openNewInward}
        initialToast={state.listingToast}
        onInitialToastConsumed={() => setState((s) => ({ ...s, listingToast: null }))}
      />
    );
  } else if (state.page === 'new-inward') {
    page = (
      <TutorialChromeShell>
        <NewInwardPage parentLabel="Dashboard" onBack={() => go('dashboard')} onComplete={handleInwardCreated} />
      </TutorialChromeShell>
    );
  } else if (state.page === 'inward-details') {
    const inward = state.externalSampleId ? null : current;
    const sampleId = inward?.id ?? state.externalSampleId ?? 'IICT/2025-2026/1101';
    page = (
      <InwardDetailsPage
        {...common}
        key={sampleId}
        sampleId={sampleId}
        sourcePage="all-samples"
        sampleStatus={inward?.status ?? 'Pending'}
        createdOn={inward?.card.createdOn}
        reportingDate={inward?.card.reportingDate}
        sample={inward?.card ?? null}
        inward={inward?.details ?? null}
        reviewRequest={inward?.reviewRequest ?? null}
        approved={inward?.approved ?? false}
        activity={inward?.activity}
        onBack={() => go('all-samples')}
        onGoToInward={() => {}}
        onEditSample={() => {}}
        onSendForReview={({ nextState, comments }) => {
          if (!inward) return;
          updateInward(inward.id, (item) =>
            addActivity(
              { ...item, reviewRequest: { requestedBy: userName, requestedOn: longStamp(), comments, nextState, due: '(1 day)' } },
              `Sent for Review · ${nextState}`,
              'warning',
            ),
          );
          emit('review-sent', { id: inward.id, nextState });
        }}
        onApprove={(result) => {
          if (!inward) return;
          if (result?.action === 'reject') {
            updateInward(inward.id, (item) => addActivity({ ...item, reviewRequest: null }, 'Review Rejected', 'neutral'));
            emit('review-rejected', { id: inward.id });
            return;
          }
          updateInward(inward.id, (item) => addActivity(setStatus({ ...item, approved: true }, item.reviewRequest?.nextState ?? 'Under Allocation'), 'Inward Approved', 'success'));
          emit('inward-approved', { id: inward.id });
        }}
        onOpenTestRequests={() => go('test-requests')}
        onOpenCoaReport={() => go('coa-report-selection')}
        onOpenProformaInvoice={() => {}}
      />
    );
  } else if (state.page === 'test-requests') {
    page = (
      <TestRequestsListingPage
        {...common}
        sampleId={current?.id ?? 'IICT/2025-2026/1101'}
        sourcePage="all-samples"
        viewMode="standard"
        onBack={() => go('inward-details')}
        onOpenTrDetails={(requestId, requestStatus, row) =>
          setState((s) => {
            const same = s.tr.requestId === requestId;
            const log = same && s.tr.log ? s.tr.log : [logEntry('Test Request Created', 'info', userName)];
            return {
              ...s,
              page: 'tr-details',
              tr: {
                ...s.tr,
                requestId,
                row: row ?? s.tr.row ?? null,
                requestStatus: same ? s.tr.requestStatus : requestStatus,
                workflowStage: same ? s.tr.workflowStage : 'default',
                results: same ? s.tr.results ?? null : null,
                log,
              },
            };
          })
        }
      />
    );
  } else if (state.page === 'tr-details') {
    page = (
      <TrDetailsPage
        {...common}
        sampleId={current?.id ?? 'IICT/2025-2026/1101'}
        sourcePage="all-samples"
        requestId={state.tr.requestId}
        requestStatus={current?.trs.approved ? 'Approved' : state.tr.workflowStage === 'submitted' ? 'Result Under Approval' : 'Result Under Testing'}
        workflowStage={state.tr.workflowStage}
        row={state.tr.row ?? null}
        results={state.tr.results ?? null}
        log={state.tr.log ?? null}
        initialToast={state.tr.initialToast}
        onBack={() => go('test-requests')}
        onOpenDatasheet={() => go('datasheet')}
        onInitialToastConsumed={() => setState((s) => ({ ...s, tr: { ...s.tr, initialToast: null } }))}
        onSubmitForReview={() => {
          setState((s) => ({ ...s, tr: { ...s.tr, workflowStage: 'submitted', initialToast: 'tr-submitted', log: [logEntry('Sent for Review', 'warning', userName), ...(s.tr.log ?? [])] } }));
          if (current) updateInward(current.id, (item) => addActivity({ ...item, trs: { ...item.trs, submitted: true } }, 'Results Sent for Approval', 'warning'));
          emit('tr-submitted');
        }}
      />
    );
  } else if (state.page === 'datasheet') {
    page = (
      <DatasheetPage
        {...common}
        sampleId={current?.id ?? 'IICT/2025-2026/1101'}
        sourcePage="all-samples"
        requestId={state.tr.requestId}
        row={state.tr.row ?? null}
        values={state.tr.results ?? null}
        onBack={() => go('tr-details')}
        onDone={(values) => {
          setState((s) => ({
            ...s,
            page: 'tr-details',
            tr: {
              ...s.tr,
              results: values,
              workflowStage: s.tr.workflowStage === 'submitted' ? 'submitted' : 'in-progress',
              initialToast: 'datasheet-updated',
              log: [logEntry('Results Added', 'info', userName), ...(s.tr.log ?? [])],
            },
          }));
          if (current) updateInward(current.id, (item) => addActivity({ ...item, trs: { ...item.trs, resultsAdded: true } }, 'Results Added', 'info'));
          emit('results-saved');
        }}
      />
    );
  } else if (state.page === 'coa-report-selection') {
    const finish = () => {
      if (current) updateInward(current.id, (item) => addActivity(setStatus({ ...item, coa: true }, 'Completed'), 'COA Report Generated', 'success'));
      go('finalised-report');
      emit('coa-generated');
    };
    page = (
      <CoaReportSelectionPage
        {...common}
        sampleId={current?.id ?? 'IICT/2025-2026/1101'}
        sourcePage="all-samples"
        onBack={() => go('inward-details')}
        onGenerate={finish}
        onFinalize={finish}
      />
    );
  } else if (state.page === 'finalised-report') {
    page = (
      <FinalisedReportPage {...common} sampleId={current?.id ?? 'IICT/2025-2026/1101'} inward={current} row={state.tr.row ?? null} results={state.tr.results ?? null} onBack={() => go('inward-details')} />
    );
  }

  return (
    <TutorialChromeContext.Provider value={chrome}>
      <div ref={rootRef} className="sgt-proto" data-proto-page={state.page} aria-hidden={inert || undefined}>
        {page}
      </div>
    </TutorialChromeContext.Provider>
  );
}

/** NewInwardPage renders without AppChrome in the prototype too; nothing to add. */
function TutorialChromeShell({ children }) {
  return children;
}
