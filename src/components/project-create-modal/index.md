# Project Create Modal Component

A comprehensive project creation wizard modal with multi-step form validation, template selection, and advanced project starter builder capabilities.

## Features

### Core Features
- [x] **Multi-Step Wizard**: 4-step process for project creation
- [x] **Form Validation**: Comprehensive validation for all input fields
- [x] **Project Type Selection**: Visual cards for different project types
- [x] **Template System**: Support for project templates with preview
- [x] **Path Browser**: Integration with Electron file dialog
- [x] **Git Integration**: Options for Git repository initialization
- [x] **Dependency Management**: Auto-install dependencies option
- [x] **Project Summary**: Review before creation
- [x] **Responsive Design**: Mobile-friendly layout
- [x] **Dark Theme Support**: Automatic dark theme styling

### Advanced Project Starter Builder
- [x] **Better T Stack Integration**: Full support for Better T Stack CLI
- [x] **Visual Configuration Builder**: Interactive UI for stack selection
- [x] **Live Command Preview**: Real-time CLI command generation
- [x] **Smart Defaults**: Intelligent configuration suggestions
- [x] **Progressive Enhancement**: Step-by-step configuration flow
- [x] **CLI Command Execution**: Automated project scaffolding
- [x] **Error Handling**: Comprehensive error management and recovery
- [ ] **Template Validation**: Ensure compatibility with selected stack
- [ ] **Configuration Persistence**: Save and reuse configurations
- [ ] **Stack Documentation**: Integrated help and documentation

## Usage

```tsx
import ProjectCreateModal from '@/components/project-create-modal';

const [modalOpen, setModalOpen] = useState(false);

const handleSuccess = (projectData) => {
  console.log('Project created:', projectData);
  // Handle success (e.g., refresh project list, navigate)
};

<ProjectCreateModal
  open={modalOpen}
  onCancel={() => setModalOpen(false)}
  onSuccess={handleSuccess}
/>
```

## Props

- `open: boolean` - Controls modal visibility
- `onCancel?: () => void` - Called when modal is cancelled
- `onSuccess?: (project: ProjectCreateRequest) => void` - Called when project is successfully created

## Steps

### Step 1: Project Information
- Project name (required, 2-50 characters, alphanumeric + hyphens/underscores/spaces)
- Description (required, max 200 characters)
- Project type selection (web, mobile, desktop, api, library, other)

### Step 2: Project Setup
- **Standard Projects**:
  - Project location path (required)
  - Template selection (optional)
    - Empty project
    - Available templates from store
- **Better T Stack Projects**:
  - Base directory (optional, defaults to current working directory)
  - Better T Stack toggle to enable advanced configuration

### Step 3: Better T Stack Configuration (when enabled)
- **Frontend Framework**: React, Vue, Svelte, SolidJS, Nuxt, Next.js
- **API Framework**: tRPC, ORPC, Elysia, Hono
- **Database**: Turso, PostgreSQL, MySQL, SQLite, PlanetScale
- **ORM**: Drizzle, Prisma
- **Runtime**: Node.js, Bun, Deno
- **Authentication**: Clerk, Auth0, Supabase, Firebase
- **Add-ons**: Starlight, Storybook, Tailwind CSS, shadcn/ui
- **Examples**: Todo, AI, Blog, E-commerce
- **Package Manager**: npm, yarn, pnpm, bun
- **Live Command Preview**: Real-time generated CLI command display
- **Copy Command**: One-click command copying to clipboard

### Step 4: Additional Options
- Git repository URL (optional)
- Initialize Git repository (checkbox, hidden for Better T Stack)
- Install dependencies automatically (checkbox, hidden for Better T Stack)
- Project summary review with Better T Stack configuration details

## Project Types

1. **Web Application** - Frontend, fullstack, or web-based applications
2. **Mobile Application** - iOS, Android, or cross-platform mobile apps
3. **Desktop Application** - Native desktop applications
4. **API/Backend** - REST APIs, GraphQL, microservices
5. **Library/Package** - Reusable libraries, packages, or components
6. **Other** - Scripts, tools, or other project types

## Templates

Templates are loaded from the project store and can include:
- Template metadata (name, description, type)
- File structure definitions
- Initial configuration files
- Dependency specifications

## Integration Points

- **Project Store**: Uses `useProjectStore` for project creation and template management
- **Electron Dialog**: File browser integration (to be implemented)
- **Git Operations**: Repository initialization (to be implemented)
- **Package Managers**: Dependency installation (to be implemented)

## Validation Rules

- **Project Name**: Required, 2-50 chars, alphanumeric + `-_` and spaces
- **Description**: Required, max 200 characters
- **Type**: Required selection from predefined types
- **Path**: Required, valid file system path
- **Git URL**: Optional, valid Git repository URL format

## Dependencies

- Antd components: Modal, Form, Input, Select, Button, Steps, Card, etc.
- Antd icons: Various icons for UI elements
- Project store: useProjectStore hook
- Project types: TypeScript interfaces