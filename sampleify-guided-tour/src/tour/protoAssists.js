// "Do it for me" helpers for the prototype's screens. They work through the
// real UI (click the button, pick the first option, type a comment) so the
// prototype's own state and validation do the work, and the ghost cursor shows
// the visitor where each change happens.

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function protoRoot(api) {
  return api.root()?.querySelector('.sgt-proto') ?? null;
}

const shown = (node) => {
  if (!node) return false;
  const rect = node.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
};

/** First visible button (or link) inside `scope` whose text is exactly `label`. */
export function findButton(scope, label) {
  if (!scope) return null;
  return [...scope.querySelectorAll('button, a')].find((node) => node.textContent.trim() === label && shown(node)) ?? null;
}

/** The open modal whose title id is `titleId` (prototype modals keep it on the heading). */
export function modalFor(root, titleId) {
  const title = root?.querySelector(`#${titleId}`);
  return title?.closest('.modal, [role="dialog"], .smplfy-modal') ?? null;
}

export async function click(api, node, wait = 320) {
  if (!node) return false;
  await api.point(node, { wait });
  api.guard();
  node.click();
  await api.sleep(180);
  return true;
}

export async function clickButton(api, label, scope = protoRoot(api)) {
  return click(api, findButton(scope, label));
}

/** Comboboxes (prototype rich dropdowns) inside `scope` that still show their placeholder. */
export function emptyCombos(scope) {
  if (!scope) return [];
  return [...scope.querySelectorAll('[role="combobox"]')].filter(
    (combo) => shown(combo) && !combo.disabled && combo.getAttribute('aria-disabled') !== 'true' && combo.querySelector('.text-secondary'),
  );
}

/** Opens a rich dropdown and picks its first available option. */
export async function pickFirst(api, combo) {
  await click(api, combo, 260);
  await sleep(120);
  const listId = combo.getAttribute('aria-controls');
  const list = listId ? document.getElementById(listId) : null;
  const option = list?.querySelector('[role="option"]:not([aria-disabled="true"])');
  if (!option) {
    combo.click();
    return false;
  }
  await api.point(option, { wait: 220, click: true });
  api.guard();
  option.click();
  await api.sleep(160);
  return true;
}

/** Native <select>s (the prototype's plain "dropdown" fields) still on their placeholder. */
export function emptySelects(scope) {
  if (!scope) return [];
  return [...scope.querySelectorAll('select')].filter((select) => shown(select) && !select.disabled && !select.value);
}

/** Picks the first real option of a native select, the way React expects to hear about it. */
export async function chooseFirst(api, select) {
  const option = [...select.options].find((entry) => entry.value && !entry.disabled);
  if (!option) return false;
  await api.point(select, { wait: 280 });
  api.guard();
  const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
  setter.call(select, option.value);
  select.dispatchEvent(new Event('change', { bubbles: true }));
  await api.sleep(160);
  return true;
}

/** Fills every empty dropdown in `scope`, a few passes since some unlock others. */
export async function fillCombos(api, scope) {
  for (let pass = 0; pass < 6; pass += 1) {
    const combos = emptyCombos(scope);
    const selects = emptySelects(scope);
    if (!combos.length && !selects.length) return;
    // eslint-disable-next-line no-await-in-loop
    for (const combo of combos) await pickFirst(api, combo);
    // eslint-disable-next-line no-await-in-loop
    for (const select of selects) await chooseFirst(api, select);
  }
}

/** Types into a React-controlled input or textarea. */
export async function typeInto(api, input, text) {
  if (!input) return;
  await api.point(input, { wait: 260 });
  const proto = input.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
  for (let index = 1; index <= text.length; index += 1) {
    setter.call(input, text.slice(0, index));
    input.dispatchEvent(new Event('input', { bubbles: true }));
    // eslint-disable-next-line no-await-in-loop
    await api.sleep(18);
  }
}

export async function fillTextFields(api, scope, text) {
  const fields = [...(scope?.querySelectorAll('input[type="text"], input:not([type]), textarea') ?? [])].filter((field) => shown(field) && !field.value && !field.disabled && !field.readOnly);
  // eslint-disable-next-line no-await-in-loop
  for (const field of fields) await typeInto(api, field, text);
}

export async function tickAll(api, scope) {
  const boxes = [...(scope?.querySelectorAll('input[type="checkbox"]') ?? [])].filter((box) => !box.checked && !box.disabled);
  for (const box of boxes) {
    // eslint-disable-next-line no-await-in-loop
    await click(api, box.closest('label') ?? box, 160);
  }
}

/** Moves the prototype screens to `page` (used when a task starts somewhere else). */
export function goToProtoPage(api, page) {
  api.dispatch({ type: 'proto/set', payload: { update: (state) => (state.page === page ? state : { ...state, page }) } });
}
