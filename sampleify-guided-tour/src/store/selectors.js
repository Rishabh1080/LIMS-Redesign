import { getCustomer, getPack, getParameter } from './catalog';
import { isSameDay } from '../lib/format';

/** The domain pack (lab type) this data was seeded for. */
export function packOf(data) {
  return getPack(data?.domain);
}

export function deriveStatus(trs) {
  if (!trs.length) return 'Pending';
  if (trs.every((tr) => tr.status === 'approved')) return 'Completed';
  if (trs.every((tr) => tr.status === 'not_allocated')) return 'Pending';
  return 'Under Analysis';
}

export function isDelayed(entity, status, now = Date.now()) {
  return status !== 'Completed' && new Date(entity.dueDate).getTime() < now;
}

function indexById(list) {
  const map = new Map();
  list.forEach((item) => map.set(item.id, item));
  return map;
}

export function buildIndexes(data) {
  return {
    inwards: indexById(data.inwards),
    samples: indexById(data.samples),
    trs: indexById(data.trs),
  };
}

export function getInwardViews(data, now = Date.now()) {
  const pack = packOf(data);
  const { samples, trs } = buildIndexes(data);
  const userInwards = new Set(data.userInwardIds);

  return data.inwards.map((inward) => {
    const inwardSamples = inward.sampleIds.map((id) => {
      const sample = samples.get(id);
      const sampleTrs = sample.trIds.map((trId) => trs.get(trId)).filter(Boolean);
      return { ...sample, trs: sampleTrs, status: deriveStatus(sampleTrs) };
    });
    const inwardTrs = inwardSamples.flatMap((sample) => sample.trs);
    const status = deriveStatus(inwardTrs);

    return {
      ...inward,
      customer: getCustomer(pack, inward.customerId),
      samples: inwardSamples,
      trs: inwardTrs,
      status,
      delayed: isDelayed(inward, status, now),
      isUserCreated: userInwards.has(inward.id),
    };
  });
}

export function getInwardView(data, inwardId, now = Date.now()) {
  return getInwardViews(data, now).find((inward) => inward.id === inwardId) ?? null;
}

export function getDashboardMetrics(data, now = Date.now()) {
  const inwards = getInwardViews(data, now);
  const allSamples = inwards.flatMap((inward) => inward.samples.map((sample) => ({ ...sample, inward })));
  const today = new Date(now).toISOString();

  return {
    receivedToday: allSamples.filter((sample) => isSameDay(sample.inward.receivedOn, today)).length,
    delayedSamples: allSamples.filter((sample) => isDelayed(sample.inward, sample.status, now)).length,
    toAllocate: data.trs.filter((tr) => tr.status === 'not_allocated').length,
    awaitingApproval: data.trs.filter((tr) => tr.status === 'under_approval').length,
  };
}

export function getCategorySummary(data) {
  const inwards = getInwardViews(data);
  const byCategory = new Map();

  inwards.forEach((inward) => {
    inward.samples.forEach((sample) => {
      const bucket = byCategory.get(sample.category) ?? { category: sample.category, pending: 0, underAnalysis: 0, completed: 0 };
      if (sample.status === 'Pending') bucket.pending += 1;
      else if (sample.status === 'Completed') bucket.completed += 1;
      else bucket.underAnalysis += 1;
      byCategory.set(sample.category, bucket);
    });
  });

  const rows = [...byCategory.values()];
  const totals = rows.reduce(
    (sum, row) => ({
      pending: sum.pending + row.pending,
      underAnalysis: sum.underAnalysis + row.underAnalysis,
      completed: sum.completed + row.completed,
    }),
    { pending: 0, underAnalysis: 0, completed: 0 },
  );

  return { rows, totals };
}

export function getAnalystWorkload(data, analystId) {
  const analyst = packOf(data).analysts.find((entry) => entry.id === analystId);
  const live = data.trs.filter((tr) => tr.analystId === analystId && tr.status === 'under_testing').length;
  return (analyst?.baseLoad ?? 0) + live;
}

/**
 * One row per analyst for the allocation modal, with the reason they can or
 * cannot take the selected test requests.
 */
