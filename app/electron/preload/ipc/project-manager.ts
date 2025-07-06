import { ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../../main/ipc/project-manager';
import type { Project, IDE, AppSettings } from '../../main/services/database';
import type { ProjectDetectionResult } from '../../main/services/project-scanner';

export interface ProjectManagerAPI {
  // Project operations
  getProjects(): Promise<{ success: boolean; data?: Project[]; error?: string }>;
  addProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; data?: Project; error?: string }>;
  updateProject(id: string, updates: Partial<Project>): Promise<{ success: boolean; data?: boolean; error?: string }>;
  deleteProject(id: string): Promise<{ success: boolean; data?: boolean; error?: string }>;
  scanDirectory(path: string): Promise<{ success: boolean; data?: ProjectDetectionResult[]; error?: string }>;
  importProjects(projects: ProjectDetectionResult[]): Promise<{ success: boolean; data?: Project[]; error?: string }>;
  launchProject(projectId: string, ideId?: string): Promise<{ success: boolean; data?: boolean; error?: string }>;
  openInExplorer(projectId: string): Promise<{ success: boolean; error?: string }>;
  openInTerminal(projectId: string): Promise<{ success: boolean; error?: string }>;
  
  // IDE operations
  getIDEs(): Promise<{ success: boolean; data?: IDE[]; error?: string }>;
  detectIDEs(): Promise<{ success: boolean; data?: IDE[]; error?: string }>;
  addIDE(ide: Omit<IDE, 'id'>): Promise<{ success: boolean; data?: IDE; error?: string }>;
  launchWithIDE(projectId: string, ideId: string): Promise<{ success: boolean; data?: boolean; error?: string }>;
  deleteIDE(ideId: string): Promise<{ success: boolean; data?: boolean; error?: string }>;
  
  // Settings operations
  getSettings(): Promise<{ success: boolean; data?: AppSettings; error?: string }>;
  updateSettings(updates: Partial<AppSettings>): Promise<{ success: boolean; data?: boolean; error?: string }>;
  
  // File system operations
  selectDirectory(): Promise<{ success: boolean; data?: string; canceled?: boolean; error?: string }>;
  selectFile(filters?: { name: string; extensions: string[] }[]): Promise<{ success: boolean; data?: string; canceled?: boolean; error?: string }>;
  
  // Event listeners
  onProjectsUpdated(callback: () => void): () => void;
  onScanProgress(callback: (progress: { directory: string; current: number; total: number; currentProject?: string }) => void): () => void;
  onScanComplete(callback: (result: { directory: string; projects: ProjectDetectionResult[]; success: boolean; error?: string }) => void): () => void;
}

const projectManagerAPI: ProjectManagerAPI = {
  // Project operations
  getProjects: () => ipcRenderer.invoke(IPC_CHANNELS.GET_PROJECTS),
  addProject: (project) => ipcRenderer.invoke(IPC_CHANNELS.ADD_PROJECT, project),
  updateProject: (id, updates) => ipcRenderer.invoke(IPC_CHANNELS.UPDATE_PROJECT, id, updates),
  deleteProject: (id) => ipcRenderer.invoke(IPC_CHANNELS.DELETE_PROJECT, id),
  scanDirectory: (path) => ipcRenderer.invoke(IPC_CHANNELS.SCAN_DIRECTORY, path),
  importProjects: (projects) => ipcRenderer.invoke(IPC_CHANNELS.IMPORT_PROJECTS, projects),
  launchProject: (projectId, ideId) => ipcRenderer.invoke(IPC_CHANNELS.LAUNCH_PROJECT, projectId, ideId),
  openInExplorer: (projectId) => ipcRenderer.invoke(IPC_CHANNELS.OPEN_IN_EXPLORER, projectId),
  openInTerminal: (projectId) => ipcRenderer.invoke(IPC_CHANNELS.OPEN_IN_TERMINAL, projectId),
  
  // IDE operations
  getIDEs: () => ipcRenderer.invoke(IPC_CHANNELS.GET_IDES),
  detectIDEs: () => ipcRenderer.invoke(IPC_CHANNELS.DETECT_IDES),
  addIDE: (ide) => ipcRenderer.invoke(IPC_CHANNELS.ADD_IDE, ide),
  launchWithIDE: (projectId, ideId) => ipcRenderer.invoke(IPC_CHANNELS.LAUNCH_WITH_IDE, projectId, ideId),
  deleteIDE: (ideId) => ipcRenderer.invoke(IPC_CHANNELS.DELETE_IDE, ideId),
  
  // Settings operations
  getSettings: () => ipcRenderer.invoke(IPC_CHANNELS.GET_SETTINGS),
  updateSettings: (updates) => ipcRenderer.invoke(IPC_CHANNELS.UPDATE_SETTINGS, updates),
  
  // File system operations
  selectDirectory: () => ipcRenderer.invoke(IPC_CHANNELS.SELECT_DIRECTORY),
  selectFile: (filters) => ipcRenderer.invoke(IPC_CHANNELS.SELECT_FILE, filters),
  
  // Event listeners
  onProjectsUpdated: (callback) => {
    const handler = () => callback();
    ipcRenderer.on(IPC_CHANNELS.PROJECTS_UPDATED, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.PROJECTS_UPDATED, handler);
  },
  
  onScanProgress: (callback) => {
    const handler = (_: Electron.IpcRendererEvent, progress: any) => callback(progress);
    ipcRenderer.on(IPC_CHANNELS.SCAN_PROGRESS, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.SCAN_PROGRESS, handler);
  },
  
  onScanComplete: (callback) => {
    const handler = (_: Electron.IpcRendererEvent, result: any) => callback(result);
    ipcRenderer.on(IPC_CHANNELS.SCAN_COMPLETE, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.SCAN_COMPLETE, handler);
  },

  onProjectAdded: (callback) => {
    const handler = (_: Electron.IpcRendererEvent, project: any) => callback(project);
    ipcRenderer.on(IPC_CHANNELS.PROJECT_ADDED, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.PROJECT_ADDED, handler);
  },
};

export default projectManagerAPI;