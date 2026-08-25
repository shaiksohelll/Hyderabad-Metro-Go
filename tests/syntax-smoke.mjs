import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const srcDir = join(fileURLToPath(new URL('../src/', import.meta.url)));
const files = readdirSync(srcDir).filter((f) => f.endsWith('.js')).map((f) => join(srcDir, f));
let failed = false;
for (const file of files) {
  try {
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
    console.log(`PASS\tsyntax\t${file}`);
  } catch (error) {
    console.log(`FAIL\tsyntax\t${file}`);
    console.error(error.stderr?.toString() || error.message);
    failed = true;
  }
}
if (failed) process.exitCode = 1;
