export const DATA_VERSION = 'hmgo-demo-topology-2026-08-24';

const source = {
  sourceName: 'L&T Metro Rail Hyderabad',
  sourceUrl: 'https://ltmetro.com/train-timings/',
  lastVerifiedAt: '2026-08-24',
  status: 'verified-static',
  confidence: 'high',
};

const networkSource = {
  ...source,
  sourceUrl: 'https://ltmetro.com/find-trip-details/',
  notes: 'Official L&T trip selector used for the static station list; line membership and physical transfer metadata still require field-level review.',
};

const stationSource = {
  ...source,
  sourceUrl: 'https://ltmetro.com/stations/ameerpet/',
  notes: 'Station detail fixture is deliberately labelled DEMO / NOT VERIFIED in the UI until the data is individually reviewed for production use.',
};

export const lines = {
  red: {
    id: 'red', code: 'R', name: 'Red Line', color: '#c53a3a', pattern: 'solid',
    directionIds: ['red-to-lb', 'red-to-miyapur'],
  },
  blue: {
    id: 'blue', code: 'B', name: 'Blue Line', color: '#1e65a8', pattern: 'dash',
    directionIds: ['blue-to-raidurg', 'blue-to-nagole'],
  },
  green: {
    id: 'green', code: 'G', name: 'Green Line', color: '#237a4b', pattern: 'dot',
    directionIds: ['green-to-mg', 'green-to-jbs'],
  },
};

