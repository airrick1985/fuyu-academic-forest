/**
 * 資源動態更新管理器
 *
 * 功能：
 * 1. 檢查資源清單更新
 * 2. 對比本地與遠端版本
 * 3. 通知 Service Worker 進行增量下載
 * 4. 管理本地快取清單
 */

class AssetUpdateManager {
  constructor(options = {}) {
    this.manifestUrl = options.manifestUrl || '/assets-manifest.json';
    this.checkInterval = options.checkInterval || 30 * 60 * 1000; // 30分鐘
    this.fetchTimeout = options.fetchTimeout || 5000; // 5秒
    this.retryCount = options.retryCount || 3;
    this.maxParallelDownloads = options.maxParallelDownloads || 3;
    this.hashVerify = options.hashVerify !== false;
    this.autoRefresh = options.autoRefresh !== false;

    this.localManifest = null;
    this.remoteManifest = null;
    this.isUpdating = false;
    this.updateCheckTimer = null;

    // 初始化本地清單
    this.loadLocalManifest();
  }

  /**
   * 初始化管理器
   */
  async init() {
    console.log('[AssetUpdateManager] 初始化中...');

    try {
      // 首次進入時立即檢查
      await this.checkForAssetUpdates();

      // 設置定期檢查
      this.setupPeriodicCheck();

      // 監聽頁面可見性變化
      this.setupVisibilityListener();

      console.log('[AssetUpdateManager] 初始化完成');
    } catch (error) {
      console.error('[AssetUpdateManager] 初始化失敗:', error);
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
   * 通知 Service Worker 進行更新
   */
  async notifyServiceWorkerUpdate(differences, remoteManifest) {
    if (!('serviceWorker' in navigator)) {
      console.log('[AssetUpdateManager] 瀏覽器不支持 Service Worker');
      return;
    }

    try {
      const controller = navigator.serviceWorker.controller;

      if (!controller) {
        console.log('[AssetUpdateManager] Service Worker 尚未準備好');
        return;
      }

      // 構建更新列表（只包含更新和新增）
      const updateList = [
        ...differences.updated,
        ...differences.added
      ];

      console.log(`[AssetUpdateManager] 通知 Service Worker 下載 ${updateList.length} 個資源`);

      // 發送消息給 Service Worker
      controller.postMessage({
        type: 'UPDATE_ASSETS',
        updateList: updateList,
        totalCount: updateList.length,
        maxParallel: this.maxParallelDownloads,
        hashVerify: this.hashVerify
      });

      // 等待更新完成（帶超時）
      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.log('[AssetUpdateManager] 等待 Service Worker 回應超時');
          resolve();
        }, 60000); // 60秒超時

        const messageHandler = (event) => {
          if (event.data?.type === 'UPDATE_ASSETS_COMPLETE') {
            clearTimeout(timeout);
            const { success, updated, failed } = event.data;

            console.log(
              `[AssetUpdateManager] 更新完成 (成功: ${updated}, 失敗: ${failed})`
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

        navigator.serviceWorker.addEventListener('message', messageHandler);
      });

      // 自動刷新頁面（如設置啟用）
      if (this.autoRefresh) {
        console.log('[AssetUpdateManager] 刷新頁面以使用新資源...');
        setTimeout(() => {
          location.reload();
        }, 500);
      }

    } catch (error) {
      console.error('[AssetUpdateManager] 通知 Service Worker 失敗:', error);
    }
  }

  /**
   * 設置定期檢查
   */
  setupPeriodicCheck() {
    this.updateCheckTimer = setInterval(async () => {
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
        console.log('[AssetUpdateManager] 頁面重新獲得焦點，檢查更新...');
        await this.checkForAssetUpdates();
      }
    });
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
