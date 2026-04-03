/* Service Worker for PWA offline functionality */

const CACHE_NAME = 'fuyu-forest-v1';

// Core assets to pre-cache on install
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/css/variables.css',
  '/css/global.css',
  '/css/topbar.css',
  '/js/topbar.js',
  '/js/spa-router.js',
  '/js/pwa-register.js',
  '/assets/images/fuyu-logo.webp',
  '/assets/images/hero-forest.webp'
];

// Install event - pre-cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CORE_ASSETS).catch(err => {
        console.warn('Pre-cache failed for some assets:', err);
        // Continue even if some assets fail to cache
        return Promise.resolve();
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // HTML pages - Network First strategy
  if (event.request.headers.get('accept')?.includes('text/html') ||
      url.pathname.endsWith('.html') ||
      url.pathname === '/') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone the response before caching
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clone);
          });
          return response;
        })
        .catch(() => {
          // Fall back to cache if network fails
          return caches.match(event.request).then(cached => {
            if (cached) {
              return cached;
            }
            // Return fallback page if both network and cache fail
            return caches.match('/index.html');
          });
        })
    );
    return;
  }

  // Static assets (CSS, JS, images, fonts) - Cache First strategy
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        return cached;
      }
      return fetch(event.request).then(response => {
        // Clone and cache successful responses
        const clone = response.clone();
        if (response.status === 200) {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clone);
          });
        }
        return response;
      }).catch(() => {
        // Graceful fallback for failed requests
        console.warn('Fetch failed for:', event.request.url);
        return new Response('Network error', { status: 503 });
      });
    })
  );
});
