import { app, protocol } from 'electron';
import { getMainLogger, initMainLogger } from '../common/logger/main.ts';
import initIpcMain from './ipc';
import { createMainWindow } from './main-window';

initMainLogger();
const indexLog = getMainLogger().scope('index');

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      secure: true,
      standard: true,
      supportFetchAPI: false,
      allowServiceWorkers: false,
    },
  },
]);

initIpcMain();
app.whenReady().then(() => {
  indexLog.info('app ready createMainWindow');
  createMainWindow();
});

app.on('quit', () => {
  indexLog.info('quit app');
});
