const initialState = {
  view: 'home',
  locale: 'en',
  theme: 'light',
  reducedMotion: false,
  highContrast: false,
  originStationId: 'miyapur',
  destinationStationId: 'raidurg',
  objective: 'fastest',
  accessibility: { stepFree: false },
  routeResult: null,
  selectedStationId: null,
  selectedStageIndex: null,
  announcement: '',
  plannerMessage: '',
  dataStatus: 'verified-static topology · operational data unavailable',
  savedRoutes: [],
  isPlanning: false,
};

let state = { ...initialState };
const subscribers = new Set();

export function getState() {
  return state;
}

export function subscribe(listener) {
  subscribers.add(listener);
  return () => subscribers.delete(listener);
}

export function dispatch(action) {
  state = reduce(state, action);
  subscribers.forEach((listener) => listener(state, action));
  return state;
}

export function reduce(current, action) {
  switch (action.type) {
    case 'HYDRATE':
      return { ...current, ...action.payload, savedRoutes: action.payload.savedRoutes || [] };
    case 'NAVIGATE':
      return { ...current, view: action.view, announcement: action.announcement || '' };
    case 'SET_ORIGIN':
      return { ...current, originStationId: action.stationId, routeResult: null, plannerMessage: '' };
    case 'SET_DESTINATION':
      return { ...current, destinationStationId: action.stationId, routeResult: null, plannerMessage: '' };
    case 'SET_OBJECTIVE':
      return { ...current, objective: action.objective, routeResult: null };
    case 'SET_ACCESSIBILITY':
      return { ...current, accessibility: { ...current.accessibility, ...action.payload }, routeResult: null };
    case 'SWAP':
      return { ...current, originStationId: current.destinationStationId, destinationStationId: current.originStationId, routeResult: null, plannerMessage: '' };
    case 'RESET':
      return { ...current, originStationId: '', destinationStationId: '', routeResult: null, plannerMessage: '', selectedStationId: null };
    case 'PLAN_START':
      return { ...current, isPlanning: true, routeResult: null, plannerMessage: '', announcement: 'Calculating route.' };
    case 'PLAN_SUCCESS':
      return { ...current, isPlanning: false, routeResult: action.result, view: 'plan', plannerMessage: '', announcement: 'Route found. Review the route result.' };
    case 'PLAN_ERROR':
      return { ...current, isPlanning: false, routeResult: null, plannerMessage: action.message, announcement: action.message };
    case 'SELECT_STATION':
      return { ...current, selectedStationId: action.stationId, view: 'station', announcement: `Station selected: ${action.stationName}.` };
    case 'SELECT_STAGE':
      return { ...current, selectedStageIndex: action.index, announcement: action.label };
    case 'SAVE_ROUTE':
      return { ...current, savedRoutes: [...current.savedRoutes.filter((route) => route.id !== action.route.id), action.route], announcement: 'Route saved.' };
    case 'DELETE_ROUTE':
      return { ...current, savedRoutes: current.savedRoutes.filter((route) => route.id !== action.routeId), announcement: 'Saved route removed.' };
    case 'SET_PREFERENCE':
      return { ...current, [action.key]: action.value };
    default:
      return current;
  }
}
