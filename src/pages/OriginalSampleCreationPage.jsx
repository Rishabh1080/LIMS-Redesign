import { useEffect, useMemo, useRef, useState } from 'react';
import { trackEvent } from '../analytics/posthog';
import AppIcon from '../components/AppIcon';
import DataTable from '../components/DataTable';
import { FormElement, InputFieldRichDropdown } from '../components/FormControls';
import Modal from '../components/Modal/Modal';
import NavSelector from '../components/NavSelector/NavSelector';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import Stepper from '../components/Stepper/Stepper';
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

function TabbedProductDetailsSection({ products, errors, activeProductId, onProductSelect, onProductChange, onAddProduct, onDeleteProduct, onParameterChange, onAutoFillParameters, onAddParameter, onDeleteParameter }) {
  const activeProduct = products.find((p) => p.id === activeProductId) ?? products[0];

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
  const [formVariant, setFormVariant] = useState(layout === 'long-form' ? 'long-form' : null);
  const [activeProductTabId, setActiveProductTabId] = useState(null);
  const formRef = useRef(null);
  const formId = 'new-sample-original-form';
  const sampleTitle = mode === 'edit' ? getSampleDisplayName(sample) : 'New Sample';
  const activeProductTab = activeProductTabId ?? products[0]?.id ?? null;

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

    if (stepIndex === 2) {
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
      product_count: products.length,
      parameter_count: products.reduce((count, product) => count + product.parameters.length, 0),
      customer_created_in_flow: !initialCustomers.some((customer) => customer.id === values.customerId),
    });
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
        <div className="d-flex align-items-center justify-content-between gap-3 bg-white border-bottom px-4 py-3">
          <div className="d-flex align-items-center gap-3 min-w-0">
            <SecondaryButton size="medium" className="px-0 flex-shrink-0" aria-label="Go back" onClick={onBackToWorkspace}>
              <AppIcon name="chevron-left" />
            </SecondaryButton>
            <h1 className="h6 fw-semibold text-body mb-0">{mode === 'edit' ? `Edit ${sampleTitle}` : 'New Base Sample'}</h1>
          </div>
          <div className="d-flex align-items-center gap-3">
            <select
              className="form-select form-select-sm"
              style={{ width: 'auto' }}
              value={formVariant}
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

        {formVariant === '50-50-split' ? (
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
