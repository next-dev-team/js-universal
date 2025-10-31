import fs from "fs";
import path from "path";
import { detect } from "detect-port";

import { PluginDevLoader } from "./plugin-dev-loader";
import { PluginWebviewManager } from "./plugin-webview-manager";

interface DevelopmentConfig {
  hotReload: boolean;
  devTools: boolean;
  fileWatcher: boolean;
}

interface PackageJson {
  name: string;
  version: string;
  description?: string;
  author?: string;
  main?: string;
  scripts?: Record<string, string>;
  development?: DevelopmentConfig;
  window?: {
    width: number;
    height: number;
    resizable: boolean;
  };
}

interface ProjectConfig {
  id: string;
  name: string;
  version: string;
  devPath: string;
  packageJson: PackageJson;
  hasDevServer: boolean;
  devServerPort?: number;
}

export class WorkspaceScanner {
  private appsDirectory: string;
  private pluginDevLoader: PluginDevLoader;
  private pluginWebviewManager: PluginWebviewManager;
  private registeredProjects: Map<string, ProjectConfig> = new Map();
  private fileWatchers: Map<string, fs.FSWatcher> = new Map();

  constructor(
    appsDirectory: string,
    pluginDevLoader: PluginDevLoader,
    pluginWebviewManager: PluginWebviewManager
  ) {
    this.appsDirectory = appsDirectory;
    this.pluginDevLoader = pluginDevLoader;
    this.pluginWebviewManager = pluginWebviewManager;
  }

  /**
   * Scan the apps directory and automatically register all valid projects
   */
  async scanAndRegisterProjects(): Promise<void> {
    console.log("[WorkspaceScanner] Starting workspace scan...");
    console.log("[WorkspaceScanner] Apps directory:", this.appsDirectory);

    if (!fs.existsSync(this.appsDirectory)) {
      console.error(
        "[WorkspaceScanner] Apps directory does not exist:",
        this.appsDirectory
      );
      return;
    }

    try {
      const entries = fs.readdirSync(this.appsDirectory, {
        withFileTypes: true,
      });
      const projectDirs = entries.filter((entry) => entry.isDirectory());

      console.log(
        "[WorkspaceScanner] Found directories:",
        projectDirs.map((d) => d.name)
      );

      for (const dir of projectDirs) {
        const projectPath = path.join(this.appsDirectory, dir.name);
        await this.scanAndRegisterProject(projectPath, dir.name);
      }

      // Setup directory watcher for new projects
      this.setupDirectoryWatcher();

      console.log(
        "[WorkspaceScanner] Workspace scan completed. Registered projects:",
        Array.from(this.registeredProjects.keys())
      );
    } catch (error) {
      console.error("[WorkspaceScanner] Error scanning workspace:", error);
    }
  }

  /**
   * Scan and register a single project
   */
  private async scanAndRegisterProject(
    projectPath: string,
    projectName: string
  ): Promise<void> {
    const packageJsonPath = path.join(projectPath, "package.json");

    if (!fs.existsSync(packageJsonPath)) {
      console.log(
        `[WorkspaceScanner] Skipping ${projectName} - no package.json found`
      );
      return;
    }

    try {
      const packageJsonContent = fs.readFileSync(packageJsonPath, "utf-8");
      const packageJson: PackageJson = JSON.parse(packageJsonContent);

      // Determine if project has a dev server
      const hasDevServer = !!(
        packageJson.scripts?.dev || packageJson.scripts?.start
      );

      if (!hasDevServer) {
        console.log(
          `[WorkspaceScanner] Skipping ${projectName} - no dev server script found`
        );
        return;
      }

      const configuredPort = this.extractPortFromDevScript(
        packageJson.scripts?.dev || packageJson.scripts?.start
      );

      if (!configuredPort) {
        console.log(
          `[WorkspaceScanner] Skipping ${projectName} - could not determine dev server port`
        );
        return;
      }

      // Check if the project is actually running and find the real port
      const actualPort = await this.findRunningPort(
        configuredPort,
        projectName
      );

      if (!actualPort) {
        console.log(
          `[WorkspaceScanner] Skipping ${projectName} - dev server not running on port ${configuredPort} or nearby ports`
        );
        return;
      }

      const devServerPort = actualPort;

      // Use development config if available, otherwise use defaults
      const devConfig = packageJson.development || {
        hotReload: true,
        devTools: true,
        fileWatcher: true,
      };

      const projectConfig: ProjectConfig = {
        id: projectName,
        name: packageJson.name || projectName,
        version: packageJson.version || "1.0.0",
        devPath: projectPath,
        packageJson: {
          ...packageJson,
          development: devConfig,
        },
        hasDevServer,
        devServerPort,
      };

      console.log(
        `[WorkspaceScanner] Registering project ${projectName} with port ${devServerPort}`
      );
      await this.registerProject(projectConfig);

      // Setup file watcher if enabled
      if (devConfig.fileWatcher) {
        this.setupProjectFileWatcher(projectConfig);
      }
    } catch (error) {
      console.error(
        `[WorkspaceScanner] Error processing project ${projectName}:`,
        error
      );
    }
  }

