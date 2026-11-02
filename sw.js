const CACHE_NAME = 'grace-pharmacy-v16-1-single-rate-daily-report-auto-clear';
const urlsToCache = [
  './',
  './index.html',
  './logo.png',
  './manifest.json'
];

self.addEventListener('install', event => {
  console.log('SW V16.1 Installing - Single Rate Place');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('SW V16.1 Activating');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).catch(() => {
          // لو offline وما لقيناها في الكاش
          if (event.request.destination === 'document') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
