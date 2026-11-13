import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import Checkbox from '../components/Checkbox/Checkbox';
import { FormElement, ToastNotification } from '../components/FormControls';
import Modal from '../components/Modal/Modal';
import './template-edit-page.scss';

let runtimeId = 1000;

function nextId(prefix) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  runtimeId += 1;
  return `${prefix}-${runtimeId}`;
}

function createColumn(overrides = {}) {
  return {
    id: nextId('column'),
    widgetName: 'temp_img_widget',
    customClass: '',
    nestedContainer: null,
    ...overrides,
  };
}

function createRow(columnCount = 1, overrides = {}) {
  return {
    id: nextId('row'),
    columns: Array.from({ length: columnCount }, () => createColumn()),
    ...overrides,
  };
}

function createContainer(overrides = {}) {
  return {
    id: nextId('container'),
    title: 'Container',
    rows: [createRow(1)],
    ...overrides,
  };
}

const initialTemplate = [];

const widgetOptions = [
  'Base Widget',
  'Common Modals',
  'Text Widget',
  'Input Widget',
  'Number Widget',
  'Paragraph Widget',
  'Checkbox Widget',
  'Datepicker Widget',
  'Rich Text Widget',
  'Vertical Text Widget',
  'Sno Widget',
  'Formula Widget',
  'Qr Code Widget',
  'Upload Widget',
  'Word Upload Widget',
  'Template Image Widget',
  'Dropdown Widget',
  'Dependent Dropdown Widget',
  'Sample Details Widget',
  'Sample Details Widget V2',
  'Sample Metadata Widget',
  'Sample Data Widget',
  'Sample Parameter Widget',
  'Sample Line Item Data Widget',
  'Customer Widget',
  'Project Field Widget',
  'Product Detail Widget',
  'Meta Data',
  'Master Data Widget',
  'Method Widget',
  'Moa Widget',
  'Fetcher Widget',
  'Template Data Fetcher Widget',
  'Ds Data Fetcher Widget',
  'Container Fetcher Widget',
  'Template Inclusion Widget',
].sort((first, second) => first.localeCompare(second))
  .map((label) => ({ value: label, label }));

const masterOptions = [
  'Customer',
  'Instrument',
  'Material',
  'Product',
  'Sample',
  'Test Request',
].map((label) => ({ value: label, label }));

const roleOptions = [
  'Admin',
  'Analyst',
  'Approver',
  'Lab Manager',
  'Quality Manager',
  'Reviewer',
  'Technical Manager',
].map((label) => ({ value: label, label }));

const columnDisplayOptions = [
  { key: 'coa', label: 'Show in CoA', checked: true },
  { key: 'dataTemplate', label: 'Show in Data Template', checked: true },
  { key: 'nabl', label: 'Show in NABL', checked: true },
  { key: 'nonNabl', label: 'Show in Non-NABL', checked: true },
  { key: 'finalResult', label: 'Is Final Result?', checked: false },
];

const styleWidthOptions = [
  { value: 'col', label: 'Auto' },
  ...Array.from({ length: 12 }, (_, index) => {
    const value = `col-${index + 1}`;
    return { value, label: String(index + 1) };
  }),
];

const styleMarginOptions = [
  { value: '', label: 'None' },
  { value: 'mt-2', label: 'Small' },
  { value: 'mt-4', label: 'Large' },
];

const alignmentOptions = [
  { key: '', label: 'Left', className: '' },
  { key: 'text-center', label: 'Center', className: 'text-center' },
  { key: 'text-end', label: 'Right', className: 'text-end' },
];

const fontWeightOptions = [
  { key: '', label: 'Normal', className: '' },
  { key: 'fw-bold', label: 'Bold', className: 'fw-bold' },
  { key: 'fw-bolder', label: 'Extra Bold', className: 'fw-bolder' },
];

const borderClassBySide = {
  top: 'border-top',
  right: 'border-right',
  bottom: 'border-bottom',
  left: 'border-left',
};

const widthClassSet = new Set(styleWidthOptions.map((option) => option.value));
const alignmentClassSet = new Set(['text-start', 'text-center', 'text-end']);
const fontWeightClassSet = new Set(['fw-normal', 'fw-bold', 'fw-bolder']);
const borderClassSet = new Set(Object.values(borderClassBySide));
const marginTopClassSet = new Set(['mt-2', 'mt-4']);

