const CACHE_NAME="totoro-math-cache-v3";
const urlsToCache=["index.html","manifest.json","icons/icon-192.png","icons/icon-512.png","icons/totoro.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(urlsToCache)))});
self.addEventListener("fetch",e=>{e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)))});
