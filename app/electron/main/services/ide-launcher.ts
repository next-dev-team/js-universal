import { BrowserWindow, app } from 'electron';
import { exec, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import { getMainLogger } from '../../common/logger/main';
import type { IDE } from './database';

const execAsync = promisify(exec);
let logger: ReturnType<ReturnType<typeof getMainLogger>['scope']>;

export interface LaunchOptions {
  projectPath: string;
  ideId?: string;
  windowPosition?: { x: number; y: number; width: number; height: number };
  closeAfterLaunch?: boolean;
}

export interface DetectedIDE {
  name: string;
  executablePath: string;
  version?: string;
  arguments: string[];
  icon?: string;
  supportedTypes: string[];
}

export class IDELauncherService {
  private detectedIDEs: Map<string, DetectedIDE> = new Map();
  private isDetecting = false;

  constructor() {
    // Initialize logger when service is created
    logger = getMainLogger().scope('ide-launcher');
  }

  // Common IDE detection patterns for Windows
  private readonly idePatterns = {
    vscode: {
      name: 'Visual Studio Code',
      paths: [
        'C:\\Users\\%USERNAME%\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe',
        'C:\\Program Files\\Microsoft VS Code\\Code.exe',
        'C:\\Program Files (x86)\\Microsoft VS Code\\Code.exe',
      ],
      arguments: ['--new-window'],
      supportedTypes: ['react', 'vue', 'angular', 'node', 'python', 'other'],
      icon: 'vscode',
    },
    'vscode-insiders': {
      name: 'Visual Studio Code Insiders',
      paths: [
        'C:\\Users\\%USERNAME%\\AppData\\Local\\Programs\\Microsoft VS Code Insiders\\Code - Insiders.exe',
      ],
      arguments: ['--new-window'],
      supportedTypes: ['react', 'vue', 'angular', 'node', 'python', 'other'],
      icon: 'vscode-insiders',
    },
    webstorm: {
      name: 'WebStorm',
      paths: [
        'C:\\Users\\%USERNAME%\\AppData\\Local\\JetBrains\\Toolbox\\apps\\WebStorm\\ch-0\\*\\bin\\webstorm64.exe',
        'C:\\Program Files\\JetBrains\\WebStorm*\\bin\\webstorm64.exe',
      ],
      arguments: [],
      supportedTypes: ['react', 'vue', 'angular', 'node'],
      icon: 'webstorm',
    },
    intellij: {
      name: 'IntelliJ IDEA',
      paths: [
        'C:\\Users\\%USERNAME%\\AppData\\Local\\JetBrains\\Toolbox\\apps\\IDEA-U\\ch-0\\*\\bin\\idea64.exe',
        'C:\\Program Files\\JetBrains\\IntelliJ IDEA*\\bin\\idea64.exe',
      ],
      arguments: [],
      supportedTypes: ['react', 'vue', 'angular', 'node', 'python', 'other'],
      icon: 'intellij',
    },
    pycharm: {
      name: 'PyCharm',
      paths: [
        'C:\\Users\\%USERNAME%\\AppData\\Local\\JetBrains\\Toolbox\\apps\\PyCharm-P\\ch-0\\*\\bin\\pycharm64.exe',
        'C:\\Program Files\\JetBrains\\PyCharm*\\bin\\pycharm64.exe',
      ],
      arguments: [],
      supportedTypes: ['python'],
      icon: 'pycharm',
    },
    sublime: {
      name: 'Sublime Text',
      paths: [
        'C:\\Program Files\\Sublime Text\\sublime_text.exe',
        'C:\\Program Files (x86)\\Sublime Text\\sublime_text.exe',
      ],
      arguments: ['--new-window'],
      supportedTypes: ['react', 'vue', 'angular', 'node', 'python', 'other'],
      icon: 'sublime',
    },
    atom: {
      name: 'Atom',
      paths: ['C:\\Users\\%USERNAME%\\AppData\\Local\\atom\\atom.exe'],
      arguments: ['--new-window'],
      supportedTypes: ['react', 'vue', 'angular', 'node', 'python', 'other'],
      icon: 'atom',
    },
    notepadpp: {
      name: 'Notepad++',
      paths: [
        'C:\\Program Files\\Notepad++\\notepad++.exe',
        'C:\\Program Files (x86)\\Notepad++\\notepad++.exe',
      ],
      arguments: ['-multiInst'],
      supportedTypes: ['other'],
      icon: 'notepadpp',
    },
  };

  async detectInstalledIDEs(): Promise<DetectedIDE[]> {
    if (this.isDetecting) {
      logger.warn('IDE detection already in progress');
      return Array.from(this.detectedIDEs.values());
    }

    this.isDetecting = true;
    logger.info('Starting IDE detection...');

    try {
      this.detectedIDEs.clear();
      const username = process.env.USERNAME || 'User';

      for (const [ideKey, ideConfig] of Object.entries(this.idePatterns)) {
        try {
          const detectedPath = await this.findIDEExecutable(
            ideConfig.paths,
            username,
          );
          if (detectedPath) {
            const version = await this.getIDEVersion(detectedPath, ideKey);

            const detectedIDE: DetectedIDE = {
              name: ideConfig.name,
              executablePath: detectedPath,
              version,
              arguments: ideConfig.arguments,
              icon: ideConfig.icon,
              supportedTypes: ideConfig.supportedTypes,
            };

            this.detectedIDEs.set(ideKey, detectedIDE);
            logger.info(`Detected ${ideConfig.name} at: ${detectedPath}`);
          }
        } catch (error) {
          logger.debug(`Failed to detect ${ideConfig.name}:`, error);
        }
      }

      logger.info(`Detection complete. Found ${this.detectedIDEs.size} IDEs`);
      return Array.from(this.detectedIDEs.values());
    } finally {
      this.isDetecting = false;
    }
  }

  private async findIDEExecutable(
    paths: string[],
    username: string,
  ): Promise<string | null> {
    for (let pathPattern of paths) {
      // Replace username placeholder
      pathPattern = pathPattern.replace(/%USERNAME%/g, username);

      // Handle wildcard patterns
      if (pathPattern.includes('*')) {
        try {
          const basePath = pathPattern.substring(0, pathPattern.indexOf('*'));
          const suffix = pathPattern.substring(
            pathPattern.lastIndexOf('*') + 1,
          );

          if (fs.existsSync(basePath)) {
            const entries = await fs.promises.readdir(basePath);
            for (const entry of entries) {
              const fullPath = path.join(basePath, entry, suffix);
              if (fs.existsSync(fullPath)) {
                return fullPath;
              }
            }
          }
        } catch (_error) {
          // Continue to next path
        }
      } else {
        // Direct path check
        if (fs.existsSync(pathPattern)) {
          return pathPattern;
        }
      }
    }

    return null;
  }

  private async getIDEVersion(
    executablePath: string,
    ideKey: string,
  ): Promise<string | undefined> {
    try {
      let versionCommand: string;

      switch (ideKey) {
        case 'vscode':
        case 'vscode-insiders':
          versionCommand = `"${executablePath}" --version`;
          break;
        case 'sublime':
          versionCommand = `"${executablePath}" --version`;
          break;
        default:
          return undefined;
      }

      const { stdout } = await execAsync(versionCommand, { timeout: 5000 });
      return stdout.trim().split('\n')[0];
    } catch (error) {
      logger.debug(`Failed to get version for ${executablePath}:`, error);
      return undefined;
    }
  }

  async launchIDE(options: LaunchOptions): Promise<boolean> {
    const {
      projectPath,
      ideId,
      windowPosition,
      closeAfterLaunch = true,
    } = options;

    logger.info(`Launching IDE for project: ${projectPath}`);

    try {
      // Ensure IDEs are detected
      if (this.detectedIDEs.size === 0) {
        await this.detectInstalledIDEs();
      }

      let selectedIDE: DetectedIDE | undefined;

      if (ideId) {
        selectedIDE = this.detectedIDEs.get(ideId);
        if (!selectedIDE) {
          throw new Error(`IDE with id '${ideId}' not found`);
        }
      } else {
        // Use first available IDE (should be default from settings)
        selectedIDE = Array.from(this.detectedIDEs.values())[0];
        if (!selectedIDE) {
          throw new Error('No IDEs detected');
        }
      }

      // Prepare launch arguments
      const args = [...selectedIDE.arguments, projectPath];

      logger.info(`Launching ${selectedIDE.name} with args:`, args);

      // Get current window position if needed
      let launchPosition = windowPosition;
      if (!launchPosition && closeAfterLaunch) {
        const mainWindow = BrowserWindow.getFocusedWindow();
        if (mainWindow) {
          const bounds = mainWindow.getBounds();
          launchPosition = {
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height,
          };
        }
      }

      // Apply window position for supported IDEs (e.g., VS Code)
      if (
        launchPosition &&
        (selectedIDE.name === 'Visual Studio Code' ||
          selectedIDE.name === 'Visual Studio Code Insiders')
      ) {
        args.push(
          `--window-size=${launchPosition.width},${launchPosition.height}`,
        );
        args.push(`--window-position=${launchPosition.x},${launchPosition.y}`);
      }

      // Launch the IDE
      const child = spawn(selectedIDE.executablePath, args, {
        detached: true,
        stdio: 'ignore',
        cwd: projectPath,
      });

      child.unref();

      // Wait a moment for the IDE to start
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Close the launcher if requested
      if (closeAfterLaunch) {
        logger.info('Closing launcher after IDE launch');

        // Store window position for next launch
        if (launchPosition) {
          // This would be saved to settings via IPC
          logger.info('Window position stored for next launch');
        }

        // Close the main window first
        const mainWindow = BrowserWindow.getFocusedWindow();
        if (mainWindow) {
          mainWindow.close();
        }

        // Quit the app if no other windows are open
        if (BrowserWindow.getAllWindows().length === 0) {
          setTimeout(() => {
            app.quit();
          }, 500);
        }
      }

      logger.info(`Successfully launched ${selectedIDE.name}`);
      return true;
    } catch (error) {
      logger.error('Failed to launch IDE:', error);
      throw error;
    }
  }

  async launchWithCustomIDE(ide: IDE, projectPath: string): Promise<boolean> {
    logger.info(`Launching custom IDE ${ide.name} for project: ${projectPath}`);

    try {
      if (!fs.existsSync(ide.executablePath)) {
        throw new Error(`IDE executable not found: ${ide.executablePath}`);
      }

      const args = [...ide.arguments, projectPath];

      logger.info(`Launching ${ide.name} with args:`, args);

      const child = spawn(ide.executablePath, args, {
        detached: true,
        stdio: 'ignore',
        cwd: projectPath,
      });

      child.unref();

      // Wait a moment for the IDE to start
      await new Promise((resolve) => setTimeout(resolve, 1000));

      logger.info(`Successfully launched ${ide.name}`);
      return true;
    } catch (error) {
      logger.error(`Failed to launch custom IDE ${ide.name}:`, error);
      throw error;
    }
  }

  getDetectedIDEs(): DetectedIDE[] {
    return Array.from(this.detectedIDEs.values());
  }

  getIDEById(ideId: string): DetectedIDE | undefined {
    return this.detectedIDEs.get(ideId);
  }

  isIDESupported(ideId: string, projectType: string): boolean {
    const ide = this.detectedIDEs.get(ideId);
    return ide ? ide.supportedTypes.includes(projectType) : false;
  }

  async openProjectInExplorer(projectPath: string): Promise<void> {
    try {
      const { spawn } = await import('node:child_process');
      spawn('explorer', [projectPath], { detached: true, stdio: 'ignore' });
      logger.info(`Opened project in explorer: ${projectPath}`);
    } catch (error) {
      logger.error('Failed to open project in explorer:', error);
      throw error;
    }
  }

  async openProjectInTerminal(projectPath: string): Promise<void> {
    try {
      const { spawn } = await import('node:child_process');
      // Open Windows Terminal or Command Prompt
      const terminalCommands = [
        ['wt', ['-d', projectPath]], // Windows Terminal
        ['cmd', ['/k', `cd /d "${projectPath}"`]], // Command Prompt
      ];

      for (const [command, ...args] of terminalCommands as [
        string,
        ...string[],
      ][]) {
        try {
          spawn(command, args, { detached: true, stdio: 'ignore' });
          logger.info(`Opened project in terminal: ${projectPath}`);
          return;
        } catch (_) {
          // Try next terminal
        }
      }

      throw new Error('No suitable terminal found');
    } catch (error) {
      logger.error('Failed to open project in terminal:', error);
      throw error;
    }
  }
}

let instance: IDELauncherService | null = null;

export const getIDELauncherService = () => {
  if (!instance) {
    instance = new IDELauncherService();
  }
  return instance;
};
