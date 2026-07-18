@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Copying demo video...
node scripts\copy-demo-video.js
echo.
pause
