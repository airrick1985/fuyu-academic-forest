# Electron 快速開始指南

## ✅ 已完成設置

你的PWA應用已配置好支援Electron封裝！原有的PWA和GitHub Pages部署**完全不受影響**。

### 📦 新增的檔案結構

```
fuyu-academic-forest/
├── electron/
│   ├── main.js                    # Electron 主進程
│   ├── preload.js                 # 安全的 IPC 通訊
│   └── electron-builder.json      # 打包配置（備用）
├── package.json                   # ✨ 新增 build 配置 + Electron scripts
├── ELECTRON_README.md             # 詳細文檔
└── ELECTRON_QUICK_START.md        # 本文件
```

---

## 🚀 使用方式

### 1️⃣ **開發環境測試**
```bash
# 終端 1: 啟動本地開發伺服器
npm run dev

# 終端 2: 啟動 Electron 應用（會自動加載 file:// 協議的 index.html）
npm run electron
```

### 2️⃣ **打包成 Windows 應用**

#### 方案 A: 生成安裝程序 (推薦)
```bash
npm run electron-build-win
```
輸出: `dist/富宇學森 Setup 1.0.0.exe`
- 會彈出安裝嚮導
- 使用者可選擇安裝位置
- 建立開始菜單捷徑和桌面捷徑

#### 方案 B: 生成便攜版 (單一可執行檔)
```bash
npm run electron-pack
```
輸出: `dist/富宇學森-1.0.0-portable.exe`
- 無需安裝，可直接執行
- 適合USB隨身碟或網路分享

---

## 🔄 原始工作流保持不變

### PWA 開發和部署
```bash
# 仍然正常工作
npm run dev         # 開發伺服器
npm run build       # 生成資源清單
npm run deploy      # 推送到 GitHub Pages
```

### Git 提交
```bash
git add .
git commit -m "訊息"
git push origin main
```

**所有原始檔案保持不變**，Electron 配置完全隔離在 `electron/` 目錄。

---

## 🎯 關鍵資訊

| 項目 | 詳情 |
|------|------|
| **應用名稱** | 富宇學森 |
| **應用版本** | 讀取自 `package.json` |
| **視窗大小** | 1920x1080（可調整最小為800x600）|
| **菜單語言** | 繁體中文 |
| **打包類型** | Windows 64-bit |

---

## 📝 版本號管理

每次打包時應用版本號來自 `package.json` 中的 `version`：

```json
{
  "version": "1.0.0"    // 修改這個數字 → 打包時自動使用新版本
}
```

打包後的檔案名稱會包含版本號：
- `富宇學森 Setup 1.0.0.exe`
- `富宇學森-1.0.0-portable.exe`

---

## 💡 常見問題

**Q: 我能否同時維護 PWA 和 Electron 版本？**
✅ 是的！完全獨立。PWA 依舊發佈到 GitHub Pages，Electron 版本單獨打包。

**Q: 應用啟動時白屏？**
✅ 檢查瀏覽器開發者工具（F12）中的錯誤信息。

**Q: 我想自訂應用圖示？**
✅ 將 `favicon.ico` 替換為你的圖示即可。

**Q: 如何分發 .exe？**
✅ 將 `dist/` 中的 `.exe` 檔案分發給使用者即可。

---

## 🔧 進階配置

編輯 `package.json` 中的 `build` 部分以自訂：
- 應用名稱、描述
- 菜單項和快捷鍵
- 安裝程序選項
- 簽名證書（需要簽名時）

---

## 📞 下一步

1. ✅ 現在你可以執行 `npm run electron` 測試應用
2. 📦 準備好時，執行 `npm run electron-build-win` 生成 .exe
3. 🎁 分發 `dist/` 中的檔案給使用者

---

祝你使用愉快！有任何問題查看 [ELECTRON_README.md](./ELECTRON_README.md)
