import { BrowserWindow, app } from 'electron';
import path from 'node:path';
import createProtocol from './create-protocol';
import checkUpdate from './ipc/check-update.ts';

export type IContext = {
  /** is allowed quit app */
  allowQuitting: boolean;
  /** main window */
  mainWindow?: BrowserWindow;
};
const isDevelopment = process.env.NODE_ENV === 'development';
const context: IContext = {
  allowQuitting: true,
};

const hideMainWindow = () => {
  if (context.mainWindow && !context.mainWindow.isDestroyed()) {
    context.mainWindow.hide();
  }
};

const showMainWindow = () => {
  if (context.mainWindow && !context.mainWindow.isDestroyed()) {
    context.mainWindow.show();
  }
};

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.cjs'),
      nodeIntegrationInSubFrames: true,
    },
  });
  if (isDevelopment) {
    mainWindow.webContents.openDevTools();
  }
  checkUpdate(mainWindow);
  context.mainWindow = mainWindow;
  context.mainWindow.on('close', (event) => {
    if (process.platform === 'darwin') {
      //context.allowQuitting = false;
    }
    if (!context.allowQuitting) {
      event.preventDefault();
      hideMainWindow();
    } else {
      context.mainWindow = undefined;
    }
  });
  if (isDevelopment && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(
      `${process.env['ELECTRON_RENDERER_URL']}#${import.meta.env.VITE_BASE_ROUTER_PREFIX}`,
    );
  } else {
    createProtocol('app');
    mainWindow.loadURL(
      `app://../renderer/index.html#${import.meta.env.VITE_BASE_ROUTER_PREFIX}`,
    );
    //mainWindow.loadURL(`app://../renderer/index.html#${import.meta.env.VITE_BASE_ROUTER_PREFIX}test/test1`);
  }
}

// quit app set allowQuitting to true
app.on('before-quit', () => {
  context.allowQuitting = true;
});
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (app.isReady()) {
    if (context.mainWindow === undefined) {
      createMainWindow();
    } else {
      showMainWindow();
    }
  }
});

export { createMainWindow };
