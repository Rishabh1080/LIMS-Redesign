import {
  IconFolder,
  IconFolderOpen,
  IconLayoutBottombarCollapse,
  IconLayoutNavbarCollapse,
} from '@tabler/icons-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import Badge from '../components/Badge';
import { FormElement } from '../components/FormControls';
import MoreActionButton from '../components/MoreActionButton';
import Modal from '../components/Modal/Modal';
import NavSelector from '../components/NavSelector';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import './document-management-page.scss';

const documentTree = [
  {
    id: 'sop-documents',
    name: 'SOP Documents',
    subCategories: [
      {
        id: 'visit-report',
        name: 'Visit Report',
        approvedDocuments: [
          { id: 'visit-tvs-motors', name: 'Visit to TVS Motors', expiringSoon: false },
          { id: 'visit-mahagenco-koradi', name: 'Customer meet at Mahagenco, Koradi', expiringSoon: false },
          { id: 'visit-rain-cement', name: 'Meeting with Rain Cement team members', expiringSoon: true },
        ],
        pendingDocuments: [
          { id: 'pending-visit-jsw-steel', name: 'Visit to JSW Steel plant', expiringSoon: true },
          { id: 'pending-visit-ntpc-sipat', name: 'Customer meet at NTPC Sipat', expiringSoon: false },
          { id: 'pending-visit-ambuja-cement', name: 'Meeting with Ambuja Cement quality team', expiringSoon: true },
        ],
      },
      {
        id: 'testing-procedures',
        name: 'Testing Procedures',
        approvedDocuments: [
          { id: 'sop-sample-receipt', name: 'SOP for sample receipt and coding', expiringSoon: false },
          { id: 'sop-instrument-calibration', name: 'SOP for instrument calibration checks', expiringSoon: false },
        ],
        pendingDocuments: [
          { id: 'pending-sop-result-entry', name: 'SOP for result entry verification', expiringSoon: false },
          { id: 'pending-sop-retesting', name: 'SOP for retesting and deviation handling', expiringSoon: true },
        ],
      },
      {
        id: 'safety-protocols',
        name: 'Safety Protocols',
        approvedDocuments: [
          { id: 'sop-chemical-handling', name: 'Chemical handling and storage protocol', expiringSoon: false },
          { id: 'sop-lab-ppe', name: 'Laboratory PPE compliance procedure', expiringSoon: false },
        ],
        pendingDocuments: [],
      },
    ],
  },
  {
    id: 'certificates',
    name: 'Certificates',
    subCategories: [
      {
        id: 'nabl-certificates',
        name: 'NABL Certificates',
        approvedDocuments: [
          { id: 'cert-nabl-2026', name: 'NABL accreditation certificate 2026', expiringSoon: false },
          { id: 'cert-scope-chemical', name: 'NABL scope for chemical testing', expiringSoon: true },
          { id: 'cert-scope-mechanical', name: 'NABL scope for mechanical testing', expiringSoon: false },
        ],
        pendingDocuments: [
          { id: 'pending-cert-nabl-renewal', name: 'NABL renewal acknowledgement 2026', expiringSoon: true },
          { id: 'pending-cert-scope-microbiology', name: 'NABL scope extension for microbiology', expiringSoon: false },
          { id: 'pending-cert-scope-metallurgy', name: 'NABL scope extension for metallurgy', expiringSoon: true },
        ],
      },
      {
        id: 'training-certificates',
        name: 'Training Certificates',
        approvedDocuments: [
          { id: 'cert-internal-auditor', name: 'Internal auditor training certificate', expiringSoon: false },
          { id: 'cert-iso-17025', name: 'ISO/IEC 17025 awareness training', expiringSoon: false },
        ],
        pendingDocuments: [
          { id: 'pending-cert-safety-induction', name: 'New analyst safety induction certificate', expiringSoon: false },
          { id: 'pending-cert-method-validation', name: 'Method validation workshop certificate', expiringSoon: false },
        ],
      },
      {
        id: 'equipment-certificates',
        name: 'Equipment Certificates',
        approvedDocuments: [
          { id: 'cert-uv-vis-calibration', name: 'UV-Vis calibration certificate', expiringSoon: false },
          { id: 'cert-gc-validation', name: 'Gas Chromatograph validation certificate', expiringSoon: false },
        ],
        pendingDocuments: [
          { id: 'pending-cert-viscometer-calibration', name: 'Stabinger Viscometer calibration certificate', expiringSoon: false },
          { id: 'pending-cert-balance-calibration', name: 'Analytical balance calibration certificate', expiringSoon: true },
          { id: 'pending-cert-oven-validation', name: 'Hot air oven validation certificate', expiringSoon: false },
        ],
      },
    ],
  },
];

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

const allCategoryIds = documentTree.map((category) => category.id);
const allSubCategoryIds = documentTree.flatMap((category) =>
  category.subCategories.map((subCategory) => subCategory.id),
);
const newDocumentInitialDraft = {
  name: '',
  description: '',
  category: '',
  file: null,
};
const allowedDocumentExtensions = new Set(['pdf', 'doc', 'docx']);
const maxDocumentFileSize = 10 * 1024 * 1024;
const defaultDocumentCreatedOn = '12/02/26 12:36 PM';

