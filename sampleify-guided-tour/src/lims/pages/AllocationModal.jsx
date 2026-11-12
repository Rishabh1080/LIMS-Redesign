import { useMemo } from 'react';
import { IconAlertTriangle, IconUserPlus, IconX } from '@tabler/icons-react';
import { useLims } from '../../store/LimsStore';
import { buildIndexes, getAnalystRows } from '../../store/selectors';
import { cx, formatDate, pluralize } from '../../lib/format';
import { Button, Field, Modal, Pill, Radio, Select } from '../components/ui';

const tabs = [
  { key: 'analysts', label: 'Analysts' },
  { key: 'instruments', label: 'Instruments' },
  { key: 'materials', label: 'Materials' },
];

const instrumentTone = { Calibrated: 'green', 'Calibration due': 'yellow', Breakdown: 'solid-red' };
const materialTone = { 'In stock': 'green', 'Low stock': 'yellow', 'Out of stock': 'solid-red' };

export function AllocationModal() {
  const { state, pack, dispatch, actions } = useLims();
  const { analysts, instruments, materials } = pack;
  const allocation = state.ui.allocation;

  const context = useMemo(() => {
    if (!allocation) return null;
    const { trs, samples } = buildIndexes(state.data);
    const trRows = allocation.trIds.map((id) => trs.get(id)).filter(Boolean);
    const disciplines = [...new Set(trRows.map((tr) => tr.discipline))];
    const dueDate = trRows.reduce((latest, tr) => (new Date(tr.dueDate) > new Date(latest) ? tr.dueDate : latest), trRows[0]?.dueDate);
    return {
      trRows,
      disciplines,
      dueDate,
      sample: trRows.length === 1 ? samples.get(trRows[0].sampleId) : null,
      analystRows: getAnalystRows(state.data, disciplines),
    };
  }, [allocation, state.data]);

  if (!allocation || !context) return null;

  const { trRows, disciplines, analystRows, sample, dueDate } = context;
  const bulk = trRows.length > 1;
  const patch = (value) => dispatch({ type: 'allocation/patch', payload: value });
  const close = () => dispatch({ type: 'allocation/close' });
  const analyst = analystRows.find((row) => row.id === allocation.analystId);
  const reviewerOptions = analysts
    .filter((entry) => entry.canReview && !entry.onLeave && entry.id !== allocation.analystId)
    .map((entry) => ({ value: entry.id, label: `${entry.name} · ${entry.role}` }));
  const canSubmit = Boolean(analyst?.eligible && allocation.reviewerId);

  const submit = () => {
    if (!canSubmit) return;
    actions.allocate({
      trIds: allocation.trIds,
      analystId: allocation.analystId,
      reviewerId: allocation.reviewerId,
      instrumentId: allocation.instrumentId,
      analystName: analyst.name,
    });
  };

  return (
    <Modal
      open
      width={1100}
      icon={IconUserPlus}
      title={bulk ? `Allocate ${trRows.length} Test Requests` : 'Allocate Test Request'}
      onClose={close}
      className="sgt-alloc"
      data-tour="alloc-modal"
    >
      <div className="sgt-alloc__body">
        <section className="sgt-alloc__main">
          <dl className="sgt-alloc__details">
            {bulk ? (
              <>
                <div><dt>Test requests</dt><dd>{trRows.map((tr) => tr.id).join(', ')}</dd></div>
                <div><dt>Parameters</dt><dd>{[...new Set(trRows.map((tr) => tr.parameter))].join(', ')}</dd></div>
                <div><dt>Disciplines</dt><dd>{disciplines.join(', ')}</dd></div>
              </>
            ) : (
              <>
                <div><dt>Test Parameter</dt><dd>{trRows[0]?.parameter}</dd></div>
                <div><dt>MoA</dt><dd>{trRows[0]?.method} · {trRows[0]?.discipline}</dd></div>
                {trRows[0]?.spec ? <div><dt>Specification</dt><dd>{trRows[0].spec}</dd></div> : null}
                <div><dt>Sample</dt><dd>{sample ? `${sample.id} · ${sample.product}` : '-'}</dd></div>
              </>
            )}
            <div><dt>Template</dt><dd>Worksheet &amp; Raw Data Register - NABL</dd></div>
          </dl>

          <div className="sgt-tabs sgt-tabs--medium" role="tablist" aria-label="Allocation resources">
            {tabs.map((tab) => (
              <button
                type="button"
                role="tab"
                key={tab.key}
                aria-selected={allocation.tab === tab.key}
                className={cx('sgt-tabs__item', allocation.tab === tab.key && 'is-active')}
                onClick={() => patch({ tab: tab.key })}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="sgt-alloc__table-wrap">
            {allocation.tab === 'analysts' ? (
              <table className="sgt-simple-table sgt-alloc__table" data-tour="alloc-analysts">
                <thead>
                  <tr>
                    <th scope="col"><span className="sgt-sr-only">Select</span></th>
                    <th scope="col">Analyst</th>
                    <th scope="col">Open TRs</th>
                    <th scope="col">Authorised for {disciplines.join(' + ')}?</th>
                    <th scope="col">On leave?</th>
                    <th scope="col">Last trained</th>
                  </tr>
                </thead>
                <tbody>
                  {analystRows.map((row) => (
                    <tr
                      key={row.id}
                      data-analyst={row.id}
                      className={cx(!row.eligible && 'is-disabled', allocation.analystId === row.id && 'is-selected')}
                      onClick={() => row.eligible && patch({ analystId: row.id })}
                    >
                      <td>
                        <Radio
                          name="sgt-alloc-analyst"
                          checked={allocation.analystId === row.id}
                          disabled={!row.eligible}
                          label={`Allocate to ${row.name}`}
                          onChange={() => patch({ analystId: row.id })}
                        />
                      </td>
                      <td>
                        <div className="sgt-alloc__person">{row.name}</div>
                        <div className={cx('sgt-alloc__role', !row.eligible && 'is-warning')}>{row.eligible ? row.role : row.reason}</div>
                      </td>
                      <td>
                        <span className={cx('sgt-load', row.workload >= 7 && 'is-high')}>{row.workload}</span>
                      </td>
                      <td>
                        <Pill tone={row.certified ? 'solid-green' : 'red'}>{row.certified ? 'Yes' : 'No'}</Pill>
                      </td>
                      <td>{row.onLeave ? <Pill tone="yellow">On leave</Pill> : 'No'}</td>
                      <td>{row.lastTrainedOn ? formatDate(row.lastTrainedOn) : <span className="sgt-muted">In training</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}

            {allocation.tab === 'instruments' ? (
              <table className="sgt-simple-table sgt-alloc__table">
                <thead>
                  <tr>
                    <th scope="col">Instrument</th>
                    <th scope="col">Status</th>
                    <th scope="col">Last calibrated</th>
                  </tr>
                </thead>
                <tbody>
                  {instruments.map((instrument) => (
                    <tr key={instrument.id}>
                      <td>{instrument.name}</td>
                      <td><Pill tone={instrumentTone[instrument.status]}>{instrument.status}</Pill></td>
                      <td>{formatDate(instrument.lastCalibrated)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}

            {allocation.tab === 'materials' ? (
              <table className="sgt-simple-table sgt-alloc__table">
                <thead>
                  <tr>
                    <th scope="col">Material</th>
                    <th scope="col">Status</th>
                    <th scope="col">Available</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((material) => (
                    <tr key={material.id}>
                      <td>{material.name}</td>
                      <td><Pill tone={materialTone[material.status]}>{material.status}</Pill></td>
                      <td>{material.available}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
          </div>
        </section>

        <aside className="sgt-alloc__side">
          <div className="sgt-alloc__fields">
            <Field label="Allocate to" required htmlFor="sgt-alloc-to" helper={analyst ? `${analyst.workload} open test requests right now` : 'Only authorised analysts who are in today can be picked.'}>
              <Select
                id="sgt-alloc-to"
                value={allocation.analystId}
                placeholder="Select person"
                options={analystRows.map((row) => ({ value: row.id, label: row.eligible ? row.name : `${row.name} (${row.onLeave ? 'on leave' : 'not authorised'})`, disabled: !row.eligible }))}
                onChange={(value) => patch({ analystId: value })}
              />
            </Field>
            <div data-tour="alloc-reviewer">
              <Field label="Reviewer" required htmlFor="sgt-alloc-reviewer" helper="Must be someone other than the analyst.">
                <Select
                  id="sgt-alloc-reviewer"
                  value={allocation.reviewerId}
                  placeholder="Select person"
                  options={reviewerOptions}
                  onChange={(value) => patch({ reviewerId: value })}
                />
              </Field>
            </div>
            <Field label="Instrument" htmlFor="sgt-alloc-instrument" helper="Instruments under breakdown can't be booked.">
              <Select
                id="sgt-alloc-instrument"
                value={allocation.instrumentId}
                placeholder="Select instrument"
                options={instruments.map((instrument) => ({
                  value: instrument.id,
                  label: instrument.status === 'Calibrated' ? instrument.name : `${instrument.name} (${instrument.status.toLowerCase()})`,
                  disabled: instrument.status === 'Breakdown',
                }))}
                onChange={(value) => patch({ instrumentId: value })}
              />
            </Field>
            <Field label="Target Reporting Date" htmlFor="sgt-alloc-due">
              <input id="sgt-alloc-due" className="sgt-input" readOnly value={formatDate(dueDate)} />
            </Field>
            {bulk ? (
              <p className="sgt-alloc__note">
                <IconAlertTriangle size={16} stroke={1.9} aria-hidden="true" />
                The analyst must be authorised for every discipline in this batch ({disciplines.join(', ')}).
              </p>
            ) : null}
          </div>
          <div className="sgt-alloc__footer">
            <Button variant="secondary" icon={IconX} onClick={close}>
              Cancel
            </Button>
            <Button icon={IconUserPlus} disabled={!canSubmit} data-tour="alloc-submit" onClick={submit}>
              {bulk ? `Allocate ${pluralize(trRows.length, 'test')}` : 'Allocate'}
            </Button>
          </div>
        </aside>
      </div>
    </Modal>
  );
}
