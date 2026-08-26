export const DATA_VERSION = 'hmgo-official-topology-2026-08-26';

const networkMapSource = {
  sourceName: 'L&T Metro Rail (Hyderabad) Limited',
  document: 'Hyderabad Metro Rail Network Map',
  sourceUrl: 'https://ltmetro.com/wp-content/uploads/2025/01/HMRRouteMap_new.pdf',
  sourceType: 'official-static-network-map',
  lastVerifiedAt: '2026-08-26',
  status: 'official-static-topology',
  confidence: 'high',
  owner: 'HMG data maintainer',
  refreshPolicy: 'Review after each official network or station update and before release',
  notes: 'Authoritative for station identity, line membership, order, station numbering, termini, and interchange topology. Not authoritative for live service, timing, accessibility condition, or transfer duration.',
};

const fareSource = {
  sourceName: 'L&T Metro Rail (Hyderabad) Limited',
  document: 'Hyderabad Metro Rail Revised Fare Chart',
  reference: 'L&TMRHL/CCD/PR/189/23-05-2025',
  issuedAt: '2025-05-23',
  effectiveFrom: '2025-05-24',
  sourceUrl: 'https://ltmetro.com/wp-content/uploads/2025/05/New-Fare-Chart-Final.pdf',
  sourceType: 'official-fare-zone-press-release',
  lastVerifiedAt: '2026-08-26',
  status: 'official-fare-zones',
  confidence: 'high',
  owner: 'HMG data maintainer',
  refreshPolicy: 'Review after each official fare revision and before release',
  notes: 'Applies across Paper QR/Token, Digital Tickets, and Smart Cards. Exact route fare requires verified station-to-station distance, which is not yet sourced.',
};

const stationSource = {
  ...networkMapSource,
  sourceUrl: 'https://ltmetro.com/stations/ameerpet/',
  notes: 'Station detail fixture is deliberately labelled DEMO / NOT VERIFIED in the UI until the data is individually reviewed for production use.',
};

export const sources = { networkMap: networkMapSource, fare: fareSource };

export const fareZones = [
  { zone: 1, maxKm: 2, fareRupees: 11 },
  { zone: 2, maxKm: 4, fareRupees: 17 },
  { zone: 3, maxKm: 6, fareRupees: 28 },
  { zone: 4, maxKm: 9, fareRupees: 37 },
  { zone: 5, maxKm: 12, fareRupees: 47 },
  { zone: 6, maxKm: 15, fareRupees: 51 },
  { zone: 7, maxKm: 18, fareRupees: 56 },
  { zone: 8, maxKm: 21, fareRupees: 61 },
  { zone: 9, maxKm: 24, fareRupees: 65 },
  { zone: 10, maxKm: Infinity, fareRupees: 69 },
];

export function lookupFare(distanceKm) {
  if (distanceKm == null || !Number.isFinite(distanceKm) || distanceKm < 0) {
    return { status: 'unavailable', fareRupees: null, zone: null, message: 'Valid distance required.' };
  }
  const match = fareZones.find((z) => distanceKm <= z.maxKm);
  return { status: 'available', fareRupees: match.fareRupees, zone: match.zone, distanceKm };
}

export const lines = {
  red: {
    id: 'red', code: 'R', name: 'Red Line', color: '#c53a3a', pattern: 'solid',
    directionIds: ['red-to-lb', 'red-to-miyapur'],
    termini: { start: 'Miyapur', end: 'L B Nagar' },
    officialStationCount: 27,
  },
  blue: {
    id: 'blue', code: 'B', name: 'Blue Line', color: '#1e65a8', pattern: 'dash',
    directionIds: ['blue-to-raidurg', 'blue-to-nagole'],
    termini: { start: 'Nagole', end: 'Raidurg' },
    officialStationCount: 23,
  },
  green: {
    id: 'green', code: 'G', name: 'Green Line', color: '#237a4b', pattern: 'dot',
    directionIds: ['green-to-mg', 'green-to-jbs'],
    termini: { start: 'JBS Parade Ground', end: 'MG Bus Station' },
    officialStationCount: 9,
  },
};

