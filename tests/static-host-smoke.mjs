import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, normalize } from 'node:path';

const root = new URL('../', import.meta.url).pathname;
const base = '/Hyderabad-Metro-Go/';
const files = new Map([
  ['', 'index.html'],
  ['index.html', 'index.html'],
  ['404.html', '404.html'],
  ['manifest.json', 'manifest.json'],
  ['sw.js', 'sw.js'],
  ['src/app.js', 'src/app.js'],
  ['src/config.js', 'src/config.js'],
  ['src/styles.css', 'src/styles.css'],
]);

const server = createServer(async (request, response) => {
  const path = request.url?.split('?')[0] || '/';
  if (!path.startsWith(base)) { response.writeHead(404); response.end(); return; }
  const relative = path.slice(base.length);
  const file = files.get(relative);
  try {
    const body = await readFile(join(root, file || '404.html'));
    const contentType = (file || '404.html').endsWith('.js') ? 'text/javascript' : (file || '').endsWith('.css') ? 'text/css' : 'text/html';
    response.writeHead(file ? 200 : 404, { 'content-type': contentType });
    response.end(body);
  } catch {
    response.writeHead(500); response.end();
  }
});

await new Promise((resolve) => server.listen(4174, '127.0.0.1', resolve));
try {
  const checks = [];
  async function check(path, expected, predicate = (text) => text.includes(expected)) {
    const response = await fetch(`http://127.0.0.1:4174${base}${path}`);
    const text = await response.text();
    const ok = predicate(text) && response.status === (path === 'plan' || path === 'stations/ameerpet' ? 404 : 200);
    checks.push({ path, ok, status: response.status });
  }
  await check('', '/Hyderabad-Metro-Go/src/app.js');
  await check('src/app.js', "import { appBasePath", (text) => text.includes("import { appBasePath"));
  await check('manifest.json', '"scope": "/Hyderabad-Metro-Go/"');
  await check('sw.js', "const BASE = '/Hyderabad-Metro-Go/';");
  await check('plan', '/Hyderabad-Metro-Go/src/app.js');
  await check('stations/ameerpet', '/Hyderabad-Metro-Go/src/app.js');
  for (const result of checks) console.log(`${result.ok ? 'PASS' : 'FAIL'}\tstatic-host\t${result.path}\t${result.status}`);
  if (checks.some((result) => !result.ok)) process.exitCode = 1;
} finally {
  server.close();
}
