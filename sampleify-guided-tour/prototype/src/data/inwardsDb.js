/*
 * Inward fixtures.
 *
 * An inward is the consignment: it carries the customer and receipt context and
 * the workflow status. It holds one or more products, and each product is saved
 * as its own sample, so a product maps 1:1 to a sample id.
 *
 * Received dates are generated relative to today rather than hard-coded, so the
 * date-range quick filters always have content in every bucket no matter when
 * the prototype is opened.
 */

const parametersByCategory = {
  'Cotton Yarn': [
    { parameter: 'Yarn Count', testMethod: 'IS 1315:1977', size: '0', charges: '650', estTime: '3' },
    { parameter: 'Single Yarn Strength', testMethod: 'IS 1670:1991', size: '0', charges: '850', estTime: '4' },
    { parameter: 'Twist in Yarn', testMethod: 'IS 832:1985', size: '0', charges: '600', estTime: '3' },
  ],
  'Hand Knotted': [
    { parameter: 'Surface flammability of carpets and rugs', testMethod: '16 CFR Part 1631', size: '0', charges: '3800', estTime: '3' },
    { parameter: 'Quantitative chemical analysis for Overall composition of carpet', testMethod: 'IS 2006:1988', size: '0', charges: '2000', estTime: '3' },
    { parameter: 'Colour fastness to rubbing ( Dry & Wet)', testMethod: '16 CFR Part 1631', size: '0', charges: '3800', estTime: '3' },
  ],
  'Hand Tufted': [
    { parameter: 'Tuft Withdrawal Force', testMethod: 'IS 11045:1984', size: '0', charges: '1200', estTime: '5' },
    { parameter: 'Colour Fastness to Rubbing', testMethod: 'IS ISO 105-X12:2016', size: '0', charges: '1100', estTime: '5' },
    { parameter: 'Determination of Pile Thickness', testMethod: 'IS 5884:2020', size: '0', charges: '900', estTime: '4' },
  ],
  'Handloom Carpet': [
    { parameter: 'Mass per Unit Area', testMethod: 'IS 1964:2001', size: '0', charges: '700', estTime: '3' },
    { parameter: 'Dimensional Change', testMethod: 'IS 10019:1981', size: '0', charges: '950', estTime: '4' },
    { parameter: 'Colour Fastness to Washing', testMethod: 'IS ISO 105-C10:2006', size: '0', charges: '1050', estTime: '5' },
  ],
  Jacket: [
    { parameter: 'Tensile Strength', testMethod: 'IS 1969:1985', size: '0', charges: '1000', estTime: '4' },
    { parameter: 'Tear Strength', testMethod: 'IS 6489:1971', size: '0', charges: '1000', estTime: '4' },
    { parameter: 'Water Repellency', testMethod: 'IS 390:1975', size: '0', charges: '800', estTime: '3' },
  ],
  'Jute Yarn': [
    { parameter: 'Yarn Count', testMethod: 'IS 9113:1979', size: '0', charges: '650', estTime: '3' },
    { parameter: 'Breaking Load', testMethod: 'IS 1670:1991', size: '0', charges: '850', estTime: '4' },
    { parameter: 'Moisture Regain', testMethod: 'IS 667:1981', size: '0', charges: '750', estTime: '3' },
  ],
  Latex: [
    { parameter: 'Total Solids Content', testMethod: 'IS 3708:1985', size: '0', charges: '950', estTime: '3' },
    { parameter: 'Dry Rubber Content', testMethod: 'IS 3708:1985', size: '0', charges: '1100', estTime: '4' },
    { parameter: 'pH', testMethod: 'IS 3708:1985', size: '0', charges: '500', estTime: '2' },
  ],
};

