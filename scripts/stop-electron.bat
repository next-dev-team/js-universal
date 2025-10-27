@echo off
echo Stopping Electron processes...
taskkill /f /im electron.exe 2>nul
taskkill /f /im "Super App.exe" 2>nul
echo Electron processes stopped.
pause
