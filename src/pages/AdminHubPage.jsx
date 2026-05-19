import { useEffect, useMemo, useRef, useState } from 'react';
import AppIcon from '../components/AppIcon';
import LinkItem from '../components/LinkItem';
import SearchResult from '../components/SearchResult';
import SecondaryButton from '../components/SecondaryButton';
import './admin-hub-page.scss';

const adminHubSections = [
  {
    title: 'Modules',
    icon: 'admin-modules',
    links: ['Feedback', 'Document Category', 'Test Plans Management', 'Training Schedule'],
  },
  {
    title: 'Personnel & Hierarchy',
    icon: 'admin-personnel',
    links: ['Lab Management', 'User Management', 'Role Management'],
  },
  {
    title: 'Master Data',
    icon: 'master-data',
    links: [
      'Customer Management',
      'Vendor Management',
      'Service Agreements',
      'Category Management',
      'Discipline',
      'Product Management',
      'Parameter Management',
      'MoA Management',
      'UoM Management',
      'Decision Rule Management',
      'NABL Certificates',
    ],
  },
  {
    title: 'System Settings',
    icon: 'system-settings',
    links: [
      'Organization Settings',
      'Custom Css',
      'Workflow Management',
      'Template Management',
      'Header Management',
      'Footer Management',
      'Watermark Report',
      'Instrument Files',
    ],
  },
  {
    title: 'Configurations',
    icon: 'admin-configurations',
    links: [
      'Dashboard Management',
      'Email Management',
      'Custom Fields',
      'Tag Master Management',
      'Checklists Management',
      'Data Master',
      'Custom Forms',
    ],
  },
  {
    title: 'ELN Management',
    icon: 'admin-eln',
    links: [
      'Constants Master',
      'Expenditure Master',
      'Unit Management',
      'Sample Category',
      'Stage Management',
      'Critical Spec Master',
      'Rationale Management',
    ],
  },
];

const gridColumns = [
  ['Modules', 'Configurations'],
  ['Personnel & Hierarchy', 'ELN Management'],
  ['Master Data'],
  ['System Settings'],
];

const adminHubSearchItems = adminHubSections.flatMap((section) =>
  section.links.map((link) => ({
    label: link,
    category: section.title,
  })),
);

function getSearchResults(query) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  return adminHubSearchItems.filter((item) => item.label.toLowerCase().includes(normalizedQuery));
}

function getResultsCountLabel(count) {
  return `${count} ${count === 1 ? 'Setting' : 'Settings'} found`;
}

function AdminHubSearch({ value, inputRef, onChange, results }) {
  const hasQuery = value.trim().length > 0;
  const resultCountLabel = getResultsCountLabel(results.length);

  return (
    <div className="position-relative w-100" role="search">
      <label className="input-group flex-nowrap mb-0" aria-label="Search by Module or Setting Name">
        <span className="input-group-text bg-white text-secondary" aria-hidden="true">
          <AppIcon name="search" size={16} />
        </span>
        <input
          ref={inputRef}
          className="smplfy-form-control form-control"
          type="search"
          value={value}
          placeholder="Search by Module/Setting Name"
          role="combobox"
          aria-autocomplete="list"
          aria-controls="admin-hub-search-results"
          aria-expanded={hasQuery}
          onChange={(event) => onChange(event.target.value)}
        />
        <span className="input-group-text bg-white text-secondary d-none d-md-inline-flex align-items-center gap-1" aria-hidden="true">
          <kbd>Ctrl</kbd>
          <span>+</span>
          <kbd>/</kbd>
        </span>
      </label>

      {hasQuery ? (
        <div
          id="admin-hub-search-results"
          className="smplfy-card card position-absolute top-100 start-0 w-100 mt-2 shadow z-3"
          role="listbox"
          aria-label="Admin Hub search results"
        >
          <div className="card-header bg-transparent small text-secondary">{resultCountLabel}</div>
          <div className="list-group list-group-flush overflow-auto">
            {results.length ? (
              results.map((result) => (
                <SearchResult
                  key={`${result.category}-${result.label}`}
                  label={result.label}
                  address={result.category}
                  role="option"
                  aria-selected="false"
                />
              ))
            ) : (
              <div className="list-group-item text-secondary" role="status">
                No Settings found
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AdminModuleGroup({ section }) {
  return (
    <section className="d-flex flex-column gap-2" aria-labelledby={`admin-hub-${section.title}`}>
      <div className="d-flex align-items-center gap-2">
        <span className="d-inline-flex align-items-center justify-content-center rounded border border-primary-subtle bg-primary-subtle text-primary p-2" aria-hidden="true">
          <AppIcon name={section.icon} size={20} />
        </span>
        <h2 id={`admin-hub-${section.title}`} className="h6 mb-0 fw-semibold text-dark">
          {section.title}
        </h2>
      </div>

      <div className="d-flex flex-column align-items-start gap-2 ps-5">
        {section.links.map((link) => (
          <LinkItem key={link} label={link} />
        ))}
      </div>
    </section>
  );
}

export default function AdminHubPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  const searchResults = useMemo(() => getSearchResults(searchQuery), [searchQuery]);
  const sectionMap = useMemo(
    () => Object.fromEntries(adminHubSections.map((section) => [section.title, section])),
    [],
  );

  useEffect(() => {
    const previousTitle = document.title;

    document.title = 'IICT Admin Hub';

    return () => {
      document.title = previousTitle;
    };
  }, []);

  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === '/') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleShortcut);

    return () => {
      window.removeEventListener('keydown', handleShortcut);
    };
  }, []);

  return (
    <div className="smplfy-admin-hub-page min-vh-100 bg-body-tertiary">
      <header className="bg-white border-bottom p-3">
        <div className="container-fluid h-100">
          <div className="row h-100 align-items-center g-3">
        <div className="col-12 col-lg d-inline-flex align-items-center gap-2 text-dark">
          <AppIcon name="admin-hub" size={18} stroke={2} />
          <span>IICT Admin Hub</span>
        </div>

        <div className="col-12 col-lg-4 d-flex justify-content-center">
        <AdminHubSearch
          value={searchQuery}
          inputRef={searchInputRef}
          onChange={setSearchQuery}
          results={searchResults}
        />
        </div>

        <div className="col-12 col-lg d-flex justify-content-lg-end">
        <SecondaryButton
          size="large"
          tone="neutral"
          leftIcon="user"
          aria-label="User profile"
        >
          Rishabh Gangwar
        </SecondaryButton>
        </div>
          </div>
        </div>
      </header>

      <main className="container-fluid p-4">
        <section className="d-flex flex-column align-items-center justify-content-center text-center py-5" aria-labelledby="admin-hub-title">
          <div className="d-inline-flex align-items-center justify-content-center gap-3">
            <AppIcon name="admin-hub" size={32} stroke={2.4} />
            <h1 id="admin-hub-title" className="display-5 mb-0 text-dark">IICT Admin Hub</h1>
          </div>
          <p className="mb-0 mt-3 text-secondary">Manage all system configurations and data from panels below.</p>
        </section>

        <section className="smplfy-admin-hub-grid row g-4 justify-content-center" aria-label="Admin Hub modules">
          {gridColumns.map((column, columnIndex) => (
            <div className="col-12 col-md-6 col-xl-3 d-flex flex-column gap-4" key={column.join('-') || columnIndex}>
              {column.map((sectionTitle) => {
                const section = sectionMap[sectionTitle];

                return section ? <AdminModuleGroup key={section.title} section={section} /> : null;
              })}
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
