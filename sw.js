const CACHE_NAME = 'grace-pro-v13-2';
const CORE_ASSETS = ['./','./index.html','./logo.png','./manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(CORE_ASSETS).catch(()=>{})));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('firestore.googleapis.com') || e.request.url.includes('firebase')) return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok) { const clone = res.clone(); caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone)); }
      return res;
    }).catch(() => caches.match(e.request).then(c => c || caches.match('./index.html')))
  );
});
