import { BrowserWindow, ipcMain } from "electron";
import { promises as fs } from "fs";
import path from "path";
import { DatabaseService } from "./database-service";
import { PluginContext } from "./types";

export class PluginAPIBridge {
  private databaseService: DatabaseService;
  private pluginContexts: Map<
    string,
    PluginContext & { storage: Map<string, any> }
  > = new Map();
  private pluginWindows: Map<string, BrowserWindow> = new Map();

  constructor(databaseService: DatabaseService) {
    this.databaseService = databaseService;
    this.setupAPIHandlers();
  }

  registerPluginWindow(pluginId: string, window: BrowserWindow): void {
    this.pluginWindows.set(pluginId, window);

    // Create plugin context with storage
    const context: PluginContext & { storage: Map<string, any> } = {
      pluginId,
      pluginName: pluginId,
      version: "1.0.0",
      permissions: [],
      dataPath: path.join(process.cwd(), "plugin-data", pluginId),
      tempPath: path.join(process.cwd(), "plugin-temp", pluginId),
      storage: new Map(),
    };
    this.pluginContexts.set(pluginId, context);

    // Load plugin permissions and storage
    this.loadPluginPermissions(pluginId);
    this.loadPluginStorageFromDisk(pluginId);
  }

  unregisterPluginWindow(pluginId: string): void {
    this.pluginWindows.delete(pluginId);
    this.pluginContexts.delete(pluginId);
  }

  private async loadPluginPermissions(pluginId: string): Promise<void> {
    try {
      const plugin = await this.databaseService.getPluginById(pluginId);
      if (plugin) {
        const context = this.pluginContexts.get(pluginId);
        if (context) {
          context.permissions = plugin.requiredPermissions || [];
        }
      }
    } catch (error) {
      console.error("Failed to load plugin permissions:", error);
    }
  }

