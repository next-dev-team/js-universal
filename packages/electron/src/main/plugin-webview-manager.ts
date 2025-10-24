import { BrowserWindow, ipcMain, webContents } from "electron";
import * as path from "path";
import * as fs from "fs";
import { PluginAPIBridge } from "./plugin-api-bridge";
import { PluginManifest } from "@js-universal/shared-types";

export interface WebviewPluginConfig {
  id: string;
  name: string;
  version: string;
  url: string;
  manifest: PluginManifest;
  isDevelopment?: boolean;
}

export class PluginWebviewManager {
  private pluginAPIBridge: PluginAPIBridge;
  private webviewPlugins: Map<string, WebviewPluginConfig> = new Map();
  private isDevelopment: boolean;

  constructor(
    pluginAPIBridge: PluginAPIBridge,
    isDevelopment: boolean = false
  ) {
    this.pluginAPIBridge = pluginAPIBridge;
    this.isDevelopment = isDevelopment;
    this.setupWebviewHandlers();
  }

  private setupWebviewHandlers(): void {
    // Register webview plugin
    ipcMain.handle(
      "webview-plugin:register",
      async (event, config: WebviewPluginConfig) => {
        return await this.registerWebviewPlugin(config);
      }
    );

    // Launch webview plugin
    ipcMain.handle("webview-plugin:launch", async (event, pluginId: string) => {
      return await this.launchWebviewPlugin(pluginId);
    });

    // Close webview plugin
    ipcMain.handle("webview-plugin:close", async (event, pluginId: string) => {
      return await this.closeWebviewPlugin(pluginId);
    });

    // Get webview plugins
    ipcMain.handle("webview-plugin:list", async () => {
      return Array.from(this.webviewPlugins.values());
    });

    // Inject pluginAPI into webview
    ipcMain.handle(
      "webview-plugin:inject-api",
      async (event, pluginId: string) => {
        return await this.injectPluginAPI(pluginId);
      }
    );
  }

  async registerWebviewPlugin(
    config: WebviewPluginConfig
  ): Promise<{ success: boolean; message: string }> {
    try {
      console.log(
        `[PluginWebviewManager] Registering webview plugin: ${config.id}`
      );

      // Validate URL
      if (!config.url) {
        return {
          success: false,
          message: `URL is required for webview plugin ${config.id}`,
        };
      }

      // Store plugin config
      this.webviewPlugins.set(config.id, config);

      console.log(
        `[PluginWebviewManager] Successfully registered webview plugin: ${config.id}`
      );
      return {
        success: true,
        message: `Webview plugin ${config.id} registered successfully`,
      };
    } catch (error) {
      console.error(
        `[PluginWebviewManager] Failed to register webview plugin ${config.id}:`,
        error
      );
      return {
        success: false,
        message: `Failed to register webview plugin: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  async launchWebviewPlugin(
    pluginId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const config = this.webviewPlugins.get(pluginId);
      if (!config) {
        return {
          success: false,
          message: `Webview plugin ${pluginId} not found`,
        };
      }

      // Send message to renderer to launch webview
      const mainWindow = BrowserWindow.getAllWindows().find((window) =>
        window.webContents.getURL().includes("localhost:5174")
      );

      if (mainWindow) {
        mainWindow.webContents.send("webview-plugin:launch", {
          pluginId: config.id,
          pluginName: config.name,
          pluginUrl: config.url,
          isDevelopment: config.isDevelopment,
        });

        console.log(
          `[PluginWebviewManager] Successfully launched webview plugin: ${pluginId}`
        );
        return {
          success: true,
          message: `Webview plugin ${pluginId} launched successfully`,
        };
      } else {
        return {
          success: false,
          message: "Main window not found",
        };
      }
    } catch (error) {
      console.error(
        `[PluginWebviewManager] Failed to launch webview plugin ${pluginId}:`,
        error
      );
      return {
        success: false,
        message: `Failed to launch webview plugin: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  async closeWebviewPlugin(
    pluginId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const config = this.webviewPlugins.get(pluginId);
      if (!config) {
        return {
          success: false,
          message: `Webview plugin ${pluginId} not found`,
        };
      }

      // Send message to renderer to close webview
      const mainWindow = BrowserWindow.getAllWindows().find((window) =>
        window.webContents.getURL().includes("localhost:5174")
      );

      if (mainWindow) {
        mainWindow.webContents.send("webview-plugin:close", pluginId);

        console.log(
          `[PluginWebviewManager] Successfully closed webview plugin: ${pluginId}`
        );
        return {
          success: true,
          message: `Webview plugin ${pluginId} closed successfully`,
        };
      } else {
        return {
          success: false,
          message: "Main window not found",
        };
      }
    } catch (error) {
      console.error(
        `[PluginWebviewManager] Failed to close webview plugin ${pluginId}:`,
        error
      );
      return {
        success: false,
        message: `Failed to close webview plugin: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  async injectPluginAPI(
    pluginId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const config = this.webviewPlugins.get(pluginId);
      if (!config) {
        return {
          success: false,
          message: `Webview plugin ${pluginId} not found`,
        };
      }

      // Get the preload script path
      const preloadPath = this.isDevelopment
        ? path.join(process.cwd(), "out/preload/dev-plugin-preload.cjs")
        : path.resolve(__dirname, "../preload/dev-plugin-preload.js");

      console.log(`[PluginWebviewManager] Injecting pluginAPI for ${pluginId}`);
      console.log(`[PluginWebviewManager] Preload path: ${preloadPath}`);

      // Send injection command to renderer
      const mainWindow = BrowserWindow.getAllWindows().find((window) =>
        window.webContents.getURL().includes("localhost:5174")
      );

      if (mainWindow) {
        mainWindow.webContents.send("webview-plugin:inject-api", {
          pluginId,
          preloadPath,
        });

        return {
          success: true,
          message: `PluginAPI injected for ${pluginId}`,
        };
      } else {
        return {
          success: false,
          message: "Main window not found",
        };
      }
    } catch (error) {
      console.error(
        `[PluginWebviewManager] Failed to inject pluginAPI for ${pluginId}:`,
        error
      );
      return {
        success: false,
        message: `Failed to inject pluginAPI: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  // Cleanup method
  cleanup(): void {
    this.webviewPlugins.clear();
  }

  // Get registered webview plugins
  getRegisteredWebviewPlugins(): WebviewPluginConfig[] {
    return Array.from(this.webviewPlugins.values());
  }

  // Check if webview plugin is registered
  isWebviewPluginRegistered(pluginId: string): boolean {
    return this.webviewPlugins.has(pluginId);
  }
}

