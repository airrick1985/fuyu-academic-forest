# PWA 圖片更新完整流程

## 🎯 更新圖片並自動推送給 PWA 用戶

當您需要更新圖片並讓已安裝 PWA 的用戶無感更新時，按以下步驟進行：

---

## 📋 完整流程（10 步）

### 第 1 步：在 IDE 中替換圖片
```
文件瀏覽器 → assets/images/ 
  ↓
刪除舊圖片或直接覆蓋
  ↓
拖拽新圖片到相應位置
```

**支持的格式**：
- `.webp` (推薦，檔案最小)
- `.jpg` / `.png` (確保已優化)
- `.ico` (favicon)

**路徑示例**：
- `assets/images/hero-forest.webp` - 首頁背景
- `assets/images/layout/A1.webp` - 佈局圖片
- `assets/images/fuyu-logo.webp` - Logo

---

### 第 2 步：更新所有 HTML 的版本號

在每個 HTML 檔案的 `<head>` 中更新版本號：

```html
<!-- 改前 -->
<meta name="app-version" content="1.0.0">

<!-- 改後 -->
<meta name="app-version" content="1.0.1">
```

**需要修改的 HTML 檔案**：
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

**快速方法**：
在 IDE 中用「查找和替換」：
```
查找：content="1.0.0"
替換為：content="1.0.1"
全部替換
```

---

### 第 3 步：⭐ 增加資源版本參數（關鍵！）

在所有 HTML 檔案中，為 CSS 和 JS 添加版本參數：

```html
<!-- CSS -->
<link rel="stylesheet" href="css/variables.css?v=1.0.1">
<link rel="stylesheet" href="css/global.css?v=1.0.1">
<link rel="stylesheet" href="css/topbar.css?v=1.0.1">
<!-- ... 所有 CSS 檔案 -->

<!-- JS -->
<script src="js/topbar.js?v=1.0.1"></script>
<script src="js/fireflies.js?v=1.0.1"></script>
<!-- ... 所有 JS 檔案 -->
```

**為什麼重要？**
- 版本參數強制瀏覽器重新下載資源
- 舊用戶無需按 Ctrl+R 就會自動更新
- 否則舊快取可能阻止圖片更新

**快速方法**：
用「查找和替換」：
```
查找：(\.(css|js))"
替換為：$1?v=1.0.1"
（需要支持正則表達式）
```

---

### 第 4 步：更新 version.json

編輯 `version.json` 檔案：

```json
{
  "version": "1.0.1",
  "timestamp": 1712918400000
}
```

**timestamp 說明**：
- 使用當前時間戳（毫秒）
- 可用：`Date.now()` 或線上工具生成
- 用途：版本識別和調試

---

### 第 5 步：在 IDE 中 Commit

按 Ctrl+Shift+G 打開 Git 面板：

1. **查看改動** - 確認所有檔案都在列表中：
   ```
   ✓ index.html
   ✓ floor-plan.html
   ✓ materials.html
   ✓ ... (其他 HTML)
   ✓ assets/images/... (新圖片)
   ✓ version.json
   ```

2. **暫存全部改動** - 點擊 「+」按鈕或右鍵 → Stage All Changes

3. **輸入 Commit 訊息**：
   ```
   更新圖片並升級 PWA 版本至 1.0.1

   改動：
   - 更新 assets/images 中的圖片檔案
   - 升級所有 HTML 版本號至 1.0.1
   - 添加資源版本參數確保無快取更新
   - 更新 version.json

   已安裝 PWA 用戶將自動無感更新
   ```

4. **Commit** - 按 Ctrl+Enter 或點擊✓

---

### 第 6 步：推送到 GitHub

在 Git 面板中：
- 點擊「...」菜單 → Push
- 或按 Ctrl+Shift+P → Git: Push

```
[推送結果]
✓ 已推送到 origin/main
  e9c756e...ad2c81c
```

---

### 第 7 步：GitHub Actions 自動部署

推送後自動觸發：
1. GitHub Actions 工作流程開始執行
2. 自動上傳檔案到 GitHub Pages
3. 大約 **2-5 分鐘** 完成

**實時查看**（可選）：
- 前往 https://github.com/airrick1985/fuyu-academic-forest/actions
- 查看最新的「Deploy to GitHub Pages」工作流程
- 看綠色✓表示成功，紅色✗表示失敗