  /**
   * Register a project with both dev loader and webview manager
   */
  private async registerProject(config: ProjectConfig): Promise<void> {
    console.log(`[WorkspaceScanner] Registering project: ${config.id}`);

    const manifest = {
      id: config.id,
      name: config.name,
      version: config.version,
      description:
        config.packageJson.description ||
        `${config.name} - Auto-detected workspace project`,
      author: config.packageJson.author || "Workspace",
      main: config.packageJson.main || "index.html",
      permissions: ["storage", "notifications", "communication"],
    };

    // Register with dev loader for file watching and hot reload
    const devPluginConfig = {
      id: config.id,
      name: config.name,
      version: config.version,
      devPath: config.devPath,
      manifest,
    };

    try {
      const devResult =
        await this.pluginDevLoader.registerDevPlugin(devPluginConfig);
      console.log(
        `[WorkspaceScanner] Dev plugin registration for ${config.id}:`,
        devResult
      );

      // If project has a dev server, also register as webview plugin
      if (config.hasDevServer && config.devServerPort) {
        const webviewConfig = {
          id: config.id,
          name: config.name,
          version: config.version,
          url: `http://localhost:${config.devServerPort}`,
          isDevelopment: true,
          manifest,
        };

        const webviewResult =
          await this.pluginWebviewManager.registerWebviewPlugin(webviewConfig);
        console.log(
          `[WorkspaceScanner] Webview plugin registration for ${config.id}:`,
          webviewResult
        );

        // Auto-launch if successful
        if (webviewResult.success) {
          const launchResult =
            await this.pluginWebviewManager.launchWebviewPlugin(config.id);
          console.log(
            `[WorkspaceScanner] Auto-launch result for ${config.id}:`,
            launchResult
          );
        }
      }

      this.registeredProjects.set(config.id, config);
    } catch (error) {
      console.error(
        `[WorkspaceScanner] Failed to register project ${config.id}:`,
        error
      );
    }
  }

  /**
   * Setup file watcher for a specific project
   */
  private setupProjectFileWatcher(config: ProjectConfig): void {
    if (this.fileWatchers.has(config.id)) {
      console.log(
        `[WorkspaceScanner] File watcher already exists for ${config.id}`
      );
      return;
    }

    try {
      console.log(
        `[WorkspaceScanner] Setting up file watcher for ${config.id} at ${config.devPath}`
      );

      const watcher = fs.watch(
        config.devPath,
        { recursive: true },
        (eventType, filename) => {
          if (!filename) return;

          // Filter for relevant file types
          const relevantExtensions = [
            ".html",
            ".js",
            ".ts",
            ".jsx",
            ".tsx",
            ".css",
            ".scss",
            ".json",
          ];
          const ext = path.extname(filename);

          if (!relevantExtensions.includes(ext)) return;

          console.log(
            `[WorkspaceScanner] File change detected in ${config.id}: ${filename} (${eventType})`
          );

          // Trigger reload for the project
          this.handleProjectFileChange(config, filename, eventType);
        }
      );

      this.fileWatchers.set(config.id, watcher);
      console.log(
        `[WorkspaceScanner] File watcher setup completed for ${config.id}`
      );
    } catch (error) {
      console.error(
        `[WorkspaceScanner] Failed to setup file watcher for ${config.id}:`,
        error
      );
    }
  }

  /**
   * Handle file changes in a project
   */
  private async handleProjectFileChange(
    config: ProjectConfig,
    filename: string,
    eventType: string
  ): void {
    console.log(
      `[WorkspaceScanner] Handling file change for ${config.id}: ${filename}`
    );

    try {
      // Reload dev plugin
      await this.pluginDevLoader.reloadDevPlugin(config.id);

      // Reload webview plugin if it's registered
      if (this.pluginWebviewManager.isWebviewPluginRegistered(config.id)) {
        try {
          const reloadResult =
            await this.pluginWebviewManager.reloadWebviewPlugin(config.id);
          console.log(
            `[WorkspaceScanner] Webview reload result for ${config.id}:`,
            reloadResult
          );
        } catch (error) {
          console.error(
            `[WorkspaceScanner] Failed to reload webview for ${config.id}:`,
            error
          );
        }
      }
    } catch (error) {
      console.error(
        `[WorkspaceScanner] Failed to handle file change for ${config.id}:`,
        error
      );
    }
  }

