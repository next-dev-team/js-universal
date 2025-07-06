import { BrowserWindow, ipcMain } from 'electron';
import { getMainLogger } from '../../common/logger/main';
import type { AppSettings, IDE, Project } from '../services/database';
import { getDatabaseService } from '../services/database';
import { getIDELauncherService } from '../services/ide-launcher';
import type { ProjectDetectionResult } from '../services/project-scanner';
import { getProjectScannerService } from '../services/project-scanner';

let logger: ReturnType<ReturnType<typeof getMainLogger>['scope']>;

// IPC Channel names
export const IPC_CHANNELS = {
  // Project operations
  GET_PROJECTS: 'project:get-all',
  ADD_PROJECT: 'project:add',
  UPDATE_PROJECT: 'project:update',
  DELETE_PROJECT: 'project:delete',
  SCAN_DIRECTORY: 'project:scan-directory',
  IMPORT_PROJECTS: 'project:import-projects',
  LAUNCH_PROJECT: 'project:launch',
  OPEN_IN_EXPLORER: 'project:open-explorer',
  OPEN_IN_TERMINAL: 'project:open-terminal',

  // IDE operations
  GET_IDES: 'ide:get-all',
  DETECT_IDES: 'ide:detect',
  ADD_IDE: 'ide:add',
  LAUNCH_WITH_IDE: 'ide:launch-with',
  DELETE_IDE: 'ide:delete',

  // Settings operations
  GET_SETTINGS: 'settings:get',
  UPDATE_SETTINGS: 'settings:update',

  // File system operations
  SELECT_DIRECTORY: 'fs:select-directory',
  SELECT_FILE: 'fs:select-file',

  // Events
  PROJECTS_UPDATED: 'projects:updated',
  SCAN_PROGRESS: 'scan:progress',
  SCAN_COMPLETE: 'scan:complete',
  PROJECT_ADDED: 'project:added',
} as const;

export interface ScanProgress {
  directory: string;
  current: number;
  total: number;
  currentProject?: string;
}

class ProjectManagerIPC {
  constructor() {
    // Don't initialize immediately
  }

  init() {
    // Initialize logger when IPC is initialized
    logger = getMainLogger().scope('project-manager-ipc');

    this.registerProjectHandlers();
    this.registerIDEHandlers();
    this.registerSettingsHandlers();
    this.registerFileSystemHandlers();

    logger.info('Project Manager IPC handlers registered');
  }

