// Basic utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

// Object utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// Function utility types
export type AnyFunction = (...args: any[]) => any;
export type VoidFunction = () => void;
export type AsyncFunction<T = any> = (...args: any[]) => Promise<T>;

// Array utility types
export type NonEmptyArray<T> = [T, ...T[]];
export type ArrayElement<T> = T extends (infer U)[] ? U : never;

// String utility types
export type StringLiteral<T> = T extends string ? (string extends T ? never : T) : never;

// Key utility types
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

export type ValuesOf<T> = T[keyof T];

// Branded types
export type Brand<T, B> = T & { __brand: B };

// ID types
export type ID = Brand<string, 'ID'>;
export type UUID = Brand<string, 'UUID'>;

// Common data structures
export interface Dictionary<T = any> {
  [key: string]: T;
}

export interface NumericDictionary<T = any> {
  [key: number]: T;
}

// Timestamp types
export type Timestamp = Brand<number, 'Timestamp'>;
export type ISODateString = Brand<string, 'ISODateString'>;

// Status types
export type Status = 'idle' | 'loading' | 'success' | 'error';
export type LoadingState = 'idle' | 'pending' | 'fulfilled' | 'rejected';

// Common response wrapper
export interface Result<T, E = Error> {
  success: boolean;
  data?: T;
  error?: E;
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Sort types
export type SortDirection = 'asc' | 'desc';

export interface SortParams<T = string> {
  field: T;
  direction: SortDirection;
}

// Filter types
export type FilterOperator = 
  | 'eq' 
  | 'ne' 
  | 'gt' 
  | 'gte' 
  | 'lt' 
  | 'lte' 
  | 'in' 
  | 'nin' 
  | 'contains' 
  | 'startsWith' 
  | 'endsWith';

export interface FilterCondition<T = any> {
  field: string;
  operator: FilterOperator;
  value: T;
}

// Environment types
export type Environment = 'development' | 'staging' | 'production' | 'test';