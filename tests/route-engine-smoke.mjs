import { buildGraph, planJourney } from '../src/route-engine.js';
import { stations } from '../src/data.js';
import { mapPointFor } from '../src/map-view.js';

const checks = [];
function check(name, condition) {
  checks.push({ name, ok: Boolean(condition) });
}

const direct = planJourney({ originStationId: 'miyapur', destinationStationId: 'assembly' });
check('direct route succeeds', direct.status === 'success');
check('direct timing is unavailable', direct.route.totalDuration.status === 'unavailable');
check('direct fare is unavailable', direct.route.fare.status === 'unavailable');
check('direct route has explicit ride stage', direct.route.steps.some((step) => step.type === 'ride'));

const transfer = planJourney({ originStationId: 'miyapur', destinationStationId: 'raidurg' });
check('transfer route succeeds', transfer.status === 'success');
check('transfer is explicit', transfer.route.steps.some((step) => step.type === 'change'));
check('post-transfer ride is explicit', transfer.route.steps.filter((step) => step.type === 'ride').length >= 2);
check('transfer is not zero-cost', transfer.route.edges.some((edge) => edge.type === 'transfer' && edge.cost === 1));

const same = planJourney({ originStationId: 'ameerpet', destinationStationId: 'ameerpet' });
check('same station is invalid', same.status === 'invalid');
const distinct = planJourney({ originStationId: 'parade-ground', destinationStationId: 'jbs-parade-ground' });
const graph = buildGraph();
const exactUnsupportedEdge = graph.get('blue:parade-ground')?.some((edge) => edge.to === 'green:jbs-parade-ground') || false;
check('Osmania Medical College is in Red Line topology', stations['osmania-medical-college']?.lineIds.includes('red'));
check('Parade Ground identities stay distinct', stations['parade-ground'].id !== stations['jbs-parade-ground'].id);
check('unsupported Parade Ground direct edge is absent', exactUnsupportedEdge === false);
check('Parade Ground pair uses only supported graph edges', distinct.status === 'success' && distinct.route.edges.every((edge) => edge.type !== 'transfer' || edge.transferStatus !== 'pending-verification' || edge.from !== 'blue:parade-ground'));
check('Ameerpet interchange anchors align', mapPointFor('red', 'ameerpet').join(',') === mapPointFor('blue', 'ameerpet').join(','));
check('MG Bus Station interchange anchors align', mapPointFor('red', 'mg-bus-station').join(',') === mapPointFor('green', 'mg-bus-station').join(','));
check('Parade Ground nodes do not overlap', mapPointFor('blue', 'parade-ground').join(',') !== mapPointFor('green', 'jbs-parade-ground').join(','));
const accessible = planJourney({ originStationId: 'miyapur', destinationStationId: 'raidurg', objective: 'accessible', accessibility: { stepFree: true } });
check('unsupported accessible objective is downgraded honestly', accessible.route.confidence.includes('accessibility data unavailable') && accessible.route.explanation.includes('static topology'));

for (const result of checks) console.log(`${result.ok ? 'PASS' : 'FAIL'}\t${result.name}`);
if (checks.some((result) => !result.ok)) process.exit(1);
