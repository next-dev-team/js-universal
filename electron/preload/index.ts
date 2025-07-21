import { contextBridge, ipcRenderer, shell } from 'electron';
import { initPreloadLogger } from '../common/logger/preload.ts';
import checkUpdate from './ipc/check-update.ts';
import projectAPI from './ipc/project.ts';
import { getTestHandle1 } from './ipc/test.ts';
import user32 from './ipc/user32.ts';

initPreloadLogger();

const apiKey = 'electronAPI';

const api = {
  shell,
  versions: process.versions,
  getTestHandle1,
  user32,
  checkUpdate,
  project: projectAPI,
  send: (type: string, msg: unknown) => {
    ipcRenderer.send(type, msg);
  },
  ipcRenderer,
};

contextBridge.exposeInMainWorld(apiKey, api);

export type IElectronAPI = typeof api;
