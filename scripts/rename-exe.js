const fs = require('fs');
const path = require('path');

// 獲取今天的日期 YYYYMMDD 格式
const date = new Date();
const dateStr = date.getFullYear().toString() + 
                String(date.getMonth() + 1).padStart(2, '0') + 
                String(date.getDate()).padStart(2, '0');

const distDir = path.join(__dirname, '..', 'dist');
const oldName = path.join(distDir, '富宇學森-1.0.0-portable.exe');
const newName = path.join(distDir, `富宇學森-電子表板離線版-${dateStr}.exe`);

// 刪除舊的帶有 ${date} 的檔案
const files = fs.readdirSync(distDir);
files.forEach(file => {
  if (file.includes('${date')) {
    const filePath = path.join(distDir, file);
    try {
      fs.unlinkSync(filePath);
      console.log(`[Cleanup] 刪除: ${file}`);
    } catch (err) {
      console.error(`[Error] 無法刪除 ${file}:`, err.message);
    }
  }
});

// 重命名檔案
if (fs.existsSync(oldName)) {
  try {
    fs.renameSync(oldName, newName);
    console.log(`✓ 已重命名: 富宇學森-1.0.0-portable.exe → 富宇學森-電子表板離線版-${dateStr}.exe`);
  } catch (err) {
    console.error('❌ 重命名失敗:', err.message);
    process.exit(1);
  }
} else {
  console.log(`⚠ 找不到 ${oldName}`);
  console.log(`[Info] dist 目錄中的檔案:`);
  fs.readdirSync(distDir).forEach(file => {
    if (file.endsWith('.exe')) {
      console.log(`  - ${file}`);
    }
  });
}
