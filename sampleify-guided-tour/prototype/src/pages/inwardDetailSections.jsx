import DataTable from '../components/DataTable';

/*
 * Pieces shared by Inward Details and Sample Details so the two pages cannot
 * drift: the field grid, the inward field list, and the product card (which
 * Sample Details renders as its "Testing details").
 */

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

export function splitDateTime(createdOn) {
  const parts = String(createdOn ?? '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  return { date: parts[0] || '06/03/2026', time: parts[1] || '10:13' };
}

export function FieldValue({ label, value }) {
  return (
    <div className="col p-2">
      {label ? <dt className="text-secondary fw-normal mb-1">{label}</dt> : null}
      {value ? <dd className="fw-medium text-truncate mb-0">{value}</dd> : null}
    </div>
  );
}

export function DetailGrid({ items, columns = 4 }) {
  return (
    <dl className={joinClasses('smplfy-sample-details-fields', 'row', `row-cols-${columns}`, 'g-0', 'mb-0')}>
      {items.map((item, index) => (
        <FieldValue key={`${item.label}-${index}`} label={item.label} value={item.value} />
      ))}
    </dl>
  );
}

export function buildInwardDetailItems(inward) {
  if (!inward) return [];

  return [
    { label: 'Inward ID', value: inward.id },
    { label: 'Sample Receive Date', value: inward.receiveDateLong },
    { label: 'Due Date', value: inward.dueDate },
    { label: 'Customer Name', value: inward.customerName },
    { label: 'Customer Address', value: inward.customerAddress },
    { label: 'Customer Representative Name', value: inward.representativeName },
    { label: 'CR Contact Number', value: inward.contactNumber },
    { label: 'Customer Representative Email ID', value: inward.representativeEmail },
    { label: 'GST Number', value: inward.gstNumber },
    { label: 'Customer Request Letter', value: inward.requestLetter },
    { label: 'Request Received Mode', value: inward.receivedMode },
    { label: 'Sample Registration Date', value: inward.registrationDate },
    { label: 'Customer Reference', value: inward.customerReference },
    { label: 'Received By', value: inward.receivedBy },
    { label: '', value: '' },
    { label: '', value: '' },
  ];
}

export function ParameterTable({ parameters = [] }) {
  return (
    <div className="table-responsive">
      <DataTable responsive={false} className="table-bordered">
        <thead>
          <tr>
            <th scope="col">Sr.</th>
            <th scope="col">Parameter</th>
            <th scope="col">Test Method</th>
            <th scope="col">Size</th>
            <th scope="col">Charges</th>
            <th scope="col">Est. Time</th>
          </tr>
        </thead>
        <tbody>
          {parameters.map((row) => (
            <tr key={`${row.sr}-${row.parameter}`}>
              <td>{row.sr}</td>
              <td>{row.parameter}</td>
              <td>{row.testMethod}</td>
              <td>{row.size}</td>
              <td className="text-end">{row.charges}</td>
              <td>{row.estTime}</td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </div>
  );
}

/*
 * One product. `title` defaults to the product name (Inward Details) but Sample
 * Details overrides it with "Testing details". `action` is the optional header
 * button.
 */
export function ProductCard({ product, title, action = null }) {
  const items = [
    { label: 'Sample ID', value: product.sampleId },
    { label: 'Category', value: product.category },
    { label: 'Product', value: product.name },
    { label: 'Sample Qty.', value: product.qty },
    { label: 'Sample Size', value: product.sampleSize },
    { label: 'Batch', value: product.batch },
    { label: 'Quality', value: product.quality },
    { label: 'Identification', value: product.identification },
    { label: 'Condition', value: product.condition },
    { label: 'Description', value: product.description },
  ];

  return (
    <article className="smplfy-card card overflow-hidden">
      <div className="card-header">
        <div className="smplfy-inward-product-card-header">
          <h3 className="card-title mb-0">{title ?? product.name}</h3>
          {action}
        </div>
      </div>

      <div className="card-body p-0">
        <DetailGrid items={items} columns={3} />
        <div className="px-4 pb-3 pt-2">
          <ParameterTable parameters={product.parameters} />
        </div>
      </div>
    </article>
  );
}
