import type { IElectronAPI } from '../../electron/preload';

declare global {
  interface Window {
    expect: jest.Expect;
    electronAPI: IElectronAPI;
  }
}

export {};
