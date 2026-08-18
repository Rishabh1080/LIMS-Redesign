import { useEffect, useMemo, useRef, useState } from 'react';
import { SAMPLE_FORM_EXPERIMENT_FLAG, trackEvent, useFeatureFlagVariant } from '../analytics/posthog';
import AppIcon from '../components/AppIcon';
import DataTable from '../components/DataTable';
import { FormElement, InputFieldDropdown } from '../components/FormControls';
import NavSelector from '../components/NavSelector';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import Stepper from '../components/Stepper/Stepper';
import './new-sample-customer-details-page.scss';

const wizardSteps = [
  'Customer Details',
  'Basic Details',
  'Sample Details',
  'Product Details',
  'Additional Details',
];

const sampleFormName = 'sample_creation';

const basicDetailsRows = [
  ['Sampling Plan & Procedure', 'eg. Carpet Static Loading Machine'],
  ['Sample Creation Date & Time', '11:23 AM 19 March 2026', 'calendar'],
  ['Representative', 'Consumer Sample', 'chevron-down'],
  ['Statement of Conformity', 'Yes', 'chevron-down'],
  ['Receipt Mode', 'Select a', 'chevron-down'],
  ['Nature of Sample', 'Select a', 'chevron-down'],
  ['Brand Name', 'Select a', 'chevron-down'],
  ['Packaging Condition', 'Select a', 'chevron-down'],
];

const additionalDetailsRows = [
  ['Mode of Sample Receipt', 'Consumer Sample', 'chevron-down'],
  ['Tentative Reporting Date', 'Select date', 'calendar'],
  ['Amount (Inc. of all taxes)', 'Total amounts'],
  ['Received By', 'Select a user', 'chevron-down'],
];

const parameterRows = [
  {
    id: 'parameter-row-1',
    parameter: 'pH',
    method: 'IS 3025 (Part 11)',
    charges: '250',
    time: '5 days',
  },
  {
    id: 'parameter-row-2',
    parameter: 'Chloride Content',
    method: 'ASTM D512',
    charges: '300',
    time: '3 days',
  },
  {
    id: 'parameter-row-3',
    parameter: 'Lead (Pb)',
    method: 'EPA 6020B',
    charges: '450',
    time: '7 days',
  },
];

const chemicalParameterOptions = [
  'pH',
  'Chloride Content',
  'Lead (Pb)',
  'Total Dissolved Solids',
  'Chemical Oxygen Demand',
];

const chemicalTestMethodOptions = [
  'IS 3025 (Part 11)',
  'ASTM D512',
  'EPA 6020B',
  'IS 3025 (Part 16)',
  'IS 3025 (Part 58)',
];

const sampleProductOptions = [
  'Cotton Fabric',
  'Industrial Solvent',
  'Drinking Water',
  'Pharmaceutical Raw Material',
];

const sampleCategoryOptions = [
  'Textiles',
  'Chemicals',
  'Water',
  'Pharmaceuticals',
];

const sampleDetailRows = [
  {
    id: 'sample-detail-row-1',
    product: 'Cotton Fabric',
    category: 'Textiles',
    quantity: '1',
    sampleSize: '200 g',
    quality: 'Standard',
    imageUpload: 'sample-image.jpg',
  },
];

const stepFields = [
  [
    { key: 'sampleType', label: 'Sample Type', type: 'dropdown', mandatory: true, placeholder: 'Select sample type' },
    { key: 'receivingDate', label: 'Receiving Date', type: 'date', mandatory: true, placeholder: 'Select date' },
    {
      key: 'customer',
      label: 'Customer',
      type: 'dropdown',
      mandatory: true,
      placeholder: 'Select a Customer or create new',
    },
    { key: 'customerAddress', label: 'Customer Address', type: 'text', mandatory: true, placeholder: '' },
  ],
  basicDetailsRows.map(([label, placeholder, icon], index) => ({
    key: `basic-${index}`,
    label,
    type: icon === 'calendar' ? 'date' : icon === 'chevron-down' ? 'dropdown' : 'text',
    mandatory: false,
    placeholder,
  })),
  [],
  [],
  additionalDetailsRows.map(([label, placeholder, icon], index) => ({
    key: `additional-${index}`,
    label,
    type: icon === 'calendar' ? 'date' : icon === 'chevron-down' ? 'dropdown' : 'text',
    mandatory: false,
    placeholder,
  })),
];

const fieldMetaByKey = stepFields.reduce((fieldsByKey, fields, stepIndex) => {
  fields.forEach((field) => {
    fieldsByKey[field.key] = {
      ...field,
      stepIndex,
      stepName: wizardSteps[stepIndex],
    };
  });

  return fieldsByKey;
}, {});

const initialFormValues = {
  sampleType: 'Consumer Sample',
  receivingDate: '19 March 2026',
  customer: '',
  customerAddress: '',
  'basic-0': '',
  'basic-1': '',
  'basic-2': '',
  'basic-3': '',
  'basic-4': '',
  'basic-5': '',
  'basic-6': '',
  'basic-7': '',
  'additional-0': '',
  'additional-1': '',
  'additional-2': '',
  'additional-3': '',
};

function getSampleDisplayName(sample) {
  return sample?.id || 'New Sample';
}

function getSampleType(sample) {
  if (sample?.extraMetaFields?.[0]?.value) {
    return sample.extraMetaFields[0].value;
  }

  switch (sample?.category) {
    case 'iqc-samples':
      return 'IQC Sample';
    case 'ilc-samples':
      return 'ILC Sample';
    case 'pt-samples':
      return 'PT Sample';
    case 'amendment-samples':
      return 'Amendment Sample';
    case 'complaint':
      return 'Complaint Sample';
    default:
      return 'Consumer Sample';
  }
}

