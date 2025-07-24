import { exec } from 'child_process';
import { dialog, ipcMain, shell } from 'electron';
import { promises as fs } from 'fs';
import path from 'path';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import { getDatabaseService } from '../services/database';

const execAsync = promisify(exec);

export interface ProjectInfo {
  name: string;
  path: string;
  type: string;
  packageManager?: string;
  framework?: string;
  hasGit?: boolean;
  size?: number;
}

// Detect project type based on files and structure
const detectProjectType = async (projectPath: string): Promise<string> => {
  try {
    const files = await fs.readdir(projectPath);

    // Check for specific framework files
    if (files.includes('package.json')) {
      const packageJsonPath = path.join(projectPath, 'package.json');
      try {
        const packageContent = await fs.readFile(packageJsonPath, 'utf-8');
        const packageJson = JSON.parse(packageContent);

        // Check dependencies for framework detection
        const deps = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies,
        };

        if (deps.react) return 'react';
        if (deps.vue) return 'vue';
        if (deps['@angular/core']) return 'angular';
        if (deps.electron) return 'electron';
        if (deps.express || deps.fastify || deps.koa) return 'nodejs';
        if (deps.next) return 'next';
        if (deps.nuxt) return 'nuxt';
        if (deps.svelte) return 'svelte';

        return 'nodejs';
      } catch {
        return 'nodejs';
      }
    }

    if (files.includes('requirements.txt') || files.includes('pyproject.toml'))
      return 'python';
    if (files.includes('Cargo.toml')) return 'rust';
    if (files.includes('go.mod')) return 'go';
    if (files.includes('pom.xml') || files.includes('build.gradle'))
      return 'java';
    if (files.includes('composer.json')) return 'php';
    if (files.includes('Gemfile')) return 'ruby';
    if (files.includes('pubspec.yaml')) return 'flutter';
    if (files.some((f) => f.endsWith('.csproj') || f.endsWith('.sln')))
      return 'csharp';
    if (
      files.includes('CMakeLists.txt') ||
      files.some((f) => f.endsWith('.cpp') || f.endsWith('.c'))
    )
      return 'cpp';

    return 'other';
  } catch {
    return 'other';
  }
};

// Detect package manager
const detectPackageManager = async (projectPath: string): Promise<string> => {
  try {
    const files = await fs.readdir(projectPath);

    if (files.includes('yarn.lock')) return 'yarn';
    if (files.includes('pnpm-lock.yaml')) return 'pnpm';
    if (files.includes('bun.lockb')) return 'bun';
    if (files.includes('package-lock.json')) return 'npm';

    return 'npm';
  } catch {
    return 'npm';
  }
};

// Get directory size
const getDirectorySize = async (dirPath: string): Promise<number> => {
  try {
    let totalSize = 0;
    const items = await fs.readdir(dirPath, { withFileTypes: true });

    for (const item of items) {
      const itemPath = path.join(dirPath, item.name);

      if (item.isDirectory()) {
        // Skip node_modules and other large directories for performance
        if (
          !['node_modules', '.git', 'dist', 'build', 'target'].includes(
            item.name,
          )
        ) {
          totalSize += await getDirectorySize(itemPath);
        }
      } else {
        const stats = await fs.stat(itemPath);
        totalSize += stats.size;
      }
    }

    return totalSize;
  } catch {
    return 0;
  }
};

// Analyze project and extract information
const analyzeProject = async (projectPath: string): Promise<ProjectInfo> => {
  const projectName = path.basename(projectPath);
  const projectType = await detectProjectType(projectPath);
  const packageManager = await detectPackageManager(projectPath);

  // Check if it's a git repository
  let hasGit = false;
  try {
    await fs.access(path.join(projectPath, '.git'));
    hasGit = true;
  } catch {
    hasGit = false;
  }

  // Get project size (limited scan for performance)
  const size = await getDirectorySize(projectPath);

  // Try to detect framework from package.json
  let framework = projectType;
  if (projectType === 'nodejs' || projectType === 'react') {
    try {
      const packageJsonPath = path.join(projectPath, 'package.json');
      const packageContent = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(packageContent);

      if (packageJson.dependencies?.react) framework = 'React';
      if (packageJson.dependencies?.vue) framework = 'Vue';
      if (packageJson.dependencies?.['@angular/core']) framework = 'Angular';
      if (packageJson.dependencies?.express) framework = 'Express';
      if (packageJson.dependencies?.next) framework = 'Next.js';
    } catch {
      // Ignore errors
    }
  }

  return {
    name: projectName,
    path: projectPath,
    type: projectType,
    packageManager,
    framework,
    hasGit,
    size,
  };
};

