# 🛠️ DevTools 完整測試指南

## 第一步：確認應用正常啟動

在沒有 DevTools 的情況下，先檢查基本功能：

### 視覺檢查
- ✓ EXE 雙擊後 3-5 秒內打開窗口
- ✓ 窗口標題顯示「富宇學森」
- ✓ 首頁背景、圖片正常顯示
- ✓ 頁面布局整齊（沒有排版錯誤）

### 功能檢查
- ✓ 點擊菜單按鈕，菜單展開
- ✓ 點擊不同頁面能夠切換
- ✓ 文字清晰可讀，顏色正確（深綠主題）
- ✓ 沒有閃爍、卡頓或其他奇怪現象

---

## 第二步：打開 DevTools

### 方法 1: F12 快捷鍵（推薦）

在應用窗口中按：
```
F12
```

應該看到開發者工具面板出現在右側或底部。

### 方法 2: Ctrl+Shift+I

如果 F12 不行，試試：
```
Ctrl + Shift + I
```

### 方法 3: 右鍵檢查

在應用內容上右鍵：
```
滑鼠右鍵 → 檢查元素（Inspect）
```

---

## 第三步：檢查 DevTools 各標籤

### 📋 Console（控制台）標籤

點擊「Console」標籤，檢查：

✅ **應該看到：**
```
[electron] environment detected
✓ Local server running at http://localhost:3456
[SW] Service Worker activated
```

❌ **不應該看到：**
- 任何紅色錯誤訊息
- `404 Not Found` 訊息
- `Failed to load resource` 訊息

**如果有紅色錯誤：**
1. 複製完整的錯誤訊息
2. 記下出現的時間
3. 告訴我是什麼錯誤

### 🌐 Network（網絡）標籤

1. 點擊「Network」標籤
2. **刷新頁面**（Ctrl+R 或 Cmd+R）
3. 檢查所有請求：

✅ **應該都是 200 OK：**
- index.html
- css/variables.css
- css/global.css
- js/spa-router.js
- assets/images/*.webp

❌ **不應該有 404：**
如果看到任何紅色的 404 訊息，告訴我是哪個文件。

### 💾 Application（應用）標籤

1. 點擊「Application」標籤
2. 展開左側菜單
3. 找「Service Workers」

✅ **應該看到：**
```
Service Workers
  └─ http://localhost:3456/
      Status: activated and running
```

如果看到 "unregistered" 或錯誤，告訴我。

---

## 第四步：進階診斷

如果 Console 有錯誤，在控制台執行以下代碼：

### 檢查 1: 確認服務器連接

```javascript
fetch('http://localhost:3456/')
  .then(r => r.status === 200 ? '✓ 服務器正常' : '✗ 狀態碼: ' + r.status)
  .then(msg => console.log(msg))
  .catch(e => console.error('✗ 連接失敗:', e.message))
```

### 檢查 2: 確認 Service Worker

```javascript
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('✓ Service Worker 數量:', regs.length)
  regs.forEach(reg => {
    console.log('  作用域:', reg.scope)
    console.log('  狀態:', reg.active ? '已激活' : '未激活')
  })
})
```

### 檢查 3: 檢查快取

```javascript
caches.keys().then(names => {
  console.log('✓ 快取版本:', names)
  names.forEach(async name => {
    const cache = await caches.open(name)
    const requests = await cache.keys()
    console.log(`  ${name}: ${requests.length} 個文件`)
  })
})
```

### 檢查 4: 查看當前路由

```javascript
console.log('✓ 當前 URL:', window.location.href)
console.log('✓ 路徑名:', window.location.pathname)
console.log('✓ 主機名:', window.location.hostname)
console.log('✓ 端口:', window.location.port)
```

---

## 常見的 Console 錯誤和解決方案

### ❌ 錯誤: "Cannot find module 'xxx'"

**原因：** JavaScript 文件缺少或路徑錯誤

**解決：** 
```javascript
// 在 Console 檢查
document.querySelectorAll('script[src]').forEach(s => {
  console.log(s.src)
})
```

### ❌ 錯誤: "GET /css/xxx 404 Not Found"

**原因：** CSS 文件未被打包或路徑錯誤

**解決：** 我們需要重新檢查打包配置

### ❌ 錯誤: "Service Worker failed to register"

**原因：** Service Worker 文件有語法錯誤

**解決：**
```javascript
// 在 Console 執行
navigator.serviceWorker.register('/sw.js')
  .then(r => console.log('✓ 註冊成功'))
  .catch(e => console.error('✗ 註冊失敗:', e))
```

---

## 我應該告訴你什麼？

測試完成後，請告訴我：

### 如果 DevTools 打開了：
1. Console 標籤顯示的所有訊息（紅色和綠色）
2. Network 標籤有沒有紅色的 404？
3. Application 標籤的 Service Worker 狀態

### 如果 DevTools 還是無法打開：
1. ✓ 應用能正常啟動嗎？
2. ✓ 首頁能正常顯示嗎？
3. ✓ 功能能正常使用嗎？
4. 試過哪些快捷鍵？(F12, Ctrl+Shift+I, 右鍵？)

---

## 快速測試清單

- [ ] EXE 能啟動
- [ ] 首頁顯示正常
- [ ] F12 能打開
- [ ] Console 無紅色錯誤
- [ ] Network 無 404
- [ ] Service Worker 已激活
- [ ] 菜單和導航正常
- [ ] 圖片和樣式完整

**所有項目打 ✓ 後，打包就成功了！** 🎉
