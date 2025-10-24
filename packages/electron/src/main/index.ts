import { app, BrowserWindow, ipcMain, dialog, shell } from "electron";
import path from "path";
import isDev from "electron-is-dev";
import { PrismaClient } from "@prisma/client";
import { IPC_CHANNELS } from "@js-universal/shared-types";
import { PluginManager } from "./plugin-manager";
import { DatabaseService } from "./database-service";
import { SecurityManager } from "./security-manager";
import { PluginDevLoader } from "./plugin-dev-loader";
import { PluginWebviewManager } from "./plugin-webview-manager";

// Configure Prisma for packaged app
if (!isDev) {
  // Set the path to the Prisma client in the packaged app
  const prismaPath = path.join(
    process.resourcesPath,
    "node_modules",
    ".prisma",
    "client"
  );
  process.env.PRISMA_QUERY_ENGINE_LIBRARY = path.join(
    prismaPath,
    "query_engine-windows.dll.node"
  );
  process.env.PRISMA_QUERY_ENGINE_BINARY = path.join(
    prismaPath,
    "query_engine-windows.dll.node"
  );
}

// Automatic restart is now handled by nodemon in the development script
// which watches dist-main and dist-preload directories for changes
if (isDev) {
  console.log("Automatic restart enabled via nodemon for development");
}

export class ElectronApp {
  private mainWindow: BrowserWindow | null = null;
  private prisma: any;
  private pluginManager: PluginManager;
  private databaseService: DatabaseService;
  private securityManager: SecurityManager;
  private pluginDevLoader: PluginDevLoader;
  private pluginWebviewManager: PluginWebviewManager;

  constructor() {
    console.log(
      "[ElectronApp] Constructor called - starting initialization..."
    );
    console.log("[ElectronApp] Creating Prisma client...");
    this.prisma = new PrismaClient();
    console.log("[ElectronApp] Prisma client created:", !!this.prisma);
    this.databaseService = new DatabaseService(this.prisma);
    console.log(
      "[ElectronApp] Database service created:",
      !!this.databaseService
    );
    this.securityManager = new SecurityManager();
    this.pluginManager = new PluginManager(
      this.databaseService,
      this.securityManager
    );

    // Initialize development plugin loader
    this.pluginDevLoader = new PluginDevLoader(
      (this.pluginManager as any).pluginAPIBridge,
      isDev
    );

    // Initialize webview plugin manager
    this.pluginWebviewManager = new PluginWebviewManager(
      (this.pluginManager as any).pluginAPIBridge,
      isDev
    );

    this.initializeApp();
  }

  private initializeApp() {
    console.log("[ElectronApp] Setting up app ready handler...");

    // Handle app ready
    app.whenReady().then(async () => {
      console.log("[ElectronApp] App is ready, starting initialization...");
      this.createMainWindow();
      console.log("[ElectronApp] Main window created");

      // Setup IPC handlers FIRST (without database dependency for now)
      console.log("[ElectronApp] Setting up basic IPC handlers...");
      this.setupBasicIpcHandlers();
      console.log("[ElectronApp] Basic IPC handlers setup completed");

      // Initialize the app (database, plugin manager, etc.) in background
      console.log("[ElectronApp] Starting app initialization in background...");
      this.initialize()
        .then(() => {
          console.log(
            "[ElectronApp] App initialization completed successfully"
          );
          // Setup full IPC handlers after initialization
          this.setupIpcHandlers();
          console.log("[ElectronApp] Full IPC handlers setup completed");
        })
        .catch((error) => {
          console.error("[ElectronApp] App initialization failed:", error);
        });

      // Setup development plugins if in development mode
      if (isDev) {
        console.log("[ElectronApp] Setting up development plugins...");
        this.setupDevelopmentPlugins()
          .then(() => {
            console.log("[ElectronApp] Development plugins setup completed");
          })
          .catch((error) => {
            console.error(
              "[ElectronApp] Development plugins setup failed:",
              error
            );
          });
      }

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
      // width: 1200,
      // height: 800,
      // minWidth: 800,
      // minHeight: 600,
      width: 1440,
      height: 1080,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: isDev
          ? path.join(process.cwd(), "out/preload/index.cjs")
          : path.join(__dirname, "../preload/index.cjs"),
        webSecurity: true,
      },
      // titleBarStyle: "hiddenInset",
      // show: false,
    });

