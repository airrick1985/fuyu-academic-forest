const { ipcRenderer } = require('electron');

// 暴露 electron 對象到全局 window 對象（安全地）
window.electron = {
  closeApp: () => {
    ipcRenderer.send('close-app');
  },
  toggleFullscreen: () => {
    ipcRenderer.send('toggle-fullscreen');
  },
  exitFullscreen: () => {
    ipcRenderer.send('exit-fullscreen');
  },
  enterFullscreen: () => {
    ipcRenderer.send('enter-fullscreen');
  },
  // 監聽全屏狀態改變
  onFullscreenChange: (callback) => {
    ipcRenderer.on('fullscreen-changed', (event, isFullscreen) => {
      callback(isFullscreen);
    });
  }
};