const definitions = [
  ['miyapur', 'Miyapur', { en: 'Miyapur', te: 'మియాపూర్' }, ['red']],
  ['jntu-college', 'JNTU College', { en: 'JNTU College', te: 'జేఎన్‌టీయూ కాలేజ్' }, ['red']],
  ['kphb-colony', 'KPHB Colony', { en: 'KPHB Colony', te: 'కేపీహెచ్‌బీ కాలనీ' }, ['red']],
  ['kukatpally', 'Kukatpally', { en: 'Kukatpally', te: 'కూకట్‌పల్లి' }, ['red']],
  ['balanagar', 'Dr. B.R. Ambedkar Balanagar', { en: 'Dr. B.R. Ambedkar Balanagar', te: 'డా. బి.ఆర్. అంబేద్కర్ బాలానగర్' }, ['red']],
  ['moosapet', 'Moosapet', { en: 'Moosapet', te: 'మూసాపేట్' }, ['red']],
  ['bharath-nagar', 'Bharath Nagar', { en: 'Bharath Nagar', te: 'భరత్ నగర్' }, ['red']],
  ['erragadda', 'Erragadda', { en: 'Erragadda', te: 'ఎర్రగడ్డ' }, ['red']],
  ['esi-hospital', 'ESI Hospital', { en: 'ESI Hospital', te: 'ఈఎస్ఐ హాస్పిటల్' }, ['red']],
  ['sr-nagar', 'S.R. Nagar', { en: 'S.R. Nagar', te: 'ఎస్.ఆర్. నగర్' }, ['red']],
  ['ameerpet', 'Ameerpet', { en: 'Ameerpet', te: 'అమీర్‌పేట్' }, ['red', 'blue']],
  ['punjagutta', 'Punjagutta', { en: 'Punjagutta', te: 'పంజాగుట్ట' }, ['red']],
  ['irrum-manzil', 'Irrum Manzil', { en: 'Irrum Manzil', te: 'ఇర్రం మంజిల్' }, ['red']],
  ['khairatabad', 'Khairatabad', { en: 'Khairatabad', te: 'ఖైరతాబాద్' }, ['red']],
  ['lakdi-ka-pul', 'Lakdi-ka-pul', { en: 'Lakdi-ka-pul', te: 'లక్డీ-కా-పూల్' }, ['red']],
  ['assembly', 'Assembly', { en: 'Assembly', te: 'అసెంబ్లీ' }, ['red']],
  ['nampally', 'Nampally', { en: 'Nampally', te: 'నాంపల్లి' }, ['red']],
  ['gandhi-bhavan', 'Gandhi Bhavan', { en: 'Gandhi Bhavan', te: 'గాంధీ భవన్' }, ['red']],
  ['osmania-medical-college', 'Osmania Medical College', { en: 'Osmania Medical College', te: 'ఉస్మానియా మెడికల్ కాలేజ్' }, ['red']],
  ['mg-bus-station', 'MG Bus Station', { en: 'MG Bus Station', te: 'ఎంజీ బస్ స్టేషన్' }, ['red', 'green']],
  ['malakpet', 'Malakpet', { en: 'Malakpet', te: 'మలక్‌పేట్' }, ['red']],
  ['new-market', 'New Market', { en: 'New Market', te: 'న్యూ మార్కెట్' }, ['red']],
  ['musarambagh', 'Musarambagh', { en: 'Musarambagh', te: 'మూసారాంబాగ్' }, ['red']],
  ['dilshuknagar', 'Dilsukhnagar', { en: 'Dilsukhnagar', te: 'దిల్‌సుఖ్‌నగర్' }, ['red']],
  ['chaitanyapuri', 'Chaitanyapuri', { en: 'Chaitanyapuri', te: 'చైతన్యపురి' }, ['red']],
  ['victoria-memorial', 'Victoria Memorial', { en: 'Victoria Memorial', te: 'విక్టోరియా మెమోరియల్' }, ['red']],
  ['lb-nagar', 'L B Nagar', { en: 'L B Nagar', te: 'ఎల్ బీ నగర్' }, ['red']],
  ['nagole', 'Nagole', { en: 'Nagole', te: 'నాగోల్' }, ['blue']],
  ['uppal', 'Uppal', { en: 'Uppal', te: 'ఉప్పల్' }, ['blue']],
  ['stadium', 'Stadium', { en: 'Stadium', te: 'స్టేడియం' }, ['blue']],
  ['ngri', 'NGRI', { en: 'NGRI', te: 'ఎన్‌జీఆర్‌ఐ' }, ['blue']],
  ['habsiguda', 'Habsiguda', { en: 'Habsiguda', te: 'హబ్సిగూడ' }, ['blue']],
  ['tarnaka', 'Tarnaka', { en: 'Tarnaka', te: 'తార్నాక' }, ['blue']],
  ['mettuguda', 'Mettuguda', { en: 'Mettuguda', te: 'మెట్టుగూడ' }, ['blue']],
  ['secunderabad-east', 'Secunderabad East', { en: 'Secunderabad East', te: 'సికింద్రాబాద్ ఈస్ట్' }, ['blue']],
  ['paradise', 'Paradise', { en: 'Paradise', te: 'ప్యారడైజ్' }, ['blue']],
  ['rasoolpura', 'Rasoolpura', { en: 'Rasoolpura', te: 'రసూల్‌పురా' }, ['blue']],
  ['prakash-nagar', 'Prakash Nagar', { en: 'Prakash Nagar', te: 'ప్రకాశ్ నగర్' }, ['blue']],
  ['begumpet', 'Begumpet', { en: 'Begumpet', te: 'బేగంపేట్' }, ['blue']],
  ['madhura-nagar', 'Madhura Nagar', { en: 'Madhura Nagar', te: 'మధురా నగర్' }, ['blue']],
  ['yusufguda', 'Yusufguda', { en: 'Yusufguda', te: 'యూసుఫ్‌గూడ' }, ['blue']],
  ['road-no-5', 'Road No. 5 Jubilee Hills', { en: 'Road No. 5 Jubilee Hills', te: 'రోడ్ నం. 5 జూబ్లీ హిల్స్' }, ['blue']],
  ['jubilee-hills-check-post', 'Jubilee Hills Check Post', { en: 'Jubilee Hills Check Post', te: 'జూబ్లీ హిల్స్ చెక్ పోస్ట్' }, ['blue']],
  ['peddamma-gudi', 'Peddamma Gudi', { en: 'Peddamma Gudi', te: 'పెద్దమ్మ గుడి' }, ['blue']],
  ['madhapur', 'Madhapur', { en: 'Madhapur', te: 'మాదాపూర్' }, ['blue']],
  ['durgam-cheruvu', 'Durgam Cheruvu', { en: 'Durgam Cheruvu', te: 'దుర్గం చెరువు' }, ['blue']],
  ['hitec-city', 'HITEC City', { en: 'HITEC City', te: 'హైటెక్ సిటీ' }, ['blue']],
  ['raidurg', 'Raidurg', { en: 'Raidurg', te: 'రాయదుర్గ్' }, ['blue']],
  ['jbs-parade-ground', 'JBS Parade Ground', { en: 'JBS Parade Ground', te: 'జేబీఎస్ పరేడ్ గ్రౌండ్' }, ['green']],
  ['parade-ground', 'Parade Ground', { en: 'Parade Ground', te: 'పరేడ్ గ్రౌండ్' }, ['blue']],
  ['secunderabad-west', 'Secunderabad West', { en: 'Secunderabad West', te: 'సికింద్రాబాద్ వెస్ట్' }, ['green']],
  ['gandhi-hospital', 'Gandhi Hospital', { en: 'Gandhi Hospital', te: 'గాంధీ హాస్పిటల్' }, ['green']],
  ['musheerabad', 'Musheerabad', { en: 'Musheerabad', te: 'ముషీరాబాద్' }, ['green']],
  ['rtc-x-roads', 'RTC X Roads', { en: 'RTC X Roads', te: 'ఆర్టీసీ ఎక్స్ రోడ్స్' }, ['green']],
  ['chikkadpally', 'Chikkadpally', { en: 'Chikkadpally', te: 'చిక్కడపల్లి' }, ['green']],
  ['narayanaguda', 'Narayanaguda', { en: 'Narayanaguda', te: 'నారాయణగూడ' }, ['green']],
  ['sultan-bazaar', 'Sultan Bazaar', { en: 'Sultan Bazaar', te: 'సుల్తాన్ బజార్' }, ['green']],
];

