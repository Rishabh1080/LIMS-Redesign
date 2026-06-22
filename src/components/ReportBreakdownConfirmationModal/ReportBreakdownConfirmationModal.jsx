import { useEffect, useState } from 'react';
import breakdownImage from '../../../assets/breakdown.png';
import Checkbox from '../Checkbox/Checkbox';
import Modal from '../Modal/Modal';
import PrimaryButton from '../PrimaryButton/PrimaryButton';
import SecondaryButton from '../SecondaryButton';
import './report-breakdown-confirmation-modal.scss';

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

export default function ReportBreakdownConfirmationModal({
  open,
  instrumentName,
  onCancel,
  onConfirm,
}) {
  const [acknowledged, setAcknowledged] = useState(false);
  const [acknowledgementError, setAcknowledgementError] = useState('');

  useEffect(() => {
    if (!open) {
      setAcknowledged(false);
      setAcknowledgementError('');
    }
  }, [open]);

  const handleConfirm = () => {
    if (!acknowledged) {
      setAcknowledgementError('Confirmation required for reporting breakdown');
      return;
    }

    onConfirm?.();
  };

  return (
    <Modal
      open={open}
      title="Report Instrument Breakdown"
      titleId="report-instrument-breakdown-title"
      titleIcon="alert-circle"
      onClose={onCancel}
      size="lg"
      cardClassName="smplfy-report-breakdown-modal"
      actionsClassName="border-top"
      actions={
        <>
          <SecondaryButton leftIcon="close" onClick={onCancel}>Cancel</SecondaryButton>
          <PrimaryButton styleVariant="destructive" leftIcon="alert-circle" onClick={handleConfirm}>
            Mark as Broken
          </PrimaryButton>
        </>
      }
    >
      <div className="row gx-4 align-items-start mx-0">
        <div className="col-12 col-md-5">
          <img
            src={breakdownImage}
            alt=""
            className="img-fluid rounded"
            aria-hidden="true"
          />
        </div>

        <div className="col-12 col-md-7 d-flex flex-column gap-3 pe-4 mt-3">
          <p className="mb-0">
            This will mark <span className="fw-semibold">{instrumentName}</span> as broken and further allocation might be affected until the breakdown is resolved.
          </p>
          <p className="mb-0">Are you sure you want to continue?</p>

          <div className="d-flex flex-column gap-2">
            <div>
              <label className="d-flex align-items-center gap-1 mb-0" style={{ marginLeft: '-8px' }}>
                <Checkbox
                  checked={acknowledged}
                  invalid={Boolean(acknowledgementError && !acknowledged)}
                  onChange={(nextChecked) => {
                    setAcknowledged(nextChecked);
                    if (nextChecked) {
                      setAcknowledgementError('');
                    }
                  }}
                />
                <span>I understand.</span>
              </label>
              <div
                className={joinClasses(
                  'smplfy-form-feedback',
                  'invalid-feedback',
                  'd-block',
                  !acknowledgementError && 'invisible',
                )}
              >
                {acknowledgementError || 'Confirmation required for reporting breakdown'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
