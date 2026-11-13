import { useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import DataTable from '../components/DataTable';
import MultiSelectDropdown from '../components/MultiSelectDropdown';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import StatusPill from '../components/StatusPill';
import { FormElement } from '../components/FormControls';
import './nabl-certificate-edit-page.scss';

const PRODUCT_OPTIONS = ['Boiler Water', 'Cooling Water', 'Drinking Water', 'Effluent', 'Raw Water'];
const MOA_OPTIONS = ['IS 3025', 'APHA 2320', 'APHA 4500', 'IS 10500', 'EPA 200.7'];

// Up to ~2000 rows in production. Seeded with a representative handful for the
// redesign; the table is independently scrollable with a sticky header.
const PARAMETER_SEED = [
  { name: 'Test para 1', sub: 'Test para 1', nabl: false },
  { name: 'a', sub: 'a', nabl: false },
  { name: 'para', sub: 'para', nabl: true },
  { name: 'para', sub: 'para 1', nabl: false },
  { name: 'test para 1', sub: 'test para 1', nabl: true },
  { name: 'Total Hardness', sub: 'as CaCO3', nabl: true },
  { name: 'pH Value', sub: 'at 25°C', nabl: false },
  { name: 'Turbidity', sub: 'NTU', nabl: true },
  { name: 'Total Dissolved Solids', sub: 'TDS mg/L', nabl: true },
  { name: 'Total Alkalinity', sub: 'as CaCO3', nabl: false },
  { name: 'Dissolved Oxygen', sub: 'DO mg/L', nabl: true },
  { name: 'Chloride', sub: 'as Cl', nabl: false },
  { name: 'Sulphate', sub: 'as SO4', nabl: true },
  { name: 'Nitrate', sub: 'as NO3', nabl: false },
  { name: 'Fluoride', sub: 'as F', nabl: true },
  { name: 'Iron', sub: 'as Fe', nabl: true },
  { name: 'Residual Chlorine', sub: 'mg/L', nabl: false },
  { name: 'Conductivity', sub: 'µS/cm', nabl: true },
  { name: 'Calcium', sub: 'as Ca', nabl: false },
  { name: 'Magnesium', sub: 'as Mg', nabl: true },
];

const initialParameters = PARAMETER_SEED.map((item, index) => ({
  id: `p${index + 1}`,
  ...item,
  products: [],
  moas: [],
}));

export default function NablCertificateEditPage({
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  sidebarBadgeCounts,
}) {
  const [validFrom, setValidFrom] = useState('27/11/2025');
  const [validTo, setValidTo] = useState('27/12/2027');
  const [scope, setScope] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [parameters, setParameters] = useState(initialParameters);

  const back = () => onNavigate?.('design-handoff');

  return (
    <AppChrome
      activeNav="design-handoff"
      onNavigate={onNavigate}
      breadcrumbs={[
        { key: 'design-handoff', label: 'Design Handoff' },
        { key: 'nabl-certificate-edit', label: 'Edit NABL Certification', current: true },
      ]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      sidebarBadgeCounts={sidebarBadgeCounts}
      pageHeader={(
        <section className="bg-white border-bottom px-4 py-3">
          <div className="container-fluid px-0">
            <div className="row align-items-center justify-content-between gx-0 gy-3">
              <div className="col-auto d-flex align-items-center gap-3">
                <SecondaryButton
                  size="medium"
                  leftIcon="chevron-left"
                  className="px-0 flex-shrink-0"
                  aria-label="Back"
                  onClick={back}
                />
                <h1 className="h5 mb-0 fw-semibold text-dark">Edit NABL Certification</h1>
              </div>
              <div className="col-auto d-flex align-items-center gap-2">
                <SecondaryButton onClick={back}>Discard changes</SecondaryButton>
                <PrimaryButton leftIcon="save" onClick={back}>Update</PrimaryButton>
              </div>
            </div>
          </div>
        </section>
      )}
    >
      <main className="smplfy-nabl-edit-page bg-body-tertiary p-4 min-vh-100">
        <div className="container-fluid px-0 d-flex flex-column gap-3">
          {/* Card 1 — single row of 4 fields, no section header */}
          <section className="smplfy-card card">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-12 col-lg-3">
                  <FormElement
                    type="date"
                    mandatory
                    label="Valid From"
                    inputProps={{
                      state: 'filled',
                      value: validFrom,
                      onChange: (event) => setValidFrom(event.target.value),
                    }}
                  />
                </div>
                <div className="col-12 col-lg-3">
                  <FormElement
                    type="date"
                    mandatory
                    label="Valid To"
                    inputProps={{
                      state: 'filled',
                      value: validTo,
                      onChange: (event) => setValidTo(event.target.value),
                    }}
                  />
                </div>
                <div className="col-12 col-lg-3">
                  <FormElement
                    type="file"
                    label="NABL Scope"
                    inputProps={{
                      value: scope,
                      placeholder: 'Upload NABL Scope',
                      onChange: (event) => setScope(event.target.value),
                    }}
                  />
                </div>
                <div className="col-12 col-lg-3">
                  <FormElement
                    type="file"
                    label="NABL Certificate"
                    inputProps={{
                      value: certificate,
                      placeholder: 'Upload NABL Certificate',
                      onChange: (event) => setCertificate(event.target.value),
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Card 2 — parameters table, no section header */}
          <section className="smplfy-card card overflow-visible">
            <div>
              <DataTable className="smplfy-nabl-edit-table" responsive={false}>
                <thead>
                  <tr>
                    <th scope="col">Parameter</th>
                    <th scope="col">NABL/Non NABL</th>
                    <th scope="col">Products</th>
                    <th scope="col">MOAs</th>
                  </tr>
                </thead>
                <tbody>
                  {parameters.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <div className="fw-medium text-dark">{row.name}</div>
                        <div className="text-secondary small">{row.sub}</div>
                      </td>
                      <td>
                        {row.nabl ? (
                          <StatusPill color="green" styleType="strong" className="text-white">NABL</StatusPill>
                        ) : (
                          <StatusPill color="gray" styleType="neutral">NON NABL</StatusPill>
                        )}
                      </td>
                      <td>
                        <MultiSelectDropdown
                          value={row.products}
                          options={PRODUCT_OPTIONS}
                          placeholder="Select Products"
                          ariaLabel={`Products for ${row.name}`}
                        />
                      </td>
                      <td>
                        <MultiSelectDropdown
                          value={row.moas}
                          options={MOA_OPTIONS}
                          placeholder="Select MOAs"
                          ariaLabel={`MOAs for ${row.name}`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </DataTable>
            </div>
          </section>
        </div>
      </main>
    </AppChrome>
  );
}
