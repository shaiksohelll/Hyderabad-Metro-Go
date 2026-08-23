import {
  DATA_META,
  EXPLICIT_TRANSFERS,
  LABEL_STATIONS,
  LINES,
  getLinePoints,
  getStation,
  getStations,
} from "./data/network.js";
import { planRoute } from "./domain/route-engine.js";
import { animateResult, animateRoutePath, pulseStation, runIntroMotion } from "./motion.js";

const SVG_NS = "http://www.w3.org/2000/svg";
const RECENT_KEY = "hmg-v2-recent";
const THEME_KEY = "hmg-v2-theme";
const LANGUAGE_KEY = "hmg-v2-language";
const MOTION_KEY = "hmg-v2-motion";

const translations = {
  en: {
    networkReady: "Network ready", previewData: "Preview data · Verify before travel", liveNetwork: "Live network canvas",
    cityInMotion: "The city, in motion.", tapStation: "Tap any station", interchange: "Interchange",
    walkTransfer: "Connected transfer", schematicNote: "Schematic map · not to geographic scale", whereNext: "Where to next?",
    plannerIntro: "Fast routes, clear changes, zero guesswork.", from: "From", to: "To", routePriority: "Route priority",
    fastest: "Fastest", fewestChanges: "Fewer changes", showRoute: "Show my route", recent: "Recent", clear: "Clear",
    noRecent: "Your recent journeys will appear here.", station: "Station", useStart: "Use as start",
    useDestination: "Use as destination", dataNotice: "Data notice",
    facilityPending: "Detailed facilities and timings will appear after official verification.", selectStation: "Select a station",
  },
  te: {
    networkReady: "నెట్‌వర్క్ సిద్ధంగా ఉంది", previewData: "ప్రివ్యూ డేటా · ప్రయాణానికి ముందు ధృవీకరించండి", liveNetwork: "లైవ్ నెట్‌వర్క్ మ్యాప్",
    cityInMotion: "కదులుతున్న హైదరాబాద్.", tapStation: "ఏ స్టేషన్‌నైనా ఎంచుకోండి", interchange: "ఇంటర్‌చేంజ్",
    walkTransfer: "కనెక్టెడ్ ట్రాన్స్‌ఫర్", schematicNote: "స్కీమాటిక్ మ్యాప్ · భౌగోళిక ప్రమాణంలో కాదు", whereNext: "తర్వాత ఎక్కడికి?",
    plannerIntro: "వేగమైన మార్గాలు, స్పష్టమైన మార్పులు.", from: "నుండి", to: "వరకు", routePriority: "మార్గ ప్రాధాన్యత",
    fastest: "అత్యంత వేగంగా", fewestChanges: "తక్కువ మార్పులు", showRoute: "నా మార్గం చూపించు", recent: "ఇటీవలి",
    clear: "తొలగించు", noRecent: "మీ ఇటీవలి ప్రయాణాలు ఇక్కడ కనిపిస్తాయి.", station: "స్టేషన్",
    useStart: "ప్రారంభంగా వాడండి", useDestination: "గమ్యంగా వాడండి", dataNotice: "డేటా గమనిక",
    facilityPending: "అధికారిక ధృవీకరణ తర్వాత సౌకర్యాలు మరియు సమయాలు కనిపిస్తాయి.", selectStation: "స్టేషన్ ఎంచుకోండి",
  },
};

