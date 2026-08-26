import { buildGraph, planJourney } from '../src/route-engine.js';
import { lineOrders, stations, lines } from '../src/data.js';
import { mapPointFor, mapStationPoints, renderMap, VIEWBOX, textMapAlternative } from '../src/map-view.js';

const checks = [];
function check(name, condition) {
  checks.push({ name, ok: Boolean(condition) });
}

// Official line station counts
check('Red Line has 27 stations', lineOrders.red.length === 27);
check('Blue Line has 23 stations', lineOrders.blue.length === 23);
check('Green Line has 9 stations', lineOrders.green.length === 9);
check('57 unique station identities', Object.keys(stations).length === 57);
check('59 total line memberships', Object.values(stations).reduce((sum, s) => sum + s.lineIds.length, 0) === 59);

// Official station numbering
check('Miyapur is Red #1', stations['miyapur'].officialNumbers.red === 1);
check('L B Nagar is Red #27', stations['lb-nagar'].officialNumbers.red === 27);
check('Nagole is Blue #1', stations['nagole'].officialNumbers.blue === 1);
check('Raidurg is Blue #23', stations['raidurg'].officialNumbers.blue === 23);
check('JBS Parade Ground is Green #1', stations['jbs-parade-ground'].officialNumbers.green === 1);
check('MG Bus Station is Green #9', stations['mg-bus-station'].officialNumbers.green === 9);
check('Ameerpet is Red #11 and Blue #14', stations['ameerpet'].officialNumbers.red === 11 && stations['ameerpet'].officialNumbers.blue === 14);
check('Parade Ground is Blue #9', stations['parade-ground'].officialNumbers.blue === 9);

// Official line metadata
check('Red Line officialStationCount is 27', lines.red.officialStationCount === 27);
check('Blue Line officialStationCount is 23', lines.blue.officialStationCount === 23);
check('Green Line officialStationCount is 9', lines.green.officialStationCount === 9);

// Direct route
const direct = planJourney({ originStationId: 'miyapur', destinationStationId: 'assembly' });
check('direct route succeeds', direct.status === 'success');
check('direct timing is unavailable', direct.route.totalDuration.status === 'unavailable');
check('direct fare label says exact fare unavailable', direct.route.fare.label === 'Exact fare unavailable');
check('direct route has explicit ride stage', direct.route.steps.some((step) => step.type === 'ride'));

// Transfer route
const transfer = planJourney({ originStationId: 'miyapur', destinationStationId: 'raidurg' });
check('transfer route succeeds', transfer.status === 'success');
check('transfer is explicit', transfer.route.steps.some((step) => step.type === 'change'));
check('post-transfer ride is explicit', transfer.route.steps.filter((step) => step.type === 'ride').length >= 2);
check('transfer is not zero-cost', transfer.route.edges.some((edge) => edge.type === 'transfer' && edge.cost === 1));

// Same station
const same = planJourney({ originStationId: 'ameerpet', destinationStationId: 'ameerpet' });
check('same station is invalid', same.status === 'invalid');

// Parade Ground / JBS distinct identities
check('Osmania Medical College is in Red Line topology', stations['osmania-medical-college']?.lineIds.includes('red'));
check('Parade Ground identities stay distinct', stations['parade-ground'].id !== stations['jbs-parade-ground'].id);

// All three interchange relationships
const graph = buildGraph();
const ameerpetTransfer = graph.get('red:ameerpet')?.some((e) => e.to === 'blue:ameerpet' && e.type === 'transfer');
const mgbsTransfer = graph.get('red:mg-bus-station')?.some((e) => e.to === 'green:mg-bus-station' && e.type === 'transfer');
const pgToJbs = graph.get('blue:parade-ground')?.some((e) => e.to === 'green:jbs-parade-ground' && e.type === 'transfer');
const jbsToPg = graph.get('green:jbs-parade-ground')?.some((e) => e.to === 'blue:parade-ground' && e.type === 'transfer');
check('Ameerpet Red↔Blue transfer exists', ameerpetTransfer);
check('MG Bus Station Red↔Green transfer exists', mgbsTransfer);
check('Parade Ground → JBS direct transfer exists', pgToJbs);
check('JBS → Parade Ground direct transfer exists', jbsToPg);

