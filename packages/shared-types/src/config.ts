import { Environment } from './common';

// Base configuration
export interface BaseConfig {
  environment: Environment;
  debug?: boolean;
  version?: string;
  name?: string;
}

// Application configuration
export interface AppConfig extends BaseConfig {
  title: string;
  description?: string;
  url?: string;
  port?: number;
  host?: string;
  basePath?: string;
  publicPath?: string;
  assetsPath?: string;
  locale?: string;
  timezone?: string;
  features?: Record<string, boolean>;
}

// API configuration
export interface ApiConfig {
  baseURL: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
  withCredentials?: boolean;
  endpoints?: Record<string, string>;
  versioning?: {
    strategy: 'header' | 'query' | 'path';
    version: string;
    header?: string;
    query?: string;
  };
}

// Database configuration
export interface DatabaseConfig {
  type: 'mysql' | 'postgresql' | 'sqlite' | 'mongodb' | 'redis';
  host: string;
  port: number;
  database: string;
  username?: string;
  password?: string;
  ssl?: boolean;
  connectionLimit?: number;
  timeout?: number;
  retries?: number;
  migrations?: {
    directory: string;
    tableName?: string;
  };
}

// Authentication configuration
export interface AuthConfig {
  strategy: 'jwt' | 'session' | 'oauth' | 'basic';
  secret?: string;
  expiresIn?: string | number;
  refreshExpiresIn?: string | number;
  issuer?: string;
  audience?: string;
  algorithms?: string[];
  session?: {
    name: string;
    secret: string;
    maxAge?: number;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  };
  oauth?: {
    providers: Record<string, {
      clientId: string;
      clientSecret: string;
      redirectUri: string;
      scope?: string[];
    }>;
  };
}

// Cache configuration
export interface CacheConfig {
  type: 'memory' | 'redis' | 'memcached';
  ttl?: number;
  maxSize?: number;
  host?: string;
  port?: number;
  password?: string;
  database?: number;
  keyPrefix?: string;
  compression?: boolean;
}

// Logging configuration
export interface LoggingConfig {
  level: 'error' | 'warn' | 'info' | 'debug' | 'trace';
  format?: 'json' | 'text' | 'combined';
  transports?: Array<{
    type: 'console' | 'file' | 'http' | 'database';
    options?: Record<string, any>;
  }>;
  metadata?: boolean;
  timestamp?: boolean;
  colorize?: boolean;
  maxFiles?: number;
  maxSize?: string;
}

// Security configuration
export interface SecurityConfig {
  cors?: {
    origin: string | string[] | boolean;
    methods?: string[];
    allowedHeaders?: string[];
    credentials?: boolean;
    maxAge?: number;
  };
  helmet?: {
    contentSecurityPolicy?: boolean | Record<string, any>;
    crossOriginEmbedderPolicy?: boolean;
    crossOriginOpenerPolicy?: boolean;
    crossOriginResourcePolicy?: boolean;
    dnsPrefetchControl?: boolean;
    frameguard?: boolean | Record<string, any>;
    hidePoweredBy?: boolean;
    hsts?: boolean | Record<string, any>;
    ieNoOpen?: boolean;
    noSniff?: boolean;
    originAgentCluster?: boolean;
    permittedCrossDomainPolicies?: boolean;
    referrerPolicy?: boolean | Record<string, any>;
    xssFilter?: boolean;
  };
  rateLimit?: {
    windowMs: number;
    max: number;
    message?: string;
    standardHeaders?: boolean;
    legacyHeaders?: boolean;
  };
}

// Email configuration
export interface EmailConfig {
  provider: 'smtp' | 'sendgrid' | 'mailgun' | 'ses' | 'postmark';
  from: string;
  replyTo?: string;
  smtp?: {
    host: string;
    port: number;
    secure?: boolean;
    auth?: {
      user: string;
      pass: string;
    };
  };
  apiKey?: string;
  templates?: Record<string, {
    subject: string;
    template: string;
    variables?: string[];
  }>;
}

