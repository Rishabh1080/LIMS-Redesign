// "Fill for me" / "Do it for me" helpers used by chapter steps.
// Each helper receives the tour `api` (see TourProvider) and drives the LIMS
// store the way a person would: the ghost cursor moves to a control
// (api.point), clicks, then the value changes, with short typing pauses.

import { getAnalystRows, getPendingTrIds, packOf, validateDraft } from '../store/selectors';

const packFor = (api) => packOf(api.getState().data);
const paramSlug = (name) => name.replace(/\W+/g, '-');

export async function goToPage(api, navTarget, page, params) {
  await api.point(`[data-tour="${navTarget}"]`);
  api.navigate(page, params);
}

export async function fillCustomer(api) {
  if (api.getState().draft.customerId) return;
  await api.point('#sgt-ni-customer');
  api.dispatch({ type: 'draft/set', payload: { field: 'customerId', value: packFor(api).presets.customerId } });
  await api.sleep(250);
}

export async function fillProducts(api) {
  const { batchLabel, presets } = packFor(api);
  if (api.getState().draft.products.length < 2) {
    await api.point('[data-tour="ni-add-row"]');
    api.dispatch({ type: 'draft/productCount', payload: { count: 2 } });
    await api.sleep(260);
  }

  const products = api.getState().draft.products;
  for (let index = 0; index < products.length; index += 1) {
    const row = api.getState().draft.products[index];
    if (row.category && row.product) continue;
    const preset = presets.rows[index % presets.rows.length];
    const n = index + 1;
    await api.point(`select[aria-label="Category for product ${n}"]`);
    api.dispatch({ type: 'draft/product', payload: { key: row.key, patch: { category: preset.category } } });
    await api.sleep(200);
    await api.point(`select[aria-label="Product ${n}"]`);
    api.dispatch({ type: 'draft/product', payload: { key: row.key, patch: { product: preset.product } } });
    await api.sleep(160);
    await api.point(`input[aria-label="Sample size for product ${n}"]`, { wait: 300 });
    await api.type((value) => api.dispatch({ type: 'draft/product', payload: { key: row.key, patch: { quantity: value } } }), preset.quantity);
    await api.point(`input[aria-label="${batchLabel} for product ${n}"]`, { wait: 300 });
    await api.type((value) => api.dispatch({ type: 'draft/product', payload: { key: row.key, patch: { batch: value } } }), preset.batch);
    await api.sleep(120);
  }
}

export async function fillParameters(api) {
  const pack = packFor(api);
  const products = api.getState().draft.products;
  for (let index = 0; index < products.length; index += 1) {
    const row = api.getState().draft.products[index];
    if (row.parameters.length || !row.product) continue;
    if (api.getState().ui.paramDrawer !== row.key) {
      await api.point(`[data-tour="ni-testing-${index}"] button`);
      api.dispatch({ type: 'ui/patch', payload: { paramDrawer: row.key } });
      await api.sleep(420);
    }
    const names =
      pack.presets.tests[row.category] ??
      (pack.categories.find((entry) => entry.category === row.category)?.parameters ?? []).slice(0, 2).map((entry) => entry.name);
    for (const name of names) {
      await api.point(`label[for="sgt-param-${row.key}-${paramSlug(name)}"]`, { wait: 260 });
      api.dispatch({ type: 'draft/toggleParameter', payload: { key: row.key, name } });
      await api.sleep(120);
    }
    await api.point('[data-tour="ni-param-done"]', { wait: 320 });
    api.dispatch({ type: 'ui/patch', payload: { paramDrawer: null } });
    await api.sleep(320);
  }
  if (api.getState().ui.paramDrawer) {
    api.dispatch({ type: 'ui/patch', payload: { paramDrawer: null } });
  }
}

export async function fillPaperwork(api) {
  const { draft } = api.getState();
  const { presets } = packFor(api);
  if (draft.receiptMode !== presets.receiptMode) {
    await api.point('#sgt-ni-mode');
    api.dispatch({ type: 'draft/set', payload: { field: 'receiptMode', value: presets.receiptMode } });
    await api.sleep(220);
  }
  if (!draft.customerRef.trim()) {
    await api.point('#sgt-ni-ref', { wait: 300 });
    await api.type((value) => api.dispatch({ type: 'draft/set', payload: { field: 'customerRef', value } }), presets.customerRef);
  }
}

