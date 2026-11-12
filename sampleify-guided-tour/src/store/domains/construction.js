import { c, h, instrument, makeAnalysts, material, p, row, s } from './shared';

const MECH = 'Mechanical';
const CHEM = 'Chemical';

export default {
  id: 'construction',
  label: 'Construction Materials',
  tag: 'Construction',
  labNoun: 'materials testing lab',
  tileLine: 'Cement, concrete cubes, aggregates and TMT bars',
  standards: 'IS 4031 · IS 516 · IS 2386',
  methodsLine: 'IS 4031, IS 516, IS 2386 and IS 1608 methods',
  auditors: 'NABL assessors and project consultants',
  disciplines: [MECH, CHEM],
  samplePrefix: 'CIV',
  batchLabel: 'Batch / Cube ID',
  batchPlaceholder: 'e.g. M40-7D-02',
  refPlaceholder: 'e.g. Project or work order no.',
  analysts: makeAnalysts([MECH, CHEM], {
    senior: 'Senior Materials Engineer',
    specialist: 'Cement Chemist',
    analyst: 'Lab Technician',
    trainee: 'Trainee Technician',
    manager: 'Technical Manager',
  }),
  customers: [
    c('cus-shree-ganesh', 'Shree Ganesh Infra Projects', 'Nagpur', 'Suresh Patil', '27AABCS1234R1ZP', 'Plot 7, Wardha Road, Nagpur, Maharashtra 440015', '401'),
    c('cus-deccan-rmc', 'Deccan Ready Mix Concrete', 'Hyderabad', 'Rohan Mehta', '36AAFCD5678Q1ZK', 'Survey 44, Patancheru, Hyderabad, Telangana 502319', '402'),
    c('cus-vertex', 'Vertex Buildcon Pvt. Ltd.', 'Gurugram', 'Anita Desai', '06AABCV9012M1ZT', 'Sector 44, Gurugram, Haryana 122003', '403'),
    c('cus-konkan-highways', 'Konkan Highways Pvt. Ltd.', 'Ratnagiri', 'Kiran Shetty', '27AAFCK3456L1ZQ', 'MIDC Mirjole, Ratnagiri, Maharashtra 415639', '404'),
    c('cus-kaveri-cement', 'Kaveri Cement Works', 'Ariyalur', 'Meera Iyer', '33AABCK7890K1ZV', 'Trichy Road, Ariyalur, Tamil Nadu 621704', '405'),
  ],
  categories: [
    {
      category: 'Cement',
      products: ['OPC 53 Grade', 'PPC (Fly Ash Based)', 'PSC (Slag Based)'],
      defaultUnit: 'kg',
      parameters: [
        p('Fineness (Blaine)', 'IS 4031 (Part 2)', 'NLT 225 m²/kg', MECH, 600, 1),
        p('Initial Setting Time', 'IS 4031 (Part 5)', 'NLT 30 min', MECH, 500, 1),
        p('Soundness (Le Chatelier)', 'IS 4031 (Part 3)', 'NMT 10 mm', MECH, 500, 2),
        p('Compressive Strength (7 days)', 'IS 4031 (Part 6)', 'NLT 37 MPa', MECH, 1200, 7),
        p('Loss on Ignition', 'IS 4032', 'NMT 4.0%', CHEM, 700, 2),
      ],
    },
    {
      category: 'Concrete Cubes',
      products: ['M25 Concrete Cubes (150 mm)', 'M40 Concrete Cubes (150 mm)'],
      defaultUnit: 'Units',
      parameters: [
        p('Compressive Strength (7 days)', 'IS 516 (Part 1)', 'Report value (MPa)', MECH, 450, 7),
        p('Compressive Strength (28 days)', 'IS 516 (Part 1)', 'NLT fck as per IS 456', MECH, 450, 28),
        p('Density of Hardened Concrete', 'IS 516 (Part 1)', 'Report value (kg/m³)', MECH, 300, 1),
      ],
    },
    {
      category: 'Aggregates',
      products: ['Coarse Aggregate 20 mm', 'Fine Aggregate (M-Sand)', 'River Sand'],
      defaultUnit: 'kg',
      parameters: [
        p('Sieve Analysis', 'IS 2386 (Part 1)', 'As per IS 383 grading', MECH, 600, 1),
        p('Aggregate Impact Value', 'IS 2386 (Part 4)', 'NMT 30% (wearing surfaces)', MECH, 700, 2),
        p('Water Absorption', 'IS 2386 (Part 3)', 'NMT 2.0%', MECH, 500, 2),
        p('Chloride Content', 'IS 4032', 'Report value (%)', CHEM, 800, 2),
      ],
    },
    {
      category: 'Reinforcement Steel',
      products: ['Fe 500D TMT Bar 12 mm', 'Fe 500D TMT Bar 16 mm', 'Fe 550D TMT Bar 25 mm'],
      defaultUnit: 'Units',
      parameters: [
        p('Tensile Test (YS, UTS, Elongation)', 'IS 1608 (Part 1)', 'YS NLT 500 MPa, El NLT 16%', MECH, 1100, 2),
        p('Bend & Rebend Test', 'IS 1599 / IS 1786', 'No cracks on bent surface', MECH, 700, 2),
        p('Carbon & Sulphur', 'IS 228', 'C NMT 0.25%, S NMT 0.040%', CHEM, 900, 2),
      ],
    },
  ],
  instruments: [
    instrument('ins-ctm', 'Compression Testing Machine (2000 kN)', 'Calibrated', 52),
    instrument('ins-utm', 'Universal Testing Machine (1000 kN)', 'Calibrated', 41),
    instrument('ins-vicat', 'Vicat Apparatus', 'Calibrated', 88),
    instrument('ins-blaine', 'Blaine Air Permeability Apparatus', 'Calibration due', 362),
    instrument('ins-curing', 'Curing Tank (27 ± 2 °C)', 'Calibrated', 15),
    instrument('ins-impact', 'Aggregate Impact Tester', 'Breakdown', 130),
  ],
  materials: [
    material('mat-std-sand', 'Standard sand (IS 650)', 'In stock', '60 kg'),
    material('mat-moulds', 'Cube moulds 150 mm', 'In stock', '24 moulds'),
    material('mat-capping', 'Capping compound', 'Low stock', '2 kg'),
    material('mat-dw', 'Distilled water', 'In stock', '40 L'),
  ],
  history: [
    h('cus-deccan-rmc', 'DRMC/PO/1041', [s('Concrete Cubes', 'M40 Concrete Cubes (150 mm)', '3', 'Units', 'M40-7D-02', ['Density of Hardened Concrete', 'Compressive Strength (7 days)', 'Compressive Strength (28 days)'])]),
    h('cus-kaveri-cement', 'KCW/QC/0377', [s('Cement', 'OPC 53 Grade', '10', 'kg', 'Week 43', ['Fineness (Blaine)', 'Initial Setting Time', 'Loss on Ignition'])]),
    h('cus-shree-ganesh', 'SGIP/NH-361/0932', [s('Aggregates', 'Coarse Aggregate 20 mm', '50', 'kg', 'Quarry B, lot 7', ['Sieve Analysis', 'Aggregate Impact Value', 'Water Absorption'])]),
    h('cus-konkan-highways', 'KHPL/BR-12/110', [
      s('Reinforcement Steel', 'Fe 500D TMT Bar 16 mm', '3', 'Units', 'Heat 77412', ['Tensile Test (YS, UTS, Elongation)', 'Bend & Rebend Test', 'Carbon & Sulphur']),
      s('Aggregates', 'Fine Aggregate (M-Sand)', '25', 'kg', 'Stockpile 3', ['Sieve Analysis', 'Chloride Content']),
    ]),
    h('cus-vertex', 'VB/T4/0221', [s('Cement', 'PPC (Fly Ash Based)', '10', 'kg', 'Site store 2', ['Fineness (Blaine)', 'Initial Setting Time', 'Soundness (Le Chatelier)'])]),
    h('cus-kaveri-cement', 'KCW/QC/0351', [s('Cement', 'OPC 53 Grade', '10', 'kg', 'Week 42', ['Fineness (Blaine)', 'Initial Setting Time', 'Soundness (Le Chatelier)', 'Loss on Ignition'])]),
    h('cus-deccan-rmc', 'DRMC/PO/0988', [s('Concrete Cubes', 'M25 Concrete Cubes (150 mm)', '3', 'Units', 'M25-7D-11', ['Density of Hardened Concrete', 'Compressive Strength (7 days)'])]),
    h('cus-shree-ganesh', 'SGIP/NH-361/0904', [s('Reinforcement Steel', 'Fe 500D TMT Bar 12 mm', '3', 'Units', 'Heat 76988', ['Tensile Test (YS, UTS, Elongation)', 'Bend & Rebend Test'])]),
  ],
  presets: {
    customerId: 'cus-deccan-rmc',
    rows: [
      row('Concrete Cubes', 'M40 Concrete Cubes (150 mm)', '3', 'M40-7D-05'),
      row('Cement', 'OPC 53 Grade', '10', 'Week 44'),
    ],
    tests: {
      Cement: ['Fineness (Blaine)', 'Initial Setting Time', 'Loss on Ignition'],
      'Concrete Cubes': ['Compressive Strength (7 days)', 'Compressive Strength (28 days)'],
      Aggregates: ['Sieve Analysis', 'Aggregate Impact Value'],
      'Reinforcement Steel': ['Tensile Test (YS, UTS, Elongation)', 'Bend & Rebend Test'],
    },
    receiptMode: 'In person',
    customerRef: 'DRMC/PO/1063',
  },
};
