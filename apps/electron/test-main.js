const { app, BrowserWindow } = require('electron');

console.log('[TEST] Starting minimal Electron test...');

function createWindow() {
  console.log('[TEST] Creating window...');
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('test.html');
  console.log('[TEST] Window created and loaded');
}

app.whenReady().then(() => {
  console.log('[TEST] App is ready');
  createWindow();
});

app.on('window-all-closed', () => {
  console.log('[TEST] All windows closed');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

console.log('[TEST] Test script loaded');