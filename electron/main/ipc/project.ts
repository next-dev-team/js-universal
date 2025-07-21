import { exec } from 'child_process';
import { dialog, ipcMain, shell } from 'electron';
import { promises as fs } from 'fs';
import path from 'path';
import { promisify } from 'util';

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

  // Open project in IDE
  ipcMain.handle(
    'project:open-in-ide',
    async (_, projectPath: string, ideExecutable: string) => {
      try {
        await execAsync(`"${ideExecutable}" "${projectPath}"`);
        return true;
      } catch (error) {
        console.error(`Failed to open in IDE (${ideExecutable}):`, error);
        throw error;
      }
    },
  );

  // Get available IDEs on the system
  ipcMain.handle('project:get-available-ides', async () => {
    const ides = [];

    try {
      // Check for common IDEs based on platform
      if (process.platform === 'win32') {
        // Windows IDE detection
        const commonPaths = [
          'C:\\Users\\%USERNAME%\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe',
          'C:\\Program Files\\Microsoft VS Code\\Code.exe',
          'C:\\Program Files (x86)\\Microsoft VS Code\\Code.exe',
        ];

        for (const idePath of commonPaths) {
          try {
            const expandedPath = idePath.replace(
              '%USERNAME%',
              process.env.USERNAME || '',
            );
            await fs.access(expandedPath);
            ides.push({
              id: 'vscode',
              name: 'Visual Studio Code',
              executable: expandedPath,
              icon: 'vscode',
            });
            break;
          } catch {
            // Continue checking
          }
        }
      }

      // Try to find code in PATH
      try {
        await execAsync('code --version');
        ides.push({
          id: 'vscode-path',
          name: 'Visual Studio Code',
          executable: 'code',
          icon: 'vscode',
        });
      } catch {
        // VS Code not in PATH
      }
    } catch (error) {
      console.error('Failed to detect IDEs:', error);
    }

    return ides;
  });
};
