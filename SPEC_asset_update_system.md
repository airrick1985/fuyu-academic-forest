# 資源動態更新系統規格書
## Asset Dynamic Update System Specification

**狀態**: 草稿  
**版本**: 1.0  
**日期**: 2026-04-09

---

## 1. 概述

### 1.1 目標
實現一個漸進式的資源更新系統，使得用戶在推送新圖檔到 GitHub 後，開啟網站時能自動偵測並更新資源。當網路不可用或更新失敗時，優雅地降級使用本地快取版本。

### 1.2 核心需求
- ✅ 用戶更新 `assets/` 中的圖檔並推送到 GitHub
- ✅ 使用者開啟網站時自動檢測資源變化
- ✅ 自動抓取並替換更新的檔案
- ✅ 離線或網路故障時使用本地快取
- ✅ 無縫體驗，不中斷用戶操作

### 1.3 當前狀態
- 已有全應用級別的版本控制（app-version in meta tag）
- 已有 Service Worker 快取策略（Cache First for assets）
- 已有 `auto-update-version.js` 檢測 assets 變化
- **缺失**: 資源級別的版本控制和增量更新機制

---

## 2. 系統架構

```
┌─────────────────────────────────────────────────────────┐
│                   開發工作流                              │
├─────────────────────────────────────────────────────────┤
│ 1. 更新 assets/ 中的圖檔                                  │
│ 2. git push origin main                                 │
│ 3. GitHub Pages 部署（自動觸發 deploy.yml）             │
│ 4. 部署時執行 auto-update-version.js                    │
│    └─> 生成 assets-manifest.json                       │
└─────────────────────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────┐
│                 用戶端首次開啟網站                         │
├─────────────────────────────────────────────────────────┤
│ 1. 檢查本地有無 assets-manifest.json                     │
│ 2. 從伺服器獲取最新 assets-manifest.json                 │
│ 3. 比對版本，生成更新清單                                │
│ 4. Service Worker 通知：需更新資源                       │
│ 5. 後台增量下載更新的資源                                 │
│ 6. 完成後刷新頁面，使用新資源                              │
└─────────────────────────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────┐
│                   故障降級流程                            │
├─────────────────────────────────────────────────────────┤
│ ✗ 無法連接伺服器                                        │
│   └─> 使用本地快取 assets-manifest.json                 │
│   └─> 本地無法加載資源 → 使用舊版本快取                  │
│                                                         │
│ ✗ assets-manifest.json 下載失敗                         │
│   └─> 繼續使用本地版本                                   │
│   └─> 頁面正常載入（不中斷用戶體驗）                     │
└─────────────────────────────────────────────────────────┘
```

---

## 3. 核心概念

### 3.1 Assets Manifest
資源清單檔案，記錄所有資源的版本信息和雜湊值。

**檔案**: `assets-manifest.json`

```json
{
  "version": "1.0.3",
  "timestamp": 1712659200000,
  "generatedAt": "2026-04-09T12:00:00Z",
  "assets": {
    "assets/images/fuyu-logo.webp": {
      "version": "1",
      "hash": "a1b2c3d4e5f6",
      "size": 24576,
      "mtime": 1712659100000
    },
    "assets/images/hero-forest.webp": {
      "version": "2",
      "hash": "f6e5d4c3b2a1",
      "size": 102400,
      "mtime": 1712659150000
    },
    // ... 其他資源
  }
}
```

### 3.2 版本與雜湊
- **資源級版本**: 單個檔案的版本號（更新時遞增）
- **資源雜湊**: 檔案內容的 SHA256 雜湊（用於檔案完整性檢查）
- **全局版本**: 整個 assets-manifest.json 的版本（用於判斷是否需要重新獲取清單）

### 3.3 快取策略

| 資源類型 | 策略 | 更新方式 |
|---------|------|--------|
| HTML | Network First | 重新加載時強制檢查 |
| CSS/JS | Network First | 版本更新時重新加載 |
| 圖檔 | Cache + Version Check | 按資源清單增量更新 |
| 音訊 | Cache First | 很少變化 |

---

## 4. 實現細節

### 4.1 部署階段（CI/CD）

#### 4.1.1 修改 `auto-update-version.js`
在現有功能基礎上，添加生成 `assets-manifest.json` 的邏輯：

