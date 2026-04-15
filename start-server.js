const { spawn } = require('child_process');
const open = require('open');
const http = require('http');

console.log('🚀 啟動富宇學森...');

// 啟動開發服務器
const server = spawn('npm', ['run', 'dev'], {
  detached: true,
  stdio: 'ignore',
  shell: true
});

server.unref();

// 等待服務器啟動後打開瀏覽器
const checkServer = setInterval(() => {
  http.get('http://localhost:3000', (res) => {
    clearInterval(checkServer);
    console.log('✅ 服務器已啟動');

    // 自動打開瀏覽器
    open('http://localhost:3000').then(() => {
      console.log('🌐 已在瀏覽器打開');
      process.exit(0);
    }).catch(() => {
      console.log('📌 請手動打開: http://localhost:3000');
      process.exit(0);
    });
  }).on('error', () => {
    // 服務器還在啟動中...
  });
}, 500);

// 10秒後超時
setTimeout(() => {
  clearInterval(checkServer);
  console.log('📌 請手動打開: http://localhost:3000');
  process.exit(0);
}, 10000);