function DocumentManagementHeader({ title = 'Document Management', onNewDocument }) {
  return (
    <section className="bg-white border-bottom px-4 py-3">
      <div className="container-fluid px-0">
        <div className="row align-items-center justify-content-between gx-0 gap-3">
          <div className="col-auto">
            <h1 className="h5 mb-0 fw-semibold text-dark">{title}</h1>
          </div>

          <div className="col-auto">
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <PrimaryButton leftIcon="plus" onClick={onNewDocument}>
                New Document
              </PrimaryButton>
              <MoreActionButton />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function tagDocuments(documents, documentState) {
  return documents.map((document) => ({
    ...document,
    documentState,
  }));
}

function getSubCategoryDocuments(subCategory, status) {
  if (status === 'all') {
    return [
      ...tagDocuments(subCategory.approvedDocuments, 'approved'),
      ...tagDocuments(subCategory.pendingDocuments, 'pending'),
    ].sort((firstDocument, secondDocument) =>
      firstDocument.name.localeCompare(secondDocument.name, undefined, { sensitivity: 'base' }),
    );
  }

  return status === 'pending'
    ? tagDocuments(subCategory.pendingDocuments, 'pending')
    : tagDocuments(subCategory.approvedDocuments, 'approved');
}

function filterDocumentTree(tree, query, status) {
  const normalizedQuery = query.trim().toLowerCase();

  return tree
    .map((category) => ({
      ...category,
      subCategories: category.subCategories
        .map((subCategory) => ({
          ...subCategory,
          documents: getSubCategoryDocuments(subCategory, status).filter((document) =>
            !normalizedQuery || document.name.toLowerCase().includes(normalizedQuery),
          ),
        }))
        .filter((subCategory) => status === 'pending' || subCategory.documents.length > 0),
    }))
    .filter((category) => status === 'pending' || category.subCategories.length > 0);
}

function countDocuments(categories) {
  return categories.reduce(
    (categoryTotal, category) =>
      categoryTotal +
      category.subCategories.reduce(
        (subCategoryTotal, subCategory) => subCategoryTotal + subCategory.documents.length,
        0,
      ),
    0,
  );
}

function findDocumentPath(tree, documentId, status) {
  if (!documentId) {
    return {
      categoryId: null,
      subCategoryId: null,
    };
  }

  for (const category of tree) {
    for (const subCategory of category.subCategories) {
      if (getSubCategoryDocuments(subCategory, status).some((document) => document.id === documentId)) {
        return {
          categoryId: category.id,
          subCategoryId: subCategory.id,
        };
      }
    }
  }

  return {
    categoryId: null,
    subCategoryId: null,
  };
}

function findDocumentById(tree, documentId, status) {
  if (!documentId) {
    return null;
  }

  for (const category of tree) {
    for (const subCategory of category.subCategories) {
      const document = getSubCategoryDocuments(subCategory, status).find((item) => item.id === documentId);

      if (document) {
        return {
          ...document,
          categoryName: category.name,
          subCategoryName: subCategory.name,
        };
      }
    }
  }

  return null;
}

function getSubCategoryOptions(tree) {
  return tree.flatMap((category) =>
    category.subCategories.map((subCategory) => ({
      value: subCategory.id,
      label: `${category.name} / ${subCategory.name}`,
    })),
  );
}

function findSubCategoryPath(tree, subCategoryId) {
  for (const category of tree) {
    if (category.subCategories.some((subCategory) => subCategory.id === subCategoryId)) {
      return {
        categoryId: category.id,
        subCategoryId,
      };
    }
  }

  return {
    categoryId: null,
    subCategoryId: null,
  };
}

function getDocumentCreatedOn(document) {
  return document?.createdOn || defaultDocumentCreatedOn;
}

function getSelectedDocumentDetails(document) {
  if (!document) {
    return null;
  }

  return {
    ...document,
    createdOn: getDocumentCreatedOn(document),
  };
}

function NewDocumentModal({
  open,
  values,
  errors,
  categoryOptions,
  categoryLabel = 'Category',
  onChange,
  onCancel,
  onSubmit,
}) {
  return (
    <Modal
      open={open}
      title="New Document"
      titleId="new-document-modal-title"
      titleIcon="file-text"
      onClose={onCancel}
      size="md"
      actions={
        <>
          <SecondaryButton leftIcon="close" size="large" onClick={onCancel}>
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" form="new-document-form" leftIcon="save">
            Submit
          </PrimaryButton>
        </>
      }
    >
      <form
        id="new-document-form"
        className="d-flex flex-column gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <FormElement
          type="text"
          mandatory
          label="Document Name"
          message={errors.name}
          messageTone="error"
          inputProps={{
            value: values.name,
            placeholder: 'Enter document name',
            onChange: (event) => onChange('name', event.target.value),
          }}
        />

        <FormElement
          type="textarea"
          label="Description"
          inputProps={{
            value: values.description,
            placeholder: 'Enter description',
            rows: 5,
            onChange: (event) => onChange('description', event.target.value),
          }}
        />

        <FormElement
          type="dropdown"
          mandatory
          label={categoryLabel}
          message={errors.category}
          messageTone="error"
          inputProps={{
            value: values.category,
            placeholder: `Select ${categoryLabel.toLowerCase()}`,
            options: categoryOptions,
            onChange: (event) => onChange('category', event.target.value),
          }}
        />

        <FormElement
          type="file"
          label="File upload"
          helperText="Please upload PDF/DOC/DOCX files and limit upto 10MB."
          message={errors.file}
          messageTone="error"
          inputProps={{
            value: values.file,
            placeholder: 'Upload document',
            accept: '.pdf,.doc,.docx',
            onChange: (event) => onChange('file', event.target.value),
          }}
        />
      </form>
    </Modal>
  );
}

function DocumentSearch({ value, onChange, label }) {
  return (
    <div className="position-relative w-100 mb-3" role="search">
      <label className="input-group flex-nowrap mb-0" aria-label={label}>
        <span className="input-group-text bg-white text-secondary" aria-hidden="true">
          <AppIcon name="search" size={16} />
        </span>
        <input
          className="smplfy-form-control form-control"
          type="search"
          value={value}
          placeholder={label}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded="false"
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
    </div>
  );
}

function DocumentTreeToggle({ countLabel, shouldExpandTree, onClick }) {
  const ToggleIcon = shouldExpandTree ? IconLayoutBottombarCollapse : IconLayoutNavbarCollapse;
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const tooltipTimerRef = useRef(null);
  const pointerInsideRef = useRef(false);
  const focusInsideRef = useRef(false);

  const clearTooltipTimer = () => {
    if (tooltipTimerRef.current) {
      window.clearTimeout(tooltipTimerRef.current);
      tooltipTimerRef.current = null;
    }
  };

  const startTooltipTimer = () => {
    clearTooltipTimer();
    setTooltipVisible(false);

    tooltipTimerRef.current = window.setTimeout(() => {
      if (pointerInsideRef.current || focusInsideRef.current) {
        setTooltipVisible(true);
      }
    }, 1600);
  };

  const hideTooltip = () => {
    clearTooltipTimer();
    setTooltipVisible(false);
  };

  const handleClick = () => {
    startTooltipTimer();
    onClick();
  };

  useEffect(() => () => clearTooltipTimer(), []);

  return (
    <div className="smplfy-document-tree-toggle d-flex align-items-center justify-content-between gap-2 mb-3">
      <span className="text-secondary text-truncate">{countLabel}</span>
      <button
        type="button"
        className="smplfy-document-tree-toggle-button smplfy-btn btn btn-outline-secondary btn-sm px-0 d-inline-flex align-items-center justify-content-center flex-shrink-0"
        onClick={handleClick}
        onFocus={() => {
          focusInsideRef.current = true;
          startTooltipTimer();
        }}
        onBlur={() => {
          focusInsideRef.current = false;
          hideTooltip();
        }}
        onPointerEnter={() => {
          pointerInsideRef.current = true;
          startTooltipTimer();
        }}
        onPointerLeave={() => {
          pointerInsideRef.current = false;
          hideTooltip();
        }}
        onPointerDown={startTooltipTimer}
        aria-label={shouldExpandTree ? 'Expand document folders' : 'Collapse document folders'}
      >
        <ToggleIcon size={18} stroke={1.8} />
        <span
          className={joinClasses(
            'smplfy-document-tree-toggle-tooltip',
            tooltipVisible && 'is-visible',
          )}
          role="tooltip"
        >
          Click to Expand/Collapse
        </span>
      </button>
    </div>
  );
}

function DocumentNavigation({
  categories,
  selectedDocumentId,
  recentlyDeselectedDocumentId,
  expandedCategoryIds,
  expandedSubCategoryIds,
  onToggleCategory,
  onToggleSubCategory,
  onClearRecentlyDeselectedDocument,
  onSelectDocument,
  emptyDocumentMessage,
  showDocumentStatusBadge = false,
  showFolderIcons = false,
}) {
  if (!categories.length) {
    return (
      <div className="text-secondary px-2 py-3" role="status">
        No documents found.
      </div>
    );
  }

  const useFolderIcons = showFolderIcons || showDocumentStatusBadge;

  return (
    <nav className={joinClasses(useFolderIcons && 'smplfy-document-tree-lines')} aria-label="Document folders">
      <div className="accordion accordion-flush smplfy-document-category-tree">
        {categories.map((category) => (
          <div className="accordion-item smplfy-document-category-item" key={category.id}>
            <h2 className="accordion-header">
              <button
                type="button"
                className={joinClasses('accordion-button', !expandedCategoryIds.includes(category.id) && 'collapsed')}
                aria-expanded={expandedCategoryIds.includes(category.id)}
                aria-controls={`${category.id}-panel`}
                onClick={() => onToggleCategory(category.id)}
              >
                {useFolderIcons ? (
                  <span className="smplfy-document-folder-icon d-inline-flex align-items-center justify-content-center text-secondary flex-shrink-0">
                    <IconFolder size={18} stroke={1.8} aria-hidden="true" />
                  </span>
                ) : (
                  <AppIcon name={expandedCategoryIds.includes(category.id) ? 'chevron-down' : 'chevron-right'} size={18} />
                )}
                <span className="fw-semibold text-truncate">{category.name}</span>
              </button>
            </h2>

            <div
              id={`${category.id}-panel`}
              className={joinClasses('accordion-collapse', 'collapse', expandedCategoryIds.includes(category.id) && 'show')}
            >
              <div className="accordion-body smplfy-document-category-body">
                <div className="accordion accordion-flush smplfy-document-subcategory-tree">
                  {category.subCategories.map((subCategory) => (
                    <div className="accordion-item smplfy-document-subcategory-item" key={subCategory.id}>
                      <h3 className="accordion-header">
                        <button
                          type="button"
                          className={joinClasses('accordion-button', !expandedSubCategoryIds.includes(subCategory.id) && 'collapsed')}
                          aria-expanded={expandedSubCategoryIds.includes(subCategory.id)}
                          aria-controls={`${subCategory.id}-panel`}
                          onClick={() => onToggleSubCategory(subCategory.id)}
                        >
                          {useFolderIcons ? (
                            <span className="smplfy-document-folder-icon d-inline-flex align-items-center justify-content-center text-secondary flex-shrink-0">
                              <IconFolderOpen size={18} stroke={1.8} aria-hidden="true" />
                            </span>
                          ) : (
                            <AppIcon name={expandedSubCategoryIds.includes(subCategory.id) ? 'chevron-down' : 'chevron-right'} size={18} />
                          )}
                          <span className="fw-semibold text-truncate">{subCategory.name}</span>
                        </button>
                      </h3>

                      <div
                        id={`${subCategory.id}-panel`}
                        className={joinClasses('accordion-collapse', 'collapse', expandedSubCategoryIds.includes(subCategory.id) && 'show')}
                      >
                        <div className="accordion-body smplfy-document-subcategory-body">
                          {subCategory.documents.length ? (
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
                                    recentlyDeselectedDocumentId === document.id && 'smplfy-document-recently-deselected',
                                  )}
                                  aria-current={selectedDocumentId === document.id ? 'true' : undefined}
                                  key={document.id}
                                  onClick={(event) => onSelectDocument(document.id, event)}
                                  onPointerLeave={() => {
                                    if (recentlyDeselectedDocumentId === document.id) {
                                      onClearRecentlyDeselectedDocument();
                                    }
                                  }}
                                >
                                  <AppIcon name="file-text" size={16} />
                                  <span className="text-truncate flex-grow-1 fw-medium">{document.name}</span>
                                  {showDocumentStatusBadge && document.documentState === 'pending' ? (
                                    <Badge tone="warning" shape="pill" className="smplfy-document-status-badge">
                                      Pending
                                    </Badge>
                                  ) : null}
                                  {document.expiringSoon && !(showDocumentStatusBadge && document.documentState === 'pending') ? (
                                    <Badge tone="danger" shape="pill" className="smplfy-document-expiring-badge">
                                      Expiring soon
                                    </Badge>
                                  ) : null}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="smplfy-document-empty-state text-secondary px-0 py-1">{emptyDocumentMessage}</div>
                          )}
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

function StepBreadcrumb({
  category,
  subCategory,
  onBack,
  onShowCategories,
  onShowSubCategories,
}) {
  return (
    <div className="d-flex align-items-center gap-2 mb-3">
      {category ? (
        <SecondaryButton
          size="medium"
          leftIcon="chevron-left"
          className="px-0 flex-shrink-0"
          aria-label="Go back"
          onClick={onBack}
        />
      ) : null}
      <nav aria-label="Document location" className="min-w-0 flex-grow-1">
        <ol className="breadcrumb mb-0 small flex-wrap">
          <li className={joinClasses('breadcrumb-item', !category && 'active')} aria-current={!category ? 'page' : undefined}>
            {category ? (
              <button type="button" className="btn btn-link p-0 text-decoration-none small" onClick={onShowCategories}>
                All folders
              </button>
            ) : 'All folders'}
          </li>
          {category ? (
            <li
              className={joinClasses('breadcrumb-item', !subCategory && 'active')}
              aria-current={!subCategory ? 'page' : undefined}
            >
              {subCategory ? (
                <button type="button" className="btn btn-link p-0 text-decoration-none small" onClick={onShowSubCategories}>
                  {category.name}
                </button>
              ) : category.name}
            </li>
          ) : null}
          {subCategory ? (
            <li className="breadcrumb-item active" aria-current="page">
              {subCategory.name}
            </li>
          ) : null}
        </ol>
      </nav>
    </div>
  );
}

function StepDocumentNavigation({
  categories,
  category,
  subCategory,
  documents,
  selectedDocumentId,
  recentlyDeselectedDocumentId,
  onSelectCategory,
  onSelectSubCategory,
  onSelectDocument,
  onClearRecentlyDeselectedDocument,
  emptyDocumentMessage,
  showDocumentStatusBadge = false,
}) {
  if (!category) {
    return categories.length ? (
      <nav aria-label="Document folders">
        <div className="list-group list-group-flush gap-1">
          {categories.map((categoryItem) => (
            <button
              type="button"
              className="smplfy-list-group-item list-group-item list-group-item-action border-0 rounded-2 d-flex align-items-center gap-2 px-2 py-2 w-100 text-start"
              key={categoryItem.id}
              onClick={() => onSelectCategory(categoryItem.id)}
            >
              <AppIcon name="file-description" size={18} />
              <span className="text-truncate flex-grow-1 fw-medium">{categoryItem.name}</span>
              <span className="small text-secondary text-nowrap">
                {categoryItem.subCategories.length}
              </span>
              <AppIcon name="chevron-right" size={16} />
            </button>
          ))}
        </div>
      </nav>
    ) : (
      <div className="text-secondary px-2 py-3" role="status">No folders found.</div>
    );
  }

  if (!subCategory) {
    return category.subCategories.length ? (
      <nav aria-label={`${category.name} folders`}>
        <div className="list-group list-group-flush gap-1">
          {category.subCategories.map((subCategoryItem) => (
            <button
              type="button"
              className="smplfy-list-group-item list-group-item list-group-item-action border-0 rounded-2 d-flex align-items-center gap-2 px-2 py-2 w-100 text-start"
              key={subCategoryItem.id}
              onClick={() => onSelectSubCategory(subCategoryItem.id)}
            >
              <AppIcon name="file-description" size={18} />
              <span className="text-truncate flex-grow-1 fw-medium">{subCategoryItem.name}</span>
              <span className="small text-secondary text-nowrap">
                {subCategoryItem.documents.length}
              </span>
              <AppIcon name="chevron-right" size={16} />
            </button>
          ))}
        </div>
      </nav>
    ) : (
      <div className="text-secondary px-2 py-3" role="status">No folders found.</div>
    );
  }

  return documents.length ? (
    <nav aria-label={subCategory.name}>
      <div className="list-group list-group-flush gap-1">
        {documents.map((document) => (
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
              recentlyDeselectedDocumentId === document.id && 'smplfy-document-recently-deselected',
            )}
            aria-current={selectedDocumentId === document.id ? 'true' : undefined}
            key={document.id}
            onClick={(event) => onSelectDocument(document.id, event)}
            onPointerLeave={() => {
              if (recentlyDeselectedDocumentId === document.id) {
                onClearRecentlyDeselectedDocument();
              }
            }}
          >
            <AppIcon name="file-text" size={16} />
            <span className="text-truncate flex-grow-1 fw-medium">{document.name}</span>
            {showDocumentStatusBadge && document.documentState === 'pending' ? (
              <Badge tone="warning" shape="pill" className="smplfy-document-status-badge">
                Pending
              </Badge>
            ) : null}
            {document.expiringSoon && !(showDocumentStatusBadge && document.documentState === 'pending') ? (
              <Badge tone="danger" shape="pill" className="smplfy-document-expiring-badge">
                Expiring soon
              </Badge>
            ) : null}
          </button>
        ))}
      </div>
    </nav>
  ) : (
    <div className="smplfy-document-empty-state text-secondary px-2 py-3" role="status">
      {emptyDocumentMessage}
    </div>
  );
}

function DocumentPreviewEmptyState() {
  return (
    <section className="smplfy-card smplfy-document-preview-card card h-100">
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

function DocumentPreview({ document, onOpenDetails }) {
  if (!document) {
    return <DocumentPreviewEmptyState />;
  }

  return (
    <section className="smplfy-card smplfy-document-preview-card card h-100">
      <div className="card-body d-flex flex-column p-0">
        <div className="smplfy-document-preview-header d-flex align-items-center justify-content-between gap-3 border-bottom bg-white">
          <div className="min-w-0">
            <h2 className="h5 fw-semibold text-dark text-truncate mb-1">{document.name}</h2>
            <div className="text-secondary fw-medium">{getDocumentCreatedOn(document)}</div>
          </div>
          <div className="d-flex align-items-center gap-2 flex-shrink-0">
            <SecondaryButton leftIcon="download" size="medium">
              Download
            </SecondaryButton>
            <PrimaryButton rightIcon="external-link" size="medium" onClick={() => onOpenDetails(document)}>
              Details
            </PrimaryButton>
          </div>
        </div>

        <div className="smplfy-document-preview-canvas d-flex flex-column align-items-center justify-content-center text-center flex-grow-1">
          <svg width="152" height="120" viewBox="0 0 152 120" role="img" aria-label="Document preview" className="mb-3 text-primary">
            <rect x="31" y="12" width="84" height="96" rx="12" fill="currentColor" opacity="0.08" />
            <path d="M52 38h42M52 54h42M52 70h28" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.42" />
            <rect x="78" y="28" width="40" height="52" rx="8" fill="white" stroke="currentColor" strokeWidth="3" opacity="0.62" />
            <path d="M90 46h16M90 59h16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.48" />
            <circle cx="106" cy="91" r="18" fill="var(--smplfy-primitive-blue-75)" stroke="currentColor" strokeWidth="3" opacity="0.72" />
            <path d="M98 91h16M106 83v16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.62" />
          </svg>
          <h3 className="h5 mb-2 fw-semibold text-dark">Document preview</h3>
          <p className="text-secondary mb-0">{document.description || document.subCategoryName}</p>
        </div>
      </div>
    </section>
  );
}

export default function DocumentManagementPage({
  title = 'Document Management',
  activeNav = 'document-management',
  combinedMode = false,
  stepNavigationMode = false,
  onNavigate,
  onOpenDocumentDetails,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  sidebarBadgeCounts,
}) {
  const [documentsTree, setDocumentsTree] = useState(() => documentTree);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [documentStatus, setDocumentStatus] = useState(combinedMode ? 'all' : 'approved');
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const [recentlyDeselectedDocumentId, setRecentlyDeselectedDocumentId] = useState(null);
  const [stepCategoryId, setStepCategoryId] = useState(null);
  const [stepSubCategoryId, setStepSubCategoryId] = useState(null);
  const [expandedCategoryIds, setExpandedCategoryIds] = useState(() => allCategoryIds);
  const [expandedSubCategoryIds, setExpandedSubCategoryIds] = useState(() => allSubCategoryIds);
  const [newDocumentModalOpen, setNewDocumentModalOpen] = useState(false);
  const [newDocumentDraft, setNewDocumentDraft] = useState(newDocumentInitialDraft);
  const [newDocumentErrors, setNewDocumentErrors] = useState({});
  const visibleCategories = useMemo(
    () => filterDocumentTree(documentsTree, debouncedSearchQuery, documentStatus),
    [debouncedSearchQuery, documentStatus, documentsTree],
  );
  const totalDocumentCount = useMemo(
    () => countDocuments(filterDocumentTree(documentsTree, '', documentStatus)),
    [documentStatus, documentsTree],
  );
  const visibleDocumentCount = useMemo(() => countDocuments(visibleCategories), [visibleCategories]);
  const statusCategories = useMemo(
    () => filterDocumentTree(documentsTree, '', documentStatus),
    [documentStatus, documentsTree],
  );
  const stepCategory = useMemo(
    () => statusCategories.find((category) => category.id === stepCategoryId) ?? null,
    [statusCategories, stepCategoryId],
  );
  const stepSubCategory = useMemo(
    () => stepCategory?.subCategories.find((subCategory) => subCategory.id === stepSubCategoryId) ?? null,
    [stepCategory, stepSubCategoryId],
  );
  const normalizedStepSearchQuery = debouncedSearchQuery.trim().toLowerCase();
  const stepVisibleCategories = useMemo(
    () => statusCategories.filter((category) => (
      !normalizedStepSearchQuery || category.name.toLowerCase().includes(normalizedStepSearchQuery)
    )),
    [normalizedStepSearchQuery, statusCategories],
  );
  const stepVisibleSubCategories = useMemo(
    () => (stepCategory?.subCategories ?? []).filter((subCategory) => (
      !normalizedStepSearchQuery || subCategory.name.toLowerCase().includes(normalizedStepSearchQuery)
    )),
    [normalizedStepSearchQuery, stepCategory],
  );
  const stepVisibleDocuments = useMemo(
    () => (stepSubCategory?.documents ?? []).filter((document) => (
      !normalizedStepSearchQuery || document.name.toLowerCase().includes(normalizedStepSearchQuery)
    )),
    [normalizedStepSearchQuery, stepSubCategory],
  );
  const documentCategoryOptions = useMemo(() => getSubCategoryOptions(documentTree), []);
  const searchLabel = stepNavigationMode
    ? stepSubCategory
      ? `Search in ${stepSubCategory.name}`
      : stepCategory
        ? `Search in ${stepCategory.name}`
        : 'Search folders'
    : combinedMode
      ? `Search in ${totalDocumentCount} documents`
      : documentStatus === 'pending'
        ? 'Search in pending docs'
        : 'Search in approved docs';
  const documentCountLabel = debouncedSearchQuery.trim()
    ? `${visibleDocumentCount} ${visibleDocumentCount === 1 ? 'document' : 'documents'} found for "${debouncedSearchQuery.trim()}"`
    : combinedMode
      ? `${totalDocumentCount} documents`
      : `${totalDocumentCount} ${documentStatus === 'pending' ? 'Pending' : 'Approved'} Documents`;
  const selectedDocumentPath = useMemo(
    () => findDocumentPath(documentsTree, selectedDocumentId, documentStatus),
    [documentStatus, documentsTree, selectedDocumentId],
  );
  const selectedDocument = useMemo(
    () => findDocumentById(documentsTree, selectedDocumentId, documentStatus),
    [documentStatus, documentsTree, selectedDocumentId],
  );
  const isTreeFullyCollapsed = expandedCategoryIds.length === 0;
  const hasSelectedDocumentPath = Boolean(selectedDocumentPath.categoryId && selectedDocumentPath.subCategoryId);
  const isTreeCollapsedToSelectedDocument =
    hasSelectedDocumentPath &&
    expandedCategoryIds.length === 1 &&
    expandedCategoryIds[0] === selectedDocumentPath.categoryId &&
    expandedSubCategoryIds.length === 1 &&
    expandedSubCategoryIds[0] === selectedDocumentPath.subCategoryId;
  const shouldExpandTree = isTreeFullyCollapsed || isTreeCollapsedToSelectedDocument;
  const handleDocumentStatusChange = (nextDocumentStatus) => {
    setDocumentStatus(nextDocumentStatus);
    setSelectedDocumentId(null);
    setRecentlyDeselectedDocumentId(null);
    setStepCategoryId(null);
    setStepSubCategoryId(null);
    setSearchQuery('');
    setDebouncedSearchQuery('');
  };
  const handleNewDocumentChange = (field, value) => {
    setNewDocumentDraft((current) => ({
      ...current,
      [field]: value,
    }));
    setNewDocumentErrors((current) => ({
      ...current,
      [field]: '',
    }));
  };
  const handleCloseNewDocumentModal = () => {
    setNewDocumentModalOpen(false);
    setNewDocumentDraft(newDocumentInitialDraft);
    setNewDocumentErrors({});
  };
  const handleSubmitNewDocument = () => {
    const nextErrors = {};
    const documentName = newDocumentDraft.name.trim();

    if (!documentName) {
      nextErrors.name = 'Document name is required.';
    }

    if (!newDocumentDraft.category) {
      nextErrors.category = `${stepNavigationMode ? 'Folder' : 'Category'} is required.`;
    }

    if (newDocumentDraft.file) {
      const fileName = newDocumentDraft.file.name ?? '';
      const extension = fileName.split('.').pop()?.toLowerCase();

      if (!allowedDocumentExtensions.has(extension)) {
        nextErrors.file = 'Only PDF, DOC, or DOCX files are allowed.';
      } else if (newDocumentDraft.file.size > maxDocumentFileSize) {
        nextErrors.file = 'File size must be 10MB or less.';
      }
    }

    if (Object.keys(nextErrors).length) {
      setNewDocumentErrors(nextErrors);
      return;
    }

    const statusDocumentsKey = documentStatus === 'pending' ? 'pendingDocuments' : 'approvedDocuments';
    const documentId = `document-${Date.now()}`;
    const newDocument = {
      id: documentId,
      name: documentName,
      description: newDocumentDraft.description.trim(),
      fileName: newDocumentDraft.file?.name ?? '',
      createdOn: '12/06/26 12:36 PM',
      expiringSoon: false,
    };
    const nextDocumentPath = findSubCategoryPath(documentTree, newDocumentDraft.category);

    setDocumentsTree((currentTree) =>
      currentTree.map((category) => ({
        ...category,
        subCategories: category.subCategories.map((subCategory) =>
          subCategory.id === newDocumentDraft.category
            ? {
                ...subCategory,
                [statusDocumentsKey]: [...subCategory[statusDocumentsKey], newDocument],
              }
            : subCategory,
        ),
      })),
    );

    if (nextDocumentPath.categoryId) {
      setExpandedCategoryIds((current) =>
        current.includes(nextDocumentPath.categoryId)
          ? current
          : [...current, nextDocumentPath.categoryId],
      );
    }

    if (nextDocumentPath.subCategoryId) {
      setExpandedSubCategoryIds((current) =>
        current.includes(nextDocumentPath.subCategoryId)
          ? current
          : [...current, nextDocumentPath.subCategoryId],
      );
    }

    if (stepNavigationMode) {
      setStepCategoryId(nextDocumentPath.categoryId);
      setStepSubCategoryId(nextDocumentPath.subCategoryId);
      setSelectedDocumentId(documentId);
      setSearchQuery('');
      setDebouncedSearchQuery('');
    }

    handleCloseNewDocumentModal();
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [searchQuery]);
  useEffect(() => {
    setDocumentStatus(combinedMode ? 'all' : 'approved');
    setSelectedDocumentId(null);
    setRecentlyDeselectedDocumentId(null);
    setStepCategoryId(null);
    setStepSubCategoryId(null);
    setSearchQuery('');
    setDebouncedSearchQuery('');
  }, [combinedMode, stepNavigationMode]);
  const toggleCategory = (categoryId) => {
    if (selectedDocumentPath.categoryId === categoryId && expandedCategoryIds.includes(categoryId)) {
      return;
    }

    setExpandedCategoryIds((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId],
    );
  };
  const toggleSubCategory = (subCategoryId) => {
    if (selectedDocumentPath.subCategoryId === subCategoryId && expandedSubCategoryIds.includes(subCategoryId)) {
      return;
    }

    setExpandedSubCategoryIds((current) =>
      current.includes(subCategoryId)
        ? current.filter((id) => id !== subCategoryId)
        : [...current, subCategoryId],
    );
  };
  const handleToggleTreeExpansion = () => {
    if (shouldExpandTree) {
      setExpandedCategoryIds(allCategoryIds);
      setExpandedSubCategoryIds(allSubCategoryIds);
      return;
    }

    if (hasSelectedDocumentPath) {
      setExpandedCategoryIds([selectedDocumentPath.categoryId]);
      setExpandedSubCategoryIds([selectedDocumentPath.subCategoryId]);
      return;
    }

    setExpandedCategoryIds([]);
    setExpandedSubCategoryIds([]);
  };
  const handleSelectDocument = (documentId, event) => {
    if (selectedDocumentId === documentId) {
      setSelectedDocumentId(null);
      setRecentlyDeselectedDocumentId(documentId);
      event?.currentTarget?.blur();
      return;
    }

    const nextDocumentPath = findDocumentPath(documentsTree, documentId, documentStatus);

    setSelectedDocumentId(documentId);
    setRecentlyDeselectedDocumentId(null);
    setExpandedCategoryIds((current) =>
      nextDocumentPath.categoryId && !current.includes(nextDocumentPath.categoryId)
        ? [...current, nextDocumentPath.categoryId]
        : current,
    );
    setExpandedSubCategoryIds((current) =>
      nextDocumentPath.subCategoryId && !current.includes(nextDocumentPath.subCategoryId)
        ? [...current, nextDocumentPath.subCategoryId]
        : current,
    );
  };
  const showStepCategories = () => {
    setStepCategoryId(null);
    setStepSubCategoryId(null);
    setSelectedDocumentId(null);
    setRecentlyDeselectedDocumentId(null);
    setSearchQuery('');
    setDebouncedSearchQuery('');
  };
  const showStepSubCategories = () => {
    setStepSubCategoryId(null);
    setSelectedDocumentId(null);
    setRecentlyDeselectedDocumentId(null);
    setSearchQuery('');
    setDebouncedSearchQuery('');
  };
  const handleSelectStepCategory = (categoryId) => {
    setStepCategoryId(categoryId);
    setStepSubCategoryId(null);
    setSelectedDocumentId(null);
    setRecentlyDeselectedDocumentId(null);
    setSearchQuery('');
    setDebouncedSearchQuery('');
  };
  const handleSelectStepSubCategory = (subCategoryId) => {
    setStepSubCategoryId(subCategoryId);
    setSelectedDocumentId(null);
    setRecentlyDeselectedDocumentId(null);
    setSearchQuery('');
    setDebouncedSearchQuery('');
  };

  return (
    <AppChrome
      activeNav={activeNav}
      onNavigate={onNavigate}
      breadcrumbs={[{ key: activeNav, label: title, current: true }]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      sidebarBadgeCounts={sidebarBadgeCounts}
      pageHeader={<DocumentManagementHeader title={title} onNewDocument={() => setNewDocumentModalOpen(true)} />}
    >
      <main className="smplfy-document-management-page bg-body-tertiary p-4 min-vh-100">
        <div className="container-fluid px-0">
          <div className="row g-4">
            <aside className="col-12 col-xl-3 pe-0">
              {combinedMode ? null : (
                <div className="nav nav-pills p-1 bg-body-tertiary border rounded mb-3" role="tablist" aria-label="Document status">
                  <NavSelector
                    active={documentStatus === 'approved'}
                    className="flex-fill"
                    size="medium"
                    onClick={() => handleDocumentStatusChange('approved')}
                  >
                    Approved
                  </NavSelector>
                  <NavSelector
                    active={documentStatus === 'pending'}
                    className="flex-fill"
                    size="medium"
                    onClick={() => handleDocumentStatusChange('pending')}
                  >
                    Pending
                  </NavSelector>
                </div>
              )}

              <section className="smplfy-card card h-100 border-0 shadow-none">
                <div className="card-body">
                  {stepNavigationMode ? (
                    <>
                      <DocumentSearch value={searchQuery} onChange={setSearchQuery} label={searchLabel} />
                      <StepBreadcrumb
                        category={stepCategory}
                        subCategory={stepSubCategory}
                        onBack={stepSubCategory ? showStepSubCategories : showStepCategories}
                        onShowCategories={showStepCategories}
                        onShowSubCategories={showStepSubCategories}
                      />
                      <StepDocumentNavigation
                        categories={stepVisibleCategories}
                        category={stepCategory ? { ...stepCategory, subCategories: stepVisibleSubCategories } : null}
                        subCategory={stepSubCategory}
                        documents={stepVisibleDocuments}
                        selectedDocumentId={selectedDocumentId}
                        recentlyDeselectedDocumentId={recentlyDeselectedDocumentId}
                        onSelectCategory={handleSelectStepCategory}
                        onSelectSubCategory={handleSelectStepSubCategory}
                        onClearRecentlyDeselectedDocument={() => setRecentlyDeselectedDocumentId(null)}
                        onSelectDocument={handleSelectDocument}
                        emptyDocumentMessage={documentStatus === 'pending' ? 'No pending docs' : 'No documents found'}
                        showDocumentStatusBadge={combinedMode}
                        showFolderIcons={combinedMode && !stepNavigationMode}
                      />
                    </>
                  ) : (
                    <>
                      <DocumentSearch value={searchQuery} onChange={setSearchQuery} label={searchLabel} />
                      <DocumentTreeToggle
                        countLabel={documentCountLabel}
                        shouldExpandTree={shouldExpandTree}
                        onClick={handleToggleTreeExpansion}
                      />

                      <DocumentNavigation
                        categories={visibleCategories}
                        selectedDocumentId={selectedDocumentId}
                        recentlyDeselectedDocumentId={recentlyDeselectedDocumentId}
                        expandedCategoryIds={expandedCategoryIds}
                        expandedSubCategoryIds={expandedSubCategoryIds}
                        onToggleCategory={toggleCategory}
                        onToggleSubCategory={toggleSubCategory}
                        onClearRecentlyDeselectedDocument={() => setRecentlyDeselectedDocumentId(null)}
                        onSelectDocument={handleSelectDocument}
                        emptyDocumentMessage={documentStatus === 'pending' ? 'No pending docs' : 'No documents found'}
                        showDocumentStatusBadge={combinedMode}
                      />
                    </>
                  )}
                </div>
              </section>
            </aside>

            <section className="col-12 col-xl-9">
              <DocumentPreview
                document={selectedDocument}
                onOpenDetails={(document) => onOpenDocumentDetails?.(getSelectedDocumentDetails(document), {
                  sourcePage: activeNav,
                  sourceLabel: title,
                })}
              />
            </section>
          </div>
        </div>
      </main>
      <NewDocumentModal
        open={newDocumentModalOpen}
        values={newDocumentDraft}
        errors={newDocumentErrors}
        categoryOptions={documentCategoryOptions}
        categoryLabel={stepNavigationMode ? 'Folder' : 'Category'}
        onChange={handleNewDocumentChange}
        onCancel={handleCloseNewDocumentModal}
        onSubmit={handleSubmitNewDocument}
      />
    </AppChrome>
  );
}