function buildEditFormValues(sample) {
  if (!sample) {
    return initialFormValues;
  }

  const receivingDate = String(sample.createdOn ?? '').split(',')[0]?.trim() || initialFormValues.receivingDate;
  const reportingDate = String(sample.reportingDate ?? '').split(',')[0]?.trim() || '28/02/2026';

  return {
    ...initialFormValues,
    sampleType: getSampleType(sample),
    receivingDate,
    customer: sample.representative ?? 'Anita Desai',
    customerAddress: `${sample.representative ?? 'Customer'} Address`,
    'basic-0': 'Standard Sampling Plan',
    'basic-1': sample.createdOn ?? '11:23 AM 19 March 2026',
    'basic-2': sample.representative ?? 'Consumer Sample',
    'basic-3': 'Yes',
    'basic-4': sample.requestMode ?? 'Online',
    'basic-5': 'Routine',
    'basic-6': sample.reference ?? 'Brand A',
    'basic-7': 'Good',
    'additional-0': sample.requestMode ?? 'Online',
    'additional-1': reportingDate,
    'additional-2': '2500',
    'additional-3': 'Front Desk',
  };
}

function buildParameterFormRows() {
  return parameterRows.map((row) => ({ ...row }));
}

function buildSampleDetailFormRows() {
  return sampleDetailRows.map((row) => ({
    ...row,
    description: 'Cotton fabric sample for chemical testing',
    identificationMark: 'CF-001',
    condition: 'Good',
    parameterRows: buildParameterFormRows(),
  }));
}