const elements = {
  plannerForm: document.querySelector("#plannerForm"), fromSelect: document.querySelector("#fromSelect"),
  toSelect: document.querySelector("#toSelect"), swapButton: document.querySelector("#swapButton"),
  plannerError: document.querySelector("#plannerError"), routeResult: document.querySelector("#routeResult"),
  recentList: document.querySelector("#recentList"), clearRecent: document.querySelector("#clearRecent"),
  networkLines: document.querySelector("#networkLines"), networkStations: document.querySelector("#networkStations"),
  networkLabels: document.querySelector("#networkLabels"), networkTransfers: document.querySelector("#networkTransfers"),
  activeRoutePath: document.querySelector("#activeRoutePath"), activeRouteHalo: document.querySelector("#activeRouteHalo"),
  mapCaptionTitle: document.querySelector("#mapCaptionTitle"), mapCaptionText: document.querySelector("#mapCaptionText"),
  stationDialog: document.querySelector("#stationDialog"), stationDialogTitle: document.querySelector("#stationDialogTitle"),
  stationLineBadges: document.querySelector("#stationLineBadges"), stationDialogMeta: document.querySelector("#stationDialogMeta"),
  closeStationDialog: document.querySelector("#closeStationDialog"), useAsOrigin: document.querySelector("#useAsOrigin"),
  useAsDestination: document.querySelector("#useAsDestination"), languageToggle: document.querySelector("#languageToggle"),
  themeToggle: document.querySelector("#themeToggle"), motionToggle: document.querySelector("#motionToggle"),
};

let selectedStationId = null;
let language = localStorage.getItem(LANGUAGE_KEY) || "en";

const svgElement = (name, attributes = {}) => {
  const element = document.createElementNS(SVG_NS, name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
};

const lineClass = (lineId) => `line-${lineId}`;

const renderMap = () => {
  Object.keys(LINES).forEach((lineId) => {
    const points = getLinePoints(lineId);
    const pointString = points.map(({ x, y }) => `${x},${y}`).join(" ");
    const casing = svgElement("polyline", { points: pointString, class: `network-line-casing ${lineClass(lineId)}` });
    const path = svgElement("polyline", { points: pointString, class: `network-line ${lineClass(lineId)}`, "data-line": lineId });
    elements.networkLines.append(casing, path);

    points.forEach((point) => {
      const station = getStation(point.stationId);
      const group = svgElement("g", {
        class: `map-station ${station.lines.length > 1 ? "is-interchange" : ""}`,
        tabindex: "0", role: "button", "aria-label": `${point.name}, ${LINES[lineId].name}`,
        "data-station-id": point.stationId, "data-line": lineId,
      });
      const hit = svgElement("circle", { cx: point.x, cy: point.y, r: 22, class: "station-hit" });
      const circle = svgElement("circle", { cx: point.x, cy: point.y, r: station.lines.length > 1 ? 8 : 5.5, class: `station-dot ${lineClass(lineId)}` });
      group.append(hit, circle);
      group.addEventListener("click", () => openStation(point.stationId, group));
      group.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openStation(point.stationId, group); }
      });
      elements.networkStations.appendChild(group);

      if (LABEL_STATIONS.has(point.stationId)) {
        const labelOnRightEdge = point.x > 820;
        const label = svgElement("text", {
          x: labelOnRightEdge ? point.x - 10 : point.x + 10,
          y: point.y - 12,
          class: "station-label",
          "text-anchor": labelOnRightEdge ? "end" : "start",
          "data-line": lineId,
        });
        label.textContent = point.name;
        elements.networkLabels.appendChild(label);
      }
    });
  });

  EXPLICIT_TRANSFERS.forEach((transfer) => {
    const from = getLinePoints(transfer.from.lineId).find((p) => p.stationId === transfer.from.stationId);
    const to = getLinePoints(transfer.to.lineId).find((p) => p.stationId === transfer.to.stationId);
    const connector = svgElement("line", { x1: from.x, y1: from.y, x2: to.x, y2: to.y, class: "transfer-connector" });
    elements.networkTransfers.appendChild(connector);
  });
};

const populateStations = () => {
  const stations = getStations();
  [elements.fromSelect, elements.toSelect].forEach((select) => {
    select.replaceChildren();
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = translations[language].selectStation;
    select.appendChild(placeholder);
    stations.forEach((station) => {
      const option = document.createElement("option");
      option.value = station.id;
      option.textContent = station.name;
      select.appendChild(option);
    });
  });
};

const getRecent = () => {
  try {
    const value = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    return Array.isArray(value) ? value.slice(0, 4) : [];
  } catch { return []; }
};

