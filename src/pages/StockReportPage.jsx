import { useMemo } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import DataTable from '../components/DataTable';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import { defaultMaterials } from './MaterialsPage';
import './stock-report-page.scss';

function getQuantityValue(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function formatQuantity(value, unit) {
  const resolvedValue = value ?? 0;
  return unit ? `${resolvedValue} ${unit}` : resolvedValue;
}

function groupMaterialsByClassification(materials) {
  return materials.reduce((groups, material) => {
    const classification = material.classification || 'Unclassified';
    const existingGroup = groups.find((group) => group.classification === classification);

    if (existingGroup) {
      existingGroup.materials.push(material);
      return groups;
    }

    groups.push({
      classification,
      materials: [material],
    });
    return groups;
  }, []);
}

function StockReportHeader({ onBack }) {
  return (
    <section className="bg-white border-bottom px-4 py-3">
      <div className="container-fluid px-0">
        <div className="row align-items-center justify-content-between gx-0 gy-3">
          <div className="col-auto d-flex align-items-center gap-3">
            <SecondaryButton
              size="medium"
              leftIcon="chevron-left"
              className="px-0 flex-shrink-0"
              onClick={onBack}
              aria-label="Go back"
            />
            <h1 className="h5 mb-0 fw-semibold text-dark">Stock Report</h1>
          </div>
          <div className="col-auto">
            <PrimaryButton leftIcon="file-text">
              Download pdf
            </PrimaryButton>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function StockReportPage({
  materials = defaultMaterials,
  onBack,
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  sidebarBadgeCounts,
}) {
  const materialGroups = useMemo(() => groupMaterialsByClassification(materials), [materials]);

  return (
    <AppChrome
      activeNav="materials"
      onNavigate={onNavigate}
      breadcrumbs={[
        { key: 'materials', label: 'Materials' },
        { key: 'stock-report', label: 'Stock Report', current: true },
      ]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      sidebarBadgeCounts={sidebarBadgeCounts}
      pageHeader={<StockReportHeader onBack={onBack} />}
    >
      <main className="smplfy-stock-report-page bg-body-tertiary p-4 min-vh-100">
        <div className="smplfy-stock-report-content container-fluid px-0 d-grid gap-4 mx-auto">
          {materialGroups.map((group) => (
            <section key={group.classification} className="d-grid gap-3">
              <h2 className="h6 fw-semibold text-dark mb-0">{group.classification}</h2>
              <DataTable className="smplfy-stock-report-table">
                <colgroup>
                  <col className="smplfy-stock-report-col-name" />
                  <col className="smplfy-stock-report-col-min" />
                  <col className="smplfy-stock-report-col-current" />
                </colgroup>
                <thead>
                  <tr>
                    <th scope="col">Material name</th>
                    <th scope="col">Min quantity</th>
                    <th scope="col">Current quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {group.materials.map((material) => {
                    const isBelowMinimum = getQuantityValue(material.currentQuantity) < getQuantityValue(material.minQuantity);

                    return (
                      <tr key={material.id} className={isBelowMinimum ? 'smplfy-stock-report-low-stock' : ''}>
                        <td>{material.name}</td>
                        <td className="text-nowrap">{formatQuantity(material.minQuantity, material.unit)}</td>
                        <td className="text-nowrap">{formatQuantity(material.currentQuantity, material.unit)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </DataTable>
            </section>
          ))}
        </div>
      </main>
    </AppChrome>
  );
}
