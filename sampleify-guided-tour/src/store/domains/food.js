import { c, h, instrument, makeAnalysts, material, p, row, s } from './shared';

const CHEM = 'Chemical';
const MICRO = 'Microbiology';

export default {
  id: 'food',
  label: 'Food & Agriculture',
  tag: 'Food & agri',
  labNoun: 'food testing lab',
  tileLine: 'Spices, dairy, grains, edible oils and export lots',
  standards: 'FSSAI · AOAC · IS',
  methodsLine: 'FSSAI manuals, AOAC and IS methods',
  auditors: 'NABL assessors and FSSAI auditors',
  disciplines: [CHEM, MICRO],
  samplePrefix: 'FD',
  batchLabel: 'Lot / Batch',
  batchPlaceholder: 'e.g. TP-2609',
  refPlaceholder: 'e.g. PO-4471/2026',
  analysts: makeAnalysts([CHEM, MICRO], {
    senior: 'Senior Food Chemist',
    specialist: 'Microbiologist',
    analyst: 'Analyst',
    trainee: 'Trainee Analyst',
    manager: 'Technical Manager',
  }),
  customers: [
    c('cus-acme-foods', 'Acme Foods Pvt. Ltd.', 'Pune', 'Anita Desai', '27AABCA1234R1ZP', 'Plot 14, MIDC Bhosari, Pune, Maharashtra 411026', '101'),
    c('cus-krishna-agro', 'Krishna Agro Exports', 'Karnal', 'Gurpreet Singh', '06AAFCK5678Q1ZK', 'GT Road, Industrial Area, Karnal, Haryana 132001', '102'),
    c('cus-shwet-dhara', 'Shwet Dhara Milk Producers', 'Anand', 'Kiran Shah', '24AABCS9012M1ZT', 'Vallabh Vidyanagar Road, Anand, Gujarat 388001', '103'),
    c('cus-unjha-spice', 'Unjha Spice Traders', 'Unjha', 'Suresh Patel', '24AAFCU3456L1ZQ', 'APMC Market Yard, Unjha, Gujarat 384170', '104'),
    c('cus-golden-oils', 'Golden Harvest Edible Oils', 'Indore', 'Meera Iyer', '23AABCG7890K1ZV', 'Sector F, Sanwer Road, Indore, Madhya Pradesh 452015', '105'),
  ],
  categories: [
    {
      category: 'Spices & Condiments',
      products: ['Turmeric Powder', 'Red Chilli Powder', 'Cumin Seeds'],
      defaultUnit: 'g',
      parameters: [
        p('Moisture', 'IS 1797:1985', 'NMT 10.0%', CHEM, 450, 2),
        p('Total Ash', 'IS 1797:1985', 'NMT 9.0%', CHEM, 500, 2),
        p('Aflatoxin B1', 'AOAC 991.31', 'NMT 10 µg/kg', CHEM, 2400, 4),
        p('Pesticide Residues (LC-MS/MS)', 'AOAC 2007.01', 'Within FSSR MRLs', CHEM, 5500, 5),
        p('Salmonella', 'IS 5887 (Part 3)', 'Absent in 25 g', MICRO, 1200, 5),
      ],
    },
    {
      category: 'Milk & Dairy',
      products: ['Raw Whole Milk', 'Skimmed Milk Powder', 'Paneer'],
      defaultUnit: 'ml',
      parameters: [
        p('Milk Fat', 'FSSAI Manual (Milk)', 'NLT 3.2%', CHEM, 400, 1),
        p('Solids-not-Fat (SNF)', 'FSSAI Manual (Milk)', 'NLT 8.3%', CHEM, 400, 1),
        p('Aflatoxin M1', 'AOAC 2000.08', 'NMT 0.5 µg/kg', CHEM, 2600, 4),
        p('Total Plate Count', 'IS 5402 (Part 1)', 'NMT 3 × 10⁴ CFU/mL', MICRO, 900, 3),
        p('Coliform Count', 'IS 5401 (Part 1)', 'NMT 10 CFU/mL', MICRO, 900, 3),
      ],
    },
    {
      category: 'Cereals & Pulses',
      products: ['Basmati Rice (Export Lot)', 'Wheat Grains', 'Tur Dal'],
      defaultUnit: 'kg',
      parameters: [
        p('Moisture', 'FSSAI Manual (Cereals)', 'NMT 14.0%', CHEM, 450, 2),
        p('Foreign Matter', 'FSSAI Manual (Cereals)', 'NMT 1.0%', CHEM, 350, 1),
        p('Pesticide Residues (GC-MS/MS)', 'AOAC 2007.01', 'Within FSSR MRLs', CHEM, 5500, 5),
        p('Aflatoxin B1', 'AOAC 991.31', 'NMT 10 µg/kg', CHEM, 2400, 4),
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
    instrument('ins-lcmsms', 'LC-MS/MS', 'Calibrated', 32),
    instrument('ins-gcmsms', 'GC-MS/MS', 'Calibrated', 51),
    instrument('ins-icpms', 'ICP-MS', 'Calibration due', 358),
    instrument('ins-elisa', 'ELISA Reader', 'Calibrated', 18),
    instrument('ins-kjeldahl', 'Kjeldahl Distillation Unit', 'Calibrated', 75),
    instrument('ins-muffle', 'Muffle Furnace', 'Breakdown', 120),
  ],
  materials: [
    material('mat-iac', 'Aflatoxin immunoaffinity columns', 'In stock', '25 columns'),
    material('mat-pca', 'Plate Count Agar', 'Low stock', '250 g'),
    material('mat-pest-crm', 'Pesticide mix CRM', 'In stock', '3 ampoules'),
    material('mat-pet-ether', 'Petroleum ether (40–60 °C)', 'In stock', '6 L'),
  ],
  history: [
    h('cus-acme-foods', 'PO-4471/2026', [s('Spices & Condiments', 'Turmeric Powder', '500', 'g', 'TP-2609', ['Moisture', 'Total Ash', 'Aflatoxin B1'])]),
    h('cus-shwet-dhara', 'SD/QA/2210', [s('Milk & Dairy', 'Raw Whole Milk', '500', 'ml', 'BMC-Tanker 14', ['Milk Fat', 'Solids-not-Fat (SNF)', 'Total Plate Count'])]),
    h('cus-krishna-agro', 'EXP/2026/0932', [s('Cereals & Pulses', 'Basmati Rice (Export Lot)', '2', 'kg', 'BR-EU-118', ['Pesticide Residues (GC-MS/MS)', 'Aflatoxin B1', 'Moisture'])]),
    h('cus-unjha-spice', 'UST/LOT/77', [
      s('Spices & Condiments', 'Red Chilli Powder', '1', 'kg', 'RC-1022', ['Moisture', 'Aflatoxin B1', 'Pesticide Residues (LC-MS/MS)']),
      s('Spices & Condiments', 'Cumin Seeds', '500', 'g', 'CS-0871', ['Moisture', 'Salmonella']),
    ]),
    h('cus-golden-oils', 'GHO/QA/118', [s('Edible Oils', 'Mustard Oil', '500', 'ml', 'MO-5531', ['Acid Value', 'Peroxide Value', 'Iodine Value'])]),
    h('cus-shwet-dhara', 'SD/QA/2174', [s('Milk & Dairy', 'Skimmed Milk Powder', '500', 'g', 'SMP-0911', ['Milk Fat', 'Solids-not-Fat (SNF)', 'Aflatoxin M1', 'Coliform Count'])]),
    h('cus-krishna-agro', 'EXP/2026/0904', [s('Cereals & Pulses', 'Wheat Grains', '2', 'kg', 'WH-3307', ['Moisture', 'Foreign Matter'])]),
    h('cus-acme-foods', 'PO-4302/2026', [s('Spices & Condiments', 'Cumin Seeds', '250', 'g', 'CS-0790', ['Moisture', 'Total Ash'])]),
  ],
  presets: {
    customerId: 'cus-acme-foods',
    rows: [
      row('Spices & Condiments', 'Turmeric Powder', '500', 'TP-2611'),
      row('Milk & Dairy', 'Raw Whole Milk', '500', 'BMC-Tanker 09'),
    ],
    tests: {
      'Spices & Condiments': ['Moisture', 'Total Ash', 'Aflatoxin B1'],
      'Milk & Dairy': ['Milk Fat', 'Aflatoxin M1', 'Total Plate Count'],
      'Cereals & Pulses': ['Moisture', 'Pesticide Residues (GC-MS/MS)'],
      'Edible Oils': ['Acid Value', 'Peroxide Value'],
    },
    receiptMode: 'Courier',
    customerRef: 'PO-5120/2026',
  },
};
