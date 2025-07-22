interface ElectronClipboardAPI {
  readText: () => Promise<string>;
  writeText: (text: string) => Promise<void>;
  readHTML: () => Promise<string>;
  writeHTML: (html: string) => Promise<void>;
  readImage: () => Promise<string>;
  writeImage: (image: string) => Promise<void>;
  readRTF: () => Promise<string>;
  writeRTF: (rtf: string) => Promise<void>;
  clear: () => Promise<void>;
  availableFormats: () => Promise<string[]>;
  has: (format: string) => Promise<boolean>;
  read: (format: string) => Promise<string>;
  write: (data: { text?: string; html?: string; image?: string; rtf?: string }, type?: string) => Promise<void>;
}

interface ElectronAPI {
    shell: ElectronShellAPI;
    terminal: ElectronTerminalAPI;
    ide: ElectronIDEAPI;
    dialog: ElectronDialogAPI;
    file: ElectronFileAPI;
    git: ElectronGitAPI;
    project: ElectronProjectAPI;
    checkUpdate: ElectronUpdateAPI;
    window: ElectronWindowAPI;
    app: ElectronAppAPI;
    clipboard: ElectronClipboardAPI;
    getTestHandle1: ElectronTestAPI;
    user32: ElectronUser32API;
    send: ElectronSendAPI;
    versions: ElectronVersionsAPI;
    getVersion: () => string;
  }

  interface ElectronTestAPI {
    (): Promise<any>;
  }

  interface ElectronUser32API {
    (): Promise<any>;
  }

  interface ElectronSendAPI {
    (channel: string, ...args: any[]): void;
  }

  interface ElectronVersionsAPI {
    chrome: string;
    electron: string;
    node: string;
  }
