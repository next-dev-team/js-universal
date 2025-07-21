# Project List Component

A comprehensive project listing component that supports both grid and list view modes.

## Features

- **Dual View Modes**: Switch between grid and list views
- **Interactive Cards**: Hover effects and click actions
- **Quick Actions**: Open in explorer, terminal, favorite toggle
- **Project Metadata**: Type, description, last opened date
- **Responsive Design**: Adapts to different screen sizes
- **Loading States**: Skeleton loading for better UX
- **Empty States**: Helpful empty state with call-to-action
- **Dark Theme Support**: Automatic dark theme styling

## Usage

```tsx
import ProjectList from '@/components/project-list';

// Basic usage with internal state
<ProjectList />

// Controlled view mode
<ProjectList 
  viewMode="grid" 
  onViewModeChange={(mode) => setViewMode(mode)}
/>

// Without view toggle
<ProjectList 
  viewMode="list" 
  showViewToggle={false}
/>
```

## Props

- `viewMode?: 'grid' | 'list'` - Current view mode (controlled)
- `onViewModeChange?: (mode: 'grid' | 'list') => void` - View mode change handler
- `showViewToggle?: boolean` - Show/hide view toggle buttons (default: true)
- `className?: string` - Additional CSS class name

## Dependencies

- Antd components: Card, List, Button, Empty, Tooltip, Tag, Space, Avatar
- Antd icons: Various icons for UI elements
- Project store: useProjectStore hook for data management
- Project types: TypeScript interfaces for type safety