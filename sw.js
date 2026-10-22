const CACHE_NAME="grace-v13-offline-final";
const CORE=["./","./index.html","./manifest.json","./logo.png","https://cdn.tailwindcss.com","https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(CORE).catch(()=>{})));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE_NAME).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener("fetch",e=>{
  const u=e.request.url;
  if(u.includes("firestore")||u.includes("firebase")||u.includes("googleapis")||u.includes("gstatic")) return;
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{return caches.open(CACHE_NAME).then(c=>{c.put(e.request,res.clone());return res})}).catch(()=>caches.match("./index.html"))));
});