// Parade Ground to JBS route
const pgJbs = planJourney({ originStationId: 'parade-ground', destinationStationId: 'jbs-parade-ground' });
check('Parade Ground → JBS route succeeds', pgJbs.status === 'success');
check('PG→JBS has exactly one transfer', pgJbs.route.transfers === 1);
check('PG→JBS transfer names both stations', pgJbs.route.steps.some((s) => s.type === 'change' && s.crossStation && s.text.includes('Parade Ground') && s.text.includes('JBS Parade Ground')));
check('PG→JBS transfer discloses unavailable walking path', pgJbs.route.steps.some((s) => s.type === 'change' && s.note?.includes('Walking path and transfer duration are unavailable')));
check('PG→JBS has no fabricated ride segment', pgJbs.route.rideSegments === 0);
check('PG→JBS ends with arrive', pgJbs.route.steps.at(-1)?.type === 'arrive');
check('PG→JBS arrival station matches destination', pgJbs.route.steps.at(-1)?.stationId === 'jbs-parade-ground');

const jbsPg = planJourney({ originStationId: 'jbs-parade-ground', destinationStationId: 'parade-ground' });
check('JBS → Parade Ground route succeeds', jbsPg.status === 'success');
check('JBS→PG ends with arrive', jbsPg.route.steps.at(-1)?.type === 'arrive');
check('JBS→PG arrival station matches destination', jbsPg.route.steps.at(-1)?.stationId === 'parade-ground');

// Map assertions
check('Ameerpet interchange anchors align', mapPointFor('red', 'ameerpet').join(',') === mapPointFor('blue', 'ameerpet').join(','));
check('MG Bus Station interchange anchors align', mapPointFor('red', 'mg-bus-station').join(',') === mapPointFor('green', 'mg-bus-station').join(','));
check('Parade Ground nodes do not overlap', mapPointFor('blue', 'parade-ground').join(',') !== mapPointFor('green', 'jbs-parade-ground').join(','));
const bounds = mapStationPoints().every(({ point: [x, y] }) => x >= VIEWBOX.padding && x <= VIEWBOX.width - VIEWBOX.padding && y >= VIEWBOX.padding && y <= VIEWBOX.height - VIEWBOX.padding);
check('all stations remain inside padded map bounds', bounds);
check('line termini remain inside padded map bounds', ['red', 'blue', 'green'].flatMap((lineId) => [lineOrders[lineId][0], lineOrders[lineId].at(-1)].map((stationId) => mapPointFor(lineId, stationId))).every(([x, y]) => x >= VIEWBOX.padding && x <= VIEWBOX.width - VIEWBOX.padding && y >= VIEWBOX.padding && y <= VIEWBOX.height - VIEWBOX.padding));
const mapMarkup = renderMap();
check('map exposes line codes and non-color patterns', mapMarkup.includes('R · Red Line') && mapMarkup.includes('B · Blue Line') && mapMarkup.includes('G · Green Line') && mapMarkup.includes('16 10') && mapMarkup.includes('3 10'));
check('map contains transfer connector', mapMarkup.includes('transfer-connector'));

// Map text alternative describes all three interchanges
const textAlt = textMapAlternative();
check('text alternative describes Ameerpet interchange', textAlt.includes('Ameerpet') && textAlt.includes('Red') && textAlt.includes('Blue'));
check('text alternative describes MG Bus Station interchange', textAlt.includes('MG Bus Station') && textAlt.includes('Green'));
check('text alternative describes Parade Ground/JBS interchange', textAlt.includes('Parade Ground') && textAlt.includes('JBS Parade Ground'));

// Route without verified distance never shows fare
check('route result never shows calculated fare', direct.route.fare.value === null && direct.route.fare.status === 'unavailable');

// Accessible objective downgrade
const accessible = planJourney({ originStationId: 'miyapur', destinationStationId: 'raidurg', objective: 'accessible', accessibility: { stepFree: true } });
check('unsupported accessible objective is downgraded honestly', accessible.route.confidence.includes('accessibility data') && accessible.route.explanation.includes('static topology'));

for (const result of checks) console.log(`${result.ok ? 'PASS' : 'FAIL'}\t${result.name}`);
if (checks.some((result) => !result.ok)) process.exit(1);
