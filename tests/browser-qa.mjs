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
await new Promise((resolve) => server.listen(4176, '127.0.0.1', resolve));
const checks = [];
const check = (name, condition) => checks.push({ name, ok: Boolean(condition) });

async function runViewport(width, port) {
  const chromium = process.env.CHROMIUM || 'chromium';
  const browser = spawn(chromium, ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--disable-setuid-sandbox', '--remote-debugging-address=127.0.0.1', `--window-size=${width},900`, `--remote-debugging-port=${port}`, '--remote-allow-origins=*', `--user-data-dir=/tmp/hmg-browser-qa-${port}`, `http://127.0.0.1:4176${base}`], { stdio: 'ignore' });
  try {
    let tabs = [];
    for (let attempt = 0; attempt < 20; attempt += 1) {
      try { tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); if (tabs.length) break; } catch {}
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
    if (!tabs.length) throw new Error(`Chromium remote debugger did not start on port ${port}`);
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
    const initial = await evaluate("({width: window.innerWidth, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1, h1: document.querySelectorAll('h1').length === 1, current: [...document.querySelectorAll('[aria-current=page]')].filter((element) => !element.closest('[hidden]')).length === 1, buttons: [...document.querySelectorAll('button')].every((b) => Boolean(b.textContent.trim() || b.getAttribute('aria-label'))), selects: [...document.querySelectorAll('select')].every((s) => Boolean(s.closest('label'))), landmarks: Boolean(document.querySelector('main') && document.querySelector('nav')), skip: Boolean(document.querySelector('.skip-link'))})");
    for (const [name, ok] of Object.entries(initial)) { if (name !== 'width') check(`${width}: ${name}`, name === 'overflow' ? !ok : ok); }
    await evaluate("document.querySelector('[data-nav=\"settings\"]')?.click()"); await new Promise((resolve) => setTimeout(resolve, 80));
    await evaluate("document.querySelector('[data-action=\"toggle-locale\"]')?.click()"); await new Promise((resolve) => setTimeout(resolve, 80));
    check(`${width}: Telugu locale`, await evaluate("document.documentElement.lang === 'te'"));
    await evaluate("document.querySelector('[data-action=\"toggle-theme\"]')?.click(); document.querySelector('[data-pref=\"highContrast\"]')?.click(); document.querySelector('[data-pref=\"reducedMotion\"]')?.click()"); await new Promise((resolve) => setTimeout(resolve, 80));
    check(`${width}: dark theme`, await evaluate("document.documentElement.dataset.theme === 'dark'"));
    check(`${width}: high contrast`, await evaluate("document.documentElement.dataset.contrast === 'high'"));
    check(`${width}: reduced motion`, await evaluate("document.documentElement.dataset.motion === 'reduced'"));
    await evaluate("document.documentElement.style.fontSize='200%'"); await new Promise((resolve) => setTimeout(resolve, 80));
    check(`${width}: 200% text no horizontal overflow`, await evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1"));
    socket.close();
  } finally { browser.kill(); }
}

try {
  await runViewport(390, 9240);
  await runViewport(768, 9241);
  await runViewport(1440, 9242);
  for (const result of checks) console.log(`${result.ok ? 'PASS' : 'FAIL'}\\t${result.name}`);
  if (checks.some((result) => !result.ok)) process.exitCode = 1;
} finally { server.close(); }