  private registerProjectHandlers() {
    // Get all projects
    ipcMain.handle(IPC_CHANNELS.GET_PROJECTS, async () => {
      try {
        const projects = getDatabaseService().getProjects();
        logger.debug(`Retrieved ${projects.length} projects`);
        return { success: true, data: projects };
      } catch (error: any) {
        logger.error('Failed to get projects:', error);
        return { success: false, error: error.message };
      }
    });

    module.exports = new ProjectManagerIPC();

    // Add new project
    ipcMain.handle(
      IPC_CHANNELS.ADD_PROJECT,
      async (
        _,
        projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>,
      ) => {
        try {
          const project = getDatabaseService().addProject(projectData);
          this.notifyProjectsUpdated();
          logger.info(`Added project: ${project.name}`);
          return { success: true, data: project };
        } catch (error: any) {
          logger.error('Failed to add project:', error);
          return { success: false, error: error.message };
        }
      },
    );

    // Update project
    ipcMain.handle(
      IPC_CHANNELS.UPDATE_PROJECT,
      async (_, id: string, updates: Partial<Project>) => {
        try {
          const success = getDatabaseService().updateProject(id, updates);
          if (success) {
            this.notifyProjectsUpdated();
            logger.info(`Updated project: ${id}`);
          }
          return { success, data: success };
        } catch (error: any) {
          logger.error('Failed to update project:', error);
          return { success: false, error: error.message };
        }
      },
    );

    // Delete project
    ipcMain.handle(IPC_CHANNELS.DELETE_PROJECT, async (_, id: string) => {
      try {
        const success = getDatabaseService().deleteProject(id);
        if (success) {
          this.notifyProjectsUpdated();
          logger.info(`Deleted project: ${id}`);
        }
        return { success, data: success };
      } catch (error: any) {
        logger.error('Failed to delete project:', error);
        return { success: false, error: error.message };
      }
    });

    // Scan directory for projects
    ipcMain.handle(
      IPC_CHANNELS.SCAN_DIRECTORY,
      async (_, directoryPath: string) => {
        try {
          this.notifyScanProgress({
            directory: directoryPath,
            current: 0,
            total: 1,
          });

          const detectedProjects =
            await getProjectScannerService().scanDirectory(directoryPath);

          this.notifyScanComplete({
            directory: directoryPath,
            projects: detectedProjects,
            success: true,
          });

          logger.info(
            `Scanned directory ${directoryPath}, found ${detectedProjects.length} projects`,
          );
          return { success: true, data: detectedProjects };
        } catch (error: any) {
          logger.error('Failed to scan directory:', error);
          this.notifyScanComplete({
            directory: directoryPath,
            projects: [],
            success: false,
            error: error.message,
          });
          return { success: false, error: error.message };
        }
      },
    );

    // Import multiple projects
    ipcMain.handle(
      IPC_CHANNELS.IMPORT_PROJECTS,
      async (_, projects: ProjectDetectionResult[]) => {
        try {
          const importedProjects: Project[] = [];

          for (const projectData of projects) {
            try {
              const project = getDatabaseService().addProject({
                ...projectData,
                lastOpened: Date.now(),
                favorite: false,
                tags: [],
              });
              importedProjects.push(project);
            } catch (error: any) {
              logger.warn(
                `Failed to import project ${projectData.name}:`,
                error,
              );
            }
          }

          this.notifyProjectsUpdated();
          logger.info(`Imported ${importedProjects.length} projects`);
          return { success: true, data: importedProjects };
        } catch (error: any) {
          logger.error('Failed to import projects:', error);
          return { success: false, error: error.message };
        }
      },
    );

    // Launch project
    ipcMain.handle(
      IPC_CHANNELS.LAUNCH_PROJECT,
      async (_, projectId: string, ideId?: string) => {
        try {
          const project = getDatabaseService().getProjectById(projectId);
          if (!project) {
            throw new Error('Project not found');
          }

          // Update last opened time
          getDatabaseService().updateProjectLastOpened(projectId);

          const success = await getIDELauncherService().launchIDE({
            projectPath: project.path,
            ideId,
            closeAfterLaunch: true,
          });

          logger.info(`Launched project: ${project.name}`);
          return { success: true, data: success };
        } catch (error: any) {
          logger.error('Failed to launch project:', error);
          return { success: false, error: error.message };
        }
      },
    );

    // Open project in explorer
    ipcMain.handle(
      IPC_CHANNELS.OPEN_IN_EXPLORER,
      async (_, projectId: string) => {
        try {
          const project = getDatabaseService().getProjectById(projectId);
          if (!project) {
            throw new Error('Project not found');
          }

          await getIDELauncherService().openProjectInExplorer(project.path);
          logger.info(`Opened project in explorer: ${project.name}`);
          return { success: true };
        } catch (error: any) {
          logger.error('Failed to open project in explorer:', error);
          return { success: false, error: error.message };
        }
      },
    );

    // Open project in terminal
    ipcMain.handle(
      IPC_CHANNELS.OPEN_IN_TERMINAL,
      async (_, projectId: string) => {
        try {
          const project = getDatabaseService().getProjectById(projectId);
          if (!project) {
            throw new Error('Project not found');
          }

          await getIDELauncherService().openProjectInTerminal(project.path);
          logger.info(`Opened project in terminal: ${project.name}`);
          return { success: true };
        } catch (error: any) {
          logger.error('Failed to open project in terminal:', error);
          return { success: false, error: error.message };
        }
      },
    );
  }

  private registerIDEHandlers() {
    // Get all IDEs
    ipcMain.handle(IPC_CHANNELS.GET_IDES, async () => {
      try {
        const ides = getDatabaseService().getIDEs();
        logger.debug(`Retrieved ${ides.length} IDEs`);
        return { success: true, data: ides };
      } catch (error: any) {
        logger.error('Failed to get IDEs:', error);
        return { success: false, error: error.message };
      }
    });

    // Detect installed IDEs
    ipcMain.handle(IPC_CHANNELS.DETECT_IDES, async () => {
      try {
        const detectedIDEs =
          await getIDELauncherService().detectInstalledIDEs();
        logger.info(`Detected ${detectedIDEs.length} IDEs`);
        return { success: true, data: detectedIDEs };
      } catch (error: any) {
        logger.error('Failed to detect IDEs:', error);
        return { success: false, error: error.message };
      }
    });

    // Add custom IDE
    ipcMain.handle(
      IPC_CHANNELS.ADD_IDE,
      async (_, ideData: Omit<IDE, 'id'>) => {
        try {
          const ide = getDatabaseService().addIDE(ideData);
          logger.info(`Added IDE: ${ide.name}`);
          return { success: true, data: ide };
        } catch (error: any) {
          logger.error('Failed to add IDE:', error);
          return { success: false, error: error.message };
        }
      },
    );

    // Launch project with specific IDE
    ipcMain.handle(
      IPC_CHANNELS.LAUNCH_WITH_IDE,
      async (_, projectId: string, ideId: string) => {
        try {
          const project = getDatabaseService().getProjectById(projectId);
          const ide = getDatabaseService()
            .getIDEs()
            .find((i) => i.id === ideId);

          if (!project) throw new Error('Project not found');
          if (!ide) throw new Error('IDE not found');

          // Update last opened time
          getDatabaseService().updateProjectLastOpened(projectId);

          const success = await getIDELauncherService().launchWithCustomIDE(
            ide,
            project.path,
          );

          logger.info(`Launched project ${project.name} with ${ide.name}`);
          return { success: true, data: success };
        } catch (error: any) {
          logger.error('Failed to launch project with IDE:', error);
          return { success: false, error: error.message };
        }
      },
    );
  }

