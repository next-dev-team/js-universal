import { EventEmitter } from './events';
import { Config } from './config';

// Plugin lifecycle
export type PluginLifecycle = 'init' | 'load' | 'start' | 'stop' | 'unload' | 'destroy';

// Plugin status
export type PluginStatus = 'unloaded' | 'loading' | 'loaded' | 'starting' | 'running' | 'stopping' | 'stopped' | 'error';

// Plugin metadata
export interface PluginMetadata {
  name: string;
  version: string;
  description?: string;
  author?: string;
  license?: string;
  homepage?: string;
  repository?: string;
  keywords?: string[];
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  engines?: Record<string, string>;
}

// Plugin configuration
export interface PluginConfig {
  enabled?: boolean;
  autoStart?: boolean;
  loadOrder?: number;
  options?: Record<string, any>;
  environment?: string[];
}

// Plugin context
export interface PluginContext {
  app: any; // Application instance
  config: Config;
  logger: any; // Logger instance
  events: EventEmitter;
  plugins: PluginManager;
  utils: Record<string, any>;
  [key: string]: any;
}

// Plugin hooks
export interface PluginHooks {
  onInit?: (context: PluginContext) => void | Promise<void>;
  onLoad?: (context: PluginContext) => void | Promise<void>;
  onStart?: (context: PluginContext) => void | Promise<void>;
  onStop?: (context: PluginContext) => void | Promise<void>;
  onUnload?: (context: PluginContext) => void | Promise<void>;
  onDestroy?: (context: PluginContext) => void | Promise<void>;
  onError?: (error: Error, context: PluginContext) => void | Promise<void>;
  onConfigChange?: (config: PluginConfig, context: PluginContext) => void | Promise<void>;
}

// Plugin API
export interface PluginAPI {
  registerHook: (name: string, handler: Function) => void;
  unregisterHook: (name: string, handler: Function) => void;
  executeHook: (name: string, ...args: any[]) => Promise<any[]>;
  registerService: (name: string, service: any) => void;
  getService: <T = any>(name: string) => T | undefined;
  registerCommand: (name: string, handler: Function) => void;
  executeCommand: (name: string, ...args: any[]) => Promise<any>;
  registerRoute: (path: string, handler: Function) => void;
  registerMiddleware: (middleware: Function) => void;
  registerComponent: (name: string, component: any) => void;
  getComponent: (name: string) => any;
}

// Plugin interface
export interface Plugin {
  metadata: PluginMetadata;
  config?: PluginConfig;
  hooks?: PluginHooks;
  
  // Plugin lifecycle methods
  init?(context: PluginContext): void | Promise<void>;
  load?(context: PluginContext): void | Promise<void>;
  start?(context: PluginContext): void | Promise<void>;
  stop?(context: PluginContext): void | Promise<void>;
  unload?(context: PluginContext): void | Promise<void>;
  destroy?(context: PluginContext): void | Promise<void>;
  
  // Plugin API access
  api?: PluginAPI;
  
  // Plugin exports (services, components, etc.)
  exports?: Record<string, any>;
}

// Plugin descriptor
export interface PluginDescriptor {
  id: string;
  name: string;
  version: string;
  path?: string;
  url?: string;
  source: 'local' | 'npm' | 'url' | 'inline';
  config?: PluginConfig;
  metadata?: Partial<PluginMetadata>;
}

// Plugin instance
export interface PluginInstance {
  id: string;
  plugin: Plugin;
  status: PluginStatus;
  context: PluginContext;
  config: PluginConfig;
  metadata: PluginMetadata;
  loadTime?: number;
  startTime?: number;
  error?: Error;
  dependencies: string[];
  dependents: string[];
}

// Plugin manager interface
export interface PluginManager extends EventEmitter {
  // Plugin registration
  register(descriptor: PluginDescriptor): Promise<void>;
  unregister(id: string): Promise<void>;
  
  // Plugin lifecycle
  load(id: string): Promise<void>;
  unload(id: string): Promise<void>;
  start(id: string): Promise<void>;
  stop(id: string): Promise<void>;
  restart(id: string): Promise<void>;
  
