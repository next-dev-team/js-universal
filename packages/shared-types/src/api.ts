import { Dictionary, PaginatedResponse, FilterCondition } from './common';

// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

// HTTP Status Codes
export type HttpStatusCode = 
  | 200 | 201 | 202 | 204
  | 400 | 401 | 403 | 404 | 409 | 422 | 429
  | 500 | 502 | 503 | 504;

// Request types
export interface ApiRequest<T = any> {
  url: string;
  method: HttpMethod;
  headers?: Dictionary<string>;
  params?: Dictionary<string | number | boolean>;
  data?: T;
  timeout?: number;
}

export interface ApiRequestConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Dictionary<string>;
  withCredentials?: boolean;
  retries?: number;
  retryDelay?: number;
}

// Response types
export interface ApiResponse<T = any> {
  data: T;
  status: HttpStatusCode;
  statusText: string;
  headers: Dictionary<string>;
  config: ApiRequest;
}

export interface ApiError {
  message: string;
  code?: string | number;
  status?: HttpStatusCode;
  details?: Dictionary<any>;
  timestamp?: string;
}

export interface ApiErrorResponse {
  error: ApiError;
  success: false;
}

export interface ApiSuccessResponse<T = any> {
  data: T;
  success: true;
  message?: string;
}

export type ApiResult<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

// Query types
export interface QueryParams {
  [key: string]: string | number | boolean | string[] | number[] | undefined;
}

export interface ListQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  filters?: FilterCondition[];
}

// REST API types
export interface RestEndpoints<T = any> {
  list: (params?: ListQueryParams) => Promise<PaginatedResponse<T>>;
  get: (id: string | number) => Promise<T>;
  create: (data: Partial<T>) => Promise<T>;
  update: (id: string | number, data: Partial<T>) => Promise<T>;
  delete: (id: string | number) => Promise<void>;
}

// GraphQL types
export interface GraphQLQuery {
  query: string;
  variables?: Dictionary<any>;
  operationName?: string;
}

export interface GraphQLResponse<T = any> {
  data?: T;
  errors?: GraphQLError[];
  extensions?: Dictionary<any>;
}

export interface GraphQLError {
  message: string;
  locations?: Array<{
    line: number;
    column: number;
  }>;
  path?: Array<string | number>;
  extensions?: Dictionary<any>;
}

// WebSocket types
export type WebSocketEventType = 'open' | 'close' | 'error' | 'message';

export interface WebSocketMessage<T = any> {
  type: string;
  payload: T;
  id?: string;
  timestamp?: number;
}

export interface WebSocketConfig {
  url: string;
  protocols?: string | string[];
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

// Authentication types
export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
  expiresAt?: number;
}

export interface AuthUser {
  id: string;
  email?: string;
  username?: string;
  name?: string;
  avatar?: string;
  roles?: string[];
  permissions?: string[];
}

export interface LoginCredentials {
  email?: string;
  username?: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword?: string;
  name?: string;
  username?: string;
  acceptTerms?: boolean;
}

// Rate limiting types
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

// Cache types
export interface ApiCacheConfig {
  ttl?: number; // Time to live in seconds
  maxSize?: number;
  strategy?: 'lru' | 'fifo' | 'lifo';
}

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl?: number;
  hits?: number;
}