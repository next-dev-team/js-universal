import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'node:path';
import { getMainLogger } from '../../common/logger/main';

let logger: ReturnType<ReturnType<typeof getMainLogger>['scope']>;

export interface Project {
  id: string;
  name: string;
  path: string;
  type: 'react' | 'vue' | 'angular' | 'node' | 'python' | 'other';
  lastOpened: number;
  favorite: boolean;
  description?: string;
  tags: string[];
  gitRemote?: string;
  packageManager?: 'npm' | 'yarn' | 'pnpm' | 'bun';
  framework?: string;
  language?: string;
  createdAt: number;
  updatedAt: number;
}

export interface IDE {
  id: string;
  name: string;
  executablePath: string;
  arguments: string[];
  icon?: string;
  isDefault: boolean;
  supportedTypes: string[];
}

export interface AppSettings {
  id: string;
  theme: 'light' | 'dark' | 'system';
  autoScanDirectories: string[];
  defaultIDE: string;
  windowPosition: { x: number; y: number; width: number; height: number };
  showOnStartup: boolean;
  minimizeToTray: boolean;
}

export class DatabaseService {
  private db: Database.Database;
  private dbPath: string;

  constructor() {
    // Initialize logger when database service is created
    logger = getMainLogger().scope('database');

    const userDataPath = app.getPath('userData');
    this.dbPath = path.join(userDataPath, 'project-launcher.db');
    this.db = new Database(this.dbPath);
    this.initializeTables();
    logger.info(`Database initialized at: ${this.dbPath}`);
  }

