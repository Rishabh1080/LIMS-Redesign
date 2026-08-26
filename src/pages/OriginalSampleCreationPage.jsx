import { Fragment, memo, useEffect, useMemo, useRef, useState } from 'react';
import { trackEvent } from '../analytics/posthog';
import AppIcon from '../components/AppIcon';
import DataTable from '../components/DataTable';
import {
  FormElement,
  InputFieldDate,
  InputFieldFile,
  InputFieldRichDropdown,
  InputFieldSplitSelector,
  InputFieldText,
} from '../components/FormControls';
import Modal from '../components/Modal/Modal';
import NavSelector from '../components/NavSelector/NavSelector';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SampleCountStepper from '../components/SampleCountStepper';
import SecondaryButton from '../components/SecondaryButton';
import Stepper from '../components/Stepper/Stepper';
import { generateAutoFillData } from '../utils/bulkAutoFill';
import './new-sample-customer-details-page.scss';

const wizardSteps = ['Customer Details', 'Basic Details', 'Product Details', 'Additional Details'];

const sampleTypeOptions = [
  'Base',
  'ILC Sample',
  'PT Sample',
  'ILC Participation Sample',
  'Intralab Sample',
];

const requestReceivedModeOptions = ['In person', 'Courier', 'By Post'];
const categoryOptions = [
  'Cotton Yarn',
  'Hand Knotted',
  'Hand Tufted',
  'Handloom Carpet',
  'Jacket',
  'Jute Yarn',
  'Latex',
];
const tagOptions = ['Routine', 'Priority', 'Regulatory', 'Research'];
const sampleNotDrawnOptions = ['Yes', 'No', 'Not Applicable'];
const productOptionsByCategory = {
  'Cotton Yarn': ['Carded Cotton Yarn', 'Combed Cotton Yarn'],
  'Hand Knotted': ['Woollen Hand Knotted Carpet', 'Silk Hand Knotted Carpet'],
  'Hand Tufted': ['Woollen Tufted Carpet', 'Cotton Tufted Bath Mat'],
  'Handloom Carpet': ['Cotton Dhurry', 'Woollen Handloom Rug'],
  Jacket: ['Industrial Safety Jacket', 'Protective Textile Jacket'],
  'Jute Yarn': ['Single Jute Yarn', 'Twisted Jute Yarn'],
  Latex: ['Natural Rubber Latex', 'Synthetic Latex Compound'],
};
const parameterPresetsByCategory = {
  'Cotton Yarn': [
    { parameter: 'Yarn Count', method: 'IS 1315:1977', charges: '650', time: '3 days' },
    { parameter: 'Single Yarn Strength', method: 'IS 1670:1991', charges: '850', time: '4 days' },
    { parameter: 'Twist in Yarn', method: 'IS 832:1985', charges: '600', time: '3 days' },
  ],
  'Hand Knotted': [
    { parameter: 'Determination of Pile Thickness', method: 'IS 5884:2020', charges: '900', time: '4 days' },
    { parameter: 'Colour Fastness to Rubbing', method: 'IS ISO 105-X12:2016', charges: '1100', time: '5 days' },
    { parameter: 'Surface Flammability', method: '16 CFR Part 1630', charges: '3800', time: '7 days' },
  ],
  'Hand Tufted': [
    { parameter: 'Tuft Withdrawal Force', method: 'IS 11045:1984', charges: '1200', time: '5 days' },
    { parameter: 'Colour Fastness to Rubbing', method: 'IS ISO 105-X12:2016', charges: '1100', time: '5 days' },
    { parameter: 'Determination of Pile Thickness', method: 'IS 5884:2020', charges: '900', time: '4 days' },
  ],
  'Handloom Carpet': [
    { parameter: 'Mass per Unit Area', method: 'IS 1964:2001', charges: '700', time: '3 days' },
    { parameter: 'Dimensional Change', method: 'IS 10019:1981', charges: '950', time: '4 days' },
    { parameter: 'Colour Fastness to Washing', method: 'IS ISO 105-C10:2006', charges: '1050', time: '5 days' },
  ],
  Jacket: [
    { parameter: 'Tensile Strength', method: 'IS 1969:1985', charges: '1000', time: '4 days' },
    { parameter: 'Tear Strength', method: 'IS 6489:1971', charges: '1000', time: '4 days' },
    { parameter: 'Water Repellency', method: 'IS 390:1975', charges: '800', time: '3 days' },
  ],
  'Jute Yarn': [
    { parameter: 'Yarn Count', method: 'IS 9113:1979', charges: '650', time: '3 days' },
    { parameter: 'Breaking Load', method: 'IS 1670:1991', charges: '850', time: '4 days' },
    { parameter: 'Moisture Regain', method: 'IS 667:1981', charges: '750', time: '3 days' },
  ],
  Latex: [
    { parameter: 'Total Solids Content', method: 'IS 3708:1985', charges: '950', time: '3 days' },
    { parameter: 'Dry Rubber Content', method: 'IS 3708:1985', charges: '1100', time: '4 days' },
    { parameter: 'pH', method: 'IS 3708:1985', charges: '500', time: '2 days' },
  ],
};
const parameterOptions = [...new Set(
  Object.values(parameterPresetsByCategory).flat().map((item) => item.parameter),
)];
const testMethodOptions = [...new Set(
  Object.values(parameterPresetsByCategory).flat().map((item) => item.method),
)];

const initialCustomers = [
  {
    id: 'customer-acme-textiles',
    name: 'Acme Textiles',
    legalName: 'Acme Textiles Private Limited',
    contactPerson: 'Anita Desai',
    email: 'anita@acmetextiles.test',
    phone: '+91 98765 43210',
    billToAddress: '12 Textile Estate, Ahmedabad, Gujarat 380001',
    shipToAddress: '12 Textile Estate, Ahmedabad, Gujarat 380001',
    quotations: [
      { value: 'QTN-2026-0148', label: 'QTN-2026-0148 · Finished fabric testing' },
      { value: 'QTN-2026-0196', label: 'QTN-2026-0196 · Colour fastness package' },
    ],
  },
  {
    id: 'customer-nova-chemicals',
    name: 'Nova Chemicals',
    legalName: 'Nova Chemicals Limited',
    contactPerson: 'Rohan Mehta',
    email: 'rohan@novachemicals.test',
    phone: '+91 98111 22334',
    billToAddress: '48 Industrial Area, Pune, Maharashtra 411019',
    shipToAddress: 'Plot 8, Chemical Zone, Pune, Maharashtra 411019',
    quotations: [],
  },
  {
    id: 'customer-bharat-textile-works',
    name: 'Bharat Textile Works',
    legalName: 'Bharat Textile Works Private Limited',
    contactPerson: 'Kavita Sharma',
    email: 'kavita@bharattextile.test',
    phone: '+91 98250 11442',
    billToAddress: 'GIDC Textile Park, Surat, Gujarat 395010',
    shipToAddress: 'GIDC Textile Park, Surat, Gujarat 395010',
    quotations: [{ value: 'QTN-2026-0221', label: 'QTN-2026-0221 · Yarn testing package' }],
  },
  {
    id: 'customer-shakti-dyeing',
    name: 'Shakti Dyeing & Finishing',
    legalName: 'Shakti Dyeing and Finishing LLP',
    contactPerson: 'Harsh Patel',
    email: 'harsh@shaktidyeing.test',
    phone: '+91 97244 55710',
    billToAddress: 'Sachin Industrial Estate, Surat, Gujarat 394230',
    shipToAddress: 'Sachin Industrial Estate, Surat, Gujarat 394230',
    quotations: [],
  },
  {
    id: 'customer-ganga-carpets',
    name: 'Ganga Carpets',
    legalName: 'Ganga Carpets India Private Limited',
    contactPerson: 'Neeraj Tiwari',
    email: 'neeraj@gangacarpets.test',
    phone: '+91 94152 66218',
    billToAddress: 'Carpet City, Bhadohi, Uttar Pradesh 221401',
    shipToAddress: 'Industrial Area, Bhadohi, Uttar Pradesh 221401',
    quotations: [
      { value: 'QTN-2026-0238', label: 'QTN-2026-0238 · Carpet performance tests' },
      { value: 'QTN-2026-0244', label: 'QTN-2026-0244 · Flammability assessment' },
    ],
  },
  {
    id: 'customer-rajhans-handlooms',
    name: 'Rajhans Handlooms',
    legalName: 'Rajhans Handlooms Limited',
    contactPerson: 'Meenal Joshi',
    email: 'meenal@rajhanshandlooms.test',
    phone: '+91 98791 33420',
    billToAddress: 'Narol Textile Cluster, Ahmedabad, Gujarat 382405',
    shipToAddress: 'Narol Textile Cluster, Ahmedabad, Gujarat 382405',
    quotations: [],
  },
  {
    id: 'customer-kaveri-fibres',
    name: 'Kaveri Fibres',
    legalName: 'Kaveri Fibres and Filaments Private Limited',
    contactPerson: 'Arun Prasad',
    email: 'arun@kaverifibres.test',
    phone: '+91 98401 67211',
    billToAddress: 'SIPCOT Industrial Estate, Hosur, Tamil Nadu 635126',
    shipToAddress: 'SIPCOT Industrial Estate, Hosur, Tamil Nadu 635126',
    quotations: [{ value: 'QTN-2026-0257', label: 'QTN-2026-0257 · Fibre composition analysis' }],
  },
  {
    id: 'customer-arya-protective-textiles',
    name: 'Arya Protective Textiles',
    legalName: 'Arya Protective Textiles Private Limited',
    contactPerson: 'Sonal Kulkarni',
    email: 'sonal@aryaprotective.test',
    phone: '+91 97662 48031',
    billToAddress: 'MIDC Bhosari, Pune, Maharashtra 411026',
    shipToAddress: 'MIDC Bhosari, Pune, Maharashtra 411026',
    quotations: [],
  },
  {
    id: 'customer-deccan-latex',
    name: 'Deccan Latex Industries',
    legalName: 'Deccan Latex Industries Limited',
    contactPerson: 'Faizal Rahman',
    email: 'faizal@deccanlatex.test',
    phone: '+91 94470 21863',
    billToAddress: 'Industrial Development Area, Kochi, Kerala 683501',
    shipToAddress: 'Rubber Park, Irapuram, Kerala 683541',
    quotations: [
      { value: 'QTN-2026-0273', label: 'QTN-2026-0273 · Latex quality assessment' },
    ],
  },
  {
    id: 'customer-sarvodaya-yarns',
    name: 'Sarvodaya Yarns',
    legalName: 'Sarvodaya Yarns Private Limited',
    contactPerson: 'Ritesh Agarwal',
    email: 'ritesh@sarvodayayarns.test',
    phone: '+91 98310 45028',
    billToAddress: 'Budge Budge Trunk Road, Kolkata, West Bengal 700141',
    shipToAddress: 'Jute Mill Compound, Howrah, West Bengal 711102',
    quotations: [],
  },
  {
    id: 'customer-vindhya-chemicals',
    name: 'Vindhya Chemicals',
    legalName: 'Vindhya Chemicals and Minerals Limited',
    contactPerson: 'Priya Dubey',
    email: 'priya@vindhyachemicals.test',
    phone: '+91 93021 88574',
    billToAddress: 'Mandideep Industrial Area, Raisen, Madhya Pradesh 462046',
    shipToAddress: 'Mandideep Industrial Area, Raisen, Madhya Pradesh 462046',
    quotations: [],
  },
  {
    id: 'customer-punjab-spinning-mills',
    name: 'Punjab Spinning Mills',
    legalName: 'Punjab Spinning Mills Private Limited',
    contactPerson: 'Gurpreet Singh',
    email: 'gurpreet@punjabspinning.test',
    phone: '+91 98140 55932',
    billToAddress: 'Focal Point, Ludhiana, Punjab 141010',
    shipToAddress: 'Focal Point, Ludhiana, Punjab 141010',
    quotations: [{ value: 'QTN-2026-0291', label: 'QTN-2026-0291 · Cotton yarn compliance' }],
  },
  {
    id: 'customer-narmada-fabrics',
    name: 'Narmada Fabrics',
    legalName: 'Narmada Fabrics India Limited',
    contactPerson: 'Dhwani Shah',
    email: 'dhwani@narmadafabrics.test',
    phone: '+91 98980 77516',
    billToAddress: 'Pandesara GIDC, Surat, Gujarat 394221',
    shipToAddress: 'Pandesara GIDC, Surat, Gujarat 394221',
    quotations: [],
  },
  {
    id: 'customer-uday-rugs',
    name: 'Uday Rugs & Furnishings',
    legalName: 'Uday Rugs and Furnishings Private Limited',
    contactPerson: 'Amit Mishra',
    email: 'amit@udayrugs.test',
    phone: '+91 94512 36008',
    billToAddress: 'Maryadpatti, Bhadohi, Uttar Pradesh 221401',
    shipToAddress: 'Export Promotion Industrial Park, Bhadohi, Uttar Pradesh 221401',
    quotations: [],
  },
  {
    id: 'customer-sahyadri-polymers',
    name: 'Sahyadri Polymers',
    legalName: 'Sahyadri Polymers Private Limited',
    contactPerson: 'Nikhil Deshmukh',
    email: 'nikhil@sahyadripolymers.test',
    phone: '+91 99221 40865',
    billToAddress: 'Taloja MIDC, Navi Mumbai, Maharashtra 410208',
    shipToAddress: 'Taloja MIDC, Navi Mumbai, Maharashtra 410208',
    quotations: [{ value: 'QTN-2026-0310', label: 'QTN-2026-0310 · Polymer and latex tests' }],
  },
  {
    id: 'customer-mysore-silk-house',
    name: 'Mysore Silk House',
    legalName: 'Mysore Silk House Private Limited',
    contactPerson: 'Lakshmi Rao',
    email: 'lakshmi@mysoresilk.test',
    phone: '+91 98452 11890',
    billToAddress: 'Industrial Suburb, Mysuru, Karnataka 570008',
    shipToAddress: 'Industrial Suburb, Mysuru, Karnataka 570008',
    quotations: [],
  },
  {
    id: 'customer-eastern-jute-company',
    name: 'Eastern Jute Company',
    legalName: 'Eastern Jute Company Limited',
    contactPerson: 'Sourav Banerjee',
    email: 'sourav@easternjute.test',
    phone: '+91 98305 61277',
    billToAddress: 'Strand Road, Kolkata, West Bengal 700001',
    shipToAddress: 'Bally Industrial Estate, Howrah, West Bengal 711201',
    quotations: [],
  },
];

