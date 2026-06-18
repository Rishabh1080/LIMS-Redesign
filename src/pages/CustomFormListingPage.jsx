import AppChrome from '../components/AppChrome/AppChrome';
import DataTable from '../components/DataTable';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import './environment-data-page.scss';

const customFormListings = {
  'daily-check': {
    title: 'Daily Check',
    newButtonLabel: 'New Daily Check',
    rows: [
      {
        id: 'daily-check-001',
        name: 'Daily balance verification',
        createdAt: '12/06/2026, 09:15',
        createdBy: 'Rishabh Gangwar',
      },
      {
        id: 'daily-check-002',
        name: 'Instrument room temperature check',
        createdAt: '12/06/2026, 10:30',
        createdBy: 'Priya Nair',
      },
      {
        id: 'daily-check-003',
        name: 'Glassware cleanliness checklist',
        createdAt: '11/06/2026, 16:20',
        createdBy: 'Deepak Cybit',
      },
    ],
  },
  'quality-objective': {
    title: 'Quality Objective',
    newButtonLabel: 'New Quality Objective',
    rows: [
      {
        id: 'quality-objective-001',
        name: 'Reduce retest turnaround time',
        createdAt: '12/06/2026, 11:45',
        createdBy: 'Rishabh Gangwar',
      },
      {
        id: 'quality-objective-002',
        name: 'Improve calibration compliance',
        createdAt: '10/06/2026, 14:10',
        createdBy: 'Quality Officer',
      },
      {
        id: 'quality-objective-003',
        name: 'Increase on-time report release',
        createdAt: '08/06/2026, 12:05',
        createdBy: 'Lab Manager',
      },
    ],
  },
};

function getTitleFromFormType(formType) {
  return formType
    .replace(/^custom-form-/, '')
    .split('-')
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ');
}

function getGeneratedListing(formType) {
  const title = getTitleFromFormType(formType);

  return {
    title,
    newButtonLabel: `New ${title}`,
    rows: [
      {
        id: `${formType}-001`,
        name: `${title} - Main lab`,
        createdAt: '12/06/2026, 09:30',
        createdBy: 'Rishabh Gangwar',
      },
      {
        id: `${formType}-002`,
        name: `${title} - Quality review`,
        createdAt: '11/06/2026, 15:45',
        createdBy: 'Quality Officer',
      },
      {
        id: `${formType}-003`,
        name: `${title} - Shift handover`,
        createdAt: '10/06/2026, 17:10',
        createdBy: 'Lab Manager',
      },
    ],
  };
}

function CustomFormListingHeader({ title, newButtonLabel }) {
  return (
    <section className="bg-white border-bottom px-4 py-3">
      <div className="container-fluid px-0">
        <div className="row align-items-center justify-content-between gx-0 gy-3">
          <div className="col-auto">
            <h1 className="h5 mb-0 fw-semibold text-dark">{title}</h1>
          </div>

          <div className="col-auto">
            <PrimaryButton leftIcon="plus">
              {newButtonLabel}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function CustomFormListingPage({
  formType = 'daily-check',
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  sidebarBadgeCounts,
}) {
  const listing = customFormListings[formType] ?? getGeneratedListing(formType);

  return (
    <AppChrome
      activeNav={formType}
      onNavigate={onNavigate}
      breadcrumbs={[{ key: formType, label: listing.title, current: true }]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      sidebarBadgeCounts={sidebarBadgeCounts}
      pageHeader={<CustomFormListingHeader title={listing.title} newButtonLabel={listing.newButtonLabel} />}
    >
      <main className="smplfy-environment-data-page bg-body-tertiary p-4 min-vh-100">
        <div className="container-fluid px-0">
          <DataTable>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Created at</th>
                <th scope="col">Created by</th>
                <th scope="col" className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {listing.rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <span className="text-primary fw-semibold">{row.name}</span>
                  </td>
                  <td className="text-nowrap">{row.createdAt}</td>
                  <td className="text-nowrap">{row.createdBy}</td>
                  <td className="text-center">
                    <SecondaryButton size="medium" leftIcon="external-link">
                      View
                    </SecondaryButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        </div>
      </main>
    </AppChrome>
  );
}
