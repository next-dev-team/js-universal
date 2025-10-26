import { app, BrowserWindow, ipcMain, dialog, shell } from "electron";
import path from "path";
import fs from "fs";
import isDev from "electron-is-dev";
import { PrismaClient } from "@prisma/client";
import { IPC_CHANNELS } from "../preload/types";
import { PluginManager } from "./plugin-manager";
import { DatabaseService } from "./database-service";
import { SecurityManager } from "./security-manager";
import { PluginDevLoader } from "./plugin-dev-loader";
import { PluginWebviewManager } from "./plugin-webview-manager";
import { WorkspaceScanner } from "./workspace-scanner";

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
  private workspaceScanner: WorkspaceScanner;

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

    // Initialize workspace scanner
    const appsDirectory = path.resolve(__dirname, "../../../..", "apps");
    console.log("[ElectronApp] Apps directory path:", appsDirectory);
    console.log(
      "[ElectronApp] Apps directory exists:",
      fs.existsSync(appsDirectory)
    );

    // If the default apps directory doesn't exist, try alternative paths
    let finalAppsDirectory = appsDirectory;
    if (!fs.existsSync(appsDirectory)) {
      const alternativePaths = [
        path.resolve(process.cwd(), "apps"),
        path.resolve(__dirname, "../../../../apps"),
        path.resolve(__dirname, "../../../../../apps"),
      ];

      for (const altPath of alternativePaths) {
        console.log(
          `[ElectronApp] Trying alternative apps directory: ${altPath}`
        );
        if (fs.existsSync(altPath)) {
          finalAppsDirectory = altPath;
          console.log(
            `[ElectronApp] Found apps directory at: ${finalAppsDirectory}`
          );
          break;
        }
      }
    }

    this.workspaceScanner = new WorkspaceScanner(
      finalAppsDirectory,
      this.pluginDevLoader,
      this.pluginWebviewManager
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

      // Setup full IPC handlers immediately to avoid "No handler registered" errors
      console.log("[ElectronApp] Setting up full IPC handlers...");
      this.setupIpcHandlers();
      console.log("[ElectronApp] Full IPC handlers setup completed");

      // Initialize the app (database, plugin manager, etc.) in background
      console.log("[ElectronApp] Starting app initialization in background...");
      try {
        await this.initialize();
        console.log("[ElectronApp] App initialization completed successfully");

        // Setup development plugins if in development mode
        if (isDev) {
          console.log("[ElectronApp] Setting up development plugins...");
          await this.setupDevelopmentPlugins();
          console.log("[ElectronApp] Development plugins setup completed");
        }
      } catch (error) {
        console.error("[ElectronApp] App initialization failed:", error);
        console.error("[ElectronApp] Error stack:", error.stack);
      }
    });

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createMainWindow();
      }
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
        webviewTag: true,
      },
      // titleBarStyle: "hiddenInset",
      // show: false,
    });

    // Capture renderer console logs with more details
    this.mainWindow.webContents.on(
      "console-message",
      (event, level, message, line, sourceId) => {
        console.log(
          `[Renderer Console] Level: ${level}, Message: ${message}, Line: ${line}, Source: ${sourceId}`
        );
      }
    );

    // Also capture other renderer events
    this.mainWindow.webContents.on("did-finish-load", () => {
      console.log("[Main] Renderer finished loading");
    });

    this.mainWindow.webContents.on("dom-ready", () => {
      console.log("[Main] Renderer DOM ready");
    });

    this.mainWindow.webContents.on(
      "did-fail-load",
      (event, errorCode, errorDescription) => {
        console.log(
          `[Main] Renderer failed to load: ${errorCode} - ${errorDescription}`
        );
      }
    );

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
    console.log("[ElectronApp] IPC_CHANNELS object:", IPC_CHANNELS);
    console.log(
      "[ElectronApp] WORKSPACE_RESCAN channel:",
      IPC_CHANNELS.WORKSPACE_RESCAN
    );
    console.log(
      "[ElectronApp] WORKSPACE_GET_PROJECTS channel:",
      IPC_CHANNELS.WORKSPACE_GET_PROJECTS
    );

    // Window management
    ipcMain.handle(IPC_CHANNELS.WINDOW_MINIMIZE, () => {
      this.mainWindow?.minimize();
    });

    ipcMain.handle(IPC_CHANNELS.WINDOW_MAXIMIZE, () => {
      if (this.mainWindow?.isMaximized()) {
        this.mainWindow.unmaximize();
      } else {
        this.mainWindow?.maximize();
      }
    });

    ipcMain.handle(IPC_CHANNELS.WINDOW_CLOSE, () => {
      this.mainWindow?.close();
    });

    // File dialog for plugin installation - needs to be available immediately
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

    // Open external links - needs to be available immediately
    ipcMain.handle(IPC_CHANNELS.SHELL_OPEN_EXTERNAL, async (_, url: string) => {
      await shell.openExternal(url);
    });

    // Workspace operations - setup with null checks since services may not be initialized yet
    if (IPC_CHANNELS.WORKSPACE_RESCAN && IPC_CHANNELS.WORKSPACE_GET_PROJECTS) {
      console.log("[ElectronApp] Setting up workspace IPC handlers...");

      ipcMain.handle(IPC_CHANNELS.WORKSPACE_RESCAN, async () => {
        try {
          console.log("[WORKSPACE] Rescanning workspace...");
          if (!this.workspaceScanner) {
            console.warn("[WORKSPACE] Workspace scanner not initialized yet");
            return { success: false, error: "Workspace scanner not ready" };
          }
          await this.workspaceScanner.scanAndRegisterProjects();
          const projects = this.workspaceScanner.getRegisteredProjects();
          console.log(
            `[WORKSPACE] Rescan completed. Found ${projects.length} projects:`,
            projects.map((p) => p.id)
          );
          return { success: true, projectCount: projects.length };
        } catch (error) {
          console.error("[WORKSPACE] Error during rescan:", error);
          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      });

      ipcMain.handle(IPC_CHANNELS.WORKSPACE_GET_PROJECTS, () => {
        try {
          console.log("[WORKSPACE] IPC handler called for getting projects");
          if (!this.workspaceScanner) {
            console.warn("[WORKSPACE] Workspace scanner not initialized yet");
            return [];
          }
          const projects = this.workspaceScanner.getRegisteredProjects();
          console.log(
            `[WORKSPACE] Getting projects. Found ${projects.length} projects:`,
            projects.map((p) => p.id)
          );

          const result = projects.map((project) => ({
            id: project.id,
            name: project.name,
            version: project.version,
            description:
              project.packageJson?.description || project.description,
            author: project.packageJson?.author || project.author,
            hasDevServer: project.hasDevServer,
            devServerPort: project.devServerPort,
            isDevelopment: true,
          }));

          console.log("[WORKSPACE] Returning result:", result);
          return result;
        } catch (error) {
          console.error("[WORKSPACE] Error getting projects:", error);
          return [];
        }
      });
    } else {
      console.error(
        "[ElectronApp] Workspace IPC channels are undefined! Cannot set up handlers."
      );
    }

    // Database operations with mock responses until database is ready
    ipcMain.handle(IPC_CHANNELS.DB_GET_PLUGINS, async () => {
      console.log("[ElectronApp] DB_GET_PLUGINS called (basic handler)");
      try {
        // Return empty array until database is ready
        return [];
      } catch (error) {
        console.error("[ElectronApp] DB_GET_PLUGINS error:", error);
        return [];
      }
    });

    ipcMain.handle(IPC_CHANNELS.DB_GET_USER_PLUGINS, async () => {
      console.log("[ElectronApp] DB_GET_USER_PLUGINS called (basic handler)");
      try {
        return [];
      } catch (error) {
        console.error("[ElectronApp] DB_GET_USER_PLUGINS error:", error);
        return [];
      }
    });

    ipcMain.handle(IPC_CHANNELS.DB_GET_SETTINGS, async () => {
      console.log("[ElectronApp] DB_GET_SETTINGS called (basic handler)");
      try {
        return {};
      } catch (error) {
        console.error("[ElectronApp] DB_GET_SETTINGS error:", error);
        return {};
      }
    });

    ipcMain.handle(
      IPC_CHANNELS.DB_UPDATE_SETTINGS,
      async (_, key: string, value: any) => {
        console.log("[ElectronApp] DB_UPDATE_SETTINGS called (basic handler)");
        try {
          return { success: false, error: "Database not ready" };
        } catch (error) {
          console.error("[ElectronApp] DB_UPDATE_SETTINGS error:", error);
          return { success: false, error: error.message };
        }
      }
    );

    // Plugin management
    ipcMain.handle(
      IPC_CHANNELS.PLUGIN_INSTALL,
      async (_, sourcePath: string) => {
        console.log("[ElectronApp] PLUGIN_INSTALL called (basic handler)");
        try {
          return { success: false, error: "Plugin manager not ready" };
        } catch (error) {
          console.error("[ElectronApp] Plugin install error:", error);
          return { success: false, error: error.message };
        }
      }
    );

    ipcMain.handle(
      IPC_CHANNELS.PLUGIN_UNINSTALL,
      async (_, pluginId: string) => {
        console.log("[ElectronApp] PLUGIN_UNINSTALL called (basic handler)");
        try {
          return { success: false, error: "Plugin manager not ready" };
        } catch (error) {
          console.error("[ElectronApp] Plugin uninstall error:", error);
          return { success: false, error: error.message };
        }
      }
    );

    ipcMain.handle(IPC_CHANNELS.PLUGIN_LAUNCH, async (_, pluginId: string) => {
      console.log("[ElectronApp] PLUGIN_LAUNCH called (basic handler)");
      try {
        return { success: false, error: "Plugin manager not ready" };
      } catch (error) {
        console.error("[ElectronApp] Plugin launch error:", error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle(IPC_CHANNELS.PLUGIN_CLOSE, async (_, pluginId: string) => {
      console.log("[ElectronApp] PLUGIN_CLOSE called (basic handler)");
      try {
        return { success: false, error: "Plugin manager not ready" };
      } catch (error) {
        console.error("[ElectronApp] Plugin close error:", error);
        return { success: false, error: error.message };
      }
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

    // Database operations - enhanced versions that replace basic handlers
    ipcMain.removeHandler(IPC_CHANNELS.DB_GET_PLUGINS);
    ipcMain.handle(IPC_CHANNELS.DB_GET_PLUGINS, async () => {
      return await this.databaseService.getPlugins();
    });

    ipcMain.removeHandler(IPC_CHANNELS.DB_GET_USER_PLUGINS);
    ipcMain.handle(
      IPC_CHANNELS.DB_GET_USER_PLUGINS,
      async (_, userId: string) => {
        return await this.databaseService.getUserPlugins(userId);
      }
    );

    ipcMain.removeHandler(IPC_CHANNELS.DB_GET_SETTINGS);
    ipcMain.handle(IPC_CHANNELS.DB_GET_SETTINGS, async () => {
      return await this.databaseService.getAppSettings();
    });

    ipcMain.removeHandler(IPC_CHANNELS.DB_UPDATE_SETTINGS);
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

    // Plugin management - enhanced versions that replace basic handlers
    ipcMain.removeHandler(IPC_CHANNELS.PLUGIN_INSTALL);
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

    ipcMain.removeHandler(IPC_CHANNELS.PLUGIN_UNINSTALL);
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

    ipcMain.removeHandler(IPC_CHANNELS.PLUGIN_LAUNCH);
    ipcMain.handle(IPC_CHANNELS.PLUGIN_LAUNCH, async (_, pluginId: string) => {
      return await this.pluginManager.launchPlugin(pluginId);
    });

    ipcMain.removeHandler(IPC_CHANNELS.PLUGIN_CLOSE);
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
    ipcMain.removeHandler(IPC_CHANNELS.USER_PLUGIN_ENABLE);
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

    ipcMain.removeHandler(IPC_CHANNELS.USER_PLUGIN_DISABLE);
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

    // Note: Workspace operations are now handled in setupBasicIpcHandlers() to be available immediately
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

      // Use workspace scanner to automatically detect and register all projects
      console.log("[ElectronApp] Starting automatic workspace detection...");
      await this.workspaceScanner.scanAndRegisterProjects();

      const registeredProjects = this.workspaceScanner.getRegisteredProjects();
      console.log(
        `[ElectronApp] Workspace scanner registered ${registeredProjects.length} projects:`,
        registeredProjects.map((p) => p.id)
      );
    } catch (error) {
      console.error(
        "[ElectronApp] Failed to setup development plugins:",
        error
      );
    }
  }

  private async cleanup() {
    try {
      console.log("[ElectronApp] Starting cleanup...");

      await this.pluginManager.cleanup();

      // Cleanup development plugin loader
      if (this.pluginDevLoader) {
        this.pluginDevLoader.cleanup();
      }

      // Cleanup webview plugin manager
      if (this.pluginWebviewManager) {
        this.pluginWebviewManager.cleanup();
      }

      // Cleanup workspace scanner
      if (this.workspaceScanner) {
        this.workspaceScanner.cleanup();
      }

      // Close database connection
      if (this.prisma) {
        await this.prisma.$disconnect();
        console.log("[ElectronApp] Database disconnected");
      }
    } catch (error) {
      console.error("[ElectronApp] Error during cleanup:", error);
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
