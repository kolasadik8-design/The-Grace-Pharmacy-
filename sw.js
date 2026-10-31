const CACHE_NAME = 'grace-pharma-v15-6-professional-english';
const ASSETS = ['./','./index.html','./manifest.json','./logo.png','https://cdn.tailwindcss.com','https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'];
self.addEventListener('install', (e) => {
  console.log('SW Install V15.6 Professional');
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS).catch(err => console.log('Cache fail', err))));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => { if (k !== CACHE_NAME) return caches.delete(k); }))));
  self.clients.claim();
});
self.addEventListener('fetch', (e) => {
  const url = e.request.url;
  if (url.includes('firestore') || url.includes('firebase') || url.includes('googleapis') || url.includes('gstatic')) {
    e.respondWith(fetch(e.request).then(res => res).catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached => {
    if (cached) return cached;
    return fetch(e.request).then(fetchRes => {
      return caches.open(CACHE_NAME).then(cache => {
        if (e.request.method === 'GET' && url.startsWith('http')) { cache.put(e.request, fetchRes.clone()); }
        return fetchRes;
      });
    });
  }).catch(() => { if (e.request.destination === 'document') return caches.match('./index.html'); }));
});
