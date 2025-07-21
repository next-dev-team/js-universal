import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'node:path';
import { getMainLogger } from '../../common/logger/main';

let logger: ReturnType<ReturnType<typeof getMainLogger>['scope']>;

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
