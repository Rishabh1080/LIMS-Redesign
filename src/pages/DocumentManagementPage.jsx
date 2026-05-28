import { useMemo, useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import MoreActionButton from '../components/MoreActionButton';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import './document-management-page.scss';

const documentTree = [
  {
    id: 'category-a',
    name: 'Category A',
    subCategories: [
      {
        id: 'category-a-1',
        name: 'Sub-Category A1',
        documents: [
          { id: 'doc-a1-1', name: 'Document Name', expiringSoon: true },
          { id: 'doc-a1-2', name: 'Document Name K...', expiringSoon: false },
          { id: 'doc-a1-3', name: 'Document Name', expiringSoon: false },
          { id: 'doc-a1-4', name: 'Document Name', expiringSoon: false },
          { id: 'doc-a1-5', name: 'Document Name', expiringSoon: true },
        ],
      },
      {
        id: 'category-a-2',
        name: 'Sub-Category A2',
        documents: [
          { id: 'doc-a2-1', name: 'Document Name', expiringSoon: false },
          { id: 'doc-a2-2', name: 'Document Name', expiringSoon: false },
          { id: 'doc-a2-3', name: 'Document Name', expiringSoon: true },
        ],
      },
    ],
  },
  {
    id: 'category-b',
    name: 'Category B',
    subCategories: [
      {
        id: 'category-b-1',
        name: 'Sub-Category B1',
        documents: [
          { id: 'doc-b1-1', name: 'Document Name', expiringSoon: false },
          { id: 'doc-b1-2', name: 'Document Name', expiringSoon: true },
          { id: 'doc-b1-3', name: 'Document Name', expiringSoon: false },
        ],
      },
      {
        id: 'category-b-2',
        name: 'Sub-Category B2',
        documents: [
          { id: 'doc-b2-1', name: 'Document Name', expiringSoon: false },
          { id: 'doc-b2-2', name: 'Document Name', expiringSoon: false },
          { id: 'doc-b2-3', name: 'Document Name', expiringSoon: false },
        ],
      },
    ],
  },
];

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

function DocumentManagementHeader() {
  return (
    <section className="bg-white border-bottom px-4 py-3">
      <div className="container-fluid px-0">
        <div className="row align-items-center justify-content-between gx-0 gap-3">
          <div className="col-auto">
            <h1 className="h5 mb-0 fw-semibold text-dark">Document Management</h1>
          </div>

          <div className="col-auto">
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <PrimaryButton leftIcon="plus">
                New Document
              </PrimaryButton>
              <SecondaryButton leftIcon="eye" size="large">
                View Pending
              </SecondaryButton>
              <MoreActionButton />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function filterDocumentTree(query) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return documentTree;
  }

  return documentTree
    .map((category) => ({
      ...category,
      subCategories: category.subCategories
        .map((subCategory) => ({
          ...subCategory,
          documents: subCategory.documents.filter((document) =>
            document.name.toLowerCase().includes(normalizedQuery),
          ),
        }))
        .filter((subCategory) => subCategory.documents.length > 0),
    }))
    .filter((category) => category.subCategories.length > 0);
}

function DocumentSearch({ value, onChange }) {
  return (
    <div className="position-relative w-100 mb-3" role="search">
      <label className="input-group flex-nowrap mb-0" aria-label="Search in Documents">
        <span className="input-group-text bg-white text-secondary" aria-hidden="true">
          <AppIcon name="search" size={16} />
        </span>
        <input
          className="smplfy-form-control form-control"
          type="search"
          value={value}
          placeholder="Search in Documents"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded="false"
          onChange={(event) => onChange(event.target.value)}
        />
        <span className="input-group-text bg-white text-secondary d-none d-md-inline-flex align-items-center gap-1" aria-hidden="true">
          <kbd>Ctrl</kbd>
          <span>+</span>
          <kbd>/</kbd>
        </span>
      </label>
    </div>
  );
}

function DocumentNavigation({
  categories,
  selectedDocumentId,
  expandedCategoryIds,
  expandedSubCategoryIds,
  onToggleCategory,
  onToggleSubCategory,
  onSelectDocument,
}) {
  if (!categories.length) {
    return (
      <div className="text-secondary px-2 py-3" role="status">
        No documents found.
      </div>
    );
  }

  return (
    <nav aria-label="Document folders">
      <div className="accordion accordion-flush">
        {categories.map((category) => (
          <div className="accordion-item" key={category.id}>
            <h2 className="accordion-header">
              <button
                type="button"
                className={joinClasses('accordion-button', !expandedCategoryIds.includes(category.id) && 'collapsed')}
                aria-expanded={expandedCategoryIds.includes(category.id)}
                aria-controls={`${category.id}-panel`}
                onClick={() => onToggleCategory(category.id)}
              >
                <AppIcon name={expandedCategoryIds.includes(category.id) ? 'chevron-down' : 'chevron-right'} size={18} />
                <span className="fw-semibold text-truncate">{category.name}</span>
              </button>
            </h2>

            <div
              id={`${category.id}-panel`}
              className={joinClasses('accordion-collapse', 'collapse', expandedCategoryIds.includes(category.id) && 'show')}
            >
              <div className="accordion-body">
                <div className="accordion accordion-flush">
                  {category.subCategories.map((subCategory) => (
                    <div className="accordion-item" key={subCategory.id}>
                      <h3 className="accordion-header">
                        <button
                          type="button"
                          className={joinClasses('accordion-button', !expandedSubCategoryIds.includes(subCategory.id) && 'collapsed')}
                          aria-expanded={expandedSubCategoryIds.includes(subCategory.id)}
                          aria-controls={`${subCategory.id}-panel`}
                          onClick={() => onToggleSubCategory(subCategory.id)}
                        >
                          <AppIcon name={expandedSubCategoryIds.includes(subCategory.id) ? 'chevron-down' : 'chevron-right'} size={18} />
                          <span className="fw-semibold text-truncate">{subCategory.name}</span>
                        </button>
                      </h3>

                      <div
                        id={`${subCategory.id}-panel`}
                        className={joinClasses('accordion-collapse', 'collapse', expandedSubCategoryIds.includes(subCategory.id) && 'show')}
                      >
                        <div className="accordion-body">
                          <div className="list-group list-group-flush gap-1">
                            {subCategory.documents.map((document) => (
                              <button
                                type="button"
                                className={joinClasses(
                                  'smplfy-list-group-item',
                                  'list-group-item',
                                  'list-group-item-action',
                                  'border-0',
                                  'rounded-2',
                                  'd-flex',
                                  'align-items-center',
                                  'gap-2',
                                  'px-2',
                                  'py-1',
                                  'w-100',
                                  'text-start',
                                  selectedDocumentId === document.id && 'active',
                                )}
                                aria-current={selectedDocumentId === document.id ? 'true' : undefined}
                                key={document.id}
                                onClick={() => onSelectDocument(document.id)}
                              >
                                <AppIcon name="file-text" size={16} />
                                <span className="text-truncate flex-grow-1">{document.name}</span>
                                {document.expiringSoon ? (
                                  <AppIcon name="alert-circle" size={14} className="text-danger ms-auto" />
                                ) : null}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}

function DocumentPreviewEmptyState() {
  return (
    <section className="smplfy-card card h-100 shadow-sm">
      <div className="card-body d-flex flex-column align-items-center justify-content-center text-center">
        <svg width="152" height="120" viewBox="0 0 152 120" role="img" aria-label="Document preview placeholder" className="mb-3 text-secondary">
          <rect x="29" y="14" width="72" height="92" rx="10" fill="currentColor" opacity="0.08" />
          <path d="M45 34h38M45 48h38M45 62h30" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.35" />
          <rect x="72" y="30" width="48" height="62" rx="8" fill="white" stroke="currentColor" strokeWidth="3" opacity="0.55" />
          <path d="M85 48h22M85 61h22M85 74h14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.45" />
          <circle cx="104" cy="91" r="18" fill="var(--smplfy-primitive-blue-50)" stroke="currentColor" strokeWidth="3" opacity="0.65" />
          <path d="m98 91 4 4 9-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
        </svg>
        <h2 className="h5 mb-2 fw-semibold text-dark">Select a document to preview</h2>
        <p className="text-secondary mb-0">Choose a document from the navigation to view its details here.</p>
      </div>
    </section>
  );
}

export default function DocumentManagementPage({
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  sidebarBadgeCounts,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocumentId, setSelectedDocumentId] = useState('doc-a1-1');
  const [expandedCategoryIds, setExpandedCategoryIds] = useState(() => documentTree.map((category) => category.id));
  const [expandedSubCategoryIds, setExpandedSubCategoryIds] = useState(() =>
    documentTree.flatMap((category) => category.subCategories.map((subCategory) => subCategory.id)),
  );
  const visibleCategories = useMemo(() => filterDocumentTree(searchQuery), [searchQuery]);
  const toggleCategory = (categoryId) => {
    setExpandedCategoryIds((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId],
    );
  };
  const toggleSubCategory = (subCategoryId) => {
    setExpandedSubCategoryIds((current) =>
      current.includes(subCategoryId)
        ? current.filter((id) => id !== subCategoryId)
        : [...current, subCategoryId],
    );
  };

  return (
    <AppChrome
      activeNav="document-management"
      onNavigate={onNavigate}
      breadcrumbs={[{ key: 'document-management', label: 'Document Management', current: true }]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      sidebarBadgeCounts={sidebarBadgeCounts}
      pageHeader={<DocumentManagementHeader />}
    >
      <main className="smplfy-document-management-page bg-body-tertiary p-4 min-vh-100">
        <div className="container-fluid px-0">
          <div className="row g-4">
            <aside className="col-12 col-xl-3">
              <section className="smplfy-card card h-100 border-0 shadow-none">
                <div className="card-body">
                  <DocumentSearch value={searchQuery} onChange={setSearchQuery} />

                  <DocumentNavigation
                    categories={visibleCategories}
                    selectedDocumentId={selectedDocumentId}
                    expandedCategoryIds={expandedCategoryIds}
                    expandedSubCategoryIds={expandedSubCategoryIds}
                    onToggleCategory={toggleCategory}
                    onToggleSubCategory={toggleSubCategory}
                    onSelectDocument={setSelectedDocumentId}
                  />
                </div>
              </section>
            </aside>

            <section className="col-12 col-xl-9">
              <DocumentPreviewEmptyState />
            </section>
          </div>
        </div>
      </main>
    </AppChrome>
  );
}
