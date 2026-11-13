/*
 * The approval modal for a state-change request (Pending -> Under Allocation).
 * Same structure and classes as the prototype's RequestDetailsModal
 * (src/pages/RequestsForMePage.jsx): details and approver table on the left,
 * comment, check and Reject / Approve on the right. Tutorial-only changes: it
 * shows this inward's request, and the only check is "All parameters
 * information is present ?".
 */
import { useState } from 'react';
import Checkbox from '@proto/components/Checkbox/Checkbox';
import Modal from '@proto/components/Modal/Modal';
import PrimaryButton from '@proto/components/PrimaryButton/PrimaryButton';
import SecondaryButton from '@proto/components/SecondaryButton';
import '@proto/pages/requests-for-me-page.scss';

const joinClasses = (...values) => values.filter(Boolean).join(' ');

const badgeClass = {
  orange: 'text-warning bg-warning-subtle border border-warning',
  gray: 'text-secondary bg-secondary-subtle border border-secondary-subtle',
};

function StatusBadge({ label, color }) {
  return <span className={joinClasses('smplfy-badge', 'badge', badgeClass[color])}>{label}</span>;
}

const CHECK_LABEL = 'All parameters information is present ?';

export default function SampleApprovalModal({ open, sampleId, request, approverName, onCancel, onSubmit }) {
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState('');
  const [checked, setChecked] = useState(false);
  const [checkError, setCheckError] = useState('');

  if (!open) return null;

  const nextState = request?.nextState ?? 'Under Allocation';
  const approvers = [approverName, 'Quality Head', 'Technical Manager', 'Lab Director'];

  const handleAction = (action) => {
    let hasError = false;
    if (!comment.trim()) {
      setCommentError('Please add a comment to respond.');
      hasError = true;
    } else {
      setCommentError('');
    }
    if (action === 'approve' && !checked) {
      setCheckError('Complete all checks before approving this request.');
      hasError = true;
    } else {
      setCheckError('');
    }
    if (hasError) return;
    onSubmit?.({ action, sampleId, comment, checklistValues: { parametersPresent: checked } });
  };

  return (
    <Modal
      open={open}
      title={sampleId}
      titleId="sample-approval-action-title"
      size="xl"
      onClose={onCancel}
      cardClassName="smplfy-request-modal"
      bodyClassName="p-0 d-flex overflow-hidden"
      titleExtra={(
        <div className="smplfy-state-transition">
          <StatusBadge label="Pending" color="orange" />
          <span aria-hidden="true">→</span>
          <StatusBadge label={nextState} color="gray" />
        </div>
      )}
    >
      <section className="d-flex flex-column flex-grow-1 overflow-hidden border-end">
        <dl className="m-0 d-flex flex-column gap-3 border-bottom flex-shrink-0">
          <div className="row g-0 align-items-center">
            <dt className="col-auto mb-0">Request by</dt>
            <dd className="col mb-0">{request?.requestedBy ?? approverName}</dd>
          </div>
          <div className="row g-0 align-items-center">
            <dt className="col-auto mb-0">Requested on</dt>
            <dd className="col mb-0">{request?.requestedOn}</dd>
          </div>
          <div className="row g-0 align-items-center">
            <dt className="col-auto mb-0">Comment</dt>
            <dd className="col mb-0">{request?.comments || '—'}</dd>
          </div>
        </dl>

        <div className="flex-grow-1 overflow-auto">
          <div className="d-flex align-items-center gap-3 flex-wrap pb-3">
            <div className="smplfy-nav-link nav-link active">Approver details</div>
            <div className="fw-medium">0/{approvers.length} responded</div>
            <div className="smplfy-state-transition ms-auto">
              <StatusBadge label="Pending" color="orange" />
              <span aria-hidden="true">→</span>
              <StatusBadge label={nextState} color="gray" />
            </div>
          </div>

          <div className="table-responsive overflow-hidden">
            <table className="smplfy-table table table-bordered mb-0 align-middle">
              <thead>
                <tr>
                  <th scope="col">Sr.</th>
                  <th scope="col">Approver Name</th>
                  <th scope="col">Status</th>
                  <th scope="col">Days taken</th>
                  <th scope="col">Decision on</th>
                  <th scope="col">Comments</th>
                </tr>
              </thead>
              <tbody>
                {approvers.map((name, index) => (
                  <tr key={name}>
                    <td>{index + 1}</td>
                    <td>{name}</td>
                    <td>Pending</td>
                    <td>—</td>
                    <td>—</td>
                    <td>—</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <aside className="d-flex flex-column justify-content-between flex-shrink-0 overflow-hidden">
        <div className="d-flex flex-column gap-4">
          <div className="d-flex flex-column gap-2">
            <label className="smplfy-form-label form-label mb-0" htmlFor="request-comment">
              Comment <span className="text-danger">*</span>
            </label>
            <input
              id="request-comment"
              className={joinClasses('smplfy-form-control', 'form-control', commentError ? 'is-invalid' : '')}
              value={comment}
              placeholder="Add a comment to respond"
              onChange={(event) => {
                setComment(event.target.value);
                if (event.target.value.trim()) setCommentError('');
              }}
            />
            {commentError ? <div className="smplfy-form-feedback invalid-feedback d-block">{commentError}</div> : null}
          </div>

          <div className="d-flex flex-column gap-2">
            <label className="smplfy-request-checklist-item d-flex align-items-center gap-2">
              <Checkbox
                checked={checked}
                invalid={Boolean(checkError && !checked)}
                onChange={(next) => {
                  setChecked(next);
                  if (next) setCheckError('');
                }}
              />
              <span>{CHECK_LABEL}</span>
            </label>
            {checkError ? <div className="smplfy-form-feedback invalid-feedback d-block">{checkError}</div> : null}
          </div>
        </div>

        <div className="modal-footer border-top d-flex align-items-center justify-content-between">
          <PrimaryButton styleVariant="destructive" size="large" onClick={() => handleAction('reject')} leftIcon="close">
            Reject
          </PrimaryButton>
          <PrimaryButton styleVariant="positive" size="large" onClick={() => handleAction('approve')} leftIcon="check">
            Approve
          </PrimaryButton>
        </div>
      </aside>
    </Modal>
  );
}
