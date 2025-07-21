# Project Search Component

A comprehensive search and filtering component for project management with advanced filtering capabilities, sorting options, and responsive design.

## Features

- **Real-time Search**: Debounced search with instant results
- **Advanced Filtering**: Filter by project type, favorites, date range, and size
- **Flexible Sorting**: Sort by name, last opened, created date, type, or favorites
- **Active Filter Display**: Visual representation of applied filters
- **Responsive Design**: Adapts to different screen sizes with compact mode
- **Dark Theme Support**: Automatic dark theme styling
- **Search Statistics**: Display total projects and active filter count
- **Keyboard Navigation**: Full keyboard accessibility support

## Usage

```tsx
import ProjectSearch from '@/components/project-search';

// Basic usage
<ProjectSearch />

// With event handlers
<ProjectSearch 
  onSearch={(query) => console.log('Search:', query)}
  onFilter={(filters) => console.log('Filters:', filters)}
  onSort={(sort) => console.log('Sort:', sort)}
/>

// Compact mode for smaller spaces
<ProjectSearch 
  compact={true}
  showAdvancedFilters={false}
/>

// Custom styling
<ProjectSearch 
  className="custom-search"
  showAdvancedFilters={true}
/>
```

## Props

- `onSearch?: (query: string) => void` - Callback when search query changes
- `onFilter?: (filters: ProjectFilter) => void` - Callback when filters are applied
- `onSort?: (sort: SortOption) => void` - Callback when sort options change
- `className?: string` - Additional CSS class name
- `showAdvancedFilters?: boolean` - Show advanced filter options (default: true)
- `compact?: boolean` - Use compact layout (default: false)

## Filter Options

### Project Types
- React (with color coding)
- Vue
- Angular
- Node.js
- Python
- Java
- C#
- Go
- Rust
- Other

### Advanced Filters
- **Favorites**: Show only favorited projects
- **Date Range**: Filter by last modified date
- **Project Size**: Filter by project size in MB
- **Tags**: Filter by project tags (future enhancement)

## Sort Options

- **Name**: Alphabetical sorting
- **Last Opened**: Most recently opened projects
- **Created Date**: Project creation date
- **Project Type**: Group by project type
- **Favorites**: Prioritize favorited projects

Each sort option supports ascending/descending order.

## Search Features

### Real-time Search
- 300ms debounce for optimal performance
- Searches across project name, description, and tags
- Clear search functionality
- Search query persistence

### Filter Management
- Visual filter chips with remove functionality
- "Clear all" option for quick reset
- Filter count badge on filter button
- Temporary filter state before applying

### Statistics Display
- Total project count
- Active search query display
- Active filter count
- Real-time updates

## Responsive Behavior

### Desktop (>768px)
- Full horizontal layout
- All controls visible
- Advanced filter dropdown
- Complete statistics display

### Tablet (768px - 480px)
- Stacked search controls
- Reduced filter dropdown width
- Single column checkbox grid
- Simplified statistics

### Mobile (<480px)
- Compact padding and spacing
- Smaller filter tags
- Reduced font sizes
- Touch-optimized interactions

## Compact Mode

When `compact={true}`:
- Minimal padding and styling
- Input and filter button in single row
- No search statistics
- No active filter display
- Ideal for sidebars or small spaces

## Integration with Store

The component integrates with Zustand store:

```typescript
// Store methods used
const {
  searchQuery,
  filters,
  sortBy,
  sortOrder,
  setSearchQuery,
  setFilters,
  setSortBy,
  setSortOrder,
  clearFilters,
  getProjectStats
} = useProjectStore();
```

## Styling Classes

- `.project-search` - Main container
- `.project-search.compact` - Compact mode modifier
- `.search-header` - Search input and controls container
- `.search-input-container` - Search input wrapper
- `.search-controls` - Sort and filter controls
- `.filter-dropdown` - Filter options dropdown
- `.active-filters` - Active filter chips container
- `.search-stats` - Statistics display
- `.filter-badge` - Filter count badge

## Accessibility Features

- **Keyboard Navigation**: Tab through all interactive elements
- **Screen Reader Support**: ARIA labels and descriptions
- **Focus Indicators**: Clear focus states for all controls
- **Color Contrast**: Meets WCAG guidelines
- **Semantic HTML**: Proper heading hierarchy and structure

## Performance Optimizations

- **Debounced Search**: Prevents excessive API calls
- **Memoized Options**: Project type options cached
- **Efficient Filtering**: Optimized filter application
- **Lazy Loading**: Filter dropdown content loaded on demand

## Dependencies

- Antd components: Input, Select, Button, Space, Tag, Dropdown, Checkbox, DatePicker, Slider
- Antd icons: Various search and filter icons
- Project store: useProjectStore hook
- Project types: TypeScript interfaces
- React hooks: useState, useEffect, useMemo

## Error Handling

- Graceful fallbacks for missing data
- Input validation for filter values
- Error boundaries for component isolation
- Console logging for debugging

## Future Enhancements

- **Saved Searches**: Save and recall search configurations
- **Search History**: Recent search queries
- **Custom Tags**: User-defined project tags
- **Advanced Operators**: Boolean search operators
- **Export Filters**: Share filter configurations
- **Search Analytics**: Track popular searches