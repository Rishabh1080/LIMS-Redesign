import { useMemo } from 'react';
import { IconEye, IconFlask, IconUserPlus } from '@tabler/icons-react';
import { useLims } from '../../store/LimsStore';
import { getAnalyst } from '../../store/catalog';
import { TR_TABS, getTrRows, getTrRowsForTab } from '../../store/selectors';
import { useNow } from '../../lib/hooks';
import { cx, formatAge, formatDate, pluralize } from '../../lib/format';
import { AllocationModal } from './AllocationModal';
import { Button, Checkbox, Pill, TrStatusPill } from '../components/ui';

export function TestRequestsPage() {
  const { state, pack, dispatch } = useLims();
  const now = useNow(30000);
  const tab = state.ui.trTab;
  const allRows = useMemo(() => getTrRows(state.data), [state.data]);
  const rows = useMemo(() => getTrRowsForTab(state.data, tab), [state.data, tab]);
  const selection = state.ui.trSelection;
  const isPending = tab === 'pending';
  const showStatus = tab === 'all';
  const showAnalyst = !isPending;
  const allSelected = isPending && rows.length > 0 && rows.every((row) => selection.includes(row.id));
  const someSelected = selection.length > 0 && !allSelected;

  const counts = useMemo(() => {
    const result = {};
    TR_TABS.forEach((entry) => {
      result[entry.key] = entry.statuses ? allRows.filter((row) => entry.statuses.includes(row.status)).length : allRows.length;
    });
    return result;
  }, [allRows]);

  const setTab = (key) => dispatch({ type: 'ui/patch', payload: { trTab: key, trSelection: [] } });
  const openAllocation = (trIds) => dispatch({ type: 'allocation/open', payload: { trIds } });
  const view = (row) => dispatch({ type: 'nav/go', payload: { page: 'inward-details', params: { inwardId: row.inwardId } } });

  return (
    <>
      <div className="sgt-page-header sgt-tabs-header">
        <div className="sgt-tabs" role="tablist" aria-label="Test request stages" data-tour="tr-tabs">
          {TR_TABS.map((entry) => (
            <button
              type="button"
              role="tab"
              key={entry.key}
              aria-selected={tab === entry.key}
              className={cx('sgt-tabs__item', tab === entry.key && 'is-active')}
              onClick={() => setTab(entry.key)}
            >
              {entry.label}
              {entry.key !== 'all' && counts[entry.key] ? <span className="sgt-count-badge">{counts[entry.key]}</span> : null}
            </button>
          ))}
        </div>
      </div>

      <div className="sgt-content">
        <div className="sgt-page-body">
          {isPending ? (
            <div className="sgt-tr-toolbar">
              <label className="sgt-tr-toolbar__select" data-tour="tr-select-all">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  disabled={!rows.length}
                  label="Select all pending test requests"
                  onChange={(checked) => dispatch({ type: 'tr/setSelection', payload: { ids: checked ? rows.map((row) => row.id) : [] } })}
                />
                <span>{selection.length ? `${selection.length} selected` : 'Select all'}</span>
              </label>
              <Button
                size="sm"
                icon={IconUserPlus}
                disabled={!selection.length}
                data-tour="tr-bulk-allocate"
                onClick={() => openAllocation(selection)}
              >
                {selection.length ? `Allocate selected (${selection.length})` : 'Allocate selected'}
              </Button>
              <span className="sgt-muted sgt-tr-toolbar__hint">
                {rows.length ? `${pluralize(rows.length, 'test request')} waiting for an analyst` : 'Nothing waiting. Every test has an owner.'}
              </span>
            </div>
          ) : null}

          <div className="sgt-tr-table" role="table" aria-label="Test requests" data-tour="tr-table">
            <div className={cx('sgt-tr-row', 'sgt-tr-row--head', isPending && 'has-check', showStatus && 'has-status', showAnalyst && 'has-analyst')} role="row">
              {isPending ? <span role="columnheader"><span className="sgt-sr-only">Select</span></span> : null}
              <span role="columnheader">Test Request ID</span>
              {showStatus ? <span role="columnheader">Status</span> : null}
              <span role="columnheader">Parameter</span>
              <span role="columnheader">Product</span>
              <span role="columnheader">Customer</span>
              {showAnalyst ? <span role="columnheader">Analyst</span> : null}
              <span role="columnheader">Target Reporting Date</span>
              <span role="columnheader">Age</span>
              <span role="columnheader">Actions</span>
            </div>

            {rows.length ? (
              rows.map((row, index) => (
                <div
                  key={row.id}
                  role="row"
                  className={cx(
                    'sgt-tr-row',
                    isPending && 'has-check',
                    showStatus && 'has-status',
                    showAnalyst && 'has-analyst',
                    row.isNew && 'is-new',
                    selection.includes(row.id) && 'is-selected',
                  )}
                  data-tour={index === 0 ? 'tr-first-row' : undefined}
                >
                  {isPending ? (
                    <span role="cell">
                      <Checkbox
                        checked={selection.includes(row.id)}
                        label={`Select ${row.id}`}
                        onChange={() => dispatch({ type: 'tr/toggleSelect', payload: { id: row.id } })}
                      />
                    </span>
                  ) : null}
                  <span role="cell" className="sgt-tr-row__id">
                    <button type="button" className="sgt-link" onClick={() => view(row)}>
                      {row.id}
                    </button>
                    {row.isNew ? <Pill tone="brand">New</Pill> : null}
                  </span>
                  {showStatus ? (
                    <span role="cell">
                      <TrStatusPill status={row.status} />
                    </span>
                  ) : null}
                  <span role="cell">
                    <span className="sgt-tr-row__primary">{row.parameter}</span>
                    <span className="sgt-tr-row__secondary">{row.discipline}</span>
                  </span>
                  <span role="cell">
                    <span className="sgt-tr-row__primary">{row.sample?.product}</span>
                    <span className="sgt-tr-row__secondary">{row.sample?.id}</span>
                  </span>
                  <span role="cell" className="sgt-tr-row__ellipsis" title={row.customer?.name}>
                    {row.customer?.name}
                  </span>
                  {showAnalyst ? <span role="cell">{row.analystId ? getAnalyst(pack, row.analystId)?.name : '-'}</span> : null}
                  <span role="cell">{formatDate(row.dueDate)}</span>
                  <span role="cell">{formatAge(row.createdAt, now)}</span>
                  <span role="cell" className="sgt-tr-row__actions">
                    {row.status === 'not_allocated' ? (
                      <Button size="sm" icon={IconFlask} data-tour={index === 0 ? 'tr-allocate-first' : undefined} onClick={() => openAllocation([row.id])}>
                        Allocate
                      </Button>
                    ) : null}
                    <Button variant="secondary" size="sm" icon={IconEye} onClick={() => view(row)}>
                      View
                    </Button>
                  </span>
                </div>
              ))
            ) : (
              <div className="sgt-empty">No test requests in this stage.</div>
            )}
          </div>
        </div>
      </div>

      <AllocationModal />
    </>
  );
}
