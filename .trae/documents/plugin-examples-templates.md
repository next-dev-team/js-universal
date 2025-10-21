# Plugin Examples and Templates

## Table of Contents
1. [Basic Counter Plugin](#basic-counter-plugin)
2. [Weather Widget Plugin](#weather-widget-plugin)
3. [Todo List Plugin](#todo-list-plugin)
4. [Note Taking Plugin](#note-taking-plugin)
5. [System Monitor Plugin](#system-monitor-plugin)
6. [Chat Widget Plugin](#chat-widget-plugin)
7. [File Manager Plugin](#file-manager-plugin)
8. [Calculator Plugin](#calculator-plugin)
9. [Timer Plugin](#timer-plugin)
10. [Plugin Templates](#plugin-templates)

## Basic Counter Plugin

A simple counter widget that demonstrates basic storage and UI interaction.

### File Structure
```
counter-plugin/
├── package.json
├── index.html
├── style.css
├── script.js
└── icon.png
```

### package.json
```json
{
  "name": "simple-counter",
  "version": "1.0.0",
  "description": "A basic counter widget for tracking numbers",
  "author": "Plugin Developer",
  "main": "index.html",
  "permissions": ["storage"],
  "category": "utility",
  "icon": "icon.png",
  "keywords": ["counter", "widget", "numbers"],
  "license": "MIT",
  "window": {
    "width": 300,
    "height": 200,
    "resizable": false
  }
}
```

### index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Counter Plugin</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>Counter</h1>
        <div class="counter-display">
            <span id="counter-value">0</span>
        </div>
        <div class="controls">
            <button id="decrement" class="btn btn-danger">-</button>
            <button id="reset" class="btn btn-secondary">Reset</button>
            <button id="increment" class="btn btn-success">+</button>
        </div>
    </div>
    <script src="script.js"></script>
</body>
</html>
```

### style.css
```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.container {
    text-align: center;
    padding: 20px;
}

h1 {
    margin-bottom: 20px;
    font-size: 24px;
    font-weight: 300;
}

.counter-display {
    margin: 20px 0;
    padding: 20px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    backdrop-filter: blur(10px);
}

#counter-value {
    font-size: 48px;
    font-weight: bold;
    display: block;
}

.controls {
    display: flex;
    gap: 10px;
    justify-content: center;
}

.btn {
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 60px;
}

.btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn-success {
    background: #28a745;
    color: white;
}

.btn-danger {
    background: #dc3545;
    color: white;
}

.btn-secondary {
    background: #6c757d;
    color: white;
}
```

### script.js
```javascript
class CounterPlugin {
    constructor() {
        this.counter = 0
        this.init()
    }

    async init() {
        // Load saved counter value
        this.counter = await pluginAPI.storage.get('counter') || 0
        this.updateDisplay()
        this.setupEventListeners()
    }

    setupEventListeners() {
        document.getElementById('increment').addEventListener('click', () => {
            this.increment()
        })

        document.getElementById('decrement').addEventListener('click', () => {
            this.decrement()
        })

        document.getElementById('reset').addEventListener('click', () => {
            this.reset()
        })

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp' || e.key === '+') {
                this.increment()
            } else if (e.key === 'ArrowDown' || e.key === '-') {
                this.decrement()
            } else if (e.key === 'r' || e.key === 'R') {
                this.reset()
            }
        })
    }

    async increment() {
        this.counter++
        await this.saveCounter()
        this.updateDisplay()
    }

    async decrement() {
        this.counter--
        await this.saveCounter()
        this.updateDisplay()
    }

    async reset() {
        this.counter = 0
        await this.saveCounter()
        this.updateDisplay()
    }

    updateDisplay() {
        document.getElementById('counter-value').textContent = this.counter
    }

    async saveCounter() {
        await pluginAPI.storage.set('counter', this.counter)
    }
}

// Initialize plugin when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CounterPlugin()
})
```

## Weather Widget Plugin

A comprehensive weather widget that demonstrates network requests, settings, and notifications.

### File Structure
```
weather-widget/
├── package.json
├── index.html
├── style.css
├── script.js
├── weather-icons/
│   ├── sunny.svg
│   ├── cloudy.svg
│   ├── rainy.svg
│   └── snowy.svg
└── icon.png
```

### package.json
```json
{
  "name": "weather-widget",
  "version": "2.0.0",
  "description": "Weather forecast widget with current conditions and alerts",
  "author": "Weather Corp <support@weathercorp.com>",
  "main": "index.html",
  "permissions": [
    "storage",
    "network",
    "notifications"
  ],
  "category": "lifestyle",
  "icon": "icon.png",
  "keywords": ["weather", "forecast", "temperature", "climate"],
  "license": "MIT",
  "window": {
    "width": 400,
    "height": 500,
    "minWidth": 350,
    "minHeight": 400,
    "resizable": true
  },
  "settings": {
    "properties": {
      "apiKey": {
        "type": "string",
        "title": "OpenWeatherMap API Key",
        "description": "Get your free API key from openweathermap.org",
        "required": true
      },
      "location": {
        "type": "string",
        "title": "Default Location",
        "description": "City name (e.g., 'London' or 'New York, US')",
        "default": "London"
      },
      "units": {
        "type": "string",
        "title": "Temperature Units",
        "description": "Temperature display format",
        "default": "celsius",
        "enum": ["celsius", "fahrenheit"]
      },
      "updateInterval": {
        "type": "number",
        "title": "Update Interval (minutes)",
        "description": "How often to refresh weather data",
        "default": 30,
        "minimum": 5,
        "maximum": 1440
      },
      "showAlerts": {
        "type": "boolean",
        "title": "Weather Alerts",
        "description": "Show severe weather notifications",
        "default": true
      }
    }
  }
}
```

### index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Weather Widget</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>Weather</h1>
            <button id="refresh-btn" class="refresh-btn" title="Refresh">🔄</button>
        </header>

        <div id="loading" class="loading">
            <div class="spinner"></div>
            <p>Loading weather data...</p>
        </div>

        <div id="error" class="error" style="display: none;">
            <p id="error-message">Failed to load weather data</p>
            <button id="retry-btn" class="btn">Retry</button>
        </div>

        <div id="weather-content" class="weather-content" style="display: none;">
            <div class="current-weather">
                <div class="weather-icon">
                    <img id="weather-icon" src="" alt="Weather icon">
                </div>
                <div class="weather-info">
                    <div class="temperature">
                        <span id="temperature">--</span>
                        <span id="unit">°C</span>
                    </div>
                    <div class="description" id="description">--</div>
                    <div class="location" id="location">--</div>
                </div>
            </div>

            <div class="weather-details">
                <div class="detail-item">
                    <span class="label">Feels like</span>
                    <span id="feels-like">--°</span>
                </div>
                <div class="detail-item">
                    <span class="label">Humidity</span>
                    <span id="humidity">--%</span>
                </div>
                <div class="detail-item">
                    <span class="label">Wind</span>
                    <span id="wind">-- km/h</span>
                </div>
                <div class="detail-item">
                    <span class="label">Pressure</span>
                    <span id="pressure">-- hPa</span>
                </div>
            </div>

            <div class="forecast">
                <h3>5-Day Forecast</h3>
                <div id="forecast-list" class="forecast-list">
                    <!-- Forecast items will be inserted here -->
                </div>
            </div>
        </div>

        <div class="last-updated">
            <span id="last-updated">Never updated</span>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>
```

### script.js
```javascript
class WeatherWidget {
    constructor() {
        this.settings = {}
        this.weatherData = null
        this.updateTimer = null
        this.init()
    }

    async init() {
        await this.loadSettings()
        this.setupEventListeners()
        await this.loadWeatherData()
        this.startAutoUpdate()
    }

    async loadSettings() {
        this.settings = {
            apiKey: await pluginAPI.storage.get('apiKey') || '',
            location: await pluginAPI.storage.get('location') || 'London',
            units: await pluginAPI.storage.get('units') || 'celsius',
            updateInterval: await pluginAPI.storage.get('updateInterval') || 30,
            showAlerts: await pluginAPI.storage.get('showAlerts') !== false
        }

        // Update unit display
        document.getElementById('unit').textContent = 
            this.settings.units === 'fahrenheit' ? '°F' : '°C'
    }

    setupEventListeners() {
        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.loadWeatherData()
        })

        document.getElementById('retry-btn').addEventListener('click', () => {
            this.loadWeatherData()
        })
    }

    async loadWeatherData() {
        if (!this.settings.apiKey) {
            this.showError('Please configure your API key in plugin settings')
            return
        }

        this.showLoading()

        try {
            const units = this.settings.units === 'fahrenheit' ? 'imperial' : 'metric'
            const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(this.settings.location)}&appid=${this.settings.apiKey}&units=${units}`
            
            const response = await pluginAPI.network.fetch(currentWeatherUrl, {
                timeout: 10000
            })

            if (!response.ok) {
                throw new Error(`Weather API error: ${response.status}`)
            }

            const data = await response.json()
            this.weatherData = data
            
            // Load forecast data
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(this.settings.location)}&appid=${this.settings.apiKey}&units=${units}`
            const forecastResponse = await pluginAPI.network.fetch(forecastUrl)
            const forecastData = await forecastResponse.json()
            
            this.displayWeatherData(data, forecastData)
            this.hideError()
            this.hideLoading()
            
            // Check for weather alerts
            if (this.settings.showAlerts) {
                this.checkWeatherAlerts(data)
            }
            
            // Update last updated time
            document.getElementById('last-updated').textContent = 
                `Last updated: ${new Date().toLocaleTimeString()}`

        } catch (error) {
            console.error('Weather data error:', error)
            this.showError(error.message)
            this.hideLoading()
        }
    }

    displayWeatherData(current, forecast) {
        // Current weather
        document.getElementById('temperature').textContent = Math.round(current.main.temp)
        document.getElementById('description').textContent = 
            current.weather[0].description.charAt(0).toUpperCase() + 
            current.weather[0].description.slice(1)
        document.getElementById('location').textContent = 
            `${current.name}, ${current.sys.country}`
        
        // Weather icon
        const iconCode = current.weather[0].icon
        document.getElementById('weather-icon').src = 
            `https://openweathermap.org/img/wn/${iconCode}@2x.png`
        
        // Details
        document.getElementById('feels-like').textContent = 
            `${Math.round(current.main.feels_like)}°`
        document.getElementById('humidity').textContent = `${current.main.humidity}%`
        document.getElementById('wind').textContent = 
            `${Math.round(current.wind.speed * 3.6)} km/h`
        document.getElementById('pressure').textContent = `${current.main.pressure} hPa`
        
        // Forecast
        this.displayForecast(forecast)
        
        document.getElementById('weather-content').style.display = 'block'
    }

    displayForecast(forecast) {
        const forecastList = document.getElementById('forecast-list')
        forecastList.innerHTML = ''
        
        // Group forecast by day (take one per day)
        const dailyForecasts = {}
        forecast.list.forEach(item => {
            const date = new Date(item.dt * 1000).toDateString()
            if (!dailyForecasts[date]) {
                dailyForecasts[date] = item
            }
        })
        
        // Display first 5 days
        Object.values(dailyForecasts).slice(0, 5).forEach(item => {
            const forecastItem = document.createElement('div')
            forecastItem.className = 'forecast-item'
            
            const date = new Date(item.dt * 1000)
            const dayName = date.toLocaleDateString('en', { weekday: 'short' })
            
            forecastItem.innerHTML = `
                <div class="forecast-day">${dayName}</div>
                <img class="forecast-icon" src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="${item.weather[0].description}">
                <div class="forecast-temp">
                    <span class="high">${Math.round(item.main.temp_max)}°</span>
                    <span class="low">${Math.round(item.main.temp_min)}°</span>
                </div>
            `
            
            forecastList.appendChild(forecastItem)
        })
    }

    async checkWeatherAlerts(data) {
        const temp = data.main.temp
        const condition = data.weather[0].main.toLowerCase()
        
        // Temperature alerts
        if (temp > 35) {
            await pluginAPI.notifications.show(
                'High Temperature Alert',
                `Very hot weather in ${data.name}: ${Math.round(temp)}°`,
                { icon: 'weather-icons/sunny.svg', tag: 'weather-alert' }
            )
        } else if (temp < -10) {
            await pluginAPI.notifications.show(
                'Low Temperature Alert',
                `Very cold weather in ${data.name}: ${Math.round(temp)}°`,
                { icon: 'weather-icons/snowy.svg', tag: 'weather-alert' }
            )
        }
        
        // Severe weather alerts
        if (condition.includes('storm') || condition.includes('thunder')) {
            await pluginAPI.notifications.show(
                'Severe Weather Alert',
                `Thunderstorm warning in ${data.name}`,
                { icon: 'weather-icons/rainy.svg', tag: 'weather-alert' }
            )
        }
    }

    startAutoUpdate() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer)
        }
        
        const intervalMs = this.settings.updateInterval * 60 * 1000
        this.updateTimer = setInterval(() => {
            this.loadWeatherData()
        }, intervalMs)
    }

    showLoading() {
        document.getElementById('loading').style.display = 'block'
        document.getElementById('weather-content').style.display = 'none'
        document.getElementById('error').style.display = 'none'
    }

    hideLoading() {
        document.getElementById('loading').style.display = 'none'
    }

    showError(message) {
        document.getElementById('error-message').textContent = message
        document.getElementById('error').style.display = 'block'
        document.getElementById('weather-content').style.display = 'none'
    }

    hideError() {
        document.getElementById('error').style.display = 'none'
    }
}

