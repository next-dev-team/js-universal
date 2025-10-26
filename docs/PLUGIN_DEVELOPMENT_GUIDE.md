# Plugin Development Guide

This guide explains how to develop plugins for the Super App with hot reload and real-time testing capabilities.

## Overview

The Super App supports a plugin system similar to WeChat mini programs, where plugins run in sandboxed environments with controlled access to system resources. The development mode provides hot reload, real-time communication, and extensive debugging tools.

## Quick Start

### 1. Start Development Environment

```bash
# Start the main Electron app
npm run dev

# In another terminal, start the development plugin server
npm run counter-app-dev
```

### 2. Access Development Plugin

The counter-app-dev plugin will automatically load in development mode with:

- Hot reload enabled
- Development tools visible
- Real-time communication testing
- Performance monitoring

## Plugin Architecture

### Core Components

1. **PluginDevLoader**: Manages development plugins with hot reload
2. **PluginAPIBridge**: Provides secure API access to plugins
3. **Plugin Sandbox**: Isolated execution environment for plugins
4. **IPC Communication**: Message passing between main and renderer processes

### Plugin Structure

```
your-plugin/
├── index.html          # Plugin entry point
├── script.js           # Plugin logic
├── styles.css          # Plugin styling
├── package.json        # Plugin manifest
├── vite.config.js      # Development server config (optional)
└── README.md          # Plugin documentation
```

## Plugin API

### Storage API

```javascript
// Save data
await window.pluginAPI.storage.set("key", value);

// Load data
const value = await window.pluginAPI.storage.get("key");

// Remove data
await window.pluginAPI.storage.remove("key");

// Clear all data
await window.pluginAPI.storage.clear();
```

### Notifications API

```javascript
// Show system notification
await window.pluginAPI.notifications.show("Title", "Message", {
  icon: "path/to/icon.png",
  sound: true,
});
```

### Communication API

```javascript
// Send message to specific plugin
await window.pluginAPI.communication.sendMessage("target-plugin-id", {
  type: "message-type",
  data: {
    /* your data */
  },
});

// Listen for messages
window.pluginAPI.communication.onMessage((message) => {
  console.log("Received message:", message);
  // Handle message
});
```

### Network API (with permissions)

```javascript
// Make HTTP requests
const response = await window.pluginAPI.network.fetch(
  "https://api.example.com/data",
  {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }
);

const data = await response.json();
```

### File System API (with permissions)

```javascript
// Read file
const content = await window.pluginAPI.filesystem.readFile("/path/to/file.txt");

// Write file
await window.pluginAPI.filesystem.writeFile("/path/to/file.txt", "content");

// Check if file exists
const exists = await window.pluginAPI.filesystem.exists("/path/to/file.txt");
```

### Permissions API

```javascript
// Check permission
const hasPermission = await window.pluginAPI.permissions.check("network");

// Request permission
const granted = await window.pluginAPI.permissions.request("filesystem");
```

## Development Mode Features

### Hot Reload

Files are automatically watched for changes and the plugin reloads instantly:

```javascript
// Any change to these files triggers hot reload:
// - index.html
// - script.js
// - styles.css
// - Any imported files
```

### Development API

```javascript
// Check if in development mode
const isDev = window.pluginAPI.isDevelopment();

// Reload plugin manually
await window.pluginAPI.dev.reload();

// Development storage (separate from production)
await window.pluginAPI.dev.storage.set("dev-key", "dev-value");

// Event tracking for debugging
window.pluginAPI.dev.events.track("user_action", { action: "click" });

// Performance monitoring
window.pluginAPI.dev.performance.mark("operation-start");
// ... do work ...
window.pluginAPI.dev.performance.mark("operation-end");
window.pluginAPI.dev.performance.measure(
  "operation",
  "operation-start",
  "operation-end"
);
```

### Development Console

Enhanced logging for development:

```javascript
// Use development console for better debugging
window.pluginAPI.dev.console.log("Debug message");
window.pluginAPI.dev.console.warn("Warning message");
window.pluginAPI.dev.console.error("Error message");
window.pluginAPI.dev.console.info("Info message");
window.pluginAPI.dev.console.debug("Debug message");
```

## Creating a New Plugin

### 1. Create Plugin Directory

```bash
mkdir apps/my-plugin
cd apps/my-plugin
```

### 2. Create Plugin Manifest

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "My awesome plugin",
  "main": "index.html",
  "manifest": {
    "id": "my-plugin",
    "name": "My Plugin",
    "version": "1.0.0",
    "description": "My awesome plugin",
    "author": "Your Name",
    "icon": "icon.svg",
    "main": "index.html",
    "permissions": ["storage", "notifications"]
  }
}
```

### 3. Create Plugin Files

**index.html**

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My Plugin</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <div id="app">
      <h1>My Plugin</h1>
      <button id="action">Click Me</button>
    </div>
    <script src="script.js"></script>
  </body>
</html>
```

