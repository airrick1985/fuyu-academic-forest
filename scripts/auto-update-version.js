#!/usr/bin/env node

/**
 * 自動版本管理腳本
 *
 * 功能：
 * 1. 檢測 assets/ 目錄的變化
 * 2. 自動遞增版本號
 * 3. 更新 version.json
 *
 * 使用：node scripts/auto-update-version.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ================== 配置 ==================

const VERSION_FILE = path.join(__dirname, '../version.json');
const ASSETS_DIR = path.join(__dirname, '../assets');
const HASH_FILE = path.join(__dirname, '../.assets-hash');

// ================== 函數 ==================

/**
 * 計算目錄的 hash 值
 */
function calculateDirectoryHash(dir) {
  if (!fs.existsSync(dir)) {
    return '';
  }

  const hash = crypto.createHash('sha256');

  function walkDir(currentPath) {
    const files = fs.readdirSync(currentPath).sort();

    files.forEach(file => {
      // 跳過隱藏檔案和特定目錄
      if (file.startsWith('.')) return;
      if (file === 'node_modules') return;

      const filePath = path.join(currentPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        walkDir(filePath);
      } else {
        const fileContent = fs.readFileSync(filePath);
        hash.update(fileContent);
      }
    });
  }

  walkDir(dir);
  return hash.digest('hex');
}

/**
 * 遞增語義化版本號
 */
function incrementVersion(version) {
  const parts = version.split('.');
  if (parts.length !== 3) {
    console.error('❌ 無效的版本格式');
    process.exit(1);
  }

  const [major, minor, patch] = parts.map(Number);

  // Patch 版本遞增（因為通常是圖片等資源的改動）
  return `${major}.${minor}.${patch + 1}`;
}

/**
 * 更新 version.json
 */
function updateVersionJson(newVersion) {
  const timestamp = Date.now();

  const content = {
    version: newVersion,
    timestamp: timestamp,
    updatedAt: new Date().toISOString()
  };

  fs.writeFileSync(
    VERSION_FILE,
    JSON.stringify(content, null, 2) + '\n',
    'utf-8'
  );

  console.log(`✅ version.json 已更新：${newVersion}`);
}

/**
 * 更新所有 HTML 檔案中的版本號（meta 標籤和查詢參數）
 */
function updateHtmlVersions(oldVersion, newVersion) {
  const projectRoot = path.join(__dirname, '..');
  const htmlFiles = [
    'index.html', 'floor-plan.html', 'materials.html', 'location.html',
    'brand-fuyu.html', 'construction.html', 'brand-team.html',
    'exterior-3d.html', 'panorama.html', 'public-3d.html', 'coming-soon.html'
  ];

  let updated = 0;

  htmlFiles.forEach(file => {
    const filePath = path.join(projectRoot, file);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf-8');
      const originalContent = content;

      // 更新 meta 標籤中的版本號
      content = content.replace(
        `content="${oldVersion}"`,
        `content="${newVersion}"`
      );

      // 更新查詢參數 ?v=X.X.X （重要！用於 CSS/JS 快取失效）
      content = content.replace(
        new RegExp(`\\?v=${oldVersion.replace(/\./g, '\\.')}`, 'g'),
        `?v=${newVersion}`
      );

      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf-8');
        updated++;
        console.log(`  ✓ ${file}: ${oldVersion} → ${newVersion}`);
      }
    }
  });

  if (updated > 0) {
    console.log(`✅ 已更新 ${updated} 個 HTML 檔案的版本號`);
  } else {
    console.log(`ℹ️  無需更新 HTML 檔案`);
  }
}

/**
 * 保存當前 hash
 */
function saveHash(hash) {
  fs.writeFileSync(HASH_FILE, hash, 'utf-8');
}

/**
 * 讀取上次的 hash
 */
function getLastHash() {
  if (fs.existsSync(HASH_FILE)) {
    return fs.readFileSync(HASH_FILE, 'utf-8').trim();
  }
  return '';
}

/**
 * 主邏輯
 */
function main() {
  console.log('\n=== 自動版本管理 ===\n');

  try {
    // 1. 計算當前 assets 目錄的 hash
    console.log('📁 檢查資源變化...');
    const currentHash = calculateDirectoryHash(ASSETS_DIR);
    const lastHash = getLastHash();

    if (!currentHash) {
      console.log('⚠️  assets 目錄為空，跳過');
      return false;
    }

    // 2. 比較 hash 是否變化
    if (currentHash === lastHash) {
      console.log('✅ 資源無變化，無需更新版本');
      return false;
    }

    console.log('🔍 檢測到資源變化');
    console.log(`   前版本 hash：${lastHash.substring(0, 8)}...`);
    console.log(`   當前 hash：${currentHash.substring(0, 8)}...`);

    // 3. 讀取當前版本號
    const currentVersion = JSON.parse(
      fs.readFileSync(VERSION_FILE, 'utf-8')
    ).version;

    // 4. 遞增版本號
    const newVersion = incrementVersion(currentVersion);
    console.log(`\n📊 版本遞增：${currentVersion} → ${newVersion}`);

    // 5. 更新 version.json
    updateVersionJson(newVersion);

    // 6. 更新所有 HTML 檔案中的版本號（確保同步！）
    updateHtmlVersions(currentVersion, newVersion);

    // 7. 保存新的 hash
    saveHash(currentHash);
    console.log('💾 已保存資源 hash');

    console.log('\n✨ 完成！\n');
    return true;

  } catch (error) {
    console.error('❌ 錯誤：', error.message);
    process.exit(1);
  }
}

// 執行
const hasChanges = main();
process.exit(hasChanges ? 0 : 0); // 無論如何都返回 0（避免 CI 失敗）
