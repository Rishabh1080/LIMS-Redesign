const defaultProjectName = 'lims-v3';
const defaultEndpoint = '/api/siteping';
const defaultStorageKey = 'lims-v3-siteping-feedback';
const sitepingFrontendVisible = false;

let sitepingInstance = null;
let sitepingInitPromise = null;

export function initSitepingFeedbackWidget() {
  if (sitepingInstance || sitepingInitPromise || typeof window === 'undefined') {
    return sitepingInstance ?? sitepingInitPromise;
  }

  const enabled =
    sitepingFrontendVisible && import.meta.env.VITE_SITEPING_ENABLED !== 'false';

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

  sitepingInitPromise = Promise.all([
    import('@siteping/widget'),
    useLocalStorage
      ? import('@siteping/adapter-localstorage')
      : Promise.resolve(null),
  ])
    .then(([{ initSiteping }, localStorageModule]) => {
      sitepingInstance = initSiteping({
        ...(useLocalStorage
          ? { store: new localStorageModule.LocalStorageStore({ key: storageKey }) }
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
    })
    .catch((error) => {
      sitepingInitPromise = null;
      console.warn('[siteping] Failed to load feedback widget:', error);
      return null;
    });

  return sitepingInitPromise;
}
