const CACHE_NAME="grace-pro-v11-final";
const CORE=["./index.html","./manifest.json","./logo.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(CORE)));self.skipWaiting())});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener("fetch",e=>{
  const url=e.request.url;
  if(url.includes("firebase")||url.includes("firestore")||url.includes("googleapis")||url.includes("gstatic")||url.includes("cdn.tailwind")||url.includes("unpkg")||url.includes("qrcode")) return;
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).catch(()=>caches.match("./index.html"))));
});
