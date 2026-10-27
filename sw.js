// The Grace Pharmacy - Service Worker V14.3 Final Manual
// Fixed for GitHub Pages 404 issue
const CACHE_NAME = 'grace-pharmacy-v14-3-manual-final';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './logo.png'
];

self.addEventListener('install', event => {
  console.log('[SW] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  console.log('[SW] Activate');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Fix for GitHub Pages - don't cache external requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // For navigation requests (HTML pages) - Network first, then cache
  // This prevents the 404 when installed as PWA
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache the new page
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => {
          // If offline, try cache
          return caches.match(event.request)
            .then(response => {
              return response || caches.match('./index.html');
            });
        })
    );
    return;
  }

  // For other requests - Cache first, then network
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(res => {
          // Don't cache if not successful
          if (!res || res.status !== 200 || res.type !== 'basic') {
            return res;
          }
          const responseToCache = res.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return res;
        });
      })
  );
});
