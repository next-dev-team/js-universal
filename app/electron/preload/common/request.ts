import { ipcRenderer } from 'electron';
import type { IpcResponse } from '../../common/ipc';
import { defaultTimeout } from '../../common/ipc';
import { getPreloadLogger } from '../../common/logger/preload.ts';

const ipcRendererTimeOutRequest = async <T = unknown, D = unknown>(opts: {
  channel: string;
  data?: T;
  timeout?: number;
}): Promise<IpcResponse<D>> => {
  const { channel, data, timeout = defaultTimeout } = opts;
  const timeoutPromise = new Promise<IpcResponse<D>>((resolve) => {
    setTimeout(() => {
      resolve({ code: 1, message: 'ipc请求超时' });
    }, timeout);
  });
  const requestLog = getPreloadLogger().scope('ipcRendererTimeOutRequest');

  try {
    requestLog.log(`${channel} request data:`, data);
    const response = await Promise.race([
      ipcRenderer.invoke(channel, data),
      timeoutPromise,
    ]);
    requestLog.log(`${channel} response:`, response);
    return response;
  } catch (error) {
    const response: IpcResponse<D> = { code: 2, message: 'ipc请求错误' };
    requestLog.error(`${channel} response error:`, response, error);
    return response;
  }
};

export { ipcRendererTimeOutRequest };
