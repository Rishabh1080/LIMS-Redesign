import { useEffect, useMemo, useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import DataTable from '../components/DataTable';
import { FormElement } from '../components/FormControls';
import Modal from '../components/Modal/Modal';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';

const defaultLeaveRecords = [
  {
    id: 'leave-record-001',
    employeeName: 'Deepak Cybit',
    fromDate: '04/03/2026',
    toDate: '05/03/2026',
    remarks: 'Sick leave',
    attachmentName: 'medical-note.pdf',
  },
  {
    id: 'leave-record-002',
    employeeName: 'Deepak Cybit',
    fromDate: '11/03/2026',
    toDate: '11/03/2026',
    remarks: 'Personal work',
    attachmentName: 'personal-leave.docx',
  },
  {
    id: 'leave-record-003',
    employeeName: 'Deepak Cybit',
    fromDate: '18/03/2026',
    toDate: '20/03/2026',
    remarks: 'Family function',
    attachmentName: 'leave-request.pdf',
  },
  {
    id: 'leave-record-004',
    employeeName: 'Deepak Cybit',
    fromDate: '28/03/2026',
    toDate: '29/03/2026',
    remarks: 'Travel leave',
    attachmentName: 'travel-plan.doc',
  },
  {
    id: 'leave-record-005',
    employeeName: 'Deepak Cybit',
    fromDate: '02/04/2026',
    toDate: '03/04/2026',
    remarks: 'Annual leave',
    attachmentName: 'annual-leave.pdf',
  },
];

const initialDraft = {
  fromDate: '',
  toDate: '',
  remarks: '',
  attachment: null,
};

const allowedFileExtensions = ['pdf', 'doc', 'docx'];
const maxFileSize = 10 * 1024 * 1024;

function getFileExtension(fileName = '') {
  const parts = String(fileName).split('.');
  return parts.length > 1 ? parts.at(-1)?.toLowerCase() ?? '' : '';
}

function validateAttachment(file) {
  if (!file) {
    return null;
  }

  const extension = getFileExtension(file.name);
  if (!allowedFileExtensions.includes(extension)) {
    return 'Please upload a PDF, DOC, or DOCX file.';
  }

  if (file.size > maxFileSize) {
    return 'File size must be 10MB or less.';
  }

  return null;
}

function LeaveRecordsHeader({ onAddRecord }) {
  return (
    <section className="bg-white border-bottom px-4 py-3">
      <div className="container-fluid px-0">
        <div className="row align-items-center justify-content-between gx-0 gy-3">
          <div className="col-auto">
            <h1 className="h5 mb-0 fw-semibold text-dark">Leave Records</h1>
          </div>

          <div className="col-auto">
            <PrimaryButton leftIcon="plus" onClick={onAddRecord}>
              Add record
            </PrimaryButton>
          </div>
        </div>
      </div>
    </section>
  );
}

function LeaveRecordsFormModal({
  open,
  values,
  errors,
  onChange,
  onBlur,
  onCancel,
  onSubmit,
}) {
  if (!open) {
    return null;
  }

  return (
    <Modal
      open={open}
      title="Add record"
      titleId="leave-records-modal-title"
      titleIcon="leave-records"
      onClose={onCancel}
      size="md"
      actions={
        <>
          <SecondaryButton leftIcon="close" size="large" onClick={onCancel}>
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" form="leave-records-form" leftIcon="save">
            Submit
          </PrimaryButton>
        </>
      }
    >
      <form
        id="leave-records-form"
        className="d-flex flex-column gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <FormElement
              type="date"
              label="From"
              message={errors.fromDate}
              messageTone="error"
              inputProps={{
                value: values.fromDate,
                placeholder: 'Select date',
                onChange: (event) => onChange('fromDate', event.target.value),
                onBlur: () => onBlur('fromDate', values.fromDate),
              }}
            />
          </div>

          <div className="col-12 col-md-6">
            <FormElement
              type="date"
              label="To"
              message={errors.toDate}
              messageTone="error"
              inputProps={{
                value: values.toDate,
                placeholder: 'Select date',
                onChange: (event) => onChange('toDate', event.target.value),
                onBlur: () => onBlur('toDate', values.toDate),
              }}
            />
          </div>
        </div>

        <div>
          <FormElement
            type="text"
            label="Remarks"
            inputProps={{
              value: values.remarks,
              placeholder: 'Enter remarks',
              onChange: (event) => onChange('remarks', event.target.value),
            }}
          />
        </div>

        <div>
          <FormElement
            type="file"
            label="File upload"
            helperText="Please upload PDF/DOC/DOCX files and limit upto 10MB"
            message={errors.attachment}
            messageTone="error"
            inputProps={{
              value: values.attachment,
              placeholder: 'Upload file',
              accept: '.pdf,.doc,.docx',
              onChange: (event) => onChange('attachment', event.target.value),
              onBlur: () => onBlur('attachment', values.attachment),
            }}
          />
        </div>
      </form>
    </Modal>
  );
}

function LeaveRecordsEmptyState() {
  return (
    <div className="card-body d-flex flex-column align-items-center justify-content-center text-center py-5">
      <div className="d-inline-flex align-items-center justify-content-center rounded-3 bg-primary-subtle text-primary mb-3 p-3 fw-semibold">
        <span>LR</span>
      </div>
      <div className="fw-semibold text-dark">No leave records</div>
      <div className="text-secondary mt-1">
        New records added through the primary action will appear here.
      </div>
    </div>
  );
}

export default function LeaveRecordsPage({
  records = defaultLeaveRecords,
  onAddRecord,
  onViewRecord,
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
}) {
  const [visibleRecords, setVisibleRecords] = useState(records);
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState(initialDraft);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setVisibleRecords(records);
  }, [records]);

  useEffect(() => {
    if (!modalOpen) {
      setErrors({});
    }
  }, [modalOpen]);

  const recordCountLabel = useMemo(() => `${visibleRecords.length} Records`, [visibleRecords.length]);

  const openModal = () => {
    setDraft(initialDraft);
    setErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setDraft(initialDraft);
    setErrors({});
  };

  const handleFieldChange = (field, value) => {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleFieldBlur = (field, value) => {
    if (field === 'attachment') {
      const nextError = validateAttachment(value);
      setErrors((current) => {
        const next = { ...current };
        if (nextError) {
          next.attachment = nextError;
        } else {
          delete next.attachment;
        }
        return next;
      });
    }
  };

  const handleSubmit = () => {
    const nextErrors = {};

    const attachmentError = validateAttachment(draft.attachment);
    if (attachmentError) {
      nextErrors.attachment = attachmentError;
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    const nextRecord = {
      id: `leave-record-${Date.now()}`,
      employeeName: 'Deepak Cybit',
      fromDate: draft.fromDate || '—',
      toDate: draft.toDate || '—',
      remarks: draft.remarks.trim() || '—',
      attachmentName: draft.attachment?.name || '—',
    };

    setVisibleRecords((current) => [nextRecord, ...current]);
    onAddRecord?.(nextRecord);
    closeModal();
  };

  return (
    <AppChrome
      activeNav="leave-records"
      onNavigate={onNavigate}
      breadcrumbs={[{ key: 'leave-records', label: 'Leave Records', current: true }]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      pageHeader={<LeaveRecordsHeader onAddRecord={openModal} />}
    >
      <main className="bg-body-tertiary p-4 min-vh-100">
        <div className="container-fluid px-0">
          <div className="text-secondary fw-medium mb-3">{recordCountLabel}</div>

          {visibleRecords.length ? (
            <DataTable>
              <thead>
                <tr>
                  <th scope="col">Sr. No</th>
                  <th scope="col">Employee name</th>
                  <th scope="col">From</th>
                  <th scope="col">To</th>
                  <th scope="col" className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleRecords.map((record, index) => (
                  <tr key={record.id}>
                    <td className="text-nowrap">{index + 1}</td>
                    <td>{record.employeeName}</td>
                    <td className="text-nowrap">{record.fromDate}</td>
                    <td className="text-nowrap">{record.toDate}</td>
                    <td className="text-center">
                      <SecondaryButton
                        size="medium"
                        leftIcon="external-link"
                        onClick={() => onViewRecord?.(record.id)}
                      >
                        View
                      </SecondaryButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          ) : (
            <section className="smplfy-card card">
              <LeaveRecordsEmptyState />
            </section>
          )}
        </div>
      </main>

      <LeaveRecordsFormModal
        open={modalOpen}
        values={draft}
        errors={errors}
        onChange={handleFieldChange}
        onBlur={handleFieldBlur}
        onCancel={closeModal}
        onSubmit={handleSubmit}
      />
    </AppChrome>
  );
}
