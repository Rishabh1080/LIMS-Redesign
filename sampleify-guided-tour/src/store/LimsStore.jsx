import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { getCategory, getCustomer } from './catalog';
import { DATA_VERSION, createSeedData, pad4, sampleIdFor } from './seed';
import { getDraftMaxTat, packOf, validateDraft } from './selectors';
import { readJSON, writeJSON } from '../lib/storage';
import { createEventBus } from '../lib/eventBus';
import { pluralize } from '../lib/format';
import { INITIAL_PROTO_STATE } from '../proto/state';

const LimsContext = createContext(null);

export function createProductRow(index) {
  return { key: `p${index}`, category: '', product: '', quantity: '', unit: 'g', batch: '', parameters: [] };
}

export function createInitialDraft() {
  return {
    sampleType: 'Base',
    customerId: '',
    receiptMode: 'In person',
    customerRef: '',
    receivedBy: 'Front Desk',
    products: [createProductRow(1)],
    nextKey: 2,
  };
}

const initialUi = {
  paramDrawer: null,
  allocation: null,
  trTab: 'pending',
  trSelection: [],
  sidebarCollapsed: false,
  toast: null,
  inwardsQuickFilter: 'all',
  inwardsSearch: '',
  draftErrors: null,
};

const KNOWN_PAGES = ['dashboard', 'inwards', 'new-inward', 'inward-details', 'test-requests'];

function createInitialState(persisted, domain) {
  // Saved work is only reused if it belongs to the same lab type and schema.
  const reuse = persisted?.data?.version === DATA_VERSION && persisted.data.domain === domain;
  if (!reuse) persisted = null;
  const data = persisted ? persisted.data : createSeedData(domain);
  let nav = persisted?.nav && KNOWN_PAGES.includes(persisted.nav.page) ? persisted.nav : { page: 'dashboard', params: {} };
  if (nav.page === 'inward-details' && !data.inwards.some((inward) => inward.id === nav.params?.inwardId)) {
    nav = { page: 'inwards', params: {} };
  }
  const draft = persisted?.draft?.products?.length ? persisted.draft : createInitialDraft();
  // `proto` is the prototype-screens flow (src/proto/TutorialApp.jsx): page, the visitor's inwards, TR stage.
  const proto = persisted?.proto?.page ? { ...INITIAL_PROTO_STATE, ...persisted.proto, listingToast: null } : INITIAL_PROTO_STATE;
  return { data, draft, nav, proto, ui: { ...initialUi, sidebarCollapsed: Boolean(persisted?.sidebarCollapsed) } };
}

function updateProduct(draft, key, patch, pack) {
  return {
    ...draft,
    products: draft.products.map((product) => {
      if (product.key !== key) return product;
      const next = { ...product, ...patch };
      if (patch.category !== undefined && patch.category !== product.category) {
        next.product = patch.product ?? '';
        next.parameters = [];
        next.unit = getCategory(pack, patch.category)?.defaultUnit ?? product.unit;
      }
      return next;
    }),
  };
}

function createInward(state, now) {
  const { data, draft } = state;
  const pack = packOf(data);
  const year = new Date(now).getFullYear();
  const receivedOn = new Date(now).toISOString();
  const maxTat = getDraftMaxTat(draft, pack) || 1;
  const dueDate = new Date(now + maxTat * 86400000).toISOString();
  const inwardId = `INW/${year}/${pad4(data.counters.inward)}`;
  let sampleNo = data.counters.sample;
  let trNo = data.counters.tr;
  const samples = [];
  const trs = [];

  draft.products.forEach((product) => {
    const sampleId = sampleIdFor(pack, year, sampleNo);
    sampleNo += 1;
    const category = getCategory(pack, product.category);
    const trIds = product.parameters.map((name) => {
      const parameter = category?.parameters.find((entry) => entry.name === name);
      const trId = `TR/${year}/${pad4(trNo)}`;
      trNo += 1;
      trs.push({
        id: trId,
        sampleId,
        inwardId,
        parameter: name,
        method: parameter?.method ?? '-',
        spec: parameter?.spec ?? '',
        discipline: parameter?.discipline ?? pack.disciplines[0],
        status: 'not_allocated',
        analystId: null,
        reviewerId: null,
        instrumentId: null,
        createdAt: receivedOn,
        allocatedAt: null,
        dueDate,
      });
      return trId;
    });

    samples.push({
      id: sampleId,
      inwardId,
      category: product.category,
      product: product.product,
      quantity: product.quantity,
      unit: product.unit,
      batch: product.batch,
      trIds,
    });
  });

  const inward = {
    id: inwardId,
    customerId: draft.customerId,
    sampleType: draft.sampleType,
    receiptMode: draft.receiptMode,
    customerRef: draft.customerRef,
    receivedBy: draft.receivedBy,
    receivedOn,
    dueDate,
    sampleIds: samples.map((sample) => sample.id),
  };

  const customer = getCustomer(pack, draft.customerId);

  return {
    ...state,
    data: {
      ...data,
      inwards: [inward, ...data.inwards],
      samples: [...data.samples, ...samples],
      trs: [...data.trs, ...trs],
      counters: { inward: data.counters.inward + 1, sample: sampleNo, tr: trNo },
      userInwardIds: [...data.userInwardIds, inwardId],
    },
    draft: createInitialDraft(),
    nav: { page: 'inward-details', params: { inwardId } },
    ui: {
      ...state.ui,
      paramDrawer: null,
      draftErrors: null,
      toast: {
        id: now,
        tone: 'success',
        message: `${inwardId} saved: ${pluralize(samples.length, 'sample')} and ${pluralize(trs.length, 'test request')} created for ${customer?.name ?? 'the customer'}`,
      },
    },
  };
}