const definitions = [
  ['miyapur', 'Miyapur', { en: 'Miyapur', te: 'మియాపూర్' }, ['red'], { red: 1 }],
  ['jntu-college', 'JNTU College', { en: 'JNTU College', te: 'జేఎన్‌టీయూ కాలేజ్' }, ['red'], { red: 2 }],
  ['kphb-colony', 'KPHB Colony', { en: 'KPHB Colony', te: 'కేపీహెచ్‌బీ కాలనీ' }, ['red'], { red: 3 }],
  ['kukatpally', 'Kukatpally', { en: 'Kukatpally', te: 'కూకట్‌పల్లి' }, ['red'], { red: 4 }],
  ['balanagar', 'Dr. B.R. Ambedkar Balanagar', { en: 'Dr. B.R. Ambedkar Balanagar', te: 'డా. బి.ఆర్. అంబేద్కర్ బాలానగర్' }, ['red'], { red: 5 }],
  ['moosapet', 'Moosapet', { en: 'Moosapet', te: 'మూసాపేట్' }, ['red'], { red: 6 }],
  ['bharath-nagar', 'Bharat Nagar', { en: 'Bharat Nagar', te: 'భరత్ నగర్' }, ['red'], { red: 7 }],
  ['erragadda', 'Erragadda', { en: 'Erragadda', te: 'ఎర్రగడ్డ' }, ['red'], { red: 8 }],
  ['esi-hospital', 'ESI Hospital', { en: 'ESI Hospital', te: 'ఈఎస్ఐ హాస్పిటల్' }, ['red'], { red: 9 }],
  ['sr-nagar', 'S.R. Nagar', { en: 'S.R. Nagar', te: 'ఎస్.ఆర్. నగర్' }, ['red'], { red: 10 }],
  ['ameerpet', 'Ameerpet', { en: 'Ameerpet', te: 'అమీర్‌పేట్' }, ['red', 'blue'], { red: 11, blue: 14 }],
  ['punjagutta', 'Punjagutta', { en: 'Punjagutta', te: 'పంజాగుట్ట' }, ['red'], { red: 12 }],
  ['irrum-manzil', 'Irrum Manzil', { en: 'Irrum Manzil', te: 'ఇర్రం మంజిల్' }, ['red'], { red: 13 }],
  ['khairatabad', 'Khairatabad', { en: 'Khairatabad', te: 'ఖైరతాబాద్' }, ['red'], { red: 14 }],
  ['lakdi-ka-pul', 'Lakdi-ka-pul', { en: 'Lakdi-ka-pul', te: 'లక్డీ-కా-పూల్' }, ['red'], { red: 15 }],
  ['assembly', 'Assembly', { en: 'Assembly', te: 'అసెంబ్లీ' }, ['red'], { red: 16 }],
  ['nampally', 'Nampally', { en: 'Nampally', te: 'నాంపల్లి' }, ['red'], { red: 17 }],
  ['gandhi-bhavan', 'Gandhi Bhavan', { en: 'Gandhi Bhavan', te: 'గాంధీ భవన్' }, ['red'], { red: 18 }],
  ['osmania-medical-college', 'Osmania Medical College', { en: 'Osmania Medical College', te: 'ఉస్మానియా మెడికల్ కాలేజ్' }, ['red'], { red: 19 }],
  ['mg-bus-station', 'MG Bus Station', { en: 'MG Bus Station', te: 'ఎంజీ బస్ స్టేషన్' }, ['red', 'green'], { red: 20, green: 9 }],
  ['malakpet', 'Malakpet', { en: 'Malakpet', te: 'మలక్‌పేట్' }, ['red'], { red: 21 }],
  ['new-market', 'New Market', { en: 'New Market', te: 'న్యూ మార్కెట్' }, ['red'], { red: 22 }],
  ['musarambagh', 'Musarambagh', { en: 'Musarambagh', te: 'మూసారాంబాగ్' }, ['red'], { red: 23 }],
  ['dilshuknagar', 'Dilsukhnagar', { en: 'Dilsukhnagar', te: 'దిల్‌సుఖ్‌నగర్' }, ['red'], { red: 24 }],
  ['chaitanyapuri', 'Chaitanyapuri', { en: 'Chaitanyapuri', te: 'చైతన్యపురి' }, ['red'], { red: 25 }],
  ['victoria-memorial', 'Victoria Memorial', { en: 'Victoria Memorial', te: 'విక్టోరియా మెమోరియల్' }, ['red'], { red: 26 }],
  ['lb-nagar', 'L B Nagar', { en: 'L B Nagar', te: 'ఎల్ బీ నగర్' }, ['red'], { red: 27 }],
  ['nagole', 'Nagole', { en: 'Nagole', te: 'నాగోల్' }, ['blue'], { blue: 1 }],
  ['uppal', 'Uppal', { en: 'Uppal', te: 'ఉప్పల్' }, ['blue'], { blue: 2 }],
  ['stadium', 'Stadium', { en: 'Stadium', te: 'స్టేడియం' }, ['blue'], { blue: 3 }],
  ['ngri', 'NGRI', { en: 'NGRI', te: 'ఎన్‌జీఆర్‌ఐ' }, ['blue'], { blue: 4 }],
  ['habsiguda', 'Habsiguda', { en: 'Habsiguda', te: 'హబ్సిగూడ' }, ['blue'], { blue: 5 }],
  ['tarnaka', 'Tarnaka', { en: 'Tarnaka', te: 'తార్నాక' }, ['blue'], { blue: 6 }],
  ['mettuguda', 'Mettuguda', { en: 'Mettuguda', te: 'మెట్టుగూడ' }, ['blue'], { blue: 7 }],
  ['secunderabad-east', 'Secunderabad East', { en: 'Secunderabad East', te: 'సికింద్రాబాద్ ఈస్ట్' }, ['blue'], { blue: 8 }],
  ['parade-ground', 'Parade Ground', { en: 'Parade Ground', te: 'పరేడ్ గ్రౌండ్' }, ['blue'], { blue: 9 }],
  ['paradise', 'Paradise', { en: 'Paradise', te: 'ప్యారడైజ్' }, ['blue'], { blue: 10 }],
  ['rasoolpura', 'Rasoolpura', { en: 'Rasoolpura', te: 'రసూల్‌పురా' }, ['blue'], { blue: 11 }],
  ['prakash-nagar', 'Prakash Nagar', { en: 'Prakash Nagar', te: 'ప్రకాశ్ నగర్' }, ['blue'], { blue: 12 }],
  ['begumpet', 'Begumpet', { en: 'Begumpet', te: 'బేగంపేట్' }, ['blue'], { blue: 13 }],
  ['madhura-nagar', 'Madhura Nagar', { en: 'Madhura Nagar', te: 'మధురా నగర్' }, ['blue'], { blue: 15 }],
  ['yusufguda', 'Yusufguda', { en: 'Yusufguda', te: 'యూసుఫ్‌గూడ' }, ['blue'], { blue: 16 }],
  ['road-no-5', 'Road No. 5 Jubilee Hills', { en: 'Road No. 5 Jubilee Hills', te: 'రోడ్ నం. 5 జూబ్లీ హిల్స్' }, ['blue'], { blue: 17 }],
  ['jubilee-hills-check-post', 'Jubilee Hills Check Post', { en: 'Jubilee Hills Check Post', te: 'జూబ్లీ హిల్స్ చెక్ పోస్ట్' }, ['blue'], { blue: 18 }],
  ['peddamma-gudi', 'Peddamma Gudi', { en: 'Peddamma Gudi', te: 'పెద్దమ్మ గుడి' }, ['blue'], { blue: 19 }],
  ['madhapur', 'Madhapur', { en: 'Madhapur', te: 'మాదాపూర్' }, ['blue'], { blue: 20 }],
  ['durgam-cheruvu', 'Durgam Cheruvu', { en: 'Durgam Cheruvu', te: 'దుర్గం చెరువు' }, ['blue'], { blue: 21 }],
  ['hitec-city', 'HITEC City', { en: 'HITEC City', te: 'హైటెక్ సిటీ' }, ['blue'], { blue: 22 }],
  ['raidurg', 'Raidurg', { en: 'Raidurg', te: 'రాయదుర్గ్' }, ['blue'], { blue: 23 }],
  ['jbs-parade-ground', 'JBS Parade Ground', { en: 'JBS Parade Ground', te: 'జేబీఎస్ పరేడ్ గ్రౌండ్' }, ['green'], { green: 1 }],
  ['secunderabad-west', 'Secunderabad West', { en: 'Secunderabad West', te: 'సికింద్రాబాద్ వెస్ట్' }, ['green'], { green: 2 }],
  ['gandhi-hospital', 'Gandhi Hospital', { en: 'Gandhi Hospital', te: 'గాంధీ హాస్పిటల్' }, ['green'], { green: 3 }],
  ['musheerabad', 'Musheerabad', { en: 'Musheerabad', te: 'ముషీరాబాద్' }, ['green'], { green: 4 }],
  ['rtc-x-roads', 'RTC X Roads', { en: 'RTC X Roads', te: 'ఆర్టీసీ ఎక్స్ రోడ్స్' }, ['green'], { green: 5 }],
  ['chikkadpally', 'Chikkadpally', { en: 'Chikkadpally', te: 'చిక్కడపల్లి' }, ['green'], { green: 6 }],
  ['narayanaguda', 'Narayanaguda', { en: 'Narayanaguda', te: 'నారాయణగూడ' }, ['green'], { green: 7 }],
  ['sultan-bazaar', 'Sultan Bazaar', { en: 'Sultan Bazaar', te: 'సుల్తాన్ బజార్' }, ['green'], { green: 8 }],
];

