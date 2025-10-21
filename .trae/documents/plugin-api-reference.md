# Plugin API Reference

## Table of Contents
1. [Overview](#overview)
2. [Global Objects](#global-objects)
3. [Storage API](#storage-api)
4. [Notifications API](#notifications-api)
5. [Network API](#network-api)
6. [File System API](#file-system-api)
7. [Communication API](#communication-api)
8. [Plugin Context](#plugin-context)
9. [Error Handling](#error-handling)
10. [Type Definitions](#type-definitions)
11. [Examples](#examples)

## Overview

The Plugin API provides a secure interface for plugins to interact with the Electron Super App environment. All API methods are asynchronous and return Promises unless otherwise specified.

### API Availability

The Plugin API is available through the global `pluginAPI` object, which is injected into your plugin's JavaScript context when the plugin is loaded.

```javascript
// Check if API is available
if (typeof pluginAPI !== 'undefined') {
    console.log('Plugin API is available')
} else {
    console.error('Plugin API not available')
}
```

### Permission System

Most API methods require specific permissions to be declared in your plugin's `package.json` manifest. The permission system ensures security and user privacy.

## Global Objects

### pluginAPI

The main API object containing all available methods and properties.

```typescript
interface PluginAPI {
    storage: StorageAPI
    notifications: NotificationsAPI
    network: NetworkAPI
    filesystem: FileSystemAPI
    communication: CommunicationAPI
    context: PluginContext
}
```

### pluginContext

Contains information about the current plugin instance.

```typescript
interface PluginContext {
    pluginId: string
    pluginName: string
    version: string
    permissions: string[]
    dataPath: string
    tempPath: string
}
```

## Storage API

The Storage API provides persistent data storage for your plugin. All data is scoped to your plugin and encrypted.

**Required Permission**: `storage`

### Methods

#### `storage.set(key, value)`

Stores a value with the specified key.

**Parameters:**
- `key` (string): The storage key
- `value` (any): The value to store (must be JSON serializable)

**Returns:** `Promise<void>`

**Example:**
```javascript
// Store simple values
await pluginAPI.storage.set('username', 'john_doe')
await pluginAPI.storage.set('count', 42)
await pluginAPI.storage.set('isEnabled', true)

// Store complex objects
await pluginAPI.storage.set('userPreferences', {
    theme: 'dark',
    language: 'en',
    notifications: true
})

// Store arrays
await pluginAPI.storage.set('recentItems', ['item1', 'item2', 'item3'])
```

#### `storage.get(key)`

Retrieves a value by key.

**Parameters:**
- `key` (string): The storage key

**Returns:** `Promise<any>` - The stored value or `null` if not found

**Example:**
```javascript
// Get simple values
const username = await pluginAPI.storage.get('username')
const count = await pluginAPI.storage.get('count')

// Get complex objects
const preferences = await pluginAPI.storage.get('userPreferences')
if (preferences) {
    console.log('Theme:', preferences.theme)
}

// Handle missing values
const missingValue = await pluginAPI.storage.get('nonexistent')
console.log(missingValue) // null
```

#### `storage.remove(key)`

Removes a value by key.

**Parameters:**
- `key` (string): The storage key to remove

**Returns:** `Promise<void>`

**Example:**
```javascript
await pluginAPI.storage.remove('temporaryData')
```

#### `storage.clear()`

Removes all stored data for the plugin.

**Returns:** `Promise<void>`

**Example:**
```javascript
await pluginAPI.storage.clear()
```

#### `storage.keys()`

Returns all storage keys for the plugin.

**Returns:** `Promise<string[]>`

**Example:**
```javascript
const keys = await pluginAPI.storage.keys()
console.log('Stored keys:', keys)
```

#### `storage.size()`

Returns the number of stored items.

**Returns:** `Promise<number>`

**Example:**
```javascript
const itemCount = await pluginAPI.storage.size()
console.log(`Plugin has ${itemCount} stored items`)
```

### Storage Limits

- Maximum key length: 256 characters
- Maximum value size: 1MB per item
- Maximum total storage per plugin: 10MB
- Keys must be strings and cannot be empty

### Storage Best Practices

```javascript
// Use namespaced keys for organization
await pluginAPI.storage.set('settings.theme', 'dark')
await pluginAPI.storage.set('cache.lastUpdate', Date.now())
await pluginAPI.storage.set('user.preferences', userPrefs)

// Handle storage errors gracefully
async function safeStorageSet(key, value) {
    try {
        await pluginAPI.storage.set(key, value)
        return true
    } catch (error) {
        console.error('Storage error:', error)
        return false
    }
}

// Implement data versioning for migrations
const DATA_VERSION = 2
const currentVersion = await pluginAPI.storage.get('dataVersion') || 1

if (currentVersion < DATA_VERSION) {
    await migrateData(currentVersion, DATA_VERSION)
    await pluginAPI.storage.set('dataVersion', DATA_VERSION)
}
```

## Notifications API

Display system notifications to users.

**Required Permission**: `notifications`

### Methods

#### `notifications.show(title, body, options?)`

Displays a system notification.

**Parameters:**
- `title` (string): Notification title
- `body` (string): Notification message
- `options` (object, optional): Additional notification options

**Returns:** `Promise<void>`

**Options:**
```typescript
interface NotificationOptions {
    icon?: string          // Path to notification icon
    tag?: string          // Unique identifier for notification
    requireInteraction?: boolean  // Keep notification visible until user interacts
    silent?: boolean      // Don't play notification sound
    actions?: NotificationAction[]  // Custom action buttons
}

interface NotificationAction {
    action: string        // Action identifier
    title: string        // Button text
    icon?: string        // Button icon
}
```

**Examples:**
```javascript
// Basic notification
await pluginAPI.notifications.show('Task Complete', 'Your task has been completed successfully')

// Notification with icon
await pluginAPI.notifications.show('New Message', 'You have a new message', {
    icon: 'assets/message-icon.png'
})

// Notification with custom actions
await pluginAPI.notifications.show('Download Complete', 'File downloaded successfully', {
    tag: 'download-complete',
    actions: [
        { action: 'open', title: 'Open File' },
        { action: 'folder', title: 'Show in Folder' }
    ]
})

// Silent notification
await pluginAPI.notifications.show('Background Update', 'Data synchronized', {
    silent: true,
    tag: 'sync-update'
})
```

#### `notifications.onAction(callback)`

Listen for notification action clicks.

**Parameters:**
- `callback` (function): Function to call when action is clicked

**Callback Parameters:**
- `action` (string): The action identifier
- `tag` (string): The notification tag

**Example:**
```javascript
pluginAPI.notifications.onAction((action, tag) => {
    if (tag === 'download-complete') {
        if (action === 'open') {
            openDownloadedFile()
        } else if (action === 'folder') {
            showInFolder()
        }
    }
})
```

#### `notifications.close(tag)`

Closes a notification by tag.

**Parameters:**
- `tag` (string): The notification tag to close

**Returns:** `Promise<void>`

**Example:**
```javascript
await pluginAPI.notifications.close('download-complete')
```

### Notification Limits

- Maximum title length: 100 characters
- Maximum body length: 500 characters
- Maximum 5 active notifications per plugin
- Actions limited to 3 per notification

## Network API

Make HTTP requests to external services.

**Required Permission**: `network`

### Methods

#### `network.fetch(url, options?)`

Makes an HTTP request (similar to browser fetch API).

**Parameters:**
- `url` (string): The request URL
- `options` (object, optional): Request options

**Returns:** `Promise<Response>`

**Options:**
```typescript
interface RequestOptions {
    method?: string           // HTTP method (GET, POST, PUT, DELETE, etc.)
    headers?: Record<string, string>  // Request headers
    body?: string | FormData | ArrayBuffer  // Request body
    timeout?: number         // Request timeout in milliseconds
    redirect?: 'follow' | 'error' | 'manual'  // Redirect handling
    credentials?: 'omit' | 'same-origin' | 'include'  // Credential handling
}
```

**Examples:**
```javascript
// GET request
const response = await pluginAPI.network.fetch('https://api.example.com/data')
const data = await response.json()

// POST request with JSON
const response = await pluginAPI.network.fetch('https://api.example.com/submit', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your-token'
    },
    body: JSON.stringify({ key: 'value' })
})

// Request with timeout
const response = await pluginAPI.network.fetch('https://slow-api.com/data', {
    timeout: 5000  // 5 second timeout
})

// Handle different response types
const response = await pluginAPI.network.fetch('https://api.example.com/image.jpg')
const blob = await response.blob()
const imageUrl = URL.createObjectURL(blob)
```

#### `network.download(url, filename?)`

Downloads a file from a URL.

**Parameters:**
- `url` (string): The file URL
- `filename` (string, optional): Suggested filename

**Returns:** `Promise<{ path: string, size: number }>`

**Example:**
```javascript
const result = await pluginAPI.network.download('https://example.com/file.pdf', 'document.pdf')
console.log(`Downloaded to: ${result.path}, Size: ${result.size} bytes`)
```

#### `network.upload(url, file, options?)`

Uploads a file to a URL.

**Parameters:**
- `url` (string): The upload URL
- `file` (File | Blob): The file to upload
- `options` (object, optional): Upload options

**Returns:** `Promise<Response>`

**Example:**
```javascript
const fileInput = document.getElementById('fileInput')
const file = fileInput.files[0]

const response = await pluginAPI.network.upload('https://api.example.com/upload', file, {
    headers: {
        'Authorization': 'Bearer your-token'
    }
})
```

### Network Limits and Security

- Maximum request size: 50MB
- Request timeout: 30 seconds (default)
- HTTPS required for external APIs
- Some domains may be blocked for security
- Rate limiting: 100 requests per minute per plugin

### Network Best Practices

```javascript
// Always handle network errors
async function safeApiCall(url) {
    try {
        const response = await pluginAPI.network.fetch(url, {
            timeout: 10000
        })
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        return await response.json()
    } catch (error) {
        if (error.name === 'TimeoutError') {
            throw new Error('Request timed out')
        } else if (error.name === 'NetworkError') {
            throw new Error('Network connection failed')
        }
        throw error
    }
}

// Implement retry logic
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await pluginAPI.network.fetch(url, options)
        } catch (error) {
            if (i === maxRetries - 1) throw error
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
        }
    }
}
```

## File System API

Limited file system operations within the plugin's sandbox.

**Required Permission**: `filesystem`

### Methods

#### `filesystem.readFile(path)`

Reads a file's contents.

**Parameters:**
- `path` (string): File path (relative to plugin directory)

**Returns:** `Promise<string>`

**Example:**
```javascript
const content = await pluginAPI.filesystem.readFile('data/config.json')
const config = JSON.parse(content)
```

#### `filesystem.writeFile(path, content)`

Writes content to a file.

**Parameters:**
- `path` (string): File path (relative to plugin directory)
- `content` (string): File content

**Returns:** `Promise<void>`

**Example:**
```javascript
const data = JSON.stringify({ setting: 'value' }, null, 2)
await pluginAPI.filesystem.writeFile('data/config.json', data)
```

#### `filesystem.exists(path)`

Checks if a file or directory exists.

**Parameters:**
- `path` (string): File or directory path

**Returns:** `Promise<boolean>`

**Example:**
```javascript
const configExists = await pluginAPI.filesystem.exists('data/config.json')
if (!configExists) {
    await createDefaultConfig()
}
```

#### `filesystem.mkdir(path)`

Creates a directory.

**Parameters:**
- `path` (string): Directory path

**Returns:** `Promise<void>`

**Example:**
```javascript
await pluginAPI.filesystem.mkdir('data/cache')
```

#### `filesystem.readdir(path)`

Lists directory contents.

**Parameters:**
- `path` (string): Directory path

**Returns:** `Promise<string[]>`

**Example:**
```javascript
const files = await pluginAPI.filesystem.readdir('data')
console.log('Data files:', files)
```

#### `filesystem.remove(path)`

Removes a file or directory.

**Parameters:**
- `path` (string): File or directory path

**Returns:** `Promise<void>`

**Example:**
```javascript
await pluginAPI.filesystem.remove('data/temp.txt')
```

### File System Limits

- Access limited to plugin directory and subdirectories
- Maximum file size: 10MB
- Maximum 1000 files per plugin
- No access to system directories
- No executable file creation

## Communication API

Communicate with the main application and other plugins.

**Required Permission**: `communication`

### Methods

#### `communication.sendMessage(message)`

Sends a message to the main application.

**Parameters:**
- `message` (any): Message data (must be JSON serializable)

**Returns:** `Promise<void>`

**Example:**
```javascript
await pluginAPI.communication.sendMessage({
    type: 'user-action',
    action: 'button-clicked',
    data: { buttonId: 'save' }
})
```

#### `communication.onMessage(callback)`

Listens for messages from the main application.

**Parameters:**
- `callback` (function): Message handler function

**Example:**
```javascript
pluginAPI.communication.onMessage((message) => {
    console.log('Received message:', message)
    
    if (message.type === 'theme-changed') {
        updatePluginTheme(message.theme)
    }
})
```

#### `communication.sendToPlugin(pluginId, message)`

Sends a message to another plugin.

**Parameters:**
- `pluginId` (string): Target plugin ID
- `message` (any): Message data

**Returns:** `Promise<void>`

**Example:**
```javascript
await pluginAPI.communication.sendToPlugin('weather-plugin', {
    type: 'location-request',
    city: 'London'
})
```

#### `communication.broadcast(message)`

Broadcasts a message to all plugins.

**Parameters:**
- `message` (any): Message data

**Returns:** `Promise<void>`

**Example:**
```javascript
await pluginAPI.communication.broadcast({
    type: 'global-event',
    event: 'user-logged-out'
})
```

## Plugin Context

The plugin context provides information about the current plugin instance.

### Properties

#### `context.pluginId`

**Type:** `string`  
**Description:** Unique plugin identifier

#### `context.pluginName`

**Type:** `string`  
**Description:** Plugin display name

#### `context.version`

**Type:** `string`  
**Description:** Plugin version

#### `context.permissions`

**Type:** `string[]`  
**Description:** Array of granted permissions

#### `context.dataPath`

**Type:** `string`  
**Description:** Path to plugin's data directory

#### `context.tempPath`

**Type:** `string`  
**Description:** Path to plugin's temporary directory

### Example Usage

```javascript
console.log('Plugin Info:', {
    id: pluginAPI.context.pluginId,
    name: pluginAPI.context.pluginName,
    version: pluginAPI.context.version,
    permissions: pluginAPI.context.permissions
})

// Check if permission is granted
if (pluginAPI.context.permissions.includes('network')) {
    console.log('Network access is available')
}
```

## Error Handling

### Error Types

#### `PermissionError`

Thrown when a plugin tries to use an API without the required permission.

```javascript
try {
    await pluginAPI.storage.set('key', 'value')
} catch (error) {
    if (error.name === 'PermissionError') {
        console.error('Storage permission not granted')
    }
}
```

#### `QuotaExceededError`

Thrown when storage or other resource limits are exceeded.

```javascript
try {
    await pluginAPI.storage.set('large-data', hugeObject)
} catch (error) {
    if (error.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded')
    }
}
```

#### `NetworkError`

Thrown for network-related failures.

```javascript
try {
    const response = await pluginAPI.network.fetch('https://api.example.com/data')
} catch (error) {
    if (error.name === 'NetworkError') {
        console.error('Network request failed:', error.message)
    }
}
```

#### `ValidationError`

Thrown for invalid parameters or data.

```javascript
try {
    await pluginAPI.notifications.show('', 'Empty title not allowed')
} catch (error) {
    if (error.name === 'ValidationError') {
        console.error('Invalid notification parameters')
    }
}
```

### Global Error Handler

```javascript
// Set up global error handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
    // Optionally report to error tracking service
})

window.addEventListener('error', (event) => {
    console.error('JavaScript error:', event.error)
})
```

## Type Definitions

### TypeScript Support

If you're using TypeScript, you can use these type definitions:

```typescript
declare global {
    interface Window {
        pluginAPI: PluginAPI
    }
}

interface PluginAPI {
    storage: {
        set(key: string, value: any): Promise<void>
        get(key: string): Promise<any>
        remove(key: string): Promise<void>
        clear(): Promise<void>
        keys(): Promise<string[]>
        size(): Promise<number>
    }
    
    notifications: {
        show(title: string, body: string, options?: NotificationOptions): Promise<void>
        onAction(callback: (action: string, tag: string) => void): void
        close(tag: string): Promise<void>
    }
    
    network: {
        fetch(url: string, options?: RequestInit): Promise<Response>
        download(url: string, filename?: string): Promise<{ path: string, size: number }>
        upload(url: string, file: File | Blob, options?: RequestInit): Promise<Response>
    }
    
    filesystem: {
        readFile(path: string): Promise<string>
        writeFile(path: string, content: string): Promise<void>
        exists(path: string): Promise<boolean>
        mkdir(path: string): Promise<void>
        readdir(path: string): Promise<string[]>
        remove(path: string): Promise<void>
    }
    
    communication: {
        sendMessage(message: any): Promise<void>
        onMessage(callback: (message: any) => void): void
        sendToPlugin(pluginId: string, message: any): Promise<void>
        broadcast(message: any): Promise<void>
    }
    
    context: {
        pluginId: string
        pluginName: string
        version: string
        permissions: string[]
        dataPath: string
        tempPath: string
    }
}

interface NotificationOptions {
    icon?: string
    tag?: string
    requireInteraction?: boolean
    silent?: boolean
    actions?: NotificationAction[]
}

interface NotificationAction {
    action: string
    title: string
    icon?: string
}
```

## Examples

### Complete Plugin Example

Here's a complete example of a task manager plugin that uses multiple APIs:

```javascript
class TaskManagerPlugin {
    constructor() {
        this.tasks = []
        this.init()
    }

    async init() {
        // Load saved tasks
        this.tasks = await pluginAPI.storage.get('tasks') || []
        
        // Set up UI event listeners
        this.setupEventListeners()
        
        // Listen for messages from main app
        pluginAPI.communication.onMessage(this.handleMessage.bind(this))
        
        // Render initial UI
        this.render()
        
        // Check for overdue tasks
        this.checkOverdueTasks()
    }

    setupEventListeners() {
        document.getElementById('addTask').addEventListener('click', () => {
            this.addTask()
        })
        
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask()
            }
        })
    }

    async addTask() {
        const input = document.getElementById('taskInput')
        const taskText = input.value.trim()
        
        if (!taskText) return
        
        const task = {
            id: Date.now().toString(),
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString(),
            dueDate: null
        }
        
        this.tasks.push(task)
        await this.saveTasks()
        
        input.value = ''
        this.render()
        
        // Show notification
        await pluginAPI.notifications.show('Task Added', `"${taskText}" has been added to your tasks`)
    }

    async toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId)
        if (task) {
            task.completed = !task.completed
            await this.saveTasks()
            this.render()
            
            if (task.completed) {
                await pluginAPI.notifications.show('Task Completed', `"${task.text}" marked as complete`)
            }
        }
    }

    async deleteTask(taskId) {
        this.tasks = this.tasks.filter(t => t.id !== taskId)
        await this.saveTasks()
        this.render()
    }

    async saveTasks() {
        await pluginAPI.storage.set('tasks', this.tasks)
    }

    render() {
        const container = document.getElementById('taskList')
        container.innerHTML = ''
        
        this.tasks.forEach(task => {
            const taskElement = document.createElement('div')
            taskElement.className = `task ${task.completed ? 'completed' : ''}`
            taskElement.innerHTML = `
                <input type="checkbox" ${task.completed ? 'checked' : ''} 
                       onchange="taskManager.toggleTask('${task.id}')">
                <span class="task-text">${task.text}</span>
                <button onclick="taskManager.deleteTask('${task.id}')" class="delete-btn">×</button>
            `
            container.appendChild(taskElement)
        })
    }

    async checkOverdueTasks() {
        const now = new Date()
        const overdueTasks = this.tasks.filter(task => 
            !task.completed && 
            task.dueDate && 
            new Date(task.dueDate) < now
        )
        
        if (overdueTasks.length > 0) {
            await pluginAPI.notifications.show(
                'Overdue Tasks', 
                `You have ${overdueTasks.length} overdue task(s)`,
                { tag: 'overdue-tasks' }
            )
        }
    }

    handleMessage(message) {
        if (message.type === 'theme-changed') {
            document.body.className = `theme-${message.theme}`
        }
    }

    async exportTasks() {
        const data = JSON.stringify(this.tasks, null, 2)
        await pluginAPI.filesystem.writeFile('tasks-export.json', data)
        
        await pluginAPI.notifications.show('Export Complete', 'Tasks exported to tasks-export.json')
    }

    async syncTasks() {
        try {
            const response = await pluginAPI.network.fetch('https://api.taskservice.com/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tasks: this.tasks })
            })
            
            if (response.ok) {
                await pluginAPI.notifications.show('Sync Complete', 'Tasks synchronized successfully')
            }
        } catch (error) {
            console.error('Sync failed:', error)
            await pluginAPI.notifications.show('Sync Failed', 'Could not synchronize tasks')
        }
    }
}

// Initialize plugin when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManagerPlugin()
})
```

This example demonstrates:
- Storage API for persisting tasks
- Notifications API for user feedback
- Communication API for theme updates
- File System API for data export
- Network API for cloud synchronization
- Proper error handling and user experience

---

## API Versioning

The Plugin API follows semantic versioning. Check the API version in your plugin:

```javascript
console.log('API Version:', pluginAPI.version) // e.g., "1.2.0"
```

For backward compatibility, always check API availability:

```javascript
if (pluginAPI.storage && typeof pluginAPI.storage.keys === 'function') {
    // Use newer storage.keys() method
    const keys = await pluginAPI.storage.keys()
} else {
    // Fallback for older API versions
    console.log('Storage.keys() not available in this API version')
}
```

This API reference provides complete documentation for all available plugin APIs. Use it alongside the Plugin Development Guide to create powerful and secure plugins for the Electron Super App platform.