const inwardSeeds = [
  {
    id: 'INW/2026/0148',
    daysAgo: 0,
    time: '09:12',
    status: 'Pending',
    customerName: 'Acme Textiles, Ahmedabad',
    customerAddress: '12 Textile Estate, Ahmedabad, Gujarat 380001',
    representativeName: 'Anita Desai',
    contactNumber: '9876543210',
    representativeEmail: 'anita@acmetextiles.test',
    gstNumber: '24AABCA1234R1ZP',
    requestLetter: 'CRL-2026-0142',
    receivedMode: 'Courier',
    customerReference: 'PO-4471/2026',
    receivedBy: 'Front Desk',
    products: [
      { id: 'PRD-2026-0001', name: 'Carded Cotton Yarn', category: 'Cotton Yarn', sampleId: 'IICT/2026-2027/2001', qty: '2', sampleSize: '250 g', batch: 'BATCH-CY-11', quality: 'Ring Spun', identification: 'Lot CY-11', condition: 'OK', description: 'Carded cotton yarn cones' },
      { id: 'PRD-2026-0002', name: 'Combed Cotton Yarn', category: 'Cotton Yarn', sampleId: 'IICT/2026-2027/2002', qty: '2', sampleSize: '250 g', batch: 'BATCH-CY-12', quality: 'Combed', identification: 'Lot CY-12', condition: 'OK', description: 'Combed cotton yarn cones' },
    ],
  },
  {
    id: 'INW/2026/0147',
    daysAgo: 1,
    time: '02:34',
    status: 'Under Analysis',
    customerName: 'Indian Art Gallery, Bhadohi',
    customerAddress: 'Carpet City Chauri Road Bhadohi',
    representativeName: 'Indian Art Gallery',
    contactNumber: '8840498586',
    representativeEmail: 'NA',
    gstNumber: '09AABCI5566P1ZR',
    requestLetter: '-',
    receivedMode: 'In-Person',
    customerReference: 'Carpet',
    receivedBy: 'Sample Coordinator',
    products: [
      { id: 'PRD-2026-0003', name: 'Woollen Hand Knotted Carpet', category: 'Hand Knotted', sampleId: 'IICT/2026-2027/2003', qty: '1', sampleSize: '190 g', batch: 'BATCH-HK-01', quality: 'Hand Knotted (Round)', identification: 'Maze Colour: Camel', condition: 'OK', description: 'Woollen hand knotted carpet' },
      { id: 'PRD-2026-0004', name: 'Silk Hand Knotted Carpet', category: 'Hand Knotted', sampleId: 'IICT/2026-2027/2004', qty: '1', sampleSize: '150 g', batch: 'BATCH-HK-02', quality: 'Hand Knotted (Rect.)', identification: 'Maze Colour: Ivory', condition: 'OK', description: 'Silk hand knotted carpet' },
      { id: 'PRD-2026-0005', name: 'Natural Rubber Latex', category: 'Latex', sampleId: 'IICT/2026-2027/2005', qty: '1', sampleSize: '500 ml', batch: 'BATCH-NRL-8', quality: 'Centrifuged', identification: 'Drum NRL-8', condition: 'Sealed', description: 'Natural rubber latex sample' },
    ],
  },
  {
    id: 'INW/2026/0146',
    daysAgo: 4,
    time: '11:05',
    status: 'Under Analysis',
    customerName: 'Orient Carpets, Bhadohi',
    customerAddress: 'Bhadohi Carpet Zone, Bhadohi, Uttar Pradesh 221401',
    representativeName: 'Meera Iyer',
    contactNumber: '9987034122',
    representativeEmail: 'meera@orientcarpets.test',
    gstNumber: '09AABCO7890K1ZV',
    requestLetter: '-',
    receivedMode: 'By Post',
    customerReference: 'Export lot 22',
    receivedBy: 'Lab Manager',
    products: [
      { id: 'PRD-2026-0006', name: 'Woollen Tufted Carpet', category: 'Hand Tufted', sampleId: 'IICT/2026-2027/2006', qty: '1', sampleSize: '210 g', batch: 'BATCH-HT-04', quality: 'Hand Tufted (Round)', identification: 'Maze Colour: Rust', condition: 'OK', description: 'Hand tufted woollen carpet' },
      { id: 'PRD-2026-0007', name: 'Cotton Tufted Bath Mat', category: 'Hand Tufted', sampleId: 'IICT/2026-2027/2007', qty: '4', sampleSize: '120 g', batch: 'BATCH-HT-05', quality: 'Tufted', identification: 'Maze Colour: Sky', condition: 'OK', description: 'Cotton tufted bath mats' },
    ],
  },
  {
    id: 'INW/2026/0145',
    daysAgo: 9,
    time: '08:44',
    status: 'Completed',
    customerName: 'Bharat Textile Works, Surat',
    customerAddress: 'GIDC Textile Park, Surat, Gujarat 395010',
    representativeName: 'Kavita Sharma',
    contactNumber: '9825011442',
    representativeEmail: 'kavita@bharattextile.test',
    gstNumber: '24AABCB9012M1ZT',
    requestLetter: 'CRL-2026-0188',
    receivedMode: 'In-Person',
    customerReference: 'Yarn batch 7',
    receivedBy: 'Front Desk',
    products: [
      { id: 'PRD-2026-0008', name: 'Cotton Dhurry', category: 'Handloom Carpet', sampleId: 'IICT/2026-2027/2008', qty: '2', sampleSize: '180 g', batch: 'BATCH-HD-04', quality: 'Handloom', identification: 'Lot HD-4', condition: 'OK', description: 'Cotton dhurry rugs' },
      { id: 'PRD-2026-0009', name: 'Woollen Handloom Rug', category: 'Handloom Carpet', sampleId: 'IICT/2026-2027/2009', qty: '1', sampleSize: '200 g', batch: 'BATCH-HD-05', quality: 'Handloom', identification: 'Lot HD-5', condition: 'Minor fraying', description: 'Woollen handloom rug' },
    ],
  },
  {
    id: 'INW/2026/0144',
    daysAgo: 18,
    time: '15:30',
    status: 'Completed',
    customerName: 'Shakti Dyeing & Finishing, Surat',
    customerAddress: 'Sachin Industrial Estate, Surat, Gujarat 394230',
    representativeName: 'Harsh Patel',
    contactNumber: '9724455710',
    representativeEmail: 'harsh@shaktidyeing.test',
    gstNumber: '24AAFCS3456L1ZQ',
    requestLetter: '-',
    receivedMode: 'Courier',
    customerReference: 'SJ-19/20',
    receivedBy: 'Lab Manager',
    products: [
      { id: 'PRD-2026-0010', name: 'Industrial Safety Jacket', category: 'Jacket', sampleId: 'IICT/2026-2027/2010', qty: '3', sampleSize: '3 Units', batch: 'BATCH-SJ-19', quality: 'Hi-Vis Class 2', identification: 'Batch SJ-19', condition: 'OK', description: 'Industrial safety jackets' },
      { id: 'PRD-2026-0011', name: 'Protective Textile Jacket', category: 'Jacket', sampleId: 'IICT/2026-2027/2011', qty: '3', sampleSize: '3 Units', batch: 'BATCH-SJ-20', quality: 'Flame Retardant', identification: 'Batch SJ-20', condition: 'OK', description: 'Protective textile jackets' },
    ],
  },
  {
    id: 'INW/2026/0143',
    daysAgo: 29,
    time: '10:02',
    status: 'Pending',
    customerName: 'Nova Chemicals, Pune',
    customerAddress: '48 Industrial Area, Pune, Maharashtra 411019',
    representativeName: 'Rohan Mehta',
    contactNumber: '9811122334',
    representativeEmail: 'rohan@novachemicals.test',
    gstNumber: '27AABCN5678Q1ZK',
    requestLetter: 'CRL-2026-0201',
    receivedMode: 'Courier',
    customerReference: 'JY-2/3',
    receivedBy: 'Front Desk',
    products: [
      { id: 'PRD-2026-0012', name: 'Single Jute Yarn', category: 'Jute Yarn', sampleId: 'IICT/2026-2027/2012', qty: '2', sampleSize: '300 g', batch: 'BATCH-JY-02', quality: 'Single ply', identification: 'Lot JY-2', condition: 'OK', description: 'Single jute yarn hanks' },
      { id: 'PRD-2026-0013', name: 'Twisted Jute Yarn', category: 'Jute Yarn', sampleId: 'IICT/2026-2027/2013', qty: '2', sampleSize: '300 g', batch: 'BATCH-JY-03', quality: 'Two ply', identification: 'Lot JY-3', condition: 'OK', description: 'Twisted jute yarn hanks' },
    ],
  },
  {
    id: 'INW/2026/0142',
    daysAgo: 52,
    time: '13:26',
    status: 'Completed',
    customerName: 'Acme Textiles, Ahmedabad',
    customerAddress: '12 Textile Estate, Ahmedabad, Gujarat 380001',
    representativeName: 'Anita Desai',
    contactNumber: '9876543210',
    representativeEmail: 'anita@acmetextiles.test',
    gstNumber: '24AABCA1234R1ZP',
    requestLetter: '-',
    receivedMode: 'In-Person',
    customerReference: 'SLC-3',
    receivedBy: 'Sample Coordinator',
    products: [
      { id: 'PRD-2026-0014', name: 'Synthetic Latex Compound', category: 'Latex', sampleId: 'IICT/2026-2027/2014', qty: '1', sampleSize: '500 ml', batch: 'BATCH-SLC-3', quality: 'Compounded', identification: 'Drum SLC-3', condition: 'Sealed', description: 'Synthetic latex compound sample' },
    ],
  },
];

function toDisplayDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');

  return `${day}/${month}/${date.getFullYear()}`;
}

function toIsoish(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');

  return `${day}-${month}-${date.getFullYear()}`;
}

function dateDaysAgo(days) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - days);

  return date;
}

// Parses the DD/MM/YYYY strings this fixture produces.
export function parseDisplayDate(value) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(value ?? '').trim());
  if (!match) return null;

  const date = new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
  return Number.isNaN(date.getTime()) ? null : date;
}

/*
 * Per-parameter testing status.
 *
 * The fixtures only carry a status on the inward, so parameter statuses are
 * derived from it: nothing is allocated while the inward is Pending, everything
 * is Approved once it is Completed, and Under Analysis draws from a mixed pool
 * so a progress readout has something to show. The pool index is a function of
 * the product and parameter position, which keeps the result stable across
 * reloads instead of reshuffling on every render.
 */
const parameterStatusPools = {
  Pending: ['Not allocated'],
  'Under Analysis': ['Approved', 'Under Testing', 'Under Approval', 'Not allocated'],
  Completed: ['Approved'],
};

function parameterStatusFor(inwardStatus, productIndex, parameterIndex) {
  const pool = parameterStatusPools[inwardStatus] ?? ['Not allocated'];
  return pool[(productIndex * 2 + parameterIndex) % pool.length];
}

