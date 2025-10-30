// ============================================
// ELECTRON MAIN PROCESS WITH EXPRESS (main.js)
// ============================================
const { app, BrowserWindow, ipcMain, dialog, shell, screen, powerMonitor } = require('electron');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

let mainWindow;
let expressApp;
let httpServer;
let io;

// Initialize Express inside Electron
function initializeExpressServer() {
expressApp = express();
httpServer = http.createServer(expressApp);
io = new Server(httpServer, {
cors: {
origin: '\*',
methods: ['GET', 'POST']
}
});

expressApp.use(cors());
expressApp.use(express.json());

// ============================================
// NATIVE ELECTRON FEATURES VIA EXPRESS
// ============================================

// File System Operations with Native Dialog
expressApp.post('/api/native/open-file', async (req, res) => {
try {
const result = await dialog.showOpenDialog(mainWindow, {
properties: ['openFile'],
filters: [
{ name: 'All Files', extensions: ['*'] },
{ name: 'Images', extensions: ['jpg', 'png', 'gif'] },
{ name: 'Documents', extensions: ['pdf', 'doc', 'txt'] }
]
});

      if (!result.canceled) {
        const filePath = result.filePaths[0];
        const content = fs.readFileSync(filePath, 'utf-8');
        res.json({
          success: true,
          path: filePath,
          content: content,
          size: fs.statSync(filePath).size
        });
      } else {
        res.json({ success: false, canceled: true });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }

});

// Save File with Native Dialog
expressApp.post('/api/native/save-file', async (req, res) => {
try {
const { content, defaultName } = req.body;

      const result = await dialog.showSaveDialog(mainWindow, {
        defaultPath: defaultName || 'untitled.txt',
        filters: [{ name: 'Text Files', extensions: ['txt'] }]
      });

      if (!result.canceled) {
        fs.writeFileSync(result.filePath, content);
        res.json({ success: true, path: result.filePath });
      } else {
        res.json({ success: false, canceled: true });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }

});

// Screen Information
expressApp.get('/api/native/screen-info', (req, res) => {
const displays = screen.getAllDisplays();
const primaryDisplay = screen.getPrimaryDisplay();

    res.json({
      displays: displays.map(d => ({
        id: d.id,
        bounds: d.bounds,
        workArea: d.workArea,
        scaleFactor: d.scaleFactor,
        rotation: d.rotation,
        internal: d.internal
      })),
      primaryDisplay: {
        id: primaryDisplay.id,
        size: primaryDisplay.size,
        workAreaSize: primaryDisplay.workAreaSize
      }
    });

});

// System Notifications
expressApp.post('/api/native/notification', (req, res) => {
const { title, body, icon } = req.body;

    const { Notification } = require('electron');

    if (Notification.isSupported()) {
      const notification = new Notification({
        title: title || 'Notification',
        body: body || '',
        icon: icon
      });

      notification.show();
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Notifications not supported' });
    }

});

// Open External URLs
expressApp.post('/api/native/open-external', async (req, res) => {
try {
const { url } = req.body;
await shell.openExternal(url);
res.json({ success: true });
} catch (error) {
res.status(500).json({ error: error.message });
}
});

// Show Item in Folder
expressApp.post('/api/native/show-in-folder', (req, res) => {
try {
const { path: filePath } = req.body;
shell.showItemInFolder(filePath);
res.json({ success: true });
} catch (error) {
res.status(500).json({ error: error.message });
}
});

// System Path Information
expressApp.get('/api/native/paths', (req, res) => {
res.json({
home: app.getPath('home'),
appData: app.getPath('appData'),
userData: app.getPath('userData'),
desktop: app.getPath('desktop'),
documents: app.getPath('documents'),
downloads: app.getPath('downloads'),
music: app.getPath('music'),
pictures: app.getPath('pictures'),
videos: app.getPath('videos'),
temp: app.getPath('temp')
});
});

// Power Monitor
expressApp.get('/api/native/power-info', (req, res) => {
res.json({
onBattery: powerMonitor.isOnBatteryPower(),
idleTime: powerMonitor.getSystemIdleTime(),
idleState: powerMonitor.getSystemIdleState(60)
});
});

// Window Control
expressApp.post('/api/native/window/minimize', (req, res) => {
if (mainWindow) {
mainWindow.minimize();
res.json({ success: true });
} else {
res.status(400).json({ error: 'No window available' });
}
});

expressApp.post('/api/native/window/maximize', (req, res) => {
if (mainWindow) {
if (mainWindow.isMaximized()) {
mainWindow.unmaximize();
} else {
mainWindow.maximize();
}
res.json({ success: true, isMaximized: mainWindow.isMaximized() });
} else {
res.status(400).json({ error: 'No window available' });
}
});

expressApp.post('/api/native/window/fullscreen', (req, res) => {
if (mainWindow) {
const { enable } = req.body;
mainWindow.setFullScreen(enable);
res.json({ success: true });
} else {
res.status(400).json({ error: 'No window available' });
}
});

// Clipboard Operations
expressApp.get('/api/native/clipboard/text', (req, res) => {
const { clipboard } = require('electron');
res.json({ text: clipboard.readText() });
});

expressApp.post('/api/native/clipboard/text', (req, res) => {
const { clipboard } = require('electron');
const { text } = req.body;
clipboard.writeText(text);
res.json({ success: true });
});

// App Info
expressApp.get('/api/native/app-info', (req, res) => {
res.json({
name: app.getName(),
version: app.getVersion(),
isPackaged: app.isPackaged,
locale: app.getLocale(),
platform: process.platform,
arch: process.arch,
electronVersion: process.versions.electron,
nodeVersion: process.versions.node,
chromeVersion: process.versions.chrome
});
});

// Execute Shell Command
expressApp.post('/api/native/exec', (req, res) => {
const { exec } = require('child_process');
const { command } = req.body;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        res.status(500).json({ error: error.message, stderr });
      } else {
        res.json({ stdout, stderr });
      }
    });

});