export const initProjectIpcMain = () => {
  const db = getDatabaseService();

  // CRUD Operations
  // Create project
  ipcMain.handle(
    'project:create',
    async (
      _,
      projectData: {
        name: string;
        description?: string;
        type: string;
        path: string;
        tags?: string[];
        isFavorite?: boolean;
        gitRepository?: string;
        metadata?: any;
      },
    ) => {
      try {
        const projectInfo = await analyzeProject(projectData.path);

        const project = {
          id: uuidv4(),
          name: projectData.name,
          description: projectData.description,
          type: projectData.type,
          path: projectData.path,
          tags: projectData.tags || [],
          isFavorite: projectData.isFavorite || false,
          gitRepository: projectData.gitRepository,
          size: projectInfo.size,
          metadata: {
            ...projectData.metadata,
            framework: projectInfo.framework,
            packageManager: projectInfo.packageManager,
            hasGit: projectInfo.hasGit,
          },
        };

        return db.createProject(project);
      } catch (error) {
        console.error('Failed to create project:', error);
        throw error;
      }
    },
  );

  // Read all projects
  ipcMain.handle('project:get-all', async () => {
    try {
      return db.getAllProjects();
    } catch (error) {
      console.error('Failed to get all projects:', error);
      throw error;
    }
  });

  // Read project by ID
  ipcMain.handle('project:get-by-id', async (_, id: string) => {
    try {
      return db.getProjectById(id);
    } catch (error) {
      console.error('Failed to get project by id:', error);
      throw error;
    }
  });

  // Update project
  ipcMain.handle(
    'project:update',
    async (
      _,
      {
        id,
        updates,
      }: {
        id: string;
        updates: {
          name?: string;
          description?: string;
          tags?: string[];
          isFavorite?: boolean;
          status?: string;
          metadata?: any;
        };
      },
    ) => {
      try {
        return db.updateProject(id, updates);
      } catch (error) {
        console.error('Failed to update project:', error);
        throw error;
      }
    },
  );

  // Delete project
  ipcMain.handle('project:delete', async (_, id: string) => {
    try {
      return db.deleteProject(id);
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw error;
    }
  });

  // Search projects
  ipcMain.handle(
    'project:search',
    async (
      _,
      filters: {
        query?: string;
        type?: string;
        status?: string;
        isFavorite?: boolean;
        sortBy?: string;
        sortOrder?: string;
      },
    ) => {
      try {
        return db.searchProjects(filters);
      } catch (error) {
        console.error('Failed to search projects:', error);
        throw error;
      }
    },
  );

  // Toggle favorite
  ipcMain.handle('project:toggle-favorite', async (_, id: string) => {
    try {
      const project = db.getProjectById(id);
      if (!project) {
        throw new Error('Project not found');
      }

      return db.updateProject(id, { isFavorite: !project.isFavorite });
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      throw error;
    }
  });

  // Add existing project from folder
  ipcMain.handle('project:add-existing', async (_, folderPath: string) => {
    try {
      const projectInfo = await analyzeProject(folderPath);

      const project = {
        id: uuidv4(),
        name: projectInfo.name,
        description: `${projectInfo.framework || projectInfo.type} project`,
        type: projectInfo.type,
        path: projectInfo.path,
        tags: [projectInfo.type],
        isFavorite: false,
        gitRepository: projectInfo.hasGit ? undefined : undefined,
        size: projectInfo.size,
        metadata: {
          framework: projectInfo.framework,
          packageManager: projectInfo.packageManager,
          hasGit: projectInfo.hasGit,
        },
      };

      return db.createProject(project);
    } catch (error) {
      console.error('Failed to add existing project:', error);
      throw error;
    }
  });

  // Helper function to get available IDEs (reuse the logic from the main handler)
  // const getAvailableIDEs = async () => {
  //   const ides = [];
  //   const detectedIds = new Set();

  //   try {
  //     const ideConfigs = [
  //       {
  //         id: 'vscode',
  //         name: 'Visual Studio Code',
  //         commands: ['code'],
  //         args: ['.'],
  //         icon: '🔵',
  //       },
  //       {
  //         id: 'cursor',
  //         name: 'Cursor',
  //         commands: ['cursor'],
  //         args: ['.'],
  //         icon: '⚡',
  //       },
  //       {
  //         id: 'windsurf',
  //         name: 'Windsurf',
  //         commands: ['windsurf'],
  //         args: ['.'],
  //         icon: '🌊',
  //       },
  //     ];

  //     for (const config of ideConfigs) {
  //       for (const command of config.commands) {
  //         try {
  //           await execAsync(`${command} --version`);
  //           if (!detectedIds.has(config.id)) {
  //             ides.push({
  //               id: config.id,
  //               name: config.name,
  //               executable: command,
  //               args: config.args,
  //               icon: config.icon,
  //               supportedTypes: [
  //                 'web',
  //                 'react',
  //                 'vue',
  //                 'angular',
  //                 'nodejs',
  //                 'python',
  //                 'typescript',
  //               ],
  //             });
  //             detectedIds.add(config.id);
  //           }
  //           break;
  //         } catch {
  //           // Command not in PATH, continue
  //         }
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Failed to detect IDEs:', error);
  //   }

  //   return ides;
  // };
  // Open folder dialog to select existing project
  ipcMain.handle('project:select-folder', async () => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ['openDirectory'],
        title: 'Select Project Folder',
      });

      if (result.canceled || !result.filePaths.length) {
        return null;
      }

      const projectPath = result.filePaths[0];
      const projectInfo = await analyzeProject(projectPath);

      return projectInfo;
    } catch (error) {
      console.error('Failed to select folder:', error);
      throw error;
    }
  });

  // Analyze dropped folder
  ipcMain.handle('project:analyze-folder', async (_, folderPath: string) => {
    try {
      // Verify the path exists and is a directory
      const stats = await fs.stat(folderPath);
      if (!stats.isDirectory()) {
        throw new Error('Path is not a directory');
      }

      const projectInfo = await analyzeProject(folderPath);
      return projectInfo;
    } catch (error) {
      console.error('Failed to analyze folder:', error);
      throw error;
    }
  });

  // Open project in file explorer
  ipcMain.handle('project:open-in-explorer', async (_, projectPath: string) => {
    try {
      await shell.openPath(projectPath);
      return true;
    } catch (error) {
      console.error('Failed to open in explorer:', error);
      throw error;
    }
  });

  // Open project in terminal
  ipcMain.handle('project:open-in-terminal', async (_, projectPath: string) => {
    try {
      if (process.platform === 'win32') {
        await execAsync(`start cmd /k "cd /d "${projectPath}""`);
      } else if (process.platform === 'darwin') {
        await execAsync(`open -a Terminal "${projectPath}"`);
      } else {
        await execAsync(`gnome-terminal --working-directory="${projectPath}"`);
      }
      return true;
    } catch (error) {
      console.error('Failed to open in terminal:', error);
      throw error;
    }
  });

  // Get available IDEs on the system
  ipcMain.handle('project:get-available-ides', async () => {
    const ides = [];
    const detectedIds = new Set(); // Prevent duplicates

    try {
      // Define IDE configurations
      const ideConfigs = [
        {
          id: 'trae',
          name: 'Trae AI',
          commands: ['trae'],
          args: ['.'],
          icon: '🤖',
        },
        {
          id: 'vscode',
          name: 'Visual Studio Code',
          commands: ['code'],
          args: ['.'],
          icon: '🔵',
        },
        {
          id: 'cursor',
          name: 'Cursor',
          commands: ['cursor'],
          args: ['.'],
          icon: '⚡',
        },
        {
          id: 'windsurf',
          name: 'Windsurf',
          commands: ['windsurf'],
          args: ['.'],
          icon: '🌊',
        },

        {
          id: 'webstorm',
          name: 'WebStorm',
          commands: ['webstorm'],
          args: ['.'],
          icon: '🟡',
        },
      ];

      // Check each IDE configuration
      for (const config of ideConfigs) {
        // Try command in PATH
        for (const command of config.commands) {
          try {
            await execAsync(`${command} --version`);
            if (!detectedIds.has(config.id)) {
              ides.push({
                id: config.id,
                name: config.name,
                executable: command,
                args: config.args,
                icon: config.icon,
                supportedTypes: [
                  'web',
                  'react',
                  'vue',
                  'angular',
                  'nodejs',
                  'python',
                  'typescript',
                ],
              });
              detectedIds.add(config.id);
            }
            break;
          } catch {
            // Command not in PATH, continue
          }
        }
      }
    } catch (error) {
      console.error('Failed to detect IDEs:', error);
    }

    return ides;
  });
};