function createTableRowId(prefix) {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function createEmptySampleDetailRow() {
  return {
    id: createTableRowId('sample-detail-row'),
    product: '',
    category: '',
    quantity: '',
    sampleSize: '',
    quality: '',
    description: '',
    identificationMark: '',
    condition: '',
    imageUpload: '',
    parameterRows: [createEmptyParameterRow()],
  };
}

function createEmptyParameterRow() {
  return {
    id: createTableRowId('parameter-row'),
    parameter: '',
    method: '',
    charges: '',
    time: '',
  };
}

function isFilledValue(type, value) {
  if (type === 'split') {
    return Boolean(value?.value?.toString().trim()) && Boolean(value?.unit?.toString().trim());
  }

  return Boolean(value?.toString().trim());
}

function getNow() {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

function getElapsedTime(startedAt) {
  return Math.max(0, Math.round(getNow() - startedAt));
}

function createFormSessionId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `sample-form-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getStepName(stepIndex) {
  return wizardSteps[stepIndex] ?? `Step ${stepIndex + 1}`;
}

function getStepFieldSummary(stepIndex, formValues) {
  const fields = stepFields[stepIndex] ?? [];
  const requiredFields = fields.filter((field) => field.mandatory);
  const missingRequiredFields = requiredFields.filter((field) => !isFilledValue(field.type, formValues[field.key]));

  return {
    field_count: fields.length,
    required_field_count: requiredFields.length,
    missing_required_field_count: missingRequiredFields.length,
    missing_required_fields: missingRequiredFields.map((field) => field.key),
  };
}

function getParameterSummary(parameterFormRows) {
  return {
    parameter_count: parameterFormRows.length,
    selected_parameter_count: parameterFormRows.length,
  };
}

function getAllParameterRows(sampleDetailFormRows) {
  return sampleDetailFormRows.flatMap((row) => row.parameterRows ?? []);
}

function getSampleDetailSummary(sampleDetailFormRows) {
  return {
    sample_detail_row_count: sampleDetailFormRows.length,
  };
}

function getFieldInteractionSummary(fieldChangeCounts) {
  const entries = Object.entries(fieldChangeCounts);
  const repeatedlyEditedFields = entries
    .filter(([, count]) => count >= 3)
    .map(([fieldKey]) => fieldKey);

  return {
    changed_field_count: entries.length,
    field_change_counts: fieldChangeCounts,
    repeatedly_edited_fields: repeatedlyEditedFields,
  };
}

function getFieldState(type, value, hasError) {
  if (hasError) {
    return 'error';
  }

  return isFilledValue(type, value) ? 'filled' : 'default';
}

function getFieldInputProps(field, formValues, onFieldChange, hasError, onFieldFocus, onFieldBlur) {
  const value = formValues[field.key];
  const baseState = getFieldState(field.type, value, hasError);
  const analyticsProps = {
    onFocus: () => onFieldFocus?.(field.key),
    onBlur: () => onFieldBlur?.(field.key),
  };

  if (field.type === 'split') {
    return {
      state: baseState,
      value: value?.value ?? '',
      unit: value?.unit ?? '',
      placeholder: field.placeholder,
      unitPlaceholder: field.unitPlaceholder,
      onChange: (event) =>
        onFieldChange(field.key, {
          value: event.target.value,
          unit: event.target.unit,
        }),
      ...analyticsProps,
    };
  }

  return {
    state: baseState,
    value: value ?? '',
    placeholder: field.placeholder,
    onChange: (event) => onFieldChange(field.key, event.target.value),
    ...analyticsProps,
  };
}

function TopBar({ parentLabel, currentLabel, onBack }) {
  return (
    <header className="d-flex align-items-center justify-content-between gap-3 bg-white border-bottom flex-wrap">
      <div className="d-inline-flex align-items-center gap-2 text-secondary fw-medium flex-wrap">
        <button
          className="btn btn-link text-secondary text-decoration-none p-0 border-0"
          aria-label={`Go to ${parentLabel}`}
          onClick={onBack}
        >
          <AppIcon name="home" />
        </button>
        <AppIcon name="chevron-right" />
        <button className="btn btn-link text-secondary text-decoration-none p-0 border-0" onClick={onBack}>
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
        <button className="smplfy-btn btn btn-outline-secondary">
          <AppIcon name="phone" />
          <span>+91-6358273804</span>
        </button>
        <button className="smplfy-btn btn btn-outline-secondary" aria-label="Notifications">
          <AppIcon name="bell" />
        </button>
        <button className="smplfy-btn btn btn-outline-secondary">DC</button>
      </div>
    </header>
  );
}

function PageHeader({ title, mode, formId }) {
  return (
    <section className="d-flex align-items-center justify-content-between gap-3 px-4 py-3 bg-white border-bottom flex-wrap">
      <div>
        <h1 className="h6 fw-semibold text-body mb-0">{title}</h1>
      </div>
      <PrimaryButton type="submit" form={formId} leftIcon="save">
        {mode === 'edit' ? 'Save Changes' : 'Save Sample'}
      </PrimaryButton>
    </section>
  );
}

function StepRail({ currentStep, title, mode, onStepChange }) {
  const items = wizardSteps.map((label, index) => ({
    label,
    state: mode === 'edit'
      ? 'completed'
      : index < currentStep
        ? 'completed'
        : index === currentStep
          ? 'active'
          : 'default',
  }));

  return (
    <aside>
      <div>
        <h1 className={mode === 'edit' ? 'h6 fw-bold mb-0' : 'h4 fw-medium mb-0'}>{title}</h1>
      </div>
      <Stepper items={items} onItemClick={onStepChange} />
    </aside>
  );
}

function FormSection({ id, title, children }) {
  return (
    <section aria-labelledby={`${id}-title`}>
      <h2 className="visually-hidden" id={`${id}-title`}>{title}</h2>
      {children}
    </section>
  );
}

function CustomerDetailsSection({ formValues, fieldErrors, onFieldChange, onFieldFocus, onFieldBlur }) {
  return (
    <FormSection id="new-sample-customer-details" title="Customer Details">
      <div className="container-fluid p-4">
        <div className="row g-4">
          <div className="col-lg-6">
            <FormElement
              type="dropdown"
              mandatory
              label="Sample Type"
              message={fieldErrors.sampleType}
              messageTone="error"
              inputProps={getFieldInputProps(
                stepFields[0][0],
                formValues,
                onFieldChange,
                Boolean(fieldErrors.sampleType),
                onFieldFocus,
                onFieldBlur,
              )}
            />
          </div>

          <div className="col-lg-6">
            <FormElement
              type="date"
              mandatory
              label="Receiving Date"
              message={fieldErrors.receivingDate}
              messageTone="error"
              inputProps={getFieldInputProps(
                stepFields[0][1],
                formValues,
                onFieldChange,
                Boolean(fieldErrors.receivingDate),
                onFieldFocus,
                onFieldBlur,
              )}
            />
          </div>

          <div className="col-12">
            <div className="d-flex align-items-end gap-3">
              <div className="flex-fill">
                <FormElement
                  type="dropdown"
                  mandatory
                  label="Customer"
                  message={fieldErrors.customer}
                  messageTone="error"
                  inputProps={getFieldInputProps(
                    stepFields[0][2],
                    formValues,
                    onFieldChange,
                    Boolean(fieldErrors.customer),
                    onFieldFocus,
                    onFieldBlur,
                  )}
                />
              </div>
              <PrimaryButton aria-label="Add customer" leftIcon="plus" />
            </div>
          </div>

          <div className="col-12">
            <FormElement
              type="text"
              mandatory
              label="Customer Address"
              message={fieldErrors.customerAddress}
              messageTone="error"
              inputProps={getFieldInputProps(
                stepFields[0][3],
                formValues,
                onFieldChange,
                Boolean(fieldErrors.customerAddress),
                onFieldFocus,
                onFieldBlur,
              )}
            />
          </div>
        </div>
      </div>
    </FormSection>
  );
}

function BasicDetailsSection({ formValues, fieldErrors, onFieldChange, onFieldFocus, onFieldBlur }) {
  return (
    <FormSection id="new-sample-basic-details" title="Basic Details">
      <div className="container-fluid p-4">
        <div className="row g-4">
          {stepFields[1].map((field) => (
            <div className="col-lg-6" key={field.key}>
              <FormElement
                type={field.type}
                mandatory={field.mandatory}
                label={field.label}
                message={fieldErrors[field.key]}
                messageTone="error"
                inputProps={getFieldInputProps(
                  field,
                  formValues,
                  onFieldChange,
                  Boolean(fieldErrors[field.key]),
                  onFieldFocus,
                  onFieldBlur,
                )}
              />
            </div>
          ))}
        </div>
      </div>
    </FormSection>
  );
}

function SampleDetailsSection({ rows, onRowChange, onAddRow, onDeleteRow }) {
  return (
    <FormSection id="new-sample-sample-details" title="Sample Details">
      <div className="container-fluid smplfy-new-sample-table-content">
        <DataTable className="smplfy-new-sample-data-table smplfy-new-sample-summary-table">
          <thead>
            <tr>
              <th scope="col">Sr no.</th>
              <th scope="col">Product</th>
              <th scope="col">Category</th>
              <th scope="col">Quantity</th>
              <th scope="col">Sample Size</th>
              <th scope="col">Quality</th>
              <th scope="col">Image Upload</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id}>
                <td>{index + 1}</td>
                <td>
                  <InputFieldDropdown
                    aria-label={`Product ${index + 1}`}
                    value={row.product}
                    placeholder="Select product"
                    options={sampleProductOptions}
                    onChange={(event) => onRowChange(row.id, 'product', event.target.value)}
                  />
                </td>
                <td>
                  <InputFieldDropdown
                    aria-label={`Category ${index + 1}`}
                    value={row.category}
                    placeholder="Select category"
                    options={sampleCategoryOptions}
                    onChange={(event) => onRowChange(row.id, 'category', event.target.value)}
                  />
                </td>
                <td>
                  <input
                    className="smplfy-form-control form-control"
                    aria-label={`Quantity ${index + 1}`}
                    value={row.quantity}
                    onChange={(event) => onRowChange(row.id, 'quantity', event.target.value)}
                  />
                </td>
                <td>
                  <input
                    className="smplfy-form-control form-control"
                    aria-label={`Sample size ${index + 1}`}
                    value={row.sampleSize}
                    onChange={(event) => onRowChange(row.id, 'sampleSize', event.target.value)}
                  />
                </td>
                <td>
                  <input
                    className="smplfy-form-control form-control"
                    aria-label={`Quality ${index + 1}`}
                    value={row.quality}
                    onChange={(event) => onRowChange(row.id, 'quality', event.target.value)}
                  />
                </td>
                <td>
                  <input
                    className="smplfy-form-control form-control"
                    aria-label={`Image upload ${index + 1}`}
                    value={row.imageUpload}
                    onChange={(event) => onRowChange(row.id, 'imageUpload', event.target.value)}
                  />
                </td>
                <td>
                  <SecondaryButton
                    size="medium"
                    tone="danger"
                    leftIcon="trash"
                    className="px-2"
                    aria-label={`Delete sample row ${index + 1}`}
                    onClick={() => onDeleteRow(row.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
        <div className="smplfy-new-sample-table-action">
          <SecondaryButton size="medium" leftIcon="plus" onClick={onAddRow}>Add row</SecondaryButton>
        </div>
      </div>
    </FormSection>
  );
}

function ProductDetailsSection({
  products,
  activeProductId,
  onProductSelect,
  onProductFieldChange,
  parameterRows: rows,
  onParameterRowChange: onRowChange,
  onAddParameterRow: onAddRow,
  onDeleteParameterRow: onDeleteRow,
}) {
  const activeProduct = products.find((product) => product.id === activeProductId) ?? products[0] ?? null;

  return (
    <FormSection id="new-sample-product-details" title="Product Details">
      <div className="container-fluid smplfy-new-sample-table-content">
        <div
          className="d-flex align-items-center justify-content-start smplfy-new-sample-product-selector"
          role="tablist"
          aria-label="Select product"
        >
          {products.map((product, index) => {
            const isActive = product.id === activeProduct?.id;
            return (
              <NavSelector
                key={product.id}
                type="button"
                size="medium"
                role="tab"
                aria-selected={isActive}
                active={isActive}
                className="text-nowrap"
                onClick={() => onProductSelect(product.id)}
              >
                {product.product || `Product ${index + 1}`}
              </NavSelector>
            );
          })}
        </div>

        <div className="smplfy-new-sample-product-content">
          {activeProduct ? (
            <>
            <div className="row g-3 smplfy-new-sample-product-fields">
              <div className="col-12 col-lg-6">
                <FormElement
                  type="dropdown"
                  label="Category"
                  inputProps={{
                    value: activeProduct.category,
                    placeholder: 'Select category',
                    options: sampleCategoryOptions,
                    onChange: (event) => onProductFieldChange(activeProduct.id, 'category', event.target.value),
                  }}
                />
              </div>
              <div className="col-12 col-lg-6">
                <FormElement
                  type="dropdown"
                  label="Product"
                  inputProps={{
                    value: activeProduct.product,
                    placeholder: 'Select product',
                    options: sampleProductOptions,
                    onChange: (event) => onProductFieldChange(activeProduct.id, 'product', event.target.value),
                  }}
                />
              </div>
              <div className="col-12">
                <FormElement
                  type="text"
                  label="Description"
                  inputProps={{
                    value: activeProduct.description,
                    placeholder: 'Sample description',
                    onChange: (event) => onProductFieldChange(activeProduct.id, 'description', event.target.value),
                  }}
                />
              </div>
              <div className="col-12 col-md-6 col-xl-3">
                <FormElement
                  type="text"
                  label="Quantity"
                  inputProps={{
                    value: activeProduct.quantity,
                    placeholder: '0',
                    onChange: (event) => onProductFieldChange(activeProduct.id, 'quantity', event.target.value),
                  }}
                />
              </div>
              <div className="col-12 col-md-6 col-xl-3">
                <FormElement
                  type="text"
                  label="Sample Size"
                  inputProps={{
                    value: activeProduct.sampleSize,
                    placeholder: 'eg. 200 g',
                    onChange: (event) => onProductFieldChange(activeProduct.id, 'sampleSize', event.target.value),
                  }}
                />
              </div>
              <div className="col-12 col-md-6 col-xl-3">
                <FormElement
                  type="text"
                  label="Quality"
                  inputProps={{
                    value: activeProduct.quality,
                    placeholder: 'Quality',
                    onChange: (event) => onProductFieldChange(activeProduct.id, 'quality', event.target.value),
                  }}
                />
              </div>
              <div className="col-12 col-md-6 col-xl-3">
                <FormElement
                  type="text"
                  label="Condition"
                  inputProps={{
                    value: activeProduct.condition,
                    placeholder: 'eg. Good',
                    onChange: (event) => onProductFieldChange(activeProduct.id, 'condition', event.target.value),
                  }}
                />
              </div>
              <div className="col-12 col-lg-6">
                <FormElement
                  type="text"
                  label="Identification Mark"
                  inputProps={{
                    value: activeProduct.identificationMark,
                    placeholder: 'If any',
                    onChange: (event) => onProductFieldChange(activeProduct.id, 'identificationMark', event.target.value),
                  }}
                />
              </div>
              <div className="col-12 col-lg-6">
                <FormElement
                  type="text"
                  label="Image Upload"
                  inputProps={{
                    value: activeProduct.imageUpload,
                    placeholder: 'Image reference',
                    onChange: (event) => onProductFieldChange(activeProduct.id, 'imageUpload', event.target.value),
                  }}
                />
              </div>
            </div>

            <h3 className="h5 fw-semibold text-body smplfy-new-sample-parameter-title">Parameter Data</h3>
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
                      <InputFieldDropdown
                        aria-label={`Parameter ${index + 1}`}
                        value={row.parameter}
                        placeholder="Select parameter"
                        options={chemicalParameterOptions}
                        onChange={(event) => onRowChange(row.id, 'parameter', event.target.value)}
                      />
                    </td>
                    <td>
                      <InputFieldDropdown
                        aria-label={`Test method ${index + 1}`}
                        value={row.method}
                        placeholder="Select test method"
                        options={chemicalTestMethodOptions}
                        onChange={(event) => onRowChange(row.id, 'method', event.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        className="smplfy-form-control form-control"
                        aria-label={`Charges ${index + 1}`}
                        value={row.charges}
                        onChange={(event) => onRowChange(row.id, 'charges', event.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        className="smplfy-form-control form-control"
                        aria-label={`Estimated time ${index + 1}`}
                        value={row.time}
                        onChange={(event) => onRowChange(row.id, 'time', event.target.value)}
                      />
                    </td>
                    <td>
                      <SecondaryButton
                        size="medium"
                        tone="danger"
                        leftIcon="trash"
                        className="px-2"
                        aria-label={`Delete parameter row ${index + 1}`}
                        onClick={() => onDeleteRow(row.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
            <div className="smplfy-new-sample-table-action">
              <SecondaryButton size="medium" leftIcon="plus" onClick={onAddRow}>Add row</SecondaryButton>
            </div>
            </>
          ) : (
            <p className="text-secondary mb-0 p-3">Add a product in Sample Details to configure its product data.</p>
          )}
        </div>
      </div>
    </FormSection>
  );
}

function AdditionalDetailsSection({ formValues, fieldErrors, onFieldChange, onFieldFocus, onFieldBlur }) {
  return (
    <FormSection id="new-sample-additional-details" title="Additional Details">
      <div className="container-fluid p-4">
        <div className="row g-4">
          {stepFields[4].map((field) => (
            <div className="col-lg-6" key={field.key}>
              <FormElement
                type={field.type}
                mandatory={field.mandatory}
                label={field.label}
                message={fieldErrors[field.key]}
                messageTone="error"
                inputProps={getFieldInputProps(
                  field,
                  formValues,
                  onFieldChange,
                  Boolean(fieldErrors[field.key]),
                  onFieldFocus,
                  onFieldBlur,
                )}
              />
            </div>
          ))}
        </div>
      </div>
    </FormSection>
  );
}

function CustomerForm({
  formId,
  currentStep,
  formValues,
  fieldErrors,
  onFieldChange,
  onFieldFocus,
  onFieldBlur,
  onPrev,
  onNext,
  onComplete,
  onCancel,
  mode,
  sampleTitle,
  onStepChange,
  sampleDetailFormRows,
  onSampleDetailRowChange,
  onAddSampleDetailRow,
  onDeleteSampleDetailRow,
  activeProductId,
  onProductSelect,
  parameterFormRows,
  onParameterRowChange,
  onAddParameterRow,
  onDeleteParameterRow,
}) {
  const sections = [
    <CustomerDetailsSection
      key="customer"
      formValues={formValues}
      fieldErrors={fieldErrors}
      onFieldChange={onFieldChange}
      onFieldFocus={onFieldFocus}
      onFieldBlur={onFieldBlur}
    />,
    <BasicDetailsSection
      key="basic"
      formValues={formValues}
      fieldErrors={fieldErrors}
      onFieldChange={onFieldChange}
      onFieldFocus={onFieldFocus}
      onFieldBlur={onFieldBlur}
    />,
    <SampleDetailsSection
      key="sample"
      rows={sampleDetailFormRows}
      onRowChange={onSampleDetailRowChange}
      onAddRow={onAddSampleDetailRow}
      onDeleteRow={onDeleteSampleDetailRow}
    />,
    <ProductDetailsSection
      key="product"
      products={sampleDetailFormRows}
      activeProductId={activeProductId}
      onProductSelect={onProductSelect}
      onProductFieldChange={onSampleDetailRowChange}
      parameterRows={parameterFormRows}
      onParameterRowChange={onParameterRowChange}
      onAddParameterRow={onAddParameterRow}
      onDeleteParameterRow={onDeleteParameterRow}
    />,
    <AdditionalDetailsSection
      key="additional"
      formValues={formValues}
      fieldErrors={fieldErrors}
      onFieldChange={onFieldChange}
      onFieldFocus={onFieldFocus}
      onFieldBlur={onFieldBlur}
    />,
  ];
  const prevLabel = currentStep > 0 ? wizardSteps[currentStep - 1] : 'Cancel';
  const isLast = currentStep === wizardSteps.length - 1;
  const handlePrevClick = currentStep > 0 ? onPrev : onCancel;

  return (
    <form
      id={formId}
      className="smplfy-card card"
      onSubmit={(event) => {
        event.preventDefault();
        onComplete();
      }}
    >
      <div className="d-grid h-100">
        <StepRail
          currentStep={currentStep}
          title={sampleTitle}
          mode={mode}
          onStepChange={mode === 'edit' ? onStepChange : undefined}
        />

        <div className="d-flex flex-column overflow-hidden">
          <div className="flex-fill overflow-auto">{sections[currentStep]}</div>
          <div className="d-flex align-items-center justify-content-between gap-3 p-4 border-top bg-white flex-wrap">
            <SecondaryButton
              leftIcon={currentStep > 0 ? 'chevron-left' : 'close'}
              onClick={handlePrevClick}
            >
              {prevLabel}
            </SecondaryButton>

            {mode === 'edit' ? (
              <PrimaryButton leftIcon="save" onClick={onComplete}>
                Save Changes
              </PrimaryButton>
            ) : isLast ? (
              <PrimaryButton leftIcon="save" onClick={onComplete}>
                Save Sample
              </PrimaryButton>
            ) : (
              <PrimaryButton rightIcon="chevron-right" onClick={onNext}>
                Next
              </PrimaryButton>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}

export default function NewSampleCustomerDetailsPage({
  mode = 'create',
  sample = null,
  parentLabel = 'Samples Workspace',
  sampleCreationFlowSessionId = null,
  onSampleFormVariantChange,
  onBackToWorkspace,
  onComplete,
}) {
  const { isReady: isExperimentReady, variant: formVariant } = useFeatureFlagVariant(
    SAMPLE_FORM_EXPERIMENT_FLAG,
    'form-a',
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [formValues, setFormValues] = useState(mode === 'edit' ? buildEditFormValues(sample) : initialFormValues);
  const [sampleDetailFormRows, setSampleDetailFormRows] = useState(buildSampleDetailFormRows);
  const [activeProductId, setActiveProductId] = useState(sampleDetailRows[0]?.id ?? null);
  const [fieldErrors, setFieldErrors] = useState({});
  const activeProduct = sampleDetailFormRows.find((row) => row.id === activeProductId)
    ?? sampleDetailFormRows[0]
    ?? null;
  const parameterFormRows = activeProduct?.parameterRows ?? [];
  const allParameterFormRows = useMemo(
    () => getAllParameterRows(sampleDetailFormRows),
    [sampleDetailFormRows],
  );
  const sampleTitle = mode === 'edit' ? getSampleDisplayName(sample) : 'New Sample';
  const currentCrumbLabel = mode === 'edit' ? `Edit ${sampleTitle}` : 'New Sample';
  const formId = 'new-sample-v2-form';
  const formSessionRef = useRef(createFormSessionId());
  const formInputRef = useRef({ mode, sample });
  const startedAtRef = useRef(getNow());
  const stepStartedAtRef = useRef(getNow());
  const lastInteractionAtRef = useRef(getNow());
  const trackedStartRef = useRef(false);
  const lastViewedStepRef = useRef(null);
  const outcomeRef = useRef(null);
  const abandonmentTimerRef = useRef(null);
  const fieldChangeCountsRef = useRef({});
  const fieldFocusStateRef = useRef({});
  const sampleDetailFormRowsRef = useRef(sampleDetailFormRows);
  const analyticsContext = useMemo(() => ({
    form_name: sampleFormName,
    form_variant: formVariant,
    experiment_flag: SAMPLE_FORM_EXPERIMENT_FLAG,
    experiment_ready: isExperimentReady,
    mode,
    parent_label: parentLabel,
    sample_present: Boolean(sample),
    sample_creation_flow_session_id: sampleCreationFlowSessionId,
  }), [formVariant, isExperimentReady, mode, parentLabel, sample, sampleCreationFlowSessionId]);
  const analyticsContextRef = useRef(analyticsContext);
  analyticsContextRef.current = analyticsContext;
  sampleDetailFormRowsRef.current = sampleDetailFormRows;

  const captureFormEvent = (eventName, properties = {}) => {
    trackEvent(eventName, {
      ...analyticsContextRef.current,
      form_session_id: formSessionRef.current,
      elapsed_ms: getElapsedTime(startedAtRef.current),
      ...properties,
    });
  };

  const captureHesitationIfNeeded = (actionName) => {
    const stepDurationMs = getElapsedTime(stepStartedAtRef.current);
    const idleBeforeActionMs = getElapsedTime(lastInteractionAtRef.current);

    if (stepDurationMs < 30000 && idleBeforeActionMs < 15000) {
      return;
    }

    captureFormEvent('sample_form_hesitation_detected', {
      action_name: actionName,
      step_index: currentStep,
      step_name: getStepName(currentStep),
      step_duration_ms: stepDurationMs,
      idle_before_action_ms: idleBeforeActionMs,
    });
  };

  useEffect(() => {
    if (isExperimentReady && mode === 'create') {
      onSampleFormVariantChange?.(formVariant);
    }
  }, [formVariant, isExperimentReady, mode, onSampleFormVariantChange]);

  useEffect(() => {
    if (formInputRef.current.mode === mode && formInputRef.current.sample === sample) {
      return;
    }

    formInputRef.current = { mode, sample };
    formSessionRef.current = createFormSessionId();
    startedAtRef.current = getNow();
    stepStartedAtRef.current = getNow();
    lastInteractionAtRef.current = getNow();
    trackedStartRef.current = false;
    lastViewedStepRef.current = null;
    outcomeRef.current = null;
    fieldChangeCountsRef.current = {};
    fieldFocusStateRef.current = {};
    setCurrentStep(0);
    setFormValues(mode === 'edit' ? buildEditFormValues(sample) : initialFormValues);
    const nextSampleDetailRows = buildSampleDetailFormRows();
    setSampleDetailFormRows(nextSampleDetailRows);
    setActiveProductId(nextSampleDetailRows[0]?.id ?? null);
    setFieldErrors({});
  }, [mode, sample]);

  useEffect(() => {
    if (!isExperimentReady || trackedStartRef.current) {
      return;
    }

    const now = getNow();
    trackedStartRef.current = true;
    startedAtRef.current = now;
    stepStartedAtRef.current = now;
    lastInteractionAtRef.current = now;
    lastViewedStepRef.current = currentStep;

    captureFormEvent('sample_form_experiment_assigned', {
      flag_key: SAMPLE_FORM_EXPERIMENT_FLAG,
      variant: formVariant,
    });
    captureFormEvent('sample_form_started', {
      step_count: wizardSteps.length,
      ...getStepFieldSummary(currentStep, formValues),
      ...getSampleDetailSummary(sampleDetailFormRows),
      ...getParameterSummary(allParameterFormRows),
    });
    captureFormEvent('sample_form_step_viewed', {
      step_index: currentStep,
      step_name: getStepName(currentStep),
      ...getStepFieldSummary(currentStep, formValues),
    });
  }, [allParameterFormRows, currentStep, formValues, formVariant, isExperimentReady, sampleDetailFormRows]);

  useEffect(() => {
    if (!trackedStartRef.current || lastViewedStepRef.current === currentStep) {
      return;
    }

    lastViewedStepRef.current = currentStep;
    stepStartedAtRef.current = getNow();

    captureFormEvent('sample_form_step_viewed', {
      step_index: currentStep,
      step_name: getStepName(currentStep),
      ...getStepFieldSummary(currentStep, formValues),
    });
  }, [currentStep, formValues]);

  useEffect(() => {
    window.clearTimeout(abandonmentTimerRef.current);

    return () => {
      // A zero-delay timer avoids the simulated unmount/remount performed by React Strict Mode.
      abandonmentTimerRef.current = window.setTimeout(() => {
        if (!trackedStartRef.current || outcomeRef.current) {
          return;
        }

        trackEvent('sample_form_abandoned', {
          ...analyticsContextRef.current,
          form_session_id: formSessionRef.current,
          elapsed_ms: getElapsedTime(startedAtRef.current),
          step_index: lastViewedStepRef.current,
          step_name: getStepName(lastViewedStepRef.current ?? 0),
          ...getFieldInteractionSummary(fieldChangeCountsRef.current),
          ...getSampleDetailSummary(sampleDetailFormRowsRef.current),
          ...getParameterSummary(getAllParameterRows(sampleDetailFormRowsRef.current)),
        });
      }, 0);
    };
  }, []);

  const handleFieldChange = (key, value) => {
    const fieldMeta = fieldMetaByKey[key] ?? {};
    const previousChangeCount = fieldChangeCountsRef.current[key] ?? 0;
    const nextChangeCount = previousChangeCount + 1;
    fieldChangeCountsRef.current = {
      ...fieldChangeCountsRef.current,
      [key]: nextChangeCount,
    };
    lastInteractionAtRef.current = getNow();

    if (previousChangeCount === 0) {
      captureFormEvent('sample_form_field_changed', {
        field_key: key,
        field_type: fieldMeta.type,
        step_index: fieldMeta.stepIndex,
        step_name: fieldMeta.stepName,
        change_count: nextChangeCount,
      });
    } else if ([3, 5, 10].includes(nextChangeCount) || nextChangeCount % 20 === 0) {
      captureFormEvent('sample_form_field_reedited', {
        field_key: key,
        field_type: fieldMeta.type,
        step_index: fieldMeta.stepIndex,
        step_name: fieldMeta.stepName,
        change_count: nextChangeCount,
      });
    }

    setFormValues((current) => ({
      ...current,
      [key]: value,
    }));

    setFieldErrors((current) => {
      if (!current[key]) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[key];
      return nextErrors;
    });
  };

  const handleFieldFocus = (key) => {
    const fieldMeta = fieldMetaByKey[key] ?? {};
    const now = getNow();

    lastInteractionAtRef.current = now;
    fieldFocusStateRef.current[key] = {
      startedAt: now,
      changeCountAtFocus: fieldChangeCountsRef.current[key] ?? 0,
    };

    captureFormEvent('sample_form_field_focused', {
      field_key: key,
      field_type: fieldMeta.type,
      step_index: fieldMeta.stepIndex,
      step_name: fieldMeta.stepName,
    });
  };

  const handleFieldBlur = (key) => {
    const fieldMeta = fieldMetaByKey[key] ?? {};
    const focusState = fieldFocusStateRef.current[key];
    const currentChangeCount = fieldChangeCountsRef.current[key] ?? 0;

    lastInteractionAtRef.current = getNow();

    captureFormEvent('sample_form_field_blurred', {
      field_key: key,
      field_type: fieldMeta.type,
      step_index: fieldMeta.stepIndex,
      step_name: fieldMeta.stepName,
      focus_duration_ms: focusState ? getElapsedTime(focusState.startedAt) : undefined,
      changed_during_focus: focusState ? currentChangeCount > focusState.changeCountAtFocus : undefined,
      change_count: currentChangeCount,
    });

    delete fieldFocusStateRef.current[key];
  };

  const handleComplete = () => {
    // Validation is temporarily disabled.
    // if (!validateStep(currentStep)) {
    //   return;
    // }

    captureHesitationIfNeeded('complete');
    if (mode === 'create') {
      captureFormEvent('sample_creation_flow_submit_clicked', {
        step_index: currentStep,
        step_name: getStepName(currentStep),
        total_duration_ms: getElapsedTime(startedAtRef.current),
        step_duration_ms: getElapsedTime(stepStartedAtRef.current),
        ...getStepFieldSummary(currentStep, formValues),
        ...getFieldInteractionSummary(fieldChangeCountsRef.current),
        ...getSampleDetailSummary(sampleDetailFormRows),
        ...getParameterSummary(allParameterFormRows),
      });
    }

    outcomeRef.current = 'completed';
    captureFormEvent('sample_form_completed', {
      step_index: currentStep,
      step_name: getStepName(currentStep),
      total_duration_ms: getElapsedTime(startedAtRef.current),
      step_duration_ms: getElapsedTime(stepStartedAtRef.current),
      ...getStepFieldSummary(currentStep, formValues),
      ...getFieldInteractionSummary(fieldChangeCountsRef.current),
      ...getSampleDetailSummary(sampleDetailFormRows),
      ...getParameterSummary(allParameterFormRows),
    });
    lastInteractionAtRef.current = getNow();

    onComplete?.();
  };

  const handleNext = () => {
    // Validation is temporarily disabled.
    // if (!validateStep(currentStep)) {
    //   return;
    // }

    captureHesitationIfNeeded('next');
    lastInteractionAtRef.current = getNow();
    const nextStep = Math.min(wizardSteps.length - 1, currentStep + 1);

    if (nextStep === currentStep) {
      return;
    }

    captureFormEvent('sample_form_step_completed', {
      step_index: currentStep,
      step_name: getStepName(currentStep),
      step_duration_ms: getElapsedTime(stepStartedAtRef.current),
      next_step_index: nextStep,
      next_step_name: getStepName(nextStep),
      ...getStepFieldSummary(currentStep, formValues),
      ...getFieldInteractionSummary(fieldChangeCountsRef.current),
    });
    setCurrentStep(nextStep);
  };

  const handlePrevious = () => {
    const previousStep = Math.max(0, currentStep - 1);

    if (previousStep === currentStep) {
      return;
    }

    captureHesitationIfNeeded('previous');
    lastInteractionAtRef.current = getNow();
    captureFormEvent('sample_form_backtracked', {
      step_index: currentStep,
      step_name: getStepName(currentStep),
      step_duration_ms: getElapsedTime(stepStartedAtRef.current),
      from_step_index: currentStep,
      from_step_name: getStepName(currentStep),
      to_step_index: previousStep,
      to_step_name: getStepName(previousStep),
    });
    setCurrentStep(previousStep);
  };

  const handleStepChange = (stepIndex) => {
    if (stepIndex === currentStep) {
      return;
    }

    lastInteractionAtRef.current = getNow();
    captureFormEvent(
      stepIndex < currentStep ? 'sample_form_backtracked' : 'sample_form_step_jumped',
      {
        step_index: currentStep,
        step_name: getStepName(currentStep),
        step_duration_ms: getElapsedTime(stepStartedAtRef.current),
        from_step_index: currentStep,
        from_step_name: getStepName(currentStep),
        to_step_index: stepIndex,
        to_step_name: getStepName(stepIndex),
        skipped_step_count: Math.max(0, stepIndex - currentStep - 1),
      },
    );
    setCurrentStep(stepIndex);
  };

  const handleCancel = () => {
    outcomeRef.current = 'cancelled';
    captureFormEvent('sample_form_cancelled', {
      step_index: currentStep,
      step_name: getStepName(currentStep),
      total_duration_ms: getElapsedTime(startedAtRef.current),
      step_duration_ms: getElapsedTime(stepStartedAtRef.current),
      ...getFieldInteractionSummary(fieldChangeCountsRef.current),
      ...getSampleDetailSummary(sampleDetailFormRows),
      ...getParameterSummary(allParameterFormRows),
    });
    lastInteractionAtRef.current = getNow();
    onBackToWorkspace?.();
  };

  const handleSampleDetailRowChange = (rowId, field, value) => {
    const rowIndex = sampleDetailFormRows.findIndex((row) => row.id === rowId);
    lastInteractionAtRef.current = getNow();
    captureFormEvent('sample_form_sample_detail_changed', {
      row_index: rowIndex,
      field_key: field,
      step_index: currentStep,
      step_name: getStepName(currentStep),
      ...getSampleDetailSummary(sampleDetailFormRows),
    });

    setSampleDetailFormRows((current) => current.map((row) => (
      row.id === rowId ? { ...row, [field]: value } : row
    )));
  };

  const handleAddSampleDetailRow = () => {
    const nextRow = createEmptySampleDetailRow();
    lastInteractionAtRef.current = getNow();
    captureFormEvent('sample_form_sample_detail_row_added', {
      step_index: currentStep,
      step_name: getStepName(currentStep),
      ...getSampleDetailSummary(sampleDetailFormRows),
    });
    setSampleDetailFormRows((current) => [...current, nextRow]);
    if (!activeProductId) {
      setActiveProductId(nextRow.id);
    }
  };

  const handleDeleteSampleDetailRow = (rowId) => {
    const rowIndex = sampleDetailFormRows.findIndex((row) => row.id === rowId);
    lastInteractionAtRef.current = getNow();
    captureFormEvent('sample_form_sample_detail_row_deleted', {
      row_index: rowIndex,
      step_index: currentStep,
      step_name: getStepName(currentStep),
      ...getSampleDetailSummary(sampleDetailFormRows),
    });
    const remainingRows = sampleDetailFormRows.filter((row) => row.id !== rowId);
    setSampleDetailFormRows(remainingRows);
    if (activeProductId === rowId) {
      setActiveProductId(remainingRows[0]?.id ?? null);
    }
  };

  const handleProductSelect = (productId) => {
    lastInteractionAtRef.current = getNow();
    setActiveProductId(productId);
    captureFormEvent('sample_form_product_selected', {
      product_id: productId,
      product_index: sampleDetailFormRows.findIndex((row) => row.id === productId),
      step_index: currentStep,
      step_name: getStepName(currentStep),
    });
  };

  const handleParameterRowChange = (rowId, field, value) => {
    const rowIndex = parameterFormRows.findIndex((row) => row.id === rowId);
    lastInteractionAtRef.current = getNow();
    captureFormEvent('sample_form_parameter_changed', {
      row_index: rowIndex,
      field_key: field,
      step_index: currentStep,
      step_name: getStepName(currentStep),
      ...getParameterSummary(parameterFormRows),
    });

    setSampleDetailFormRows((current) => current.map((product) => (
      product.id === activeProduct?.id
        ? {
            ...product,
            parameterRows: (product.parameterRows ?? []).map((row) => (
              row.id === rowId ? { ...row, [field]: value } : row
            )),
          }
        : product
    )));
  };

  const handleAddParameterRow = () => {
    lastInteractionAtRef.current = getNow();
    captureFormEvent('sample_form_parameter_row_added', {
      step_index: currentStep,
      step_name: getStepName(currentStep),
      ...getParameterSummary(parameterFormRows),
    });
    setSampleDetailFormRows((current) => current.map((product) => (
      product.id === activeProduct?.id
        ? {
            ...product,
            parameterRows: [...(product.parameterRows ?? []), createEmptyParameterRow()],
          }
        : product
    )));
  };

  const handleDeleteParameterRow = (rowId) => {
    const rowIndex = parameterFormRows.findIndex((row) => row.id === rowId);
    lastInteractionAtRef.current = getNow();
    captureFormEvent('sample_form_parameter_row_deleted', {
      row_index: rowIndex,
      step_index: currentStep,
      step_name: getStepName(currentStep),
      ...getParameterSummary(parameterFormRows),
    });
    setSampleDetailFormRows((current) => current.map((product) => (
      product.id === activeProduct?.id
        ? {
            ...product,
            parameterRows: (product.parameterRows ?? []).filter((row) => row.id !== rowId),
          }
        : product
    )));
  };

  return (
    <div className="smplfy-new-sample-page bg-body-tertiary d-flex flex-column">
      <TopBar parentLabel={parentLabel} currentLabel={currentCrumbLabel} onBack={handleCancel} />
      <main>
        <CustomerForm
          formId={formId}
          currentStep={currentStep}
          formValues={formValues}
          fieldErrors={fieldErrors}
          onFieldChange={handleFieldChange}
          onFieldFocus={handleFieldFocus}
          onFieldBlur={handleFieldBlur}
          onPrev={handlePrevious}
          onNext={handleNext}
          onComplete={handleComplete}
          onCancel={handleCancel}
          mode={mode}
          sampleTitle={sampleTitle}
          onStepChange={handleStepChange}
          sampleDetailFormRows={sampleDetailFormRows}
          onSampleDetailRowChange={handleSampleDetailRowChange}
          onAddSampleDetailRow={handleAddSampleDetailRow}
          onDeleteSampleDetailRow={handleDeleteSampleDetailRow}
          activeProductId={activeProduct?.id ?? null}
          onProductSelect={handleProductSelect}
          parameterFormRows={parameterFormRows}
          onParameterRowChange={handleParameterRowChange}
          onAddParameterRow={handleAddParameterRow}
          onDeleteParameterRow={handleDeleteParameterRow}
        />
      </main>
    </div>
  );
}
