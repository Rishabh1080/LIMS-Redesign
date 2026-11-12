import { c, h, instrument, makeAnalysts, material, p, row, s } from './shared';

const CHEM = 'Chemical';
const MECH = 'Mechanical';

export default {
  id: 'metals',
  label: 'Metals & Minerals',
  tag: 'Metals',
  labNoun: 'metallurgy lab',
  tileLine: 'Steel, stainless, castings and ores',
  standards: 'IS 2062 · IS 1608 · ASTM',
  methodsLine: 'IS 1608, IS 228 and ASTM methods',
  auditors: 'NABL assessors and third-party inspectors',
  disciplines: [CHEM, MECH],
  samplePrefix: 'MET',
  batchLabel: 'Heat No.',
  batchPlaceholder: 'e.g. HT-98412',
  refPlaceholder: 'e.g. PO or TPI reference',
  analysts: makeAnalysts([CHEM, MECH], {
    senior: 'Senior Metallurgist',
    specialist: 'Mechanical Test Engineer',
    analyst: 'Lab Analyst',
    trainee: 'Trainee Analyst',
    manager: 'Technical Manager',
  }),
  customers: [
    c('cus-pioneer-steel', 'Pioneer Steel Structures', 'Raipur', 'Suresh Patil', '22AABCP1234R1ZP', 'Urla Industrial Area, Raipur, Chhattisgarh 493221', '501'),
    c('cus-western-valves', 'Western Valves & Flanges', 'Vadodara', 'Harsh Patel', '24AAFCW5678Q1ZK', 'Makarpura GIDC, Vadodara, Gujarat 390010', '502'),
    c('cus-jsr-castings', 'Jamshedpur Precision Castings', 'Jamshedpur', 'Anita Desai', '20AABCJ9012M1ZT', 'Adityapur Industrial Area, Jamshedpur, Jharkhand 831013', '503'),
    c('cus-sahyadri-pv', 'Sahyadri Pressure Vessels', 'Pune', 'Rohan Mehta', '27AAFCS3456L1ZQ', 'Chakan MIDC Phase II, Pune, Maharashtra 410501', '504'),
    c('cus-kalinga-ores', 'Kalinga Ores & Minerals', 'Keonjhar', 'Meera Iyer', '21AABCK7890K1ZV', 'Joda Road, Keonjhar, Odisha 758034', '505'),
  ],
  categories: [
    {
      category: 'Structural Steel',
      products: ['Hot Rolled Plate IS 2062 E250', 'HR Coil IS 2062 E350', 'ISMB 200 Beam'],
      defaultUnit: 'Units',
      parameters: [
        p('Chemical Composition (OES)', 'ASTM E415', 'E250: C NMT 0.23%, Mn NMT 1.50%', CHEM, 1800, 1),
        p('Tensile Test (YS, UTS, Elongation)', 'IS 1608 (Part 1)', 'YS NLT 250 MPa, El NLT 23%', MECH, 1500, 2),
        p('Charpy Impact Test', 'IS 1757 (Part 1)', 'NLT 27 J at 0 °C', MECH, 1400, 2),
        p('Bend Test', 'IS 1599', 'No cracks on outer surface', MECH, 700, 1),
      ],
    },
    {
      category: 'Stainless Steel',
      products: ['SS 304 Sheet', 'SS 316L Seamless Pipe', 'SS 410 Round Bar'],
      defaultUnit: 'Units',
      parameters: [
        p('Chemical Composition (OES)', 'ASTM E1086', '304: Cr 18.0–20.0%, Ni 8.0–10.5%', CHEM, 2200, 1),
        p('Hardness (Rockwell B)', 'ASTM E18', 'NMT 92 HRB', MECH, 600, 1),
        p('Intergranular Corrosion', 'ASTM A262 Practice E', 'No fissures after bend', CHEM, 3500, 4),
        p('Tensile Test (YS, UTS, Elongation)', 'ASTM E8/E8M', 'UTS NLT 515 MPa, El NLT 40%', MECH, 1500, 2),
      ],
    },
    {
      category: 'Castings & Forgings',
      products: ['SG Iron Casting (Grade 500/7)', 'Grey Cast Iron FG 260', 'Forged Flange ASTM A105'],
      defaultUnit: 'Units',
      parameters: [
        p('Chemical Composition (OES)', 'ASTM E1999', 'As per grade', CHEM, 1800, 1),
        p('Microstructure (Nodularity)', 'IS 7754', 'Nodularity NLT 80%', MECH, 1600, 2),
        p('Brinell Hardness', 'IS 1500 (Part 1)', '170–230 HBW', MECH, 600, 1),
        p('Tensile Test (YS, UTS, Elongation)', 'IS 1608 (Part 1)', 'UTS NLT 500 MPa, El NLT 7%', MECH, 1500, 2),
      ],
    },
    {
      category: 'Ores & Minerals',
      products: ['Iron Ore Fines', 'Iron Ore Lumps', 'Manganese Ore'],
      defaultUnit: 'kg',
      parameters: [
        p('Total Iron (Fe)', 'IS 1493 (Part 1)', 'NLT 62.0%', CHEM, 900, 2),
        p('Silica (SiO₂)', 'IS 1493 (Part 2)', 'NMT 4.0%', CHEM, 800, 2),
        p('Alumina (Al₂O₃)', 'IS 1493 (Part 2)', 'NMT 3.0%', CHEM, 800, 2),
        p('Moisture', 'IS 1446', 'Report value (%)', CHEM, 300, 1),
      ],
    },
  ],
  instruments: [
    instrument('ins-oes', 'Optical Emission Spectrometer', 'Calibrated', 12),
    instrument('ins-utm', 'Universal Testing Machine (600 kN)', 'Calibrated', 57),
    instrument('ins-charpy', 'Charpy Impact Tester (300 J)', 'Calibrated', 80),
    instrument('ins-rockwell', 'Rockwell Hardness Tester', 'Calibrated', 33),
    instrument('ins-brinell', 'Brinell Hardness Tester', 'Calibration due', 359),
    instrument('ins-micro', 'Metallurgical Microscope', 'Breakdown', 145),
  ],
  materials: [
    material('mat-argon', 'Argon gas cylinder (OES)', 'Low stock', '1 cylinder'),
    material('mat-crm-steel', 'Low-alloy steel CRM', 'In stock', '6 discs'),
    material('mat-nital', 'Nital etchant (2%)', 'In stock', '500 ml'),
    material('mat-alumina', 'Alumina polishing suspension', 'In stock', '2 L'),
  ],
  history: [
    h('cus-pioneer-steel', 'PSS/PO/1041', [s('Structural Steel', 'Hot Rolled Plate IS 2062 E250', '2', 'Units', 'HT-98412', ['Chemical Composition (OES)', 'Tensile Test (YS, UTS, Elongation)', 'Charpy Impact Test'])]),
    h('cus-western-valves', 'WVF/QA/0377', [s('Castings & Forgings', 'Forged Flange ASTM A105', '1', 'Units', 'HT-55730', ['Brinell Hardness', 'Chemical Composition (OES)', 'Tensile Test (YS, UTS, Elongation)'])]),
    h('cus-sahyadri-pv', 'SPV/TPI/0932', [s('Stainless Steel', 'SS 316L Seamless Pipe', '2', 'Units', 'HT-31877', ['Chemical Composition (OES)', 'Intergranular Corrosion', 'Hardness (Rockwell B)'])]),
    h('cus-jsr-castings', 'JPC/LOT/77', [
      s('Castings & Forgings', 'SG Iron Casting (Grade 500/7)', '2', 'Units', 'HT-SG-1022', ['Chemical Composition (OES)', 'Microstructure (Nodularity)', 'Tensile Test (YS, UTS, Elongation)']),
      s('Castings & Forgings', 'Grey Cast Iron FG 260', '1', 'Units', 'HT-GC-0871', ['Brinell Hardness', 'Chemical Composition (OES)']),
    ]),
    h('cus-kalinga-ores', 'KOM/RAKE/118', [s('Ores & Minerals', 'Iron Ore Fines', '5', 'kg', 'Rake 2611', ['Total Iron (Fe)', 'Silica (SiO₂)', 'Alumina (Al₂O₃)'])]),
    h('cus-pioneer-steel', 'PSS/PO/0911', [s('Structural Steel', 'HR Coil IS 2062 E350', '2', 'Units', 'HT-97933', ['Chemical Composition (OES)', 'Tensile Test (YS, UTS, Elongation)', 'Charpy Impact Test', 'Bend Test'])]),
    h('cus-sahyadri-pv', 'SPV/TPI/0904', [s('Stainless Steel', 'SS 304 Sheet', '1', 'Units', 'HT-30215', ['Chemical Composition (OES)', 'Hardness (Rockwell B)'])]),
    h('cus-kalinga-ores', 'KOM/RAKE/097', [s('Ores & Minerals', 'Manganese Ore', '5', 'kg', 'Rake 2588', ['Moisture', 'Silica (SiO₂)'])]),
  ],
  presets: {
    customerId: 'cus-pioneer-steel',
    rows: [
      row('Structural Steel', 'Hot Rolled Plate IS 2062 E250', '2', 'HT-98455'),
      row('Stainless Steel', 'SS 304 Sheet', '1', 'HT-30288'),
    ],
    tests: {
      'Structural Steel': ['Chemical Composition (OES)', 'Tensile Test (YS, UTS, Elongation)', 'Charpy Impact Test'],
      'Stainless Steel': ['Chemical Composition (OES)', 'Hardness (Rockwell B)'],
      'Castings & Forgings': ['Chemical Composition (OES)', 'Brinell Hardness'],
      'Ores & Minerals': ['Total Iron (Fe)', 'Silica (SiO₂)'],
    },
    receiptMode: 'Courier',
    customerRef: 'PSS/PO/1066',
  },
};
