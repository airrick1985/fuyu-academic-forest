const fs = require('fs');
const path = require('path');

// 檢查是否已安裝 sharp
try {
  const sharp = require('sharp');
  
  // 將 xuesen_logo.webp 轉換為 256x256 的 PNG，然後轉換為 ICO
  sharp('assets/images/xuesen_logo.webp')
    .resize(256, 256, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .toFile('app-icon-256.png', (err, info) => {
      if (err) {
        console.error('轉換失敗:', err);
        process.exit(1);
      }
      console.log('✓ 已創建 app-icon-256.png');
    });
} catch (e) {
  console.log('⚠ sharp 未安裝，嘗試其他方法...');
  // 如果沒有 sharp，使用簡單的方法創建一個 256x256 的 PNG
  // 這裡我們使用 jimp 或其他方案
  try {
    const jimp = require('jimp');
    jimp.read('assets/images/xuesen_logo.webp', (err, image) => {
      if (err) {
        console.error('讀取圖像失敗:', err);
        process.exit(1);
      }
      image.resize(256, 256).write('app-icon-256.png');
      console.log('✓ 已使用 jimp 創建 app-icon-256.png');
    });
  } catch (e2) {
    console.error('❌ 無法找到圖像處理庫');
    console.error('請安裝: npm install sharp');
    process.exit(1);
  }
}
