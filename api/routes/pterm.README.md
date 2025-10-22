# Pinokio Terminal API Routes

This API provides programmatic access to Pinokio Terminal (pterm) functionality without requiring global installation. All endpoints use the local `pterm` package installed as a project dependency.

## Base URL

```
/api/pterm
```

## Endpoints

### Version Information

#### Get All Versions

**GET** `/api/pterm/version`

Returns version information for all Pinokio Terminal components.

**Response:**

```json
{
  "success": true,
  "data": {
    "pterm": "pterm@0.0.14",
    "pinokiod": "pinokiod@1.2.3",
    "pinokio": "pinokiod@1.2.3",
    "script": "2.0.0"
  }
}
```

#### Get Specific Version

**GET** `/api/pterm/version/:component`

Returns version for a specific component.

**Parameters:**

- `component` (path) - One of: `terminal`, `pinokiod`, `pinokio`, `script`

**Example:**

```bash
GET /api/pterm/version/terminal
```

**Response:**

```json
{
  "success": true,
  "data": {
    "component": "terminal",
    "version": "pterm@0.0.14"
  }
}
```

---

### Clipboard Operations

#### Copy to Clipboard

**POST** `/api/pterm/clipboard/copy`

Copies text to the system clipboard.

**Request Body:**

```json
{
  "text": "Hello, World!"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Text copied to clipboard"
}
```

#### Paste from Clipboard

**GET** `/api/pterm/clipboard/paste`

Retrieves text from the system clipboard.

**Response:**

```json
{
  "success": true,
  "data": "Hello, World!"
}
```

---

### Desktop Notifications

#### Send Notification

**POST** `/api/pterm/push`

Sends a desktop notification with optional customization.

**Request Body:**

```json
{
  "message": "Build completed successfully",
  "title": "Build Status",
  "subtitle": "Production",
  "sound": true,
  "image": "./icon.png"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Notification sent"
}
```

---

### Script Management

#### Start Script

**POST** `/api/pterm/start`

Starts a Pinokio script with optional arguments.

**Request Body:**

```json
{
  "script": "start.js",
  "args": {
    "port": "3000",
    "model": "google/gemma-3n-E4B-it"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "stdout": "Script output...",
    "stderr": ""
  }
}
```

#### Stop Script

**POST** `/api/pterm/stop`

Stops a running Pinokio script.

**Request Body:**

```json
{
  "script": "start.js"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Script stopped"
}
```

#### Run Launcher

**POST** `/api/pterm/run`

Runs a Pinokio launcher.

**Request Body:**

```json
{
  "path": "/pinokio/api/test"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "stdout": "Launcher output...",
    "stderr": ""
  }
}
```

---

## Usage Examples

### JavaScript/TypeScript

```typescript
// Get all versions
const response = await fetch("http://localhost:3001/api/pterm/version");
const data = await response.json();
console.log(data.data);

// Copy to clipboard
await fetch("http://localhost:3001/api/pterm/clipboard/copy", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ text: "Hello World" }),
});

// Send notification
await fetch("http://localhost:3001/api/pterm/push", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    message: "Task completed",
    title: "Success",
    sound: true,
  }),
});

// Start script with arguments
await fetch("http://localhost:3001/api/pterm/start", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    script: "start.js",
    args: { port: 3000 },
  }),
});
```

### cURL

```bash
# Get all versions
curl http://localhost:3001/api/pterm/version

# Get specific version
curl http://localhost:3001/api/pterm/version/terminal

# Copy to clipboard
curl -X POST http://localhost:3001/api/pterm/clipboard/copy \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello World"}'

# Send notification
curl -X POST http://localhost:3001/api/pterm/push \
  -H "Content-Type: application/json" \
  -d '{"message": "Build complete", "sound": true}'

# Start script
curl -X POST http://localhost:3001/api/pterm/start \
  -H "Content-Type: application/json" \
  -d '{"script": "start.js", "args": {"port": 3000}}'
```

---

## Error Handling

All endpoints return a consistent error format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

Common HTTP status codes:

- `200` - Success
- `400` - Bad Request (invalid parameters)
- `500` - Internal Server Error

---

## Notes

- No global `pterm` installation required
- Uses local `pterm` package via `npx`
- All operations are asynchronous
- Requires Node.js and npm to be available
- Some features may require Pinokio daemon to be running