const emptyCustomerDraft = {
  name: '',
  legalName: '',
  contactPerson: '',
  email: '',
  phone: '',
  billToAddress: '',
  shipToAddress: '',
};

function getTodayDisplayDate() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');

  return `${day}/${month}/${today.getFullYear()}`;
}

function createInitialFormValues() {
  return {
    sampleType: 'Base',
    receivingDate: getTodayDisplayDate(),
    customerId: '',
    customerQuotation: '',
    customerAddress: '',
    reportNumber: '',
    sendersSpecification: null,
    sampleNotDrawn: '',
    batchNumber: '',
    expiryDate: '',
    manufacturingDate: '',
    manufacturingLicenceNumber: '',
    originalManufacturerName: '',
    referenceNumber: '',
    receiptMode: '',
    tentativeReportingDate: '',
    amount: '',
    receivedBy: '',
  };
}

function getParameterPreset(category, product) {
  const presets = parameterPresetsByCategory[category] ?? [];
  const productIndex = Math.max(0, (productOptionsByCategory[category] ?? []).indexOf(product));

  if (presets.length <= 2) return presets;

  return [presets[productIndex % presets.length], presets[(productIndex + 1) % presets.length]];
}

function createId(prefix) {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function createParameterRow(seed = {}) {
  return {
    id: createId('parameter'),
    parameter: '',
    method: '',
    charges: '',
    time: '',
    ...seed,
  };
}

function createProduct(seed = {}) {
  return {
    id: createId('product'),
    category: '',
    tag: '',
    product: '',
    description: '',
    quantity: '',
    sampleSize: { value: '', unit: '' },
    quality: '',
    identificationMark: '',
    condition: '',
    imageUpload: null,
    parameters: [createParameterRow()],
    ...seed,
  };
}

function getSampleDisplayName(sample) {
  return sample?.id || 'New Sample';
}

function createBulkParameterRow(seed = {}) {
  return {
    id: createId('bulk-parameter'),
    parameter: '',
    method: '',
    charges: '',
    time: '',
    ...seed,
  };
}

const bulkParameterAutoFillRows = [
  { parameter: 'Yarn Count', method: 'IS 1315:1977', charges: '650', time: '3 days' },
  { parameter: 'Single Yarn Strength', method: 'IS 1670:1991', charges: '850', time: '4 days' },
  { parameter: 'Twist in Yarn', method: 'IS 832:1985', charges: '600', time: '3 days' },
];

function createBulkRow(seed = {}) {
  return {
    id: createId('bulk-row'),
    category: '',
    product: '',
    sampleSize: { value: '', unit: '' },
    reportNumber: '',
    customerRef: '',
    sampleDrawnBy: '',
    natureOfSample: '',
    specification: '',
    stampedBy: '',
    heatNo: '',
    poNo: '',
    make: '',
    poSrNo: '',
    refDate: '',
    parameters: [createBulkParameterRow()],
    ...seed,
  };
}

const bulkCategoryOptions = ['Pharma', 'Non-Pharma', 'R&D'];
const bulkProductOptions = ['Pharma', 'Non-Pharma', 'R&D'];
const bulkSampleSizeUnitOptions = ['g', 'kg', 'mg', 'ml', 'L', 'Units'];
const requiredBulkColumnKeys = new Set(['category', 'product', 'reportNumber']);

const bulkColumns = [
  { key: 'category', label: 'Category', width: 146 },
  { key: 'product', label: 'Product', width: 146 },
  { key: 'parameters', label: 'Parameters', width: 124, type: 'parameters' },
  { key: 'reportNumber', label: 'Report No.', width: 174 },
  { key: 'customerRef', label: 'Customer Ref.', width: 146 },
  { key: 'sampleDrawnBy', label: 'Sample Drawn By', width: 146 },
  { key: 'natureOfSample', label: '#Nature of Sample', width: 156 },
  { key: 'specification', label: '#Specification', width: 146 },
  { key: 'stampedBy', label: 'Stamped By', width: 130 },
  { key: 'heatNo', label: '#Heat No', width: 119 },
  { key: 'poNo', label: '#PO No.', width: 119 },
  { key: 'make', label: '#Make', width: 119 },
  { key: 'poSrNo', label: 'PO Sr No.', width: 119 },
  { key: 'refDate', label: 'Ref. Date', width: 146 },
  { key: 'sampleSize', label: 'Sample Size', width: 190, type: 'sample-size' },
];

const REPORT_NUMBER_YEAR = '2026';
const duplicateBulkColumnKeys = bulkColumns
  .map(({ key }) => key)
  .filter((key) => !['parameters', 'reportNumber'].includes(key));

function formatReportNumber(sequence) {
  return `IICT/${REPORT_NUMBER_YEAR}/${String(sequence).padStart(4, '0')}`;
}

function findDuplicateBulkRowIds(rows) {
  const signatures = new Map();
  const duplicateIds = new Set();

  rows.forEach((row) => {
    const values = duplicateBulkColumnKeys.map((key) => {
      const value = row[key];
      if (value && typeof value === 'object') {
        return JSON.stringify(
          Object.fromEntries(
            Object.entries(value).map(([nestedKey, nestedValue]) => (
              [nestedKey, String(nestedValue ?? '').trim()]
            )),
          ),
        );
      }
      return String(value ?? '').trim();
    });
    if (values.every((value) => value === '' || value === '{"value":"","unit":""}')) return;

    const parameterValues = (row.parameters ?? []).map(({ id: _id, ...parameter }) => (
      Object.fromEntries(
        Object.entries(parameter).map(([key, value]) => [key, String(value ?? '').trim()]),
      )
    ));
    const signature = JSON.stringify([...values, parameterValues]);
    const matchingIds = signatures.get(signature) ?? [];
    matchingIds.forEach((id) => duplicateIds.add(id));
    if (matchingIds.length) duplicateIds.add(row.id);
    signatures.set(signature, [...matchingIds, row.id]);
  });

  return duplicateIds;
}

const bulkActionColumnWidth = 120;
const bulkTableWidth = 56
  + bulkColumns.reduce((total, column) => total + column.width, 0)
  + bulkActionColumnWidth;

const BulkSampleParameterDetails = memo(function BulkSampleParameterDetails({
  row,
  rowIndex,
  onParameterChange,
  onAddParameter,
  onDeleteParameter,
  onAutoFillParameters,
}) {
  const parameters = row.parameters ?? [];

  const renderDropdown = (parameter, field, options, placeholder) => (
    <InputFieldRichDropdown
      variant="table-cell"
      aria-label={`${placeholder} ${parameters.indexOf(parameter) + 1} for sample ${rowIndex + 1}`}
      value={parameter[field] || ''}
      options={options}
      placeholder={placeholder}
      searchable
      onChange={(event) => onParameterChange(row.id, parameter.id, field, event.target.value)}
    />
  );

  const renderText = (parameter, field, label, placeholder = '') => (
    <InputFieldText
      variant="table-cell"
      aria-label={`${label} ${parameters.indexOf(parameter) + 1} for sample ${rowIndex + 1}`}
      value={parameter[field] || ''}
      placeholder={placeholder}
      onChange={(event) => onParameterChange(row.id, parameter.id, field, event.target.value)}
    />
  );

  return (
    <section
      id={`bulk-row-${row.id}-details`}
      className="smplfy-bulk-parameter-panel"
      aria-label={`Parameter and testing details for sample ${rowIndex + 1}`}
    >
      <div className="smplfy-bulk-parameter-panel-header">
        <h3>Testing details</h3>
        <div className="smplfy-bulk-parameter-panel-header-actions">
          <SecondaryButton
            size="small"
            leftIcon="plus"
            onClick={() => onAddParameter(row.id)}
          >
            Parameter
          </SecondaryButton>
          <PrimaryButton
            size="small"
            leftIcon="refresh"
            disabled={!row.category || !row.product}
            onClick={() => onAutoFillParameters(row.id)}
          >
            Auto-fill parameters
          </PrimaryButton>
        </div>
      </div>
      <div className="smplfy-bulk-parameter-table-wrap">
        <table className="smplfy-bulk-parameter-table">
          <caption className="visually-hidden">Testing parameters for sample {rowIndex + 1}</caption>
          <colgroup>
            <col className="smplfy-bulk-parameter-serial-col" />
            <col className="smplfy-bulk-parameter-name-col" />
            <col className="smplfy-bulk-parameter-method-col" />
            <col className="smplfy-bulk-parameter-charge-col" />
            <col className="smplfy-bulk-parameter-time-col" />
            <col className="smplfy-bulk-parameter-action-col" />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">Sr no.</th>
              <th scope="col">Parameter</th>
              <th scope="col">Test method</th>
              <th scope="col">Charges</th>
              <th scope="col">Est. time</th>
              <th scope="col"><span className="visually-hidden">Action</span></th>
            </tr>
          </thead>
          <tbody>
            {parameters.map((parameter, parameterIndex) => (
              <tr key={parameter.id}>
                <th scope="row">{parameterIndex + 1}</th>
                <td>{renderDropdown(parameter, 'parameter', parameterOptions, 'Select parameter')}</td>
                <td>{renderDropdown(parameter, 'method', testMethodOptions, 'Select test method')}</td>
                <td>{renderText(parameter, 'charges', 'Charges', '0.00')}</td>
                <td>{renderText(parameter, 'time', 'Estimated time', 'e.g. 3 days')}</td>
                <td>
                  <SecondaryButton
                    size="small"
                    tone="danger"
                    leftIcon="trash"
                    aria-label={`Delete parameter ${parameterIndex + 1} from sample ${rowIndex + 1}`}
                    disabled={parameters.length === 1}
                    onClick={() => onDeleteParameter(row.id, parameter.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
});

function BulkSampleTable({
  rows,
  errors,
  canUndoAutoFill,
  onRowChange,
  onRowCountChange,
  onAddRow,
  canPasteRow,
  onCopyRow,
  onPasteRow,
  onDeleteRow,
  onParameterChange,
  onAddParameter,
  onDeleteParameter,
  onAutoFillParameters,
  onAutoFill,
  onUndoAutoFill,
}) {
  const headerViewportRef = useRef(null);
  const viewportRef = useRef(null);
  const tableRef = useRef(null);
  const horizontalTrackRef = useRef(null);
  const scrollbarDragRef = useRef(null);
  const touchRef = useRef(null);
  const [expandedRowId, setExpandedRowId] = useState(() => rows[0]?.id ?? null);
  const [activeSuggestionCell, setActiveSuggestionCell] = useState(null);
  const lastColumnValuesRef = useRef({});
  const [scrollMetrics, setScrollMetrics] = useState({
    left: 0,
    clientWidth: 0,
    scrollWidth: 0,
    horizontalTrackSize: 0,
  });

  useEffect(() => {
    const viewport = viewportRef.current;
    const table = tableRef.current;

    if (!viewport) {
      return undefined;
    }

    const updateMetrics = () => {
      if (headerViewportRef.current) {
        headerViewportRef.current.scrollLeft = viewport.scrollLeft;
      }

      const viewportWidth = `${viewport.clientWidth}px`;
      if (viewport.style.getPropertyValue('--smplfy-bulk-viewport-width') !== viewportWidth) {
        viewport.style.setProperty('--smplfy-bulk-viewport-width', viewportWidth);
      }

      setScrollMetrics({
        left: viewport.scrollLeft,
        clientWidth: viewport.clientWidth,
        scrollWidth: viewport.scrollWidth,
        horizontalTrackSize: horizontalTrackRef.current?.clientWidth ?? 0,
      });
    };

    const clampHorizontalScroll = (left) => {
      const maxLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
      viewport.scrollLeft = Math.min(maxLeft, Math.max(0, left));
      updateMetrics();
    };

    const pageScroller = viewport.closest('main');

    const scrollPageBy = (delta) => {
      if (!pageScroller) return;

      const maxTop = Math.max(0, pageScroller.scrollHeight - pageScroller.clientHeight);
      pageScroller.scrollTop = Math.min(maxTop, Math.max(0, pageScroller.scrollTop + delta));
    };

    const handleWheel = (event) => {
      const lineSize = 16;
      const pageSize = pageScroller?.clientHeight ?? viewport.clientHeight;
      const scale = event.deltaMode === WheelEvent.DOM_DELTA_LINE
        ? lineSize
        : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
          ? pageSize
          : 1;
      const isVerticalGesture = Math.abs(event.deltaY) >= Math.abs(event.deltaX);

      event.preventDefault();

      if (isVerticalGesture) {
        scrollPageBy(event.deltaY * scale);
        return;
      }

      clampHorizontalScroll(viewport.scrollLeft + (event.deltaX * scale));
    };

    const handleTouchStart = (event) => {
      if (event.touches.length !== 1) {
        touchRef.current = null;
        return;
      }

      const touch = event.touches[0];
      touchRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        left: viewport.scrollLeft,
      };
    };

    const handleTouchMove = (event) => {
      if (event.touches.length !== 1 || !touchRef.current) return;

      const touch = event.touches[0];
      const deltaX = touchRef.current.x - touch.clientX;
      const deltaY = touchRef.current.y - touch.clientY;

      event.preventDefault();

      if (Math.abs(deltaY) >= Math.abs(deltaX)) {
        scrollPageBy(deltaY);
        touchRef.current = {
          ...touchRef.current,
          x: touch.clientX,
          y: touch.clientY,
        };
        return;
      }

      clampHorizontalScroll(touchRef.current.left + deltaX);
    };

    const clearTouch = () => {
      touchRef.current = null;
    };

    let focusScrollFrame = null;

    const handleCellFocus = (event) => {
      const cell = event.target.closest('td');
      if (!cell || cell.classList.contains('smplfy-bulk-action-cell')) return;

      if (focusScrollFrame !== null) {
        cancelAnimationFrame(focusScrollFrame);
      }

      focusScrollFrame = requestAnimationFrame(() => {
        focusScrollFrame = null;

        const row = cell.parentElement;
        const serialCell = row?.querySelector('.smplfy-bulk-serial-cell');
        const actionCell = row?.querySelector('.smplfy-bulk-action-cell');
        const viewportRect = viewport.getBoundingClientRect();
        const cellRect = cell.getBoundingClientRect();
        const visibleLeft = serialCell?.getBoundingClientRect().right ?? viewportRect.left;
        const visibleRight = actionCell?.getBoundingClientRect().left ?? viewportRect.right;

        if (cellRect.right > visibleRight) {
          clampHorizontalScroll(viewport.scrollLeft + (cellRect.right - visibleRight));
        } else if (cellRect.left < visibleLeft) {
          clampHorizontalScroll(viewport.scrollLeft - (visibleLeft - cellRect.left));
        }
      });
    };

    const resizeObserver = new ResizeObserver(updateMetrics);
    resizeObserver.observe(viewport);
    if (table) resizeObserver.observe(table);
    if (horizontalTrackRef.current) resizeObserver.observe(horizontalTrackRef.current);

    viewport.addEventListener('scroll', updateMetrics, { passive: true });
    viewport.addEventListener('wheel', handleWheel, { passive: false });
    viewport.addEventListener('touchstart', handleTouchStart, { passive: true });
    viewport.addEventListener('touchmove', handleTouchMove, { passive: false });
    viewport.addEventListener('touchend', clearTouch, { passive: true });
    viewport.addEventListener('touchcancel', clearTouch, { passive: true });
    table?.addEventListener('focusin', handleCellFocus);
    updateMetrics();

    return () => {
      if (focusScrollFrame !== null) cancelAnimationFrame(focusScrollFrame);
      resizeObserver.disconnect();
      viewport.removeEventListener('scroll', updateMetrics);
      viewport.removeEventListener('wheel', handleWheel);
      viewport.removeEventListener('touchstart', handleTouchStart);
      viewport.removeEventListener('touchmove', handleTouchMove);
      viewport.removeEventListener('touchend', clearTouch);
      viewport.removeEventListener('touchcancel', clearTouch);
      table?.removeEventListener('focusin', handleCellFocus);
    };
  }, []);

  const horizontalTrackSize = Math.max(0, scrollMetrics.horizontalTrackSize - 8);
  const maxScrollLeft = Math.max(0, scrollMetrics.scrollWidth - scrollMetrics.clientWidth);
  const horizontalThumbSize = maxScrollLeft > 0
    ? Math.max(48, horizontalTrackSize * (scrollMetrics.clientWidth / scrollMetrics.scrollWidth))
    : horizontalTrackSize;
  const horizontalThumbOffset = maxScrollLeft > 0
    ? (scrollMetrics.left / maxScrollLeft) * Math.max(0, horizontalTrackSize - horizontalThumbSize)
    : 0;

  const setHorizontalScroll = (value) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollLeft = Math.min(maxScrollLeft, Math.max(0, value));
  };

  const handleScrollbarTrackPointerDown = (event) => {
    if (event.target !== event.currentTarget) return;

    const track = horizontalTrackRef.current;
    if (!track) return;

    const rect = track.getBoundingClientRect();
    const pointer = event.clientX - rect.left - 4;
    const availableTrack = Math.max(1, horizontalTrackSize - horizontalThumbSize);

    setHorizontalScroll(((pointer - (horizontalThumbSize / 2)) / availableTrack) * maxScrollLeft);
  };

  const handleScrollbarThumbPointerDown = (event) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    scrollbarDragRef.current = {
      pointerId: event.pointerId,
      startPointer: event.clientX,
      startScroll: scrollMetrics.left,
    };
  };

  const handleScrollbarThumbPointerMove = (event) => {
    const drag = scrollbarDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const availableTrack = Math.max(1, horizontalTrackSize - horizontalThumbSize);
    setHorizontalScroll(
      drag.startScroll + ((event.clientX - drag.startPointer) / availableTrack) * maxScrollLeft,
    );
  };

  const handleScrollbarThumbPointerUp = (event) => {
    if (scrollbarDragRef.current?.pointerId === event.pointerId) {
      scrollbarDragRef.current = null;
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleScrollbarKeyDown = (event) => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    let next = viewport.scrollLeft;

    if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = maxScrollLeft;
    else if (event.key === 'PageUp') next -= viewport.clientWidth;
    else if (event.key === 'PageDown') next += viewport.clientWidth;
    else if (event.key === 'ArrowLeft') next -= 40;
    else if (event.key === 'ArrowRight') next += 40;
    else return;

    event.preventDefault();
    setHorizontalScroll(next);
  };

  const toggleRowExpanded = (rowId) => {
    setExpandedRowId((current) => (current === rowId ? null : rowId));
  };

  const handleBulkCellChange = (rowId, columnKey, value) => {
    const hasValue = value && typeof value === 'object'
      ? Object.values(value).some((part) => String(part ?? '').trim())
      : Boolean(String(value ?? '').trim());

    if (hasValue) {
      lastColumnValuesRef.current[columnKey] = value && typeof value === 'object'
        ? { ...value }
        : value;
    }
    onRowChange(rowId, columnKey, value);
  };

  const renderCell = (row, column) => {
    if (column.type === 'parameters') {
      const parameterCount = (row.parameters ?? []).filter((parameter) => (
        ['parameter', 'method', 'charges', 'time'].some((field) => (
          String(parameter[field] ?? '').trim()
        ))
      )).length;
      const expanded = expandedRowId === row.id;

      return (
        <button
          type="button"
          className="smplfy-bulk-parameters-toggle"
          aria-expanded={expanded}
          aria-controls={`bulk-row-${row.id}-details`}
          aria-label={`${expanded ? 'Collapse' : 'Expand'} ${parameterCount} testing parameters`}
          onClick={() => toggleRowExpanded(row.id)}
        >
          <span>{parameterCount}</span>
          <AppIcon name="chevron-down" size={16} stroke={2} aria-hidden="true" />
        </button>
      );
    }

    if (column.type === 'sample-size') {
      const cellId = `${row.id}-${column.key}`;
      const rowIndex = rows.findIndex((candidate) => candidate.id === row.id);
      const currentValue = row.sampleSize ?? { value: '', unit: '' };
      const fallbackValue = rows
        .slice(0, rowIndex)
        .reverse()
        .find((candidate) => (
          String(candidate.sampleSize?.value ?? '').trim()
          || String(candidate.sampleSize?.unit ?? '').trim()
        ))
        ?.sampleSize;
      const rememberedValue = lastColumnValuesRef.current.sampleSize;
      const suggestion = activeSuggestionCell === cellId
        && !currentValue.value
        && !currentValue.unit
        ? rememberedValue ?? fallbackValue ?? { value: '', unit: '' }
        : { value: '', unit: '' };
      const hasSuggestion = Boolean(suggestion.value || suggestion.unit);

      return (
        <InputFieldSplitSelector
          value={currentValue.value}
          unit={currentValue.unit}
          units={bulkSampleSizeUnitOptions}
          placeholder={suggestion.value || 'Value'}
          unitPlaceholder="Unit"
          unitSuggestion={suggestion.unit}
          className={`smplfy-field-table-cell smplfy-bulk-sample-size-field${hasSuggestion ? ' smplfy-field-suggestion' : ''}`}
          aria-label="Sample Size"
          onFocus={() => setActiveSuggestionCell(cellId)}
          onBlur={() => setActiveSuggestionCell((current) => (current === cellId ? null : current))}
          onKeyDown={(event) => {
            if (event.key !== 'Enter' || !hasSuggestion) return;
            event.preventDefault();
            event.stopPropagation();
            handleBulkCellChange(row.id, 'sampleSize', { ...suggestion });
          }}
          onChange={(event) => handleBulkCellChange(row.id, 'sampleSize', {
            value: event.target.value,
            unit: event.target.unit,
          })}
        />
      );
    }

    const isRequired = requiredBulkColumnKeys.has(column.key);
    const hasError = Boolean(errors?.[`bulk-${row.id}-${column.key}`]);
    const cellId = `${row.id}-${column.key}`;
    const rowIndex = rows.findIndex((candidate) => candidate.id === row.id);
    const fallbackValue = rows
      .slice(0, rowIndex)
      .reverse()
      .find((candidate) => String(candidate[column.key] ?? '').trim())
      ?.[column.key] ?? '';
    const suggestion = activeSuggestionCell === cellId && !row[column.key]
      ? lastColumnValuesRef.current[column.key] ?? fallbackValue
      : '';
    const sharedProps = {
      variant: 'table-cell',
      state: hasError ? 'error' : undefined,
      className: suggestion ? 'smplfy-field-suggestion' : undefined,
      'aria-label': column.label,
      'aria-invalid': hasError || undefined,
      'aria-required': isRequired || undefined,
      required: isRequired,
      onFocus: () => setActiveSuggestionCell(cellId),
      onBlur: () => setActiveSuggestionCell((current) => (current === cellId ? null : current)),
    };

    const acceptSuggestion = (event) => {
      if (event.key !== 'Enter' || !suggestion || row[column.key]) return;

      event.preventDefault();
      event.stopPropagation();
      handleBulkCellChange(row.id, column.key, suggestion);
    };

    const renderDropdown = (options, placeholder = 'Select') => (
      <InputFieldRichDropdown
        {...sharedProps}
        value={row[column.key]}
        options={options}
        placeholder={placeholder}
        suggestion={suggestion}
        searchable
        onChange={(event) => handleBulkCellChange(row.id, column.key, event.target.value)}
      />
    );

    switch (column.key) {
      case 'category':
        return renderDropdown(bulkCategoryOptions, 'Select category');
      case 'product':
        return renderDropdown(bulkProductOptions, 'Select product');
      case 'refDate':
        return (
          <InputFieldDate
            {...sharedProps}
            value={row.refDate || ''}
            placeholder={suggestion || 'DD/MM/YYYY'}
            onKeyDown={acceptSuggestion}
            onChange={(event) => handleBulkCellChange(row.id, 'refDate', event.target.value)}
          />
        );
      default:
        return (
          <InputFieldText
            {...sharedProps}
            value={row[column.key] || ''}
            placeholder={suggestion}
            onKeyDown={acceptSuggestion}
            onChange={(event) => handleBulkCellChange(row.id, column.key, event.target.value)}
          />
        );
    }
  };

  return (
    <div className="smplfy-bulk-sample-area">
      <div className="smplfy-bulk-action-center">
        <div className="smplfy-bulk-action-center-header">
          <SampleCountStepper
            value={rows.length}
            onChange={onRowCountChange}
            onDecrement={() => onDeleteRow(rows[rows.length - 1]?.id)}
            onIncrement={onAddRow}
          />
          <PrimaryButton
            size="medium"
            leftIcon="refresh"
            className="smplfy-bulk-auto-fill-button"
            disabled={rows.length < 3}
            onClick={onAutoFill}
          >
            Auto-fill
          </PrimaryButton>
          <SecondaryButton
            size="medium"
            disabled={!canUndoAutoFill}
            onClick={onUndoAutoFill}
          >
            Undo
          </SecondaryButton>
        </div>
      </div>
      <div className="smplfy-bulk-sample-frame">
        <div ref={headerViewportRef} className="smplfy-bulk-sample-header-viewport">
          <table
            className="smplfy-bulk-sample-table smplfy-bulk-sample-header-table"
            style={{ width: `${bulkTableWidth}px`, minWidth: `${bulkTableWidth}px` }}
          >
            <caption className="visually-hidden">Bulk sample column headers</caption>
            <colgroup>
              <col style={{ width: '56px' }} />
              {bulkColumns.map((column) => (
                <col key={column.key} style={{ width: `${column.width}px` }} />
              ))}
              <col style={{ width: `${bulkActionColumnWidth}px` }} />
            </colgroup>
            <thead>
              <tr className="smplfy-bulk-field-row">
                <th scope="col" className="smplfy-bulk-serial-cell">Sr no.</th>
                {bulkColumns.map((column) => (
                  <th key={column.key} scope="col">
                    {column.label}
                    {requiredBulkColumnKeys.has(column.key) ? (
                      <span className="smplfy-bulk-required" aria-hidden="true"> *</span>
                    ) : null}
                  </th>
                ))}
                <th scope="col" className="smplfy-bulk-action-header">Action</th>
              </tr>
            </thead>
          </table>
        </div>
        <div ref={viewportRef} className="smplfy-bulk-sample-viewport">
          <table
            ref={tableRef}
            className="smplfy-bulk-sample-table"
            style={{ width: `${bulkTableWidth}px`, minWidth: `${bulkTableWidth}px` }}
          >
            <caption className="visually-hidden">Bulk sample details</caption>
            <colgroup>
              <col style={{ width: '56px' }} />
              {bulkColumns.map((column) => (
                <col key={column.key} style={{ width: `${column.width}px` }} />
              ))}
              <col style={{ width: `${bulkActionColumnWidth}px` }} />
            </colgroup>
            <tbody>
              {rows.map((row, index) => {
                const expanded = expandedRowId === row.id;

                return (
                  <Fragment key={row.id}>
                    <tr className={`smplfy-bulk-data-row${expanded ? ' is-expanded' : ''}`}>
                      <th scope="row" className="smplfy-bulk-serial-cell">
                        <button
                          type="button"
                          className="smplfy-bulk-row-toggle"
                          aria-expanded={expanded}
                          aria-controls={`bulk-row-${row.id}-details`}
                          aria-label={`${expanded ? 'Collapse' : 'Expand'} parameter and testing details for row ${index + 1}`}
                          onClick={() => toggleRowExpanded(row.id)}
                        >
                          <span>{index + 1}</span>
                          <AppIcon
                            name="chevron-down"
                            size={16}
                            stroke={2}
                            aria-hidden="true"
                          />
                        </button>
                      </th>
                      {bulkColumns.map((column) => (
                        <td key={column.key}>{renderCell(row, column)}</td>
                      ))}
                      <td className="smplfy-bulk-action-cell">
                        <div className="smplfy-bulk-action-buttons">
                          <SecondaryButton
                            size="small"
                            leftIcon="copy"
                            aria-label={`Copy row ${index + 1}`}
                            onClick={() => onCopyRow(row.id)}
                          />
                          <SecondaryButton
                            size="small"
                            leftIcon="clipboard-text"
                            aria-label={`Paste into row ${index + 1}`}
                            disabled={!canPasteRow}
                            onClick={() => onPasteRow(row.id)}
                          />
                          <SecondaryButton
                            size="small"
                            tone="danger"
                            leftIcon="trash"
                            aria-label={`Delete row ${index + 1}`}
                            disabled={rows.length === 1}
                            onClick={() => onDeleteRow(row.id)}
                          />
                        </div>
                      </td>
                    </tr>
                    <tr className={`smplfy-bulk-detail-row${expanded ? ' is-expanded' : ''}`}>
                      <td colSpan={bulkColumns.length + 2}>
                        <div className="smplfy-bulk-detail-transition">
                          <div
                            className="smplfy-bulk-detail-transition-inner"
                            aria-hidden={!expanded}
                            inert={!expanded}
                          >
                            <BulkSampleParameterDetails
                              row={row}
                              rowIndex={index}
                              onParameterChange={onParameterChange}
                              onAddParameter={onAddParameter}
                              onDeleteParameter={onDeleteParameter}
                              onAutoFillParameters={onAutoFillParameters}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        <div
          ref={horizontalTrackRef}
          className="smplfy-bulk-scrollbar smplfy-bulk-scrollbar-horizontal"
          role="scrollbar"
          aria-label="Scroll table horizontally"
          aria-orientation="horizontal"
          aria-valuemin={0}
          aria-valuemax={Math.round(maxScrollLeft)}
          aria-valuenow={Math.round(scrollMetrics.left)}
          onPointerDown={handleScrollbarTrackPointerDown}
        >
          <span
            className="smplfy-bulk-scrollbar-thumb"
            style={{
              width: `${horizontalThumbSize}px`,
              transform: `translateX(${horizontalThumbOffset}px)`,
            }}
            onPointerDown={handleScrollbarThumbPointerDown}
            onPointerMove={handleScrollbarThumbPointerMove}
            onPointerUp={handleScrollbarThumbPointerUp}
            onPointerCancel={handleScrollbarThumbPointerUp}
          />
        </div>
      </div>
    </div>
  );
}

function TopBar({ parentLabel, currentLabel, onBack }) {
  return (
    <header className="d-flex align-items-center justify-content-between gap-3 bg-white border-bottom flex-wrap">
      <div className="d-inline-flex align-items-center gap-2 text-secondary fw-medium flex-wrap">
        <button
          type="button"
          className="btn btn-link text-secondary text-decoration-none p-0 border-0"
          aria-label={`Go to ${parentLabel}`}
          onClick={onBack}
        >
          <AppIcon name="home" />
        </button>
        <AppIcon name="chevron-right" />
        <button
          type="button"
          className="btn btn-link text-secondary text-decoration-none p-0 border-0"
          onClick={onBack}
        >
          {parentLabel}
        </button>
        <AppIcon name="chevron-right" />
        <span className="text-body fw-semibold">{currentLabel}</span>
      </div>

      <div className="d-flex align-items-center gap-2 flex-wrap">
        <div className="smplfy-btn btn btn-outline-success">
          <AppIcon name="activity" />
          <span>No Active Alerts</span>
        </div>
        <button type="button" className="smplfy-btn btn btn-outline-secondary">
          <AppIcon name="phone" />
          <span>+91-6358273804</span>
        </button>
        <button type="button" className="smplfy-btn btn btn-outline-secondary" aria-label="Notifications">
          <AppIcon name="bell" />
        </button>
        <button type="button" className="smplfy-btn btn btn-outline-secondary">DC</button>
      </div>
    </header>
  );
}

function StepRail({ currentStep, title, mode }) {
  const items = wizardSteps.map((label, index) => ({
    label,
    state: index < currentStep ? 'completed' : index === currentStep ? 'active' : 'default',
  }));

  return (
    <aside>
      <div>
        <h1 className={mode === 'edit' ? 'h6 fw-bold mb-0' : 'h4 fw-medium mb-0'}>{title}</h1>
      </div>
      <Stepper items={items} />
    </aside>
  );
}

function FormSection({ id, title, children, showTitle = false }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`}>
      {showTitle ? (
        <h2 className="h5 mb-0 px-4 py-3 border-bottom" id={`${id}-title`}>{title}</h2>
      ) : (
        <h2 className="visually-hidden" id={`${id}-title`}>{title}</h2>
      )}
      {children}
    </section>
  );
}

function QuickAddCustomerModal({ open, onClose, onAdd }) {
  const [draft, setDraft] = useState(emptyCustomerDraft);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setDraft(emptyCustomerDraft);
      setErrors({});
    }
  }, [open]);

  const updateDraft = (key, value) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const nextErrors = { ...current };
      delete nextErrors[key];
      return nextErrors;
    });
  };

  const handleSubmit = () => {
    const requiredKeys = Object.keys(emptyCustomerDraft);
    const nextErrors = requiredKeys.reduce((result, key) => {
      if (!String(draft[key] ?? '').trim()) result[key] = 'This field is required.';
      return result;
    }, {});

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    const customer = { ...draft, id: createId('customer') };
    onAdd(customer);
  };

  const fields = [
    ['name', 'Name', 'text'],
    ['legalName', 'Legal Name', 'text'],
    ['contactPerson', 'Contact Person', 'text'],
    ['email', 'Contact Person Email', 'text'],
    ['phone', 'Contact Person Phone', 'text'],
  ];

  return (
    <Modal
      open={open}
      title="Quick Add Customer"
      titleId="quick-add-customer-title"
      titleIcon="plus"
      size="large"
      onClose={onClose}
      cardClassName="smplfy-quick-add-customer-modal"
      actions={(
        <>
          <SecondaryButton leftIcon="close" onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton leftIcon="save" onClick={handleSubmit}>Add Customer</PrimaryButton>
        </>
      )}
    >
      <form
        id="quick-add-customer-form"
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        <div className="row g-3">
          {fields.map(([key, label]) => (
            <div className="col-12 col-md-6" key={key}>
              <FormElement
                type="text"
                mandatory
                label={label}
                message={errors[key]}
                messageTone="error"
                inputProps={{
                  value: draft[key],
                  onChange: (event) => updateDraft(key, event.target.value),
                }}
              />
            </div>
          ))}

          <div className="d-none d-md-block col-md-6" aria-hidden="true" />

          <div className="col-12 col-md-6">
            <FormElement
              type="textarea"
              mandatory
              label="Bill to Address"
              message={errors.billToAddress}
              messageTone="error"
              inputProps={{
                value: draft.billToAddress,
                rows: 3,
                onChange: (event) => updateDraft('billToAddress', event.target.value),
              }}
            />
          </div>

          <div className="col-12 col-md-6">
            <FormElement
              type="textarea"
              mandatory
              label="Ship to Address"
              message={errors.shipToAddress}
              messageTone="error"
              inputProps={{
                value: draft.shipToAddress,
                rows: 3,
                onChange: (event) => updateDraft('shipToAddress', event.target.value),
              }}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}

function CustomerDetailsSection({ values, customers, errors, onChange, onOpenCustomerModal, showTitle = false }) {
  const customerOptions = customers.map((customer) => ({ value: customer.id, label: customer.name }));
  const selectedCustomer = customers.find((customer) => customer.id === values.customerId);
  const quotationOptions = selectedCustomer?.quotations ?? [];
  const quotationPlaceholder = !selectedCustomer
    ? 'Select a customer first'
    : quotationOptions.length
      ? 'Select a customer quotation'
      : `No quotations found for ${selectedCustomer.name}`;

  return (
    <FormSection id="original-sample-customer-details" title="Customer Details" showTitle={showTitle}>
      <div className="container-fluid p-4">
        <div className="row g-4">
          <div className="col-lg-6">
            <div className="smplfy-form-field">
              <div className="smplfy-form-label-row">
                <label className="smplfy-form-label form-label" htmlFor="original-sample-customer">Customer</label>
                <span className="smplfy-form-required">*</span>
              </div>
              <div className="d-flex align-items-stretch gap-2">
                <InputFieldRichDropdown
                  id="original-sample-customer"
                  className="flex-grow-1"
                  value={values.customerId}
                  state={errors.customerId ? 'error' : undefined}
                  options={customerOptions}
                  placeholder="Select a Customer or create new"
                  searchable
                  searchPlaceholder="Search customers"
                  maxVisibleItems={5}
                  onChange={(event) => onChange('customerId', event.target.value)}
                />
                <PrimaryButton
                  size="medium"
                  leftIcon="plus"
                  className="smplfy-new-customer-trigger p-0"
                  aria-label="Quick add customer"
                  onClick={onOpenCustomerModal}
                />
              </div>
              {errors.customerId ? (
                <div className="smplfy-form-feedback invalid-feedback d-block">{errors.customerId}</div>
              ) : null}
            </div>
          </div>
          <div className="col-lg-6">
            <FormElement
              type="rich-dropdown"
              label="Customer Quotation"
              inputProps={{
                value: values.customerQuotation,
                options: quotationOptions,
                placeholder: quotationPlaceholder,
                disabled: !quotationOptions.length,
                searchable: true,
                onChange: (event) => onChange('customerQuotation', event.target.value),
              }}
            />
          </div>
          <div className="col-lg-6">
            <FormElement
              type="date"
              mandatory
              label="Receiving Date"
              message={errors.receivingDate}
              messageTone="error"
              inputProps={{
                value: values.receivingDate,
                state: errors.receivingDate ? 'error' : undefined,
                placeholder: 'DD/MM/YYYY',
                onChange: (event) => onChange('receivingDate', event.target.value),
              }}
            />
          </div>
          <div className="col-lg-6">
            <FormElement
              type="rich-dropdown"
              mandatory
              label="Sample Type"
              message={errors.sampleType}
              messageTone="error"
              inputProps={{
                value: values.sampleType,
                state: errors.sampleType ? 'error' : undefined,
                options: sampleTypeOptions,
                placeholder: 'Select sample type',
                searchable: true,
                onChange: (event) => onChange('sampleType', event.target.value),
              }}
            />
          </div>
          <div className="col-12">
            <FormElement
              type="textarea"
              mandatory
              label="Customer Address"
              message={errors.customerAddress}
              messageTone="error"
              inputProps={{
                value: values.customerAddress,
                state: errors.customerAddress ? 'error' : undefined,
                rows: 1,
                placeholder: 'Customer billing address',
                style: { resize: 'vertical', minHeight: 'var(--smplfy-field-height)' },
                onChange: (event) => onChange('customerAddress', event.target.value),
              }}
            />
          </div>
        </div>
      </div>
    </FormSection>
  );
}

function BasicDetailsSection({ values, onChange, showTitle = false }) {
  return (
    <FormSection id="original-sample-basic-details" title="Basic Details" showTitle={showTitle}>
      <div className="container-fluid p-4">
        <div className="row g-4">
          <div className="col-lg-6">
            <div className="smplfy-form-field">
              <div className="smplfy-form-label-row">
                <label className="smplfy-form-label form-label" htmlFor="original-sample-report-number">Report No.</label>
              </div>
              <div className="d-flex align-items-stretch gap-2">
                <input
                  id="original-sample-report-number"
                  className="smplfy-form-control form-control flex-grow-1"
                  value={values.reportNumber}
                  onChange={(event) => onChange('reportNumber', event.target.value)}
                />
                <SecondaryButton
                  size="medium"
                  leftIcon="refresh"
                  className="smplfy-basic-details-icon-button p-0"
                  aria-label="Generate report number"
                  onClick={() => onChange('reportNumber', `IICT/${new Date().getFullYear()}/${String(Date.now()).slice(-6)}`)}
                />
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <FormElement
              type="text"
              label="Customer Ref."
              inputProps={{
                value: values.customerRef || '',
                onChange: (event) => onChange('customerRef', event.target.value),
              }}
            />
          </div>
          <div className="col-lg-6">
            <FormElement
              type="text"
              label="Sample Drawn By"
              inputProps={{
                value: values.sampleDrawnBy || '',
                onChange: (event) => onChange('sampleDrawnBy', event.target.value),
              }}
            />
          </div>
          <div className="col-lg-6">
            <FormElement
              type="text"
              label="#Nature of Sample"
              inputProps={{
                value: values.natureOfSample || '',
                onChange: (event) => onChange('natureOfSample', event.target.value),
              }}
            />
          </div>
          <div className="col-lg-6">
            <FormElement
              type="text"
              label="#Specification"
              inputProps={{
                value: values.specification || '',
                onChange: (event) => onChange('specification', event.target.value),
              }}
            />
          </div>
          <div className="col-lg-6">
            <FormElement
              type="text"
              label="Stamped By"
              inputProps={{
                value: values.stampedBy || '',
                onChange: (event) => onChange('stampedBy', event.target.value),
              }}
            />
          </div>
          <div className="col-lg-6">
            <FormElement
              type="text"
              label="#Heat No"
              inputProps={{
                value: values.heatNo || '',
                onChange: (event) => onChange('heatNo', event.target.value),
              }}
            />
          </div>
          <div className="col-lg-6">
            <FormElement
              type="text"
              label="#PO No."
              inputProps={{
                value: values.poNo || '',
                onChange: (event) => onChange('poNo', event.target.value),
              }}
            />
          </div>
          <div className="col-lg-6">
            <FormElement
              type="text"
              label="#Make"
              inputProps={{
                value: values.make || '',
                onChange: (event) => onChange('make', event.target.value),
              }}
            />
          </div>
          <div className="col-lg-6">
            <FormElement
              type="text"
              label="PO Sr No."
              inputProps={{
                value: values.poSrNo || '',
                onChange: (event) => onChange('poSrNo', event.target.value),
              }}
            />
          </div>
          <div className="col-lg-6">
            <FormElement
              type="date"
              label="Ref. Date"
              inputProps={{
                value: values.refDate || '',
                placeholder: 'DD/MM/YYYY',
                onChange: (event) => onChange('refDate', event.target.value),
              }}
            />
          </div>
        </div>
      </div>
    </FormSection>
  );
}

function ParameterTable({ rows, canAutoFill, onAutoFill, onChange, onAdd, onDelete }) {
  return (
    <>
      <div className="d-flex align-items-center justify-content-between gap-3 mb-3 flex-wrap">
        <h3 className="h5 fw-semibold text-body mb-0">Parameter Data</h3>
        <PrimaryButton
          size="small"
          disabled={!canAutoFill}
          onClick={onAutoFill}
        >
          Auto-fill Parameter
        </PrimaryButton>
      </div>
      <DataTable className="smplfy-new-sample-data-table smplfy-new-sample-parameter-table">
        <thead>
          <tr>
            <th scope="col">Sr no.</th>
            <th scope="col">Parameter</th>
            <th scope="col">Test Method</th>
            <th scope="col">Charges</th>
            <th scope="col">Est. Time</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id}>
              <td>{index + 1}</td>
              <td>
                <InputFieldRichDropdown
                  aria-label={`Parameter ${index + 1}`}
                  value={row.parameter}
                  placeholder="Select parameter"
                  options={parameterOptions}
                  onChange={(event) => onChange(row.id, 'parameter', event.target.value)}
                />
              </td>
              <td>
                <InputFieldRichDropdown
                  aria-label={`Test method ${index + 1}`}
                  value={row.method}
                  placeholder="Select test method"
                  options={testMethodOptions}
                  onChange={(event) => onChange(row.id, 'method', event.target.value)}
                />
              </td>
              <td>
                <input
                  className="smplfy-form-control form-control"
                  aria-label={`Charges ${index + 1}`}
                  value={row.charges}
                  onChange={(event) => onChange(row.id, 'charges', event.target.value)}
                />
              </td>
              <td>
                <input
                  className="smplfy-form-control form-control"
                  aria-label={`Estimated time ${index + 1}`}
                  value={row.time}
                  onChange={(event) => onChange(row.id, 'time', event.target.value)}
                />
              </td>
              <td>
                <SecondaryButton
                  size="medium"
                  tone="danger"
                  leftIcon="trash"
                  className="px-2"
                  aria-label={`Delete parameter row ${index + 1}`}
                  onClick={() => onDelete(row.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </DataTable>
      <div className="smplfy-new-sample-table-action mt-3">
        <SecondaryButton size="medium" leftIcon="plus" onClick={onAdd}>Add row</SecondaryButton>
      </div>
    </>
  );
}

function ProductDetailsSection({ products, errors, onProductChange, onAddProduct, onDeleteProduct, onParameterChange, onAutoFillParameters, onAddParameter, onDeleteParameter, showTitle = false }) {
  return (
    <FormSection id="original-sample-product-details" title="Product Details" showTitle={showTitle}>
      <div className="container-fluid p-4 smplfy-original-product-details">
        {products.map((product, index) => (
          <div className="smplfy-original-product-block" key={product.id}>
            <div className="d-flex align-items-center justify-content-between gap-3 mb-4">
              <div className="d-inline-flex align-items-center gap-2 h5 fw-semibold text-body mb-0">
                <span className="smplfy-badge badge text-bg-primary rounded-circle d-inline-flex align-items-center justify-content-center">{index + 1}</span>
                <span>Product {index + 1}</span>
              </div>
              <SecondaryButton
                size="medium"
                tone="danger"
                leftIcon="trash"
                className="px-2"
                aria-label={`Delete product ${index + 1}`}
                disabled={products.length === 1}
                onClick={() => onDeleteProduct(product.id)}
              />
            </div>

            <div className="row g-4">
              <div className="col-lg-6">
                <FormElement
                  type="rich-dropdown"
                  mandatory
                  label="Category"
                  message={errors[`product-${product.id}-category`]}
                  messageTone="error"
                  inputProps={{
                    value: product.category,
                    state: errors[`product-${product.id}-category`] ? 'error' : undefined,
                    options: categoryOptions,
                    placeholder: 'Select sample category',
                    searchable: true,
                    onChange: (event) => onProductChange(product.id, 'category', event.target.value),
                  }}
                />
              </div>
              <div className="col-lg-6">
                <FormElement
                  type="rich-dropdown"
                  mandatory
                  label="Product"
                  message={errors[`product-${product.id}-product`]}
                  messageTone="error"
                  inputProps={{
                    value: product.product,
                    state: errors[`product-${product.id}-product`] ? 'error' : undefined,
                    options: productOptionsByCategory[product.category] ?? [],
                    placeholder: product.category ? 'Select product' : 'Select category first',
                    disabled: !product.category,
                    searchable: true,
                    onChange: (event) => onProductChange(product.id, 'product', event.target.value),
                  }}
                />
              </div>
              <div className="col-lg-6">
                <FormElement
                  type="split"
                  label="Sample Size"
                  inputProps={{
                    value: product.sampleSize.value,
                    unit: product.sampleSize.unit,
                    placeholder: 'Value',
                    unitPlaceholder: 'Unit',
                    onChange: (event) => onProductChange(product.id, 'sampleSize', {
                      value: event.target.value,
                      unit: event.target.unit,
                    }),
                  }}
                />
              </div>
              <div className="col-lg-6">
                <FormElement
                  type="file"
                  label="Image Upload"
                  inputProps={{
                    value: product.imageUpload,
                    accept: 'image/*',
                    placeholder: 'Upload sample image',
                    onChange: (event) => onProductChange(product.id, 'imageUpload', event.target.value),
                  }}
                />
              </div>
            </div>

            <ParameterTable
              rows={product.parameters}
              canAutoFill={Boolean(product.category && product.product)}
              onAutoFill={() => onAutoFillParameters(product.id)}
              onChange={(rowId, field, value) => onParameterChange(product.id, rowId, field, value)}
              onAdd={() => onAddParameter(product.id)}
              onDelete={(rowId) => onDeleteParameter(product.id, rowId)}
            />
          </div>
        ))}

        <div className="d-flex justify-content-end pt-4">
          <SecondaryButton leftIcon="plus" onClick={onAddProduct}>Add Product</SecondaryButton>
        </div>
      </div>
    </FormSection>
  );
}

function TabbedProductDetailsSection({ products, errors, activeProductId, onProductSelect, onProductChange, onAddProduct, onDeleteProduct, onParameterChange, onAutoFillParameters, onAddParameter, onDeleteParameter, plain = false, showTitle = false }) {
  const activeProduct = products.find((p) => p.id === activeProductId) ?? products[0];

  if (plain) {
    return (
      <FormSection id="original-sample-product-details" title="Product Details" showTitle={showTitle}>
        <div className="container-fluid p-4 smplfy-original-product-details">
          {activeProduct ? (
            <div key={activeProduct.id}>
              <div className="row g-4">
                <div className="col-lg-6">
                  <FormElement
                    type="rich-dropdown"
                    mandatory
                    label="Category"
                    message={errors[`product-${activeProduct.id}-category`]}
                    messageTone="error"
                    inputProps={{
                      value: activeProduct.category,
                      state: errors[`product-${activeProduct.id}-category`] ? 'error' : undefined,
                      options: categoryOptions,
                      placeholder: 'Select sample category',
                      searchable: true,
                      onChange: (event) => onProductChange(activeProduct.id, 'category', event.target.value),
                    }}
                  />
                </div>
                <div className="col-lg-6">
                  <FormElement
                    type="rich-dropdown"
                    mandatory
                    label="Product"
                    message={errors[`product-${activeProduct.id}-product`]}
                    messageTone="error"
                    inputProps={{
                      value: activeProduct.product,
                      state: errors[`product-${activeProduct.id}-product`] ? 'error' : undefined,
                      options: productOptionsByCategory[activeProduct.category] ?? [],
                      placeholder: activeProduct.category ? 'Select product' : 'Select category first',
                      disabled: !activeProduct.category,
                      searchable: true,
                      onChange: (event) => onProductChange(activeProduct.id, 'product', event.target.value),
                    }}
                  />
                </div>
                <div className="col-lg-6">
                  <FormElement
                    type="split"
                    label="Sample Size"
                    inputProps={{
                      value: activeProduct.sampleSize.value,
                      unit: activeProduct.sampleSize.unit,
                      placeholder: 'Value',
                      unitPlaceholder: 'Unit',
                      onChange: (event) => onProductChange(activeProduct.id, 'sampleSize', {
                        value: event.target.value,
                        unit: event.target.unit,
                      }),
                    }}
                  />
                </div>
                <div className="col-lg-6">
                  <FormElement
                    type="file"
                    label="Image Upload"
                    inputProps={{
                      value: activeProduct.imageUpload,
                      accept: 'image/*',
                      placeholder: 'Upload sample image',
                      onChange: (event) => onProductChange(activeProduct.id, 'imageUpload', event.target.value),
                    }}
                  />
                </div>
              </div>

              <ParameterTable
                rows={activeProduct.parameters}
                canAutoFill={Boolean(activeProduct.category && activeProduct.product)}
                onAutoFill={() => onAutoFillParameters(activeProduct.id)}
                onChange={(rowId, field, value) => onParameterChange(activeProduct.id, rowId, field, value)}
                onAdd={() => onAddParameter(activeProduct.id)}
                onDelete={(rowId) => onDeleteParameter(activeProduct.id, rowId)}
              />
            </div>
          ) : null}
        </div>
      </FormSection>
    );
  }

  return (
    <section id="original-sample-product-details" aria-labelledby="original-sample-product-details-title">
      <h2 className="visually-hidden" id="original-sample-product-details-title">Product Details</h2>
      <div className="d-flex align-items-center justify-content-between border-bottom">
        <div className="nav nav-tabs flex-wrap border-0 flex-grow-1">
          {products.map((product, index) => (
            <NavSelector
              key={product.id}
              active={product.id === activeProduct?.id}
              onClick={() => onProductSelect(product.id)}
            >
              {product.product || `Product ${index + 1}`}
            </NavSelector>
          ))}
          <button
            type="button"
            className="nav-link smplfy-nav-link d-inline-flex align-items-center"
            onClick={onAddProduct}
            aria-label="Add product"
          >
            <AppIcon name="plus" size={16} />
          </button>
        </div>
        <div className="px-3 flex-shrink-0">
          <SecondaryButton
            size="medium"
            tone="danger"
            leftIcon="trash"
            disabled={products.length === 1}
            onClick={() => onDeleteProduct(activeProduct?.id)}
          >
            Delete
          </SecondaryButton>
        </div>
      </div>

      {activeProduct ? (
        <div key={activeProduct.id}>
          <div
            className="row g-3 mx-0"
            style={{
              background: 'linear-gradient(to right, var(--smplfy-primitive-blue-100), color-mix(in srgb, var(--smplfy-primitive-blue-100) 20%, transparent))',
              padding: '16px',
              '--bs-gutter-y': '0px',
            }}
          >
            <div className="col-lg-3">
              <FormElement
                type="rich-dropdown"
                mandatory
                label="Category"
                message={errors[`product-${activeProduct.id}-category`]}
                messageTone="error"
                inputProps={{
                  value: activeProduct.category,
                  state: errors[`product-${activeProduct.id}-category`] ? 'error' : undefined,
                  options: categoryOptions,
                  placeholder: 'Select sample category',
                  searchable: true,
                  onChange: (event) => onProductChange(activeProduct.id, 'category', event.target.value),
                }}
              />
            </div>
            <div className="col-lg-3">
              <FormElement
                type="rich-dropdown"
                mandatory
                label="Product"
                message={errors[`product-${activeProduct.id}-product`]}
                messageTone="error"
                inputProps={{
                  value: activeProduct.product,
                  state: errors[`product-${activeProduct.id}-product`] ? 'error' : undefined,
                  options: productOptionsByCategory[activeProduct.category] ?? [],
                  placeholder: activeProduct.category ? 'Select product' : 'Select category first',
                  disabled: !activeProduct.category,
                  searchable: true,
                  onChange: (event) => onProductChange(activeProduct.id, 'product', event.target.value),
                }}
              />
            </div>
            <div className="col-lg-3">
              <FormElement
                type="split"
                label="Sample Size"
                inputProps={{
                  value: activeProduct.sampleSize.value,
                  unit: activeProduct.sampleSize.unit,
                  placeholder: 'Value',
                  unitPlaceholder: 'Unit',
                  onChange: (event) => onProductChange(activeProduct.id, 'sampleSize', {
                    value: event.target.value,
                    unit: event.target.unit,
                  }),
                }}
              />
            </div>
            <div className="col-lg-3">
              <FormElement
                type="file"
                label="Image Upload"
                inputProps={{
                  value: activeProduct.imageUpload,
                  accept: 'image/*',
                  placeholder: 'Upload sample image',
                  onChange: (event) => onProductChange(activeProduct.id, 'imageUpload', event.target.value),
                }}
              />
            </div>
          </div>
          <div className="container-fluid p-4 pt-3 smplfy-original-product-details">
          <ParameterTable
            rows={activeProduct.parameters}
            canAutoFill={Boolean(activeProduct.category && activeProduct.product)}
            onAutoFill={() => onAutoFillParameters(activeProduct.id)}
            onChange={(rowId, field, value) => onParameterChange(activeProduct.id, rowId, field, value)}
            onAdd={() => onAddParameter(activeProduct.id)}
            onDelete={(rowId) => onDeleteParameter(activeProduct.id, rowId)}
          />
          </div>
        </div>
      ) : null}
    </section>
  );
}

function AdditionalDetailsSection({ values, onChange, showTitle = false }) {
  return (
    <FormSection id="original-sample-additional-details" title="Additional Details" showTitle={showTitle}>
      <div className="container-fluid p-4">
        <div className="row g-4">
          <div className="col-lg-6">
            <FormElement
              type="rich-dropdown"
              label="Mode of Sample Receipt"
              inputProps={{
                value: values.receiptMode,
                options: requestReceivedModeOptions,
                placeholder: 'Select receipt mode',
                searchable: true,
                menuPlacement: 'top',
                onChange: (event) => onChange('receiptMode', event.target.value),
              }}
            />
          </div>
          <div className="col-lg-6">
            <FormElement
              type="date"
              label="Tentative Reporting Date"
              inputProps={{
                value: values.tentativeReportingDate,
                placeholder: 'DD/MM/YYYY',
                onChange: (event) => onChange('tentativeReportingDate', event.target.value),
              }}
            />
          </div>
          <div className="col-lg-6">
            <FormElement
              type="text"
              label="Amount (Inc. of all taxes)"
              inputProps={{
                value: values.amount,
                placeholder: 'Total amount',
                onChange: (event) => onChange('amount', event.target.value),
              }}
            />
          </div>
          <div className="col-lg-6">
            <FormElement
              type="rich-dropdown"
              label="Received By"
              inputProps={{
                value: values.receivedBy,
                options: ['Front Desk', 'Lab Manager', 'Sample Coordinator'],
                placeholder: 'Select a user',
                searchable: true,
                menuPlacement: 'top',
                onChange: (event) => onChange('receivedBy', event.target.value),
              }}
            />
          </div>
        </div>
      </div>
    </FormSection>
  );
}

export default function OriginalSampleCreationPage({
  mode = 'create',
  sample = null,
  parentLabel = 'Samples Workspace',
  layout = 'wizard',
  sampleCreationFlowSessionId = null,
  onBackToWorkspace,
  onComplete,
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [values, setValues] = useState(() => createInitialFormValues());
  const [customers, setCustomers] = useState(initialCustomers);
  const [products, setProducts] = useState(() => [createProduct()]);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formVariant, setFormVariant] = useState(layout === 'long-form' ? 'new' : null);
  const [activeProductTabId, setActiveProductTabId] = useState(null);
  const [bulkModeEnabled, setBulkModeEnabled] = useState(false);
  const [bulkState, setBulkState] = useState(() => ({
    rows: [
      createBulkRow({ reportNumber: formatReportNumber(1) }),
      createBulkRow({ reportNumber: formatReportNumber(2) }),
    ],
    nextReportSequence: 3,
    copiedRow: null,
    autoFillUndo: null,
  }));
  const bulkRows = bulkState.rows;
  const duplicateBulkRowIds = useMemo(
    () => findDuplicateBulkRowIds(bulkRows),
    [bulkRows],
  );
  const formRef = useRef(null);
  const formId = 'new-sample-original-form';
  const sampleTitle = mode === 'edit' ? getSampleDisplayName(sample) : 'New Sample';
  const activeProductTab = activeProductTabId ?? products[0]?.id ?? null;

  const updateBulkRow = (rowId, field, value) => {
    clearFieldErrors(`bulk-${rowId}-${field}`);
    setBulkState((current) => ({
      ...current,
      rows: current.rows.map((row) => (
        row.id === rowId ? { ...row, [field]: value } : row
      )),
    }));
  };

  const updateBulkParameter = (rowId, parameterId, field, value) => {
    setBulkState((current) => ({
      ...current,
      rows: current.rows.map((row) => (
        row.id === rowId
          ? {
              ...row,
              parameters: row.parameters.map((parameter) => (
                parameter.id === parameterId ? { ...parameter, [field]: value } : parameter
              )),
            }
          : row
      )),
    }));
  };

  const addBulkParameter = (rowId) => {
    setBulkState((current) => ({
      ...current,
      rows: current.rows.map((row) => (
        row.id === rowId
          ? { ...row, parameters: [...row.parameters, createBulkParameterRow()] }
          : row
      )),
    }));
  };

  const autoFillBulkParameters = (rowId) => {
    setBulkState((current) => ({
      ...current,
      rows: current.rows.map((row) => (
        row.id === rowId && row.category && row.product
          ? {
              ...row,
              parameters: bulkParameterAutoFillRows.map((parameter) => (
                createBulkParameterRow(parameter)
              )),
            }
          : row
      )),
    }));
  };

  const deleteBulkParameter = (rowId, parameterId) => {
    setBulkState((current) => ({
      ...current,
      rows: current.rows.map((row) => (
        row.id === rowId && row.parameters.length > 1
          ? {
              ...row,
              parameters: row.parameters.filter((parameter) => parameter.id !== parameterId),
            }
          : row
      )),
    }));
  };

  const addBulkRow = () => {
    setBulkState((current) => ({
      ...current,
      rows: [
        ...current.rows,
        createBulkRow({ reportNumber: formatReportNumber(current.nextReportSequence) }),
      ],
      nextReportSequence: current.nextReportSequence + 1,
    }));
  };

  const copyBulkRow = (rowId) => {
    setBulkState((current) => {
      const source = current.rows.find((row) => row.id === rowId);
      if (!source) return current;

      const { id: _sourceId, reportNumber: _reportNumber, parameters = [], ...valuesToCopy } = source;
      return {
        ...current,
        copiedRow: {
          ...valuesToCopy,
          sampleSize: { ...source.sampleSize },
          parameters: parameters.map(({ id: _parameterId, ...parameter }) => ({ ...parameter })),
        },
      };
    });
  };

  const pasteBulkRow = (rowId) => {
    if (!bulkState.copiedRow) return;

    setFieldErrors((current) => Object.fromEntries(
      Object.entries(current).filter(([key]) => !key.startsWith(`bulk-${rowId}-`)),
    ));
    setBulkState((current) => {
      if (!current.copiedRow) return current;

      return {
        ...current,
        rows: current.rows.map((row) => (
          row.id === rowId
            ? createBulkRow({
                ...current.copiedRow,
                id: row.id,
                reportNumber: row.reportNumber,
                sampleSize: { ...current.copiedRow.sampleSize },
                parameters: current.copiedRow.parameters.map((parameter) => (
                  createBulkParameterRow(parameter)
                )),
              })
            : row
        )),
      };
    });
  };

  const setBulkRowCount = (nextCount) => {
    setBulkState((current) => {
      if (nextCount === current.rows.length) return current;

      if (nextCount < current.rows.length) {
        return { ...current, rows: current.rows.slice(0, nextCount) };
      }

      const addedCount = nextCount - current.rows.length;
      const addedRows = Array.from({ length: addedCount }, (_, index) => (
        createBulkRow({
          reportNumber: formatReportNumber(current.nextReportSequence + index),
        })
      ));

      return {
        ...current,
        rows: [...current.rows, ...addedRows],
        nextReportSequence: current.nextReportSequence + addedCount,
      };
    });
  };

  const deleteBulkRow = (rowId) => {
    setBulkState((current) => ({
      ...current,
      rows: current.rows.length > 1
        ? current.rows.filter((row) => row.id !== rowId)
        : current.rows,
    }));
  };

  const autoFillBulkRows = () => {
    setBulkState((current) => {
      if (current.rows.length < 3) return current;

      const generatedRows = generateAutoFillData(
        current.rows[0],
        current.rows[1],
        current.rows.length,
      );
      const autoFillUndo = {};

      const rows = current.rows.map((row, index) => {
        if (index < 2) return row;

        const generatedRow = generatedRows[index - 2];
        const changes = {};
        const nextRow = { ...row };

        bulkColumns.forEach(({ key, type }) => {
          if (type === 'parameters' || key === 'reportNumber') return;

          const generatedValue = generatedRow[key];
          const nextValue = generatedValue && typeof generatedValue === 'object'
            ? { ...generatedValue }
            : generatedValue;
          if (!Object.is(row[key], nextValue)) {
            changes[key] = { before: row[key], after: nextValue };
            nextRow[key] = nextValue;
          }
        });

        if (Object.keys(changes).length) autoFillUndo[row.id] = changes;
        return nextRow;
      });

      return {
        ...current,
        rows,
        autoFillUndo: Object.keys(autoFillUndo).length ? autoFillUndo : null,
      };
    });
  };

  const undoAutoFillBulkRows = () => {
    setBulkState((current) => {
      if (!current.autoFillUndo) return current;

      const rows = current.rows.map((row) => {
        const changes = current.autoFillUndo[row.id];
        if (!changes) return row;

        let nextRow = row;
        Object.entries(changes).forEach(([key, change]) => {
          if (Object.is(nextRow[key], change.after)) {
            if (nextRow === row) nextRow = { ...row };
            nextRow[key] = change.before;
          }
        });

        return nextRow;
      });

      return { ...current, rows, autoFillUndo: null };
    });
  };

  useEffect(() => {
    if (layout === 'long-form' && formRef.current) {
      const firstInput = formRef.current.querySelector('button.smplfy-rich-dropdown-trigger, input, select, textarea');
      if (firstInput) {
        firstInput.focus();
      }
    }
  }, [layout]);

  const analyticsContext = useMemo(() => ({
    form_name: 'sample_creation',
    form_variant: 'original-four-stage',
    mode,
    sample_creation_flow_session_id: sampleCreationFlowSessionId,
  }), [mode, sampleCreationFlowSessionId]);

  useEffect(() => {
    trackEvent('sample_form_started', {
      ...analyticsContext,
      step_count: wizardSteps.length,
      step_index: 0,
      step_name: wizardSteps[0],
    });
  }, [analyticsContext]);

  const clearFieldErrors = (...keys) => {
    setFieldErrors((current) => {
      const nextErrors = { ...current };
      let changed = false;

      keys.forEach((key) => {
        if (nextErrors[key]) {
          delete nextErrors[key];
          changed = true;
        }
      });

      return changed ? nextErrors : current;
    });
  };

  const updateValue = (key, value) => {
    clearFieldErrors(key);

    if (key === 'customerId') {
      const selectedCustomer = customers.find((customer) => customer.id === value);
      clearFieldErrors('customerAddress');
      setValues((current) => ({
        ...current,
        customerId: value,
        customerQuotation: '',
        customerAddress: selectedCustomer?.billToAddress ?? '',
      }));
      return;
    }

    setValues((current) => ({ ...current, [key]: value }));
  };

  const updateProduct = (productId, field, value) => {
    clearFieldErrors(`product-${productId}-${field}`);
    setProducts((current) => current.map((product) => (
      product.id === productId
        ? {
            ...product,
            [field]: value,
            ...(field === 'category' ? { product: '' } : {}),
          }
        : product
    )));
  };

  const updateParameter = (productId, rowId, field, value) => {
    setProducts((current) => current.map((product) => (
      product.id === productId
        ? {
            ...product,
            parameters: product.parameters.map((row) => (
              row.id === rowId ? { ...row, [field]: value } : row
            )),
          }
        : product
    )));
  };

  const handleAutoFillParameters = (productId) => {
    setProducts((current) => current.map((product) => {
      if (product.id !== productId) return product;

      const presets = getParameterPreset(product.category, product.product);
      if (!presets.length) return product;

      return {
        ...product,
        parameters: presets.map((preset) => createParameterRow(preset)),
      };
    }));
  };

  const handleAddCustomer = (customer) => {
    setCustomers((current) => [...current, customer]);
    setValues((current) => ({
      ...current,
      customerId: customer.id,
      customerQuotation: '',
      customerAddress: customer.billToAddress,
    }));
    clearFieldErrors(
      'customerId',
      'customerAddress',
    );
    setCustomerModalOpen(false);
    trackEvent('sample_form_customer_created', {
      ...analyticsContext,
      customer_list_size: customers.length + 1,
      step_index: currentStep,
      step_name: wizardSteps[currentStep],
    });
  };

  const goToStep = (nextStep) => {
    trackEvent('sample_form_step_completed', {
      ...analyticsContext,
      step_index: currentStep,
      step_name: wizardSteps[currentStep],
      next_step_index: nextStep,
      next_step_name: wizardSteps[nextStep],
    });
    setCurrentStep(nextStep);
    trackEvent('sample_form_step_viewed', {
      ...analyticsContext,
      step_index: nextStep,
      step_name: wizardSteps[nextStep],
    });
  };

  const validateStep = (stepIndex) => {
    const nextErrors = {};
    const requireValue = (key, value, message = 'This field is required.') => {
      if (!String(value ?? '').trim()) nextErrors[key] = message;
    };

    if (stepIndex === 0) {
      requireValue('sampleType', values.sampleType);
      requireValue('receivingDate', values.receivingDate);
      requireValue('customerId', values.customerId, 'Select a customer or create a new one.');
      requireValue('customerAddress', values.customerAddress);
    }

    if (bulkModeEnabled) {
      const reportNumberRows = new Map();

      bulkRows.forEach((row, rowIndex) => {
        requiredBulkColumnKeys.forEach((key) => {
          const column = bulkColumns.find((item) => item.key === key);
          requireValue(
            `bulk-${row.id}-${key}`,
            row[key],
            `${column?.label ?? key} is required in row ${rowIndex + 1}.`,
          );
        });

        const reportNumber = String(row.reportNumber ?? '').trim();
        if (reportNumber) {
          const matchingRows = reportNumberRows.get(reportNumber) ?? [];
          matchingRows.forEach(({ id, index }) => {
            nextErrors[`bulk-${id}-reportNumber`] = `Report No. must be unique; it is also used in row ${rowIndex + 1}.`;
            nextErrors[`bulk-${row.id}-reportNumber`] = `Report No. must be unique; it is also used in row ${index + 1}.`;
          });
          reportNumberRows.set(reportNumber, [...matchingRows, { id: row.id, index: rowIndex }]);
        }
      });
    }

    if (!bulkModeEnabled && stepIndex === 2) {
      products.forEach((product) => {
        requireValue(`product-${product.id}-category`, product.category, 'Select a category.');
        requireValue(`product-${product.id}-product`, product.product, 'Select a product.');
      });
    }

    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      trackEvent('sample_form_validation_failed', {
        ...analyticsContext,
        step_index: stepIndex,
        step_name: wizardSteps[stepIndex],
        error_count: Object.keys(nextErrors).length,
        error_fields: Object.keys(nextErrors),
      });
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validateStep(currentStep)) {
      return;
    }

    trackEvent('sample_form_completed', {
      ...analyticsContext,
      step_index: currentStep,
      step_name: wizardSteps[currentStep],
      product_count: bulkModeEnabled ? bulkRows.length : products.length,
      parameter_count: bulkModeEnabled
        ? 0
        : products.reduce((count, product) => count + product.parameters.length, 0),
      customer_created_in_flow: !initialCustomers.some((customer) => customer.id === values.customerId),
      bulk_sample_creation: bulkModeEnabled,
    });

    if (bulkModeEnabled) {
      onComplete?.({ values, bulkRows, customers, bulk: true });
      return;
    }

    onComplete?.({ values, products, customers });
  };

  const showSectionTitles = layout === 'long-form';

  const handleAddProduct = () => {
    const newProduct = createProduct();
    setProducts((current) => [...current, newProduct]);
    setActiveProductTabId(newProduct.id);
  };

  const handleDeleteProductTabbed = (productId) => {
    setProducts((current) => {
      const remaining = current.filter((product) => product.id !== productId);
      if (activeProductTab === productId) {
        setActiveProductTabId(remaining[0]?.id ?? null);
      }
      return remaining;
    });
  };

  const tabbedProductSection = (
    <TabbedProductDetailsSection
      key="product-tabbed"
      products={products}
      errors={fieldErrors}
      activeProductId={activeProductTab}
      onProductSelect={setActiveProductTabId}
      onProductChange={updateProduct}
      onAddProduct={handleAddProduct}
      onDeleteProduct={handleDeleteProductTabbed}
      onParameterChange={updateParameter}
      onAutoFillParameters={handleAutoFillParameters}
      onAddParameter={(productId) => setProducts((current) => current.map((product) => (
        product.id === productId
          ? { ...product, parameters: [...product.parameters, createParameterRow()] }
          : product
      )))}
      onDeleteParameter={(productId, rowId) => setProducts((current) => current.map((product) => (
        product.id === productId
          ? { ...product, parameters: product.parameters.filter((row) => row.id !== rowId) }
          : product
      )))}
      showTitle={showSectionTitles}
    />
  );

  const plainProductSection = (
    <TabbedProductDetailsSection
      key="product-plain"
      plain
      products={products}
      errors={fieldErrors}
      activeProductId={activeProductTab}
      onProductSelect={setActiveProductTabId}
      onProductChange={updateProduct}
      onAddProduct={handleAddProduct}
      onDeleteProduct={handleDeleteProductTabbed}
      onParameterChange={updateParameter}
      onAutoFillParameters={handleAutoFillParameters}
      onAddParameter={(productId) => setProducts((current) => current.map((product) => (
        product.id === productId
          ? { ...product, parameters: [...product.parameters, createParameterRow()] }
          : product
      )))}
      onDeleteParameter={(productId, rowId) => setProducts((current) => current.map((product) => (
        product.id === productId
          ? { ...product, parameters: product.parameters.filter((row) => row.id !== rowId) }
          : product
      )))}
      showTitle={showSectionTitles}
    />
  );

  const sections = [
    <CustomerDetailsSection
      key="customer"
      values={values}
      customers={customers}
      errors={fieldErrors}
      onChange={updateValue}
      showTitle={showSectionTitles}
      onOpenCustomerModal={() => {
        setCustomerModalOpen(true);
        trackEvent('sample_form_customer_modal_opened', {
          ...analyticsContext,
          step_index: currentStep,
          step_name: wizardSteps[currentStep],
        });
      }}
    />,
    <BasicDetailsSection key="basic" values={values} onChange={updateValue} showTitle={showSectionTitles} />,
    <ProductDetailsSection
      key="product"
      products={products}
      errors={fieldErrors}
      onProductChange={updateProduct}
      onAddProduct={() => setProducts((current) => [...current, createProduct()])}
      onDeleteProduct={(productId) => setProducts((current) => current.filter((product) => product.id !== productId))}
      onParameterChange={updateParameter}
      onAutoFillParameters={handleAutoFillParameters}
      onAddParameter={(productId) => setProducts((current) => current.map((product) => (
        product.id === productId
          ? { ...product, parameters: [...product.parameters, createParameterRow()] }
          : product
      )))}
      onDeleteParameter={(productId, rowId) => setProducts((current) => current.map((product) => (
        product.id === productId
          ? { ...product, parameters: product.parameters.filter((row) => row.id !== rowId) }
          : product
      )))}
      showTitle={showSectionTitles}
    />,
    <AdditionalDetailsSection key="additional" values={values} onChange={updateValue} showTitle={showSectionTitles} />,
  ];

  const isLastStep = currentStep === wizardSteps.length - 1;
  const previousLabel = currentStep > 0 ? wizardSteps[currentStep - 1] : 'Cancel';

  if (layout === 'long-form') {
    const variantOptions = [
      { value: 'new', label: 'New' },
      { value: '50-50-split', label: '50-50 Split' },
      { value: 'long-form', label: 'Long Form' },
    ];

    return (
      <div className="smplfy-new-sample-page smplfy-original-sample-page bg-body-tertiary d-flex flex-column">
        <TopBar
          parentLabel={parentLabel}
          currentLabel={mode === 'edit' ? `Edit ${sampleTitle}` : 'New Base Sample'}
          onBack={onBackToWorkspace}
        />
        <div className="d-flex align-items-center justify-content-between gap-3 bg-white border-bottom px-4 py-3 flex-wrap">
          <div className="d-flex align-items-center gap-3 min-w-0">
            <SecondaryButton size="medium" className="px-0 flex-shrink-0" aria-label="Go back" onClick={onBackToWorkspace}>
              <AppIcon name="chevron-left" />
            </SecondaryButton>
            <h1 className="h6 fw-semibold text-body mb-0">{mode === 'edit' ? `Edit ${sampleTitle}` : 'New Base Sample'}</h1>
          </div>
          <div className="d-flex align-items-center gap-3">
            <div className="form-check form-switch mb-0 d-flex align-items-center gap-2">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="bulk-sample-creation-toggle"
                checked={bulkModeEnabled}
                onChange={(event) => setBulkModeEnabled(event.target.checked)}
              />
              <label className="form-check-label mb-0" htmlFor="bulk-sample-creation-toggle">
                Bulk sample creation
              </label>
            </div>
            <select
              className="form-select form-select-sm"
              style={{ width: 'auto' }}
              value={formVariant}
              disabled={bulkModeEnabled}
              onChange={(event) => setFormVariant(event.target.value)}
            >
              {variantOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <PrimaryButton leftIcon="save" onClick={handleSubmit}>
              Save Sample
            </PrimaryButton>
          </div>
        </div>

        {bulkModeEnabled ? (
          <main className="flex-fill overflow-auto smplfy-long-form-variant">
            <div className="d-flex flex-column" style={{ gap: '12px', padding: '16px 32px' }}>
              <div className="smplfy-card card">{sections[0]}</div>
              <BulkSampleTable
                rows={bulkRows}
                errors={fieldErrors}
                canUndoAutoFill={Boolean(bulkState.autoFillUndo)}
                onRowChange={updateBulkRow}
                onRowCountChange={setBulkRowCount}
                onAddRow={addBulkRow}
                canPasteRow={Boolean(bulkState.copiedRow)}
                onCopyRow={copyBulkRow}
                onPasteRow={pasteBulkRow}
                onDeleteRow={deleteBulkRow}
                onParameterChange={updateBulkParameter}
                onAddParameter={addBulkParameter}
                onDeleteParameter={deleteBulkParameter}
                onAutoFillParameters={autoFillBulkParameters}
                onAutoFill={autoFillBulkRows}
                onUndoAutoFill={undoAutoFillBulkRows}
              />
            </div>
          </main>
        ) : formVariant === 'new' ? (
          <main className="flex-fill overflow-auto smplfy-long-form-variant">
            <form
              ref={formRef}
              id={formId}
              style={{ padding: '16px 32px' }}
              onSubmit={(event) => {
                event.preventDefault();
                handleSubmit();
              }}
            >
              <div className="d-flex flex-column" style={{ gap: '12px' }}>
                <div className="smplfy-card card">{sections[0]}</div>
                <div className="smplfy-card card">{sections[1]}</div>
                <div className="smplfy-card card">{plainProductSection}</div>
                <div className="smplfy-card card">{sections[3]}</div>
              </div>
            </form>
          </main>
        ) : formVariant === '50-50-split' ? (
          <main className="flex-fill overflow-auto">
            <form
              ref={formRef}
              id={formId}
              style={{ padding: '16px' }}
              onSubmit={(event) => {
                event.preventDefault();
                handleSubmit();
              }}
            >
              <div className="row" style={{ '--bs-gutter-x': '12px', '--bs-gutter-y': '12px' }}>
                <div className="col-lg-6 d-flex flex-column overflow-auto" style={{ gap: '12px', maxHeight: 'calc(100vh - 140px)' }}>
                  <div className="smplfy-card card">{sections[0]}</div>
                  <div className="smplfy-card card">{sections[1]}</div>
                  <div className="smplfy-card card">{sections[3]}</div>
                </div>
                <div className="col-lg-6 d-flex flex-column overflow-auto" style={{ gap: '12px', maxHeight: 'calc(100vh - 140px)' }}>
                  <div className="smplfy-card card">{tabbedProductSection}</div>
                </div>
              </div>
            </form>
          </main>
        ) : (
          <main className="flex-fill overflow-auto smplfy-long-form-variant">
            <form
              ref={formRef}
              id={formId}
              style={{ padding: '16px 32px' }}
              onSubmit={(event) => {
                event.preventDefault();
                handleSubmit();
              }}
            >
              <div className="d-flex flex-column" style={{ gap: '12px' }}>
                <div className="smplfy-card card">{sections[0]}</div>
                <div className="smplfy-card card">{sections[1]}</div>
                <div className="smplfy-card card">{tabbedProductSection}</div>
                <div className="smplfy-card card">{sections[3]}</div>
              </div>
            </form>
          </main>
        )}

        <QuickAddCustomerModal
          open={customerModalOpen}
          onClose={() => setCustomerModalOpen(false)}
          onAdd={handleAddCustomer}
        />
      </div>
    );
  }

  return (
    <div className="smplfy-new-sample-page smplfy-original-sample-page bg-body-tertiary d-flex flex-column">
      <TopBar
        parentLabel={parentLabel}
        currentLabel={mode === 'edit' ? `Edit ${sampleTitle}` : 'New Sample'}
        onBack={onBackToWorkspace}
      />
      <main>
        <form
          id={formId}
          className="smplfy-card card"
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
        >
          <div className="d-grid h-100">
            <StepRail currentStep={currentStep} title={sampleTitle} mode={mode} />
            <div className="d-flex flex-column overflow-hidden">
              <div className="flex-fill overflow-auto">{sections[currentStep]}</div>
              <div className="d-flex align-items-center justify-content-between gap-3 p-4 border-top bg-white flex-wrap">
                <SecondaryButton
                  leftIcon={currentStep > 0 ? 'chevron-left' : 'close'}
                  onClick={() => {
                    if (currentStep === 0) {
                      trackEvent('sample_form_cancelled', { ...analyticsContext, step_index: 0, step_name: wizardSteps[0] });
                      onBackToWorkspace?.();
                      return;
                    }
                    goToStep(currentStep - 1);
                  }}
                >
                  {previousLabel}
                </SecondaryButton>

                {isLastStep ? (
                  <PrimaryButton type="submit" leftIcon="save">
                    {mode === 'edit' ? 'Save Changes' : 'Save Sample'}
                  </PrimaryButton>
                ) : (
                  <PrimaryButton
                    rightIcon="chevron-right"
                    onClick={() => {
                      if (validateStep(currentStep)) goToStep(currentStep + 1);
                    }}
                  >
                    Next
                  </PrimaryButton>
                )}
              </div>
            </div>
          </div>
        </form>
      </main>

      <QuickAddCustomerModal
        open={customerModalOpen}
        onClose={() => setCustomerModalOpen(false)}
        onAdd={handleAddCustomer}
      />
    </div>
  );
}
