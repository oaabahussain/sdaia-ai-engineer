const CACHE = 'sdaia-ai-pages-v6';
const ASSETS = [
  './', './index.html', './manifest.webmanifest', './icon.svg', './icon-180.png', './icon-192.png', './icon-512.png',
  './src/app.js', './src/config.js', './src/logic/mastery.js', './src/logic/readiness.js', './src/logic/review.js', './src/logic/mission.js',
  './src/storage/interface.js', './src/storage/browser.js', './src/storage/api.js',
  './data/questions.json', './data/sessions.json', './data/learn.json', './data/cases.json', './data/weights.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(fetch(event.request)
    .then((response) => {
      if (response && response.ok) {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy));
      }
      return response;
    })
    .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html'))));
});
