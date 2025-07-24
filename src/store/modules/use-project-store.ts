import { createStore, useStore } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type {
  IDE,
  Project,
  ProjectCreateRequest,
  ProjectSearchFilters,
  ProjectStats,
  ProjectTemplate,
  ProjectType,
  ProjectUpdateRequest,
  QuickAction,
} from '@/types/project';

// IPC API for communicating with Electron main process
const ipcApi = {
  createProject: (projectData: any) =>
    window.electronAPI?.project?.createProject?.(projectData) ||
    Promise.reject('API not available'),
  getAllProjects: () =>
    window.electronAPI?.project?.getAllProjects?.() || Promise.resolve([]),
  getProjectById: (id: string) =>
    window.electronAPI?.project?.getProjectById?.(id) || Promise.resolve(null),
  updateProject: (id: string, updates: any) =>
    window.electronAPI?.project?.updateProject?.(id, updates) ||
    Promise.reject('API not available'),
  deleteProject: (id: string) =>
    window.electronAPI?.project?.deleteProject?.(id) || Promise.resolve(false),
  searchProjects: (filters: any) =>
    window.electronAPI?.project?.searchProjects?.(filters?.query || '') ||
    Promise.resolve([]),
  toggleFavorite: (id: string) =>
    window.electronAPI?.project?.toggleFavorite?.(id) ||
    Promise.reject('API not available'),
  openProject: (id: string, ideId?: string) =>
    window.electronAPI?.project?.openProject?.(id, ideId) ||
    Promise.reject('API not available'),
  addExistingProject: (folderPath: string) =>
    window.electronAPI?.project?.addExistingProject?.(folderPath) ||
    Promise.reject('API not available'),
  selectFolder: () =>
    window.electronAPI?.project?.selectFolder?.() || Promise.resolve(null),
  openInExplorer: (path: string) =>
    window.electronAPI?.project?.openInExplorer?.(path) ||
    Promise.resolve(false),
  openInTerminal: (path: string) =>
    window.electronAPI?.project?.openInTerminal?.(path) ||
    Promise.resolve(false),
  openInIDE: (path: string, ideId: string) =>
    window.electronAPI?.project?.openInIDE?.(path, ideId) ||
    Promise.resolve(false),
  getAvailableIDEs: () =>
    window.electronAPI?.project?.getAvailableIDEs?.() || Promise.resolve([]),
};

type State = {
  projects: Project[];
  templates: ProjectTemplate[];
  quickActions: QuickAction[];
  ides: IDE[];
  filters: ProjectSearchFilters;
  selectedProject?: Project;
  isLoading: boolean;
  error?: string;
};

type Actions = {
  // Project CRUD operations
  loadProjects: () => Promise<void>;
  createProject: (request: ProjectCreateRequest) => Promise<Project>;
  updateProject: (request: ProjectUpdateRequest) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;

  // Project operations
  searchProjects: (filters: ProjectSearchFilters) => Project[];
  toggleFavorite: (id: string) => Promise<void>;
  openProject: (id: string, ideId?: string) => Promise<void>;

  // New project operations
  openExistingProject: () => Promise<Project | null>;
  addExistingProject: (folderPath: string) => Promise<Project>;
  openProjectInExplorer: (projectPath: string) => Promise<void>;
  openProjectInTerminal: (projectPath: string) => Promise<void>;
  openProjectInIDE: (projectPath: string, ideId?: string) => Promise<void>;

  // Filter operations
  setFilters: (filters: Partial<ProjectSearchFilters>) => void;
  clearFilters: () => void;

  // Utility operations
  getProjectStats: () => ProjectStats;
  setSelectedProject: (project?: Project) => void;
  setLoading: (loading: boolean) => void;
  setError: (error?: string) => void;

  // Template operations
  loadTemplates: () => Promise<void>;

  // Quick actions and IDE operations
  loadQuickActions: () => Promise<void>;
  loadIDEs: () => Promise<void>;
};

type ProjectStore = State & Actions;

const defaultFilters: ProjectSearchFilters = {
  query: '',
  sortBy: 'updatedAt',
  sortOrder: 'desc',
};

