const CACHE_NAME = "totoro-math-v5";
const urlsToCache = ["index.html","game.js","manifest.json","assets/totoro.png","assets/soot_black.png","assets/soot_purple.png","assets/heart.png","assets/bird.png","assets/icon-192.png","assets/icon-512.png"];
self.addEventListener('install', e=>{ e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(urlsToCache))); });
self.addEventListener('fetch', e=>{ e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))); });