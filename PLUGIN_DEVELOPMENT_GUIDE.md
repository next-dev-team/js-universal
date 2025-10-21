# Plugin Development Guide

## Overview

This guide provides comprehensive documentation for developing plugins for the Electron Plugin App. Plugins are self-contained applications that run in a sandboxed environment and can interact with the host application through a secure API.

**Updated**: This guide has been updated to reflect the latest plugin system improvements, including enhanced drag-and-drop functionality, real plugin installation, and improved error handling.

## Table of Contents

1. [Plugin Structure](#plugin-structure)
2. [Plugin Manifest](#plugin-manifest)
3. [Plugin API](#plugin-api)
4. [Development Setup](#development-setup)
5. [Security and Permissions](#security-and-permissions)
6. [Testing Your Plugin](#testing-your-plugin)
7. [Installation and Distribution](#installation-and-distribution)
8. [Best Practices](#best-practices)
9. [Examples](#examples)
10. [Troubleshooting](#troubleshooting)

## Plugin Structure

A plugin is a directory containing the following files:

```
my-plugin/
├── package.json          # Plugin manifest (required)
├── index.html           # Main HTML file (required)
├── main.js              # Main JavaScript file (required)
├── style.css            # Styles (optional)
├── icon.png             # Plugin icon (optional)
└── assets/              # Additional assets (optional)
    ├── images/
    └── scripts/
```

### Required Files

- **package.json**: Contains plugin metadata and configuration
- **index.html**: The main HTML file that will be loaded in the plugin window
- **main.js**: The main JavaScript file containing your plugin logic

## Plugin Manifest

The `package.json` file serves as the plugin manifest and must contain specific fields:

```json
{
  "name": "my-awesome-plugin",
  "version": "1.0.0",
  "description": "A description of what your plugin does",
  "author": "Your Name <your.email@example.com>",
  "category": "Utility",
  "main": "index.html",
  "icon": "icon.png",
  "permissions": [
    "storage",
    "notifications"
  ],
  "keywords": ["utility", "productivity"],
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/my-awesome-plugin"
  },
  "license": "MIT"
}
```

### Required Fields

- **name**: Unique plugin identifier (lowercase, alphanumeric, hyphens allowed)
- **version**: Semantic version (e.g., "1.0.0")
- **description**: Brief description of the plugin functionality
- **author**: Plugin author information
- **main**: Entry point HTML file (usually "index.html")

### Optional Fields

- **category**: Plugin category ("Utility", "Productivity", "Entertainment", "Development", "Communication")
- **icon**: Path to plugin icon (PNG, 64x64px recommended)
- **permissions**: Array of required permissions
- **keywords**: Array of keywords for searchability
- **repository**: Repository information
- **license**: License type

## Plugin API

Plugins run in a sandboxed environment and can access the host application through the `pluginAPI` object available in the global scope.

### Core API

#### Plugin Information

```javascript
// Get the current plugin ID
const pluginId = pluginAPI.getPluginId();
```

#### Storage API

```javascript
// Store data persistently
await pluginAPI.storage.set('key', 'value');
await pluginAPI.storage.set('settings', { theme: 'dark', language: 'en' });

// Retrieve stored data
const value = await pluginAPI.storage.get('key');
const settings = await pluginAPI.storage.get('settings');

// Remove stored data
await pluginAPI.storage.remove('key');

// Clear all stored data
await pluginAPI.storage.clear();
```

#### Notifications API

```javascript
// Show a notification
await pluginAPI.notifications.show(
  'Plugin Notification',
  'This is a message from your plugin',
  {
    icon: 'path/to/icon.png',
    tag: 'unique-notification-id'
  }
);
```

#### Network API (Requires Permission)

```javascript
// Make HTTP requests
const response = await pluginAPI.network.fetch('https://api.example.com/data', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
```

#### File System API (Requires Permission)

```javascript
// Read files (with user permission)
const content = await pluginAPI.filesystem.readFile('/path/to/file.txt');

// Write files (with user permission)
await pluginAPI.filesystem.writeFile('/path/to/output.txt', 'Hello World');

// List directory contents
const files = await pluginAPI.filesystem.readDir('/path/to/directory');
```

## Development Setup

### 1. Create Plugin Directory

```bash
mkdir my-plugin
cd my-plugin
```

### 2. Create package.json

```bash
npm init -y
```

Edit the generated `package.json` to include the required plugin fields.

### 3. Create Basic Files

**index.html**:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Plugin</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div id="app">
        <h1>My Awesome Plugin</h1>
        <button id="actionBtn">Click Me!</button>
        <div id="output"></div>
    </div>
    <script src="main.js"></script>
</body>
</html>
```

**main.js**:
```javascript
document.addEventListener('DOMContentLoaded', async () => {
    const pluginId = pluginAPI.getPluginId();
    console.log(`Plugin ${pluginId} loaded`);

    const actionBtn = document.getElementById('actionBtn');
    const output = document.getElementById('output');

    actionBtn.addEventListener('click', async () => {
        try {
            // Example: Store and retrieve data
            await pluginAPI.storage.set('clickCount', 
                (await pluginAPI.storage.get('clickCount') || 0) + 1
            );
            
            const count = await pluginAPI.storage.get('clickCount');
            output.textContent = `Button clicked ${count} times`;

            // Show notification
            await pluginAPI.notifications.show(
                'Button Clicked',
                `You've clicked the button ${count} times!`
            );
        } catch (error) {
            console.error('Error:', error);
            output.textContent = 'Error occurred: ' + error.message;
        }
    });
});
```

**style.css**:
```css
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f5f5f5;
}

#app {
    max-width: 600px;
    margin: 0 auto;
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
}

button:hover {
    background-color: #0056b3;
}

#output {
    margin-top: 20px;
    padding: 10px;
    background-color: #f8f9fa;
    border-radius: 4px;
    min-height: 20px;
}
```

## Security and Permissions

### Permission System

Plugins must declare required permissions in their `package.json`:

```json
{
  "permissions": [
    "storage",        // Access to persistent storage
    "notifications",  // Show system notifications
    "network",        // Make HTTP requests
    "filesystem"      // Read/write files (with user consent)
  ]
}
```

### Security Restrictions

- Plugins run in a sandboxed environment
- No direct access to Node.js APIs
- No access to the main application's internal APIs
- File system access requires explicit user permission
- Network requests are limited to HTTPS (unless in development)

## Testing Your Plugin

### 1. Local Testing

Create a simple test HTML file to test your plugin locally:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Plugin Test</title>
</head>
<body>
    <script>
        // Mock pluginAPI for local testing
        window.pluginAPI = {
            getPluginId: () => 'test-plugin',
            storage: {
                set: async (key, value) => {
                    localStorage.setItem(`plugin_${key}`, JSON.stringify(value));
                },
                get: async (key) => {
                    const item = localStorage.getItem(`plugin_${key}`);
                    return item ? JSON.parse(item) : null;
                },
                remove: async (key) => {
                    localStorage.removeItem(`plugin_${key}`);
                },
                clear: async () => {
                    Object.keys(localStorage)
                        .filter(key => key.startsWith('plugin_'))
                        .forEach(key => localStorage.removeItem(key));
                }
            },
            notifications: {
                show: async (title, body, options) => {
                    console.log('Notification:', title, body, options);
                    if (Notification.permission === 'granted') {
                        new Notification(title, { body, ...options });
                    }
                }
            },
            network: {
                fetch: async (url, options) => {
                    return fetch(url, options);
                }
            }
        };
    </script>
    <script src="main.js"></script>
</body>
</html>
```

### 2. Integration Testing

Install your plugin in the Electron Plugin App:

1. Open the Plugin Manager
2. Click "Install Plugin" tab
3. Use "Select Plugin Folder" or drag-and-drop your plugin directory
4. Click "Install Plugin"

## Installation and Distribution

### Manual Installation

Users can install plugins by:

1. **Drag and Drop**: Drag the plugin folder into the Plugin Manager
2. **File Dialog**: Use "Select Plugin Folder" button in the Plugin Manager
3. **Quick Install**: Use "Quick Install Plugin" for one-click installation

### Plugin Validation

The system validates plugins during installation:

- ✅ Valid `package.json` with required fields
- ✅ Presence of main HTML file
- ✅ Security scan for malicious code
- ✅ Permission validation

### Distribution Best Practices

1. **Version Control**: Use semantic versioning
2. **Documentation**: Include README.md with usage instructions
3. **Testing**: Test on multiple platforms
4. **Security**: Follow security best practices
5. **Performance**: Optimize for minimal resource usage

## Best Practices

### Code Organization

```javascript
// Use modules for better organization
class MyPlugin {
    constructor() {
        this.pluginId = pluginAPI.getPluginId();
        this.init();
    }

    async init() {
        await this.loadSettings();
        this.setupEventListeners();
    }

    async loadSettings() {
        this.settings = await pluginAPI.storage.get('settings') || {
            theme: 'light',
            notifications: true
        };
    }

    async saveSettings() {
        await pluginAPI.storage.set('settings', this.settings);
    }

    setupEventListeners() {
        // Setup your event listeners here
    }
}

// Initialize plugin when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new MyPlugin();
});
```

### Error Handling

```javascript
async function safeApiCall(apiFunction) {
    try {
        return await apiFunction();
    } catch (error) {
        console.error('API call failed:', error);
        await pluginAPI.notifications.show(
            'Error',
            'An error occurred. Please try again.',
            { icon: 'error' }
        );
        return null;
    }
}
```

### Performance

- Use efficient DOM manipulation
- Implement proper cleanup for event listeners
- Minimize API calls
- Use local storage wisely

### User Experience

- Provide clear feedback for user actions
- Handle loading states gracefully
- Implement proper error messages
- Follow platform UI guidelines

## Examples

### Counter Plugin

A simple counter plugin that demonstrates basic functionality:

```javascript
class CounterPlugin {
    constructor() {
        this.count = 0;
        this.init();
    }

    async init() {
        // Load saved count
        this.count = await pluginAPI.storage.get('count') || 0;
        
        // Setup UI
        this.setupUI();
        this.updateDisplay();
    }

    setupUI() {
        document.body.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <h1>Counter Plugin</h1>
                <div id="count" style="font-size: 48px; margin: 20px;">0</div>
                <button id="increment">+</button>
                <button id="decrement">-</button>
                <button id="reset">Reset</button>
            </div>
        `;

        document.getElementById('increment').onclick = () => this.increment();
        document.getElementById('decrement').onclick = () => this.decrement();
        document.getElementById('reset').onclick = () => this.reset();
    }

    async increment() {
        this.count++;
        await this.saveCount();
        this.updateDisplay();
    }

    async decrement() {
        this.count--;
        await this.saveCount();
        this.updateDisplay();
    }

    async reset() {
        this.count = 0;
        await this.saveCount();
        this.updateDisplay();
        
        await pluginAPI.notifications.show(
            'Counter Reset',
            'Counter has been reset to 0'
        );
    }

    async saveCount() {
        await pluginAPI.storage.set('count', this.count);
    }

    updateDisplay() {
        document.getElementById('count').textContent = this.count;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CounterPlugin();
});
```

### Weather Plugin

A more complex plugin that uses the network API:

```javascript
class WeatherPlugin {
    constructor() {
        this.apiKey = 'your-api-key';
        this.init();
    }

    async init() {
        this.setupUI();
        await this.loadSettings();
        await this.loadWeather();
    }

    setupUI() {
        document.body.innerHTML = `
            <div class="weather-app">
                <h1>Weather Plugin</h1>
                <input type="text" id="cityInput" placeholder="Enter city name">
                <button id="searchBtn">Search</button>
                <div id="weather-display"></div>
            </div>
        `;

        document.getElementById('searchBtn').onclick = () => this.searchWeather();
    }

    async loadSettings() {
        this.settings = await pluginAPI.storage.get('settings') || {
            lastCity: 'New York'
        };
    }

    async searchWeather() {
        const city = document.getElementById('cityInput').value;
        if (city) {
            await this.loadWeather(city);
            this.settings.lastCity = city;
            await pluginAPI.storage.set('settings', this.settings);
        }
    }

    async loadWeather(city = this.settings.lastCity) {
        try {
            const response = await pluginAPI.network.fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.apiKey}&units=metric`
            );
            
            const data = await response.json();
            this.displayWeather(data);
        } catch (error) {
            console.error('Weather API error:', error);
            document.getElementById('weather-display').innerHTML = 
                '<p>Error loading weather data</p>';
        }
    }

    displayWeather(data) {
        const display = document.getElementById('weather-display');
        display.innerHTML = `
            <div class="weather-info">
                <h2>${data.name}</h2>
                <p>Temperature: ${data.main.temp}°C</p>
                <p>Description: ${data.weather[0].description}</p>
                <p>Humidity: ${data.main.humidity}%</p>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new WeatherPlugin();
});
```

## Troubleshooting

### Common Issues

1. **Plugin not loading**
   - Check `package.json` format
   - Ensure main HTML file exists
   - Verify all required fields are present

2. **API calls failing**
   - Check if required permissions are declared
   - Verify API syntax
   - Check browser console for errors

3. **Storage not working**
   - Ensure 'storage' permission is declared
   - Check for proper async/await usage
   - Verify data serialization

4. **Notifications not showing**
   - Ensure 'notifications' permission is declared
   - Check system notification settings
   - Verify notification API usage

### Debug Mode

Enable debug mode in your plugin for detailed logging:

```javascript
const DEBUG = true;

function debugLog(...args) {
    if (DEBUG) {
        console.log('[Plugin Debug]:', ...args);
    }
}
```

### Plugin Console

Access the plugin's developer console:
1. Right-click in the plugin window
2. Select "Inspect Element"
3. Use the Console tab for debugging

## Support and Resources

- **GitHub Issues**: Report bugs and request features
- **Documentation**: This guide and API reference
- **Examples**: Sample plugins in the repository
- **Community**: Join our developer community

## License

This documentation is provided under the MIT License. Plugin developers are free to use any license for their plugins.