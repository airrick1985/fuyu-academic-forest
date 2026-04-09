/* PWA Service Worker Registration with Active Update Check */

if ('serviceWorker' in navigator) {
  // 獲取當前版本
  const getAppVersion = () => {
    const meta = document.querySelector('meta[name="app-version"]');
    return meta ? meta.getAttribute('content') : '1.0.0';
  };

  // 隱藏加載覆蓋層
  const hideLoadingOverlay = () => {
    const overlay = document.getElementById('pwa-loading-overlay');
    if (overlay) {
      overlay.classList.add('hidden');
      setTimeout(() => overlay.remove(), 500);
    }
  };

  // 顯示加載覆蓋層
  const showLoadingOverlay = (text = '正在檢查更新...') => {
    const overlay = document.getElementById('pwa-loading-overlay');
    if (overlay) {
      const textEl = overlay.querySelector('.pwa-loading-text');
      if (textEl) textEl.textContent = text;
      overlay.classList.remove('hidden');
    }
  };

  // 檢查遠端版本（帶離線降級）
  const checkRemoteVersion = async () => {
    try {
      // Use relative path to be compatible with both localhost and GitHub Pages deployment
      const versionUrl = new URL('version.json', window.location.href).href;
      const response = await fetch(versionUrl + '?t=' + Date.now(), {
        cache: 'no-store',
        credentials: 'same-origin'
      });
      if (response.ok) {
        const data = await response.json();
        return data.version;
      }
    } catch (error) {
      console.log('[PWA] 無法檢查遠端版本（可能離線）:', error.message);
    }
    return null;
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

  // 主動更新檢查（在頁面加載前執行）
  const performInitialUpdateCheck = async () => {
    try {
      const currentVersion = getAppVersion();
      const remoteVersion = await checkRemoteVersion();

      if (remoteVersion && remoteVersion !== currentVersion) {
        console.log(`[PWA] 檢測到版本更新：${currentVersion} → ${remoteVersion}`);
        showLoadingOverlay('正在下載新版本...');

        // 等待一段時間以確保 Service Worker 已註冊
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 更新 meta 版本號
        const meta = document.querySelector('meta[name="app-version"]');
        if (meta) {
          meta.setAttribute('content', remoteVersion);
        }

        // 通知 Service Worker 更新
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'CHECK_VERSION',
            version: remoteVersion
          });
        }

        // 等待 Service Worker 更新完成
        await new Promise(resolve => {
          const timeout = setTimeout(resolve, 2000);
          navigator.serviceWorker?.addEventListener('message', (event) => {
            if (event.data?.type === 'UPDATE_COMPLETE') {
              clearTimeout(timeout);
              resolve();
            }
          }, { once: true });
        });

        // 完成後隱藏加載界面並重新加載
        hideLoadingOverlay();
        console.log('[PWA] 版本已更新，重新加載頁面');
        setTimeout(() => location.reload(), 100);
      } else {
        hideLoadingOverlay();
        if (remoteVersion) {
          console.log('[PWA] 已是最新版本:', currentVersion);
        } else {
          console.log('[PWA] 離線狀態，使用快取版本:', currentVersion);
        }
      }
    } catch (error) {
      console.error('[PWA] 初始更新檢查失敗:', error);
      hideLoadingOverlay();
    }
  };

  // Store version in sessionStorage for comparison
  const currentVersion = getAppVersion();
  const previousVersion = sessionStorage.getItem('app-version');

  // Update version in session
  sessionStorage.setItem('app-version', currentVersion);

  // 在頁面加載時執行初始檢查
  if (document.readyState === 'loading') {
    // 文件仍在加載中
    document.addEventListener('DOMContentLoaded', () => {
      performInitialUpdateCheck();
    });
  } else {
    // 文件已加載完成
    performInitialUpdateCheck();
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then(registration => {
        console.log('[PWA] Service Worker registered successfully');

        // 立即檢查 Service Worker 更新
        registration.update().catch(err => {
          console.error('[PWA] Initial update check failed:', err);
        });

        // 檢查更新間隔改為 1 小時
        setInterval(() => {
          registration.update().catch(err => {
            console.error('[PWA] Update check failed:', err);
          });
        }, 60 * 60 * 1000);

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
            console.log('[PWA] App version updated, will prompt on next load');
          }
        });

        // 如果在載入期間版本改變，在頁面完全加載後顯示更新提示
        if (previousVersion && previousVersion !== currentVersion) {
          console.log(`[PWA] Version change detected after load: ${previousVersion} → ${currentVersion}`);
          setTimeout(() => {
            showUpdateBanner(previousVersion, currentVersion);
          }, 500);

          // 通知所有分頁
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

  // 頁面重新獲得焦點時檢查更新
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && navigator.serviceWorker.controller) {
      const newVersion = getAppVersion();
      const storedVersion = sessionStorage.getItem('app-version');

      checkRemoteVersion().then(remoteVersion => {
        if (remoteVersion && storedVersion && storedVersion !== remoteVersion) {
          console.log(`[PWA] 後台版本更新檢測：${storedVersion} → ${remoteVersion}`);
          showUpdateBanner(storedVersion, remoteVersion);
          sessionStorage.setItem('app-version', remoteVersion);
        }
      });

      navigator.serviceWorker.controller.postMessage({
        type: 'CHECK_VERSION',
        version: newVersion
      });
    }
  });
}
