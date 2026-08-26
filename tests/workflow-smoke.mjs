import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const workflowPath = fileURLToPath(new URL('../.github/workflows/pages.yml', import.meta.url));
const workflow = readFileSync(workflowPath, 'utf8');
const actionRefs = [...workflow.matchAll(/^\s+(?:-\s+)?uses:\s+([^\s#]+)/gm)].map((match) => match[1]);
const checks = [
  ['workflow has the expected six action references', actionRefs.length === 6],
  ['every workflow action is pinned to an immutable commit SHA', actionRefs.every((ref) => /@[0-9a-f]{40}$/.test(ref))],
];

for (const [name, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'}\t${name}`);
if (checks.some(([, ok]) => !ok)) process.exitCode = 1;
