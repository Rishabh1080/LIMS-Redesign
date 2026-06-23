import { useEffect, useMemo, useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import { NewDocumentModal, getDocumentCategoryOptions } from './DocumentManagementPage';
import './sample-details-page.scss';
import './document-details-page.scss';

const fallbackDocument = {
  id: 'visit-tvs-motors',
  name: 'Visit to TVS Motors',
  description: 'Customer visit report and meeting notes.',
  categoryName: 'SOP Documents',
  subCategoryName: 'Visit Report',
  subCategoryId: 'visit-report',
  createdOn: '12/02/26 12:36 PM',
  fileName: 'visit-to-tvs-motors.pdf',
};

const allowedDocumentExtensions = new Set(['pdf', 'doc', 'docx']);
const maxDocumentFileSize = 10 * 1024 * 1024;

const documentActivityItems = [
  {
    label: 'Document opened',
    time: '12:36 PM',
    date: '12/02/26',
    person: 'Rishabh Gangwar',
    tone: 'info',
  },
  {
    label: 'Document approved',
    time: '12:18 PM',
    date: '12/02/26',
    person: 'Document Controller',
    tone: 'success',
  },
  {
    label: 'Document uploaded',
    time: '11:42 AM',
    date: '12/02/26',
    person: 'Quality Analyst',
    tone: 'neutral',
  },
];

function formatVersionButtonLabel(version, latestVersionNumber) {
  if (!version) {
    return 'Version: 0 (Latest)';
  }

  const versionValue = version.version || version.versionNumber;

  return `Version: ${versionValue}${version.versionNumber === latestVersionNumber ? ' (Latest)' : ''}`;
}

function DocumentDetailsHeader({ document, versionLabel, onBack, onOpenVersions, onNewVersion }) {
  return (
    <section className="smplfy-sample-details-header bg-white border-bottom">
      <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
        <div className="d-flex align-items-center gap-3 min-w-0">
          <SecondaryButton
            size="medium"
            leftIcon="chevron-left"
            className="px-0 flex-shrink-0"
            aria-label="Go back"
            onClick={onBack}
          />

          <div className="d-flex flex-column min-w-0 flex-grow-1">
            <div className="d-flex align-items-center gap-3 min-w-0">
              <h1 className="h5 mb-0 fw-semibold text-dark text-truncate">{document.name}</h1>
              <SecondaryButton size="medium" className="flex-shrink-0" onClick={onOpenVersions}>
                {versionLabel}
              </SecondaryButton>
            </div>
            <div className="d-inline-flex gap-2 text-secondary fw-medium">
              <span>{document.createdOn}</span>
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-3 flex-wrap">
          <SecondaryButton leftIcon="plus" size="large" onClick={onNewVersion}>
            New Version
          </SecondaryButton>
          <PrimaryButton leftIcon="download" size="large">
            Download
          </PrimaryButton>
        </div>
      </div>
    </section>
  );
}

function createInitialDocumentVersions(document) {
  return [
    {
      id: `${document.id || 'document'}-version-0`,
      versionNumber: 0,
      version: document.version || '0',
      name: document.name,
      date: document.createdOn,
      fileName: document.fileName,
    },
  ];
}

function formatDocumentVersionDate(date = new Date()) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function DocumentVersionsOffcanvas({
  open,
  versions,
  selectedVersionNumber,
  latestVersionNumber,
  onClose,
  onSelectVersion,
}) {
  return (
    <>
      {open ? <div className="offcanvas-backdrop fade show" onClick={onClose} /> : null}
      <aside
        className={`smplfy-offcanvas offcanvas offcanvas-end ${open ? 'show' : ''}`.trim()}
        tabIndex="-1"
        role={open ? 'dialog' : undefined}
        aria-hidden={open ? undefined : 'true'}
        aria-modal={open ? 'true' : undefined}
        aria-labelledby="document-versions-offcanvas-title"
      >
        <div className="offcanvas-header">
          <h2 className="offcanvas-title" id="document-versions-offcanvas-title">Document Versions</h2>
          <button type="button" className="btn-close" aria-label="Close versions" onClick={onClose} />
        </div>

        <div className="offcanvas-body">
          {versions.map((version) => {
            const isSelected = version.versionNumber === selectedVersionNumber;
            const isLatest = version.versionNumber === latestVersionNumber;

            return (
              <article
                className={`card border shadow-none bg-white ${isSelected ? 'border-primary' : ''}`.trim()}
                key={version.id}
                aria-label={`Version ${version.versionNumber}`}
                aria-current={isSelected ? 'true' : undefined}
              >
                <div className="card-body d-flex flex-column gap-2">
                  <div className="d-flex flex-column gap-0 min-w-0">
                    <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
                      <div className="d-inline-flex align-items-center gap-2 flex-wrap">
                        <span className="badge text-bg-light border text-secondary rounded-pill px-3 py-2">
                          V{version.version || version.versionNumber}
                        </span>
                        {isLatest ? (
                          <span className="badge text-bg-success rounded-pill px-3 py-2">Latest</span>
                        ) : null}
                      </div>
                      <div className="small text-secondary text-end ms-auto">{version.date}</div>
                    </div>
                    <div className="py-2">
                      <h3 className="h6 fw-semibold text-dark mb-0">{version.name}</h3>
                    </div>
                  </div>

                  <div className="d-flex align-items-center justify-content-end gap-3 flex-wrap">
                    <div className="d-flex align-items-center gap-2 flex-shrink-0">
                      <SecondaryButton leftIcon="download" size="medium">
                        Download
                      </SecondaryButton>
                      <PrimaryButton
                        rightIcon="external-link"
                        size="medium"
                        disabled={isSelected}
                        onClick={() => onSelectVersion(version.versionNumber)}
                      >
                        View
                      </PrimaryButton>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </aside>
    </>
  );
}

function DocumentContentCard() {
  return (
    <div className="smplfy-card card overflow-hidden">
      <section>
        <div className="card-header d-flex align-items-center">
          <h2 className="card-title mb-0">Preview</h2>
        </div>
        <div className="smplfy-document-details-preview d-flex flex-column align-items-center justify-content-center text-center">
          <AppIcon name="file-text" size={48} className="text-primary mb-3" />
          <div className="fw-semibold text-dark">Document preview</div>
          <div className="text-secondary mt-1">Record Entire Screen</div>
        </div>
      </section>
    </div>
  );
}

function RequestTrailCard() {
  return (
    <section className="smplfy-card card smplfy-sample-details-action is-resolved overflow-hidden">
      <div className="card-header d-flex align-items-center gap-3">
        <AppIcon name="check" size={24} stroke={2} />
        <span>No pending actions</span>
      </div>
      <div className="card-body">
        <p className="mb-0">No pending actions required from your end</p>
      </div>
    </section>
  );
}

function DocumentActivityRail() {
  return (
    <section className="smplfy-sample-details-activity">
      <div className="d-flex align-items-center justify-content-between">
        <h2>Activity</h2>
        <button className="smplfy-btn btn btn-link p-0 border-0 text-decoration-underline" type="button">See all</button>
      </div>
      <ol className="smplfy-sample-details-timeline list-unstyled mb-0">
        {documentActivityItems.map((item) => (
          <li className={`is-${item.tone}`} key={item.label}>
            <span />
            <div>
              <div>{item.label}</div>
              <div>
                <span>{item.time}</span>
                <span>{item.date}</span>
                {item.person ? <span>{item.person}</span> : null}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function DocumentDetailsPage({
  document,
  sourcePage = 'document-management',
  sourceLabel = 'Document Management',
  onBack,
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  sidebarBadgeCounts,
}) {
  const resolvedDocument = {
    ...fallbackDocument,
    ...document,
    createdOn: document?.createdOn || fallbackDocument.createdOn,
  };
  const categoryOptions = useMemo(() => getDocumentCategoryOptions(), []);
  const resolvedCategoryValue = resolvedDocument.subCategoryId
    || categoryOptions.find((option) => option.label.endsWith(`/ ${resolvedDocument.subCategoryName}`))?.value
    || '';
  const [versions, setVersions] = useState(() => createInitialDocumentVersions(resolvedDocument));
  const [selectedVersionNumber, setSelectedVersionNumber] = useState(0);
  const [versionsOffcanvasOpen, setVersionsOffcanvasOpen] = useState(false);
  const [createVersionModalOpen, setCreateVersionModalOpen] = useState(false);
  const [newVersionDraft, setNewVersionDraft] = useState(() => ({
    name: resolvedDocument.name,
    version: '',
    description: resolvedDocument.description || '',
    category: resolvedCategoryValue,
    file: null,
  }));
  const [newVersionErrors, setNewVersionErrors] = useState({});
  const latestVersionNumber = Math.max(...versions.map((version) => version.versionNumber));
  const selectedVersion =
    versions.find((version) => version.versionNumber === selectedVersionNumber) ?? versions[0];
  const versionLabel = formatVersionButtonLabel(selectedVersion, latestVersionNumber);

  useEffect(() => {
    setVersions(createInitialDocumentVersions(resolvedDocument));
    setSelectedVersionNumber(0);
    setVersionsOffcanvasOpen(false);
    setCreateVersionModalOpen(false);
    setNewVersionDraft({
      name: resolvedDocument.name,
      version: '',
      description: resolvedDocument.description || '',
      category: resolvedCategoryValue,
      file: null,
    });
    setNewVersionErrors({});
  }, [
    resolvedDocument.id,
    resolvedDocument.name,
    resolvedDocument.description,
    resolvedDocument.fileName,
    resolvedDocument.createdOn,
    resolvedCategoryValue,
  ]);

  const handleOpenCreateVersionModal = () => {
    setVersionsOffcanvasOpen(false);
    setNewVersionDraft({
      name: resolvedDocument.name,
      version: '',
      description: resolvedDocument.description || '',
      category: resolvedCategoryValue,
      file: null,
    });
    setNewVersionErrors({});
    setCreateVersionModalOpen(true);
  };

  const handleNewVersionChange = (field, value) => {
    setNewVersionDraft((current) => ({
      ...current,
      [field]: value,
    }));
    setNewVersionErrors((current) => ({
      ...current,
      [field]: '',
    }));
  };

  const handleCloseCreateVersionModal = () => {
    setCreateVersionModalOpen(false);
    setNewVersionErrors({});
  };

  const handleSubmitNewVersion = () => {
    const nextErrors = {};
    const documentName = newVersionDraft.name.trim();

    if (!documentName) {
      nextErrors.name = 'Document name is required.';
    }

    if (!newVersionDraft.version.trim()) {
      nextErrors.version = 'Version is required.';
    }

    if (!newVersionDraft.category) {
      nextErrors.category = 'Category is required.';
    }

    if (newVersionDraft.file) {
      const fileName = newVersionDraft.file.name ?? '';
      const extension = fileName.split('.').pop()?.toLowerCase();

      if (!allowedDocumentExtensions.has(extension)) {
        nextErrors.file = 'Only PDF, DOC, or DOCX files are allowed.';
      } else if (newVersionDraft.file.size > maxDocumentFileSize) {
        nextErrors.file = 'File size must be 10MB or less.';
      }
    }

    if (Object.keys(nextErrors).length) {
      setNewVersionErrors(nextErrors);
      return;
    }

    const nextVersionNumber = latestVersionNumber + 1;
    const nextVersion = {
      id: `${resolvedDocument.id || 'document'}-version-${nextVersionNumber}`,
      versionNumber: nextVersionNumber,
      version: newVersionDraft.version.trim(),
      name: documentName,
      date: formatDocumentVersionDate(),
      fileName: newVersionDraft.file?.name ?? resolvedDocument.fileName,
    };

    setVersions((current) => [nextVersion, ...current]);
    setSelectedVersionNumber(nextVersionNumber);
    setCreateVersionModalOpen(false);
    setNewVersionErrors({});
  };

  return (
    <AppChrome
      activeNav={sourcePage}
      onNavigate={onNavigate}
      breadcrumbs={[
        { key: sourcePage, label: sourceLabel },
        { key: 'document-details', label: resolvedDocument.name, current: true },
      ]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      sidebarBadgeCounts={sidebarBadgeCounts}
      pageHeader={(
        <DocumentDetailsHeader
          document={resolvedDocument}
          versionLabel={versionLabel}
          onBack={onBack}
          onOpenVersions={() => setVersionsOffcanvasOpen(true)}
          onNewVersion={handleOpenCreateVersionModal}
        />
      )}
    >
      <main className="smplfy-sample-details-page smplfy-document-details-page bg-body-tertiary p-4 min-vh-100">
        <div className="smplfy-sample-details-layout d-grid">
          <div className="smplfy-sample-details-main-panel">
            <DocumentContentCard />
          </div>

          <aside className="smplfy-sample-details-rail">
            <RequestTrailCard />
            <DocumentActivityRail />
          </aside>
        </div>
      </main>
      <DocumentVersionsOffcanvas
        open={versionsOffcanvasOpen}
        versions={versions}
        selectedVersionNumber={selectedVersionNumber}
        latestVersionNumber={latestVersionNumber}
        onClose={() => setVersionsOffcanvasOpen(false)}
        onSelectVersion={(versionNumber) => {
          setSelectedVersionNumber(versionNumber);
          setVersionsOffcanvasOpen(false);
        }}
      />
      <NewDocumentModal
        open={createVersionModalOpen}
        title="Create New Version"
        titleId="create-document-version-modal-title"
        primaryLabel="Create New Version"
        formId="create-document-version-form"
        values={newVersionDraft}
        errors={newVersionErrors}
        categoryOptions={categoryOptions}
        onChange={handleNewVersionChange}
        onCancel={handleCloseCreateVersionModal}
        onSubmit={handleSubmitNewVersion}
      />
    </AppChrome>
  );
}
