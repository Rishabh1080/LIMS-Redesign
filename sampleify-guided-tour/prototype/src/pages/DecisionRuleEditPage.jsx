import { useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import Checkbox from '../components/Checkbox/Checkbox';
import MultiSelectDropdown from '../components/MultiSelectDropdown';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import { FormElement } from '../components/FormControls';
import {
  DISCIPLINES,
  GROUPS,
  INSTRUMENTS,
  MOAS,
  PARAMETERS,
  PRODUCTS,
  RESULT_REPRESENTATIONS,
  SAMPLE_CATEGORIES,
  TEMPLATES,
  UOMS,
} from '../data/decisionRulesData';
import './decision-rule-edit-page.scss';

const PARAMETER_NAMES = PARAMETERS.map((parameter) => parameter.name);

// The listing shows "-" for an empty limit; the form shows an empty field.
const limitToInput = (value) => (value === '-' || value == null ? '' : String(value));

// Make sure the rule's current value is always selectable, even if it isn't in
// the seed list.
const withCurrent = (options, current) => (
  current && !options.includes(current) ? [current, ...options] : options
);

function toForm(rule) {
  return {
    // Rule
    product: rule?.product ?? '',
    parameter: rule?.parameter ?? '',
    moa: rule?.moa ?? '',
    template: rule?.template ?? TEMPLATES[0],
    sampleCategories: rule?.sampleCategory && rule.sampleCategory !== '-' ? [rule.sampleCategory] : [],
    discipline: '',
    group: '',
    uniqueKey: '',
    isTestGroupParent: false,
    isActive: true,
    // Limits & results
    cutOff: limitToInput(rule?.cutOff),
    min: limitToInput(rule?.min),
    max: limitToInput(rule?.max),
    uom: '',
    conformanceLimit: '',
    detectableUpper: '',
    detectableUpperText: '',
    detectableLower: '',
    detectableLowerText: '',
    showDetectableText: false,
    showStandardText: false,
    ifGreater: '',
    ifLesser: '',
    resultRepresentation: '',
    defaultNarration: '',
    hasFormula: false,
    hasDerivedFormula: false,
    // Operations
    estimatedDays: '0',
    estimatedCharges: '0',
    expressDays: '0',
    expressCharges: '0',
    instruments: [],
    minSize: '',
    extraFields: [],
    // Specification
    specification: '',
    standard: '',
  };
}

// A titled card: head (title, one-line hint, optional action) + padded body.
function Card({ title, hint, action, className = '', children }) {
  return (
    <section className={`smplfy-card card ${className}`.trim()}>
      <header className="smplfy-dr-edit-card-head">
        <div>
          <h2 className="smplfy-dr-edit-card-title">{title}</h2>
          {hint ? <p className="smplfy-dr-edit-card-hint">{hint}</p> : null}
        </div>
        {action ?? null}
      </header>
      <div className="smplfy-dr-edit-card-body">{children}</div>
    </section>
  );
}

export default function DecisionRuleEditPage({
  rule,
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  sidebarBadgeCounts,
}) {
  const [form, setForm] = useState(() => toForm(rule));
  const set = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));
  const setFromEvent = (key) => (event) => set(key)(event.target.value);

  const back = () => onNavigate?.('decision-rules-listing-v2');

  // --- Field builders ------------------------------------------------------
  const dropdown = (key, label, options, placeholder, extra = {}) => (
    <FormElement
      type="rich-dropdown"
      label={label}
      mandatory={extra.mandatory}
      inputProps={{
        value: form[key],
        options: withCurrent(options, form[key]),
        placeholder,
        searchable: extra.searchable ?? true,
        searchPlaceholder: `Search ${label.toLowerCase()}`,
        state: form[key] ? 'filled' : 'default',
        onChange: setFromEvent(key),
      }}
    />
  );

  const textField = (key, label, placeholder, extra = {}) => (
    <FormElement
      label={label}
      inputProps={{
        value: form[key],
        placeholder: placeholder ?? `Enter ${label.toLowerCase()}`,
        state: form[key] ? 'filled' : 'default',
        onChange: setFromEvent(key),
        ...extra,
      }}
    />
  );

  const numberField = (key, label, extra = {}) => textField(key, label, undefined, { inputMode: 'decimal', ...extra });

  const textArea = (key, label, rows, placeholder) => (
    <FormElement
      type="textarea"
      label={label}
      inputProps={{
        value: form[key],
        rows,
        placeholder,
        state: form[key] ? 'filled' : 'default',
        onChange: setFromEvent(key),
      }}
    />
  );

  const checkRow = (key, title, hint) => (
    <label className="smplfy-dr-edit-check">
      <Checkbox checked={form[key]} aria-label={title} onChange={set(key)} />
      <span className="smplfy-dr-edit-check-text">
        <span className="smplfy-dr-edit-check-title">{title}</span>
        {hint ? <span className="smplfy-dr-edit-check-hint">{hint}</span> : null}
      </span>
    </label>
  );

  // Standard / Express turnaround: one small matrix instead of four stacked fields.
  const matrixField = (key, ariaLabel) => (
    <FormElement
      inputProps={{
        value: form[key],
        inputMode: 'decimal',
        'aria-label': ariaLabel,
        state: form[key] ? 'filled' : 'default',
        onChange: setFromEvent(key),
      }}
    />
  );

  const addExtraField = () => setForm((current) => ({
    ...current,
    extraFields: [...current.extraFields, { id: `extra-${Date.now()}-${current.extraFields.length}`, name: '', value: '' }],
  }));
  const updateExtraField = (id, patch) => setForm((current) => ({
    ...current,
    extraFields: current.extraFields.map((field) => (field.id === id ? { ...field, ...patch } : field)),
  }));
  const removeExtraField = (id) => setForm((current) => ({
    ...current,
    extraFields: current.extraFields.filter((field) => field.id !== id),
  }));

  // --- Sections --------------------------------------------------------------
  // One centred column: each section is a card with its fields stacked
  // vertically. Short, naturally-paired fields sit two-up within a row; long
  // text runs full width. Keeps the production form's linearity, grouped.
  const row2 = (...kids) => <div className="smplfy-dr-edit-grid-2">{kids}</div>;
  const row3 = (...kids) => <div className="smplfy-dr-edit-grid-3">{kids}</div>;

  const sections = [
    {
      key: 'identity',
      title: 'Rule',
      hint: 'The product, parameter and method this rule evaluates.',
      body: (
        <>
          {dropdown('product', 'Product', PRODUCTS, 'Select a product', { mandatory: true })}
          {dropdown('parameter', 'Parameter', PARAMETER_NAMES, 'Select a parameter', { mandatory: true })}
          {dropdown('moa', 'MoA', MOAS, 'Select a method of analysis', { mandatory: true })}
          <div className="smplfy-form-field">
            <div className="smplfy-form-label-row">
              <label className="smplfy-form-label form-label" htmlFor="dr-edit-sample-category">Sample Category</label>
            </div>
            <MultiSelectDropdown
              id="dr-edit-sample-category"
              display="chips"
              value={form.sampleCategories}
              options={SAMPLE_CATEGORIES}
              placeholder="Select sample categories"
              ariaLabel="Sample categories"
              onChange={set('sampleCategories')}
            />
          </div>
          {checkRow('isTestGroupParent', 'Is test group parent')}
        </>
      ),
    },
    {
      key: 'limits',
      title: 'Limits',
      hint: 'Numeric bounds the test value is checked against.',
      body: (
        <>
          {row3(numberField('cutOff', 'Cut Off'), numberField('min', 'Min'), numberField('max', 'Max'))}
          {row2(dropdown('uom', 'UoM', UOMS, 'Select unit', { searchable: false }), textField('conformanceLimit', 'Conformance Limit'))}
        </>
      ),
    },
    {
      key: 'result',
      title: 'Result',
      hint: 'What the report says, and how the value is shown.',
      body: (
        <>
          {row2(
            textArea('ifGreater', 'If Greater Text', 2, 'e.g. Yellowish colour crystalline powder'),
            textArea('ifLesser', 'If Lesser Text', 2, 'e.g. Complies'),
          )}
          {dropdown('resultRepresentation', 'Result Representation', RESULT_REPRESENTATIONS, 'Select representation', { searchable: false })}
          {textArea('defaultNarration', 'Default Narration', 3, 'Narration used when no outcome text applies')}
        </>
      ),
    },
    {
      key: 'detectable',
      title: 'Detectable limits',
      hint: 'Each limit sits beside the text reported for it.',
      body: (
        <>
          {row2(numberField('detectableUpper', 'Detectable Upper Limit'), textField('detectableUpperText', 'Upper Limit Text'))}
          {row2(numberField('detectableLower', 'Detectable Lower Limit'), textField('detectableLowerText', 'Lower Limit Text'))}
          {textField('conformanceLimit', 'Conformance Limit')}
          {row2(checkRow('showDetectableText', 'Show detectable limit text'), checkRow('showStandardText', 'Show standard limit text'))}
        </>
      ),
    },
    {
      key: 'service',
      title: 'Service & turnaround',
      hint: 'Template, size, and standard vs express timing and charges.',
      body: (
        <>
          {row2(dropdown('template', 'Template', TEMPLATES, 'Select a template', { searchable: false }), numberField('minSize', 'Min Size'))}
          <div className="smplfy-dr-edit-matrix">
            <span />
            <span className="smplfy-dr-edit-matrix-head">Time in days</span>
            <span className="smplfy-dr-edit-matrix-head">Charges</span>
            <span className="smplfy-dr-edit-matrix-row">Standard</span>
            {matrixField('estimatedDays', 'Estimated time in days')}
            {matrixField('estimatedCharges', 'Estimated charges')}
            <span className="smplfy-dr-edit-matrix-row">Express</span>
            {matrixField('expressDays', 'Express time in days')}
            {matrixField('expressCharges', 'Express charges')}
          </div>
        </>
      ),
    },
    {
      key: 'lab',
      title: 'Lab setup',
      hint: 'Instruments and materials this rule needs.',
      body: (
        <>
          <div className="smplfy-form-field">
            <div className="smplfy-form-label-row">
              <label className="smplfy-form-label form-label" htmlFor="dr-edit-instruments">Associated Instruments</label>
            </div>
            <MultiSelectDropdown
              id="dr-edit-instruments"
              display="chips"
              value={form.instruments}
              options={INSTRUMENTS}
              placeholder="Select instruments"
              ariaLabel="Associated instruments"
              onChange={set('instruments')}
            />
          </div>
          <div className="smplfy-form-field">
            <div className="smplfy-form-label-row">
              <span className="smplfy-form-label form-label">Required Materials</span>
            </div>
            <div className="smplfy-dr-edit-empty">No materials required for this decision rule.</div>
          </div>
        </>
      ),
    },
    {
      key: 'classification',
      title: 'Classification',
      hint: 'How this rule is grouped, referenced and flagged.',
      body: (
        <>
          {row2(
            dropdown('discipline', 'Discipline', DISCIPLINES, 'Select discipline', { searchable: false }),
            dropdown('group', 'Group', GROUPS, 'Select group', { searchable: false }),
          )}
          {textField('uniqueKey', 'Unique Key', 'e.g. MoistureContent')}
          {row2(checkRow('hasFormula', 'Has formula'), checkRow('hasDerivedFormula', 'Has derived formula'))}
        </>
      ),
    },
    {
      key: 'extra',
      title: 'Additional data fields',
      action: <SecondaryButton size="medium" leftIcon="plus" onClick={addExtraField}>Add field</SecondaryButton>,
      body: form.extraFields.length ? (
        <div className="smplfy-dr-edit-extra">
          {form.extraFields.map((field, index) => (
            <div key={field.id} className="smplfy-dr-edit-extra-row">
              <FormElement inputProps={{ value: field.name, placeholder: 'Field name', 'aria-label': `Additional field ${index + 1} name`, state: field.name ? 'filled' : 'default', onChange: (e) => updateExtraField(field.id, { name: e.target.value }) }} />
              <FormElement inputProps={{ value: field.value, placeholder: 'Value', 'aria-label': `Additional field ${index + 1} value`, state: field.value ? 'filled' : 'default', onChange: (e) => updateExtraField(field.id, { value: e.target.value }) }} />
              <SecondaryButton size="medium" leftIcon="trash" aria-label={`Remove additional field ${index + 1}`} className="smplfy-dr-edit-icon-btn" onClick={() => removeExtraField(field.id)} />
            </div>
          ))}
        </div>
      ) : (
        <div className="smplfy-dr-edit-empty">No additional data fields.</div>
      ),
    },
    {
      key: 'specification',
      title: 'Specification & standard',
      body: (
        <>
          {textArea('specification', 'Specification', 5, 'Describe the specification this rule checks against')}
          {textArea('standard', 'Standard', 5, 'Reference standard')}
        </>
      ),
    },
  ];

  return (
    <AppChrome
      activeNav="design-handoff"
      onNavigate={onNavigate}
      breadcrumbs={[
        { key: 'design-handoff', label: 'Design Handoff' },
        { key: 'decision-rules-listing-v2', label: 'Decision Rules' },
        { key: 'decision-rule-edit', label: 'Edit Decision Rule', current: true },
      ]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      sidebarBadgeCounts={sidebarBadgeCounts}
      pageHeader={(
        <section className="bg-white border-bottom px-4 py-3">
          <div className="container-fluid px-0">
            <div className="row align-items-center justify-content-between gx-0 gy-3">
              <div className="col-auto d-flex align-items-center gap-3 min-w-0">
                <SecondaryButton
                  size="medium"
                  leftIcon="chevron-left"
                  className="px-0 flex-shrink-0"
                  aria-label="Back to decision rules"
                  onClick={back}
                />
                <h1 className="h5 mb-0 fw-semibold text-dark">Edit Decision Rule</h1>
                {form.product || form.parameter ? (
                  <span className="smplfy-dr-edit-context text-truncate">
                    {[form.product, form.parameter].filter(Boolean).join(' · ')}
                  </span>
                ) : null}
              </div>
              <div className="col-auto d-flex align-items-center gap-3">
                <label className="smplfy-dr-edit-active">
                  <Checkbox checked={form.isActive} aria-label="Is active" onChange={set('isActive')} />
                  <span>Active</span>
                </label>
                <div className="d-flex align-items-center gap-2">
                  <SecondaryButton onClick={back}>Discard changes</SecondaryButton>
                  <PrimaryButton leftIcon="save" onClick={back}>Update</PrimaryButton>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    >
      <main className="smplfy-dr-edit-page bg-body-tertiary p-4">
        {/* A single centred column: linear like the production form, but the
            fields are grouped into section cards. */}
        <div className="smplfy-dr-edit-column d-flex flex-column gap-3">
          {sections.map((item) => (
            <Card key={item.key} title={item.title} hint={item.hint} action={item.action}>
              {item.body}
            </Card>
          ))}
        </div>
      </main>
    </AppChrome>
  );
}
