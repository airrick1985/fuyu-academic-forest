# PWA 自動更新機制優化指南

## 概述

您的PWA已升級為**主動更新機制**，不再需要用戶手動按 `Ctrl+R` 才能更新。系統會在用戶打開應用時自動檢查並下載最新版本。

---

## 改動說明

### 1. **version.json** - 版本控制文件（新增）
```json
{
  "version": "1.0.0",
  "timestamp": 1712659200000
}
```

**用途**：存儲應用的最新版本號，PWA 會定期檢查此文件

**使用方式**：每次部署新版本時，只需更新此文件中的版本號即可
```bash
# 更新版本號示例
{
  "version": "1.0.1",
  "timestamp": 1712745600000
}
```

### 2. **js/pwa-register.js** - 更新註冊邏輯（已改進）

**新增功能**：
- ✅ **主動版本檢查**：在頁面加載前檢查遠端版本
- ✅ **加載覆蓋層**：顯示進度條讓用戶知道正在更新
- ✅ **離線支持**：無網路時優雅降級，直接使用快取資源
- ✅ **自動更新**：檢測到新版本時自動下載並重新加載
- ✅ **用戶提示**：若用戶正在使用應用，會出現 10 秒倒計時提示

### 3. **sw.js** - Service Worker（已改進）

**改進**：
- 新增 `UPDATE_COMPLETE` 消息機制
- 確保版本更新後清理舊快取
- 向所有打開的分頁廣播更新完成

### 4. **所有 HTML 文件** - 加載界面（已更新）

**新增**：
- 加載覆蓋層樣式（在 `<head>` 中）
- 加載覆蓋層 HTML 元素（在 `<body>` 開始後）

受影響的文件：
- index.html
- floor-plan.html
- materials.html
- location.html
- brand-fuyu.html
- construction.html
- brand-team.html
- exterior-3d.html
- panorama.html
- public-3d.html
- coming-soon.html

---

## 使用流程

### 普通用戶體驗

1. **首次打開 PWA**
   ```
   [加載覆蓋層顯示 "正在檢查更新..."]
   ↓
   檢查 version.json 版本
   ↓
   若有新版本 → 下載資源 → 重新加載
   若無新版本 → 隱藏覆蓋層 → 進入應用
   若離線 → 使用快取 → 直接進入
   ```

2. **應用使用中檢測到更新**
   ```
   [頂部綠色提示條]
   "✨ 新版本已推出"
   "版本 1.0.0 → 1.0.1，10 秒後自動更新..."
   
   [用戶可選擇]
   - 立即更新 → 立即重新加載
   - 關閉提示 → 繼續使用（稍後提示）
   - 不操作 → 10 秒後自動更新
   ```

3. **多分頁/多設備同步**
   - Service Worker 會向所有打開的分頁廣播更新完成消息
   - 用戶在另一個分頁切換回應用時會被提示更新

---

## 開發者部署指南

### 步驟 1：更新應用版本

在 HTML 的 `<head>` 中更新版本號：
```html
<meta name="app-version" content="1.0.1">
```

### 步驟 2：更新 version.json

```bash
# 編輯 version.json
{
  "version": "1.0.1",
  "timestamp": 1712832000000
}
```

### 步驟 3：部署到伺服器

確保以下文件都已上傳：
- `version.json` - 版本文件
- `js/pwa-register.js` - 更新邏輯
- `sw.js` - Service Worker
- 所有 HTML 文件
- 更新的資源文件（CSS、JS、圖片等）

### 步驟 4：驗證部署

1. 打開應用，檢查瀏覽器控制台
2. 應該看到日誌：
   ```
   [PWA] Service Worker registered successfully
   [PWA] 檢測到版本更新：1.0.0 → 1.0.1
   ```
3. 應用會自動顯示加載覆蓋層並重新加載

---

## 技術細節

### 版本檢查流程

```
頁面加載
  ↓
performInitialUpdateCheck()
  ↓
checkRemoteVersion() → 取得 version.json
  ↓
版本比較
  ├─ 有新版本
  │  ├─ showLoadingOverlay()
  │  ├─ 通知 Service Worker
  │  ├─ 等待更新完成（2秒超時）
  │  └─ location.reload()
  │
  └─ 無新版本
     └─ hideLoadingOverlay()
```

### 快取策略

- **HTML 頁面**：Network First（優先網路，失敗則用快取）
- **靜態資源**：Cache First（優先快取，不可用時請求網路）
- **Cross-origin**：不快取

### 離線行為

- 若無網路連線，`checkRemoteVersion()` 返回 `null`
- 應用直接使用快取資源，正常載入
- 不會因無法檢查更新而影響用戶體驗

---

## 常見問題

### Q1：如何禁用自動更新？
**A**：在 `js/pwa-register.js` 中註釋掉 `performInitialUpdateCheck()` 調用

### Q2：更新後用戶需要做什麼？
**A**：什麼都不需要做！系統會自動檢查、下載、更新

### Q3：離線用戶會被影響嗎？
**A**：否，離線用戶會使用快取資源，正常進入應用

### Q4：多個分頁同時打開會怎樣？
**A**：每個分頁都會收到更新通知，用戶可按需更新

### Q5：更新需要多久？
**A**：取決於資源大小和網速，通常 2-5 秒

---

## 監控和日誌

所有更新操作都會記錄到瀏覽器控制台：

```javascript
[PWA] Service Worker registered successfully
[PWA] 檢測到版本更新：1.0.0 → 1.0.1
[PWA] 正在下載新版本...
[PWA] 版本已更新，重新加載頁面
[PWA] 已是最新版本: 1.0.0
[PWA] 離線狀態，使用快取版本: 1.0.0
```

打開開發者工具（F12）→ Console 即可查看

---

## 更新清單

- [x] 創建 `version.json` 版本控制文件
- [x] 改進 `pwa-register.js` 主動檢查機制
- [x] 改進 `sw.js` 更新完成通知
- [x] 為所有 HTML 文件添加加載覆蓋層
- [x] 實現離線優雅降級
- [x] 支持多分頁同步更新

---

## 下一步建議

1. **測試更新流程**
   - 修改 `version.json` 的版本號
   - 打開應用確認自動更新

2. **監控更新效果**
   - 檢查瀏覽器控制台日誌
   - 測試離線場景

3. **用戶通知**
   - 告知用戶已支持自動更新
   - 不再需要手動刷新

---

## 支援

如有問題，請檢查：
1. `version.json` 是否存在且格式正確
2. 瀏覽器控制台日誌是否有錯誤
3. Service Worker 是否已正確註冊
4. 檔案是否完整上傳到伺服器
