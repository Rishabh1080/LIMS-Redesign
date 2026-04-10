import { IconColumns2, IconLayoutBottombar, IconLayoutGrid } from '@tabler/icons-react';
import ParameterCircles, { getParameterSummary } from '../ParameterCircles/ParameterCircles';
import StatusPill from '../StatusPill';
import './SampleCard.css';

const sampleStatusVariantMap = {
  success: { color: 'green', styleType: 'strong' },
  warning: { color: 'orange', styleType: 'neutral' },
  pending: { color: 'blue', styleType: 'neutral' },
};

function renderFieldList(fields = []) {
  return fields.length
    ? fields.map((field, index) => (
        <div className="sample-card__field" key={`${field.label}-${field.value}-${index}`}>
          <div className="meta-label">{field.label}</div>
          <div className="meta-value">{field.value}</div>
        </div>
    ))
    : null;
}

function buildDataItems(sample, extraMetaFields = [], extraDateFields = []) {
  return [
    { label: 'Customer Representative', value: sample.representative },
    { label: 'Reference', value: sample.reference },
    { label: 'Request Mode', value: sample.requestMode },
    { label: 'Created on', value: sample.createdOn },
    { label: 'Reporting Date', value: sample.reportingDate },
    ...(extraMetaFields ?? []),
    ...(extraDateFields ?? []),
  ].filter((item) => Boolean(item?.label));
}

function getRowColsClass(itemCount) {
  const count = Math.max(1, itemCount);
  const mobileCols = Math.min(count, 2);
  const tabletCols = Math.min(count, 4);
  const desktopCols = Math.min(count, 6);

  return `row-cols-${mobileCols} row-cols-md-${tabletCols} row-cols-xl-${desktopCols}`;
}

export function SampleCardViewToggle({ value, onChange, className = '' }) {
  return (
    <div className={`sample-card-view-toggle ${className}`.trim()} role="group" aria-label="Sample card view">
      <button
        type="button"
        className={`sample-card-view-toggle__button ${value === 'modern' ? 'is-active' : ''}`}
        aria-pressed={value === 'modern'}
        aria-label="New view"
        onClick={() => onChange('modern')}
      >
        <IconLayoutBottombar size={16} stroke={2} aria-hidden="true" />
      </button>
      <button
        type="button"
        className={`sample-card-view-toggle__button ${value === 'legacy' ? 'is-active' : ''}`}
        aria-pressed={value === 'legacy'}
        aria-label="Old view"
        onClick={() => onChange('legacy')}
      >
        <IconColumns2 size={16} stroke={2} aria-hidden="true" />
      </button>
      <button
        type="button"
        className={`sample-card-view-toggle__button ${value === 'grid' ? 'is-active' : ''}`}
        aria-pressed={value === 'grid'}
        aria-label="Data grid view"
        onClick={() => onChange('grid')}
      >
        <IconLayoutGrid size={16} stroke={2} aria-hidden="true" />
      </button>
    </div>
  );
}