// Initialize plugin when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WeatherWidget()
})
```

## Todo List Plugin

A task management plugin demonstrating complex state management and local storage.

### package.json
```json
{
  "name": "todo-list",
  "version": "1.5.0",
  "description": "Simple and efficient todo list manager",
  "author": "Productivity Tools Inc",
  "main": "index.html",
  "permissions": ["storage", "notifications"],
  "category": "productivity",
  "icon": "icon.png",
  "keywords": ["todo", "tasks", "productivity", "list"],
  "license": "MIT",
  "window": {
    "width": 500,
    "height": 600,
    "minWidth": 400,
    "minHeight": 500,
    "resizable": true
  },
  "settings": {
    "properties": {
      "showNotifications": {
        "type": "boolean",
        "title": "Task Notifications",
        "description": "Show notifications when tasks are completed",
        "default": true
      },
      "autoSort": {
        "type": "boolean",
        "title": "Auto Sort Tasks",
        "description": "Automatically sort tasks by priority and due date",
        "default": false
      },
      "theme": {
        "type": "string",
        "title": "Theme",
        "description": "Visual theme for the todo list",
        "default": "light",
        "enum": ["light", "dark", "colorful"]
      }
    }
  }
}
```

### index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Todo List</title>
    <link rel="stylesheet" href="style.css">
</head>
<body class="theme-light">
    <div class="container">
        <header class="header">
            <h1>📝 Todo List</h1>
            <div class="stats">
                <span id="task-count">0 tasks</span>
                <span id="completed-count">0 completed</span>
            </div>
        </header>

        <div class="add-task-form">
            <input type="text" id="task-input" placeholder="Add a new task..." maxlength="200">
            <select id="priority-select">
                <option value="low">Low</option>
                <option value="medium" selected>Medium</option>
                <option value="high">High</option>
            </select>
            <input type="date" id="due-date">
            <button id="add-task-btn" class="btn btn-primary">Add</button>
        </div>

        <div class="filters">
            <button class="filter-btn active" data-filter="all">All</button>
            <button class="filter-btn" data-filter="pending">Pending</button>
            <button class="filter-btn" data-filter="completed">Completed</button>
            <button class="filter-btn" data-filter="overdue">Overdue</button>
        </div>

        <div class="task-list" id="task-list">
            <!-- Tasks will be inserted here -->
        </div>

        <div class="empty-state" id="empty-state" style="display: none;">
            <div class="empty-icon">📋</div>
            <h3>No tasks yet</h3>
            <p>Add your first task to get started!</p>
        </div>

        <div class="actions">
            <button id="clear-completed" class="btn btn-secondary">Clear Completed</button>
            <button id="export-tasks" class="btn btn-secondary">Export</button>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>
```

