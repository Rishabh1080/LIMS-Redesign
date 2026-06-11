import { useEffect, useState } from 'react';
import { FormElement } from './FormControls';
import Modal from './Modal/Modal';
import PrimaryButton from './PrimaryButton/PrimaryButton';
import SecondaryButton from './SecondaryButton';

export default function TestRequestApprovalActionModal({ action, requestId, onClose, onSubmit }) {
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState('');
  const [narration, setNarration] = useState('');

  useEffect(() => {
    if (!action || !requestId) {
      setComment('');
      setCommentError('');
      setNarration('');
    }
  }, [action, requestId]);

  if (!action || !requestId) {
    return null;
  }

  const isApprove = action === 'approve';
  const isReview = action === 'review';
  const isPositiveAction = isApprove || isReview;
  const actionLabel = isReview ? 'Review' : isApprove ? 'Approve' : 'Reject';
  const handleSubmit = () => {
    if (!comment.trim()) {
      setCommentError('Comment is required.');
      return;
    }

    setCommentError('');
    onSubmit?.({
      action,
      requestId,
      comment,
      narration,
    });
  };

  return (
    <Modal
      open={Boolean(action && requestId)}
      title={`${actionLabel} Test Request`}
      titleId="test-request-approval-action-title"
      titleIcon={isPositiveAction ? 'check' : 'close'}
      onClose={onClose}
      size="md"
      actionsClassName="justify-content-between"
      actions={
        <>
          <SecondaryButton leftIcon="close" size="large" onClick={onClose}>
            Cancel
          </SecondaryButton>
          <PrimaryButton
            leftIcon={isPositiveAction ? 'check' : 'close'}
            styleVariant={isPositiveAction ? 'positive' : 'destructive'}
            onClick={handleSubmit}
          >
            {actionLabel}
          </PrimaryButton>
        </>
      }
    >
      <div className="d-flex flex-column gap-3">
        <div className="d-flex align-items-center justify-content-between gap-3">
          <div className="text-secondary fw-medium">Test Request ID</div>
          <div className="text-dark fw-semibold text-end">{requestId}</div>
        </div>
        <FormElement
          type="text"
          mandatory
          label="Comment"
          message={commentError}
          messageTone="error"
          inputProps={{
            value: comment,
            placeholder: 'Add comment',
            onChange: (event) => {
              setComment(event.target.value);
              if (commentError) {
                setCommentError('');
              }
            },
          }}
        />
        {isApprove ? (
          <FormElement
            type="text"
            label="Narration"
            inputProps={{
              value: narration,
              placeholder: 'Add narration',
              onChange: (event) => setNarration(event.target.value),
            }}
          />
        ) : null}
      </div>
    </Modal>
  );
}
