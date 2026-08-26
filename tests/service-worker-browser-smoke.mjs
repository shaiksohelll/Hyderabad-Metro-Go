import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const root = fileURLToPath(new URL('../', import.meta.url));
const base = '/Hyderabad-Metro-Go/';
const server = createServer(async (request, response) => {
  const requestPath = request.url?.split('?')[0] || '/';
  if (!requestPath.startsWith(base)) { response.writeHead(404); response.end(); return; }
  const relative = requestPath.slice(base.length) || 'index.html';
  const safe = relative.includes('..') ? '404.html' : relative;
  try {
    const body = await readFile(join(root, safe));
    const contentType = safe.endsWith('.js') ? 'text/javascript' : safe.endsWith('.css') ? 'text/css' : safe.endsWith('.json') ? 'application/json' : 'text/html';
    response.writeHead(200, { 'content-type': contentType });
    response.end(body);
  } catch { response.writeHead(404); response.end('not found'); }
});
await new Promise((resolve) => server.listen(4178, '127.0.0.1', resolve));

const chromium = process.env.CHROMIUM || 'chromium';
const port = 9268;
const profile = join(tmpdir(), `hmg-service-worker-browser-${process.pid}`);
await rm(profile, { recursive: true, force: true });
const browser = spawn(chromium, ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--disable-setuid-sandbox', '--remote-debugging-address=127.0.0.1', `--window-size=390,844`, `--remote-debugging-port=${port}`, '--remote-allow-origins=*', `--user-data-dir=${profile}`, `http://127.0.0.1:4178${base}`], { stdio: 'ignore' });
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const checks = [];
const check = (name, condition) => checks.push({ name, ok: Boolean(condition) });
try {
  let tabs = [];
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try { tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); if (tabs.length) break; } catch {}
    await sleep(400);
  }
  if (!tabs.length) throw new Error('Chromium remote debugger did not start');
  const socket = new WebSocket(tabs.find((tab) => tab.type === 'page')?.webSocketDebuggerUrl || tabs[0].webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let id = 0;
  const cdp = (method, params = {}) => new Promise((resolve) => {
    const requestId = ++id;
    const listener = (event) => { const message = JSON.parse(event.data); if (message.id === requestId) { socket.removeEventListener('message', listener); resolve(message.result); } };
    socket.addEventListener('message', listener);
    socket.send(JSON.stringify({ id: requestId, method, params }));
  });
  const evaluate = async (expression) => (await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result?.value;
  const waitFor = async (expression, timeout = 10000) => {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      if (await evaluate(expression)) return true;
      await sleep(200);
    }
    return false;
  };
  await cdp('Runtime.enable');
  await cdp('Page.enable');
  check('service worker controls the app before going offline', await waitFor("navigator.serviceWorker.controller && document.querySelector('#from-station')"));
  check('service worker is ready before going offline', await evaluate("navigator.serviceWorker.ready.then(() => true)"));
  server.close();
  await sleep(300);
  await cdp('Page.navigate', { url: `http://127.0.0.1:4178${base}` });
  check('offline navigation returns the cached application shell', await waitFor("location.pathname === '/Hyderabad-Metro-Go/' && document.querySelector('#from-station') && document.querySelector('link[rel=\"stylesheet\"]')"));
  const failedAsset = await evaluate("fetch('/Hyderabad-Metro-Go/offline-missing.json').then(async (response) => ({ resolved: true, status: response.status, contentType: response.headers.get('content-type'), body: await response.text() })).catch((error) => ({ resolved: false, name: error.name, message: error.message }))");
  check('offline uncached JSON remains a network failure, not HTML', failedAsset?.resolved === false && failedAsset?.name === 'TypeError');
  const failedScript = await evaluate("fetch('/Hyderabad-Metro-Go/offline-missing.js').then(async (response) => ({ resolved: true, status: response.status, contentType: response.headers.get('content-type'), body: await response.text() })).catch((error) => ({ resolved: false, name: error.name }))");
  check('offline uncached JavaScript remains a network failure, not HTML', failedScript?.resolved === false && failedScript?.name === 'TypeError');
  for (const result of checks) console.log(`${result.ok ? 'PASS' : 'FAIL'}\t${result.name}`);
  if (checks.some((result) => !result.ok)) process.exitCode = 1;
  socket.close();
} finally {
  browser.kill('SIGKILL');
  server.close();
  await sleep(300);
  try { await rm(profile, { recursive: true, force: true }); } catch {}
}
