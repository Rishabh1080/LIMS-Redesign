/*
 * The worksheet template of a test request, as it appears on Test Request
 * Details (read-only) and on Add Results (editable). Dummy template for the
 * tutorial: one row for the test request's parameter.
 */
import AppIcon from '@proto/components/AppIcon';

const SPEC_BY_PARAMETER = {
  'Total Iron as Fe': '0.0 – 0.3 mg/L',
  'Total Hardness as CaCO3': '0.0 – 200 mg/L',
  'Total Dissolved Solids': '0.0 – 500 mg/L',
  'Total Alkalinity as CaCO3': '0.0 – 200 mg/L',
  'Dissolved Oxygen': '4.0 – 8.0 mg/L',
};

export function templateRowFor(row) {
  const parameter = row?.parameter ?? 'Total Iron as Fe';
  return {
    parameter,
    specification: SPEC_BY_PARAMETER[parameter] ?? '—',
    method: row?.testMethod ?? 'IS:3025 (Part 53) 2024',
  };
}

const formatDate = (value) => {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  return day && month && year ? `${day}/${month}/${year}` : value;
};

function RefreshButton({ label }) {
  return (
    <button type="button" className="sgt-tpl__refresh" aria-label={label} title={label} tabIndex={-1}>
      <AppIcon name="refresh" size={14} stroke={2} />
    </button>
  );
}

export function ResultsTemplate({ row, values, editable = false, invalid = false, onChange }) {
  const template = templateRowFor(row);
  const set = (key) => (event) => onChange?.({ ...values, [key]: event.target.value });

  return (
    <div className="sgt-tpl">
      <div className="sgt-tpl__dates">
        <label className="sgt-tpl__date">
          <span>Start Date:</span>
          {editable ? (
            <input type="date" className="smplfy-form-control form-control" value={values.start ?? ''} onChange={set('start')} />
          ) : (
            <span>{formatDate(values.start)}</span>
          )}
        </label>
        <label className="sgt-tpl__date">
          <span>Analysis End Date:</span>
          {editable ? (
            <input type="date" className="smplfy-form-control form-control" value={values.end ?? ''} onChange={set('end')} />
          ) : (
            <span>{formatDate(values.end)}</span>
          )}
        </label>
      </div>

      <table className="sgt-tpl__table">
        <thead>
          <tr>
            <th scope="col">S.No</th>
            <th scope="col">Parameters</th>
            <th scope="col">Results</th>
            <th scope="col">Specification</th>
            <th scope="col">Test Methods followed</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>
              <span>{template.parameter}</span>
              <RefreshButton label="Refresh parameter from template" />
            </td>
            <td>
              {editable ? (
                <input
                  type="text"
                  inputMode="decimal"
                  data-result=""
                  aria-label="Result"
                  aria-invalid={invalid || undefined}
                  className={`smplfy-form-control form-control${invalid ? ' is-invalid' : ''}`}
                  placeholder="Enter value"
                  value={values.value ?? ''}
                  onChange={set('value')}
                />
              ) : (
                <span data-result-value="">{values.value}</span>
              )}
            </td>
            <td>
              <span>{template.specification}</span>
              <RefreshButton label="Refresh specification from template" />
            </td>
            <td>{template.method}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
