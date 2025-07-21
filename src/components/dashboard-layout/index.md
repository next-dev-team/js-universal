# DashboardLayout Component

A comprehensive dashboard layout component that provides the main structure for the project management application, including header, sidebar navigation, and content area.

## Features

### Layout Structure
- **Responsive sidebar** with collapsible navigation
- **Header** with search, actions, and user menu
- **Main content area** with proper spacing and scrolling
- **Sticky header** for consistent navigation access

### Navigation
- **Menu items** for different project views (All, Favorites, Recent, Categories)
- **Category filtering** by project type (Web, Mobile, Desktop, Backend)
- **Active state management** with visual indicators
- **Keyboard navigation** support

### Header Features
- **Collapsible sidebar toggle** for space optimization
- **Integrated search** with ProjectSearch component
- **Quick actions** (Create Project, Search, Notifications)
- **User menu** with profile, settings, and utility options
- **Responsive design** with mobile-friendly adaptations

### Sidebar Features
- **Project statistics** display (Total Projects, Favorites)
- **Hierarchical menu** with categories and subcategories
- **Visual feedback** for active and hover states
- **Smooth animations** for expand/collapse

### Integration
- **Zustand store** integration for state management
- **Project creation modal** integration
- **Search and filtering** capabilities
- **Theme support** (light/dark modes)

## Usage

### Basic Usage
```tsx
import { DashboardLayout } from './components/dashboard-layout';
import { ProjectList } from './components/project-list';

function App() {
  return (
    <DashboardLayout title="My Projects">
      <ProjectList />
    </DashboardLayout>
  );
}
```

### With Custom Configuration
```tsx
<DashboardLayout
  title="Project Dashboard"
  showSearch={true}
  showCreateButton={true}
>
  <YourContent />
</DashboardLayout>
```

### Without Search or Create Button
```tsx
<DashboardLayout
  title="Settings"
  showSearch={false}
  showCreateButton={false}
>
  <SettingsPanel />
</DashboardLayout>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | - | Content to render in the main area |
| `title` | `string` | `'Project Manager'` | Page title displayed in header |
| `showSearch` | `boolean` | `true` | Whether to show search component in header |
| `showCreateButton` | `boolean` | `true` | Whether to show create project button |

## Menu Structure

### Main Navigation
- **Dashboard** - Overview and statistics
- **All Projects** - Complete project listing
- **Favorites** - Starred/favorite projects
- **Recent** - Recently opened projects
- **Categories** - Projects grouped by type
  - Web
  - Mobile
  - Desktop
  - Backend
- **Tags** - Tag-based organization

### User Menu
- **Profile** - User profile management
- **Settings** - Application preferences
- **Help & Support** - Documentation and support
- **GitHub** - External link to repository
- **Report Issue** - Bug reporting
- **Logout** - User session management

## Responsive Behavior

### Desktop (>1200px)
- Full sidebar with statistics
- Complete header with all elements
- Spacious content padding

### Tablet (768px - 1200px)
- Reduced header search width
- Maintained sidebar functionality
- Adjusted content padding

### Mobile (<768px)
- Hidden header search (accessible via button)
- Collapsed user menu text
- Icon-only create button
- Reduced content padding

### Small Mobile (<576px)
- Fixed positioned sidebar
- Overlay navigation
- Minimal header elements
- Compact content layout

## State Management

### Store Integration
```tsx
const {
  projects,
  filters,
  templates,
  isLoading,
  setFilters,
  clearFilters,
  loadProjects,
  loadTemplates,
  createProject,
  getProjectStats
} = useProjectStore();
```

### Navigation State
- `selectedKeys` - Currently active menu items
- `collapsed` - Sidebar collapse state
- `createModalVisible` - Project creation modal visibility

## Styling Classes

### Layout Classes
- `.dashboard-layout` - Main layout container
- `.dashboard-sidebar` - Sidebar container
- `.dashboard-header` - Header container
- `.dashboard-content` - Main content area

### Component Classes
- `.sidebar-header` - Sidebar logo area
- `.sidebar-stats` - Statistics display
- `.sidebar-menu` - Navigation menu
- `.header-left` - Header left section
- `.header-center` - Header center (search)
- `.header-right` - Header right (actions)
- `.content-wrapper` - Content padding wrapper

### Interactive Classes
- `.collapse-trigger` - Sidebar toggle button
- `.create-button` - New project button
- `.header-action` - Header action buttons
- `.user-menu` - User dropdown trigger

## Accessibility

### Keyboard Navigation
- **Tab navigation** through all interactive elements
- **Arrow keys** for menu navigation
- **Enter/Space** for menu item activation
- **Escape** for modal/dropdown closing

### Screen Reader Support
- **Semantic HTML** structure
- **ARIA labels** for interactive elements
- **Role attributes** for navigation
- **Focus management** for modals

### Visual Indicators
- **Focus outlines** for keyboard navigation
- **Active states** for current selection
- **Hover effects** for interactive elements
- **Loading states** for async operations

## Performance

### Optimizations
- **Lazy loading** of menu items
- **Memoized callbacks** for event handlers
- **Efficient re-renders** with proper dependencies
- **Smooth animations** with CSS transitions

### Bundle Size
- **Tree shaking** compatible exports
- **Minimal dependencies** (Ant Design, React)
- **CSS optimization** with custom properties

## Dependencies

### Required
- `react` - Core React library
- `antd` - UI component library
- `@ant-design/icons` - Icon components
- `zustand` - State management (via store)

### Optional
- `react-router-dom` - For navigation routing
- `@types/react` - TypeScript support

## Error Handling

### Error Boundaries
- Graceful fallback for component errors
- Error logging for debugging
- User-friendly error messages

### Network Errors
- Retry mechanisms for failed requests
- Offline state handling
- Loading state management

## Future Enhancements

### Planned Features
- **Customizable sidebar** with drag-and-drop
- **Multiple theme options** beyond light/dark
- **Workspace switching** for different project sets
- **Advanced search** with saved queries
- **Notification center** with real-time updates

### Integration Points
- **Router integration** for URL-based navigation
- **Internationalization** support
- **Plugin system** for extensibility
- **Analytics integration** for usage tracking