import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import AppIcon from '../components/AppIcon';
import Checkbox from '../components/Checkbox/Checkbox';
import CustomerModal from '../components/CustomerModal';
import {
  FormElement,
  InputFieldRichDropdown,
  InputFieldSplitSelector,
  InputFieldText,
  InputFieldTextarea,
  ToastNotification,
} from '../components/FormControls';
import Modal from '../components/Modal/Modal';
import NavSelector from '../components/NavSelector/NavSelector';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SampleCountStepper from '../components/SampleCountStepper';
import SecondaryButton from '../components/SecondaryButton';
import StatusPill from '../components/StatusPill';
import VersionSelector from '../components/VersionSelector/VersionSelector';
import { extrapolateValue, generateAutoFillData } from '../utils/bulkAutoFill';
import './new-inward-page.scss';

/*
 * New Inward creation.
 *
 * Sample info holds everything shared by the consignment plus the product grid.
 * Product holds one card per product row, each carrying its own testing
 * parameters. Parameters are optional at this stage.
 *
 * Saving has two shapes:
 *   Save Sample               -> one sample that owns every product
 *   Save product-wise samples -> one sample per product row
 *
 * The page ships two versions, switchable from the header:
 *   default      -> Sample info / Testing Details tabs (one card per product
 *                   on the Testing Details tab)
 *   single-page  -> no tabs; everything on one scroll. Each product row in
 *                   the grid opens a right-hand drawer with just that
 *                   product's parameter table instead of a whole tab.
 */

const inwardTabs = [
  { key: 'sample-info', label: 'Sample info' },
  { key: 'testing-details', label: 'Testing Details' },
];

const versionOptions = [
  { value: 'default', label: 'Default' },
  { value: 'single-page', label: 'Single page (drawer)' },
  { value: 'case-1', label: 'Case 1' },
  { value: 'modal-first', label: 'Modal first' },
];

const sampleTypeOptions = [
  'Base',
  'ILC Sample',
  'PT Sample',
  'ILC Participation Sample',
  'Intralab Sample',
];

const receiptModeOptions = ['In person', 'Courier', 'By Post'];
// Which pageVersion was open last, so reopening New Inward picks up where
// the user left off instead of always resetting to Case 1. Storage can throw
// (private mode, disabled cookies), so every access is guarded and falls
// back to the same default the state itself would otherwise use.
const PAGE_VERSION_STORAGE_KEY = 'lims.newInward.pageVersion';
const KNOWN_PAGE_VERSIONS = ['default', 'single-page', 'case-1', 'modal-first'];

function readStoredPageVersion() {
  try {
    const stored = window.localStorage.getItem(PAGE_VERSION_STORAGE_KEY);
    return KNOWN_PAGE_VERSIONS.includes(stored) ? stored : 'case-1';
  } catch {
    return 'case-1';
  }
}

function writeStoredPageVersion(version) {
  try {
    window.localStorage.setItem(PAGE_VERSION_STORAGE_KEY, version);
  } catch {
    // Preference is a nicety; ignore storage failures.
  }
}

// "Deepak Cybit" is the signed-in user elsewhere in the app (the header's "DC"
// avatar), so Case 1 reuses it as the "my username" default for Received By.
const CASE_ONE_DEFAULT_USER = 'Deepak Cybit';
const receivedByOptions = ['Front Desk', 'Lab Manager', 'Sample Coordinator', CASE_ONE_DEFAULT_USER];

const categoryOptions = [
  'Cotton Yarn',
  'Hand Knotted',
  'Hand Tufted',
  'Handloom Carpet',
  'Jacket',
  'Jute Yarn',
  'Latex',
];

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

const sampleSizeUnitOptions = ['g', 'kg', 'mg', 'ml', 'L', 'Units'];

const initialCustomers = [
  {
    id: 'customer-acme-textiles',
    name: 'Acme Textiles',
    legalName: 'Acme Textiles Private Limited',
    gstNumber: '24AABCA1234R1ZP',
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
    gstNumber: '27AABCN5678Q1ZK',
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
    gstNumber: '24AABCB9012M1ZT',
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
    gstNumber: '24AAFCS3456L1ZQ',
    contactPerson: 'Harsh Patel',
    email: 'harsh@shaktidyeing.test',
    phone: '+91 97244 55710',
    billToAddress: 'Sachin Industrial Estate, Surat, Gujarat 394230',
    shipToAddress: 'Sachin Industrial Estate, Surat, Gujarat 394230',
    quotations: [],
  },
  {
    id: 'customer-orient-carpets',
    name: 'Orient Carpets',
    legalName: 'Orient Carpets Export House',
    gstNumber: '09AABCO7890K1ZV',
    contactPerson: 'Meera Iyer',
    email: 'meera@orientcarpets.test',
    phone: '+91 99870 34122',
    billToAddress: 'Bhadohi Carpet Zone, Bhadohi, Uttar Pradesh 221401',
    shipToAddress: 'Bhadohi Carpet Zone, Bhadohi, Uttar Pradesh 221401',
    quotations: [{ value: 'QTN-2026-0308', label: 'QTN-2026-0308 · Carpet performance suite' }],
  },
];

// Product grid: only the fields that identify the item. Everything else is
// shared on the sample, and testing details live on the Product tab.
function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

const productColumns = [
  { key: 'category', label: 'Category', width: 220, type: 'dropdown', required: true },
  { key: 'product', label: 'Product', width: 240, type: 'dropdown', required: true },
  { key: 'sampleSize', label: 'Sample Size', width: 220, type: 'sample-size' },
  { key: 'batch', label: 'Batch', width: 200, type: 'text' },
];

// Auto-fill only touches the grid columns; identity and parameters are left as-is.
const autoFillableKeys = productColumns.map(({ key }) => key);

const productSerialWidth = 116;
const productActionWidth = 132;
// Single-page version adds a leading checkbox column (bulk selection) and a
// Testing Details column (Edit button, opens the drawer) just before Action.
const productCheckboxWidth = 48;
const productTestingDetailsWidth = 140;
// Case 1's Testing Details column carries a status badge, a labeled
// "Auto-fill" button, and sometimes a "Copied from Product X" note - needs
// real room, unlike the plain Edit button the other versions use.
const caseOneProductTestingDetailsWidth = 340;
const caseOneProductCheckboxWidth = 48;

function getProductTableWidth({
  checkbox = false, testingDetails = false, action = true, testingDetailsWidth = productTestingDetailsWidth,
} = {}) {
  const extras = (checkbox ? productCheckboxWidth : 0) + (testingDetails ? testingDetailsWidth : 0);
  return productSerialWidth
    + extras
    + productColumns.reduce((total, column) => total + column.width, 0)
    + (action ? productActionWidth : 0);
}

// Customer record fields beyond name and billing address, shown behind
// "More details" on the Customer card.
const customerMoreFields = [
  ['customerLegalName', 'Legal Name', ''],
  ['customerGstNumber', 'GST Number', 'e.g. 24AABCU9603R1ZM'],
  ['customerContactPerson', 'Contact Person', ''],
  ['customerEmail', 'Contact Person Email', ''],
  ['customerPhone', 'Contact Person Phone', ''],
  ['customerShipToAddress', 'Ship to Address', 'Customer shipping address'],
];

const basicDetailFields = [
  ['customerRef', 'Customer Ref.'],
  ['sampleDrawnBy', 'Sample Drawn By'],
  ['natureOfSample', '#Nature of Sample'],
  ['specification', '#Specification'],
  ['stampedBy', 'Stamped By'],
  ['heatNo', '#Heat No'],
  ['poNo', '#PO No.'],
  ['make', '#Make'],
  ['poSrNo', 'PO Sr No.'],
];

// Case 1's Basic Details: five fields visible up front, five more behind
// "More details" so the card stays short until asked to expand.
const caseOneBasicFields = [
  ['customerRef', 'Customer Ref.'],
  ['sampleDrawnBy', 'Sample Drawn By'],
  ['natureOfSample', '#Nature of Sample'],
  ['stampedBy', 'Stamped By'],
  ['poNo', '#PO No.'],
];

const caseOneMoreBasicFields = [
  ['specification', '#Specification'],
  ['heatNo', '#Heat No'],
  ['make', '#Make'],
  ['poSrNo', 'PO Sr No.'],
  ['refDate', 'Ref. Date', 'date'],
];

// Same ten fields as caseOneBasicFields + caseOneMoreBasicFields, reshaped
// into column defs for "Product-wise" mode's table (one column per field,
// one row per product) - the {key, label, width} shape getColumnFillPlan and
// the product grid's <colgroup> already expect. refDate is kept a plain text
// column here rather than a date picker, same simplification as every other
// field in this table.
const caseOneBasicDetailColumns = [...caseOneBasicFields, ...caseOneMoreBasicFields].map(([key, label]) => ({
  key,
  label,
  width: 180,
  type: 'text',
}));

/*
 * "Modal first"'s field catalog: every field the setup modal can ask about,
 * split into two groups that mirror the two places a value can live. "Sample
 * details" is the shared `values` object (customer ref, PO no, and the rest
 * of Case 1's Basic Details) - facts about the inward as a whole. "Product
 * Details" is everything that's actually a fact about one specific product
 * row: Customer (marking it "different" changes which customer pool entry -
 * and billing address - applies to that row, not just where the value is
 * edited), Testing Details (a list of parameter rows, not a scalar, so it
 * gets its own bespoke rendering), and the four product-identity fields.
 * Category is deliberately left out of this catalog - it isn't its own
 * question, it mirrors whatever Product's own common/different answer is
 * (see ModalFirstSetupModal and ModalFirstProductDetailsCard), since a row's
 * valid categories are entirely determined by that row's product. All
 * fields share the same {key, label, group} shape so the modal can render
 * one flat chip list without caring which group a field came from - only
 * the common/per-sample split that comes out of it matters to what renders
 * next.
 */
const modalFirstCustomerField = { key: 'customerId', label: 'Customer', group: 'product' };
// Testing Details isn't a plain scalar field like the others - it's a list
// of parameter rows - so it gets its own bespoke rendering (a shared mini
// table when common, a per-row drawer badge when different) instead of the
// generic per-column table-cell treatment every other field gets. Grouped
// with Customer and the product-identity fields since, same as those, it's
// a fact about a specific product rather than the inward as a whole.
const modalFirstParametersField = { key: 'parameters', label: 'Testing Details', group: 'product' };
// Every product-identity column, including Category, shaped for rendering
// (the "Same for every product" fields and the per-row table both need to
// know about Category same as the other three). This is distinct from the
// chip catalog below, which leaves Category out - it isn't asked about on
// its own, it mirrors Product's answer (see toggleField in
// ModalFirstSetupModal, which flips both keys together).
const modalFirstProductColumnFields = productColumns.map(({ key, label }) => ({ key, label, group: 'product' }));
const modalFirstProductFields = modalFirstProductColumnFields.filter(({ key }) => key !== 'category');
// Category isn't its own chip in the setup modal - it silently mirrors
// Product's own common/different answer (see ModalFirstSetupModal's
// toggleField) instead of being asked about separately. Which categories
// are even valid for a row depends entirely on which product that row has,
// so a row with its own Product needs its own Category to match, and a row
// sharing the inward's one Product has nothing new to ask about Category
// either - the two questions never have different answers, so only one of
// them needs asking.
const modalFirstBasicFields = [...caseOneBasicFields, ...caseOneMoreBasicFields].map(([key, label]) => (
  { key, label, group: 'basic' }
));
// Includes Category (via modalFirstProductColumnFields, not the
// chip-only modalFirstProductFields) even though it has no chip of its own -
// this list seeds which keys start out "common" by default, and Category
// needs to be in that starting set the same as everything else.
const modalFirstFieldCatalog = [
  modalFirstCustomerField,
  modalFirstParametersField,
  ...modalFirstProductColumnFields,
  ...modalFirstBasicFields,
];

// Setup modal chips read top-to-bottom, left-to-right within a group, so
// alphabetizing them here (once, by the label a person actually reads - the
// leading "#" some Basic Details labels carry is a visual marker, not part
// of the word, so it's stripped for comparison only) means every group's
// chip order is predictable regardless of the order fields happen to be
// declared in above.
function sortFieldsByLabel(fields) {
  return [...fields].sort((a, b) => (
    a.label.replace(/^#/, '').localeCompare(b.label.replace(/^#/, ''))
  ));
}

function getTodayDisplayDate() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');

  return `${day}/${month}/${today.getFullYear()}`;
}