function reducer(state, action) {
  const { type, payload = {} } = action;

  switch (type) {
    case 'nav/go': {
      const page = KNOWN_PAGES.includes(payload.page) ? payload.page : 'dashboard';
      return {
        ...state,
        nav: { page, params: payload.params ?? {} },
        ui: {
          ...state.ui,
          paramDrawer: null,
          allocation: null,
          trSelection: page === 'test-requests' ? state.ui.trSelection : [],
          trTab: payload.params?.tab ?? state.ui.trTab,
          draftErrors: page === 'new-inward' ? state.ui.draftErrors : null,
        },
      };
    }

    case 'draft/set':
      return { ...state, draft: { ...state.draft, [payload.field]: payload.value } };

    case 'draft/product':
      return { ...state, draft: updateProduct(state.draft, payload.key, payload.patch, packOf(state.data)) };

    case 'draft/productCount': {
      const count = Math.max(1, Math.min(10, payload.count));
      const products = [...state.draft.products];
      let { nextKey } = state.draft;
      while (products.length < count) {
        products.push(createProductRow(nextKey));
        nextKey += 1;
      }
      products.length = count;
      return {
        ...state,
        draft: { ...state.draft, products, nextKey },
        ui: { ...state.ui, paramDrawer: products.some((product) => product.key === state.ui.paramDrawer) ? state.ui.paramDrawer : null },
      };
    }

    case 'draft/toggleParameter': {
      const product = state.draft.products.find((entry) => entry.key === payload.key);
      if (!product) return state;
      const parameters = product.parameters.includes(payload.name)
        ? product.parameters.filter((name) => name !== payload.name)
        : [...product.parameters, payload.name];
      return { ...state, draft: updateProduct(state.draft, payload.key, { parameters }, packOf(state.data)) };
    }

    case 'draft/setParameters':
      return { ...state, draft: updateProduct(state.draft, payload.key, { parameters: payload.names }, packOf(state.data)) };

    case 'draft/reset':
      return { ...state, draft: createInitialDraft(), ui: { ...state.ui, draftErrors: null, paramDrawer: null } };

    case 'draft/errors':
      return { ...state, ui: { ...state.ui, draftErrors: payload.errors } };

    case 'inward/create':
      return createInward(state, payload.now);

    case 'ui/patch':
      return { ...state, ui: { ...state.ui, ...payload } };

    case 'allocation/open':
      return {
        ...state,
        ui: {
          ...state.ui,
          allocation: { trIds: payload.trIds, analystId: '', reviewerId: '', instrumentId: '', tab: 'analysts' },
        },
      };

    case 'allocation/patch': {
      if (!state.ui.allocation) return state;
      const next = { ...state.ui.allocation, ...payload };
      if (payload.analystId && payload.analystId === next.reviewerId) next.reviewerId = '';
      return { ...state, ui: { ...state.ui, allocation: next } };
    }

    case 'allocation/close':
      return { ...state, ui: { ...state.ui, allocation: null } };

    case 'tr/allocate': {
      const ids = new Set(payload.trIds);
      const allocatedAt = new Date(payload.now).toISOString();
      return {
        ...state,
        data: {
          ...state.data,
          trs: state.data.trs.map((tr) =>
            ids.has(tr.id)
              ? {
                  ...tr,
                  status: 'under_testing',
                  analystId: payload.analystId,
                  reviewerId: payload.reviewerId,
                  instrumentId: payload.instrumentId || null,
                  allocatedAt,
                }
              : tr,
          ),
          userAllocatedTrIds: [...new Set([...state.data.userAllocatedTrIds, ...payload.trIds])],
        },
        ui: {
          ...state.ui,
          allocation: null,
          trSelection: state.ui.trSelection.filter((id) => !ids.has(id)),
          toast: { id: payload.now, tone: 'success', message: payload.message },
        },
      };
    }

    case 'tr/toggleSelect': {
      const selected = state.ui.trSelection.includes(payload.id)
        ? state.ui.trSelection.filter((id) => id !== payload.id)
        : [...state.ui.trSelection, payload.id];
      return { ...state, ui: { ...state.ui, trSelection: selected } };
    }

    case 'tr/setSelection':
      return { ...state, ui: { ...state.ui, trSelection: payload.ids } };

    case 'toast/show':
      return { ...state, ui: { ...state.ui, toast: { id: payload.id ?? Date.now(), tone: payload.tone ?? 'success', message: payload.message } } };

    case 'toast/hide':
      if (state.ui.toast && (payload.id === undefined || state.ui.toast.id === payload.id)) {
        return { ...state, ui: { ...state.ui, toast: null } };
      }
      return state;

    case 'proto/set': {
      const next = typeof action.payload.update === 'function' ? action.payload.update(state.proto) : action.payload.update;
      return next === state.proto ? state : { ...state, proto: next };
    }

    case 'lims/reset':
      return createInitialState(null, state.data.domain);

    default:
      return state;
  }
}

