import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('../', import.meta.url).pathname;
const base = '/Hyderabad-Metro-Go/';
const server = createServer(async (request, response) => {
  const requestPath = request.url?.split('?')[0] || '/';
  if (!requestPath.startsWith(base)) { response.writeHead(404); response.end(); return; }
  const relative = requestPath.slice(base.length) || 'index.html';
  const safe = relative.includes('..') ? '404.html' : relative;
  let file = join(root, safe);
  try { await readFile(file); } catch { file = join(root, '404.html'); }
  try {
    const body = await readFile(file);
    response.writeHead(file.endsWith('404.html') && safe !== '404.html' ? 404 : 200, { 'content-type': file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : 'text/html' });
    response.end(body);
  } catch { response.writeHead(500); response.end(); }
});
await new Promise((resolve) => server.listen(4175, '127.0.0.1', resolve));
const chromium = process.env.CHROMIUM || 'chromium';
  const browser = spawn(chromium, ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--disable-setuid-sandbox', '--no-zygote', '--remote-debugging-address=127.0.0.1', '--remote-debugging-port=9238', '--remote-allow-origins=*', '--user-data-dir=/tmp/hmg-browser-test', `http://127.0.0.1:4175${base}`], { stdio: 'ignore' });
const checks = [];
const check = (name, condition) => checks.push({ name, ok: Boolean(condition) });
try {
  let tabs = [];
  for (let attempt = 0; attempt < 20; attempt += 1) {
    try { tabs = await (await fetch('http://127.0.0.1:9238/json')).json(); if (tabs.length) break; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
  if (!tabs.length) throw new Error('Chromium remote debugger did not start on port 9238');
  const page = tabs.find((tab) => tab.type === 'page' && tab.url.includes(base)) || tabs.find((tab) => tab.type === 'page') || tabs[0];
  const socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let id = 0;
  const cdp = (method, params = {}) => new Promise((resolve) => {
    const requestId = ++id;
    const listener = (event) => { const message = JSON.parse(event.data); if (message.id === requestId) { socket.removeEventListener('message', listener); resolve(message.result); } };
    socket.addEventListener('message', listener);
    socket.send(JSON.stringify({ id: requestId, method, params }));
  });
  const evaluate = async (expression) => (await cdp('Runtime.evaluate', { expression, returnByValue: true })).result?.value;
  await cdp('Runtime.enable');
  await evaluate("document.querySelector('#from-station').value='miyapur'; document.querySelector('#to-station').value='raidurg'; document.querySelector('#planner-form').requestSubmit();");
  await new Promise((resolve) => setTimeout(resolve, 250));
  check('route result renders', Boolean(await evaluate("document.querySelector('#result-heading')")));
  check('route has start stage', (await evaluate("document.querySelector('.stage-start')?.textContent.includes('Start at')")) === true);
  check('route uses named terminal', (await evaluate("document.body.textContent.includes('toward L B Nagar')")) === true);
  check('route has pending transfer notice', (await evaluate("document.body.textContent.includes('Transfer verification pending')")) === true);
  await evaluate("document.querySelector('.route-stage')?.click()"); await new Promise((resolve) => setTimeout(resolve, 80));
  check('route-stage detail receives focus', (await evaluate("document.activeElement?.classList.contains('stage-detail')")) === true);
  await evaluate("document.querySelector('[data-action=\\\"show-sources\\\"]')?.click()");
  check('source dialog opens', (await evaluate("!document.querySelector('#source-dialog').hidden")) === true);
  await evaluate("document.querySelector('.dialog-close')?.focus(); document.dispatchEvent(new KeyboardEvent('keydown',{key:'Tab',shiftKey:true,bubbles:true}))");
  check('dialog traps reverse tab', (await evaluate("document.activeElement?.closest('#source-dialog') === document.querySelector('#source-dialog')")) === true);
  await evaluate("document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))");
  check('Escape closes source dialog', (await evaluate("document.querySelector('#source-dialog').hidden")) === true);
  check('dialog restores trigger focus', (await evaluate("document.activeElement?.getAttribute('data-action') === 'show-sources'")) === true);
  await evaluate("document.querySelector('[data-nav=\\\"settings\\\"]')?.click()"); await new Promise((resolve) => setTimeout(resolve, 100));
  await evaluate("document.querySelector('[data-action=\\\"toggle-locale\\\"]')?.click(); if (document.documentElement.dataset.theme !== 'dark') document.querySelector('[data-action=\\\"toggle-theme\\\"]')?.click()"); await new Promise((resolve) => setTimeout(resolve, 100));
  check('rapid dispatch renders latest locale', (await evaluate("document.documentElement.lang === 'te'")) === true);
  check('rapid dispatch renders latest theme', (await evaluate("document.documentElement.dataset.theme === 'dark'")) === true);
  await evaluate("document.querySelector('[data-nav=\\\"home\\\"]')?.click()"); await new Promise((resolve) => setTimeout(resolve, 100));
  await evaluate("document.querySelector('#from-station').value='miyapur'; document.querySelector('#to-station').value='miyapur'; document.querySelector('#planner-form').requestSubmit();");
  await new Promise((resolve) => setTimeout(resolve, 250));
  check('planner error focuses alert', (await evaluate("document.activeElement?.id === 'planner-error'")) === true);
  for (const result of checks) console.log(`${result.ok ? 'PASS' : 'FAIL'}\\t${result.name}`);
  if (checks.some((result) => !result.ok)) process.exitCode = 1;
  socket.close();
} finally { browser.kill(); server.close(); }