// Case 1 has no visible parameter table, but Tentative Reporting Date and
// Amount are still meant to track the product parameter details, so they're
// derived from the same category presets the rest of the form uses.
function parseDisplayDateToDate(display) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(display ?? '').trim());
  if (!match) return null;

  const parsed = new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function addDaysToDisplayDate(display, days) {
  const base = parseDisplayDateToDate(display) ?? new Date();
  const next = new Date(base);
  next.setDate(next.getDate() + days);

  const day = String(next.getDate()).padStart(2, '0');
  const month = String(next.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${next.getFullYear()}`;
}

// Slowest estimated turnaround wins (the sample can't report before its
// slowest test is done); charges are summed across every product.
function estimateFromProductCategories(products) {
  let maxDays = 0;
  let totalCharges = 0;
  let matched = false;

  products.forEach((product) => {
    (parameterPresetsByCategory[product.category] ?? []).forEach((preset) => {
      matched = true;
      maxDays = Math.max(maxDays, parseInt(preset.time, 10) || 0);
      totalCharges += parseInt(preset.charges, 10) || 0;
    });
  });

  return matched ? { days: maxDays, amount: totalCharges } : null;
}

function createId(prefix) {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function createParameterRow(seed = {}) {
  return {
    id: createId('inward-parameter'),
    parameter: '',
    method: '',
    charges: '',
    time: '',
    ...seed,
  };
}

function createProduct(seed = {}) {
  return {
    id: createId('inward-product'),
    category: '',
    product: '',
    sampleSize: { value: '', unit: '' },
    batch: '',
    parameters: [createParameterRow()],
    // Set by "Apply to all products" - which other product's parameters this
    // row is currently a copy of, so the Testing Details badge can say so.
    // Cleared the moment this row's parameters change some other way.
    parametersSourceIndex: null,
    // Case 1's Basic Details, "Product-wise" mode: each product gets its own
    // copy of the same fields the "Shared" mode's card edits on the sample
    // as a whole. Keyed by the same field keys as caseOneBasicDetailColumns.
    basicDetails: {},
    // Modal-first only, and only once Customer is marked "different": this
    // row's own customer, independent of every other row. Billing address
    // rides along with it rather than being separately classifiable - it's
    // not a fact about the sample, it's a fact about whichever customer is
    // picked, so asking "is billing address the same" as its own question
    // would let it disagree with the customer it's supposedly the address
    // of. customerId stays '' (not shared.values.customerId) until the row
    // is explicitly given one.
    customerId: '',
    billingAddress: '',
    ...seed,
  };
}

// caseOne seeds the extra defaults that version asks for: Mode of Sample
// Receipt defaults to Courier and Received By defaults to the signed-in user,
// on top of the Receiving Date / Sample Type defaults every version shares.
function createInitialValues(caseOne = false) {
  return {
    // Customer Details
    customerId: '',
    customerQuotation: '',
    receivingDate: getTodayDisplayDate(),
    sampleType: 'Base',
    billingAddress: '',
    // Copied from the selected customer, editable on the inward.
    customerLegalName: '',
    customerGstNumber: '',
    customerContactPerson: '',
    customerEmail: '',
    customerPhone: '',
    customerShipToAddress: '',
    // Basic Details
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
    // Additional Details
    receiptMode: caseOne ? 'Courier' : '',
    tentativeReportingDate: '',
    amount: '',
    receivedBy: caseOne ? CASE_ONE_DEFAULT_USER : '',
  };
}

// Customer record -> the inward's own editable copy of those fields.
function copyCustomerFields(customer) {
  return {
    billingAddress: customer?.billToAddress ?? '',
    customerLegalName: customer?.legalName ?? '',
    customerGstNumber: customer?.gstNumber ?? '',
    customerContactPerson: customer?.contactPerson ?? '',
    customerEmail: customer?.email ?? '',
    customerPhone: customer?.phone ?? '',
    customerShipToAddress: customer?.shipToAddress ?? '',
  };
}

function getParameterPreset(category, product) {
  const presets = parameterPresetsByCategory[category] ?? [];
  if (!presets.length) return [];

  const productIndex = Math.max(0, (productOptionsByCategory[category] ?? []).indexOf(product));
  if (presets.length <= 2) return presets;

  return [presets[productIndex % presets.length], presets[(productIndex + 1) % presets.length]];
}

function isParameterFilled(parameter) {
  return ['parameter', 'method', 'charges', 'time']
    .some((field) => String(parameter?.[field] ?? '').trim());
}

function countFilledParameters(product) {
  return (product.parameters ?? []).filter(isParameterFilled).length;
}

// Two products can share a category and product name, so the index always
// leads to keep the cards distinguishable.
function getProductLabel(product, index) {
  return product.product ? `Product ${index + 1} · ${product.product}` : `Product ${index + 1}`;
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

function SectionCard({ title, titleExtra, children, actions, bodyClassName = '' }) {
  return (
    <section className="smplfy-card card smplfy-inward-section">
      <div className="smplfy-inward-section-header">
        <div className="d-flex align-items-center gap-2 min-w-0">
          <h2 className="smplfy-inward-section-title">{title}</h2>
          {titleExtra}
        </div>
        {actions ? (
          <div className="flex-shrink-0 d-flex align-items-center gap-2">{actions}</div>
        ) : null}
      </div>
      <div className={`smplfy-inward-section-body ${bodyClassName}`.trim()}>{children}</div>
    </section>
  );
}

function CustomerDetailsCard({
  values,
  customers,
  errors,
  moreDetailsOpen,
  onToggleMoreDetails,
  onChange,
  onAddCustomer,
  onViewCustomer,
}) {
  const customerOptions = customers.map((customer) => ({ value: customer.id, label: customer.name }));
  const selectedCustomer = customers.find((customer) => customer.id === values.customerId);
  const quotationOptions = selectedCustomer?.quotations ?? [];
  const quotationPlaceholder = !selectedCustomer
    ? 'Select a customer first'
    : quotationOptions.length
      ? 'Select a customer quotation'
      : `No quotations found for ${selectedCustomer.name}`;

  return (
    <SectionCard
      title="Customer Details"
      actions={(
        <SecondaryButton size="medium" leftIcon="plus" onClick={onAddCustomer}>
          Customer
        </SecondaryButton>
      )}
    >
      <div className="row g-4">
        <div className="col-md-6 col-xl-3">
          <div className="smplfy-form-field">
            <div className="smplfy-form-label-row">
              <label className="smplfy-form-label form-label" htmlFor="inward-customer">Customer</label>
              <span className="smplfy-form-required">*</span>
            </div>
            <div className="d-flex align-items-stretch gap-2">
              <InputFieldRichDropdown
                id="inward-customer"
                className="flex-grow-1"
                value={values.customerId}
                state={errors.customerId ? 'error' : undefined}
                options={customerOptions}
                placeholder="Select a Customer"
                searchable
                searchPlaceholder="Search customers"
                maxVisibleItems={5}
                onChange={(event) => onChange('customerId', event.target.value)}
              />
              <SecondaryButton
                size="medium"
                leftIcon="info-circle"
                className="smplfy-inward-icon-button p-0"
                aria-label="View customer details"
                data-tooltip={selectedCustomer ? 'View customer details' : 'Select a customer first'}
                disabled={!selectedCustomer}
                onClick={onViewCustomer}
              />
            </div>
            {errors.customerId ? (
              <div className="smplfy-form-feedback invalid-feedback d-block">{errors.customerId}</div>
            ) : null}
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
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

        <div className="col-md-6 col-xl-3">
          <FormElement
            type="date"
            mandatory
            label="Receiving Date"
            message={errors.receivingDate}
            messageTone="error"
            inputProps={{
              value: values.receivingDate,
              placeholder: 'DD/MM/YYYY',
              onChange: (event) => onChange('receivingDate', event.target.value),
            }}
          />
        </div>

        <div className="col-md-6 col-xl-3">
          <FormElement
            type="rich-dropdown"
            mandatory
            label="Sample Type"
            message={errors.sampleType}
            messageTone="error"
            inputProps={{
              value: values.sampleType,
              options: sampleTypeOptions,
              placeholder: 'Select sample type',
              searchable: true,
              onChange: (event) => onChange('sampleType', event.target.value),
            }}
          />
        </div>

        <div className="col-12 col-xl-9">
          <div className="smplfy-form-field">
            <div className="smplfy-form-label-row">
              <label className="smplfy-form-label form-label" htmlFor="inward-billing-address">
                Billing Address
              </label>
              <span className="smplfy-form-required">*</span>
            </div>
            <InputFieldTextarea
              id="inward-billing-address"
              value={values.billingAddress}
              state={errors.billingAddress ? 'error' : undefined}
              rows={1}
              placeholder="Customer billing address"
              style={{ resize: 'vertical', minHeight: 'var(--smplfy-field-height)' }}
              onChange={(event) => onChange('billingAddress', event.target.value)}
            />
            {errors.billingAddress ? (
              <div className="smplfy-form-feedback invalid-feedback d-block">{errors.billingAddress}</div>
            ) : null}
          </div>
        </div>

        {/* Its own field-shaped column, sibling to Billing Address rather than
            packed into that field's label row, so it lines up with the other
            fields in the grid. The empty label row is a spacer: it keeps the
            button's baseline level with every other field's input row. */}
        <div className="col-12 col-xl-3">
          <div className="smplfy-form-field smplfy-inward-more-details-field">
            <div className="smplfy-form-label-row" aria-hidden="true">
              <span className="smplfy-form-label form-label">&nbsp;</span>
            </div>
            <button
              type="button"
              className="smplfy-field-shell-button smplfy-inward-more-details-toggle btn"
              aria-expanded={moreDetailsOpen}
              aria-controls="inward-customer-more-details"
              onClick={onToggleMoreDetails}
            >
              <span>More details</span>
              <AppIcon name={moreDetailsOpen ? 'chevron-up' : 'chevron-down'} size={16} stroke={2} />
            </button>
          </div>
        </div>

        {/* The rest of the customer record, prefilled from the selection and
            editable on the inward. Collapsed until asked for. */}
        {moreDetailsOpen ? (
          <div className="col-12" id="inward-customer-more-details">
            <div className="row g-4">
              {customerMoreFields.map(([key, label, placeholder]) => (
                <div
                  // Ship to Address fills the rest of its row.
                  className={key === 'customerShipToAddress' ? 'col-12 col-xl-9' : 'col-md-6 col-xl-3'}
                  key={key}
                >
                  <FormElement
                    type={key === 'customerShipToAddress' ? 'textarea' : 'text'}
                    label={label}
                    inputProps={{
                      value: values[key] ?? '',
                      placeholder,
                      ...(key === 'customerShipToAddress'
                        ? {
                            rows: 1,
                            style: { resize: 'vertical', minHeight: 'var(--smplfy-field-height)' },
                          }
                        : {}),
                      onChange: (event) => onChange(key, event.target.value),
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </SectionCard>
  );
}

function BasicDetailsCard({ values, onChange }) {
  return (
    <SectionCard title="Basic Details">
      <div className="row g-4">
        <div className="col-md-6 col-xl-3">
          <div className="smplfy-form-field">
            <div className="smplfy-form-label-row">
              <label className="smplfy-form-label form-label" htmlFor="inward-report-number">Report No.</label>
            </div>
            <div className="d-flex align-items-stretch gap-2">
              <InputFieldText
                id="inward-report-number"
                className="flex-grow-1"
                value={values.reportNumber}
                onChange={(event) => onChange('reportNumber', event.target.value)}
              />
              <SecondaryButton
                size="medium"
                leftIcon="refresh"
                className="smplfy-inward-icon-button p-0"
                aria-label="Generate report number"
                data-tooltip="Generate report number"
                onClick={() => onChange(
                  'reportNumber',
                  `IICT/${new Date().getFullYear()}/${String(Date.now()).slice(-6)}`,
                )}
              />
            </div>
          </div>
        </div>

        {basicDetailFields.map(([key, label]) => (
          <div className="col-md-6 col-xl-3" key={key}>
            <FormElement
              type="text"
              label={label}
              inputProps={{
                value: values[key] ?? '',
                onChange: (event) => onChange(key, event.target.value),
              }}
            />
          </div>
        ))}

        <div className="col-md-6 col-xl-3">
          <FormElement
            type="date"
            label="Ref. Date"
            inputProps={{
              value: values.refDate,
              placeholder: 'DD/MM/YYYY',
              onChange: (event) => onChange('refDate', event.target.value),
            }}
          />
        </div>
      </div>
    </SectionCard>
  );
}

function ProductDetailsCard({
  products,
  errors,
  copiedProduct,
  singlePage,
  selectedProductIds,
  onCellChange,
  onCountChange,
  onAddProduct,
  onCopy,
  onPaste,
  onDelete,
  onAutoFill,
  onOpenTestingDetails,
  onToggleProductSelected,
  onToggleAllProductsSelected,
  onBulkDelete,
  onBulkAutoFillColumn,
}) {
  const canAutoFill = products.length >= 3;
  const allSelected = singlePage && products.length > 0 && selectedProductIds.length === products.length;
  const someSelected = singlePage && selectedProductIds.length > 0;
  // Auto-fill column only ever touches rows past the first two (the pattern
  // source), same restriction as the header Auto-fill.
  const selectedAutoFillableIndexes = selectedProductIds
    .map((id) => products.findIndex((product) => product.id === id))
    .filter((index) => index >= 2);
  const canBulkAutoFill = canAutoFill && selectedAutoFillableIndexes.length > 0;
  const canBulkDelete = someSelected && selectedProductIds.length < products.length;

  const renderCell = (product, productIndex, column) => {
    const errorKey = `product-${product.id}-${column.key}`;
    const hasError = Boolean(errors[errorKey]);
    const sharedProps = {
      variant: 'table-cell',
      state: hasError ? 'error' : undefined,
      'aria-label': `${column.label} for product ${productIndex + 1}`,
      'aria-invalid': hasError || undefined,
      'aria-required': column.required || undefined,
      title: errors[errorKey] || undefined,
    };

    if (column.type === 'sample-size') {
      const currentValue = product.sampleSize ?? { value: '', unit: '' };

      return (
        <InputFieldSplitSelector
          value={currentValue.value}
          unit={currentValue.unit}
          units={sampleSizeUnitOptions}
          placeholder="Value"
          unitPlaceholder="Unit"
          className="smplfy-field-table-cell"
          aria-label={`Sample size for product ${productIndex + 1}`}
          onChange={(event) => onCellChange(product.id, 'sampleSize', {
            value: event.target.value,
            unit: event.target.unit,
          })}
        />
      );
    }

    if (column.type === 'dropdown') {
      const isProductColumn = column.key === 'product';
      const options = isProductColumn
        ? productOptionsByCategory[product.category] ?? []
        : categoryOptions;

      return (
        <InputFieldRichDropdown
          {...sharedProps}
          value={product[column.key]}
          options={options}
          placeholder={
            isProductColumn && !product.category
              ? 'Select category first'
              : `Select ${column.label.toLowerCase()}`
          }
          disabled={isProductColumn && !product.category}
          searchable
          onChange={(event) => onCellChange(product.id, column.key, event.target.value)}
        />
      );
    }

    return (
      <InputFieldText
        {...sharedProps}
        value={product[column.key] || ''}
        onChange={(event) => onCellChange(product.id, column.key, event.target.value)}
      />
    );
  };

  return (
    <SectionCard
      title="Product Details"
      actions={(
        <>
          <SampleCountStepper
            label="No. of products:"
            value={products.length}
            onChange={onCountChange}
            onDecrement={() => onDelete(products[products.length - 1]?.id)}
            onIncrement={onAddProduct}
          />
          <PrimaryButton
            size="medium"
            leftIcon="refresh"
            disabled={!canAutoFill}
            title={
              canAutoFill
                ? 'Continue the pattern from products 1 and 2'
                : 'Add a third product to extend the pattern from the first two'
            }
            onClick={onAutoFill}
          >
            Auto-fill
          </PrimaryButton>
        </>
      )}
    >
      {/* Bulk action row: lives in the body (not the card header) because it
          only applies once rows are checked, unlike the header's Auto-fill
          which always acts on the whole table. Single-page version only. */}
      {singlePage ? (
        <div className="smplfy-inward-bulk-actions">
          <span className="smplfy-inward-bulk-actions-label">
            {selectedProductIds.length
              ? `${selectedProductIds.length} selected`
              : 'Select products to bulk edit'}
          </span>
          <div className="d-flex align-items-center gap-2">
            <SecondaryButton
              size="medium"
              leftIcon="refresh"
              disabled={!canBulkAutoFill}
              title={
                canBulkAutoFill
                  ? 'Continue the pattern from products 1 and 2 for the selected rows'
                  : 'Select a product past the first two to auto-fill'
              }
              onClick={onBulkAutoFillColumn}
            >
              Auto-fill column
            </SecondaryButton>
            <SecondaryButton
              size="medium"
              tone="danger"
              leftIcon="trash"
              disabled={!canBulkDelete}
              title={canBulkDelete ? 'Delete selected products' : 'Select products to delete, keeping at least one'}
              onClick={onBulkDelete}
            >
              Delete
            </SecondaryButton>
          </div>
        </div>
      ) : null}

      <div className="smplfy-inward-table-frame">
        <div className="smplfy-inward-table-viewport">
          <table
            className="smplfy-inward-table"
            style={{
              width: '100%',
              minWidth: `${getProductTableWidth({ checkbox: singlePage, testingDetails: singlePage })}px`,
            }}
          >
            <caption className="visually-hidden">Products in this sample</caption>
            <colgroup>
              {singlePage ? <col style={{ width: `${productCheckboxWidth}px` }} /> : null}
              <col style={{ width: `${productSerialWidth}px` }} />
              {productColumns.map((column) => (
                <col key={column.key} style={{ width: `${column.width}px` }} />
              ))}
              {singlePage ? <col style={{ width: `${productTestingDetailsWidth}px` }} /> : null}
              <col style={{ width: `${productActionWidth}px` }} />
            </colgroup>
            <thead>
              <tr>
                {singlePage ? (
                  <th scope="col" className="text-center">
                    <Checkbox
                      checked={allSelected}
                      ariaLabel="Select all products"
                      onChange={onToggleAllProductsSelected}
                    />
                  </th>
                ) : null}
                <th scope="col" className="smplfy-inward-serial-cell">Product</th>
                {productColumns.map((column) => (
                  <th key={column.key} scope="col">
                    {column.label}
                    {column.required ? <span className="smplfy-inward-required"> *</span> : null}
                  </th>
                ))}
                {singlePage ? <th scope="col">Testing Details</th> : null}
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, productIndex) => (
                <tr key={product.id}>
                  {singlePage ? (
                    <td className="text-center">
                      <Checkbox
                        checked={selectedProductIds.includes(product.id)}
                        ariaLabel={`Select product ${productIndex + 1}`}
                        onChange={(checked) => onToggleProductSelected(product.id, checked)}
                      />
                    </td>
                  ) : null}
                  <th scope="row" className="smplfy-inward-serial-cell">
                    <span className="smplfy-inward-serial-label">Product {productIndex + 1}</span>
                  </th>

                  {productColumns.map((column) => (
                    <td key={column.key}>{renderCell(product, productIndex, column)}</td>
                  ))}

                  {singlePage ? (
                    <td className="smplfy-inward-testing-details-cell">
                      <PrimaryButton
                        size="small"
                        onClick={() => onOpenTestingDetails(product.id)}
                      >
                        Edit
                      </PrimaryButton>
                    </td>
                  ) : null}

                  <td className="smplfy-inward-action-cell">
                    <div className="d-inline-flex align-items-center gap-1">
                      <SecondaryButton
                        size="small"
                        leftIcon="copy"
                        aria-label={`Copy product ${productIndex + 1}`}
                        data-tooltip="Copy this product"
                        onClick={() => onCopy(product.id)}
                      />
                      <SecondaryButton
                        size="small"
                        leftIcon="clipboard-text"
                        aria-label={`Paste into product ${productIndex + 1}`}
                        data-tooltip={copiedProduct ? 'Paste into this product' : 'Copy a product first'}
                        disabled={!copiedProduct}
                        onClick={() => onPaste(product.id)}
                      />
                      <SecondaryButton
                        size="small"
                        tone="danger"
                        leftIcon="trash"
                        aria-label={`Delete product ${productIndex + 1}`}
                        data-tooltip={products.length > 1 ? 'Delete this product' : 'Keep at least one product'}
                        disabled={products.length === 1}
                        onClick={() => onDelete(product.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SectionCard>
  );
}

function AdditionalDetailsCard({ values, onChange }) {
  return (
    <SectionCard title="Additional Details">
      <div className="row g-4">
        <div className="col-md-6 col-xl-3">
          <FormElement
            type="rich-dropdown"
            label="Mode of Sample Receipt"
            inputProps={{
              value: values.receiptMode,
              options: receiptModeOptions,
              placeholder: 'Select receipt mode',
              searchable: true,
              onChange: (event) => onChange('receiptMode', event.target.value),
            }}
          />
        </div>
        <div className="col-md-6 col-xl-3">
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
        <div className="col-md-6 col-xl-3">
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
        <div className="col-md-6 col-xl-3">
          <FormElement
            type="rich-dropdown"
            label="Received By"
            inputProps={{
              value: values.receivedBy,
              options: receivedByOptions,
              placeholder: 'Select a user',
              searchable: true,
              onChange: (event) => onChange('receivedBy', event.target.value),
            }}
          />
        </div>
      </div>
    </SectionCard>
  );
}

/*
 * Case 1's Customer Details card: the whole point is that the only field the
 * user actively fills in is Customer, plus the billing address that comes
 * with it. Receiving Date and Sample Type live directly on the page above
 * every card (see the render below), not inside this one. "New Customer"
 * sits in the card header rather than beside the dropdown.
 */
function CaseOneCustomerCard({
  values,
  customers,
  errors,
  moreDetailsOpen,
  onChange,
  onAddCustomer,
  onViewCustomer,
  onToggleMoreDetails,
}) {
  const customerOptions = customers.map((customer) => ({ value: customer.id, label: customer.name }));
  const selectedCustomer = customers.find((customer) => customer.id === values.customerId);

  return (
    <SectionCard
      title="Customer Details"
      actions={(
        <SecondaryButton size="medium" leftIcon="plus" onClick={onAddCustomer}>
          New Customer
        </SecondaryButton>
      )}
    >
      <div className="row g-4">
        <div className="col-md-6 col-xl-3">
          <div className="smplfy-form-field">
            <div className="smplfy-form-label-row">
              <label className="smplfy-form-label form-label" htmlFor="inward-case-one-customer">Customer</label>
              <span className="smplfy-form-required">*</span>
            </div>
            <div className="d-flex align-items-stretch gap-2">
              <InputFieldRichDropdown
                id="inward-case-one-customer"
                className="flex-grow-1"
                value={values.customerId}
                state={errors.customerId ? 'error' : undefined}
                options={customerOptions}
                placeholder="Select a Customer"
                searchable
                searchPlaceholder="Search customers"
                maxVisibleItems={5}
                onChange={(event) => onChange('customerId', event.target.value)}
              />
              <SecondaryButton
                size="medium"
                leftIcon="info-circle"
                className="smplfy-inward-icon-button p-0"
                aria-label="View customer details"
                data-tooltip={selectedCustomer ? 'View customer details' : 'Select a customer first'}
                disabled={!selectedCustomer}
                onClick={onViewCustomer}
              />
            </div>
            {errors.customerId ? (
              <div className="smplfy-form-feedback invalid-feedback d-block">{errors.customerId}</div>
            ) : null}
          </div>
        </div>

        <div className="col-md-6 col-xl-6">
          <div className="smplfy-form-field">
            <div className="smplfy-form-label-row">
              <label className="smplfy-form-label form-label" htmlFor="inward-case-one-billing-address">
                Billing Address
              </label>
              <span className="smplfy-form-required">*</span>
            </div>
            <InputFieldTextarea
              id="inward-case-one-billing-address"
              value={values.billingAddress}
              state={errors.billingAddress ? 'error' : undefined}
              rows={1}
              placeholder="Customer billing address"
              style={{ resize: 'vertical', minHeight: 'var(--smplfy-field-height)' }}
              onChange={(event) => onChange('billingAddress', event.target.value)}
            />
            {errors.billingAddress ? (
              <div className="smplfy-form-feedback invalid-feedback d-block">{errors.billingAddress}</div>
            ) : null}
          </div>
        </div>

        {/* Its own field-shaped column, sibling to the address rather than
            packed into its label row, so it lines up with the other fields
            in the row. The empty label row is a spacer matching the height
            of a real label above the address field. */}
        <div className="col-md-6 col-xl-3">
          <div className="smplfy-form-field smplfy-inward-more-details-field">
            <div className="smplfy-form-label-row" aria-hidden="true">
              <span className="smplfy-form-label form-label">&nbsp;</span>
            </div>
            <button
              type="button"
              className="smplfy-field-shell-button smplfy-inward-more-details-toggle btn"
              aria-expanded={moreDetailsOpen}
              aria-controls="inward-case-one-customer-more-details"
              onClick={onToggleMoreDetails}
            >
              <span>More details</span>
              <AppIcon name={moreDetailsOpen ? 'chevron-up' : 'chevron-down'} size={16} stroke={2} />
            </button>
          </div>
        </div>

        {moreDetailsOpen ? (
          <div className="col-12" id="inward-case-one-customer-more-details">
            <div className="row g-4">
              {customerMoreFields.map(([key, label, placeholder]) => (
                <div
                  className={key === 'customerShipToAddress' ? 'col-12 col-xl-9' : 'col-md-6 col-xl-3'}
                  key={key}
                >
                  <FormElement
                    type={key === 'customerShipToAddress' ? 'textarea' : 'text'}
                    label={label}
                    inputProps={{
                      value: values[key] ?? '',
                      placeholder,
                      ...(key === 'customerShipToAddress'
                        ? {
                            rows: 1,
                            style: { resize: 'vertical', minHeight: 'var(--smplfy-field-height)' },
                          }
                        : {}),
                      onChange: (event) => onChange(key, event.target.value),
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </SectionCard>
  );
}

/*
 * Shared vs Product-wise toggle: Product-wise only makes sense with more
 * than one product (with one, the two modes edit exactly the same field),
 * so it's disabled otherwise and explains itself with a small tooltip on
 * click rather than just silently doing nothing.
 */
function BasicDetailsModeToggle({ mode, onChange, disabled }) {
  const [showDisabledHint, setShowDisabledHint] = useState(false);

  return (
    <div className="smplfy-inward-mode-toggle-wrap">
      <div className="smplfy-inward-mode-toggle" role="group" aria-label="Basic details layout">
        <button
          type="button"
          className={joinClasses('smplfy-inward-mode-toggle-option', mode === 'shared' && 'active')}
          onClick={() => onChange('shared')}
        >
          Shared
        </button>
        <button
          type="button"
          // Not a real disabled button: a native disabled button swallows
          // the click entirely, and the whole point of this state is to
          // respond to that click with an explanation instead of nothing.
          className={joinClasses(
            'smplfy-inward-mode-toggle-option',
            mode === 'product-wise' && 'active',
            disabled && 'is-disabled-look',
          )}
          aria-disabled={disabled}
          onClick={() => {
            if (disabled) {
              setShowDisabledHint(true);
              window.setTimeout(() => setShowDisabledHint(false), 2500);
              return;
            }
            onChange('product-wise');
          }}
        >
          Product-wise
        </button>
      </div>
      {showDisabledHint ? (
        <div className="smplfy-inward-mode-toggle-hint" role="tooltip">
          Product-wise only works when multiple products are added.
        </div>
      ) : null}
    </div>
  );
}

/*
 * Case 1's Basic Details: five fields visible, a "More details" button
 * expands five more. No Report No. field on this version. With more than one
 * product, a Shared/Product-wise toggle switches the whole card between one
 * set of fields for the sample and a per-product grid of the same fields.
 */
function CaseOneBasicDetailsCard({
  values,
  onChange,
  moreDetailsOpen,
  onToggleMoreDetails,
  products,
  mode,
  onModeChange,
  selectedColumnKey,
  selectedRowId,
  onSelectColumn,
  onSelectRow,
  onSelectCell,
  onCellChange,
  onAutoFill,
  onAutoFillColumn,
}) {
  const isProductWise = mode === 'product-wise' && products.length > 1;

  return (
    <SectionCard
      title="Basic Details"
      titleExtra={(
        <BasicDetailsModeToggle mode={mode} onChange={onModeChange} disabled={products.length <= 1} />
      )}
      actions={!isProductWise ? (
        <SecondaryButton
          size="medium"
          rightIcon={moreDetailsOpen ? 'chevron-up' : 'chevron-down'}
          aria-expanded={moreDetailsOpen}
          aria-controls="inward-case-one-basic-more"
          onClick={onToggleMoreDetails}
        >
          More details
        </SecondaryButton>
      ) : null}
    >
      {isProductWise ? (
        <CaseOneBasicDetailsTable
          products={products}
          selectedColumnKey={selectedColumnKey}
          selectedRowId={selectedRowId}
          onSelectColumn={onSelectColumn}
          onSelectRow={onSelectRow}
          onSelectCell={onSelectCell}
          onCellChange={onCellChange}
          onAutoFill={onAutoFill}
          onAutoFillColumn={onAutoFillColumn}
        />
      ) : (
        /* One shared row rather than two stacked ones: bootstrap's flex-wrap
            fills any space left on the first line before starting a new one,
            so the "more" fields continue right where the visible ones left
            off instead of always beginning on their own row. */
        <div className="row g-4">
          {caseOneBasicFields.map(([key, label]) => (
            <div className="col-md-6 col-xl-3" key={key}>
              <FormElement
                type="text"
                label={label}
                inputProps={{
                  value: values[key] ?? '',
                  onChange: (event) => onChange(key, event.target.value),
                }}
              />
            </div>
          ))}

          {moreDetailsOpen ? (
            <>
              {caseOneMoreBasicFields.map(([key, label, type]) => (
                <div className="col-md-6 col-xl-3" key={key} id={key === caseOneMoreBasicFields[0][0] ? 'inward-case-one-basic-more' : undefined}>
                  <FormElement
                    type={type ?? 'text'}
                    label={label}
                    inputProps={{
                      value: values[key] ?? '',
                      ...(type === 'date' ? { placeholder: 'DD/MM/YYYY' } : {}),
                      onChange: (event) => onChange(key, event.target.value),
                    }}
                  />
                </div>
              ))}
            </>
          ) : null}
        </div>
      )}
    </SectionCard>
  );
}

/*
 * "Product-wise" Basic Details: same grid pattern as the product table
 * (column/row click-to-select with an overlay frame, Tab walks the selected
 * column forward, Auto-fill / Auto-fill column reuse the same "pattern from
 * the last two filled rows, or copy the one filled row" logic) but simpler -
 * every field here is plain text, so there's no dropdown/sample-size special
 * casing and no checkbox column or action center to duplicate.
 */
function CaseOneBasicDetailsTable({
  products,
  selectedColumnKey,
  selectedRowId,
  onSelectColumn,
  onSelectRow,
  onSelectCell,
  onCellChange,
  onAutoFill,
  onAutoFillColumn,
}) {
  const headerRefs = useRef({});
  const tableViewportRef = useRef(null);
  const tbodyRef = useRef(null);
  const rowRefs = useRef({});
  // Exempts this table's own Auto-fill/Auto-fill column button from the
  // "click elsewhere clears the column selection" listener below, same
  // reasoning as the product grid's actionCenterRef.
  const toolbarRef = useRef(null);
  const [selectionOverlayRect, setSelectionOverlayRect] = useState(null);

  const recomputeSelectionOverlay = useCallback(() => {
    const viewport = tableViewportRef.current;
    if (!viewport) {
      setSelectionOverlayRect(null);
      return;
    }

    if (selectedColumnKey) {
      const headerCell = headerRefs.current[selectedColumnKey];
      const tbody = tbodyRef.current;
      if (!headerCell || !tbody) {
        setSelectionOverlayRect(null);
        return;
      }

      const viewportRect = viewport.getBoundingClientRect();
      const headerRect = headerCell.getBoundingClientRect();
      const tbodyRect = tbody.getBoundingClientRect();

      setSelectionOverlayRect({
        left: headerRect.left - viewportRect.left + viewport.scrollLeft,
        top: headerRect.top - viewportRect.top + viewport.scrollTop,
        width: headerRect.width,
        height: tbodyRect.bottom - headerRect.top,
      });
      return;
    }

    if (selectedRowId) {
      const row = rowRefs.current[selectedRowId];
      if (!row) {
        setSelectionOverlayRect(null);
        return;
      }

      const cells = row.querySelectorAll('th, td');
      const serialCell = cells[0];
      const lastCell = cells[caseOneBasicDetailColumns.length];
      if (!serialCell || !lastCell) {
        setSelectionOverlayRect(null);
        return;
      }

      const viewportRect = viewport.getBoundingClientRect();
      const serialRect = serialCell.getBoundingClientRect();
      const lastRect = lastCell.getBoundingClientRect();

      setSelectionOverlayRect({
        left: serialRect.left - viewportRect.left + viewport.scrollLeft,
        top: serialRect.top - viewportRect.top + viewport.scrollTop,
        width: lastRect.right - serialRect.left,
        height: serialRect.height,
      });
      return;
    }

    setSelectionOverlayRect(null);
  }, [selectedColumnKey, selectedRowId]);

  useLayoutEffect(() => {
    recomputeSelectionOverlay();
  }, [recomputeSelectionOverlay, products.length]);

  useEffect(() => {
    if (!selectedColumnKey && !selectedRowId) return undefined;

    window.addEventListener('resize', recomputeSelectionOverlay);
    return () => window.removeEventListener('resize', recomputeSelectionOverlay);
  }, [selectedColumnKey, selectedRowId, recomputeSelectionOverlay]);

  // Excel-like: clicking anywhere that isn't the selected column's own
  // header cell (or this table's own toolbar) drops the selection.
  useEffect(() => {
    if (!selectedColumnKey) return undefined;

    const handlePointerDown = (event) => {
      const headerCell = headerRefs.current[selectedColumnKey];
      if (headerCell?.contains(event.target)) return;
      if (toolbarRef.current?.contains(event.target)) return;
      onSelectCell();
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => document.removeEventListener('pointerdown', handlePointerDown, true);
  }, [selectedColumnKey, onSelectCell]);

  const handleHeaderKeyDown = (event, columnIndex) => {
    if (event.key !== 'Tab' || event.shiftKey) return;

    const nextColumn = caseOneBasicDetailColumns[columnIndex + 1];
    if (!nextColumn) return;

    event.preventDefault();
    onSelectColumn(nextColumn.key, { forceSelect: true });
    window.requestAnimationFrame(() => {
      headerRefs.current[nextColumn.key]?.focus();
    });
  };

  const canAutoFill = products.length >= 2;
  const canColumnAutoFill = Boolean(selectedColumnKey) && products.length >= 2;

  return (
    <>
      <div className="d-flex align-items-center justify-content-end mb-3" ref={toolbarRef}>
        <PrimaryButton
          size="medium"
          leftIcon="refresh"
          disabled={selectedColumnKey ? !canColumnAutoFill : !canAutoFill}
          onClick={() => (selectedColumnKey ? onAutoFillColumn(selectedColumnKey) : onAutoFill())}
        >
          {selectedColumnKey ? 'Auto-fill column' : 'Auto-fill'}
        </PrimaryButton>
      </div>
      <div className="smplfy-inward-table-frame">
        <div className="smplfy-inward-table-viewport" ref={tableViewportRef}>
          {selectionOverlayRect ? (
            <div
              className="smplfy-inward-selection-overlay"
              style={{
                left: `${selectionOverlayRect.left}px`,
                top: `${selectionOverlayRect.top}px`,
                width: `${selectionOverlayRect.width}px`,
                height: `${selectionOverlayRect.height}px`,
              }}
              aria-hidden="true"
            />
          ) : null}
          <table
            className="smplfy-inward-table"
            style={{
              width: '100%',
              minWidth: `${productSerialWidth + caseOneBasicDetailColumns.reduce((total, column) => total + column.width, 0)}px`,
            }}
          >
            <caption className="visually-hidden">Basic details per product</caption>
            <colgroup>
              <col style={{ width: `${productSerialWidth}px` }} />
              {caseOneBasicDetailColumns.map((column) => (
                <col key={column.key} style={{ width: `${column.width}px` }} />
              ))}
            </colgroup>
            <thead>
              <tr>
                {/* Ten columns wide enough to need horizontal scroll - the
                    Product column stays pinned to the left edge of that
                    scroll so it's always clear which row is which. */}
                <th scope="col" className="smplfy-inward-serial-cell smplfy-inward-sticky-first-col">Product</th>
                {caseOneBasicDetailColumns.map((column, columnIndex) => (
                  <th
                    key={column.key}
                    ref={(node) => { headerRefs.current[column.key] = node; }}
                    scope="col"
                    tabIndex={selectedColumnKey === column.key ? 0 : -1}
                    className={joinClasses(
                      'smplfy-inward-selectable-header',
                      selectedColumnKey === column.key && 'is-selected',
                    )}
                    onClick={() => onSelectColumn(column.key)}
                    onKeyDown={(event) => handleHeaderKeyDown(event, columnIndex)}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody ref={tbodyRef}>
              {products.map((product, productIndex) => {
                const isRowSelected = selectedRowId === product.id;

                return (
                  <tr key={product.id} ref={(node) => { rowRefs.current[product.id] = node; }}>
                    <th
                      scope="row"
                      className={joinClasses(
                        'smplfy-inward-serial-cell',
                        'smplfy-inward-selectable-header',
                        'smplfy-inward-sticky-first-col',
                        isRowSelected && 'is-selected smplfy-inward-row-selected',
                      )}
                      onClick={() => onSelectRow(product.id)}
                    >
                      <span className="smplfy-inward-serial-label">Product {productIndex + 1}</span>
                    </th>
                    {caseOneBasicDetailColumns.map((column) => (
                      <td
                        key={column.key}
                        className={joinClasses(
                          (selectedColumnKey === column.key || isRowSelected) && 'smplfy-inward-column-selected',
                        )}
                        onFocus={() => onSelectCell()}
                      >
                        <InputFieldText
                          variant="table-cell"
                          aria-label={`${column.label} for product ${productIndex + 1}`}
                          value={product.basicDetails?.[column.key] ?? ''}
                          onChange={(event) => onCellChange(product.id, column.key, event.target.value)}
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/*
 * The toolbar above a product-style grid: Undo/Redo on the left, Auto-fill /
 * Copy / Paste / Delete in the middle (their labels and disabled state shift
 * with whatever's selected), and a plain-language status line on the right
 * ("3 rows selected", "Select rows to paste data", etc). Shared by Case 1's
 * product table and, later, its Product-wise Basic Details table - both are
 * "a grid of rows with checkboxes and a column/row selection" underneath.
 */
function GridActionCenter({
  selectedRowCount,
  totalRowCount,
  hasCopiedRow,
  onSelectAll,
  onClearSelection,
  onInvertSelection,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onAutoFill,
  autoFillLabel = 'Auto-fill',
  canAutoFill,
  canCopy,
  onCopy,
  canPaste,
  onPaste,
  canDelete,
  onDelete,
}) {
  const statusText = selectedRowCount > 0
    ? `${selectedRowCount} ${selectedRowCount === 1 ? 'row' : 'rows'} selected`
    : hasCopiedRow
      ? 'Select rows to paste data'
      : 'Select a row to copy, or rows to delete';

  return (
    <div className="smplfy-inward-action-center">
      <div className="d-flex align-items-center gap-3">
        <div className="smplfy-inward-action-center-status">{statusText}</div>
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="smplfy-inward-selection-link-button"
            disabled={selectedRowCount === totalRowCount}
            onClick={onSelectAll}
          >
            Select all
          </button>
          <button
            type="button"
            className="smplfy-inward-selection-link-button"
            disabled={selectedRowCount === 0}
            onClick={onClearSelection}
          >
            Clear selection
          </button>
          <button
            type="button"
            className="smplfy-inward-selection-link-button"
            disabled={totalRowCount === 0}
            onClick={onInvertSelection}
          >
            Invert selection
          </button>
        </div>
      </div>
      <div className="d-flex align-items-center gap-2">
        <SecondaryButton
          size="medium"
          leftIcon="undo"
          aria-label="Undo"
          data-tooltip="Undo"
          disabled={!canUndo}
          onClick={onUndo}
        />
        <SecondaryButton
          size="medium"
          leftIcon="redo"
          aria-label="Redo"
          data-tooltip="Redo"
          disabled={!canRedo}
          onClick={onRedo}
        />
        <PrimaryButton size="medium" leftIcon="refresh" disabled={!canAutoFill} onClick={onAutoFill}>
          {autoFillLabel}
        </PrimaryButton>
        <SecondaryButton
          size="medium"
          leftIcon="copy"
          disabled={!canCopy}
          title={canCopy ? 'Copy the selected row' : 'Select exactly one row to copy'}
          onClick={onCopy}
        >
          Copy row
        </SecondaryButton>
        <SecondaryButton
          size="medium"
          leftIcon="clipboard-text"
          disabled={!canPaste}
          title={canPaste ? 'Paste into every selected row' : 'Copy a row, then select rows to paste into'}
          onClick={onPaste}
        >
          Paste in selected rows
        </SecondaryButton>
        <SecondaryButton
          size="medium"
          tone="danger"
          leftIcon="trash"
          disabled={!canDelete}
          title={canDelete ? 'Delete the selected rows' : 'Select rows to delete, keeping at least one'}
          onClick={onDelete}
        >
          Delete
        </SecondaryButton>
      </div>
    </div>
  );
}

/*
 * Case 1's Product Details. One product: a plain Category/Product dropdown
 * pair, no table. More than one: the same grid the other versions use. The
 * body swaps shape live as the count stepper crosses that line.
 */
function CaseOneProductDetailsCard({
  products,
  errors,
  hasLastSampleProducts,
  selectedColumnKey,
  selectedProductIds,
  onCellChange,
  onCountChange,
  onAddProduct,
  onDelete,
  onPasteFromLastSample,
  onParameterChange,
  onAddParameter,
  onDeleteParameter,
  onAutoFillParameters,
  onOpenTestingDetails,
  onSelectColumn,
  onSelectCell,
  onToggleProductSelected,
  onToggleAllProductsSelected,
  actionCenter,
}) {
  // Tab, while a column is selected, moves the selection to the next column
  // instead of letting focus fall through to whatever's next in the DOM -
  // only one thing (a column, a row, or a cell) is ever "selected" at a time,
  // and Tab is how a column selection steps forward through that set. Header
  // refs let the new column's <th> actually receive focus after the state
  // update, so a second Tab keeps walking forward instead of jumping back to
  // wherever focus would otherwise land.
  const headerRefs = useRef({});

  // The selected column/row's blue frame is a single overlay rectangle, not
  // borders stitched together out of each cell's own border. Every cell in
  // the table already carries its own 1px border, and a border painted by
  // one cell can never line up seamlessly with the border painted by the
  // cell next to it - float rounding alone puts them a fraction of a pixel
  // apart, which is exactly the broken/dotted line the previous version of
  // this had. Measuring the real cells and drawing one shape on top sidesteps
  // that entirely: there is nothing for it to be cut by.
  const tableViewportRef = useRef(null);
  const tbodyRef = useRef(null);
  const rowRefs = useRef({});
  // Wraps the actionCenter toolbar (Auto-fill column, Copy, etc): clicking
  // one of its buttons while a column is selected should act on that
  // selection, not clear it first - exempted from the "click elsewhere
  // clears it" listener below the same way it's exempted in real Excel
  // (toolbar/ribbon clicks don't drop the current selection either).
  const actionCenterRef = useRef(null);
  const [selectionOverlayRect, setSelectionOverlayRect] = useState(null);

  // Row selection doesn't exist on this grid - only column selection does
  // (see onSelectRow's removal from the serial cell below). This overlay is
  // only ever sized from the selected column.
  const recomputeSelectionOverlay = useCallback(() => {
    const viewport = tableViewportRef.current;
    if (!viewport) {
      setSelectionOverlayRect(null);
      return;
    }

    if (selectedColumnKey) {
      const headerCell = headerRefs.current[selectedColumnKey];
      const tbody = tbodyRef.current;
      if (!headerCell || !tbody) {
        setSelectionOverlayRect(null);
        return;
      }

      const viewportRect = viewport.getBoundingClientRect();
      const headerRect = headerCell.getBoundingClientRect();
      const tbodyRect = tbody.getBoundingClientRect();

      setSelectionOverlayRect({
        left: headerRect.left - viewportRect.left + viewport.scrollLeft,
        top: headerRect.top - viewportRect.top + viewport.scrollTop,
        width: headerRect.width,
        height: tbodyRect.bottom - headerRect.top,
      });
      return;
    }

    setSelectionOverlayRect(null);
  }, [selectedColumnKey]);

  // Excel-like: a column selection drops the moment you click anywhere that
  // isn't its own header cell (or the action-center toolbar, which needs the
  // selection to still be there when its own click handler runs). Handled at
  // the document level, in the capture phase, rather than per-cell onFocus:
  // that only ever covered clicks that land inside a focusable form field,
  // not the checkbox column, the Testing Details badge, or anywhere outside
  // the table entirely.
  useEffect(() => {
    if (!selectedColumnKey) return undefined;

    const handlePointerDown = (event) => {
      const headerCell = headerRefs.current[selectedColumnKey];
      if (headerCell?.contains(event.target)) return;
      if (actionCenterRef.current?.contains(event.target)) return;
      onSelectCell();
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => document.removeEventListener('pointerdown', handlePointerDown, true);
  }, [selectedColumnKey, onSelectCell]);

  // Recompute synchronously after any DOM change that could move the
  // selected cells - a new selection, or rows being added/removed by the
  // count stepper - so the overlay never has a chance to paint one frame in
  // the wrong place.
  useLayoutEffect(() => {
    recomputeSelectionOverlay();
  }, [recomputeSelectionOverlay, products.length]);

  // Column widths are fixed px values (colgroup), so only the viewport's own
  // size can still move things - e.g. a narrower window changing how much of
  // a horizontally-scrolled table is visible.
  useEffect(() => {
    if (!selectedColumnKey) return undefined;

    window.addEventListener('resize', recomputeSelectionOverlay);
    return () => window.removeEventListener('resize', recomputeSelectionOverlay);
  }, [selectedColumnKey, recomputeSelectionOverlay]);

  const handleHeaderKeyDown = (event, columnIndex) => {
    if (event.key !== 'Tab' || event.shiftKey) return;

    const nextColumn = productColumns[columnIndex + 1];
    if (!nextColumn) return;

    event.preventDefault();
    onSelectColumn(nextColumn.key, { forceSelect: true });
    // Selection is async (parent state), so the focus move waits a tick for
    // the re-render that puts is-selected (and this ref) on the new header.
    window.requestAnimationFrame(() => {
      headerRefs.current[nextColumn.key]?.focus();
    });
  };

  const isSingleProduct = products.length === 1;
  const singleProduct = products[0];

  return (
    <SectionCard
      title="Product Details"
      titleExtra={(
        <SampleCountStepper
          label=""
          className="smplfy-inward-count-stepper-compact"
          value={products.length}
          onChange={onCountChange}
          onDecrement={() => onDelete(products[products.length - 1]?.id)}
          onIncrement={onAddProduct}
        />
      )}
      actions={(
        <SecondaryButton
          size="medium"
          leftIcon="clipboard-text"
          disabled={!hasLastSampleProducts}
          title={
            hasLastSampleProducts
              ? "Fill this card with the last sample's product details"
              : 'No previous sample to paste from yet'
          }
          onClick={onPasteFromLastSample}
        >
          Paste from last sample
        </SecondaryButton>
      )}
    >
      {isSingleProduct ? (
        <>
          <div className="row g-4 mb-4">
            <div className="col-md-6 col-xl-3">
              <FormElement
                type="rich-dropdown"
                mandatory
                label="Category"
                message={errors[`product-${singleProduct.id}-category`]}
                messageTone="error"
                inputProps={{
                  value: singleProduct.category,
                  options: categoryOptions,
                  placeholder: 'Select category',
                  searchable: true,
                  onChange: (event) => onCellChange(singleProduct.id, 'category', event.target.value),
                }}
              />
            </div>
            <div className="col-md-6 col-xl-3">
              <FormElement
                type="rich-dropdown"
                mandatory
                label="Product"
                message={errors[`product-${singleProduct.id}-product`]}
                messageTone="error"
                inputProps={{
                  value: singleProduct.product,
                  options: productOptionsByCategory[singleProduct.category] ?? [],
                  placeholder: singleProduct.category ? 'Select product' : 'Select category first',
                  disabled: !singleProduct.category,
                  searchable: true,
                  onChange: (event) => onCellChange(singleProduct.id, 'product', event.target.value),
                }}
              />
            </div>
            <div className="col-md-6 col-xl-3">
              <FormElement
                type="split"
                label="Size/Qty"
                inputProps={{
                  value: singleProduct.sampleSize?.value ?? '',
                  unit: singleProduct.sampleSize?.unit ?? '',
                  units: sampleSizeUnitOptions,
                  placeholder: 'Value',
                  unitPlaceholder: 'Unit',
                  onChange: (event) => onCellChange(singleProduct.id, 'sampleSize', {
                    value: event.target.value,
                    unit: event.target.unit,
                  }),
                }}
              />
            </div>
            <div className="col-md-6 col-xl-3">
              <FormElement
                type="text"
                label="Batch"
                inputProps={{
                  value: singleProduct.batch ?? '',
                  onChange: (event) => onCellChange(singleProduct.id, 'batch', event.target.value),
                }}
              />
            </div>
          </div>

          {/* One product means one parameter table right in this card, rather
              than a per-product card elsewhere: there's only one product to
              have testing details for. */}
          <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
            <h3 className="smplfy-inward-subsection-title mb-0">Testing Details</h3>
            <div className="d-flex align-items-center gap-2">
              <SecondaryButton size="medium" leftIcon="plus" onClick={() => onAddParameter(singleProduct.id)}>
                Add row
              </SecondaryButton>
              <PrimaryButton
                size="medium"
                leftIcon="refresh"
                disabled={!(singleProduct.category && singleProduct.product)}
                title={
                  singleProduct.category && singleProduct.product
                    ? undefined
                    : 'Select a category and product first'
                }
                onClick={() => onAutoFillParameters(singleProduct.id)}
              >
                Auto-fill Parameter
              </PrimaryButton>
            </div>
          </div>

          <div className="smplfy-inward-table-frame">
            <table className="smplfy-inward-table smplfy-inward-parameter-grid" style={{ width: '100%' }}>
              <caption className="visually-hidden">Testing parameters for this product</caption>
              <colgroup>
                <col />
                <col style={{ width: '28%' }} />
                <col style={{ width: '28%' }} />
                <col style={{ width: '17%' }} />
                <col style={{ width: '17%' }} />
                <col style={{ width: '88px' }} />
              </colgroup>
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
                {(singleProduct.parameters ?? []).map((parameter, parameterIndex) => (
                  <tr key={parameter.id}>
                    <th scope="row" className="smplfy-inward-serial-cell">
                      <span className="smplfy-inward-serial-label">{parameterIndex + 1}</span>
                    </th>
                    <td>
                      <InputFieldRichDropdown
                        variant="table-cell"
                        aria-label={`Parameter ${parameterIndex + 1}`}
                        value={parameter.parameter}
                        options={parameterOptions}
                        placeholder="Select parameter"
                        searchable
                        onChange={(event) => onParameterChange(singleProduct.id, parameter.id, 'parameter', event.target.value)}
                      />
                    </td>
                    <td>
                      <InputFieldRichDropdown
                        variant="table-cell"
                        aria-label={`Test method ${parameterIndex + 1}`}
                        value={parameter.method}
                        options={testMethodOptions}
                        placeholder="Select test method"
                        searchable
                        onChange={(event) => onParameterChange(singleProduct.id, parameter.id, 'method', event.target.value)}
                      />
                    </td>
                    <td>
                      <InputFieldText
                        variant="table-cell"
                        aria-label={`Charges ${parameterIndex + 1}`}
                        value={parameter.charges}
                        placeholder="0.00"
                        onChange={(event) => onParameterChange(singleProduct.id, parameter.id, 'charges', event.target.value)}
                      />
                    </td>
                    <td>
                      <InputFieldText
                        variant="table-cell"
                        aria-label={`Estimated time ${parameterIndex + 1}`}
                        value={parameter.time}
                        placeholder="e.g. 3 days"
                        onChange={(event) => onParameterChange(singleProduct.id, parameter.id, 'time', event.target.value)}
                      />
                    </td>
                    <td className="smplfy-inward-action-cell">
                      <SecondaryButton
                        size="small"
                        tone="danger"
                        leftIcon="trash"
                        aria-label={`Delete parameter ${parameterIndex + 1}`}
                        data-tooltip={(singleProduct.parameters ?? []).length > 1 ? 'Delete this parameter' : 'Keep at least one row'}
                        disabled={(singleProduct.parameters ?? []).length === 1}
                        onClick={() => onDeleteParameter(singleProduct.id, parameter.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          <div ref={actionCenterRef}>{actionCenter}</div>
          <div className="smplfy-inward-table-frame">
            <div className="smplfy-inward-table-viewport" ref={tableViewportRef}>
            {selectionOverlayRect ? (
              <div
                className="smplfy-inward-selection-overlay"
                style={{
                  left: `${selectionOverlayRect.left}px`,
                  top: `${selectionOverlayRect.top}px`,
                  width: `${selectionOverlayRect.width}px`,
                  height: `${selectionOverlayRect.height}px`,
                }}
                aria-hidden="true"
              />
            ) : null}
            <table
              className="smplfy-inward-table smplfy-inward-product-table"
              style={{
                width: '100%',
                minWidth: `${getProductTableWidth({
                  checkbox: true,
                  testingDetails: true,
                  action: false,
                  testingDetailsWidth: caseOneProductTestingDetailsWidth,
                })}px`,
              }}
            >
              <caption className="visually-hidden">Products in this sample</caption>
              <colgroup>
                <col style={{ width: `${caseOneProductCheckboxWidth}px` }} />
                <col style={{ width: `${productSerialWidth}px` }} />
                {productColumns.map((column) => (
                  <col key={column.key} style={{ width: `${column.width}px` }} />
                ))}
                <col style={{ width: `${caseOneProductTestingDetailsWidth}px` }} />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col" className="text-center smplfy-inward-checkbox-cell smplfy-inward-sticky-checkbox-col">
                    <Checkbox
                      checked={products.length > 0 && selectedProductIds.length === products.length}
                      ariaLabel="Select all products"
                      onChange={onToggleAllProductsSelected}
                    />
                  </th>
                  <th scope="col" className="smplfy-inward-serial-cell smplfy-inward-sticky-serial-col">Product</th>
                  {productColumns.map((column, columnIndex) => (
                    <th
                      key={column.key}
                      ref={(node) => { headerRefs.current[column.key] = node; }}
                      scope="col"
                      // Roving tabindex: only the selected column sits in the
                      // page's Tab order, so clicking a header (which focuses
                      // it) lets Tab reach it for handleHeaderKeyDown without
                      // an unselected header ever intercepting a stray Tab
                      // press meant for some other field on the page.
                      tabIndex={selectedColumnKey === column.key ? 0 : -1}
                      className={joinClasses(
                        'smplfy-inward-selectable-header',
                        selectedColumnKey === column.key && 'is-selected',
                      )}
                      onClick={() => onSelectColumn(column.key)}
                      onKeyDown={(event) => handleHeaderKeyDown(event, columnIndex)}
                    >
                      {column.label}
                      {column.required ? <span className="smplfy-inward-required"> *</span> : null}
                    </th>
                  ))}
                  <th scope="col" className="smplfy-inward-sticky-testing-details-col">Testing Details</th>
                </tr>
              </thead>
              <tbody ref={tbodyRef}>
                {products.map((product, productIndex) => {
                  const renderCell = (column) => {
                    const errorKey = `product-${product.id}-${column.key}`;
                    const hasError = Boolean(errors[errorKey]);
                    const sharedProps = {
                      variant: 'table-cell',
                      state: hasError ? 'error' : undefined,
                      'aria-label': `${column.label} for product ${productIndex + 1}`,
                      'aria-invalid': hasError || undefined,
                      'aria-required': column.required || undefined,
                      title: errors[errorKey] || undefined,
                    };

                    if (column.type === 'sample-size') {
                      const currentValue = product.sampleSize ?? { value: '', unit: '' };

                      return (
                        <InputFieldSplitSelector
                          value={currentValue.value}
                          unit={currentValue.unit}
                          units={sampleSizeUnitOptions}
                          placeholder="Value"
                          unitPlaceholder="Unit"
                          className="smplfy-field-table-cell"
                          aria-label={`Sample size for product ${productIndex + 1}`}
                          onChange={(event) => onCellChange(product.id, 'sampleSize', {
                            value: event.target.value,
                            unit: event.target.unit,
                          })}
                        />
                      );
                    }

                    if (column.type === 'dropdown') {
                      const isProductColumn = column.key === 'product';
                      const options = isProductColumn
                        ? productOptionsByCategory[product.category] ?? []
                        : categoryOptions;

                      return (
                        <InputFieldRichDropdown
                          {...sharedProps}
                          value={product[column.key]}
                          options={options}
                          placeholder={
                            isProductColumn && !product.category
                              ? 'Select category first'
                              : `Select ${column.label.toLowerCase()}`
                          }
                          disabled={isProductColumn && !product.category}
                          searchable
                          onChange={(event) => onCellChange(product.id, column.key, event.target.value)}
                        />
                      );
                    }

                    return (
                      <InputFieldText
                        {...sharedProps}
                        value={product[column.key] || ''}
                        onChange={(event) => onCellChange(product.id, column.key, event.target.value)}
                      />
                    );
                  };

                  const filledParameterCount = countFilledParameters(product);
                  const hasSourceProduct = typeof product.parametersSourceIndex === 'number'
                    && products[product.parametersSourceIndex];

                  return (
                    <tr key={product.id} ref={(node) => { rowRefs.current[product.id] = node; }}>
                      <td className="text-center smplfy-inward-checkbox-cell smplfy-inward-sticky-checkbox-col">
                        <Checkbox
                          checked={selectedProductIds.includes(product.id)}
                          ariaLabel={`Select product ${productIndex + 1}`}
                          onChange={(checked) => onToggleProductSelected(product.id, checked)}
                        />
                      </td>
                      {/* Not click-to-select: this grid only supports
                          selecting a whole column (for "Auto-fill column"),
                          not a whole row - the checkbox column above is the
                          only way to pick rows, for the action-center's
                          Copy/Paste/Delete. */}
                      <th scope="row" className="smplfy-inward-serial-cell smplfy-inward-sticky-serial-col">
                        <span className="smplfy-inward-serial-label">Product {productIndex + 1}</span>
                      </th>

                      {productColumns.map((column) => (
                        <td
                          key={column.key}
                          className={joinClasses(
                            selectedColumnKey === column.key && 'smplfy-inward-column-selected',
                          )}
                          // Focusing a cell (click, or tabbing into its input)
                          // is itself a selection - "just this cell" - so it
                          // clears whatever column was selected the same way
                          // onSelectColumn clears it on a different column.
                          // The cell's own focus ring (:focus-within::after)
                          // already draws its border; there's no separate
                          // "selected cell" state to track here.
                          onFocus={() => onSelectCell()}
                        >
                          {renderCell(column)}
                        </td>
                      ))}

                      <td className="smplfy-inward-testing-details-cell smplfy-inward-sticky-testing-details-col">
                        <div className="d-flex align-items-center justify-content-between gap-2">
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <button
                              type="button"
                              className="smplfy-inward-testing-details-badge-button"
                              aria-label={`Edit testing details for product ${productIndex + 1}`}
                              onClick={() => onOpenTestingDetails(product.id)}
                            >
                              <StatusPill
                                color={filledParameterCount ? 'blue' : 'red'}
                                styleType="neutral"
                                className="smplfy-inward-testing-details-badge"
                              >
                                <span>
                                  {filledParameterCount
                                    ? `${filledParameterCount} ${filledParameterCount === 1 ? 'Parameter' : 'Parameters'}`
                                    : 'No parameters added'}
                                </span>
                                <AppIcon name="edit" size={13} className="smplfy-inward-testing-details-badge-icon" />
                              </StatusPill>
                            </button>
                            {hasSourceProduct ? (
                              <span className="smplfy-inward-testing-details-copied-note">
                                {`Same as Product ${product.parametersSourceIndex + 1}`}
                              </span>
                            ) : null}
                          </div>
                          <SecondaryButton
                            size="small"
                            leftIcon="refresh"
                            className="flex-shrink-0"
                            title={
                              product.category && product.product
                                ? 'Auto-fill parameters from category and product'
                                : 'Select a category and product first'
                            }
                            disabled={!(product.category && product.product)}
                            onClick={() => onAutoFillParameters(product.id)}
                          >
                            Auto-fill
                          </SecondaryButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </div>
        </>
      )}
    </SectionCard>
  );
}

/*
 * "Modal first"'s entry modal: before showing any of the form, ask which of
 * the 14 candidate fields (the 4 that identify a product, plus the 10 Basic
 * Details fields) are the same across every sample in this inward. Whatever
 * is checked here renders once, above the table; whatever isn't becomes its
 * own column, edited per row. A field can be flipped later too - this modal
 * reopens from a button on the page itself, it isn't a one-time gate.
 */
// Pre-sorted once at module scope rather than inside the component - the
// catalogs themselves never change, so there's no reason to re-sort them on
// every render.
const sortedModalFirstProductGroupFields = sortFieldsByLabel([
  modalFirstCustomerField,
  modalFirstParametersField,
  ...modalFirstProductFields,
]);
const sortedModalFirstBasicFields = sortFieldsByLabel(modalFirstBasicFields);

function ModalFirstSetupModal({ open, commonFieldKeys, onChange, onClose, onContinue }) {
  // The modal asks "what's different", not "what's common" - most fields on
  // a real inward are the same across every product, so a checkbox the
  // user has to tick for the common case would mean ticking almost every
  // box almost every time. Asking about the exception instead means the
  // common case (nothing checked) needs zero clicks. A chip's own "active"
  // state is therefore the inverse of membership in commonFieldKeys: active
  // = "this is different" = NOT in the common set.
  const toggleField = (key, isDifferent) => {
    onChange((current) => {
      const next = new Set(current);
      if (isDifferent) {
        next.delete(key);
        // Category silently mirrors Product's own answer rather than being
        // its own chip (see the field-catalog comment above) - marking
        // Product "different" means each row needs its own Category to
        // match whatever product it picked, so Category has to flip the
        // same way in the same click, not wait for a separate one.
        if (key === 'product') next.delete('category');
      } else {
        next.add(key);
        if (key === 'product') next.add('category');
      }
      return next;
    });
  };

  // Full-width sections with wrapping chips, rather than fixed-width
  // columns, so each group's height reflects its own field count instead of
  // every group being stretched to match whichever one has the most fields.
  const renderChip = (field) => {
    const isDifferent = !commonFieldKeys.has(field.key);
    return (
      <button
        type="button"
        key={field.key}
        className={joinClasses('smplfy-inward-modal-first-chip', isDifferent && 'is-active')}
        aria-pressed={isDifferent}
        onClick={() => toggleField(field.key, !isDifferent)}
      >
        <span className="smplfy-inward-modal-first-chip-check" aria-hidden="true">
          <AppIcon name="check" size={11} stroke={3} />
        </span>
        {field.label}
      </button>
    );
  };

  return (
    <Modal
      open={open}
      title="What's different across these samples?"
      titleId="modal-first-setup-title"
      size="extra-large"
      onClose={onClose}
      actions={(
        <PrimaryButton leftIcon="check" onClick={onContinue}>
          Continue
        </PrimaryButton>
      )}
    >
      {/* Modal's own `subtitle` slot is meant for a short label (its CSS is
          a single nowrap line, e.g. "New Transaction" elsewhere on this
          page) - a full sentence there blows out the header's width instead
          of wrapping, which drags the whole modal content area wider than
          the dialog and pushes everything else out of view. A plain
          paragraph in the body wraps normally. */}
      <p className="text-secondary mb-4">
        Check anything that varies from product to product. Everything left unchecked is treated as the same for the whole inward and only needs entering once.
      </p>

      {/* Sample details first, Product Details second - Sample details maps
          onto values (facts about the inward), Product Details onto each
          product row (facts about one item in it), and reading "what's true
          of the whole thing" before "what's true of each piece" is the more
          natural order. */}
      <div className="smplfy-inward-modal-first-groups">
        <div className="smplfy-inward-modal-first-group">
          <h3 className="smplfy-inward-modal-first-group-title">Sample details</h3>
          <div className="smplfy-inward-modal-first-chip-row">
            {sortedModalFirstBasicFields.map((field) => renderChip(field))}
          </div>
        </div>

        <div className="smplfy-inward-modal-first-group">
          <h3 className="smplfy-inward-modal-first-group-title">Product Details</h3>
          <div className="smplfy-inward-modal-first-chip-row">
            {sortedModalFirstProductGroupFields.map((field) => renderChip(field))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

/*
 * "Modal first"'s Product Details: the fields marked "common" in the setup
 * modal are edited once, above the table, and applied to every product row
 * live as they change; whatever's left is a per-row column in the table
 * below, same shape as Case 1's grid. This is the whole premise of the
 * version - split the same 14 fields into "ask once" vs "ask per row" by
 * upfront choice rather than by a fixed layout.
 */
function ModalFirstProductDetailsCard({
  products,
  values,
  customers,
  commonFieldKeys,
  onCountChange,
  onAddProduct,
  onDelete,
  onCellChange,
  onBasicCellChange,
  onCommonProductFieldChange,
  onValueChange,
  onReopenSetup,
  onAddCustomer,
  onViewProductCustomer,
  onProductCustomerChange,
  onOpenTestingDetails,
  errors,
}) {
  // Category rides along with whatever Product's own common/different
  // answer is (see the field-catalog comment and toggleField in
  // ModalFirstSetupModal) rather than having a commonFieldKeys entry of its
  // own, so it's read off modalFirstProductColumnFields (which includes it)
  // instead of modalFirstProductFields (the chip-only list, which doesn't).
  const commonProductFields = modalFirstProductColumnFields.filter((field) => commonFieldKeys.has(field.key));
  const differentProductFields = modalFirstProductColumnFields.filter((field) => !commonFieldKeys.has(field.key));
  const commonBasicFields = modalFirstBasicFields.filter((field) => commonFieldKeys.has(field.key));
  // Basic Details fields marked "different" live in the same per-product
  // table as the product-identity ones instead of a second table below it -
  // both are just "differs per row" columns for the same set of rows, so
  // splitting them into two tables would mean re-reading the same serial
  // column and row list twice for no reason.
  const differentBasicFields = modalFirstBasicFields.filter((field) => !commonFieldKeys.has(field.key));
  // Customer and Testing Details aren't in modalFirstProductFields (they're
  // catalog entries with their own bespoke rendering, not plain
  // productColumns entries - see modalFirstCustomerField and
  // modalFirstParametersField), so each needs its own "is it different"
  // check rather than falling out of the filters above.
  const isCustomerDifferent = !commonFieldKeys.has(modalFirstCustomerField.key);
  const isParametersDifferent = !commonFieldKeys.has(modalFirstParametersField.key);
  const customerOptions = customers.map((customer) => ({ value: customer.id, label: customer.name }));
  const firstProduct = products[0] ?? null;

  // Testing Details marked "common": one parameter table, edited off the
  // first product's own parameters and replicated into every row through
  // the same "common field" channel every other common field already uses
  // (onCommonProductFieldChange writes product[key] on every row at once) -
  // parameters is just a key whose value happens to be an array instead of
  // a scalar, so the same propagation works without any new plumbing.
  const commonParameters = firstProduct?.parameters?.length ? firstProduct.parameters : [createParameterRow()];
  const canAutoFillCommonParameters = Boolean(firstProduct?.category && firstProduct?.product);
  const updateCommonParameter = (parameterId, key, value) => {
    onCommonProductFieldChange('parameters', commonParameters.map((parameter) => (
      parameter.id === parameterId ? { ...parameter, [key]: value } : parameter
    )));
  };
  const addCommonParameter = () => {
    onCommonProductFieldChange('parameters', [...commonParameters, createParameterRow()]);
  };
  const deleteCommonParameter = (parameterId) => {
    if (commonParameters.length <= 1) return;
    onCommonProductFieldChange('parameters', commonParameters.filter((parameter) => parameter.id !== parameterId));
  };
  const autoFillCommonParameters = () => {
    const presets = getParameterPreset(firstProduct?.category, firstProduct?.product);
    if (!presets.length) return;
    onCommonProductFieldChange('parameters', presets.map((preset) => createParameterRow(preset)));
  };

  return (
    <SectionCard
      title="Product Details"
      titleExtra={(
        <SampleCountStepper
          label=""
          className="smplfy-inward-count-stepper-compact"
          value={products.length}
          onChange={onCountChange}
          onDecrement={() => onDelete(products[products.length - 1]?.id)}
          onIncrement={onAddProduct}
        />
      )}
      actions={(
        <>
          {isCustomerDifferent ? (
            <SecondaryButton size="medium" leftIcon="plus" onClick={onAddCustomer}>
              New Customer
            </SecondaryButton>
          ) : null}
          <SecondaryButton size="medium" leftIcon="settings" onClick={onReopenSetup}>
            Change what's different
          </SecondaryButton>
        </>
      )}
    >
      {commonProductFields.length || commonBasicFields.length ? (
        <>
          <h3 className="smplfy-inward-subsection-title">Same for every product</h3>
          <div className="row g-4 mb-4">
            {commonProductFields.map((field) => {
              const column = productColumns.find((candidate) => candidate.key === field.key);
              const currentValue = firstProduct?.[field.key];

              if (column?.type === 'dropdown') {
                const isProductColumn = field.key === 'product';
                const options = isProductColumn
                  ? productOptionsByCategory[firstProduct?.category] ?? []
                  : categoryOptions;

                return (
                  <div className="col-md-6 col-xl-3" key={field.key}>
                    <FormElement
                      type="rich-dropdown"
                      mandatory={column.required}
                      label={field.label}
                      inputProps={{
                        value: currentValue ?? '',
                        options,
                        placeholder: isProductColumn && !firstProduct?.category
                          ? 'Select category first'
                          : `Select ${field.label.toLowerCase()}`,
                        disabled: isProductColumn && !firstProduct?.category,
                        searchable: true,
                        onChange: (event) => onCommonProductFieldChange(field.key, event.target.value),
                      }}
                    />
                  </div>
                );
              }

              if (column?.type === 'sample-size') {
                const sizeValue = currentValue ?? { value: '', unit: '' };
                return (
                  <div className="col-md-6 col-xl-3" key={field.key}>
                    <FormElement
                      type="split"
                      label={field.label}
                      inputProps={{
                        value: sizeValue.value ?? '',
                        unit: sizeValue.unit ?? '',
                        units: sampleSizeUnitOptions,
                        placeholder: 'Value',
                        unitPlaceholder: 'Unit',
                        onChange: (event) => onCommonProductFieldChange(field.key, {
                          value: event.target.value,
                          unit: event.target.unit,
                        }),
                      }}
                    />
                  </div>
                );
              }

              return (
                <div className="col-md-6 col-xl-3" key={field.key}>
                  <FormElement
                    type="text"
                    label={field.label}
                    inputProps={{
                      value: currentValue ?? '',
                      onChange: (event) => onCommonProductFieldChange(field.key, event.target.value),
                    }}
                  />
                </div>
              );
            })}
            {commonBasicFields.map((field) => (
              <div className="col-md-6 col-xl-3" key={field.key}>
                <FormElement
                  type="text"
                  label={field.label}
                  inputProps={{
                    value: values[field.key] ?? '',
                    onChange: (event) => onValueChange(field.key, event.target.value),
                  }}
                />
              </div>
            ))}
          </div>
        </>
      ) : null}

      {/* Testing Details marked "common": one parameter table for the whole
          inward, same table shape as the per-product one elsewhere on this
          page, just writing through onCommonProductFieldChange so every row
          picks the edit up instead of only the first one. */}
      {!isParametersDifferent ? (
        <>
          <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
            <h3 className="smplfy-inward-subsection-title mb-0">Testing Details</h3>
            <div className="d-flex align-items-center gap-2">
              <SecondaryButton size="medium" leftIcon="plus" onClick={addCommonParameter}>
                Add row
              </SecondaryButton>
              <PrimaryButton
                size="medium"
                leftIcon="refresh"
                disabled={!canAutoFillCommonParameters}
                title={canAutoFillCommonParameters ? undefined : 'Select a category and product first'}
                onClick={autoFillCommonParameters}
              >
                Auto-fill
              </PrimaryButton>
            </div>
          </div>
          <div className="smplfy-inward-table-frame mb-4">
            <table className="smplfy-inward-table smplfy-inward-parameter-grid" style={{ width: '100%' }}>
              <caption className="visually-hidden">Testing parameters for the whole inward</caption>
              <colgroup>
                <col />
                <col style={{ width: '30%' }} />
                <col style={{ width: '30%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '56px' }} />
              </colgroup>
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
                {commonParameters.map((parameter, parameterIndex) => (
                  <tr key={parameter.id}>
                    <th scope="row" className="smplfy-inward-serial-cell">
                      <span className="smplfy-inward-serial-label">{parameterIndex + 1}</span>
                    </th>
                    <td>
                      <InputFieldRichDropdown
                        variant="table-cell"
                        aria-label={`Parameter ${parameterIndex + 1}`}
                        value={parameter.parameter}
                        options={parameterOptions}
                        placeholder="Select parameter"
                        searchable
                        onChange={(event) => updateCommonParameter(parameter.id, 'parameter', event.target.value)}
                      />
                    </td>
                    <td>
                      <InputFieldRichDropdown
                        variant="table-cell"
                        aria-label={`Test method ${parameterIndex + 1}`}
                        value={parameter.method}
                        options={testMethodOptions}
                        placeholder="Select test method"
                        searchable
                        onChange={(event) => updateCommonParameter(parameter.id, 'method', event.target.value)}
                      />
                    </td>
                    <td>
                      <InputFieldText
                        variant="table-cell"
                        aria-label={`Charges ${parameterIndex + 1}`}
                        value={parameter.charges}
                        placeholder="0.00"
                        onChange={(event) => updateCommonParameter(parameter.id, 'charges', event.target.value)}
                      />
                    </td>
                    <td>
                      <InputFieldText
                        variant="table-cell"
                        aria-label={`Estimated time ${parameterIndex + 1}`}
                        value={parameter.time}
                        placeholder="e.g. 3 days"
                        onChange={(event) => updateCommonParameter(parameter.id, 'time', event.target.value)}
                      />
                    </td>
                    <td className="smplfy-inward-action-cell">
                      <SecondaryButton
                        size="small"
                        tone="danger"
                        leftIcon="trash"
                        aria-label={`Delete parameter ${parameterIndex + 1}`}
                        data-tooltip={commonParameters.length > 1 ? 'Delete this parameter' : 'Keep at least one row'}
                        disabled={commonParameters.length === 1}
                        onClick={() => deleteCommonParameter(parameter.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}

      {differentProductFields.length || differentBasicFields.length || isCustomerDifferent || isParametersDifferent ? (
        <>
          <h3 className="smplfy-inward-subsection-title">Different for each product</h3>
          <div className="smplfy-inward-table-frame">
            <div className="smplfy-inward-table-viewport">
              <table
                className="smplfy-inward-table"
                style={{
                  width: '100%',
                  minWidth: `${productSerialWidth
                    + (isCustomerDifferent ? 220 + 260 : 0)
                    + (isParametersDifferent ? 200 : 0)
                    + differentProductFields.reduce((total, field) => (
                      total + (productColumns.find((c) => c.key === field.key)?.width ?? 200)
                    ), 0)
                    + differentBasicFields.length * 180}px`,
                }}
              >
                <caption className="visually-hidden">Products in this sample, fields that differ per row</caption>
                <colgroup>
                  <col style={{ width: `${productSerialWidth}px` }} />
                  {isCustomerDifferent ? (
                    <>
                      <col style={{ width: '220px' }} />
                      <col style={{ width: '260px' }} />
                    </>
                  ) : null}
                  {differentProductFields.map((field) => (
                    <col
                      key={field.key}
                      style={{ width: `${productColumns.find((c) => c.key === field.key)?.width ?? 200}px` }}
                    />
                  ))}
                  {differentBasicFields.map((field) => (
                    <col key={field.key} style={{ width: '180px' }} />
                  ))}
                  {isParametersDifferent ? <col style={{ width: '200px' }} /> : null}
                </colgroup>
                <thead>
                  <tr>
                    <th scope="col" className="smplfy-inward-serial-cell">Sample</th>
                    {isCustomerDifferent ? (
                      <>
                        <th scope="col">
                          Customer
                          <span className="smplfy-inward-required"> *</span>
                        </th>
                        <th scope="col">Billing Address</th>
                      </>
                    ) : null}
                    {differentProductFields.map((field) => (
                      <th key={field.key} scope="col">
                        {field.label}
                        {productColumns.find((c) => c.key === field.key)?.required ? (
                          <span className="smplfy-inward-required"> *</span>
                        ) : null}
                      </th>
                    ))}
                    {differentBasicFields.map((field) => (
                      <th key={field.key} scope="col">{field.label}</th>
                    ))}
                    {isParametersDifferent ? <th scope="col">Testing Details</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, productIndex) => (
                    <tr key={product.id}>
                      <th scope="row" className="smplfy-inward-serial-cell">
                        <span className="smplfy-inward-serial-label">Sample {productIndex + 1}</span>
                      </th>
                      {isCustomerDifferent ? (
                        <>
                          <td>
                            <div className="d-flex align-items-stretch gap-1 h-100">
                              <InputFieldRichDropdown
                                variant="table-cell"
                                aria-label={`Customer for product ${productIndex + 1}`}
                                state={errors[`product-${product.id}-customerId`] ? 'error' : undefined}
                                value={product.customerId}
                                options={customerOptions}
                                placeholder="Select customer"
                                searchable
                                onChange={(event) => onProductCustomerChange(product.id, event.target.value)}
                              />
                              <SecondaryButton
                                size="small"
                                leftIcon="info-circle"
                                className="flex-shrink-0"
                                aria-label={`View customer details for product ${productIndex + 1}`}
                                data-tooltip={product.customerId ? 'View customer details' : 'Select a customer first'}
                                disabled={!product.customerId}
                                onClick={() => onViewProductCustomer(product.id)}
                              />
                            </div>
                          </td>
                          <td>
                            <InputFieldText
                              variant="table-cell"
                              aria-label={`Billing address for product ${productIndex + 1}`}
                              value={product.billingAddress || ''}
                              placeholder={product.customerId ? undefined : 'Select a customer first'}
                              onChange={(event) => onCellChange(product.id, 'billingAddress', event.target.value)}
                            />
                          </td>
                        </>
                      ) : null}
                      {differentProductFields.map((field) => {
                        const column = productColumns.find((c) => c.key === field.key);

                        if (column?.type === 'dropdown') {
                          const isProductColumn = field.key === 'product';
                          const options = isProductColumn
                            ? productOptionsByCategory[product.category] ?? []
                            : categoryOptions;

                          return (
                            <td key={field.key}>
                              <InputFieldRichDropdown
                                variant="table-cell"
                                aria-label={`${field.label} for product ${productIndex + 1}`}
                                value={product[field.key]}
                                options={options}
                                placeholder={
                                  isProductColumn && !product.category
                                    ? 'Select category first'
                                    : `Select ${field.label.toLowerCase()}`
                                }
                                disabled={isProductColumn && !product.category}
                                searchable
                                onChange={(event) => onCellChange(product.id, field.key, event.target.value)}
                              />
                            </td>
                          );
                        }

                        if (column?.type === 'sample-size') {
                          const sizeValue = product.sampleSize ?? { value: '', unit: '' };
                          return (
                            <td key={field.key}>
                              <InputFieldSplitSelector
                                value={sizeValue.value ?? ''}
                                unit={sizeValue.unit ?? ''}
                                units={sampleSizeUnitOptions}
                                placeholder="Value"
                                unitPlaceholder="Unit"
                                className="smplfy-field-table-cell"
                                aria-label={`Sample size for product ${productIndex + 1}`}
                                onChange={(event) => onCellChange(product.id, 'sampleSize', {
                                  value: event.target.value,
                                  unit: event.target.unit,
                                })}
                              />
                            </td>
                          );
                        }

                        return (
                          <td key={field.key}>
                            <InputFieldText
                              variant="table-cell"
                              aria-label={`${field.label} for product ${productIndex + 1}`}
                              value={product[field.key] || ''}
                              onChange={(event) => onCellChange(product.id, field.key, event.target.value)}
                            />
                          </td>
                        );
                      })}
                      {differentBasicFields.map((field) => (
                        <td key={field.key}>
                          <InputFieldText
                            variant="table-cell"
                            aria-label={`${field.label} for product ${productIndex + 1}`}
                            value={product.basicDetails?.[field.key] ?? ''}
                            onChange={(event) => onBasicCellChange(product.id, field.key, event.target.value)}
                          />
                        </td>
                      ))}
                      {isParametersDifferent ? (
                        <td className="smplfy-inward-testing-details-cell">
                          <button
                            type="button"
                            className="smplfy-inward-testing-details-badge-button"
                            aria-label={`Edit testing details for product ${productIndex + 1}`}
                            onClick={() => onOpenTestingDetails(product.id)}
                          >
                            <StatusPill
                              color={countFilledParameters(product) ? 'blue' : 'red'}
                              styleType="neutral"
                              className="smplfy-inward-testing-details-badge"
                            >
                              <span>
                                {countFilledParameters(product)
                                  ? `${countFilledParameters(product)} ${countFilledParameters(product) === 1 ? 'Parameter' : 'Parameters'}`
                                  : 'No parameters added'}
                              </span>
                              <AppIcon name="edit" size={13} className="smplfy-inward-testing-details-badge-icon" />
                            </StatusPill>
                          </button>
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </SectionCard>
  );
}

/*
 * Case 1's Additional Details. Every field starts auto-filled (Mode of
 * Sample Receipt to Courier, Tentative Reporting Date / Amount seeded from
 * the products' category presets, Received By to the signed-in user) but
 * all four stay editable, same as every other field on the form.
 */
function CaseOneAdditionalDetailsCard({ values, onChange }) {
  return (
    <SectionCard title="Additional Details">
      <div className="row g-4">
        <div className="col-md-6 col-xl-3">
          <FormElement
            type="rich-dropdown"
            label="Mode of Sample Receipt"
            inputProps={{
              value: values.receiptMode,
              options: receiptModeOptions,
              placeholder: 'Select receipt mode',
              searchable: true,
              onChange: (event) => onChange('receiptMode', event.target.value),
            }}
          />
        </div>
        <div className="col-md-6 col-xl-3">
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
        <div className="col-md-6 col-xl-3">
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
        <div className="col-md-6 col-xl-3">
          <FormElement
            type="rich-dropdown"
            label="Received By"
            inputProps={{
              value: values.receivedBy,
              options: receivedByOptions,
              placeholder: 'Select a user',
              searchable: true,
              onChange: (event) => onChange('receivedBy', event.target.value),
            }}
          />
        </div>
      </div>
    </SectionCard>
  );
}

function ProductParameterCard({
  product,
  productIndex,
  errors,
  canApplyToAll,
  onApplyToAll,
  onCellChange,
  onParameterChange,
  onAddParameter,
  onDeleteParameter,
  onAutoFillParameters,
}) {
  const parameters = product.parameters ?? [];
  const canAutoFill = Boolean(product.category && product.product);

  return (
    <SectionCard
      title={getProductLabel(product, productIndex)}
      actions={(
        <>
          <SecondaryButton
            size="medium"
            leftIcon="copy"
            disabled={!canApplyToAll}
            title={
              canApplyToAll
                ? 'Copy these parameters to every other product'
                : 'Add a parameter first'
            }
            onClick={() => onApplyToAll(product.id)}
          >
            Apply to all
          </SecondaryButton>
          <SecondaryButton size="medium" leftIcon="plus" onClick={() => onAddParameter(product.id)}>
            Add row
          </SecondaryButton>
          <PrimaryButton
            size="medium"
            leftIcon="refresh"
            disabled={!canAutoFill}
            title={canAutoFill ? undefined : 'Select a category and product first'}
            onClick={() => onAutoFillParameters(product.id)}
          >
            Auto-fill Parameter
          </PrimaryButton>
        </>
      )}
    >
      {/* Same product fields as the Sample info grid, bound to the same state so
          edits here and there stay in sync. */}
      <div className="row g-4 mb-4">
        <div className="col-md-6 col-xl-3">
          <FormElement
            type="rich-dropdown"
            mandatory
            label="Category"
            message={errors[`product-${product.id}-category`]}
            messageTone="error"
            inputProps={{
              value: product.category,
              options: categoryOptions,
              placeholder: 'Select category',
              searchable: true,
              onChange: (event) => onCellChange(product.id, 'category', event.target.value),
            }}
          />
        </div>
        <div className="col-md-6 col-xl-3">
          <FormElement
            type="rich-dropdown"
            mandatory
            label="Product"
            message={errors[`product-${product.id}-product`]}
            messageTone="error"
            inputProps={{
              value: product.product,
              options: productOptionsByCategory[product.category] ?? [],
              placeholder: product.category ? 'Select product' : 'Select category first',
              disabled: !product.category,
              searchable: true,
              onChange: (event) => onCellChange(product.id, 'product', event.target.value),
            }}
          />
        </div>
        <div className="col-md-6 col-xl-3">
          <FormElement
            type="split"
            label="Sample Size"
            inputProps={{
              value: product.sampleSize?.value ?? '',
              unit: product.sampleSize?.unit ?? '',
              units: sampleSizeUnitOptions,
              placeholder: 'Value',
              unitPlaceholder: 'Unit',
              onChange: (event) => onCellChange(product.id, 'sampleSize', {
                value: event.target.value,
                unit: event.target.unit,
              }),
            }}
          />
        </div>
        <div className="col-md-6 col-xl-3">
          <FormElement
            type="text"
            label="Batch"
            inputProps={{
              value: product.batch ?? '',
              onChange: (event) => onCellChange(product.id, 'batch', event.target.value),
            }}
          />
        </div>
      </div>

      <div className="smplfy-inward-table-frame">
        <table className="smplfy-inward-table smplfy-inward-parameter-grid" style={{ width: '100%' }}>
          <caption className="visually-hidden">
            Testing parameters for {getProductLabel(product, productIndex)}
          </caption>
          {/* No width on the serial column: it hugs its content. */}
          <colgroup>
            <col />
            <col style={{ width: '28%' }} />
            <col style={{ width: '28%' }} />
            <col style={{ width: '17%' }} />
            <col style={{ width: '17%' }} />
            <col style={{ width: '88px' }} />
          </colgroup>
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
            {parameters.map((parameter, parameterIndex) => (
              <tr key={parameter.id}>
                <th scope="row" className="smplfy-inward-serial-cell">
                  <span className="smplfy-inward-serial-label">{parameterIndex + 1}</span>
                </th>
                <td>
                  <InputFieldRichDropdown
                    variant="table-cell"
                    aria-label={`Parameter ${parameterIndex + 1} for product ${productIndex + 1}`}
                    value={parameter.parameter}
                    options={parameterOptions}
                    placeholder="Select parameter"
                    searchable
                    onChange={(event) => onParameterChange(product.id, parameter.id, 'parameter', event.target.value)}
                  />
                </td>
                <td>
                  <InputFieldRichDropdown
                    variant="table-cell"
                    aria-label={`Test method ${parameterIndex + 1} for product ${productIndex + 1}`}
                    value={parameter.method}
                    options={testMethodOptions}
                    placeholder="Select test method"
                    searchable
                    onChange={(event) => onParameterChange(product.id, parameter.id, 'method', event.target.value)}
                  />
                </td>
                <td>
                  <InputFieldText
                    variant="table-cell"
                    aria-label={`Charges ${parameterIndex + 1} for product ${productIndex + 1}`}
                    value={parameter.charges}
                    placeholder="0.00"
                    onChange={(event) => onParameterChange(product.id, parameter.id, 'charges', event.target.value)}
                  />
                </td>
                <td>
                  <InputFieldText
                    variant="table-cell"
                    aria-label={`Estimated time ${parameterIndex + 1} for product ${productIndex + 1}`}
                    value={parameter.time}
                    placeholder="e.g. 3 days"
                    onChange={(event) => onParameterChange(product.id, parameter.id, 'time', event.target.value)}
                  />
                </td>
                <td className="smplfy-inward-action-cell">
                  <SecondaryButton
                    size="small"
                    tone="danger"
                    leftIcon="trash"
                    aria-label={`Delete parameter ${parameterIndex + 1} from product ${productIndex + 1}`}
                    data-tooltip={parameters.length > 1 ? 'Delete this parameter' : 'Keep at least one row'}
                    disabled={parameters.length === 1}
                    onClick={() => onDeleteParameter(product.id, parameter.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

/*
 * Single-page version's testing details drawer. Opened from a product row's
 * action cell; holds just the parameter table (no category/product/sample
 * size/batch, those already live in the grid on this version) plus Save,
 * Apply to all products, and Cancel.
 */
function TestingDetailsDrawer({
  open,
  product,
  productIndex,
  productCount,
  products,
  onClose,
  onCellChange,
  onParameterChange,
  onAddParameter,
  onDeleteParameter,
  onAutoFillParameters,
  onApplyToAll,
  onApplyToSameProduct,
  // Modal-first already shows category/product/sample size/batch somewhere
  // on the page itself (either the per-row table, if marked "different", or
  // the "Same for every product" fields, if "common") - showing them again
  // here would be a second, easy-to-desync place to edit the same values,
  // so this drawer drops down to just the parameter table for that version.
  showIdentityFields = true,
}) {
  // Stays mounted even while closed (rather than unmounting on close) so the
  // CSS transform transition on .show has something to animate from; an
  // unmount/remount pair would just snap into place with no slide-in.
  if (!product) return null;

  const parameters = product.parameters ?? [];
  const hasParameters = countFilledParameters(product) > 0;
  const canApplyToAll = hasParameters && productCount > 1;
  // "Same products" only counts rows sharing this row's Product dropdown
  // value - a row with no Product picked yet, or the only row with this
  // Product, has nothing to apply to.
  const sameProductCount = product.product
    ? (products ?? []).filter((other) => other.id !== product.id && other.product === product.product).length
    : 0;
  const canApplyToSameProduct = hasParameters && sameProductCount > 0;
  const canAutoFill = Boolean(product.category && product.product);

  return (
    <>
      <div
        className={`offcanvas-backdrop fade${open ? ' show' : ''}`}
        onClick={onClose}
        aria-hidden={open ? undefined : 'true'}
        style={open ? undefined : { pointerEvents: 'none' }}
      />
      <aside
        className={`smplfy-inward-testing-drawer offcanvas offcanvas-end${open ? ' show' : ''}`}
        tabIndex="-1"
        role="dialog"
        aria-modal={open ? 'true' : undefined}
        aria-hidden={open ? undefined : 'true'}
        aria-labelledby="inward-testing-drawer-title"
      >
        <div className="offcanvas-header border-bottom">
          <h2 className="offcanvas-title h5 mb-0" id="inward-testing-drawer-title">
            {`Product ${productIndex + 1} Edit details`}
          </h2>
          <button type="button" className="btn-close" aria-label="Close testing details" onClick={onClose} />
        </div>

        <div className="offcanvas-body d-flex flex-column gap-3">
          {/* Same identifying fields as the grid row this drawer was opened
              from, so everything about the product can be edited from one
              place instead of needing to close the drawer to fix a category.
              Skipped on modal-first - see showIdentityFields above. */}
          {showIdentityFields ? (
            <div className="row g-4">
              <div className="col-6">
                <FormElement
                  type="rich-dropdown"
                  mandatory
                  label="Category"
                  inputProps={{
                    value: product.category,
                    options: categoryOptions,
                    placeholder: 'Select category',
                    searchable: true,
                    onChange: (event) => onCellChange(product.id, 'category', event.target.value),
                  }}
                />
              </div>
              <div className="col-6">
                <FormElement
                  type="rich-dropdown"
                  mandatory
                  label="Product"
                  inputProps={{
                    value: product.product,
                    options: productOptionsByCategory[product.category] ?? [],
                    placeholder: product.category ? 'Select product' : 'Select category first',
                    disabled: !product.category,
                    searchable: true,
                    onChange: (event) => onCellChange(product.id, 'product', event.target.value),
                  }}
                />
              </div>
              <div className="col-6">
                <FormElement
                  type="split"
                  label="Sample Size"
                  inputProps={{
                    value: product.sampleSize?.value ?? '',
                    unit: product.sampleSize?.unit ?? '',
                    units: sampleSizeUnitOptions,
                    placeholder: 'Value',
                    unitPlaceholder: 'Unit',
                    onChange: (event) => onCellChange(product.id, 'sampleSize', {
                      value: event.target.value,
                      unit: event.target.unit,
                    }),
                  }}
                />
              </div>
              <div className="col-6">
                <FormElement
                  type="text"
                  label="Batch"
                  inputProps={{
                    value: product.batch ?? '',
                    onChange: (event) => onCellChange(product.id, 'batch', event.target.value),
                  }}
                />
              </div>
            </div>
          ) : null}

          <div className="d-flex align-items-center justify-content-end gap-2">
            <SecondaryButton size="medium" leftIcon="plus" onClick={() => onAddParameter(product.id)}>
              Add row
            </SecondaryButton>
            <PrimaryButton
              size="medium"
              leftIcon="refresh"
              disabled={!canAutoFill}
              title={canAutoFill ? undefined : 'Select a category and product first'}
              onClick={() => onAutoFillParameters(product.id)}
            >
              Auto-fill
            </PrimaryButton>
          </div>

          <div className="smplfy-inward-table-frame">
            <table className="smplfy-inward-table smplfy-inward-parameter-grid" style={{ width: '100%' }}>
              <caption className="visually-hidden">
                Testing parameters for {getProductLabel(product, productIndex)}
              </caption>
              <colgroup>
                <col />
                <col style={{ width: '30%' }} />
                <col style={{ width: '30%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '56px' }} />
              </colgroup>
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
                {parameters.map((parameter, parameterIndex) => (
                  <tr key={parameter.id}>
                    <th scope="row" className="smplfy-inward-serial-cell">
                      <span className="smplfy-inward-serial-label">{parameterIndex + 1}</span>
                    </th>
                    <td>
                      <InputFieldRichDropdown
                        variant="table-cell"
                        aria-label={`Parameter ${parameterIndex + 1}`}
                        value={parameter.parameter}
                        options={parameterOptions}
                        placeholder="Select parameter"
                        searchable
                        onChange={(event) => onParameterChange(product.id, parameter.id, 'parameter', event.target.value)}
                      />
                    </td>
                    <td>
                      <InputFieldRichDropdown
                        variant="table-cell"
                        aria-label={`Test method ${parameterIndex + 1}`}
                        value={parameter.method}
                        options={testMethodOptions}
                        placeholder="Select test method"
                        searchable
                        onChange={(event) => onParameterChange(product.id, parameter.id, 'method', event.target.value)}
                      />
                    </td>
                    <td>
                      <InputFieldText
                        variant="table-cell"
                        aria-label={`Charges ${parameterIndex + 1}`}
                        value={parameter.charges}
                        placeholder="0.00"
                        onChange={(event) => onParameterChange(product.id, parameter.id, 'charges', event.target.value)}
                      />
                    </td>
                    <td>
                      <InputFieldText
                        variant="table-cell"
                        aria-label={`Estimated time ${parameterIndex + 1}`}
                        value={parameter.time}
                        placeholder="e.g. 3 days"
                        onChange={(event) => onParameterChange(product.id, parameter.id, 'time', event.target.value)}
                      />
                    </td>
                    <td className="smplfy-inward-action-cell">
                      <SecondaryButton
                        size="small"
                        tone="danger"
                        leftIcon="trash"
                        aria-label={`Delete parameter ${parameterIndex + 1}`}
                        data-tooltip={parameters.length > 1 ? 'Delete this parameter' : 'Keep at least one row'}
                        disabled={parameters.length === 1}
                        onClick={() => onDeleteParameter(product.id, parameter.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="offcanvas-footer d-flex justify-content-between gap-3 border-top">
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <div className="d-flex align-items-center gap-2">
            {onApplyToSameProduct ? (
              <SecondaryButton
                leftIcon="copy"
                disabled={!canApplyToSameProduct}
                title={
                  canApplyToSameProduct
                    ? `Copy these parameters to the ${sameProductCount} other row${sameProductCount === 1 ? '' : 's'} with this same product`
                    : 'Needs a filled parameter and at least one other row with this same product'
                }
                onClick={() => onApplyToSameProduct(product.id)}
              >
                Apply to same products
              </SecondaryButton>
            ) : null}
            <SecondaryButton
              leftIcon="copy"
              disabled={!canApplyToAll}
              title={canApplyToAll ? 'Copy these parameters to every other product' : 'Add a parameter first'}
              onClick={() => onApplyToAll(product.id)}
            >
              Apply to all products
            </SecondaryButton>
            <PrimaryButton leftIcon="save" onClick={onClose}>
              Save
            </PrimaryButton>
          </div>
        </div>
      </aside>
    </>
  );
}

export default function NewInwardPage({
  parentLabel = 'Samples Workspace',
  onBack,
  onComplete,
}) {
  // Which UI version is showing. Case 1 is the default fallback if nothing's
  // been saved yet; "default" keeps the original Sample info / Testing
  // Details tabs; "single-page" drops the section bar and moves testing
  // details into a per-product drawer opened from the product grid;
  // "modal-first" asks up front which fields are shared across every
  // product in this inward and which vary, then lays the form out around
  // that answer. Initialized from whatever version was open last time (see
  // PAGE_VERSION_STORAGE_KEY) so reopening New Inward doesn't reset it.
  const [pageVersion, setPageVersion] = useState(readStoredPageVersion);
  const [activeTab, setActiveTab] = useState('sample-info');
  const [values, setValues] = useState(() => createInitialValues(true));
  const [customers, setCustomers] = useState(initialCustomers);
  const [products, setProductsRaw] = useState(() => [createProduct(), createProduct()]);
  // Undo/redo for the product grid only (cell edits, auto-fill, copy/paste,
  // delete, parameters) - everything that goes through setProducts below.
  // Every other setProducts() call site in this file is untouched; wrapping
  // the setter here means they all get undo/redo for free.
  const [productsUndoStack, setProductsUndoStack] = useState([]);
  const [productsRedoStack, setProductsRedoStack] = useState([]);
  const setProducts = useCallback((updater) => {
    setProductsRaw((current) => {
      const next = typeof updater === 'function' ? updater(current) : updater;
      if (next === current) return current;
      setProductsUndoStack((stack) => [...stack, current]);
      setProductsRedoStack([]);
      return next;
    });
  }, []);
  const undoProducts = () => {
    setProductsUndoStack((stack) => {
      if (!stack.length) return stack;
      const previous = stack[stack.length - 1];
      setProductsRedoStack((redoStack) => [...redoStack, products]);
      setProductsRaw(previous);
      return stack.slice(0, -1);
    });
  };
  const redoProducts = () => {
    setProductsRedoStack((stack) => {
      if (!stack.length) return stack;
      const next = stack[stack.length - 1];
      setProductsUndoStack((undoStack) => [...undoStack, products]);
      setProductsRaw(next);
      return stack.slice(0, -1);
    });
  };
  const [copiedProduct, setCopiedProduct] = useState(null);
  const [errors, setErrors] = useState({});
  // productId is null for the page-level Customer (values.customerId) and
  // set to a specific product's id when the modal was opened from a
  // per-row Customer column (modal-first, Customer marked "different") -
  // everywhere this modal's result gets written, it checks productId to
  // know whether it's updating `values` or one row in `products`.
  // assignToValues covers the third case: modal-first's "New Customer"
  // header button when Customer is "different" - creating a customer here
  // should only add it to the shared pool for rows to pick from later, not
  // silently assign it to a field (values.customerId) that isn't even in
  // use while Customer is "different".
  const [customerModal, setCustomerModal] = useState({
    open: false, mode: 'create', productId: null, assignToValues: true,
  });
  const [toast, setToast] = useState(null);
  // Mirrors "Generate Test Request" on the first workflow node. With it on,
  // TRs are raised at save time, so there must be something to raise them from.
  const [trGeneration, setTrGeneration] = useState(false);
  const [trErrorOpen, setTrErrorOpen] = useState(false);
  // Collapsed on load and when picking an existing customer; opened after
  // creating one so the entered details are visible on return.
  const [moreDetailsOpen, setMoreDetailsOpen] = useState(false);
  // Single-page version: which product the testing details drawer shows, and
  // whether it's open. Kept separate so the drawer keeps its content while
  // sliding closed instead of losing it the instant the close is requested.
  const [testingDrawerProductId, setTestingDrawerProductId] = useState(null);
  const [testingDrawerOpen, setTestingDrawerOpen] = useState(false);
  // Which rows are checked for the bulk action row above the product table.
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  // Case 1's Basic Details "More details" toggle (separate from the Customer
  // card's own toggle, which is shared with the default version's).
  const [caseOneBasicMoreOpen, setCaseOneBasicMoreOpen] = useState(false);
  // Case 1's product grid: which column is selected (scopes "Auto-fill
  // column"). No row-selection counterpart - the grid's checkbox column is
  // the only way to pick rows, for the action-center's Copy/Paste/Delete.
  const [caseOneSelectedColumnKey, setCaseOneSelectedColumnKey] = useState(null);
  // Case 1's Basic Details card: "Shared" (one set of fields for the whole
  // sample) or "Product-wise" (a grid, one row per product) - only reachable
  // with more than one product, since with one product the two modes are
  // the same thing.
  const [caseOneBasicDetailsMode, setCaseOneBasicDetailsMode] = useState('shared');
  // Same column/row selection idea as the product grid, but for the
  // Product-wise Basic Details table specifically - kept separate so
  // selecting a column in one table doesn't visually select one in the other.
  const [caseOneBasicSelectedColumnKey, setCaseOneBasicSelectedColumnKey] = useState(null);
  const [caseOneBasicSelectedRowId, setCaseOneBasicSelectedRowId] = useState(null);

  // "Modal first": whether the setup modal (asking which fields are
  // different across every product in this inward vs the same for all of
  // them) is open, and the answer once given - a Set of field keys from
  // modalFirstFieldCatalog that are common (i.e. NOT checked in the modal,
  // since the modal itself asks "what's different"). Anything not in the
  // set is "different" and becomes a table column. Defaults to every field
  // being common (nothing checked) rather than starting empty - on a real
  // inward most fields are the same across every product, so starting from
  // "everything's the same, tell me what isn't" needs zero clicks for the
  // common case instead of a checkbox for every field. Starts open the
  // moment this version is selected (see the VersionSelector's onChange
  // below) and is also reachable again later via a button on the page
  // itself, so a decision made early isn't locked in for good.
  const [modalFirstSetupOpen, setModalFirstSetupOpen] = useState(
    () => readStoredPageVersion() === 'modal-first',
  );
  const [modalFirstCommonFieldKeys, setModalFirstCommonFieldKeys] = useState(
    () => new Set(modalFirstFieldCatalog.map((field) => field.key)),
  );
  // Nothing chosen yet vs "chose zero common fields" are different states -
  // the modal hasn't been completed at least once until this flips true, so
  // the table always shows every column as "different" until then, rather
  // than briefly rendering a table with zero columns while the modal is
  // still deciding.
  const [modalFirstConfigured, setModalFirstConfigured] = useState(false);

  // Case 1's "Paste from last sample": snapshot of the product rows from the
  // most recently saved sample on this page, so the button has something to
  // restore. Null until a sample has actually been saved once.
  const [lastSavedProducts, setLastSavedProducts] = useState(null);

  // Remember whichever version is showing, so the next time this page opens
  // (a fresh mount - see App.jsx, this component is unmounted entirely on
  // close, not just hidden) it picks up the same one instead of always
  // starting on Case 1.
  useEffect(() => {
    writeStoredPageVersion(pageVersion);
  }, [pageVersion]);

  // Toasts clear themselves - nothing on this page needs a toast to stick
  // around waiting for a manual dismiss.
  useEffect(() => {
    if (!toast) return undefined;

    const timeoutId = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const selectedCustomer = customers.find((customer) => customer.id === values.customerId) ?? null;

  // Selection is a list of product ids; prune it whenever a row it pointed at
  // stops existing (deleted directly, pasted over via the count stepper, etc).
  useEffect(() => {
    setSelectedProductIds((current) => {
      const liveIds = new Set(products.map((product) => product.id));
      const next = current.filter((id) => liveIds.has(id));
      return next.length === current.length ? current : next;
    });
    setCaseOneBasicSelectedRowId((current) => (
      current && !products.some((product) => product.id === current) ? null : current
    ));
  }, [products]);

  // Product-wise only means anything with more than one product; dropping
  // back to one falls back to Shared rather than leaving Product-wise
  // selected over a single-row table that looks identical to Shared anyway.
  useEffect(() => {
    if (products.length <= 1) setCaseOneBasicDetailsMode('shared');
  }, [products.length]);

  // Case 1: keep Tentative Reporting Date and Amount in sync with whatever
  // the products currently imply, recomputed whenever a product's category
  // changes (or the version switches into Case 1).
  useEffect(() => {
    if (pageVersion !== 'case-1') return;

    const estimate = estimateFromProductCategories(products);
    setValues((current) => ({
      ...current,
      tentativeReportingDate: estimate ? addDaysToDisplayDate(current.receivingDate, estimate.days) : '',
      amount: estimate ? String(estimate.amount) : '',
    }));
    // receivingDate is read, not depended on: re-deriving on every keystroke
    // there would fight the field's own edits mid-typing. Product category
    // changes are what should trigger a recompute.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageVersion, products]);

  // Land with the first field focused so typing can start immediately. Each
  // version's Customer field has its own id, so re-run this whenever the
  // version changes rather than only on mount.
  useEffect(() => {
    const fieldId = pageVersion === 'case-1' || pageVersion === 'modal-first'
      ? 'inward-case-one-customer'
      : 'inward-customer';
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(fieldId)?.focus();
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const clearErrors = (...keys) => {
    setErrors((current) => {
      let changed = false;
      const next = { ...current };
      keys.forEach((key) => {
        if (next[key]) {
          delete next[key];
          changed = true;
        }
      });
      return changed ? next : current;
    });
  };

  const updateValue = (key, value) => {
    clearErrors(key);

    if (key === 'customerId') {
      const nextCustomer = customers.find((customer) => customer.id === value);
      clearErrors('billingAddress');
      // Selecting an existing customer leaves "More details" as the user had it.
      setValues((current) => ({
        ...current,
        customerId: value,
        customerQuotation: '',
        ...copyCustomerFields(nextCustomer),
      }));
      return;
    }

    setValues((current) => ({ ...current, [key]: value }));
  };

  // Modal-first, Customer marked "different": each row's own customer
  // instead of the shared values.customerId. Only customerId and the
  // billing address ride on the row itself - the rest of a customer's
  // record (legal name, GST, contacts, ship-to address) still lives on the
  // customer object in `customers` and is edited there via "View customer
  // details", the same as the shared-Customer path; duplicating all of it
  // per row would turn one dropdown into six more table columns for
  // information that describes the customer, not this particular sample.
  const updateProductCustomer = (productId, customerId) => {
    clearErrors(`product-${productId}-customerId`);
    const nextCustomer = customers.find((customer) => customer.id === customerId);
    setProducts((current) => current.map((product) => (
      product.id === productId
        ? { ...product, customerId, billingAddress: nextCustomer?.billToAddress ?? '' }
        : product
    )));
  };

  const handleCustomerModalSubmit = (draft) => {
    const { productId, assignToValues } = customerModal;

    if (customerModal.mode === 'details') {
      const targetCustomerId = productId
        ? products.find((product) => product.id === productId)?.customerId
        : values.customerId;

      setCustomers((current) => current.map((customer) => (
        customer.id === targetCustomerId ? { ...customer, ...draft } : customer
      )));
      if (productId) {
        setProducts((current) => current.map((product) => (
          product.id === productId ? { ...product, billingAddress: draft.billToAddress ?? '' } : product
        )));
      } else {
        setValues((current) => ({ ...current, ...copyCustomerFields(draft) }));
      }
      setCustomerModal({ open: false, mode: 'details', productId: null });
      setToast({ tone: 'success', message: `${draft.name} updated.` });
      return;
    }

    const customer = { ...draft, id: createId('customer'), quotations: [] };
    setCustomers((current) => [...current, customer]);
    if (productId) {
      // Not updateProductCustomer here: that reads `customers` from this
      // render's closure, which doesn't have `customer` yet since the
      // setCustomers above hasn't flushed - write the product directly
      // from the customer object created just now instead.
      setProducts((current) => current.map((product) => (
        product.id === productId
          ? { ...product, customerId: customer.id, billingAddress: customer.billToAddress ?? '' }
          : product
      )));
      clearErrors(`product-${productId}-customerId`);
    } else if (assignToValues) {
      setValues((current) => ({
        ...current,
        customerId: customer.id,
        customerQuotation: '',
        ...copyCustomerFields(customer),
      }));
      clearErrors('customerId', 'billingAddress');
      // Surface what was just entered rather than hiding it behind the toggle.
      setMoreDetailsOpen(true);
    }
    // else: modal-first's per-row "New Customer" header button - the new
    // customer joins the shared pool for every row's dropdown, but nothing
    // gets auto-assigned to any particular row (there's no single row this
    // button was "for").
    setCustomerModal({ open: false, mode: 'create', productId: null, assignToValues: true });
    setToast({ tone: 'success', message: `${customer.name} added.` });
  };

  const updateProductCell = (productId, key, value) => {
    clearErrors(`product-${productId}-${key}`);
    setProducts((current) => current.map((product) => (
      product.id === productId
        ? {
            ...product,
            [key]: value,
            // Product options are scoped by category.
            ...(key === 'category' ? { product: '' } : {}),
          }
        : product
    )));
  };

  const addProduct = () => setProducts((current) => [...current, createProduct()]);

  const setProductCount = (nextCount) => {
    setProducts((current) => {
      if (nextCount === current.length) return current;
      if (nextCount < current.length) return current.slice(0, nextCount);

      const added = Array.from({ length: nextCount - current.length }, () => createProduct());
      return [...current, ...added];
    });
  };

  const deleteProduct = (productId) => {
    if (!productId) return;
    setProducts((current) => (
      current.length > 1 ? current.filter((product) => product.id !== productId) : current
    ));
    setErrors((current) => Object.fromEntries(
      Object.entries(current).filter(([key]) => !key.startsWith(`product-${productId}-`)),
    ));
    setSelectedProductIds((current) => current.filter((id) => id !== productId));
  };

  const toggleProductSelected = (productId, checked) => {
    setSelectedProductIds((current) => {
      if (checked) return current.includes(productId) ? current : [...current, productId];
      return current.filter((id) => id !== productId);
    });
  };

  const toggleAllProductsSelected = (checked) => {
    setSelectedProductIds(checked ? products.map((product) => product.id) : []);
  };

  // Flips every row's checked state at once - whatever wasn't selected
  // becomes the new selection, and vice versa.
  const invertProductSelection = () => {
    setSelectedProductIds((current) => (
      products.filter((product) => !current.includes(product.id)).map((product) => product.id)
    ));
  };

  // Deletes every checked row, short of emptying the table entirely.
  const bulkDeleteProducts = () => {
    if (!selectedProductIds.length || selectedProductIds.length >= products.length) return;

    const deletedIds = selectedProductIds;
    setProducts((current) => current.filter((product) => !deletedIds.includes(product.id)));
    setErrors((current) => Object.fromEntries(
      Object.entries(current).filter(([key]) => (
        !deletedIds.some((id) => key.startsWith(`product-${id}-`))
      )),
    ));
    setToast({
      tone: 'success',
      message: `${deletedIds.length} ${deletedIds.length === 1 ? 'product' : 'products'} deleted.`,
    });
    setSelectedProductIds([]);
  };

  // Auto-fill column, scoped to whichever rows are checked.
  const bulkAutoFillProducts = () => {
    if (!selectedProductIds.length) return;
    autoFillProducts(selectedProductIds);
    setSelectedProductIds([]);
  };

  // Case 1's action center "Paste in selected rows": pastes whatever's on the
  // clipboard into every checked row in one update, same clipboard
  // `copiedProduct` the per-row paste button uses.
  const pasteProductsIntoSelection = () => {
    if (!copiedProduct || !selectedProductIds.length) return;

    const targetSet = new Set(selectedProductIds);
    setErrors((current) => Object.fromEntries(
      Object.entries(current).filter(([key]) => (
        !selectedProductIds.some((id) => key.startsWith(`product-${id}-`))
      )),
    ));
    setProducts((current) => current.map((product) => (
      targetSet.has(product.id)
        ? createProduct({
            ...copiedProduct,
            id: product.id,
            sampleSize: { ...copiedProduct.sampleSize },
            parameters: copiedProduct.parameters.length
              ? copiedProduct.parameters.map((parameter) => createParameterRow(parameter))
              : [createParameterRow()],
          })
        : product
    )));
    setToast({
      tone: 'success',
      message: `Pasted into ${selectedProductIds.length} ${selectedProductIds.length === 1 ? 'product' : 'products'}.`,
    });
  };

  const copyProduct = (productId) => {
    const source = products.find((product) => product.id === productId);
    if (!source) return;

    // parametersSourceIndex points at a row index in *this* table - stale
    // the moment it's copied out, since paste can land in any other table.
    const { id: _id, parameters = [], parametersSourceIndex: _sourceIndex, ...rest } = source;
    setCopiedProduct({
      ...rest,
      sampleSize: { ...source.sampleSize },
      parameters: parameters.map(({ id: _parameterId, ...parameter }) => ({ ...parameter })),
    });
    setToast({
      tone: 'success',
      message: `Product ${products.indexOf(source) + 1} copied.`,
    });
  };

  const pasteProduct = (productId) => {
    if (!copiedProduct) return;

    setErrors((current) => Object.fromEntries(
      Object.entries(current).filter(([key]) => !key.startsWith(`product-${productId}-`)),
    ));
    setProducts((current) => current.map((product) => (
      product.id === productId
        ? createProduct({
            ...copiedProduct,
            id: product.id,
            sampleSize: { ...copiedProduct.sampleSize },
            parameters: copiedProduct.parameters.length
              ? copiedProduct.parameters.map((parameter) => createParameterRow(parameter))
              : [createParameterRow()],
          })
        : product
    )));
  };

  // Case 1's "Paste from last sample": replaces the whole Product Details
  // card with a fresh copy of whatever was saved last time on this page.
  const pasteProductsFromLastSample = () => {
    if (!lastSavedProducts?.length) return;

    setErrors({});
    setProducts(lastSavedProducts.map((product) => createProduct({
      ...product,
      sampleSize: { ...product.sampleSize },
      parameters: product.parameters.length
        ? product.parameters.map((parameter) => createParameterRow(parameter))
        : [createParameterRow()],
    })));
    setToast({
      tone: 'success',
      message: `Pasted ${lastSavedProducts.length} ${lastSavedProducts.length === 1 ? 'product' : 'products'} from the last sample.`,
    });
  };

  const updateParameter = (productId, parameterId, key, value) => {
    setProducts((current) => current.map((product) => (
      product.id === productId
        ? {
            ...product,
            parametersSourceIndex: null,
            parameters: product.parameters.map((parameter) => (
              parameter.id === parameterId ? { ...parameter, [key]: value } : parameter
            )),
          }
        : product
    )));
  };

  const addParameter = (productId) => {
    setProducts((current) => current.map((product) => (
      product.id === productId
        ? { ...product, parametersSourceIndex: null, parameters: [...product.parameters, createParameterRow()] }
        : product
    )));
  };

  const deleteParameter = (productId, parameterId) => {
    setProducts((current) => current.map((product) => (
      product.id === productId && product.parameters.length > 1
        ? {
            ...product,
            parametersSourceIndex: null,
            parameters: product.parameters.filter((row) => row.id !== parameterId),
          }
        : product
    )));
  };

  const autoFillParameters = (productId) => {
    setProducts((current) => current.map((product) => {
      if (product.id !== productId) return product;

      const presets = getParameterPreset(product.category, product.product);
      if (!presets.length) return product;

      return {
        ...product,
        parametersSourceIndex: null,
        parameters: presets.map((preset) => createParameterRow(preset)),
      };
    }));
  };

  /*
   * Fills every empty cell in every grid column from whatever pattern (or
   * single filled value) that column already has - one call to
   * getColumnFillPlan per column, merged into one update. This is the same
   * per-column "last two filled rows, or just the one filled row" logic the
   * scoped "Auto-fill column" button already uses (see getColumnFillPlan
   * below), so a column with only product 1 filled copies product 1 into
   * every other row, and a column with an established step pattern continues
   * that pattern into whatever's left - never touching a cell that already
   * has a value.
   *
   * Testing Details (parameters) rides along the same pass: any row with
   * zero filled parameters gets a copy of the most recently filled row's
   * parameters, same source rules as "Apply to all products" (and it sets
   * parametersSourceIndex the same way, so the Testing Details cell's "Same
   * as Product X" note appears here too). There's no pattern to detect for
   * parameters - just "copy the last filled one" - so unlike the grid
   * columns above, this doesn't go through getColumnFillPlan.
   */
  // targetIds narrows the fill to specific rows (bulk "Auto-fill" over a
  // checked selection); omitted, it reaches every empty cell in the table.
  const autoFillProducts = (targetIds = null) => {
    if (products.length < 2) return;

    const targetSet = targetIds ? new Set(targetIds) : null;
    const rowUpdatesByIndex = new Map();

    autoFillableKeys.forEach((key) => {
      const plan = getColumnFillPlan(key);
      if (!plan) return;

      plan.forEach((value, index) => {
        if (targetSet && !targetSet.has(products[index]?.id)) return;

        const existing = rowUpdatesByIndex.get(index) ?? {};
        existing[key] = value;
        rowUpdatesByIndex.set(index, existing);
      });
    });

    // Parameters: find the last row (by index) with at least one filled
    // parameter, then copy it into every other target row that has none.
    const lastFilledParametersIndex = (() => {
      for (let index = products.length - 1; index >= 0; index -= 1) {
        if (countFilledParameters(products[index]) > 0) return index;
      }
      return -1;
    })();

    let filledParameterRowCount = 0;
    if (lastFilledParametersIndex !== -1) {
      const sourceProduct = products[lastFilledParametersIndex];
      products.forEach((product, index) => {
        if (index === lastFilledParametersIndex) return;
        if (targetSet && !targetSet.has(product.id)) return;
        if (countFilledParameters(product) > 0) return;

        const existing = rowUpdatesByIndex.get(index) ?? {};
        existing.parametersSourceIndex = lastFilledParametersIndex;
        existing.parameters = sourceProduct.parameters.map(({ id: _id, ...parameter }) => (
          createParameterRow(parameter)
        ));
        rowUpdatesByIndex.set(index, existing);
        filledParameterRowCount += 1;
      });
    }

    if (!rowUpdatesByIndex.size) {
      setToast({ tone: 'error', message: 'No filled rows to copy a pattern from.' });
      return;
    }

    setProducts((current) => current.map((product, index) => {
      const updates = rowUpdatesByIndex.get(index);
      if (!updates) return product;

      const next = { ...product, ...updates };
      // Product options are scoped by category, so a row whose category
      // just changed needs its old product cleared - but only when this
      // same pass didn't also fill the Product column with a value of its
      // own. Every grid column gets its own independent fill plan here, so
      // a row can legitimately receive a category *and* a product update in
      // the same call; blindly clearing `product` whenever `category` is
      // present would erase that just-filled value instead of a stale one.
      if ('category' in updates && !('product' in updates)) next.product = '';

      return next;
    }));
    setErrors({});

    const filledRowCount = rowUpdatesByIndex.size;
    const parameterNote = filledParameterRowCount
      ? ` (${filledParameterRowCount} of them also got testing details)`
      : '';
    setToast({
      tone: 'success',
      message: `Pattern applied to ${filledRowCount} ${filledRowCount === 1 ? 'product' : 'products'}${parameterNote}.`,
    });
  };

  /*
   * Case 1's "Auto-fill column": scoped to whichever column is selected,
   * rather than the whole table.
   *
   *   - Dropdown columns (Category, Product) never pattern-match against
   *     each other; there is no meaningful "next" category. Every empty row
   *     just gets a copy of the most recently filled value.
   *   - Text-shaped columns (Batch, and Sample Size's numeric value) look
   *     for a pattern the same way the header Auto-fill does, but anchored
   *     on whichever two filled rows are most recent rather than always
   *     rows 1 and 2 - so filling row 1 alone and running this still works
   *     (one filled row can't form a pattern, so it copies), and so does
   *     filling rows 2 and 3 and running this on the rest.
   *   - The pattern math itself (date stepping, numeric/alphanumeric
   *     increments) is shared with the header Auto-fill via
   *     extrapolateValue, so both buttons infer patterns identically.
   *
   * Pattern detection only kicks in when the two most recent filled rows are
   * adjacent (one row apart) - extrapolateValue's delta math assumes a
   * single-row step, and a non-adjacent pair would silently misapply it. A
   * non-adjacent pair falls back to copying the latest value, which is never
   * wrong, just less clever.
   */
  function getColumnFillPlan(columnKey) {
    const columnDef = productColumns.find((column) => column.key === columnKey);
    if (!columnDef) return null;

    const isSampleSize = columnKey === 'sampleSize';
    const readValue = (product) => (isSampleSize ? product.sampleSize?.value ?? '' : product[columnKey] ?? '');
    const isFilled = (product) => Boolean(String(readValue(product)).trim());

    const filledEntries = products
      .map((product, index) => ({ product, index }))
      .filter(({ product }) => isFilled(product));
    if (!filledEntries.length) return null;

    const emptyIndexes = products
      .map((product, index) => ({ product, index }))
      .filter(({ product }) => !isFilled(product))
      .map(({ index }) => index);
    if (!emptyIndexes.length) return null;

    // slice(-2) on a single-entry array yields a one-element array, and
    // destructuring that into [secondLast, last] would wrongly put the entry
    // in secondLast and leave last undefined. Index from the end instead.
    const last = filledEntries[filledEntries.length - 1];
    const secondLast = filledEntries.length >= 2 ? filledEntries[filledEntries.length - 2] : null;
    const rowGap = secondLast ? last.index - secondLast.index : null;
    const canDetectPattern = columnDef.type !== 'dropdown' && rowGap === 1;

    const plan = new Map();

    if (!canDetectPattern) {
      const sourceValue = isSampleSize ? { ...last.product.sampleSize } : last.product[columnKey];
      emptyIndexes.forEach((index) => {
        plan.set(index, sourceValue && typeof sourceValue === 'object' ? { ...sourceValue } : sourceValue);
      });
      return plan;
    }

    const value1 = readValue(secondLast.product);
    const value2 = readValue(last.product);
    const unit = isSampleSize ? (last.product.sampleSize?.unit ?? '') : undefined;

    emptyIndexes.forEach((index) => {
      const stepsAfterLast = index - last.index;
      const extrapolated = extrapolateValue(value1, value2, stepsAfterLast);
      plan.set(index, isSampleSize ? { value: extrapolated, unit } : extrapolated);
    });

    return plan;
  }

  const autoFillSelectedColumn = (columnKey) => {
    const plan = getColumnFillPlan(columnKey);
    if (!plan) {
      setToast({ tone: 'error', message: 'No filled rows in that column to copy a pattern from.' });
      return;
    }

    setProducts((current) => current.map((product, index) => {
      if (!plan.has(index)) return product;

      const next = { ...product, [columnKey]: plan.get(index) };
      // Product options are scoped by category; an empty row that just
      // inherited a category needs its (still empty) product cleared of any
      // stale value the way a manual edit would.
      if (columnKey === 'category') next.product = '';

      return next;
    }));
    setErrors({});
    setToast({
      tone: 'success',
      message: `${plan.size} ${plan.size === 1 ? 'row' : 'rows'} filled in the ${productColumns.find((c) => c.key === columnKey)?.label ?? columnKey} column.`,
    });
  };

  // Case 1's Basic Details, "Product-wise" mode: same cell-edit/auto-fill
  // shape as the product grid above, just writing into product.basicDetails
  // instead of the product's own keys, and every column is plain text (no
  // dropdowns, no sample-size split field).
  const updateProductBasicDetail = (productId, key, value) => {
    setProducts((current) => current.map((product) => (
      product.id === productId
        ? { ...product, basicDetails: { ...product.basicDetails, [key]: value } }
        : product
    )));
  };

  // "Modal first": a field marked "common" is really just one input that
  // writes the same value into every product row at once, rather than a
  // separate piece of shared state - so switching a field from common back
  // to "different" later still leaves every row with the value that was
  // last entered while it was common, instead of losing it.
  const updateCommonProductField = (key, value) => {
    setProducts((current) => current.map((product) => (
      key === 'category' ? { ...product, category: value, product: '' } : { ...product, [key]: value }
    )));
  };

  function getBasicDetailFillPlan(columnKey) {
    const readValue = (product) => product.basicDetails?.[columnKey] ?? '';
    const isFilled = (product) => Boolean(String(readValue(product)).trim());

    const filledEntries = products
      .map((product, index) => ({ product, index }))
      .filter(({ product }) => isFilled(product));
    if (!filledEntries.length) return null;

    const emptyIndexes = products
      .map((product, index) => ({ product, index }))
      .filter(({ product }) => !isFilled(product))
      .map(({ index }) => index);
    if (!emptyIndexes.length) return null;

    const last = filledEntries[filledEntries.length - 1];
    const secondLast = filledEntries.length >= 2 ? filledEntries[filledEntries.length - 2] : null;
    const rowGap = secondLast ? last.index - secondLast.index : null;
    const canDetectPattern = rowGap === 1;

    const plan = new Map();

    if (!canDetectPattern) {
      const sourceValue = readValue(last.product);
      emptyIndexes.forEach((index) => plan.set(index, sourceValue));
      return plan;
    }

    const value1 = readValue(secondLast.product);
    const value2 = readValue(last.product);

    emptyIndexes.forEach((index) => {
      const stepsAfterLast = index - last.index;
      plan.set(index, extrapolateValue(value1, value2, stepsAfterLast));
    });

    return plan;
  }

  const autoFillBasicDetails = () => {
    const rowUpdatesByIndex = new Map();

    caseOneBasicDetailColumns.forEach((column) => {
      const plan = getBasicDetailFillPlan(column.key);
      if (!plan) return;

      plan.forEach((value, index) => {
        const existing = rowUpdatesByIndex.get(index) ?? {};
        existing[column.key] = value;
        rowUpdatesByIndex.set(index, existing);
      });
    });

    if (!rowUpdatesByIndex.size) {
      setToast({ tone: 'error', message: 'No filled rows to copy a pattern from.' });
      return;
    }

    setProducts((current) => current.map((product, index) => {
      const updates = rowUpdatesByIndex.get(index);
      if (!updates) return product;
      return { ...product, basicDetails: { ...product.basicDetails, ...updates } };
    }));
    setToast({
      tone: 'success',
      message: `Pattern applied to ${rowUpdatesByIndex.size} ${rowUpdatesByIndex.size === 1 ? 'product' : 'products'}.`,
    });
  };

  const autoFillSelectedBasicDetailColumn = (columnKey) => {
    const plan = getBasicDetailFillPlan(columnKey);
    if (!plan) {
      setToast({ tone: 'error', message: 'No filled rows in that column to copy a pattern from.' });
      return;
    }

    setProducts((current) => current.map((product, index) => (
      plan.has(index)
        ? { ...product, basicDetails: { ...product.basicDetails, [columnKey]: plan.get(index) } }
        : product
    )));
    setToast({
      tone: 'success',
      message: `${plan.size} ${plan.size === 1 ? 'row' : 'rows'} filled in the ${caseOneBasicDetailColumns.find((c) => c.key === columnKey)?.label ?? columnKey} column.`,
    });
  };

  // Replicate one product's testing parameters onto every other product.
  const applyParametersToAll = (productId) => {
    const source = products.find((product) => product.id === productId);
    const sourceIndex = products.indexOf(source);
    if (!source || countFilledParameters(source) === 0) return;

    setProducts((current) => current.map((product) => (
      product.id === productId
        ? product
        : {
            ...product,
            parametersSourceIndex: sourceIndex,
            parameters: source.parameters.map(({ id: _id, ...parameter }) => (
              createParameterRow(parameter)
            )),
          }
    )));
    setToast({
      tone: 'success',
      message: `Parameters applied to ${products.length - 1} other ${products.length - 1 === 1 ? 'product' : 'products'}.`,
    });
  };

  // Same idea as applyParametersToAll, but scoped to rows that share this
  // row's Product value - e.g. 5 rows split "A"/"A"/"B"/"B"/"B" by product,
  // filling parameters on one "B" row and running this reaches only the
  // other "B" rows, not the "A" ones.
  const applyParametersToSameProduct = (productId) => {
    const source = products.find((product) => product.id === productId);
    const sourceIndex = products.indexOf(source);
    if (!source || !source.product || countFilledParameters(source) === 0) return;

    const matchingCount = products.filter((product) => (
      product.id !== productId && product.product === source.product
    )).length;
    if (!matchingCount) return;

    setProducts((current) => current.map((product) => (
      product.id === productId || product.product !== source.product
        ? product
        : {
            ...product,
            parametersSourceIndex: sourceIndex,
            parameters: source.parameters.map(({ id: _id, ...parameter }) => (
              createParameterRow(parameter)
            )),
          }
    )));
    setToast({
      tone: 'success',
      message: `Parameters applied to ${matchingCount} other ${matchingCount === 1 ? 'product' : 'products'} matching "${source.product}".`,
    });
  };

  const validate = () => {
    const nextErrors = {};
    const require = (key, value, message = 'This field is required.') => {
      if (!String(value ?? '').trim()) nextErrors[key] = message;
    };

    require('sampleType', values.sampleType);
    require('receivingDate', values.receivingDate);
    // Modal-first with Customer marked "different" has no shared Customer
    // field at all - values.customerId is never shown or set in that case,
    // so requiring it here would demand a value the user was never given a
    // field for. Every other version (and modal-first with Customer
    // "common") still requires the one shared field.
    const isModalFirstCustomerDifferent = isModalFirst
      && !modalFirstCommonFieldKeys.has(modalFirstCustomerField.key);
    if (!isModalFirstCustomerDifferent) {
      require('customerId', values.customerId, 'Select a customer or create one.');
    }
    // Case 1 and modal-first have no Billing Address field, so neither has
    // anything to require here.
    if (pageVersion !== 'case-1' && pageVersion !== 'modal-first') {
      require('billingAddress', values.billingAddress);
    }

    if (isModalFirstCustomerDifferent) {
      products.forEach((product, index) => {
        require(
          `product-${product.id}-customerId`,
          product.customerId,
          `Select a customer for product ${index + 1}.`,
        );
      });
    }

    products.forEach((product, index) => {
      productColumns
        .filter((column) => column.required)
        // Modal-first: a required field marked "common" only has one input
        // for it (on product 1), not one per row - requiring it on every
        // row's own key would demand values rows 2+ were never given a
        // field to enter in the first place.
        .filter((column) => !isModalFirst || index === 0 || !modalFirstCommonFieldKeys.has(column.key))
        .forEach((column) => {
          require(
            `product-${product.id}-${column.key}`,
            product[column.key],
            `${column.label} is required in product ${index + 1}.`,
          );
        });
    });

    setErrors(nextErrors);
    return nextErrors;
  };

  // Every required field lives on the Sample info tab, so that is where the
  // badge and the redirect point.
  const sampleInfoErrorCount = useMemo(() => Object.keys(errors).length, [errors]);

  const productsMissingParameters = useMemo(
    () => products.filter((product) => countFilledParameters(product) === 0),
    [products],
  );

  const requestSave = () => {
    const nextErrors = validate();
    const errorCount = Object.keys(nextErrors).length;

    if (errorCount) {
      setActiveTab('sample-info');
      setToast({
        tone: 'error',
        message: `${errorCount} ${errorCount === 1 ? 'field needs' : 'fields need'} attention before this sample can be saved.`,
      });
      return;
    }

    // Test requests are generated on save, so every product needs testing
    // details to generate them from.
    if (trGeneration && productsMissingParameters.length) {
      setTrErrorOpen(true);
      return;
    }

    // Products here are line items within one inward, not separate samples -
    // there's nothing left to confirm once validation passes, so Save just
    // saves.
    handleConfirmedSave();
  };

  // Saving always produces one sample per product.
  const handleConfirmedSave = () => {
    const sampleCount = products.length;

    // Snapshot for Case 1's "Paste from last sample", stripped of the ids so
    // a later paste creates fresh rows rather than reusing stale ones.
    setLastSavedProducts(products.map(({ id: _id, parameters = [], ...rest }) => ({
      ...rest,
      sampleSize: { ...rest.sampleSize },
      parameters: parameters.map(({ id: _parameterId, ...parameter }) => ({ ...parameter })),
    })));

    if (onComplete) {
      onComplete({ values, products, customers, sampleCount });
      return;
    }

    setToast({
      tone: 'success',
      message: `${sampleCount} ${sampleCount === 1 ? 'sample' : 'samples'} created, one per product.`,
    });
  };

  const isSinglePage = pageVersion === 'single-page';
  const isCaseOne = pageVersion === 'case-1';
  const isModalFirst = pageVersion === 'modal-first';
  const testingDrawerProduct = products.find((product) => product.id === testingDrawerProductId) ?? null;
  const testingDrawerProductIndex = products.findIndex((product) => product.id === testingDrawerProductId);

  return (
    <div className="smplfy-inward-page bg-body-tertiary d-flex flex-column">
      <TopBar parentLabel={parentLabel} currentLabel="New Inward" onBack={onBack} />

      <div className="smplfy-inward-header">
        <div className="d-flex align-items-center gap-3 min-w-0">
          <SecondaryButton
            size="medium"
            className="px-0 flex-shrink-0"
            aria-label="Go back"
            onClick={onBack}
          >
            <AppIcon name="chevron-left" />
          </SecondaryButton>
          <h1 className="smplfy-inward-title">New Inward</h1>
          <VersionSelector
            value={pageVersion}
            options={versionOptions}
            onChange={(nextVersion) => {
              setPageVersion(nextVersion);
              setActiveTab('sample-info');
              setTestingDrawerOpen(false);
              setSelectedProductIds([]);
              setCaseOneBasicMoreOpen(false);
              setCaseOneSelectedColumnKey(null);
              if (nextVersion === 'case-1' || nextVersion === 'modal-first') {
                // TR Generation has nothing to gate on either of these
                // versions (no testing-details tab to raise TRs from), so
                // it's switched off along with the rest of the Case 1-style
                // defaults both versions share.
                setTrGeneration(false);
                // Mode of Sample Receipt / Received By only default this way
                // on Case 1/modal-first, so swap the values wholesale rather
                // than patching them in and out as the version changes.
                if (pageVersion !== 'case-1' && pageVersion !== 'modal-first') {
                  setValues((current) => ({
                    ...current,
                    receiptMode: 'Courier',
                    receivedBy: CASE_ONE_DEFAULT_USER,
                  }));
                }
              }
              if (nextVersion === 'modal-first' && !modalFirstConfigured) {
                setModalFirstSetupOpen(true);
              }
            }}
          />
        </div>

        <div className="d-flex align-items-center gap-3 flex-wrap">
          {/* Case 1 and modal-first have no testing details anywhere on the
              page, so there's nothing for this switch to gate; hidden
              rather than disabled, since a disabled-but-visible toggle would
              invite the question of why it can't be turned on. */}
          {!isCaseOne && !isModalFirst ? (
            <div className="form-check form-switch smplfy-inward-switch">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="inward-tr-generation"
                checked={trGeneration}
                onChange={(event) => setTrGeneration(event.target.checked)}
              />
              <label className="form-check-label" htmlFor="inward-tr-generation">
                TR Generation
              </label>
            </div>
          ) : null}
          <PrimaryButton leftIcon="save" onClick={requestSave}>
            Save
          </PrimaryButton>
        </div>
      </div>

      {/* Default version only: single-page, Case 1, and modal-first all drop
          the section bar and scroll everything on one page. Single-page
          moves testing details into a per-product drawer; Case 1 does the
          same when it has more than one product, and shows the parameter
          table inline in the Product Details card when there's exactly one;
          modal-first has no testing-details concept at all. */}
      {!isSinglePage && !isCaseOne && !isModalFirst ? (
        <div className="smplfy-inward-tabs">
          <div className="nav nav-tabs border-0" role="tablist" aria-label="New inward sections">
            {inwardTabs.map((tab) => (
              <NavSelector
                key={tab.key}
                active={activeTab === tab.key}
                count={tab.key === 'sample-info' ? sampleInfoErrorCount || undefined : undefined}
                role="tab"
                aria-selected={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </NavSelector>
            ))}
          </div>
        </div>
      ) : null}

      <main className="smplfy-inward-main">
        <div className="smplfy-inward-content">
          {isCaseOne ? (
            <>
              {/* Sample Type and Receiving Date live directly on the page,
                  above every card, rather than inside the Customer card. */}
              <div className="row g-4 smplfy-inward-top-fields">
                <div className="col-md-6 col-xl-3">
                  <FormElement
                    type="rich-dropdown"
                    mandatory
                    label="Sample Type"
                    message={errors.sampleType}
                    messageTone="error"
                    inputProps={{
                      value: values.sampleType,
                      options: sampleTypeOptions,
                      placeholder: 'Select sample type',
                      searchable: true,
                      onChange: (event) => updateValue('sampleType', event.target.value),
                    }}
                  />
                </div>
                <div className="col-md-6 col-xl-3">
                  <FormElement
                    type="date"
                    mandatory
                    label="Receiving Date"
                    message={errors.receivingDate}
                    messageTone="error"
                    inputProps={{
                      value: values.receivingDate,
                      placeholder: 'DD/MM/YYYY',
                      onChange: (event) => updateValue('receivingDate', event.target.value),
                    }}
                  />
                </div>
              </div>

              <CaseOneCustomerCard
                values={values}
                customers={customers}
                errors={errors}
                moreDetailsOpen={moreDetailsOpen}
                onChange={updateValue}
                onAddCustomer={() => setCustomerModal({ open: true, mode: 'create', productId: null, assignToValues: true })}
                onViewCustomer={() => setCustomerModal({ open: true, mode: 'details', productId: null, assignToValues: true })}
                onToggleMoreDetails={() => setMoreDetailsOpen((isOpen) => !isOpen)}
              />
              <CaseOneProductDetailsCard
                products={products}
                errors={errors}
                hasLastSampleProducts={Boolean(lastSavedProducts)}
                selectedColumnKey={caseOneSelectedColumnKey}
                selectedProductIds={selectedProductIds}
                onCellChange={updateProductCell}
                onCountChange={setProductCount}
                onAddProduct={addProduct}
                onDelete={deleteProduct}
                onPasteFromLastSample={pasteProductsFromLastSample}
                onParameterChange={updateParameter}
                onAddParameter={addParameter}
                onDeleteParameter={deleteParameter}
                onAutoFillParameters={autoFillParameters}
                onOpenTestingDetails={(productId) => {
                  setTestingDrawerProductId(productId);
                  setTestingDrawerOpen(true);
                }}
                onSelectColumn={(columnKey, { forceSelect = false } = {}) => {
                  setCaseOneSelectedColumnKey((current) => (
                    !forceSelect && current === columnKey ? null : columnKey
                  ));
                }}
                onSelectCell={() => setCaseOneSelectedColumnKey(null)}
                onToggleProductSelected={toggleProductSelected}
                onToggleAllProductsSelected={toggleAllProductsSelected}
                actionCenter={(
                  <GridActionCenter
                    selectedRowCount={selectedProductIds.length}
                    totalRowCount={products.length}
                    hasCopiedRow={Boolean(copiedProduct)}
                    onSelectAll={() => toggleAllProductsSelected(true)}
                    onClearSelection={() => toggleAllProductsSelected(false)}
                    onInvertSelection={invertProductSelection}
                    canUndo={productsUndoStack.length > 0}
                    canRedo={productsRedoStack.length > 0}
                    onUndo={undoProducts}
                    onRedo={redoProducts}
                    autoFillLabel={caseOneSelectedColumnKey ? 'Auto-fill column' : 'Auto-fill table'}
                    canAutoFill={products.length >= 2}
                    onAutoFill={() => {
                      if (caseOneSelectedColumnKey) {
                        autoFillSelectedColumn(caseOneSelectedColumnKey);
                        return;
                      }
                      autoFillProducts();
                    }}
                    canCopy={selectedProductIds.length === 1}
                    onCopy={() => copyProduct(selectedProductIds[0])}
                    canPaste={Boolean(copiedProduct) && selectedProductIds.length > 0}
                    onPaste={pasteProductsIntoSelection}
                    canDelete={selectedProductIds.length > 0 && selectedProductIds.length < products.length}
                    onDelete={bulkDeleteProducts}
                  />
                )}
              />
              <CaseOneBasicDetailsCard
                values={values}
                onChange={updateValue}
                moreDetailsOpen={caseOneBasicMoreOpen}
                onToggleMoreDetails={() => setCaseOneBasicMoreOpen((isOpen) => !isOpen)}
                products={products}
                mode={caseOneBasicDetailsMode}
                onModeChange={setCaseOneBasicDetailsMode}
                selectedColumnKey={caseOneBasicSelectedColumnKey}
                selectedRowId={caseOneBasicSelectedRowId}
                onSelectColumn={(columnKey, { forceSelect = false } = {}) => {
                  setCaseOneBasicSelectedRowId(null);
                  setCaseOneBasicSelectedColumnKey((current) => (
                    !forceSelect && current === columnKey ? null : columnKey
                  ));
                }}
                onSelectRow={(productId) => {
                  setCaseOneBasicSelectedColumnKey(null);
                  setCaseOneBasicSelectedRowId((current) => (current === productId ? null : productId));
                }}
                onSelectCell={() => {
                  setCaseOneBasicSelectedColumnKey(null);
                  setCaseOneBasicSelectedRowId(null);
                }}
                onCellChange={updateProductBasicDetail}
                onAutoFill={autoFillBasicDetails}
                onAutoFillColumn={autoFillSelectedBasicDetailColumn}
              />
              <CaseOneAdditionalDetailsCard values={values} onChange={updateValue} />
            </>
          ) : null}

          {isModalFirst ? (
            <>
              <div className="row g-4 smplfy-inward-top-fields">
                <div className="col-md-6 col-xl-3">
                  <FormElement
                    type="rich-dropdown"
                    mandatory
                    label="Sample Type"
                    message={errors.sampleType}
                    messageTone="error"
                    inputProps={{
                      value: values.sampleType,
                      options: sampleTypeOptions,
                      placeholder: 'Select sample type',
                      searchable: true,
                      onChange: (event) => updateValue('sampleType', event.target.value),
                    }}
                  />
                </div>
                <div className="col-md-6 col-xl-3">
                  <FormElement
                    type="date"
                    mandatory
                    label="Receiving Date"
                    message={errors.receivingDate}
                    messageTone="error"
                    inputProps={{
                      value: values.receivingDate,
                      placeholder: 'DD/MM/YYYY',
                      onChange: (event) => updateValue('receivingDate', event.target.value),
                    }}
                  />
                </div>
              </div>

              {/* Customer marked "common" in the setup modal: one Customer
                  card for the whole inward, same as Case 1. Marked
                  "different": no card here at all - each row picks its own
                  customer in the table below instead. */}
              {!modalFirstCommonFieldKeys.has(modalFirstCustomerField.key) ? null : (
                <CaseOneCustomerCard
                  values={values}
                  customers={customers}
                  errors={errors}
                  moreDetailsOpen={moreDetailsOpen}
                  onChange={updateValue}
                  onAddCustomer={() => setCustomerModal({ open: true, mode: 'create', productId: null, assignToValues: true })}
                  onViewCustomer={() => setCustomerModal({ open: true, mode: 'details', productId: null, assignToValues: true })}
                  onToggleMoreDetails={() => setMoreDetailsOpen((isOpen) => !isOpen)}
                />
              )}
              <ModalFirstProductDetailsCard
                products={products}
                values={values}
                customers={customers}
                commonFieldKeys={modalFirstCommonFieldKeys}
                onCountChange={setProductCount}
                onAddProduct={addProduct}
                onDelete={deleteProduct}
                onCellChange={updateProductCell}
                onBasicCellChange={updateProductBasicDetail}
                onCommonProductFieldChange={updateCommonProductField}
                onValueChange={updateValue}
                onReopenSetup={() => setModalFirstSetupOpen(true)}
                onAddCustomer={() => setCustomerModal({
                  open: true, mode: 'create', productId: null, assignToValues: false,
                })}
                onViewProductCustomer={(productId) => setCustomerModal({
                  open: true, mode: 'details', productId, assignToValues: false,
                })}
                onProductCustomerChange={updateProductCustomer}
                onOpenTestingDetails={(productId) => {
                  setTestingDrawerProductId(productId);
                  setTestingDrawerOpen(true);
                }}
                errors={errors}
              />
              <CaseOneAdditionalDetailsCard values={values} onChange={updateValue} />
            </>
          ) : null}

          {!isCaseOne && !isModalFirst && (isSinglePage || activeTab === 'sample-info') ? (
            <>
              <CustomerDetailsCard
                values={values}
                customers={customers}
                errors={errors}
                moreDetailsOpen={moreDetailsOpen}
                onToggleMoreDetails={() => setMoreDetailsOpen((isOpen) => !isOpen)}
                onChange={updateValue}
                onAddCustomer={() => setCustomerModal({ open: true, mode: 'create', productId: null, assignToValues: true })}
                onViewCustomer={() => setCustomerModal({ open: true, mode: 'details', productId: null, assignToValues: true })}
              />
              <BasicDetailsCard values={values} onChange={updateValue} />
              <ProductDetailsCard
                products={products}
                errors={errors}
                copiedProduct={copiedProduct}
                singlePage={isSinglePage}
                selectedProductIds={selectedProductIds}
                onCellChange={updateProductCell}
                onCountChange={setProductCount}
                onAddProduct={addProduct}
                onCopy={copyProduct}
                onPaste={pasteProduct}
                onDelete={deleteProduct}
                onAutoFill={() => autoFillProducts()}
                onOpenTestingDetails={(productId) => {
                  setTestingDrawerProductId(productId);
                  setTestingDrawerOpen(true);
                }}
                onToggleProductSelected={toggleProductSelected}
                onToggleAllProductsSelected={toggleAllProductsSelected}
                onBulkDelete={bulkDeleteProducts}
                onBulkAutoFillColumn={bulkAutoFillProducts}
              />
              <AdditionalDetailsCard values={values} onChange={updateValue} />
            </>
          ) : null}

          {!isSinglePage && !isCaseOne && !isModalFirst && activeTab === 'testing-details' ? (
            <>
              {products.map((product, productIndex) => (
                <ProductParameterCard
                  key={product.id}
                  product={product}
                  productIndex={productIndex}
                  errors={errors}
                  canApplyToAll={countFilledParameters(product) > 0 && products.length > 1}
                  onApplyToAll={applyParametersToAll}
                  onCellChange={updateProductCell}
                  onParameterChange={updateParameter}
                  onAddParameter={addParameter}
                  onDeleteParameter={deleteParameter}
                  onAutoFillParameters={autoFillParameters}
                />
              ))}
            </>
          ) : null}
        </div>
      </main>

      <TestingDetailsDrawer
        open={(isSinglePage || isCaseOne || isModalFirst) && testingDrawerOpen}
        product={testingDrawerProduct}
        productIndex={testingDrawerProductIndex}
        productCount={products.length}
        products={products}
        onClose={() => setTestingDrawerOpen(false)}
        onCellChange={updateProductCell}
        onParameterChange={updateParameter}
        onAddParameter={addParameter}
        onDeleteParameter={deleteParameter}
        onAutoFillParameters={autoFillParameters}
        onApplyToAll={applyParametersToAll}
        onApplyToSameProduct={applyParametersToSameProduct}
        showIdentityFields={!isModalFirst}
      />

      <CustomerModal
        open={customerModal.open}
        mode={customerModal.mode}
        customer={
          customerModal.productId
            ? customers.find((customer) => (
              customer.id === products.find((product) => product.id === customerModal.productId)?.customerId
            )) ?? null
            : selectedCustomer
        }
        onClose={() => setCustomerModal((current) => ({ ...current, open: false }))}
        onSubmit={handleCustomerModalSubmit}
      />

      <ModalFirstSetupModal
        open={isModalFirst && modalFirstSetupOpen}
        commonFieldKeys={modalFirstCommonFieldKeys}
        onChange={setModalFirstCommonFieldKeys}
        onClose={() => setModalFirstSetupOpen(false)}
        onContinue={() => {
          // Customer flipping between "common" and "different" shouldn't
          // lose whatever was already picked - fill the gap the switch just
          // opened up rather than starting from blank. This only ever fills
          // an empty slot, never overwrites one that already has a value,
          // so it's safe to run on every Continue click regardless of
          // whether Customer's classification actually changed this time.
          if (modalFirstCommonFieldKeys.has(modalFirstCustomerField.key)) {
            // Now common: if the shared field is still empty, adopt
            // whichever row already had a customer picked (if any).
            if (!values.customerId) {
              const sourceProduct = products.find((product) => product.customerId);
              if (sourceProduct) {
                const sourceCustomer = customers.find((customer) => customer.id === sourceProduct.customerId);
                setValues((current) => ({
                  ...current,
                  customerId: sourceProduct.customerId,
                  customerQuotation: '',
                  ...copyCustomerFields(sourceCustomer),
                }));
              }
            }
          } else if (values.customerId) {
            // Now different: every row that doesn't already have its own
            // customer picked inherits the one the shared field had.
            setProducts((current) => current.map((product) => (
              product.customerId
                ? product
                : { ...product, customerId: values.customerId, billingAddress: values.billingAddress }
            )));
          }

          setModalFirstConfigured(true);
          setModalFirstSetupOpen(false);
        }}
      />

      <Modal
        open={trErrorOpen}
        title="Testing details required"
        titleId="inward-tr-error-title"
        titleIcon="alert-circle"
        size="small"
        className="smplfy-inward-error-modal"
        onClose={() => setTrErrorOpen(false)}
        actions={(
          <>
            <SecondaryButton onClick={() => setTrErrorOpen(false)}>Close</SecondaryButton>
            {!isSinglePage ? (
              <PrimaryButton
                onClick={() => {
                  setTrErrorOpen(false);
                  setActiveTab('testing-details');
                }}
              >
                Add testing details
              </PrimaryButton>
            ) : (
              <PrimaryButton
                onClick={() => {
                  setTrErrorOpen(false);
                  const firstUnscopedId = productsMissingParameters[0]?.id ?? null;
                  if (firstUnscopedId) {
                    setTestingDrawerProductId(firstUnscopedId);
                    setTestingDrawerOpen(true);
                  }
                }}
              >
                Add testing details
              </PrimaryButton>
            )}
          </>
        )}
      >
        <p className="mb-0">Testing details are required for creating sample.</p>
      </Modal>

      {toast ? (
        <div className="smplfy-inward-toast-region">
          <ToastNotification
            tone={toast.tone}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        </div>
      ) : null}
    </div>
  );
}
