import { contextBridge, ipcRenderer } from "electron";
import { IPC_CHANNELS } from "@js-universal/shared-types";

console.log("Preload script loaded - testing automatic restart functionality");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // Window controls
  minimizeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MINIMIZE),
  maximizeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MAXIMIZE),
  closeWindow: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_CLOSE),

  // Database operations
  getPlugins: () => ipcRenderer.invoke(IPC_CHANNELS.DB_GET_PLUGINS),
  getUserPlugins: (userId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.DB_GET_USER_PLUGINS, userId),
  getSettings: () => ipcRenderer.invoke(IPC_CHANNELS.DB_GET_SETTINGS),
  updateSettings: (key: string, value: any) =>
    ipcRenderer.invoke(IPC_CHANNELS.DB_UPDATE_SETTINGS, key, value),
  updateUser: (userId: string, user: any) =>
    ipcRenderer.invoke(IPC_CHANNELS.DB_UPDATE_USER, userId, user),
  clearAppData: () => ipcRenderer.invoke(IPC_CHANNELS.DB_CLEAR_DATA),

  // Plugin management
  installPlugin: (pluginPath: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.PLUGIN_INSTALL, pluginPath),
  uninstallPlugin: (pluginId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.PLUGIN_UNINSTALL, pluginId),
  enablePlugin: (pluginId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.PLUGIN_ENABLE, pluginId),
  disablePlugin: (pluginId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.PLUGIN_DISABLE, pluginId),
  launchPlugin: (pluginId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.PLUGIN_LAUNCH, pluginId),
  closePlugin: (pluginId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.PLUGIN_CLOSE, pluginId),

  // User plugin management
  enableUserPlugin: (userId: string, pluginId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.USER_PLUGIN_ENABLE, userId, pluginId),
  disableUserPlugin: (userId: string, pluginId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.USER_PLUGIN_DISABLE, userId, pluginId),

  // Security
  checkPermission: (pluginId: string, permission: string) =>
    ipcRenderer.invoke(
      IPC_CHANNELS.SECURITY_CHECK_PERMISSION,
      pluginId,
      permission
    ),
  requestPermission: (pluginId: string, permission: string) =>
    ipcRenderer.invoke(
      IPC_CHANNELS.SECURITY_REQUEST_PERMISSION,
      pluginId,
      permission
    ),

  // Plugin communication
  sendPluginMessage: (pluginId: string, message: any) =>
    ipcRenderer.invoke(IPC_CHANNELS.PLUGIN_MESSAGE, pluginId, message),

  // File dialogs
  openDirectoryDialog: () =>
    ipcRenderer.invoke(IPC_CHANNELS.DIALOG_OPEN_DIRECTORY),

  // External links
  openExternal: (url: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.SHELL_OPEN_EXTERNAL),

  // Event listeners
  onPluginMessage: (callback: (pluginId: string, message: any) => void) => {
    ipcRenderer.on(IPC_CHANNELS.PLUGIN_RESPONSE, (_, pluginId, message) => {
      callback(pluginId, message);
    });
  },

  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },
});

// Type definitions for the exposed API
declare global {
  interface Window {
    electronAPI: {
      // Window controls
      minimizeWindow: () => Promise<void>;
      maximizeWindow: () => Promise<void>;
      closeWindow: () => Promise<void>;

      // Database operations
      getPlugins: () => Promise<any[]>;
      getUserPlugins: (userId: string) => Promise<any[]>;
      getSettings: () => Promise<any[]>;
      updateSettings: (key: string, value: any) => Promise<any>;
      updateUser: (userId: string, user: any) => Promise<any>;
      clearAppData: () => Promise<void>;

      // Plugin management
      installPlugin: (
        pluginPath: string
      ) => Promise<{ success: boolean; message: string; pluginId?: string }>;
      uninstallPlugin: (
        pluginId: string
      ) => Promise<{ success: boolean; message: string }>;
      enablePlugin: (
        pluginId: string
      ) => Promise<{ success: boolean; message: string }>;
      disablePlugin: (
        pluginId: string
      ) => Promise<{ success: boolean; message: string }>;
      launchPlugin: (
        pluginId: string
      ) => Promise<{ success: boolean; message: string }>;
      closePlugin: (
        pluginId: string
      ) => Promise<{ success: boolean; message: string }>;

      // User plugin management
      enableUserPlugin: (userId: string, pluginId: string) => Promise<any>;
      disableUserPlugin: (userId: string, pluginId: string) => Promise<any>;

      // Security
      checkPermission: (
        pluginId: string,
        permission: string
      ) => Promise<boolean>;
      requestPermission: (
        pluginId: string,
        permission: string
      ) => Promise<boolean>;

      // Plugin communication
      sendPluginMessage: (
        pluginId: string,
        message: any
      ) => Promise<{ success: boolean; response?: any }>;

      // File dialogs
      openDirectoryDialog: () => Promise<string | null>;

      // External links
      openExternal: (url: string) => Promise<void>;

      // Event listeners
      onPluginMessage: (
        callback: (pluginId: string, message: any) => void
      ) => void;
      removeAllListeners: (channel: string) => void;
    };
  }
}
