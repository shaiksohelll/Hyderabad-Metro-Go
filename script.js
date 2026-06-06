const LINES = {
  red: { name: "Red", badge: "bg-danger", button: "btn-outline-danger" },
  blue: { name: "Blue", badge: "bg-primary", button: "btn-outline-primary" },
  green: { name: "Green", badge: "bg-success", button: "btn-outline-success" },
};

const LINE_STATIONS = {
  red: [
    "Miyapur",
    "JNTU College",
    "KPHB Colony",
    "Kukatpally",
    "Dr. B.R. Ambedkar Balanagar",
    "Moosapet",
    "Bharat Nagar",
    "Erragadda",
    "ESI Hospital",
    "S.R. Nagar",
    "Ameerpet",
    "Punjagutta",
    "Irrum Manzil",
    "Khairatabad",
    "Lakdi-ka-pul",
    "Assembly",
    "Nampally",
    "Gandhi Bhavan",
    "Osmania Medical College",
    "MG Bus Station",
    "Malakpet",
    "New Market",
    "Musarambagh",
    "Dilsukhnagar",
    "Chaitanyapuri",
    "Victoria Memorial",
    "LB Nagar",
  ],
  blue: [
    "Nagole",
    "Uppal",
    "Stadium",
    "NGRI",
    "Habsiguda",
    "Tarnaka",
    "Mettuguda",
    "Secunderabad East",
    "JBS Parade Ground",
    "Paradise",
    "Rasoolpura",
    "Prakash Nagar",
    "Begumpet",
    "Ameerpet",
    "Madhura Nagar",
    "Yusufguda",
    "Road No. 5 Jubilee Hills",
    "Jubilee Hills Check Post",
    "Peddamma Gudi",
    "Madhapur",
    "Durgam Cheruvu",
    "HITEC City",
    "Raidurg",
  ],
  green: [
    "JBS Parade Ground",
    "Secunderabad West",
    "Gandhi Hospital",
    "Musheerabad",
    "RTC X Roads",
    "Chikkadpally",
    "Narayanguda",
    "Sultan Bazaar",
    "MG Bus Station",
  ],
};

const DEFAULT_TRAVEL_TIP = "Select stations and click Find Route to see a travel tip.";

// Facilities shown for every station (demo list).
const STATION_FACILITIES = [
  "Lifts/Elevators",
  "Escalators",
  "Washrooms",
  "Free Drinking Water",
  "First Aid",
  "Ticket Vending Machines",
  "Wheelchair Access & Tactile Path",
  "Public Address System",
];

// Parking is available only for these stations (as requested).
const PARKING_STATIONS = new Set([
  "Miyapur",
  "JNTU College",
  "KPHB Colony",
  "Nagole",
  "Uppal",
  "LB Nagar",
  "Raidurg",
  "Ameerpet",
  "MG Bus Station",
  "JBS Parade Ground",
  "Habsiguda",
  "Stadium",
]);

const unique = (arr) => Array.from(new Set(arr));

const buildIndex = () => {
  const stationToLines = new Map();
  Object.entries(LINE_STATIONS).forEach(([lineKey, stations]) => {
    stations.forEach((s) => {
      if (!stationToLines.has(s)) stationToLines.set(s, new Set());
      stationToLines.get(s).add(lineKey);
    });
  });
  const stations = Array.from(stationToLines.keys()).sort((a, b) => a.localeCompare(b));
  return { stations, stationToLines };
};

const INDEX = buildIndex();

const buildNodeGraph = () => {
  const adj = new Map();
  const ensure = (id) => {
    if (!adj.has(id)) adj.set(id, []);
  };
  const addEdge = (from, to, cost, type, viaStation) => {
    ensure(from);
    adj.get(from).push({ to, cost, type, viaStation });
  };

  const nodeId = (lineKey, station) => `${lineKey}::${station}`;

  Object.entries(LINE_STATIONS).forEach(([lineKey, stations]) => {
    for (let i = 0; i < stations.length; i += 1) {
      ensure(nodeId(lineKey, stations[i]));
    }
    for (let i = 0; i < stations.length - 1; i += 1) {
      const a = nodeId(lineKey, stations[i]);
      const b = nodeId(lineKey, stations[i + 1]);
      addEdge(a, b, 1, "ride", null);
      addEdge(b, a, 1, "ride", null);
    }
  });

  const addInterchange = (aLine, aStation, bLine, bStation, viaStation) => {
    const a = nodeId(aLine, aStation);
    const b = nodeId(bLine, bStation);
    addEdge(a, b, 0, "interchange", viaStation);
    addEdge(b, a, 0, "interchange", viaStation);
  };

  addInterchange("red", "Ameerpet", "blue", "Ameerpet", "Ameerpet");
  addInterchange("red", "MG Bus Station", "green", "MG Bus Station", "MG Bus Station");
  addInterchange("blue", "JBS Parade Ground", "green", "JBS Parade Ground", "JBS Parade Ground");

  return { adj, nodeId };
};

