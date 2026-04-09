# 🧪 資源動態更新系統 - 驗收清單

**項目**: 方案 A：完整資源清單 + 自動更新（靜默模式）
**日期**: 2026-04-09
**狀態**: ✅ 待驗收

---

## 📋 改動清單

### 修改的文件

| # | 文件 | 改動內容 | 狀態 |
|---|------|---------|------|
| 1 | `js/asset-update-manager.js` | 調整首次檢查邏輯，改為靜默更新（autoRefresh: false） | ✅ |
| 2 | `js/pwa-register.js` | 啟用 AssetUpdateManager，15分鐘定期檢查 | ✅ |
| 3 | `js/topbar.js` | 改造刷新按鈕為檢查+下載+刷新功能 | ✅ |
| 4 | `package.json` | 添加 `npm run build` 和 `npm run generate-manifest` 命令 | ✅ |
| 5 | `assets-manifest.json` | 更新為 v1.0.2（140 個資源） | ✅ |

### 新建文件

| # | 文件 | 用途 | 狀態 |
|---|------|------|------|
| 1 | `scripts/generate-manifest.js` | 自動生成資源清單的 Node.js 腳本 | ✅ |
| 2 | `DEPLOYMENT.md` | 完整的部署指南 | ✅ |
| 3 | `VERIFICATION.md` | 本驗收清單 | ✅ |

---

## ✅ 驗收檢查清單

### 第 1 部分：代碼質量檢查

- [ ] 所有改動文件語法正確（無編譯錯誤）
- [ ] 沒有 console 錯誤或警告
- [ ] Service Worker 正常註冊
- [ ] AssetUpdateManager 正常初始化
- [ ] 沒有遺漏的依賴或引用

### 第 2 部分：靜默更新功能檢查

#### 首次進入檢查
- [ ] 打開網站時，AssetUpdateManager 自動初始化
- [ ] 控制台看到 `[AssetUpdateManager] 初始化中...`
- [ ] 看到 `[AssetUpdateManager] 執行進入時檢查...`
- [ ] 無更新時：看到 `已是最新版本`
- [ ] 有更新時：見下一項

#### 靜默更新（無刷新）
- [ ] 發現更新時，Service Worker 後台下載資源
- [ ] **重要**：頁面不會自動刷新（用戶無感）
- [ ] 控制台顯示 `資源已在後台更新，下次進入時生效`
- [ ] 可以監聽 `asset-update-available` 事件（可選）

#### 定期檢查（15分鐘）
- [ ] 打開網站 15+ 分鐘
- [ ] 控制台應看到 `執行定期檢查...` 日誌
- [ ] 無錯誤或異常

#### 返回焦點檢查
- [ ] 打開網站後最小化
- [ ] 切換到其他應用
- [ ] 返回網站標籤
- [ ] 控制台應看到 `頁面重新獲得焦點，檢查資源更新...`

### 第 3 部分：手動檢查按鈕功能

#### 按鈕外觀和交互
- [ ] topbar 右側有刷新按鈕
- [ ] 按鈕 title 為 "檢查並更新資源"
- [ ] 鼠標懸停顯示提示文字

#### 按鈕點擊 - 無更新情況
- [ ] 點擊刷新按鈕
- [ ] 按鈕轉圈並禁用
- [ ] 控制台顯示 `用戶手動檢查資源更新...`
- [ ] 檢查完成，按鈕顯示 "已是最新版本"
- [ ] 2秒後恢復正常

#### 按鈕點擊 - 有更新情況
- [ ] 修改一個資源文件（如 A1.webp）
- [ ] 運行 `npm run build` 生成新清單
- [ ] 不提交到 git（這是測試）
- [ ] 點擊刷新按鈕
- [ ] 按鈕轉圈，title 顯示 "檢查中..."
- [ ] 發現更新，title 改為 "發現更新，下載中..."
- [ ] Service Worker 後台下載資源
- [ ] 下載完成，自動刷新頁面
- [ ] 用戶看到新的資源內容

#### 防護機制
- [ ] 檢查中再點擊 - 按鈕不響應（防止重複點擊）
- [ ] 長時間等待（>30秒）- 自動強制刷新
- [ ] 更新失敗 - 顯示 "更新檢查失敗"，2秒後恢復

### 第 4 部分：清單生成腳本檢查

#### 手動運行腳本
```powershell
npm run generate-manifest
```

