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
import AllSamplesListingPage from '@proto/pages/AllSamplesListingPage';
import NewInwardPage from '@proto/pages/NewInwardPage';
import TestRequestsListingPage from '@proto/pages/TestRequestsListingPage';
import TrDetailsPage from '@proto/pages/TrDetailsPage';
import DatasheetPage from '@proto/pages/DatasheetPage';
import CoaReportSelectionPage from '@proto/pages/CoaReportSelectionPage';
import FinalisedReportPage from '@proto/pages/FinalisedReportPage';
import { allSamplesDb } from '@proto/data/samplesDb';
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


/** Puts the visitor's inwards at the top of the prototype's card listing. */
function syncListing(inwards) {
  const ids = new Set(inwards.map((inward) => inward.card.id));
  for (let index = allSamplesDb.length - 1; index >= 0; index -= 1) {
    if (allSamplesDb[index].tutorial && !ids.has(allSamplesDb[index].id)) allSamplesDb.splice(index, 1);
  }
  [...inwards].reverse().forEach((inward) => {
    const existing = allSamplesDb.findIndex((sample) => sample.id === inward.card.id);
    if (existing >= 0) allSamplesDb.splice(existing, 1);
    allSamplesDb.unshift(inward.card);
  });
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

  // The visitor's inwards live in tutorial state; the prototype listing reads allSamplesDb.
  syncListing(state.inwards);

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
    const number = 1150 + state.inwards.length;
    const id = `IICT/2025-2026/${number}`;
    const base = getInwardById('INW/2026/0147');
    const inward = {
      id,
      status: 'Pending',
      card: cardFor(id, 'Pending', parameterCount, userName),
      details: base ? { ...base, id: `INW/2026/${String(number - 1000).padStart(4, '0')}`, receivedBy: userName } : null,
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
      <AllSamplesListingPage
        {...common}
        onOpenSample={openInward}
        onEditSample={() => {}}
        onNewSample={openNewInward}
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
        onOpenTrDetails={(requestId, requestStatus) =>
          setState((s) => ({
            ...s,
            page: 'tr-details',
            tr: { ...s.tr, requestId, requestStatus: s.tr.requestId === requestId ? s.tr.requestStatus : requestStatus, workflowStage: s.tr.requestId === requestId ? s.tr.workflowStage : 'default' },
          }))
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
        requestStatus={state.tr.workflowStage === 'default' ? state.tr.requestStatus : null}
        workflowStage={state.tr.workflowStage}
        initialToast={state.tr.initialToast}
        onBack={() => go('test-requests')}
        onOpenDatasheet={() => go('datasheet')}
        onInitialToastConsumed={() => setState((s) => ({ ...s, tr: { ...s.tr, initialToast: null } }))}
        onSubmitForReview={() => {
          setState((s) => ({ ...s, tr: { ...s.tr, workflowStage: 'submitted', initialToast: 'tr-submitted' } }));
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
        onBack={() => go('tr-details')}
        onSave={() => {
          setState((s) => ({
            ...s,
            page: 'tr-details',
            tr: { ...s.tr, workflowStage: s.tr.workflowStage === 'submitted' ? 'submitted' : 'in-progress', initialToast: 'datasheet-updated' },
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
      <FinalisedReportPage {...common} sampleId={current?.id ?? 'IICT/2025-2026/1101'} sourcePage="all-samples" onBack={() => go('inward-details')} />
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
