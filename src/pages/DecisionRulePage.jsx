import { useMemo, useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import DataTable from '../components/DataTable';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import { DecisionRuleEditForm } from './NestedDecisionRulesTwoPage';
import './decision-rule-page.scss';

const defaultCheckboxes = {
  showDetectableLimitText: false,
  showStandardLimitText: false,
  isActive: true,
  isNabl: false,
};

const ruleDefaults = {
  sampleCategory: '',
  cutOffValue: '0',
  ifGreaterText: '',
  ifLesserText: '',
  min: '',
  max: '',
  uom: '',
  estimatedTime: '0',
  estimatedCharges: '0',
  expressTime: '0',
  expressCharges: '0',
  minSize: '',
  template: '',
  resultRepresentation: '',
  defaultNarration: '',
  detectableUpperLimit: '',
  detectableLowerLimit: '',
  detectableUpperLimitText: '',
  detectableLowerLimitText: '',
  conformanceLimit: '',
  associatedInstruments: '',
  discipline: '',
  group: '',
  createdAt: '27/05/2026, 12:03:53',
  updatedAt: '27/05/2026, 12:03:53',
  ...defaultCheckboxes,
};

const initialRules = [
  {
    ...ruleDefaults,
    id: 'decision-rule-01',
    product: 'Finished Fabric',
    parameter: 'Colour Fastness to Organic solvents',
    moa: 'IS 688:1988',
    template: 'IS 688',
    children: [
      {
        ...ruleDefaults,
        id: 'decision-rule-01-child-01',
        parameter: 'Quantitative chemical analysis of mixtures',
        moa: 'IS 11870:1986',
        template: 'IS 688',
      },
      {
        ...ruleDefaults,
        id: 'decision-rule-01-child-02',
        parameter: 'Quantitative chemical analysis for Overall composition of carpet',
        moa: 'IS 9889:1988',
        template: 'IS 688',
      },
      {
        ...ruleDefaults,
        id: 'decision-rule-01-child-03',
        parameter: 'Determination of wool content of woollen textile material',
        moa: 'IS 3421',
        template: 'IS 688',
      },
    ],
  },
  {
    ...ruleDefaults,
    id: 'decision-rule-02',
    product: 'Dye Powders',
    parameter: 'pH Determination',
    moa: 'AATCC 20 A : 2018',
    cutOffValue: '2',
    ifGreaterText: 'High',
    ifLesserText: 'Low',
    min: '1',
    max: '5',
    template: 'AATCC 20A:2018',
    children: [
      {
        ...ruleDefaults,
        id: 'decision-rule-02-child-01',
        parameter: 'Colour fastness to rubbing (Dry & Wet)',
        moa: 'IS 9889:1988',
        min: '1',
        max: '5',
        template: 'AATCC 20A:2018',
      },
      {
        ...ruleDefaults,
        id: 'decision-rule-02-child-02',
        parameter: 'Colour fastness to rubbing (Organic Solvent)',
        moa: 'IS ISO 105 D02:2016',
        min: '1',
        max: '5',
        template: 'AATCC 20A:2018',
      },
    ],
  },
  {
    ...ruleDefaults,
    id: 'decision-rule-03',
    product: 'Carpets & Rugs',
    parameter: 'Determination of Pile Thickness',
    moa: 'IS 5884:2020',
    template: 'Pile Thickness',
    children: [
      {
        ...ruleDefaults,
        id: 'decision-rule-03-child-01',
        parameter: 'Determine the level of pilling and fuzzing to shredding particularly with 100 % pile carpets.',
        moa: 'IS 6637: 1992 (RA 2018)',
        template: 'Pile Thickness',
      },
    ],
  },
  {
    ...ruleDefaults,
    id: 'decision-rule-04',
    product: 'Yarns & Chords',
    parameter: 'Quantitative chemical analysis of mixtures',
    moa: 'IS 667 : 1981',
    template: 'IS 667',
    children: [
      {
        ...ruleDefaults,
        id: 'decision-rule-04-child-01',
        parameter: 'yarn',
        moa: 'IS 9068: 1979',
        template: 'IS 667',
      },
    ],
  },
  {
    ...ruleDefaults,
    id: 'decision-rule-05',
    product: 'Tops & Yarns',
    parameter: 'Yarn Count (Jute Yarn)',
    moa: 'IS 570 : 2025',
    min: '4',
    max: '1000',
    template: 'JUTE COUNT',
    children: [
      {
        ...ruleDefaults,
        id: 'decision-rule-05-child-01',
        parameter: 'Span Length of Cotton Length',
        moa: 'IS 11870:1986',
        min: '4',
        max: '1000',
        template: 'JUTE COUNT',
      },
    ],
  },
  {
    ...ruleDefaults,
    id: 'decision-rule-06',
    product: 'Fibres',
    parameter: 'Yarn Count (Jute Yarn)',
    moa: 'IS 570 : 2025',
    min: '4',
    max: '1000',
    template: 'JUTE COUNT',
    children: [],
  },
];

const detailRows = [
  ['Product', 'product'],
  ['Parameter', 'parameter'],
  ['Sample Category', 'sampleCategory'],
  ['MoA', 'moa'],
  ['Cut Off Value', 'cutOffValue'],
  ['If Greater Text', 'ifGreaterText'],
  ['If Lesser Text', 'ifLesserText'],
  ['Min', 'min'],
  ['Max', 'max'],
  ['Template', 'template'],
  ['Estimated Time in Days', 'estimatedTime'],
  ['Estimated Charges', 'estimatedCharges'],
  ['Express Time in Days', 'expressTime'],
  ['Express Charges', 'expressCharges'],
  ['Created At', 'createdAt'],
  ['Updated At', 'updatedAt'],
];

function getFullRule(parent, child = null) {
  return child ? { ...child, product: parent.product } : parent;
}

function displayValue(value) {
  return value === undefined || value === null || value === '' ? '-' : value;
}

function DecisionRuleHeader({ mode, isDirty, onBack, onCreate, onEdit }) {
  const title = mode === 'list'
    ? 'Decision Rules'
    : mode === 'view'
      ? 'Decision Rule Details'
      : 'Edit Decision Rule';

  return (
    <section className="smplfy-decision-rule-header bg-white border-bottom px-4 py-3">
      <div className="container-fluid px-0 d-flex align-items-center justify-content-between gap-3">
        <div className="d-flex align-items-center gap-3 min-w-0">
          {mode !== 'list' ? (
            <SecondaryButton
              size="medium"
              leftIcon="chevron-left"
              className="px-0 flex-shrink-0"
              aria-label="Go back"
              onClick={onBack}
            />
          ) : null}
          <h1 className="h5 fw-semibold text-dark mb-0 text-truncate">{title}</h1>
        </div>

        {mode === 'list' ? (
          <div className="d-flex flex-wrap align-items-center justify-content-end gap-2">
            <PrimaryButton leftIcon="all-samples">Bulk Update</PrimaryButton>
            <SecondaryButton tone="success" leftIcon="arrow-up-right">Bulk Upload</SecondaryButton>
            <PrimaryButton leftIcon="plus" onClick={onCreate}>New Decision Rule</PrimaryButton>
          </div>
        ) : null}
        {mode === 'view' ? (
          <PrimaryButton leftIcon="edit" onClick={onEdit}>Edit</PrimaryButton>
        ) : null}
        {mode === 'edit' ? (
          <PrimaryButton
            type="submit"
            form="nested-decision-rules-two-child-form"
            leftIcon="save"
            disabled={!isDirty}
          >
            Update
          </PrimaryButton>
        ) : null}
      </div>
    </section>
  );
}

function RuleActions({ onDelete, onEdit, onView }) {
  return (
    <div className="smplfy-decision-rule-actions d-flex align-items-center gap-2" onClick={(event) => event.stopPropagation()}>
      <SecondaryButton size="small" leftIcon="eye" onClick={onView}>View</SecondaryButton>
      <SecondaryButton size="small" leftIcon="edit" onClick={onEdit}>Edit</SecondaryButton>
      <PrimaryButton size="small" styleVariant="destructive" leftIcon="trash" onClick={onDelete}>Delete</PrimaryButton>
    </div>
  );
}

function RuleCells({ isChild = false, parent, rule, onDelete, onEdit, onView }) {
  const fullRule = getFullRule(parent, isChild ? rule : null);

  return (
    <>
      <div className="smplfy-decision-rule-cell smplfy-decision-rule-product" data-label="Product">
        {isChild ? <span className="smplfy-decision-rule-child-indent" aria-hidden="true" /> : null}
        <span className={isChild ? 'text-secondary' : 'fw-semibold text-primary'}>{fullRule.product}</span>
      </div>
      <div className="smplfy-decision-rule-cell" data-label="Parameter">{displayValue(fullRule.parameter)}</div>
      <div className="smplfy-decision-rule-cell" data-label="Sample Category">{displayValue(fullRule.sampleCategory)}</div>
      <div className="smplfy-decision-rule-cell" data-label="MoA">{displayValue(fullRule.moa)}</div>
      <div className="smplfy-decision-rule-cell" data-label="Cut Off">{displayValue(fullRule.cutOffValue)}</div>
      <div className="smplfy-decision-rule-cell" data-label="Min">{displayValue(fullRule.min)}</div>
      <div className="smplfy-decision-rule-cell" data-label="Max">{displayValue(fullRule.max)}</div>
      <div className="smplfy-decision-rule-cell" data-label="Template">{displayValue(fullRule.template)}</div>
      <div className="smplfy-decision-rule-cell smplfy-decision-rule-action-cell" data-label="Actions">
        <RuleActions onDelete={onDelete} onEdit={onEdit} onView={onView} />
      </div>
    </>
  );
}

function DecisionRuleCard({ expanded, parent, onDelete, onDeleteChild, onEdit, onEditChild, onToggle, onView, onViewChild }) {
  return (
    <article className={`smplfy-card card smplfy-decision-rule-card ${expanded ? 'is-expanded' : ''}`}>
      <div
        className="smplfy-decision-rule-grid smplfy-decision-rule-parent-row"
        onClick={onToggle}
      >
        <SecondaryButton
          size="small"
          leftIcon={expanded ? 'chevron-down' : 'chevron-right'}
          className="smplfy-decision-rule-expand-button px-0"
          aria-label={`${expanded ? 'Collapse' : 'Expand'} child rules for ${parent.product}`}
          aria-expanded={expanded}
          onClick={(event) => {
            event.stopPropagation();
            onToggle();
          }}
        />
        <RuleCells
          parent={parent}
          rule={parent}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>

      {expanded ? (
        <div className="smplfy-decision-rule-children" aria-label={`Child decision rules for ${parent.product}`}>
          {parent.children.length ? parent.children.map((child) => (
            <div key={child.id} className="smplfy-decision-rule-grid smplfy-decision-rule-child-row">
              <span className="smplfy-decision-rule-expand-icon" aria-hidden="true" />
              <RuleCells
                isChild
                parent={parent}
                rule={child}
                onView={() => onViewChild(child)}
                onEdit={() => onEditChild(child)}
                onDelete={() => onDeleteChild(child.id)}
              />
            </div>
          )) : (
            <div className="smplfy-decision-rule-empty text-secondary">No child decision rules</div>
          )}
        </div>
      ) : null}
    </article>
  );
}

function DecisionRuleListing({ expandedIds, onCreate, onDelete, onDeleteChild, onEdit, onEditChild, onToggle, onView, onViewChild, rules }) {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const filteredRules = useMemo(() => {
    if (!normalizedQuery) return rules;

    return rules.filter((rule) => [rule.product, rule.parameter, rule.moa]
      .some((value) => String(value).toLowerCase().includes(normalizedQuery))
      || rule.children.some((child) => [child.parameter, child.moa]
        .some((value) => String(value).toLowerCase().includes(normalizedQuery))));
  }, [normalizedQuery, rules]);

  return (
    <main className="smplfy-decision-rule-page bg-body-tertiary p-4 min-vh-100">
        <div className="container-fluid px-0 d-flex flex-column gap-4">
          <div className="smplfy-decision-rule-toolbar d-flex align-items-center gap-3">
            <div className="smplfy-decision-rule-search input-group flex-nowrap bg-white border rounded overflow-hidden">
              <span className="input-group-text text-secondary bg-white border-0">
                <AppIcon name="search" />
              </span>
              <input
                className="smplfy-form-control form-control border-0"
                type="search"
                value={query}
                placeholder="Search..."
                aria-label="Search decision rules"
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <SecondaryButton leftIcon="filter">Filters</SecondaryButton>
          </div>

          <div className="smplfy-decision-rule-table-shell">
            <div className="smplfy-decision-rule-table-content">
              <div className="smplfy-decision-rule-grid smplfy-decision-rule-legend" aria-hidden="true">
                <span className="smplfy-decision-rule-expand-icon" />
                <span>Product</span>
                <span>Parameter</span>
                <span>Sample Category</span>
                <span>MoA</span>
                <span>Cut Off</span>
                <span>Min</span>
                <span>Max</span>
                <span>Template</span>
                <span>Actions</span>
              </div>

              <div className="smplfy-decision-rule-list">
                {filteredRules.map((parent) => (
                  <DecisionRuleCard
                    key={parent.id}
                    parent={parent}
                    expanded={expandedIds.includes(parent.id)}
                    onToggle={() => onToggle(parent.id)}
                    onView={() => onView(parent)}
                    onEdit={() => onEdit(parent)}
                    onDelete={() => onDelete(parent.id)}
                    onViewChild={(child) => onViewChild(parent, child)}
                    onEditChild={(child) => onEditChild(parent, child)}
                    onDeleteChild={(childId) => onDeleteChild(parent.id, childId)}
                  />
                ))}
                {!filteredRules.length ? (
                  <div className="smplfy-card card p-4 text-center text-secondary">No decision rules found.</div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
    </main>
  );
}

function DecisionRuleDetails({ isChild, onCreateChild, onDeleteChild, onEditChild, onViewChild, parent, rule }) {
  const fullRule = getFullRule(parent, isChild ? rule : null);

  return (
    <main className="smplfy-decision-rule-page bg-body-tertiary p-4 min-vh-100">
      <div className="container-fluid px-0 d-flex flex-column gap-4">
        <section className="smplfy-card card overflow-hidden smplfy-decision-rule-view-card">
          <DataTable responsive={false} className="table-bordered smplfy-decision-rule-detail-table">
            <tbody>
              {detailRows.map(([label, key]) => (
                <tr key={key}>
                  <th scope="row">{label}</th>
                  <td>{displayValue(fullRule[key])}</td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        </section>

        {!isChild ? (
          <section className="smplfy-card card overflow-hidden smplfy-decision-rule-view-card">
            <div className="card-header bg-white border-bottom px-4 py-3 d-flex align-items-center justify-content-between gap-3">
              <div className="min-w-0">
                <h2 className="h6 fw-semibold text-dark mb-1">Child Decision Rules</h2>
                <p className="small text-secondary mb-0">Rules nested under this primary decision rule</p>
              </div>
              <PrimaryButton
                size="medium"
                leftIcon="plus"
                className="flex-shrink-0"
                onClick={() => onCreateChild(parent)}
              >
                Add New
              </PrimaryButton>
            </div>
            <DataTable stickyActionColumn>
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>MoA</th>
                  <th>Min</th>
                  <th>Max</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {parent.children.map((child) => (
                  <tr key={child.id}>
                    <td>{displayValue(child.parameter)}</td>
                    <td>{displayValue(child.moa)}</td>
                    <td>{displayValue(child.min)}</td>
                    <td>{displayValue(child.max)}</td>
                    <td>
                      <RuleActions
                        onView={() => onViewChild(parent, child)}
                        onEdit={() => onEditChild(parent, child)}
                        onDelete={() => onDeleteChild(parent.id, child.id)}
                      />
                    </td>
                  </tr>
                ))}
                {!parent.children.length ? (
                  <tr><td colSpan="5" className="text-center text-secondary py-4">No child decision rules</td></tr>
                ) : null}
              </tbody>
            </DataTable>
          </section>
        ) : null}
      </div>
    </main>
  );
}

export default function DecisionRulePage({
  onBack,
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  sidebarBadgeCounts,
}) {
  const [rules, setRules] = useState(initialRules);
  const [mode, setMode] = useState('list');
  const [returnMode, setReturnMode] = useState('list');
  const [expandedIds, setExpandedIds] = useState([initialRules[0].id]);
  const [selection, setSelection] = useState(null);
  const [editingDraft, setEditingDraft] = useState(null);
  const [editingCheckboxes, setEditingCheckboxes] = useState(defaultCheckboxes);
  const [isDirty, setIsDirty] = useState(false);

  const selectedParent = selection
    ? rules.find((rule) => rule.id === selection.parentId)
    : null;
  const selectedRule = selectedParent && selection?.childId
    ? selectedParent.children.find((child) => child.id === selection.childId)
    : selectedParent;
  const isSelectedChild = Boolean(selection?.childId);

  const openView = (parent, child = null) => {
    setSelection({ parentId: parent.id, childId: child?.id ?? null });
    setMode('view');
  };

  const openEdit = (parent, child = null, sourceMode = 'list') => {
    const rule = getFullRule(parent, child);
    setSelection({ parentId: parent.id, childId: child?.id ?? null });
    setEditingDraft({ ...rule });
    setEditingCheckboxes({
      showDetectableLimitText: Boolean(rule.showDetectableLimitText),
      showStandardLimitText: Boolean(rule.showStandardLimitText),
      isActive: Boolean(rule.isActive),
      isNabl: Boolean(rule.isNabl),
    });
    setReturnMode(sourceMode);
    setIsDirty(false);
    setMode('edit');
  };

  const createRule = () => {
    const id = `decision-rule-${Date.now()}`;
    const blankRule = {
      ...ruleDefaults,
      id,
      product: '',
      parameter: '',
      moa: '',
      children: [],
    };
    setRules((current) => [blankRule, ...current]);
    setSelection({ parentId: id, childId: null });
    setEditingDraft({ ...blankRule });
    setEditingCheckboxes(defaultCheckboxes);
    setReturnMode('list');
    setIsDirty(true);
    setMode('edit');
  };

  const createChildRule = (parent) => {
    const blankChild = {
      ...ruleDefaults,
      id: `${parent.id}-child-${Date.now()}`,
      parameter: '',
      moa: '',
      template: parent.template,
    };

    openEdit(parent, blankChild, 'view');
    setIsDirty(true);
  };

  const deleteParent = (parentId) => {
    setRules((current) => current.filter((rule) => rule.id !== parentId));
    if (selection?.parentId === parentId) {
      setSelection(null);
      setMode('list');
    }
  };

  const deleteChild = (parentId, childId) => {
    setRules((current) => current.map((rule) => (
      rule.id === parentId
        ? { ...rule, children: rule.children.filter((child) => child.id !== childId) }
        : rule
    )));
    if (selection?.childId === childId) {
      setSelection({ parentId, childId: null });
      setMode('view');
    }
  };

  const updateEditingField = (field, value) => {
    setEditingDraft((current) => ({ ...current, [field]: value }));
    setIsDirty(true);
  };

  const updateEditingCheckbox = (field, checked) => {
    setEditingCheckboxes((current) => ({ ...current, [field]: checked }));
    setIsDirty(true);
  };

  const saveEdit = (event) => {
    event.preventDefault();
    const savedRule = { ...editingDraft, ...editingCheckboxes, updatedAt: '12/08/2026, 16:11:36' };

    setRules((current) => current.map((parent) => {
      if (parent.id !== selection.parentId) return parent;
      if (!selection.childId) return { ...parent, ...savedRule, children: parent.children };

      const childExists = parent.children.some((child) => child.id === selection.childId);
      return {
        ...parent,
        children: childExists
          ? parent.children.map((child) => (
              child.id === selection.childId ? { ...child, ...savedRule, product: undefined } : child
            ))
          : [...parent.children, { ...savedRule, product: undefined }],
      };
    }));
    setEditingDraft(savedRule);
    setIsDirty(false);
    setMode(returnMode);
  };

  const pageTitle = mode === 'list'
    ? 'Decision Rules'
    : mode === 'view'
      ? 'Decision Rule Details'
      : 'Edit Decision Rule';
  const breadcrumbs = [
    { key: 'design-handoff', label: 'Design Handoff' },
    { key: 'decision-rule', label: 'Decision rule', ...(mode === 'list' ? { current: true } : {}) },
    ...(mode === 'list' ? [] : [{ key: mode, label: pageTitle, current: true }]),
  ];

  return (
    <AppChrome
      activeNav="design-handoff"
      onNavigate={onNavigate}
      breadcrumbs={breadcrumbs}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      sidebarBadgeCounts={sidebarBadgeCounts}
      pageHeader={(
        <DecisionRuleHeader
          mode={mode}
          isDirty={isDirty}
          onBack={() => {
            if (mode === 'edit' && returnMode === 'view') {
              setMode('view');
            } else if (mode === 'list') {
              onBack?.();
            } else {
              setMode('list');
              setSelection(null);
            }
          }}
          onCreate={createRule}
          onEdit={() => selectedParent && openEdit(selectedParent, isSelectedChild ? selectedRule : null, 'view')}
        />
      )}
    >
      {mode === 'list' ? (
        <DecisionRuleListing
          rules={rules}
          expandedIds={expandedIds}
          onCreate={createRule}
          onToggle={(parentId) => setExpandedIds((current) => (
            current.includes(parentId)
              ? current.filter((id) => id !== parentId)
              : [...current, parentId]
          ))}
          onView={(parent) => openView(parent)}
          onEdit={(parent) => openEdit(parent)}
          onDelete={deleteParent}
          onViewChild={(parent, child) => openView(parent, child)}
          onEditChild={(parent, child) => openEdit(parent, child)}
          onDeleteChild={deleteChild}
        />
      ) : null}

      {mode === 'view' && selectedParent && selectedRule ? (
        <DecisionRuleDetails
          parent={selectedParent}
          rule={selectedRule}
          isChild={isSelectedChild}
          onCreateChild={createChildRule}
          onViewChild={openView}
          onEditChild={(parent, child) => openEdit(parent, child, 'view')}
          onDeleteChild={deleteChild}
        />
      ) : null}

      {mode === 'edit' && editingDraft ? (
        <DecisionRuleEditForm
          rule={editingDraft}
          productDisabled={isSelectedChild}
          checkboxes={editingCheckboxes}
          onChange={updateEditingField}
          onCheckboxChange={updateEditingCheckbox}
          onSubmit={saveEdit}
        />
      ) : null}
    </AppChrome>
  );
}
