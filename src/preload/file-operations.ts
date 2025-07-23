import { contextBridge, ipcRenderer } from 'electron';

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
    
    ipcRenderer.on(`file-changed-${filePath}`, (_event, content: string) => {
      callback(content);
    });
    
    ipcRenderer.invoke('watch-file', filePath, watcherId);
  },

  unwatchFile: (filePath: string): void => {
    ipcRenderer.invoke('unwatch-file', filePath);
    ipcRenderer.removeAllListeners(`file-changed-${filePath}`);
  },

  // Additional file operations
  fileExists: async (filePath: string): Promise<boolean> => {
    try {
      return await ipcRenderer.invoke('file-exists', filePath);
    } catch (_error) {
      return false;
    }
  },

  createFile: async (filePath: string, content: string = ''): Promise<boolean> => {
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
  }
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', fileAPI);

export type FileAPI = typeof fileAPI;