function tokenizeClassString(className = '') {
  return String(className)
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function parseBootstrapClassString(className = '') {
  const style = {
    width: 'col',
    alignment: '',
    fontWeight: '',
    borders: {
      top: false,
      right: false,
      bottom: false,
      left: false,
    },
    marginTop: '',
    advancedClasses: '',
  };
  const advancedClasses = [];

  tokenizeClassString(className).forEach((classToken) => {
    if (widthClassSet.has(classToken)) {
      style.width = classToken;
      return;
    }

    if (alignmentClassSet.has(classToken)) {
      style.alignment = classToken === 'text-start' ? 'text-start' : classToken;
      return;
    }

    if (fontWeightClassSet.has(classToken)) {
      style.fontWeight = classToken === 'fw-normal' ? 'fw-normal' : classToken;
      return;
    }

    if (borderClassSet.has(classToken)) {
      const matchingSide = Object.entries(borderClassBySide)
        .find(([, sideClass]) => sideClass === classToken)?.[0];
      if (matchingSide) {
        style.borders[matchingSide] = true;
      }
      return;
    }

    if (marginTopClassSet.has(classToken)) {
      style.marginTop = classToken;
      return;
    }

    advancedClasses.push(classToken);
  });

  style.advancedClasses = advancedClasses.join(' ');
  return style;
}

function buildBootstrapClassString(style) {
  const classes = [];
  if (style.width) {
    classes.push(style.width);
  }

  if (style.alignment) {
    classes.push(style.alignment);
  }

  if (style.fontWeight) {
    classes.push(style.fontWeight);
  }

  Object.entries(borderClassBySide).forEach(([side, className]) => {
    if (style.borders?.[side]) {
      classes.push(className);
    }
  });

  if (style.marginTop) {
    classes.push(style.marginTop);
  }

  classes.push(...tokenizeClassString(style.advancedClasses));
  return Array.from(new Set(classes)).join(' ');
}

function cloneColumn(column) {
  return {
    ...column,
    id: nextId('column'),
    nestedContainer: column.nestedContainer ? cloneContainer(column.nestedContainer) : null,
  };
}

function cloneRow(row) {
  return {
    ...row,
    id: nextId('row'),
    columns: row.columns.map(cloneColumn),
  };
}

function cloneContainer(container) {
  return {
    ...container,
    id: nextId('container'),
    title: `${container.title} copy`,
    rows: container.rows.map(cloneRow),
  };
}

function mapContainers(containers, containerId, updater) {
  return containers.map((container) => {
    if (container.id === containerId) {
      return updater(container);
    }

    return {
      ...container,
      rows: container.rows.map((row) => ({
        ...row,
        columns: row.columns.map((column) => ({
          ...column,
          nestedContainer: column.nestedContainer
            ? mapContainers([column.nestedContainer], containerId, updater)[0]
            : null,
        })),
      })),
    };
  });
}

function removeContainer(containers, containerId) {
  return containers
    .filter((container) => container.id !== containerId)
    .map((container) => ({
      ...container,
      rows: container.rows.map((row) => ({
        ...row,
        columns: row.columns.map((column) => ({
          ...column,
          nestedContainer: column.nestedContainer
            ? removeContainer([column.nestedContainer], containerId)[0] ?? null
            : null,
        })),
      })),
    }));
}

function ensureUniqueContainerIds(containers) {
  const seenIds = new Set();
  let changed = false;

  const normalizeContainer = (container) => {
    let containerId = container.id;
    if (seenIds.has(containerId)) {
      containerId = nextId('container');
      changed = true;
    }
    seenIds.add(containerId);

    let nestedChanged = false;
    const rows = container.rows.map((row) => {
      let rowChanged = false;
      const columns = row.columns.map((column) => {
        if (!column.nestedContainer) {
          return column;
        }

        const nestedContainer = normalizeContainer(column.nestedContainer);
        if (nestedContainer !== column.nestedContainer) {
          rowChanged = true;
          nestedChanged = true;
          return { ...column, nestedContainer };
        }

        return column;
      });

      return rowChanged ? { ...row, columns } : row;
    });

    if (containerId !== container.id || nestedChanged) {
      return { ...container, id: containerId, rows };
    }

    return container;
  };

  const normalizedContainers = containers.map(normalizeContainer);
  return { containers: normalizedContainers, changed };
}

function insertContainerClone(containers, containerId) {
  const nextContainers = [];
  let inserted = false;

  containers.forEach((container) => {
    nextContainers.push({
      ...container,
      rows: container.rows.map((row) => {
        const nextColumns = [];

        row.columns.forEach((column) => {
          nextColumns.push({
            ...column,
            nestedContainer: column.nestedContainer
              ? insertContainerClone([column.nestedContainer], containerId)[0]
              : null,
          });

          if (column.nestedContainer?.id === containerId) {
            nextColumns.push(createColumn({
              widgetName: 'nested_container',
              nestedContainer: cloneContainer(column.nestedContainer),
            }));
            inserted = true;
          }
        });

        return { ...row, columns: nextColumns };
      }),
    });

    if (container.id === containerId) {
      nextContainers.push(cloneContainer(container));
      inserted = true;
    }
  });

  return inserted ? nextContainers : containers;
}

function findContainer(containers, containerId) {
  for (const container of containers) {
    if (container.id === containerId) {
      return container;
    }

    for (const row of container.rows) {
      for (const column of row.columns) {
        if (column.nestedContainer) {
          const nestedMatch = findContainer([column.nestedContainer], containerId);
          if (nestedMatch) {
            return nestedMatch;
          }
        }
      }
    }
  }

  return null;
}

function findColumn(containers, columnId) {
  for (const container of containers) {
    for (const row of container.rows) {
      for (const column of row.columns) {
        if (column.id === columnId) {
          return column;
        }

        if (column.nestedContainer) {
          const nestedMatch = findColumn([column.nestedContainer], columnId);
          if (nestedMatch) {
            return nestedMatch;
          }
        }
      }
    }
  }

  return null;
}

function hasContainer(container, containerId) {
  if (!containerId) {
    return false;
  }

  if (container.id === containerId) {
    return true;
  }

  return container.rows.some((row) =>
    row.columns.some((column) => column.nestedContainer && hasContainer(column.nestedContainer, containerId)),
  );
}

function moveItem(items, currentIndex, direction) {
  const targetIndex = currentIndex + direction;
  if (targetIndex < 0 || targetIndex >= items.length) {
    return items;
  }

  const nextItems = [...items];
  const [item] = nextItems.splice(currentIndex, 1);
  nextItems.splice(targetIndex, 0, item);
  return nextItems;
}

function moveContainer(containers, containerId, direction) {
  const containerIndex = containers.findIndex((container) => container.id === containerId);

  if (containerIndex !== -1) {
    return moveItem(containers, containerIndex, direction);
  }

  return containers.map((container) => ({
    ...container,
    rows: container.rows.map((row) => ({
      ...row,
      columns: row.columns.map((column) => ({
        ...column,
        nestedContainer: column.nestedContainer
          ? moveContainer([column.nestedContainer], containerId, direction)[0]
          : null,
      })),
    })),
  }));
}

function collectColumnSelectionIds(containers, sources) {
  const selectedIds = new Set(sources.manualIds);
  const selectedRowIds = new Set(sources.rowIds);

  const visitContainer = (container) => {
    container.rows.forEach((row) => {
      if (selectedRowIds.has(row.id)) {
        row.columns.forEach((column) => selectedIds.add(column.id));
      }

      row.columns.forEach((column) => {
        if (column.nestedContainer) {
          visitContainer(column.nestedContainer);
        }
      });
    });
  };

  containers.forEach(visitContainer);
  return Array.from(selectedIds);
}

function collectRowsByIds(containers, selectedIds, result = []) {
  containers.forEach((container) => {
    container.rows.forEach((row) => {
      if (selectedIds.has(row.id)) {
        result.push(row);
      }

      row.columns.forEach((column) => {
        if (column.nestedContainer) {
          collectRowsByIds([column.nestedContainer], selectedIds, result);
        }
      });
    });
  });

  return result;
}

function collectColumnsByIds(containers, selectedIds, result = []) {
  containers.forEach((container) => {
    container.rows.forEach((row) => {
      row.columns.forEach((column) => {
        if (selectedIds.has(column.id)) {
          result.push(column);
        }

        if (column.nestedContainer) {
          collectColumnsByIds([column.nestedContainer], selectedIds, result);
        }
      });
    });
  });

  return result;
}

function cloneRowsByIds(containers, selectedIds, multiplier) {
  return containers.map((container) => ({
    ...container,
    rows: container.rows.flatMap((row) => {
      const preparedRow = {
        ...row,
        columns: row.columns.map((column) => ({
          ...column,
          nestedContainer: column.nestedContainer
            ? cloneRowsByIds([column.nestedContainer], selectedIds, multiplier)[0]
            : null,
        })),
      };

      return selectedIds.has(row.id)
        ? [preparedRow, ...Array.from({ length: multiplier }, () => cloneRow(preparedRow))]
        : [preparedRow];
    }),
  }));
}

function cloneColumnsByIds(containers, selectedIds, multiplier) {
  return containers.map((container) => ({
    ...container,
    rows: container.rows.map((row) => ({
      ...row,
      columns: row.columns.flatMap((column) => {
        const preparedColumn = {
          ...column,
          nestedContainer: column.nestedContainer
            ? cloneColumnsByIds([column.nestedContainer], selectedIds, multiplier)[0]
            : null,
        };

        return selectedIds.has(column.id)
          ? [preparedColumn, ...Array.from({ length: multiplier }, () => cloneColumn(preparedColumn))]
          : [preparedColumn];
      }),
    })),
  }));
}

function removeRowsByIds(containers, selectedIds, targetContainerId = null) {
  return containers.map((container) => {
    const remainingRows = container.rows
      .filter((row) => !selectedIds.has(row.id))
      .map((row) => ({
        ...row,
        columns: row.columns.map((column) => ({
          ...column,
          nestedContainer: column.nestedContainer
            ? removeRowsByIds([column.nestedContainer], selectedIds, targetContainerId)[0]
            : null,
        })),
      }));

    return {
      ...container,
      rows: remainingRows.length || container.id === targetContainerId
        ? remainingRows
        : [createRow(1)],
    };
  });
}

function removeColumnsByIds(containers, selectedIds, targetRowId = null) {
  return containers.map((container) => ({
    ...container,
    rows: container.rows.map((row) => {
      const remainingColumns = row.columns
        .filter((column) => !selectedIds.has(column.id))
        .map((column) => ({
          ...column,
          nestedContainer: column.nestedContainer
            ? removeColumnsByIds([column.nestedContainer], selectedIds, targetRowId)[0]
            : null,
        }));

      return {
        ...row,
        columns: remainingColumns.length || row.id === targetRowId
          ? remainingColumns
          : [createColumn()],
      };
    }),
  }));
}

function appendRowsToContainer(containers, containerId, rows) {
  return mapContainers(containers, containerId, (container) => ({
    ...container,
    rows: [...container.rows, ...rows],
  }));
}

function appendColumnsToRow(containers, rowId, columns) {
  return containers.map((container) => ({
    ...container,
    rows: container.rows.map((row) => ({
      ...row,
      columns: row.id === rowId ? [...row.columns, ...columns] : row.columns.map((column) => ({
        ...column,
        nestedContainer: column.nestedContainer
          ? appendColumnsToRow([column.nestedContainer], rowId, columns)[0]
          : null,
      })),
    })),
  }));
}

function updateSelectedColumns(containers, selectedIds, updater) {
  return containers.map((container) => ({
    ...container,
    rows: container.rows.map((row) => ({
      ...row,
      columns: row.columns.map((column) => ({
        ...(selectedIds.has(column.id) ? updater(column) : column),
        nestedContainer: column.nestedContainer
          ? updateSelectedColumns([column.nestedContainer], selectedIds, updater)[0]
          : null,
      })),
    })),
  }));
}

function stopEvent(event) {
  event.stopPropagation();
}

function TemplateButtonTooltipLayer() {
  const [tooltip, setTooltip] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const clearTooltip = () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setTooltip(null);
    };

    const getTooltipTarget = (eventTarget) => {
      const button = eventTarget instanceof Element ? eventTarget.closest('button') : null;
      if (!button || (!button.closest('.smplfy-template-edit-page') && !button.closest('.smplfy-modal'))) {
        return null;
      }

      const label = button.dataset.smplfyTooltip || button.getAttribute('aria-label');
      if (!label) {
        return null;
      }

      const visibleLabel = button.querySelector('[data-smplfy-button-label]');
      if (visibleLabel) {
        const labelStyle = window.getComputedStyle(visibleLabel);
        const labelRect = visibleLabel.getBoundingClientRect();
        if (labelStyle.display !== 'none' && labelStyle.visibility !== 'hidden' && labelRect.width > 0) {
          return null;
        }
      }

      return { button, label };
    };

    const scheduleTooltip = (target) => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
      setTooltip(null);

      timerRef.current = window.setTimeout(() => {
        if (!document.body.contains(target.button)) {
          return;
        }

        const rect = target.button.getBoundingClientRect();
        const estimatedWidth = Math.min(240, Math.max(88, target.label.length * 7 + 24));
        const placement = rect.top >= 52 ? 'top' : 'bottom';
        const left = Math.max(
          estimatedWidth / 2 + 12,
          Math.min(rect.left + rect.width / 2, window.innerWidth - estimatedWidth / 2 - 12),
        );

        setTooltip({
          label: target.label,
          left,
          top: placement === 'top' ? rect.top - 8 : rect.bottom + 8,
          placement,
        });
        timerRef.current = null;
      }, 800);
    };

    const handlePointerOver = (event) => {
      const target = getTooltipTarget(event.target);
      if (!target || target.button.contains(event.relatedTarget)) {
        return;
      }
      scheduleTooltip(target);
    };

    const handlePointerOut = (event) => {
      const target = getTooltipTarget(event.target);
      if (!target || target.button.contains(event.relatedTarget)) {
        return;
      }
      clearTooltip();
    };

    const handleFocusIn = (event) => {
      const target = getTooltipTarget(event.target);
      if (target) {
        scheduleTooltip(target);
      }
    };

    document.addEventListener('pointerover', handlePointerOver);
    document.addEventListener('pointerout', handlePointerOut);
    document.addEventListener('pointerdown', clearTooltip, true);
    document.addEventListener('click', clearTooltip, true);
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', clearTooltip);

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
      document.removeEventListener('pointerover', handlePointerOver);
      document.removeEventListener('pointerout', handlePointerOut);
      document.removeEventListener('pointerdown', clearTooltip, true);
      document.removeEventListener('click', clearTooltip, true);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', clearTooltip);
    };
  }, []);

  if (!tooltip) {
    return null;
  }

  return createPortal(
    <span
      className={`smplfy-template-button-tooltip is-${tooltip.placement}`}
      style={{ left: tooltip.left, top: tooltip.top }}
      role="tooltip"
    >
      {tooltip.label}
    </span>,
    document.body,
  );
}

