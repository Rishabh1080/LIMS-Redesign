/*
 * Finalised COA report: tutorial copy of the prototype's page. The container
 * that says "Template content ... shows up in this container" holds a simple
 * certificate instead, headed with the lab the visitor set up.
 */
import { useContext } from 'react';
import AppChrome from './TutorialChrome';
import { TutorialChromeContext } from './TutorialChrome';
import SecondaryButton from '@proto/components/SecondaryButton';
import SplitSecondaryButton from '@proto/components/SplitSecondaryButton';
import MoreActionButton from '@proto/components/MoreActionButton';
import ReportSelector from '@proto/components/ReportSelector';
import '@proto/pages/finalised-report-page.scss';
import { templateRowFor } from './ResultsTemplate';

const pad2 = (value) => String(value).padStart(2, '0');
const day = (date) => `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;
const isoToDay = (value) => {
  const [year, month, d] = String(value ?? '').split('-');
  return year && month && d ? `${d}/${month}/${year}` : day(new Date());
};

function Field({ label, value }) {
  return (
    <div className="sgt-coa__field">
      <span className="sgt-coa__label">{label} :</span>
      <span>{value || ''}</span>
    </div>
  );
}

function Certificate({ labName, inward, row, results }) {
  const details = inward?.details ?? {};
  const template = templateRowFor(row);
  const initials = (labName || 'Lab').split(/\s+/).map((word) => word[0]).join('').slice(0, 2).toUpperCase();
  const today = day(new Date());
  return (
    <article className="sgt-coa" aria-label="Certificate of analysis">
      <header className="sgt-coa__head">
        <span className="sgt-coa__logo" aria-hidden="true">{initials}</span>
        <h2 className="sgt-coa__lab">{labName}</h2>
      </header>
      <div className="sgt-coa__rule" aria-hidden="true" />
      <h3 className="sgt-coa__title">Test Report</h3>
      <div className="sgt-coa__grid">
        <Field label="Report No." value={inward?.id} />
        <Field label="Report Date" value={today} />
        <Field label="Sample received on" value={inward?.card?.createdOn?.split(',')[0]} />
        <Field label="Customer Name" value={details.customerName} />
        <Field label="Address" value={details.customerAddress} />
        <Field label="Product" value={details.products?.[0]?.name} />
        <Field label="Start of Analysis" value={isoToDay(results?.start)} />
        <Field label="End of Analysis" value={isoToDay(results?.end)} />
      </div>
      <p className="sgt-coa__lead">The above sample was analyzed as requested and results obtained are as follows :</p>
      <table className="sgt-coa__table">
        <thead>
          <tr>
            <th>Sr. No.</th>
            <th>Parameter</th>
            <th>Results</th>
            <th>Requirement as per Specification</th>
            <th>Method of Analysis</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>{template.parameter}</td>
            <td>{results?.value ?? ''}</td>
            <td>{template.specification}</td>
            <td>{template.method}</td>
          </tr>
        </tbody>
      </table>
      <p className="sgt-coa__remarks">The sample conforms to the specification for the tested parameter.</p>
      <p className="sgt-coa__end">*** End of the report ***</p>
    </article>
  );
}

export default function FinalisedReportPage({
  sampleId,
  reportId,
  inward,
  row,
  results,
  onBack,
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
}) {
  const { labName } = useContext(TutorialChromeContext);
  const id = reportId ?? sampleId;
  return (
    <AppChrome
      activeNav="all-samples"
      onNavigate={onNavigate}
      breadcrumbs={[
        { key: 'all-samples', label: 'All inwards' },
        { key: sampleId, label: sampleId },
        { key: 'report', label: 'Consolidated Report', current: true },
      ]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      pageHeader={
        <section className="bg-white border-bottom d-flex align-items-center justify-content-between gap-3 flex-wrap px-4 py-3">
          <div className="d-flex align-items-center gap-3">
            <SecondaryButton size="medium" leftIcon="chevron-left" className="px-0 flex-shrink-0" aria-label="Go back" onClick={onBack} />
            <h1 className="h6 mb-0 fw-semibold text-dark">{id}</h1>
            <span className="text-secondary">V1 - {day(new Date())}</span>
          </div>
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <SplitSecondaryButton label="Print" leftIcon="file-text" />
            <SecondaryButton leftIcon="edit">Edit Parameters</SecondaryButton>
            <MoreActionButton />
          </div>
        </section>
      }
    >
      <main className="smplfy-finalised-report-page bg-body-tertiary p-4 min-vh-100">
        <div className="smplfy-finalised-report-grid row g-3 align-items-stretch">
          <aside className="col-12 col-xl-3 d-flex flex-column gap-3">
            <section className="smplfy-card card overflow-hidden">
              <div className="w-100 d-flex align-items-center justify-content-between text-start">
                <div className="d-flex flex-column">
                  <div className="fw-semibold text-dark">Consolidated Reports (1)</div>
                  <div className="text-secondary fw-normal mt-1">Select a report to view</div>
                </div>
              </div>
              <div className="list-group list-group-flush border rounded overflow-hidden">
                <ReportSelector label="Consolidated Report" state="active" hasNabl onClick={() => {}} />
              </div>
            </section>
          </aside>
          <section className="col-12 col-xl-9">
            <div className="smplfy-card card h-100">
              <div className="card-body">
                <Certificate labName={labName} inward={inward} row={row} results={results} />
              </div>
            </div>
          </section>
        </div>
      </main>
    </AppChrome>
  );
}
