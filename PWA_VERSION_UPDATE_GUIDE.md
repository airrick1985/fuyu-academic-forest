# PWA 版本更新指南

## 📋 快速指南

每次部署新版本時，按照以下步驟操作：

### 步驟 1: 確定新版本號
遵循語義化版本 (Semantic Versioning)：
- **1.0.0** → **1.0.1** 修復 Bug（補丁版本）
- **1.0.0** → **1.1.0** 新增功能但向後相容（次要版本）
- **1.0.0** → **2.0.0** 破壞性變更（主要版本）

**目前版本：1.0.0**

---

### 步驟 2: 更新所有 HTML 的版本號

修改每個 HTML 檔案的第 6 行（或附近）：

```html
<meta name="app-version" content="1.0.0">
```

改為新版本，例如：

```html
<meta name="app-version" content="1.0.1">
```

**需更新的 11 個 HTML 檔案：**
- [ ] index.html
- [ ] floor-plan.html
- [ ] materials.html
- [ ] panorama.html
- [ ] location.html
- [ ] exterior-3d.html
- [ ] brand-team.html
- [ ] brand-fuyu.html
- [ ] coming-soon.html
- [ ] public-3d.html
- [ ] construction.html

---

### 步驟 3: 部署到伺服器

將修改後的檔案上傳到你的伺服器。

---

## 🔄 版本更新流程

### 用戶端自動發生的事情：

1. **首次訪問** 
   - Service Worker 記住當前版本 (1.0.0)
   - 快取檔案名稱為 `fuyu-forest-1.0.0`

2. **新版本部署後（1.0.1）**
   - 用戶再次訪問應用
   - Service Worker 檢測到版本變化
   - 自動清除舊快取 (`fuyu-forest-1.0.0`)
   - 建立新快取 (`fuyu-forest-1.0.1`)
   - 下次頁面刷新或重開應用時自動使用新資源

3. **用戶體驗**
   - ✅ 無需手動刷新
   - ✅ 無需清除瀏覽器快取
   - ✅ 完全無感更新

---

## 🧪 測試更新機制

### 本機測試步驟：

1. **打開瀏覽器開發者工具** (F12)
2. 切換到 **Console** 標籤
3. 你應該看到日誌：
   ```
   [PWA] Service Worker registered successfully
   [SW] Activating with cache version: 1.0.0
   ```

4. **模擬版本更新：**
   - 編輯某個 HTML 檔案，改變版本號
   - 重新整理頁面
   - 檢查 Console，應該看到：
   ```
   [PWA] Version change detected: 1.0.0 → 1.0.1
   [SW] Version update detected: 1.0.0 → 1.0.1
   [SW] Deleting old cache: fuyu-forest-1.0.0
   ```

5. **驗證快取清除：**
   - DevTools → **Application** → **Cache Storage**
   - 應該只看到 `fuyu-forest-1.0.1` 的快取
   - 舊版本 `fuyu-forest-1.0.0` 應該被刪除

---

## 📊 版本歷史記錄

記錄每次更新的內容（可選但推薦）：

| 版本 | 日期 | 更新內容 |
|------|------|---------|
| 1.0.0 | 2026-04-03 | PWA 初始版本，支援離線訪問、自動版本更新 |
| 1.0.1 | YYYY-MM-DD | 修復：[描述 Bug 修復] |
| 1.1.0 | YYYY-MM-DD | 新增：[描述新功能] |

---

## ⚠️ 常見問題

### Q: 如果忘記更新某個 HTML 的版本號怎辦？
**A:** 沒關係，只要至少一個頁面的版本號更新了，Service Worker 就會偵測到並清除舊快取。建議統一所有檔案的版本號以避免混淆。

### Q: 用戶會看到舊內容嗎？
**A:** 不會。Service Worker 在激活時會立即清除舊快取。用戶重新開啟應用時自動使用新資源。

### Q: 能否自動化更新版本號？
**A:** 可以。如果使用構建工具（如 Webpack、Vite），可以配置自動更新版本號。目前手動更新 11 個檔案約需 2-3 分鐘。

### Q: 離線用戶會怎樣？
**A:** 
- 新版本部署後，離線用戶仍使用本地舊快取，可正常使用
- 當用戶重新連線並訪問應用時，自動更新到新版本

### Q: 如何強制用戶立即更新？
**A:** 目前為靜默更新。如需強制通知，可在 HTML 中添加更新提示 Banner。

---

## 🚀 最佳實踐

1. **版本號遞增** — 不要跳躍版本號（如 1.0.0 → 3.0.0）
2. **一致性** — 確保所有 HTML 檔案版本號相同
3. **記錄變更** — 在版本歷史表中記錄更新內容
4. **測試後再部署** — 本機測試版本更新機制後再上線
5. **監控瀏覽器日誌** — 查看 Console 確認版本更新成功

---

## 📞 技術細節

### Service Worker 快取策略：

```
快取名稱格式: fuyu-forest-{版本號}

例如：
- fuyu-forest-1.0.0  ← 舊版本（自動刪除）
- fuyu-forest-1.0.1  ← 當前版本（保留）
```

### 版本檢查位置：

- **main thread**: `js/pwa-register.js` — 監聽 HTML 版本號變化
- **service worker**: `sw.js` — 處理快取清除

### 檢查週期：

- 頁面載入時：立即檢查
- 定期檢查：每 5 小時
- 頁面可見時：視窗回到前景時檢查

---

**最後更新：2026-04-03**