export function LimsStoreProvider({ storageKey, domain, children }) {
  const [state, rawDispatch] = useReducer(reducer, null, () => createInitialState(readJSON(storageKey), domain));
  const busRef = useRef(null);
  if (!busRef.current) busRef.current = createEventBus();
  const stateRef = useRef(state);
  stateRef.current = state;

  const dispatch = useCallback((action) => {
    rawDispatch(action);
    busRef.current.emit(action.type, action.payload ?? {});
  }, []);

  // Persist the parts worth resuming (not transient UI like open modals).
  // Debounced while typing, and flushed when the tab is hidden or closed.
  const persist = useCallback(() => {
    const current = stateRef.current;
    writeJSON(storageKey, {
      data: current.data,
      draft: current.draft,
      nav: current.nav,
      proto: current.proto,
      sidebarCollapsed: current.ui.sidebarCollapsed,
    });
  }, [storageKey]);

  useEffect(() => {
    const id = window.setTimeout(persist, 200);
    return () => window.clearTimeout(id);
  }, [persist, state.data, state.draft, state.nav, state.proto, state.ui.sidebarCollapsed]);

  useEffect(() => {
    window.addEventListener('pagehide', persist);
    return () => window.removeEventListener('pagehide', persist);
  }, [persist]);

  const actions = useMemo(() => {
    const navigate = (page, params = {}) => dispatch({ type: 'nav/go', payload: { page, params } });

    const saveInward = () => {
      const { valid, errors } = validateDraft(stateRef.current.draft);
      if (!valid) {
        dispatch({ type: 'draft/errors', payload: { errors } });
        return { ok: false, errors };
      }
      dispatch({ type: 'inward/create', payload: { now: Date.now() } });
      return { ok: true };
    };

    const allocate = ({ trIds, analystId, reviewerId, instrumentId, analystName }) => {
      const message = trIds.length === 1
        ? `${trIds[0]} allocated to ${analystName}.`
        : `${trIds.length} test requests allocated to ${analystName}.`;
      dispatch({ type: 'tr/allocate', payload: { trIds, analystId, reviewerId, instrumentId, now: Date.now(), message } });
    };

    return { navigate, saveInward, allocate };
  }, [dispatch]);

  const value = useMemo(
    () => ({ state, pack: packOf(state.data), dispatch, actions, bus: busRef.current, getState: () => stateRef.current }),
    [state, dispatch, actions],
  );

  return <LimsContext.Provider value={value}>{children}</LimsContext.Provider>;
}

export function useLims() {
  const context = useContext(LimsContext);
  if (!context) throw new Error('useLims must be used inside <LimsStoreProvider>');
  return context;
}
