// Grace Pharmacy SW V13.4.1 - Fixed Cache Bug
const CACHE_NAME = 'grace-v13-4-1'; // ✅ غيّر الاسم - ده المهم
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './logo.png'
];

// تثبيت
self.addEventListener('install', event => {
  self.skipWaiting(); // ✅ يجبر التحديث فورا
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
  );
});

// تفعيل - امسح الكاش القديم
self.addEventListener('activate', event => {
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
    }).then(() => self.clients.claim())
  );
});

// جلب - Network First عشان ما يعلق الحفظ
self.addEventListener('fetch', event => {
  // لا تعمل cache لـ Firestore
  if (event.request.url.includes('firestore.googleapis.com') || 
      event.request.url.includes('firebase') ||
      event.request.url.includes('fcm')) {
    return; // خلي Firebase يتعامل مباشر
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // حدّث الكاش بالنسخة الجديدة
        if (response && response.status === 200 && response.type === 'basic') {
          let responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // لو مافي نت، جيب من الكاش
        return caches.match(event.request);
      })
  );
});
