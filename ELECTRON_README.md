# Electron 封裝指南

本專案支援將 PWA 應用封裝成 Windows 獨立應用。

## 📋 先決條件

- Node.js 14+ 
- npm 或 yarn

## 🚀 快速開始

### 1. 開發模式測試
```bash
# 在另一個終端開啟開發伺服器
npm run dev

# 在新終端啟動 Electron
npm run electron
```

### 2. 打包 Windows 應用

#### 生成安裝程序 (.exe 安裝程式)
```bash
npm run electron-build-win
```
輸出位置: `dist/` 目錄

#### 生成便攜版本 (單一 .exe 檔案)
```bash
npm run electron-pack
```
輸出位置: `dist/` 目錄

## 📁 檔案結構

```
fuyu-academic-forest/
├── electron/
│   ├── main.js                 # Electron 主進程
│   ├── preload.js              # 安全的 IPC 通訊
│   └── electron-builder.json   # 打包配置
├── index.html                  # 原始 PWA 應用（不需修改）
├── package.json                # 原始配置（已保留）
└── ELECTRON_README.md          # 本文件
```

## 🔧 配置說明

- **electron-builder.json** 定義應用打包設定
  - `productName`: 應用名稱 "富宇學森"
  - `files`: 要包含在應用中的文件
  - `nsis`: Windows 安裝程序配置
  - `portable`: 便攜版本配置

## ✨ 功能

- ✅ 保留所有原有 PWA 功能（Service Worker、離線支持等）
- ✅ 獨立 Windows 應用啟動
- ✅ 完整的菜單和快捷鍵
- ✅ 安全的 IPC 通訊
- ✅ 應用版本管理

## 🎯 關鍵設定

**原始 PWA GitHub Pages 部署不受影響**
- `npm run deploy` 仍然工作正常
- 所有原始檔案保持不變
- Electron 配置完全獨立

## 💡 開發提示

### 修改應用配置
編輯 `electron/electron-builder.json` 以調整：
- 應用名稱、圖示
- 安裝程序安裝位置
- 快捷方式設定
- 可執行文件名稱

### 更新應用版本
修改 `package.json` 中的 `version` 欄位，重新打包時會自動使用新版本號

### 除錯應用
```bash
# 以開發模式啟動 Electron（帶 DevTools）
NODE_ENV=development npm run electron
```

## 📦 打包輸出

- `dist/富宇學森 Setup x.x.x.exe` - Windows 安裝程序
- `dist/富宇學森-x.x.x-portable.exe` - 單一可執行檔案

## 🆘 故障排除

**問題**: Electron 找不到 index.html
- **解決**: 確認在專案根目錄執行命令

**問題**: 無法打包
- **解決**: 執行 `npm install` 確保依賴已安裝

**問題**: 應用啟動後白屏
- **解決**: 檢查 `index.html` 中 base href 的配置

---

有任何問題，請檢查 `electron/main.js` 的日誌輸出。
