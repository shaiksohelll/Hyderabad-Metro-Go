import { displayName } from './data.js';
import { announce, applyPreferences, focusSelector } from './a11y.js';
import { loadPersisted, persistState } from './persistence.js';
import { planJourney } from './route-engine.js';
import { dispatch, getState, subscribe } from './store.js';
import { listenForBack, navigate, viewFromLocation } from './router.js';
import { renderApp } from './view.js';

const app = document.querySelector('#app');
let renderQueued = false;

function render(state = getState()) {
  app.innerHTML = renderApp(state);
  applyPreferences(state);
  if (state.announcement) announce(state.announcement);
}

function queueRender(state) {
  if (renderQueued) return;
  renderQueued = true;
  window.requestAnimationFrame(() => {
    renderQueued = false;
    render(state);
  });
}

subscribe((state, action) => {
  queueRender(state);
  if (['SAVE_ROUTE', 'DELETE_ROUTE'].includes(action.type)) persistState(state);
});

dispatch({ type: 'HYDRATE', payload: loadPersisted() });
const initialView = viewFromLocation();
if (initialView !== 'home') dispatch({ type: 'NAVIGATE', view: initialView });
listenForBack((view) => dispatch({ type: 'NAVIGATE', view, announcement: `Opened ${view}.` }));
render();

function planFromForm(form) {
  const state = getState();
  const formData = new FormData(form);
  const originStationId = formData.get('from');
  const destinationStationId = formData.get('to');
  const objective = formData.get('objective') || 'fastest';
  const stepFree = document.querySelector('#step-free')?.checked || false;
  dispatch({ type: 'SET_ORIGIN', stationId: originStationId });
  dispatch({ type: 'SET_DESTINATION', stationId: destinationStationId });
  dispatch({ type: 'SET_OBJECTIVE', objective });
  dispatch({ type: 'SET_ACCESSIBILITY', payload: { stepFree } });
  dispatch({ type: 'PLAN_START' });
  window.setTimeout(() => {
    const result = planJourney({
      originStationId,
      destinationStationId,
      objective,
      accessibility: { stepFree },
    });
    if (result.status === 'success') {
      dispatch({ type: 'PLAN_SUCCESS', result });
      focusSelector('.result-panel');
    } else {
      dispatch({ type: 'PLAN_ERROR', message: result.message });
      focusSelector('#planner-error');
    }
  }, 120);
  if (state.view !== 'home' && state.view !== 'plan') dispatch({ type: 'NAVIGATE', view: 'plan' });
}

function handleNav(view, stationId = null) {
  navigate(view, stationId);
  dispatch({ type: 'NAVIGATE', view, announcement: `Opened ${view}.` });
}

document.addEventListener('submit', (event) => {
  if (event.target.id !== 'planner-form') return;
  event.preventDefault();
  planFromForm(event.target);
});

document.addEventListener('click', (event) => {
  const navButton = event.target.closest('[data-nav]');
  if (navButton) {
    handleNav(navButton.dataset.nav);
    return;
  }
  const stationButton = event.target.closest('[data-station-id]');
  if (stationButton) {
    const id = stationButton.dataset.stationId;
    dispatch({ type: 'SELECT_STATION', stationId: id, stationName: displayName(id, getState().locale) });
    navigate('station', id);
    focusSelector('#station-heading');
    return;
  }
  const stageButton = event.target.closest('[data-stage-index]');
  if (stageButton) {
    const index = Number(stageButton.dataset.stageIndex);
    const step = getState().routeResult?.route?.steps[index];
    dispatch({ type: 'SELECT_STAGE', index, label: step?.text || 'Stage selected.' });
    focusSelector('.stage-detail');
    return;
  }
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (!action) {
    const saved = event.target.closest('[data-saved-id]');
    if (saved) dispatch({ type: 'DELETE_ROUTE', routeId: saved.dataset.savedId });
    return;
  }
  const state = getState();
  if (action === 'swap') dispatch({ type: 'SWAP' });
  if (action === 'reset') dispatch({ type: 'RESET' });
  if (action === 'show-map') handleNav('map');
  if (action === 'start-journey') handleNav('journey');
  if (action === 'toggle-locale') dispatch({ type: 'SET_PREFERENCE', key: 'locale', value: state.locale === 'en' ? 'te' : 'en' });
  if (action === 'toggle-theme') dispatch({ type: 'SET_PREFERENCE', key: 'theme', value: state.theme === 'light' ? 'dark' : 'light' });
  if (action === 'set-origin-station' && state.selectedStationId) {
    dispatch({ type: 'SET_ORIGIN', stationId: state.selectedStationId });
    handleNav('home');
  }
  if (action === 'set-destination-station' && state.selectedStationId) {
    dispatch({ type: 'SET_DESTINATION', stationId: state.selectedStationId });
    handleNav('home');
  }
  if (action === 'show-sources') {
    const dialog = document.querySelector('#source-dialog');
    if (dialog) { dialog.hidden = false; focusSelector('.dialog-close'); }
  }
  if (action === 'close-sources') {
    const dialog = document.querySelector('#source-dialog');
    if (dialog) dialog.hidden = true;
  }
  if (action === 'toggle-menu') {
    const menu = document.querySelector('#mobile-menu');
    const button = event.target.closest('[data-action="toggle-menu"]');
    if (menu && button) { menu.hidden = !menu.hidden; button.setAttribute('aria-expanded', String(!menu.hidden)); }
  }
  if (action === 'save-route' && state.routeResult?.route) {
    dispatch({ type: 'SAVE_ROUTE', route: state.routeResult.route });
  }
});

document.addEventListener('change', (event) => {
  const pref = event.target.closest('[data-pref]');
  if (!pref) return;
  dispatch({ type: 'SET_PREFERENCE', key: pref.dataset.pref, value: pref.checked });
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}