  // Plugin queries
  get(id: string): PluginInstance | undefined;
  getAll(): PluginInstance[];
  getByStatus(status: PluginStatus): PluginInstance[];
  isLoaded(id: string): boolean;
  isRunning(id: string): boolean;
  
  // Plugin discovery
  discover(paths: string[]): Promise<PluginDescriptor[]>;
  install(source: string, options?: any): Promise<string>;
  uninstall(id: string): Promise<void>;
  
  // Configuration
  configure(id: string, config: Partial<PluginConfig>): Promise<void>;
  getConfig(id: string): PluginConfig | undefined;
  
  // Dependencies
  resolveDependencies(id: string): string[];
  getDependents(id: string): string[];
  
  // Hooks and services
  executeHook(name: string, ...args: any[]): Promise<any[]>;
  getService<T = any>(name: string): T | undefined;
  executeCommand(name: string, ...args: any[]): Promise<any>;
}

// Plugin loader interface
export interface PluginLoader {
  canLoad(descriptor: PluginDescriptor): boolean;
  load(descriptor: PluginDescriptor): Promise<Plugin>;
  unload(plugin: Plugin): Promise<void>;
}

// Plugin registry interface
export interface PluginRegistry {
  register(descriptor: PluginDescriptor): void;
  unregister(id: string): void;
  get(id: string): PluginDescriptor | undefined;
  getAll(): PluginDescriptor[];
  search(query: string): PluginDescriptor[];
  update(id: string, descriptor: Partial<PluginDescriptor>): void;
}

// Plugin validator interface
export interface PluginValidator {
  validate(plugin: Plugin): ValidationResult;
  validateMetadata(metadata: PluginMetadata): ValidationResult;
  validateConfig(config: PluginConfig): ValidationResult;
  validateDependencies(dependencies: Record<string, string>): ValidationResult;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// Plugin store interface
export interface PluginStore {
  search(query: string, options?: SearchOptions): Promise<PluginSearchResult[]>;
  get(id: string): Promise<PluginStoreEntry | undefined>;
  download(id: string, version?: string): Promise<Uint8Array>;
  getVersions(id: string): Promise<string[]>;
  getMetadata(id: string, version?: string): Promise<PluginMetadata>;
}

interface SearchOptions {
  category?: string;
  tags?: string[];
  author?: string;
  license?: string;
  limit?: number;
  offset?: number;
  sort?: 'name' | 'downloads' | 'rating' | 'updated';
  order?: 'asc' | 'desc';
}

interface PluginSearchResult {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  downloads: number;
  rating: number;
  tags: string[];
  updated: string;
}

interface PluginStoreEntry {
  id: string;
  metadata: PluginMetadata;
  versions: Array<{
    version: string;
    published: string;
    deprecated?: boolean;
  }>;
  stats: {
    downloads: number;
    rating: number;
    reviews: number;
  };
}

// Plugin events
export interface PluginSystemEvent {
  type: 'plugin:registered' | 'plugin:unregistered' | 'plugin:loaded' | 'plugin:unloaded' | 
        'plugin:started' | 'plugin:stopped' | 'plugin:error' | 'plugin:configured';
  pluginId: string;
  plugin?: PluginInstance;
  error?: Error;
  config?: PluginConfig;
  timestamp: number;
}

// Plugin security
export interface PluginSecurity {
  permissions: PluginPermission[];
  sandbox?: boolean;
  trustedSources?: string[];
  allowedAPIs?: string[];
  blockedAPIs?: string[];
}

export interface PluginPermission {
  type: 'filesystem' | 'network' | 'process' | 'system' | 'api';
  resource: string;
  actions: string[];
  description?: string;
}

// Plugin development
export interface PluginDevelopment {
  hotReload?: boolean;
  watchPaths?: string[];
  buildCommand?: string;
  testCommand?: string;
  lintCommand?: string;
  devDependencies?: Record<string, string>;
}

// Plugin manifest (package.json extension)
export interface PluginManifest extends PluginMetadata {
  main: string;
  plugin: {
    config?: PluginConfig;
    hooks?: string[];
    services?: string[];
    commands?: string[];
    routes?: string[];
    components?: string[];
    security?: PluginSecurity;
    development?: PluginDevelopment;
  };
}