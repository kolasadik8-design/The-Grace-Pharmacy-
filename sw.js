const CACHE_NAME = 'grace-pharma-v15-4-fixed';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './logo.png',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js'
];

self.addEventListener('install', (e) => {
  console.log('SW Install V15.4');
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).catch(err => console.log('Cache fail', err))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => { if(k !== CACHE_NAME) return caches.delete(k); })))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Network first, then cache (for Firebase keep network)
  if(e.request.url.includes('firestore') || e.request.url.includes('firebase') || e.request.url.includes('googleapis')) {
    return e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
  }
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request).then(fetchRes => {
      return caches.open(CACHE_NAME).then(cache => {
        cache.put(e.request, fetchRes.clone());
        return fetchRes;
      });
    })).catch(() => caches.match('./index.html'))
  );
});
