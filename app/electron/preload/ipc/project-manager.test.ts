/// <reference types="vitest" />

import { ipcRenderer } from 'electron';
import projectManagerAPI from './project-manager';
import { IPC_CHANNELS } from '../../main/ipc/project-manager';

vi.mock('electron', () => {
  const listeners = new Map();

  return {
    ipcRenderer: {
      invoke: vi.fn(),
      on: vi.fn((channel, listener) => {
        if (!listeners.has(channel)) {
          listeners.set(channel, new Set());
        }
        listeners.get(channel).add(listener);
      }),
      removeListener: vi.fn((channel, listener) => {
        if (listeners.has(channel)) {
          listeners.get(channel).delete(listener);
        }
      }),
      emit: (channel: string, event: any, ...args: any[]) => {
        if (listeners.has(channel)) {
          listeners.get(channel).forEach((listener: any) => {
            listener(event, ...args);
          });
        }
      },
    },
  };
});

describe('projectManagerAPI', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call ipcRenderer.invoke with GET_PROJECTS when getProjects is called', async () => {
    const mockProjects = [{ id: '1', name: 'Test Project' }];
    (ipcRenderer.invoke as vi.Mock).mockResolvedValueOnce({ success: true, data: mockProjects });

    const result = await projectManagerAPI.getProjects();

    expect(ipcRenderer.invoke).toHaveBeenCalledWith(IPC_CHANNELS.GET_PROJECTS);
    expect(result).toEqual({ success: true, data: mockProjects });
  });

  it('should call ipcRenderer.invoke with ADD_PROJECT when addProject is called', async () => {
    const newProject = { name: 'New Project', path: '/new/project' };
    const mockAddedProject = { id: '2', createdAt: 'now', updatedAt: 'now', ...newProject };
    (ipcRenderer.invoke as vi.Mock).mockResolvedValueOnce({ success: true, data: mockAddedProject });

    const result = await projectManagerAPI.addProject(newProject);

    expect(ipcRenderer.invoke).toHaveBeenCalledWith(IPC_CHANNELS.ADD_PROJECT, newProject);
    expect(result).toEqual({ success: true, data: mockAddedProject });
  });

  it('should call ipcRenderer.invoke with UPDATE_PROJECT when updateProject is called', async () => {
    const projectId = '1';
    const updates = { name: 'Updated Project' };
    (ipcRenderer.invoke as vi.Mock).mockResolvedValueOnce({ success: true });

    const result = await projectManagerAPI.updateProject(projectId, updates);

    expect(ipcRenderer.invoke).toHaveBeenCalledWith(IPC_CHANNELS.UPDATE_PROJECT, projectId, updates);
    expect(result).toEqual({ success: true });
  });

  it('should call ipcRenderer.invoke with SCAN_DIRECTORY when scanDirectory is called', async () => {
    const path = '/test/directory';
    const mockScanResult = [{ name: 'Scanned Project', path: '/scanned/project' }];
    (ipcRenderer.invoke as vi.Mock).mockResolvedValueOnce({ success: true, data: mockScanResult });

    const result = await projectManagerAPI.scanDirectory(path);

    expect(ipcRenderer.invoke).toHaveBeenCalledWith(IPC_CHANNELS.SCAN_DIRECTORY, path);
    expect(result).toEqual({ success: true, data: mockScanResult });
  });

  it('should call ipcRenderer.invoke with IMPORT_PROJECTS when importProjects is called', async () => {
    const projectsToImport = [{ name: 'Imported Project', path: '/imported/project' }];
    const mockImportedProjects = [{ id: '3', createdAt: 'now', updatedAt: 'now', ...projectsToImport[0] }];
    (ipcRenderer.invoke as vi.Mock).mockResolvedValueOnce({ success: true, data: mockImportedProjects });

    const result = await projectManagerAPI.importProjects(projectsToImport);

    expect(ipcRenderer.invoke).toHaveBeenCalledWith(IPC_CHANNELS.IMPORT_PROJECTS, projectsToImport);
    expect(result).toEqual({ success: true, data: mockImportedProjects });
  });

  it('should call ipcRenderer.invoke with LAUNCH_PROJECT when launchProject is called', async () => {
    const projectId = '123';
    const ideId = '456';
    (ipcRenderer.invoke as vi.Mock).mockResolvedValueOnce({ success: true, data: true });

    const result = await projectManagerAPI.launchProject(projectId, ideId);

    expect(ipcRenderer.invoke).toHaveBeenCalledWith(IPC_CHANNELS.LAUNCH_PROJECT, projectId, ideId);
    expect(result).toEqual({ success: true, data: true });
  });

  it('should call ipcRenderer.invoke with OPEN_IN_EXPLORER when openInExplorer is called', async () => {
    const projectId = '123';
    (ipcRenderer.invoke as vi.Mock).mockResolvedValueOnce({ success: true, data: true });

    const result = await projectManagerAPI.openInExplorer(projectId);

    expect(ipcRenderer.invoke).toHaveBeenCalledWith(IPC_CHANNELS.OPEN_IN_EXPLORER, projectId);
    
    expect(result).toEqual({ success: true, data: true });
  });

  it('should call ipcRenderer.invoke with GET_IDES when getIDEs is called', async () => {
    const mockIDEs = [{ id: '1', name: 'VS Code' }];
    (ipcRenderer.invoke as vi.Mock).mockResolvedValueOnce({ success: true, data: mockIDEs });

    const result = await projectManagerAPI.getIDEs();

    expect(ipcRenderer.invoke).toHaveBeenCalledWith(IPC_CHANNELS.GET_IDES);
    expect(result).toEqual({ success: true, data: mockIDEs });
  });

  it('should call ipcRenderer.invoke with DETECT_IDES when detectIDEs is called', async () => {
    const mockDetectedIDEs = [{ id: '2', name: 'WebStorm' }];
    (ipcRenderer.invoke as vi.Mock).mockResolvedValueOnce({ success: true, data: mockDetectedIDEs });

    const result = await projectManagerAPI.detectIDEs();

    expect(ipcRenderer.invoke).toHaveBeenCalledWith(IPC_CHANNELS.DETECT_IDES);
    expect(result).toEqual({ success: true, data: mockDetectedIDEs });
  });

  it('should call ipcRenderer.invoke with ADD_IDE when addIDE is called', async () => {
    const newIDE = { name: 'Sublime Text', path: '/path/to/sublime' };
    const mockAddedIDE = { id: '3', ...newIDE };
    (ipcRenderer.invoke as vi.Mock).mockResolvedValueOnce({ success: true, data: mockAddedIDE });

    const result = await projectManagerAPI.addIDE(newIDE);

    expect(ipcRenderer.invoke).toHaveBeenCalledWith(IPC_CHANNELS.ADD_IDE, newIDE);
    expect(result).toEqual({ success: true, data: mockAddedIDE });
  });

  it('should call ipcRenderer.invoke with LAUNCH_WITH_IDE when launchWithIDE is called', async () => {
    const projectId = '123';
    const ideId = '456';
    (ipcRenderer.invoke as vi.Mock).mockResolvedValueOnce({ success: true, data: true });

    const result = await projectManagerAPI.launchWithIDE(projectId, ideId);

    expect(ipcRenderer.invoke).toHaveBeenCalledWith(IPC_CHANNELS.LAUNCH_WITH_IDE, projectId, ideId);
    expect(result).toEqual({ success: true, data: true });
  });

  it('should call ipcRenderer.invoke with GET_SETTINGS when getSettings is called', async () => {
    const mockSettings = { theme: 'dark' };
    (ipcRenderer.invoke as vi.Mock).mockResolvedValueOnce({ success: true, data: mockSettings });

    const result = await projectManagerAPI.getSettings();

    expect(ipcRenderer.invoke).toHaveBeenCalledWith(IPC_CHANNELS.GET_SETTINGS);
    expect(result).toEqual({ success: true, data: mockSettings });
  });

  it('should call ipcRenderer.invoke with UPDATE_SETTINGS when updateSettings is called', async () => {
    const updates = { theme: 'light' };
    (ipcRenderer.invoke as vi.Mock).mockResolvedValueOnce({ success: true, data: true });

    const result = await projectManagerAPI.updateSettings(updates);

    expect(ipcRenderer.invoke).toHaveBeenCalledWith(IPC_CHANNELS.UPDATE_SETTINGS, updates);
    expect(result).toEqual({ success: true, data: true });
  });

  it('should call ipcRenderer.invoke with SELECT_DIRECTORY when selectDirectory is called', async () => {
    const mockDirectory = '/selected/directory';
    (ipcRenderer.invoke as vi.Mock).mockResolvedValueOnce({ success: true, data: mockDirectory });

    const result = await projectManagerAPI.selectDirectory();

    expect(ipcRenderer.invoke).toHaveBeenCalledWith(IPC_CHANNELS.SELECT_DIRECTORY);
    expect(result).toEqual({ success: true, data: mockDirectory });
  });

  it('should call ipcRenderer.invoke with SELECT_FILE when selectFile is called', async () => {
    const mockFile = '/selected/file.txt';
    const filters = [{ name: 'Text Files', extensions: ['txt'] }];
    (ipcRenderer.invoke as vi.Mock).mockResolvedValueOnce({ success: true, data: mockFile });

    const result = await projectManagerAPI.selectFile(filters);

    expect(ipcRenderer.invoke).toHaveBeenCalledWith(IPC_CHANNELS.SELECT_FILE, filters);
    expect(result).toEqual({ success: true, data: mockFile });
  });

  it('should register and unregister onProjectsUpdated event listener', () => {
    const mockCallback = vi.fn();
    const unsubscribe = projectManagerAPI.onProjectsUpdated(mockCallback);

    ipcRenderer.emit(IPC_CHANNELS.PROJECTS_UPDATED);
    expect(mockCallback).toHaveBeenCalledTimes(1);

    unsubscribe();
    ipcRenderer.emit(IPC_CHANNELS.PROJECTS_UPDATED);
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('should call ipcRenderer.invoke with DELETE_IDE when deleteIDE is called', async () => {
    const ideId = '123';
    (ipcRenderer.invoke as vi.Mock).mockResolvedValueOnce({ success: true, data: true });

    const result = await projectManagerAPI.deleteIDE(ideId);

    expect(ipcRenderer.invoke).toHaveBeenCalledWith(IPC_CHANNELS.DELETE_IDE, ideId);
    expect(result).toEqual({ success: true, data: true });
  });

  it('should register and unregister onProjectAdded event listener', () => {
    const mockCallback = vi.fn();
    const unsubscribe = projectManagerAPI.onProjectAdded(mockCallback);
    const mockProject = { id: '1', name: 'New Project', path: '/new/project' };

    ipcRenderer.emit(IPC_CHANNELS.PROJECT_ADDED, {}, mockProject);
    expect(mockCallback).toHaveBeenCalledWith(mockProject);

    unsubscribe();
    ipcRenderer.emit(IPC_CHANNELS.PROJECT_ADDED, {}, mockProject);
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('should register and unregister onScanProgress event listener', () => {
    const mockCallback = vi.fn();
    const unsubscribe = projectManagerAPI.onScanProgress(mockCallback);
    const mockProgress = { directory: '/scan', current: 1, total: 2, currentProject: 'proj1' };

    ipcRenderer.emit(IPC_CHANNELS.SCAN_PROGRESS, {}, mockProgress);
    expect(mockCallback).toHaveBeenCalledWith(mockProgress);

    unsubscribe();
    ipcRenderer.emit(IPC_CHANNELS.SCAN_PROGRESS, {}, mockProgress);
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('should register and unregister onScanComplete event listener', () => {
    const mockCallback = vi.fn();
    const unsubscribe = projectManagerAPI.onScanComplete(mockCallback);
    const mockResult = { directory: '/scan', projects: [], success: true };

    ipcRenderer.emit(IPC_CHANNELS.SCAN_COMPLETE, {}, mockResult);
    expect(mockCallback).toHaveBeenCalledWith(mockResult);

    unsubscribe();
    ipcRenderer.emit(IPC_CHANNELS.SCAN_COMPLETE, {}, mockResult);
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('should call ipcRenderer.invoke with OPEN_IN_TERMINAL when openInTerminal is called', async () => {
    const projectId = '123';
    (ipcRenderer.invoke as vi.Mock).mockResolvedValueOnce({ success: true, data: true });

    const result = await projectManagerAPI.openInTerminal(projectId);

    expect(ipcRenderer.invoke).toHaveBeenCalledWith(IPC_CHANNELS.OPEN_IN_TERMINAL, projectId);
    expect(result).toEqual({ success: true, data: true });
  });

  it('should call ipcRenderer.invoke with DELETE_PROJECT when deleteProject is called', async () => {
    const projectId = '123';
    (ipcRenderer.invoke as vi.Mock).mockResolvedValueOnce({ success: true });

    const result = await projectManagerAPI.deleteProject(projectId);

    expect(ipcRenderer.invoke).toHaveBeenCalledWith(IPC_CHANNELS.DELETE_PROJECT, projectId);
    expect(result).toEqual({ success: true });
  });
});