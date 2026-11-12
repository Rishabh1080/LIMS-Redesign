import { c, h, instrument, makeAnalysts, material, p, row, s } from './shared';

const CHEM = 'Chemical';
const MICRO = 'Microbiology';

export default {
  id: 'pharma',
  label: 'Pharmaceuticals',
  tag: 'Pharma',
  labNoun: 'pharma testing lab',
  tileLine: 'Formulations, APIs, pharma water and stability samples',
  standards: 'IP · BP · USP',
  methodsLine: 'IP, BP and USP monographs',
  auditors: 'NABL assessors and CDSCO inspectors',
  disciplines: [CHEM, MICRO],
  samplePrefix: 'AR',
  batchLabel: 'Batch No.',
  batchPlaceholder: 'e.g. PCM-24118',
  refPlaceholder: 'e.g. QC/REQ/0932',
  analysts: makeAnalysts([CHEM, MICRO], {
    senior: 'Senior QC Chemist',
    specialist: 'Microbiologist',
    analyst: 'QC Analyst',
    trainee: 'Trainee Analyst',
    manager: 'Technical Manager',
  }),
  customers: [
    c('cus-sunbeam', 'Sunbeam Formulations Pvt. Ltd.', 'Ahmedabad', 'Anita Desai', '24AABCS1234R1ZP', 'Plot 41, Changodar Industrial Estate, Ahmedabad, Gujarat 382213', '201'),
    c('cus-medivance', 'Medivance Lifesciences Ltd.', 'Hyderabad', 'Rohan Mehta', '36AABCM9012M1ZT', 'Survey 81, Genome Valley, Hyderabad, Telangana 500078', '202'),
    c('cus-aravalli', 'Aravalli Generics', 'Baddi', 'Harpreet Kaur', '02AAFCA3456L1ZQ', 'Village Katha, Baddi, Himachal Pradesh 173205', '203'),
    c('cus-crestline', 'Crestline Pharma LLP', 'Vapi', 'Harsh Patel', '24AAFCC7788K1ZV', 'Plot C-12, GIDC Phase II, Vapi, Gujarat 396195', '204'),
    c('cus-healwell', 'Healwell Remedies', 'Indore', 'Meera Iyer', '23AABCH5566J1ZS', 'Sector F, Sanwer Road, Indore, Madhya Pradesh 452015', '205'),
  ],
  categories: [
    {
      category: 'Finished Formulations',
      products: ['Paracetamol Tablets IP 500 mg', 'Amoxicillin Capsules IP 500 mg', 'Metformin Hydrochloride Tablets IP 500 mg'],
      defaultUnit: 'Units',
      parameters: [
        p('Assay (HPLC)', 'IP 2022', '95.0–105.0% of label claim', CHEM, 3500, 3),
        p('Dissolution', 'IP 2022', 'NLT 80% (Q) in 30 min', CHEM, 2800, 2),
        p('Related Substances (HPLC)', 'IP 2022', 'Any single impurity NMT 0.2%', CHEM, 4200, 4),
        p('Uniformity of Weight', 'IP 2022', '± 5% of average weight', CHEM, 600, 1),
        p('Microbial Limit Test', 'IP 2022', 'TAMC NMT 1000 CFU/g', MICRO, 1800, 5),
      ],
    },
    {
      category: 'Active Pharmaceutical Ingredients',
      products: ['Paracetamol IP', 'Metformin Hydrochloride IP', 'Azithromycin Dihydrate'],
      defaultUnit: 'g',
      parameters: [
        p('Assay (Titration)', 'IP 2022', '99.0–101.0% (dried basis)', CHEM, 1800, 2),
        p('Water Content (Karl Fischer)', 'USP <921>', 'NMT 0.5% w/w', CHEM, 700, 1),
        p('Residual Solvents (GC-HS)', 'USP <467>', 'As per ICH Q3C limits', CHEM, 4500, 4),
        p('Loss on Drying', 'IP 2022', 'NMT 0.5%', CHEM, 500, 1),
        p('Total Aerobic Microbial Count', 'IP 2022', 'NMT 1000 CFU/g', MICRO, 1500, 5),
      ],
    },
    {
      category: 'Pharma Water',
      products: ['Purified Water IP', 'Water for Injection IP'],
      defaultUnit: 'ml',
      parameters: [
        p('Conductivity', 'USP <645>', 'NMT 1.3 µS/cm at 25 °C', CHEM, 400, 1),
        p('Total Organic Carbon', 'USP <643>', 'NMT 500 ppb', CHEM, 1500, 1),
        p('Total Aerobic Count', 'IP 2022', 'NMT 100 CFU/mL', MICRO, 900, 3),
        p('Bacterial Endotoxins', 'IP 2022', 'NMT 0.25 EU/mL', MICRO, 2200, 2),
      ],
    },
    {
      category: 'Stability Samples',
      products: ['Paracetamol Tablets · 3M at 40 °C / 75% RH', 'Amoxicillin Capsules · 6M at 25 °C / 60% RH'],
      defaultUnit: 'Units',
      parameters: [
        p('Assay (HPLC)', 'IP 2022', '95.0–105.0% of label claim', CHEM, 3500, 3),
        p('Dissolution', 'IP 2022', 'NLT 80% (Q) in 30 min', CHEM, 2800, 2),
        p('Related Substances (HPLC)', 'IP 2022', 'Total impurities NMT 1.0%', CHEM, 4200, 4),
        p('Water Content (Karl Fischer)', 'USP <921>', 'NMT 5.0% w/w', CHEM, 700, 1),
      ],
    },
  ],
  instruments: [
    instrument('ins-hplc', 'HPLC-01 (UV / PDA)', 'Calibrated', 44),
    instrument('ins-gchs', 'GC with Headspace', 'Calibrated', 60),
    instrument('ins-diss', 'Dissolution Tester (8 station)', 'Calibrated', 21),
    instrument('ins-kf', 'Karl Fischer Titrator', 'Calibration due', 361),
    instrument('ins-toc', 'TOC Analyser', 'Calibrated', 9),
    instrument('ins-uv', 'UV-Vis Spectrophotometer', 'Breakdown', 140),
  ],
  materials: [
    material('mat-acn', 'Acetonitrile, HPLC grade', 'In stock', '8 L'),
    material('mat-buffer', 'Phosphate buffer pH 6.8', 'In stock', '5 L'),
    material('mat-scda', 'Soybean Casein Digest Agar', 'Low stock', '300 g'),
    material('mat-ws', 'Paracetamol working standard', 'In stock', '4 g'),
  ],
  history: [
    h('cus-sunbeam', 'QC/REQ/1041', [s('Finished Formulations', 'Paracetamol Tablets IP 500 mg', '60', 'Units', 'PCM-24131', ['Assay (HPLC)', 'Dissolution', 'Microbial Limit Test'])]),
    h('cus-crestline', 'CR/QA/0377', [s('Pharma Water', 'Purified Water IP', '500', 'ml', 'PW-Loop 2', ['Conductivity', 'Total Organic Carbon', 'Total Aerobic Count'])]),
    h('cus-medivance', 'MV/QC/0932', [s('Active Pharmaceutical Ingredients', 'Metformin Hydrochloride IP', '50', 'g', 'MTF-API-2208', ['Assay (Titration)', 'Residual Solvents (GC-HS)', 'Water Content (Karl Fischer)'])]),
    h('cus-aravalli', 'AG/STB/0110', [
      s('Stability Samples', 'Paracetamol Tablets · 3M at 40 °C / 75% RH', '30', 'Units', 'PCM-23987', ['Assay (HPLC)', 'Related Substances (HPLC)', 'Dissolution']),
      s('Finished Formulations', 'Amoxicillin Capsules IP 500 mg', '40', 'Units', 'AMX-1170', ['Uniformity of Weight', 'Microbial Limit Test']),
    ]),
    h('cus-healwell', 'HR/QC/0221', [s('Finished Formulations', 'Metformin Hydrochloride Tablets IP 500 mg', '60', 'Units', 'MET-0412', ['Assay (HPLC)', 'Dissolution', 'Uniformity of Weight'])]),
    h('cus-medivance', 'MV/QC/0904', [s('Active Pharmaceutical Ingredients', 'Azithromycin Dihydrate', '50', 'g', 'AZI-API-0761', ['Assay (Titration)', 'Water Content (Karl Fischer)', 'Residual Solvents (GC-HS)', 'Total Aerobic Microbial Count'])]),
    h('cus-crestline', 'CR/QA/0351', [s('Pharma Water', 'Water for Injection IP', '500', 'ml', 'WFI-Loop 1', ['Conductivity', 'Bacterial Endotoxins'])]),
    h('cus-sunbeam', 'QC/REQ/0988', [s('Active Pharmaceutical Ingredients', 'Paracetamol IP', '50', 'g', 'PCM-API-3310', ['Assay (Titration)', 'Loss on Drying'])]),
  ],
  presets: {
    customerId: 'cus-sunbeam',
    rows: [
      row('Finished Formulations', 'Paracetamol Tablets IP 500 mg', '60', 'PCM-24140'),
      row('Pharma Water', 'Purified Water IP', '500', 'PW-Loop 1'),
    ],
    tests: {
      'Finished Formulations': ['Assay (HPLC)', 'Dissolution', 'Microbial Limit Test'],
      'Active Pharmaceutical Ingredients': ['Assay (Titration)', 'Water Content (Karl Fischer)'],
      'Pharma Water': ['Conductivity', 'Total Organic Carbon', 'Total Aerobic Count'],
      'Stability Samples': ['Assay (HPLC)', 'Dissolution'],
    },
    receiptMode: 'Courier',
    customerRef: 'QC/REQ/1052',
  },
};
