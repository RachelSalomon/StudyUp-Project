@echo off
cd /d "%~dp0"
echo Fixing user accounts...
node scripts\ensure-users.js
pause
