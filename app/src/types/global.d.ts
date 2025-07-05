import type { IElectronAPI } from '../../electron/preload';

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
