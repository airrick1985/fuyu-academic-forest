/* PWA Service Worker Registration with Auto-Versioning */

if ('serviceWorker' in navigator) {
  // Get app version from meta tag
  const getAppVersion = () => {
    const meta = document.querySelector('meta[name="app-version"]');
    return meta ? meta.getAttribute('content') : '1.0.0';
  };

  // 顯示更新提示 Banner + 倒計時
  const showUpdateBanner = (oldVersion, newVersion) => {
    const banner = document.createElement('div');
    banner.id = 'pwa-update-banner';
    banner.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #2D5016 0%, #3d6b1f 100%);
      color: white;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      z-index: 9999;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      animation: slideDown 0.3s ease-out;
    `;

    let countdownSeconds = 10;

    const updateNow = () => {
      console.log('[PWA] 使用者點擊立即更新');
      banner.remove();
      location.reload();
    };

    const dismiss = () => {
      console.log('[PWA] 使用者關閉更新提示');
      clearInterval(countdownInterval);
      banner.remove();
    };

    const contentDiv = document.createElement('div');
    contentDiv.style.cssText = 'flex: 1; min-width: 0;';

    const titleDiv = document.createElement('div');
    titleDiv.style.cssText = 'font-weight: 600; margin-bottom: 4px;';
    titleDiv.textContent = '✨ 新版本已推出';

    const detailDiv = document.createElement('div');
    detailDiv.id = 'pwa-countdown-text';
    detailDiv.style.cssText = 'font-size: 14px; opacity: 0.95;';
    detailDiv.textContent = `版本 ${oldVersion} → ${newVersion}，10 秒後自動更新...`;

    contentDiv.appendChild(titleDiv);
    contentDiv.appendChild(detailDiv);

    const buttonsDiv = document.createElement('div');
    buttonsDiv.style.cssText = 'display: flex; gap: 12px; flex-shrink: 0;';

    const updateBtn = document.createElement('button');
    updateBtn.textContent = '立即更新';
    updateBtn.style.cssText = `
      padding: 8px 16px;
      background: rgba(255,255,255,0.3);
      color: white;
      border: 1px solid rgba(255,255,255,0.5);
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
      white-space: nowrap;
    `;
    updateBtn.onmouseover = () => updateBtn.style.background = 'rgba(255,255,255,0.4)';
    updateBtn.onmouseout = () => updateBtn.style.background = 'rgba(255,255,255,0.3)';
    updateBtn.onclick = updateNow;

    const dismissBtn = document.createElement('button');
    dismissBtn.textContent = '✕';
    dismissBtn.style.cssText = `
      width: 32px;
      height: 32px;
      padding: 0;
      background: transparent;
      color: white;
      border: none;
      cursor: pointer;
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.8;
      transition: opacity 0.2s;
    `;
    dismissBtn.onmouseover = () => dismissBtn.style.opacity = '1';
    dismissBtn.onmouseout = () => dismissBtn.style.opacity = '0.8';
    dismissBtn.onclick = dismiss;

    buttonsDiv.appendChild(updateBtn);
    buttonsDiv.appendChild(dismissBtn);

    banner.appendChild(contentDiv);
    banner.appendChild(buttonsDiv);

    // 添加樣式動畫
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideDown {
        from {
          transform: translateY(-100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);

    document.body.insertBefore(banner, document.body.firstChild);

    // 倒計時邏輯
    const countdownInterval = setInterval(() => {
      countdownSeconds--;
      const countdownText = document.getElementById('pwa-countdown-text');
      if (countdownText) {
        if (countdownSeconds > 0) {
          countdownText.textContent = `版本 ${oldVersion} → ${newVersion}，${countdownSeconds} 秒後自動更新...`;
        } else {
          clearInterval(countdownInterval);
          updateNow();
        }
      }
    }, 1000);

    console.log(`[PWA] 顯示更新提示：${oldVersion} → ${newVersion}`);
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

        // If version changed, show update banner with countdown
        if (previousVersion && previousVersion !== currentVersion) {
          console.log(`[PWA] Version change detected: ${previousVersion} → ${currentVersion}`);
          showUpdateBanner(previousVersion, currentVersion);
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
      const storedVersion = sessionStorage.getItem('app-version');
      if (storedVersion && storedVersion !== newVersion) {
        showUpdateBanner(storedVersion, newVersion);
        sessionStorage.setItem('app-version', newVersion);
      }
      navigator.serviceWorker.controller.postMessage({
        type: 'CHECK_VERSION',
        version: newVersion
      });
    }
  });

  // ============== 資源動態更新管理 ==============
  // 在應用版本檢查後初始化資源管理器
  if (typeof AssetUpdateManager !== 'undefined') {
    window.assetUpdateManager = new AssetUpdateManager({
      manifestUrl: '/assets-manifest.json',
      checkInterval: 30 * 60 * 1000, // 30分鐘檢查一次
      fetchTimeout: 5000,
      retryCount: 3,
      maxParallelDownloads: 3,
      hashVerify: true,
      autoRefresh: true
    });

    // 頁面完全加載後初始化資源管理器
    window.addEventListener('load', () => {
      window.assetUpdateManager.init().catch(err => {
        console.error('[PWA] 資源管理器初始化失敗:', err);
      });
    });
  }
}
