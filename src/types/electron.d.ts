// Electron API type definitions for renderer process

export interface ElectronShellAPI {
  openPath: (path: string) => Promise<string>;
  openExternal: (url: string) => Promise<void>;
  showItemInFolder: (fullPath: string) => void;
}

export interface ElectronTerminalAPI {
  open: (path: string, command?: string) => Promise<void>;
  execute: (
    command: string,
    cwd?: string,
  ) => Promise<{ stdout: string; stderr: string; exitCode: number }>;
}

export interface ElectronIDEAPI {
  open: (projectPath: string, ideCommand: string) => Promise<void>;
  getInstalledIDEs: () => Promise<IDE[]>;
}

export interface ElectronDialogAPI {
  showOpenDialog: (options: {
    title?: string;
    defaultPath?: string;
    buttonLabel?: string;
    filters?: { name: string; extensions: string[] }[];
    properties?: (
      | 'openFile'
      | 'openDirectory'
      | 'multiSelections'
      | 'showHiddenFiles'
    )[];
  }) => Promise<{ canceled: boolean; filePaths: string[] }>;

  showSaveDialog: (options: {
    title?: string;
    defaultPath?: string;
    buttonLabel?: string;
    filters?: { name: string; extensions: string[] }[];
  }) => Promise<{ canceled: boolean; filePath?: string }>;

  showMessageBox: (options: {
    type?: 'none' | 'info' | 'error' | 'question' | 'warning';
    buttons?: string[];
    defaultId?: number;
    title?: string;
    message: string;
    detail?: string;
  }) => Promise<{ response: number; checkboxChecked: boolean }>;
}

export interface ElectronFileAPI {
  readFile: (filePath: string, encoding?: string) => Promise<string | Buffer>;
  writeFile: (
    filePath: string,
    data: string | Buffer,
    encoding?: string,
  ) => Promise<void>;
  exists: (filePath: string) => Promise<boolean>;
  mkdir: (dirPath: string, recursive?: boolean) => Promise<void>;
  readdir: (dirPath: string) => Promise<string[]>;
  stat: (path: string) => Promise<{
    isFile: () => boolean;
    isDirectory: () => boolean;
    size: number;
    mtime: Date;
    ctime: Date;
  }>;
  copy: (src: string, dest: string) => Promise<void>;
  move: (src: string, dest: string) => Promise<void>;
  delete: (path: string) => Promise<void>;
}

export interface ElectronGitAPI {
  clone: (
    url: string,
    targetPath: string,
    options?: {
      branch?: string;
      depth?: number;
    },
  ) => Promise<void>;

  init: (path: string) => Promise<void>;

  status: (path: string) => Promise<{
    current: string;
    tracking: string;
    ahead: number;
    behind: number;
    files: {
      path: string;
      index: string;
      working_dir: string;
    }[];
  }>;

  add: (path: string, files: string[]) => Promise<void>;
  commit: (path: string, message: string) => Promise<void>;
  push: (path: string, remote?: string, branch?: string) => Promise<void>;
  pull: (path: string, remote?: string, branch?: string) => Promise<void>;
}

export interface ElectronProjectAPI {
  selectFolder: () => Promise<{
    name: string;
    path: string;
    type: string;
    packageManager?: string;
    framework?: string;
    hasGit?: boolean;
    size?: number;
  } | null>;

  analyzeFolder: (folderPath: string) => Promise<{
    name: string;
    path: string;
    type: string;
    packageManager?: string;
    framework?: string;
    hasGit?: boolean;
    size?: number;
  }>;

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

  create: (projectData: {
    name: string;
    path: string;
    template?: string;
    gitUrl?: string;
    initGit?: boolean;
    installDeps?: boolean;
  }) => Promise<{ success: boolean; message: string }>;

  scan: (directory: string) => Promise<
    {
      name: string;
      path: string;
      type: string;
      lastModified: Date;
      size: number;
    }[]
  >;

  analyze: (projectPath: string) => Promise<{
    type: string;
    framework?: string;
    language: string;
    packageManager?: string;
    dependencies: string[];
    scripts: Record<string, string>;
  }>;
}

export interface ElectronUpdateAPI {
  checkUpdate: () => Promise<{
    code: number;
    message: string;
    data?: {
      state: number;
      message: string;
      percent?: number;
    };
  }>;
  confirmDownload: () => Promise<{ code: number; message: string }>;
  confirmUpdate: () => Promise<{ code: number; message: string }>;
  watchVersionUpdateMsg: (
    callback: (arg: {
      state: number;
      message: {
        percent: number;
      };
    }) => void,
  ) => void;
}

export interface ElectronAPI {
  shell: ElectronShellAPI;
  terminal: ElectronTerminalAPI;
  ide: ElectronIDEAPI;
  dialog: ElectronDialogAPI;
  file: ElectronFileAPI;
  git: ElectronGitAPI;
  project: ElectronProjectAPI;
  checkUpdate: ElectronUpdateAPI;

  // App info
  getVersion: () => Promise<string>;
  getPlatform: () => Promise<string>;
  getPath: (
    name:
      | 'home'
      | 'appData'
      | 'userData'
      | 'temp'
      | 'desktop'
      | 'documents'
      | 'downloads',
  ) => Promise<string>;

  // Window controls
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  isMaximized: () => Promise<boolean>;

  // Events
  on: (channel: string, callback: (...args: any[]) => void) => void;
  off: (channel: string, callback: (...args: any[]) => void) => void;
  emit: (channel: string, ...args: any[]) => void;
}

// Global window interface extension
declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
