#!/usr/bin/env node

/**
 * 單獨生成資源清單（不修改版本號）
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const VERSION_FILE = path.join(__dirname, '../version.json');
const ASSETS_DIR = path.join(__dirname, '../assets');
const MANIFEST_FILE = path.join(__dirname, '../assets-manifest.json');

/**
 * 計算單個檔案的雜湊值
 */
function calculateFileHash(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 12);
}

/**
 * 遞迴掃描目錄並生成資源清單
 */
function generateAssetsManifest(version) {
  const manifest = {
    version: version,
    timestamp: Date.now(),
    generatedAt: new Date().toISOString(),
    assets: {}
  };

  function walkDir(currentPath, baseRelativePath = '') {
    try {
      const files = fs.readdirSync(currentPath).sort();

      files.forEach(file => {
        // 跳過隱藏檔案和特定目錄
        if (file.startsWith('.')) return;
        if (file === 'node_modules') return;

        const filePath = path.join(currentPath, file);
        const stat = fs.statSync(filePath);
        const relativePath = baseRelativePath
          ? `${baseRelativePath}/${file}`
          : file;

        if (stat.isDirectory()) {
          walkDir(filePath, relativePath);
        } else {
          // 只記錄資源檔案（跳過 .md 檔案）
          if (!file.endsWith('.md')) {
            try {
              const hash = calculateFileHash(filePath);
              const size = stat.size;

              manifest.assets[`assets/${relativePath}`] = {
                hash: hash,
                size: size,
                mtime: stat.mtimeMs
              };
            } catch (err) {
              console.warn(`⚠️  無法讀取檔案：${filePath}`, err.message);
            }
          }
        }
      });
    } catch (err) {
      console.warn(`⚠️  無法掃描目錄：${currentPath}`, err.message);
    }
  }

  walkDir(ASSETS_DIR);
  return manifest;
}

/**
 * 主邏輯
 */
function main() {
  console.log('\n=== 生成資源清單 ===\n');

  try {
    // 讀取當前版本號
    const currentVersion = JSON.parse(
      fs.readFileSync(VERSION_FILE, 'utf-8')
    ).version;

    console.log(`📊 當前版本: ${currentVersion}`);

    // 生成清單
    const manifest = generateAssetsManifest(currentVersion);

    // 保存
    fs.writeFileSync(
      MANIFEST_FILE,
      JSON.stringify(manifest, null, 2) + '\n',
      'utf-8'
    );

    console.log(`✅ assets-manifest.json 已生成：${Object.keys(manifest.assets).length} 個資源`);
    console.log('\n✨ 完成！\n');

  } catch (error) {
    console.error('❌ 錯誤：', error.message);
    process.exit(1);
  }
}

main();
