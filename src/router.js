const viewPaths = {
  home: '/',
  plan: '/plan',
  map: '/map',
  stations: '/stations',
  station: '/stations/selected',
  saved: '/saved',
  settings: '/settings',
  journey: '/journey',
};

export function viewFromLocation() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  if (path.startsWith('/stations/') && path !== '/stations') return 'station';
  const entry = Object.entries(viewPaths).find(([, value]) => value === path);
  return entry?.[0] || 'home';
}

export function navigate(view, stationId = null) {
  const path = view === 'station' && stationId ? `/stations/${encodeURIComponent(stationId)}` : (viewPaths[view] || '/');
  if (window.location.pathname !== path) window.history.pushState({ view, stationId }, '', path);
}

export function listenForBack(callback) {
  window.addEventListener('popstate', () => callback(viewFromLocation()));
}