const GRAPH = buildNodeGraph();

const parseNodeId = (id) => {
  const idx = id.indexOf("::");
  return { lineKey: id.slice(0, idx), station: id.slice(idx + 2) };
};

const bfsShortestPath = (from, to) => {
  // We treat each node as "station on a specific line" (ex: red::Ameerpet).
  // Ride edges cost 1 (one stop). Interchange edges cost 0 (not a stop).
  // Stop count comes from the number of ride edges (cost=1), not from station name changes.
  const startLines = Array.from(INDEX.stationToLines.get(from) || []);
  const endLines = Array.from(INDEX.stationToLines.get(to) || []);
  if (!startLines.length || !endLines.length) return null;

  const startIds = startLines.map((lk) => GRAPH.nodeId(lk, from));
  const endSet = new Set(endLines.map((lk) => GRAPH.nodeId(lk, to)));

  const dist = new Map();
  const prev = new Map();

  const deque = [];
  const pushFront = (x) => deque.unshift(x);
  const pushBack = (x) => deque.push(x);
  const popFront = () => deque.shift();

  startIds.forEach((id) => {
    dist.set(id, 0);
    pushBack(id);
  });

  let endId = null;
  while (deque.length) {
    const cur = popFront();
    const curDist = dist.get(cur);
    if (endSet.has(cur)) {
      endId = cur;
      break;
    }

    const edges = GRAPH.adj.get(cur) || [];
    edges.forEach((e) => {
      const nextDist = curDist + e.cost;
      const best = dist.get(e.to);
      if (best === undefined || nextDist < best) {
        dist.set(e.to, nextDist);
        prev.set(e.to, { from: cur, edge: e });
        if (e.cost === 0) pushFront(e.to);
        else pushBack(e.to);
      }
    });
  }

  if (!endId) return null;

  const stopCount = dist.get(endId) ?? 0;

  const nodePath = [];
  let cursor = endId;
  while (cursor) {
    nodePath.push(cursor);
    cursor = prev.get(cursor)?.from || null;
  }
  nodePath.reverse();

  // IMPORTANT (beginner-friendly note):
  // If a station belongs to multiple lines (like Ameerpet / MG Bus Station / JBS Parade Ground),
  // the shortest-path search may "start" on one line-node and immediately switch to another
  // with a zero-cost interchange edge. That should NOT be shown as an interchange to the user,
  // because you can simply start your trip on the correct line at the same station.
  //
  // Same idea at the destination: a final zero-cost interchange after the last ride should not
  // be shown as a line change.
  const edgePath = nodePath.map((id, i) => (i === 0 ? null : prev.get(id)?.edge || null));
  const firstRideIndex = (() => {
    for (let i = 1; i < edgePath.length; i += 1) {
      if (edgePath[i]?.type === "ride") return i;
    }
    return -1;
  })();
  const lastRideIndex = (() => {
    for (let i = edgePath.length - 1; i >= 1; i -= 1) {
      if (edgePath[i]?.type === "ride") return i;
    }
    return -1;
  })();
  const directLineKey =
    firstRideIndex > 0 ? parseNodeId(nodePath[firstRideIndex]).lineKey : parseNodeId(nodePath[0]).lineKey;

  const interchangeStations = [];
  const interchangeDetails = [];
  const steps = [];

  for (let i = 0; i < nodePath.length; i += 1) {
    const node = parseNodeId(nodePath[i]);
    const edgeInfo = i > 0 ? prev.get(nodePath[i]) : null;

    const isInterchangeEdge = edgeInfo?.edge?.type === "interchange" && edgeInfo.edge.viaStation;
    const ignoreInterchange =
      isInterchangeEdge && ((firstRideIndex > 0 && i < firstRideIndex) || (lastRideIndex > 0 && i > lastRideIndex));

    if (isInterchangeEdge && !ignoreInterchange) {
      interchangeStations.push(edgeInfo.edge.viaStation);
      const fromLineKey = parseNodeId(edgeInfo.from).lineKey;
      interchangeDetails.push({ station: edgeInfo.edge.viaStation, fromLineKey, toLineKey: node.lineKey });
    }

    const lastStep = steps[steps.length - 1];
    if (!lastStep || lastStep.station !== node.station) {
      const initialLineKey = steps.length === 0 ? directLineKey : node.lineKey;
      steps.push({ station: node.station, lineKey: initialLineKey, note: "" });
    }

    if (edgeInfo?.edge?.type === "interchange" && !ignoreInterchange) {
      const changeTo = `${LINES[node.lineKey].name} Line`;
      const note = `Change to ${changeTo} at ${edgeInfo.edge.viaStation}`;

      const current = steps[steps.length - 1];
      current.note = note;
      current.isInterchange = true;
      current.lineKey = node.lineKey;
    }
  }

  return {
    from,
    to,
    steps,
    stopCount,
    directLineKey,
    interchanges: unique(interchangeStations),
    interchangeDetails,
  };
};