const mockTemplates: ProjectTemplate[] = [
  {
    id: 'react-ts',
    name: 'React + TypeScript',
    description: 'Modern React application with TypeScript and Vite',
    type: 'react',
    files: [],
    dependencies: [
      'react',
      'react-dom',
      '@types/react',
      '@types/react-dom',
      'typescript',
      'vite',
    ],
  },
  {
    id: 'nodejs-express',
    name: 'Node.js + Express',
    description: 'RESTful API with Express and TypeScript',
    type: 'nodejs',
    files: [],
    dependencies: ['express', '@types/express', 'typescript', 'ts-node'],
  },
];

const mockQuickActions: QuickAction[] = [
  {
    id: 'open-vscode',
    label: 'Open in VS Code',
    icon: '🔵',
    command: 'code',
    args: ['.'],
    workingDirectory: undefined,
    requiresProject: true,
    projectTypes: [
      'web',
      'react',
      'vue',
      'angular',
      'nodejs',
      'python',
      'typescript',
    ],
  },
  {
    id: 'open-cursor',
    label: 'Open in Cursor',
    icon: '⚡',
    command: 'cursor',
    args: ['.'],
    workingDirectory: undefined,
    requiresProject: true,
    projectTypes: [
      'web',
      'react',
      'vue',
      'angular',
      'nodejs',
      'python',
      'typescript',
    ],
  },
  {
    id: 'open-windsurf',
    label: 'Open in Windsurf',
    icon: '🌊',
    command: 'windsurf',
    args: ['.'],
    workingDirectory: undefined,
    requiresProject: true,
    projectTypes: ['web', 'react', 'vue', 'angular', 'nodejs', 'python'],
  },
  {
    id: 'open-trae',
    label: 'Open in Trae AI',
    icon: '🤖',
    command: 'trae',
    args: ['.'],
    workingDirectory: undefined,
    requiresProject: true,
    projectTypes: [
      'web',
      'react',
      'vue',
      'angular',
      'nodejs',
      'python',
      'typescript',
    ],
  },
  {
    id: 'open-terminal',
    label: 'Open Terminal',
    icon: '💻',
    command: 'cmd',
    args: ['/c', 'start'],
    workingDirectory: undefined,
    requiresProject: true,
    projectTypes: [
      'web',
      'react',
      'vue',
      'angular',
      'nodejs',
      'python',
      'typescript',
    ],
  },
  {
    id: 'open-explorer',
    label: 'Open in Explorer',
    icon: '📁',
    command: 'explorer',
    args: [],
    workingDirectory: undefined,
    requiresProject: true,
    projectTypes: [
      'web',
      'react',
      'vue',
      'angular',
      'nodejs',
      'python',
      'typescript',
    ],
  },
  {
    id: 'open-browser',
    label: 'Open in Browser',
    icon: '🌐',
    command: 'start',
    args: ['http://localhost:3000'],
    workingDirectory: undefined,
    requiresProject: true,
    projectTypes: ['web', 'react', 'vue', 'angular'],
  },
  {
    id: 'edit-monaco',
    label: 'Edit in Monaco',
    icon: '📝',
    command: 'internal:monaco',
    args: [],
    workingDirectory: undefined,
    requiresProject: true,
    projectTypes: [
      'web',
      'react',
      'vue',
      'angular',
      'nodejs',
      'python',
      'typescript',
    ],
  },
];