```javascript
// 新增函數
function generateAssetsManifest(version) {
  // 1. 掃描 assets/ 目錄
  // 2. 計算每個檔案的雜湊值和版本
  // 3. 寫入 assets-manifest.json
  // 4. 返回生成的清單
}
```

**輸出**: 
- 生成 `assets-manifest.json` 到項目根目錄
- 版本號與應用版本保持同步

### 4.2 客戶端階段（瀏覽器）

#### 4.2.1 新增 `asset-update-manager.js`

**責任**:
1. 定期檢查資源清單
2. 比對本地與遠端版本
3. 生成更新清單
4. 通知 Service Worker 進行更新
5. 監聽更新進度

**核心方法**:
```javascript
class AssetUpdateManager {
  // 檢查資源清單更新
  async checkForAssetUpdates()
  
  // 獲取本地清單（localStorage 或 IndexedDB）
  async getLocalManifest()
  
  // 獲取遠端清單（帶離線降級）
  async getRemoteManifest()
  
  // 計算差異
  computeDifferences(local, remote)
  
  // 請求 Service Worker 下載更新
  async requestAssetUpdate(updateList)
}
```

#### 4.2.2 更新 `sw.js`

**新增**:
1. 資源清單快取管理
2. 增量下載邏輯
3. 雜湊值驗證
4. 下載進度報告

**策略變化**:
- 圖檔從 Cache First 改為 Cache + Manifest Version Check
- 根據 assets-manifest.json 判斷是否需要重新下載

```javascript
// Service Worker 新增 message handler
self.addEventListener('message', event => {
  if (event.data?.type === 'UPDATE_ASSETS') {
    // 1. 接收更新清單
    // 2. 後台下載新資源
    // 3. 驗證雜湊值
    // 4. 更新快取
    // 5. 通知客戶端完成
  }
});
```

#### 4.2.3 集成到 `pwa-register.js`

```javascript
// 在應用版本檢查後，添加資源清單檢查
const assetManager = new AssetUpdateManager();

// 定期檢查（如每 30 分鐘）
setInterval(() => {
  assetManager.checkForAssetUpdates();
}, 30 * 60 * 1000);

// 頁面獲得焦點時檢查
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    assetManager.checkForAssetUpdates();
  }
});
```

---

## 5. 流程詳解

### 5.1 首次訪問流程

```
┌─ 用戶訪問網站
│
├─ 1️⃣ index.html 載入
│   ├─ 讀取 app-version meta tag (e.g., "1.0.3")
│   ├─ 執行 pwa-register.js
│   └─ 執行 asset-update-manager.js init
│
├─ 2️⃣ AssetUpdateManager 初始化
│   ├─ 檢查 localStorage 中是否存在本地清單
│   ├─ 若無，標記為首次訪問
│   └─ 顯示加載提示
│
├─ 3️⃣ 獲取遠端資源清單
│   ├─ fetch('assets-manifest.json?t=' + Date.now())
│   ├─ 成功：解析 JSON
│   └─ 失敗：使用本地舊清單（如存在）
│
├─ 4️⃣ 比對版本
│   ├─ local.version vs remote.version
│   ├─ 相同：無需更新 → 隱藏加載提示
│   └─ 不同：計算差異清單
│
├─ 5️⃣ 通知 Service Worker 更新
│   ├─ postMessage({ type: 'UPDATE_ASSETS', assets: [...] })
│   └─ Service Worker 後台下載
│
└─ 6️⃣ 完成更新
    ├─ 驗證所有資源雜湊值
    ├─ 保存新清單到 localStorage
    ├─ 隱藏加載提示
    └─ 頁面正常渲染
```

### 5.2 增量更新流程

```
遠端清單:
{
  "assets/images/hero-forest.webp": {
    "version": "2",
    "hash": "abc123"
  }
}

本地清單:
{
  "assets/images/hero-forest.webp": {
    "version": "1",
    "hash": "xyz789"
  }
}

差異計算:
{
  "updated": [
    {
      "path": "assets/images/hero-forest.webp",
      "localVersion": "1",
      "remoteVersion": "2"
    }
  ],
  "deleted": [],
  "added": []
}

Service Worker 動作:
1. 下載 assets/images/hero-forest.webp
2. 計算雜湊值 → 與遠端對比
3. 若相同，更新快取
4. 若不同，重試 3 次，失敗則跳過並通知
5. 完成後 postMessage 回客戶端
```