export function getAnalystRows(data, requiredDisciplines = []) {
  return packOf(data).analysts.map((analyst) => {
    const missing = requiredDisciplines.filter((discipline) => !analyst.certifiedFor.includes(discipline));
    const certified = missing.length === 0 && analyst.certifiedFor.length > 0;
    let reason = '';
    if (analyst.onLeave) reason = 'On leave today';
    else if (!analyst.certifiedFor.length) reason = 'Training in progress, not yet authorised';
    else if (!certified) reason = `Not authorised for ${missing.join(', ')}`;

    return {
      ...analyst,
      workload: getAnalystWorkload(data, analyst.id),
      certified,
      eligible: certified && !analyst.onLeave,
      reason,
    };
  });
}

export function getTrRows(data) {
  const pack = packOf(data);
  const { samples, inwards } = buildIndexes(data);
  const userInwards = new Set(data.userInwardIds);

  return data.trs.map((tr) => {
    const sample = samples.get(tr.sampleId);
    const inward = inwards.get(tr.inwardId);
    return {
      ...tr,
      sample,
      inward,
      customer: getCustomer(pack, inward?.customerId),
      isNew: userInwards.has(tr.inwardId) && tr.status === 'not_allocated',
    };
  });
}

export const TR_TABS = [
  { key: 'pending', label: 'Pending for allocation', statuses: ['not_allocated'] },
  { key: 'testing', label: 'Under testing', statuses: ['under_testing'] },
  { key: 'approval', label: 'Pending for approval', statuses: ['under_approval'] },
  { key: 'all', label: 'All Test Requests', statuses: null },
];

/** Pending rows put the visitor's own (new) test requests first. */
export function getTrRowsForTab(data, tabKey) {
  const tab = TR_TABS.find((entry) => entry.key === tabKey) ?? TR_TABS[0];
  const rows = getTrRows(data).filter((row) => !tab.statuses || tab.statuses.includes(row.status));
  return rows.sort((a, b) => {
    if (a.isNew !== b.isNew) return a.isNew ? -1 : 1;
    // Newest inward first; within an inward, tests in the order they were booked.
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() || a.id.localeCompare(b.id);
  });
}

export function getPendingTrIds(data) {
  return getTrRowsForTab(data, 'pending').map((row) => row.id);
}

// ---------------------------------------------------------------------------
// New inward draft
// ---------------------------------------------------------------------------

export function getDraftMaxTat(draft, pack) {
  const tats = draft.products.flatMap((product) =>
    product.parameters.map((name) => getParameter(pack, product.category, name)?.tatDays ?? 0),
  );
  return tats.length ? Math.max(...tats) : 0;
}

export function getDraftDueDate(draft, pack, now = Date.now()) {
  const maxTat = getDraftMaxTat(draft, pack);
  if (!maxTat) return null;
  return new Date(now + maxTat * 86400000).toISOString();
}

export function getDraftTotals(draft, pack) {
  let charges = 0;
  let tests = 0;
  draft.products.forEach((product) => {
    product.parameters.forEach((name) => {
      charges += getParameter(pack, product.category, name)?.price ?? 0;
      tests += 1;
    });
  });
  return { charges, tests };
}

export function validateDraft(draft) {
  const errors = { products: {} };
  if (!draft.customerId) errors.customerId = 'Select the customer who sent these samples.';
  if (!draft.receiptMode) errors.receiptMode = 'Select how the samples arrived.';

  draft.products.forEach((product) => {
    const rowErrors = {};
    if (!product.category) rowErrors.category = 'Required';
    if (!product.product) rowErrors.product = 'Required';
    if (!product.parameters.length) rowErrors.parameters = 'Add at least one test';
    if (Object.keys(rowErrors).length) errors.products[product.key] = rowErrors;
  });

  const valid = !errors.customerId && !errors.receiptMode && Object.keys(errors.products).length === 0;
  return { valid, errors };
}

export function draftProductsComplete(draft) {
  return draft.products.length > 0 && draft.products.every((product) => product.category && product.product);
}

export function draftParametersComplete(draft) {
  return draft.products.length > 0 && draft.products.every((product) => product.parameters.length > 0);
}