function IconButton({
  icon,
  label,
  variant = 'outline-secondary',
  className = '',
  children,
  onClick,
  ...props
}) {
  return (
    <button
      type="button"
      className={`smplfy-btn btn btn-${variant} btn-sm ${className}`}
      aria-label={label}
      data-smplfy-tooltip={label}
      {...props}
      onClick={(event) => {
        stopEvent(event);
        onClick?.(event);
      }}
    >
      {icon ? <AppIcon name={icon} size={16} /> : null}
      {children}
    </button>
  );
}

function SelectionCheckbox({
  entityType,
  entityLabel,
  checked,
  selectionType,
  onChange,
  onLockedClick,
}) {
  const locked = Boolean(selectionType && selectionType !== entityType);

  return (
    <span
      className={`smplfy-template-selection-checkbox d-inline-flex ${locked ? 'is-locked' : ''}`}
      onPointerDownCapture={(event) => {
        if (!locked) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        onLockedClick?.(entityType);
      }}
      onClick={stopEvent}
    >
      <Checkbox
        checked={checked}
        disabled={locked}
        ariaLabel={`Select ${entityLabel}`}
        onChange={(nextChecked) => onChange(nextChecked)}
      />
    </span>
  );
}

function MenuDropdown({ menuKey, openMenu, onToggle, items }) {
  const triggerRef = useRef(null);
  const open = openMenu?.key === menuKey;

  const openDropdown = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) {
      onToggle({ key: menuKey, left: 0, top: 0 });
      return;
    }

    const menuWidth = 224;
    const estimatedHeight = Math.min(360, 16 + items.filter((item) => !item.divider).length * 38);
    const bottomSpace = window.innerHeight - rect.bottom;
    const shouldOpenUp = bottomSpace < estimatedHeight && rect.top > bottomSpace;
    const left = Math.max(12, Math.min(rect.left, window.innerWidth - menuWidth - 12));
    const top = shouldOpenUp
      ? Math.max(12, rect.top - estimatedHeight - 6)
      : Math.min(rect.bottom + 6, window.innerHeight - 48);

    onToggle({
      key: menuKey,
      left,
      top,
      maxHeight: Math.max(120, window.innerHeight - top - 12),
    });
  };

  return (
    <div className="smplfy-template-menu dropdown" onClick={stopEvent} ref={triggerRef}>
      <IconButton
        icon="more"
        label="More actions"
        className="p-0"
        aria-expanded={open}
        onClick={() => (open ? onToggle(null) : openDropdown())}
      />

      {open ? createPortal(
        <div
          className="smplfy-template-menu-list dropdown-menu show"
          style={{ left: openMenu.left, top: openMenu.top, maxHeight: openMenu.maxHeight }}
          onClick={stopEvent}
        >
          {items.map((item) => (
            item.divider ? (
              <div className="dropdown-divider" key={item.key} />
            ) : (
              <button
                type="button"
                className={`dropdown-item d-flex align-items-center gap-2 ${item.danger ? 'text-danger' : ''}`}
                key={item.key}
                disabled={item.disabled}
                onClick={(event) => {
                  stopEvent(event);
                  onToggle(null);
                  item.onClick?.();
                }}
              >
                <AppIcon name={item.icon} size={16} />
                <span>{item.label}</span>
              </button>
            )
          ))}
        </div>,
        document.body,
      ) : null}
    </div>
  );
}

function WidgetPreview({ label }) {
  return (
    <div className="smplfy-template-widget-preview d-flex align-items-center justify-content-center">
      <span>{label || 'Widget'}</span>
    </div>
  );
}

function BulkActionBar({
  selectionType,
  selectionCount,
  pasteFlow,
  onOpenStyling,
  onSelectChildColumns,
  onClone,
  onStartPaste,
  onDelete,
  onClear,
}) {
  const [multiplier, setMultiplier] = useState('1');
  const entityLabel = selectionType
    ? `${selectionType.charAt(0).toUpperCase()}${selectionType.slice(1)}`
    : '';
  const pluralLabel = selectionCount === 1 ? entityLabel : `${entityLabel}s`;

  useEffect(() => {
    setMultiplier('1');
  }, [selectionType]);

  if (!selectionType || selectionCount === 0) {
    return null;
  }

  const targetingPrompt = pasteFlow?.entityType === 'row'
    ? 'Select a container to paste rows.'
    : pasteFlow?.phase === 'row'
      ? 'Select a row to paste columns.'
      : 'Select a container to open it.';

  return createPortal(
    <div
      className={`smplfy-template-bulk-toolbar ${pasteFlow ? 'is-targeting' : ''}`}
      role="status"
      aria-live="polite"
    >
      <div className="smplfy-template-bulk-status">
        {pasteFlow ? targetingPrompt : `${selectionCount} ${pluralLabel} Selected`}
      </div>

      {!pasteFlow ? (
        <div className="smplfy-template-bulk-actions d-flex align-items-center gap-2">
          {selectionType === 'column' ? (
            <button type="button" className="smplfy-btn btn btn-outline-secondary btn-sm" onClick={onOpenStyling}>
              <AppIcon name="edit" size={16} />
              <span>Styling</span>
            </button>
          ) : null}

          {selectionType === 'row' ? (
            <button
              type="button"
              className="smplfy-btn btn btn-outline-secondary btn-sm"
              onClick={onSelectChildColumns}
            >
              <AppIcon name="checks" size={16} />
              <span>Select Child Columns</span>
            </button>
          ) : null}

          <div className="smplfy-template-clone-multiplier d-flex align-items-center">
            <button
              type="button"
              className="smplfy-btn btn btn-outline-secondary btn-sm"
              onClick={() => onClone(Math.max(1, Number.parseInt(multiplier, 10) || 1))}
            >
              <AppIcon name="copy" size={16} />
              <span>Clone</span>
            </button>
            <span className="px-2 text-secondary" aria-hidden="true">x</span>
            <input
              type="number"
              className="smplfy-form-control form-control form-control-sm"
              min="1"
              max="20"
              value={multiplier}
              aria-label="Number of copies"
              onChange={(event) => setMultiplier(event.target.value)}
              onBlur={() => setMultiplier((current) => String(Math.min(20, Math.max(1, Number.parseInt(current, 10) || 1))))}
            />
          </div>

          {selectionType === 'row' || selectionType === 'column' ? (
            <>
              <button
                type="button"
                className="smplfy-btn btn btn-outline-secondary btn-sm"
                onClick={() => onStartPaste('move')}
              >
                <AppIcon name="arrows-exchange" size={16} />
                <span>Move</span>
              </button>
              <button
                type="button"
                className="smplfy-btn btn btn-outline-secondary btn-sm"
                onClick={() => onStartPaste('copy')}
              >
                <AppIcon name="copy" size={16} />
                <span>Copy</span>
              </button>
            </>
          ) : null}

          <button type="button" className="smplfy-btn btn btn-outline-danger btn-sm" onClick={onDelete}>
            <AppIcon name="trash" size={16} />
            <span>Delete</span>
          </button>
        </div>
      ) : null}

      <button
        type="button"
        className={`smplfy-btn btn btn-sm ${pasteFlow ? 'btn-light' : 'btn-outline-secondary'}`}
        onClick={onClear}
      >
        <AppIcon name="close" size={16} />
        <span>Clear Selection</span>
      </button>
    </div>,
    document.body,
  );
}

