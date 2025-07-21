# Project Create Modal Component

A comprehensive project creation wizard modal with multi-step form validation and template selection.

## Features

- **Multi-Step Wizard**: 3-step process for project creation
- **Form Validation**: Comprehensive validation for all input fields
- **Project Type Selection**: Visual cards for different project types
- **Template System**: Support for project templates with preview
- **Path Browser**: Integration with Electron file dialog (planned)
- **Git Integration**: Options for Git repository initialization
- **Dependency Management**: Auto-install dependencies option
- **Project Summary**: Review before creation
- **Responsive Design**: Mobile-friendly layout
- **Dark Theme Support**: Automatic dark theme styling

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
- Project location path (required)
- Template selection (optional)
  - Empty project
  - Available templates from store

### Step 3: Additional Options
- Git repository URL (optional)
- Initialize Git repository (checkbox)
- Install dependencies automatically (checkbox)
- Project summary review

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