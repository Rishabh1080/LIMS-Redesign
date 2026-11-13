/*
 * Add Results: the test request's worksheet template, editable. Tutorial copy
 * of the prototype's DatasheetPage with a dummy template (see ResultsTemplate)
 * and the real page's header: Add Results, Calculate, Done.
 */
import { useState } from 'react';
import AppChrome from './TutorialChrome';
import AppIcon from '@proto/components/AppIcon';
import PrimaryButton from '@proto/components/PrimaryButton/PrimaryButton';
import SecondaryButton from '@proto/components/SecondaryButton';
import '@proto/pages/datasheet-page.scss';
import { ResultsTemplate, templateRowFor } from './ResultsTemplate';

function PageHeader({ subtitle, onBack, onDone }) {
  return (
    <section className="d-flex align-items-center justify-content-between gap-3 bg-white border-bottom flex-wrap px-4 py-3">
      <div className="d-flex align-items-center gap-3 min-w-0">
        <SecondaryButton size="medium" className="px-0 flex-shrink-0" aria-label="Go back" onClick={onBack}>
          <AppIcon name="chevron-left" />
        </SecondaryButton>
        <div className="d-flex flex-column min-w-0">
          <h1 className="h5 fw-semibold text-body mb-0">Add Results</h1>
          <span className="text-secondary small text-truncate">{subtitle}</span>
        </div>
      </div>

      <div className="d-flex align-items-center gap-3 flex-wrap">
        <SecondaryButton leftIcon="table" disabled>
          Calculate
        </SecondaryButton>
        <PrimaryButton leftIcon="check" onClick={onDone}>
          Done
        </PrimaryButton>
      </div>
    </section>
  );
}

export default function DatasheetPage({
  sampleId,
  requestId,
  row,
  values: savedValues,
  onBack,
  onDone,
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
}) {
  const [values, setValues] = useState(savedValues ?? {});
  const [invalid, setInvalid] = useState(false);
  const template = templateRowFor(row);

  const handleChange = (next) => {
    setValues(next);
    if (String(next.value ?? '').trim()) setInvalid(false);
  };

  const handleDone = () => {
    if (!String(values.value ?? '').trim()) {
      setInvalid(true);
      return;
    }
    onDone?.(values);
  };

  return (
    <AppChrome
      activeNav="all-samples"
      onNavigate={onNavigate}
      breadcrumbs={[
        { key: 'all-samples', label: 'All inwards' },
        { key: sampleId, label: sampleId },
        { key: 'add-results', label: 'Add Results', current: true },
      ]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      pageHeader={<PageHeader subtitle={`${template.parameter}-${template.method}`} onBack={onBack} onDone={handleDone} />}
    >
      <main className="smplfy-datasheet-page d-flex bg-body-tertiary p-4 min-vh-100">
        <div className="smplfy-card card flex-fill p-4 align-self-start">
          <ResultsTemplate row={row} values={values} editable invalid={invalid} onChange={handleChange} />
          {invalid ? <p className="sgt-tpl-error mt-3" role="alert">Enter a result to continue.</p> : null}
        </div>
      </main>
    </AppChrome>
  );
}
