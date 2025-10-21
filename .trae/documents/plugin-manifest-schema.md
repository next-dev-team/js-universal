# Plugin Manifest Schema

## Overview

Every plugin must include a `package.json` file that serves as the plugin manifest. This file contains metadata, configuration, and requirements for your plugin.

## Complete Schema

```json
{
  "name": "string (required)",
  "version": "string (required)",
  "description": "string (required)",
  "author": "string (required)",
  "main": "string (required)",
  "permissions": ["string[]"],
  "category": "string",
  "icon": "string",
  "keywords": ["string[]"],
  "homepage": "string",
  "repository": "object",
  "license": "string",
  "engines": "object",
  "window": "object",
  "settings": "object",
  "dependencies": "object",
  "devDependencies": "object"
}
```

## Required Fields

### `name`
**Type:** `string`  
**Required:** Yes  
**Description:** Unique plugin identifier. Must be lowercase, URL-safe, and unique across all plugins.

**Rules:**
- Must be 3-50 characters long
- Only lowercase letters, numbers, hyphens, and underscores
- Cannot start or end with hyphen or underscore
- Cannot contain consecutive hyphens or underscores

**Examples:**
```json
{
  "name": "weather-widget"
}
```

```json
{
  "name": "task_manager"
}
```

**Invalid Examples:**
```json
{
  "name": "Weather Widget"  // Contains spaces and uppercase
}
```

```json
{
  "name": "-weather"  // Starts with hyphen
}
```

### `version`
**Type:** `string`  
**Required:** Yes  
**Description:** Plugin version following semantic versioning (semver).

**Format:** `MAJOR.MINOR.PATCH`

**Examples:**
```json
{
  "version": "1.0.0"
}
```

```json
{
  "version": "2.1.3"
}
```

### `description`
**Type:** `string`  
**Required:** Yes  
**Description:** Brief description of what the plugin does.

**Rules:**
- Maximum 200 characters
- Should be clear and descriptive
- Avoid marketing language

**Examples:**
```json
{
  "description": "A simple counter widget that tracks and displays numerical values"
}
```

```json
{
  "description": "Weather forecast display with current conditions and 5-day outlook"
}
```

### `author`
**Type:** `string`  
**Required:** Yes  
**Description:** Plugin author information.

**Format:** Can be a simple name or include email and URL.

**Examples:**
```json
{
  "author": "John Doe"
}
```

```json
{
  "author": "John Doe <john@example.com>"
}
```

```json
{
  "author": "John Doe <john@example.com> (https://johndoe.com)"
}
```

### `main`
**Type:** `string`  
**Required:** Yes  
**Description:** Entry point file for the plugin.

**Rules:**
- Must be a valid file path relative to plugin root
- Typically an HTML file for UI plugins
- Can be a JavaScript file for background plugins

**Examples:**
```json
{
  "main": "index.html"
}
```

```json
{
  "main": "src/main.html"
}
```

```json
{
  "main": "plugin.js"
}
```

## Optional Fields

### `permissions`
**Type:** `string[]`  
**Required:** No  
**Default:** `[]`  
**Description:** Array of permissions required by the plugin.

**Available Permissions:**
- `storage` - Access to persistent storage
- `network` - Make HTTP requests
- `notifications` - Show system notifications
- `filesystem` - Read/write files in plugin directory
- `communication` - Send/receive messages
- `clipboard` - Access system clipboard
- `system` - Access system information

**Examples:**
```json
{
  "permissions": ["storage", "network"]
}
```

```json
{
  "permissions": ["storage", "notifications", "communication"]
}
```

### `category`
**Type:** `string`  
**Required:** No  
**Default:** `"utility"`  
**Description:** Plugin category for organization in the plugin manager.

**Available Categories:**
- `productivity` - Task management, notes, calendars
- `utility` - General tools and utilities
- `entertainment` - Games, media players
- `communication` - Chat, email, social
- `development` - Developer tools, code editors
- `finance` - Banking, budgeting, crypto
- `health` - Fitness, medical, wellness
- `education` - Learning, reference, tutorials
- `business` - CRM, analytics, project management
- `lifestyle` - Weather, news, shopping

**Example:**
```json
{
  "category": "productivity"
}
```

### `icon`
**Type:** `string`  
**Required:** No  
**Default:** Default plugin icon  
**Description:** Path to plugin icon file.

**Rules:**
- Must be relative to plugin root
- Supported formats: PNG, JPG, SVG
- Recommended size: 64x64 pixels
- Maximum file size: 100KB

