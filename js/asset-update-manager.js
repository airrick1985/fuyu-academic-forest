/**
 * 資源動態更新管理器
 *
 * 功能：
 * 1. 檢查資源清單更新
 * 2. 對比本地與遠端版本
 * 3. 通知 Service Worker 進行增量下載
 * 4. 管理本地快取清單
 */

// 防止在 SPA 導航時重複聲明
if (typeof window.AssetUpdateManager === 'undefined') {
  class AssetUpdateManager {
  constructor(options = {}) {
    this.manifestUrl = options.manifestUrl || '/assets-manifest.json';
    this.checkInterval = options.checkInterval || 15 * 60 * 1000; // 15分鐘（首次進入後的檢查間隔）
    this.fetchTimeout = options.fetchTimeout || 5000; // 5秒
    this.retryCount = options.retryCount || 3;
    this.maxParallelDownloads = options.maxParallelDownloads || 3;
    this.hashVerify = options.hashVerify !== false;
    this.autoRefresh = options.autoRefresh !== false;

    this.localManifest = null;
    this.remoteManifest = null;
    this.isUpdating = false;
    this.updateCheckTimer = null;
    this.isInitialized = false;

    // 初始化本地清單
    this.loadLocalManifest();
  }

  /**
   * 初始化管理器
   */
  async init() {
    if (this.isInitialized) {
      console.log('[AssetUpdateManager] 已初始化過，跳過重複初始化');
      return;
    }

    console.log('[AssetUpdateManager] 初始化中...');

    try {
      // 首次進入時立即檢查（關鍵：每次進入都要檢查）
      console.log('[AssetUpdateManager] 執行進入時檢查...');
      const hasUpdates = await this.checkForAssetUpdates();

      if (hasUpdates) {
        console.log('[AssetUpdateManager] 檢測到更新，將在資源下載完成後刷新');
      }

      // 設置定期檢查（之後每15分鐘檢查一次）
      this.setupPeriodicCheck();

      // 監聽頁面可見性變化（返回焦點時檢查）
      this.setupVisibilityListener();

      this.isInitialized = true;
      console.log('[AssetUpdateManager] 初始化完成');
    } catch (error) {
      console.error('[AssetUpdateManager] 初始化失敗:', error);
      this.isInitialized = true; // 即使失敗也標記已初始化，防止重複嘗試
    }
  }

  /**
   * 從 localStorage 載入本地清單
   */
  loadLocalManifest() {
    try {
      const stored = localStorage.getItem('asset-manifest');
      if (stored) {
        this.localManifest = JSON.parse(stored);
        console.log('[AssetUpdateManager] 載入本地清單，版本:', this.localManifest.version);
      }
    } catch (error) {
      console.warn('[AssetUpdateManager] 載入本地清單失敗:', error);
      this.localManifest = null;
    }
  }

  /**
   * 保存清單到 localStorage
   */
  saveLocalManifest(manifest) {
    try {
      localStorage.setItem('asset-manifest', JSON.stringify(manifest));
      this.localManifest = manifest;
    } catch (error) {
      console.warn('[AssetUpdateManager] 保存清單失敗（可能超出配額）:', error);
    }
  }

  /**
   * 獲取遠端資源清單（帶 timeout 和降級）
   */
  async getRemoteManifest() {
    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        console.log('[AssetUpdateManager] 獲取遠端清單超時，使用本地版本');
        resolve(null);
      }, this.fetchTimeout);

      const cacheBuster = `?t=${Date.now()}`;
      fetch(this.manifestUrl + cacheBuster, {
        cache: 'no-store',
        credentials: 'same-origin'
      })
        .then(response => {
          clearTimeout(timeoutId);
          if (response.ok) {
            return response.json();
          }
          throw new Error(`HTTP ${response.status}`);
        })
        .then(manifest => {
          resolve(manifest);
        })
        .catch(error => {
          clearTimeout(timeoutId);
          console.log('[AssetUpdateManager] 無法取得遠端清單:', error.message);
          resolve(null);
        });
    });
  }

  /**
   * 計算資源差異
   */
  computeDifferences(local, remote) {
    const differences = {
      updated: [],
      added: [],
      deleted: []
    };

    const remoteAssets = remote.assets || {};
    const localAssets = local?.assets || {};

    // 檢查更新和新增
    for (const [path, remoteAsset] of Object.entries(remoteAssets)) {
      const localAsset = localAssets[path];

      if (!localAsset) {
        differences.added.push({
          path,
          ...remoteAsset
        });
      } else if (localAsset.hash !== remoteAsset.hash) {
        differences.updated.push({
          path,
          ...remoteAsset
        });
      }
    }

    // 檢查刪除
    for (const path of Object.keys(localAssets)) {
      if (!remoteAssets[path]) {
        differences.deleted.push(path);
      }
    }

    return differences;
  }

  /**
   * 檢查資源更新
   */
  async checkForAssetUpdates() {
    if (this.isUpdating) {
      console.log('[AssetUpdateManager] 已有更新在進行中，跳過');
      return false;
    }

    console.log('[AssetUpdateManager] 檢查資源更新...');

    try {
      this.isUpdating = true;

      // 獲取遠端清單
      const remoteManifest = await this.getRemoteManifest();

      if (!remoteManifest) {
        console.log('[AssetUpdateManager] 無法獲取遠端清單，繼續使用本地版本');
        return false;
      }

      this.remoteManifest = remoteManifest;

      // 如果沒有本地清單，保存遠端的
      if (!this.localManifest) {
        console.log('[AssetUpdateManager] 首次訪問，保存遠端清單');
        this.saveLocalManifest(remoteManifest);
        return false;
      }

      // 比對版本
      if (remoteManifest.version === this.localManifest.version) {
        console.log('[AssetUpdateManager] 已是最新版本:', remoteManifest.version);
        return false;
      }

      console.log(
        `[AssetUpdateManager] 檢測到更新: ${this.localManifest.version} → ${remoteManifest.version}`
      );

      // 計算差異
      const differences = this.computeDifferences(this.localManifest, remoteManifest);
      const totalUpdates = differences.updated.length + differences.added.length;

      console.log(
        `[AssetUpdateManager] 需要更新 ${totalUpdates} 個資源 (更新: ${differences.updated.length}, 新增: ${differences.added.length})`
      );

      // 通知 Service Worker 進行更新
      await this.notifyServiceWorkerUpdate(differences, remoteManifest);

      return true;

    } catch (error) {
      console.error('[AssetUpdateManager] 檢查失敗:', error);
      return false;
    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * 計算基礎路徑（用於 GitHub Pages 子路徑）
   */
  getBasePath() {
    let basePath = window.location.pathname;

    // 移除尾部斜槓
    if (basePath.endsWith('/')) {
      basePath = basePath.slice(0, -1);
    }

    // 移除 HTML 文件名（如果有）
    if (basePath.includes('.html')) {
      basePath = basePath.substring(0, basePath.lastIndexOf('/'));
    }

    // 對於根路徑，根據環境判斷
    // Electron 環境（localhost）使用空路徑，Web 使用 /fuyu-academic-forest
    if (basePath === '') {
      const isElectron = window.isElectron === true || window.location.hostname === 'localhost';
      return isElectron ? '' : '/fuyu-academic-forest';
    }

    return basePath;
  }

  /**
   * 通知 Service Worker 進行更新
   */
  async notifyServiceWorkerUpdate(differences, remoteManifest) {
    if (!('serviceWorker' in navigator)) {
      console.log('[AssetUpdateManager] 瀏覽器不支持 Service Worker');
      return;
    }

    try {
      // 獲取 Service Worker controller，如果尚未準備好則重試
      let controller = navigator.serviceWorker.controller;
      let retryCount = 0;
      const maxRetries = 20; // 最多重試 20 次
      const retryDelay = 200; // 每次等待 200ms

      while (!controller && retryCount < maxRetries) {
        if (retryCount > 0) {
          console.log(`[AssetUpdateManager] ⏳ 等待 Service Worker 準備就緒... (${retryCount}/${maxRetries})`);
        }
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        controller = navigator.serviceWorker.controller;
        retryCount++;
      }

      if (!controller) {
        console.error('[AssetUpdateManager] ❌ Service Worker 無法準備就緒（超過重試次數）');
        console.warn('[AssetUpdateManager] 可能原因：Service Worker 激活延遲過長或未成功激活');
        return;
      }

      console.log('[AssetUpdateManager] ✅ Service Worker 已準備好，發送更新消息');

      // 構建更新列表（只包含更新和新增）
      const updateList = [
        ...differences.updated,
        ...differences.added
      ];

      // 計算基礎路徑並加到資源路徑中
      const basePath = this.getBasePath();
      const updateListWithBasePath = updateList.map(asset => ({
        ...asset,
        path: basePath + '/' + asset.path // 組合基礎路徑
      }));

      console.log(`[AssetUpdateManager] 通知 Service Worker 下載 ${updateList.length} 個資源`);
      console.log(`[AssetUpdateManager] 基礎路徑: ${basePath}`);

      // 先發送 CHECK_VERSION 消息，確保 Service Worker 知道新版本（這樣可以清除舊緩存）
      console.log('[AssetUpdateManager] 首先發送 CHECK_VERSION 消息...');
      controller.postMessage({
        type: 'CHECK_VERSION',
        version: remoteManifest.version
      });

      // 發送消息給 Service Worker
      console.log('[AssetUpdateManager] 發送 UPDATE_ASSETS 消息給 Service Worker...');
      controller.postMessage({
        type: 'UPDATE_ASSETS',
        updateList: updateListWithBasePath,
        totalCount: updateList.length,
        maxParallel: this.maxParallelDownloads,
        hashVerify: this.hashVerify,
        basePath: basePath
      });

      // 等待更新完成（帶超時）
      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.warn('[AssetUpdateManager] ⚠️  等待 Service Worker 回應超時（60秒）');
          resolve();
        }, 60000); // 60秒超時

        const messageHandler = (event) => {
          console.log('[AssetUpdateManager] 收到 Service Worker 消息:', event.data?.type);

          if (event.data?.type === 'UPDATE_ASSETS_COMPLETE') {
            clearTimeout(timeout);
            const { success, updated, failed } = event.data;

            console.log(
              `[AssetUpdateManager] ✅ 更新完成 (成功: ${updated}, 失敗: ${failed})`
            );

            // 更新本地清單
            if (success) {
              this.saveLocalManifest(this.remoteManifest);
              console.log('[AssetUpdateManager] 已保存新清單');
            }

            navigator.serviceWorker.removeEventListener('message', messageHandler);
            resolve();
          }
        };

        console.log('[AssetUpdateManager] 監聽 Service Worker 消息...');
        navigator.serviceWorker.addEventListener('message', messageHandler);
      });

      // 自動刷新頁面（如設置啟用）
      if (this.autoRefresh) {
        console.log('[AssetUpdateManager] 刷新頁面以使用新資源...');
        setTimeout(() => {
          location.reload();
        }, 500);
      } else {
        // 靜默更新模式：發送更新完成事件（可選：顯示輕量級通知）
        console.log('[AssetUpdateManager] 資源已在後台更新，下次進入時生效');

        // 設置完成標誌（給 Topbar 檢查用）
        window._assetUpdateCompleted = true;

        // 觸發自定義事件，應用可以監聽並顯示輕量級提示
        window.dispatchEvent(new CustomEvent('asset-update-available', {
          detail: {
            oldVersion: this.localManifest?.version,
            newVersion: this.remoteManifest?.version
          }
        }));
      }

    } catch (error) {
      console.error('[AssetUpdateManager] 通知 Service Worker 失敗:', error);
    }
  }

  /**
   * 設置定期檢查
   */
  setupPeriodicCheck() {
    // 清理舊的計時器
    if (this.updateCheckTimer) {
      clearInterval(this.updateCheckTimer);
    }

    this.updateCheckTimer = setInterval(async () => {
      console.log('[AssetUpdateManager] 執行定期檢查...');
      await this.checkForAssetUpdates();
    }, this.checkInterval);

    console.log(
      `[AssetUpdateManager] 已設置定期檢查（間隔: ${this.checkInterval / 60000} 分鐘）`
    );
  }

  /**
   * 監聽頁面可見性變化
   */
  setupVisibilityListener() {
    document.addEventListener('visibilitychange', async () => {
      if (!document.hidden) {
        console.log('[AssetUpdateManager] 頁面重新獲得焦點，檢查資源更新...');
        // 返回焦點時檢查更新
        const hasUpdates = await this.checkForAssetUpdates();
        if (hasUpdates) {
          console.log('[AssetUpdateManager] 焦點檢查發現更新');
        }
      }
    });
    console.log('[AssetUpdateManager] 已監聽頁面可見性變化');
  }

  /**
   * 手動觸發檢查（用於調試）
   */
  async forceCheck() {
    console.log('[AssetUpdateManager] 手動觸發檢查');
    return await this.checkForAssetUpdates();
  }

  /**
   * 清理資源
   */
  destroy() {
    if (this.updateCheckTimer) {
      clearInterval(this.updateCheckTimer);
    }
    console.log('[AssetUpdateManager] 已清理');
  }
  }

  // 全局實例暴露到 window，便於調試
  if (typeof window !== 'undefined') {
    window.AssetUpdateManager = AssetUpdateManager;
  }
} else {
  console.log('[AssetUpdateManager] 類已在此頁面上定義，跳過重複聲明');
}
