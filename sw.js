const CACHE_NAME = 'swifttool-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/tools-logic.js',
  '/logo.jpg',
  '/manifest.json'
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
  // AdSense aur Analytics requests ko cache mat karo
  if (event.request.url.includes('googlesyndication') || 
      event.request.url.includes('googletagmanager') ||
      event.request.url.includes('google-analytics')) {
    return;
  }
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
