import { ipcMain } from 'electron';
import type { USER32_GETKEYBOARDCAPLOCKSTATEResponse } from '../../common/ipc/user32.ts';
import {
  USER32_CALLDLLEXAMPLE,
  USER32_GETKEYBOARDCAPLOCKSTATE,
} from '../../common/ipc/user32.ts';
import User32Library, { keyParam } from '../native/dll/user32.ts';

const initUser32IpcMain = () => {
  ipcMain.handle(USER32_CALLDLLEXAMPLE, async () => {
    const result = User32Library.getInstance().callDllExample();
    return result;
  });
  ipcMain.handle(USER32_GETKEYBOARDCAPLOCKSTATE, async () => {
    const data = User32Library.getInstance().getKeyboardState();
    if (data.code !== 0) {
      return data as USER32_GETKEYBOARDCAPLOCKSTATEResponse;
    }
    const { result, lpKeyState } = data.data!;
    let isCapLock = false;
    if (result) {
      isCapLock = lpKeyState[keyParam['capslock']] === 1;
    }
    return {
      code: result ? 0 : 1,
      data: { isCapLock },
      message: result ? '' : '获取大小写状态失败',
    } as USER32_GETKEYBOARDCAPLOCKSTATEResponse;
  });
};
export { initUser32IpcMain };
