const CACHE_NAME = 'grace-pharma-v15-5-shift-reports';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './logo.png',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
];

self.addEventListener('install', (e) => {
  console.log('SW Install V15.5 Shifts');
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS).catch(err => console.log('Cache fail', err));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys.map(k => {
        if (k !== CACHE_NAME) return caches.delete(k);
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = e.request.url;
  // Firebase / Google APIs -> Network first, fallback to cache
  if (url.includes('firestore') || url.includes('firebase') || url.includes('googleapis') || url.includes('gstatic')) {
    e.respondWith(
      fetch(e.request).then(res => {
        // Cache successful firestore? No, skip
        return res;
      }).catch(() => {
        return caches.match(e.request);
      })
    );
    return;
  }
  // App files -> Cache first, then network
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(fetchRes => {
        return caches.open(CACHE_NAME).then(cache => {
          // Only cache GET and http(s)
          if (e.request.method === 'GET' && url.startsWith('http')) {
            cache.put(e.request, fetchRes.clone());
          }
          return fetchRes;
        });
      });
    }).catch(() => {
      // Offline fallback to index.html
      if (e.request.destination === 'document') {
        return caches.match('./index.html');
      }
    })
  );
});
