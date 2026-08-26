const STORAGE_KEY = 'hyderabad-metro-go:v1';

export function loadPersisted() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { savedRoutes: [] };
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== 1) return { savedRoutes: [] };
    return { savedRoutes: Array.isArray(parsed.savedRoutes) ? parsed.savedRoutes : [] };
  } catch {
    return { savedRoutes: [], storageError: true };
  }
}

export function persistState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: 1,
      savedRoutes: state.savedRoutes,
    }));
    return { ok: true };
  } catch {
    return { ok: false, message: 'This browser could not save the route. The current journey is still available.' };
  }
}
