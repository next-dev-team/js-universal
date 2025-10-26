// Local types for electron-main package
// These are copied from the shared types to avoid complex import paths

export interface Plugin {
  id: string
  name: string
  description: string
  author: string
  category: string
  iconUrl?: string
  downloadCount: number
  averageRating: number
  createdAt: Date
  updatedAt: Date
  isActive: boolean
  isVerified: boolean
  version: string
  size: number
  tags: string[]
  requiredPermissions: string[]
}

export interface UserPlugin {
  id: string
  userId: string
  pluginId: string
  installedVersion: string
  installedAt: Date
  lastUsedAt?: Date
  isEnabled: boolean
  settings?: Record<string, any>
}

export interface AppSettings {
  id: string
  theme: string
  language: string
  autoLaunch: boolean
  autoUpdate: boolean
  maxConcurrentPlugins: number
  enableNotifications: boolean
  enableSounds: boolean
  notificationPosition: string
  developerMode: boolean
  logLevel: string
  dataRetentionDays: number
  allowTelemetry: boolean
  autoBackup: boolean
  backupInterval: number
}

export interface PluginManifest {
  name: string
  version: string
  description: string
  author: string
  main: string
  permissions: string[]
  category: string
  icon?: string
  dependencies?: Record<string, string>
  window?: {
    width?: number
    height?: number
    minWidth?: number
    minHeight?: number
    maxWidth?: number
    maxHeight?: number
    resizable?: boolean
  }
}

export interface PluginContext {
  pluginId: string
  pluginName: string
  version: string
  permissions: string[]
  dataPath: string
  tempPath: string
}

export const IPC_CHANNELS = {
  // Plugin management
  PLUGIN_INSTALL: 'plugin:install',
  PLUGIN_UNINSTALL: 'plugin:uninstall',
  PLUGIN_ENABLE: 'plugin:enable',
  PLUGIN_DISABLE: 'plugin:disable',
  PLUGIN_LIST: 'plugin:list',
  PLUGIN_GET_ALL: 'plugin:getAll',
  PLUGIN_GET_BY_ID: 'plugin:getById',
  PLUGIN_LAUNCH: 'plugin:launch',
  PLUGIN_CLOSE: 'plugin:close',
  PLUGIN_GET_RUNNING: 'plugin:getRunning',

  // User plugin management
  USER_PLUGIN_GET_ALL: 'userPlugin:getAll',
  USER_PLUGIN_INSTALL: 'userPlugin:install',
  USER_PLUGIN_UNINSTALL: 'userPlugin:uninstall',
  USER_PLUGIN_ENABLE: 'userPlugin:enable',
  USER_PLUGIN_DISABLE: 'userPlugin:disable',

  // Database operations
  DB_GET_PLUGINS: 'db:getPlugins',
  DB_GET_USER_PLUGINS: 'db:getUserPlugins',
  DB_GET_SETTINGS: 'db:getSettings',
  DB_UPDATE_SETTINGS: 'db:updateSettings',
  DB_UPDATE_USER: 'db:updateUser',
  DB_CLEAR_DATA: 'db:clearData',

  // Window management
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_CLOSE: 'window:close',
  WINDOW_RESTORE: 'window:restore',

  // Plugin communication
  PLUGIN_MESSAGE: 'plugin:message',
  PLUGIN_RESPONSE: 'plugin:response',
  PLUGIN_API_CALL: 'plugin:apiCall',

  // Security
  SECURITY_CHECK_PERMISSION: 'security:checkPermission',
  SECURITY_REQUEST_PERMISSION: 'security:requestPermission',

  // Dialog
  DIALOG_OPEN_DIRECTORY: 'dialog:openDirectory',

  // Shell
  SHELL_OPEN_EXTERNAL: 'shell:openExternal',

  // Workspace operations
  WORKSPACE_RESCAN: 'workspace:rescan',
  WORKSPACE_GET_PROJECTS: 'workspace:get-projects',
} as const

export type IPCChannel = typeof IPC_CHANNELS[keyof typeof IPC_CHANNELS]