const CACHE = 'grace-v14-3-7500-expiry';
const FILES = ['./','./index.html','./logo.png','./manifest.json'];
self.addEventListener('install', e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e=>{ e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x))))); });
self.addEventListener('fetch', e=>{
  e.respondWith(
    caches.match(e.request).then(r=>{
      return r || fetch(e.request).then(res=>{
        if(e.request.method==='GET' && res.status===200){
          const clone=res.clone();
          caches.open(CACHE).then(c=>c.put(e.request, clone));
        }
        return res;
      }).catch(()=>caches.match('./index.html'));
    })
  );
});