// Fare slabs based on stop count.
const FARE_SLABS = [
  { min: 1, max: 2, fare: 12 },
  { min: 3, max: 4, fare: 18 },
  { min: 5, max: 6, fare: 30 },
  { min: 7, max: 8, fare: 40 },
  { min: 9, max: 10, fare: 50 },
  { min: 11, max: 12, fare: 55 },
  { min: 13, max: 15, fare: 60 },
  { min: 16, max: 18, fare: 66 },
  { min: 19, max: 20, fare: 70 },
  { min: 21, max: Infinity, fare: 75 },
];

const estimateFare = (stops) => {
  if (!stops || stops <= 0) return 0;
  const slab = FARE_SLABS.find((s) => stops >= s.min && stops <= s.max);
  return slab ? slab.fare : 0;
};

const estimateDistanceKm = (stops) => Number((stops * 1.1).toFixed(1));

const estimateTimeMinutes = ({ stops, interchanges }) => stops * 2 + interchanges * 5;

const el = (id) => document.getElementById(id);

const ui = {
  fromSelect: el("fromSelect"),
  toSelect: el("toSelect"),
  plannerForm: el("plannerForm"),
  plannerError: el("plannerError"),
  swapBtn: el("swapBtn"),
  resetBtn: el("resetBtn"),
  emptyResult: el("emptyResult"),
  resultCard: el("resultCard"),
  resultSummaryLine: el("resultSummaryLine"),
  resultEstimateNote: el("resultEstimateNote"),
  stopsList: el("stopsList"),
  calcEmpty: el("calcEmpty"),
  calcCard: el("calcCard"),
  calcStops: el("calcStops"),
  calcInterchanges: el("calcInterchanges"),
  calcFare: el("calcFare"),
  calcDistance: el("calcDistance"),
  calcTime: el("calcTime"),
  calcEstimateNote: el("calcEstimateNote"),
  stationsRed: el("stationsRed"),
  stationsBlue: el("stationsBlue"),
  stationsGreen: el("stationsGreen"),
  stationDetail: el("stationDetail"),
  recentTrips: el("recentTrips"),
  recentEmpty: el("recentEmpty"),
  travelTip: el("travelTip"),
};

// App state (kept minimal on purpose).
// We only show route results after the user clicks "Find Route" (or a recent trip).
const appState = {
  routeVisible: false,
};

const RECENT_KEY = "hmg_recent";

const getRecentTrips = () => {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const list = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) return [];
    const validStations = new Set(INDEX.stations);
    return list
      .filter((t) => typeof t === "string")
      .filter((t) => {
        const [from, to] = t.split(" → ");
        return validStations.has(from) && validStations.has(to);
      })
      .slice(0, 5);
  } catch {
    return [];
  }
};

const setRecentTrips = (trips) => {
  localStorage.setItem(RECENT_KEY, JSON.stringify(trips.slice(0, 5)));
};

