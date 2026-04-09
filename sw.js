/* Service Worker for PWA offline functionality with auto-versioning */

// Version is read from HTML meta tag and cached here
let CACHE_VERSION = '1.0.0';
let CACHE_NAME = `fuyu-forest-${CACHE_VERSION}`;

// Asset manifest cache name
const MANIFEST_CACHE_NAME = 'fuyu-asset-manifest-v1';

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
  '/js/asset-update-manager.js',
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
          // Delete caches that don't match current version, but preserve manifest cache
          if (!cacheName.includes(CACHE_VERSION) && cacheName !== MANIFEST_CACHE_NAME) {
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

// ================== 資源清單和雜湊驗證 ==================

/**
 * 計算 ArrayBuffer 的 SHA256 雜湊值
 */
async function calculateSHA256(buffer) {
  try {
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex.substring(0, 12); // 返回前 12 位
  } catch (error) {
    console.warn('[SW] SHA256 計算失敗:', error);
    return null;
  }
}

/**
 * 並行下載資源列表
 */
async function downloadAssets(updateList, maxParallel = 3, hashVerify = true) {
  const results = {
    updated: 0,
    failed: 0,
    errors: []
  };

  const cache = await caches.open(CACHE_NAME);

  // 分批處理
  for (let i = 0; i < updateList.length; i += maxParallel) {
    const batch = updateList.slice(i, i + maxParallel);
    const batchPromises = batch.map(asset =>
      downloadAndCacheAsset(asset, cache, hashVerify, results)
    );

    await Promise.all(batchPromises);
    console.log(`[SW] 進度: ${Math.min(i + maxParallel, updateList.length)}/${updateList.length}`);
  }

  return results;
}

/**
 * 下載單個資源並驗證
 */
async function downloadAndCacheAsset(asset, cache, hashVerify, results) {
  try {
    console.log(`[SW] 開始下載: ${asset.path}, 預期雜湊: ${asset.hash}`);

    const response = await fetch(asset.path + '?t=' + Date.now(), {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} at ${asset.path}`);
    }

    const blob = await response.blob();
    console.log(`[SW] 下載成功，文件大小: ${blob.size} 字節 (預期: ${asset.size})`);

    const buffer = await blob.arrayBuffer();

    // 驗證雜湊值
    if (hashVerify) {
      const calculatedHash = await calculateSHA256(buffer);
      console.log(`[SW] 雜湊驗證: 計算值=${calculatedHash}, 預期值=${asset.hash}`);

      if (calculatedHash !== asset.hash) {
        throw new Error(
          `Hash mismatch: expected ${asset.hash}, got ${calculatedHash}`
        );
      }
    }

    // 保存到快取
    const cacheResponse = new Response(blob, {
      headers: {
        'Content-Type': blob.type,
        'X-Asset-Hash': asset.hash,
        'Cache-Control': 'max-age=31536000' // 1 year
      }
    });

    await cache.put(asset.path, cacheResponse);
    results.updated++;
    console.log(`[SW] ✓ 已快取: ${asset.path}`);

  } catch (error) {
    results.failed++;
    results.errors.push({
      path: asset.path,
      error: error.message
    });
    console.error(`[SW] ✗ 無法下載: ${asset.path}`, {
      error: error.message,
      stack: error.stack
    });
  }
}

// Message event - handle version update and asset updates from client
self.addEventListener('message', event => {
  console.log('[SW] 📨 收到來自客戶端的消息:', event.data?.type);

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
  } else if (event.data && event.data.type === 'UPDATE_ASSETS') {
    // 資源更新請求
    const { updateList, totalCount, maxParallel, hashVerify, basePath } = event.data;

    console.log(`[SW] ✅ 收到資源更新請求: ${updateList.length} 個資源`);
    if (basePath) {
      console.log(`[SW] 基礎路徑: ${basePath}`);
    }
    console.log(`[SW] 第一個資源路徑: ${updateList[0]?.path}`);

    // 後台下載（不阻塞客戶端）
    downloadAssets(updateList, maxParallel || 3, hashVerify !== false)
      .then(results => {
        console.log(`[SW] ✅ 資源下載完成:`, results);

        // 通知所有客戶端更新完成
        console.log('[SW] 📢 發送 UPDATE_ASSETS_COMPLETE 消息給所有客戶端...');
        self.clients.matchAll().then(clients => {
          console.log(`[SW] 找到 ${clients.length} 個客戶端`);
          clients.forEach(client => {
            console.log('[SW] 發送消息給客戶端:', client.id);
            client.postMessage({
              type: 'UPDATE_ASSETS_COMPLETE',
              success: results.failed === 0,
              updated: results.updated,
              failed: results.failed,
              errors: results.errors
            });
          });
        });
      })
      .catch(error => {
        console.error('[SW] 資源更新失敗:', error);
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'UPDATE_ASSETS_COMPLETE',
              success: false,
              error: error.message
            });
          });
        });
      });

    // 立即回應客戶端（後台繼續下載）
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage({ type: 'UPDATE_ASSETS_STARTED' });
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

  // Asset manifest - Network First with fallback
  if (url.pathname.endsWith('assets-manifest.json')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          if (response.status === 200) {
            caches.open(MANIFEST_CACHE_NAME).then(cache => {
              cache.put(event.request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          // 嘗試從快取獲取舊的清單
          return caches.match(event.request, { cacheName: MANIFEST_CACHE_NAME }).then(cached => {
            if (cached) {
              console.log('[SW] 使用快取的資源清單');
              return cached;
            }
            console.warn('[SW] 無法獲取資源清單，且無快取版本');
            return new Response(JSON.stringify({ assets: {} }), {
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
    );
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
