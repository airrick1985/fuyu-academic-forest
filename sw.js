/* Service Worker for PWA offline functionality with auto-versioning */

// Version is read from HTML meta tag and cached here
let CACHE_VERSION = '1.0.0';
let CACHE_NAME = `fuyu-forest-${CACHE_VERSION}`;

// Core assets to pre-cache on install
// Note: HTML files are NOT pre-cached to ensure users always get the latest version
// HTML will be cached on demand using Network First strategy
const CORE_ASSETS = [
  '/css/variables.css',
  '/css/global.css',
  '/css/topbar.css',
  '/js/topbar.js',
  '/js/spa-router.js',
  '/js/pwa-register.js',
  '/assets/images/fuyu-logo.webp',
  '/assets/images/hero-forest.webp',
  '/assets/pannellum/pannellum.min.js',
  '/assets/pannellum/pannellum.min.css'
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

// Activate event - clean up old caches and update version
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      console.log(`[SW] Activating with cache version: ${CACHE_VERSION}`);
      return Promise.all(
        cacheNames.map(cacheName => {
          // Aggressively delete all caches that don't match current version
          // This ensures old cached resources are immediately removed
          if (!cacheName.includes(CACHE_VERSION)) {
            console.log(`[SW] Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName).then(() => {
              console.log(`[SW] Successfully deleted: ${cacheName}`);
            });
          }
        })
      );
    }).then(() => {
      // Ensure new SW takes control immediately
      return self.clients.claim();
    })
  );
});

// Message event - handle version update from client
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CHECK_VERSION') {
    const newVersion = event.data.version;
    if (newVersion !== CACHE_VERSION) {
      console.log(`[SW] Version update detected: ${CACHE_VERSION} → ${newVersion}`);
      CACHE_VERSION = newVersion;
      CACHE_NAME = `fuyu-forest-${CACHE_VERSION}`;
      // Trigger activation to clean up old caches
      self.skipWaiting();

      // Notify client that update is complete
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ type: 'UPDATE_COMPLETE' });
      }
      // Broadcast to all clients
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'UPDATE_COMPLETE', version: newVersion });
        });
      });
    }
  }
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

  // Static assets (CSS, JS, images, fonts) - Network First for JS, Cache First for others
  const isJavaScript = event.request.url.endsWith('.js');

  if (isJavaScript) {
    // JavaScript files - Network First to ensure latest code is always loaded
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          if (response.status === 200) {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then(cached => {
            if (cached) {
              return cached;
            }
            console.warn('Fetch failed for:', event.request.url);
            return new Response('Network error', { status: 503 });
          });
        })
    );
  } else {
    // Other assets - Cache First strategy
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
  }
});