const renderRecentTrips = () => {
  const trips = getRecentTrips();
  ui.recentTrips.innerHTML = "";
  ui.recentEmpty.style.display = trips.length ? "none" : "block";
  trips.forEach((t) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-outline-secondary btn-sm";
    btn.textContent = t;
    btn.addEventListener("click", () => {
      const [from, to] = t.split(" → ");
      ui.fromSelect.value = from;
      ui.toSelect.value = to;
      handleFindRoute();
    });
    ui.recentTrips.appendChild(btn);
  });
};

const saveTrip = (from, to) => {
  const trip = `${from} → ${to}`;
  const existing = getRecentTrips();
  const next = [trip, ...existing.filter((t) => t !== trip)];
  setRecentTrips(next);
  renderRecentTrips();
};

const setResultVisible = (visible) => {
  if (visible) {
    ui.emptyResult.style.display = "none";
    ui.resultCard.classList.remove("d-none");
  } else {
    ui.emptyResult.style.display = "block";
    ui.resultCard.classList.add("d-none");
  }
};

const setCalcVisible = (visible) => {
  if (visible) {
    ui.calcEmpty.style.display = "none";
    ui.calcCard.classList.remove("d-none");
  } else {
    ui.calcEmpty.style.display = "block";
    ui.calcCard.classList.add("d-none");
  }
};

const renderRoute = (route) => {
  setResultVisible(true);
  const interchangeText = route.interchanges.length ? route.interchanges.join(", ") : "None";
  const fare = estimateFare(route.stopCount);
  const distanceKm = estimateDistanceKm(route.stopCount);
  const timeMin = estimateTimeMinutes({ stops: route.stopCount, interchanges: route.interchanges.length });

  ui.resultSummaryLine.textContent =
    `${route.from} → ${route.to}` +
    ` | Stops: ${route.stopCount}` +
    ` | Interchange: ${interchangeText}` +
    ` | Fare: ₹${fare}` +
    ` | Distance: ~${distanceKm} km` +
    ` | Time: ~${timeMin} min`;

  ui.stopsList.innerHTML = "";
  route.steps.forEach((s, stepIndex) => {
    const li = document.createElement("li");
    const textClass =
      s.lineKey === "red" ? "text-danger" : s.lineKey === "blue" ? "text-primary" : "text-success";

    // Interchange styling (visual only):
    // If a station physically belongs to multiple lines, show BOTH line badges.
    // If the journey actually changes lines here, order badges as: arrived line → continue line.
    const stationLineKeys = Array.from(INDEX.stationToLines.get(s.station) || []);
    const isPhysicalInterchange = stationLineKeys.length > 1;

    const buildLineBadgeHtml = (lineKey, extraClass) =>
      `<span class="badge ${LINES[lineKey].badge}${extraClass || ""}">${LINES[lineKey].name}</span>`;

    const orderedBadgeLineKeys = (() => {
      if (!isPhysicalInterchange) return [s.lineKey];

      if (s.isInterchange) {
        const prevLineKey = route.steps[stepIndex - 1]?.lineKey;
        const arrived = prevLineKey && stationLineKeys.includes(prevLineKey) ? prevLineKey : s.lineKey;
        const cont = s.lineKey;
        return Array.from(new Set([arrived, cont]));
      }

      const primary = stationLineKeys.includes(s.lineKey) ? s.lineKey : stationLineKeys[0];
      const others = stationLineKeys.filter((lk) => lk !== primary);
      return [primary, ...others];
    })();

    const badgesHtml = orderedBadgeLineKeys.map((lk) => buildLineBadgeHtml(lk, " ms-1")).join("");

    const noteHtml = s.note ? `<div class="small text-muted">${s.note}</div>` : "";

    li.innerHTML = `<span class="${textClass} fw-semibold">${s.station}</span>${badgesHtml}${noteHtml}`;
    ui.stopsList.appendChild(li);
  });
};

const renderFareCalculator = (route) => {
  if (!route) {
    setCalcVisible(false);
    return;
  }
  setCalcVisible(true);
  const interchangeCount = route.interchanges.length;
  const distanceKm = estimateDistanceKm(route.stopCount);
  const timeMin = estimateTimeMinutes({ stops: route.stopCount, interchanges: interchangeCount });

  ui.calcStops.textContent = `${route.stopCount}`;
  ui.calcInterchanges.textContent = route.interchanges.length ? route.interchanges.join(", ") : "None";
  ui.calcFare.textContent = `₹${estimateFare(route.stopCount)}`;
  ui.calcDistance.textContent = `~${distanceKm} km`;
  ui.calcTime.textContent = `~${timeMin} min`;
};

