const CACHE_NAME = 'grace-pharmacy-v16-pro-auto-rate-monthly-chart-daily-search';
const urlsToCache = ['./','./index.html','./manifest.json','./logo.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
  self.skipWaiting();
});
self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request).then(r=>r||fetch(event.request)));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>{ if(k!==CACHE_NAME) return caches.delete(k); }))));
  self.clients.claim();
});
