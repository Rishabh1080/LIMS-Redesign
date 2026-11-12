import { useMemo } from 'react';
import {
  IconAlertCircle,
  IconArrowLeft,
  IconCalendar,
  IconDeviceFloppy,
  IconMinus,
  IconPencil,
  IconPlus,
} from '@tabler/icons-react';
import { useLims } from '../../store/LimsStore';
import {
  getCategory,
  getCustomer,
  receiptModeOptions,
  receivedByOptions,
  sampleTypeOptions,
  unitOptions,
} from '../../store/catalog';
import { getDraftDueDate, getDraftMaxTat, getDraftTotals, validateDraft } from '../../store/selectors';
import { cx, formatCurrency, formatDate, pluralize } from '../../lib/format';
import { Button, Checkbox, Drawer, Field, Pill, Select } from '../components/ui';

function ParameterDrawer({ pack, product, index, onClose, onToggle }) {
  const category = getCategory(pack, product?.category);
  const selected = product?.parameters ?? [];
  const totals = selected.reduce(
    (sum, name) => {
      const parameter = category?.parameters.find((entry) => entry.name === name);
      return { price: sum.price + (parameter?.price ?? 0), tat: Math.max(sum.tat, parameter?.tatDays ?? 0) };
    },
    { price: 0, tat: 0 },
  );

  return (
    <Drawer
      open={Boolean(product)}
      onClose={onClose}
      aria-labelledby="sgt-param-drawer-title"
      data-tour="ni-param-drawer"
      header={(
        <div className="sgt-param-drawer__heading">
          <span className="sgt-eyebrow">Testing details · Product {index + 1}</span>
          <h2 className="sgt-param-drawer__title" id="sgt-param-drawer-title">
            {product?.product || 'Select a product'}
          </h2>
          <p className="sgt-param-drawer__sub">{product?.category || 'No category selected'}</p>
        </div>
      )}
      footer={(
        <>
          <span className="sgt-param-drawer__summary">
            {selected.length
              ? `${pluralize(selected.length, 'test')} · ${formatCurrency(totals.price)} · ready in ${pluralize(totals.tat, 'day')}`
              : 'No tests selected yet'}
          </span>
          <Button onClick={onClose} disabled={!selected.length} data-tour="ni-param-done">
            Save tests
          </Button>
        </>
      )}
    >
      {category ? (
        <fieldset>
          <legend className="sgt-param-drawer__legend">Choose the tests the customer asked for</legend>
          <ul className="sgt-param-list">
            {category.parameters.map((parameter) => {
              const checked = selected.includes(parameter.name);
              const id = `sgt-param-${product.key}-${parameter.name.replace(/\W+/g, '-')}`;
              return (
                <li key={parameter.name}>
                  <label className={cx('sgt-param-row', checked && 'is-checked')} htmlFor={id}>
                    <Checkbox id={id} checked={checked} onChange={() => onToggle(parameter.name)} />
                    <span className="sgt-param-row__main">
                      <span className="sgt-param-row__name">{parameter.name}</span>
                      <span className="sgt-param-row__method">
                        {parameter.method} · {parameter.discipline}
                      </span>
                      {parameter.spec ? <span className="sgt-param-row__spec">Spec: {parameter.spec}</span> : null}
                    </span>
                    <span className="sgt-param-row__meta">
                      <span>{formatCurrency(parameter.price)}</span>
                      <span className="sgt-param-row__tat">{pluralize(parameter.tatDays, 'day')}</span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
      ) : (
        <p className="sgt-empty">Choose a category and product for this row first.</p>
      )}
    </Drawer>
  );
}

export function NewInwardPage() {
  const { state, pack, dispatch, actions } = useLims();
  const { draft } = state;
  const showErrors = Boolean(state.ui.draftErrors);
  const { errors } = useMemo(() => validateDraft(draft), [draft]);
  const totals = getDraftTotals(draft, pack);
  const maxTat = getDraftMaxTat(draft, pack);
  const dueDate = getDraftDueDate(draft, pack);
  const customer = getCustomer(pack, draft.customerId);
  const drawerIndex = draft.products.findIndex((product) => product.key === state.ui.paramDrawer);
  const drawerProduct = drawerIndex >= 0 ? draft.products[drawerIndex] : null;

  const setField = (field, value) => dispatch({ type: 'draft/set', payload: { field, value } });
  const setProduct = (key, patch) => dispatch({ type: 'draft/product', payload: { key, patch } });
  const setCount = (count) => dispatch({ type: 'draft/productCount', payload: { count } });
  const openDrawer = (key) => dispatch({ type: 'ui/patch', payload: { paramDrawer: key } });

  return (
    <>
      <div className="sgt-page-header sgt-form-header">
        <div className="sgt-form-header__title">
          <button type="button" className="sgt-back-btn" aria-label="Back to All inwards" onClick={() => actions.navigate('inwards')}>
            <IconArrowLeft size={18} stroke={1.9} />
          </button>
          <h1 className="sgt-page-title">New Inward</h1>
        </div>
        <div className="sgt-form-header__actions">
          <span className="sgt-form-header__summary">
            {pluralize(draft.products.length, 'sample')} · {pluralize(totals.tests, 'test')} · {formatCurrency(totals.charges)}
          </span>
          <Button icon={IconDeviceFloppy} data-tour="ni-save" onClick={() => actions.saveInward()}>
            Save inward
          </Button>
        </div>
      </div>

      <div className="sgt-content">
        <div className="sgt-page-body sgt-form">
          {showErrors && Object.keys(errors.products).length + (errors.customerId ? 1 : 0) + (errors.receiptMode ? 1 : 0) > 0 ? (
            <div className="sgt-form-alert" role="alert">
              <IconAlertCircle size={18} stroke={1.9} aria-hidden="true" />
              A few details are missing. Fix the highlighted fields, then save again.
            </div>
          ) : null}

          <div className="sgt-form-row">
            <Field label="Sample Type" required htmlFor="sgt-ni-type">
              <Select id="sgt-ni-type" value={draft.sampleType} options={sampleTypeOptions} onChange={(value) => setField('sampleType', value)} />
            </Field>
            <Field label="Receiving Date" required htmlFor="sgt-ni-date">
              <div className="sgt-input-group">
                <input id="sgt-ni-date" className="sgt-input" value={formatDate(new Date().toISOString())} readOnly />
                <span className="sgt-input-addon" aria-hidden="true">
                  <IconCalendar size={16} stroke={1.8} />
                </span>
              </div>
            </Field>
          </div>

          <section className="sgt-card" data-tour="ni-customer" aria-labelledby="sgt-ni-customer-title">
            <div className="sgt-card__header">
              <h2 className="sgt-card__title" id="sgt-ni-customer-title">Customer Details</h2>
            </div>
            <div className="sgt-card__body sgt-customer-grid">
              <Field label="Customer" required htmlFor="sgt-ni-customer" error={showErrors ? errors.customerId : null}>
                <Select
                  id="sgt-ni-customer"
                  value={draft.customerId}
                  placeholder="Select a Customer"
                  invalid={showErrors && Boolean(errors.customerId)}
                  options={pack.customers.map((entry) => ({ value: entry.id, label: `${entry.name}, ${entry.city}` }))}
                  onChange={(value) => setField('customerId', value)}
                />
              </Field>
              <Field label="Billing Address" required htmlFor="sgt-ni-billing" helper={customer ? 'Filled from the customer record' : null}>
                <textarea
                  id="sgt-ni-billing"
                  className="sgt-textarea"
                  rows={2}
                  readOnly
                  placeholder="Customer billing address"
                  value={customer?.billingAddress ?? ''}
                />
              </Field>
              <div className="sgt-customer-facts" aria-live="polite">
                {customer ? (
                  <>
                    <div>
                      <span>Contact</span>
                      {customer.contactPerson}
                    </div>
                    <div>
                      <span>GST</span>
                      {customer.gst}
                    </div>
                  </>
                ) : (
                  <p className="sgt-muted">Contact and GST details appear once you pick a customer.</p>
                )}
              </div>
            </div>
          </section>

          <section className="sgt-card" data-tour="ni-products" aria-labelledby="sgt-ni-products-title">
            <div className="sgt-card__header">
              <div className="sgt-card__header-group">
                <h2 className="sgt-card__title" id="sgt-ni-products-title">Product Details</h2>
                <div className="sgt-stepper" role="group" aria-label="Number of samples">
                  <button type="button" aria-label="Remove a sample row" disabled={draft.products.length <= 1} onClick={() => setCount(draft.products.length - 1)}>
                    <IconMinus size={14} stroke={2.2} />
                  </button>
                  <span aria-live="polite">{draft.products.length}</span>
                  <button type="button" aria-label="Add a sample row" data-tour="ni-add-row" disabled={draft.products.length >= 10} onClick={() => setCount(draft.products.length + 1)}>
                    <IconPlus size={14} stroke={2.2} />
                  </button>
                </div>
              </div>
              <span className="sgt-muted">One row per sample. Each row becomes its own sample ID.</span>
            </div>
            <div className="sgt-card__body sgt-card__body--flush">
              <div className="sgt-table-scroll">
                <table className="sgt-grid-table">
                  <colgroup>
                    <col style={{ width: 96 }} />
                    <col style={{ width: 186 }} />
                    <col style={{ width: 222 }} />
                    <col style={{ width: 178 }} />
                    <col style={{ width: 132 }} />
                    <col style={{ width: 252 }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th scope="col">Product</th>
                      <th scope="col">Category <span className="sgt-field__required">*</span></th>
                      <th scope="col">Product <span className="sgt-field__required">*</span></th>
                      <th scope="col">Sample Size</th>
                      <th scope="col">{pack.batchLabel}</th>
                      <th scope="col">Testing Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {draft.products.map((product, index) => {
                      const rowErrors = showErrors ? errors.products[product.key] ?? {} : {};
                      const category = getCategory(pack, product.category);
                      const tat = product.parameters.reduce(
                        (max, name) => Math.max(max, category?.parameters.find((entry) => entry.name === name)?.tatDays ?? 0),
                        0,
                      );
                      return (
                        <tr key={product.key}>
                          <th scope="row" className="sgt-grid-table__row-label">Product {index + 1}</th>
                          <td>
                            <Select
                              aria-label={`Category for product ${index + 1}`}
                              value={product.category}
                              placeholder="Select category"
                              invalid={Boolean(rowErrors.category)}
                              options={pack.categories.map((entry) => entry.category)}
                              onChange={(value) => setProduct(product.key, { category: value })}
                            />
                          </td>
                          <td>
                            <Select
                              aria-label={`Product ${index + 1}`}
                              value={product.product}
                              placeholder={product.category ? 'Select product' : 'Select category first'}
                              disabled={!product.category}
                              invalid={Boolean(rowErrors.product)}
                              options={category?.products ?? []}
                              onChange={(value) => setProduct(product.key, { product: value })}
                            />
                          </td>
                          <td>
                            <div className="sgt-input-group">
                              <input
                                className="sgt-input"
                                inputMode="decimal"
                                aria-label={`Sample size for product ${index + 1}`}
                                placeholder="Value"
                                value={product.quantity}
                                onChange={(event) => setProduct(product.key, { quantity: event.target.value.replace(/[^\d.]/g, '') })}
                              />
                              <Select
                                aria-label={`Unit for product ${index + 1}`}
                                className="sgt-unit-select"
                                value={product.unit}
                                options={unitOptions}
                                onChange={(value) => setProduct(product.key, { unit: value })}
                              />
                            </div>
                          </td>
                          <td>
                            <input
                              className="sgt-input"
                              aria-label={`${pack.batchLabel} for product ${index + 1}`}
                              placeholder={pack.batchPlaceholder}
                              value={product.batch}
                              onChange={(event) => setProduct(product.key, { batch: event.target.value })}
                            />
                          </td>
                          <td>
                            <div className="sgt-testing-cell" data-tour={`ni-testing-${index}`}>
                              {product.parameters.length ? (
                                <Pill tone="green">
                                  {pluralize(product.parameters.length, 'test')} · {pluralize(tat, 'day')}
                                </Pill>
                              ) : (
                                <Pill tone="red">{rowErrors.parameters ? 'Add at least one test' : 'No tests added'}</Pill>
                              )}
                              <Button
                                variant="secondary"
                                size="xs"
                                icon={product.parameters.length ? IconPencil : IconPlus}
                                disabled={!product.product}
                                title={product.product ? undefined : 'Choose a product first'}
                                onClick={() => openDrawer(product.key)}
                              >
                                {product.parameters.length ? 'Edit' : 'Add tests'}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="sgt-card" data-tour="ni-basic" aria-labelledby="sgt-ni-basic-title">
            <div className="sgt-card__header">
              <h2 className="sgt-card__title" id="sgt-ni-basic-title">Basic Details</h2>
            </div>
            <div className="sgt-card__body sgt-basic-grid">
              <Field label="Receipt Mode" required htmlFor="sgt-ni-mode" error={showErrors ? errors.receiptMode : null}>
                <Select id="sgt-ni-mode" value={draft.receiptMode} placeholder="Select mode" options={receiptModeOptions} onChange={(value) => setField('receiptMode', value)} />
              </Field>
              <Field label="Customer Ref." htmlFor="sgt-ni-ref" helper="PO or work-order number. Printed on the report.">
                <input
                  id="sgt-ni-ref"
                  className="sgt-input"
                  placeholder={pack.refPlaceholder}
                  value={draft.customerRef}
                  onChange={(event) => setField('customerRef', event.target.value)}
                />
              </Field>
              <Field label="Received By" htmlFor="sgt-ni-received">
                <Select id="sgt-ni-received" value={draft.receivedBy} options={receivedByOptions} onChange={(value) => setField('receivedBy', value)} />
              </Field>
              <div data-tour="ni-due-date">
                <Field
                  label="Target Reporting Date"
                  htmlFor="sgt-ni-due"
                  helper={maxTat ? `Set from the longest test turnaround (${pluralize(maxTat, 'day')}).` : 'Calculated once you add tests.'}
                >
                  <div className="sgt-input-group">
                    <input id="sgt-ni-due" className="sgt-input" readOnly value={dueDate ? formatDate(dueDate) : ''} placeholder="Auto-calculated" />
                    <span className="sgt-input-addon" aria-hidden="true">
                      <IconCalendar size={16} stroke={1.8} />
                    </span>
                  </div>
                </Field>
              </div>
            </div>
          </section>
        </div>
      </div>

      <ParameterDrawer
        pack={pack}
        product={drawerProduct}
        index={drawerIndex}
        onClose={() => dispatch({ type: 'ui/patch', payload: { paramDrawer: null } })}
        onToggle={(name) => dispatch({ type: 'draft/toggleParameter', payload: { key: drawerProduct.key, name } })}
      />
    </>
  );
}