**Examples:**
```json
{
  "icon": "icon.png"
}
```

```json
{
  "icon": "assets/plugin-icon.svg"
}
```

### `keywords`
**Type:** `string[]`  
**Required:** No  
**Description:** Keywords for plugin discovery and search.

**Rules:**
- Maximum 10 keywords
- Each keyword maximum 20 characters
- Lowercase recommended

**Example:**
```json
{
  "keywords": ["weather", "forecast", "temperature", "widget"]
}
```

### `homepage`
**Type:** `string`  
**Required:** No  
**Description:** URL to plugin's homepage or documentation.

**Example:**
```json
{
  "homepage": "https://github.com/username/weather-plugin"
}
```

### `repository`
**Type:** `object`  
**Required:** No  
**Description:** Source code repository information.

**Schema:**
```json
{
  "type": "git",
  "url": "https://github.com/username/plugin-name.git"
}
```

**Example:**
```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/johndoe/weather-widget.git"
  }
}
```

### `license`
**Type:** `string`  
**Required:** No  
**Default:** `"UNLICENSED"`  
**Description:** Plugin license identifier.

**Common Values:**
- `MIT`
- `Apache-2.0`
- `GPL-3.0`
- `BSD-3-Clause`
- `UNLICENSED`

**Example:**
```json
{
  "license": "MIT"
}
```

### `engines`
**Type:** `object`  
**Required:** No  
**Description:** Specify compatible app versions.

**Schema:**
```json
{
  "app": ">=1.0.0",
  "node": ">=16.0.0"
}
```

**Example:**
```json
{
  "engines": {
    "app": ">=2.1.0",
    "node": ">=18.0.0"
  }
}
```

### `window`
**Type:** `object`  
**Required:** No  
**Description:** Window configuration for UI plugins.

**Schema:**
```json
{
  "width": "number",
  "height": "number",
  "minWidth": "number",
  "minHeight": "number",
  "maxWidth": "number",
  "maxHeight": "number",
  "resizable": "boolean",
  "frame": "boolean",
  "transparent": "boolean",
  "alwaysOnTop": "boolean"
}
```

**Default Values:**
```json
{
  "width": 800,
  "height": 600,
  "minWidth": 300,
  "minHeight": 200,
  "resizable": true,
  "frame": true,
  "transparent": false,
  "alwaysOnTop": false
}
```

**Example:**
```json
{
  "window": {
    "width": 400,
    "height": 300,
    "resizable": false,
    "frame": false
  }
}
```

### `settings`
**Type:** `object`  
**Required:** No  
**Description:** Plugin settings schema for user configuration.

**Schema:**
```json
{
  "properties": {
    "settingName": {
      "type": "string|number|boolean|array|object",
      "title": "string",
      "description": "string",
      "default": "any",
      "enum": ["array"],
      "minimum": "number",
      "maximum": "number",
      "required": "boolean"
    }
  }
}
```

**Example:**
```json
{
  "settings": {
    "properties": {
      "apiKey": {
        "type": "string",
        "title": "API Key",
        "description": "Your weather service API key",
        "required": true
      },
      "updateInterval": {
        "type": "number",
        "title": "Update Interval (minutes)",
        "description": "How often to refresh weather data",
        "default": 30,
        "minimum": 5,
        "maximum": 1440
      },
      "units": {
        "type": "string",
        "title": "Temperature Units",
        "description": "Temperature display units",
        "default": "celsius",
        "enum": ["celsius", "fahrenheit"]
      },
      "showNotifications": {
        "type": "boolean",
        "title": "Show Notifications",
        "description": "Display weather alerts as notifications",
        "default": true
      }
    }
  }
}
```

### `dependencies`
**Type:** `object`  
**Required:** No  
**Description:** Runtime dependencies (not currently supported, reserved for future use).

### `devDependencies`
**Type:** `object`  
**Required:** No  
**Description:** Development dependencies (not currently supported, reserved for future use).

## Complete Examples

### Simple Counter Plugin

```json
{
  "name": "simple-counter",
  "version": "1.0.0",
  "description": "A basic counter widget for tracking numbers",
  "author": "John Doe <john@example.com>",
  "main": "index.html",
  "permissions": ["storage"],
  "category": "utility",
  "icon": "counter-icon.png",
  "keywords": ["counter", "widget", "numbers"],
  "license": "MIT",
  "window": {
    "width": 300,
    "height": 200,
    "resizable": false
  }
}
```

### Advanced Weather Plugin

