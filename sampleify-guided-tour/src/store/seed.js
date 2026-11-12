import { getPack } from './domains';
import { getParameter } from './catalog';

export const DATA_VERSION = 2;

const N = 'not_allocated';
const T = 'under_testing';
const A = 'under_approval';
const OK = 'approved';

/**
 * The shape of every lab's recent history, newest first. Each pack supplies
 * eight inwards whose samples have exactly these numbers of tests; the
 * statuses below are applied in order. This keeps the dashboard and the tour
 * consistent across lab types: 5 tests waiting for allocation, a few under
 * testing and approval, one inward running late, the rest done.
 */
const TEMPLATE = [
  { minutesAgo: 35, receiptMode: 'Courier', statuses: [[N, N, N]] },
  { minutesAgo: 130, receiptMode: 'In person', statuses: [[T, N, N]] },
  { minutesAgo: 60 * 26, receiptMode: 'Courier', statuses: [[T, A, T]] },
  { minutesAgo: 60 * 50, receiptMode: 'By Post', dueDays: 2, statuses: [[OK, A, T], [OK, T]] },
  { minutesAgo: 60 * 24 * 4, receiptMode: 'Courier', statuses: [[OK, OK, OK]] },
  { minutesAgo: 60 * 24 * 6, receiptMode: 'In person', statuses: [[OK, OK, A, OK]] },
  { minutesAgo: 60 * 24 * 9, receiptMode: 'Courier', statuses: [[OK, OK]] },
  { minutesAgo: 60 * 24 * 12, receiptMode: 'In person', statuses: [[OK, OK]] },
];

export function pad4(value) {
  return String(value).padStart(4, '0');
}

export function sampleIdFor(pack, year, number) {
  return `${pack.samplePrefix}/${year}/${pad4(number)}`;
}

/**
 * Who did the seeded work: the senior and the all-rounder share the main
 * discipline(s); the specialist takes the rest.
 */
function analystFor(pack, discipline, counter) {
  const senior = pack.analysts.find((analyst) => analyst.id === 'an-priya');
  if (!senior?.certifiedFor.includes(discipline)) return 'an-arjun';
  return counter % 2 === 0 ? 'an-priya' : 'an-sneha';
}

export function createSeedData(domainId, nowMs = Date.now()) {
  const pack = getPack(domainId);
  const year = new Date(nowMs).getFullYear();
  const inwards = [];
  const samples = [];
  const trs = [];

  const slots = TEMPLATE.map((slot, index) => ({ slot, spec: pack.history[index] })).filter(({ spec }) => spec);
  const oldestFirst = [...slots].reverse();
  let inwardNo = 149 - oldestFirst.length;
  let sampleNo = 401;
  let trNo = 1101;
  let assignCounter = 0;

  oldestFirst.forEach(({ slot, spec }) => {
    const receivedOn = new Date(nowMs - slot.minutesAgo * 60000).toISOString();
    const inwardId = `INW/${year}/${pad4(inwardNo)}`;
    inwardNo += 1;

    const maxTat = Math.max(
      1,
      ...spec.samples.flatMap((sample) => sample.tests.map((name) => getParameter(pack, sample.category, name)?.tatDays ?? 1)),
    );
    const dueDays = slot.dueDays ?? maxTat;
    const dueDate = new Date(new Date(receivedOn).getTime() + dueDays * 86400000).toISOString();
    const sampleIds = [];

    spec.samples.forEach((sampleSpec, sampleIndex) => {
      const sampleId = sampleIdFor(pack, year, sampleNo);
      sampleNo += 1;
      sampleIds.push(sampleId);
      const statuses = slot.statuses[sampleIndex] ?? [];
      const trIds = [];

      sampleSpec.tests.forEach((name, testIndex) => {
        const parameter = getParameter(pack, sampleSpec.category, name);
        const status = statuses[testIndex] ?? N;
        const trId = `TR/${year}/${pad4(trNo)}`;
        trNo += 1;
        trIds.push(trId);
        const allocated = status !== N;
        const discipline = parameter?.discipline ?? pack.disciplines[0];
        const analystId = allocated ? analystFor(pack, discipline, assignCounter) : null;
        if (allocated) assignCounter += 1;

        trs.push({
          id: trId,
          sampleId,
          inwardId,
          parameter: name,
          method: parameter?.method ?? '-',
          spec: parameter?.spec ?? '',
          discipline,
          status,
          analystId,
          reviewerId: allocated ? 'an-kavita' : null,
          instrumentId: null,
          createdAt: receivedOn,
          allocatedAt: allocated ? new Date(new Date(receivedOn).getTime() + 3600000).toISOString() : null,
          dueDate,
        });
      });

      samples.push({
        id: sampleId,
        inwardId,
        category: sampleSpec.category,
        product: sampleSpec.product,
        quantity: sampleSpec.quantity,
        unit: sampleSpec.unit,
        batch: sampleSpec.batch,
        trIds,
      });
    });

    inwards.push({
      id: inwardId,
      customerId: spec.customerId,
      sampleType: 'Base',
      receiptMode: slot.receiptMode,
      customerRef: spec.ref,
      receivedBy: 'Front Desk',
      receivedOn,
      dueDate,
      sampleIds,
    });
  });

  return {
    version: DATA_VERSION,
    domain: pack.id,
    seededAt: new Date(nowMs).toISOString(),
    inwards: inwards.reverse(),
    samples,
    trs,
    counters: { inward: inwardNo, sample: sampleNo, tr: trNo },
    userInwardIds: [],
    userAllocatedTrIds: [],
  };
}
