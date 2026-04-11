// preload.js - 簡化版本（本地伺服器不需要特殊處理）
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('isElectron', true);
console.log('✓ Electron environment detected');
