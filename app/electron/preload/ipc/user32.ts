import type { USER32_GETKEYBOARDCAPLOCKSTATEResponse } from '../../common/ipc/user32.ts';
import {
  USER32_CALLDLLEXAMPLE,
  USER32_GETKEYBOARDCAPLOCKSTATE,
} from '../../common/ipc/user32.ts';
import { ipcRendererTimeOutRequest } from '../common/request.ts';

const user32 = {
  callDllExample: async () => {
    const result = await ipcRendererTimeOutRequest({
      channel: USER32_CALLDLLEXAMPLE,
    });
    return result;
  },
  getCaplockStatus: async () => {
    const result = (await ipcRendererTimeOutRequest({
      channel: USER32_GETKEYBOARDCAPLOCKSTATE,
    })) as USER32_GETKEYBOARDCAPLOCKSTATEResponse;

    return result;
  },
};

export default user32;
