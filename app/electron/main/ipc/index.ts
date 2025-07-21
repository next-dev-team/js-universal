import { initTestIpcMain } from './test.ts';
import { initUser32IpcMain } from './user32.ts';

const initIpcMain = () => {
  initTestIpcMain();
  initUser32IpcMain();
};
export default initIpcMain;
