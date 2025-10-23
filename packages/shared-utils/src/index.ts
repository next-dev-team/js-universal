/**
 * Shared utilities for common operations
 */

// Array utilities
export * from './array';

// Object utilities (with renamed conflicting exports)
export {
  deepClone,
  deepMerge,
  isObject,
  pick,
  omit,
  get,
  set,
  has,
  isEmpty as isObjectEmpty,
  isEqual,
  mapValues,
  mapKeys,
  invert,
  flatten as flattenObject
} from './object';

// String utilities
export * from './string';

// Date utilities
export * from './date';

// Validation utilities
export * from './validation';

// Async utilities
export * from './async';

// DOM utilities
export * from './dom';

// Storage utilities
export * from './storage';

// URL utilities
export * from './url';

// Math utilities (with renamed conflicting exports)
export {
  clamp,
  lerp,
  mapRange,
  roundTo,
  isBetween,
  randomBetween,
  randomInt,
  distance,
  angle,
  toRadians,
  toDegrees,
  gcd,
  lcm,
  isPrime,
  factorial,
  fibonacci,
  sum as mathSum,
  average as mathAverage,
  median,
  mode,
  standardDeviation,
  variance,
  isEven,
  isOdd,
  sign
} from './math';