// ============================================
// SOCKET.IO FOR REAL-TIME COMMUNICATION
// ============================================

io.on('connection', (socket) => {
console.log('Client connected:', socket.id);

    socket.on('native-command', async (data) => {
      const { command, params } = data;

      try {
        let result;

        switch (command) {
          case 'show-message':
            result = await dialog.showMessageBox(mainWindow, {
              type: params.type || 'info',
              title: params.title,
              message: params.message,
              buttons: params.buttons || ['OK']
            });
            break;

          case 'get-cursor-position':
            result = screen.getCursorScreenPoint();
            break;

          case 'beep':
            shell.beep();
            result = { success: true };
            break;

          default:
            result = { error: 'Unknown command' };
        }

        socket.emit('native-response', { command, result });
      } catch (error) {
        socket.emit('native-response', { command, error: error.message });
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

});

// Start Express server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
console.log(`Express server with native features running on http://localhost:${PORT}`);
});
}

// Create Electron Window
function createWindow() {
mainWindow = new BrowserWindow({
width: 1200,
height: 800,
webPreferences: {
nodeIntegration: false,
contextIsolation: true,
preload: path.join(\_\_dirname, 'preload.js')
}
});

// Load your app or point to Express server
mainWindow.loadURL('<http://localhost:3000>');
// OR: mainWindow.loadFile('index.html');
}

// App lifecycle
app.whenReady().then(() => {
initializeExpressServer();
createWindow();

app.on('activate', () => {
if (BrowserWindow.getAllWindows().length === 0) {
createWindow();
}
});
});

app.on('window-all-closed', () => {
if (process.platform !== 'darwin') {
if (httpServer) {
httpServer.close();
}
app.quit();
}
});

// ============================================
// EXAMPLE CLIENT CODE (can be web or Electron renderer)
// ============================================
/\*
// Using fetch from any client (web browser or Electron renderer)

// Open file dialog
async function openFile() {
const response = await fetch('<http://localhost:3000/api/native/open-file>', {
method: 'POST'
});
const data = await response.json();
console.log('File opened:', data);
}

// Get system info
async function getSystemInfo() {
const response = await fetch('<http://localhost:3000/api/native/app-info>');
const data = await response.json();
console.log('System info:', data);
}

// Show notification
async function showNotification() {
await fetch('<http://localhost:3000/api/native/notification>', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({
title: 'Hello!',
body: 'This is a native notification from Express!'
})
});
}

// Using Socket.io for real-time native commands
const socket = io('<http://localhost:3000>');

socket.emit('native-command', {
command: 'show-message',
params: {
type: 'question',
title: 'Confirm',
message: 'Are you sure?',
buttons: ['Yes', 'No']
}
});

socket.on('native-response', (data) => {
console.log('Native response:', data);
});
\*/

mini web program dashboard that demonstrates how web-based apps can use Electron features through your Express API!
🎯 What This Shows:
8 Mini Programs included:

📁 File Manager - Open/save files with native dialogs
🔔 Notification Center - Send system notifications
🖥️ Screen Manager - Get display info and cursor position
📋 Clipboard Manager - Read/write clipboard
💻 System Info - App version, platform, power status
🪟 Window Controller - Minimize, maximize, fullscreen
🌐 URL Launcher - Open external URLs and system beep
💬 Dialog Manager - Show native dialogs with buttons

🚀 How to Use:

Run your Express server (from previous artifact) in Electron
Open this HTML file in:

Electron's renderer (best experience)
Any web browser (works remotely!)
Mobile browser (if server accessible)

Each mini program is self-contained and can access native features!

💡 Key Concepts:
javascript// Any web app can call these APIs:
fetch('<http://localhost:3000/api/native/open-file>', { method: 'POST' })
fetch('<http://localhost:3000/api/native/notification>', {
method: 'POST',
body: JSON.stringify({ title: 'Hi', body: 'Hello!' })
})

// Real-time commands via Socket.io:
socket.emit('native-command', { command: 'show-message', params: {...} })
socket.on('native-response', (data) => { /_handle response_/ })
🌟 Use Cases:

Internal Tools - Build admin dashboards that control desktop features
Remote Control - Control Electron app from phone/tablet browser
Plugin System - Let developers create web-based plugins with native access
Cross-Platform - Same web code works in browser AND Electron
Team Tools - Share native features across multiple web apps

You can create unlimited mini programs - just add more HTML/JS files that call your Express API! Each one is a standalone tool with full native access. 🎉
