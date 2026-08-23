export const LINES = {
  red: { id: "red", name: "Red Line", shortName: "Red", color: "#e34c4c", code: "R" },
  blue: { id: "blue", name: "Blue Line", shortName: "Blue", color: "#3271ea", code: "B" },
  green: { id: "green", name: "Green Line", shortName: "Green", color: "#1f9a6e", code: "G" },
};

export const LINE_STATIONS = {
  red: [
    ["miyapur", "Miyapur"], ["jntu-college", "JNTU College"], ["kphb-colony", "KPHB Colony"],
    ["kukatpally", "Kukatpally"], ["balanagar", "Dr. B.R. Ambedkar Balanagar"], ["moosapet", "Moosapet"],
    ["bharat-nagar", "Bharat Nagar"], ["erragadda", "Erragadda"], ["esi-hospital", "ESI Hospital"],
    ["sr-nagar", "S.R. Nagar"], ["ameerpet", "Ameerpet"], ["punjagutta", "Punjagutta"],
    ["irrum-manzil", "Irrum Manzil"], ["khairatabad", "Khairatabad"], ["lakdikapul", "Lakdi-ka-pul"],
    ["assembly", "Assembly"], ["nampally", "Nampally"], ["gandhi-bhavan", "Gandhi Bhavan"],
    ["osmania-medical-college", "Osmania Medical College"], ["mg-bus-station", "MG Bus Station"],
    ["malakpet", "Malakpet"], ["new-market", "New Market"], ["musarambagh", "Musarambagh"],
    ["dilsukhnagar", "Dilsukhnagar"], ["chaitanyapuri", "Chaitanyapuri"],
    ["victoria-memorial", "Victoria Memorial"], ["lb-nagar", "LB Nagar"],
  ],
  blue: [
    ["nagole", "Nagole"], ["uppal", "Uppal"], ["stadium", "Stadium"], ["ngri", "NGRI"],
    ["habsiguda", "Habsiguda"], ["tarnaka", "Tarnaka"], ["mettuguda", "Mettuguda"],
    ["secunderabad-east", "Secunderabad East"], ["parade-ground", "Parade Ground"],
    ["paradise", "Paradise"], ["rasoolpura", "Rasoolpura"], ["prakash-nagar", "Prakash Nagar"],
    ["begumpet", "Begumpet"], ["ameerpet", "Ameerpet"], ["madhura-nagar", "Madhura Nagar"],
    ["yusufguda", "Yusufguda"], ["road-no-5-jubilee-hills", "Road No. 5 Jubilee Hills"],
    ["jubilee-hills-check-post", "Jubilee Hills Check Post"], ["peddamma-gudi", "Peddamma Gudi"],
    ["madhapur", "Madhapur"], ["durgam-cheruvu", "Durgam Cheruvu"], ["hitec-city", "HITEC City"],
    ["raidurg", "Raidurg"],
  ],
  green: [
    ["jbs-parade-ground", "JBS Parade Ground"], ["secunderabad-west", "Secunderabad West"],
    ["gandhi-hospital", "Gandhi Hospital"], ["musheerabad", "Musheerabad"], ["rtc-x-roads", "RTC X Roads"],
    ["chikkadpally", "Chikkadpally"], ["narayanguda", "Narayanguda"], ["sultan-bazaar", "Sultan Bazaar"],
    ["mg-bus-station", "MG Bus Station"],
  ],
};

export const EXPLICIT_TRANSFERS = [
  {
    from: { lineId: "blue", stationId: "parade-ground" },
    to: { lineId: "green", stationId: "jbs-parade-ground" },
    minutes: 5,
    label: "Parade Ground ↔ JBS Parade Ground",
  },
];

const RED_ANCHORS = [[0, 70, 330], [10, 380, 330], [19, 700, 330], [26, 930, 330]];
const BLUE_ANCHORS = [[0, 105, 80], [8, 320, 190], [13, 380, 330], [22, 850, 520]];
const GREEN_ANCHORS = [[0, 350, 170], [4, 505, 245], [8, 700, 330]];
const ANCHORS = { red: RED_ANCHORS, blue: BLUE_ANCHORS, green: GREEN_ANCHORS };

const interpolateAnchors = (anchors, index) => {
  for (let i = 0; i < anchors.length - 1; i += 1) {
    const [startIndex, startX, startY] = anchors[i];
    const [endIndex, endX, endY] = anchors[i + 1];
    if (index >= startIndex && index <= endIndex) {
      const progress = (index - startIndex) / (endIndex - startIndex || 1);
      return {
        x: startX + (endX - startX) * progress,
        y: startY + (endY - startY) * progress,
      };
    }
  }
  const [, x, y] = anchors.at(-1);
  return { x, y };
};

export const getLinePoints = (lineId) =>
  LINE_STATIONS[lineId].map((station, index) => ({
    stationId: station[0],
    name: station[1],
    lineId,
    index,
    ...interpolateAnchors(ANCHORS[lineId], index),
  }));

export const getPoint = (lineId, stationId) =>
  getLinePoints(lineId).find((point) => point.stationId === stationId) || null;

export const getStations = () => {
  const registry = new Map();
  Object.entries(LINE_STATIONS).forEach(([lineId, stations]) => {
    stations.forEach(([id, name]) => {
      if (!registry.has(id)) registry.set(id, { id, name, lines: [] });
      registry.get(id).lines.push(lineId);
    });
  });
  return [...registry.values()].sort((a, b) => a.name.localeCompare(b.name));
};

export const getStation = (stationId) => getStations().find((station) => station.id === stationId) || null;

export const LABEL_STATIONS = new Set([
  "miyapur", "ameerpet", "mg-bus-station", "lb-nagar", "nagole", "parade-ground",
  "jbs-parade-ground", "hitec-city", "raidurg",
]);

export const DATA_META = {
  status: "preview",
  verifiedThrough: "2025-05 official map and fare-chart naming",
  notice: "Timings, facilities and fares require official verification before travel.",
};
