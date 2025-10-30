// Local types for renderer components to avoid complex import paths

export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  icon?: string;
  enabled: boolean;
  installed: boolean;
  path: string;
  manifest: PluginManifest;
  createdAt: Date;
  updatedAt: Date;
}

export interface PluginManifest {
  name: string;
  version: string;
  description: string;
  author: string;
  main: string;
  icon?: string;
  permissions: string[];
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
}

export interface UserPlugin {
  id: string;
  userId: string;
  pluginId: string;
  enabled: boolean;
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppSettings {
  id: string;
  key: string;
  value: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  preferences: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}