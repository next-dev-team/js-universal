// Base event types
export interface BaseEvent<T = any> {
  type: string;
  payload: T;
  timestamp: number;
  id?: string;
  source?: string;
}

// Custom event types
export interface CustomEvent<T = any> extends BaseEvent<T> {
  bubbles?: boolean;
  cancelable?: boolean;
  preventDefault?: () => void;
  stopPropagation?: () => void;
}

// Event listener types
export type EventListener<T = any> = (
  event: BaseEvent<T>
) => void | Promise<void>;
export type EventListenerOptions = {
  once?: boolean;
  passive?: boolean;
  priority?: number;
};

// Event emitter types
export interface EventEmitter {
  on<T = any>(
    event: string,
    listener: EventListener<T>,
    options?: EventListenerOptions
  ): () => void;
  off<T = any>(event: string, listener: EventListener<T>): void;
  emit<T = any>(event: string, payload: T): void;
  once<T = any>(event: string, listener: EventListener<T>): Promise<T>;
  removeAllListeners(event?: string): void;
  listenerCount(event: string): number;
  eventNames(): string[];
}

// Application events
export interface AppEvent extends BaseEvent {
  type: "app:init" | "app:ready" | "app:error" | "app:destroy";
}

export interface NavigationEvent extends BaseEvent {
  type: "navigation:start" | "navigation:end" | "navigation:error";
  payload: {
    from?: string;
    to: string;
    params?: Record<string, any>;
  };
}

export interface AuthEvent extends BaseEvent {
  type: "auth:login" | "auth:logout" | "auth:refresh" | "auth:error";
  payload: {
    user?: any;
    token?: string;
    error?: string;
  };
}

// UI events
export interface UIEvent extends BaseEvent {
  type:
    | "ui:modal:open"
    | "ui:modal:close"
    | "ui:notification:show"
    | "ui:notification:hide";
}

export interface ModalEvent extends UIEvent {
  type: "ui:modal:open" | "ui:modal:close";
  payload: {
    modalId: string;
    data?: any;
  };
}

export interface NotificationEvent extends UIEvent {
  type: "ui:notification:show" | "ui:notification:hide";
}

// Data events
export interface DataEvent<T = any>
  extends BaseEvent<{
    entity: string;
    data?: T;
    id?: string | number;
    error?: string;
  }> {
  type:
    | "data:create"
    | "data:update"
    | "data:delete"
    | "data:fetch"
    | "data:error";
}

// Cache events
export interface CacheEvent extends BaseEvent {
  type:
    | "cache:hit"
    | "cache:miss"
    | "cache:set"
    | "cache:delete"
    | "cache:clear";
  payload: {
    key: string;
    value?: any;
    ttl?: number;
  };
}

// Form events
export interface FormEvent<T = any>
  extends BaseEvent<{
    formId: string;
    field?: string;
    value?: any;
    values?: T;
    errors?: Record<string, string[]>;
  }> {
  type:
    | "form:change"
    | "form:submit"
    | "form:reset"
    | "form:validate"
    | "form:error";
}

// WebSocket events
export interface WebSocketEvent extends BaseEvent {
  type:
    | "ws:connect"
    | "ws:disconnect"
    | "ws:message"
    | "ws:error"
    | "ws:reconnect";
  payload: {
    url?: string;
    message?: any;
    error?: string;
    attempt?: number;
  };
}

// File events
export interface FileEvent extends BaseEvent {
  type:
    | "file:upload:start"
    | "file:upload:progress"
    | "file:upload:complete"
    | "file:upload:error";
  payload: {
    fileId: string;
    fileName: string;
    fileSize?: number;
    progress?: number;
    url?: string;
    error?: string;
  };
}

// Plugin events
export interface PluginEvent extends BaseEvent {
  type: "plugin:load" | "plugin:unload" | "plugin:error" | "plugin:ready";
  payload: {
    pluginId: string;
    pluginName?: string;
    version?: string;
    error?: string;
  };
}

// Theme events
export interface ThemeEvent extends BaseEvent {
  type: "theme:change" | "theme:load" | "theme:error";
  payload: {
    theme: string;
    previousTheme?: string;
    error?: string;
  };
}

