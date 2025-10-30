import { BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import * as fs from "fs";
import { PluginAPIBridge } from "./plugin-api-bridge";
import { PluginManifest } from "@js-universal/shared-types";

export interface DevPluginConfig {
  id: string;
  name: string;
  version: string;
  devPath: string;
  manifest: PluginManifest;
}

export class PluginDevLoader {
  private devPlugins: Map<string, DevPluginConfig> = new Map();
  private pluginWindows: Map<string, BrowserWindow> = new Map();
  private pluginAPIBridge: PluginAPIBridge;
  private fileWatchers: Map<string, fs.FSWatcher> = new Map();
  private isDevelopment: boolean;

  constructor(
    pluginAPIBridge: PluginAPIBridge,
    isDevelopment: boolean = false
  ) {
    this.pluginAPIBridge = pluginAPIBridge;
    this.isDevelopment = isDevelopment;
    this.setupDevHandlers();
  }

  private setupDevHandlers(): void {
    // Register dev plugin
    ipcMain.handle(
      "dev-plugin:register",
      async (event, config: DevPluginConfig) => {
        return await this.registerDevPlugin(config);
      }
    );

    // Launch dev plugin
    ipcMain.handle("dev-plugin:launch", async (event, pluginId: string) => {
      return await this.launchDevPlugin(pluginId);
    });

    // Close dev plugin
    ipcMain.handle("dev-plugin:close", async (event, pluginId: string) => {
      return await this.closeDevPlugin(pluginId);
    });

    // Get dev plugins
    ipcMain.handle("dev-plugin:list", async () => {
      return Array.from(this.devPlugins.values());
    });

    // Reload dev plugin
    ipcMain.handle("dev-plugin:reload", async (event, pluginId: string) => {
      return await this.reloadDevPlugin(pluginId);
    });
  }

  async registerDevPlugin(
    config: DevPluginConfig
  ): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`[PluginDevLoader] Registering dev plugin: ${config.id}`);

      // Validate dev path exists
      if (!fs.existsSync(config.devPath)) {
        return {
          success: false,
          message: `Development path does not exist: ${config.devPath}`,
        };
      }

      // Store plugin config
      this.devPlugins.set(config.id, config);

      // Setup file watcher for hot reload
      if (this.isDevelopment) {
        await this.setupFileWatcher(config.id, config.devPath);
      }

      console.log(
        `[PluginDevLoader] Successfully registered dev plugin: ${config.id}`
      );
      return {
        success: true,
        message: `Development plugin ${config.id} registered successfully`,
      };
    } catch (error) {
      console.error(
        `[PluginDevLoader] Failed to register dev plugin ${config.id}:`,
        error
      );
      return {
        success: false,
        message: `Failed to register dev plugin: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  async launchDevPlugin(
    pluginId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const config = this.devPlugins.get(pluginId);
      if (!config) {
        return {
          success: false,
          message: `Development plugin ${pluginId} not found`,
        };
      }

      // Check if already running
      if (this.pluginWindows.has(pluginId)) {
        const window = this.pluginWindows.get(pluginId);
        if (window && !window.isDestroyed()) {
          window.focus();
          return {
            success: true,
            message: `Development plugin ${pluginId} is already running`,
          };
        } else {
          this.pluginWindows.delete(pluginId);
        }
      }

      // Create development plugin window
      const pluginWindow = await this.createDevPluginWindow(config);

      // Register with API bridge
      this.pluginAPIBridge.registerPluginWindow(pluginId, pluginWindow);

      // Load the plugin
      await this.loadDevPlugin(pluginWindow, config);

      this.pluginWindows.set(pluginId, pluginWindow);

      // Handle window closed
      pluginWindow.on("closed", () => {
        this.pluginWindows.delete(pluginId);
        this.pluginAPIBridge.unregisterPluginWindow(pluginId);
      });

      console.log(
        `[PluginDevLoader] Successfully launched dev plugin: ${pluginId}`
      );
      return {
        success: true,
        message: `Development plugin ${pluginId} launched successfully`,
      };
    } catch (error) {
      console.error(
        `[PluginDevLoader] Failed to launch dev plugin ${pluginId}:`,
        error
      );
      return {
        success: false,
        message: `Failed to launch dev plugin: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  async closeDevPlugin(
    pluginId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const window = this.pluginWindows.get(pluginId);
      if (window && !window.isDestroyed()) {
        window.close();
        this.pluginWindows.delete(pluginId);
        this.pluginAPIBridge.unregisterPluginWindow(pluginId);

        console.log(
          `[PluginDevLoader] Successfully closed dev plugin: ${pluginId}`
        );
        return {
          success: true,
          message: `Development plugin ${pluginId} closed successfully`,
        };
      } else {
        return {
          success: false,
          message: `Development plugin ${pluginId} is not running`,
        };
      }
    } catch (error) {
      console.error(
        `[PluginDevLoader] Failed to close dev plugin ${pluginId}:`,
        error
      );
      return {
        success: false,
        message: `Failed to close dev plugin: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  async reloadDevPlugin(
    pluginId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const config = this.devPlugins.get(pluginId);
      if (!config) {
        return {
          success: false,
          message: `Development plugin ${pluginId} not found`,
        };
      }

      const window = this.pluginWindows.get(pluginId);
      if (window && !window.isDestroyed()) {
        // Reload the plugin content
        await this.loadDevPlugin(window, config);

        console.log(
          `[PluginDevLoader] Successfully reloaded dev plugin: ${pluginId}`
        );
        return {
          success: true,
          message: `Development plugin ${pluginId} reloaded successfully`,
        };
      } else {
        return {
          success: false,
          message: `Development plugin ${pluginId} is not running`,
        };
      }
    } catch (error) {
      console.error(
        `[PluginDevLoader] Failed to reload dev plugin ${pluginId}:`,
        error
      );
      return {
        success: false,
        message: `Failed to reload dev plugin: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  private async createDevPluginWindow(
    config: DevPluginConfig
  ): Promise<BrowserWindow> {
    // Get the correct preload script path
    const preloadPath = this.isDevelopment
      ? path.join(process.cwd(), "out/preload/dev-plugin-preload.cjs")
      : path.resolve(__dirname, "../preload/dev-plugin-preload.js");

    console.log(`[PluginDevLoader] Using preload script: ${preloadPath}`);

    const window = new BrowserWindow({
      width: 400,
      height: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        preload: preloadPath,
        additionalArguments: [`--plugin-id=${config.id}`],
      },
      title: `${config.name} (Dev Mode)`,
      show: false,
      resizable: true,
      minimizable: true,
      maximizable: true,
      closable: true,
    });

    // Show window when ready
    window.once("ready-to-show", () => {
      window.show();
      if (this.isDevelopment) {
        window.webContents.openDevTools();
      }
    });

    return window;
  }

  private async loadDevPlugin(
    window: BrowserWindow,
    config: DevPluginConfig
  ): Promise<void> {
    // For development mode, prefer development server over file system
    const devServerUrl = `http://localhost:${this.getDevServerPort(config.id)}`;
    const indexPath = path.join(config.devPath, "index.html");

    try {
      // First try to load from development server
      console.log(
        `[PluginDevLoader] Attempting to load plugin from dev server: ${devServerUrl}`
      );
      await window.loadURL(devServerUrl);
      console.log(
        `[PluginDevLoader] Successfully loaded plugin from dev server`
      );
    } catch (error) {
      console.log(
        `[PluginDevLoader] Failed to load from dev server: ${error.message}`
      );

      // Fallback to file system
      if (fs.existsSync(indexPath)) {
        const fileUrl = `file://${indexPath}`;
        console.log(`[PluginDevLoader] Loading plugin from file: ${fileUrl}`);
        await window.loadURL(fileUrl);
        console.log(`[PluginDevLoader] Successfully loaded plugin from file`);
      } else {
        throw new Error(
          `Neither development server nor file system path available for plugin ${config.id}`
        );
      }
    }
  }

  private getDevServerPort(pluginId: string): number {
    // Use specific ports for known development plugins
    if (pluginId === "counter-app-dev") {
      return 3003; // Updated to match the actual port
    }

    // Generate a unique port for other plugins based on its ID
    const hash = pluginId.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
    return 3000 + (Math.abs(hash) % 1000);
  }

  private async setupFileWatcher(
    pluginId: string,
    devPath: string
  ): Promise<void> {
    try {
      // Remove existing watcher if any
      const existingWatcher = this.fileWatchers.get(pluginId);
      if (existingWatcher) {
        existingWatcher.close();
      }

      // Create new file watcher
      const watcher = fs.watch(
        devPath,
        { recursive: true },
        (eventType, filename) => {
          if (
            filename &&
            (filename.endsWith(".html") ||
              filename.endsWith(".js") ||
              filename.endsWith(".css"))
          ) {
            console.log(
              `[PluginDevLoader] File changed: ${filename} in plugin ${pluginId}`
            );

            // Debounce reload to avoid multiple rapid reloads
            setTimeout(() => {
              this.reloadDevPlugin(pluginId).catch(console.error);
            }, 500);
          }
        }
      );

      this.fileWatchers.set(pluginId, watcher);
      console.log(
        `[PluginDevLoader] File watcher set up for plugin: ${pluginId}`
      );
    } catch (error) {
      console.error(
        `[PluginDevLoader] Failed to setup file watcher for plugin ${pluginId}:`,
        error
      );
    }
  }

  // Cleanup method
  cleanup(): void {
    // Close all file watchers
    for (const watcher of this.fileWatchers.values()) {
      watcher.close();
    }
    this.fileWatchers.clear();

    // Close all plugin windows
    for (const window of this.pluginWindows.values()) {
      if (!window.isDestroyed()) {
        window.close();
      }
    }
    this.pluginWindows.clear();

    // Clear dev plugins
    this.devPlugins.clear();
  }

  // Get running dev plugins
  getRunningDevPlugins(): string[] {
    return Array.from(this.pluginWindows.keys());
  }

  // Check if dev plugin is running
  isDevPluginRunning(pluginId: string): boolean {
    return this.pluginWindows.has(pluginId);
  }
}
