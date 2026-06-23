import { useMemo, useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import DataTable from '../components/DataTable';
import { FormElement } from '../components/FormControls';
import Modal from '../components/Modal/Modal';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import './environment-data-page.scss';

const dailyCheckForms = [
  {
    id: 'environmental-check',
    name: 'Environmental check',
  },
  {
    id: 'housekeeping-record',
    name: 'Housekeeping record',
  },
  {
    id: 'weighing-balance-check',
    name: 'Weighing balance check',
  },
];

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
  'supplier-management': {
    title: 'Supplier Management',
    newButtonLabel: 'New Supplier',
    entryFormId: 'supplier-management',
    rows: [],
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

function getDailyCheckFormFromRoute(formType) {
  return dailyCheckForms.find((form) => `custom-form-${form.id}` === formType) ?? null;
}

function toTitleCase(value) {
  return String(value ?? '')
    .split(' ')
    .map((word) => (word ? `${word.charAt(0).toUpperCase()}${word.slice(1)}` : word))
    .join(' ');
}

function CustomFormListingHeader({ title, newButtonLabel, onBack, onNewEntry }) {
  return (
    <section className="bg-white border-bottom px-4 py-3">
      <div className="container-fluid px-0">
        <div className="row align-items-center justify-content-between gx-0 gy-3">
          <div className="col-auto d-flex align-items-center gap-3">
            {onBack ? (
              <SecondaryButton
                size="medium"
                leftIcon="chevron-left"
                className="px-0 flex-shrink-0"
                aria-label="Go back"
                onClick={onBack}
              />
            ) : null}
            <h1 className="h5 mb-0 fw-semibold text-dark">{title}</h1>
          </div>

          {newButtonLabel ? (
            <div className="col-auto">
              <PrimaryButton leftIcon="plus" onClick={onNewEntry}>
                {newButtonLabel}
              </PrimaryButton>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function NewCustomFormEntryModal({
  open,
  formName,
  value,
  error,
  onChange,
  onCancel,
  onSubmit,
}) {
  return (
    <Modal
      open={open}
      title={formName ? `New ${formName}` : 'New Entry'}
      titleId="new-custom-form-entry-modal-title"
      titleIcon="plus"
      onClose={onCancel}
      size="md"
      actions={
        <>
          <SecondaryButton leftIcon="close" size="large" onClick={onCancel}>
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" form="new-custom-form-entry-form">
            Create
          </PrimaryButton>
        </>
      }
    >
      <form
        id="new-custom-form-entry-form"
        className="d-flex flex-column gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <FormElement
          type="text"
          mandatory
          label="Name"
          message={error}
          messageTone="error"
          inputProps={{
            value,
            placeholder: 'Enter name',
            onChange: (event) => onChange(event.target.value),
          }}
        />
      </form>
    </Modal>
  );
}

function CustomFormGroupToolbar({
  searchInputValue,
  appliedSearchValue,
  resultCount,
  onSearchInputChange,
  onSearchSubmit,
}) {
  const trimmedSearchValue = appliedSearchValue.trim();
  const resultLabel = trimmedSearchValue
    ? `${resultCount} ${resultCount === 1 ? 'result' : 'results'} found for "${trimmedSearchValue}"`
    : `Listing ${resultCount} ${resultCount === 1 ? 'item' : 'items'}`;

  return (
    <section className="d-flex flex-column gap-4 py-4">
      <form
        className="row align-items-end gx-3 gy-3"
        onSubmit={(event) => {
          event.preventDefault();
          onSearchSubmit();
        }}
      >
        <div className="col-12 col-lg-5">
          <div className="input-group flex-nowrap bg-white border rounded overflow-hidden">
            <span className="input-group-text text-secondary bg-white">
              <AppIcon name="search" />
            </span>
            <input
              className="smplfy-form-control form-control"
              type="search"
              value={searchInputValue}
              placeholder="Search daily checks"
              onChange={(event) => onSearchInputChange(event.target.value)}
            />
            <button type="submit" className="smplfy-btn btn btn-primary" aria-label="Search daily checks">
              <AppIcon name="chevron-right" />
            </button>
          </div>
        </div>
      </form>

      <div className="small text-secondary fw-medium">{resultLabel}</div>
    </section>
  );
}

export default function CustomFormListingPage({
  formType = 'daily-check',
  entriesByFormId = {},
  onCreateEntry,
  onNavigate,
  onBack,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  sidebarBadgeCounts,
}) {
  const isDailyCheckGroup = formType === 'daily-check';
  const dailyCheckForm = getDailyCheckFormFromRoute(formType);
  const [searchInputValue, setSearchInputValue] = useState('');
  const [appliedSearchValue, setAppliedSearchValue] = useState('');
  const [entryModalFormId, setEntryModalFormId] = useState(null);
  const [entryDraftName, setEntryDraftName] = useState('');
  const [entryDraftError, setEntryDraftError] = useState('');
  const listing = customFormListings[formType] ?? getGeneratedListing(formType);
  const listingEntryFormId = listing.entryFormId ?? null;
  const dailyCheckFormTitle = dailyCheckForm ? toTitleCase(dailyCheckForm.name) : '';
  const dailyCheckEntryRows = dailyCheckForm ? entriesByFormId[dailyCheckForm.id] ?? [] : [];
  const listingRows = listingEntryFormId ? entriesByFormId[listingEntryFormId] ?? [] : listing.rows;
  const groupRows = useMemo(() => {
    const normalizedSearchValue = appliedSearchValue.trim().toLowerCase();

    return dailyCheckForms
      .map((row) => ({
        ...row,
        entryCount: entriesByFormId[row.id]?.length ?? 0,
      }))
      .filter((row) => !normalizedSearchValue || row.name.toLowerCase().includes(normalizedSearchValue));
  }, [appliedSearchValue, entriesByFormId]);
  const pageTitle = isDailyCheckGroup ? 'Daily Checks' : dailyCheckFormTitle || listing.title;
  const breadcrumbs = dailyCheckForm
    ? [
        { key: 'daily-check', label: 'Daily Checks' },
        { key: formType, label: dailyCheckFormTitle, current: true },
      ]
    : [{ key: formType, label: pageTitle, current: true }];
  const activeEntryForm = entryModalFormId
    ? dailyCheckForms.find((form) => form.id === entryModalFormId)
      ?? (listingEntryFormId === entryModalFormId ? { name: listing.title } : null)
    : null;
  const activeEntryFormTitle = activeEntryForm ? toTitleCase(activeEntryForm.name) : '';
  const openEntryModal = (formId) => {
    setEntryModalFormId(formId);
    setEntryDraftName('');
    setEntryDraftError('');
  };
  const closeEntryModal = () => {
    setEntryModalFormId(null);
    setEntryDraftName('');
    setEntryDraftError('');
  };
  const createEntry = () => {
    const trimmedName = entryDraftName.trim();

    if (!trimmedName) {
      setEntryDraftError('Name is required.');
      return;
    }

    if (!entryModalFormId) {
      return;
    }

    onCreateEntry?.(entryModalFormId, { name: trimmedName });
    closeEntryModal();
  };

  return (
    <AppChrome
      activeNav={dailyCheckForm ? 'daily-check' : formType}
      onNavigate={onNavigate}
      breadcrumbs={breadcrumbs}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      sidebarBadgeCounts={sidebarBadgeCounts}
      pageHeader={
        <CustomFormListingHeader
          title={pageTitle}
          newButtonLabel={isDailyCheckGroup ? null : dailyCheckForm ? `New ${dailyCheckFormTitle}` : listing.newButtonLabel}
          onBack={dailyCheckForm ? onBack : null}
          onNewEntry={
            dailyCheckForm
              ? () => openEntryModal(dailyCheckForm.id)
              : listingEntryFormId
                ? () => openEntryModal(listingEntryFormId)
                : undefined
          }
        />
      }
    >
      <main className="smplfy-environment-data-page bg-body-tertiary p-4 min-vh-100">
        <div className="container-fluid px-0">
          {isDailyCheckGroup ? (
            <>
              <CustomFormGroupToolbar
                searchInputValue={searchInputValue}
                appliedSearchValue={appliedSearchValue}
                resultCount={groupRows.length}
                onSearchInputChange={setSearchInputValue}
                onSearchSubmit={() => setAppliedSearchValue(searchInputValue.trim())}
              />

              <DataTable>
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Entry count</th>
                    <th scope="col" className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {groupRows.length ? (
                    groupRows.map((row) => (
                      <tr key={row.id}>
                        <td>
                          <button
                            type="button"
                            className="btn btn-link p-0 text-primary fw-semibold text-decoration-none fs-6"
                            onClick={() => onNavigate?.(`custom-form-${row.id}`)}
                          >
                            {row.name}
                          </button>
                        </td>
                        <td className="text-nowrap">{row.entryCount}</td>
                        <td className="text-center">
                          <div className="d-inline-flex align-items-center justify-content-center gap-2">
                            <SecondaryButton
                              size="medium"
                              leftIcon="external-link"
                              onClick={() => onNavigate?.(`custom-form-${row.id}`)}
                            >
                              View
                            </SecondaryButton>
                            <PrimaryButton
                              size="medium"
                              leftIcon="plus"
                              onClick={() => openEntryModal(row.id)}
                            >
                              New Entry
                            </PrimaryButton>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-center text-secondary py-4">
                        No custom forms found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </DataTable>
            </>
          ) : (
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
                {(dailyCheckForm ? dailyCheckEntryRows : listingRows).map((row) => (
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
          )}
        </div>
      </main>
      <NewCustomFormEntryModal
        open={Boolean(entryModalFormId)}
        formName={activeEntryFormTitle}
        value={entryDraftName}
        error={entryDraftError}
        onChange={(value) => {
          setEntryDraftName(value);
          setEntryDraftError('');
        }}
        onCancel={closeEntryModal}
        onSubmit={createEntry}
      />
    </AppChrome>
  );
}
