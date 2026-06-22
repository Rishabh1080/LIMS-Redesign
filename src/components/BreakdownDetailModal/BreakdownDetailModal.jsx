import AppIcon from '../AppIcon';
import Modal from '../Modal/Modal';
import SecondaryButton from '../SecondaryButton';

function formatAttachment(value) {
  if (!value) return '-';
  if (typeof value === 'string') return value.split(/[\\/]/).pop() || value;
  return value.name || '-';
}

function formatInrAmount(value) {
  const amount = String(value ?? '').replace(/\D/g, '');

  if (!amount) return '-';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

function DetailPair({ label, value, className = '' }) {
  return (
    <div className={className}>
      <div className="small text-secondary mb-1">{label}</div>
      <div className="fw-medium text-dark">{value || '-'}</div>
    </div>
  );
}

function EventHeader({ icon, title, date, tone }) {
  return (
    <div className="d-flex align-items-center gap-3 mb-3">
      <span
        className={`d-inline-flex align-items-center justify-content-center rounded-circle p-2 bg-${tone}-subtle text-${tone}`}
      >
        <AppIcon name={icon} size={18} />
      </span>
      <div>
        <h3 className="h6 fw-semibold text-dark mb-1">{title}</h3>
        <div className="small text-secondary">{date || '-'}</div>
      </div>
    </div>
  );
}

export default function BreakdownDetailModal({
  open,
  breakdown,
  onClose,
}) {
  const isResolved = Boolean(breakdown?.resolvedOn);
  const reportedComments =
    breakdown?.breakdownComments
    || breakdown?.comments
    || breakdown?.details
    || breakdown?.summary
    || '-';

  return (
    <Modal
      open={open}
      title="Breakdown Detail"
      titleId="breakdown-detail-title"
      titleIcon="alert-circle"
      onClose={onClose}
      size="lg"
      actionsClassName="border-top"
      actions={
        <SecondaryButton leftIcon="close" onClick={onClose}>
          Close
        </SecondaryButton>
      }
    >
      <div className="list-group">
        <section className="list-group-item p-4">
          <EventHeader
            icon="alert-circle"
            title="Breakdown reported"
            date={breakdown?.reportedOn || breakdown?.breakdownDate}
            tone="danger"
          />
          <div className="row g-3">
            <DetailPair
              className="col-12 col-md-6"
              label="Breakdown date"
              value={breakdown?.breakdownDate}
            />
            <DetailPair
              className="col-12 col-md-6"
              label="Reported by"
              value={breakdown?.reportedBy || breakdown?.createdBy || 'Rishabh Gangwar'}
            />
            <DetailPair
              className="col-12 col-md-6"
              label="Attachments"
              value={formatAttachment(breakdown?.breakdownAttachment || breakdown?.attachment)}
            />
            <DetailPair
              className="col-12"
              label="Comments"
              value={reportedComments}
            />
          </div>
        </section>

        {isResolved ? (
          <section className="list-group-item p-4">
            <EventHeader
              icon="check"
              title="Breakdown resolved"
              date={breakdown?.resolvedOn}
              tone="success"
            />
            <div className="row g-3">
              <DetailPair
                className="col-12 col-md-6"
                label="Service date"
                value={breakdown?.resolutionServiceDate}
              />
              <DetailPair
                className="col-12 col-md-6"
                label="Vendor"
                value={breakdown?.resolutionVendor}
              />
              <DetailPair
                className="col-12 col-md-6"
                label="Cost"
                value={formatInrAmount(breakdown?.resolutionCost)}
              />
              <DetailPair
                className="col-12 col-md-6"
                label="Attachments"
                value={formatAttachment(breakdown?.resolutionAttachment)}
              />
              <DetailPair
                className="col-12"
                label="Comments"
                value={breakdown?.resolutionComments}
              />
            </div>
          </section>
        ) : null}
      </div>
    </Modal>
  );
}
