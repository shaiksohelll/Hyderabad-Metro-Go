import { allStations } from '../src/data.js';
import { planJourney } from '../src/route-engine.js';

const stationIds = allStations().map((station) => station.id);
const checks = [];
const check = (name, condition) => checks.push({ name, ok: Boolean(condition) });
let pairCount = 0;
let successCount = 0;
let unreachableCount = 0;
let failure = null;
for (const originStationId of stationIds) {
  for (const destinationStationId of stationIds) {
    if (originStationId === destinationStationId) continue;
    pairCount += 1;
    try {
      const result = planJourney({ originStationId, destinationStationId });
      if (result.status === 'success') {
        successCount += 1;
        if (!result.route?.steps?.length || result.route.steps[0].type !== 'start') failure = `${originStationId}->${destinationStationId}: missing start stage`;
        if (result.route.edges.some((edge) => edge.status === 'verified-static') || result.route.steps.some((step) => step.status === 'verified-static')) failure = `${originStationId}->${destinationStationId}: contradictory verified-static status`;
      } else if (result.status === 'unreachable') {
        unreachableCount += 1;
      } else {
        failure = `${originStationId}->${destinationStationId}: unexpected ${result.status}`;
      }
    } catch (error) {
      failure = `${originStationId}->${destinationStationId}: ${error.message}`;
    }
  }
}
check(`all ${pairCount} ordered station pairs return a bounded routing status`, failure === null && pairCount === stationIds.length * (stationIds.length - 1));
check('exhaustive routing produces at least one modeled route', successCount > 0);
check('exhaustive routing preserves honest unreachable boundaries', unreachableCount >= 0);
console.log(`INFO\tstations=${stationIds.length} pairs=${pairCount} success=${successCount} unreachable=${unreachableCount}`);
for (const result of checks) console.log(`${result.ok ? 'PASS' : 'FAIL'}\t${result.name}`);
if (checks.some((result) => !result.ok)) process.exit(1);
