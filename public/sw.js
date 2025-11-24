/**
 * Service Worker - Disabled
 * This file replaces the previous service worker to ensure old caches are cleaned up
 * and no new caching occurs.
 */

self.addEventListener('install', (event) => {
  // Force immediate activation
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Claim clients immediately
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Delete all existing caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            return caches.delete(cacheName);
          })
        );
      })
    ])
  );
});

// Pass through all fetches to the network (no caching)
self.addEventListener('fetch', (event) => {
  return;
});
