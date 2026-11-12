import { c, h, instrument, makeAnalysts, material, p, row, s } from './shared';

const CHEM = 'Chemical';
const MICRO = 'Microbiology';

export default {
  id: 'water',
  label: 'Water & Environment',
  tag: 'Environment',
  labNoun: 'environmental lab',
  tileLine: 'Drinking water, effluents, ambient air and soil',
  standards: 'IS 3025 · APHA · CPCB',
  methodsLine: 'IS 3025, IS 5182 and APHA methods',
  auditors: 'NABL assessors and Pollution Control Board inspectors',
  disciplines: [CHEM, MICRO],
  samplePrefix: 'ENV',
  batchLabel: 'Sampling Point',
  batchPlaceholder: 'e.g. ETP outlet',
  refPlaceholder: 'e.g. WO-2210',
  analysts: makeAnalysts([CHEM, MICRO], {
    senior: 'Senior Environmental Chemist',
    specialist: 'Microbiologist',
    analyst: 'Analyst',
    trainee: 'Trainee Analyst',
    manager: 'Technical Manager',
  }),
  customers: [
    c('cus-greenleaf', 'GreenLeaf Water Works', 'Bengaluru', 'Kiran Shetty', '29AAFCG5678Q1ZK', '22 Peenya Industrial Area, Bengaluru, Karnataka 560058', '301'),
    c('cus-ankleshwar', 'Ankleshwar Dyes & Intermediates', 'Ankleshwar', 'Harsh Patel', '24AABCA1234R1ZP', 'Plot 3412, GIDC Estate, Ankleshwar, Gujarat 393002', '302'),
    c('cus-clearflow', 'Clearflow Packaged Water', 'Nagpur', 'Anita Desai', '27AAFCC9012M1ZT', 'MIDC Hingna, Nagpur, Maharashtra 440016', '303'),
    c('cus-narmada-agro', 'Narmada Agro Chem Ltd.', 'Bharuch', 'Rohan Mehta', '24AABCN3456L1ZQ', 'Dahej SEZ, Bharuch, Gujarat 392130', '304'),
    c('cus-riverside', 'Riverside Township Developers', 'Pune', 'Meera Iyer', '27AABCR7890K1ZV', 'Survey 112, Hinjawadi Phase 3, Pune, Maharashtra 411057', '305'),
  ],
  categories: [
    {
      category: 'Drinking Water',
      products: ['Packaged Drinking Water', 'Borewell Water', 'Municipal Supply Water'],
      defaultUnit: 'L',
      parameters: [
        p('pH', 'IS 3025 (Part 11)', '6.5–8.5', CHEM, 200, 1),
        p('Total Dissolved Solids', 'IS 3025 (Part 16)', 'NMT 500 mg/L', CHEM, 300, 1),
        p('Total Hardness (as CaCO₃)', 'IS 3025 (Part 21)', 'NMT 200 mg/L', CHEM, 300, 1),
        p('Arsenic (As)', 'IS 3025 (Part 37)', 'NMT 0.01 mg/L', CHEM, 1200, 3),
        p('E. coli', 'IS 15185:2016', 'Not detectable in 100 mL', MICRO, 800, 3),
      ],
    },
    {
      category: 'Wastewater & Effluent',
      products: ['ETP Outlet Treated Effluent', 'ETP Inlet Raw Effluent', 'STP Outlet Water'],
      defaultUnit: 'L',
      parameters: [
        p('pH', 'IS 3025 (Part 11)', '5.5–9.0', CHEM, 200, 1),
        p('BOD (3 days at 27 °C)', 'IS 3025 (Part 44)', 'NMT 30 mg/L', CHEM, 900, 4),
        p('COD', 'IS 3025 (Part 58)', 'NMT 250 mg/L', CHEM, 700, 2),
        p('Total Suspended Solids', 'IS 3025 (Part 17)', 'NMT 100 mg/L', CHEM, 400, 1),
        p('Oil & Grease', 'IS 3025 (Part 39)', 'NMT 10 mg/L', CHEM, 800, 2),
        p('Faecal Coliform', 'APHA 9221 E', 'NMT 1000 MPN/100 mL', MICRO, 900, 3),
      ],
    },
    {
      category: 'Ambient Air',
      products: ['Ambient Air (24 h, Station AQ-02)', 'Ambient Air (24 h, Station AQ-05)'],
      defaultUnit: 'Units',
      parameters: [
        p('PM10', 'IS 5182 (Part 23)', 'NMT 100 µg/m³ (24 h)', CHEM, 900, 2),
        p('PM2.5', 'IS 5182 (Part 24)', 'NMT 60 µg/m³ (24 h)', CHEM, 1100, 2),
        p('Sulphur Dioxide (SO₂)', 'IS 5182 (Part 2)', 'NMT 80 µg/m³ (24 h)', CHEM, 800, 2),
        p('Nitrogen Dioxide (NO₂)', 'IS 5182 (Part 6)', 'NMT 80 µg/m³ (24 h)', CHEM, 800, 2),
      ],
    },
    {
      category: 'Soil & Sludge',
      products: ['Agricultural Soil', 'ETP Sludge'],
      defaultUnit: 'kg',
      parameters: [
        p('pH', 'IS 2720 (Part 26)', 'Report value', CHEM, 250, 1),
        p('Organic Carbon', 'IS 2720 (Part 22)', 'Report value', CHEM, 600, 2),
        p('Lead (Pb)', 'USEPA 3050B / 6010', 'Report value (mg/kg)', CHEM, 1200, 3),
        p('Hexavalent Chromium', 'USEPA 3060A', 'Report value (mg/kg)', CHEM, 1400, 3),
      ],
    },
  ],
  instruments: [
    instrument('ins-bod', 'BOD Incubator (27 °C)', 'Calibrated', 30),
    instrument('ins-cod', 'COD Digester', 'Calibrated', 48),
    instrument('ins-aas', 'Atomic Absorption Spectrometer', 'Calibrated', 66),
    instrument('ins-ph', 'pH / Conductivity Meter', 'Calibrated', 6),
    instrument('ins-rds', 'Fine Particulate Sampler (PM2.5)', 'Calibration due', 360),
    instrument('ins-icpoes', 'ICP-OES', 'Breakdown', 101),
  ],
  materials: [
    material('mat-dichromate', 'Potassium dichromate 0.25 N', 'In stock', '3 L'),
    material('mat-thio', 'Sodium thiosulphate 0.025 N', 'In stock', '4 L'),
    material('mat-macconkey', 'MacConkey broth', 'Low stock', '200 g'),
    material('mat-as-crm', 'Arsenic standard (1000 mg/L)', 'In stock', '2 bottles'),
  ],
  history: [
    h('cus-ankleshwar', 'ADI/ENV/0412', [s('Wastewater & Effluent', 'ETP Outlet Treated Effluent', '2', 'L', 'ETP outlet', ['pH', 'BOD (3 days at 27 °C)', 'COD'])]),
    h('cus-greenleaf', 'WO-2210', [s('Drinking Water', 'Borewell Water', '2', 'L', 'Site 4, Peenya', ['pH', 'Total Dissolved Solids', 'E. coli'])]),
    h('cus-narmada-agro', 'NAC/AQ/0932', [s('Ambient Air', 'Ambient Air (24 h, Station AQ-02)', '1', 'Units', 'Station AQ-02', ['PM10', 'PM2.5', 'Sulphur Dioxide (SO₂)'])]),
    h('cus-riverside', 'RTD/STP/77', [
      s('Wastewater & Effluent', 'STP Outlet Water', '2', 'L', 'STP outlet', ['pH', 'Total Suspended Solids', 'Faecal Coliform']),
      s('Soil & Sludge', 'ETP Sludge', '1', 'kg', 'Sludge bed 2', ['pH', 'Lead (Pb)']),
    ]),
    h('cus-clearflow', 'CPW/QA/118', [s('Drinking Water', 'Packaged Drinking Water', '2', 'L', 'Line 1, Batch 0911', ['pH', 'Total Dissolved Solids', 'Total Hardness (as CaCO₃)'])]),
    h('cus-ankleshwar', 'ADI/ENV/0377', [s('Wastewater & Effluent', 'ETP Inlet Raw Effluent', '2', 'L', 'ETP inlet', ['pH', 'COD', 'Oil & Grease', 'Total Suspended Solids'])]),
    h('cus-greenleaf', 'WO-2174', [s('Drinking Water', 'Municipal Supply Water', '2', 'L', 'Zone 3 tap', ['pH', 'Arsenic (As)'])]),
    h('cus-narmada-agro', 'NAC/AQ/0904', [s('Ambient Air', 'Ambient Air (24 h, Station AQ-05)', '1', 'Units', 'Station AQ-05', ['PM10', 'Nitrogen Dioxide (NO₂)'])]),
  ],
  presets: {
    customerId: 'cus-ankleshwar',
    rows: [
      row('Wastewater & Effluent', 'ETP Outlet Treated Effluent', '2', 'ETP outlet'),
      row('Drinking Water', 'Borewell Water', '2', 'Borewell 3'),
    ],
    tests: {
      'Drinking Water': ['pH', 'Total Dissolved Solids', 'E. coli'],
      'Wastewater & Effluent': ['BOD (3 days at 27 °C)', 'COD', 'Total Suspended Solids'],
      'Ambient Air': ['PM10', 'PM2.5'],
      'Soil & Sludge': ['pH', 'Lead (Pb)'],
    },
    receiptMode: 'In person',
    customerRef: 'ADI/ENV/0431',
  },
};