### script.js
```javascript
class TodoListPlugin {
    constructor() {
        this.tasks = []
        this.currentFilter = 'all'
        this.settings = {}
        this.init()
    }

    async init() {
        await this.loadSettings()
        await this.loadTasks()
        this.setupEventListeners()
        this.applyTheme()
        this.render()
        this.updateStats()
    }

    async loadSettings() {
        this.settings = {
            showNotifications: await pluginAPI.storage.get('showNotifications') !== false,
            autoSort: await pluginAPI.storage.get('autoSort') || false,
            theme: await pluginAPI.storage.get('theme') || 'light'
        }
    }

    async loadTasks() {
        this.tasks = await pluginAPI.storage.get('tasks') || []
        
        // Convert date strings back to Date objects
        this.tasks.forEach(task => {
            if (task.createdAt) task.createdAt = new Date(task.createdAt)
            if (task.dueDate) task.dueDate = new Date(task.dueDate)
            if (task.completedAt) task.completedAt = new Date(task.completedAt)
        })
    }

    async saveTasks() {
        await pluginAPI.storage.set('tasks', this.tasks)
    }

    setupEventListeners() {
        // Add task
        document.getElementById('add-task-btn').addEventListener('click', () => {
            this.addTask()
        })

        document.getElementById('task-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask()
            }
        })

        // Filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter)
            })
        })

        // Actions
        document.getElementById('clear-completed').addEventListener('click', () => {
            this.clearCompleted()
        })

        document.getElementById('export-tasks').addEventListener('click', () => {
            this.exportTasks()
        })
    }

    async addTask() {
        const input = document.getElementById('task-input')
        const prioritySelect = document.getElementById('priority-select')
        const dueDateInput = document.getElementById('due-date')
        
        const text = input.value.trim()
        if (!text) return

        const task = {
            id: Date.now().toString(),
            text: text,
            completed: false,
            priority: prioritySelect.value,
            dueDate: dueDateInput.value ? new Date(dueDateInput.value) : null,
            createdAt: new Date(),
            completedAt: null
        }

        this.tasks.push(task)
        await this.saveTasks()

        // Clear form
        input.value = ''
        dueDateInput.value = ''
        prioritySelect.value = 'medium'

        if (this.settings.autoSort) {
            this.sortTasks()
        }

        this.render()
        this.updateStats()
    }

    async toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId)
        if (!task) return

        task.completed = !task.completed
        task.completedAt = task.completed ? new Date() : null

        await this.saveTasks()

        if (task.completed && this.settings.showNotifications) {
            await pluginAPI.notifications.show(
                'Task Completed! 🎉',
                `"${task.text}" has been marked as complete`,
                { tag: 'task-completed' }
            )
        }

        this.render()
        this.updateStats()
    }

    async deleteTask(taskId) {
        this.tasks = this.tasks.filter(t => t.id !== taskId)
        await this.saveTasks()
        this.render()
        this.updateStats()
    }

    async editTask(taskId, newText) {
        const task = this.tasks.find(t => t.id === taskId)
        if (task && newText.trim()) {
            task.text = newText.trim()
            await this.saveTasks()
            this.render()
        }
    }

    setFilter(filter) {
        this.currentFilter = filter
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter)
        })
        
        this.render()
    }

    getFilteredTasks() {
        const now = new Date()
        
        switch (this.currentFilter) {
            case 'pending':
                return this.tasks.filter(task => !task.completed)
            case 'completed':
                return this.tasks.filter(task => task.completed)
            case 'overdue':
                return this.tasks.filter(task => 
                    !task.completed && 
                    task.dueDate && 
                    task.dueDate < now
                )
            default:
                return this.tasks
        }
    }

    sortTasks() {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        
        this.tasks.sort((a, b) => {
            // Completed tasks go to bottom
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1
            }
            
            // Sort by priority
            const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
            if (priorityDiff !== 0) return priorityDiff
            
            // Sort by due date
            if (a.dueDate && b.dueDate) {
                return a.dueDate - b.dueDate
            } else if (a.dueDate) {
                return -1
            } else if (b.dueDate) {
                return 1
            }
            
            // Sort by creation date
            return b.createdAt - a.createdAt
        })
    }

    render() {
        const taskList = document.getElementById('task-list')
        const emptyState = document.getElementById('empty-state')
        const filteredTasks = this.getFilteredTasks()

        if (filteredTasks.length === 0) {
            taskList.style.display = 'none'
            emptyState.style.display = 'block'
            return
        }

        taskList.style.display = 'block'
        emptyState.style.display = 'none'
        taskList.innerHTML = ''

        filteredTasks.forEach(task => {
            const taskElement = this.createTaskElement(task)
            taskList.appendChild(taskElement)
        })
    }

    createTaskElement(task) {
        const taskDiv = document.createElement('div')
        taskDiv.className = `task ${task.completed ? 'completed' : ''} priority-${task.priority}`
        
        const isOverdue = task.dueDate && task.dueDate < new Date() && !task.completed
        if (isOverdue) {
            taskDiv.classList.add('overdue')
        }

        const dueDateStr = task.dueDate ? 
            task.dueDate.toLocaleDateString() : ''
        
        taskDiv.innerHTML = `
            <div class="task-content">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                       onchange="todoList.toggleTask('${task.id}')">
                <div class="task-text" ondblclick="todoList.startEdit('${task.id}')" 
                     id="task-text-${task.id}">${task.text}</div>
                <input type="text" class="task-edit-input" id="task-edit-${task.id}" 
                       value="${task.text}" style="display: none;"
                       onblur="todoList.finishEdit('${task.id}')"
                       onkeypress="todoList.handleEditKeypress(event, '${task.id}')">
            </div>
            <div class="task-meta">
                <span class="priority-badge priority-${task.priority}">${task.priority}</span>
                ${dueDateStr ? `<span class="due-date ${isOverdue ? 'overdue' : ''}">${dueDateStr}</span>` : ''}
                <button class="delete-btn" onclick="todoList.deleteTask('${task.id}')" title="Delete task">×</button>
            </div>
        `

        return taskDiv
    }

    startEdit(taskId) {
        const textElement = document.getElementById(`task-text-${taskId}`)
        const inputElement = document.getElementById(`task-edit-${taskId}`)
        
        textElement.style.display = 'none'
        inputElement.style.display = 'block'
        inputElement.focus()
        inputElement.select()
    }

    finishEdit(taskId) {
        const textElement = document.getElementById(`task-text-${taskId}`)
        const inputElement = document.getElementById(`task-edit-${taskId}`)
        
        const newText = inputElement.value.trim()
        if (newText) {
            this.editTask(taskId, newText)
        }
        
        textElement.style.display = 'block'
        inputElement.style.display = 'none'
    }

    handleEditKeypress(event, taskId) {
        if (event.key === 'Enter') {
            this.finishEdit(taskId)
        } else if (event.key === 'Escape') {
            const textElement = document.getElementById(`task-text-${taskId}`)
            const inputElement = document.getElementById(`task-edit-${taskId}`)
            
            textElement.style.display = 'block'
            inputElement.style.display = 'none'
        }
    }

    async clearCompleted() {
        const completedCount = this.tasks.filter(t => t.completed).length
        if (completedCount === 0) return

        this.tasks = this.tasks.filter(t => !t.completed)
        await this.saveTasks()
        
        if (this.settings.showNotifications) {
            await pluginAPI.notifications.show(
                'Tasks Cleared',
                `${completedCount} completed task(s) removed`,
                { tag: 'tasks-cleared' }
            )
        }
        
        this.render()
        this.updateStats()
    }

    async exportTasks() {
        const exportData = {
            exportDate: new Date().toISOString(),
            totalTasks: this.tasks.length,
            completedTasks: this.tasks.filter(t => t.completed).length,
            tasks: this.tasks.map(task => ({
                text: task.text,
                completed: task.completed,
                priority: task.priority,
                dueDate: task.dueDate ? task.dueDate.toISOString() : null,
                createdAt: task.createdAt.toISOString(),
                completedAt: task.completedAt ? task.completedAt.toISOString() : null
            }))
        }

        try {
            await pluginAPI.filesystem.writeFile(
                'todo-export.json', 
                JSON.stringify(exportData, null, 2)
            )
            
            await pluginAPI.notifications.show(
                'Export Complete',
                'Tasks exported to todo-export.json',
                { tag: 'export-complete' }
            )
        } catch (error) {
            console.error('Export failed:', error)
        }
    }

    updateStats() {
        const totalTasks = this.tasks.length
        const completedTasks = this.tasks.filter(t => t.completed).length
        
        document.getElementById('task-count').textContent = 
            `${totalTasks} task${totalTasks !== 1 ? 's' : ''}`
        document.getElementById('completed-count').textContent = 
            `${completedTasks} completed`
    }

    applyTheme() {
        document.body.className = `theme-${this.settings.theme}`
    }
}

// Initialize plugin when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.todoList = new TodoListPlugin()
})
```

