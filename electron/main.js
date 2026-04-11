const { app, BrowserWindow, Menu } = require('electron');
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
    const pathname = parsedUrl.pathname;
    let filePath = path.join(appDir, pathname === '/' ? 'index.html' : pathname);

    // 安全檢查：防止目錄遍歷
    if (!filePath.startsWith(appDir)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.error(`404: ${filePath}`);
        res.writeHead(404);
        res.end('Not Found');
        return;
      }

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
      sandbox: true
    },
    icon: path.join(__dirname, '..', 'favicon.ico')
  });

  // 啟動伺服器並加載應用
  const serverUrl = startLocalServer();
  mainWindow.loadURL(serverUrl);
  mainWindow.webContents.openDevTools();

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
