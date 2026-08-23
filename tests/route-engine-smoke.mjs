import { planJourney } from '../src/route-engine.js';
import { stations } from '../src/data.js';

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
check('Parade Ground identities stay distinct', stations['parade-ground'].id !== stations['jbs-parade-ground'].id);
check('Parade Ground pair is connected through explicit transfers', distinct.status === 'success' && distinct.route.steps.some((step) => step.type === 'change'));
const accessible = planJourney({ originStationId: 'miyapur', destinationStationId: 'raidurg', objective: 'accessible', accessibility: { stepFree: true } });
check('accessible objective exposes uncertainty', accessible.route.confidence.includes('unverified'));

for (const result of checks) console.log(`${result.ok ? 'PASS' : 'FAIL'}\t${result.name}`);
if (checks.some((result) => !result.ok)) process.exit(1);
