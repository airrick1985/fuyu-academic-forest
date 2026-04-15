const { app, BrowserWindow, Menu, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');
const url = require('url');

let mainWindow;
let server;

// 啟動本地 HTTP 伺服器
function startLocalServer() {
  const appDir = app.getAppPath();
  const port = 3456;

  server = http.createServer((req, res) => {
    // 移除查詢參數，只保留路徑部分
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;

    // 解碼 URL（處理中文文件名和特殊字符）
    try {
      pathname = decodeURIComponent(pathname);
    } catch (e) {
      console.warn(`[Server] ⚠ URL 解碼失敗: ${pathname}`);
    }

    // 移除開頭斜槓（重要：避免 Windows 路徑問題）
    if (pathname.startsWith('/')) {
      pathname = pathname.slice(1);
    }

    // 根路徑使用 index.html
    if (pathname === '' || pathname === '/') {
      pathname = 'index.html';
    }

    let filePath = path.join(appDir, pathname);

    // 安全檢查：防止目錄遍歷
    if (!filePath.startsWith(appDir)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    console.log(`[Server] 請求: ${pathname} → ${filePath}`);

    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.error(`[Server] ❌ 404: ${filePath} (原始請求: ${pathname})`);
        res.writeHead(404);
        res.end('Not Found');
        return;
      }
      console.log(`[Server] ✓ 200: ${pathname}`);

      const ext = path.extname(filePath).toLowerCase();
      const types = {
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.webp': 'image/webp',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon'
      };

      res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
      res.end(data);
    });
  });

  server.listen(port, () => {
    console.log(`✓ Local server running at http://localhost:${port}`);
  });

  return `http://localhost:${port}`;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '..', 'favicon.ico')
  });

  // 啟動伺服器並加載應用
  const serverUrl = startLocalServer();
  mainWindow.loadURL(serverUrl);

  // 當頁面加載完成後進入全屏
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('[App] 頁面加載完成，進入全螢幕');
    // 延遲 500ms 確保 DOM 完全準備就緒
    setTimeout(() => {
      if (mainWindow && !mainWindow.isFullScreen()) {
        mainWindow.setFullScreen(true);
        mainWindow.webContents.send('fullscreen-changed', true);
      }
    }, 500);
  });

  // 僅在開發環境下自動打開 DevTools，但保留 F12 快捷鍵
  // 生產環境可通過 F12 或 Ctrl+Shift+I 手動打開
  // if (process.env.NODE_ENV === 'development') {
  //   mainWindow.webContents.openDevTools();
  // }

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (server) {
      server.close();
    }
  });
}

// App lifecycle
app.on('ready', () => {
  createWindow();
  createMenu();

  // ===== IPC 事件監聽：關閉應用 =====
  ipcMain.on('close-app', () => {
    app.quit();
  });

  // ===== IPC 事件監聽：全屏控制 =====
  ipcMain.on('toggle-fullscreen', () => {
    if (mainWindow) {
      const isFullscreen = mainWindow.isFullScreen();
      mainWindow.setFullScreen(!isFullscreen);
      // 通知渲染進程全屏狀態已改變
      mainWindow.webContents.send('fullscreen-changed', !isFullscreen);
      console.log(`[Fullscreen] ${!isFullscreen ? '進入' : '退出'}全螢幕`);
    }
  });

  ipcMain.on('exit-fullscreen', () => {
    if (mainWindow && mainWindow.isFullScreen()) {
      mainWindow.setFullScreen(false);
      mainWindow.webContents.send('fullscreen-changed', false);
      console.log('[Fullscreen] 退出全螢幕');
    }
  });

  ipcMain.on('enter-fullscreen', () => {
    if (mainWindow && !mainWindow.isFullScreen()) {
      mainWindow.setFullScreen(true);
      mainWindow.webContents.send('fullscreen-changed', true);
      console.log('[Fullscreen] 進入全螢幕');
    }
  });

  // ===== 全域快捷鍵 =====
  // ESC 鍵：退出全屏
  globalShortcut.register('Escape', () => {
    if (mainWindow && mainWindow.isFullScreen()) {
      mainWindow.setFullScreen(false);
      mainWindow.webContents.send('fullscreen-changed', false);
      console.log('[Fullscreen] ESC：退出全螢幕');
    }
  });

  // F11 鍵：切換全屏
  globalShortcut.register('F11', () => {
    if (mainWindow) {
      const isFullscreen = mainWindow.isFullScreen();
      mainWindow.setFullScreen(!isFullscreen);
      mainWindow.webContents.send('fullscreen-changed', !isFullscreen);
      console.log(`[Fullscreen] F11：${!isFullscreen ? '進入' : '退出'}全螢幕`);
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Create application menu
function createMenu() {
  const template = [
    {
      label: '檔案',
      submenu: [
        {
          label: '離開',
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit()
        }
      ]
    },
    {
      label: '編輯',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: '檢視',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}
