import type { ProgressInfo } from 'electron-builder';
import type { IpcResponse } from './index.ts';

export const VERSION_UPDATE_MESSAGE = 'VERSION_UPDATE_MESSAGE';
export const CONFIRM_DOWNLOAD = 'CONFIRM_DOWNLOAD';
export const CONFIRM_UPDATE = 'CONFIRM_UPDATE';
export const CHECK_UPDATE = 'CHECK_UPDATE';

export type IUpdateType =
  | {
      /**
       * 3 下载中 4 下载完成
       **/
      state: 4;
      message: string;
    }
  | {
      /**
       * 3 下载中 4 下载完成
       **/
      state: 3;
      message: ProgressInfo;
    };
export type CHECK_UPDATEResponse = IpcResponse<{
  /**
   * -1 检查更新失败 1 检测到新版本，准备下载 2 未检测到新版本
   **/
  state: -1 | 1 | 2;
  message: string;
}>;
