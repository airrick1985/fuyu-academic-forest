# 資源更新部署指南

## 概述

本項目使用 **方案 A: 完整資源清單 + 自動更新** 系統，實現用戶無感更新。

### 工作流程

```
修改資源文件
    ↓
執行 npm run build （自動生成清單）
    ↓
提交並推送到遠端
    ↓
用戶訪問時自動檢測更新
    ↓
Service Worker 後台下載新資源
    ↓
自動刷新頁面（用戶看到最新內容）
```

---

## 使用步驟

### 1. 修改資源文件

更新或添加任何資源文件（圖片、CSS、JS 等）：

```bash
# 例如：更新 A1.webp
cp path/to/new-A1.webp assets/images/layout/A1.webp
```

### 2. 生成資源清單

在部署前執行此命令自動更新清單：

```bash
# 方式 1：使用 npm build（推薦）
npm run build

# 方式 2：直接運行腳本
node scripts/generate-manifest.js
```

輸出示例：
```
✅ 清單生成成功！

📊 統計信息:
   版本: 1.0.1 → 1.0.2
   總資源數: 140
   輸出文件: assets-manifest.json
   生成時間: 2026/4/9 下午6:03:37
```

### 3. 提交並部署

```bash
# 提交清單文件和其他更改
git add .
git commit -m "更新資源：添加 A1.webp 新版本"

# 推送到遠端
git push origin main

# 或使用 npm script
npm run deploy
```

---

## 資源檢查機制

系統會在以下情況檢查更新：

### 1️⃣ **用戶首次進入網站時**
- 立即檢查 `assets-manifest.json`
- 對比版本號
- 有更新時自動下載

### 2️⃣ **定期檢查（15 分鐘一次）**
- 後台自動檢查遠端清單
- 無需用戶操作

### 3️⃣ **用戶返回焦點時**
- 當用戶從其他應用回到網站時
- 立即檢查並更新

### 4️⃣ **手動檢查（開發用）**
在瀏覽器控制台執行：
```javascript
// 強制檢查更新
window.assetUpdateManager.forceCheck();
```

---

## 快取策略

| 資源類型 | 策略 | 說明 |
|---------|------|------|
| HTML | Network First | 總是優先從網路獲取，確保用戶看到最新頁面 |
| JavaScript | Network First | 確保 JS 邏輯最新 |
| 資源清單 | Network First | 重要：優先檢查遠端清單 |
| CSS/圖片 | Cache First | 性能優先，定期檢查更新 |

---

## 文件說明

### 核心文件

| 文件 | 用途 |
|------|------|
| `assets-manifest.json` | 資源清單（自動生成，記錄所有資源的版本） |
| `js/asset-update-manager.js` | 資源更新檢查器 |
| `js/pwa-register.js` | PWA 和更新系統初始化 |
| `sw.js` | Service Worker（快取管理）|
| `scripts/generate-manifest.js` | 清單生成腳本 |

### 配置

在 `pwa-register.js` 中可以調整：

```javascript
window.assetUpdateManager = new AssetUpdateManager({
  manifestUrl: '/assets-manifest.json',      // 清單 URL
  checkInterval: 15 * 60 * 1000,             // 檢查間隔（15分鐘）
  fetchTimeout: 5000,                        // 網路超時（5秒）
  maxParallelDownloads: 3,                   // 並行下載數
  hashVerify: true,                          // 驗證文件雜湊
  autoRefresh: true                          // 完成後自動刷新
});
```

---

## 常見問題

### Q1: 如何驗證更新是否生效？

在瀏覽器控制台查看：
```
[PWA] Service Worker registered successfully
[AssetUpdateManager] 初始化中...
[AssetUpdateManager] 執行進入時檢查...
[AssetUpdateManager] 檢查資源更新...
```

### Q2: 用戶多久能看到更新？

- **立即更新**：用戶關閉標籤頁重新打開（首次進入檢查）
- **最遲 15 分鐘**：定期檢查機制會發現
- **焦點返回時**：切換回頁面時檢查

### Q3: 如果清單生成失敗怎麼辦？

```bash
# 檢查是否有遺漏文件
node scripts/generate-manifest.js

# 查看詳細錯誤信息
node scripts/generate-manifest.js --verbose
```

### Q4: 如何禁用自動刷新？

在 `pwa-register.js` 中修改：
```javascript
autoRefresh: false  // 改為 false，用戶需手動刷新
```

### Q5: 舊用戶如何獲得更新？

1. **自動方式**：
   - 15 分鐘後定期檢查會發現
   - 用戶返回頁面時會檢查

2. **主動方式**：
   - 可以通知用戶刷新頁面
   - 或讓用戶關閉重新打開網站

---

## 注意事項

### ⚠️ 重要

1. **必須提交清單文件**
   ```bash
   git add assets-manifest.json
   ```

2. **不要手動編輯清單**
   - 清單由 `generate-manifest.js` 自動生成
   - 手動編輯會導致驗證失敗

3. **檢查文件權限**
   - 確保遠端服務器可以訪問 `assets-manifest.json`
   - 清單應該是公開的（無認證）

4. **監控 Service Worker**
   - 在瀏覽器開發者工具中查看 Service Worker 狀態
   - 確保新的 Service Worker 被激活

---

## 故障排查

### 症狀：用戶始終看不到更新

**檢查清單：**
```bash
# 1. 驗證清單文件存在
ls -la assets-manifest.json

# 2. 檢查版本號是否更新
cat assets-manifest.json | grep version

# 3. 確認清單已推送到遠端
git log --oneline | grep manifest
```

### 症狀：清單生成失敗

```bash
# 1. 檢查 Node.js 版本（需要 v12+）
node --version

# 2. 檢查文件權限
ls -la scripts/generate-manifest.js

# 3. 查看詳細錯誤
node scripts/generate-manifest.js 2>&1 | cat
```

### 症狀：Service Worker 不更新

```javascript
// 在瀏覽器控制台執行
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => {
    console.log('Scope:', reg.scope);
    console.log('State:', reg.active?.state);
    // 強制更新
    reg.update();
  });
});
```

---

## 最佳實踐

### ✅ 推薦做法

1. **建立部署流程**
   ```bash
   npm run build  # 自動生成清單
   git add .
   git commit -m "更新資源..."
   npm run deploy  # 推送並通知
   ```

2. **定期檢查清單**
   ```bash
   # 每次部署前驗證
   node scripts/generate-manifest.js
   ```

3. **監控資源更新**
   - 在瀏覽器開發者工具中觀察控制台日誌
   - 確認 Service Worker 消息

4. **文檔記錄**
   - 提交時說明更新了哪些資源
   - 便於日後追蹤

### ❌ 避免做法

1. ❌ 手動編輯 `assets-manifest.json`
2. ❌ 忘記執行 `npm run build`
3. ❌ 只上傳資源文件，不上傳清單
4. ❌ 在部署中途中斷操作

---

## 性能影響

### 網路流量

- **初次訪問**：不增加（只檢查清單）
- **有更新時**：增加新資源的下載量
- **無更新時**：基本不增加（只檢查清單文件 ~10KB）

### 速度影響

- **檢查耗時**：<100ms（通常 <50ms）
- **下載時間**：取決於資源大小和網路
- **刷新時間**：正常頁面刷新時間

---

## 支持

遇到問題？

1. 查看瀏覽器控制台日誌
2. 檢查 Service Worker 狀態（DevTools → Application）
3. 運行 `npm run generate-manifest` 驗證清單
4. 清除瀏覽器快取重新測試

---

**更新時間**: 2026-04-09
**版本**: 1.0
