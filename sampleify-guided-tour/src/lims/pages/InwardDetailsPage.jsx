import { useMemo } from 'react';
import { IconArrowLeft, IconArrowRight, IconFlask, IconHourglassLow } from '@tabler/icons-react';
import { useLims } from '../../store/LimsStore';
import { getAnalyst } from '../../store/catalog';
import { getInwardView } from '../../store/selectors';
import { useNow } from '../../lib/hooks';
import { formatDate, formatDateTime, pluralize } from '../../lib/format';
import { Button, MetaItem, Pill, SampleStatusPill, TrStatusPill } from '../components/ui';

export function InwardDetailsPage() {
  const { state, pack, actions } = useLims();
  const now = useNow(60000);
  const inwardId = state.nav.params?.inwardId;
  const inward = useMemo(() => getInwardView(state.data, inwardId, now), [state.data, inwardId, now]);

  if (!inward) {
    return (
      <div className="sgt-content">
        <div className="sgt-page-body">
          <div className="sgt-empty">
            This inward could not be found.{' '}
            <button type="button" className="sgt-btn sgt-btn--link" onClick={() => actions.navigate('inwards')}>
              Back to All inwards
            </button>
          </div>
        </div>
      </div>
    );
  }

  const pending = inward.trs.filter((tr) => tr.status === 'not_allocated').length;

  return (
    <>
      <div className="sgt-page-header sgt-form-header">
        <div className="sgt-form-header__title">
          <button type="button" className="sgt-back-btn" aria-label="Back to All inwards" onClick={() => actions.navigate('inwards')}>
            <IconArrowLeft size={18} stroke={1.9} />
          </button>
          <h1 className="sgt-page-title">{inward.id}</h1>
          <SampleStatusPill status={inward.status} />
          {inward.isUserCreated ? <Pill tone="brand">Created by you</Pill> : null}
          {inward.delayed ? (
            <Pill tone="solid-red" icon={IconHourglassLow}>
              Delayed
            </Pill>
          ) : null}
        </div>
        <div className="sgt-form-header__actions">
          {pending ? (
            <Button
              iconRight={IconArrowRight}
              data-tour="inward-allocate-cta"
              onClick={() => actions.navigate('test-requests', { tab: 'pending' })}
            >
              Allocate {pluralize(pending, 'test request')}
            </Button>
          ) : (
            <Button variant="secondary" data-tour="inward-allocate-cta" onClick={() => actions.navigate('test-requests', { tab: 'all' })}>
              View test requests
            </Button>
          )}
        </div>
      </div>

      <div className="sgt-content">
        <div className="sgt-page-body sgt-details">
          <section className="sgt-card" aria-labelledby="sgt-inward-summary">
            <div className="sgt-card__header">
              <h2 className="sgt-card__title" id="sgt-inward-summary">Inward summary</h2>
              <span className="sgt-muted">Received {formatDateTime(inward.receivedOn)}</span>
            </div>
            <div className="sgt-card__body sgt-details__meta">
              <MetaItem label="Customer" value={inward.customer ? `${inward.customer.name}, ${inward.customer.city}` : '-'} />
              <MetaItem label="Customer Representative" value={inward.customer?.contactPerson} />
              <MetaItem label="Reference" value={inward.customerRef} />
              <MetaItem label="Request Mode" value={inward.receiptMode} />
              <MetaItem label="Received By" value={inward.receivedBy} />
              <MetaItem label="Sample Type" value={inward.sampleType} />
              <MetaItem label="Reporting Date" value={formatDate(inward.dueDate)} />
              <MetaItem label="Samples" value={`${pluralize(inward.samples.length, 'sample')} · ${pluralize(inward.trs.length, 'test')}`} />
            </div>
          </section>

          <section className="sgt-details__samples" data-tour="inward-samples" aria-labelledby="sgt-inward-samples">
            <h2 className="sgt-section-title" id="sgt-inward-samples">
              Samples and test requests
            </h2>
            {inward.samples.map((sample) => (
              <article className="sgt-card sgt-sample-block" key={sample.id}>
                <header className="sgt-sample-block__header">
                  <span className="sgt-sample-block__icon" aria-hidden="true">
                    <IconFlask size={18} stroke={1.8} />
                  </span>
                  <div className="sgt-sample-block__heading">
                    <div className="sgt-sample-block__id">{sample.id}</div>
                    <div className="sgt-muted">
                      {sample.product} · {sample.category}
                      {sample.batch ? ` · ${pack.batchLabel} ${sample.batch}` : ''}
                      {sample.quantity
                        ? ` · ${sample.unit === 'Units' ? pluralize(Number(sample.quantity) || 0, 'unit') : `${sample.quantity} ${sample.unit}`}`
                        : ''}
                    </div>
                  </div>
                  <SampleStatusPill status={sample.status} />
                </header>
                <div className="sgt-table-scroll">
                  <table className="sgt-simple-table">
                    <thead>
                      <tr>
                        <th scope="col">Test Request</th>
                        <th scope="col">Parameter</th>
                        <th scope="col">Method</th>
                        <th scope="col">Specification</th>
                        <th scope="col">Discipline</th>
                        <th scope="col">Status</th>
                        <th scope="col">Analyst</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sample.trs.map((tr) => (
                        <tr key={tr.id}>
                          <td className="sgt-mono">{tr.id}</td>
                          <td>{tr.parameter}</td>
                          <td>{tr.method}</td>
                          <td className="sgt-spec-cell">{tr.spec || '-'}</td>
                          <td>{tr.discipline}</td>
                          <td>
                            <TrStatusPill status={tr.status} />
                          </td>
                          <td>{tr.analystId ? getAnalyst(pack, tr.analystId)?.name : <span className="sgt-muted">Not assigned</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            ))}
          </section>
        </div>
      </div>
    </>
  );
}
