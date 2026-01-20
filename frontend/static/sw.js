const CACHE_NAME = 'ithinknote-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Let all requests pass through to network
  // This app needs to be online to sync notes
  event.respondWith(fetch(event.request));
});
