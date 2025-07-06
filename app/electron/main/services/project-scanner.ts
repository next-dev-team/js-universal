import * as chokidar from 'chokidar';
import { glob } from 'fast-glob';
import fs from 'node:fs';
import path from 'node:path';
import { getMainLogger } from '../../common/logger/main';
import type { Project } from './database';

let logger: ReturnType<ReturnType<typeof getMainLogger>['scope']>;

export interface ProjectDetectionResult {
  name: string;
  path: string;
  type: Project['type'];
  packageManager?: Project['packageManager'];
  framework?: string;
  language?: string;
  gitRemote?: string;
  description?: string;
}

export class ProjectScannerService {
  private watchers: Map<string, chokidar.FSWatcher> = new Map();
  private scanInProgress = false;

  constructor() {
    // Initialize logger when service is created
    logger = getMainLogger().scope('project-scanner');
  }

  // Project type detection patterns
  private readonly detectionPatterns = {
    react: [
      { file: 'package.json', content: /"react"/ },
      { file: 'package.json', content: /"@types\/react"/ },
      { file: 'src/App.tsx', exists: true },
      { file: 'src/App.jsx', exists: true },
    ],
    vue: [
      { file: 'package.json', content: /"vue"/ },
      { file: 'vue.config.js', exists: true },
      { file: 'nuxt.config.js', exists: true },
      { file: 'src/App.vue', exists: true },
    ],
    angular: [
      { file: 'package.json', content: /"@angular\/core"/ },
      { file: 'angular.json', exists: true },
      { file: 'src/app/app.component.ts', exists: true },
    ],
    node: [
      { file: 'package.json', exists: true },
      { file: 'server.js', exists: true },
      { file: 'app.js', exists: true },
      { file: 'index.js', exists: true },
    ],
    python: [
      { file: 'requirements.txt', exists: true },
      { file: 'setup.py', exists: true },
      { file: 'pyproject.toml', exists: true },
      { file: 'main.py', exists: true },
      { file: 'app.py', exists: true },
    ],
  };

  async scanDirectory(
    directoryPath: string,
  ): Promise<ProjectDetectionResult[]> {
    if (this.scanInProgress) {
      logger.warn('Scan already in progress, skipping');
      return [];
    }

    this.scanInProgress = true;
    logger.info(`Starting scan of directory: ${directoryPath}`);

    try {
      const projects: ProjectDetectionResult[] = [];

      // Find potential project directories
      const projectDirs = await this.findProjectDirectories(directoryPath);

      for (const projectDir of projectDirs) {
        try {
          const project = await this.analyzeProject(projectDir);
          if (project) {
            projects.push(project);
          }
        } catch (error) {
          logger.error(`Error analyzing project at ${projectDir}:`, error);
        }
      }

      logger.info(`Found ${projects.length} projects in ${directoryPath}`);
      return projects;
    } finally {
      this.scanInProgress = false;
    }
  }

  private async findProjectDirectories(rootPath: string): Promise<string[]> {
    const projectIndicators = [
      '**/package.json',
      '**/requirements.txt',
      '**/setup.py',
      '**/pyproject.toml',
      '**/Cargo.toml',
      '**/go.mod',
      '**/pom.xml',
      '**/.git',
    ];

    try {
      const matches = await glob(projectIndicators, {
        cwd: rootPath,
        absolute: true,
        ignore: [
          '**/node_modules/**',
          '**/venv/**',
          '**/env/**',
          '**/.venv/**',
          '**/dist/**',
          '**/build/**',
          '**/.git/**',
          '**/target/**',
        ],
        onlyFiles: false,
        markDirectories: true,
      });

      // Extract unique directory paths
      const directories = new Set<string>();
      for (const match of matches) {
        const dir = match.endsWith('/')
          ? match.slice(0, -1)
          : path.dirname(match);
        directories.add(dir);
      }

      return Array.from(directories);
    } catch (error) {
      logger.error(`Error finding project directories in ${rootPath}:`, error);
      return [];
    }
  }

  private async analyzeProject(
    projectPath: string,
  ): Promise<ProjectDetectionResult | null> {
    try {
      const stats = await fs.promises.stat(projectPath);
      if (!stats.isDirectory()) {
        return null;
      }

      const projectName = path.basename(projectPath);
      const type = await this.detectProjectType(projectPath);
      const packageManager = await this.detectPackageManager(projectPath);
      const { framework, language } =
        await this.detectFrameworkAndLanguage(projectPath);
      const gitRemote = await this.getGitRemote(projectPath);
      const description = await this.getProjectDescription(projectPath);

      return {
        name: projectName,
        path: projectPath,
        type,
        packageManager,
        framework,
        language,
        gitRemote,
        description,
      };
    } catch (error) {
      logger.error(`Error analyzing project ${projectPath}:`, error);
      return null;
    }
  }

  private async detectProjectType(
    projectPath: string,
  ): Promise<Project['type']> {
    for (const [type, patterns] of Object.entries(this.detectionPatterns)) {
      let matches = 0;

      for (const pattern of patterns) {
        const filePath = path.join(projectPath, pattern.file);

        try {
          if (pattern.exists && fs.existsSync(filePath)) {
            matches++;
          } else if ('content' in pattern && fs.existsSync(filePath)) {
            const content = await fs.promises.readFile(filePath, 'utf-8');
            if (
              typeof pattern.content === 'object' &&
              pattern.content.test(content)
            ) {
              matches++;
            }
          }
        } catch (error) {
          // Ignore file read errors
        }
      }

      // If at least one pattern matches, consider it this type
      if (matches > 0) {
        return type as Project['type'];
      }
    }

    return 'other';
  }