function buildInward({ daysAgo, time, products, ...inward }, inwardIndex) {
  const received = dateDaysAgo(daysAgo);
  const due = dateDaysAgo(daysAgo - 28);
  const receivedDate = toDisplayDate(received);

  return {
    ...inward,
    receivedDate,
    createdOn: `${receivedDate}, ${time}`,
    receiveDateLong: toIsoish(received),
    dueDate: toIsoish(due),
    registrationDate: toIsoish(received),
    categories: [...new Set(products.map((product) => product.category))],
    products: products.map((product, productIndex) => ({
      ...product,
      inwardId: inward.id,
      parameters: (parametersByCategory[product.category] ?? [])
        .map((row, index) => ({
          sr: String(index + 1),
          ...row,
          status: parameterStatusFor(inward.status, inwardIndex + productIndex, index),
        })),
    })),
  };
}

export const allInwardsDb = inwardSeeds.map((seed, index) => buildInward(seed, index));

export function getInwardById(inwardId) {
  return allInwardsDb.find((inward) => inward.id === inwardId) ?? null;
}

export function getInwardBySampleId(sampleId) {
  return allInwardsDb.find(
    (inward) => inward.products.some((product) => product.sampleId === sampleId),
  ) ?? null;
}

export function getProductBySampleId(sampleId) {
  for (const inward of allInwardsDb) {
    const product = inward.products.find((entry) => entry.sampleId === sampleId);
    if (product) return product;
  }

  return null;
}

/*
 * Reshapes parameter rows into what ParameterCircles expects. The fixture calls
 * the parameter's name `parameter`; the component reads `name`.
 */
export function toParameterCircles(parameters = []) {
  return parameters.map((row, index) => ({
    id: `${row.parameter}-${index}`,
    name: row.parameter,
    status: row.status ?? 'Not allocated',
  }));
}

export function countApprovedParameters(parameters = []) {
  return parameters.filter((row) => row.status === 'Approved').length;
}

// Every parameter across the inward, for an inward-level progress readout.
export function getInwardParameters(inward) {
  return inward?.products?.flatMap((product) => product.parameters) ?? [];
}

/*
 * The sample view of the same fixtures: one row per product, since each product
 * in an inward is saved as its own sample.
 */
export const allInwardSamplesDb = allInwardsDb.flatMap((inward) =>
  inward.products.map((product) => ({
    id: product.sampleId,
    inwardId: inward.id,
    productName: product.name,
    category: product.category,
    customerName: inward.customerName,
    representativeName: inward.representativeName,
    createdOn: inward.createdOn,
    receivedDate: inward.receivedDate,
    status: inward.status,
    parameters: product.parameters,
  })),
);
