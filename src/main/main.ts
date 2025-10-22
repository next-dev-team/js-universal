import { app, BrowserWindow, ipcMain, dialog, shell } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import isDev from "electron-is-dev";
import { PrismaClient } from "@prisma/client";
import { IPC_CHANNELS } from "../../shared/types";
import { PluginManager } from "./plugin-manager";
import { DatabaseService } from "./database-service";
import { SecurityManager } from "./security-manager";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Automatic restart is now handled by nodemon in the development script
// which watches dist-main and dist-preload directories for changes
if (isDev) {
  console.log('Automatic restart enabled via nodemon for development');
}

export class ElectronApp {
  private mainWindow: BrowserWindow | null = null;
  private prisma: PrismaClient;
  private pluginManager: PluginManager;
  private databaseService: DatabaseService;
  private securityManager: SecurityManager;

  constructor() {
    this.prisma = new PrismaClient();
    this.databaseService = new DatabaseService(this.prisma);
    this.securityManager = new SecurityManager();
    this.pluginManager = new PluginManager(
      this.databaseService,
      this.securityManager
    );

    this.initializeApp();
  }

  private initializeApp() {
    // Handle app ready
    app.whenReady().then(() => {
      this.createMainWindow();
      this.setupIpcHandlers();

      app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          this.createMainWindow();
        }
      });
    });

    // Handle app window closed
    app.on("window-all-closed", () => {
      if (process.platform !== "darwin") {
        app.quit();
      }
    });

    // Handle app before quit
    app.on("before-quit", async () => {
      await this.cleanup();
    });
  }

  private createMainWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, "../dist-preload/preload.js"),
        webSecurity: true,
      },
      titleBarStyle: "hiddenInset",
      show: false,
    });

    // Load the app
    if (isDev) {
      this.mainWindow.loadURL("http://localhost:5173");
      this.mainWindow.webContents.openDevTools();
      console.log('Development mode: Main window created and loaded at:', new Date().toISOString());
  console.log('Watch functionality test - main process auto-rebuild working!');
  console.log('Testing nodemon automatic restart functionality - UPDATED!');
    } else {
      this.mainWindow.loadFile(
        path.join(__dirname, "../dist-renderer/index.html")
      );
    }

    // Show window when ready
    this.mainWindow.once("ready-to-show", () => {
      this.mainWindow?.show();
    });

    // Handle window closed
    this.mainWindow.on("closed", () => {
      this.mainWindow = null;
    });
  }

  private setupIpcHandlers() {
    // Window management
    ipcMain.handle(IPC_CHANNELS.WINDOW_MINIMIZE, () => {
      this.mainWindow?.minimize();
    });

    ipcMain.handle(IPC_CHANNELS.WINDOW_MAXIMIZE, () => {
      if (this.mainWindow?.isMaximized()) {
        this.mainWindow.restore();
      } else {
        this.mainWindow?.maximize();
      }
    });

    ipcMain.handle(IPC_CHANNELS.WINDOW_CLOSE, () => {
      this.mainWindow?.close();
    });

    // Database operations
    ipcMain.handle(IPC_CHANNELS.DB_GET_PLUGINS, async () => {
      return await this.databaseService.getPlugins();
    });

    ipcMain.handle(
      IPC_CHANNELS.DB_GET_USER_PLUGINS,
      async (_, userId: string) => {
        return await this.databaseService.getUserPlugins(userId);
      }
    );

    ipcMain.handle(IPC_CHANNELS.DB_GET_SETTINGS, async () => {
      return await this.databaseService.getAppSettings();
    });

    ipcMain.handle(
      IPC_CHANNELS.DB_UPDATE_SETTINGS,
      async (_, key: string, value: any) => {
        return await this.databaseService.updateSetting(key, value);
      }
    );

    ipcMain.handle(
      IPC_CHANNELS.DB_UPDATE_USER,
      async (_, userId: string, userData: any) => {
        try {
          return await this.databaseService.updateUser(userId, userData);
        } catch (error) {
          console.error("Failed to update user:", error);
          throw error;
        }
      }
    );

    // Plugin management
    ipcMain.handle(
      IPC_CHANNELS.PLUGIN_INSTALL,
      async (_, pluginPath: string) => {
        try {
          return await this.pluginManager.installPlugin(pluginPath);
        } catch (error) {
          console.error("Plugin installation failed:", error);
          throw error;
        }
      }
    );

    ipcMain.handle(
      IPC_CHANNELS.PLUGIN_UNINSTALL,
      async (_, pluginId: string) => {
        try {
          return await this.pluginManager.uninstallPlugin(pluginId);
        } catch (error) {
          console.error("Plugin uninstallation failed:", error);
          throw error;
        }
      }
    );

    ipcMain.handle(IPC_CHANNELS.PLUGIN_ENABLE, async (_, pluginId: string) => {
      return await this.pluginManager.enablePlugin(pluginId);
    });

    ipcMain.handle(IPC_CHANNELS.PLUGIN_DISABLE, async (_, pluginId: string) => {
      return await this.pluginManager.disablePlugin(pluginId);
    });

    ipcMain.handle(IPC_CHANNELS.PLUGIN_LAUNCH, async (_, pluginId: string) => {
      return await this.pluginManager.launchPlugin(pluginId);
    });

    ipcMain.handle(IPC_CHANNELS.PLUGIN_CLOSE, async (_, pluginId: string) => {
      return await this.pluginManager.closePlugin(pluginId);
    });

    // Security
    ipcMain.handle(
      IPC_CHANNELS.SECURITY_CHECK_PERMISSION,
      async (_, pluginId: string, permission: string) => {
        return await this.securityManager.checkPermission(pluginId, permission);
      }
    );

    ipcMain.handle(
      IPC_CHANNELS.SECURITY_REQUEST_PERMISSION,
      async (_, pluginId: string, permission: string) => {
        return await this.securityManager.requestPermission(
          pluginId,
          permission
        );
      }
    );

    // Plugin communication
    ipcMain.handle(
      IPC_CHANNELS.PLUGIN_MESSAGE,
      async (_, pluginId: string, message: any) => {
        return await this.pluginManager.sendMessageToPlugin(pluginId, message);
      }
    );

    // User plugin management
    ipcMain.handle(
      IPC_CHANNELS.USER_PLUGIN_ENABLE,
      async (_, userId: string, pluginId: string) => {
        try {
          return await this.databaseService.enableUserPlugin(userId, pluginId);
        } catch (error) {
          console.error("Failed to enable user plugin:", error);
          throw error;
        }
      }
    );

    ipcMain.handle(
      IPC_CHANNELS.USER_PLUGIN_DISABLE,
      async (_, userId: string, pluginId: string) => {
        try {
          return await this.databaseService.disableUserPlugin(userId, pluginId);
        } catch (error) {
          console.error("Failed to disable user plugin:", error);
          throw error;
        }
      }
    );

    // File dialog for plugin installation
    ipcMain.handle(IPC_CHANNELS.DIALOG_OPEN_DIRECTORY, async () => {
      const result = await dialog.showOpenDialog(this.mainWindow!, {
        properties: ["openDirectory"],
        title: "Select Plugin Directory",
        buttonLabel: "Install Plugin",
      });

      if (!result.canceled && result.filePaths.length > 0) {
        return result.filePaths[0];
      }
      return null;
    });

    // Open external links
    ipcMain.handle(IPC_CHANNELS.SHELL_OPEN_EXTERNAL, async (_, url: string) => {
      await shell.openExternal(url);
    });
  }

  async initialize(): Promise<void> {
    // Initialize plugin manager
    await this.pluginManager.initialize();

    console.log("Electron app initialized successfully");
  }

  getDatabaseService(): DatabaseService {
    return this.databaseService;
  }

  private async cleanup() {
    try {
      await this.pluginManager.cleanup();
      await this.prisma.$disconnect();
    } catch (error) {
      console.error("Cleanup error:", error);
    }
  }
}

// Initialize the app
new ElectronApp();
