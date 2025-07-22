import { ipcRenderer } from 'electron';
import type { ProjectInfo } from '../../main/ipc/project';

export interface ProjectAPI {
  // CRUD operations
  createProject: (projectData: any) => Promise<any>;
  getAllProjects: () => Promise<any[]>;
  getProjectById: (id: string) => Promise<any | null>;
  updateProject: (id: string, updates: any) => Promise<any>;
  deleteProject: (id: string) => Promise<boolean>;
  searchProjects: (filters: any) => Promise<any[]>;
  
  // Project actions
  toggleFavorite: (id: string) => Promise<any>;
  openProject: (id: string, ideId?: string) => Promise<any>;
  addExistingProject: (folderPath: string) => Promise<any>;
  
  // Folder operations
  selectFolder: () => Promise<ProjectInfo | null>;
  analyzeFolder: (folderPath: string) => Promise<ProjectInfo>;
  
  // System operations
  openInExplorer: (projectPath: string) => Promise<boolean>;
  openInTerminal: (projectPath: string) => Promise<boolean>;
  openInIDE: (projectPath: string, ideExecutable: string) => Promise<boolean>;
  getAvailableIDEs: () => Promise<
    Array<{
      id: string;
      name: string;
      executable: string;
      icon: string;
    }>
  >;
}

const projectAPI: ProjectAPI = {
  // CRUD operations
  createProject: (projectData: any) => ipcRenderer.invoke('project:create', projectData),
  getAllProjects: () => ipcRenderer.invoke('project:get-all'),
  getProjectById: (id: string) => ipcRenderer.invoke('project:get-by-id', id),
  updateProject: (id: string, updates: any) => ipcRenderer.invoke('project:update', { id, updates }),
  deleteProject: (id: string) => ipcRenderer.invoke('project:delete', id),
  searchProjects: (filters: any) => ipcRenderer.invoke('project:search', filters),
  
  // Project actions
  toggleFavorite: (id: string) => ipcRenderer.invoke('project:toggle-favorite', id),
  openProject: (id: string, ideId?: string) => ipcRenderer.invoke('project:open', id, ideId),
  addExistingProject: (folderPath: string) => ipcRenderer.invoke('project:add-existing', folderPath),
  
  // Folder operations
  selectFolder: () => ipcRenderer.invoke('project:select-folder'),
  analyzeFolder: (folderPath: string) =>
    ipcRenderer.invoke('project:analyze-folder', folderPath),
  
  // System operations
  openInExplorer: (projectPath: string) =>
    ipcRenderer.invoke('project:open-in-explorer', projectPath),
  openInTerminal: (projectPath: string) =>
    ipcRenderer.invoke('project:open-in-terminal', projectPath),
  openInIDE: (projectPath: string, ideExecutable: string) =>
    ipcRenderer.invoke('project:open-in-ide', projectPath, ideExecutable),
  getAvailableIDEs: () => ipcRenderer.invoke('project:get-available-ides'),
};

export default projectAPI;
