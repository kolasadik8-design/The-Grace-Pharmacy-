const CACHE_NAME = "grace-sidigi-v6";
const CORE = ["./index.html","./manifest.json","./logo.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(CORE)));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));
});
self.addEventListener("fetch", e => {
  const url = e.request.url;
  if(url.includes("firebase") || url.includes("firestore") || url.includes("googleapis") || url.includes("tailwind") || url.includes("qrcode")) {
    return; // لا تعمل cache للفايربيس - ده كان الخطأ الكبير في V5
  }
  e.respondWith(
    caches.match(e.request).then(r=> r || fetch(e.request).catch(()=>caches.match("./index.html")))
  );
});
