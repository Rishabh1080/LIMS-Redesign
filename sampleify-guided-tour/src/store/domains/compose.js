// Builds one lab out of several lab types, for visitors who pick more than
// one tile. The first pack leads: its customers come first, its roles name the
// team and "Fill for me" starts with its products.
//
// What has to hold so the tour still works (see seed.js and chapter 3):
// - history keeps the eight-slot shape. Slot i comes from pack i % n, and every
//   pack's slot i already has the right number of tests.
// - every discipline in the lab has someone authorised for it, and the
//   all-rounder and technical manager cover all of them (bulk allocation).

const unique = (values) => [...new Set(values)];

function uniqueBy(items, key) {
  const seen = new Set();
  return items.filter((item) => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

export function composePack(packs) {
  const [lead, second] = packs;
  const many = packs.length > 2;

  const mains = unique(packs.map((pack) => pack.disciplines[0]));
  const seconds = unique(packs.map((pack) => pack.disciplines[1])).filter((discipline) => !mains.includes(discipline));
  const all = unique([...mains, ...seconds, ...packs.flatMap((pack) => pack.disciplines)]);
  // The specialist covers the second disciplines; if every one of them is
  // someone's main discipline, they keep the lead lab's second one.
  const specialistFor = seconds.length ? seconds : [lead.disciplines[1]];
  const certifiedFor = {
    'an-priya': mains,
    'an-arjun': specialistFor,
    'an-sneha': all,
    'an-imran': mains,
    'an-rahul': [],
    'an-kavita': all,
  };

  const auditors = unique(packs.map((pack) => pack.auditors));

  return {
    id: packs.map((pack) => pack.id).join(','),
    label: packs.map((pack) => pack.label).join(' + '),
    tag: many ? 'Multi-discipline' : packs.map((pack) => pack.tag).join(' · '),
    labNoun: 'multi-discipline lab',
    methodsLine: 'test methods for every discipline',
    auditors: auditors.length === 1 ? auditors[0] : 'NABL assessors and your clients’ auditors',
    disciplines: all,
    samplePrefix: 'SMP',
    batchLabel: 'Batch No.',
    batchPlaceholder: 'Batch no.',
    refPlaceholder: lead.refPlaceholder,
    analysts: lead.analysts.map((analyst) => ({ ...analyst, certifiedFor: certifiedFor[analyst.id] ?? analyst.certifiedFor })),
    customers: uniqueBy(packs.flatMap((pack) => pack.customers), 'id'),
    categories: uniqueBy(packs.flatMap((pack) => pack.categories), 'category'),
    // The lead lab's full list, then a few from each of the others.
    instruments: uniqueBy([...lead.instruments, ...packs.slice(1).flatMap((pack) => pack.instruments.slice(0, 3))], 'id'),
    materials: uniqueBy([...lead.materials, ...packs.slice(1).flatMap((pack) => pack.materials.slice(0, 2))], 'id'),
    history: lead.history.map((entry, index) => packs[index % packs.length].history[index] ?? entry),
    presets: {
      ...lead.presets,
      rows: [lead.presets.rows[0], second.presets.rows[0]],
      tests: Object.assign({}, ...packs.map((pack) => pack.presets.tests)),
    },
  };
}
