# Quick Actions Component

A versatile component that provides quick action buttons for project operations like opening in file explorer, terminal, IDE, and more.

## Features

- **File Explorer Integration**: Open project folder in system file explorer
- **Terminal Integration**: Open project in terminal/command prompt
- **IDE Integration**: Open project in various IDEs (VS Code, WebStorm, etc.)
- **Project Operations**: Open, edit, favorite, delete projects
- **Flexible Actions**: Configurable action buttons
- **Dropdown Menu**: "More" menu with additional options
- **Electron Integration**: Native desktop app functionality
- **Responsive Design**: Adapts to different screen sizes
- **Dark Theme Support**: Automatic dark theme styling

## Usage

```tsx
import QuickActions from '@/components/quick-actions';

// Basic usage with default actions
<QuickActions project={project} />

// Custom actions and styling
<QuickActions 
  project={project}
  actions={['open', 'explorer', 'terminal', 'favorite']}
  size="large"
  showLabels={true}
  type="primary"
/>

// Compact mode
<QuickActions 
  project={project}
  actions={['open', 'more']}
  size="small"
  className="compact"
/>
```

## Props

- `project: Project` - Project object (required)
- `size?: 'small' | 'middle' | 'large'` - Button size (default: 'middle')
- `type?: 'default' | 'primary' | 'text'` - Button type (default: 'default')
- `showLabels?: boolean` - Show text labels on buttons (default: false)
- `actions?: string[]` - Array of action names to display (default: ['explorer', 'terminal', 'open', 'more'])
- `className?: string` - Additional CSS class name

## Available Actions

### Primary Actions
- `'open'` - Open project (primary button)
- `'explorer'` - Open in file explorer
- `'terminal'` - Open in terminal
- `'edit'` - Edit project settings
- `'favorite'` - Toggle favorite status
- `'more'` - Show dropdown with additional options

### More Menu Options
- **Add/Remove Favorites** - Toggle project favorite status
- **Copy Path** - Copy project path to clipboard
- **Open in IDE** - Submenu with available IDEs
- **Project Settings** - Open project configuration
- **Remove Project** - Remove project from list

## Electron Integration

The component integrates with Electron APIs for native functionality:

### File Explorer
```typescript
// Uses Electron's shell API
window.electronAPI.shell.openPath(project.path)
```

### Terminal
```typescript
// Uses custom Electron IPC
window.electronAPI.terminal.open(project.path)
```

### IDE Integration
```typescript
// Opens project in specified IDE
window.electronAPI.ide.open(project.path, ide.command)
```

## Fallback Behavior

When running in web environment (development), the component:
- Logs actions to console
- Shows informational messages
- Maintains UI functionality
- Gracefully handles missing Electron APIs

## Styling Classes

- `.quick-actions` - Main container
- `.quick-action-btn` - Individual action buttons
- `.quick-action-btn.primary` - Primary action button
- `.favorite-active` - Active favorite icon
- `.ide-icon` - IDE icon container
- `.compact` - Compact mode modifier
- `.vertical` - Vertical layout modifier

## Responsive Behavior

- **Desktop**: Full buttons with optional labels
- **Tablet**: Buttons without labels
- **Mobile**: Compact buttons with reduced spacing

## Accessibility

- Keyboard navigation support
- Screen reader friendly tooltips
- Focus indicators
- ARIA labels for icon-only buttons

## Dependencies

- Antd components: Button, Tooltip, Dropdown, Space
- Antd icons: Various action icons
- Project store: useProjectStore hook
- Electron APIs: For native functionality
- Project types: TypeScript interfaces

## Error Handling

- Graceful fallbacks for missing Electron APIs
- User feedback via message notifications
- Console logging for debugging
- Non-blocking error recovery