export const stations = Object.fromEntries(definitions.map(([id, name, localizedNames, lineIds]) => [id, {
  id, name, localizedNames, lineIds, aliases: [name.toLowerCase()], provenance: networkSource,
}]));

const redOrder = definitions.filter(([, , , lineIds]) => lineIds.includes('red')).map(([id]) => id);
const blueOrder = ['nagole', 'uppal', 'stadium', 'ngri', 'habsiguda', 'tarnaka', 'mettuguda', 'secunderabad-east', 'parade-ground', 'paradise', 'rasoolpura', 'prakash-nagar', 'begumpet', 'ameerpet', 'madhura-nagar', 'yusufguda', 'road-no-5', 'jubilee-hills-check-post', 'peddamma-gudi', 'madhapur', 'durgam-cheruvu', 'hitec-city', 'raidurg'];
const greenOrder = ['jbs-parade-ground', 'secunderabad-west', 'gandhi-hospital', 'musheerabad', 'rtc-x-roads', 'chikkadpally', 'narayanaguda', 'sultan-bazaar', 'mg-bus-station'];

export const lineOrders = { red: redOrder, blue: blueOrder, green: greenOrder };

export const transferConnections = [
  {
    fromLine: 'red', fromStation: 'ameerpet', toLine: 'blue', toStation: 'ameerpet', transferStationId: 'ameerpet',
    provenance: { ...source, status: 'pending-verification', confidence: 'medium', notes: 'Official timing source names Ameerpet as a Red/Blue interchange; physical transfer path and duration require verification.' },
  },
  {
    fromLine: 'red', fromStation: 'mg-bus-station', toLine: 'green', toStation: 'mg-bus-station', transferStationId: 'mg-bus-station',
    provenance: { ...source, status: 'pending-verification', confidence: 'medium', notes: 'Official timing source names MG Bus Station as a Red/Green interchange; physical transfer path and duration require verification.' },
  },
];

export const pendingTransferConnections = [
  {
    fromLine: 'blue', fromStation: 'parade-ground', toLine: 'green', toStation: 'jbs-parade-ground', transferStationId: 'jbs-parade-ground',
    provenance: { ...source, status: 'pending-verification', confidence: 'medium', notes: 'Official timing source names JBS Parade Ground as a Green/Blue interchange, but this exact Parade Ground-to-JBS Parade Ground edge is not yet verified.' },
  },
];

export const interchangeStationIds = ['ameerpet', 'mg-bus-station', 'jbs-parade-ground'];

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
