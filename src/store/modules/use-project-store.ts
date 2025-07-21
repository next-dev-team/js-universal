import { createStore, useStore } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type {
  Project,
  ProjectCreateRequest,
  ProjectUpdateRequest,
  ProjectSearchFilters,
  ProjectTemplate,
  QuickAction,
  IDE,
  ProjectStats,
  ProjectType
} from '@/types/project';

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
  sortOrder: 'desc'
};

// Mock data for initial development
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'My React App',
    description: 'A modern React application with TypeScript',
    type: 'react',
    path: '/Users/user/projects/my-react-app',
    tags: ['react', 'typescript', 'frontend'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    lastOpenedAt: new Date('2024-01-20'),
    isFavorite: true,
    status: 'active',
    metadata: {
      framework: 'React',
      version: '18.2.0',
      packageManager: 'yarn',
      buildTool: 'Vite'
    }
  },
  {
    id: '2',
    name: 'Node.js API',
    description: 'RESTful API built with Express and TypeScript',
    type: 'nodejs',
    path: '/Users/user/projects/nodejs-api',
    tags: ['nodejs', 'express', 'api', 'backend'],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
    isFavorite: false,
    status: 'active',
    metadata: {
      framework: 'Express',
      version: '4.18.0',
      packageManager: 'npm'
    }
  }
];

const mockTemplates: ProjectTemplate[] = [
  {
    id: 'react-ts',
    name: 'React + TypeScript',
    description: 'Modern React application with TypeScript and Vite',
    type: 'react',
    files: [],
    dependencies: ['react', 'react-dom', '@types/react', '@types/react-dom', 'typescript', 'vite']
  },
  {
    id: 'nodejs-express',
    name: 'Node.js + Express',
    description: 'RESTful API with Express and TypeScript',
    type: 'nodejs',
    files: [],
    dependencies: ['express', '@types/express', 'typescript', 'ts-node']
  }
];

const mockQuickActions: QuickAction[] = [
  {
    id: 'open-vscode',
    label: 'Open in VS Code',
    icon: 'vscode',
    command: 'code',
    args: ['.'],
    requiresProject: true
  },
  {
    id: 'open-terminal',
    label: 'Open Terminal',
    icon: 'terminal',
    command: 'cmd',
    args: ['/c', 'start'],
    requiresProject: true
  },
  {
    id: 'open-explorer',
    label: 'Open in Explorer',
    icon: 'folder',
    command: 'explorer',
    requiresProject: true
  }
];

const mockIDEs: IDE[] = [
  {
    id: 'vscode',
    name: 'Visual Studio Code',
    executable: 'code',
    args: ['.'],
    icon: 'vscode'
  },
  {
    id: 'webstorm',
    name: 'WebStorm',
    executable: 'webstorm',
    args: ['.'],
    icon: 'webstorm'
  }
];

export const projectStore = createStore<ProjectStore>()(immer((set, get) => ({
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set((state) => {
        state.projects = mockProjects;
        state.isLoading = false;
      });
    } catch (error) {
      set((state) => {
        state.error = error instanceof Error ? error.message : 'Failed to load projects';
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newProject: Project = {
        id: Date.now().toString(),
        name: request.name,
        description: request.description,
        type: request.type,
        path: request.path,
        tags: request.tags || [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isFavorite: false,
        status: 'active',
        metadata: {
          packageManager: 'yarn' // Default based on project rules
        }
      };

      set((state) => {
        state.projects.unshift(newProject);
        state.isLoading = false;
      });

      return newProject;
    } catch (error) {
      set((state) => {
        state.error = error instanceof Error ? error.message : 'Failed to create project';
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let updatedProject: Project | undefined;
      
      set((state) => {
        const index = state.projects.findIndex(p => p.id === request.id);
        if (index !== -1) {
          const project = state.projects[index];
          updatedProject = {
            ...project,
            ...request,
            updatedAt: new Date()
          };
          state.projects[index] = updatedProject;
        }
        state.isLoading = false;
      });

      if (!updatedProject) {
        throw new Error('Project not found');
      }

      return updatedProject;
    } catch (error) {
      set((state) => {
        state.error = error instanceof Error ? error.message : 'Failed to update project';
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set((state) => {
        state.projects = state.projects.filter(p => p.id !== id);
        if (state.selectedProject?.id === id) {
          state.selectedProject = undefined;
        }
        state.isLoading = false;
      });
    } catch (error) {
      set((state) => {
        state.error = error instanceof Error ? error.message : 'Failed to delete project';
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
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query) ||
        project.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply type filter
    if (filters.type) {
      filtered = filtered.filter(project => project.type === filters.type);
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(project => project.status === filters.status);
    }

    // Apply favorite filter
    if (filters.isFavorite !== undefined) {
      filtered = filtered.filter(project => project.isFavorite === filters.isFavorite);
    }

    // Apply tags filter
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(project => 
        filters.tags!.some(tag => project.tags.includes(tag))
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
      const project = get().projects.find(p => p.id === id);
      if (project) {
        await get().updateProject({
          id,
          isFavorite: !project.isFavorite
        });
      }
    } catch (error) {
      set((state) => {
        state.error = error instanceof Error ? error.message : 'Failed to toggle favorite';
      });
    }
  },

  openProject: async (id: string, ideId?: string): Promise<void> => {
    try {
      const project = get().projects.find(p => p.id === id);
      if (!project) {
        throw new Error('Project not found');
      }

      // Update last opened time
      await get().updateProject({
        id,
        lastOpenedAt: new Date()
      });

      // Here you would implement the actual opening logic
      // For now, we'll just simulate it
      console.log(`Opening project ${project.name} with IDE ${ideId || 'default'}`);
      
      set((state) => {
        state.selectedProject = project;
      });
    } catch (error) {
      set((state) => {
        state.error = error instanceof Error ? error.message : 'Failed to open project';
      });
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
    
    const projectsByType = projects.reduce((acc, project) => {
      acc[project.type] = (acc[project.type] || 0) + 1;
      return acc;
    }, {} as Record<ProjectType, number>);

    const recentProjects = projects
      .filter(p => p.lastOpenedAt)
      .sort((a, b) => (b.lastOpenedAt!.getTime() - a.lastOpenedAt!.getTime()))
      .slice(0, 5);

    const favoriteProjects = projects.filter(p => p.isFavorite);

    const totalSize = projects.reduce((acc, project) => acc + (project.size || 0), 0);

    return {
      totalProjects: projects.length,
      projectsByType,
      recentProjects,
      favoriteProjects,
      totalSize
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
      await new Promise(resolve => setTimeout(resolve, 300));
      
      set((state) => {
        state.templates = mockTemplates;
      });
    } catch (error) {
      set((state) => {
        state.error = error instanceof Error ? error.message : 'Failed to load templates';
      });
    }
  },

  // Quick actions and IDE operations
  loadQuickActions: async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));
      
      set((state) => {
        state.quickActions = mockQuickActions;
      });
    } catch (error) {
      set((state) => {
        state.error = error instanceof Error ? error.message : 'Failed to load quick actions';
      });
    }
  },

  loadIDEs: async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));
      
      set((state) => {
        state.ides = mockIDEs;
      });
    } catch (error) {
      set((state) => {
        state.error = error instanceof Error ? error.message : 'Failed to load IDEs';
      });
    }
  }
})));

export const useProjectStore = () => {
  return useStore(projectStore);
};