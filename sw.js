const CACHE = 'learning-platform-shell-v1';
const ASSETS = [
  './',
  './index.html',
  './feedback.html',
  './manifest.webmanifest',
  './icon.svg',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png',
  './src/registerServiceWorker.js',
  './src/app.js',
  './src/config.js',
  './src/logic/exam.js',
  './src/logic/questionBank.js',
  './src/storage/interface.js',
  './src/storage/browser.js',
  './src/storage/api.js',
  './src/storage/identity.js',
  './src/state/migrate.js',
  './src/content/runtimeBundle.js',
  './data/migrations/sdaia-generated-v2-question-ids.json',
  './tracks/sdaia-ai-engineer/manifest.json',
  './tracks/sdaia-ai-engineer/exam-profiles/project-reference-v1.json'
];

self.addEventListener('install', event => event.waitUntil(
  caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
));

self.addEventListener('activate', event => event.waitUntil(
  caches.keys()
    .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
    .then(() => self.clients.claim())
));

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        if (event.request.mode === 'navigate') return caches.match('./index.html');
        return Response.error();
      })
  );
});
