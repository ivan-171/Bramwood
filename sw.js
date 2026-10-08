// Bramwood v0.5.1: the whole application lives in index.html.
const CACHE='bramwood-living-v051';
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.add('./index.html')).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k.startsWith('bramwood-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if(request.method!=='GET'||new URL(request.url).origin!==self.location.origin)return;
  if(request.mode==='navigate') {
    event.respondWith(fetch(request).then(response=>{
      if(response.ok){const clone=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put('./index.html',clone)));}
      return response;
    }).catch(()=>caches.match('./index.html')));
  }
});