  private setupAPIHandlers(): void {
    // Plugin identification
    ipcMain.handle("plugin-api:get-info", async (event) => {
      const pluginId = this.getPluginIdFromEvent(event);
      if (!pluginId) return null;

      const plugin = await this.databaseService.getPluginById(pluginId);
      return plugin
        ? {
            id: plugin.id,
            name: plugin.name,
            version: plugin.version,
            author: plugin.author,
          }
        : null;
    });

    // Storage API
    ipcMain.handle("plugin-api:storage-get", async (event, key: string) => {
      const pluginId = this.getPluginIdFromEvent(event);
      if (!pluginId) return null;

      const context = this.pluginContexts.get(pluginId);
      return context?.storage.get(key) || null;
    });

    ipcMain.handle(
      "plugin-api:storage-set",
      async (event, key: string, value: any) => {
        const pluginId = this.getPluginIdFromEvent(event);
        if (!pluginId) return false;

        const context = this.pluginContexts.get(pluginId);
        if (context) {
          context.storage.set(key, value);
          // Persist to database
          await this.persistPluginStorage(pluginId, key, value);
          return true;
        }
        return false;
      }
    );

    ipcMain.handle("plugin-api:storage-remove", async (event, key: string) => {
      const pluginId = this.getPluginIdFromEvent(event);
      if (!pluginId) return false;

      const context = this.pluginContexts.get(pluginId);
      if (context) {
        context.storage.delete(key);
        await this.removePluginStorage(pluginId, key);
        return true;
      }
      return false;
    });

    ipcMain.handle("plugin-api:storage-clear", async (event) => {
      const pluginId = this.getPluginIdFromEvent(event);
      if (!pluginId) return false;

      const context = this.pluginContexts.get(pluginId);
      if (context) {
        context.storage.clear();
        await this.clearPluginStorage(pluginId);
        return true;
      }
      return false;
    });

    // Notification API
    ipcMain.handle(
      "plugin-api:show-notification",
      async (event, title: string, body: string, options?: any) => {
        const pluginId = this.getPluginIdFromEvent(event);
        if (!pluginId || !this.hasPermission(pluginId, "notifications")) {
          return false;
        }

        // Send notification to main app
        const mainWindow = BrowserWindow.getAllWindows().find((w) =>
          w.webContents.getURL().includes("index.html")
        );
        if (mainWindow) {
          mainWindow.webContents.send("show-notification", {
            title,
            body,
            pluginId,
            ...options,
          });
        }
        return true;
      }
    );

    // Network API
    ipcMain.handle(
      "plugin-api:fetch",
      async (event, url: string, options?: RequestInit) => {
        const pluginId = this.getPluginIdFromEvent(event);
        if (!pluginId || !this.hasPermission(pluginId, "network")) {
          throw new Error("Network permission denied");
        }

        try {
          const response = await fetch(url, options);
          return {
            ok: response.ok,
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            body: await response.text(),
          };
        } catch (error) {
          throw new Error(
            `Network request failed: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }
      }
    );

    // File system API
    ipcMain.handle("plugin-api:read-file", async (event, filePath: string) => {
      const pluginId = this.getPluginIdFromEvent(event);
      if (!pluginId || !this.hasPermission(pluginId, "filesystem")) {
        throw new Error("File system permission denied");
      }

      // Validate path is within plugin's data directory
      const context = this.pluginContexts.get(pluginId);
      if (!context) {
        throw new Error("Plugin context not found");
      }

      const resolvedPath = path.resolve(context.dataPath, filePath);
      if (!resolvedPath.startsWith(context.dataPath)) {
        throw new Error("Invalid file path - outside plugin directory");
      }

      try {
        const content = await fs.readFile(resolvedPath, "utf-8");
        return content;
      } catch (error) {
        throw new Error(
          `Failed to read file: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    });

    ipcMain.handle(
      "plugin-api:write-file",
      async (event, filePath: string, content: string) => {
        const pluginId = this.getPluginIdFromEvent(event);
        if (!pluginId || !this.hasPermission(pluginId, "filesystem")) {
          throw new Error("File system permission denied");
        }

        const context = this.pluginContexts.get(pluginId);
        if (!context) {
          throw new Error("Plugin context not found");
        }

        const resolvedPath = path.resolve(context.dataPath, filePath);
        if (!resolvedPath.startsWith(context.dataPath)) {
          throw new Error("Invalid file path - outside plugin directory");
        }

        try {
          // Ensure directory exists
          await fs.mkdir(path.dirname(resolvedPath), { recursive: true });
          await fs.writeFile(resolvedPath, content, "utf-8");
          return true;
        } catch (error) {
          throw new Error(
            `Failed to write file: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }
      }
    );

    ipcMain.handle(
      "plugin-api:file-exists",
      async (event, filePath: string) => {
        const pluginId = this.getPluginIdFromEvent(event);
        if (!pluginId || !this.hasPermission(pluginId, "filesystem")) {
          throw new Error("File system permission denied");
        }

        const context = this.pluginContexts.get(pluginId);
        if (!context) {
          throw new Error("Plugin context not found");
        }

        const resolvedPath = path.resolve(context.dataPath, filePath);
        if (!resolvedPath.startsWith(context.dataPath)) {
          throw new Error("Invalid file path - outside plugin directory");
        }

        try {
          await fs.access(resolvedPath);
          return true;
        } catch {
          return false;
        }
      }
    );

    // Inter-plugin communication
    ipcMain.handle(
      "plugin-api:send-message",
      async (event, targetPluginId: string, message: any) => {
        const senderPluginId = this.getPluginIdFromEvent(event);
        if (!senderPluginId) return false;

        const targetWindow = this.pluginWindows.get(targetPluginId);
        if (targetWindow && !targetWindow.isDestroyed()) {
          targetWindow.webContents.send("plugin-message", {
            from: senderPluginId,
            data: message,
          });
          return true;
        }
        return false;
      }
    );

    ipcMain.handle(
      "plugin-api:broadcast-message",
      async (event, message: any) => {
        const senderPluginId = this.getPluginIdFromEvent(event);
        if (!senderPluginId) return false;

        for (const [pluginId, window] of this.pluginWindows) {
          if (pluginId !== senderPluginId && !window.isDestroyed()) {
            window.webContents.send("plugin-broadcast", {
              from: senderPluginId,
              data: message,
            });
          }
        }
        return true;
      }
    );

    // Permission API
    ipcMain.handle(
      "plugin-api:request-permission",
      async (event, permission: string) => {
        const pluginId = this.getPluginIdFromEvent(event);
        if (!pluginId) return false;

        // For now, just add the permission to the context
        const context = this.pluginContexts.get(pluginId);
        if (context && !context.permissions.includes(permission)) {
          context.permissions.push(permission);
        }
        return true;
      }
    );

    ipcMain.handle(
      "plugin-api:check-permission",
      async (event, permission: string) => {
        const pluginId = this.getPluginIdFromEvent(event);
        if (!pluginId) return false;

        return this.hasPermission(pluginId, permission);
      }
    );

    ipcMain.handle(
      "plugin-api:has-permission",
      async (event, permission: string) => {
        const pluginId = this.getPluginIdFromEvent(event);
        if (!pluginId) return false;

        return this.hasPermission(pluginId, permission);
      }
    );

    // Utility API
    ipcMain.handle(
      "plugin-api:log",
      async (event, level: string, message: string, ...args: any[]) => {
        const pluginId = this.getPluginIdFromEvent(event);
        const timestamp = new Date().toISOString();

        console.log(
          `[${timestamp}] [Plugin:${pluginId}] [${level.toUpperCase()}] ${message}`,
          ...args
        );

        // Send to developer console if open
        const mainWindow = BrowserWindow.getAllWindows().find((w) =>
          w.webContents.getURL().includes("index.html")
        );
        if (mainWindow) {
          mainWindow.webContents.send("plugin-log", {
            pluginId,
            level,
            message,
            args,
            timestamp,
          });
        }
      }
    );
  }

  private getPluginIdFromEvent(event: any): string | null {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (!window) return null;

    for (const [pluginId, pluginWindow] of this.pluginWindows) {
      if (pluginWindow.id === window.id) {
        return pluginId;
      }
    }
    return null;
  }

  private hasPermission(pluginId: string, permission: string): boolean {
    const context = this.pluginContexts.get(pluginId);
    return context?.permissions.includes(permission) || false;
  }

  private async persistPluginStorage(
    pluginId: string,
    key: string,
    value: any
  ): Promise<void> {
    try {
      // Store in database or file system
      // For now, we'll use a simple JSON file approach
      const storageDir = path.join(process.cwd(), "plugin-storage");
      await fs.mkdir(storageDir, { recursive: true });

      const storageFile = path.join(storageDir, `${pluginId}.json`);
      let storage: Record<string, any> = {};

      try {
        const content = await fs.readFile(storageFile, "utf-8");
        storage = JSON.parse(content);
      } catch {
        // File doesn't exist or is invalid, start with empty storage
      }

      storage[key] = value;
      await fs.writeFile(storageFile, JSON.stringify(storage, null, 2));
    } catch (error) {
      console.error("Failed to persist plugin storage:", error);
    }
  }

  private async removePluginStorage(
    pluginId: string,
    key: string
  ): Promise<void> {
    try {
      const storageDir = path.join(process.cwd(), "plugin-storage");
      const storageFile = path.join(storageDir, `${pluginId}.json`);

      try {
        const content = await fs.readFile(storageFile, "utf-8");
        const storage = JSON.parse(content);
        delete storage[key];
        await fs.writeFile(storageFile, JSON.stringify(storage, null, 2));
      } catch {
        // File doesn't exist, nothing to remove
      }
    } catch (error) {
      console.error("Failed to remove plugin storage:", error);
    }
  }

  private async clearPluginStorage(pluginId: string): Promise<void> {
    try {
      const storageDir = path.join(process.cwd(), "plugin-storage");
      const storageFile = path.join(storageDir, `${pluginId}.json`);

      try {
        await fs.unlink(storageFile);
      } catch {
        // File doesn't exist, nothing to clear
      }
    } catch (error) {
      console.error("Failed to clear plugin storage:", error);
    }
  }

  async loadPluginStorageFromDisk(pluginId: string): Promise<void> {
    try {
      const storageDir = path.join(process.cwd(), "plugin-storage");
      const storageFile = path.join(storageDir, `${pluginId}.json`);

      const content = await fs.readFile(storageFile, "utf-8");
      const storage = JSON.parse(content);

      const context = this.pluginContexts.get(pluginId);
      if (context) {
        context.storage.clear();
        for (const [key, value] of Object.entries(storage)) {
          context.storage.set(key, value);
        }
      }
    } catch {
      // File doesn't exist or is invalid, start with empty storage
    }
  }
}