### 5.3 離線降級流程

```
場景 A: 無網路連接
└─ fetch('assets-manifest.json') 失敗
   ├─ catch 異常
   ├─ 使用本地舊清單（如存在）
   ├─ 無法加載的資源 → Service Worker 返回快取版本
   └─ 頁面正常顯示（可能是舊資源）

場景 B: 網路不穩定（超時）
└─ fetch 超時
   ├─ 設置 timeout: 5000ms
   ├─ 超時則使用本地清單
   └─ 頁面正常顯示

場景 C: CDN 返回 404（檔案被刪除）
└─ Service Worker 下載返回 404
   ├─ 記錄錯誤日誌
   ├─ 保留舊快取版本
   ├─ 頁面繼續使用舊資源
   └─ 下次訪問時重試

場景 D: 雜湊值不匹配（檔案損壞）
└─ 下載後驗證失敗
   ├─ 重試 3 次
   ├─ 若仍失敗，保留舊快取
   └─ 頁面使用舊版本
```

---

## 6. 文件清單

### 新增文件

| 檔案 | 描述 |
|------|------|
| `js/asset-update-manager.js` | 資源更新管理器 |
| `assets-manifest.json` | 資源清單（由部署階段自動生成） |

### 修改文件

| 檔案 | 變更 |
|------|------|
| `scripts/auto-update-version.js` | 添加生成 `assets-manifest.json` 邏輯 |
| `sw.js` | 添加資源更新處理、雜湊驗證 |
| `js/pwa-register.js` | 集成 AssetUpdateManager |
| `index.html` 及其他 HTML | 在 body 末尾引入 asset-update-manager.js |
| `.github/workflows/deploy.yml` | 確保部署時執行 auto-update-version.js |

---

## 7. 實現階段

### Phase 1: 基礎框架 (Week 1)
- [ ] 修改 `auto-update-version.js` 生成 `assets-manifest.json`
- [ ] 創建 `js/asset-update-manager.js` 基本框架
- [ ] 集成到 `pwa-register.js`

### Phase 2: Service Worker 增強 (Week 2)
- [ ] 更新 `sw.js` 資源清單管理
- [ ] 實現增量下載邏輯
- [ ] 添加雜湊值驗證

### Phase 3: 測試和優化 (Week 3)
- [ ] 本地測試（模擬各種網路狀況）
- [ ] 部署到 GitHub Pages 測試
- [ ] 性能優化（並行下載、進度報告）

### Phase 4: 監控和文檔 (Week 4)
- [ ] 添加日誌和監控
- [ ] 編寫用戶使用文檔
- [ ] 優化 UI/UX 提示

---

## 8. 技術細節

### 8.1 資源清單生成算法

```javascript
function generateManifest() {
  const manifest = {
    version: APP_VERSION,
    timestamp: Date.now(),
    assets: {}
  };

  // 遞迴掃描 assets/ 目錄
  walkAssets('./assets', (filePath, relativePath) => {
    const content = fs.readFileSync(filePath);
    const hash = crypto.createHash('sha256')
      .update(content)
      .digest('hex');
    
    manifest.assets[relativePath] = {
      hash: hash.substring(0, 12), // 前 12 位
      size: content.length,
      mtime: fs.statSync(filePath).mtimeMs
    };
  });

  return manifest;
}
```

### 8.2 差異計算算法

```javascript
function computeDifferences(local, remote) {
  const result = {
    updated: [],
    added: [],
    deleted: []
  };

  // 檢查更新和新增
  for (const [path, remoteAsset] of Object.entries(remote.assets)) {
    const localAsset = local.assets?.[path];
    
    if (!localAsset) {
      result.added.push({ path, ...remoteAsset });
    } else if (localAsset.hash !== remoteAsset.hash) {
      result.updated.push({ path, ...remoteAsset });
    }
  }

  // 檢查刪除
  for (const path of Object.keys(local.assets || {})) {
    if (!remote.assets[path]) {
      result.deleted.push(path);
    }
  }

  return result;
}
```

### 8.3 Service Worker 快取管理

