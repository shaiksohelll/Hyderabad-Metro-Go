import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../sw.js', import.meta.url), 'utf8');
const listeners = new Map();
const cacheState = new Map([['/Hyderabad-Metro-Go/index.html', { url: '/Hyderabad-Metro-Go/index.html', type: 'basic', body: '<html>offline shell</html>' }]]);
let dynamicPuts = 0;
const cache = {
  addAll: async () => {},
  match: async (request) => cacheState.get(typeof request === 'string' ? request : request.url),
  put: async () => { dynamicPuts += 1; },
};
const caches = {
  open: async () => cache,
  match: cache.match,
  keys: async () => ['hmg-shell-v2', 'hmg-shell-v3'],
  delete: async () => true,
};
const context = {
  console,
  URL,
  caches,
  fetch: async () => { throw new Error('offline'); },
  self: {
    location: { origin: 'https://example.test' },
    addEventListener: (type, handler) => listeners.set(type, handler),
    skipWaiting: () => {},
    clients: { claim: async () => {} },
  },
};
vm.runInNewContext(source, context, { filename: 'sw.js' });
const checks = [];
const check = (name, condition) => checks.push({ name, ok: Boolean(condition) });

async function dispatch(request) {
  const event = { request, response: null, respondWith(value) { this.response = Promise.resolve(value); } };
  await listeners.get('fetch')(event);
  return event;
}

const navigation = await dispatch({ method: 'GET', mode: 'navigate', url: 'https://example.test/Hyderabad-Metro-Go/plan' });
check('offline navigation returns cached HTML shell', (await navigation.response)?.url === '/Hyderabad-Metro-Go/index.html');

const failedScript = await dispatch({ method: 'GET', mode: 'script', url: 'https://example.test/Hyderabad-Metro-Go/src/app.js' });
let scriptRejected = false;
try { await failedScript.response; } catch (error) { scriptRejected = error.message === 'offline'; }
check('offline JavaScript failure is not replaced with HTML', scriptRejected);

const failedCss = await dispatch({ method: 'GET', mode: 'style', url: 'https://example.test/Hyderabad-Metro-Go/src/styles.css' });
let cssRejected = false;
try { await failedCss.response; } catch (error) { cssRejected = error.message === 'offline'; }
check('offline CSS failure is not replaced with HTML', cssRejected);

const failedJson = await dispatch({ method: 'GET', mode: 'cors', url: 'https://example.test/Hyderabad-Metro-Go/data.json' });
let jsonRejected = false;
try { await failedJson.response; } catch (error) { jsonRejected = error.message === 'offline'; }
check('offline JSON failure is not replaced with HTML', jsonRejected);

context.fetch = async () => ({ clone: () => ({}) });
const successfulAsset = await dispatch({ method: 'GET', mode: 'script', url: 'https://example.test/Hyderabad-Metro-Go/src/new.js' });
await successfulAsset.response;
check('successful non-navigation GET is not dynamically cached', dynamicPuts === 0);

const external = await dispatch({ method: 'GET', mode: 'cors', url: 'https://cdn.example.test/library.js' });
check('external request is outside service-worker scope', external.response === null);

for (const result of checks) console.log(`${result.ok ? 'PASS' : 'FAIL'}\t${result.name}`);
if (checks.some((result) => !result.ok)) process.exit(1);
