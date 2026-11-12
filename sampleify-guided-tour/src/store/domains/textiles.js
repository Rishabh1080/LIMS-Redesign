import { c, h, instrument, makeAnalysts, material, p, row, s } from './shared';

const PHYS = 'Physical';
const CHEM = 'Chemical';

export default {
  id: 'textiles',
  label: 'Textiles & Apparel',
  tag: 'Textiles',
  labNoun: 'textile testing lab',
  tileLine: 'Yarn, fabric, carpets and garments',
  standards: 'IS · ISO 105 · AATCC',
  methodsLine: 'IS, ISO and AATCC methods',
  auditors: 'NABL assessors and buyer auditors',
  disciplines: [PHYS, CHEM],
  samplePrefix: 'TEX',
  batchLabel: 'Lot No.',
  batchPlaceholder: 'e.g. LOT-2207',
  refPlaceholder: 'e.g. Buyer PO or style no.',
  analysts: makeAnalysts([PHYS, CHEM], {
    senior: 'Senior Textile Technologist',
    specialist: 'Textile Chemist',
    analyst: 'Lab Technician',
    trainee: 'Trainee Technician',
    manager: 'Technical Manager',
  }),
  customers: [
    c('cus-acme-textiles', 'Acme Textiles Pvt. Ltd.', 'Ahmedabad', 'Anita Desai', '24AABCA1234R1ZP', '12 Textile Estate, Ahmedabad, Gujarat 380001', '601'),
    c('cus-bhadohi-carpets', 'Bhadohi Carpet Exports', 'Bhadohi', 'Imtiaz Ansari', '09AAFCB5678Q1ZK', 'Carpet Zone, Bhadohi, Uttar Pradesh 221401', '602'),
    c('cus-tiruppur-knits', 'Tiruppur Knit Garments', 'Tiruppur', 'Kavya Raman', '33AABCT9012M1ZT', 'Avinashi Road, Tiruppur, Tamil Nadu 641603', '603'),
    c('cus-panipat-home', 'Panipat Home Furnishings', 'Panipat', 'Rohan Mehta', '06AAFCP3456L1ZQ', 'Sector 29, HSIIDC, Panipat, Haryana 132103', '604'),
    c('cus-surat-synthetics', 'Surat Synthetics LLP', 'Surat', 'Harsh Patel', '24AAFCS7890K1ZV', 'Sachin GIDC, Surat, Gujarat 394230', '605'),
  ],
  categories: [
    {
      category: 'Yarn',
      products: ['Cotton Yarn 40s Ne Combed', 'Polyester Spun Yarn 30s Ne', 'Viscose Yarn 30s Ne'],
      defaultUnit: 'g',
      parameters: [
        p('Yarn Count', 'IS 1315', 'Nominal ± 2%', PHYS, 650, 2),
        p('Single Yarn Strength', 'IS 1670', 'Report value (cN/tex)', PHYS, 850, 2),
        p('Twist per Inch', 'IS 832', 'Nominal ± 5%', PHYS, 600, 2),
        p('Moisture Regain', 'IS 6359', 'Report value (%)', CHEM, 500, 1),
      ],
    },
    {
      category: 'Fabric',
      products: ['Cotton Twill Fabric', 'Polyester Knit Fabric', 'Denim 12 oz'],
      defaultUnit: 'g',
      parameters: [
        p('Mass per Unit Area (GSM)', 'IS 1964', 'Declared ± 5%', PHYS, 400, 1),
        p('Tensile Strength (Grab)', 'ISO 13934-2', 'Report value (N)', PHYS, 900, 2),
        p('Dimensional Change after Washing', 'ISO 6330 / ISO 5077', 'Within ± 3%', PHYS, 900, 3),
        p('Colour Fastness to Washing', 'IS/ISO 105-C10', 'Grade 4 or better', CHEM, 1050, 3),
        p('Colour Fastness to Rubbing', 'IS/ISO 105-X12', 'Dry 4, wet 3 or better', CHEM, 700, 2),
        p('pH of Aqueous Extract', 'ISO 3071', '4.0–7.5', CHEM, 500, 1),
      ],
    },
    {
      category: 'Carpets & Rugs',
      products: ['Hand Knotted Woollen Carpet', 'Hand Tufted Rug', 'Cotton Dhurrie'],
      defaultUnit: 'Units',
      parameters: [
        p('Pile Thickness', 'ISO 1765', 'Report value (mm)', PHYS, 900, 2),
        p('Tuft Withdrawal Force', 'ISO 4919', 'NLT 10 N', PHYS, 1200, 3),
        p('Colour Fastness to Light', 'ISO 105-B02', 'Grade 4 or better', CHEM, 1800, 5),
        p('Surface Flammability', '16 CFR Part 1630', 'Pass (7 of 8 specimens)', PHYS, 3800, 5),
      ],
    },
    {
      category: 'Garments',
      products: ['Cotton T-shirt', 'Kids Wear Romper', 'Men’s Formal Shirt'],
      defaultUnit: 'Units',
      parameters: [
        p('Fibre Composition', 'ISO 1833', 'As labelled ± 3%', CHEM, 1200, 3),
        p('Free Formaldehyde', 'ISO 14184-1', 'NMT 75 mg/kg', CHEM, 1500, 3),
        p('Banned Azo Amines', 'ISO 14362-1', 'Not detected (< 30 mg/kg)', CHEM, 3500, 5),
        p('Seam Slippage', 'ISO 13936-2', 'NMT 6 mm', PHYS, 800, 2),
      ],
    },
  ],
  instruments: [
    instrument('ins-tensile', 'Tensile Tester (CRE)', 'Calibrated', 39),
    instrument('ins-wrap', 'Wrap Reel & Balance', 'Calibrated', 70),
    instrument('ins-laundero', 'Launder-Ometer', 'Calibrated', 24),
    instrument('ins-crock', 'Crockmeter', 'Calibrated', 58),
    instrument('ins-xenon', 'Xenon Arc Light Fastness Tester', 'Calibration due', 357),
    instrument('ins-spectro', 'Colour Spectrophotometer', 'Breakdown', 112),
  ],
  materials: [
    material('mat-detergent', 'ECE reference detergent', 'In stock', '3 kg'),
    material('mat-multifibre', 'Multifibre adjacent fabric', 'Low stock', '2 m'),
    material('mat-greyscale', 'Grey scale for colour change', 'In stock', '2 sets'),
    material('mat-nash', 'Nash reagent (formaldehyde)', 'In stock', '1 L'),
  ],
  history: [
    h('cus-acme-textiles', 'ATPL/PO/4471', [s('Fabric', 'Cotton Twill Fabric', '500', 'g', 'LOT-2207', ['Mass per Unit Area (GSM)', 'Colour Fastness to Washing', 'pH of Aqueous Extract'])]),
    h('cus-tiruppur-knits', 'TKG/ST-2210', [s('Garments', 'Cotton T-shirt', '3', 'Units', 'Style TK-118', ['Seam Slippage', 'Fibre Composition', 'Free Formaldehyde'])]),
    h('cus-bhadohi-carpets', 'BCE/EXP/0932', [s('Carpets & Rugs', 'Hand Knotted Woollen Carpet', '1', 'Units', 'Design 4471', ['Pile Thickness', 'Colour Fastness to Light', 'Tuft Withdrawal Force'])]),
    h('cus-surat-synthetics', 'SS/LOT/77', [
      s('Yarn', 'Polyester Spun Yarn 30s Ne', '250', 'g', 'LOT-PS-1022', ['Yarn Count', 'Moisture Regain', 'Single Yarn Strength']),
      s('Fabric', 'Polyester Knit Fabric', '500', 'g', 'LOT-PK-0871', ['Mass per Unit Area (GSM)', 'Dimensional Change after Washing']),
    ]),
    h('cus-panipat-home', 'PHF/QA/118', [s('Carpets & Rugs', 'Cotton Dhurrie', '1', 'Units', 'Design 2208', ['Pile Thickness', 'Tuft Withdrawal Force', 'Surface Flammability'])]),
    h('cus-acme-textiles', 'ATPL/PO/4302', [s('Fabric', 'Denim 12 oz', '500', 'g', 'LOT-2151', ['Mass per Unit Area (GSM)', 'Tensile Strength (Grab)', 'Colour Fastness to Rubbing', 'Dimensional Change after Washing'])]),
    h('cus-surat-synthetics', 'SS/LOT/61', [s('Yarn', 'Viscose Yarn 30s Ne', '250', 'g', 'LOT-VS-0612', ['Yarn Count', 'Twist per Inch'])]),
    h('cus-tiruppur-knits', 'TKG/ST-2174', [s('Garments', 'Kids Wear Romper', '3', 'Units', 'Style TK-097', ['Seam Slippage', 'Free Formaldehyde'])]),
  ],
  presets: {
    customerId: 'cus-acme-textiles',
    rows: [
      row('Fabric', 'Cotton Twill Fabric', '500', 'LOT-2219'),
      row('Garments', 'Cotton T-shirt', '3', 'Style AT-204'),
    ],
    tests: {
      Yarn: ['Yarn Count', 'Single Yarn Strength'],
      Fabric: ['Mass per Unit Area (GSM)', 'Colour Fastness to Washing', 'pH of Aqueous Extract'],
      'Carpets & Rugs': ['Pile Thickness', 'Colour Fastness to Light'],
      Garments: ['Seam Slippage', 'Free Formaldehyde'],
    },
    receiptMode: 'Courier',
    customerRef: 'ATPL/PO/4520',
  },
};