- [ ] 腳本成功執行
- [ ] 掃描到所有資源（140+ 個）
- [ ] 版本號自動遞增
- [ ] 生成的 `assets-manifest.json` 有效
- [ ] 所有文件路徑使用正斜槓 `/`
- [ ] 每個文件都有 hash、size、mtime

#### 增量更新檢查
- [ ] 修改一個文件（如 A1.webp）
- [ ] 再次運行 `npm run build`
- [ ] 版本號遞增
- [ ] 該文件的 hash 改變
- [ ] 其他文件的 hash 保持不變

### 第 5 部分：配置檢查

#### package.json
- [ ] `npm run build` 存在且能正常執行
- [ ] `npm run generate-manifest` 存在
- [ ] `npm run deploy` 能執行

#### pwa-register.js
- [ ] `autoRefresh: false` （靜默模式）
- [ ] `checkInterval: 15 * 60 * 1000` （15分鐘）
- [ ] AssetUpdateManager 初始化代碼存在

#### asset-update-manager.js
- [ ] 防止重複初始化（isInitialized 標誌）
- [ ] 靜默更新時觸發 `asset-update-available` 事件
- [ ] setupVisibilityListener 正常工作

#### topbar.js
- [ ] 刷新按鈕點擊事件綁定
- [ ] 轉圈動畫 CSS 已添加
- [ ] 錯誤處理完善

---

## 🧪 詳細測試步驟

### 測試環境準備

```powershell
# 1. 清除 dist 文件夾（如果有）
# PowerShell:
Remove-Item -Path dist -Recurse -Force

# 2. 確保 npm 依賴已安裝
npm install

# 3. 啟動開發服務器
npm run dev
# 或
npx serve .
```

### 測試 1: 首次進入 + 靜默更新

**目標**: 驗證首次進入時檢查更新，有更新時靜默下載不刷新

**步驟**:

```javascript
// 1. 打開開發者工具 (F12)
// 2. 切換到 Console 標籤
// 3. 訪問網站首頁 (http://localhost:5173)

// 預期看到日誌：
[PWA] Service Worker registered successfully
[AssetUpdateManager] 初始化中...
[AssetUpdateManager] 執行進入時檢查...
[AssetUpdateManager] 檢查資源更新...
[AssetUpdateManager] 已是最新版本: 1.0.2

// 4. 模擬有更新的情況
// 修改 assets/images/layout/A1.webp（隨便改個文件）
// 運行：npm run build
// 不要提交，只是生成新清單

// 5. 刷新瀏覽器
// 預期看到：
[AssetUpdateManager] 檢測到更新: 1.0.2 → 1.0.3
[SW] 收到資源更新請求: 1 個資源
[SW] 進度: 1/1
[SW] 資源更新完成: { updated: 1, failed: 0 }
[AssetUpdateManager] 資源已在後台更新，下次進入時生效

// 重要：頁面不會自動刷新！
// 用戶仍在正常使用舊內容
```

### 測試 2: 手動刷新按鈕

**目標**: 驗證刷新按鈕的檢查+下載+刷新功能

**步驟**:

```javascript
// 1. 保持上面的測試環境（有未應用的更新）
// 2. 點擊 topbar 右側的刷新按鈕

// 預期行為：
// - 按鈕轉圈
// - title 顯示 "檢查中..."
// - 控制台顯示：[Topbar] 用戶手動檢查資源更新...
// - 發現更新，title 改為 "發現更新，下載中..."
// - 資源下載完成
// - 控制台顯示：[Topbar] 資源更新完成，即將刷新頁面...
// - 自動刷新頁面
// - 用戶看到新資源

// 3. 再點擊一次刷新按鈕
// 預期：
// - 按鈕轉圈
// - 檢查後發現無更新
// - title 顯示 "已是最新版本"（2秒）
// - 恢復正常
```

### 測試 3: 定期檢查 + 焦點檢查

**目標**: 驗證後台定期檢查和返回焦點檢查

**步驟**:

```javascript
// 測試定期檢查（15分鐘）
// 1. 打開網站，打開控制台
// 2. 等待 15 分鐘
// 3. 觀察控制台是否出現：
//    [AssetUpdateManager] 執行定期檢查...

// 測試焦點檢查
// 1. 打開網站
// 2. 按 Alt+Tab 或點擊其他應用（頁面變為不可見）
// 3. 返回網站標籤
// 4. 控制台應看到：
//    [AssetUpdateManager] 頁面重新獲得焦點，檢查資源更新...
```

