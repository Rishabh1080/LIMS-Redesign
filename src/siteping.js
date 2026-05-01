import { LocalStorageStore } from '@siteping/adapter-localstorage';
import { initSiteping } from '@siteping/widget';

const defaultProjectName = 'lims-v3';
const defaultEndpoint = '/api/siteping';
const defaultStorageKey = 'lims-v3-siteping-feedback';

let sitepingInstance = null;

export function initSitepingFeedbackWidget() {
  if (sitepingInstance || typeof window === 'undefined') {
    return sitepingInstance;
  }

  const enabled =
    import.meta.env.DEV || import.meta.env.VITE_SITEPING_ENABLED === 'true';

  if (!enabled) {
    return null;
  }

  const projectName =
    import.meta.env.VITE_SITEPING_PROJECT_NAME || defaultProjectName;
  const endpoint =
    import.meta.env.VITE_SITEPING_ENDPOINT || defaultEndpoint;
  const storageKey =
    import.meta.env.VITE_SITEPING_STORAGE_KEY || defaultStorageKey;
  const useLocalStorage =
    import.meta.env.VITE_SITEPING_STORAGE === 'local';

  sitepingInstance = initSiteping({
    ...(useLocalStorage
      ? { store: new LocalStorageStore({ key: storageKey }) }
      : { endpoint }),
    projectName,
    position: 'bottom-right',
    accentColor: '#2563eb',
    theme: 'light',
    locale: 'en',
    forceShow: true,
    debug: import.meta.env.VITE_SITEPING_DEBUG === 'true',
    onError: (error) => {
      console.warn('[siteping] Feedback widget error:', error);
    },
  });

  return sitepingInstance;
}
