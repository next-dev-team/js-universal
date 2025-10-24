import { contextBridge, ipcRenderer } from "electron";

// Debug: Log process.argv to see what arguments are being passed
console.log("[Dev Plugin Preload] Script loaded successfully!");
console.log("[Dev Plugin Preload] process.argv:", process.argv);
console.log("[Dev Plugin Preload] __dirname:", __dirname);
console.log("[Dev Plugin Preload] process.cwd():", process.cwd());

// Get plugin ID from command line arguments
const pluginIdArg = process.argv.find((arg) => arg.startsWith("--plugin-id="));
console.log("[Dev Plugin Preload] Found plugin ID argument:", pluginIdArg);

const pluginId = pluginIdArg?.split("=")[1] || "dev-plugin";
console.log("[Dev Plugin Preload] Extracted plugin ID:", pluginId);

// Check if we're in development mode
const isDevelopment =
  process.env.NODE_ENV === "development" ||
  process.argv.includes("--dev") ||
  process.argv.includes("--development");

console.log("[Dev Plugin Preload] Development mode:", isDevelopment);

// Enhanced Plugin API for development mode
const devPluginAPI = {
  // Plugin information
  getPluginId: () => {
    console.log(
      "[Dev Plugin Preload] getPluginId called, returning:",
      pluginId
    );
    return pluginId;
  },

  // Development mode detection
  isDevelopment: () => isDevelopment,

  // Enhanced logging for development
  log: (...args: any[]) => {
    console.log(`[Dev Plugin ${pluginId}]:`, ...args);
  },

  warn: (...args: any[]) => {
    console.warn(`[Dev Plugin ${pluginId}]:`, ...args);
  },

  error: (...args: any[]) => {
    console.error(`[Dev Plugin ${pluginId}]:`, ...args);
  },

  // Storage API (same as production)
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
      return await ipcRenderer.invoke("plugin-api:fetch", url, options);
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
      return await ipcRenderer.invoke(
        "plugin-api:send-message",
        targetPluginId,
        message
      );
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
      return await ipcRenderer.invoke(
        "plugin-api:check-permission",
        permission
      );
    },
    request: async (permission: string) => {
      return await ipcRenderer.invoke(
        "plugin-api:request-permission",
        permission
      );
    },
  },

  // Development-specific APIs
  dev: {
    // Hot reload trigger
    reload: async () => {
      return await ipcRenderer.invoke("dev-plugin:reload", pluginId);
    },

    // Get development info
    getInfo: async () => {
      return {
        pluginId,
        isDevelopment,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
      };
    },

    // Development storage (separate from production)
    storage: {
      get: async (key: string) => {
        return await ipcRenderer.invoke("plugin-api:storage-get", `dev_${key}`);
      },
      set: async (key: string, value: any) => {
        return await ipcRenderer.invoke(
          "plugin-api:storage-set",
          `dev_${key}`,
          value
        );
      },
      remove: async (key: string) => {
        return await ipcRenderer.invoke(
          "plugin-api:storage-remove",
          `dev_${key}`
        );
      },
      clear: async () => {
        return await ipcRenderer.invoke("plugin-api:storage-clear");
      },
    },

    // Development console
    console: {
      log: (...args: any[]) => {
        console.log(`[Dev Console ${pluginId}]:`, ...args);
      },
      warn: (...args: any[]) => {
        console.warn(`[Dev Console ${pluginId}]:`, ...args);
      },
      error: (...args: any[]) => {
        console.error(`[Dev Console ${pluginId}]:`, ...args);
      },
      info: (...args: any[]) => {
        console.info(`[Dev Console ${pluginId}]:`, ...args);
      },
      debug: (...args: any[]) => {
        console.debug(`[Dev Console ${pluginId}]:`, ...args);
      },
    },

    // Performance monitoring
    performance: {
      mark: (name: string) => {
        if (performance.mark) {
          performance.mark(`${pluginId}-${name}`);
        }
      },
      measure: (name: string, startMark: string, endMark?: string) => {
        if (performance.measure) {
          const startName = `${pluginId}-${startMark}`;
          const endName = endMark ? `${pluginId}-${endMark}` : undefined;
          performance.measure(`${pluginId}-${name}`, startName, endName);
        }
      },
      getEntries: () => {
        return performance
          .getEntriesByType("measure")
          .filter((entry) => entry.name.startsWith(pluginId));
      },
    },

    // Event tracking for development
    events: {
      track: (eventName: string, data?: any) => {
        console.log(`[Dev Event ${pluginId}] ${eventName}:`, data);
        // In development, we can also send to main process for debugging
        if (isDevelopment) {
          ipcRenderer.invoke(
            "dev-plugin:track-event",
            pluginId,
            eventName,
            data
          );
        }
      },
    },
  },

  // Utility functions (enhanced for development)
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

    // Development utilities
    delay: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),

    // JSON helpers with better error handling
    safeJSON: {
      parse: (str: string, defaultValue: any = null) => {
        try {
          return JSON.parse(str);
        } catch {
          console.warn(`[Plugin ${pluginId}] Failed to parse JSON:`, str);
          return defaultValue;
        }
      },
      stringify: (obj: any, defaultValue: string = "{}") => {
        try {
          return JSON.stringify(obj);
        } catch {
          console.warn(`[Plugin ${pluginId}] Failed to stringify object:`, obj);
          return defaultValue;
        }
      },
    },
  },
};

// Expose the enhanced plugin API to the main world
console.log("[Dev Plugin Preload] Exposing devPluginAPI to main world");
console.log("[Dev Plugin Preload] devPluginAPI object:", devPluginAPI);
contextBridge.exposeInMainWorld("pluginAPI", devPluginAPI);

// Also expose as devPluginAPI for development-specific features
if (isDevelopment) {
  console.log("[Dev Plugin Preload] Exposing devPluginAPI.dev to main world");
  contextBridge.exposeInMainWorld("devPluginAPI", devPluginAPI.dev);
}

console.log("[Dev Plugin Preload] devPluginAPI exposed successfully");

// Type definitions for development plugin API
declare global {
  interface Window {
    devPluginAPI?: {
      reload: () => Promise<{ success: boolean; message: string }>;
      getInfo: () => Promise<any>;

      storage: {
        get: (key: string) => Promise<any>;
        set: (key: string, value: any) => Promise<void>;
        remove: (key: string) => Promise<void>;
        clear: () => Promise<void>;
      };

      console: {
        log: (...args: any[]) => void;
        warn: (...args: any[]) => void;
        error: (...args: any[]) => void;
        info: (...args: any[]) => void;
        debug: (...args: any[]) => void;
      };

      performance: {
        mark: (name: string) => void;
        measure: (name: string, startMark: string, endMark?: string) => void;
        getEntries: () => PerformanceEntry[];
      };

      events: {
        track: (eventName: string, data?: any) => void;
      };
    };
  }
}
