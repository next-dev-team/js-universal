import { initTestIpcMain } from './test.ts';
import { initUser32IpcMain } from './user32.ts';
import projectManagerIPC from './project-manager.ts';

const initIpcMain = () => {
  initTestIpcMain();
  initUser32IpcMain();
  projectManagerIPC.init();
};
export default initIpcMain;