// Computes the route (BFS) and fills BOTH panels (Route Result + Fare Calculator).
// This should be called only when we want to actually show results.
const updatePanels = ({ saveRecent, showPlannerError }) => {
  const from = ui.fromSelect.value;
  const to = ui.toSelect.value;

  if (showPlannerError) ui.plannerError.textContent = "";
  ui.travelTip.textContent = DEFAULT_TRAVEL_TIP;

  if (!from || !to) {
    ui.emptyResult.textContent = "Select From and To, then click Find Route.";
    setResultVisible(false);
    setCalcVisible(false);
    return false;
  }

  if (from === to) {
    ui.emptyResult.textContent = "From and To are the same. Please choose two different stations.";
    if (showPlannerError) ui.plannerError.textContent = "From and To cannot be the same.";
    setResultVisible(false);
    setCalcVisible(false);
    return false;
  }

  const route = bfsShortestPath(from, to);
  if (!route) {
    ui.emptyResult.textContent = "No route found.";
    if (showPlannerError) ui.plannerError.textContent = "No route found.";
    setResultVisible(false);
    setCalcVisible(false);
    return false;
  }

  renderRoute(route);
  renderFareCalculator(route);
  renderFacilitiesForTrip(from, to);
  ui.travelTip.textContent = (() => {
    const details = route.interchangeDetails || [];
    const hasInterchange = details.length > 0;

    const parkingFrom = PARKING_STATIONS.has(route.from);
    const parkingTo = PARKING_STATIONS.has(route.to);

    let base = "";
    if (hasInterchange) {
      const parts = details.map((d) => {
        const fromLine = LINES[d.fromLineKey]?.name || d.fromLineKey;
        const toLine = LINES[d.toLineKey]?.name || d.toLineKey;
        return `Change lines at ${d.station} (${fromLine} to ${toLine}).`;
      });
      base = `${parts.join(" Then ")} Follow the signage to the connecting platform.`;
    } else {
      const lineKey = route.directLineKey || route.steps[0]?.lineKey;
      const lineName = LINES[lineKey]?.name || "metro";
      base = `Direct ride on the ${lineName} Line — no line change needed.`;
    }

    const parkingNotes = [];
    if (parkingFrom && parkingTo) parkingNotes.push(`Parking is available at both ${route.from} and ${route.to}.`);
    else if (parkingFrom) parkingNotes.push(`Parking is available at ${route.from}.`);
    else if (parkingTo) parkingNotes.push(`Parking is available at ${route.to}.`);

    return parkingNotes.length ? `${base} ${parkingNotes.join(" ")}` : base;
  })();

  if (saveRecent) saveTrip(from, to);
  return true;
};

// Refresh results only if the user already ran a search.
const refreshIfVisible = () => {
  if (!appState.routeVisible) return;
  const ok = updatePanels({ saveRecent: false, showPlannerError: false });
  appState.routeVisible = ok;
};

// If the user changes the dropdowns after seeing a result, hide the result.
// This avoids showing stale results for a different selection.
const hideResults = () => {
  ui.plannerError.textContent = "";
  ui.emptyResult.textContent = "Select From and To, then click Find Route.";
  setResultVisible(false);
  setCalcVisible(false);
  appState.routeVisible = false;
  ui.travelTip.textContent = DEFAULT_TRAVEL_TIP;
};

// Reusable HTML helpers for the Station Facilities panel.
const getLineBadgesHtml = (station) => {
  const lines = Array.from(INDEX.stationToLines.get(station) || []);
  return lines.map((lk) => `<span class="badge ${LINES[lk].badge} me-1">${LINES[lk].name}</span>`).join("");
};

const getFacilitiesListHtml = () => STATION_FACILITIES.map((f) => `<li>${f}</li>`).join("");