// Performance events
export interface PerformanceEvent extends BaseEvent {
  type: "perf:measure" | "perf:mark" | "perf:navigation" | "perf:resource";
  payload: {
    name: string;
    duration?: number;
    startTime?: number;
    endTime?: number;
    details?: Record<string, any>;
  };
}

// Error events
export interface ErrorEvent extends BaseEvent {
  type:
    | "error:js"
    | "error:network"
    | "error:validation"
    | "error:auth"
    | "error:unknown";
  payload: {
    message: string;
    stack?: string;
    code?: string | number;
    context?: Record<string, any>;
    severity?: "low" | "medium" | "high" | "critical";
  };
}

// Analytics events
export interface AnalyticsEvent extends BaseEvent {
  type:
    | "analytics:track"
    | "analytics:page"
    | "analytics:identify"
    | "analytics:group";
  payload: {
    event?: string;
    properties?: Record<string, any>;
    userId?: string;
    anonymousId?: string;
    groupId?: string;
    traits?: Record<string, any>;
  };
}

// Keyboard events
export interface KeyboardEventData {
  key: string;
  code: string;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  repeat: boolean;
}

export interface KeyboardEvent extends BaseEvent<KeyboardEventData> {
  type: "keyboard:keydown" | "keyboard:keyup" | "keyboard:keypress";
}

// Mouse events
export interface MouseEventData {
  clientX: number;
  clientY: number;
  pageX: number;
  pageY: number;
  button: number;
  buttons: number;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
}

export interface MouseEvent extends BaseEvent<MouseEventData> {
  type:
    | "mouse:click"
    | "mouse:dblclick"
    | "mouse:mousedown"
    | "mouse:mouseup"
    | "mouse:mousemove";
}

// Touch events
export interface TouchEventData {
  touches: Array<{
    identifier: number;
    clientX: number;
    clientY: number;
    pageX: number;
    pageY: number;
  }>;
  changedTouches: Array<{
    identifier: number;
    clientX: number;
    clientY: number;
    pageX: number;
    pageY: number;
  }>;
}

export interface TouchEvent extends BaseEvent<TouchEventData> {
  type: "touch:start" | "touch:move" | "touch:end" | "touch:cancel";
}

// Event bus types
export interface EventBusConfig {
  maxListeners?: number;
  enableLogging?: boolean;
  enableMetrics?: boolean;
}

export interface EventMetrics {
  eventCount: number;
  listenerCount: number;
  averageProcessingTime: number;
  errorCount: number;
  lastEventTime?: number;
}

// IPC Channels for Electron communication
export const IPC_CHANNELS = {
  // Window controls
  WINDOW_MINIMIZE: "window:minimize",
  WINDOW_MAXIMIZE: "window:maximize",
  WINDOW_CLOSE: "window:close",

  // Database operations
  DB_GET_PLUGINS: "db:get-plugins",
  DB_GET_USER_PLUGINS: "db:get-user-plugins",
  DB_GET_SETTINGS: "db:get-settings",
  DB_UPDATE_SETTINGS: "db:update-settings",
  DB_UPDATE_USER: "db:update-user",
  DB_CLEAR_DATA: "db:clear-data",

  // Plugin management
  PLUGIN_INSTALL: "plugin:install",
  PLUGIN_UNINSTALL: "plugin:uninstall",
  PLUGIN_ENABLE: "plugin:enable",
  PLUGIN_DISABLE: "plugin:disable",
  PLUGIN_LAUNCH: "plugin:launch",
  PLUGIN_CLOSE: "plugin:close",

  // User plugin management
  USER_PLUGIN_ENABLE: "user-plugin:enable",
  USER_PLUGIN_DISABLE: "user-plugin:disable",

  // Security
  SECURITY_CHECK_PERMISSION: "security:check-permission",
  SECURITY_REQUEST_PERMISSION: "security:request-permission",

  // Plugin communication
  PLUGIN_MESSAGE: "plugin:message",
  PLUGIN_RESPONSE: "plugin:response",
  PLUGIN_API_CALL: "plugin:api-call",

  // Dialog operations
  DIALOG_OPEN_DIRECTORY: "dialog:open-directory",

  // Shell operations
  SHELL_OPEN_EXTERNAL: "shell:open-external",
} as const;
