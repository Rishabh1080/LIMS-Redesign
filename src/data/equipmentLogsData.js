// Seed data for the Equipment Log module.
//
// An "equipment log" records which instrument was used while testing a specific
// sample (and, optionally, a specific parameter of that sample). A log is
// "ongoing" once it has been started but not yet finished — i.e. it has no
// end time / test value. Once the operator records the reading and finishes it,
// the log becomes a "recorded" entry in the main listing.

// Product + batch catalog the "New log" search/dropdown pulls from. Each
// product carries the batches that belong to it so the Batch No. field can be
// scoped to the chosen product.
export const equipmentLogProducts = [
  {
    value: 'prod-paracetamol',
    label: 'Paracetamol IP',
    batches: ['PCM-2026-014', 'PCM-2026-021', 'PCM-2026-033'],
  },
  {
    value: 'prod-ibuprofen',
    label: 'Ibuprofen BP',
    batches: ['IBU-2026-007', 'IBU-2026-012'],
  },
  {
    value: 'prod-metformin',
    label: 'Metformin HCl',
    batches: ['MET-2026-002', 'MET-2026-019', 'MET-2026-028'],
  },
  {
    value: 'prod-amoxicillin',
    label: 'Amoxicillin Trihydrate',
    batches: ['AMX-2026-005', 'AMX-2026-016'],
  },
  {
    value: 'prod-azithromycin',
    label: 'Azithromycin Dihydrate',
    batches: ['AZI-2026-009', 'AZI-2026-022'],
  },
  {
    value: 'prod-cetirizine',
    label: 'Cetirizine Hydrochloride',
    batches: ['CET-2026-003', 'CET-2026-018'],
  },
];

// Instruments the "New log" form can attribute a run to. Values mirror the
// instrument catalog used elsewhere in the app so names stay consistent.
export const equipmentLogInstruments = [
  { value: 'inst-001', label: 'Stabinger Viscometer' },
  { value: 'inst-002', label: 'UV-Vis Spectrophotometer' },
  { value: 'inst-003', label: 'Gas Chromatograph' },
  { value: 'inst-004', label: 'Atomic Absorption Spectrometer' },
  { value: 'inst-005', label: 'pH Meter' },
];

export function getBatchesForProduct(productValue) {
  const product = equipmentLogProducts.find((item) => item.value === productValue);
  return product?.batches ?? [];
}

export function getInstrumentLabel(instrumentValue) {
  const instrument = equipmentLogInstruments.find((item) => item.value === instrumentValue);
  return instrument?.label ?? instrumentValue ?? '';
}

// Users a log can be attributed to ("Done by").
export const equipmentLogUsers = [
  'Rishabh Gangwar',
  'Deepak Cybit',
  'Priya Nair',
  'Anita Desai',
  'Ravi Sharma',
  'Amit Patel',
];

export function getTodayDisplayDate() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  return `${day}/${month}/${year}`;
}

// Columns for the bulk-upload editable table. Every field is required.
export const EQUIPMENT_LOG_BULK_COLUMNS = [
  { key: 'instrument', label: 'Instrument', type: 'dropdown' },
  { key: 'product', label: 'Product', type: 'product' },
  { key: 'batchNo', label: 'Batch No', type: 'batch' },
  { key: 'startTime', label: 'Start Time', type: 'time' },
  { key: 'endTime', label: 'End Time', type: 'time' },
  { key: 'testValue', label: 'Test Value', type: 'text' },
  { key: 'doneBy', label: 'Done by', type: 'user' },
];

let bulkRowSeq = 0;

export function createEquipmentLogBulkRow(doneBy = '') {
  bulkRowSeq += 1;
  return {
    id: `bulk-row-${Date.now()}-${bulkRowSeq}`,
    instrument: '',
    product: '',
    batchNo: '',
    startTime: '',
    endTime: '',
    testValue: '',
    doneBy,
  };
}

export function getProductLabel(productValue) {
  const product = equipmentLogProducts.find((item) => item.value === productValue);
  return product?.label ?? productValue ?? '';
}

// Ongoing logs: started but not finished. No endTime / testValue yet.
export const initialOngoingLogs = [
  {
    id: 'LOG-ONGOING-001',
    date: '14/10/2026',
    startTime: '09:12',
    instrumentValue: 'inst-003',
    instrumentName: 'Gas Chromatograph',
    productValue: 'prod-ibuprofen',
    productName: 'Ibuprofen BP',
    batchNo: 'IBU-2026-012',
    doneBy: 'Rishabh Gangwar',
  },
  {
    id: 'LOG-ONGOING-002',
    date: '14/10/2026',
    startTime: '10:40',
    instrumentValue: 'inst-005',
    instrumentName: 'pH Meter',
    productValue: 'prod-metformin',
    productName: 'Metformin HCl',
    batchNo: 'MET-2026-019',
    doneBy: 'Priya Nair',
  },
];

// Recorded logs: fully completed entries shown in the main table.
export const initialRecordedLogs = [
  {
    id: 'LOG-2026-0001',
    date: '13/10/2026',
    startTime: '08:55',
    endTime: '09:40',
    instrumentValue: 'inst-001',
    instrumentName: 'Stabinger Viscometer',
    productValue: 'prod-paracetamol',
    productName: 'Paracetamol IP',
    batchNo: 'PCM-2026-014',
    testValue: '99.4 %',
    doneBy: 'Rishabh Gangwar',
  },
  {
    id: 'LOG-2026-0002',
    date: '13/10/2026',
    startTime: '11:20',
    endTime: '12:05',
    instrumentValue: 'inst-004',
    instrumentName: 'Atomic Absorption Spectrometer',
    productValue: 'prod-amoxicillin',
    productName: 'Amoxicillin Trihydrate',
    batchNo: 'AMX-2026-005',
    testValue: '101.2 %',
    doneBy: 'Deepak Cybit',
  },
  {
    id: 'LOG-2026-0003',
    date: '12/10/2026',
    startTime: '14:05',
    endTime: '15:10',
    instrumentValue: 'inst-003',
    instrumentName: 'Gas Chromatograph',
    productValue: 'prod-azithromycin',
    productName: 'Azithromycin Dihydrate',
    batchNo: 'AZI-2026-009',
    testValue: '98.7 %',
    doneBy: 'Priya Nair',
  },
  {
    id: 'LOG-2026-0004',
    date: '12/10/2026',
    startTime: '09:30',
    endTime: '10:02',
    instrumentValue: 'inst-002',
    instrumentName: 'UV-Vis Spectrophotometer',
    productValue: 'prod-cetirizine',
    productName: 'Cetirizine Hydrochloride',
    batchNo: 'CET-2026-018',
    testValue: '100.1 %',
    doneBy: 'Anita Desai',
  },
  {
    id: 'LOG-2026-0005',
    date: '11/10/2026',
    startTime: '13:15',
    endTime: '14:00',
    instrumentValue: 'inst-005',
    instrumentName: 'pH Meter',
    productValue: 'prod-paracetamol',
    productName: 'Paracetamol IP',
    batchNo: 'PCM-2026-033',
    testValue: '99.9 %',
    doneBy: 'Rishabh Gangwar',
  },
  {
    id: 'LOG-2026-0006',
    date: '10/10/2026',
    startTime: '10:10',
    endTime: '10:48',
    instrumentValue: 'inst-001',
    instrumentName: 'Stabinger Viscometer',
    productValue: 'prod-metformin',
    productName: 'Metformin HCl',
    batchNo: 'MET-2026-002',
    testValue: '97.8 %',
    doneBy: 'Deepak Cybit',
  },
];
