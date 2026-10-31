const CACHE_NAME = 'grace-pharma-v15-6-based-on-v15-5-firebase-manifest-sw-8am-2pm';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './logo.png',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
];

self.addEventListener('install', (e) => {
  console.log('SW Install V15.6 Based on V15.5 - Firebase+Manifest+SW - 8AM-2PM 2PM-9PM - 60-Day Alert - Expired Blocked');
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => 
      cache.addAll(ASSETS).catch(err => console.log('Cache fail', err))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.map(k => { 
        if (k !== CACHE_NAME) return caches.delete(k); 
      }))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = e.request.url;
  // Firebase requests - don't cache aggressively, always try network first
  if (url.includes('firestore') || url.includes('firebase') || url.includes('googleapis') || url.includes('gstatic')) {
    e.respondWith(
      fetch(e.request)
        .then(res => res)
        .catch(() => caches.match(e.request))
    );
    return;
  }
  // App assets - cache first
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(fetchRes => {
        return caches.open(CACHE_NAME).then(cache => {
          if (e.request.method === 'GET' && url.startsWith('http')) {
            cache.put(e.request, fetchRes.clone());
          }
          return fetchRes;
        });
      });
    }).catch(() => {
      if (e.request.destination === 'document') {
        return caches.match('./index.html');
      }
    })
  );
});
