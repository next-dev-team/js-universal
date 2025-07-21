// Project Data Models and Types

export interface Project {
  id: string;
  name: string;
  description?: string;
  type: ProjectType;
  path: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  lastOpenedAt?: Date;
  isFavorite: boolean;
  thumbnail?: string;
  gitRepository?: string;
  size?: number; // in bytes
  status: ProjectStatus;
  metadata: ProjectMetadata;
}

export type ProjectType =
  | 'web'
  | 'react'
  | 'vue'
  | 'angular'
  | 'nodejs'
  | 'python'
  | 'java'
  | 'csharp'
  | 'cpp'
  | 'go'
  | 'rust'
  | 'php'
  | 'ruby'
  | 'flutter'
  | 'react-native'
  | 'electron'
  | 'desktop'
  | 'mobile'
  | 'other';

export type ProjectStatus = 'active' | 'archived' | 'template' | 'draft';

export interface ProjectMetadata {
  framework?: string;
  version?: string;
  dependencies?: string[];
  scripts?: Record<string, string>;
  environment?: 'development' | 'staging' | 'production';
  buildTool?: string;
  packageManager?: 'npm' | 'yarn' | 'pnpm' | 'bun';
  size?: number; // in bytes
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  type: ProjectType;
  thumbnail?: string;
  files: TemplateFile[];
  dependencies?: string[];
  scripts?: Record<string, string>;
  gitRepository?: string;
}

export interface TemplateFile {
  path: string;
  content: string;
  isDirectory?: boolean;
}

export interface ProjectCreateRequest {
  name: string;
  description?: string;
  type: ProjectType;
  template?: string;
  path: string;
  gitInit?: boolean;
  gitRepository?: string;
  initializeGit?: boolean;
  installDependencies?: boolean;
  tags?: string[];
}

export interface ProjectUpdateRequest {
  id: string;
  name?: string;
  description?: string;
  tags?: string[];
  isFavorite?: boolean;
  status?: ProjectStatus;
  lastOpenedAt?: Date;
}

export interface ProjectSearchFilters {
  query?: string;
  type?: ProjectType;
  status?: ProjectStatus;
  tags?: string[];
  isFavorite?: boolean;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'lastOpenedAt' | 'size';
  sortOrder?: 'asc' | 'desc';
}

// Additional interfaces for search component
export interface ProjectFilter {
  types?: string[];
  favorites?: boolean;
  dateRange?: [any, any] | undefined;
  sizeRange?: [number, number] | undefined;
  tags?: string[];
}

export interface SortOption {
  field: 'name' | 'lastOpened' | 'createdAt' | 'type' | 'favorite';
  order: 'asc' | 'desc';
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  command: string;
  args?: string[];
  workingDirectory?: string;
  requiresProject?: boolean;
  projectTypes?: ProjectType[];
}

export interface IDE {
  id: string;
  name: string;
  executable: string;
  args?: string[];
  icon?: string;
  supportedTypes?: ProjectType[];
}

export interface ProjectStats {
  totalProjects: number;
  projectsByType: Record<ProjectType, number>;
  recentProjects: Project[];
  favoriteProjects: Project[];
  totalSize: number;
}

// Store State Interfaces
export interface ProjectStore {
  projects: Project[];
  templates: ProjectTemplate[];
  quickActions: QuickAction[];
  ides: IDE[];
  filters: ProjectSearchFilters;
  selectedProject?: Project;
  isLoading: boolean;
  error?: string;

  // Actions
  loadProjects: () => Promise<void>;
  createProject: (request: ProjectCreateRequest) => Promise<Project>;
  updateProject: (request: ProjectUpdateRequest) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  searchProjects: (filters: ProjectSearchFilters) => Project[];
  toggleFavorite: (id: string) => Promise<void>;
  openProject: (id: string, ideId?: string) => Promise<void>;
  setFilters: (filters: Partial<ProjectSearchFilters>) => void;
  clearFilters: () => void;
  getProjectStats: () => ProjectStats;
}

// UI Component Props
export interface ProjectCardProps {
  project: Project;
  onOpen: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onToggleFavorite: (project: Project) => void;
  viewMode: 'grid' | 'list';
}

export interface ProjectListProps {
  projects: Project[];
  viewMode: 'grid' | 'list';
  onProjectAction: (action: string, project: Project) => void;
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  showViewToggle?: boolean;
  className?: string;
  loading?: boolean;
}

export interface ProjectCreateModalProps {
  visible?: boolean;
  open?: boolean;
  onCancel: () => void;
  onSubmit?: (request: ProjectCreateRequest) => void;
  onSuccess?: (request: ProjectCreateRequest) => void;
  templates?: ProjectTemplate[];
  loading?: boolean;
}

export interface ProjectSearchProps {
  filters?: ProjectSearchFilters;
  onFiltersChange?: (filters: Partial<ProjectSearchFilters>) => void;
  onClear?: () => void;
  onSearch?: (query: string) => void;
  onFilter?: (filters: ProjectSearchFilters) => void;
  onSort?: (sort: SortOption) => void;
  className?: string;
  showAdvancedFilters?: boolean;
  compact?: boolean;
}

export interface QuickActionsProps {
  project: Project;
  size?: 'small' | 'middle' | 'large';
  type?: 'default' | 'primary' | 'dashed' | 'link' | 'text';
  showLabels?: boolean;
  actions?: ('explorer' | 'terminal' | 'open' | 'edit' | 'favorite' | 'more')[];
  className?: string;
}
