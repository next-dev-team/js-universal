import { ipcMain, BrowserWindow } from 'electron';
import { readFile, writeFile, stat, unlink, access, constants } from 'fs/promises';
import { watch, type FSWatcher } from 'fs';
import { dirname } from 'path';
import { mkdir } from 'fs/promises';

interface FileWatcher {
  watcher: FSWatcher;
  watcherId: string;
}

const fileWatchers = new Map<string, FileWatcher>();

export function setupFileHandlers() {
  // Save file handler
  ipcMain.handle('save-file', async (_event, filePath: string, content: string): Promise<boolean> => {
    try {
      // Ensure directory exists
      const dir = dirname(filePath);
      await mkdir(dir, { recursive: true });
      
      await writeFile(filePath, content, 'utf8');
      console.log(`File saved: ${filePath}`);
      return true;
    } catch (error) {
      console.error('Failed to save file:', error);
      return false;
    }
  });

  // Read file handler
  ipcMain.handle('read-file', async (_event, filePath: string): Promise<string> => {
    try {
      const content = await readFile(filePath, 'utf8');
      return content;
    } catch (error) {
      console.error('Failed to read file:', error);
      throw error;
    }
  });

  // Watch file handler
  ipcMain.handle('watch-file', async (event, filePath: string, watcherId: string = `watcher-${Date.now()}`): Promise<void> => {
    try {
      // Remove existing watcher if any
      if (fileWatchers.has(filePath)) {
        const existing = fileWatchers.get(filePath)!;
        existing.watcher.close();
        fileWatchers.delete(filePath);
      }

      const watcher = watch(filePath, async (eventType) => {
        if (eventType === 'change') {
          try {
            const content = await readFile(filePath, 'utf8');
            const senderWindow = BrowserWindow.fromWebContents(event.sender);
            if (senderWindow) {
              senderWindow.webContents.send(`file-changed-${filePath}`, content);
            }
          } catch (error) {
            console.error('Failed to read changed file:', error);
          }
        }
      });

      fileWatchers.set(filePath, { watcher, watcherId });
      console.log(`Started watching file: ${filePath}`);
    } catch (error) {
      console.error('Failed to watch file:', error);
    }
  });

  // Unwatch file handler
  ipcMain.handle('unwatch-file', async (_event, filePath: string): Promise<void> => {
    try {
      if (fileWatchers.has(filePath)) {
        const { watcher } = fileWatchers.get(filePath)!;
        watcher.close();
        fileWatchers.delete(filePath);
        console.log(`Stopped watching file: ${filePath}`);
      }
    } catch (error) {
      console.error('Failed to unwatch file:', error);
    }
  });

  // File exists handler
  ipcMain.handle('file-exists', async (_event, filePath: string): Promise<boolean> => {
    try {
      await access(filePath, constants.F_OK);
      return true;
    } catch {
      return false;
    }
  });

  // Create file handler
  ipcMain.handle('create-file', async (_event, filePath: string, content: string = ''): Promise<boolean> => {
    try {
      // Ensure directory exists
      const dir = dirname(filePath);
      await mkdir(dir, { recursive: true });
      
      await writeFile(filePath, content, 'utf8');
      console.log(`File created: ${filePath}`);
      return true;
    } catch (error) {
      console.error('Failed to create file:', error);
      return false;
    }
  });

  // Delete file handler
  ipcMain.handle('delete-file', async (_event, filePath: string): Promise<boolean> => {
    try {
      await unlink(filePath);
      console.log(`File deleted: ${filePath}`);
      return true;
    } catch (error) {
      console.error('Failed to delete file:', error);
      return false;
    }
  });

  // Get file stats handler
  ipcMain.handle('get-file-stats', async (_event, filePath: string) => {
    try {
      const stats = await stat(filePath);
      return {
        size: stats.size,
        mtime: stats.mtime,
        ctime: stats.ctime,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory()
      };
    } catch (error) {
      console.error('Failed to get file stats:', error);
      return null;
    }
  });
}

// Cleanup function to close all watchers
export function cleanupFileWatchers() {
  for (const [filePath, { watcher }] of fileWatchers) {
    try {
      watcher.close();
      console.log(`Closed watcher for: ${filePath}`);
    } catch (error) {
      console.error(`Failed to close watcher for ${filePath}:`, error);
    }
  }
  fileWatchers.clear();
}