```json
{
  "name": "weather-forecast",
  "version": "2.1.0",
  "description": "Comprehensive weather widget with forecasts, alerts, and customizable display",
  "author": "Weather Corp <support@weathercorp.com> (https://weathercorp.com)",
  "main": "src/index.html",
  "permissions": [
    "storage",
    "network",
    "notifications",
    "communication"
  ],
  "category": "lifestyle",
  "icon": "assets/weather-icon.svg",
  "keywords": [
    "weather",
    "forecast",
    "temperature",
    "climate",
    "alerts"
  ],
  "homepage": "https://github.com/weathercorp/weather-plugin",
  "repository": {
    "type": "git",
    "url": "https://github.com/weathercorp/weather-plugin.git"
  },
  "license": "Apache-2.0",
  "engines": {
    "app": ">=2.0.0",
    "node": ">=18.0.0"
  },
  "window": {
    "width": 500,
    "height": 400,
    "minWidth": 350,
    "minHeight": 300,
    "resizable": true
  },
  "settings": {
    "properties": {
      "apiKey": {
        "type": "string",
        "title": "Weather API Key",
        "description": "Your OpenWeatherMap API key",
        "required": true
      },
      "location": {
        "type": "string",
        "title": "Default Location",
        "description": "City name or coordinates (lat,lon)",
        "default": "London"
      },
      "units": {
        "type": "string",
        "title": "Temperature Units",
        "description": "Temperature display format",
        "default": "celsius",
        "enum": ["celsius", "fahrenheit", "kelvin"]
      },
      "updateInterval": {
        "type": "number",
        "title": "Update Interval",
        "description": "Minutes between weather updates",
        "default": 30,
        "minimum": 5,
        "maximum": 1440
      },
      "showAlerts": {
        "type": "boolean",
        "title": "Weather Alerts",
        "description": "Show severe weather notifications",
        "default": true
      },
      "theme": {
        "type": "string",
        "title": "Display Theme",
        "description": "Visual theme for the weather display",
        "default": "auto",
        "enum": ["light", "dark", "auto"]
      }
    }
  }
}
```

### Background Service Plugin

```json
{
  "name": "system-monitor",
  "version": "1.5.2",
  "description": "Background system monitoring with performance alerts",
  "author": "System Tools Inc",
  "main": "monitor.js",
  "permissions": [
    "system",
    "storage",
    "notifications",
    "communication"
  ],
  "category": "development",
  "icon": "monitor-icon.png",
  "keywords": [
    "system",
    "monitor",
    "performance",
    "cpu",
    "memory"
  ],
  "license": "GPL-3.0",
  "settings": {
    "properties": {
      "cpuThreshold": {
        "type": "number",
        "title": "CPU Alert Threshold (%)",
        "description": "CPU usage percentage to trigger alerts",
        "default": 80,
        "minimum": 50,
        "maximum": 95
      },
      "memoryThreshold": {
        "type": "number",
        "title": "Memory Alert Threshold (%)",
        "description": "Memory usage percentage to trigger alerts",
        "default": 85,
        "minimum": 60,
        "maximum": 95
      },
      "checkInterval": {
        "type": "number",
        "title": "Check Interval (seconds)",
        "description": "How often to check system resources",
        "default": 10,
        "minimum": 5,
        "maximum": 300
      }
    }
  }
}
```

## Validation Rules

### Name Validation
```javascript
// Valid names
"weather-widget"     ✓
"task_manager"       ✓
"my-plugin-v2"       ✓
"simple123"          ✓

// Invalid names
"Weather Widget"     ✗ (spaces, uppercase)
"-weather"           ✗ (starts with hyphen)
"plugin_"            ✗ (ends with underscore)
"my--plugin"         ✗ (consecutive hyphens)
"ab"                 ✗ (too short)
```

### Version Validation
```javascript
// Valid versions
"1.0.0"              ✓
"2.1.3"              ✓
"10.0.0-beta.1"      ✓
"1.2.3-alpha"        ✓

// Invalid versions
"1.0"                ✗ (missing patch)
"v1.0.0"             ✗ (has 'v' prefix)
"1.0.0.1"            ✗ (too many parts)
```

### Permission Validation
```javascript
// Valid permissions
["storage"]                           ✓
["storage", "network", "notifications"] ✓
[]                                    ✓

// Invalid permissions
["invalid-permission"]                ✗
["storage", "storage"]                ✗ (duplicates)
```

## Schema Validation