const renderFacilitiesBlock = ({ station, showButtons }) => {
  const badges = getLineBadgesHtml(station);
  const parkingText = PARKING_STATIONS.has(station) ? "Parking available" : "Parking not available";
  const facilitiesHtml = getFacilitiesListHtml();

  const buttonsHtml = showButtons
    ? `
      <div class="d-flex flex-column gap-1">
        <div class="d-flex gap-2">
          <button data-action="use-start" type="button" class="btn btn-sm btn-primary">Use as Start</button>
          <button data-action="use-dest" type="button" class="btn btn-sm btn-secondary">Use as Destination</button>
        </div>
        <div class="small text-muted">Quickly set this station as your start or destination.</div>
      </div>
    `
    : "";

  return `
    <div class="p-2 border rounded bg-white">
      <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
        <div>
          <div class="fw-semibold">${station}</div>
          <div class="mt-1">${badges}</div>
          <div class="small text-muted mt-2">${parkingText}</div>
        </div>
        ${buttonsHtml}
      </div>
      <div class="small mt-2">
        <div class="fw-semibold mb-1">Facilities</div>
        <ul class="mb-0 ps-3">${facilitiesHtml}</ul>
      </div>
    </div>
  `;
};

// After "Find Route", show facilities for BOTH start and destination (side-by-side on desktop).
const renderFacilitiesForTrip = (from, to) => {
  ui.stationDetail.innerHTML = `
    <div class="row g-2">
      <div class="col-12 col-md-6">
        ${renderFacilitiesBlock({ station: from, showButtons: false })}
      </div>
      <div class="col-12 col-md-6">
        ${renderFacilitiesBlock({ station: to, showButtons: false })}
      </div>
    </div>
  `;
};

const renderStationDetail = (station) => {
  ui.stationDetail.innerHTML = renderFacilitiesBlock({ station, showButtons: true });

  const useStart = ui.stationDetail.querySelector('[data-action="use-start"]');
  const useDest = ui.stationDetail.querySelector('[data-action="use-dest"]');

  useStart.addEventListener("click", () => {
    ui.fromSelect.value = station;
    refreshIfVisible();
  });
  useDest.addEventListener("click", () => {
    ui.toSelect.value = station;
    refreshIfVisible();
  });
};

const renderStationButtons = (container, lineKey) => {
  container.innerHTML = "";
  LINE_STATIONS[lineKey].forEach((station) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `btn btn-sm ${LINES[lineKey].button} station-btn`;
    btn.textContent = station;
    btn.addEventListener("click", () => renderStationDetail(station));
    container.appendChild(btn);
  });
};

const populateSelect = (selectEl) => {
  selectEl.innerHTML = "";
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select a station";
  placeholder.disabled = true;
  placeholder.selected = true;
  selectEl.appendChild(placeholder);

  INDEX.stations.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    selectEl.appendChild(opt);
  });
};

const resetUI = () => {
  ui.plannerError.textContent = "";
  ui.fromSelect.value = "";
  ui.toSelect.value = "";
  ui.emptyResult.textContent = "Select From and To, then click Find Route.";
  setResultVisible(false);
  setCalcVisible(false);
  appState.routeVisible = false;
  ui.stationDetail.innerHTML = `<div class="text-muted small">Click a station button to see details here.</div>`;
  ui.travelTip.textContent = DEFAULT_TRAVEL_TIP;
};

const handleFindRoute = () => {
  const ok = updatePanels({ saveRecent: true, showPlannerError: true });
  appState.routeVisible = ok;
};

const init = () => {
  populateSelect(ui.fromSelect);
  populateSelect(ui.toSelect);
  renderStationButtons(ui.stationsRed, "red");
  renderStationButtons(ui.stationsBlue, "blue");
  renderStationButtons(ui.stationsGreen, "green");
  renderRecentTrips();
  resetUI();

  ui.plannerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleFindRoute();
  });

  // IMPORTANT: Do NOT auto-show route results on dropdown change.
  // The user must click "Find Route" (or click a recent trip) to see results.
  ui.fromSelect.addEventListener("change", () => {
    if (appState.routeVisible) hideResults();
  });
  ui.toSelect.addEventListener("change", () => {
    if (appState.routeVisible) hideResults();
  });

  ui.swapBtn.addEventListener("click", () => {
    const a = ui.fromSelect.value;
    ui.fromSelect.value = ui.toSelect.value;
    ui.toSelect.value = a;
    refreshIfVisible();
  });

  ui.resetBtn.addEventListener("click", () => {
    resetUI();
  });
};

init();