    // Load the app
    if (isDev && process.env["ELECTRON_RENDERER_URL"]) {
      this.mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
      this.mainWindow.webContents.openDevTools();
      console.log(
        "Development mode: Main window created and loaded at:",
        new Date().toISOString()
      );
      console.log(
        "Watch functionality test - main process auto-rebuild working!"
      );
      console.log("Testing nodemon automatic restart functionality - UPDATED!");
    } else {
      this.mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
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

  private setupBasicIpcHandlers() {
    console.log("[ElectronApp] Setting up basic IPC handlers...");

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

    // Database operations with mock responses until database is ready
    ipcMain.handle(IPC_CHANNELS.DB_GET_PLUGINS, async () => {
      console.log("[ElectronApp] DB_GET_PLUGINS called (basic handler)");
      if (this.databaseService) {
        try {
          return await this.databaseService.getPlugins();
        } catch (error) {
          console.error("[ElectronApp] Database error in getPlugins:", error);
          return []; // Return empty array as fallback
        }
      }
      return []; // Return empty array if database not ready
    });

    ipcMain.handle(
      IPC_CHANNELS.DB_GET_USER_PLUGINS,
      async (_, userId: string) => {
        console.log("[ElectronApp] DB_GET_USER_PLUGINS called (basic handler)");
        if (this.databaseService) {
          try {
            return await this.databaseService.getUserPlugins(userId);
          } catch (error) {
            console.error(
              "[ElectronApp] Database error in getUserPlugins:",
              error
            );
            return []; // Return empty array as fallback
          }
        }
        return []; // Return empty array if database not ready
      }
    );

    ipcMain.handle(IPC_CHANNELS.DB_GET_SETTINGS, async () => {
      console.log("[ElectronApp] DB_GET_SETTINGS called (basic handler)");
      if (this.databaseService) {
        try {
          return await this.databaseService.getAppSettings();
        } catch (error) {
          console.error(
            "[ElectronApp] Database error in getAppSettings:",
            error
          );
          return {}; // Return empty object as fallback
        }
      }
      return {}; // Return empty object if database not ready
    });

    ipcMain.handle(
      IPC_CHANNELS.DB_UPDATE_SETTINGS,
      async (_, key: string, value: any) => {
        console.log("[ElectronApp] DB_UPDATE_SETTINGS called (basic handler)");
        if (this.databaseService) {
          try {
            return await this.databaseService.updateSetting(key, value);
          } catch (error) {
            console.error(
              "[ElectronApp] Database error in updateSetting:",
              error
            );
            return { success: false, error: error.message };
          }
        }
        return { success: false, error: "Database not ready" };
      }
    );

    // Plugin management
    ipcMain.handle(
      IPC_CHANNELS.PLUGIN_INSTALL,
      async (_, sourcePath: string) => {
        console.log("[ElectronApp] PLUGIN_INSTALL called (basic handler)");
        if (this.pluginManager) {
          try {
            return await this.pluginManager.installPlugin(sourcePath);
          } catch (error) {
            console.error("[ElectronApp] Plugin install error:", error);
            return { success: false, error: error.message };
          }
        }
        return { success: false, error: "Plugin manager not ready" };
      }
    );

    ipcMain.handle(
      IPC_CHANNELS.PLUGIN_UNINSTALL,
      async (_, pluginId: string) => {
        console.log("[ElectronApp] PLUGIN_UNINSTALL called (basic handler)");
        if (this.pluginManager) {
          try {
            return await this.pluginManager.uninstallPlugin(pluginId);
          } catch (error) {
            console.error("[ElectronApp] Plugin uninstall error:", error);
            return { success: false, error: error.message };
          }
        }
        return { success: false, error: "Plugin manager not ready" };
      }
    );

    ipcMain.handle(IPC_CHANNELS.PLUGIN_LAUNCH, async (_, pluginId: string) => {
      console.log("[ElectronApp] PLUGIN_LAUNCH called (basic handler)");
      if (this.pluginManager) {
        try {
          return await this.pluginManager.launchPlugin(pluginId);
        } catch (error) {
          console.error("[ElectronApp] Plugin launch error:", error);
          return { success: false, error: error.message };
        }
      }
      return { success: false, error: "Plugin manager not ready" };
    });

    ipcMain.handle(IPC_CHANNELS.PLUGIN_CLOSE, async (_, pluginId: string) => {
      console.log("[ElectronApp] PLUGIN_CLOSE called (basic handler)");
      if (this.pluginManager) {
        try {
          return await this.pluginManager.closePlugin(pluginId);
        } catch (error) {
          console.error("[ElectronApp] Plugin close error:", error);
          return { success: false, error: error.message };
        }
      }
      return { success: false, error: "Plugin manager not ready" };
    });

    // Shell operations
    ipcMain.handle(IPC_CHANNELS.SHELL_OPEN_EXTERNAL, async (_, url: string) => {
      await shell.openExternal(url);
    });
  }

  private setupIpcHandlers() {
    console.log("[ElectronApp] Setting up IPC handlers...");
    console.log(
      "[ElectronApp] Database service available for IPC:",
      !!this.databaseService
    );

    // Test database service before setting up handlers
    if (this.databaseService) {
      console.log("[ElectronApp] Testing database service...");
      try {
        // Test if the database service methods exist
        console.log(
          "[ElectronApp] getPlugins method exists:",
          typeof this.databaseService.getPlugins
        );
        console.log(
          "[ElectronApp] getAppSettings method exists:",
          typeof this.databaseService.getAppSettings
        );
      } catch (error) {
        console.error("[ElectronApp] Database service test failed:", error);
      }
    }

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
    console.log("[ElectronApp] Starting initialization...");
    console.log(
      "[ElectronApp] Database service available:",
      !!this.databaseService
    );
    console.log(
      "[ElectronApp] Plugin manager available:",
      !!this.pluginManager
    );

    // Initialize database service first
    try {
      await this.databaseService.initialize();
      console.log("[ElectronApp] Database service initialized successfully");
    } catch (error) {
      console.error(
        "[ElectronApp] Database service initialization failed:",
        error
      );
      throw error;
    }

    // Initialize plugin manager
    try {
      await this.pluginManager.initialize();
      console.log("[ElectronApp] Plugin manager initialized successfully");
    } catch (error) {
      console.error(
        "[ElectronApp] Plugin manager initialization failed:",
        error
      );
      throw error;
    }

    console.log("[ElectronApp] Electron app initialized successfully");
  }

  getDatabaseService(): DatabaseService {
    return this.databaseService;
  }

  private async setupDevelopmentPlugins() {
    try {
      console.log("[ElectronApp] Setting up development plugins...");
      console.log(
        "[ElectronApp] Database service available:",
        !!this.databaseService
      );

      // Register counter-app-dev plugin for webview
      const counterAppDevWebviewConfig = {
        id: "counter-app-dev",
        name: "Counter App Dev",
        version: "1.0.0",
        url: "http://localhost:3003",
        isDevelopment: true,
        manifest: {
          id: "counter-app-dev",
          name: "Counter App Dev",
          version: "1.0.0",
          description:
            "Counter App Development Mode - Testing plugin with hot reload and real-time changes",
          author: "Super App Team",
          main: "index.html",
          permissions: ["storage", "notifications", "communication"],
        },
      };

      const webviewResult =
        await this.pluginWebviewManager.registerWebviewPlugin(
          counterAppDevWebviewConfig
        );
      console.log(
        "[ElectronApp] Webview plugin registration result:",
        webviewResult
      );

      // Also register for traditional dev loader (for fallback)
      const counterAppDevConfig = {
        id: "counter-app-dev",
        name: "Counter App Dev",
        version: "1.0.0",
        devPath: path.resolve(__dirname, "../../../apps/counter-app-dev"),
        manifest: {
          id: "counter-app-dev",
          name: "Counter App Dev",
          version: "1.0.0",
          description:
            "Counter App Development Mode - Testing plugin with hot reload and real-time changes",
          author: "Super App Team",
          main: "index.html",
          permissions: ["storage", "notifications", "communication"],
        },
      };

      const devResult = await this.pluginDevLoader.registerDevPlugin(
        counterAppDevConfig
      );
      console.log(
        "[ElectronApp] Development plugin registration result:",
        devResult
      );

      // Auto-launch the webview plugin
      if (webviewResult.success) {
        const launchResult =
          await this.pluginWebviewManager.launchWebviewPlugin(
            "counter-app-dev"
          );
        console.log(
          "[ElectronApp] Webview plugin launch result:",
          launchResult
        );
      }
    } catch (error) {
      console.error(
        "[ElectronApp] Failed to setup development plugins:",
        error
      );
    }
  }

  private async cleanup() {
    try {
      await this.pluginManager.cleanup();

      // Cleanup development plugin loader
      if (this.pluginDevLoader) {
        this.pluginDevLoader.cleanup();
      }

      // Cleanup webview plugin manager
      if (this.pluginWebviewManager) {
        this.pluginWebviewManager.cleanup();
      }

      await this.prisma.$disconnect();
    } catch (error) {
      console.error("Cleanup error:", error);
    }
  }
}

// Initialize the app
console.log("[MAIN] Starting Electron app initialization...");
try {
  new ElectronApp();
  console.log("[MAIN] ElectronApp instance created successfully");
} catch (error) {
  console.error("[MAIN] Failed to create ElectronApp instance:", error);
}