const saveRecent = (from, to) => {
  const key = `${from}:${to}`;
  const next = [{ key, from, to }, ...getRecent().filter((trip) => trip.key !== key)].slice(0, 4);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  renderRecent();
};

const renderRecent = () => {
  const trips = getRecent();
  elements.recentList.replaceChildren();
  if (!trips.length) {
    const empty = document.createElement("p");
    empty.className = "empty-note";
    empty.dataset.i18n = "noRecent";
    empty.textContent = translations[language].noRecent;
    elements.recentList.appendChild(empty);
    return;
  }

  trips.forEach((trip) => {
    const from = getStation(trip.from);
    const to = getStation(trip.to);
    if (!from || !to) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "recent-trip";
    button.innerHTML = `<span><small>${from.name}</small><strong>${to.name}</strong></span><b aria-hidden="true">↗</b>`;
    button.addEventListener("click", () => {
      elements.fromSelect.value = trip.from;
      elements.toSelect.value = trip.to;
      elements.plannerForm.requestSubmit();
    });
    elements.recentList.appendChild(button);
  });
};

const routeBadges = (route) => {
  const lineIds = [...new Set(route.steps.map((step) => step.continueLineId || step.lineId))];
  return lineIds.map((lineId) => `<span class="route-line-badge ${lineClass(lineId)}"><b>${LINES[lineId].code}</b>${LINES[lineId].shortName}</span>`).join("");
};

const renderRoute = (route) => {
  const transferText = route.transferCount
    ? `${route.transferCount} change${route.transferCount > 1 ? "s" : ""}`
    : "Direct";
  const stopItems = route.steps.map((step, index) => {
    const transfer = step.transfer
      ? `<small class="transfer-note">Change here · continue on ${LINES[step.continueLineId].name}</small>`
      : "";
    return `<li class="${step.transfer ? "has-transfer" : ""}"><span class="timeline-dot ${lineClass(step.continueLineId || step.lineId)}"></span><div><strong>${step.stationName}</strong>${transfer}</div><small>${index === 0 ? "Start" : index === route.steps.length - 1 ? "Arrive" : ""}</small></li>`;
  }).join("");

  elements.routeResult.hidden = false;
  elements.routeResult.innerHTML = `
    <div class="route-head">
      <div><p class="eyebrow">Recommended route</p><h3>${route.from.name} <span>→</span> ${route.to.name}</h3></div>
      <button class="save-route" type="button" aria-label="Journey saved">◇</button>
    </div>
    <div class="route-badges">${routeBadges(route)}</div>
    <div class="route-metrics">
      <div><strong>~${route.estimatedMinutes}</strong><small>minutes</small></div>
      <div><strong>${route.stopCount}</strong><small>stops</small></div>
      <div><strong>${transferText}</strong><small>interchange</small></div>
    </div>
    <details class="route-details">
      <summary>View every stop <span>＋</span></summary>
      <ol class="route-timeline">${stopItems}</ol>
    </details>
    <div class="fare-notice"><span aria-hidden="true">i</span><p><strong>Fare verification in progress</strong>Check the official Hyderabad Metro fare chart before travel.</p><a href="https://ltmetro.com/fare-ticketing/" target="_blank" rel="noreferrer">Official fare ↗</a></div>
  `;

  const points = route.coordinates.map(({ x, y }) => `${x},${y}`).join(" ");
  elements.activeRoutePath.setAttribute("points", points);
  elements.activeRouteHalo.setAttribute("points", points);
  elements.mapCaptionTitle.textContent = `${route.from.name} → ${route.to.name}`;
  elements.mapCaptionText.textContent = `~${route.estimatedMinutes} min · ${route.stopCount} stops · ${transferText}`;
  animateRoutePath(elements.activeRoutePath);
  animateResult(elements.routeResult);
};

