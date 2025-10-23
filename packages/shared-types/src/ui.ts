import { ReactNode, CSSProperties, MouseEvent, KeyboardEvent, FocusEvent, ChangeEvent } from 'react';

// Base component props
export interface BaseComponentProps {
  className?: string;
  style?: CSSProperties;
  id?: string;
  'data-testid'?: string;
}

// Size variants
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ComponentSize = 'small' | 'medium' | 'large';

// Color variants
export type ColorVariant = 
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'warning' 
  | 'danger' 
  | 'info' 
  | 'light' 
  | 'dark';

// Button types
export interface ButtonProps extends BaseComponentProps {
  variant?: 'solid' | 'outline' | 'ghost' | 'link';
  size?: ComponentSize;
  color?: ColorVariant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  onFocus?: (event: FocusEvent<HTMLButtonElement>) => void;
  onBlur?: (event: FocusEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
}

// Input types
export interface InputProps extends BaseComponentProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  value?: string | number;
  defaultValue?: string | number;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  size?: ComponentSize;
  error?: boolean;
  helperText?: string;
  label?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
}

// Modal types
export interface ModalProps extends BaseComponentProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  children: ReactNode;
}

// Card types
export interface CardProps extends BaseComponentProps {
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: Size;
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
}

// Badge types
export interface BadgeProps extends BaseComponentProps {
  variant?: ColorVariant;
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

// Tooltip types
export interface TooltipProps extends BaseComponentProps {
  content: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click' | 'focus';
  delay?: number;
  children: ReactNode;
}

// Spinner types
export interface SpinnerProps extends BaseComponentProps {
  size?: ComponentSize;
  color?: ColorVariant;
  thickness?: number;
}

// Alert types
export interface AlertProps extends BaseComponentProps {
  variant?: ColorVariant;
  title?: string;
  description?: string;
  closable?: boolean;
  onClose?: () => void;
  children?: ReactNode;
}

// Dropdown types
export interface DropdownOption<T = any> {
  label: string;
  value: T;
  disabled?: boolean;
  icon?: ReactNode;
}

export interface DropdownProps<T = any> extends BaseComponentProps {
  options: DropdownOption<T>[];
  value?: T;
  defaultValue?: T;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  multiple?: boolean;
  clearable?: boolean;
  loading?: boolean;
  error?: boolean;
  helperText?: string;
  label?: string;
  onChange?: (value: T | T[]) => void;
  onSearch?: (query: string) => void;
}

// Table types
export interface TableColumn<T = any> {
  key: keyof T | string;
  title: string;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  render?: (value: any, record: T, index: number) => ReactNode;
}

export interface TableProps<T = any> extends BaseComponentProps {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  rowKey?: keyof T | ((record: T) => string);
  onRowClick?: (record: T, index: number) => void;
  emptyText?: ReactNode;
}

// Navigation types
export interface NavItem {
  key: string;
  label: string;
  icon?: ReactNode;
  href?: string;
  onClick?: () => void;
  children?: NavItem[];
  disabled?: boolean;
  badge?: string | number;
}

export interface NavigationProps extends BaseComponentProps {
  items: NavItem[];
  activeKey?: string;
  mode?: 'horizontal' | 'vertical';
  collapsed?: boolean;
  onItemClick?: (item: NavItem) => void;
}

// Form types
export interface FormFieldProps extends BaseComponentProps {
  name: string;
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  children: ReactNode;
}

// Layout types
export interface LayoutProps extends BaseComponentProps {
  children: ReactNode;
}

export interface GridProps extends BaseComponentProps {
  columns?: number;
  gap?: Size;
  children: ReactNode;
}

export interface FlexProps extends BaseComponentProps {
  direction?: 'row' | 'column';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'center' | 'end' | 'stretch';
  wrap?: boolean;
  gap?: Size;
  children: ReactNode;
}

// Theme types
export interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  light: string;
  dark: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
}

export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface ThemeBorderRadius {
  none: string;
  sm: string;
  md: string;
  lg: string;
  full: string;
}

export interface Theme {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
  };
}