const mockIDEs: IDE[] = [
  {
    id: 'vscode',
    name: 'Visual Studio Code',
    executable: 'code',
    args: ['.'],
    icon: '🔵',
    supportedTypes: [
      'web',
      'react',
      'vue',
      'angular',
      'nodejs',
      'python',
      'typescript',
    ],
  },
  {
    id: 'cursor',
    name: 'Cursor',
    executable: 'cursor',
    args: ['.'],
    icon: '⚡',
    supportedTypes: [
      'web',
      'react',
      'vue',
      'angular',
      'nodejs',
      'python',
      'typescript',
    ],
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    executable: 'windsurf',
    args: ['.'],
    icon: '🌊',
    supportedTypes: ['web', 'react', 'vue', 'angular', 'nodejs', 'python'],
  },
  {
    id: 'trae',
    name: 'Trae AI',
    executable: 'trae',
    args: ['.'],
    icon: '🤖',
    supportedTypes: [
      'web',
      'react',
      'vue',
      'angular',
      'nodejs',
      'python',
      'typescript',
    ],
  },
  {
    id: 'webstorm',
    name: 'WebStorm',
    executable: 'webstorm',
    args: ['.'],
    icon: '🟡',
    supportedTypes: ['web', 'react', 'vue', 'angular', 'nodejs'],
  },
];

