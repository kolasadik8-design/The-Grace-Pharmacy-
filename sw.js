const CACHE_NAME = 'tgp-v11-advanced-v3';
const FILES = ['./','./index.html','./logo.jpg','./manifest.json','./firebase-config.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(FILES))); });
self.addEventListener('fetch', e => { e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).catch(()=>caches.match('./index.html')))); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))))); });