function StyleClassControls({ value, onChange }) {
  const style = parseBootstrapClassString(value);
  const selectedAlignment = style.alignment === 'text-center' || style.alignment === 'text-end'
    ? style.alignment
    : '';
  const selectedFontWeight = style.fontWeight === 'fw-bold' || style.fontWeight === 'fw-bolder'
    ? style.fontWeight
    : '';

  const updateStyle = (updater) => {
    const currentStyle = parseBootstrapClassString(value);
    const nextStyle = typeof updater === 'function'
      ? updater(currentStyle)
      : { ...currentStyle, ...updater };
    onChange(buildBootstrapClassString(nextStyle));
  };

  return (
    <div className="smplfy-template-style-controls d-flex flex-column gap-3">
      <div className="row g-3">
        <div className="col-12 col-md-4">
          <FormElement
            type="rich-dropdown"
            label="Width"
            inputProps={{
              value: style.width,
              options: styleWidthOptions,
              maxVisibleItems: 8,
              onChange: (event) => updateStyle({ width: event.target.value || 'col' }),
            }}
          />
        </div>

        <div className="col-12 col-md-4">
          <div className="smplfy-template-style-field d-flex flex-column gap-2">
            <span className="smplfy-form-label form-label mb-0">Text Alignment</span>
            <div className="btn-group w-100" role="group" aria-label="Text alignment">
              {alignmentOptions.map((option) => (
                <button
                  type="button"
                  className={`smplfy-btn btn btn-sm ${
                    selectedAlignment === option.key ? 'btn-primary' : 'btn-outline-secondary'
                  }`}
                  key={option.label}
                  onClick={() => updateStyle({ alignment: option.className })}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="smplfy-template-style-field d-flex flex-column gap-2">
            <span className="smplfy-form-label form-label mb-0">Font Weight</span>
            <div className="btn-group w-100" role="group" aria-label="Font weight">
              {fontWeightOptions.map((option) => (
                <button
                  type="button"
                  className={`smplfy-btn btn btn-sm ${
                    selectedFontWeight === option.key ? 'btn-primary' : 'btn-outline-secondary'
                  }`}
                  key={option.label}
                  onClick={() => updateStyle({ fontWeight: option.className })}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="smplfy-template-style-field d-flex flex-column gap-2">
            <span className="smplfy-form-label form-label mb-0">Borders</span>
            <div className="smplfy-template-border-picker d-flex align-items-center gap-3">
              <div className="smplfy-template-border-preview">
                {Object.keys(borderClassBySide).map((side) => (
                  <button
                    type="button"
                    className={`smplfy-template-border-preview-edge is-${side} ${
                      style.borders[side] ? 'is-active' : ''
                    }`}
                    aria-label={`Toggle ${side} border`}
                    aria-pressed={style.borders[side]}
                    key={side}
                    onClick={() => updateStyle((currentStyle) => ({
                      ...currentStyle,
                      borders: {
                        ...currentStyle.borders,
                        [side]: !currentStyle.borders[side],
                      },
                    }))}
                  />
                ))}
              </div>
              <div className="smplfy-template-border-actions d-grid gap-2">
                {Object.keys(borderClassBySide).map((side) => (
                  <button
                    type="button"
                    className={`smplfy-btn btn btn-sm ${
                      style.borders[side] ? 'btn-primary' : 'btn-outline-secondary'
                    }`}
                    aria-pressed={style.borders[side]}
                    key={side}
                    onClick={() => updateStyle((currentStyle) => ({
                      ...currentStyle,
                      borders: {
                        ...currentStyle.borders,
                        [side]: !currentStyle.borders[side],
                      },
                    }))}
                  >
                    {side.charAt(0).toUpperCase() + side.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <FormElement
            type="rich-dropdown"
            label="Top Margin"
            inputProps={{
              value: style.marginTop,
              options: styleMarginOptions,
              maxVisibleItems: 3,
              onChange: (event) => updateStyle({ marginTop: event.target.value }),
            }}
          />
        </div>

        <div className="col-12">
          <FormElement
            type="text"
            label="Advanced Classes"
            inputProps={{
              value: style.advancedClasses,
              placeholder: 'eg. text-danger',
              onChange: (event) => updateStyle({ advancedClasses: event.target.value }),
            }}
          />
        </div>
      </div>
    </div>
  );
}

function BulkStyleModal({ open, value, onChange, onApply, onClose }) {
  return (
    <Modal
      open={open}
      title="Style Columns"
      titleId="template-bulk-style-modal-title"
      titleIcon="edit"
      onClose={onClose}
      size="lg"
      cardClassName="smplfy-template-style-dialog"
      className="smplfy-template-style-modal"
      actions={(
        <>
          <button type="button" className="smplfy-btn btn btn-outline-secondary btn-sm" onClick={onClose}>
            Close
          </button>
          <button type="button" className="smplfy-btn btn btn-primary btn-sm" onClick={onApply}>
            Apply Classes
          </button>
        </>
      )}
    >
      <StyleClassControls value={value} onChange={onChange} />
    </Modal>
  );
}

function TemplateColumn({
  column,
  rowId,
  rowIndex,
  columnIndex,
  columnCount,
  activeContainerId,
  selectedColumnIds,
  openMenu,
  onToggleMenu,
  onOpenSettings,
  onOpenWidget,
  onToggleColumn,
  onAddNestedContainer,
  onMoveColumn,
  onCloneColumn,
  onDeleteColumn,
  containerHandlers,
}) {
  const selected = containerHandlers.selectionType === 'column' && selectedColumnIds.includes(column.id);
  const menuItems = [
    { key: 'settings', icon: 'settings', label: 'Column settings', onClick: () => onOpenSettings('column', column.id) },
    { key: 'clone', icon: 'copy', label: 'Clone column', onClick: () => onCloneColumn(rowId, column.id) },
    { key: 'add-container', icon: 'plus', label: 'Add container', onClick: () => onAddNestedContainer(rowId, column.id) },
    { key: 'move-left', icon: 'chevron-left', label: 'Move left', onClick: () => onMoveColumn(rowId, column.id, -1) },
    { key: 'move-right', icon: 'chevron-right', label: 'Move right', onClick: () => onMoveColumn(rowId, column.id, 1) },
    { key: 'divider', divider: true },
    { key: 'delete', icon: 'trash', label: 'Delete column', danger: true, onClick: () => onDeleteColumn(rowId, column.id) },
  ];

  return (
    <section className={`smplfy-template-column ${selected ? 'is-selected' : ''} ${column.customClass ?? ''}`.trim()}>
      <div className="smplfy-template-entity-header smplfy-template-column-header" onClick={stopEvent}>
        <div className="d-flex align-items-center gap-2 min-w-0">
          <SelectionCheckbox
            entityType="column"
            entityLabel={`column ${columnIndex + 1}`}
            checked={selected}
            selectionType={containerHandlers.selectionType}
            onChange={(checked) => onToggleColumn(column.id, checked)}
            onLockedClick={containerHandlers.onSelectionLocked}
          />
          <MenuDropdown
            menuKey={`column-${column.id}`}
            openMenu={openMenu}
            onToggle={onToggleMenu}
            items={menuItems}
          />
          <IconButton
            icon="settings"
            label="Column settings"
            className="p-0 smplfy-template-column-settings"
            onClick={() => onOpenSettings('column', column.id)}
          />
        </div>

        <button
          type="button"
          className="smplfy-btn btn btn-primary btn-sm smplfy-template-column-add"
          data-smplfy-tooltip="Add container"
          onClick={(event) => {
            stopEvent(event);
            onAddNestedContainer(rowId, column.id);
          }}
        >
          <AppIcon name="plus" size={16} />
          <span data-smplfy-button-label>Add Container</span>
        </button>
      </div>

      <div className="smplfy-template-column-footer" onClick={stopEvent}>
        <IconButton
          icon="chevron-left"
          label="Move column left"
          className="p-0 smplfy-template-column-move"
          disabled={columnIndex === 0}
          onClick={() => onMoveColumn(rowId, column.id, -1)}
        />
        <button
          type="button"
          className="smplfy-btn smplfy-template-widget-pill btn btn-primary btn-sm"
          data-smplfy-tooltip="Edit widget"
          onClick={(event) => {
            stopEvent(event);
            onOpenWidget(column);
          }}
        >
          <AppIcon name="edit" size={16} />
          <span data-smplfy-button-label>{column.widgetName}</span>
        </button>
        <IconButton
          icon="chevron-right"
          label="Move column right"
          className="p-0 smplfy-template-column-move"
          disabled={columnIndex === columnCount - 1}
          onClick={() => onMoveColumn(rowId, column.id, 1)}
        />
      </div>

      <div className="smplfy-template-column-content">
        {column.nestedContainer ? (
          <TemplateContainer
            container={column.nestedContainer}
            activeContainerId={activeContainerId}
            selectedColumnIds={selectedColumnIds}
            openMenu={openMenu}
            onToggleMenu={onToggleMenu}
            onOpenSettings={onOpenSettings}
            onOpenWidget={onOpenWidget}
            handlers={containerHandlers}
            depth={1}
          />
        ) : (
          <WidgetPreview label="Widget" />
        )}
      </div>
    </section>
  );
}

function TemplateRow({
  row,
  containerId,
  rowIndex,
  rowCount,
  activeContainerId,
  selectedColumnIds,
  openMenu,
  onToggleMenu,
  onOpenSettings,
  onOpenWidget,
  onMoveRow,
  onAddColumn,
  onCloneRow,
  onDeleteRow,
  onToggleRowSelection,
  onToggleColumn,
  onAddNestedContainer,
  onMoveColumn,
  onCloneColumn,
  onDeleteColumn,
  containerHandlers,
}) {
  const rowSelected = containerHandlers.selectionType === 'row'
    && containerHandlers.selectedIds.includes(row.id);
  const hasRowSelection = containerHandlers.columnSelectionSources.rowIds.includes(row.id);
  const rowSelectionLabel = hasRowSelection ? 'Cancel Selection' : 'Select All';
  const isPasteTarget = containerHandlers.pasteFlow?.entityType === 'column'
    && containerHandlers.pasteFlow.phase === 'row'
    && containerHandlers.pasteFlow.targetContainerId === containerId;
  const menuItems = [
    { key: 'settings', icon: 'settings', label: 'Row settings', onClick: () => onOpenSettings('row', row.id) },
    { key: 'clone', icon: 'copy', label: 'Clone row', onClick: () => onCloneRow(row.id) },
    { key: 'select-toggle', icon: hasRowSelection ? 'close' : 'checks', label: rowSelectionLabel, onClick: () => onToggleRowSelection(row.id) },
    { key: 'add-column', icon: 'plus', label: 'Add column', onClick: () => onAddColumn(row.id) },
    { key: 'move-up', icon: 'chevron-up', label: 'Move row up', onClick: () => onMoveRow(row.id, -1) },
    { key: 'move-down', icon: 'chevron-down', label: 'Move row down', onClick: () => onMoveRow(row.id, 1) },
    { key: 'divider', divider: true },
    { key: 'delete', icon: 'trash', label: 'Delete row', danger: true, onClick: () => onDeleteRow(row.id) },
  ];

  return (
    <section
      className={`smplfy-template-row ${isPasteTarget ? 'is-paste-target' : ''}`}
      onClick={(event) => {
        if (isPasteTarget) {
          stopEvent(event);
          containerHandlers.onChooseRowTarget(row.id);
        }
      }}
    >
      <div
        className="smplfy-template-entity-header smplfy-template-row-header"
        onClick={(event) => {
          stopEvent(event);
          if (isPasteTarget) {
            containerHandlers.onChooseRowTarget(row.id);
          }
        }}
      >
        <div className="d-flex align-items-center gap-2 min-w-0">
          <SelectionCheckbox
            entityType="row"
            entityLabel={`row ${rowIndex + 1}`}
            checked={rowSelected}
            selectionType={containerHandlers.selectionType}
            onChange={(checked) => containerHandlers.onToggleEntitySelection('row', row.id, checked)}
            onLockedClick={containerHandlers.onSelectionLocked}
          />
          <MenuDropdown
            menuKey={`row-${row.id}`}
            openMenu={openMenu}
            onToggle={onToggleMenu}
            items={menuItems}
          />
          <IconButton
            icon="settings"
            label="Row settings"
            className="p-0 smplfy-template-row-settings"
            onClick={() => onOpenSettings('row', row.id)}
          />
          <button
            type="button"
            className="smplfy-btn btn btn-outline-secondary btn-sm smplfy-template-row-clone"
            data-smplfy-tooltip="Clone row"
            onClick={(event) => {
              stopEvent(event);
              onCloneRow(row.id);
            }}
          >
            <AppIcon name="copy" size={16} />
            <span data-smplfy-button-label>Clone</span>
          </button>
          <button
            type="button"
            className="smplfy-btn btn btn-outline-secondary btn-sm smplfy-template-row-select"
            data-smplfy-tooltip={rowSelectionLabel}
            onClick={(event) => {
              stopEvent(event);
              onToggleRowSelection(row.id);
            }}
          >
            <AppIcon name={hasRowSelection ? 'close' : 'checks'} size={16} />
            <span data-smplfy-button-label>{rowSelectionLabel}</span>
          </button>
          <button
            type="button"
            className="smplfy-btn btn btn-outline-secondary btn-sm smplfy-template-row-add"
            data-smplfy-tooltip="Add column"
            onClick={(event) => {
              stopEvent(event);
              onAddColumn(row.id);
            }}
          >
            <AppIcon name="plus" size={16} />
            <span data-smplfy-button-label>Column</span>
          </button>
        </div>

        <div className="d-flex align-items-center gap-2">
          <IconButton
            icon="chevron-up"
            label="Move row up"
            className="p-0"
            disabled={rowIndex === 0}
            onClick={() => onMoveRow(row.id, -1)}
          />
          <IconButton
            icon="chevron-down"
            label="Move row down"
            className="p-0"
            disabled={rowIndex === rowCount - 1}
            onClick={() => onMoveRow(row.id, 1)}
          />
        </div>
      </div>

      <div
        className="smplfy-template-row-grid"
        style={{ gridTemplateColumns: `repeat(${row.columns.length}, minmax(0, 1fr))` }}
      >
        {row.columns.map((column, columnIndex) => (
          <TemplateColumn
            key={column.id}
            column={column}
            rowId={row.id}
            rowIndex={rowIndex}
            columnIndex={columnIndex}
            columnCount={row.columns.length}
            activeContainerId={activeContainerId}
            selectedColumnIds={selectedColumnIds}
            openMenu={openMenu}
            onToggleMenu={onToggleMenu}
            onOpenSettings={onOpenSettings}
            onOpenWidget={onOpenWidget}
            onToggleColumn={onToggleColumn}
            onAddNestedContainer={onAddNestedContainer}
            onMoveColumn={onMoveColumn}
            onCloneColumn={onCloneColumn}
            onDeleteColumn={onDeleteColumn}
            containerHandlers={containerHandlers}
          />
        ))}
      </div>
    </section>
  );
}

function PreviewRow({
  row,
  activeContainerId,
  selectedColumnIds,
  openMenu,
  onToggleMenu,
  onOpenSettings,
  onOpenWidget,
  handlers,
}) {
  return (
    <div
      className="smplfy-template-preview-row"
      style={{ gridTemplateColumns: `repeat(${row.columns.length}, minmax(0, 1fr))` }}
    >
      {row.columns.map((column) => (
        <div className="smplfy-template-preview-column" key={column.id}>
          {column.nestedContainer ? (
            <TemplateContainer
              container={column.nestedContainer}
              activeContainerId={activeContainerId}
              selectedColumnIds={selectedColumnIds}
              openMenu={openMenu}
              onToggleMenu={onToggleMenu}
              onOpenSettings={onOpenSettings}
              onOpenWidget={onOpenWidget}
              handlers={handlers}
              depth={1}
            />
          ) : (
            <WidgetPreview label="Widget" />
          )}
        </div>
      ))}
    </div>
  );
}

function TemplateContainer({
  container,
  activeContainerId,
  selectedColumnIds,
  openMenu,
  onToggleMenu,
  onOpenSettings,
  onOpenWidget,
  handlers,
  depth = 0,
  containerIndex = 0,
  containerCount = 1,
}) {
  const isActive = activeContainerId === container.id;
  const hasActiveChild = !isActive && hasContainer(container, activeContainerId);
  const containerSelected = handlers.selectionType === 'container'
    && handlers.selectedIds.includes(container.id);
  const immediateRowIds = container.rows.map((row) => row.id);
  const hasContainerSelection = handlers.selectionType === 'row'
    && immediateRowIds.length > 0
    && immediateRowIds.every((rowId) => handlers.selectedIds.includes(rowId));
  const selectionLabel = hasContainerSelection ? 'Cancel Selection' : 'Select All';
  const isPasteTarget = handlers.pasteFlow?.phase === 'container';
  const menuItems = [
    { key: 'settings', icon: 'settings', label: 'Container settings', onClick: () => onOpenSettings('container', container.id) },
    { key: 'clone', icon: 'copy', label: 'Clone container', onClick: () => handlers.onCloneContainer(container.id) },
    { key: 'select-toggle', icon: hasContainerSelection ? 'close' : 'checks', label: selectionLabel, onClick: () => handlers.onToggleContainerSelection(container.id) },
    { key: 'add-row', icon: 'plus', label: 'Add row', onClick: () => handlers.onAddRow(container.id) },
    { key: 'move-up', icon: 'chevron-up', label: 'Move container up', disabled: containerIndex === 0, onClick: () => handlers.onMoveContainer(container.id, -1) },
    { key: 'move-down', icon: 'chevron-down', label: 'Move container down', disabled: containerIndex === containerCount - 1, onClick: () => handlers.onMoveContainer(container.id, 1) },
    { key: 'copy', icon: 'copy', label: 'Copy container', onClick: () => handlers.onCopyContainer(container.id) },
    { key: 'divider', divider: true },
    { key: 'delete', icon: 'trash', label: 'Delete container', danger: true, onClick: () => handlers.onDeleteContainer(container.id) },
  ];

  return (
    <section
      className={`smplfy-template-container ${isActive ? 'is-active' : ''} ${hasActiveChild ? 'has-active-child' : ''} ${isPasteTarget ? 'is-paste-target' : ''}`}
      data-depth={depth}
      onClick={(event) => {
        if (isPasteTarget) {
          stopEvent(event);
          handlers.onChooseContainerTarget(container.id);
        }
      }}
    >
      <div
        className="smplfy-template-entity-header smplfy-template-container-header"
        onClick={(event) => {
          stopEvent(event);
          if (isPasteTarget) {
            handlers.onChooseContainerTarget(container.id);
          }
        }}
      >
        <div className="d-flex align-items-center gap-2 min-w-0">
          <SelectionCheckbox
            entityType="container"
            entityLabel="container"
            checked={containerSelected}
            selectionType={handlers.selectionType}
            onChange={(checked) => handlers.onToggleEntitySelection('container', container.id, checked)}
            onLockedClick={handlers.onSelectionLocked}
          />
          {isActive ? (
            <>
              <MenuDropdown
                menuKey={`container-${container.id}`}
                openMenu={openMenu}
                onToggle={onToggleMenu}
                items={menuItems}
              />
              <IconButton
                icon="settings"
                label="Container settings"
                className="p-0 smplfy-template-container-action smplfy-template-container-settings"
                onClick={() => onOpenSettings('container', container.id)}
              />
              <button
                type="button"
                className="smplfy-btn btn btn-outline-secondary btn-sm smplfy-template-container-action smplfy-template-container-clone"
                onClick={(event) => {
                  stopEvent(event);
                  handlers.onCloneContainer(container.id);
                }}
              >
                <AppIcon name="copy" size={16} />
                <span>Clone</span>
              </button>
              <button
                type="button"
                className="smplfy-btn btn btn-outline-secondary btn-sm smplfy-template-container-action smplfy-template-container-select"
                data-smplfy-tooltip={selectionLabel}
                onClick={(event) => {
                  stopEvent(event);
                  handlers.onToggleContainerSelection(container.id);
                }}
              >
                <AppIcon name={hasContainerSelection ? 'close' : 'checks'} size={16} />
                <span data-smplfy-button-label>{selectionLabel}</span>
              </button>
              <button
                type="button"
                className="smplfy-btn btn btn-outline-secondary btn-sm smplfy-template-container-action smplfy-template-container-add-row"
                data-smplfy-tooltip="Add row"
                onClick={(event) => {
                  stopEvent(event);
                  handlers.onAddRow(container.id);
                }}
              >
                <AppIcon name="plus" size={16} />
                <span data-smplfy-button-label>Row</span>
              </button>
            </>
          ) : null}
        </div>

        <div className="d-flex align-items-center gap-2 flex-shrink-0">
          {isActive ? (
            <div className="d-flex align-items-center gap-2 smplfy-template-container-move-actions">
              <IconButton
                icon="chevron-up"
                label="Move container up"
                className="p-0"
                disabled={containerIndex === 0}
                onClick={() => handlers.onMoveContainer(container.id, -1)}
              />
              <IconButton
                icon="chevron-down"
                label="Move container down"
                className="p-0"
                disabled={containerIndex === containerCount - 1}
                onClick={() => handlers.onMoveContainer(container.id, 1)}
              />
            </div>
          ) : null}
          <IconButton
            icon={isActive ? 'check' : 'edit'}
            label={isActive ? 'Done editing container' : 'Edit container'}
            variant={isActive ? 'primary' : 'outline-secondary'}
            className="p-0 smplfy-template-edit-toggle"
            onClick={() => (
              isPasteTarget
                ? handlers.onChooseContainerTarget(container.id)
                : handlers.onToggleContainer(container.id)
            )}
          />
        </div>
      </div>

      <div className={`smplfy-template-container-body ${isActive ? 'is-build-mode' : 'is-preview-mode'}`}>
        {isActive ? (
          container.rows.map((row, rowIndex) => (
            <TemplateRow
              key={row.id}
              row={row}
              containerId={container.id}
              rowIndex={rowIndex}
              rowCount={container.rows.length}
              activeContainerId={activeContainerId}
              selectedColumnIds={selectedColumnIds}
              openMenu={openMenu}
              onToggleMenu={onToggleMenu}
              onOpenSettings={onOpenSettings}
              onOpenWidget={onOpenWidget}
              onMoveRow={(rowId, direction) => handlers.onMoveRow(container.id, rowId, direction)}
              onAddColumn={(rowId) => handlers.onAddColumn(container.id, rowId)}
              onCloneRow={(rowId) => handlers.onCloneRow(container.id, rowId)}
              onDeleteRow={(rowId) => handlers.onDeleteRow(container.id, rowId)}
              onToggleRowSelection={(rowId) => handlers.onToggleRowSelection(container.id, rowId)}
              onToggleColumn={handlers.onToggleColumn}
              onAddNestedContainer={(rowId, columnId) => handlers.onAddNestedContainer(container.id, rowId, columnId)}
              onMoveColumn={(rowId, columnId, direction) =>
                handlers.onMoveColumn(container.id, rowId, columnId, direction)
              }
              onCloneColumn={(rowId, columnId) => handlers.onCloneColumn(container.id, rowId, columnId)}
              onDeleteColumn={(rowId, columnId) => handlers.onDeleteColumn(container.id, rowId, columnId)}
              containerHandlers={handlers}
            />
          ))
        ) : (
          container.rows.map((row) => (
            <PreviewRow
              key={row.id}
              row={row}
              activeContainerId={activeContainerId}
              selectedColumnIds={selectedColumnIds}
              openMenu={openMenu}
              onToggleMenu={onToggleMenu}
              onOpenSettings={onOpenSettings}
              onOpenWidget={onOpenWidget}
              handlers={handlers}
            />
          ))
        )}
      </div>
    </section>
  );
}

function TemplateActionBar({ onNavigate, onAddRootContainer }) {
  return (
    <section className="smplfy-template-edit-actionbar bg-white border-bottom">
      <div className="d-flex align-items-center justify-content-between gap-3">
        <button
          type="button"
          className="smplfy-btn btn btn-outline-secondary btn-sm px-0 flex-shrink-0"
          aria-label="Back"
          onClick={() => onNavigate?.('dashboard')}
        >
          <AppIcon name="chevron-left" size={18} />
        </button>

        <div className="d-flex align-items-center gap-2">
          <button type="button" className="smplfy-btn btn btn-primary btn-sm" onClick={onAddRootContainer}>
            <AppIcon name="plus" />
            <span>Add Container</span>
          </button>
        </div>
      </div>
    </section>
  );
}

function EmptyTemplateState({ onAddContainer }) {
  return (
    <div className="smplfy-template-empty-state d-flex flex-column align-items-center justify-content-center text-center">
      <div className="smplfy-template-empty-icon d-flex align-items-center justify-content-center">
        <AppIcon name="plus" size={28} />
      </div>
      <div>
        <div className="smplfy-template-empty-title">No containers added</div>
        <div className="smplfy-template-empty-subtitle text-secondary">
          Start this template by adding the first container.
        </div>
      </div>
      <button type="button" className="smplfy-btn btn btn-primary" onClick={onAddContainer}>
        <AppIcon name="plus" />
        <span>Add Container</span>
      </button>
    </div>
  );
}

const containerSettingFlags = [
  'Filter',
  'Header',
  'Footer',
  'Param Loop',
  'Sample Loop',
  'Horizontal Param Loop',
  'Horizontal Sample Loop',
];

function ContainerSettingsContent() {
  return (
    <div className="smplfy-template-container-settings">
      <div className="d-flex flex-column gap-3">
        <div className="d-flex flex-column gap-2">
          {containerSettingFlags.map((flag) => (
            <label className="smplfy-template-settings-check d-flex align-items-center gap-2" key={flag}>
              <Checkbox ariaLabel={flag} />
              <span>{flag}</span>
            </label>
          ))}
        </div>

        <label className="smplfy-template-settings-field">
          <span>Horizontal Loop Index</span>
          <input className="smplfy-form-control form-control" />
        </label>

        <label className="smplfy-template-settings-field">
          <span>Unique Name</span>
          <input className="smplfy-form-control form-control" defaultValue="06b0d2010c498498d2b20d82" />
        </label>

        <label className="smplfy-template-settings-field">
          <span>Index of the container</span>
          <input className="smplfy-form-control form-control" defaultValue="1" />
        </label>
      </div>
    </div>
  );
}

function ColumnSettingsSection({ title, description, children }) {
  return (
    <section className="smplfy-template-column-settings-section card border shadow-none">
      <div className="card-body">
        <div className="d-flex flex-column gap-1">
          <h3 className="smplfy-template-column-settings-title mb-0">{title}</h3>
          <p className="smplfy-template-column-settings-description text-secondary mb-0">
            {description}
          </p>
        </div>
        <div className="smplfy-template-column-settings-content">
          {children}
        </div>
      </div>
    </section>
  );
}

function ColumnSettingsContent({ classValue, onClassChange }) {
  const [widget, setWidget] = useState('Text Widget');
  const [master, setMaster] = useState('');
  const [editRole, setEditRole] = useState('');
  const [viewRole, setViewRole] = useState('');
  const [displaySettings, setDisplaySettings] = useState(() =>
    columnDisplayOptions.reduce((settings, option) => ({
      ...settings,
      [option.key]: option.checked,
    }), {}),
  );

  const handleDisplayChange = (key, checked) => {
    setDisplaySettings((current) => ({ ...current, [key]: checked }));
  };

  return (
    <div className="smplfy-template-column-settings d-flex flex-column gap-3">
      <ColumnSettingsSection
        title="Layout"
        description="Control the widget type, display class, and master data."
      >
        <div className="row g-3">
          <div className="col-12 col-lg-6">
            <FormElement
              type="rich-dropdown"
              label="Widget"
              inputProps={{
                value: widget,
                placeholder: 'Select widget',
                options: widgetOptions,
                searchable: true,
                searchPlaceholder: 'Search widget',
                maxVisibleItems: 9,
                onChange: (event) => setWidget(event.target.value),
              }}
            />
          </div>
          <div className="col-12">
            <StyleClassControls value={classValue} onChange={onClassChange} />
          </div>
          <div className="col-12 col-lg-6">
            <FormElement
              type="rich-dropdown"
              label="Master"
              inputProps={{
                value: master,
                placeholder: 'Select Master',
                options: masterOptions,
                onChange: (event) => setMaster(event.target.value),
              }}
            />
          </div>
        </div>
      </ColumnSettingsSection>

      <ColumnSettingsSection
        title="Access"
        description="Choose which roles can edit or view this column."
      >
        <div className="row g-3">
          <div className="col-12 col-lg-6">
            <FormElement
              type="rich-dropdown"
              label="Who Can Edit?"
              inputProps={{
                value: editRole,
                placeholder: 'Select edit roles',
                options: roleOptions,
                onChange: (event) => setEditRole(event.target.value),
              }}
            />
          </div>
          <div className="col-12 col-lg-6">
            <FormElement
              type="rich-dropdown"
              label="Who Can View?"
              inputProps={{
                value: viewRole,
                placeholder: 'Select view roles',
                options: roleOptions,
                onChange: (event) => setViewRole(event.target.value),
              }}
            />
          </div>
        </div>
      </ColumnSettingsSection>

      <ColumnSettingsSection
        title="Display"
        description="Set where this column appears in reports and templates."
      >
        <div className="smplfy-template-display-grid">
          {columnDisplayOptions.map((option) => (
            <label
              className="smplfy-template-display-option d-flex align-items-center gap-3"
              key={option.key}
            >
              <Checkbox
                checked={Boolean(displaySettings[option.key])}
                ariaLabel={option.label}
                onChange={(checked) => handleDisplayChange(option.key, checked)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </ColumnSettingsSection>
    </div>
  );
}

function SettingsModal({ target, targetColumn, onClose, onSaveColumnClass }) {
  const entityName = target?.type
    ? `${target.type.charAt(0).toUpperCase()}${target.type.slice(1)} Settings`
    : 'Settings';
  const isContainerSettings = target?.type === 'container';
  const isColumnSettings = target?.type === 'column';
  const [columnClassValue, setColumnClassValue] = useState('');

  useEffect(() => {
    if (isColumnSettings) {
      setColumnClassValue(targetColumn?.customClass ?? '');
    }
  }, [isColumnSettings, targetColumn?.id, targetColumn?.customClass]);

  const handleColumnSave = () => {
    if (target?.id) {
      onSaveColumnClass?.(target.id, columnClassValue);
    }
    onClose();
  };

  return (
    <Modal
      open={Boolean(target)}
      title={entityName}
      titleId="template-settings-modal-title"
      titleIcon={isContainerSettings ? undefined : 'settings'}
      onClose={onClose}
      size={isColumnSettings ? 'xl' : isContainerSettings ? 'lg' : 'md'}
      cardClassName={isColumnSettings ? 'smplfy-template-column-settings-dialog' : ''}
      className={[
        isContainerSettings ? 'smplfy-template-settings-modal' : '',
        isColumnSettings ? 'smplfy-template-column-settings-modal' : '',
      ].filter(Boolean).join(' ')}
      bodyClassName={
        isContainerSettings || isColumnSettings
          ? 'smplfy-template-settings-modal-body'
          : ''
      }
      actions={
        isContainerSettings ? (
          <>
            <button type="button" className="smplfy-btn btn btn-link text-success text-decoration-none">
              Save
            </button>
            <button type="button" className="smplfy-btn btn btn-link text-danger text-decoration-none" onClick={onClose}>
              Close
            </button>
          </>
        ) : isColumnSettings ? (
          <>
            <button type="button" className="smplfy-btn btn btn-outline-secondary btn-sm" onClick={onClose}>
              Close
            </button>
            <button type="button" className="smplfy-btn btn btn-primary btn-sm" onClick={handleColumnSave}>
              Save
            </button>
          </>
        ) : null
      }
    >
      {isContainerSettings ? (
        <ContainerSettingsContent />
      ) : isColumnSettings ? (
        <ColumnSettingsContent
          classValue={columnClassValue}
          onClassChange={setColumnClassValue}
        />
      ) : (
        <div className="smplfy-template-modal-empty text-secondary">
          Properties for this {target?.type ?? 'entity'} will appear here.
        </div>
      )}
    </Modal>
  );
}

function WidgetModal({ widget, onClose }) {
  return (
    <Modal
      open={Boolean(widget)}
      title="Widget Configuration"
      titleId="template-widget-modal-title"
      titleIcon="settings"
      onClose={onClose}
      size="md"
    >
      <div className="d-flex flex-column gap-3">
        <label className="smplfy-template-field">
          <span>Widget Name</span>
          <input className="smplfy-form-control form-control" value={widget?.widgetName ?? ''} readOnly />
        </label>
        <div className="smplfy-template-modal-empty text-secondary">
          Widget-level configuration will be connected in a later pass.
        </div>
      </div>
    </Modal>
  );
}

export default function TemplateEditPage({
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  sidebarBadgeCounts,
}) {
  const [containers, setContainers] = useState(initialTemplate);
  const [activeContainerId, setActiveContainerId] = useState('');
  const [selectionType, setSelectionType] = useState(null);
  const [selectedEntityIds, setSelectedEntityIds] = useState([]);
  const [columnSelectionSources, setColumnSelectionSources] = useState({
    manualIds: [],
    rowIds: [],
  });
  const [pasteFlow, setPasteFlow] = useState(null);
  const [selectionNotice, setSelectionNotice] = useState('');
  const [bulkStyleOpen, setBulkStyleOpen] = useState(false);
  const [bulkClassValue, setBulkClassValue] = useState('');
  const [openMenu, setOpenMenu] = useState(null);
  const [settingsTarget, setSettingsTarget] = useState(null);
  const [widgetTarget, setWidgetTarget] = useState(null);
  const [copyStatus, setCopyStatus] = useState('');
  const selectedColumnIds = collectColumnSelectionIds(containers, columnSelectionSources);
  const selectedIds = selectionType === 'column' ? selectedColumnIds : selectedEntityIds;
  const settingsTargetColumn = settingsTarget?.type === 'column'
    ? findColumn(containers, settingsTarget.id)
    : null;

  const clearSelection = () => {
    setSelectionType(null);
    setSelectedEntityIds([]);
    setColumnSelectionSources({ manualIds: [], rowIds: [] });
    setPasteFlow(null);
  };

  const showSelectionLockNotice = (nextType) => {
    if (!selectionType || selectionType === nextType) {
      return false;
    }

    const currentLabel = `${selectionType.charAt(0).toUpperCase()}${selectionType.slice(1)}`;
    const nextLabel = `${nextType.charAt(0).toUpperCase()}${nextType.slice(1)}`;
    setSelectionNotice(`Clear your ${currentLabel} selection first to select ${nextLabel}.`);
    return true;
  };

  const applyColumnSelectionSources = (nextSources) => {
    const nextColumnIds = collectColumnSelectionIds(containers, nextSources);
    setColumnSelectionSources(nextSources);
    setSelectedEntityIds([]);
    setSelectionType(nextColumnIds.length ? 'column' : null);
    if (!nextColumnIds.length) {
      setPasteFlow(null);
    }
  };

  useEffect(() => {
    setContainers((current) => {
      const normalized = ensureUniqueContainerIds(current);
      return normalized.changed ? normalized.containers : current;
    });
  }, [containers]);

  useEffect(() => {
    if (!selectionNotice) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setSelectionNotice(''), 2600);
    return () => window.clearTimeout(timeout);
  }, [selectionNotice]);

  const handlers = {
    selectionType,
    selectedIds,
    columnSelectionSources,
    pasteFlow,
    onToggleContainer: (containerId) => {
      setOpenMenu(null);
      setActiveContainerId((current) => (current === containerId ? '' : containerId));
    },
    onAddRootContainer: () => {
      const nextContainer = createContainer({ title: 'New report container', rows: [createRow(1)] });
      setContainers((current) => [...current, nextContainer]);
      setActiveContainerId(nextContainer.id);
    },
    onAddRow: (containerId) => {
      setContainers((current) =>
        mapContainers(current, containerId, (container) => ({
          ...container,
          rows: [...container.rows, createRow(1)],
        })),
      );
      setActiveContainerId(containerId);
    },
    onMoveContainer: (containerId, direction) => {
      setContainers((current) => moveContainer(current, containerId, direction));
    },
    onMoveRow: (containerId, rowId, direction) => {
      setContainers((current) =>
        mapContainers(current, containerId, (container) => {
          const rowIndex = container.rows.findIndex((row) => row.id === rowId);
          return { ...container, rows: moveItem(container.rows, rowIndex, direction) };
        }),
      );
    },
    onCloneRow: (containerId, rowId) => {
      setContainers((current) =>
        mapContainers(current, containerId, (container) => ({
          ...container,
          rows: container.rows.flatMap((row) => (row.id === rowId ? [row, cloneRow(row)] : [row])),
        })),
      );
    },
    onDeleteRow: (containerId, rowId) => {
      setContainers((current) =>
        mapContainers(current, containerId, (container) => {
          if (container.rows.length === 1) {
            return container;
          }

          return { ...container, rows: container.rows.filter((row) => row.id !== rowId) };
        }),
      );
      clearSelection();
    },
    onAddColumn: (containerId, rowId) => {
      setContainers((current) =>
        mapContainers(current, containerId, (container) => ({
          ...container,
          rows: container.rows.map((row) =>
            row.id === rowId
              ? { ...row, columns: [...row.columns, createColumn()] }
              : row,
          ),
        })),
      );
    },
    onMoveColumn: (containerId, rowId, columnId, direction) => {
      setContainers((current) =>
        mapContainers(current, containerId, (container) => ({
          ...container,
          rows: container.rows.map((row) => {
            if (row.id !== rowId) {
              return row;
            }

            const columnIndex = row.columns.findIndex((column) => column.id === columnId);
            return { ...row, columns: moveItem(row.columns, columnIndex, direction) };
          }),
        })),
      );
    },
    onCloneColumn: (containerId, rowId, columnId) => {
      setContainers((current) =>
        mapContainers(current, containerId, (container) => ({
          ...container,
          rows: container.rows.map((row) =>
            row.id === rowId
              ? {
                ...row,
                columns: row.columns.flatMap((column) =>
                  column.id === columnId ? [column, cloneColumn(column)] : [column],
                ),
              }
              : row,
          ),
        })),
      );
    },
    onDeleteColumn: (containerId, rowId, columnId) => {
      setContainers((current) =>
        mapContainers(current, containerId, (container) => ({
          ...container,
          rows: container.rows.map((row) => {
            if (row.id !== rowId || row.columns.length === 1) {
              return row;
            }

            return { ...row, columns: row.columns.filter((column) => column.id !== columnId) };
          }),
        })),
      );
      clearSelection();
    },
    onAddNestedContainer: (containerId, rowId, columnId) => {
      const nestedContainer = createContainer({
        title: 'Nested container',
        rows: [createRow(1)],
      });

      setContainers((current) =>
        mapContainers(current, containerId, (container) => ({
          ...container,
          rows: container.rows.map((row) =>
            row.id === rowId
              ? {
                ...row,
                columns: row.columns.map((column) =>
                  column.id === columnId
                    ? { ...column, widgetName: 'nested_container', nestedContainer }
                    : column,
                ),
              }
              : row,
          ),
        })),
      );
      setActiveContainerId(nestedContainer.id);
    },
    onCloneContainer: (containerId) => {
      setContainers((current) => insertContainerClone(current, containerId));
    },
    onDeleteContainer: (containerId) => {
      setContainers((current) => removeContainer(current, containerId));
      setActiveContainerId((current) => (current === containerId ? '' : current));
      clearSelection();
    },
    onCopyContainer: (containerId) => {
      setCopyStatus(`Copied ${containerId}`);
    },
    onSelectionLocked: (nextType) => {
      showSelectionLockNotice(nextType);
    },
    onToggleEntitySelection: (entityType, entityId, checked) => {
      if (showSelectionLockNotice(entityType)) {
        return;
      }

      const nextIds = checked
        ? Array.from(new Set([...selectedEntityIds, entityId]))
        : selectedEntityIds.filter((id) => id !== entityId);
      setSelectedEntityIds(nextIds);
      setSelectionType(nextIds.length ? entityType : null);
      if (!nextIds.length) {
        setPasteFlow(null);
      }
    },
    onToggleContainerSelection: (containerId) => {
      const targetContainer = findContainer(containers, containerId);
      if (!targetContainer) {
        return;
      }

      const childRowIds = targetContainer.rows.map((row) => row.id);
      const hasSelection = selectionType === 'row'
        && childRowIds.every((rowId) => selectedEntityIds.includes(rowId));
      const childRowIdSet = new Set(childRowIds);
      const nextRowIds = hasSelection
        ? selectedEntityIds.filter((rowId) => !childRowIdSet.has(rowId))
        : childRowIds;

      setColumnSelectionSources({ manualIds: [], rowIds: [] });
      setSelectedEntityIds(nextRowIds);
      setSelectionType(nextRowIds.length ? 'row' : null);
      setPasteFlow(null);
    },
    onToggleRowSelection: (containerId, rowId) => {
      const targetContainer = findContainer(containers, containerId);
      const targetRow = targetContainer?.rows.find((row) => row.id === rowId);
      if (!targetRow) {
        return;
      }

      const hasSelection = selectionType === 'column'
        && columnSelectionSources.rowIds.includes(rowId);
      const baseSources = selectionType === 'column'
        ? columnSelectionSources
        : { manualIds: [], rowIds: [] };

      applyColumnSelectionSources({
        ...baseSources,
        rowIds: hasSelection
          ? baseSources.rowIds.filter((id) => id !== rowId)
          : Array.from(new Set([...baseSources.rowIds, rowId])),
      });
    },
    onToggleColumn: (columnId, checked) => {
      if (showSelectionLockNotice('column')) {
        return;
      }

      applyColumnSelectionSources({
        ...columnSelectionSources,
        manualIds: checked
          ? Array.from(new Set([...columnSelectionSources.manualIds, columnId]))
          : columnSelectionSources.manualIds.filter((id) => id !== columnId),
      });
    },
    onSelectChildColumns: () => {
      if (selectionType !== 'row') {
        return;
      }

      const selectedRowIdSet = new Set(selectedEntityIds);
      const childColumnIds = collectRowsByIds(containers, selectedRowIdSet)
        .flatMap((row) => row.columns.map((column) => column.id));

      applyColumnSelectionSources({
        manualIds: Array.from(new Set(childColumnIds)),
        rowIds: [],
      });
    },
    onBulkClone: (requestedMultiplier) => {
      const multiplier = Math.min(20, Math.max(1, requestedMultiplier));
      const selectedIdSet = new Set(selectedIds);

      setContainers((current) => {
        if (selectionType === 'container') {
          let nextContainers = current;
          selectedIds.forEach((containerId) => {
            for (let index = 0; index < multiplier; index += 1) {
              nextContainers = insertContainerClone(nextContainers, containerId);
            }
          });
          return nextContainers;
        }

        if (selectionType === 'row') {
          return cloneRowsByIds(current, selectedIdSet, multiplier);
        }

        return cloneColumnsByIds(current, selectedIdSet, multiplier);
      });
      clearSelection();
    },
    onBulkDelete: () => {
      const selectedIdSet = new Set(selectedIds);

      setContainers((current) => {
        if (selectionType === 'container') {
          return selectedIds.reduce(
            (nextContainers, containerId) => removeContainer(nextContainers, containerId),
            current,
          );
        }

        if (selectionType === 'row') {
          return removeRowsByIds(current, selectedIdSet);
        }

        return removeColumnsByIds(current, selectedIdSet);
      });
      if (selectionType === 'container') {
        setActiveContainerId('');
      }
      clearSelection();
    },
    onStartPaste: (operation) => {
      if (selectionType !== 'row' && selectionType !== 'column') {
        return;
      }

      setOpenMenu(null);
      setPasteFlow({
        entityType: selectionType,
        operation,
        phase: 'container',
        targetContainerId: null,
      });
    },
    onChooseContainerTarget: (containerId) => {
      if (!pasteFlow || pasteFlow.phase !== 'container') {
        return;
      }

      if (pasteFlow.entityType === 'column') {
        setActiveContainerId(containerId);
        setPasteFlow((current) => ({
          ...current,
          phase: 'row',
          targetContainerId: containerId,
        }));
        return;
      }

      const selectedIdSet = new Set(selectedIds);
      setContainers((current) => {
        const selectedRows = collectRowsByIds(current, selectedIdSet);
        const rowsToPaste = pasteFlow.operation === 'copy'
          ? selectedRows.map(cloneRow)
          : selectedRows;
        const baseContainers = pasteFlow.operation === 'move'
          ? removeRowsByIds(current, selectedIdSet, containerId)
          : current;
        return appendRowsToContainer(baseContainers, containerId, rowsToPaste);
      });
      setActiveContainerId(containerId);
      clearSelection();
    },
    onChooseRowTarget: (rowId) => {
      if (!pasteFlow || pasteFlow.entityType !== 'column' || pasteFlow.phase !== 'row') {
        return;
      }

      const selectedIdSet = new Set(selectedIds);
      setContainers((current) => {
        const selectedColumns = collectColumnsByIds(current, selectedIdSet);
        const columnsToPaste = pasteFlow.operation === 'copy'
          ? selectedColumns.map(cloneColumn)
          : selectedColumns;
        const baseContainers = pasteFlow.operation === 'move'
          ? removeColumnsByIds(current, selectedIdSet, rowId)
          : current;
        return appendColumnsToRow(baseContainers, rowId, columnsToPaste);
      });
      clearSelection();
    },
    onClearSelection: clearSelection,
  };

  return (
    <AppChrome
      activeNav="template-edit"
      onNavigate={onNavigate}
      breadcrumbs={[{ key: 'template-edit', label: 'Template Edit', current: true }]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      sidebarBadgeCounts={sidebarBadgeCounts}
    >
      <main
        className={`smplfy-template-edit-page bg-body-tertiary ${selectedIds.length ? 'has-bulk-selection' : ''}`}
        onClick={() => setOpenMenu(null)}
      >
        <TemplateActionBar
          onNavigate={onNavigate}
          onAddRootContainer={handlers.onAddRootContainer}
        />

        <section className="smplfy-template-edit-body">
          <div className="smplfy-template-edit-canvas bg-white">
            {containers.length ? (
              <div className="d-flex flex-column gap-2">
                {containers.map((container, containerIndex) => (
                  <TemplateContainer
                    key={container.id}
                    container={container}
                    containerIndex={containerIndex}
                    containerCount={containers.length}
                    activeContainerId={activeContainerId}
                    selectedColumnIds={selectedColumnIds}
                    openMenu={openMenu}
                    onToggleMenu={setOpenMenu}
                    onOpenSettings={(type, id) => setSettingsTarget({ type, id })}
                    onOpenWidget={setWidgetTarget}
                    handlers={handlers}
                  />
                ))}
              </div>
            ) : (
              <EmptyTemplateState onAddContainer={handlers.onAddRootContainer} />
            )}
          </div>
        </section>
      </main>

      <SettingsModal
        target={settingsTarget}
        targetColumn={settingsTargetColumn}
        onClose={() => setSettingsTarget(null)}
        onSaveColumnClass={(columnId, className) => {
          setContainers((current) => updateSelectedColumns(current, new Set([columnId]), (column) => ({
            ...column,
            customClass: className.trim(),
          })));
        }}
      />
      <WidgetModal widget={widgetTarget} onClose={() => setWidgetTarget(null)} />
      <BulkStyleModal
        open={bulkStyleOpen}
        value={bulkClassValue}
        onChange={setBulkClassValue}
        onClose={() => setBulkStyleOpen(false)}
        onApply={() => {
          const selectedIdSet = new Set(selectedColumnIds);
          setContainers((current) => updateSelectedColumns(current, selectedIdSet, (column) => ({
            ...column,
            customClass: bulkClassValue.trim(),
          })));
          setBulkStyleOpen(false);
          clearSelection();
        }}
      />
      <BulkActionBar
        selectionType={selectionType}
        selectionCount={selectedIds.length}
        pasteFlow={pasteFlow}
        onOpenStyling={() => {
          const selectedColumns = collectColumnsByIds(containers, new Set(selectedColumnIds));
          const firstClass = selectedColumns[0]?.customClass ?? '';
          const hasSameClass = selectedColumns.every((column) => (column.customClass ?? '') === firstClass);
          setBulkClassValue(hasSameClass ? firstClass : '');
          setBulkStyleOpen(true);
        }}
        onSelectChildColumns={handlers.onSelectChildColumns}
        onClone={handlers.onBulkClone}
        onStartPaste={handlers.onStartPaste}
        onDelete={handlers.onBulkDelete}
        onClear={handlers.onClearSelection}
      />
      {selectionNotice ? (
        <div className="smplfy-template-selection-toast position-fixed">
          <ToastNotification
            tone="error"
            message={selectionNotice}
            onClose={() => setSelectionNotice('')}
          />
        </div>
      ) : null}
      <TemplateButtonTooltipLayer />
    </AppChrome>
  );
}
