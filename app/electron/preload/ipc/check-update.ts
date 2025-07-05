import { ipcRenderer } from 'electron';
import type {
  CHECK_UPDATEResponse,
  IUpdateType,
} from '../../common/ipc/check-update.ts';
import {
  CHECK_UPDATE,
  CONFIRM_DOWNLOAD,
  CONFIRM_UPDATE,
  VERSION_UPDATE_MESSAGE,
} from '../../common/ipc/check-update.ts';
import { ipcRendererTimeOutRequest } from '../common/request.ts';

const checkUpdate = {
  checkUpdate: async () => {
    const result = (await ipcRendererTimeOutRequest({
      channel: CHECK_UPDATE,
    })) as CHECK_UPDATEResponse;

    return result;
  },
  confirmDownload: async () => {
    const result = await ipcRendererTimeOutRequest({
      channel: CONFIRM_DOWNLOAD,
      timeout: 60 * 1000,
    });

    return result;
  },
  confirmUpdate: async () => {
    const result = await ipcRendererTimeOutRequest({
      channel: CONFIRM_UPDATE,
    });

    return result;
  },
  watchVersionUpdateMsg: (callback: (arg: IUpdateType) => void) => {
    ipcRenderer.removeAllListeners(VERSION_UPDATE_MESSAGE);
    ipcRenderer.on(VERSION_UPDATE_MESSAGE, (_event, arg: IUpdateType) => {
      callback(arg);
    });
  },
};

export default checkUpdate;