You can validate your `package.json` using this JSON Schema:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["name", "version", "description", "author", "main"],
  "properties": {
    "name": {
      "type": "string",
      "pattern": "^[a-z0-9]([a-z0-9_-]*[a-z0-9])?$",
      "minLength": 3,
      "maxLength": 50
    },
    "version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+(-[a-zA-Z0-9.-]+)?$"
    },
    "description": {
      "type": "string",
      "maxLength": 200
    },
    "author": {
      "type": "string",
      "minLength": 1
    },
    "main": {
      "type": "string",
      "minLength": 1
    },
    "permissions": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": [
          "storage",
          "network",
          "notifications",
          "filesystem",
          "communication",
          "clipboard",
          "system"
        ]
      },
      "uniqueItems": true
    },
    "category": {
      "type": "string",
      "enum": [
        "productivity",
        "utility",
        "entertainment",
        "communication",
        "development",
        "finance",
        "health",
        "education",
        "business",
        "lifestyle"
      ]
    },
    "icon": {
      "type": "string"
    },
    "keywords": {
      "type": "array",
      "items": {
        "type": "string",
        "maxLength": 20
      },
      "maxItems": 10
    },
    "homepage": {
      "type": "string",
      "format": "uri"
    },
    "repository": {
      "type": "object",
      "properties": {
        "type": {
          "type": "string"
        },
        "url": {
          "type": "string",
          "format": "uri"
        }
      },
      "required": ["type", "url"]
    },
    "license": {
      "type": "string"
    },
    "engines": {
      "type": "object",
      "properties": {
        "app": {
          "type": "string"
        },
        "node": {
          "type": "string"
        }
      }
    },
    "window": {
      "type": "object",
      "properties": {
        "width": {
          "type": "number",
          "minimum": 100
        },
        "height": {
          "type": "number",
          "minimum": 100
        },
        "minWidth": {
          "type": "number",
          "minimum": 100
        },
        "minHeight": {
          "type": "number",
          "minimum": 100
        },
        "maxWidth": {
          "type": "number"
        },
        "maxHeight": {
          "type": "number"
        },
        "resizable": {
          "type": "boolean"
        },
        "frame": {
          "type": "boolean"
        },
        "transparent": {
          "type": "boolean"
        },
        "alwaysOnTop": {
          "type": "boolean"
        }
      }
    },
    "settings": {
      "type": "object",
      "properties": {
        "properties": {
          "type": "object",
          "patternProperties": {
            "^[a-zA-Z][a-zA-Z0-9_]*$": {
              "type": "object",
              "properties": {
                "type": {
                  "type": "string",
                  "enum": ["string", "number", "boolean", "array", "object"]
                },
                "title": {
                  "type": "string"
                },
                "description": {
                  "type": "string"
                },
                "default": {},
                "enum": {
                  "type": "array"
                },
                "minimum": {
                  "type": "number"
                },
                "maximum": {
                  "type": "number"
                },
                "required": {
                  "type": "boolean"
                }
              },
              "required": ["type"]
            }
          }
        }
      }
    }
  }
}
```

## Common Mistakes

### 1. Invalid Name Format
```json
// ❌ Wrong
{
  "name": "My Weather Plugin"
}

// ✅ Correct
{
  "name": "my-weather-plugin"
}
```

### 2. Missing Required Fields
```json
// ❌ Wrong - missing required fields
{
  "name": "weather-plugin",
  "version": "1.0.0"
}

// ✅ Correct - all required fields present
{
  "name": "weather-plugin",
  "version": "1.0.0",
  "description": "Weather forecast widget",
  "author": "John Doe",
  "main": "index.html"
}
```

### 3. Invalid Permissions
```json
// ❌ Wrong
{
  "permissions": ["storage", "internet", "files"]
}

// ✅ Correct
{
  "permissions": ["storage", "network", "filesystem"]
}
```

### 4. Incorrect Window Configuration
```json
// ❌ Wrong - negative dimensions
{
  "window": {
    "width": -100,
    "height": 50
  }
}

// ✅ Correct
{
  "window": {
    "width": 400,
    "height": 300
  }
}
```

## Best Practices

1. **Use Semantic Versioning**: Follow semver for version numbers
2. **Descriptive Names**: Choose clear, descriptive plugin names
3. **Minimal Permissions**: Only request permissions you actually need
4. **Proper Categories**: Choose the most appropriate category
5. **Good Documentation**: Include homepage and repository URLs
6. **Reasonable Defaults**: Provide sensible default values in settings
7. **Icon Guidelines**: Use high-quality, appropriately sized icons
8. **Keyword Optimization**: Use relevant keywords for discoverability

This manifest schema ensures your plugin is properly configured and compatible with the Electron Super App platform.