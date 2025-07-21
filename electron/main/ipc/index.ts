import { initProjectIpcMain } from './project.ts';
import { initTestIpcMain } from './test.ts';
import { initUser32IpcMain } from './user32.ts';

const initIpcMain = () => {
  initTestIpcMain();
  initUser32IpcMain();
  initProjectIpcMain();
};
export default initIpcMain;
