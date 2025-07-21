import { ipcRenderer } from 'electron';
import type { ProjectInfo } from '../../main/ipc/project';

export interface ProjectAPI {
  selectFolder: () => Promise<ProjectInfo | null>;
  analyzeFolder: (folderPath: string) => Promise<ProjectInfo>;
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
  selectFolder: () => ipcRenderer.invoke('project:select-folder'),
  analyzeFolder: (folderPath: string) =>
    ipcRenderer.invoke('project:analyze-folder', folderPath),
  openInExplorer: (projectPath: string) =>
    ipcRenderer.invoke('project:open-in-explorer', projectPath),
  openInTerminal: (projectPath: string) =>
    ipcRenderer.invoke('project:open-in-terminal', projectPath),
  openInIDE: (projectPath: string, ideExecutable: string) =>
    ipcRenderer.invoke('project:open-in-ide', projectPath, ideExecutable),
  getAvailableIDEs: () => ipcRenderer.invoke('project:get-available-ides'),
};

export default projectAPI;
