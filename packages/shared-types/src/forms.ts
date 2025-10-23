import { ReactNode } from 'react';

// Validation types
export interface ValidationRule<T = any> {
  required?: boolean | string;
  minLength?: number | { value: number; message: string };
  maxLength?: number | { value: number; message: string };
  min?: number | { value: number; message: string };
  max?: number | { value: number; message: string };
  pattern?: RegExp | { value: RegExp; message: string };
  validate?: (value: T) => boolean | string | Promise<boolean | string>;
  custom?: (value: T, formData: Record<string, any>) => boolean | string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FieldValidation {
  [fieldName: string]: ValidationResult;
}

// Form field types
export type FieldType = 
  | 'text' 
  | 'email' 
  | 'password' 
  | 'number' 
  | 'tel' 
  | 'url' 
  | 'search'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'switch'
  | 'date'
  | 'datetime'
  | 'time'
  | 'file'
  | 'range'
  | 'color'
  | 'hidden';

export interface FormFieldOption {
  label: string;
  value: any;
  disabled?: boolean;
  description?: string;
}

export interface BaseFormField {
  name: string;
  type: FieldType;
  label?: string;
  placeholder?: string;
  defaultValue?: any;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  hidden?: boolean;
  description?: string;
  helperText?: string;
  validation?: ValidationRule;
  dependencies?: string[]; // Fields this field depends on
  conditional?: (formData: Record<string, any>) => boolean;
}

export interface TextFormField extends BaseFormField {
  type: 'text' | 'email' | 'password' | 'tel' | 'url' | 'search';
  minLength?: number;
  maxLength?: number;
  autoComplete?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export interface NumberFormField extends BaseFormField {
  type: 'number' | 'range';
  min?: number;
  max?: number;
  step?: number;
}

export interface TextareaFormField extends BaseFormField {
  type: 'textarea';
  rows?: number;
  cols?: number;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export interface SelectFormField extends BaseFormField {
  type: 'select' | 'multiselect';
  options: FormFieldOption[];
  searchable?: boolean;
  clearable?: boolean;
  multiple?: boolean;
}

export interface CheckboxFormField extends BaseFormField {
  type: 'checkbox';
  options?: FormFieldOption[]; // For checkbox groups
}

export interface RadioFormField extends BaseFormField {
  type: 'radio';
  options: FormFieldOption[];
  inline?: boolean;
}

export interface SwitchFormField extends BaseFormField {
  type: 'switch';
  size?: 'sm' | 'md' | 'lg';
}

export interface DateFormField extends BaseFormField {
  type: 'date' | 'datetime' | 'time';
  min?: string;
  max?: string;
  format?: string;
}

export interface FileFormField extends BaseFormField {
  type: 'file';
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  maxFiles?: number;
}

export type FormField = 
  | TextFormField
  | NumberFormField
  | TextareaFormField
  | SelectFormField
  | CheckboxFormField
  | RadioFormField
  | SwitchFormField
  | DateFormField
  | FileFormField;

// Form schema types
export interface FormSection {
  title?: string;
  description?: string;
  fields: FormField[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export interface FormSchema {
  title?: string;
  description?: string;
  sections?: FormSection[];
  fields?: FormField[];
  submitText?: string;
  resetText?: string;
  layout?: 'vertical' | 'horizontal' | 'inline';
  validation?: {
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
    validateOnSubmit?: boolean;
  };
}

// Form state types
export interface FormState<T = Record<string, any>> {
  values: T;
  errors: Record<keyof T, string[]>;
  touched: Record<keyof T, boolean>;
  dirty: Record<keyof T, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
  isValidating: boolean;
  submitCount: number;
}

export interface FormActions<T = Record<string, any>> {
  setValue: (name: keyof T, value: any) => void;
  setValues: (values: Partial<T>) => void;
  setError: (name: keyof T, error: string | string[]) => void;
  setErrors: (errors: Partial<Record<keyof T, string | string[]>>) => void;
  clearError: (name: keyof T) => void;
  clearErrors: () => void;
  setTouched: (name: keyof T, touched?: boolean) => void;
  setTouchedAll: (touched?: boolean) => void;
  reset: (values?: Partial<T>) => void;
  validate: (name?: keyof T) => Promise<boolean>;
  submit: () => Promise<void>;
}

// Form hooks types
export interface UseFormOptions<T = Record<string, any>> {
  initialValues?: Partial<T>;
  validationSchema?: ValidationRule<T>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  onSubmit?: (values: T, actions: FormActions<T>) => void | Promise<void>;
  onValidationError?: (errors: Record<keyof T, string[]>) => void;
}

export interface UseFormReturn<T = Record<string, any>> {
  state: FormState<T>;
  actions: FormActions<T>;
  getFieldProps: (name: keyof T) => {
    name: string;
    value: any;
    onChange: (value: any) => void;
    onBlur: () => void;
    error: boolean;
    helperText?: string;
  };
  handleSubmit: (event?: React.FormEvent) => void;
  handleReset: (event?: React.FormEvent) => void;
}

// Form builder types
export interface FormBuilderProps {
  schema: FormSchema;
  initialValues?: Record<string, any>;
  onSubmit?: (values: Record<string, any>) => void | Promise<void>;
  onValidationError?: (errors: Record<string, string[]>) => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

// Wizard form types
export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  validation?: ValidationRule;
  optional?: boolean;
}

export interface WizardFormProps {
  steps: WizardStep[];
  initialValues?: Record<string, any>;
  onSubmit?: (values: Record<string, any>) => void | Promise<void>;
  onStepChange?: (stepIndex: number, stepId: string) => void;
  allowStepSkip?: boolean;
  showStepNumbers?: boolean;
  showProgressBar?: boolean;
}