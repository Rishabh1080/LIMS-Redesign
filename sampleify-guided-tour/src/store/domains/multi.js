import { c, h, instrument, makeAnalysts, material, p, row, s } from './shared';

const CHEM = 'Chemical';
const MICRO = 'Microbiology';

// A general multi-discipline lab: food, water, pharma and oils under one roof.
export default {
  id: 'multi',
  label: 'Multi-discipline',
  tag: 'Multi-discipline',
  labNoun: 'testing lab',
  tileLine: 'A mix of food, water and pharma testing',
  standards: 'IS · AOAC · IP',
  methodsLine: 'NABL-ready test methods',
  auditors: 'NABL assessors',
  disciplines: [CHEM, MICRO],
  samplePrefix: 'SMP',
  batchLabel: 'Batch',
  batchPlaceholder: 'Batch no.',
  refPlaceholder: 'e.g. PO-4471/2026',
  analysts: makeAnalysts([CHEM, MICRO], {
    senior: 'Senior Chemist',
    specialist: 'Microbiologist',
    analyst: 'Analyst',
    trainee: 'Trainee Analyst',
    manager: 'Technical Manager',
  }),
  customers: [
    c('cus-acme-foods', 'Acme Foods Pvt. Ltd.', 'Pune', 'Anita Desai', '27AABCA1234R1ZP', 'Plot 14, MIDC Bhosari, Pune, Maharashtra 411026', '101'),
    c('cus-greenleaf-water', 'GreenLeaf Water Works', 'Bengaluru', 'Kiran Shetty', '29AAFCG5678Q1ZK', '22 Peenya Industrial Area, Bengaluru, Karnataka 560058', '102'),
    c('cus-medivance', 'Medivance Lifesciences Ltd.', 'Hyderabad', 'Rohan Mehta', '36AABCM9012M1ZT', 'Survey 81, Genome Valley, Hyderabad, Telangana 500078', '103'),
    c('cus-bharat-agro', 'Bharat Agro Exports', 'Nashik', 'Suresh Patil', '27AAFCB3456L1ZQ', 'Gat 112, Ambad MIDC, Nashik, Maharashtra 422010', '104'),
    c('cus-orient-oils', 'Orient Edible Oils', 'Indore', 'Meera Iyer', '23AABCO7890K1ZV', 'Sector F, Sanwer Road Industrial Area, Indore, Madhya Pradesh 452015', '105'),
  ],
  categories: [
    {
      category: 'Food & Spices',
      products: ['Turmeric Powder', 'Red Chilli Powder', 'Cumin Seeds'],
      defaultUnit: 'g',
      parameters: [
        p('Moisture', 'IS 1797:1985', 'NMT 10.0%', CHEM, 450, 2),
        p('Total Ash', 'IS 1797:1985', 'NMT 9.0%', CHEM, 500, 2),
        p('Aflatoxin B1', 'AOAC 991.31', 'NMT 10 µg/kg', CHEM, 2400, 4),
        p('Lead (Pb)', 'AOAC 999.11', 'NMT 2.5 mg/kg', CHEM, 1500, 3),
        p('Salmonella', 'IS 5887 (Part 3)', 'Absent in 25 g', MICRO, 1200, 5),
      ],
    },
    {
      category: 'Drinking Water',
      products: ['Packaged Drinking Water', 'Borewell Water', 'RO Permeate'],
      defaultUnit: 'L',
      parameters: [
        p('pH', 'IS 3025 (Part 11)', '6.5–8.5', CHEM, 200, 1),
        p('Total Dissolved Solids', 'IS 3025 (Part 16)', 'NMT 500 mg/L', CHEM, 300, 1),
        p('Total Hardness', 'IS 3025 (Part 21)', 'NMT 200 mg/L', CHEM, 300, 1),
        p('Arsenic (As)', 'IS 3025 (Part 37)', 'NMT 0.01 mg/L', CHEM, 1200, 3),
        p('E. coli', 'IS 15185:2016', 'Not detectable in 100 mL', MICRO, 800, 3),
      ],
    },
    {
      category: 'Pharmaceuticals',
      products: ['Paracetamol Tablets IP 500 mg', 'Amoxicillin Capsules IP', 'Cough Syrup'],
      defaultUnit: 'Units',
      parameters: [
        p('Assay (HPLC)', 'IP 2022', '95.0–105.0% of label claim', CHEM, 3500, 3),
        p('Dissolution', 'IP 2022', 'NLT 80% (Q) in 30 min', CHEM, 2800, 3),
        p('Related Substances', 'IP 2022', 'Any single impurity NMT 0.2%', CHEM, 4200, 4),
        p('Microbial Limit Test', 'IP 2022', 'TAMC NMT 1000 CFU/g', MICRO, 1800, 5),
      ],
    },
    {
      category: 'Edible Oils',
      products: ['Refined Sunflower Oil', 'Mustard Oil', 'Groundnut Oil'],
      defaultUnit: 'ml',
      parameters: [
        p('Acid Value', 'IS 548 (Part 1)', 'NMT 0.5 mg KOH/g', CHEM, 400, 2),
        p('Peroxide Value', 'IS 548 (Part 1)', 'NMT 10 meq O₂/kg', CHEM, 450, 2),
        p('Iodine Value', 'IS 548 (Part 1)', '100–145', CHEM, 450, 2),
        p('Moisture & Volatile Matter', 'IS 548 (Part 1)', 'NMT 0.1%', CHEM, 350, 1),
      ],
    },
  ],
  instruments: [
    instrument('ins-hplc', 'HPLC (UV / PDA)', 'Calibrated', 44),
    instrument('ins-icpms', 'ICP-MS', 'Calibrated', 59),
    instrument('ins-uvvis', 'UV-Vis Spectrophotometer', 'Calibration due', 360),
    instrument('ins-ph', 'pH Meter', 'Calibrated', 8),
    instrument('ins-moisture', 'Moisture Analyser', 'Calibrated', 27),
    instrument('ins-gc', 'Gas Chromatograph', 'Breakdown', 139),
  ],
  materials: [
    material('mat-methanol', 'Methanol, HPLC grade', 'In stock', '12 L'),
    material('mat-buffer', 'Buffer solution pH 7.0', 'In stock', '4 L'),
    material('mat-agar', 'Nutrient Agar', 'Low stock', '250 g'),
    material('mat-aflatoxin', 'Aflatoxin B1 reference standard', 'In stock', '3 vials'),
  ],
  history: [
    h('cus-acme-foods', 'PO-4471/2026', [s('Food & Spices', 'Turmeric Powder', '500', 'g', 'TP-2609', ['Moisture', 'Total Ash', 'Aflatoxin B1'])]),
    h('cus-greenleaf-water', 'WO-2210', [s('Drinking Water', 'Borewell Water', '2', 'L', 'BW-Site 4', ['pH', 'Total Dissolved Solids', 'E. coli'])]),
    h('cus-medivance', 'QC/REQ/0932', [s('Pharmaceuticals', 'Paracetamol Tablets IP 500 mg', '60', 'Units', 'PCM-24118', ['Assay (HPLC)', 'Dissolution', 'Related Substances'])]),
    h('cus-bharat-agro', 'EXP-LOT-77', [
      s('Food & Spices', 'Red Chilli Powder', '1', 'kg', 'RC-1022', ['Moisture', 'Aflatoxin B1', 'Lead (Pb)']),
      s('Food & Spices', 'Cumin Seeds', '500', 'g', 'CS-0871', ['Moisture', 'Salmonella']),
    ]),
    h('cus-orient-oils', 'OEO/QA/118', [s('Edible Oils', 'Mustard Oil', '500', 'ml', 'MO-5531', ['Acid Value', 'Peroxide Value', 'Iodine Value'])]),
    h('cus-greenleaf-water', 'WO-2174', [s('Drinking Water', 'Packaged Drinking Water', '2', 'L', 'PDW-0911', ['pH', 'Total Dissolved Solids', 'Arsenic (As)', 'E. coli'])]),
    h('cus-medivance', 'QC/REQ/0904', [s('Pharmaceuticals', 'Cough Syrup', '6', 'Units', 'CSY-3307', ['Assay (HPLC)', 'Microbial Limit Test'])]),
    h('cus-acme-foods', 'PO-4302/2026', [s('Food & Spices', 'Cumin Seeds', '250', 'g', 'CS-0790', ['Moisture', 'Total Ash'])]),
  ],
  presets: {
    customerId: 'cus-acme-foods',
    rows: [
      row('Food & Spices', 'Turmeric Powder', '500', 'TP-2611'),
      row('Drinking Water', 'Packaged Drinking Water', '2', 'PDW-0934'),
    ],
    tests: {
      'Food & Spices': ['Moisture', 'Total Ash', 'Aflatoxin B1'],
      'Drinking Water': ['pH', 'Total Dissolved Solids', 'E. coli'],
      Pharmaceuticals: ['Assay (HPLC)', 'Dissolution'],
      'Edible Oils': ['Acid Value', 'Peroxide Value'],
    },
    receiptMode: 'Courier',
    customerRef: 'PO-5120/2026',
  },
};
