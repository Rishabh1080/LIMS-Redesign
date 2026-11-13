import { useRef, useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import Checkbox from '../components/Checkbox/Checkbox';
import { FormElement } from '../components/FormControls';
import MoreActionButton from '../components/MoreActionButton';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import './nested-decision-rules-page.scss';

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

const initialDecisionRules = [
  {
    id: 'primary-rule',
    label: 'Primary Decision Rule',
    product: 'Finished Fabric',
    parameter: 'Colour Fastness to Organic solvents',
    moa: 'IS 688:1988',
    isParent: true,
    isBlank: false,
  },
  {
    id: 'child-rule-01',
    product: 'Finished Fabric',
    parameter: 'Quantitative chemical analysis of mixtures',
    moa: 'IS 11870:1986',
    isParent: false,
    isBlank: false,
  },
  {
    id: 'child-rule-02',
    product: 'Finished Fabric',
    parameter: 'Quantitative chemical analysis for Overall composition of carpet',
    moa: 'IS 9889:1988',
    isParent: false,
    isBlank: false,
  },
  {
    id: 'child-rule-03',
    product: 'Finished Fabric',
    parameter: 'Determination of wool content of woollen textile material',
    moa: 'IS 3421',
    isParent: false,
    isBlank: false,
  },
];

function createCheckboxState() {
  return {
    showDetectableLimitText: false,
    showStandardLimitText: false,
    isActive: false,
    isNabl: false,
  };
}

function NestedDecisionRulesHeader({ onBack, isDirty }) {
  return (
    <section className="smplfy-nested-decision-rules-header d-flex align-items-center justify-content-between gap-3 bg-white border-bottom px-4 py-3">
      <div className="d-flex align-items-center gap-3 min-w-0">
        <SecondaryButton
          size="medium"
          leftIcon="chevron-left"
          className="px-0 flex-shrink-0"
          aria-label="Go back"
          onClick={onBack}
        />
        <h1 className="h5 fw-semibold text-body mb-0">Nested Decision Rules</h1>
      </div>
      <PrimaryButton
        type="submit"
        form="nested-decision-rules-form"
        leftIcon="save"
        className="flex-shrink-0"
        disabled={!isDirty}
      >
        Update
      </PrimaryButton>
    </section>
  );
}

function RuleCheckbox({ id, label, checked, onChange }) {
  return (
    <label className="smplfy-nested-decision-rules-checkbox d-flex align-items-center gap-2" htmlFor={id}>
      <Checkbox
        id={id}
        checked={checked}
        aria-label={label}
        onChange={onChange}
      />
      <span>{label}</span>
    </label>
  );
}

function DecisionRuleSelector({
  rules,
  selectedRuleId,
  onSelect,
  onAddChild,
  onDuplicate,
  onDelete,
}) {
  return (
    <section className="smplfy-card card border-0 shadow-sm smplfy-nested-decision-rules-selector">
      <div className="card-header bg-white border-bottom p-3 d-flex align-items-center justify-content-between gap-2">
        <div className="min-w-0">
          <h2 className="h6 fw-semibold text-dark mb-1">Decision Rules</h2>
          <p className="small text-secondary mb-0">Select a rule to edit</p>
        </div>
        <SecondaryButton
          size="medium"
          leftIcon="plus"
          className="smplfy-nested-decision-rules-add-child flex-shrink-0 p-0"
          aria-label="Add child decision rule"
          title="Add child decision rule"
          onClick={onAddChild}
        />
      </div>
      <div className="card-body p-2">
        <div className="list-group gap-1" role="list" aria-label="Decision rules">
          {rules.map((rule) => {
            const selected = rule.id === selectedRuleId;
            const ruleTitle = rule.isParent
              ? rule.label
              : rule.parameter || 'Untitled child rule';
            const ruleMeta = rule.isParent
              ? 'Parent rule'
              : rule.moa || 'No method of analysis selected';

            return (
              <div
                key={rule.id}
                role="listitem"
                className={`smplfy-list-group-item list-group-item list-group-item-action border-0 smplfy-nested-decision-rules-selector-row ${selected ? 'active' : ''} ${rule.isParent ? 'is-parent' : 'is-child'}`}
              >
                <button
                  type="button"
                  className="smplfy-nested-decision-rules-selector-target"
                  aria-current={selected ? 'true' : undefined}
                  onClick={() => onSelect(rule.id)}
                >
                  {rule.isParent ? (
                    <span className="smplfy-nested-decision-rules-selector-icon d-inline-flex align-items-center justify-content-center flex-shrink-0" aria-hidden="true">
                      <AppIcon name="file-description" size={18} />
                    </span>
                  ) : null}
                  <span className="smplfy-nested-decision-rules-selector-copy flex-grow-1">
                    <span className="smplfy-nested-decision-rules-selector-title text-truncate">
                      {ruleTitle}
                    </span>
                    <span className="smplfy-nested-decision-rules-selector-meta text-truncate">
                      {ruleMeta}
                    </span>
                  </span>
                </button>

                {!rule.isParent ? (
                  <MoreActionButton
                    className="smplfy-nested-decision-rules-selector-menu flex-shrink-0"
                    aria-label={`Actions for ${ruleTitle}`}
                    items={[
                      {
                        key: 'duplicate',
                        label: 'Duplicate',
                        leftIcon: 'copy',
                        onClick: () => onDuplicate(rule.id),
                      },
                      {
                        key: 'delete',
                        label: 'Delete',
                        leftIcon: 'trash',
                        onClick: () => onDelete(rule.id),
                      },
                    ]}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function NestedDecisionRulesPage({
  onBack,
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  sidebarBadgeCounts,
}) {
  const nextRuleNumberRef = useRef(initialDecisionRules.length + 1);
  const [rules, setRules] = useState(initialDecisionRules);
  const [selectedRuleId, setSelectedRuleId] = useState(initialDecisionRules[0].id);
  const [checkboxesByRule, setCheckboxesByRule] = useState(() => (
    Object.fromEntries(initialDecisionRules.map((rule) => [rule.id, createCheckboxState()]))
  ));
  const [isDirty, setIsDirty] = useState(false);
  const selectedRule = rules.find((rule) => rule.id === selectedRuleId) ?? rules[0];
  const checkboxes = checkboxesByRule[selectedRule.id];

  const createRuleId = () => {
    const id = `child-rule-${String(nextRuleNumberRef.current).padStart(2, '0')}`;
    nextRuleNumberRef.current += 1;
    return id;
  };

  const addBlankChild = () => {
    const id = createRuleId();
    const newRule = {
      id,
      product: rules[0]?.product ?? 'Finished Fabric',
      parameter: '',
      moa: '',
      isParent: false,
      isBlank: true,
    };

    setRules((current) => [...current, newRule]);
    setCheckboxesByRule((current) => ({ ...current, [id]: createCheckboxState() }));
    setSelectedRuleId(id);
    setIsDirty(true);
  };

  const duplicateRule = (ruleId) => {
    const sourceRule = rules.find((rule) => rule.id === ruleId);
    if (!sourceRule) return;

    const id = createRuleId();
    const duplicatedRule = {
      ...sourceRule,
      id,
      isParent: false,
    };

    setRules((current) => {
      const sourceIndex = current.findIndex((rule) => rule.id === ruleId);
      return [
        ...current.slice(0, sourceIndex + 1),
        duplicatedRule,
        ...current.slice(sourceIndex + 1),
      ];
    });
    setCheckboxesByRule((current) => ({
      ...current,
      [id]: { ...(current[ruleId] ?? createCheckboxState()) },
    }));
    setSelectedRuleId(id);
    setIsDirty(true);
  };

  const deleteRule = (ruleId) => {
    setRules((current) => current.filter((rule) => rule.id !== ruleId));
    setCheckboxesByRule((current) => {
      const next = { ...current };
      delete next[ruleId];
      return next;
    });
    setSelectedRuleId((current) => (
      current === ruleId ? initialDecisionRules[0].id : current
    ));
    setIsDirty(true);
  };

  const updateSelectedRuleField = (field) => (event) => {
    const value = event.target.value;
    setRules((current) => current.map((rule) => (
      rule.id === selectedRule.id ? { ...rule, [field]: value } : rule
    )));
  };

  const updateCheckbox = (key) => (checked) => {
    setCheckboxesByRule((current) => ({
      ...current,
      [selectedRule.id]: {
        ...current[selectedRule.id],
        [key]: checked,
      },
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsDirty(false);
  };

  return (
    <AppChrome
      activeNav="design-handoff"
      onNavigate={onNavigate}
      breadcrumbs={[
        { key: 'design-handoff', label: 'Design Handoff' },
        { key: 'nested-decision-rules', label: 'Nested Decision Rules', current: true },
      ]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      sidebarBadgeCounts={sidebarBadgeCounts}
      pageHeader={<NestedDecisionRulesHeader onBack={onBack} isDirty={isDirty} />}
    >
      <main className="smplfy-nested-decision-rules-page bg-body-tertiary min-vh-100">
        <div className="container-fluid py-4">
          <div className="smplfy-nested-decision-rules-layout mx-auto">
            <aside className="smplfy-nested-decision-rules-selector-column" aria-label="Nested decision rule selector">
              <DecisionRuleSelector
                rules={rules}
                selectedRuleId={selectedRule.id}
                onSelect={setSelectedRuleId}
                onAddChild={addBlankChild}
                onDuplicate={duplicateRule}
                onDelete={deleteRule}
              />
            </aside>

            <section className="smplfy-card card border-0 shadow-sm smplfy-nested-decision-rules-form-card">
              <div className="card-body p-4">
                <form
                  key={selectedRule.id}
                  id="nested-decision-rules-form"
                  className="smplfy-nested-decision-rules-form"
                  aria-label={`${selectedRule.isParent ? selectedRule.label : selectedRule.parameter || 'Untitled child rule'} form`}
                  onChange={() => setIsDirty(true)}
                  onSubmit={handleSubmit}
                  noValidate
                >
                  <FormElement
                    className="smplfy-nested-decision-rules-field-full"
                    type="dropdown"
                    mandatory
                    label="Product"
                    inputProps={{
                      value: selectedRule.product,
                      options: productOptions,
                      disabled: !selectedRule.isParent,
                      onChange: updateSelectedRuleField('product'),
                    }}
                  />

                  <FormElement
                    type="dropdown"
                    mandatory
                    label="Parameter"
                    inputProps={{
                      value: selectedRule.parameter,
                      placeholder: 'Select Parameter',
                      options: parameterOptions,
                      onChange: updateSelectedRuleField('parameter'),
                    }}
                  />

                  <FormElement
                    type="dropdown"
                    mandatory
                    label="MoA"
                    inputProps={{
                      value: selectedRule.moa,
                      placeholder: 'Select MoA',
                      options: moaOptions,
                      onChange: updateSelectedRuleField('moa'),
                    }}
                  />

                  <FormElement
                    type="dropdown"
                    label="Sample Category"
                    inputProps={{
                      placeholder: 'Select Sample Category',
                      options: [],
                    }}
                  />

                  <FormElement
                    label="Cut Off Value"
                    inputProps={{
                      type: 'number',
                      placeholder: 'Numeric Cut Off Value',
                    }}
                  />

                  <FormElement
                    label="Min"
                    inputProps={{ placeholder: 'Numeric Min Value' }}
                  />

                  <FormElement
                    label="Max"
                    inputProps={{ placeholder: 'Numeric Max Value' }}
                  />

                  <FormElement
                    type="textarea"
                    label="If Greater Text"
                    inputProps={{
                      placeholder: 'If Greater text',
                      rows: 3,
                    }}
                  />

                  <FormElement
                    type="textarea"
                    label="If Lesser Text"
                    inputProps={{
                      placeholder: 'If Lesser text',
                      rows: 3,
                    }}
                  />

                  <FormElement
                    label="UoM"
                    inputProps={{ placeholder: 'Unit' }}
                  />

                  <FormElement
                    label="Estimated Time in Days"
                    inputProps={{
                      type: 'number',
                      value: selectedRule.isBlank ? '' : '0',
                      placeholder: 'Estimated Time in days',
                    }}
                  />

                  <FormElement
                    label="Estimated Charges"
                    inputProps={{
                      type: 'number',
                      value: selectedRule.isBlank ? '' : '0',
                      placeholder: 'Estimated Charges(Rs)',
                    }}
                  />

                  <FormElement
                    label="Express Time in Days"
                    inputProps={{
                      type: 'number',
                      value: selectedRule.isBlank ? '' : '0',
                      placeholder: 'Express Time in days',
                    }}
                  />

                  <FormElement
                    label="Express Charges"
                    inputProps={{
                      type: 'number',
                      value: selectedRule.isBlank ? '' : '0',
                      placeholder: 'Express Charges(Rs)',
                    }}
                  />

                  <FormElement
                    label="Min Size"
                    inputProps={{ placeholder: 'Min Size' }}
                  />

                  <FormElement
                    className="smplfy-nested-decision-rules-field-full"
                    type="dropdown"
                    label="Template"
                    inputProps={{
                      value: selectedRule.isBlank ? '' : 'IS 688',
                      placeholder: 'Select Template',
                      options: ['IS 688'],
                    }}
                  />

                  <FormElement
                    type="textarea"
                    label="Result Representation"
                    inputProps={{ rows: 3 }}
                  />

                  <FormElement
                    type="textarea"
                    label="Default Narration"
                    inputProps={{ rows: 3 }}
                  />

                  <FormElement
                    label="Detectable Upper Limit"
                    inputProps={{
                      type: 'number',
                      placeholder: 'Detectable Upper Limit',
                    }}
                  />

                  <FormElement
                    label="Detectable Lower Limit"
                    inputProps={{
                      type: 'number',
                      placeholder: 'Detectable Lower Limit',
                    }}
                  />

                  <FormElement
                    type="textarea"
                    label="Detectable Upper Limit Text"
                    inputProps={{ rows: 3 }}
                  />

                  <FormElement
                    type="textarea"
                    label="Detectable Lower Limit Text"
                    inputProps={{ rows: 3 }}
                  />

                  <RuleCheckbox
                    id="nested-rule-show-detectable-limit-text"
                    label="Show Detectable Limit Text"
                    checked={checkboxes.showDetectableLimitText}
                    onChange={updateCheckbox('showDetectableLimitText')}
                  />

                  <RuleCheckbox
                    id="nested-rule-show-standard-limit-text"
                    label="Show Standard Limit Text"
                    checked={checkboxes.showStandardLimitText}
                    onChange={updateCheckbox('showStandardLimitText')}
                  />

                  <FormElement
                    label="Conformance Limit"
                    inputProps={{
                      type: 'number',
                      placeholder: 'Conformance Limit',
                    }}
                  />

                  <FormElement
                    type="dropdown"
                    label="Associated Instruments"
                    inputProps={{
                      placeholder: 'Select Instruments',
                      options: [],
                    }}
                  />

                  <FormElement
                    label="Discipline"
                    inputProps={{ placeholder: 'Discipline' }}
                  />

                  <FormElement
                    label="Group"
                    inputProps={{ placeholder: 'Group' }}
                  />

                  <RuleCheckbox
                    id="nested-rule-is-active"
                    label="Is Active"
                    checked={checkboxes.isActive}
                    onChange={updateCheckbox('isActive')}
                  />

                  <RuleCheckbox
                    id="nested-rule-is-nabl"
                    label="Is NABL"
                    checked={checkboxes.isNabl}
                    onChange={updateCheckbox('isNabl')}
                  />
                </form>
              </div>
            </section>
          </div>
        </div>
      </main>
    </AppChrome>
  );
}
