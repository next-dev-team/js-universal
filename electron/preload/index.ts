import { contextBridge, ipcRenderer } from 'electron';
import { initPreloadLogger } from '../common/logger/preload.ts';
import checkUpdate from './ipc/check-update.ts';
import projectAPI from './ipc/project.ts';
import { getTestHandle1 } from './ipc/test.ts';
import user32 from './ipc/user32.ts';

// File operations API
const fileAPI = {
  saveFile: async (filePath: string, content: string): Promise<boolean> => {
    try {
      return await ipcRenderer.invoke('save-file', filePath, content);
    } catch (_error) {
      console.error('Failed to save file:', _error);
      return false;
    }
  },

  readFile: async (filePath: string): Promise<string> => {
    try {
      return await ipcRenderer.invoke('read-file', filePath);
    } catch (_error) {
      console.error('Failed to read file:', _error);
      return '';
    }
  },

  watchFile: (filePath: string, callback: (content: string) => void): void => {
    const watcherId = `file-watcher-${Date.now()}`;

    ipcRenderer.on(`file-changed-${filePath}`, (_, content: string) => {
      callback(content);
    });

    ipcRenderer.invoke('watch-file', filePath, watcherId);
  },

  unwatchFile: (filePath: string): void => {
    ipcRenderer.invoke('unwatch-file', filePath);
    ipcRenderer.removeAllListeners(`file-changed-${filePath}`);
  },

  fileExists: async (filePath: string): Promise<boolean> => {
    try {
      return await ipcRenderer.invoke('file-exists', filePath);
    } catch (_error) {
      return false;
    }
  },

  createFile: async (
    filePath: string,
    content: string = '',
  ): Promise<boolean> => {
    try {
      return await ipcRenderer.invoke('create-file', filePath, content);
    } catch (_error) {
      console.error('Failed to create file:', _error);
      return false;
    }
  },

  deleteFile: async (filePath: string): Promise<boolean> => {
    try {
      return await ipcRenderer.invoke('delete-file', filePath);
    } catch (_error) {
      console.error('Failed to delete file:', _error);
      return false;
    }
  },

  getFileStats: async (filePath: string) => {
    try {
      return await ipcRenderer.invoke('get-file-stats', filePath);
    } catch (_error) {
      console.error('Failed to get file stats:', _error);
      return null;
    }
  },
};

const cliApi = {
  pterm: async (args: string[] = []) =>
    await ipcRenderer.invoke('run-pterm', args),
};

initPreloadLogger();

const apiKey = 'electron';

const api = {
  ...cliApi,
  versions: process.versions,
  getTestHandle1,
  user32,
  checkUpdate,
  project: projectAPI,
  file: fileAPI,
  send: (type: string, msg: unknown) => {
    ipcRenderer.send(type, msg);
  },
  ipcRenderer,
};

contextBridge.exposeInMainWorld(apiKey, api);

export type IElectronAPI = typeof api;
