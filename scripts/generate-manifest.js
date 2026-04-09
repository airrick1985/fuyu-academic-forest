#!/usr/bin/env node

/**
 * 資源清單生成腳本
 *
 * 用途：
 * - 自動掃描資源文件夾
 * - 計算每個文件的 SHA256 哈希值（前12位）
 * - 生成 assets-manifest.json
 * - 自動更新版本號
 *
 * 用法：
 *   node scripts/generate-manifest.js
 *   或在 package.json 中添加：
 *   "build": "node scripts/generate-manifest.js && npm run deploy"
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 配置
const CONFIG = {
  rootDir: path.join(__dirname, '..'),
  outputFile: 'assets-manifest.json',
  // 需要包含在清單中的文件夾
  assetDirs: [
    'assets',
    'css',
    'js'
  ],
  // 排除的文件模式
  excludePatterns: [
    /node_modules/,
    /\.git/,
    /dist/,
    /\.map$/,
    /generate-manifest\.js$/
  ]
};

/**
 * 計算文件的 SHA256 雜湊（前12位）
 */
function calculateFileHash(filePath) {
  try {
    const content = fs.readFileSync(filePath);
    const hash = crypto.createHash('sha256').update(content).digest('hex');
    return hash.substring(0, 12); // 返回前12位
  } catch (error) {
    console.warn(`⚠️  無法計算 ${filePath} 的雜湊:`, error.message);
    return null;
  }
}

/**
 * 遞迴掃描文件夾
 */
function scanDirectory(dir, baseDir = '') {
  const assets = {};

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.join(baseDir, entry.name);
      // 轉換為網路路徑格式（使用正斜槓）
      const webPath = relativePath.replace(/\\/g, '/');

      // 檢查是否應該排除
      const shouldExclude = CONFIG.excludePatterns.some(pattern =>
        pattern.test(relativePath)
      );

      if (shouldExclude) {
        continue;
      }

      if (entry.isDirectory()) {
        // 遞迴掃描子文件夾
        const subAssets = scanDirectory(fullPath, relativePath);
        Object.assign(assets, subAssets);
      } else if (entry.isFile()) {
        // 計算文件雜湊
        const hash = calculateFileHash(fullPath);
        if (hash) {
          const stats = fs.statSync(fullPath);
          assets[webPath] = {
            hash,
            size: stats.size,
            mtime: stats.mtimeMs
          };
        }
      }
    }
  } catch (error) {
    console.error(`❌ 掃描目錄 ${dir} 失敗:`, error.message);
  }

  return assets;
}

/**
 * 獲取下一個版本號
 */
function getNextVersion(currentVersion) {
  const parts = currentVersion.split('.');
  const patch = parseInt(parts[2]) || 0;
  parts[2] = String(patch + 1);
  return parts.join('.');
}

/**
 * 生成清單文件
 */
function generateManifest() {
  console.log('📋 開始生成資源清單...\n');

  const rootDir = CONFIG.rootDir;
  const outputPath = path.join(rootDir, CONFIG.outputFile);

  // 掃描所有資源
  const allAssets = {};
  for (const dir of CONFIG.assetDirs) {
    const dirPath = path.join(rootDir, dir);
    if (fs.existsSync(dirPath)) {
      console.log(`📂 掃描: ${dir}`);
      const assets = scanDirectory(dirPath, dir);
      Object.assign(allAssets, assets);
      console.log(`   ✓ 找到 ${Object.keys(assets).length} 個文件\n`);
    }
  }

  // 讀取舊的清單（如果存在）以獲取當前版本
  let currentVersion = '1.0.0';
  if (fs.existsSync(outputPath)) {
    try {
      const oldManifest = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
      currentVersion = oldManifest.version || '1.0.0';
    } catch (error) {
      console.warn('⚠️  無法讀取舊清單，將使用默認版本');
    }
  }

  // 生成新版本號
  const newVersion = getNextVersion(currentVersion);

  // 創建新清單
  const manifest = {
    version: newVersion,
    timestamp: Date.now(),
    generatedAt: new Date().toISOString(),
    assets: allAssets
  };

  // 寫入清單文件
  try {
    fs.writeFileSync(
      outputPath,
      JSON.stringify(manifest, null, 2),
      'utf-8'
    );
    console.log(`✅ 清單生成成功！\n`);
    console.log(`📊 統計信息:`);
    console.log(`   版本: ${currentVersion} → ${newVersion}`);
    console.log(`   總資源數: ${Object.keys(allAssets).length}`);
    console.log(`   輸出文件: ${path.relative(rootDir, outputPath)}`);
    console.log(`   生成時間: ${new Date().toLocaleString()}\n`);

    return manifest;
  } catch (error) {
    console.error(`❌ 寫入清單文件失敗:`, error.message);
    process.exit(1);
  }
}

/**
 * 驗證清單
 */
function validateManifest(manifest) {
  console.log('🔍 驗證清單...\n');

  const assetPaths = Object.keys(manifest.assets);
  const rootDir = CONFIG.rootDir;

  let validCount = 0;
  let missingCount = 0;

  for (const assetPath of assetPaths) {
    const fullPath = path.join(rootDir, assetPath);
    if (fs.existsSync(fullPath)) {
      validCount++;
    } else {
      console.warn(`   ⚠️  文件不存在: ${assetPath}`);
      missingCount++;
    }
  }

  console.log(`   ✓ 有效文件: ${validCount}`);
  if (missingCount > 0) {
    console.log(`   ✗ 缺失文件: ${missingCount}`);
  }
  console.log();

  return missingCount === 0;
}

/**
 * 主程序
 */
function main() {
  console.log('🚀 資源清單生成器\n');
  console.log(`根目錄: ${CONFIG.rootDir}\n`);

  // 生成清單
  const manifest = generateManifest();

  // 驗證清單（可選）
  const isValid = validateManifest(manifest);

  if (isValid) {
    console.log('✨ 所有檢查通過！清單已準備就緒。\n');
    console.log('📌 部署提示:');
    console.log('   1. 提交清單文件: git add assets-manifest.json');
    console.log('   2. 推送到遠端: git push origin main');
    console.log('   3. 用戶訪問時將自動檢測更新\n');
  } else {
    console.log('⚠️  清單包含缺失文件，請檢查。\n');
  }
}

// 執行
main();
