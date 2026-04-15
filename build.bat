@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title 富宇學森 - 自動打包

echo.
echo ╔════════════════════════════════════════╗
echo ║   富宇學森 EXE 打包程序                 ║
echo ╚════════════════════════════════════════╝
echo.

REM 步驟 1: 清理舊文件
echo [1/5] 清理舊的構建文件...
if exist dist (
  rmdir /s /q dist >nul 2>&1
  echo ✓ 已清理 dist 文件夾
)
if exist out (
  rmdir /s /q out >nul 2>&1
  echo ✓ 已清理 out 文件夾
)
echo.

REM 步驟 2: 安裝依賴
echo [2/5] 安裝依賴...
call npm install
if %errorlevel% neq 0 (
  echo ✗ npm install 失敗
  pause
  exit /b 1
)
echo ✓ 依賴安裝完成
echo.

REM 步驟 3: 生成清單
echo [3/5] 生成資源清單...
call npm run build
if %errorlevel% neq 0 (
  echo ✗ npm run build 失敗
  pause
  exit /b 1
)
echo ✓ 資源清單生成完成
echo.

REM 步驟 4: 構建 EXE
echo [4/5] 構建 Windows 應用...
call npm run electron-build-win
if %errorlevel% neq 0 (
  echo ✗ npm run electron-build-win 失敗
  pause
  exit /b 1
)
echo ✓ EXE 構建完成
echo.

REM 步驟 5: 驗證輸出
echo [5/5] 驗證輸出文件...
if exist "dist\富宇學森-*-portable.exe" (
  echo ✓ Portable EXE 已生成
) else (
  echo ⚠ 找不到 portable EXE，檢查 dist 文件夾
)
echo.

echo ╔════════════════════════════════════════╗
echo ║   ✓ 打包完成！                         ║
echo ╚════════════════════════════════════════╝
echo.
echo 輸出位置：dist\
echo.
echo 下一步：
echo  1. 雙擊 dist 文件夾中的 EXE 文件執行
echo  2. 檢查應用是否正常運行
echo  3. 測試所有功能和頁面
echo.
pause
