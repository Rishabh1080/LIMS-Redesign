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
    <div className="admin-hub-search-shell" role="search">
      <label className="admin-hub-search" aria-label="Search by Module or Setting Name">
        <span className="admin-hub-search__icon" aria-hidden="true">
          <AppIcon name="search" size={16} />
        </span>
        <input
          ref={inputRef}
          className="admin-hub-search__input"
          type="search"
          value={value}
          placeholder="Search by Module/Setting Name"
          role="combobox"
          aria-autocomplete="list"
          aria-controls="admin-hub-search-results"
          aria-expanded={hasQuery}
          onChange={(event) => onChange(event.target.value)}
        />
        <span className="admin-hub-search__shortcut" aria-hidden="true">
          <kbd>Ctrl</kbd>
          <span>+</span>
          <kbd>/</kbd>
        </span>
      </label>

      {hasQuery ? (
        <div
          id="admin-hub-search-results"
          className="admin-hub-search-tray"
          role="listbox"
          aria-label="Admin Hub search results"
        >
          <div className="admin-hub-search-tray__count">{resultCountLabel}</div>
          <div className="admin-hub-search-tray__results">
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
              <div className="admin-hub-search-tray__empty" role="status">
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
    <section className="admin-hub-module" aria-labelledby={`admin-hub-${section.title}`}>
      <div className="admin-hub-module__header">
        <span className="admin-hub-module__icon" aria-hidden="true">
          <AppIcon name={section.icon} size={20} />
        </span>
        <h2 id={`admin-hub-${section.title}`} className="admin-hub-module__title">
          {section.title}
        </h2>
      </div>

      <div className="admin-hub-module__links">
        {section.links.map((link) => (
          <LinkItem key={link} label={link} className="admin-hub-module__link" />
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
    <div className="admin-hub-page">
      <header className="admin-hub-topbar">
        <div className="admin-hub-topbar__brand">
          <AppIcon name="admin-hub" size={18} stroke={2} />
          <span>IICT Admin Hub</span>
        </div>

        <AdminHubSearch
          value={searchQuery}
          inputRef={searchInputRef}
          onChange={setSearchQuery}
          results={searchResults}
        />

        <SecondaryButton
          size="large"
          tone="neutral"
          leftIcon="user"
          className="admin-hub-topbar__profile"
          aria-label="User profile"
        >
          Rishabh Gangwar
        </SecondaryButton>
      </header>

      <main className="admin-hub-main">
        <section className="admin-hub-hero" aria-labelledby="admin-hub-title">
          <div className="admin-hub-hero__title-row">
            <AppIcon name="admin-hub" size={32} stroke={2.4} />
            <h1 id="admin-hub-title">IICT Admin Hub</h1>
          </div>
          <p>Manage all system configurations and data from panels below.</p>
        </section>

        <section className="admin-hub-module-grid" aria-label="Admin Hub modules">
          {gridColumns.map((column, columnIndex) => (
            <div className="admin-hub-module-grid__column" key={column.join('-') || columnIndex}>
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
