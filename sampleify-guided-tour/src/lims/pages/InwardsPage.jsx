import { useEffect, useMemo, useState } from 'react';
import { IconChevronRight, IconHourglassLow, IconPlus, IconSearch } from '@tabler/icons-react';
import { useLims } from '../../store/LimsStore';
import { getInwardViews } from '../../store/selectors';
import { useNow } from '../../lib/hooks';
import { cx, formatDate, formatDateTime, pluralize } from '../../lib/format';
import { Button, MetaItem, ParameterCircles, Pill, SampleStatusPill } from '../components/ui';

const quickFilters = [
  { key: 'all', label: 'All', days: null, countLabel: 'total inwards' },
  { key: 'today', label: 'Today', days: 0, countLabel: 'inwards received today' },
  { key: 'last-7', label: 'Last 7 days', days: 7, countLabel: 'inwards in the last 7 days' },
  { key: 'last-30', label: 'Last 30 days', days: 30, countLabel: 'inwards in the last 30 days' },
];

function matchesQuickFilter(inward, filterKey, now) {
  const option = quickFilters.find((entry) => entry.key === filterKey) ?? quickFilters[0];
  if (option.days === null) return true;
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - option.days);
  return new Date(inward.receivedOn) >= start;
}

function matchesSearch(inward, query) {
  if (!query) return true;
  return [
    inward.id,
    inward.customer?.name,
    inward.customer?.contactPerson,
    inward.customerRef,
    inward.receiptMode,
    inward.status,
    ...inward.samples.map((sample) => `${sample.id} ${sample.product} ${sample.category}`),
  ]
    .join(' ')
    .toLowerCase()
    .includes(query);
}

export function InwardCard({ inward, onOpen, tourId }) {
  const approved = inward.trs.filter((tr) => tr.status === 'approved').length;

  return (
    <article className="sgt-inward-card" data-tour={tourId}>
      <header className="sgt-inward-card__header">
        <button type="button" className="sgt-inward-card__id" onClick={() => onOpen(inward.id)}>
          {inward.id}
        </button>
        <SampleStatusPill status={inward.status} />
        {inward.isUserCreated ? <Pill tone="brand">Created by you</Pill> : null}
        {inward.delayed ? (
          <Pill tone="solid-red" icon={IconHourglassLow} className="sgt-inward-card__delayed">
            Delayed
          </Pill>
        ) : null}
      </header>
      <div className="sgt-inward-card__body">
        <MetaItem label="Customer Representative" value={inward.customer?.contactPerson} />
        <MetaItem label="Reference" value={inward.customerRef} />
        <MetaItem label="Request Mode" value={inward.receiptMode} />
        <MetaItem label="Created on" value={formatDateTime(inward.receivedOn)} />
        <MetaItem label="Reporting Date" value={formatDate(inward.dueDate)} />
        <MetaItem label="Customer" value={inward.customer ? `${inward.customer.name}, ${inward.customer.city}` : '-'} />
        <MetaItem label="Samples" value={pluralize(inward.samples.length, 'sample')} />
        <MetaItem label="Products" value={inward.samples.map((sample) => sample.product).join(', ')} />
      </div>
      <footer className="sgt-inward-card__footer">
        <span className="sgt-inward-card__footer-label">Parameters:</span>
        <ParameterCircles trs={inward.trs} />
        <span className="sgt-inward-card__footer-summary">
          {approved}/{inward.trs.length} Approved
        </span>
      </footer>
    </article>
  );
}

export function InwardsPage() {
  const { state, actions } = useLims();
  const now = useNow(60000);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState(state.nav.params?.filter ?? 'all');

  useEffect(() => {
    if (state.nav.params?.filter) setFilter(state.nav.params.filter);
  }, [state.nav.params]);

  const inwards = useMemo(() => getInwardViews(state.data, now), [state.data, now]);
  const query = search.trim().toLowerCase();
  const searched = useMemo(() => inwards.filter((inward) => matchesSearch(inward, query)), [inwards, query]);
  const counts = useMemo(
    () => Object.fromEntries(quickFilters.map((option) => [option.key, searched.filter((inward) => matchesQuickFilter(inward, option.key, now)).length])),
    [searched, now],
  );
  const visible = searched.filter((inward) => matchesQuickFilter(inward, filter, now));
  const filterOption = quickFilters.find((entry) => entry.key === filter) ?? quickFilters[0];
  const openInward = (inwardId) => actions.navigate('inward-details', { inwardId });

  return (
    <>
      <div className="sgt-page-header sgt-search-header">
        <form
          className="sgt-search"
          role="search"
          onSubmit={(event) => event.preventDefault()}
        >
          <span className="sgt-search__icon" aria-hidden="true">
            <IconSearch size={18} stroke={1.8} />
          </span>
          <input
            className="sgt-search__input"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search in All inwards"
            aria-label="Search inwards"
          />
          <button type="submit" className="sgt-search__submit" aria-label="Search">
            <IconChevronRight size={18} stroke={2} />
          </button>
        </form>
        <Button icon={IconPlus} data-tour="inwards-new-button" onClick={() => actions.navigate('new-inward')}>
          New inward
        </Button>
      </div>

      <div className="sgt-content">
        <div className="sgt-page-body">
          <div className="sgt-pills-nav" role="tablist" aria-label="Received date">
            {quickFilters.map((option) => (
              <button
                type="button"
                role="tab"
                key={option.key}
                aria-selected={filter === option.key}
                className={cx('sgt-pills-nav__item', filter === option.key && 'is-active')}
                onClick={() => setFilter(option.key)}
              >
                {option.label}
                <span className="sgt-pills-nav__count">{counts[option.key] ?? 0}</span>
              </button>
            ))}
          </div>

          <p className="sgt-count-label">
            {visible.length} {filterOption.countLabel}
          </p>

          <div className="sgt-inward-list">
            {visible.length ? (
              visible.map((inward, index) => (
                <InwardCard key={inward.id} inward={inward} onOpen={openInward} tourId={index === 0 ? 'inwards-first-card' : undefined} />
              ))
            ) : (
              <div className="sgt-empty">No inwards found for this view.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