export async function saveInward(api) {
  if (!validateDraft(api.getState().draft).valid) {
    await fillCustomer(api);
    await fillProducts(api);
    await fillParameters(api);
  }
  await api.point('[data-tour="ni-save"]');
  api.actions.saveInward();
}

// --- Allocation -----------------------------------------------------------

function bestAnalyst(state) {
  const allocation = state.ui.allocation;
  if (!allocation) return null;
  const trs = state.data.trs.filter((tr) => allocation.trIds.includes(tr.id));
  const disciplines = [...new Set(trs.map((tr) => tr.discipline))];
  const eligible = getAnalystRows(state.data, disciplines).filter((row) => row.eligible);
  eligible.sort((a, b) => a.workload - b.workload);
  return eligible[0] ?? null;
}

function bestReviewer(analysts, analystId) {
  const preferred = analysts.find((entry) => entry.id === 'an-kavita');
  if (preferred && preferred.id !== analystId) return preferred;
  return analysts.find((entry) => entry.canReview && !entry.onLeave && entry.id !== analystId) ?? null;
}

async function ensureTestRequests(api) {
  if (api.getState().nav.page !== 'test-requests') {
    await goToPage(api, 'nav-test-requests', 'test-requests', { tab: 'pending' });
    await api.sleep(350);
  }
  if (api.getState().ui.trTab !== 'pending') {
    api.dispatch({ type: 'ui/patch', payload: { trTab: 'pending' } });
    await api.sleep(200);
  }
}

export async function openFirstAllocation(api) {
  await ensureTestRequests(api);
  const [first] = getPendingTrIds(api.getState().data);
  if (!first) return;
  await api.point('[data-tour="tr-allocate-first"]');
  api.dispatch({ type: 'allocation/open', payload: { trIds: [first] } });
}

export async function pickAnalyst(api) {
  const analyst = bestAnalyst(api.getState());
  if (!analyst) return;
  await api.point(`tr[data-analyst="${analyst.id}"]`);
  api.dispatch({ type: 'allocation/patch', payload: { analystId: analyst.id } });
  await api.sleep(200);
}

export async function pickReviewer(api) {
  const { allocation } = api.getState().ui;
  if (!allocation) return;
  const reviewer = bestReviewer(packFor(api).analysts, allocation.analystId);
  if (!reviewer) return;
  await api.point('#sgt-alloc-reviewer');
  api.dispatch({ type: 'allocation/patch', payload: { reviewerId: reviewer.id } });
  await api.sleep(200);
}

export async function submitAllocation(api) {
  let state = api.getState();
  if (!state.ui.allocation) return;
  if (!state.ui.allocation.analystId) await pickAnalyst(api);
  state = api.getState();
  if (!state.ui.allocation?.reviewerId) await pickReviewer(api);
  await api.sleep(150);
  state = api.getState();
  const { allocation } = state.ui;
  const analyst = packFor(api).analysts.find((entry) => entry.id === allocation?.analystId);
  if (!allocation || !analyst || !allocation.reviewerId) return;
  await api.point('[data-tour="alloc-submit"]');
  api.actions.allocate({
    trIds: allocation.trIds,
    analystId: allocation.analystId,
    reviewerId: allocation.reviewerId,
    instrumentId: allocation.instrumentId,
    analystName: analyst.name,
  });
}

export async function selectAllPending(api) {
  await ensureTestRequests(api);
  await api.point('[data-tour="tr-select-all"]');
  api.dispatch({ type: 'tr/setSelection', payload: { ids: getPendingTrIds(api.getState().data) } });
  await api.sleep(200);
}

export async function openBulkAllocation(api) {
  if (!api.getState().ui.trSelection.length) await selectAllPending(api);
  const ids = api.getState().ui.trSelection;
  if (!ids.length) return;
  await api.point('[data-tour="tr-bulk-allocate"]');
  api.dispatch({ type: 'allocation/open', payload: { trIds: ids } });
}