  private initializeTables() {
    // Projects table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        path TEXT UNIQUE NOT NULL,
        type TEXT NOT NULL,
        lastOpened INTEGER NOT NULL,
        favorite INTEGER DEFAULT 0,
        description TEXT,
        tags TEXT DEFAULT '[]',
        gitRemote TEXT,
        packageManager TEXT,
        framework TEXT,
        language TEXT,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      )
    `);

    // IDEs table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS ides (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        executablePath TEXT NOT NULL,
        arguments TEXT DEFAULT '[]',
        icon TEXT,
        isDefault INTEGER DEFAULT 0,
        supportedTypes TEXT DEFAULT '[]'
      )
    `);

    // Settings table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        id TEXT PRIMARY KEY,
        theme TEXT DEFAULT 'system',
        autoScanDirectories TEXT DEFAULT '[]',
        defaultIDE TEXT,
        windowPosition TEXT,
        showOnStartup INTEGER DEFAULT 1,
        minimizeToTray INTEGER DEFAULT 0
      )
    `);

    // Create indexes
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_projects_lastOpened ON projects(lastOpened DESC);
      CREATE INDEX IF NOT EXISTS idx_projects_favorite ON projects(favorite DESC);
      CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(type);
    `);

    // Insert default settings if not exists
    const settingsExists = this.db
      .prepare('SELECT COUNT(*) as count FROM settings')
      .get() as { count: number };
    if (settingsExists.count === 0) {
      this.db
        .prepare(
          `
        INSERT INTO settings (id, theme, autoScanDirectories, showOnStartup, minimizeToTray)
        VALUES ('default', 'system', '[]', 1, 0)
      `,
        )
        .run();
    }
  }

  // Project methods
  addProject(
    project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>,
  ): Project {
    const id = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();
    const newProject: Project = {
      ...project,
      id,
      createdAt: now,
      updatedAt: now,
    };

    this.db
      .prepare(
        `
      INSERT INTO projects (
        id, name, path, type, lastOpened, favorite, description, tags,
        gitRemote, packageManager, framework, language, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      )
      .run(
        newProject.id,
        newProject.name,
        newProject.path,
        newProject.type,
        newProject.lastOpened,
        newProject.favorite ? 1 : 0,
        newProject.description,
        JSON.stringify(newProject.tags),
        newProject.gitRemote,
        newProject.packageManager,
        newProject.framework,
        newProject.language,
        newProject.createdAt,
        newProject.updatedAt,
      );

    logger.info(`Added project: ${newProject.name} at ${newProject.path}`);
    return newProject;
  }

  getProjects(): Project[] {
    const rows = this.db
      .prepare(
        `
      SELECT * FROM projects ORDER BY favorite DESC, lastOpened DESC
    `,
      )
      .all() as any[];

    return rows.map((row) => ({
      ...row,
      favorite: Boolean(row.favorite),
      tags: JSON.parse(row.tags || '[]'),
    }));
  }

  getProjectById(id: string): Project | null {
    const row = this.db
      .prepare('SELECT * FROM projects WHERE id = ?')
      .get(id) as any;
    if (!row) return null;

    return {
      ...row,
      favorite: Boolean(row.favorite),
      tags: JSON.parse(row.tags || '[]'),
    };
  }

  updateProject(id: string, updates: Partial<Project>): boolean {
    const { id: _, createdAt, ...updateData } = updates;
    const updatedAt = Date.now();

    const setClause = Object.keys(updateData)
      .map((key) => {
        if (key === 'favorite') return 'favorite = ?';
        if (key === 'tags') return 'tags = ?';
        return `${key} = ?`;
      })
      .join(', ');

    const values = Object.entries(updateData).map(([key, value]) => {
      if (key === 'favorite') return value ? 1 : 0;
      if (key === 'tags') return JSON.stringify(value);
      return value;
    });

    const result = this.db
      .prepare(
        `
      UPDATE projects SET ${setClause}, updatedAt = ? WHERE id = ?
    `,
      )
      .run(...values, updatedAt, id);

    return result.changes > 0;
  }

  deleteProject(id: string): boolean {
    const result = this.db.prepare('DELETE FROM projects WHERE id = ?').run(id);
    return result.changes > 0;
  }

  updateProjectLastOpened(id: string): boolean {
    const result = this.db
      .prepare(
        `
      UPDATE projects SET lastOpened = ?, updatedAt = ? WHERE id = ?
    `,
      )
      .run(Date.now(), Date.now(), id);
    return result.changes > 0;
  }

  // IDE methods
  addIDE(ide: Omit<IDE, 'id'>): IDE {
    const id = `ide_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newIDE: IDE = { ...ide, id };

    this.db
      .prepare(
        `
      INSERT INTO ides (id, name, executablePath, arguments, icon, isDefault, supportedTypes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      )
      .run(
        newIDE.id,
        newIDE.name,
        newIDE.executablePath,
        JSON.stringify(newIDE.arguments),
        newIDE.icon,
        newIDE.isDefault ? 1 : 0,
        JSON.stringify(newIDE.supportedTypes),
      );

    return newIDE;
  }

  getIDEs(): IDE[] {
    const rows = this.db
      .prepare('SELECT * FROM ides ORDER BY isDefault DESC, name')
      .all() as any[];
    return rows.map((row) => ({
      ...row,
      arguments: JSON.parse(row.arguments || '[]'),
      isDefault: Boolean(row.isDefault),
      supportedTypes: JSON.parse(row.supportedTypes || '[]'),
    }));
  }

  // Settings methods
  getSettings(): AppSettings {
    const row = this.db
      .prepare('SELECT * FROM settings WHERE id = "default"')
      .get() as any;
    return {
      ...row,
      autoScanDirectories: JSON.parse(row.autoScanDirectories || '[]'),
      windowPosition: row.windowPosition
        ? JSON.parse(row.windowPosition)
        : null,
      showOnStartup: Boolean(row.showOnStartup),
      minimizeToTray: Boolean(row.minimizeToTray),
    };
  }

  updateSettings(updates: Partial<AppSettings>): boolean {
    const { id, ...updateData } = updates;

    const setClause = Object.keys(updateData)
      .map((key) => {
        if (key === 'autoScanDirectories' || key === 'windowPosition')
          return `${key} = ?`;
        if (key === 'showOnStartup' || key === 'minimizeToTray')
          return `${key} = ?`;
        return `${key} = ?`;
      })
      .join(', ');

    const values = Object.entries(updateData).map(([key, value]) => {
      if (key === 'autoScanDirectories' || key === 'windowPosition')
        return JSON.stringify(value);
      if (key === 'showOnStartup' || key === 'minimizeToTray')
        return value ? 1 : 0;
      return value;
    });

    const result = this.db
      .prepare(
        `
      UPDATE settings SET ${setClause} WHERE id = "default"
    `,
      )
      .run(...values);

    return result.changes > 0;
  }

  close() {
    this.db.close();
    logger.info('Database connection closed');
  }
}

let instance: DatabaseService | null = null;

export const getDatabaseService = () => {
  if (!instance) {
    instance = new DatabaseService();
  }
  return instance;
};
