# Counter App Dev - Development Mode Plugin

This is a development mode plugin for testing the super app's plugin system with hot reload and real-time changes. It demonstrates how plugins can communicate with the main Electron app and provides development tools for testing.

## Features

- **Hot Reload**: Automatic reloading when files change
- **Real-time Communication**: Message passing between plugins and main app
- **Development Tools**: Built-in testing utilities and performance monitoring
- **Storage Testing**: Persistent storage with development/production separation
- **Notification System**: System notifications for user feedback
- **Performance Monitoring**: Built-in performance testing and monitoring

## Development Mode Features

### Visual Indicators

- Red "DEV MODE" indicator in top-right corner
- Hot reload notification when files change
- Development controls panel with testing utilities

### Development Controls

- **Reload Plugin**: Manually trigger plugin reload
- **Clear Storage**: Clear development storage
- **Test Notification**: Test system notifications
- **Performance Test**: Run performance benchmarks
- **Crash Test**: Simulate plugin crashes for testing recovery
- **Recovery Test**: Test plugin recovery mechanisms

### Communication Testing

- **Send Message**: Send test messages to other plugins
- **Broadcast Message**: Broadcast messages to all plugins
- **Message History**: View received messages in real-time

## Usage

### Starting Development Mode

1. **Start the main Electron app**:

   ```bash
   npm run dev
   ```

2. **Start the counter app development server**:

   ```bash
   npm run counter-app-dev
   ```

3. **The plugin will automatically load** in development mode with hot reload enabled

### Testing Features

#### Hot Reload Testing

1. Make changes to any file in `apps/counter-app-dev/`
2. The plugin will automatically reload when files change
3. Watch the "HOT RELOADED" indicator appear

#### Communication Testing

1. Click "Send Message" to send a test message
2. Click "Broadcast Message" to broadcast to all plugins
3. View received messages in the communication panel

#### Performance Testing

1. Click "Performance Test" to run benchmarks
2. View the performance score in the stats panel
3. Use the performance monitoring tools in the dev console

#### Storage Testing

1. Modify the counter value
2. Click "Clear Storage" to reset
3. Verify data persistence across reloads

## API Usage

The plugin demonstrates how to use the plugin API:

### Storage API

```javascript
// Save data
await window.pluginAPI.storage.set("counter", 42);

// Load data
const value = await window.pluginAPI.storage.get("counter");
```

### Notifications API

```javascript
// Show notification
await window.pluginAPI.notifications.show("Title", "Message");
```

### Communication API

```javascript
// Send message to specific plugin
await window.pluginAPI.communication.sendMessage("target-plugin", {
  type: "test",
  data: { value: 42 },
});

// Listen for messages
window.pluginAPI.communication.onMessage((message) => {
  console.log("Received:", message);
});
```

### Development API

```javascript
// Check if in development mode
const isDev = window.pluginAPI.isDevelopment();

// Reload plugin
await window.pluginAPI.dev.reload();

// Track events
window.pluginAPI.dev.events.track("user_action", { action: "increment" });

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

## File Structure

```
apps/counter-app-dev/
├── index.html          # Main plugin interface
├── script.js           # Plugin logic and development features
├── styles.css          # Styling with development mode indicators
├── package.json        # Plugin manifest and dependencies
├── vite.config.js      # Development server configuration
└── README.md          # This file
```

## Development Workflow

1. **Make Changes**: Edit any file in the plugin
2. **Auto Reload**: Plugin automatically reloads on file changes
3. **Test Features**: Use development controls to test functionality
4. **Debug**: Use browser dev tools for debugging
5. **Monitor**: Watch performance and communication logs

## Integration with Main App

This plugin integrates with the main Electron app through:

- **PluginDevLoader**: Handles development plugin loading and hot reload
- **PluginAPIBridge**: Provides secure API access to plugins
- **IPC Communication**: Message passing between main and renderer processes
- **File Watching**: Automatic reloading on file changes

## Troubleshooting

### Plugin Not Loading

- Check that the main Electron app is running
- Verify the development server is started
- Check console logs for errors

### Hot Reload Not Working

- Ensure file watcher is enabled
- Check file permissions
- Verify the development path is correct

### Communication Issues

- Check IPC channel setup
- Verify plugin IDs match
- Check console logs for communication errors

## Next Steps

This development plugin serves as a template for creating new plugins. To create your own plugin:

1. Copy this directory structure
2. Modify the manifest in `package.json`
3. Implement your plugin logic
4. Test with the development tools
5. Deploy to production when ready

The plugin system supports both development and production modes, making it easy to iterate and test before deployment.
