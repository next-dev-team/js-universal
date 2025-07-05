import { ipcMain } from 'electron';
import type { TEST_HANDLE1Response } from '../../common/ipc/test.ts';
import { TEST_HANDLE1 } from '../../common/ipc/test.ts';

const initTestIpcMain = () => {
  ipcMain.handle(TEST_HANDLE1, async (_event, args) => {
    console.log(`${TEST_HANDLE1} args:`, args);
    const result: TEST_HANDLE1Response = { code: 0, data: { a: 'a' } };
    return result;
  });
};
export { initTestIpcMain };