---

### 第 8 步：等待 CDN 更新（2-3 分鐘）

部署完成後，給 CDN 時間同步：
```
部署完成
  ↓（1-2 分鐘）
CDN 更新快取
  ↓（1 分鐘）
用戶端可見
```

---

### 第 9 步：驗證新圖片已上線

打開瀏覽器：

1. **清快取後訪問**（檢查伺服器側）：
   ```
   按 Ctrl+Shift+Delete 開啟清除瀏覽數據
   ↓
   勾選「圖片」和「快取的圖片和檔案」
   ↓
   清除
   ↓
   重新訪問網站
   ```

2. **檢查圖片已更新**：
   - 右鍵圖片 → 在新分頁中開啟
   - 確認是新圖片

3. **檢查版本號**：
   - 按 F12 打開控制台
   - 輸入：`document.querySelector('meta[name="app-version"]').content`
   - 應顯示：`1.0.1`

---

### 第 10 步：已安裝 PWA 用戶自動更新

用戶**無需任何操作**，以下情況會自動更新：

1. **下次打開 PWA 時**：
   ```
   用戶打開 PWA
     ↓
   顯示加載覆蓋層 "正在檢查更新..."
     ↓
   檢查到 version.json 中的新版本 1.0.1
     ↓
   自動下載資源（包括新圖片）
     ↓
   頁面重新加載並顯示新圖片 ✅
   ```

2. **瀏覽器控制台會顯示**：
   ```
   [PWA] Service Worker registered successfully
   [PWA] 檢測到版本更新：1.0.0 → 1.0.1
   [PWA] 版本已更新，重新加載頁面
   ```

---

## 📝 檢查清單

更新前檢查：
- [ ] 所有 HTML 檔案版本號已更新
- [ ] 所有 CSS/JS 資源有版本參數
- [ ] version.json 已更新
- [ ] 圖片檔案已上傳並命名正確

推送前檢查：
- [ ] 所有改動都在 Git 暫存區
- [ ] Commit 訊息清晰描述
- [ ] 本地測試無誤

推送後檢查：
- [ ] GitHub Actions 執行成功（綠色✓）
- [ ] 2-3 分鐘後新圖片在線
- [ ] PWA 用戶看到加載覆蓋層並自動更新

---

## 🚀 快速參考

### 標準更新版本號流程

```bash
# 1. IDE 中修改圖片

# 2. 找到替換所有版本號
# 查找：content="1.0.0" 或 ?v=1.0.0
# 替換為：content="1.0.1" 或 ?v=1.0.1

# 3. 更新 version.json
{
  "version": "1.0.1",
  "timestamp": $(date +%s)000
}

# 4. 全部暫存、Commit、Push
git add -A
git commit -m "更新圖片並升級 PWA 版本至 1.0.1"
git push

# 5. 完成！自動部署中...
```

---

## ⚠️ 常見錯誤

| 錯誤 | 症狀 | 解決 |
|-----|------|------|
| **忘記版本參數** | 舊用戶看不到新圖片 | 為 CSS/JS 添加 `?v=X.X.X` |
| **只改 version.json** | PWA 檢查到新版本但資源仍是舊的 | 同時更新 HTML 版本號 |
| **版本號不一致** | PWA 邏輯混亂 | 確保所有版本號統一 |
| **忘記 Commit** | 改動沒推送 | 確保改動進入 Git 暫存區 |
| **CDN 未更新** | 仍看不到新圖片 | 等待 2-3 分鐘或硬刷新（Ctrl+Shift+R） |

---

## 💡 提示

- **圖片優化**：使用 WebP 格式，檔案更小
- **批量替換**：用 IDE 的查找替換功能提高效率
- **版本管理**：採用語義化版本（1.0.0 → 1.0.1 → 1.1.0 → 2.0.0）
- **測試**：推送前在本地開發環境測試
- **監控**：檢查 GitHub Actions 日誌確保部署成功

---

## 📞 需要幫助？

如果 PWA 用戶沒有自動更新，檢查：
1. version.json 是否已上傳到伺服器
2. HTML 版本號是否已更新
3. 資源版本參數是否都添加了
4. GitHub Actions 是否執行成功
5. 用戶是否完全關閉後重新打開 PWA