## Plugin Templates

### Basic Plugin Template

Use this template as a starting point for simple plugins:

```
basic-plugin-template/
├── package.json
├── index.html
├── style.css
├── script.js
└── README.md
```

#### package.json Template
```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "Description of what your plugin does",
  "author": "Your Name <your.email@example.com>",
  "main": "index.html",
  "permissions": [],
  "category": "utility",
  "icon": "icon.png",
  "keywords": ["keyword1", "keyword2"],
  "license": "MIT",
  "window": {
    "width": 400,
    "height": 300,
    "resizable": true
  }
}
```

#### index.html Template
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
    <div class="container">
        <h1>My Plugin</h1>
        <div class="content">
            <!-- Your plugin content here -->
        </div>
    </div>
    <script src="script.js"></script>
</body>
</html>
```

#### script.js Template
```javascript
class MyPlugin {
    constructor() {
        this.init()
    }

    async init() {
        // Initialize your plugin
        this.setupEventListeners()
        await this.loadData()
        this.render()
    }

    setupEventListeners() {
        // Set up event listeners
    }

    async loadData() {
        // Load any saved data
    }

    async saveData() {
        // Save plugin data
    }

    render() {
        // Update the UI
    }
}

// Initialize plugin when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MyPlugin()
})
```

### Advanced Plugin Template

For more complex plugins with settings and multiple features:

```
advanced-plugin-template/
├── package.json
├── index.html
├── src/
│   ├── styles/
│   │   ├── main.css
│   │   └── themes.css
│   ├── scripts/
│   │   ├── main.js
│   │   ├── settings.js
│   │   └── utils.js
│   └── components/
│       ├── header.js
│       └── content.js
├── assets/
│   ├── icons/
│   └── images/
└── README.md
```

This template structure provides better organization for larger plugins with multiple files and features.

## Best Practices for Plugin Development

1. **Modular Code**: Break your plugin into logical modules
2. **Error Handling**: Always handle errors gracefully
3. **User Feedback**: Provide clear feedback for user actions
4. **Performance**: Optimize for smooth user experience
5. **Accessibility**: Make your plugin accessible to all users
6. **Testing**: Test your plugin thoroughly before distribution
7. **Documentation**: Include clear documentation and examples

These examples and templates provide a solid foundation for developing various types of plugins for the Electron Super App platform. Use them as starting points and customize them according to your specific needs.