// The Grace Pharmacy - V18.2.1 Professional Fix - Alerts 60 Days + Chart Restored + Edit Medicine Restored - Safe SW - No Data Delete
const CACHE_NAME = 'grace-v18-2-1-fix-alerts-chart-edit-professional-safe-v1';
self.addEventListener('install', (event) => {
  self.skipWaiting();
  console.log('Grace Pharmacy V18.2.1 Fix - Alerts 60d + Chart + Edit Medicine + Add Medicine + Purchase + Expenses + Debts - SW Installed - Safe - No Data Loss');
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || event.request.url.includes('firestore') || event.request.url.includes('firebase') || event.request.url.includes('firestore.googleapis.com')) {
    return;
  }
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return new Response('Offline - Grace Pharmacy', { status: 503, statusText: 'Offline' });
        });
      })
  );
});
