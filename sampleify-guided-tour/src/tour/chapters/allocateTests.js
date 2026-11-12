// Chapter 3: allocating test requests, one at a time and in bulk.

import { getPendingTrIds } from '../../store/selectors';
import {
  goToPage,
  openBulkAllocation,
  openFirstAllocation,
  pickAnalyst,
  pickReviewer,
  selectAllPending,
  submitAllocation,
} from '../assists';

const pendingCount = (state) => getPendingTrIds(state.data).length;

export default {
  id: 'allocate-tests',
  title: 'Assign the tests',
  summary: 'Assign work with competence, leave and workload checks built in.',
  duration: '2 min',
  outcome: 'You assigned work to the right people, with authorisation, leave and workload checked for you.',
  steps: [
    {
      id: 'open-trs',
      kind: 'action',
      target: 'nav-test-requests',
      placement: 'right',
      title: 'Open Test Requests',
      body: 'This is where work gets handed out. Click Test Requests in the sidebar.',
      hint: 'Click Test Requests',
      doneText: 'You’re in Test Requests.',
      done: (state) => state.nav.page === 'test-requests',
      assist: { label: 'Take me there', run: (api) => goToPage(api, 'nav-test-requests', 'test-requests', { tab: 'pending' }) },
    },
    {
      id: 'tabs',
      kind: 'info',
      page: 'test-requests',
      target: 'tr-tabs',
      placement: 'bottom',
      onEnter: (api) => {
        if (api.getState().ui.trTab !== 'pending') api.dispatch({ type: 'ui/patch', payload: { trTab: 'pending', trSelection: [] } });
      },
      title: 'Work, sorted by stage',
      body: (state) =>
        state.data.userInwardIds.length
          ? 'Pending, under testing, awaiting approval. Your new inward’s tests are tagged New and sit at the top.'
          : 'Pending, under testing, awaiting approval. The red counts tell you where to look first.',
    },
    {
      id: 'allocate-one',
      kind: 'action',
      page: 'test-requests',
      target: 'tr-allocate-first',
      placement: 'left',
      skipIf: (state) => pendingCount(state) === 0,
      title: 'Allocate one',
      body: 'Click Allocate on the first test request.',
      hint: 'Click Allocate',
      advanceDelay: 250,
      doneText: 'Allocation window open.',
      done: (state) => Boolean(state.ui.allocation),
      assist: { label: 'Do it for me', run: openFirstAllocation },
    },
    {
      id: 'pick-analyst',
      kind: 'action',
      page: 'test-requests',
      target: 'alloc-analysts',
      placement: 'bottom',
      requires: (state) => Boolean(state.ui.allocation),
      backTo: 'allocate-one',
      skipIf: (state) => pendingCount(state) === 0 && !state.ui.allocation,
      title: 'Pick the right analyst',
      body: 'You see each analyst’s open workload, whether they are authorised for this test, and who is on leave. Analysts who are not authorised or are away cannot be picked.',
      why: 'Competence and impartiality are NABL requirements. Here they are enforced, not remembered.',
      hint: 'Choose an analyst',
      doneText: 'Analyst picked.',
      done: (state) => Boolean(state.ui.allocation?.analystId),
      advanceDelay: 600,
      assist: { label: 'Pick for me', run: pickAnalyst },
    },
    {
      id: 'pick-reviewer',
      kind: 'action',
      page: 'test-requests',
      target: 'alloc-reviewer',
      placement: 'left',
      requires: (state) => Boolean(state.ui.allocation),
      backTo: 'allocate-one',
      skipIf: (state) => pendingCount(state) === 0 && !state.ui.allocation,
      title: 'Add a reviewer',
      body: 'Choose who checks the result before it is released. It cannot be the same person who runs the test.',
      hint: 'Choose a reviewer',
      doneText: 'Reviewer added.',
      done: (state) => Boolean(state.ui.allocation?.reviewerId),
      advanceDelay: 600,
      assist: { label: 'Pick for me', run: pickReviewer },
    },
    {
      id: 'confirm-one',
      kind: 'action',
      page: 'test-requests',
      target: 'alloc-submit',
      placement: 'top',
      requires: (state) => Boolean(state.ui.allocation),
      backTo: 'allocate-one',
      skipIf: (state) => pendingCount(state) === 0 && !state.ui.allocation,
      title: 'Allocate',
      body: 'Click Allocate. The analyst sees it in their queue straight away.',
      hint: 'Click Allocate',
      doneText: 'Allocated. It’s in their queue now.',
      done: (state, entry) => state.data.userAllocatedTrIds.length > entry.data.userAllocatedTrIds.length,
      advanceDelay: 450,
      assist: { label: 'Do it for me', run: submitAllocation },
    },
    {
      id: 'select-all',
      kind: 'action',
      page: 'test-requests',
      target: 'tr-select-all',
      placement: 'bottom',
      skipIf: (state) => pendingCount(state) === 0,
      onEnter: (api) => {
        if (api.getState().ui.trTab !== 'pending') api.dispatch({ type: 'ui/patch', payload: { trTab: 'pending', trSelection: [] } });
      },
      title: 'Now the rest, in one go',
      body: 'Tick Select all to pick every test request still waiting.',
      hint: 'Tick Select all',
      doneText: 'All pending tests selected.',
      done: (state, entry) => state.ui.trSelection.length >= Math.min(2, pendingCount(entry)),
      advanceDelay: 600,
      assist: { label: 'Do it for me', run: selectAllPending },
    },
    {
      id: 'bulk-open',
      kind: 'action',
      page: 'test-requests',
      target: 'tr-bulk-allocate',
      placement: 'bottom',
      skipIf: (state) => pendingCount(state) === 0,
      requires: (state) => state.ui.trSelection.length > 0 || Boolean(state.ui.allocation),
      backTo: 'select-all',
      title: 'Bulk allocate',
      body: 'Click Allocate selected. The same checks apply to every test in the batch.',
      hint: 'Click Allocate selected',
      advanceDelay: 250,
      doneText: 'Same checks, whole batch.',
      done: (state) => Boolean(state.ui.allocation),
      assist: { label: 'Do it for me', run: openBulkAllocation },
    },
    {
      id: 'bulk-confirm',
      kind: 'action',
      page: 'test-requests',
      // Walks the spotlight through the modal so the card never sits on top
      // of the control the visitor needs next.
      target: (state) => {
        const allocation = state.ui.allocation;
        if (!allocation?.analystId) return 'alloc-analysts';
        if (!allocation.reviewerId) return 'alloc-reviewer';
        return 'alloc-submit';
      },
      placement: (state) => {
        const allocation = state.ui.allocation;
        if (!allocation?.analystId) return 'right';
        if (!allocation.reviewerId) return 'left';
        return 'top';
      },
      requires: (state) => Boolean(state.ui.allocation),
      backTo: 'bulk-open',
      skipIf: (state) => pendingCount(state) === 0 && !state.ui.allocation,
      title: 'Assign the batch',
      body: (state) => {
        const allocation = state.ui.allocation;
        if (!allocation?.analystId) return 'Only analysts authorised for every discipline in this batch can be picked. Everyone else is greyed out with the reason.';
        if (!allocation.reviewerId) return 'Now add a reviewer for the batch.';
        return 'Click Allocate to hand over the whole batch in one go.';
      },
      hint: (state) => {
        const allocation = state.ui.allocation;
        if (!allocation?.analystId) return 'Choose an analyst';
        if (!allocation.reviewerId) return 'Choose a reviewer';
        return 'Click Allocate';
      },
      doneText: 'Batch allocated.',
      done: (state, entry) => state.data.userAllocatedTrIds.length > entry.data.userAllocatedTrIds.length,
      advanceDelay: 500,
      assist: { label: 'Do it for me', run: submitAllocation },
    },
  ],
};