```javascript
// 新增專用快取名稱
const ASSET_MANIFEST_CACHE = 'fuyu-asset-manifest-v1';
const ASSET_VERSIONED_CACHE = 'fuyu-assets-v{version}';

// 快取資源版本化
await cache.put(
  request,
  new Response(blob, {
    headers: {
      'X-Asset-Hash': assetHash,
      'X-Asset-Version': assetVersion,
      'Cache-Control': 'max-age=31536000' // 1 year
    }
  })
);
```

---

## 9. 兼容性和降級

### 9.1 瀏覽器兼容性
- ✅ Service Worker 支持的瀏覽器（現代瀏覽器）
- ⚠️ 不支持 Service Worker 的舊版瀏覽器：
  - 每次訪問強制檢查伺服器
  - 使用 HTTP 快取頭進行浏覽器快取

### 9.2 無 Service Worker 降級

```javascript
if (!('serviceWorker' in navigator)) {
  // 直接使用 HTTP 快取策略
  // 在 assets 資源上設置 no-cache 頭
  // 浏覽器會自動檢查 ETag 和 Last-Modified
}
```

---

## 10. 安全考慮

### 10.1 完整性檢查
- 所有資源下載後驗證 SHA256 雜湊值
- 雜湊值不匹配時，保留舊版本並通知

### 10.2 版本回滾
- 若新版本有問題，可手動修改 assets-manifest.json
- 用戶下次訪問時將降級到舊版本

### 10.3 CDN 緩存
- assets-manifest.json 設置 Cache-Control: no-cache
- 確保用戶每次都檢查最新清單
- 單個資源可設置長期快取（因為版本在 hash 中）

---

## 11. 性能指標

| 指標 | 目標 | 方法 |
|------|------|------|
| 首次加載時間 | < 5s | 非阻塞式後台更新 |
| 增量更新時間 | < 500ms | 並行下載、懶加載 |
| 離線體驗 | 無中斷 | 完整降級策略 |
| 快取命中率 | > 95% | 版本管理 + 智能過期 |

---

## 12. 監控和日誌

### 12.1 記錄點
```javascript
// 資源更新開始
console.log('[AssetUpdate] Starting asset update check');

// 版本比較結果
console.log('[AssetUpdate] Found updates:', differences);

// 下載進度
console.log('[AssetUpdate] Downloaded 45/100 assets');

// 驗證失敗
console.warn('[AssetUpdate] Hash mismatch for', filePath);

// 更新完成
console.log('[AssetUpdate] Complete! Refreshing page');
```

### 12.2 遠端日誌（可選）
可考慮發送更新統計到分析服務（如 Google Analytics）：
- 更新檢查次數
- 實際更新資源數
- 失敗率和常見錯誤

---

## 13. 配置參數

```javascript
// asset-update-manager.js 配置
const CONFIG = {
  MANIFEST_URL: '/assets-manifest.json',
  CHECK_INTERVAL: 30 * 60 * 1000,      // 30分鐘
  FETCH_TIMEOUT: 5000,                  // 5秒
  RETRY_COUNT: 3,                       // 重試次數
  MAX_PARALLEL_DOWNLOADS: 3,            // 並行下載數
  HASH_VERIFY: true,                    // 驗證雜湊值
  AUTO_REFRESH: true                    // 完成後自動刷新
};
```

---

## 14. 故障排查

| 問題 | 診斷 | 解決 |
|------|------|------|
| 資源未更新 | 檢查 assets-manifest.json 版本 | 確保部署執行了 auto-update-version.js |
| 舊資源仍然顯示 | Service Worker 未清空快取 | 手動清空快取或更改 cache name |
| 網頁一直在加載 | 更新陷入無限迴圈 | 檢查 Service Worker 日誌 |
| 某些資源 404 | CDN 未同步 | 等待 GitHub Pages CDN 同步（通常 1 分鐘內） |

---

## 15. 未來增強

- [ ] 增量同步（只下載 diff）
- [ ] WebP 格式自適應降級
- [ ] 預加載常用資源
- [ ] 更新進度視覺化
- [ ] A/B 測試支持
- [ ] 按地區的資源 CDN 優化

---

## 附錄 A: 相關文件參考

- **當前 PWA 版本控制**: `sw.js`, `pwa-register.js`, `auto-update-version.js`
- **GitHub Actions 部署**: `.github/workflows/deploy.yml`
- **資源目錄**: `assets/` (包含所有 images, sound, etc.)
- **應用配置**: `package.json`, `manifest.json`, `version.json`

---

**文檔結束**

