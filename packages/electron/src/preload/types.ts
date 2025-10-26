// Local types for preload script to avoid complex import paths
export const IPC_CHANNELS = {
  // Window controls
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_CLOSE: 'window:close',

  // Database operations
  DB_GET_PLUGINS: 'db:get-plugins',
  DB_GET_USER_PLUGINS: 'db:get-user-plugins',
  DB_GET_SETTINGS: 'db:get-settings',
  DB_UPDATE_SETTINGS: 'db:update-settings',
  DB_UPDATE_USER: 'db:update-user',
  DB_CLEAR_DATA: 'db:clear-data',

  // Plugin management
  PLUGIN_INSTALL: 'plugin:install',
  PLUGIN_UNINSTALL: 'plugin:uninstall',
  PLUGIN_ENABLE: 'plugin:enable',
  PLUGIN_DISABLE: 'plugin:disable',
  PLUGIN_LAUNCH: 'plugin:launch',
  PLUGIN_CLOSE: 'plugin:close',

  // User plugin management
  USER_PLUGIN_ENABLE: 'user-plugin:enable',
  USER_PLUGIN_DISABLE: 'user-plugin:disable',

  // Security
  SECURITY_CHECK_PERMISSION: 'security:check-permission',
  SECURITY_REQUEST_PERMISSION: 'security:request-permission',

  // Plugin communication
  PLUGIN_MESSAGE: 'plugin:message',
  PLUGIN_RESPONSE: 'plugin:response',
  PLUGIN_API_CALL: 'plugin:api-call',

  // Dialog operations
  DIALOG_OPEN_DIRECTORY: 'dialog:open-directory',

  // Shell operations
  SHELL_OPEN_EXTERNAL: 'shell:open-external',

  // Workspace operations
  WORKSPACE_RESCAN: 'workspace:rescan',
  WORKSPACE_GET_PROJECTS: 'workspace:get-projects',
} as const;