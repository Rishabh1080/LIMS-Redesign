import { IconColumns2, IconLayoutBottombar, IconLayoutGrid } from '@tabler/icons-react';
import ParameterCircles, { getParameterSummary } from '../ParameterCircles/ParameterCircles';
import SecondaryButton from '../SecondaryButton';
import StatusPill from '../StatusPill';
import { getStatusPresentation } from '../../status/statusRegistry';
import './SampleCard.scss';

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

function MetaBlock({ label, value, className = '' }) {
  return (
    <dl className={joinClasses('mb-0', className)}>
      <dt>{label}</dt>
      <dd className="mb-0">{value}</dd>
    </dl>
  );
}

function renderFieldList(fields = []) {
  return fields.length
    ? fields.map((field, index) => (
        <MetaBlock
          key={`${field.label}-${field.value}-${index}`}
          label={field.label}
          value={field.value}
        />
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

function SampleId({ sample, isOpenable, sourcePage, onOpenSample }) {
  if (!isOpenable) {
    return <span className="card-title mb-0">{sample.id}</span>;
  }

  return (
    <a
      href="/"
      onClick={(event) => {
        event.preventDefault();
        onOpenSample?.(sample.id, {
          sourcePage,
          sampleStatus: sample.status,
          createdOn: sample.createdOn,
          sample,
        });
      }}
      className="smplfy-link link-primary card-title mb-0 p-0"
    >
      {sample.id}
    </a>
  );
}

function SampleStatus({ sample, className = '' }) {
  const statusPresentation = getStatusPresentation('sample', sample.status);

  return (
    <StatusPill
      className={className}
      color={statusPresentation.color}
      styleType={statusPresentation.styleType}
    >
      {statusPresentation.label}
    </StatusPill>
  );
}

export function SampleCardViewToggle({ value, onChange, className = '' }) {
  const options = [
    { value: 'modern', label: 'New view', Icon: IconLayoutBottombar },
    { value: 'legacy', label: 'Old view', Icon: IconColumns2 },
    { value: 'grid', label: 'Data grid view', Icon: IconLayoutGrid },
  ];

  return (
    <div className={joinClasses('smplfy-btn-group', 'btn-group', className)} role="group" aria-label="Sample card view">
      {options.map(({ value: optionValue, label, Icon }) => (
        <button
          key={optionValue}
          type="button"
          className={joinClasses('smplfy-btn', 'btn', 'btn-outline-secondary', value === optionValue ? 'active' : '')}
          aria-pressed={value === optionValue}
          aria-label={label}
          onClick={() => onChange(optionValue)}
        >
          <Icon size={16} stroke={2} aria-hidden="true" />
        </button>
      ))}
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
    <article className="smplfy-card card smplfy-sample-card">
      <div className="row g-0 align-items-stretch">
        <div className="col-xl-3 col-lg-4 col-12">
          <div className="card-body h-100 d-flex flex-column align-items-start justify-content-center">
            <SampleId sample={sample} isOpenable={isOpenable} sourcePage={sourcePage} onOpenSample={onOpenSample} />
            <SampleStatus sample={sample} className="mt-3" />
          </div>
        </div>

        <div className="col-xl-3 col-lg-4 col-12">
          <div className="card-body h-100">
            <div className="d-grid gap-3">
              <MetaBlock label="Customer Representative" value={sample.representative} />
              {metaRows.map((row, rowIndex) => (
                <div className="row g-3" key={`meta-row-${sample.id}-${rowIndex}`}>
                  {row.map((item) => (
                    <div className={row.length === 1 ? 'col-12' : 'col-6'} key={item.label}>
                      <MetaBlock label={item.label} value={item.value} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-lg-4 col-12">
          <div className="card-body h-100">
            <div className="d-grid gap-3">
              <MetaBlock label="Created on" value={sample.createdOn} />
              {dateRows.map((row, rowIndex) => (
                <div className="row g-3" key={`date-row-${sample.id}-${rowIndex}`}>
                  {row.map((item) => (
                    <div className={row.length === 1 ? 'col-12' : 'col-6'} key={item.label}>
                      <MetaBlock label={item.label} value={item.value} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-12">
          <div className="card-body h-100">
            <dl className="mb-3">
              <dt>Parameters</dt>
            </dl>
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
    <article className="smplfy-card card smplfy-sample-card overflow-hidden p-0">
      <div className="smplfy-sample-card-layout">
        <div className="card-body d-flex flex-column align-items-start justify-content-center">
          <SampleId sample={sample} isOpenable={isOpenable} sourcePage={sourcePage} onOpenSample={onOpenSample} />
          <SampleStatus sample={sample} className="mt-3" />
        </div>

        <div className="card-body">
          <div className="row g-3">
            <div className="col-6">
              <MetaBlock label="Customer Representative" value={sample.representative} />
            </div>
            <div className="col-6">
              <MetaBlock label="Reference" value={sample.reference} />
            </div>
            <div className="col-6">
              <MetaBlock label="Request Mode" value={sample.requestMode} />
            </div>
          </div>
        </div>

        <div className="card-body">
          <div className="d-grid gap-3">
            <MetaBlock label="Created on" value={sample.createdOn} />
            <MetaBlock label="Reporting Date" value={sample.reportingDate} />
          </div>
        </div>

        <div className="card-body">
          <div className="d-grid gap-3">
            {customFields.length ? renderFieldList(customFields) : (
              <div className="text-secondary d-flex align-items-center">No custom fields</div>
            )}
          </div>
        </div>
      </div>

      <div className="card-footer bg-transparent d-flex align-items-center gap-2">
        <div className="text-secondary flex-shrink-0">Parameters:</div>
        <ParameterCircles
          parameters={sortedParameters}
          className="flex-grow-1 w-100 mw-100 flex-nowrap overflow-visible"
        />
        <div className="text-secondary text-end flex-shrink-0">
          {approvedCount}/{totalCount} Approved
        </div>
      </div>
    </article>
  );
}

function SampleCardGrid({
  sample,
  onOpenSample,
  onEditSample,
  sourcePage,
  extraMetaFields = [],
  extraDateFields = [],
}) {
  const isOpenable =
    sample.status === 'Under Analysis' || sample.status === 'Pending' || sample.status === 'Completed';
  const isEditable = sample.status === 'Pending' && typeof onEditSample === 'function';
  const { approvedCount, totalCount, sortedParameters } = getParameterSummary(sample.parameters);
  const dataItems = buildDataItems(sample, extraMetaFields, extraDateFields);
  const dataGridClass = getRowColsClass(dataItems.length);

  return (
    <article className="smplfy-card card smplfy-sample-card overflow-hidden p-0">
      <div className="card-header bg-transparent d-flex align-items-center gap-2">
        <SampleId sample={sample} isOpenable={isOpenable} sourcePage={sourcePage} onOpenSample={onOpenSample} />
        <SampleStatus sample={sample} />
        {isEditable ? (
          <SecondaryButton
            size="medium"
            className="ms-auto"
            onClick={() => onEditSample(sample, { sourcePage })}
          >
            Edit
          </SecondaryButton>
        ) : null}
      </div>

      <div className={joinClasses('card-body', 'row', 'gx-2', dataGridClass)}>
        {dataItems.map((item, index) => (
          <div className="col" key={`${item.label}-${item.value}-${index}`}>
            <div className="d-flex flex-column gap-1">
              <MetaBlock label={item.label} value={item.value} />
            </div>
          </div>
        ))}
      </div>

      <div className="card-footer bg-transparent d-flex align-items-center gap-2">
        <div className="text-secondary flex-shrink-0">Parameters:</div>
        <ParameterCircles
          parameters={sortedParameters}
          className="flex-grow-1 w-100 mw-100 flex-nowrap overflow-visible"
        />
        <div className="text-secondary text-end flex-shrink-0">
          {approvedCount}/{totalCount} Approved
        </div>
      </div>
    </article>
  );
}

export default function SampleCard({
  sample,
  onOpenSample,
  onEditSample,
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
        onEditSample={onEditSample}
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
