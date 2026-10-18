/* SACTA service worker — offline app shell. Data (GitHub) is always fetched live. */
const CACHE = "sacta-v2";                       // bumped -> old cache (incl. old icons) is purged on activate
const SHELL = [
  "./","./index.html","./sacta.html","./guest.html","./styles.css","./manifest.json",
  "./icon-192-v2.png","./icon-512-v2.png","./icon-192-maskable-v2.png","./icon-512-maskable-v2.png"
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
  const req=e.request; if(req.method!=="GET")return;
  const url=new URL(req.url);
  if(url.origin!==location.origin)return;        // GitHub data/API: always network, never cached
  e.respondWith(
    caches.match(req).then(hit=>{
      const net=fetch(req).then(res=>{ if(res&&res.status===200){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));} return res; }).catch(()=>hit);
      return hit || net;
    })
  );
});