  private registerSettingsHandlers() {
    // Get settings
    ipcMain.handle(IPC_CHANNELS.GET_SETTINGS, async () => {
      try {
        const settings = getDatabaseService().getSettings();
        return { success: true, data: settings };
      } catch (error: any) {
        logger.error('Failed to get settings:', error);
        return { success: false, error: error.message };
      }
    });

    // Update settings
    ipcMain.handle(
      IPC_CHANNELS.UPDATE_SETTINGS,
      async (_, updates: Partial<AppSettings>) => {
        try {
          const success = getDatabaseService().updateSettings(updates);

          // Update watched directories if auto scan directories changed
          if (updates.autoScanDirectories) {
            this.updateWatchedDirectories(updates.autoScanDirectories);
          }

          logger.info('Settings updated');
          return { success: true, data: success };
        } catch (error: any) {
          logger.error('Failed to update settings:', error);
          return { success: false, error: error.message };
        }
      },
    );
  }

  private registerFileSystemHandlers() {
    // Select directory dialog
    ipcMain.handle(IPC_CHANNELS.SELECT_DIRECTORY, async () => {
      try {
        const { dialog } = await import('electron');
        const result = await dialog.showOpenDialog({
          properties: ['openDirectory'],
          title: 'Select Directory to Scan',
        });

        if (result.canceled || result.filePaths.length === 0) {
          return { success: false, canceled: true };
        }

        return { success: true, data: result.filePaths[0] };
      } catch (error: any) {
        logger.error('Failed to show directory dialog:', error);
        return { success: false, error: error.message };
      }
    });

    // Select file dialog
    ipcMain.handle(
      IPC_CHANNELS.SELECT_FILE,
      async (_, filters?: { name: string; extensions: string[] }[]) => {
        try {
          const { dialog } = await import('electron');
          const result = await dialog.showOpenDialog({
            properties: ['openFile'],
            filters: filters || [{ name: 'All Files', extensions: ['*'] }],
            title: 'Select File',
          });

          if (result.canceled || result.filePaths.length === 0) {
            return { success: false, canceled: true };
          }

          return { success: true, data: result.filePaths[0] };
        } catch (error: any) {
          logger.error('Failed to show file dialog:', error);
          return { success: false, error: error.message };
        }
      },
    );
  }

  // private setupProjectWatcher() {
  //   // Initialize with current settings
  //   const settings = databaseService.getSettings();
  //   if (settings.autoScanDirectories.length > 0) {
  //     this.updateWatchedDirectories(settings.autoScanDirectories);
  //   }
  // }

  private updateWatchedDirectories(directories: string[]) {
    getProjectScannerService().stopWatching();
    this.updateWatchedDirectories(directories);

    if (directories.length > 0) {
      getProjectScannerService().startWatching(directories, (projects) => {
        // Auto-import detected projects
        this.autoImportProjects(projects);
      });
    }
  }

  private async autoImportProjects(detectedProjects: ProjectDetectionResult[]) {
    try {
      const existingProjects = getDatabaseService().getProjects();
      const existingPaths = new Set(existingProjects.map((p: any) => p.path));

      const newProjects = detectedProjects.filter(
        (p) => !existingPaths.has(p.path),
      );

      if (newProjects.length > 0) {
        for (const projectData of newProjects) {
          try {
            getDatabaseService().addProject({
              ...projectData,
              lastOpened: Date.now(),
              favorite: false,
              tags: [],
            });
          } catch (error) {
            logger.warn(
              `Failed to auto-import project ${projectData.name}:`,
              error,
            );
          }
        }

        this.notifyProjectsUpdated();
        logger.info(`Auto-imported ${newProjects.length} new projects`);
      }
    } catch (error) {
      logger.error('Failed to auto-import projects:', error);
    }
  }

  private notifyProjectsUpdated() {
    const allWindows = BrowserWindow.getAllWindows();
    allWindows.forEach((window) => {
      window.webContents.send(IPC_CHANNELS.PROJECTS_UPDATED);
    });
  }

  private notifyScanProgress(progress: ScanProgress) {
    const allWindows = BrowserWindow.getAllWindows();
    allWindows.forEach((window) => {
      window.webContents.send(IPC_CHANNELS.SCAN_PROGRESS, progress);
    });
  }

  private notifyScanComplete(result: {
    directory: string;
    projects: ProjectDetectionResult[];
    success: boolean;
    error?: string;
  }) {
    const allWindows = BrowserWindow.getAllWindows();
    allWindows.forEach((window) => {
      window.webContents.send(IPC_CHANNELS.SCAN_COMPLETE, result);
    });
  }
}

export const projectManagerIPC = new ProjectManagerIPC();
export default projectManagerIPC;
