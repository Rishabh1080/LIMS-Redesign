// Seed options shared by the Decision Rules listing and the edit page, so both
// offer the same products, parameters, MoAs and sample categories.

export const PRODUCTS = [
  'Hardgel Capsule', 'Confectionary', 'Jelly', 'Powder', 'Liquid Fill Capsule',
  'Softgel Capsule', 'Tablet', 'Liquid', 'Product 1', 'Sodium Chloride',
];

export const PARAMETERS = [
  { name: 'Carbohydrate', min: '-', max: '-' },
  { name: 'Ash', min: '-', max: '0.1' },
  { name: 'Fat', min: '-', max: '-' },
  { name: 'Total Sugar', min: '-', max: '-' },
  { name: 'Energy', min: '-', max: '-' },
  { name: 'Moisture', min: '-', max: '1.0' },
  { name: 'Added Sugar', min: '-', max: '-' },
  { name: 'Protein', min: '-', max: '-' },
  { name: 'Dietary Fiber', min: '-', max: '-' },
  { name: 'Test para 1', min: '-', max: '-' },
  { name: 'Protein (dry basis)/Nitrogen', min: '-', max: '-' },
  { name: 'Cadmium', min: '-', max: '0.1' },
  { name: 'Mercury', min: '-', max: '0.1' },
  { name: 'Arsenic', min: '-', max: '0.1' },
  { name: 'Lead', min: '-', max: '0.1' },
  { name: 'SOy', min: '-', max: '-' },
  { name: 'Gluten', min: '-', max: '20' },
  { name: 'pH', min: '6.5', max: '8.5' },
];

// MoA codes — a running series from IHL/QC/STP/095 to IHL/QC/STP/150 (56 values).
export const MOAS = Array.from({ length: 150 - 95 + 1 }, (_, i) => `IHL/QC/STP/${String(95 + i).padStart(3, '0')}`);

export const SAMPLE_CATEGORIES = ['Finished Product', 'Raw Material', 'Stability', 'In-Process', 'Water'];

export const TEMPLATES = ['DataSheet'];

// Placeholder option lists for the edit page's remaining dropdowns.
export const UOMS = ['%', 'mg', 'g', 'mg/kg', 'ppm', 'ppb', 'mL', 'pH', 'cfu/g'];
export const DISCIPLINES = ['Chemical', 'Instrumental', 'Microbiological', 'Physical'];
export const GROUPS = ['Identification', 'Assay', 'Impurities', 'Physical tests', 'Heavy metals'];
export const RESULT_REPRESENTATIONS = ['Numeric', 'Text', 'Pass / Fail', 'Numeric with text'];
export const INSTRUMENTS = [
  'Gas Chromatograph',
  'UV-Vis Spectrophotometer',
  'pH Meter',
  'Stabinger Viscometer',
  'HPLC',
  'Analytical Balance',
];

// --- Flat rules (nesting OFF) ---------------------------------------------
// 563 rules spread across products; each cycles the parameter list, with MoA
// and sample category rotating so the columns look like real data.
const FLAT_TOTAL = 563;

const FLAT_LAST = [
  { product: 'Sodium Chloride', parameter: 'Ash', sampleCategory: 'Raw Material', moa: 'IHL/QC/STP/148', min: '-', max: '0.1' },
  { product: 'Sodium Chloride', parameter: 'pH', sampleCategory: 'Raw Material', moa: 'IHL/QC/STP/149', min: '6.5', max: '8.5' },
  { product: 'Sodium Chloride', parameter: 'Moisture', sampleCategory: 'Raw Material', moa: 'IHL/QC/STP/150', min: '-', max: '1.0' },
];

