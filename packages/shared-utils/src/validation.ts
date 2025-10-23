/**
 * Validation utilities for forms and data validation
 */

export interface ValidationRule {
  test: (value: any) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validators = {
  required: (message = 'This field is required'): ValidationRule => ({
    test: (value: any) => value !== null && value !== undefined && value !== '',
    message,
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    test: (value: string) => !value || value.length >= min,
    message: message || `Must be at least ${min} characters`,
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    test: (value: string) => !value || value.length <= max,
    message: message || `Must be no more than ${max} characters`,
  }),

  email: (message = 'Must be a valid email address'): ValidationRule => ({
    test: (value: string) => {
      if (!value) return true;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
    message,
  }),

  url: (message = 'Must be a valid URL'): ValidationRule => ({
    test: (value: string) => {
      if (!value) return true;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message,
  }),

  pattern: (regex: RegExp, message = 'Invalid format'): ValidationRule => ({
    test: (value: string) => !value || regex.test(value),
    message,
  }),

  number: (message = 'Must be a number'): ValidationRule => ({
    test: (value: any) => value === '' || !isNaN(Number(value)),
    message,
  }),

  min: (min: number, message?: string): ValidationRule => ({
    test: (value: any) => value === '' || Number(value) >= min,
    message: message || `Must be at least ${min}`,
  }),

  max: (max: number, message?: string): ValidationRule => ({
    test: (value: any) => value === '' || Number(value) <= max,
    message: message || `Must be no more than ${max}`,
  }),
};

export function validate(value: any, rules: ValidationRule[]): ValidationResult {
  const errors: string[] = [];

  for (const rule of rules) {
    if (!rule.test(value)) {
      errors.push(rule.message);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateObject(
  obj: Record<string, any>,
  schema: Record<string, ValidationRule[]>
): Record<string, ValidationResult> {
  const results: Record<string, ValidationResult> = {};

  for (const [key, rules] of Object.entries(schema)) {
    results[key] = validate(obj[key], rules);
  }

  return results;
}

export function isValidationPassing(results: Record<string, ValidationResult>): boolean {
  return Object.values(results).every(result => result.isValid);
}