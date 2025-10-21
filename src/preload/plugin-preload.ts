import { contextBridge, ipcRenderer } from 'electron'

// Get plugin ID from command line arguments
const pluginId = process.argv.find(arg => arg.startsWith('--plugin-id='))?.split('=')[1] || 'unknown'

// Plugin API for sandboxed plugins
contextBridge.exposeInMainWorld('pluginAPI', {
  // Plugin information
  getPluginId: () => pluginId,

  // Storage API
  storage: {
    get: async (key: string) => {
      return await ipcRenderer.invoke('plugin-storage-get', pluginId, key)
    },
    set: async (key: string, value: any) => {
      return await ipcRenderer.invoke('plugin-storage-set', pluginId, key, value)
    },
    remove: async (key: string) => {
      return await ipcRenderer.invoke('plugin-storage-remove', pluginId, key)
    },
    clear: async () => {
      return await ipcRenderer.invoke('plugin-storage-clear', pluginId)
    }
  },

  // Notifications API
  notifications: {
    show: async (title: string, body: string, options?: NotificationOptions) => {
      return await ipcRenderer.invoke('plugin-notification-show', pluginId, title, body, options)
    }
  },

  // Network API (if permission granted)
  network: {
    fetch: async (url: string, options?: RequestInit) => {
      return await ipcRenderer.invoke('plugin-network-fetch', pluginId, url, options)
    }
  },

  // File system API (if permission granted)
  filesystem: {
    readFile: async (path: string) => {
      return await ipcRenderer.invoke('plugin-fs-read', pluginId, path)
    },
    writeFile: async (path: string, content: string) => {
      return await ipcRenderer.invoke('plugin-fs-write', pluginId, path, content)
    },
    exists: async (path: string) => {
      return await ipcRenderer.invoke('plugin-fs-exists', pluginId, path)
    }
  },

  // Communication API
  communication: {
    sendMessage: async (message: any) => {
      return await ipcRenderer.invoke('plugin-send-message', pluginId, message)
    },
    onMessage: (callback: (message: any) => void) => {
      ipcRenderer.on('plugin-message', (_, receivedMessage) => {
        callback(receivedMessage)
      })
    }
  },

  // Permission API
  permissions: {
    check: async (permission: string) => {
      return await ipcRenderer.invoke('plugin-check-permission', pluginId, permission)
    },
    request: async (permission: string) => {
      return await ipcRenderer.invoke('plugin-request-permission', pluginId, permission)
    }
  },

  // Utility functions
  utils: {
    log: (...args: any[]) => {
      console.log(`[Plugin ${pluginId}]:`, ...args)
    },
    warn: (...args: any[]) => {
      console.warn(`[Plugin ${pluginId}]:`, ...args)
    },
    error: (...args: any[]) => {
      console.error(`[Plugin ${pluginId}]:`, ...args)
    }
  }
})

// Type definitions for plugin API
declare global {
  interface Window {
    pluginAPI: {
      getPluginId: () => string

      storage: {
        get: (key: string) => Promise<any>
        set: (key: string, value: any) => Promise<void>
        remove: (key: string) => Promise<void>
        clear: () => Promise<void>
      }

      notifications: {
        show: (title: string, body: string, options?: NotificationOptions) => Promise<void>
      }

      network: {
        fetch: (url: string, options?: RequestInit) => Promise<Response>
      }

      filesystem: {
        readFile: (path: string) => Promise<string>
        writeFile: (path: string, content: string) => Promise<void>
        exists: (path: string) => Promise<boolean>
      }

      communication: {
        sendMessage: (message: any) => Promise<void>
        onMessage: (callback: (message: any) => void) => void
      }

      permissions: {
        check: (permission: string) => Promise<boolean>
        request: (permission: string) => Promise<boolean>
      }

      utils: {
        log: (...args: any[]) => void
        warn: (...args: any[]) => void
        error: (...args: any[]) => void
      }
    }
  }
}