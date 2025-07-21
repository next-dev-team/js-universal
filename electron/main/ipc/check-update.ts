import type { BrowserWindow } from 'electron';
import { app, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import path from 'node:path';
import type { IpcResponse } from '../../common/ipc';
import type { CHECK_UPDATEResponse } from '../../common/ipc/check-update';
import {
  CHECK_UPDATE,
  CONFIRM_DOWNLOAD,
  CONFIRM_UPDATE,
  VERSION_UPDATE_MESSAGE,
} from '../../common/ipc/check-update';
import type { IUpdateType } from '../../common/ipc/check-update.ts';

const isDevelopment = process.env.NODE_ENV === 'development';

if (isDevelopment) {
  Object.defineProperty(app, 'isPackaged', {
    get() {
      return true;
    },
  });
}

function autoUpdaterMessage(
  mainWindow: BrowserWindow,
  type: IUpdateType['state'],
  data: IUpdateType['message'],
) {
  const sendData = {
    state: type,
    message: data,
  };
  mainWindow.webContents.send(VERSION_UPDATE_MESSAGE, sendData);
  console.log('autoUpdaterMessage:', sendData);
}

const initCheckUpdateIpcMain = (mainWindow: BrowserWindow) => {
  autoUpdater.on('download-progress', (progressObj) => {
    autoUpdaterMessage(mainWindow, 3, progressObj);
  });
  autoUpdater.on('update-downloaded', ({ version }) => {
    autoUpdaterMessage(mainWindow, 4, version);
  });
  ipcMain.handle(CHECK_UPDATE, () => {
    autoUpdater.autoDownload = false;
    if (isDevelopment) {
      autoUpdater.updateConfigPath = path.join(
        __dirname,
        '../../electron/main/dev-app-update.yml',
      );
    }

    const result = new Promise<CHECK_UPDATEResponse>((resolve) => {
      autoUpdater.once('error', (err) => {
        resolve({
          code: 0,
          data: { state: -1, message: err.message },
          message: '检查更新失败',
        });
      });
      autoUpdater.once('update-not-available', (info) => {
        resolve({
          code: 0,
          data: { state: 2, message: info.version },
          message: '未检测到新版本',
        });
      });
      autoUpdater.once('update-available', (info) => {
        resolve({
          code: 0,
          data: { state: 1, message: info.version },
          message: '检测到新版本',
        });
      });
    });
    autoUpdater.checkForUpdates();
    return result;
  });
  ipcMain.handle(CONFIRM_DOWNLOAD, async () => {
    await autoUpdater.downloadUpdate();
    const result: IpcResponse = { code: 0 };
    return result;
  });

  ipcMain.handle(CONFIRM_UPDATE, () => {
    autoUpdater.quitAndInstall();
    // if mac close all windows not quit app,need next code, see: https://github.com/electron-userland/electron-builder/issues/6058
    // code use allowQuitting false in electron/main/main-window.ts:44
    /*setTimeout(() => {
      autoUpdater.quitAndInstall();
      app.exit();
    }, 10000);*/
    const result: IpcResponse = { code: 0 };
    return result;
  });
};
export default initCheckUpdateIpcMain;