### 測試 4: 清單生成腳本

**目標**: 驗證自動生成清單的功能

**步驟**:

```powershell
# 1. 修改一個資源文件
Copy-Item assets/images/layout/A1.webp assets/images/layout/A1.webp.bak
# 編輯或替換 A1.webp

# 2. 運行生成腳本
npm run build

# 預期輸出：
✅ 清單生成成功！
📊 統計信息:
   版本: 1.0.2 → 1.0.3
   總資源數: 140
   輸出文件: assets-manifest.json
   生成時間: 2026/4/9 下午6:03:37

# 3. 驗證清單文件 (使用 PowerShell)
Get-Content assets-manifest.json | Select-String 'A1.webp' -Context 3
# 應該看到新的 hash 值和時間戳

# 4. 驗證版本號遞增
(Get-Content assets-manifest.json | ConvertFrom-Json).version
# 應該顯示 1.0.3
```

### 測試 5: 刷新按鈕防護機制

**目標**: 驗證重複點擊防護和超時機制

**步驟**:

```javascript
// 防護 1: 防止重複點擊
// 1. 點擊刷新按鈕
// 2. 快速再點擊多次
// 預期：只執行一次檢查，其他點擊被忽略

// 防護 2: 超時機制
// 1. 斷開網路連接
// 2. 點擊刷新按鈕
// 3. 等待 30+ 秒
// 預期：30秒後自動刷新（即使下載未完成）

// 防護 3: 錯誤恢復
// 1. 在控制台模擬錯誤：
window.assetUpdateManager = null;
// 2. 點擊刷新按鈕
// 預期：
// - 控制台警告：資源管理器未初始化
// - 直接刷新頁面
// - 按鈕 2 秒後恢復
```

---

## 📊 測試結果記錄

### 測試執行日期: _______________

| 測試項 | 結果 | 備註 |
|--------|------|------|
| 代碼質量 | ☐ 通過 ☐ 失敗 | |
| 靜默更新 | ☐ 通過 ☐ 失敗 | |
| 手動按鈕 | ☐ 通過 ☐ 失敗 | |
| 定期檢查 | ☐ 通過 ☐ 失敗 | |
| 焦點檢查 | ☐ 通過 ☐ 失敗 | |
| 清單生成 | ☐ 通過 ☐ 失敗 | |
| 防護機制 | ☐ 通過 ☐ 失敗 | |

**總體結果**: ☐ 通過 ☐ 需改進

**發現的問題**:
```
(如有，列在此)
```

---

## 🚀 驗收通過後的發布步驟

### 第 1 步：清理測試修改

```powershell
# 恢復所有測試修改
git checkout .

# 重新生成乾淨的清單
npm run build
```

### 第 2 步：提交代碼

```powershell
git add .
git commit -m "feat: 實現資源動態更新系統（方案A：完整清單+靜默更新）

- AssetUpdateManager 進入時立即檢查更新
- 改為靜默更新模式（autoRefresh: false）
- topbar 刷新按鈕改為智能檢查功能
- 添加資源清單自動生成腳本
- 完整的部署和驗收文檔

相關文件：
- js/asset-update-manager.js: 調整檢查邏輯
- js/pwa-register.js: 啟用資源管理器
- js/topbar.js: 改造刷新按鈕
- scripts/generate-manifest.js: 新增清單生成腳本
- package.json: 添加 build 命令
- DEPLOYMENT.md: 部署指南
- VERIFICATION.md: 驗收清單
"
```

### 第 3 步：推送到遠端

```powershell
# 推送到主分支
git push origin main

# 或使用 npm script
npm run deploy
```

### 第 4 步：監控上線

```javascript
// 在瀏覽器控制台監控日誌
// 確保看到：
[PWA] Service Worker registered successfully
[AssetUpdateManager] 初始化中...
[AssetUpdateManager] 初始化完成

// 更新時應看到：
[AssetUpdateManager] 檢測到更新...
[AssetUpdateManager] 資源已在後台更新...
```

---

## 📋 驗收簽字

| 角色 | 名字 | 日期 | 簽名 |
|------|------|------|------|
| 開發者 | Claude | | ☑️ |
| 驗收者 | _______ | _______ | ☐ |
| PM | _______ | _______ | ☐ |

---

**驗收指南**: 完成上述所有檢查項後，在各項打 ☑️，然後就可以安心推送到生產環境了！
