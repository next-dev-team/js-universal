import type { IpcResponse } from './index';

export const USER32_CALLDLLEXAMPLE = 'USER32_CALLDLLEXAMPLE';

export const USER32_GETKEYBOARDCAPLOCKSTATE = 'USER32_GETKEYBOARDCAPLOCKSTATE';
export type USER32_GETKEYBOARDCAPLOCKSTATEResponse = IpcResponse<{
  isCapLock: boolean;
}>;
