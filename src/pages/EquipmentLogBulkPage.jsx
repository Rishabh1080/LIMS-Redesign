import { useMemo, useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import SampleCountStepper from '../components/SampleCountStepper/SampleCountStepper';
import { InputFieldRichDropdown, InputFieldText } from '../components/FormControls';
import {
  EQUIPMENT_LOG_BULK_COLUMNS,
  createEquipmentLogBulkRow,
  equipmentLogInstruments,
  equipmentLogProducts,
  equipmentLogUsers,
  getBatchesForProduct,
  getTodayDisplayDate,
} from '../data/equipmentLogsData';
import './new-inward-page.scss';
import './equipment-log-page.scss';

const CURRENT_USER = 'Rishabh Gangwar';

export default function EquipmentLogBulkPage({
  onBack,
  onSubmit,
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  sidebarBadgeCounts = {},
}) {
  const [rows, setRows] = useState(() => [
    createEquipmentLogBulkRow(CURRENT_USER),
    createEquipmentLogBulkRow(CURRENT_USER),
    createEquipmentLogBulkRow(CURRENT_USER),
  ]);
  const [errors, setErrors] = useState({});

  const instrumentOptions = useMemo(
    () => equipmentLogInstruments.map((instrument) => ({ value: instrument.value, label: instrument.label })),
    [],
  );
  const productOptions = useMemo(
    () => equipmentLogProducts.map((product) => ({ value: product.value, label: product.label })),
    [],
  );
  const userOptions = useMemo(
    () => equipmentLogUsers.map((user) => ({ value: user, label: user })),
    [],
  );

  const updateCell = (rowId, key, value) => {
    setRows((current) => current.map((row) => {
      if (row.id !== rowId) return row;
      const nextRow = { ...row, [key]: value };
      // Changing the product invalidates a previously picked batch.
      if (key === 'product') {
        nextRow.batchNo = '';
      }
      return nextRow;
    }));
    setErrors((current) => {
      if (!current[`${rowId}-${key}`]) return current;
      const next = { ...current };
      delete next[`${rowId}-${key}`];
      if (key === 'product') {
        delete next[`${rowId}-batchNo`];
      }
      return next;
    });
  };

  const addRow = () => setRows((current) => [...current, createEquipmentLogBulkRow(CURRENT_USER)]);

  const removeRow = (rowId) => {
    setRows((current) => (current.length > 1 ? current.filter((row) => row.id !== rowId) : current));
    setErrors((current) => {
      const next = {};
      Object.entries(current).forEach(([errorKey, value]) => {
        if (!errorKey.startsWith(`${rowId}-`)) next[errorKey] = value;
      });
      return next;
    });
  };

  const setRowCount = (count) => {
    setRows((current) => {
      if (count > current.length) {
        return [
          ...current,
          ...Array.from({ length: count - current.length }, () => createEquipmentLogBulkRow(CURRENT_USER)),
        ];
      }
      if (count < current.length) {
        return current.slice(0, count);
      }
      return current;
    });
  };

  const handleSubmit = () => {
    const nextErrors = {};
    rows.forEach((row) => {
      EQUIPMENT_LOG_BULK_COLUMNS.forEach((column) => {
        if (!String(row[column.key] ?? '').trim()) {
          nextErrors[`${row.id}-${column.key}`] = true;
        }
      });
    });

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    onSubmit?.(rows);
  };

  const renderCell = (row, column) => {
    const hasError = Boolean(errors[`${row.id}-${column.key}`]);
    const shared = {
      variant: 'table-cell',
      state: hasError ? 'error' : undefined,
      'aria-invalid': hasError || undefined,
      'aria-label': `${column.label} for row ${rows.indexOf(row) + 1}`,
    };

    if (column.type === 'dropdown') {
      return (
        <InputFieldRichDropdown
          {...shared}
          value={row.instrument}
          options={instrumentOptions}
          placeholder="Select instrument"
          searchable
          searchPlaceholder="Search instruments"
          onChange={(event) => updateCell(row.id, 'instrument', event.target.value)}
        />
      );
    }

    if (column.type === 'product') {
      return (
        <InputFieldRichDropdown
          {...shared}
          value={row.product}
          options={productOptions}
          placeholder="Select product"
          searchable
          searchPlaceholder="Search products"
          onChange={(event) => updateCell(row.id, 'product', event.target.value)}
        />
      );
    }

    if (column.type === 'batch') {
      const batchOptions = getBatchesForProduct(row.product).map((batch) => ({ value: batch, label: batch }));
      return (
        <InputFieldRichDropdown
          {...shared}
          value={row.batchNo}
          options={batchOptions}
          placeholder={row.product ? 'Select batch' : 'Pick a product'}
          searchable
          searchPlaceholder="Search batches"
          disabled={!row.product}
          onChange={(event) => updateCell(row.id, 'batchNo', event.target.value)}
        />
      );
    }

    if (column.type === 'user') {
      return (
        <InputFieldRichDropdown
          {...shared}
          value={row.doneBy}
          options={userOptions}
          placeholder="Select user"
          searchable
          searchPlaceholder="Search users"
          onChange={(event) => updateCell(row.id, 'doneBy', event.target.value)}
        />
      );
    }

    if (column.type === 'time') {
      return (
        <InputFieldText
          {...shared}
          type="time"
          value={row[column.key]}
          onChange={(event) => updateCell(row.id, column.key, event.target.value)}
        />
      );
    }

    return (
      <InputFieldText
        {...shared}
        value={row[column.key]}
        placeholder="Enter value"
        onChange={(event) => updateCell(row.id, column.key, event.target.value)}
      />
    );
  };

  return (
    <AppChrome
      activeNav="equipment-log"
      onNavigate={onNavigate}
      breadcrumbs={[
        { key: 'equipment-log', label: 'Equipment Log' },
        { key: 'equipment-log-bulk', label: 'Bulk upload', current: true },
      ]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      sidebarBadgeCounts={sidebarBadgeCounts}
      pageHeader={
        <section className="bg-white border-bottom px-4 py-3">
          <div className="container-fluid px-0">
            <div className="row align-items-center justify-content-between gx-0 gy-3">
              <div className="col-auto">
                <h1 className="h5 mb-0 fw-semibold text-dark d-flex align-items-center gap-2">
                  <AppIcon name="upload" size={22} stroke={1.9} />
                  <span>Bulk upload logs</span>
                </h1>
                <p className="smplfy-equipment-log-bulk-subtitle text-secondary mb-0 mt-1">
                  {`Date auto-set to ${getTodayDisplayDate()} for every row.`}
                </p>
              </div>
              <div className="col-auto d-flex align-items-center gap-2">
                <SecondaryButton onClick={onBack}>Cancel</SecondaryButton>
                <PrimaryButton styleVariant="positive" leftIcon="check" onClick={handleSubmit}>
                  {`Upload ${rows.length} ${rows.length === 1 ? 'log' : 'logs'}`}
                </PrimaryButton>
              </div>
            </div>
          </div>
        </section>
      }
    >
      <main className="smplfy-equipment-log-page bg-body-tertiary p-4 min-vh-100">
        <div className="container-fluid px-0 d-grid gap-3">
          <div className="smplfy-equipment-log-bulk-toolbar d-flex align-items-center justify-content-between gap-3 flex-wrap">
            <SampleCountStepper
              label="Rows:"
              value={rows.length}
              onChange={setRowCount}
              onDecrement={() => removeRow(rows[rows.length - 1]?.id)}
              onIncrement={addRow}
            />
            <SecondaryButton size="medium" leftIcon="plus" onClick={addRow}>
              Add row
            </SecondaryButton>
          </div>

          <div className="smplfy-inward-table-frame">
            <div className="smplfy-inward-table-viewport">
              <table className="smplfy-inward-table smplfy-equipment-log-bulk-table" style={{ width: '100%' }}>
                <caption className="visually-hidden">Bulk equipment logs</caption>
                <thead>
                  <tr>
                    <th scope="col" className="smplfy-equipment-log-bulk-index">#</th>
                    {EQUIPMENT_LOG_BULK_COLUMNS.map((column) => (
                      <th scope="col" key={column.key}>{column.label}</th>
                    ))}
                    <th scope="col" className="smplfy-equipment-log-bulk-remove" aria-label="Remove row" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={row.id}>
                      <th scope="row" className="smplfy-equipment-log-bulk-index text-secondary">{index + 1}</th>
                      {EQUIPMENT_LOG_BULK_COLUMNS.map((column) => (
                        <td key={column.key}>{renderCell(row, column)}</td>
                      ))}
                      <td className="smplfy-equipment-log-bulk-remove">
                        <button
                          type="button"
                          className="smplfy-btn btn btn-link text-secondary p-1"
                          aria-label={`Remove row ${index + 1}`}
                          disabled={rows.length <= 1}
                          onClick={() => removeRow(row.id)}
                        >
                          <AppIcon name="trash" size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </AppChrome>
  );
}