**script.js**

```javascript
class MyPlugin {
  constructor() {
    this.init();
  }

  async init() {
    // Initialize plugin
    const button = document.getElementById("action");
    button.addEventListener("click", () => this.handleClick());

    // Load saved data
    const savedData = await window.pluginAPI.storage.get("data");
    console.log("Loaded data:", savedData);
  }

  async handleClick() {
    // Save data
    await window.pluginAPI.storage.set("data", { timestamp: Date.now() });

    // Show notification
    await window.pluginAPI.notifications.show("My Plugin", "Button clicked!");
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.myPlugin = new MyPlugin();
});
```

**styles.css**

```css
body {
  font-family: Arial, sans-serif;
  padding: 20px;
  background: #f5f5f5;
}

#app {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

button {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}
```

### 4. Register Plugin for Development

Add to `packages/electron/src/main/index.ts`:

```typescript
// In setupDevelopmentPlugins method
const myPluginConfig = {
  id: "my-plugin",
  name: "My Plugin",
  version: "1.0.0",
  devPath: path.resolve(__dirname, "../../../apps/my-plugin"),
  manifest: {
    id: "my-plugin",
    name: "My Plugin",
    version: "1.0.0",
    description: "My awesome plugin",
    author: "Your Name",
    main: "index.html",
    permissions: ["storage", "notifications"],
  },
};

await this.pluginDevLoader.registerDevPlugin(myPluginConfig);
```

## Testing and Debugging

### Development Tools

The counter-app-dev plugin demonstrates all available development tools:

1. **Hot Reload Testing**: Make changes and see instant updates
2. **Communication Testing**: Send messages between plugins
3. **Performance Testing**: Monitor plugin performance
4. **Storage Testing**: Test data persistence
5. **Notification Testing**: Test system notifications

### Debugging Tips

1. **Use Browser Dev Tools**: Right-click in plugin window and select "Inspect Element"
2. **Check Console Logs**: All plugin logs are prefixed with plugin ID
3. **Monitor IPC Messages**: Check main process logs for communication
4. **Use Development API**: Leverage development-specific APIs for debugging

### Common Issues

**Plugin Not Loading**

- Check plugin manifest format
- Verify file paths are correct
- Check console for errors

**Hot Reload Not Working**

- Ensure file watcher is running
- Check file permissions
- Verify development mode is enabled

**Communication Issues**

- Verify plugin IDs match
- Check IPC channel setup
- Ensure permissions are granted

## Production Deployment

### Building for Production

1. **Remove Development Code**: Remove development-specific code and APIs
2. **Optimize Assets**: Minify CSS and JavaScript
3. **Update Manifest**: Ensure production manifest is correct
4. **Test Thoroughly**: Test all functionality in production mode

### Plugin Packaging

```bash
# Create production build
npm run build

# Package plugin
npm run package:plugin
```

## Best Practices

### Security

- Always validate user input
- Use permissions system appropriately
- Never expose sensitive data in client code

### Performance

- Use performance monitoring tools
- Optimize for fast loading
- Minimize memory usage

### User Experience

- Provide clear feedback to users
- Handle errors gracefully
- Use consistent UI patterns

### Code Organization

- Keep plugins modular
- Use clear naming conventions
- Document your code

## Advanced Features

### Custom IPC Channels

```javascript
// In plugin
const result = await window.pluginAPI.sendCustomMessage("my-channel", data);

// In main process
ipcMain.handle("my-channel", (event, data) => {
  // Handle custom message
  return { success: true, data: processedData };
});
```

### Plugin Dependencies

```json
{
  "manifest": {
    "dependencies": {
      "shared-ui": "^1.0.0",
      "shared-utils": "^1.0.0"
    }
  }
}
```

### Plugin Lifecycle

```javascript
class MyPlugin {
  async onInstall() {
    // Plugin installation logic
  }

  async onActivate() {
    // Plugin activation logic
  }

  async onDeactivate() {
    // Plugin deactivation logic
  }

  async onUninstall() {
    // Plugin uninstallation logic
  }
}
```

## Conclusion

This development system provides a powerful foundation for building plugins with hot reload, real-time testing, and comprehensive debugging tools. Use the counter-app-dev plugin as a reference implementation and follow the best practices outlined in this guide.

For more information, see the main README and the counter-app-dev plugin documentation.
