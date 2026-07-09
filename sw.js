/* HELL MONEY — minimal offline shell cache.
   Only caches the static app shell, not any real data — the mock/live
   data logic in js/app.js and js/api.js is untouched by this file. */

const CACHE = 'hellmoney-shell-v1';
const SHELL = [
  './',
  './index.html',
  './css/styles.css',
  './js/mockData.js',
  './js/api.js',
  './js/app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle same-origin GET requests for the app shell.
  // Everything else (CDN scripts, future API calls) passes straight through.
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== location.origin) return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