export const stations = Object.fromEntries(definitions.map(([id, name, localizedNames, lineIds, officialNumbers]) => [id, {
  id, name, localizedNames, lineIds, officialNumbers, aliases: [name.toLowerCase()], provenance: networkMapSource,
}]));

const redOrder = definitions.filter(([, , , lineIds]) => lineIds.includes('red')).map(([id]) => id);
const blueOrder = ['nagole', 'uppal', 'stadium', 'ngri', 'habsiguda', 'tarnaka', 'mettuguda', 'secunderabad-east', 'parade-ground', 'paradise', 'rasoolpura', 'prakash-nagar', 'begumpet', 'ameerpet', 'madhura-nagar', 'yusufguda', 'road-no-5', 'jubilee-hills-check-post', 'peddamma-gudi', 'madhapur', 'durgam-cheruvu', 'hitec-city', 'raidurg'];
const greenOrder = ['jbs-parade-ground', 'secunderabad-west', 'gandhi-hospital', 'musheerabad', 'rtc-x-roads', 'chikkadpally', 'narayanaguda', 'sultan-bazaar', 'mg-bus-station'];

export const lineOrders = { red: redOrder, blue: blueOrder, green: greenOrder };

export const transferConnections = [
  {
    fromLine: 'red', fromStation: 'ameerpet', toLine: 'blue', toStation: 'ameerpet', transferStationId: 'ameerpet',
    crossStation: false,
    provenance: { ...networkMapSource, notes: 'Official network map confirms Ameerpet as a Red/Blue interchange. Physical transfer path and duration are unavailable.' },
  },
  {
    fromLine: 'red', fromStation: 'mg-bus-station', toLine: 'green', toStation: 'mg-bus-station', transferStationId: 'mg-bus-station',
    crossStation: false,
    provenance: { ...networkMapSource, notes: 'Official network map confirms MG Bus Station as a Red/Green interchange. Physical transfer path and duration are unavailable.' },
  },
  {
    fromLine: 'blue', fromStation: 'parade-ground', toLine: 'green', toStation: 'jbs-parade-ground',
    transferStationId: null,
    crossStation: true,
    fromStationId: 'parade-ground',
    toStationId: 'jbs-parade-ground',
    provenance: { ...networkMapSource, notes: 'Official network map confirms Parade Ground (Blue) and JBS Parade Ground (Green) form a connected interchange complex. Walking path and transfer duration are unavailable.' },
  },
];

export const interchangeStationIds = ['ameerpet', 'mg-bus-station', 'parade-ground', 'jbs-parade-ground'];

export const stationDetail = {
  'ameerpet': {
    stationId: 'ameerpet',
    demo: true,
    levels: ['Street level', 'Concourse level', 'Platform level'],
    note: 'Station detail fixture — DEMO / NOT VERIFIED for this rebuild.',
    source: stationSource,
  },
};

export function displayName(stationId, locale = 'en') {
  const station = stations[stationId];
  return station?.localizedNames?.[locale] || station?.localizedNames?.en || station?.name || stationId;
}

export function allStations() {
  return Object.values(stations);
}

export function lineName(lineId) {
  return lines[lineId]?.name || lineId;
}
