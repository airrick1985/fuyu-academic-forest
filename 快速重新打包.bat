@echo off
chcp 65001 >nul
title 重新打包富宇學森

echo.
echo [1/3] 清理舊文件...
rmdir /s /q dist >nul 2>&1

echo [2/3] 重新構建...
call npm run build

echo [3/3] 重新打包 EXE...
call npm run electron-build-win

echo.
echo ✓ 完成！EXE 在 dist\ 文件夾中
echo.
pause
