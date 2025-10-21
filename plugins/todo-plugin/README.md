# Todo Plugin

A modern, React-based todo application plugin for the Electron Super App platform.

## Features

- ✅ **Add Todos**: Create new tasks with a clean, intuitive interface
- ✅ **Mark Complete**: Toggle todos between active and completed states
- ✅ **Edit Todos**: Double-click any todo to edit it inline
- ✅ **Delete Todos**: Remove individual todos with a single click
- ✅ **Filter Views**: Switch between All, Active, and Completed todos
- ✅ **Bulk Actions**: Mark all todos as complete/incomplete at once
- ✅ **Clear Completed**: Remove all completed todos in one action
- ✅ **Persistent Storage**: All data is saved using the plugin storage API
- ✅ **Responsive Design**: Works great on different screen sizes
- ✅ **Modern UI**: Clean, gradient-based design with smooth animations

## Technology Stack

- **React 18** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **JSX** - Component-based architecture
- **CSS3** - Modern styling with gradients, animations, and responsive design
- **Plugin Storage API** - Persistent data storage through the plugin system

## Plugin Structure

```
todo-plugin/
├── package.json          # Plugin manifest and dependencies
├── vite.config.js        # Vite build configuration
├── index.html           # Entry point HTML file
├── todo-icon.svg        # Plugin icon
├── README.md            # This file
└── src/
    ├── App.jsx          # Main application component
    ├── App.css          # Application styles
    ├── main.jsx         # React entry point
    └── components/
        ├── TodoHeader.jsx    # App header component
        ├── TodoInput.jsx     # Todo input form
        ├── TodoList.jsx      # Todo list container
        ├── TodoItem.jsx      # Individual todo item
        ├── TodoFilter.jsx    # Filter controls
        └── TodoStats.jsx     # Statistics and actions
```

## Development

To develop this plugin:

1. Navigate to the plugin directory:
   ```bash
   cd plugins/todo-plugin
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Plugin API Integration

The plugin integrates with the Electron Super App plugin system through:

- **Storage API**: Persistent data storage using `pluginAPI.storage`
- **Window Configuration**: Responsive window sizing and constraints
- **Plugin Manifest**: Proper metadata and permissions in `package.json`

## Usage

1. **Adding Todos**: Type in the input field and press Enter or click the + button
2. **Completing Todos**: Click the circle next to any todo to mark it complete
3. **Editing Todos**: Double-click on any todo text to edit it inline
4. **Deleting Todos**: Click the trash icon to remove a todo
5. **Filtering**: Use the All/Active/Completed buttons to filter your view
6. **Bulk Actions**: Use the toggle-all button to mark all todos complete/incomplete
7. **Clearing**: Use "Clear completed" to remove all finished todos

## Error Handling

The plugin includes comprehensive error handling for:
- Storage API failures (with localStorage fallback)
- Network connectivity issues
- Invalid input validation
- Loading states and user feedback

## Responsive Design

The plugin is fully responsive and adapts to different screen sizes:
- **Desktop**: Full-width layout with hover effects
- **Mobile**: Stacked layout with touch-friendly controls
- **Small screens**: Optimized spacing and button sizes

## Version

Current version: 1.0.0

## License

This plugin is part of the Electron Super App platform.