export function buildFlatRules() {
  const rules = [];
  const bodyCount = FLAT_TOTAL - FLAT_LAST.length;
  let seq = 0;
  while (rules.length < bodyCount) {
    const product = PRODUCTS[seq % PRODUCTS.length];
    const parameter = PARAMETERS[seq % PARAMETERS.length];
    rules.push({
      product,
      parameter: parameter.name,
      sampleCategory: SAMPLE_CATEGORIES[seq % SAMPLE_CATEGORIES.length],
      moa: MOAS[seq % MOAS.length],
      min: parameter.min,
      max: parameter.max,
    });
    seq += 1;
  }
  return [...rules, ...FLAT_LAST].map((rule, index) => ({
    id: `dr-${index + 1}`,
    sampleCategory: '-',
    moa: 'As per B.P.',
    cutOff: '0',
    template: 'DataSheet',
    ...rule,
  }));
}

// --- Nested rules (nesting ON) --------------------------------------------
// A test-group parent carries no values of its own; its children are the
// individual tests under it. One product can have several parent groups.
// Clicking a parent expands its children; children (and childless rules) edit.
const NESTED_GROUPS = [
  { product: 'Hardgel Capsule', parent: 'Nutritional Panel', children: ['Carbohydrate', 'Fat', 'Protein', 'Energy', 'Total Sugar'] },
  { product: 'Confectionary', parent: 'Allergen Screen', children: ['SOy', 'Gluten'] },
  { product: 'Jelly', parent: 'Heavy Metals', children: ['Cadmium', 'Mercury', 'Arsenic', 'Lead'] },
  { product: 'Powder', parent: 'Moisture & Ash', children: ['Moisture', 'Ash'] },
  { product: 'Tablet', parent: 'Assay Group', children: ['Protein (dry basis)/Nitrogen', 'Added Sugar', 'Dietary Fiber'] },
  { product: 'Liquid', parent: 'Physical Tests', children: ['pH', 'Moisture'] },
  { product: 'Softgel Capsule', parent: 'Fat Profile', children: ['Fat', 'Energy'] },
  { product: 'Sodium Chloride', parent: 'Purity Group', children: ['Ash', 'pH', 'Moisture'] },
  { product: 'Hardgel Capsule', parent: 'Contaminants', children: ['Lead', 'Arsenic', 'Mercury', 'Cadmium'] },
  { product: 'Confectionary', parent: 'Sugar Profile', children: ['Total Sugar', 'Added Sugar', 'Carbohydrate'] },
  { product: 'Jelly', parent: 'Nutritional Panel', children: ['Carbohydrate', 'Fat', 'Protein', 'Energy'] },
  { product: 'Powder', parent: 'Protein Tests', children: ['Protein', 'Protein (dry basis)/Nitrogen'] },
  { product: 'Tablet', parent: 'Dietary Panel', children: ['Dietary Fiber', 'Total Sugar', 'Energy', 'Carbohydrate'] },
  { product: 'Liquid', parent: 'Allergen Screen', children: ['SOy', 'Gluten'] },
  { product: 'Softgel Capsule', parent: 'Heavy Metals', children: ['Cadmium', 'Mercury', 'Arsenic', 'Lead'] },
  { product: 'Liquid Fill Capsule', parent: 'Fill Analysis', children: ['Fat', 'Moisture', 'Ash', 'Energy'] },
];

const paramByName = (name) => PARAMETERS.find((p) => p.name === name) ?? { min: '-', max: '-' };

export function buildNestedRules() {
  return NESTED_GROUPS.map((group, gi) => ({
    id: `ndr-${gi + 1}`,
    product: group.product,
    parameter: group.parent,
    sampleCategory: SAMPLE_CATEGORIES[gi % SAMPLE_CATEGORIES.length],
    moa: MOAS[gi % MOAS.length],
    min: '-',
    max: '-',
    cutOff: '0',
    template: 'DataSheet',
    isParent: true,
    children: group.children.map((childName, ci) => {
      const param = paramByName(childName);
      return {
        id: `ndr-${gi + 1}-${ci + 1}`,
        product: group.product,
        parameter: childName,
        sampleCategory: SAMPLE_CATEGORIES[(gi + ci) % SAMPLE_CATEGORIES.length],
        moa: MOAS[(gi * 5 + ci) % MOAS.length],
        min: param.min,
        max: param.max,
        cutOff: '0',
        template: 'DataSheet',
      };
    }),
  }));
}
