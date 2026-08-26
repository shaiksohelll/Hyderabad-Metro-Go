export const PROJECT_PATH = '/Hyderabad-Metro-Go';

export function appBasePath(pathname = window.location.pathname) {
  return pathname === PROJECT_PATH || pathname.startsWith(`${PROJECT_PATH}/`) ? `${PROJECT_PATH}/` : '/';
}

export function assetUrl(path = '') {
  const clean = String(path).replace(/^\//, '');
  return `${appBasePath()}${clean}`;
}

export function routePath(view, stationId = null) {
  const base = appBasePath();
  if (view === 'station' && stationId) return `${base}stations/${encodeURIComponent(stationId)}`;
  const paths = { home: '', plan: 'plan', map: 'map', stations: 'stations', saved: 'saved', settings: 'settings', journey: 'journey' };
  return `${base}${paths[view] || ''}`;
}
