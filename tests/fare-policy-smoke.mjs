import { lookupFare, fareZones, sources } from '../src/data.js';

const checks = [];
function check(name, condition) {
  checks.push({ name, ok: Boolean(condition) });
}

// Fare zone boundary tests
check('2 km → ₹11', lookupFare(2).fareRupees === 11);
check('just above 2 km → ₹17', lookupFare(2.01).fareRupees === 17);
check('4 km → ₹17', lookupFare(4).fareRupees === 17);
check('just above 4 km → ₹28', lookupFare(4.01).fareRupees === 28);
check('6 km → ₹28', lookupFare(6).fareRupees === 28);
check('9 km → ₹37', lookupFare(9).fareRupees === 37);
check('12 km → ₹47', lookupFare(12).fareRupees === 47);
check('15 km → ₹51', lookupFare(15).fareRupees === 51);
check('18 km → ₹56', lookupFare(18).fareRupees === 56);
check('21 km → ₹61', lookupFare(21).fareRupees === 61);
check('24 km → ₹65', lookupFare(24).fareRupees === 65);
check('above 24 km → ₹69', lookupFare(25).fareRupees === 69);
check('100 km → ₹69', lookupFare(100).fareRupees === 69);
check('0 km → ₹11', lookupFare(0).fareRupees === 11);
check('1.5 km → ₹11', lookupFare(1.5).fareRupees === 11);

// Invalid/missing/non-finite inputs
check('null distance → unavailable', lookupFare(null).status === 'unavailable');
check('undefined distance → unavailable', lookupFare(undefined).status === 'unavailable');
check('NaN distance → unavailable', lookupFare(NaN).status === 'unavailable');
check('Infinity distance → unavailable', lookupFare(Infinity).status === 'unavailable');
check('negative distance → unavailable', lookupFare(-1).status === 'unavailable');
check('string distance → unavailable', lookupFare('five').status === 'unavailable');

// Fare zone model integrity
check('10 fare zones exist', fareZones.length === 10);
check('zone 1 starts at ₹11', fareZones[0].fareRupees === 11);
check('zone 10 is ₹69', fareZones[9].fareRupees === 69);
check('zones are monotonically increasing', fareZones.every((z, i) => i === 0 || z.fareRupees >= fareZones[i - 1].fareRupees));

// Source metadata
check('fare source reference is present', sources.fare.reference === 'L&TMRHL/CCD/PR/189/23-05-2025');
check('fare source effective date is 2025-05-24', sources.fare.effectiveFrom === '2025-05-24');
check('fare source URL is official', sources.fare.sourceUrl.includes('ltmetro.com'));
check('network map source URL is official', sources.networkMap.sourceUrl.includes('ltmetro.com'));
check('network map confidence is high', sources.networkMap.confidence === 'high');

for (const result of checks) console.log(`${result.ok ? 'PASS' : 'FAIL'}\t${result.name}`);
if (checks.some((result) => !result.ok)) process.exit(1);
