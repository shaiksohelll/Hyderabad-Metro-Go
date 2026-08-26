import { appBasePath, routePath } from './config.js';

const viewPaths = {
  home: '',
  plan: 'plan',
  map: 'map',
  stations: 'stations',
  saved: 'saved',
  settings: 'settings',
  journey: 'journey',
};

export function viewFromLocation() {
  const base = appBasePath();
  const path = window.location.pathname.startsWith(base) ? window.location.pathname.slice(base.length).replace(/\/$/, '') : '';
  if (path.startsWith('stations/')) return 'station';
  const entry = Object.entries(viewPaths).find(([, value]) => value === path);
  return entry?.[0] || 'home';
}

export function stationIdFromLocation() {
  const base = appBasePath();
  const path = window.location.pathname.startsWith(base) ? window.location.pathname.slice(base.length) : '';
  return path.startsWith('stations/') ? decodeURIComponent(path.slice('stations/'.length)) : null;
}

export function navigate(view, stationId = null) {
  const path = routePath(view, stationId);
  if (window.location.pathname !== path) window.history.pushState({ view, stationId }, '', path);
}

export function listenForBack(callback) {
  window.addEventListener('popstate', () => callback(viewFromLocation(), stationIdFromLocation()));
}
