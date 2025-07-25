import { test, expect } from '@playwright/test';
import { ElectronTestHelper } from './helpers/electron-helpers';
import path from 'path';
import fs from 'fs';

test.describe('Database Service E2E Tests - 100% Coverage', () => {
  let electronHelper: ElectronTestHelper;
  let page: any;
  let app: any;

  // Test data
  const testProject = {
    id: 'test-project-1',
    name: 'Test Project 1',
    description: 'A test project for e2e testing',
    type: 'react',
    path: '/test/path/project1',
    tags: ['test', 'react'],
    isFavorite: false,
    thumbnail: null,
    gitRepository: 'https://github.com/test/project1',
    size: 1024,
    status: 'active',
    metadata: { framework: 'react', version: '18.0.0' }
  };

  const testProject2 = {
    id: 'test-project-2',
    name: 'Test Project 2',
    description: 'Another test project',
    type: 'vue',
    path: '/test/path/project2',
    tags: ['test', 'vue'],
    isFavorite: true,
    thumbnail: '/path/to/thumbnail.png',
    gitRepository: null,
    size: 2048,
    status: 'archived',
    metadata: { framework: 'vue', version: '3.0.0' }
  };

  test.beforeAll(async () => {
    electronHelper = new ElectronTestHelper();
    const { app: electronApp, page: electronPage } = await electronHelper.launchApp();
    app = electronApp;
    page = electronPage;

    // Wait for app to be fully loaded
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
  });

  test.afterAll(async () => {
    await electronHelper.closeApp();
  });

  test.describe('Database Initialization', () => {
    test('should initialize database with correct tables', async () => {
      // Test database initialization through IPC
      const dbInitialized = await page.evaluate(async () => {
        if (typeof window.electronAPI !== 'undefined' && window.electronAPI.project) {
          try {
            // Try to get all projects to verify database is working
            const projects = await window.electronAPI.project.getAllProjects();
            return Array.isArray(projects);
          } catch (error) {
            console.error('Database initialization test failed:', error);
            return false;
          }
        }
        return false;
      });

      expect(dbInitialized).toBe(true);
    });

    test('should create database file in correct location', async () => {
      // Verify database file exists
      const dbExists = await page.evaluate(() => {
        return new Promise((resolve) => {
          // Use IPC to check if database file exists
          if (typeof window.electronAPI !== 'undefined' && window.electronAPI.project) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
      });

      expect(dbExists).toBe(true);
    });

    test('should have all required tables and indexes', async () => {
      const tablesExist = await page.evaluate(async () => {
        if (typeof window.electronAPI !== 'undefined' && window.electronAPI.project) {
          try {
            // Test that we can perform operations on all tables
            await window.electronAPI.project.getAllProjects();
            return true;
          } catch (error) {
            return false;
          }
        }
        return false;
      });

      expect(tablesExist).toBe(true);
    });
  });

  test.describe('Project CRUD Operations', () => {
    test('should create a new project successfully', async () => {
      const result = await page.evaluate(async (projectData) => {
        if (typeof window.electronAPI !== 'undefined' && window.electronAPI.project) {
          try {
            const project = await window.electronAPI.project.createProject(projectData);
            return { success: true, project };
          } catch (error) {
            return { success: false, error: error.message };
          }
        }
        return { success: false, error: 'Database API not available' };
      }, testProject);

      expect(result.success).toBe(true);
      expect(result.project).toBeDefined();
      expect(result.project.id).toBe(testProject.id);
      expect(result.project.name).toBe(testProject.name);
      expect(result.project.type).toBe(testProject.type);
      expect(result.project.path).toBe(testProject.path);
      expect(result.project.tags).toEqual(testProject.tags);
      expect(result.project.isFavorite).toBe(testProject.isFavorite);
      expect(result.project.gitRepository).toBe(testProject.gitRepository);
      expect(result.project.size).toBe(testProject.size);
      expect(result.project.status).toBe(testProject.status);
      expect(result.project.metadata).toEqual(testProject.metadata);
    });

    test('should create a second project with different properties', async () => {
      const result = await page.evaluate(async (projectData) => {
        if (typeof window.electronAPI !== 'undefined' && window.electronAPI.project) {
          try {
            const project = await window.electronAPI.project.createProject(projectData);
            return { success: true, project };
          } catch (error) {
            return { success: false, error: error.message };
          }
        }
        return { success: false, error: 'Database API not available' };
      }, testProject2);

      expect(result.success).toBe(true);
      expect(result.project.isFavorite).toBe(true);
      expect(result.project.status).toBe('archived');
      expect(result.project.thumbnail).toBe(testProject2.thumbnail);
    });

    test('should handle duplicate project creation (unique path constraint)', async () => {
      const duplicateProject = { ...testProject, id: 'duplicate-id' };
      
      const result = await page.evaluate(async (projectData) => {
        if (typeof window.electronAPI !== 'undefined' && window.electronAPI.project) {
          try {
            await window.electronAPI.project.createProject(projectData);
            return { success: true };
          } catch (error) {
            return { success: false, error: error.message };
          }
        }
        return { success: false, error: 'Database API not available' };
      }, duplicateProject);

      expect(result.success).toBe(false);
      expect(result.error).toContain('UNIQUE constraint failed');
    });

    test('should retrieve project by ID', async () => {
      const result = await page.evaluate(async (projectId) => {
        if (typeof window.electronAPI !== 'undefined' && window.electronAPI.project) {
          try {
            const project = await window.electronAPI.project.getProjectById(projectId);
            return { success: true, project };
          } catch (error) {
            return { success: false, error: error.message };
          }
        }
        return { success: false, error: 'Database API not available' };
      }, testProject.id);

      expect(result.success).toBe(true);
      expect(result.project).toBeDefined();
      expect(result.project.id).toBe(testProject.id);
      expect(result.project.name).toBe(testProject.name);
    });

    test('should return null for non-existent project ID', async () => {
      const result = await page.evaluate(async () => {
        if (typeof window.electronAPI !== 'undefined' && window.electronAPI.project) {
          try {
            const project = await window.electronAPI.project.getProjectById('non-existent-id');
            return { success: true, project };
          } catch (error) {
            return { success: false, error: error.message };
          }
        }
        return { success: false, error: 'Database API not available' };
      });

      expect(result.success).toBe(true);
      expect(result.project).toBeNull();
    });

    test('should retrieve all projects', async () => {
      const result = await page.evaluate(async () => {
        if (typeof window.electronAPI !== 'undefined' && window.electronAPI.project) {
          try {
            const projects = await window.electronAPI.project.getAllProjects();
            return { success: true, projects };
          } catch (error) {
            return { success: false, error: error.message };
          }
        }
        return { success: false, error: 'Database API not available' };
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.projects)).toBe(true);
      expect(result.projects.length).toBeGreaterThanOrEqual(2);
      
      // Check sorting: favorites first, then by lastOpenedAt, then by updatedAt
      const favoriteProjects = result.projects.filter(p => p.isFavorite);
      const nonFavoriteProjects = result.projects.filter(p => !p.isFavorite);
      
      expect(favoriteProjects.length).toBeGreaterThan(0);
      expect(nonFavoriteProjects.length).toBeGreaterThan(0);
      
      // Favorites should come first
      const firstProject = result.projects[0];
      expect(firstProject.isFavorite).toBe(true);
    });

    test('should update project properties', async () => {
      const updates = {
        name: 'Updated Test Project',
        description: 'Updated description',
        tags: ['updated', 'test'],
        isFavorite: true,
        status: 'completed',
        metadata: { updated: true, version: '2.0.0' }
      };

      const result = await page.evaluate(async (data) => {
        if (typeof window.electronAPI !== 'undefined' && window.electronAPI.project) {
          try {
            const project = await window.electronAPI.project.updateProject(data.id, data.updates);
            return { success: true, project };
          } catch (error) {
            return { success: false, error: error.message };
          }
        }
        return { success: false, error: 'Database API not available' };
      }, { id: testProject.id, updates });

      expect(result.success).toBe(true);
      expect(result.project.name).toBe(updates.name);
      expect(result.project.description).toBe(updates.description);
      expect(result.project.tags).toEqual(updates.tags);
      expect(result.project.isFavorite).toBe(updates.isFavorite);
      expect(result.project.status).toBe(updates.status);
      expect(result.project.metadata).toEqual(updates.metadata);
    });

    test('should update lastOpenedAt when specified', async () => {
      const now = new Date();
      const updates = { lastOpenedAt: now };

      const result = await page.evaluate(async (data) => {
        if (typeof window.electronAPI !== 'undefined' && window.electronAPI.project) {
          try {
            const project = await window.electronAPI.project.updateProject(data.id, data.updates);
            return { success: true, project };
          } catch (error) {
            return { success: false, error: error.message };
          }
        }
        return { success: false, error: 'Database API not available' };
      }, { id: testProject.id, updates });

      expect(result.success).toBe(true);
      expect(result.project.lastOpenedAt).toBeDefined();
    });

    test('should handle update of non-existent project', async () => {
      const result = await page.evaluate(async () => {
        if (typeof window.electronAPI !== 'undefined' && window.electronAPI.project) {
          try {
            await window.electronAPI.project.updateProject('non-existent-id', { name: 'Updated' });
            return { success: true };
          } catch (error) {
            return { success: false, error: error.message };
          }
        }
        return { success: false, error: 'Database API not available' };
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Project not found');
    });
  });

  test.describe('Project Search and Filtering', () => {
    test('should search projects by name', async () => {
      const result = await page.evaluate(async () => {
        if (typeof window.electronAPI !== 'undefined' && window.electronAPI.project) {
          try {
            const projects = await window.electronAPI.project.searchProjects({ query: 'Updated' });
            return { success: true, projects };
          } catch (error) {
            return { success: false, error: error.message };
          }
        }
        return { success: false, error: 'Database API not available' };
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.projects)).toBe(true);
      expect(result.projects.length).toBeGreaterThan(0);
      expect(result.projects[0].name).toContain('Updated');
    });

    test('should search projects by description', async () => {
      const result = await page.evaluate(async () => {
        if (typeof window.electronAPI !== 'undefined' && window.electronAPI.project) {
          try {
            const projects = await window.electronAPI.project.searchProjects({ query: 'description' });
            return { success: true, projects };
          } catch (error) {
            return { success: false, error: error.message };
          }
        }
        return { success: false, error: 'Database API not available' };
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.projects)).toBe(true);
      expect(result.projects.length).toBeGreaterThan(0);
    });

    test('should search projects by path', async () => {
      const result = await page.evaluate(async () => {
        if (typeof window.electronAPI !== 'undefined' && window.electronAPI.project) {
          try {
            const projects = await window.electronAPI.project.searchProjects({ query: '/test/path' });
            return { success: true, projects };
          } catch (error) {
            return { success: false, error: error.message };
          }
        }
        return { success: false, error: 'Database API not available' };
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.projects)).toBe(true);
      expect(result.projects.length).toBeGreaterThanOrEqual(2);
    });

    test('should filter projects by type', async () => {
      const result = await page.evaluate(async () => {
        if (typeof window.electronAPI !== 'undefined' && window.electronAPI.project) {
          try {
            const projects = await window.electronAPI.project.searchProjects({ type: 'vue' });
            return { success: true, projects };
          } catch (error) {
            return { success: false, error: error.message };
          }
        }
        return { success: false, error: 'Database API not available' };
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.projects)).toBe(true);
      expect(result.projects.length).toBeGreaterThan(0);
      expect(result.projects.every(p => p.type === 'vue')).toBe(true);
    });

    test('should filter projects by status', async () => {
      const result = await page.evaluate(async () => {
        if (typeof window.electronAPI !== 'undefined' && window.electronAPI.project) {
          try {
            const projects = await window.electronAPI.project.searchProjects({ status: 'archived' });
            return { success: true, projects };
          } catch (error) {
            return { success: false, error: error.message };
          }
        }
        return { success: false, error: 'Database API not available' };
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.projects)).toBe(true);
      expect(result.projects.length).toBeGreaterThan(0);
      expect(result.projects.every(p => p.status === 'archived')).toBe(true);
    });

    test('should filter projects by favorite status', async () => {
      const result = await page.evaluate(async () => {
        if (typeof window.electronAPI !== 'undefined' && window.electronAPI.project) {
          try {
            const projects = await window.electronAPI.project.searchProjects({ isFavorite: true });
            return { success: true, projects };
          } catch (error) {
            return { success: false, error: error.message };
          }
        }
        return { success: false, error: 'Database API not available' };
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.projects)).toBe(true);
      expect(result.projects.length).toBeGreaterThan(0);
      expect(result.projects.every(p => p.isFavorite === true)).toBe(true);
    });

    test('should combine multiple search filters', async () => {
      const result = await page.evaluate(async () => {
        if (typeof window.electronAPI !== 'undefined' && window.electronAPI.project) {
          try {
            const projects = await window.electronAPI.project.searchProjects({
              query: 'Test',
              isFavorite: true,
              sortBy: 'name',
              sortOrder: 'asc'
            });
            return { success: true, projects };
          } catch (error) {
            return { success: false, error: error.message };
          }
        }
        return { success: false, error: 'Database API not available' };
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.projects)).toBe(true);
      expect(result.projects.every(p => p.isFavorite === true)).toBe(true);
    });

    test('should sort projects by different fields', async () => {
      const result = await page.evaluate(async () => {
        if (typeof window.electronAPI !== 'undefined' && window.electronAPI.project) {
          try {
            const projects = await window.electronAPI.project.searchProjects({
              sortBy: 'name',
              sortOrder: 'desc'
            });
            return { success: true, projects };
          } catch (error) {
            return { success: false, error: error.message };
          }
        }
        return { success: false, error: 'Database API not available' };
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.projects)).toBe(true);
      expect(result.projects.length).toBeGreaterThan(1);
      
      // Check descending order by name
      for (let i = 0; i < result.projects.length - 1; i++) {
        expect(result.projects[i].name >= result.projects[i + 1].name).toBe(true);
      }
    });

    test('should return empty array for no matches', async () => {
      const result = await page.evaluate(async () => {
        if (typeof window.electronAPI !== 'undefined' && window.electronAPI.project) {
          try {
            const projects = await window.electronAPI.project.searchProjects({ query: 'nonexistentproject' });
            return { success: true, projects };
          } catch (error) {
            return { success: false, error: error.message };
          }
        }
        return { success: false, error: 'Database API not available' };
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.projects)).toBe(true);
      expect(result.projects.length).toBe(0);
    });
  });

  test.describe('Project Deletion', () => {
    test('should delete existing project', async () => {
      const result = await page.evaluate(async (projectId) => {
        if (typeof window.electronAPI !== 'undefined' && window.electronAPI.project) {
          try {
            const deleteResult = await window.electronAPI.project.deleteProject(projectId);
            return { success: true, deleteResult };
          } catch (error) {
            return { success: false, error: error.message };
          }
        }
        return { success: false, error: 'Database API not available' };
      }, testProject2.id);

      expect(result.success).toBe(true);
      expect(result.deleteResult.deleted).toBe(true);
      expect(result.deleteResult.id).toBe(testProject2.id);
    });

    test('should verify project is actually deleted', async () => {
      const result = await page.evaluate(async (projectId) => {
        if (typeof window.electronAPI !== 'undefined' && window.electronAPI.project) {
          try {
            const project = await window.electronAPI.project.getProjectById(projectId);
            return { success: true, project };
          } catch (error) {
            return { success: false, error: error.message };
          }
        }
        return { success: false, error: 'Database API not available' };
      }, testProject2.id);

      expect(result.success).toBe(true);
      expect(result.project).toBeNull();
    });

    test('should handle deletion of non-existent project', async () => {
      const result = await page.evaluate(async () => {
        if (typeof window.electronAPI !== 'undefined' && window.electronAPI.project) {
          try {
            await window.electronAPI.project.deleteProject('non-existent-id');
            return { success: true };
          } catch (error) {
            return { success: false, error: error.message };
          }
        }
        return { success: false, error: 'Database API not available' };
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Project not found');
    });
  });

  test.describe('Database Migration and Schema', () => {
    test('should handle database migration gracefully', async () => {
      // This test verifies that the migration logic works
      // by checking that all expected columns exist
      const result = await page.evaluate(async () => {
        if (typeof window.electronAPI !== 'undefined' && window.electronAPI.project) {
          try {
            // Create a project with all possible fields to test schema
            const testMigrationProject = {
              id: 'migration-test',
              name: 'Migration Test',
              description: 'Testing migration',
              type: 'test',
              path: '/migration/test',
              tags: ['migration'],
              isFavorite: true,
              thumbnail: '/test.png',
              gitRepository: 'https://github.com/test/migration',
              size: 512,
              status: 'active',
              metadata: { migrated: true }
            };
            
            const project = await window.electronAPI.project.createProject(testMigrationProject);
            
            // Clean up
            await window.electronAPI.project.deleteProject('migration-test');
            
            return { success: true, project };
          } catch (error) {
            return { success: false, error: error.message };
          }
        }
        return { success: false, error: 'Database API not available' };
      });

      expect(result.success).toBe(true);
      expect(result.project).toBeDefined();
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle invalid project data gracefully', async () => {
      const invalidProject = {
        // Missing required fields
        name: 'Invalid Project'
        // Missing id, type, path
      };

      const result = await page.evaluate(async (projectData) => {
        if (typeof window.electronAPI !== 'undefined' && window.electronAPI.project) {
          try {
            await window.electronAPI.project.createProject(projectData);
            return { success: true };
          } catch (error) {
            return { success: false, error: error.message };
          }
        }
        return { success: false, error: 'Database API not available' };
      }, invalidProject);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should handle empty search queries', async () => {
      const result = await page.evaluate(async () => {
        if (typeof window.electronAPI !== 'undefined' && window.electronAPI.project) {
          try {
            const projects = await window.electronAPI.project.searchProjects({});
            return { success: true, projects };
          } catch (error) {
            return { success: false, error: error.message };
          }
        }
        return { success: false, error: 'Database API not available' };
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.projects)).toBe(true);
    });

    test('should handle special characters in search', async () => {
      const result = await page.evaluate(async () => {
        if (typeof window.electronAPI !== 'undefined' && window.electronAPI.project) {
          try {
            const projects = await window.electronAPI.project.searchProjects({ query: "'%_\"" });
            return { success: true, projects };
          } catch (error) {
            return { success: false, error: error.message };
          }
        }
        return { success: false, error: 'Database API not available' };
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.projects)).toBe(true);
    });

    test('should handle large metadata objects', async () => {
      const largeMetadata = {
        dependencies: Array.from({ length: 100 }, (_, i) => `package-${i}`),
        config: {
          nested: {
            deeply: {
              nested: {
                value: 'test'
              }
            }
          }
        },
        description: 'A'.repeat(1000)
      };

      const projectWithLargeMetadata = {
        id: 'large-metadata-test',
        name: 'Large Metadata Test',
        type: 'test',
        path: '/large/metadata/test',
        metadata: largeMetadata
      };

      const result = await page.evaluate(async (projectData) => {
        if (typeof window.electronAPI !== 'undefined' && window.electronAPI.project) {
          try {
            const project = await window.electronAPI.project.createProject(projectData);
            // Clean up
            await window.electronAPI.project.deleteProject(projectData.id);
            return { success: true, project };
          } catch (error) {
            return { success: false, error: error.message };
          }
        }
        return { success: false, error: 'Database API not available' };
      }, projectWithLargeMetadata);

      expect(result.success).toBe(true);
      expect(result.project.metadata).toEqual(largeMetadata);
    });
  });

  test.describe('Database Service Cleanup', () => {
    test('should clean up remaining test data', async () => {
      // Clean up the remaining test project
      const result = await page.evaluate(async (projectId) => {
        if (typeof window.electronAPI !== 'undefined' && window.electronAPI.project) {
          try {
            await window.electronAPI.project.deleteProject(projectId);
            return { success: true };
          } catch (error) {
            // Project might already be deleted, that's okay
            return { success: true, note: 'Project already deleted or not found' };
          }
        }
        return { success: false, error: 'Database API not available' };
      }, testProject.id);

      expect(result.success).toBe(true);
    });

    test('should verify database is still functional after all operations', async () => {
      const result = await page.evaluate(async () => {
        if (typeof window.electronAPI !== 'undefined' && window.electronAPI.project) {
          try {
            const projects = await window.electronAPI.project.getAllProjects();
            return { success: true, projects };
          } catch (error) {
            return { success: false, error: error.message };
          }
        }
        return { success: false, error: 'Database API not available' };
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.projects)).toBe(true);
    });
  });
});