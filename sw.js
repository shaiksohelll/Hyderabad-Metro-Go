const BASE = '/Hyderabad-Metro-Go/';
const CACHE = 'hmg-shell-v2';
const SHELL = [
  `${BASE}`,
  `${BASE}index.html`,
  `${BASE}src/app.js`,
  `${BASE}src/config.js`,
  `${BASE}src/data.js`,
  `${BASE}src/route-engine.js`,
  `${BASE}src/store.js`,
  `${BASE}src/persistence.js`,
  `${BASE}src/a11y.js`,
  `${BASE}src/map-view.js`,
  `${BASE}src/router.js`,
  `${BASE}src/view.js`,
  `${BASE}src/styles.css`,
  `${BASE}manifest.json`,
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin || !requestUrl.pathname.startsWith(BASE)) return;
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    const copy = response.clone();
    caches.open(CACHE).then((cache) => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match(`${BASE}index.html`))));
});