export const projectStore = createStore<ProjectStore>()(
  immer((set, get) => ({
    // Initial state
    projects: [],
    templates: [],
    quickActions: [],
    ides: [],
    filters: defaultFilters,
    selectedProject: undefined,
    isLoading: false,
    error: undefined,

    // Project CRUD operations
    loadProjects: async () => {
      set((state) => {
        state.isLoading = true;
        state.error = undefined;
      });

      try {
        const projects = await ipcApi.getAllProjects();

        set((state) => {
          state.projects = projects;
          state.isLoading = false;
        });
      } catch (error) {
        console.error('Failed to load projects:', error);
        set((state) => {
          state.error =
            error instanceof Error ? error.message : 'Failed to load projects';
          state.isLoading = false;
        });
      }
    },

    createProject: async (request: ProjectCreateRequest): Promise<Project> => {
      set((state) => {
        state.isLoading = true;
        state.error = undefined;
      });

      try {
        const newProject = await ipcApi.createProject({
          name: request.name,
          description: request.description,
          type: request.type,
          path: request.path,
          tags: request.tags || [],
          isFavorite: false,
          metadata: request.metadata || {},
        });

        set((state) => {
          state.projects.unshift(newProject);
          state.isLoading = false;
        });

        return newProject;
      } catch (error) {
        console.error('Failed to create project:', error);
        set((state) => {
          state.error =
            error instanceof Error ? error.message : 'Failed to create project';
          state.isLoading = false;
        });
        throw error;
      }
    },

    updateProject: async (request: ProjectUpdateRequest): Promise<Project> => {
      set((state) => {
        state.isLoading = true;
        state.error = undefined;
      });

      try {
        const updatedProject = await ipcApi.updateProject(request.id, request);

        set((state) => {
          const index = state.projects.findIndex((p) => p.id === request.id);
          if (index !== -1) {
            state.projects[index] = updatedProject;
          }
          state.isLoading = false;
        });

        return updatedProject;
      } catch (error) {
        console.error('Failed to update project:', error);
        set((state) => {
          state.error =
            error instanceof Error ? error.message : 'Failed to update project';
          state.isLoading = false;
        });
        throw error;
      }
    },

    deleteProject: async (id: string): Promise<void> => {
      set((state) => {
        state.isLoading = true;
        state.error = undefined;
      });

      try {
        await ipcApi.deleteProject(id);

        set((state) => {
          state.projects = state.projects.filter((p) => p.id !== id);
          if (state.selectedProject?.id === id) {
            state.selectedProject = undefined;
          }
          state.isLoading = false;
        });
      } catch (error) {
        console.error('Failed to delete project:', error);
        set((state) => {
          state.error =
            error instanceof Error ? error.message : 'Failed to delete project';
          state.isLoading = false;
        });
        throw error;
      }
    },

    // Project operations
    searchProjects: (filters: ProjectSearchFilters): Project[] => {
      const { projects } = get();
      let filtered = [...projects];

      // Apply text search
      if (filters.query) {
        const query = filters.query.toLowerCase();
        filtered = filtered.filter(
          (project) =>
            project.name.toLowerCase().includes(query) ||
            project.description?.toLowerCase().includes(query) ||
            project.tags.some((tag) => tag.toLowerCase().includes(query)),
        );
      }

      // Apply type filter
      if (filters.type) {
        filtered = filtered.filter((project) => project.type === filters.type);
      }

      // Apply status filter
      if (filters.status) {
        filtered = filtered.filter(
          (project) => project.status === filters.status,
        );
      }

      // Apply favorite filter
      if (filters.isFavorite !== undefined) {
        filtered = filtered.filter(
          (project) => project.isFavorite === filters.isFavorite,
        );
      }

      // Apply tags filter
      if (filters.tags && filters.tags.length > 0) {
        filtered = filtered.filter((project) =>
          filters.tags!.some((tag) => project.tags.includes(tag)),
        );
      }

      // Apply sorting
      if (filters.sortBy) {
        filtered.sort((a, b) => {
          const aValue = a[filters.sortBy!];
          const bValue = b[filters.sortBy!];

          if (aValue instanceof Date && bValue instanceof Date) {
            const result = aValue.getTime() - bValue.getTime();
            return filters.sortOrder === 'desc' ? -result : result;
          }

          if (typeof aValue === 'string' && typeof bValue === 'string') {
            const result = aValue.localeCompare(bValue);
            return filters.sortOrder === 'desc' ? -result : result;
          }

          if (typeof aValue === 'number' && typeof bValue === 'number') {
            const result = aValue - bValue;
            return filters.sortOrder === 'desc' ? -result : result;
          }

          return 0;
        });
      }

      return filtered;
    },

    toggleFavorite: async (id: string): Promise<void> => {
      try {
        await ipcApi.toggleFavorite(id);

        set((state) => {
          const project = state.projects.find((p) => p.id === id);
          if (project) {
            project.isFavorite = !project.isFavorite;
            project.updatedAt = new Date();
          }
        });
      } catch (error) {
        console.error('Failed to toggle favorite:', error);
        set((state) => {
          state.error =
            error instanceof Error
              ? error.message
              : 'Failed to toggle favorite';
        });
        throw error;
      }
    },

    openProject: async (id: string, ideId?: string): Promise<void> => {
      try {
        const updatedProject = await ipcApi.openProject(id, ideId);

        set((state) => {
          const index = state.projects.findIndex((p) => p.id === id);
          if (index !== -1) {
            state.projects[index] = updatedProject;
          }
          state.selectedProject = updatedProject;
          state.error = undefined;
        });
      } catch (error) {
        console.error('Failed to open project:', error);
        set((state) => {
          state.error =
            error instanceof Error ? error.message : 'Failed to open project';
        });
        throw error;
      }
    },

    // Filter operations
    setFilters: (filters: Partial<ProjectSearchFilters>) => {
      set((state) => {
        state.filters = { ...state.filters, ...filters };
      });
    },

    clearFilters: () => {
      set((state) => {
        state.filters = defaultFilters;
      });
    },

    // Utility operations
    getProjectStats: (): ProjectStats => {
      const { projects } = get();

      const projectsByType = projects.reduce(
        (acc, project) => {
          acc[project.type] = (acc[project.type] || 0) + 1;
          return acc;
        },
        {} as Record<ProjectType, number>,
      );

      const recentProjects = projects
        .filter((p) => p.lastOpenedAt)
        .sort((a, b) => b.lastOpenedAt!.getTime() - a.lastOpenedAt!.getTime())
        .slice(0, 5);

      const favoriteProjects = projects.filter((p) => p.isFavorite);

      const totalSize = projects.reduce(
        (acc, project) => acc + (project.size || 0),
        0,
      );

      return {
        totalProjects: projects.length,
        projectsByType,
        recentProjects,
        favoriteProjects,
        totalSize,
      };
    },

    setSelectedProject: (project?: Project) => {
      set((state) => {
        state.selectedProject = project;
      });
    },

    setLoading: (loading: boolean) => {
      set((state) => {
        state.isLoading = loading;
      });
    },

    setError: (error?: string) => {
      set((state) => {
        state.error = error;
      });
    },

    // Template operations
    loadTemplates: async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 300));

        set((state) => {
          state.templates = mockTemplates;
        });
      } catch (error) {
        set((state) => {
          state.error =
            error instanceof Error ? error.message : 'Failed to load templates';
        });
      }
    },

    // Quick actions and IDE operations
    loadQuickActions: async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 200));

        set((state) => {
          state.quickActions = mockQuickActions;
        });
      } catch (error) {
        set((state) => {
          state.error =
            error instanceof Error
              ? error.message
              : 'Failed to load quick actions';
        });
      }
    },

    loadIDEs: async () => {
      try {
        const availableIDEs = await ipcApi.getAvailableIDEs();

        set((state) => {
          state.ides = [...availableIDEs];
          state.error = undefined;
        });
      } catch (error) {
        console.error('Failed to load IDEs:', error);
        // Fallback to mock IDEs if real ones fail to load
        set((state) => {
          state.ides = mockIDEs;
          state.error =
            error instanceof Error ? error.message : 'Failed to load IDEs';
        });
      }
    },

    // New project operations
    openExistingProject: async (): Promise<Project | null> => {
      try {
        set((state) => {
          state.isLoading = true;
          state.error = undefined;
        });

        const folderResult = await ipcApi.selectFolder();

        if (!folderResult || !folderResult.path) {
          set((state) => {
            state.isLoading = false;
          });
          return null;
        }

        // Check if project already exists
        const existingProject = get().projects.find(
          (p) => p.path === folderResult.path,
        );
        if (existingProject) {
          set((state) => {
            state.isLoading = false;
          });
          return existingProject;
        }

        // Add existing project to database
        const newProject = await ipcApi.addExistingProject(folderResult.path);

        set((state) => {
          state.projects.unshift(newProject);
          state.isLoading = false;
          state.error = undefined;
        });

        return newProject;
      } catch (error) {
        set((state) => {
          state.error =
            error instanceof Error
              ? error.message
              : 'Failed to open existing project';
          state.isLoading = false;
        });
        throw error;
      }
    },

    addExistingProject: async (folderPath: string): Promise<Project> => {
      try {
        set((state) => {
          state.isLoading = true;
          state.error = undefined;
        });

        // Check if project already exists
        const existingProject = get().projects.find(
          (p) => p.path === folderPath,
        );
        if (existingProject) {
          set((state) => {
            state.isLoading = false;
          });
          return existingProject;
        }

        // Add existing project to database
        const newProject = await ipcApi.addExistingProject(folderPath);

        set((state) => {
          state.projects.unshift(newProject);
          state.isLoading = false;
          state.error = undefined;
        });

        return newProject;
      } catch (error) {
        console.error('Failed to add existing project:', error);
        set((state) => {
          state.error =
            error instanceof Error
              ? error.message
              : 'Failed to add existing project';
          state.isLoading = false;
        });
        throw error;
      }
    },

    openProjectInExplorer: async (projectPath: string): Promise<void> => {
      try {
        await ipcApi.openInExplorer(projectPath);
      } catch (error) {
        console.error('Failed to open in explorer:', error);
        set((state) => {
          state.error =
            error instanceof Error
              ? error.message
              : 'Failed to open in explorer';
        });
        throw error;
      }
    },

    openProjectInTerminal: async (projectPath: string): Promise<void> => {
      try {
        await ipcApi.openInTerminal(projectPath);
      } catch (error) {
        console.error('Failed to open in terminal:', error);
        set((state) => {
          state.error =
            error instanceof Error
              ? error.message
              : 'Failed to open in terminal';
        });
        throw error;
      }
    },

    openProjectInIDE: async (
      projectPath: string,
      ideId?: string,
    ): Promise<void> => {
      try {
        const { ides } = get();
        let ide = ides.find((i) => i.id === ideId);

        // Default to first available IDE if none specified
        if (!ide && ides.length > 0) {
          ide = ides[0];
        }

        if (!ide) {
          throw new Error('No IDE available');
        }

        await ipcApi.openInIDE(projectPath, ide.id);
      } catch (error) {
        console.error('Failed to open in IDE:', error);
        set((state) => {
          state.error =
            error instanceof Error ? error.message : 'Failed to open in IDE';
        });
        throw error;
      }
    },
  })),
);

export const useProjectStore = () => {
  return useStore(projectStore);
};
