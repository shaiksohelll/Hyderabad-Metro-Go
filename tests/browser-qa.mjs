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

async function runViewport(width, height, port) {
  const chromium = process.env.CHROMIUM || 'chromium';
  const browser = spawn(chromium, ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--disable-setuid-sandbox', '--remote-debugging-address=127.0.0.1', `--window-size=${width},${height}`, `--remote-debugging-port=${port}`, '--remote-allow-origins=*', `--user-data-dir=/tmp/hmg-browser-qa-${port}`, `http://127.0.0.1:4176${base}`], { stdio: 'ignore' });
  try {
    let tabs = [];
    for (let attempt = 0; attempt < 30; attempt += 1) {
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
    const waitFor = async (expression, timeout = 6000) => {
      const deadline = Date.now() + timeout;
      while (Date.now() < deadline) {
        if (await evaluate(expression)) return true;
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return false;
    };
    await cdp('Page.enable');
    await cdp('Runtime.enable');
    await cdp('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false, screenWidth: width, screenHeight: height });
    await waitFor(`window.innerWidth === ${width} && window.innerHeight === ${height}`);
    const viewport = await evaluate('({ width: window.innerWidth, height: window.innerHeight })');
    check(`${width}x${height}: exact inner viewport`, viewport?.width === width && viewport?.height === height);
    await waitFor("document.querySelector('h1') && document.querySelector('[data-nav=\"settings\"]')");
    const initial = await evaluate("({overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1, h1: document.querySelectorAll('h1').length === 1, current: [...document.querySelectorAll('[aria-current=page]')].filter((element) => !element.closest('[hidden]')).length === 1, buttons: [...document.querySelectorAll('button')].every((b) => Boolean(b.textContent.trim() || b.getAttribute('aria-label'))), selects: [...document.querySelectorAll('select')].every((s) => Boolean(s.closest('label'))), landmarks: Boolean(document.querySelector('main') && document.querySelector('nav')), skip: Boolean(document.querySelector('.skip-link'))})");
    for (const [name, ok] of Object.entries(initial)) check(`${width}x${height}: ${name}`, name === 'overflow' ? !ok : ok);

    await cdp('Emulation.setPageScaleFactor', { pageScaleFactor: 2 });
    await waitFor('visualViewport.scale >= 2');
    check(`${width}x${height}: native browser zoom scale`, (await evaluate('visualViewport.scale')) >= 2);
    check(`${width}x${height}: zoomed page reflows without overflow`, await evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1'));
    check(`${width}x${height}: zoomed controls have readable boxes`, await evaluate("[...document.querySelectorAll('button, select, input, a[href]')].filter((element) => !element.closest('[hidden]') && getComputedStyle(element).display !== 'none' && element.getClientRects().length > 0).every((element) => { const rect = element.getBoundingClientRect(); return rect.width > 0 && rect.height > 0 && getComputedStyle(element).visibility !== 'hidden'; })"));

    await evaluate("document.querySelector('#from-station').value='miyapur'; document.querySelector('#to-station').value='raidurg'; document.querySelector('#planner-form').requestSubmit();");
    await waitFor("document.querySelector('.stage-start') && document.body.textContent.includes('toward L B Nagar')");
    check(`${width}x${height}: zoomed route stages readable`, await evaluate("[...document.querySelectorAll('.route-stage')].length >= 3 && [...document.querySelectorAll('.route-stage')].every((stage) => stage.getBoundingClientRect().width > 0 && stage.getBoundingClientRect().height > 0 && stage.textContent.trim())"));
    await evaluate("document.querySelector('.route-stage')?.click()");
    await waitFor("document.activeElement?.classList.contains('stage-detail')");
    check(`${width}x${height}: zoomed route stage operable`, await evaluate("document.activeElement?.classList.contains('stage-detail') && document.querySelector('.stage-detail')?.getBoundingClientRect().height > 0"));
    await evaluate("document.querySelector('[data-action=\"show-sources\"]')?.click()");
    await waitFor("!document.querySelector('#source-dialog').hidden");
    check(`${width}x${height}: zoomed dialog readable`, await evaluate("!document.querySelector('#source-dialog').hidden && document.querySelector('.dialog-surface')?.getBoundingClientRect().height > 0 && document.querySelector('.dialog-close')?.getBoundingClientRect().width > 0"));
    await evaluate("document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))");
    check(`${width}x${height}: zoomed dialog operable`, await evaluate("document.querySelector('#source-dialog').hidden"));
    await evaluate("document.querySelector('#from-station').value='miyapur'; document.querySelector('#to-station').value='miyapur'; document.querySelector('#planner-form').requestSubmit();");
    await waitFor("document.activeElement?.id === 'planner-error'");
    check(`${width}x${height}: zoomed error readable and focused`, await evaluate("document.activeElement?.id === 'planner-error' && document.querySelector('#planner-error')?.getBoundingClientRect().height > 0 && document.querySelector('#planner-error')?.textContent.trim()"));
    await cdp('Emulation.setPageScaleFactor', { pageScaleFactor: 1 });
    socket.close();
  } finally { browser.kill(); }
}

try {
  await runViewport(390, 844, 9240);
  await runViewport(768, 1024, 9241);
  await runViewport(1440, 900, 9242);
  for (const result of checks) console.log(`${result.ok ? 'PASS' : 'FAIL'}\t${result.name}`);
  if (checks.some((result) => !result.ok)) process.exitCode = 1;
} finally { server.close(); }
