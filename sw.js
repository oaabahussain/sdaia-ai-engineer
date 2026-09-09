const CACHE = 'sdaia-ai-pages-v8';
const ASSETS = [
  './','./index.html','./feedback.html','./manifest.webmanifest','./icon.svg','./icon-180.png','./icon-192.png','./icon-512.png',
  './src/app.js','./src/config.js','./src/logic/exam.js','./src/logic/questionBank.js','./src/logic/conceptFiles.js','./src/storage/interface.js','./src/storage/browser.js','./src/storage/api.js',
  './data/concepts/data-ml.json','./data/concepts/core-ai.json','./data/concepts/ai-software-engineering.json','./data/concepts/mlops-llmops.json','./data/concepts/architecture-infrastructure.json','./data/concepts/responsible-ai-security-governance.json','./data/concepts/business-professional-practice.json','./data/sessions.json','./data/learn.json','./data/cases.json','./data/weights.json'
];
self.addEventListener('install', event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate', event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch', event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url); if(url.origin!==self.location.origin)return;
  event.respondWith(fetch(event.request).then(response=>{if(response&&response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put(event.request,copy))}return response}).catch(()=>caches.match(event.request).then(cached=>cached||caches.match('./index.html'))));
});