const openStation = (stationId, mapElement) => {
  const station = getStation(stationId);
  if (!station) return;
  selectedStationId = stationId;
  elements.stationDialogTitle.textContent = station.name;
  elements.stationLineBadges.innerHTML = station.lines
    .map((lineId) => `<span class="route-line-badge ${lineClass(lineId)}"><b>${LINES[lineId].code}</b>${LINES[lineId].name}</span>`)
    .join("");
  const transfer = station.lines.length > 1 || ["parade-ground", "jbs-parade-ground"].includes(stationId);
  elements.stationDialogMeta.textContent = transfer ? "Interchange connection" : DATA_META.notice;
  pulseStation(mapElement.querySelector(".station-dot"));
  elements.stationDialog.showModal();
};

const setStationAndClose = (select, stationId) => {
  select.value = stationId;
  elements.stationDialog.close();
  select.focus();
};

const applyLanguage = () => {
  document.documentElement.lang = language === "te" ? "te" : "en";
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    if (translations[language][key]) element.textContent = translations[language][key];
  });
  elements.languageToggle.textContent = language === "en" ? "TE" : "EN";
  populateStations();
  renderRecent();
  localStorage.setItem(LANGUAGE_KEY, language);
};

const applyPreferences = () => {
  const theme = localStorage.getItem(THEME_KEY) || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  document.documentElement.dataset.theme = theme;
  const reduced = localStorage.getItem(MOTION_KEY) === "reduce";
  document.documentElement.classList.toggle("reduce-motion", reduced);
  elements.motionToggle.classList.toggle("is-active", reduced);
};

const bindEvents = () => {
  elements.plannerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const from = elements.fromSelect.value;
    const to = elements.toSelect.value;
    elements.plannerError.textContent = "";
    if (!from || !to) { elements.plannerError.textContent = "Choose both an origin and a destination."; return; }
    if (from === to) { elements.plannerError.textContent = "Choose two different stations."; return; }
    const priority = new FormData(elements.plannerForm).get("priority") || "fastest";
    const route = planRoute(from, to, priority);
    if (!route) { elements.plannerError.textContent = "No route could be found."; return; }
    renderRoute(route);
    saveRecent(from, to);
  });

  elements.swapButton.addEventListener("click", () => {
    [elements.fromSelect.value, elements.toSelect.value] = [elements.toSelect.value, elements.fromSelect.value];
  });
  elements.clearRecent.addEventListener("click", () => { localStorage.removeItem(RECENT_KEY); renderRecent(); });
  elements.closeStationDialog.addEventListener("click", () => elements.stationDialog.close());
  elements.useAsOrigin.addEventListener("click", () => setStationAndClose(elements.fromSelect, selectedStationId));
  elements.useAsDestination.addEventListener("click", () => setStationAndClose(elements.toSelect, selectedStationId));
  elements.languageToggle.addEventListener("click", () => { language = language === "en" ? "te" : "en"; applyLanguage(); });
  elements.themeToggle.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem(THEME_KEY, next);
  });
  elements.motionToggle.addEventListener("click", () => {
    const reduced = !document.documentElement.classList.contains("reduce-motion");
    document.documentElement.classList.toggle("reduce-motion", reduced);
    elements.motionToggle.classList.toggle("is-active", reduced);
    localStorage.setItem(MOTION_KEY, reduced ? "reduce" : "full");
  });

  document.querySelectorAll("[data-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.dataset.target;
      const target = targetId === "stationSearch" ? elements.fromSelect : document.getElementById(targetId);
      target?.scrollIntoView({ behavior: document.documentElement.classList.contains("reduce-motion") ? "auto" : "smooth", block: "center" });
      if (target === elements.fromSelect) target.focus();
    });
  });

  document.querySelectorAll(".line-chip").forEach((button) => {
    button.addEventListener("click", () => {
      button.classList.toggle("is-active");
      const active = button.classList.contains("is-active");
      document.querySelectorAll(`[data-line="${button.dataset.line}"]`).forEach((element) => element.classList.toggle("is-muted", !active));
    });
  });
};

const init = () => {
  applyPreferences();
  renderMap();
  applyLanguage();
  bindEvents();
  requestAnimationFrame(runIntroMotion);
  if ("serviceWorker" in navigator && location.protocol !== "file:") navigator.serviceWorker.register("./sw.js").catch(() => {});
};

init();
