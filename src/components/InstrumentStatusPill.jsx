import AppIcon from './AppIcon';
import { isBreakdownServiceType } from '../data/instrumentServices';
import './InstrumentStatusPill.scss';

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

export function getInstrumentStatus(instrumentId, services = []) {
  const hasUnresolvedBreakdown = services.some((service) => (
    service.instrumentId === instrumentId
    && isBreakdownServiceType(service.serviceType || service.type)
    && !service.resolvedOn
  ));

  return hasUnresolvedBreakdown ? 'breakdown' : 'working';
}

export default function InstrumentStatusPill({ status }) {
  const isBreakdown = status === 'breakdown';

  return (
    <span
      className={joinClasses(
        'smplfy-instrument-status-pill',
        'd-inline-flex',
        'align-items-center',
        'justify-content-center',
        isBreakdown ? 'is-breakdown' : 'is-working',
      )}
    >
      {isBreakdown ? (
        <AppIcon name="alert-circle" size={16} stroke={2} />
      ) : (
        <span className="smplfy-instrument-status-dot" aria-hidden="true" />
      )}
      <span>{isBreakdown ? 'Breakdown' : 'Working'}</span>
    </span>
  );
}
