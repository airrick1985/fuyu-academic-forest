# Git Revert 回滾指南

**適用對象**：程式新手  
**用途**：當推送到 GitHub 的代碼有問題時，快速回滾到之前的版本  
**安全性**：⭐⭐⭐⭐⭐ 非常安全（保留完整歷史）

---

## 目錄

1. [什麼是 Revert？](#什麼是-revert)
2. [前置條件](#前置條件)
3. [完整操作步驟](#完整操作步驟)
4. [實際例子](#實際例子)
5. [常見問題](#常見問題)
6. [快速參考](#快速參考)

---

## 什麼是 Revert？

**Revert（回滾）** 是一種安全的方式來撤銷之前的提交：

- ✅ **保留完整的 Git 歷史** - 可以看到發生了什麼
- ✅ **不會刪除任何代碼** - 只是「反向應用」改動
- ✅ **團隊安全** - 其他成員不會受影響
- ✅ **可以恢復** - 如果反悔了，可以再 revert 一次

**類比**：
- 就像在筆記本上劃掉一行，但還能看到原本寫的是什麼
- 而不是撕掉那一頁

---

## 前置條件

✅ 已經在 IDE 中打開了項目  
✅ 已經推送到 GitHub  
✅ 知道哪個版本有問題

---

## 完整操作步驟

### **Step 1: 打開 IDE 終端**

在 VS Code 或其他 IDE 中：
- 按 `Ctrl+`` (重音符號) 打開終端
- 或點擊菜單 → Terminal → New Terminal

確保您在項目根目錄（看得到 `index.html`）

```bash
# 驗證位置
ls index.html  # 應該看到 index.html 檔案存在
```

---

### **Step 2: 查看提交歷史**

輸入指令查看所有提交：

```bash
git log --oneline
```

**輸出範例**：
```
9f48a27 fix: 立即隱藏加載覆蓋層防止卡住
bec6ae1 fix: 緊急修復無限版本更新循環
f105f71 Merge remote main
9d373e5 feat: 添加資源動態更新系統
2dc3a04 更新網站內容    ← 您想回滾到的版本
40fecec 修正：列印功能恢復到優化版本
```

**記住**：
- 左邊是「版本代碼」(commit hash)，如 `9f48a27`
- 右邊是「提交信息」，說明改動內容
- **最上面的是最新版本**

---

### **Step 3: 確認要回滾的版本**

仔細看提交信息，找出問題版本。

**常見情況**：
- 最新版本有問題 → 回滾到上一個版本
- 某個中間版本有問題 → 直接指定那個版本

---

### **Step 4: 執行 Revert**

假設您想回滾 `9f48a27` 這個版本：

```bash
git revert 9f48a27
```

**會發生什麼**：
1. 編輯器會打開
2. 顯示一個提交信息模板
3. 您可以修改或直接保存

---

### **Step 5: 保存提交信息**

編輯器打開後（通常是 Vim）：

**如果是 Vim 編輯器**（黑色背景）：
```
按 :wq 然後按 Enter
```

**如果是其他編輯器**：
- 按 `Ctrl+S` 保存
- 按 `Ctrl+W` 關閉

看到類似這樣的輸出表示成功：
```
[main 新提交代碼] Revert "fix: 立即隱藏加載覆蓋層防止卡住"
```

---

### **Step 6: 查看結果**

確認 revert 成功：

```bash
git log --oneline
```

應該看到新增了一個 revert 提交：
```
新代碼 Revert "fix: 立即隱藏加載覆蓋層防止卡住"
9f48a27 fix: 立即隱藏加載覆蓋層防止卡住
bec6ae1 fix: 緊急修復無限版本更新循環
```

---

### **Step 7: 推送到 GitHub**

最重要的一步 - 把回滾推送到 GitHub：

```bash
git push origin main
```

輸出應該類似：
```
To https://github.com/airrick1985/fuyu-academic-forest.git
   9f48a27..新代碼  main -> main
```

✅ **完成！** GitHub 和 GitHub Pages 會自動更新

---

### **Step 8: 驗證部署**

等待 1-2 分鐘，然後檢查：

1. **查看 GitHub 上的提交**：
   - 打開 https://github.com/airrick1985/fuyu-academic-forest
   - 點擊 "Commits"
   - 應該看到新的 "Revert" 提交在最上面

2. **查看網站**：
   - 打開 https://airrick1985.github.io/fuyu-academic-forest/
   - 重新整理 (Ctrl+F5 強制重新整理)
   - 確認回到舊版本狀態

✅ **成功！**

---

## 實際例子

### 場景：最新版本有無限循環 bug

**操作**：

```bash
# 1. 查看歷史
git log --oneline
# 輸出：
# 9f48a27 fix: 立即隱藏加載覆蓋層防止卡住  ← 這個有問題
# bec6ae1 fix: 緊急修復無限版本更新循環    ← 想回滾到這個
# ...

# 2. 執行 revert（針對有問題的版本）
git revert 9f48a27

# 3. 編輯器會打開，直接保存
# (按 :wq 或 Ctrl+S)

# 4. 推送到 GitHub
git push origin main

# 5. 完成！等待 1-2 分鐘自動部署
```

---

## 常見問題

### Q1: Revert 後代碼還是有問題？

**A**: 可能是快取問題。嘗試：
```bash
# 在瀏覽器中強制重新整理
Ctrl+F5 (Windows/Linux)
或
Cmd+Shift+R (Mac)

# 或清空快取
F12 打開開發者工具 → Application → Clear storage
```

---

### Q2: 我不小心 revert 了錯誤的版本？

**A**: 沒關係！再 revert 一次就會恢復：
```bash
git revert 剛才的revert提交代碼
git push origin main
```

---

### Q3: 編輯器怎麼按不出來？

**A**: 按照提示：
```
-- INSERT -- (在下方)
表示可以輸入

-- 正常模式 --
表示要按 Esc 進入命令模式

:wq 是 "存檔並離開"
```

或者更簡單的方法：
```bash
# 直接指定提交信息，跳過編輯器
git revert 9f48a27 --no-edit
git push origin main
```

---

### Q4: 推送失敗？

**A**: 可能是遠端有更新，執行：
```bash
git pull origin main
# 然後再推送
git push origin main
```

---

### Q5: 多個版本都有問題？

**A**: 可以一次 revert 多個：
```bash
git revert 版本1 版本2 版本3
git push origin main
```

---

## 快速參考

### 最常用的 3 行命令

```bash
# 查看歷史
git log --oneline

# 執行回滾（複製版本代碼替換這裡）
git revert 版本代碼

# 推送到 GitHub
git push origin main
```

### 一行完成（不要編輯提交信息）

```bash
git revert 版本代碼 --no-edit && git push origin main
```

---

## 重要提醒

| 重點 | 說明 |
|------|------|
| ✅ **總是用 revert** | 對新手最安全 |
| ⏳ **要等待部署** | GitHub Pages 需要 1-2 分鐘更新 |
| 🔄 **強制重新整理** | Ctrl+F5 清除快取 |
| 📝 **記錄版本代碼** | 遇到問題時記下相關版本號 |
| 🚀 **測試後再推送** | 在本地測試無誤再推送 |

---

## 下次遇到問題時

1. 打開這個文檔
2. 按照 Step 1-8 操作
3. 不確定就問 Claude 或查看"常見問題"
4. ✅ 完成！

---

**最後更新**：2026-04-09  
**適用版本**：1.0.3+  
**狀態**：✅ 已測試驗證

