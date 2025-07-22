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
    // Projects table with complete schema
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL,
        path TEXT NOT NULL UNIQUE,
        tags TEXT DEFAULT '[]',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        lastOpenedAt DATETIME,
        isFavorite INTEGER DEFAULT 0,
        thumbnail TEXT,
        gitRepository TEXT,
        size INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active',
        metadata TEXT DEFAULT '{}'
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
      CREATE INDEX IF NOT EXISTS idx_projects_lastOpenedAt ON projects(lastOpenedAt DESC);
      CREATE INDEX IF NOT EXISTS idx_projects_isFavorite ON projects(isFavorite DESC);
      CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(type);
      CREATE INDEX IF NOT EXISTS idx_projects_updatedAt ON projects(updatedAt DESC);
      CREATE INDEX IF NOT EXISTS idx_projects_name ON projects(name);
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

  // Project CRUD operations
  createProject(project: {
    id: string;
    name: string;
    description?: string;
    type: string;
    path: string;
    tags?: string[];
    isFavorite?: boolean;
    thumbnail?: string;
    gitRepository?: string;
    size?: number;
    status?: string;
    metadata?: any;
  }) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO projects (
          id, name, description, type, path, tags, isFavorite, 
          thumbnail, gitRepository, size, status, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        project.id,
        project.name,
        project.description || null,
        project.type,
        project.path,
        JSON.stringify(project.tags || []),
        project.isFavorite ? 1 : 0,
        project.thumbnail || null,
        project.gitRepository || null,
        project.size || 0,
        project.status || 'active',
        JSON.stringify(project.metadata || {})
      );
      
      logger.info(`Project created: ${project.name}`);
      return this.getProjectById(project.id);
    } catch (error) {
      logger.error(`Failed to create project: ${error}`);
      throw error;
    }
  }

  getAllProjects() {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM projects 
        ORDER BY isFavorite DESC, lastOpenedAt DESC, updatedAt DESC
      `);
      const rows = stmt.all();
      
      return rows.map(this.mapProjectRow);
    } catch (error) {
      logger.error(`Failed to get all projects: ${error}`);
      throw error;
    }
  }

  getProjectById(id: string) {
    try {
      const stmt = this.db.prepare('SELECT * FROM projects WHERE id = ?');
      const row = stmt.get(id);
      
      return row ? this.mapProjectRow(row) : null;
    } catch (error) {
      logger.error(`Failed to get project by id: ${error}`);
      throw error;
    }
  }

  updateProject(id: string, updates: {
    name?: string;
    description?: string;
    tags?: string[];
    isFavorite?: boolean;
    lastOpenedAt?: Date;
    status?: string;
    metadata?: any;
  }) {
    try {
      const fields = [];
      const values = [];
      
      if (updates.name !== undefined) {
        fields.push('name = ?');
        values.push(updates.name);
      }
      if (updates.description !== undefined) {
        fields.push('description = ?');
        values.push(updates.description);
      }
      if (updates.tags !== undefined) {
        fields.push('tags = ?');
        values.push(JSON.stringify(updates.tags));
      }
      if (updates.isFavorite !== undefined) {
        fields.push('isFavorite = ?');
        values.push(updates.isFavorite ? 1 : 0);
      }
      if (updates.lastOpenedAt !== undefined) {
        fields.push('lastOpenedAt = ?');
        values.push(updates.lastOpenedAt.toISOString());
      }
      if (updates.status !== undefined) {
        fields.push('status = ?');
        values.push(updates.status);
      }
      if (updates.metadata !== undefined) {
        fields.push('metadata = ?');
        values.push(JSON.stringify(updates.metadata));
      }
      
      fields.push('updatedAt = CURRENT_TIMESTAMP');
      values.push(id);
      
      const stmt = this.db.prepare(`
        UPDATE projects SET ${fields.join(', ')} WHERE id = ?
      `);
      
      const result = stmt.run(...values);
      
      if (result.changes === 0) {
        throw new Error('Project not found');
      }
      
      logger.info(`Project updated: ${id}`);
      return this.getProjectById(id);
    } catch (error) {
      logger.error(`Failed to update project: ${error}`);
      throw error;
    }
  }

  deleteProject(id: string) {
    try {
      const stmt = this.db.prepare('DELETE FROM projects WHERE id = ?');
      const result = stmt.run(id);
      
      if (result.changes === 0) {
        throw new Error('Project not found');
      }
      
      logger.info(`Project deleted: ${id}`);
      return { deleted: true, id };
    } catch (error) {
      logger.error(`Failed to delete project: ${error}`);
      throw error;
    }
  }

  searchProjects(filters: {
    query?: string;
    type?: string;
    status?: string;
    isFavorite?: boolean;
    sortBy?: string;
    sortOrder?: string;
  }) {
    try {
      let sql = 'SELECT * FROM projects WHERE 1=1';
      const params: any[] = [];
      
      if (filters.query) {
        sql += ' AND (name LIKE ? OR description LIKE ? OR path LIKE ?)';
        const searchTerm = `%${filters.query}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }
      
      if (filters.type) {
        sql += ' AND type = ?';
        params.push(filters.type);
      }
      
      if (filters.status) {
        sql += ' AND status = ?';
        params.push(filters.status);
      }
      
      if (filters.isFavorite !== undefined) {
        sql += ' AND isFavorite = ?';
        params.push(filters.isFavorite ? 1 : 0);
      }
      
      // Add sorting
      const sortBy = filters.sortBy || 'updatedAt';
      const sortOrder = filters.sortOrder || 'desc';
      sql += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
      
      const stmt = this.db.prepare(sql);
      const rows = stmt.all(...params);
      
      return rows.map(this.mapProjectRow);
    } catch (error) {
      logger.error(`Failed to search projects: ${error}`);
      throw error;
    }
  }

  private mapProjectRow(row: any) {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      type: row.type,
      path: row.path,
      tags: JSON.parse(row.tags || '[]'),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      lastOpenedAt: row.lastOpenedAt ? new Date(row.lastOpenedAt) : undefined,
      isFavorite: Boolean(row.isFavorite),
      thumbnail: row.thumbnail,
      gitRepository: row.gitRepository,
      size: row.size,
      status: row.status,
      metadata: JSON.parse(row.metadata || '{}')
    };
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
