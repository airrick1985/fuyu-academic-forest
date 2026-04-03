/* PWA Service Worker Registration with Auto-Versioning */

if ('serviceWorker' in navigator) {
  // Get app version from meta tag
  const getAppVersion = () => {
    const meta = document.querySelector('meta[name="app-version"]');
    return meta ? meta.getAttribute('content') : '1.0.0';
  };

  // Store version in sessionStorage for comparison
  const currentVersion = getAppVersion();
  const previousVersion = sessionStorage.getItem('app-version');

  // Update version in session
  sessionStorage.setItem('app-version', currentVersion);

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then(registration => {
        console.log('[PWA] Service Worker registered successfully');

        // Check for updates periodically (every 5 hours)
        setInterval(() => {
          registration.update().catch(err => {
            console.error('[PWA] Update check failed:', err);
          });
        }, 5 * 60 * 60 * 1000);

        // Notify SW about current version
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'CHECK_VERSION',
            version: currentVersion
          });
        }

        // Listen for messages from Service Worker
        navigator.serviceWorker.addEventListener('message', event => {
          if (event.data && event.data.type === 'VERSION_UPDATED') {
            console.log('[PWA] App version updated, reload on next visit');
          }
        });

        // If version changed, reload on next visibility
        if (previousVersion && previousVersion !== currentVersion) {
          console.log(`[PWA] Version change detected: ${previousVersion} → ${currentVersion}`);
          // Notify all tabs about update
          navigator.serviceWorker.controller?.postMessage({
            type: 'CHECK_VERSION',
            version: currentVersion
          });
        }
      })
      .catch(error => {
        console.error('[PWA] Service Worker registration failed:', error);
      });
  });

  // Check for updates when page becomes visible
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && navigator.serviceWorker.controller) {
      const newVersion = getAppVersion();
      navigator.serviceWorker.controller.postMessage({
        type: 'CHECK_VERSION',
        version: newVersion
      });
    }
  });
}
