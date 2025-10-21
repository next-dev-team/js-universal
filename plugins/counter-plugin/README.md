# Counter Plugin

A simple counter plugin that demonstrates the basic functionality of the Electron Plugin System.

## Features

- **Increment/Decrement**: Use buttons or keyboard shortcuts to modify the counter
- **Reset**: Reset the counter back to zero
- **Persistent Storage**: Counter value and statistics are saved between sessions
- **Session Tracking**: Shows total clicks and session duration
- **Keyboard Shortcuts**: 
  - Arrow Up / `+` key: Increment
  - Arrow Down / `-` key: Decrement  
  - Ctrl/Cmd + R: Reset
- **Notifications**: Milestone notifications for every 10th increment
- **Responsive Design**: Works on different window sizes

## Installation

1. Copy the `counter-plugin` folder to your plugins directory
2. Use the Plugin Manager in the main application to install the plugin
3. Enable and launch the plugin from the Plugin Manager

## Plugin Structure

```
counter-plugin/
├── package.json      # Plugin manifest with metadata
├── index.html        # Main UI interface
├── script.js         # Plugin logic and functionality
├── styles.css        # Styling and responsive design
├── counter-icon.svg  # Plugin icon
└── README.md         # This documentation
```

## Plugin API Integration

This plugin demonstrates integration with the Plugin API:

- **Storage API**: Saves counter value and statistics
- **Notifications API**: Shows milestone notifications
- **Communication API**: Handles inter-plugin messaging
- **Window API**: Configures plugin window properties

## Development

The plugin is built with vanilla HTML, CSS, and JavaScript for maximum compatibility and minimal dependencies. It includes:

- Fallback mechanisms for when Plugin API is not available
- Error handling and graceful degradation
- Accessibility features (keyboard navigation, focus styles)
- Modern CSS with gradients and animations
- Responsive design for different screen sizes

## Version History

- **v1.0.0**: Initial release with basic counter functionality, persistent storage, and modern UI

## License

This plugin is provided as a sample for the Electron Plugin System.