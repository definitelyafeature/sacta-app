/* SACTA service worker — offline app shell. Data (GitHub) is always fetched live. */
const CACHE = "sacta-v1";
const SHELL = [
  "./","./index.html","./sacta.html","./guest.html","./styles.css","./manifest.json",
  "./icon-192.png","./icon-512.png","./icon-192-maskable.png","./icon-512-maskable.png"
];
self.addEventListener("install", e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL.map(u=>new Request(u,{cache:"reload"})))).catch(()=>{}));
  self.skipWaiting();
});
self.addEventListener("activate", e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e=>{
  const req=e.request;
  if(req.method!=="GET"){ return; }
  const url=new URL(req.url);
  // Never cache cross-origin (GitHub data/API) — always go to network for freshness.
  if(url.origin!==location.origin){ return; }
  // App shell: cache-first, fall back to network, update cache in background.
  e.respondWith(
    caches.match(req).then(hit=>{
      const net=fetch(req).then(res=>{
        if(res && res.status===200){ const copy=res.clone(); caches.open(CACHE).then(c=>c.put(req,copy)); }
        return res;
      }).catch(()=>hit);
      return hit || net;
    })
  );
});