  /**
   * Setup watcher for the apps directory to detect new projects
   */
  private setupDirectoryWatcher(): void {
    try {
      console.log(
        "[WorkspaceScanner] Setting up directory watcher for new projects"
      );

      const watcher = fs.watch(
        this.appsDirectory,
        { recursive: false },
        async (eventType, filename) => {
          if (!filename || eventType !== "rename") return;

          const fullPath = path.join(this.appsDirectory, filename);

          // Check if it's a new directory
          if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
            console.log(
              `[WorkspaceScanner] New project directory detected: ${filename}`
            );

            // Wait a bit for the directory to be fully created
            setTimeout(async () => {
              await this.scanAndRegisterProject(fullPath, filename);
            }, 2000);
          }
        }
      );

      this.fileWatchers.set("__directory__", watcher);
    } catch (error) {
      console.error(
        "[WorkspaceScanner] Failed to setup directory watcher:",
        error
      );
    }
  }

  /**
   * Extract port number from dev script
   */
  private extractPortFromDevScript(devScript?: string): number | undefined {
    if (!devScript) return undefined;

    console.log(`[WorkspaceScanner] Extracting port from script: ${devScript}`);

    // Look for common port patterns (more comprehensive)
    const portPatterns = [
      /--port[=\s]+(\d+)/i,
      /-p[=\s]+(\d+)/i,
      /PORT[=\s]*=?[=\s]*(\d+)/i,
      /:(\d+)(?!\d)/,
      /port\s*:\s*(\d+)/i,
      /serve.*?(\d{4,5})/i,
    ];

    for (const pattern of portPatterns) {
      const match = devScript.match(pattern);
      if (match && match[1]) {
        const port = parseInt(match[1], 10);
        console.log(
          `[WorkspaceScanner] Found port ${port} using pattern: ${pattern}`
        );
        return port;
      }
    }

    // Default ports for common tools
    if (devScript.includes("vite")) {
      console.log(`[WorkspaceScanner] Using default Vite port: 5173`);
      return 5173;
    }
    if (devScript.includes("webpack-dev-server")) {
      console.log(
        `[WorkspaceScanner] Using default webpack-dev-server port: 8080`
      );
      return 8080;
    }
    if (devScript.includes("next")) {
      console.log(`[WorkspaceScanner] Using default Next.js port: 3000`);
      return 3000;
    }
    if (devScript.includes("react-scripts")) {
      console.log(
        `[WorkspaceScanner] Using default Create React App port: 3000`
      );
      return 3000;
    }

    console.log(
      `[WorkspaceScanner] Could not extract port from script: ${devScript}`
    );
    return undefined;
  }

  /**
   * Check if a port is in use using detect-port
   */
  private async isPortInUse(port: number): Promise<boolean> {
    try {
      const availablePort = await detect(port);
      // If detect returns the same port, it means the port is available (not in use)
      // If detect returns a different port, it means the original port is in use
      return availablePort !== port;
    } catch (error) {
      console.error(`[WorkspaceScanner] Error checking port ${port}:`, error);
      return false; // Treat errors as port not in use
    }
  }

  /**
   * Find the actual running port for a project by checking common port ranges
   */
  private async findRunningPort(
    basePort: number,
    projectName: string
  ): Promise<number | undefined> {
    console.log(
      `[WorkspaceScanner] Looking for running port for ${projectName}, base port: ${basePort}`
    );

    // Check the base port first
    const isBasePortInUse = await this.isPortInUse(basePort);
    if (isBasePortInUse) {
      console.log(
        `[WorkspaceScanner] Found ${projectName} running on base port ${basePort}`
      );
      return basePort;
    }

    // If base port is not in use, check nearby ports (common behavior when port is in use)
    // Many dev servers automatically increment the port if the default is taken
    const portsToCheck = [];
    for (let i = 1; i <= 10; i++) {
      portsToCheck.push(basePort + i);
    }

    for (const port of portsToCheck) {
      const isInUse = await this.isPortInUse(port);
      if (isInUse) {
        console.log(
          `[WorkspaceScanner] Found ${projectName} running on port ${port}`
        );
        return port;
      }
    }

    console.log(
      `[WorkspaceScanner] Could not find running port for ${projectName}`
    );
    return undefined;
  }

  /**
   * Get all registered projects
   */
  getRegisteredProjects(): ProjectConfig[] {
    return Array.from(this.registeredProjects.values());
  }

  /**
   * Cleanup all watchers
   */
  cleanup(): void {
    console.log("[WorkspaceScanner] Cleaning up file watchers");

    for (const [projectId, watcher] of this.fileWatchers) {
      try {
        watcher.close();
        console.log(`[WorkspaceScanner] Closed watcher for ${projectId}`);
      } catch (error) {
        console.error(
          `[WorkspaceScanner] Error closing watcher for ${projectId}:`,
          error
        );
      }
    }

    this.fileWatchers.clear();
    this.registeredProjects.clear();
  }
}