function SampleCardLegacy({ sample, onOpenSample, sourcePage, extraMetaFields = [], extraDateFields = [] }) {
  const isOpenable =
    sample.status === 'Under Analysis' || sample.status === 'Pending' || sample.status === 'Completed';
  const metaRows = [
    [
      { label: 'Reference', value: sample.reference },
      { label: 'Request Mode', value: sample.requestMode },
    ],
    ...(extraMetaFields?.length ? [extraMetaFields] : []),
  ];
  const dateRows = [
    [{ label: 'Reporting Date', value: sample.reportingDate }],
    ...(extraDateFields?.length ? [extraDateFields] : []),
  ];

  return (
    <article className="sample-card sample-card--legacy">
      <div className="row g-0 align-items-stretch">
        <div className="col-xl-3 col-lg-4">
          <div className="sample-column sample-primary h-100">
            <div className="sample-primary-header">
              {isOpenable ? (
                <a
                  href="/"
                  onClick={(event) => {
                    event.preventDefault();
                    onOpenSample?.(sample.id, {
                      sourcePage,
                      sampleStatus: sample.status,
                      createdOn: sample.createdOn,
                    });
                  }}
                  className="sample-id"
                >
                  {sample.id}
                </a>
              ) : (
                <span className="sample-id">{sample.id}</span>
              )}
              <StatusPill
                className="status-badge"
                color={(sampleStatusVariantMap[sample.statusTone] ?? sampleStatusVariantMap.pending).color}
                styleType={(sampleStatusVariantMap[sample.statusTone] ?? sampleStatusVariantMap.pending).styleType}
              >
                {sample.status}
              </StatusPill>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-lg-4">
          <div className="sample-column sample-meta h-100 sample-divider">
            <div className="sample-details-stack">
              <div className="meta-block">
                <div className="meta-label">Customer Representative</div>
                <div className="meta-value">{sample.representative}</div>
              </div>
              {metaRows.map((row, rowIndex) => (
                <div className="sample-details-row" key={`meta-row-${sample.id}-${rowIndex}`}>
                  {row.map((item) => (
                    <div
                      className={row.length === 1 ? 'sample-details-cell is-full' : 'sample-details-cell'}
                      key={item.label}
                    >
                      <div className="meta-block">
                        <div className="meta-label">{item.label}</div>
                        <div className="meta-value">{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-lg-4">
          <div className="sample-column sample-dates h-100 sample-divider">
            <div className="sample-details-stack">
              <div className="meta-block">
                <div className="meta-label">Created on</div>
                <div className="meta-value">{sample.createdOn}</div>
              </div>
              {dateRows.map((row, rowIndex) => (
                <div className="sample-details-row" key={`date-row-${sample.id}-${rowIndex}`}>
                  {row.map((item) => (
                    <div
                      className={row.length === 1 ? 'sample-details-cell is-full' : 'sample-details-cell'}
                      key={item.label}
                    >
                      <div className="meta-block">
                        <div className="meta-label">{item.label}</div>
                        <div className="meta-value">{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-12">
          <div className="sample-column sample-parameters h-100 sample-divider">
            <div className="meta-label">Parameters</div>
            <ParameterCircles parameters={sample.parameters} />
          </div>
        </div>
      </div>
    </article>
  );
}

function SampleCardModern({ sample, onOpenSample, sourcePage, extraMetaFields = [], extraDateFields = [] }) {
  const isOpenable =
    sample.status === 'Under Analysis' || sample.status === 'Pending' || sample.status === 'Completed';
  const { approvedCount, totalCount, sortedParameters } = getParameterSummary(sample.parameters);
  const customFields = [...(extraMetaFields ?? []), ...(extraDateFields ?? [])];

  return (
    <article className="sample-card sample-card--modern">
      <div className="sample-card__top">
        <div className="sample-card__panel sample-card__panel--primary">
          {isOpenable ? (
            <a
              href="/"
              onClick={(event) => {
                event.preventDefault();
                onOpenSample?.(sample.id, {
                  sourcePage,
                  sampleStatus: sample.status,
                  createdOn: sample.createdOn,
                });
              }}
              className="sample-id"
            >
              {sample.id}
            </a>
          ) : (
            <span className="sample-id">{sample.id}</span>
          )}
          <StatusPill
            className="status-badge"
            color={(sampleStatusVariantMap[sample.statusTone] ?? sampleStatusVariantMap.pending).color}
            styleType={(sampleStatusVariantMap[sample.statusTone] ?? sampleStatusVariantMap.pending).styleType}
          >
            {sample.status}
          </StatusPill>
        </div>

        <div className="sample-card__panel sample-card__panel--details">
          <div className="sample-card__fields sample-card__fields--two-up">
            <div className="sample-card__field">
              <div className="meta-label">Customer Representative</div>
              <div className="meta-value">{sample.representative}</div>
            </div>
            <div className="sample-card__field">
              <div className="meta-label">Reference</div>
              <div className="meta-value">{sample.reference}</div>
            </div>
            <div className="sample-card__field">
              <div className="meta-label">Request Mode</div>
              <div className="meta-value">{sample.requestMode}</div>
            </div>
          </div>
        </div>

        <div className="sample-card__panel sample-card__panel--dates">
          <div className="sample-card__fields">
            <div className="sample-card__field">
              <div className="meta-label">Created on</div>
              <div className="meta-value">{sample.createdOn}</div>
            </div>
            <div className="sample-card__field">
              <div className="meta-label">Reporting Date</div>
              <div className="meta-value">{sample.reportingDate}</div>
            </div>
          </div>
        </div>

        <div className="sample-card__panel sample-card__panel--custom">
          <div className="sample-card__fields">
            {customFields.length ? renderFieldList(customFields) : (
              <div className="sample-card__empty-field">No custom fields</div>
            )}
          </div>
        </div>
      </div>

      <div className="sample-card__parameters-row">
        <div className="sample-card__parameters-label">Parameters:</div>
        <ParameterCircles
          parameters={sortedParameters}
          className="sample-card__parameters-circles"
        />
        <div className="sample-card__parameters-summary">
          {approvedCount}/{totalCount} Approved
        </div>
      </div>
    </article>
  );
}

function SampleCardGrid({ sample, onOpenSample, sourcePage, extraMetaFields = [], extraDateFields = [] }) {
  const isOpenable =
    sample.status === 'Under Analysis' || sample.status === 'Pending' || sample.status === 'Completed';
  const { approvedCount, totalCount, sortedParameters } = getParameterSummary(sample.parameters);
  const dataItems = buildDataItems(sample, extraMetaFields, extraDateFields);
  const dataGridClass = getRowColsClass(dataItems.length);

  return (
    <article className="sample-card sample-card--grid">
      <div className="sample-card__grid-header">
        {isOpenable ? (
          <a
            href="/"
            onClick={(event) => {
              event.preventDefault();
              onOpenSample?.(sample.id, {
                sourcePage,
                sampleStatus: sample.status,
                createdOn: sample.createdOn,
              });
            }}
            className="sample-id"
          >
            {sample.id}
          </a>
        ) : (
          <span className="sample-id">{sample.id}</span>
        )}
        <StatusPill
          className="status-badge"
          color={(sampleStatusVariantMap[sample.statusTone] ?? sampleStatusVariantMap.pending).color}
          styleType={(sampleStatusVariantMap[sample.statusTone] ?? sampleStatusVariantMap.pending).styleType}
        >
          {sample.status}
        </StatusPill>
      </div>

      <div className={`sample-card__grid-body row gx-2 ${dataGridClass}`.trim()}>
        {dataItems.map((item, index) => (
          <div className="col" key={`${item.label}-${item.value}-${index}`}>
            <div className="sample-card__data-item">
              <div className="meta-label">{item.label}</div>
              <div className="meta-value">{item.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="sample-card__parameters-row">
        <div className="sample-card__parameters-label">Parameters:</div>
        <ParameterCircles
          parameters={sortedParameters}
          className="sample-card__parameters-circles"
        />
        <div className="sample-card__parameters-summary">
          {approvedCount}/{totalCount} Approved
        </div>
      </div>
    </article>
  );
}

export default function SampleCard({
  sample,
  onOpenSample,
  sourcePage,
  viewMode = 'modern',
  extraMetaFields = [],
  extraDateFields = [],
}) {
  if (viewMode === 'legacy') {
    return (
      <SampleCardLegacy
        sample={sample}
        onOpenSample={onOpenSample}
        sourcePage={sourcePage}
        extraMetaFields={extraMetaFields}
        extraDateFields={extraDateFields}
      />
    );
  }

  if (viewMode === 'grid') {
    return (
      <SampleCardGrid
        sample={sample}
        onOpenSample={onOpenSample}
        sourcePage={sourcePage}
        extraMetaFields={extraMetaFields}
        extraDateFields={extraDateFields}
      />
    );
  }

  return (
    <SampleCardModern
      sample={sample}
      onOpenSample={onOpenSample}
      sourcePage={sourcePage}
      extraMetaFields={extraMetaFields}
      extraDateFields={extraDateFields}
    />
  );
}
