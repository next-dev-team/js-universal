import { app, ipcMain, BrowserWindow } from "electron";
import * as path from "path";
import * as fs from "fs/promises";
import { DatabaseService } from "./database-service";
import { SecurityManager } from "./security-manager";
import { PluginInstaller } from "./plugin-installer";
import { PluginSandbox } from "./plugin-sandbox";
import { PluginAPIBridge } from "./plugin-api-bridge";
import { Plugin, PluginManifest } from "../../shared/types";

export class PluginManager {
  private databaseService: DatabaseService;
  private securityManager: SecurityManager;
  private pluginInstaller: PluginInstaller;
  private pluginSandbox: PluginSandbox;
  private pluginAPIBridge: PluginAPIBridge;
  private pluginsDir: string;
  private pluginWindows: Map<string, BrowserWindow> = new Map();
  private runningPlugins: Map<string, any> = new Map();

  constructor(
    databaseService: DatabaseService,
    securityManager: SecurityManager,
    pluginAPIBridge?: PluginAPIBridge
  ) {
    this.databaseService = databaseService;
    this.securityManager = securityManager;
    this.pluginsDir = path.join(app.getPath("userData"), "plugins");
    this.pluginInstaller = new PluginInstaller(databaseService);
    this.pluginSandbox = new PluginSandbox(databaseService);
    this.pluginAPIBridge = pluginAPIBridge || new PluginAPIBridge(databaseService);
    // Don't setup IPC handlers here - they will be set up by the main ElectronApp
  }

  async initialize(): Promise<void> {
    // Ensure plugins directory exists
    await fs.mkdir(this.pluginsDir, { recursive: true });

    // Initialize plugin installer
    await this.pluginInstaller.initialize();
  }

  async installPlugin(sourcePath: string): Promise<Plugin> {
    // Check if sourcePath is just a plugin ID (for marketplace plugins)
    // If so, resolve it to the actual plugin path in the plugins directory
    let actualSourcePath = sourcePath;

    // If sourcePath doesn't contain path separators, it's likely a plugin ID
    if (!sourcePath.includes("/") && !sourcePath.includes("\\")) {
      const pluginsDir = path.join(process.cwd(), "plugins");
      const potentialPath = path.join(pluginsDir, sourcePath);

      try {
        // Check if the plugin directory exists
        await fs.access(potentialPath);
        actualSourcePath = potentialPath;
        console.log(
          `Resolved plugin ID "${sourcePath}" to path: ${actualSourcePath}`
        );
      } catch (error) {
        console.error(
          `Plugin directory not found for ID "${sourcePath}": ${potentialPath}`
        );
        throw new Error(
          `Plugin "${sourcePath}" not found in plugins directory`
        );
      }
    }

    return this.pluginInstaller.installPlugin(actualSourcePath);
  }

  async uninstallPlugin(
    pluginId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Stop plugin if running
      await this.closePlugin(pluginId);

      // Uninstall using plugin installer
      await this.pluginInstaller.uninstallPlugin(pluginId);

      return {
        success: true,
        message: "Plugin uninstalled successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to uninstall plugin: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  async enablePlugin(
    pluginId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Update plugin status in database
      await this.databaseService.updatePlugin(pluginId, { isActive: true });

      return {
        success: true,
        message: "Plugin enabled successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to enable plugin: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  async disablePlugin(
    pluginId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Close plugin if running
      await this.closePlugin(pluginId);

      // Mark as disabled
      await this.databaseService.updatePlugin(pluginId, { isActive: false });

      return {
        success: true,
        message: "Plugin disabled successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to disable plugin: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  async launchPlugin(pluginId: string): Promise<void> {
    // Check if plugin is already running
    if (this.pluginWindows.has(pluginId)) {
      const window = this.pluginWindows.get(pluginId);
      if (window && !window.isDestroyed()) {
        window.focus();
        return;
      } else {
        this.pluginWindows.delete(pluginId);
      }
    }

    // Get plugin from database
    const plugin = await this.databaseService.getPluginById(pluginId);
    if (!plugin) {
      throw new Error("Plugin not found");
    }

    // Get plugin path
    const pluginPath = path.join(this.pluginsDir, pluginId);

    // Read manifest
    const manifestPath = path.join(pluginPath, "package.json");
    const manifest: PluginManifest = JSON.parse(
      await fs.readFile(manifestPath, "utf-8")
    );

    // Create sandbox and load plugin
    const pluginWindow = await this.pluginSandbox.createSandbox(
      pluginId,
      manifest
    );
    
    // Register plugin window with API bridge
    this.pluginAPIBridge.registerPluginWindow(pluginId, pluginWindow);
    
    await this.pluginSandbox.loadPlugin(pluginId, pluginPath);

    this.pluginWindows.set(pluginId, pluginWindow);

    // Handle window closed
    pluginWindow.on("closed", () => {
      this.pluginWindows.delete(pluginId);
      this.pluginAPIBridge.unregisterPluginWindow(pluginId);
    });
  }

  async closePlugin(
    pluginId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Close plugin using sandbox
      this.pluginSandbox.closePlugin(pluginId);

      // Unregister from API bridge
      this.pluginAPIBridge.unregisterPluginWindow(pluginId);

      // Remove from running plugins
      this.pluginWindows.delete(pluginId);
      this.runningPlugins.delete(pluginId);

      return {
        success: true,
        message: "Plugin closed successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to close plugin: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  async stopPlugin(pluginId: string): Promise<void> {
    // Close plugin using sandbox
    this.pluginSandbox.closePlugin(pluginId);

    // Remove from running plugins
    this.pluginWindows.delete(pluginId);
    this.runningPlugins.delete(pluginId);
  }

  async sendMessageToPlugin(pluginId: string, message: any): Promise<void> {
    const window = this.pluginWindows.get(pluginId);
    if (!window || window.isDestroyed()) {
      throw new Error("Plugin window not found or destroyed");
    }

    // Send message to plugin window
    window.webContents.send("plugin-message", message);
  }

  getRunningPlugins(): string[] {
    return this.pluginSandbox.getRunningPlugins();
  }

  async getPluginPath(pluginId: string): Promise<string> {
    return path.join(this.pluginsDir, pluginId);
  }

  async cleanup(): Promise<void> {
    // Close all running plugins
    for (const pluginId of this.getRunningPlugins()) {
      await this.closePlugin(pluginId);
    }

    // Close all plugin windows
    for (const window of this.pluginWindows.values()) {
      if (!window.isDestroyed()) {
        window.close();
      }
    }

    this.runningPlugins.clear();
    this.pluginWindows.clear();
  }

  private async copyDirectory(src: string, dest: string): Promise<void> {
    await fs.mkdir(dest, { recursive: true });

    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  // IPC handlers are now set up by the main ElectronApp class to avoid duplicate registrations
}