  private async detectPackageManager(
    projectPath: string,
  ): Promise<Project['packageManager'] | undefined> {
    const lockFiles = {
      'yarn.lock': 'yarn' as const,
      'pnpm-lock.yaml': 'pnpm' as const,
      'bun.lockb': 'bun' as const,
      'package-lock.json': 'npm' as const,
    };

    for (const [lockFile, manager] of Object.entries(lockFiles)) {
      if (fs.existsSync(path.join(projectPath, lockFile))) {
        return manager;
      }
    }

    // Default to npm if package.json exists
    if (fs.existsSync(path.join(projectPath, 'package.json'))) {
      return 'npm';
    }

    return undefined;
  }

  private async detectFrameworkAndLanguage(
    projectPath: string,
  ): Promise<{ framework?: string; language?: string }> {
    const packageJsonPath = path.join(projectPath, 'package.json');

    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(
          await fs.promises.readFile(packageJsonPath, 'utf-8'),
        );
        const deps = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies,
        };

        // Detect framework
        let framework: string | undefined;
        if (deps.next) framework = 'Next.js';
        else if (deps.nuxt) framework = 'Nuxt.js';
        else if (deps['@angular/core']) framework = 'Angular';
        else if (deps.vue) framework = 'Vue.js';
        else if (deps.react) framework = 'React';
        else if (deps.express) framework = 'Express';
        else if (deps.fastify) framework = 'Fastify';
        else if (deps.nestjs) framework = 'NestJS';

        // Detect language
        let language: string | undefined;
        if (deps.typescript || deps['@types/node']) language = 'TypeScript';
        else if (fs.existsSync(path.join(projectPath, 'tsconfig.json')))
          language = 'TypeScript';
        else language = 'JavaScript';

        return { framework, language };
      } catch (error) {
        // Ignore JSON parse errors
      }
    }

    // Check for Python
    if (
      fs.existsSync(path.join(projectPath, 'requirements.txt')) ||
      fs.existsSync(path.join(projectPath, 'setup.py'))
    ) {
      return { language: 'Python' };
    }

    return {};
  }

  private async getGitRemote(projectPath: string): Promise<string | undefined> {
    const gitConfigPath = path.join(projectPath, '.git', 'config');

    if (fs.existsSync(gitConfigPath)) {
      try {
        const gitConfig = await fs.promises.readFile(gitConfigPath, 'utf-8');
        const remoteMatch = gitConfig.match(
          /\[remote "origin"\][\s\S]*?url = (.+)/i,
        );
        if (remoteMatch) {
          return remoteMatch[1].trim();
        }
      } catch (error) {
        // Ignore git config read errors
      }
    }

    return undefined;
  }

  private async getProjectDescription(
    projectPath: string,
  ): Promise<string | undefined> {
    const packageJsonPath = path.join(projectPath, 'package.json');

    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(
          await fs.promises.readFile(packageJsonPath, 'utf-8'),
        );
        return packageJson.description;
      } catch (error) {
        // Ignore JSON parse errors
      }
    }

    return undefined;
  }

  startWatching(
    directories: string[],
    onChange: (projects: ProjectDetectionResult[]) => void,
  ) {
    this.stopWatching();

    for (const directory of directories) {
      if (!fs.existsSync(directory)) {
        logger.warn(`Directory does not exist: ${directory}`);
        continue;
      }

      const watcher = chokidar.watch(directory, {
        ignored: /(^|[\/\\])\../, // ignore dotfiles
        persistent: true,
        ignoreInitial: true,
        depth: 3, // Limit depth to avoid performance issues
      });

      const handleChange = async () => {
        try {
          const projects = await this.scanDirectory(directory);
          onChange(projects);
        } catch (error) {
          logger.error(
            `Error handling file system change in ${directory}:`,
            error,
          );
        }
      };

      watcher
        .on('addDir', handleChange)
        .on('unlinkDir', handleChange)
        .on('add', (filePath) => {
          // Only trigger on important files
          const fileName = path.basename(filePath);
          if (
            ['package.json', 'requirements.txt', 'setup.py'].includes(fileName)
          ) {
            handleChange();
          }
        })
        .on('unlink', (filePath) => {
          const fileName = path.basename(filePath);
          if (
            ['package.json', 'requirements.txt', 'setup.py'].includes(fileName)
          ) {
            handleChange();
          }
        });

      this.watchers.set(directory, watcher);
      logger.info(`Started watching directory: ${directory}`);
    }
  }

  stopWatching() {
    for (const [directory, watcher] of this.watchers) {
      watcher.close();
      logger.info(`Stopped watching directory: ${directory}`);
    }
    this.watchers.clear();
  }

  isScanning(): boolean {
    return this.scanInProgress;
  }
}

let instance: ProjectScannerService | null = null;

export const getProjectScannerService = () => {
  if (!instance) {
    instance = new ProjectScannerService();
  }
  return instance;
};
