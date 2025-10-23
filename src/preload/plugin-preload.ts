import { contextBridge, ipcRenderer } from "electron";

// Debug: Log process.argv to see what arguments are being passed
console.log("[Plugin Preload] Script loaded successfully!");
console.log("[Plugin Preload] process.argv:", process.argv);

// Get plugin ID from command line arguments
const pluginIdArg = process.argv.find((arg) => arg.startsWith("--plugin-id="));
console.log("[Plugin Preload] Found plugin ID argument:", pluginIdArg);

const pluginId = pluginIdArg?.split("=")[1] || "unknown";
console.log("[Plugin Preload] Extracted plugin ID:", pluginId);

// Debug: Log what we're about to expose
console.log("[Plugin Preload] About to expose pluginAPI to main world");

// Plugin API for sandboxed plugins
const pluginAPI = {
  // Plugin information
  getPluginId: () => {
    console.log("[Plugin Preload] getPluginId called, returning:", pluginId);
    return pluginId;
  },

  // Storage API
  storage: {
    get: async (key: string) => {
      return await ipcRenderer.invoke("plugin-api:storage-get", key);
    },
    set: async (key: string, value: any) => {
      return await ipcRenderer.invoke("plugin-api:storage-set", key, value);
    },
    remove: async (key: string) => {
      return await ipcRenderer.invoke("plugin-api:storage-remove", key);
    },
    clear: async () => {
      return await ipcRenderer.invoke("plugin-api:storage-clear");
    },
  },

  // Notifications API
  notifications: {
    show: async (
      title: string,
      body: string,
      options?: NotificationOptions
    ) => {
      return await ipcRenderer.invoke(
        "plugin-api:show-notification",
        title,
        body,
        options
      );
    },
  },

  // Network API (if permission granted)
  network: {
    fetch: async (url: string, options?: RequestInit) => {
      return await ipcRenderer.invoke(
        "plugin-api:fetch",
        url,
        options
      );
    },
  },

  // File system API (if permission granted)
  filesystem: {
    readFile: async (path: string) => {
      return await ipcRenderer.invoke("plugin-api:read-file", path);
    },
    writeFile: async (path: string, content: string) => {
      return await ipcRenderer.invoke("plugin-api:write-file", path, content);
    },
    exists: async (path: string) => {
      return await ipcRenderer.invoke("plugin-api:file-exists", path);
    },
  },

  // Communication API
  communication: {
    sendMessage: async (targetPluginId: string, message: any) => {
      return await ipcRenderer.invoke("plugin-api:send-message", targetPluginId, message);
    },
    onMessage: (callback: (message: any) => void) => {
      ipcRenderer.on("plugin-message", (_, receivedMessage) => {
        callback(receivedMessage);
      });
    },
  },

  // Permission API
  permissions: {
    check: async (permission: string) => {
      return await ipcRenderer.invoke("plugin-api:check-permission", permission);
    },
    request: async (permission: string) => {
      return await ipcRenderer.invoke("plugin-api:request-permission", permission);
    },
  },

  // Utility functions
  utils: {
    log: (...args: any[]) => {
      console.log(`[Plugin ${pluginId}]:`, ...args);
    },
    warn: (...args: any[]) => {
      console.warn(`[Plugin ${pluginId}]:`, ...args);
    },
    error: (...args: any[]) => {
      console.error(`[Plugin ${pluginId}]:`, ...args);
    },
  },
};

// Expose the plugin API to the main world
console.log("[Plugin Preload] Exposing pluginAPI to main world");
contextBridge.exposeInMainWorld("pluginAPI", pluginAPI);
console.log("[Plugin Preload] pluginAPI exposed successfully");

// Type definitions for plugin API
declare global {
  interface Window {
    pluginAPI: {
      getPluginId: () => string;

      storage: {
        get: (key: string) => Promise<any>;
        set: (key: string, value: any) => Promise<void>;
        remove: (key: string) => Promise<void>;
        clear: () => Promise<void>;
      };

      notifications: {
        show: (
          title: string,
          body: string,
          options?: NotificationOptions
        ) => Promise<void>;
      };

      network: {
        fetch: (url: string, options?: RequestInit) => Promise<Response>;
      };

      filesystem: {
        readFile: (path: string) => Promise<string>;
        writeFile: (path: string, content: string) => Promise<void>;
        exists: (path: string) => Promise<boolean>;
      };

      communication: {
        sendMessage: (message: any) => Promise<void>;
        onMessage: (callback: (message: any) => void) => void;
      };

      permissions: {
        check: (permission: string) => Promise<boolean>;
        request: (permission: string) => Promise<boolean>;
      };

      utils: {
        log: (...args: any[]) => void;
        warn: (...args: any[]) => void;
        error: (...args: any[]) => void;
      };
    };
  }
}