// Storage configuration
export interface StorageConfig {
  type: 'local' | 's3' | 'gcs' | 'azure' | 'cloudinary';
  path?: string;
  bucket?: string;
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  endpoint?: string;
  publicUrl?: string;
  maxFileSize?: number;
  allowedTypes?: string[];
}

// Monitoring configuration
export interface MonitoringConfig {
  enabled: boolean;
  metrics?: {
    enabled: boolean;
    endpoint?: string;
    interval?: number;
  };
  tracing?: {
    enabled: boolean;
    serviceName: string;
    endpoint?: string;
    sampleRate?: number;
  };
  healthCheck?: {
    enabled: boolean;
    endpoint?: string;
    checks?: Array<{
      name: string;
      check: () => Promise<boolean>;
    }>;
  };
}

// Feature flags configuration
export interface FeatureFlagsConfig {
  provider?: 'local' | 'launchdarkly' | 'split' | 'unleash';
  apiKey?: string;
  environment?: string;
  flags?: Record<string, boolean | string | number>;
  refreshInterval?: number;
}

// Build configuration
export interface BuildConfig {
  target: 'web' | 'node' | 'electron' | 'mobile';
  mode: 'development' | 'production';
  sourceMaps?: boolean;
  minify?: boolean;
  treeshaking?: boolean;
  bundleAnalyzer?: boolean;
  outputPath?: string;
  publicPath?: string;
  entry?: string | Record<string, string>;
  externals?: string[] | Record<string, string>;
  alias?: Record<string, string>;
  define?: Record<string, any>;
}

// Plugin configuration
export interface PluginConfig {
  name: string;
  version?: string;
  enabled?: boolean;
  options?: Record<string, any>;
  dependencies?: string[];
  loadOrder?: number;
}

// Theme configuration
export interface ThemeConfig {
  default: string;
  themes: Record<string, {
    name: string;
    colors: Record<string, string>;
    fonts?: Record<string, string>;
    spacing?: Record<string, string>;
    breakpoints?: Record<string, string>;
  }>;
  darkMode?: 'auto' | 'manual' | 'system';
  customProperties?: boolean;
}

// Internationalization configuration
export interface I18nConfig {
  defaultLocale: string;
  locales: string[];
  fallbackLocale?: string;
  loadPath?: string;
  savePath?: string;
  interpolation?: {
    prefix?: string;
    suffix?: string;
    escapeValue?: boolean;
  };
  detection?: {
    order: Array<'querystring' | 'cookie' | 'localStorage' | 'sessionStorage' | 'navigator' | 'htmlTag'>;
    caches?: Array<'localStorage' | 'cookie'>;
  };
}

// Main configuration interface
export interface Config extends BaseConfig {
  app: AppConfig;
  api?: ApiConfig;
  database?: DatabaseConfig;
  auth?: AuthConfig;
  cache?: CacheConfig;
  logging?: LoggingConfig;
  security?: SecurityConfig;
  email?: EmailConfig;
  storage?: StorageConfig;
  monitoring?: MonitoringConfig;
  featureFlags?: FeatureFlagsConfig;
  build?: BuildConfig;
  plugins?: PluginConfig[];
  theme?: ThemeConfig;
  i18n?: I18nConfig;
  [key: string]: any; // Allow custom configuration sections
}

// Configuration validation
export interface ConfigValidationRule {
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'object' | 'array';
  enum?: any[];
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

export interface ConfigSchema {
  [key: string]: ConfigValidationRule | ConfigSchema;
}

// Configuration loader options
export interface ConfigLoaderOptions {
  files?: string[];
  directories?: string[];
  environment?: boolean;
  commandLine?: boolean;
  defaults?: Partial<Config>;
  schema?: ConfigSchema;
  validate?: boolean;
  watch?: boolean;
  transform?: (config: any) => any;
}