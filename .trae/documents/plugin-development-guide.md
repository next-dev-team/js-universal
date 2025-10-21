# Plugin Development Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Plugin Structure](#plugin-structure)
4. [Plugin Manifest (package.json)](#plugin-manifest-packagejson)
5. [Plugin API Reference](#plugin-api-reference)
6. [Creating Your First Plugin](#creating-your-first-plugin)
7. [Advanced Examples](#advanced-examples)
8. [Best Practices](#best-practices)
9. [Security Guidelines](#security-guidelines)
10. [Testing and Debugging](#testing-and-debugging)
11. [Distribution and Installation](#distribution-and-installation)
12. [Troubleshooting](#troubleshooting)

## Introduction

Welcome to the Electron Super App Plugin Development Guide! This comprehensive guide will help you create powerful plugins for the Electron Super App platform. Plugins extend the functionality of the main application and provide users with additional features and capabilities.

### What are Plugins?

Plugins are self-contained applications that run within the Electron Super App environment. They have access to a secure API that allows them to:
- Store and retrieve data
- Display notifications
- Make network requests
- Access limited file system operations
- Communicate with the main application

### Prerequisites

- Basic knowledge of HTML, CSS, and JavaScript
- Understanding of web development concepts
- Familiarity with JSON format
- Text editor or IDE

## Getting Started

### Development Environment Setup

1. **Create a Plugin Directory**
   ```bash
   mkdir my-awesome-plugin
   cd my-awesome-plugin
   ```

2. **Initialize Plugin Structure**
   ```
   my-awesome-plugin/
   ├── package.json          # Plugin manifest
   ├── index.html           # Main plugin interface
   ├── script.js            # Plugin logic
   ├── styles.css           # Plugin styling
   ├── icon.svg             # Plugin icon
   └── README.md            # Plugin documentation
   ```

## Plugin Structure

### Required Files

1. **package.json** - Plugin manifest containing metadata and configuration
2. **index.html** - Main HTML file that serves as the plugin's entry point
3. **icon.svg/png** - Plugin icon (recommended: SVG format, 64x64px)

### Optional Files

- **script.js** - JavaScript logic
- **styles.css** - Custom styling
- **README.md** - Plugin documentation
- **assets/** - Additional resources (images, fonts, etc.)

## Plugin Manifest (package.json)

The `package.json` file is the heart of your plugin. It contains all the metadata and configuration needed for the plugin system.

### Basic Structure

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "A brief description of what your plugin does",
  "author": "Your Name",
  "main": "index.html",
  "permissions": [
    "storage",
    "notifications"
  ],
  "category": "utility",
  "icon": "icon.svg",
  "window": {
    "width": 400,
    "height": 300,
    "minWidth": 300,
    "minHeight": 250,
    "maxWidth": 800,
    "maxHeight": 600,
    "resizable": true
  }
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Unique plugin identifier (lowercase, hyphens allowed) |
| `version` | string | ✅ | Plugin version (semantic versioning) |
| `description` | string | ✅ | Brief description of plugin functionality |
| `author` | string | ✅ | Plugin author name |
| `main` | string | ✅ | Entry point HTML file |
| `permissions` | array | ✅ | Required permissions (see permissions section) |
| `category` | string | ✅ | Plugin category (utility, productivity, entertainment, etc.) |
| `icon` | string | ❌ | Path to plugin icon file |
| `window` | object | ❌ | Window configuration options |
| `dependencies` | object | ❌ | External dependencies (currently not supported) |

### Available Permissions

| Permission | Description |
|------------|-------------|
| `storage` | Access to persistent data storage |
| `notifications` | Display system notifications |
| `network` | Make HTTP requests |
| `filesystem` | Limited file system access |

### Window Configuration

```json
{
  "window": {
    "width": 400,           // Default window width
    "height": 300,          // Default window height
    "minWidth": 300,        // Minimum window width
    "minHeight": 250,       // Minimum window height
    "maxWidth": 800,        // Maximum window width
    "maxHeight": 600,       // Maximum window height
    "resizable": true       // Whether window can be resized
  }
}
```

## Plugin API Reference

The Plugin API is available through the global `pluginAPI` object in your plugin's JavaScript context.

### Storage API

Store and retrieve persistent data for your plugin.

```javascript
// Store data
await pluginAPI.storage.set('key', 'value')
await pluginAPI.storage.set('user-preferences', { theme: 'dark', language: 'en' })

// Retrieve data
const value = await pluginAPI.storage.get('key')
const preferences = await pluginAPI.storage.get('user-preferences')

// Remove data
await pluginAPI.storage.remove('key')

// Clear all data
await pluginAPI.storage.clear()
```

### Notifications API

Display system notifications to users.

```javascript
// Basic notification
await pluginAPI.notifications.show('Title', 'Message body')

// Notification with options
await pluginAPI.notifications.show('Update Available', 'A new version is ready to install', {
  icon: 'path/to/icon.png',
  tag: 'update-notification'
})
```

### Network API

Make HTTP requests (requires `network` permission).

```javascript
// GET request
const response = await pluginAPI.network.fetch('https://api.example.com/data')
const data = await response.json()

// POST request
const response = await pluginAPI.network.fetch('https://api.example.com/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ key: 'value' })
})
```

### File System API

Limited file system operations (requires `filesystem` permission).

```javascript
// Read file
const content = await pluginAPI.filesystem.readFile('path/to/file.txt')

// Write file
await pluginAPI.filesystem.writeFile('path/to/output.txt', 'Hello World!')

// Check if file exists
const exists = await pluginAPI.filesystem.exists('path/to/file.txt')
```

### Communication API

Communicate with the main application or other plugins.

```javascript
// Send message to main application
await pluginAPI.communication.sendMessage({
  type: 'custom-action',
  data: { key: 'value' }
})

// Listen for messages
pluginAPI.communication.onMessage((message) => {
  console.log('Received message:', message)
})
```

## Creating Your First Plugin

Let's create a simple "Hello World" plugin step by step.

### Step 1: Create package.json

```json
{
  "name": "hello-world-plugin",
  "version": "1.0.0",
  "description": "A simple Hello World plugin",
  "author": "Your Name",
  "main": "index.html",
  "permissions": ["storage", "notifications"],
  "category": "utility",
  "icon": "icon.svg",
  "window": {
    "width": 300,
    "height": 200,
    "resizable": false
  }
}
```

### Step 2: Create index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hello World Plugin</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <h1>Hello World!</h1>
        <p>Welcome to your first plugin.</p>
        <button id="greetBtn">Say Hello</button>
        <button id="notifyBtn">Show Notification</button>
        <div id="message"></div>
    </div>
    <script src="script.js"></script>
</body>
</html>
```

### Step 3: Create styles.css

```css
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    margin: 0;
    padding: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    height: 100vh;
    box-sizing: border-box;
}

.container {
    text-align: center;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

h1 {
    margin-bottom: 10px;
    font-size: 24px;
}

p {
    margin-bottom: 20px;
    opacity: 0.9;
}

button {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: 10px 20px;
    margin: 5px;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s ease;
}

button:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
}

#message {
    margin-top: 20px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 5px;
    min-height: 20px;
}
```

### Step 4: Create script.js

```javascript
document.addEventListener('DOMContentLoaded', async () => {
    const greetBtn = document.getElementById('greetBtn')
    const notifyBtn = document.getElementById('notifyBtn')
    const messageDiv = document.getElementById('message')

    // Load saved greeting count
    let greetCount = await pluginAPI.storage.get('greetCount') || 0

    greetBtn.addEventListener('click', async () => {
        greetCount++
        await pluginAPI.storage.set('greetCount', greetCount)
        messageDiv.textContent = `Hello! You've clicked ${greetCount} times.`
    })

    notifyBtn.addEventListener('click', async () => {
        await pluginAPI.notifications.show(
            'Hello World Plugin', 
            `You've greeted ${greetCount} times!`
        )
    })

    // Display initial message
    if (greetCount > 0) {
        messageDiv.textContent = `Welcome back! Previous greetings: ${greetCount}`
    }
})
```

### Step 5: Create icon.svg

```svg
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="30" fill="#667eea"/>
    <text x="32" y="40" text-anchor="middle" fill="white" font-size="24" font-family="Arial">👋</text>
</svg>
```

## Advanced Examples

### Weather Plugin Example

A more complex plugin that fetches weather data and displays it.

**package.json:**
```json
{
  "name": "weather-plugin",
  "version": "1.0.0",
  "description": "Display current weather information",
  "author": "Weather Dev",
  "main": "index.html",
  "permissions": ["storage", "network", "notifications"],
  "category": "productivity",
  "icon": "weather-icon.svg",
  "window": {
    "width": 400,
    "height": 500,
    "minWidth": 350,
    "minHeight": 400,
    "resizable": true
  }
}
```

**index.html:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Weather Plugin</title>
    <link rel="stylesheet" href="weather-styles.css">
</head>
<body>
    <div class="weather-container">
        <div class="header">
            <h1>🌤️ Weather</h1>
            <button id="refreshBtn">🔄</button>
        </div>
        
        <div class="location-input">
            <input type="text" id="cityInput" placeholder="Enter city name">
            <button id="searchBtn">Search</button>
        </div>
        
        <div id="weatherDisplay" class="weather-display">
            <div class="loading">Loading weather data...</div>
        </div>
        
        <div class="settings">
            <label>
                <input type="checkbox" id="autoRefresh"> Auto-refresh every 30 minutes
            </label>
        </div>
    </div>
    <script src="weather-script.js"></script>
</body>
</html>
```

**weather-script.js:**
```javascript
class WeatherPlugin {
    constructor() {
        this.apiKey = 'your-api-key-here' // In production, store securely
        this.currentCity = null
        this.autoRefreshInterval = null
        this.init()
    }

    async init() {
        // Load saved settings
        this.currentCity = await pluginAPI.storage.get('currentCity') || 'London'
        const autoRefresh = await pluginAPI.storage.get('autoRefresh') || false
        
        // Set up event listeners
        document.getElementById('searchBtn').addEventListener('click', () => this.searchWeather())
        document.getElementById('refreshBtn').addEventListener('click', () => this.refreshWeather())
        document.getElementById('autoRefresh').addEventListener('change', (e) => this.toggleAutoRefresh(e.target.checked))
        
        // Set initial state
        document.getElementById('cityInput').value = this.currentCity
        document.getElementById('autoRefresh').checked = autoRefresh
        
        // Load initial weather
        await this.loadWeather(this.currentCity)
        
        // Set up auto-refresh if enabled
        if (autoRefresh) {
            this.startAutoRefresh()
        }
    }

    async searchWeather() {
        const city = document.getElementById('cityInput').value.trim()
        if (city) {
            await this.loadWeather(city)
        }
    }

    async refreshWeather() {
        if (this.currentCity) {
            await this.loadWeather(this.currentCity)
        }
    }

    async loadWeather(city) {
        const display = document.getElementById('weatherDisplay')
        display.innerHTML = '<div class="loading">Loading...</div>'

        try {
            // Using OpenWeatherMap API (example)
            const response = await pluginAPI.network.fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.apiKey}&units=metric`
            )
            
            if (!response.ok) {
                throw new Error('Weather data not found')
            }
            
            const data = await response.json()
            this.displayWeather(data)
            
            // Save current city
            this.currentCity = city
            await pluginAPI.storage.set('currentCity', city)
            
        } catch (error) {
            display.innerHTML = `<div class="error">Error: ${error.message}</div>`
        }
    }

    displayWeather(data) {
        const display = document.getElementById('weatherDisplay')
        const temp = Math.round(data.main.temp)
        const description = data.weather[0].description
        const icon = data.weather[0].icon
        
        display.innerHTML = `
            <div class="weather-info">
                <div class="city-name">${data.name}, ${data.sys.country}</div>
                <div class="temperature">${temp}°C</div>
                <div class="description">${description}</div>
                <div class="details">
                    <div class="detail">
                        <span>Feels like</span>
                        <span>${Math.round(data.main.feels_like)}°C</span>
                    </div>
                    <div class="detail">
                        <span>Humidity</span>
                        <span>${data.main.humidity}%</span>
                    </div>
                    <div class="detail">
                        <span>Wind</span>
                        <span>${data.wind.speed} m/s</span>
                    </div>
                </div>
            </div>
        `
    }

    async toggleAutoRefresh(enabled) {
        await pluginAPI.storage.set('autoRefresh', enabled)
        
        if (enabled) {
            this.startAutoRefresh()
            await pluginAPI.notifications.show('Weather Plugin', 'Auto-refresh enabled')
        } else {
            this.stopAutoRefresh()
        }
    }

    startAutoRefresh() {
        this.stopAutoRefresh() // Clear any existing interval
        this.autoRefreshInterval = setInterval(() => {
            this.refreshWeather()
        }, 30 * 60 * 1000) // 30 minutes
    }

    stopAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval)
            this.autoRefreshInterval = null
        }
    }
}

// Initialize plugin when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WeatherPlugin()
})
```

## Best Practices

### 1. Performance Optimization

- **Minimize Resource Usage**: Keep your plugin lightweight
- **Lazy Loading**: Load resources only when needed
- **Efficient DOM Manipulation**: Use document fragments for multiple DOM updates
- **Debounce User Input**: Prevent excessive API calls

```javascript
// Debounce example
function debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout)
            func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}

const debouncedSearch = debounce(searchFunction, 300)
```

### 2. Error Handling

Always implement proper error handling:

```javascript
async function safeApiCall() {
    try {
        const data = await pluginAPI.storage.get('key')
        return data
    } catch (error) {
        console.error('Storage error:', error)
        // Provide fallback behavior
        return null
    }
}
```

### 3. User Experience

- **Responsive Design**: Ensure your plugin works at different window sizes
- **Loading States**: Show loading indicators for async operations
- **Error Messages**: Provide clear, actionable error messages
- **Accessibility**: Use semantic HTML and proper ARIA labels

### 4. Data Management

- **Validate Data**: Always validate data before storing or using it
- **Version Migration**: Handle data format changes between plugin versions
- **Cleanup**: Remove unused data to prevent storage bloat

```javascript
// Data validation example
function validateUserData(data) {
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid data format')
    }
    
    if (!data.name || typeof data.name !== 'string') {
        throw new Error('Name is required and must be a string')
    }
    
    return true
}
```

## Security Guidelines

### 1. Input Validation

Always validate and sanitize user input:

```javascript
function sanitizeInput(input) {
    return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
}
```

### 2. API Key Management

- Never hardcode API keys in your plugin
- Use environment variables or secure storage
- Implement key rotation if possible

### 3. Network Security

- Always use HTTPS for API calls
- Validate SSL certificates
- Implement request timeouts

```javascript
const response = await pluginAPI.network.fetch(url, {
    timeout: 5000, // 5 second timeout
    headers: {
        'User-Agent': 'YourPlugin/1.0.0'
    }
})
```

### 4. Permission Principle

- Request only the permissions you actually need
- Document why each permission is required
- Provide fallback functionality when permissions are denied

## Testing and Debugging

### 1. Development Testing

Create a test environment for your plugin:

```javascript
// Test helper functions
const TestUtils = {
    async clearStorage() {
        await pluginAPI.storage.clear()
    },
    
    async mockApiResponse(data) {
        // Mock network responses for testing
        return Promise.resolve({ json: () => data })
    },
    
    simulateUserAction(element, action = 'click') {
        const event = new Event(action)
        element.dispatchEvent(event)
    }
}
```

### 2. Error Logging

Implement comprehensive logging:

```javascript
const Logger = {
    info(message, data = {}) {
        console.log(`[INFO] ${message}`, data)
    },
    
    error(message, error = {}) {
        console.error(`[ERROR] ${message}`, error)
        // Optionally send to error tracking service
    },
    
    debug(message, data = {}) {
        if (process.env.NODE_ENV === 'development') {
            console.debug(`[DEBUG] ${message}`, data)
        }
    }
}
```

### 3. Performance Monitoring

Monitor your plugin's performance:

```javascript
function measurePerformance(name, fn) {
    return async (...args) => {
        const start = performance.now()
        const result = await fn(...args)
        const end = performance.now()
        console.log(`${name} took ${end - start} milliseconds`)
        return result
    }
}

const optimizedFunction = measurePerformance('API Call', apiCallFunction)
```

## Distribution and Installation

### 1. Plugin Packaging

Ensure your plugin directory contains all necessary files:

```
my-plugin/
├── package.json     ✅ Required
├── index.html       ✅ Required  
├── icon.svg         ✅ Recommended
├── script.js        ✅ Recommended
├── styles.css       ✅ Recommended
├── README.md        ✅ Recommended
└── assets/          ❌ Optional
    ├── images/
    └── fonts/
```

### 2. Version Management

Follow semantic versioning (semver):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### 3. Documentation

Include comprehensive documentation:

```markdown
# My Awesome Plugin

## Description
Brief description of what your plugin does.

## Features
- Feature 1
- Feature 2
- Feature 3

## Installation
1. Download the plugin folder
2. Open Plugin Manager in Electron Super App
3. Click "Install Plugin" and select the plugin folder

## Usage
Step-by-step usage instructions.

## Configuration
Available settings and how to configure them.

## Troubleshooting
Common issues and solutions.

## Changelog
Version history and changes.
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Plugin Not Loading

**Problem**: Plugin doesn't appear in the Plugin Manager after installation.

**Solutions**:
- Check that `package.json` is valid JSON
- Ensure all required fields are present in manifest
- Verify the `main` field points to an existing HTML file
- Check console for error messages

#### 2. API Not Available

**Problem**: `pluginAPI` is undefined or methods don't work.

**Solutions**:
- Ensure you're requesting the correct permissions in `package.json`
- Wait for DOM to load before accessing the API
- Check that you're running in the plugin environment

```javascript
// Check if API is available
if (typeof pluginAPI === 'undefined') {
    console.error('Plugin API not available')
    // Provide fallback behavior
}
```

#### 3. Storage Issues

**Problem**: Data is not persisting between plugin sessions.

**Solutions**:
- Verify you have `storage` permission
- Check for async/await usage with storage methods
- Ensure data is JSON serializable

```javascript
// Test storage functionality
async function testStorage() {
    try {
        await pluginAPI.storage.set('test', 'value')
        const result = await pluginAPI.storage.get('test')
        console.log('Storage test:', result === 'value' ? 'PASS' : 'FAIL')
    } catch (error) {
        console.error('Storage test failed:', error)
    }
}
```

#### 4. Network Requests Failing

**Problem**: HTTP requests are not working.

**Solutions**:
- Ensure you have `network` permission
- Check CORS policies of the target API
- Verify URL format and API endpoints
- Handle network errors gracefully

```javascript
async function safeNetworkRequest(url) {
    try {
        const response = await pluginAPI.network.fetch(url)
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        return await response.json()
    } catch (error) {
        console.error('Network request failed:', error)
        throw error
    }
}
```

#### 5. Window Size Issues

**Problem**: Plugin window is too small or too large.

**Solutions**:
- Adjust window configuration in `package.json`
- Use responsive CSS design
- Test at different window sizes

```css
/* Responsive design example */
.container {
    padding: 20px;
    min-height: 100vh;
    box-sizing: border-box;
}

@media (max-width: 400px) {
    .container {
        padding: 10px;
    }
}
```

### Debug Mode

Enable debug mode for additional logging:

```javascript
// Add to your plugin's script
const DEBUG = true

function debugLog(message, data) {
    if (DEBUG) {
        console.log(`[DEBUG] ${message}`, data)
    }
}
```

### Getting Help

If you encounter issues not covered in this guide:

1. Check the plugin console for error messages
2. Review the plugin manifest for syntax errors
3. Test with a minimal plugin example
4. Check the main application logs
5. Consult the community forums or documentation

---

## Conclusion

This guide provides everything you need to create powerful plugins for the Electron Super App. Start with simple examples and gradually build more complex functionality as you become familiar with the API.

Remember to:
- Follow security best practices
- Test thoroughly before distribution
- Document your plugin well
- Keep user experience in mind
- Stay updated with API changes

Happy plugin development! 🚀