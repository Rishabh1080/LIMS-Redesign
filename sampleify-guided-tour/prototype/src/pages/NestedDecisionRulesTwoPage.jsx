import { useEffect, useRef, useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import Checkbox from '../components/Checkbox/Checkbox';
import DataTable from '../components/DataTable';
import { FormElement } from '../components/FormControls';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import './nested-decision-rules-two-page.scss';

const productOptions = [
  'Apparels & Garments',
  'Protective Textiles',
  'Latex',
  'Dye Powders',
  'Dhurry',
  'Bleaching Agent',
  'Carpets & Rugs',
  'Fibre & filaments',
  'Garment',
  'Yarns & Chords',
  'Finished Fabric',
  'Fibres',
  'Tops & Yarns',
  'Acids',
];

const parameterOptions = [
  'Quantitative chemical analysis of mixtures',
  'Quantitative chemical analysis for Overall composition of carpet',
  'Determination of wool content of woollen textile material',
  'Colour Fastness to Organic solvents',
  'Colour fastness to rubbing (Dry & Wet)',
  'Colour fastness to rubbing (Organic Solvent)',
  'Colour Fastness to washing',
  'Span Length of Cotton Length',
  'Determine the level of pilling and fuzzing to shredding particularly with 100 % pile carpets.',
  'Computer Colour Matching: Whiteness Yellowness evaluation comparison between them',
  'PRODUCTION OF CHANGES IN APPEARANCE BY MEANS OF HEXAPOD TUMBLER TESTER',
  'Computer Colour Matching: Colour Difference of textiles',
  'Computer Colour Matching: Comparison of strength of dye stuffs on the basis of dyed fabric',
  'yarn',
];

const moaOptions = [
  'IS 688:1988',
  'IS 11870:1986',
  'IS 9889:1988',
  'IS 3421',
  'IS 9068: 1979',
  'IS 6637: 1992 (RA 2018)',
  'IS ISO 105 D02:2016',
  'IS ISO 105 C10 A (1):2006 (RA 2021)',
];

const initialPrimaryRule = {
  product: 'Finished Fabric',
  parameter: 'Colour Fastness to Organic solvents',
  moa: 'IS 688:1988',
};

const initialChildRules = [
  {
    id: 'child-rule-01',
    parameter: 'Quantitative chemical analysis of mixtures',
    moa: 'IS 11870:1986',
    min: '',
    max: '',
  },
  {
    id: 'child-rule-02',
    parameter: 'Quantitative chemical analysis for Overall composition of carpet',
    moa: 'IS 9889:1988',
    min: '',
    max: '',
  },
  {
    id: 'child-rule-03',
    parameter: 'Determination of wool content of woollen textile material',
    moa: 'IS 3421',
    min: '',
    max: '',
  },
];

function NestedDecisionRulesTwoHeader({ isDirty, isEditingChild, onBack }) {
  return (
    <section className="smplfy-nested-decision-rules-two-header bg-white border-bottom px-4 py-3">
      <div className="container-fluid px-0">
        <div className="row align-items-center justify-content-between gx-0 gy-3">
          <div className="col-auto d-flex align-items-center gap-3 min-w-0">
            <SecondaryButton
              size="medium"
              leftIcon="chevron-left"
              className="px-0 flex-shrink-0"
              aria-label="Go back"
              onClick={onBack}
            />
            <h1 className="h5 fw-semibold text-dark mb-0">
              {isEditingChild ? 'Edit Decision Rule' : 'Nested Decision Rules 2'}
            </h1>
          </div>
          <div className="col-auto">
            <PrimaryButton
              type="submit"
              form={isEditingChild
                ? 'nested-decision-rules-two-child-form'
                : 'nested-decision-rules-two-form'}
              leftIcon="save"
              disabled={!isDirty}
            >
              Update
            </PrimaryButton>
          </div>
        </div>
      </div>
    </section>
  );
}

function RuleCheckbox({ id, label, checked, onChange }) {
  return (
    <label
      className="smplfy-nested-decision-rules-two-checkbox d-flex align-items-center gap-2"
      htmlFor={id}
    >
      <Checkbox id={id} checked={checked} aria-label={label} onChange={onChange} />
      <span>{label}</span>
    </label>
  );
}

export function DecisionRuleEditForm({
  checkboxes,
  onCheckboxChange,
  onChange,
  onSubmit,
  productDisabled = true,
  rule,
}) {
  const updateField = (field) => (event) => onChange(field, event.target.value);
  const optionsWithCurrentValue = (options, currentValue) => (
    currentValue && !options.includes(currentValue) ? [currentValue, ...options] : options
  );

  return (
    <main className="smplfy-nested-decision-rules-two-page bg-body-tertiary p-4 min-vh-100">
      <div className="container-fluid px-0">
        <section className="smplfy-card card border-0 shadow-sm smplfy-nested-decision-rules-two-edit-card mx-auto">
          <div className="card-body p-4">
            <form
              id="nested-decision-rules-two-child-form"
              className="smplfy-nested-decision-rules-two-form"
              aria-label="Edit decision rule form"
              onSubmit={onSubmit}
              noValidate
            >
              <FormElement
                className="smplfy-nested-decision-rules-two-field-full"
                type="dropdown"
                mandatory
                label="Product"
                inputProps={{
                  value: rule.product,
                  options: optionsWithCurrentValue(productOptions, rule.product),
                  disabled: productDisabled,
                  onChange: productDisabled ? undefined : updateField('product'),
                }}
              />

              <FormElement
                type="dropdown"
                mandatory
                label="Parameter"
                inputProps={{
                  value: rule.parameter,
                  placeholder: 'Select Parameter',
                  options: optionsWithCurrentValue(parameterOptions, rule.parameter),
                  onChange: updateField('parameter'),
                }}
              />

              <FormElement
                type="dropdown"
                mandatory
                label="MoA"
                inputProps={{
                  value: rule.moa,
                  placeholder: 'Select MoA',
                  options: optionsWithCurrentValue(moaOptions, rule.moa),
                  onChange: updateField('moa'),
                }}
              />

              <FormElement
                type="dropdown"
                label="Sample Category"
                inputProps={{
                  value: rule.sampleCategory ?? '',
                  placeholder: 'Select Sample Category',
                  options: [],
                  onChange: updateField('sampleCategory'),
                }}
              />

              <FormElement
                label="Cut Off Value"
                inputProps={{
                  type: 'number',
                  value: rule.cutOffValue ?? '0',
                  placeholder: 'Numeric Cut Off Value',
                  onChange: updateField('cutOffValue'),
                }}
              />

              <FormElement
                label="Min"
                inputProps={{
                  value: rule.min,
                  placeholder: 'Numeric Min Value',
                  onChange: updateField('min'),
                }}
              />

              <FormElement
                label="Max"
                inputProps={{
                  value: rule.max,
                  placeholder: 'Numeric Max Value',
                  onChange: updateField('max'),
                }}
              />

              <FormElement
                type="textarea"
                label="If Greater Text"
                inputProps={{
                  value: rule.ifGreaterText ?? '',
                  placeholder: 'If Greater text',
                  rows: 3,
                  onChange: updateField('ifGreaterText'),
                }}
              />

              <FormElement
                type="textarea"
                label="If Lesser Text"
                inputProps={{
                  value: rule.ifLesserText ?? '',
                  placeholder: 'If Lesser text',
                  rows: 3,
                  onChange: updateField('ifLesserText'),
                }}
              />

              <FormElement
                label="UoM"
                inputProps={{
                  value: rule.uom ?? '',
                  placeholder: 'Unit',
                  onChange: updateField('uom'),
                }}
              />

              <FormElement
                label="Estimated Time in Days"
                inputProps={{
                  type: 'number',
                  value: rule.estimatedTime ?? '0',
                  placeholder: 'Estimated Time in days',
                  onChange: updateField('estimatedTime'),
                }}
              />

              <FormElement
                label="Estimated Charges"
                inputProps={{
                  type: 'number',
                  value: rule.estimatedCharges ?? '0',
                  placeholder: 'Estimated Charges(Rs)',
                  onChange: updateField('estimatedCharges'),
                }}
              />

              <FormElement
                label="Express Time in Days"
                inputProps={{
                  type: 'number',
                  value: rule.expressTime ?? '0',
                  placeholder: 'Express Time in days',
                  onChange: updateField('expressTime'),
                }}
              />

              <FormElement
                label="Express Charges"
                inputProps={{
                  type: 'number',
                  value: rule.expressCharges ?? '0',
                  placeholder: 'Express Charges(Rs)',
                  onChange: updateField('expressCharges'),
                }}
              />

              <FormElement
                label="Min Size"
                inputProps={{
                  value: rule.minSize ?? '',
                  placeholder: 'Min Size',
                  onChange: updateField('minSize'),
                }}
              />

              <FormElement
                className="smplfy-nested-decision-rules-two-field-full"
                type="dropdown"
                label="Template"
                inputProps={{
                  value: rule.template ?? 'IS 688',
                  placeholder: 'Select Template',
                  options: optionsWithCurrentValue(['IS 688'], rule.template),
                  onChange: updateField('template'),
                }}
              />

              <FormElement
                type="textarea"
                label="Result Representation"
                inputProps={{
                  value: rule.resultRepresentation ?? '',
                  rows: 3,
                  onChange: updateField('resultRepresentation'),
                }}
              />

              <FormElement
                type="textarea"
                label="Default Narration"
                inputProps={{
                  value: rule.defaultNarration ?? '',
                  rows: 3,
                  onChange: updateField('defaultNarration'),
                }}
              />

              <FormElement
                label="Detectable Upper Limit"
                inputProps={{
                  type: 'number',
                  value: rule.detectableUpperLimit ?? '',
                  placeholder: 'Detectable Upper Limit',
                  onChange: updateField('detectableUpperLimit'),
                }}
              />

              <FormElement
                label="Detectable Lower Limit"
                inputProps={{
                  type: 'number',
                  value: rule.detectableLowerLimit ?? '',
                  placeholder: 'Detectable Lower Limit',
                  onChange: updateField('detectableLowerLimit'),
                }}
              />

              <FormElement
                type="textarea"
                label="Detectable Upper Limit Text"
                inputProps={{
                  value: rule.detectableUpperLimitText ?? '',
                  rows: 3,
                  onChange: updateField('detectableUpperLimitText'),
                }}
              />

              <FormElement
                type="textarea"
                label="Detectable Lower Limit Text"
                inputProps={{
                  value: rule.detectableLowerLimitText ?? '',
                  rows: 3,
                  onChange: updateField('detectableLowerLimitText'),
                }}
              />

              <RuleCheckbox
                id="nested-rule-two-child-show-detectable-limit-text"
                label="Show Detectable Limit Text"
                checked={checkboxes.showDetectableLimitText}
                onChange={(checked) => onCheckboxChange('showDetectableLimitText', checked)}
              />

              <RuleCheckbox
                id="nested-rule-two-child-show-standard-limit-text"
                label="Show Standard Limit Text"
                checked={checkboxes.showStandardLimitText}
                onChange={(checked) => onCheckboxChange('showStandardLimitText', checked)}
              />

              <FormElement
                label="Conformance Limit"
                inputProps={{
                  type: 'number',
                  value: rule.conformanceLimit ?? '',
                  placeholder: 'Conformance Limit',
                  onChange: updateField('conformanceLimit'),
                }}
              />

              <FormElement
                type="dropdown"
                label="Associated Instruments"
                inputProps={{
                  value: rule.associatedInstruments ?? '',
                  placeholder: 'Select Instruments',
                  options: [],
                  onChange: updateField('associatedInstruments'),
                }}
              />

              <FormElement
                label="Discipline"
                inputProps={{
                  value: rule.discipline ?? '',
                  placeholder: 'Discipline',
                  onChange: updateField('discipline'),
                }}
              />

              <FormElement
                label="Group"
                inputProps={{
                  value: rule.group ?? '',
                  placeholder: 'Group',
                  onChange: updateField('group'),
                }}
              />

              <RuleCheckbox
                id="nested-rule-two-child-is-active"
                label="Is Active"
                checked={checkboxes.isActive}
                onChange={(checked) => onCheckboxChange('isActive', checked)}
              />

              <RuleCheckbox
                id="nested-rule-two-child-is-nabl"
                label="Is NABL"
                checked={checkboxes.isNabl}
                onChange={(checked) => onCheckboxChange('isNabl', checked)}
              />
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function NestedDecisionRulesTwoPage({
  onBack,
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  sidebarBadgeCounts,
}) {
  const nextChildNumberRef = useRef(initialChildRules.length + 1);
  const [primaryRule, setPrimaryRule] = useState(initialPrimaryRule);
  const [childRules, setChildRules] = useState(initialChildRules);
  const [isDirty, setIsDirty] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [editingDraft, setEditingDraft] = useState(null);
  const [editingCheckboxes, setEditingCheckboxes] = useState({
    showDetectableLimitText: false,
    showStandardLimitText: false,
    isActive: false,
    isNabl: false,
  });
  const [checkboxes, setCheckboxes] = useState({
    showDetectableLimitText: false,
    showStandardLimitText: false,
    isActive: false,
    isNabl: false,
  });

  const updatePrimaryField = (field) => (event) => {
    setPrimaryRule((current) => ({ ...current, [field]: event.target.value }));
  };

  const updateCheckbox = (field) => (checked) => {
    setCheckboxes((current) => ({ ...current, [field]: checked }));
  };

  useEffect(() => {
    if (editingRuleId) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      document.querySelector('.lims-main-content')?.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [editingRuleId]);

  const addChildRule = () => {
    const nextNumber = nextChildNumberRef.current;
    nextChildNumberRef.current += 1;
    setChildRules((current) => [
      ...current,
      {
        id: `child-rule-${String(nextNumber).padStart(2, '0')}`,
        parameter: '',
        moa: '',
        min: '',
        max: '',
      },
    ]);
    setIsDirty(true);
  };

  const deleteChildRule = (ruleId) => {
    setChildRules((current) => current.filter((rule) => rule.id !== ruleId));
    setIsDirty(true);
  };

  const openChildRuleEditor = (rule) => {
    setEditingRuleId(rule.id);
    setEditingDraft({
      ...rule,
      product: primaryRule.product,
      cutOffValue: rule.cutOffValue ?? '0',
      estimatedTime: rule.estimatedTime ?? '0',
      estimatedCharges: rule.estimatedCharges ?? '0',
      expressTime: rule.expressTime ?? '0',
      expressCharges: rule.expressCharges ?? '0',
      template: rule.template ?? 'IS 688',
    });
    setEditingCheckboxes({
      showDetectableLimitText: Boolean(rule.showDetectableLimitText),
      showStandardLimitText: Boolean(rule.showStandardLimitText),
      isActive: Boolean(rule.isActive),
      isNabl: Boolean(rule.isNabl),
    });
    setIsDirty(false);
  };

  const closeChildRuleEditor = () => {
    setEditingRuleId(null);
    setEditingDraft(null);
    setIsDirty(false);
  };

  const updateEditingField = (field, value) => {
    setEditingDraft((current) => ({ ...current, [field]: value }));
    setIsDirty(true);
  };

  const updateEditingCheckbox = (field, checked) => {
    setEditingCheckboxes((current) => ({ ...current, [field]: checked }));
    setIsDirty(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsDirty(false);
  };

  const handleChildSubmit = (event) => {
    event.preventDefault();
    setChildRules((current) => current.map((rule) => (
      rule.id === editingRuleId
        ? { ...rule, ...editingDraft, ...editingCheckboxes }
        : rule
    )));
    closeChildRuleEditor();
  };

  const isEditingChild = Boolean(editingRuleId && editingDraft);

  return (
    <AppChrome
      activeNav="design-handoff"
      onNavigate={onNavigate}
      breadcrumbs={isEditingChild
        ? [
            { key: 'design-handoff', label: 'Design Handoff' },
            { key: 'nested-decision-rules-2', label: 'Nested Decision Rules 2' },
            { key: 'edit-decision-rule', label: 'Edit Decision Rule', current: true },
          ]
        : [
            { key: 'design-handoff', label: 'Design Handoff' },
            { key: 'nested-decision-rules-2', label: 'Nested Decision Rules 2', current: true },
          ]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      sidebarBadgeCounts={sidebarBadgeCounts}
      pageHeader={(
        <NestedDecisionRulesTwoHeader
          isDirty={isDirty}
          isEditingChild={isEditingChild}
          onBack={isEditingChild ? closeChildRuleEditor : onBack}
        />
      )}
    >
      {isEditingChild ? (
        <DecisionRuleEditForm
          rule={editingDraft}
          checkboxes={editingCheckboxes}
          onChange={updateEditingField}
          onCheckboxChange={updateEditingCheckbox}
          onSubmit={handleChildSubmit}
        />
      ) : (
      <main className="smplfy-nested-decision-rules-two-page bg-body-tertiary p-4 min-vh-100">
        <div className="container-fluid px-0 d-flex flex-column gap-3">
          <section className="smplfy-card card overflow-hidden">
            <div className="card-header bg-white border-bottom px-4 py-3">
              <h2 className="h6 fw-semibold text-dark mb-1">Primary Decision Rule</h2>
              <p className="small text-secondary mb-0">Product-level rule details inherited by all child rules</p>
            </div>
            <div className="card-body p-4">
              <form
                id="nested-decision-rules-two-form"
                className="smplfy-nested-decision-rules-two-form"
                aria-label="Primary decision rule form"
                onChange={() => setIsDirty(true)}
                onSubmit={handleSubmit}
                noValidate
              >
                <FormElement
                  className="smplfy-nested-decision-rules-two-field-full"
                  type="dropdown"
                  mandatory
                  label="Product"
                  inputProps={{
                    value: primaryRule.product,
                    options: productOptions,
                    onChange: updatePrimaryField('product'),
                  }}
                />

                <FormElement
                  type="dropdown"
                  mandatory
                  label="Parameter"
                  inputProps={{
                    value: primaryRule.parameter,
                    placeholder: 'Select Parameter',
                    options: parameterOptions,
                    onChange: updatePrimaryField('parameter'),
                  }}
                />

                <FormElement
                  type="dropdown"
                  mandatory
                  label="MoA"
                  inputProps={{
                    value: primaryRule.moa,
                    placeholder: 'Select MoA',
                    options: moaOptions,
                    onChange: updatePrimaryField('moa'),
                  }}
                />

                <FormElement
                  type="dropdown"
                  label="Sample Category"
                  inputProps={{ placeholder: 'Select Sample Category', options: [] }}
                />

                <FormElement
                  label="Cut Off Value"
                  inputProps={{ type: 'number', placeholder: 'Numeric Cut Off Value' }}
                />

                <FormElement label="Min" inputProps={{ placeholder: 'Numeric Min Value' }} />
                <FormElement label="Max" inputProps={{ placeholder: 'Numeric Max Value' }} />

                <FormElement
                  type="textarea"
                  label="If Greater Text"
                  inputProps={{ placeholder: 'If Greater text', rows: 3 }}
                />

                <FormElement
                  type="textarea"
                  label="If Lesser Text"
                  inputProps={{ placeholder: 'If Lesser text', rows: 3 }}
                />

                <FormElement label="UoM" inputProps={{ placeholder: 'Unit' }} />

                <FormElement
                  label="Estimated Time in Days"
                  inputProps={{ type: 'number', value: '0', placeholder: 'Estimated Time in days' }}
                />

                <FormElement
                  label="Estimated Charges"
                  inputProps={{ type: 'number', value: '0', placeholder: 'Estimated Charges(Rs)' }}
                />

                <FormElement
                  label="Express Time in Days"
                  inputProps={{ type: 'number', value: '0', placeholder: 'Express Time in days' }}
                />

                <FormElement
                  label="Express Charges"
                  inputProps={{ type: 'number', value: '0', placeholder: 'Express Charges(Rs)' }}
                />

                <FormElement label="Min Size" inputProps={{ placeholder: 'Min Size' }} />

                <FormElement
                  className="smplfy-nested-decision-rules-two-field-full"
                  type="dropdown"
                  label="Template"
                  inputProps={{ value: 'IS 688', placeholder: 'Select Template', options: ['IS 688'] }}
                />

                <FormElement type="textarea" label="Result Representation" inputProps={{ rows: 3 }} />
                <FormElement type="textarea" label="Default Narration" inputProps={{ rows: 3 }} />

                <FormElement
                  label="Detectable Upper Limit"
                  inputProps={{ type: 'number', placeholder: 'Detectable Upper Limit' }}
                />

                <FormElement
                  label="Detectable Lower Limit"
                  inputProps={{ type: 'number', placeholder: 'Detectable Lower Limit' }}
                />

                <FormElement type="textarea" label="Detectable Upper Limit Text" inputProps={{ rows: 3 }} />
                <FormElement type="textarea" label="Detectable Lower Limit Text" inputProps={{ rows: 3 }} />

                <RuleCheckbox
                  id="nested-rule-two-show-detectable-limit-text"
                  label="Show Detectable Limit Text"
                  checked={checkboxes.showDetectableLimitText}
                  onChange={updateCheckbox('showDetectableLimitText')}
                />

                <RuleCheckbox
                  id="nested-rule-two-show-standard-limit-text"
                  label="Show Standard Limit Text"
                  checked={checkboxes.showStandardLimitText}
                  onChange={updateCheckbox('showStandardLimitText')}
                />

                <FormElement
                  label="Conformance Limit"
                  inputProps={{ type: 'number', placeholder: 'Conformance Limit' }}
                />

                <FormElement
                  type="dropdown"
                  label="Associated Instruments"
                  inputProps={{ placeholder: 'Select Instruments', options: [] }}
                />

                <FormElement label="Discipline" inputProps={{ placeholder: 'Discipline' }} />
                <FormElement label="Group" inputProps={{ placeholder: 'Group' }} />

                <RuleCheckbox
                  id="nested-rule-two-is-active"
                  label="Is Active"
                  checked={checkboxes.isActive}
                  onChange={updateCheckbox('isActive')}
                />

                <RuleCheckbox
                  id="nested-rule-two-is-nabl"
                  label="Is NABL"
                  checked={checkboxes.isNabl}
                  onChange={updateCheckbox('isNabl')}
                />
              </form>
            </div>
          </section>

          <section className="smplfy-card card overflow-hidden">
            <div className="card-header bg-white border-bottom px-4 py-3 d-flex align-items-center justify-content-between gap-3 flex-wrap">
              <div>
                <h2 className="h6 fw-semibold text-dark mb-1">Child Decision Rules</h2>
                <p className="small text-secondary mb-0">
                  {childRules.length} {childRules.length === 1 ? 'rule' : 'rules'}
                </p>
              </div>
              <PrimaryButton leftIcon="plus" onClick={addChildRule}>
                Add Decision Rule
              </PrimaryButton>
            </div>
            <div className="card-body p-4">
              <DataTable stickyActionColumn>
                <thead>
                  <tr>
                    <th scope="col">Parameter</th>
                    <th scope="col">MoA</th>
                    <th scope="col">Min</th>
                    <th scope="col">Max</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {childRules.map((rule) => (
                    <tr key={rule.id}>
                      <td className={rule.parameter ? 'fw-medium text-dark' : 'text-secondary'}>
                        {rule.parameter}
                      </td>
                      <td className="text-nowrap">{rule.moa}</td>
                      <td>{rule.min}</td>
                      <td>{rule.max}</td>
                      <td className="text-nowrap">
                        <div className="d-flex align-items-center gap-2 flex-nowrap">
                          <SecondaryButton
                            size="medium"
                            leftIcon="edit"
                            onClick={() => openChildRuleEditor(rule)}
                          >
                            Edit
                          </SecondaryButton>
                          <SecondaryButton
                            size="medium"
                            tone="destructive"
                            leftIcon="trash"
                            onClick={() => deleteChildRule(rule.id)}
                          >
                            Delete
                          </SecondaryButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {childRules.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-secondary py-4">
                        No child decision rules added.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </DataTable>
            </div>
          </section>
        </div>
      </main>
      )}
    </AppChrome>
  );
}
