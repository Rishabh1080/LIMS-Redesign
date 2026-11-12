// SSR-safe, failure-tolerant localStorage helpers.
// Storage can be missing (server render) or throw (Safari private mode,
// disabled cookies). Every call degrades to "nothing stored".

function getStorage() {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readJSON(key, fallback = null) {
  const storage = getStorage();
  if (!storage) return fallback;
  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota or privacy errors: the tour still works, it just won't resume.
  }
}

export function removeKey(key) {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(key);
  } catch {
    // ignore
  }
}

/** Removes every key that starts with `prefix` (the tour's namespace). */
export function clearNamespace(prefix) {
  const storage = getStorage();
  if (!storage) return;
  try {
    const keys = [];
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (key && key.startsWith(prefix)) keys.push(key);
    }
    keys.forEach((key) => storage.removeItem(key));
  } catch {
    // ignore
  }
}

export function storageKeys(namespace) {
  return {
    profile: `${namespace}:profile`,
    lims: `${namespace}:lims`,
    tour: `${namespace}:tour`,
  };
}
