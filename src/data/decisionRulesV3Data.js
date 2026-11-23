// Decision Rules V3: rules organised by product.
//
// A lab carries a few hundred products. Each product holds its own decision
// rules: standalone rules, plus nested rules (a parent with sub-rules)
// when nesting is turned on. Data is generated from a fixed seed so it is identical on
// every load, and it deliberately includes the gaps a lab has to work through:
// rules without limits, and products with no rules yet.
//
// Rule rows keep the same shape as V1/V2 (product, parameter, sampleCategory,
// moa, cutOff, min, max, template) so the existing edit page opens them.
import { MOAS, PRODUCTS, SAMPLE_CATEGORIES, DISCIPLINES } from './decisionRulesData';

const PRODUCT_COUNT = 240;

// Deterministic PRNG (mulberry32).
function seeded(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ACTIVES = [
  'Paracetamol 500 mg', 'Ibuprofen 400 mg', 'Metformin 850 mg', 'Amoxicillin 250 mg', 'Cetirizine 10 mg',
  'Vitamin C 1000 mg', 'Vitamin D3 60K IU', 'Calcium Citrate', 'Iron Folic Acid', 'Zinc Gluconate',
  'Omega-3 Fish Oil', 'Multivitamin', 'Biotin 10 mg', 'Magnesium Glycinate', 'Ashwagandha Extract',
  'Whey Protein', 'Plant Protein', 'Collagen Peptides', 'Probiotic 10B CFU', 'Electrolyte',
  'Pantoprazole 40 mg', 'Azithromycin 500 mg', 'Montelukast 10 mg', 'Atorvastatin 20 mg', 'Losartan 50 mg',
  'Glucosamine Chondroitin', 'Curcumin 95%', 'Melatonin 3 mg', 'Vitamin B12', 'Coenzyme Q10',
  'Ondansetron 4 mg', 'Domperidone 10 mg', 'Levocetirizine 5 mg', 'Folic Acid 5 mg', 'Lutein Zeaxanthin',
  'Spirulina', 'Moringa Leaf', 'Apple Cider Vinegar', 'Green Tea Extract', 'Sodium Bicarbonate',
];
const FORMS = [
  'Tablet', 'Film-coated Tablet', 'Hardgel Capsule', 'Softgel Capsule', 'Liquid Fill Capsule',
  'Oral Suspension', 'Syrup', 'Powder', 'Sachet', 'Effervescent Tablet', 'Gummies', 'Chewable Tablet',
];

const PEOPLE = ['Priya Nair', 'Arjun Rao', 'Sneha Kulkarni', 'Kavita Menon', 'Rahul Verma', 'Imran Sheikh'];

// Typical limits per parameter. A rule copies these; a few rules are left
// without limits on purpose (see LIMITLESS_SHARE).
const LIMITS = {
  Carbohydrate: { min: '-', max: '65' },
  Ash: { min: '-', max: '0.1' },
  Fat: { min: '-', max: '5.0' },
  'Total Sugar': { min: '-', max: '10' },
  Energy: { min: '250', max: '400' },
  Moisture: { min: '-', max: '1.0' },
  'Added Sugar': { min: '-', max: '5' },
  Protein: { min: '18', max: '-' },
  'Dietary Fiber': { min: '3', max: '-' },
  'Protein (dry basis)/Nitrogen': { min: '16', max: '-' },
  Cadmium: { min: '-', max: '0.1' },
  Mercury: { min: '-', max: '0.1' },
  Arsenic: { min: '-', max: '0.1' },
  Lead: { min: '-', max: '0.1' },
  SOy: { min: '-', max: '10' },
  Gluten: { min: '-', max: '20' },
  pH: { min: '6.5', max: '8.5' },
  Assay: { min: '95.0', max: '105.0' },
  Dissolution: { min: '80', max: '-' },
  Disintegration: { min: '-', max: '15' },
  'Uniformity of Weight': { min: '95', max: '105' },
  Hardness: { min: '4', max: '10' },
  Friability: { min: '-', max: '1.0' },
  'Related Substances': { min: '-', max: '0.5' },
  'Total Aerobic Count': { min: '-', max: '1000' },
  'Yeast & Mould': { min: '-', max: '100' },
  'E. coli': { min: '-', max: 'Absent' },
  Salmonella: { min: '-', max: 'Absent' },
};
const STANDALONE_PARAMETERS = [
  'Assay', 'Dissolution', 'Disintegration', 'Uniformity of Weight', 'Hardness', 'Friability',
  'Related Substances', 'Moisture', 'pH', 'Ash', 'Protein', 'Energy', 'Total Sugar', 'Fat', 'Gluten',
];
const NESTED_TEMPLATES = [
  { parent: 'Heavy Metals', children: ['Lead', 'Arsenic', 'Cadmium', 'Mercury'] },
  { parent: 'Microbial Limits', children: ['Total Aerobic Count', 'Yeast & Mould', 'E. coli', 'Salmonella'] },
  { parent: 'Nutritional Panel', children: ['Carbohydrate', 'Protein', 'Fat', 'Energy', 'Total Sugar'] },
  { parent: 'Allergen Screen', children: ['SOy', 'Gluten'] },
  { parent: 'Sugar Profile', children: ['Total Sugar', 'Added Sugar', 'Carbohydrate'] },
  { parent: 'Dietary Panel', children: ['Dietary Fiber', 'Total Sugar', 'Energy'] },
];
const LIMITLESS_SHARE = 0.03;
const NO_RULE_SHARE = 0.06;

const pad = (value, size) => String(value).padStart(size, '0');

function buildProducts() {
  const random = seeded(20261118);
  const pick = (list) => list[Math.floor(random() * list.length)];
  const between = (low, high) => low + Math.floor(random() * (high - low + 1));
  const shuffle = (list) => {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // The 10 product names V1/V2 use come first, so the same names appear here.
  const names = [...PRODUCTS];
  const combos = shuffle(ACTIVES.flatMap((active) => FORMS.map((form) => `${active} ${form}`)));
  for (const combo of combos) {
    if (names.length >= PRODUCT_COUNT) break;
    if (!names.includes(combo)) names.push(combo);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return names.map((name, index) => {
    const id = `prd-${pad(index + 1, 4)}`;
    const sampleCategory = pick(SAMPLE_CATEGORIES);
    const discipline = pick(DISCIPLINES);
    const updatedOn = new Date(today.getTime() - between(0, 120) * 86400000 - between(0, 23) * 3600000);
    let ruleSeq = 0;
    const nextId = () => {
      ruleSeq += 1;
      return `${id}-r${pad(ruleSeq, 3)}`;
    };
    const ruleFor = (parameter, extra = {}) => {
      const limits = random() < LIMITLESS_SHARE ? { min: '-', max: '-' } : LIMITS[parameter] ?? { min: '-', max: '-' };
      return {
        id: nextId(),
        product: name,
        parameter,
        sampleCategory: random() < 0.85 ? sampleCategory : pick(SAMPLE_CATEGORIES),
        moa: pick(MOAS),
        cutOff: '0',
        min: limits.min,
        max: limits.max,
        template: 'DataSheet',
        ...extra,
      };
    };

    const empty = index >= PRODUCTS.length && random() < NO_RULE_SHARE;
    const rules = empty ? [] : shuffle(STANDALONE_PARAMETERS).slice(0, between(2, 9)).map((parameter) => ruleFor(parameter));
    const nestedRules = empty
      ? []
      : shuffle(NESTED_TEMPLATES)
          .slice(0, random() < 0.35 ? 0 : between(1, 3))
          .map((template) => {
            const parent = ruleFor(template.parent, { min: '-', max: '-', isParent: true });
            parent.children = template.children.map((child) => ({
              ...ruleFor(child),
              parentId: parent.id,
            }));
            return parent;
          });

    return {
      id,
      code: `PRD-${pad(1001 + index, 4)}`,
      name,
      sampleCategory,
      discipline,
      updatedOn: updatedOn.toISOString(),
      updatedBy: pick(PEOPLE),
      rules,
      nestedRules,
    };
  });
}

// --- In-memory store --------------------------------------------------------
// Edits made in V3 (deleting a rule) last for the session and show up on the
// product listing too.
let store = null;
const products = () => {
  store ??= buildProducts();
  return store;
};

/** A rule without limits: neither min nor max set. Nested parents don't count. */
export const isWithoutLimits = (rule) => !rule.isParent && (rule.min ?? '-') === '-' && (rule.max ?? '-') === '-';

// Nesting is one global setting: either the lab uses nested rules or it
// doesn't. Off by default; persisted so it survives a reload.
const NESTED_KEY = 'lims:decision-rules-v3:nested';
let nestedOn = null;
export function getNestedEnabled() {
  if (nestedOn === null) {
    try {
      nestedOn = window.localStorage.getItem(NESTED_KEY) === 'true';
    } catch {
      nestedOn = false;
    }
  }
  return nestedOn;
}
export function setNestedEnabled(value) {
  nestedOn = Boolean(value);
  try {
    window.localStorage.setItem(NESTED_KEY, String(nestedOn));
  } catch {
    // Storage unavailable: the setting lasts for this session only.
  }
}

/** Rules a product shows: standalone rules, plus every sub-rule when nesting is on. */
export function leafRules(product, nested = getNestedEnabled()) {
  return nested ? [...product.rules, ...product.nestedRules.flatMap((parent) => parent.children)] : [...product.rules];
}

export function summarise(product, nested = getNestedEnabled()) {
  const leaves = leafRules(product, nested);
  const withoutLimits = leaves.filter(isWithoutLimits).length;
  return {
    ruleCount: leaves.length,
    withoutLimits,
    withLimits: leaves.length - withoutLimits,
  };
}

export function getProducts() {
  return products();
}

export function getProduct(productId) {
  return products().find((product) => product.id === productId) ?? null;
}

/** Neighbours in the given order of ids, for previous / next product. */
export function neighbours(productId, orderedIds) {
  const ids = orderedIds?.length ? orderedIds : products().map((product) => product.id);
  const index = ids.indexOf(productId);
  return {
    index,
    total: ids.length,
    previousId: index > 0 ? ids[index - 1] : null,
    nextId: index >= 0 && index < ids.length - 1 ? ids[index + 1] : null,
  };
}

function touch(product) {
  product.updatedOn = new Date().toISOString();
}

export function deleteRule(productId, ruleId) {
  const product = getProduct(productId);
  if (!product) return;
  product.rules = product.rules.filter((rule) => rule.id !== ruleId);
  product.nestedRules = product.nestedRules.map((parent) => ({ ...parent, children: parent.children.filter((child) => child.id !== ruleId) }));
  touch(product);
}

export function deleteNestedRule(productId, parentId) {
  const product = getProduct(productId);
  if (!product) return;
  product.nestedRules = product.nestedRules.filter((parent) => parent.id !== parentId);
  touch(product);
}

// The order the listing last showed (after search, filters and sort), so a
// product page's previous / next steps through the same list.
let listOrder = null;
export const setListOrder = (ids) => {
  listOrder = ids;
};
export const getListOrder = () => listOrder;

export { SAMPLE_CATEGORIES, DISCIPLINES };
