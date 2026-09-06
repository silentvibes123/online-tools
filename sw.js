const CACHE_NAME = 'onlinetools-v5';
const urlsToCache = [
  'index.html',
  'style.css',
  'script.js',
  'tools-logic.js',
  'logo.png',
  'manifest.json'
];

// Install: Cache important files
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Activate: Delete old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: Network first, then cache fallback
self.addEventListener('fetch', event => {
 
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
