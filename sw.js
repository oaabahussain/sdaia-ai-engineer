const CACHE='sdaia-ai-pages-v4-1';
const ASSETS=['./','./index.html','./parts/app.gz.b64.part-00','./parts/app.gz.b64.part-01','./parts/app.gz.b64.part-02','./parts/app.gz.b64.part-03','./parts/app.gz.b64.part-04','./parts/app.gz.b64.part-05','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);if(u.origin!==self.location.origin)return;e.respondWith(caches.match(e.request).then(cached=>{const network=fetch(e.request).then(r=>{if(r&&r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}return r}).catch(()=>cached||caches.match('./index.html'));return cached||network;}));});
