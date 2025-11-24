/**
 * Service Worker for Aggressive Caching
 * This dramatically improves repeat visit performance
 */

const CACHE_NAME = 'memewin-v2';
const RUNTIME_CACHE = 'memewin-runtime-v2';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/assets/site/meme-win-logo.png',
  '/offline.html',
  // Add other critical assets here
];

// Cache-first strategy for these patterns
const CACHE_FIRST_PATTERNS = [
  /\.(woff2|woff|ttf|eot)$/,  // Fonts
  /\.(png|jpg|jpeg|gif|svg|webp|avif)$/,  // Images
  /\/_next\/static\//,  // Next.js static files
];

// Network-first with fallback for API calls
const NETWORK_FIRST_PATTERNS = [
  /\/api\//,
  /apiv2\.xx88zz77\.site/,
];

// Timeout helper for fetch to avoid hanging/long retries when offline
function fetchWithTimeout(request, timeout = 4000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  return fetch(request, { signal: controller.signal })
    .finally(() => clearTimeout(id));
}

// Install event: precache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event: serve from cache when possible
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip unsupported URL schemes (chrome-extension, etc.)
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Cache-first strategy for static assets
  if (CACHE_FIRST_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((response) => {
          // Don't cache if not a success response
          if (!response || response.status !== 200) {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });

          return response;
        }).catch(() => {
          return new Response('Offline', { status: 503 });
        });
      })
    );
    return;
  }

  // Network-first for API calls (with fallback to cache)
  if (NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(url.href))) {
    event.respondWith(
      fetchWithTimeout(request, 4000)
        .then((response) => {
          // Clone and cache successful responses
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              // Avoid caching opaque/cross-origin responses without CORS
              if (response.type !== 'opaque') {
                cache.put(request, responseToCache);
              }
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            return new Response('Offline', { status: 503 });
          });
        })
    );
    return;
  }

  // Default: try network first, fallback to cache
  event.respondWith(
    (async () => {
      // For navigation requests (pages), serve an offline fallback from cache
      if (request.mode === 'navigate') {
        try {
          const response = await fetchWithTimeout(request, 4000);
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              if (response.type !== 'opaque') cache.put(request, responseToCache);
            });
          }
          return response;
        } catch (err) {
          const cached = await caches.match('/offline.html');
          return cached || new Response('Offline', { status: 503 });
        }
      }

      try {
        const response = await fetchWithTimeout(request, 4000);
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            if (response.type !== 'opaque') cache.put(request, responseToCache);
          });
        }
        return response;
      } catch (err) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) return cachedResponse;
        return new Response('Offline', { status: 503 });
      }
    })()
  );
});
