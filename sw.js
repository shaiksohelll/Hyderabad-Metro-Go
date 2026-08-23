const CACHE = 'hmg-shell-v1';
const SHELL = ['/', '/index.html', '/src/app.js', '/src/data.js', '/src/route-engine.js', '/src/store.js', '/src/persistence.js', '/src/a11y.js', '/src/map-view.js', '/src/view.js', '/src/styles.css', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    const copy = response.clone();
    caches.open(CACHE).then((cache) => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match('/index.html'))));
});
