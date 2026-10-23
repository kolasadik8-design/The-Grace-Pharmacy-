const CACHE_NAME = 'grace-pharmacy-v14-audit';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './logo.png',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
];

// Install - cache assets
self.addEventListener('install', event => {
  console.log('[SW V14] Installing');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW V14] Caching');
        return cache.addAll(ASSETS.map(url => new Request(url, {mode: 'no-cors'}))).catch(err=>console.log('Cache skip',err));
      })
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', event => {
  console.log('[SW V14] Activating');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

// Fetch - NETWORK FIRST (يصلح مشكلة عدم الحفظ)
self.addEventListener('fetch', event => {
  // Don't cache Firestore / Firebase requests
  if (event.request.url.includes('firestore.googleapis.com') ||
      event.request.url.includes('firebase') ||
      event.request.url.includes('googleapis.com')) {
    return; // Let browser handle it - network only
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone and cache successful GET requests
        if (event.request.method === 'GET' && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache if offline
        return caches.match(event.request).then(cached => {
          if (cached) return cached;
          // Fallback to index.html for navigation
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
