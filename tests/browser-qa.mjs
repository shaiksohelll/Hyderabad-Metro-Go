import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
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
  const browser = spawn(chromium, ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--disable-setuid-sandbox', '--remote-debugging-address=127.0.0.1', `--window-size=${width},${height}`, `--remote-debugging-port=${port}`, '--remote-allow-origins=*', `--user-data-dir=${join(tmpdir(), `hmg-browser-qa-${port}-${process.pid}`)}`, `http://127.0.0.1:4176${base}`], { stdio: 'ignore' });
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
    const evaluate = async (expression) => (await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result?.value;
    const waitFor = async (expression, timeout = 7000) => {
      const deadline = Date.now() + timeout;
      while (Date.now() < deadline) {
        if (await evaluate(expression)) return true;
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return false;
    };
    const navigate = async (path = '') => {
      await cdp('Page.navigate', { url: `http://127.0.0.1:4176${base}${path}` });
      await waitFor("document.querySelector('h1') && document.querySelector('[data-nav=\"settings\"]')");
      await waitFor(`window.innerWidth === ${width} && window.innerHeight === ${height}`);
    };
    const mapGeometryExpression = "(() => { const svg = document.querySelector('.network-map'); const padding = 72; const width = 1280; const height = 720; const points = [...svg.querySelectorAll('circle')].map((node) => node.getBBox()); const stationLabels = [...svg.querySelectorAll('.map-label')].map((node) => node.getBBox()); const legendLabels = [...svg.querySelectorAll('.map-legend-label')].map((node) => node.getBBox()); const inside = (box) => box.x >= padding && box.y >= padding && box.x + box.width <= width - padding && box.y + box.height <= height - padding; const overlap = (a, b) => a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y; const allLabels = stationLabels.concat(legendLabels); return { pointsInside: points.every(inside), stationLabelCount: stationLabels.length, stationLabelsInside: stationLabels.every(inside), stationLabelsVisible: stationLabels.every((box) => box.width > 0 && box.height > 0), stationLabelsNoCollision: stationLabels.every((box, index) => stationLabels.slice(index + 1).every((other) => !overlap(box, other))), legendLabelCount: legendLabels.length, legendLabelsInside: legendLabels.every(inside), legendLabelsVisible: legendLabels.every((box) => box.width > 0 && box.height > 0), legendLabelsNoCollision: legendLabels.every((box, index) => legendLabels.slice(index + 1).every((other) => !overlap(box, other))) }; })()";
    const visibleElements = "[...document.querySelectorAll('button, select, input, a[href]')].filter((element) => !element.closest('[hidden]') && getComputedStyle(element).display !== 'none' && element.getClientRects().length > 0)";
    await cdp('Page.enable');
    await cdp('Runtime.enable');
    await cdp('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false, screenWidth: width, screenHeight: height });
    await navigate();
    const viewport = await evaluate('({ width: window.innerWidth, height: window.innerHeight, dpr: devicePixelRatio })');
    check(`${width}x${height}: exact inner viewport`, viewport?.width === width && viewport?.height === height);
    const resources = await evaluate("performance.getEntriesByType('resource').map((entry) => entry.name)");
    check(`${width}x${height}: README command loads planner CSS JS manifest`, resources.some((url) => url.endsWith('/src/app.js')) && resources.some((url) => url.endsWith('/src/styles.css')) && resources.some((url) => url.endsWith('/manifest.json')) && Boolean(await evaluate("document.querySelector('#from-station') && document.querySelector('link[rel=\"stylesheet\"]') && document.querySelector('link[rel=\"manifest\"]')")));
    const initial = await evaluate("({overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1, h1: document.querySelectorAll('h1').length === 1, current: [...document.querySelectorAll('[aria-current=page]')].filter((element) => !element.closest('[hidden]')).length === 1, buttons: [...document.querySelectorAll('button')].every((b) => Boolean(b.textContent.trim() || b.getAttribute('aria-label'))), selects: [...document.querySelectorAll('select')].every((s) => Boolean(s.closest('label'))), landmarks: Boolean(document.querySelector('main') && document.querySelector('nav')), skip: Boolean(document.querySelector('.skip-link'))})");
    for (const [name, ok] of Object.entries(initial)) check(`${width}x${height}: ${name}`, name === 'overflow' ? !ok : ok);

    const englishGeometry = await evaluate(mapGeometryExpression);
    check(`${width}x${height}: actual SVG station points stay within padded bounds`, englishGeometry?.pointsInside);
    check(`${width}x${height}: English station-label count is greater than zero`, englishGeometry?.stationLabelCount > 0);
    check(`${width}x${height}: English station labels are visible, padded, and collision-safe`, englishGeometry?.stationLabelsInside && englishGeometry?.stationLabelsVisible && englishGeometry?.stationLabelsNoCollision);
    check(`${width}x${height}: legend labels are visible, padded, and collision-safe`, englishGeometry?.legendLabelCount === 3 && englishGeometry?.legendLabelsInside && englishGeometry?.legendLabelsVisible && englishGeometry?.legendLabelsNoCollision);
    check(`${width}x${height}: line codes and non-color patterns are present`, await evaluate("document.querySelectorAll('[data-line-code]').length === 3 && [...document.querySelectorAll('[data-line-code]')].every((line) => line.getAttribute('stroke-dasharray') !== null)"));
    const englishAlternative = await evaluate("document.querySelector('.text-alternative')?.textContent || ''");
    await evaluate("document.querySelector('[data-action=\"toggle-locale\"]')?.click()");
    await waitFor("document.documentElement.lang === 'te'");
    const teluguGeometry = await evaluate(mapGeometryExpression);
    check(`${width}x${height}: Telugu SVG station-label count is exactly zero by design`, teluguGeometry?.stationLabelCount === 0);
    check(`${width}x${height}: three legend labels remain visible and geometrically valid in Telugu`, teluguGeometry?.legendLabelCount === 3 && teluguGeometry?.legendLabelsInside && teluguGeometry?.legendLabelsVisible && teluguGeometry?.legendLabelsNoCollision);
    const teluguAlternative = await evaluate("document.querySelector('.text-alternative')?.textContent || ''");
    check(`${width}x${height}: Telugu textual alternative differs from English`, teluguAlternative !== englishAlternative && teluguAlternative.length > 0);
    check(`${width}x${height}: Telugu textual alternative contains all 57 modeled stations`, await evaluate("(() => { const alt = document.querySelector('.text-alternative')?.textContent || ''; const allIds = Object.keys(window.__hmgStations || {}); if (!allIds.length) { const selects = document.querySelectorAll('#from-station option[value]'); const ids = [...selects].map(o => o.value).filter(Boolean); return ids.length === 57 && ids.every(id => { const opt = document.querySelector(`#from-station option[value='${id}']`); return opt && alt.includes(opt.textContent); }); } return false; })()"));
    await evaluate("document.querySelector('[data-action=\"toggle-locale\"]')?.click()");
    await waitFor("document.documentElement.lang === 'en'");

    const desktopModeBeforeReflow = await evaluate("getComputedStyle(document.querySelector('.primary-nav')).display !== 'none'");
    const reflowWidth = Math.max(180, Math.floor(width / 2));
    const reflowHeight = Math.max(240, Math.floor(height / 2));
    await cdp('Emulation.setDeviceMetricsOverride', { width: reflowWidth, height: reflowHeight, deviceScaleFactor: 2, mobile: false, screenWidth: width, screenHeight: height });
    await waitFor(`window.innerWidth === ${reflowWidth} && window.innerHeight === ${reflowHeight}`);
    const reflowViewport = await evaluate('({ width: window.innerWidth, height: window.innerHeight, dpr: devicePixelRatio })');
    check(`${width}x${height}: documented 200%-equivalent reflow changes effective CSS viewport`, reflowViewport?.width === reflowWidth && reflowViewport?.height === reflowHeight && reflowViewport?.dpr === 2);
    check(`${width}x${height}: effective-CSS reflow has no horizontal document overflow`, await evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1'));
    check(`${width}x${height}: reflowed controls are visible and operable`, await evaluate(`${visibleElements}.every((element) => { const rect = element.getBoundingClientRect(); return rect.width > 0 && rect.height > 0 && getComputedStyle(element).visibility !== 'hidden'; })`));
    const desktopModeAfterReflow = await evaluate("getComputedStyle(document.querySelector('.primary-nav')).display !== 'none'");
    if (width >= 980) check(`${width}x${height}: effective-CSS reflow crosses responsive breakpoint`, desktopModeBeforeReflow && !desktopModeAfterReflow);

    await evaluate("document.querySelector('#from-station').value='miyapur'; document.querySelector('#to-station').value='raidurg'; document.querySelector('#planner-form').requestSubmit();");
    await waitFor("document.querySelector('.stage-start') && document.body.textContent.includes('toward L B Nagar')");
    check(`${width}x${height}: reflowed route stages remain readable`, await evaluate("[...document.querySelectorAll('.route-stage')].length >= 3 && [...document.querySelectorAll('.route-stage')].every((stage) => stage.getBoundingClientRect().width > 0 && stage.getBoundingClientRect().height > 0 && stage.textContent.trim())"));
    await evaluate("document.querySelector('.route-stage')?.focus(); document.querySelector('.route-stage')?.click()");
    await waitFor("document.activeElement?.classList.contains('stage-detail')");
    check(`${width}x${height}: reflowed route stage is keyboard-operable`, await evaluate("document.activeElement?.classList.contains('stage-detail') && document.querySelector('.stage-detail')?.getBoundingClientRect().height > 0"));
    await evaluate("document.querySelector('[data-action=\"show-sources\"]')?.click()");
    await waitFor("!document.querySelector('#source-dialog').hidden");
    check(`${width}x${height}: reflowed dialog fits and is readable`, await evaluate("(() => { const box = document.querySelector('.dialog-surface').getBoundingClientRect(); return !document.querySelector('#source-dialog').hidden && box.width > 0 && box.height > 0 && box.left >= 0 && box.right <= innerWidth && box.top >= 0 && box.bottom <= innerHeight; })()"));
    await evaluate("document.querySelector('.dialog-close')?.focus(); document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))");
    check(`${width}x${height}: reflowed dialog Escape operation closes it`, await evaluate("document.querySelector('#source-dialog').hidden"));
    await evaluate("document.querySelector('#from-station').value='miyapur'; document.querySelector('#to-station').value='miyapur'; document.querySelector('#planner-form').requestSubmit();");
    await waitFor("document.activeElement?.id === 'planner-error'");
    check(`${width}x${height}: reflowed error remains readable and focused`, await evaluate("document.activeElement?.id === 'planner-error' && document.querySelector('#planner-error')?.getBoundingClientRect().height > 0 && document.querySelector('#planner-error')?.textContent.trim()"));
    await cdp('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false, screenWidth: width, screenHeight: height });
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
