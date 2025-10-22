# Environment Variables Configuration

This document describes all environment variables used in the application.

## Setup

1. Copy the example file to create your local `.env`:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` to customize your configuration (optional - defaults work for most cases)

3. The application will load environment variables automatically using `dotenv`

## Available Environment Variables

### Server Configuration

#### `PORT`
- **Description:** Port number for the API server
- **Default:** `3001`
- **Example:** `PORT=3001`
- **Used in:** API server startup

#### `NODE_ENV`
- **Description:** Application environment (development, production, test)
- **Default:** `development`
- **Example:** `NODE_ENV=development`
- **Used in:** Environment-specific configuration and logging

---

### Pinokio Daemon Configuration

#### `PINOKIO_HOME`
- **Description:** Home directory for Pinokio data, scripts, and cache
- **Default:** `~/pinokio` (user's home directory + `pinokio`)
- **Example:** `PINOKIO_HOME=/custom/path/to/pinokio`
- **Used in:** Pinokio daemon initialization, file operations
- **Note:** The patch ensures this defaults to `~/pinokio` even if not set

#### `PINOKIO_DAEMON_PORT`
- **Description:** Port number for the Pinokio daemon server
- **Default:** `42000`
- **Example:** `PINOKIO_DAEMON_PORT=42000`
- **Used in:** Pinokio daemon startup, API requests to daemon

#### `PINOKIO_DAEMON_HOST`
- **Description:** Host address for the Pinokio daemon
- **Default:** `localhost`
- **Example:** `PINOKIO_DAEMON_HOST=localhost`
- **Used in:** API requests to daemon

---

### Proxy Settings (Optional)

#### `HTTP_PROXY`
- **Description:** HTTP proxy server URL
- **Default:** (empty)
- **Example:** `HTTP_PROXY=http://proxy.example.com:8080`
- **Used in:** Pinokio daemon HTTP requests

#### `HTTPS_PROXY`
- **Description:** HTTPS proxy server URL
- **Default:** (empty)
- **Example:** `HTTPS_PROXY=http://proxy.example.com:8080`
- **Used in:** Pinokio daemon HTTPS requests

#### `NO_PROXY`
- **Description:** Comma-separated list of domains to exclude from proxy
- **Default:** (empty)
- **Example:** `NO_PROXY=localhost,127.0.0.1,.local`
- **Used in:** Pinokio daemon proxy bypass

---

### Pinokio Network Settings (Optional)

#### `PINOKIO_NETWORK_ACTIVE`
- **Description:** Enable/disable Pinokio network features
- **Default:** `false`
- **Example:** `PINOKIO_NETWORK_ACTIVE=false`
- **Values:** `true`, `false`, `1`, `0`
- **Used in:** Pinokio daemon network initialization

#### `PINOKIO_NETWORK_SHARE`
- **Description:** Enable/disable network sharing
- **Default:** `false`
- **Example:** `PINOKIO_NETWORK_SHARE=false`
- **Values:** `true`, `false`, `1`, `0`
- **Used in:** Pinokio daemon network sharing features

---

## How Environment Variables Are Used

### In `api/app.ts`
```typescript
// Load environment variables first
dotenv.config();

// Environment variables with defaults
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || "development";
const PINOKIO_HOME = process.env.PINOKIO_HOME || path.join(homedir(), "pinokio");
const PINOKIO_DAEMON_PORT = process.env.PINOKIO_DAEMON_PORT || 42000;
const PINOKIO_DAEMON_HOST = process.env.PINOKIO_DAEMON_HOST || "localhost";
```

### In `api/routes/pterm.ts`
```typescript
// Pinokio daemon base URL from environment variables
const PINOKIO_DAEMON_HOST = process.env.PINOKIO_DAEMON_HOST || "localhost";
const PINOKIO_DAEMON_PORT = process.env.PINOKIO_DAEMON_PORT || "42000";
const PINOKIO_DAEMON_URL = `http://${PINOKIO_DAEMON_HOST}:${PINOKIO_DAEMON_PORT}`;
```

### Passed to Pinokio Daemon
```typescript
const config = {
  // ... other config
  store: {
    home: PINOKIO_HOME,
    HTTP_PROXY,
    HTTPS_PROXY,
    NO_PROXY,
  },
};
```

---

## Default Configuration

If you don't create a `.env` file, the application will use these defaults:

```bash
PORT=3001
NODE_ENV=development
PINOKIO_HOME=~/pinokio
PINOKIO_DAEMON_PORT=42000
PINOKIO_DAEMON_HOST=localhost
HTTP_PROXY=
HTTPS_PROXY=
NO_PROXY=
PINOKIO_NETWORK_ACTIVE=false
PINOKIO_NETWORK_SHARE=false
```

---

## Runtime URLs

Based on the environment variables, the application constructs these URLs:

- **API Server:** `http://localhost:${PORT}`
  - Example: `http://localhost:3001`

- **Pinokio Daemon:** `http://${PINOKIO_DAEMON_HOST}:${PINOKIO_DAEMON_PORT}`
  - Example: `http://localhost:42000`

---

## Troubleshooting

### Port Already in Use

If you get a port conflict error:

```bash
# Change the API port
PORT=3002 npm run server:dev

# Or change the Pinokio daemon port
PINOKIO_DAEMON_PORT=42001 npm run server:dev
```

### Custom Pinokio Home Directory

To use a custom directory for Pinokio data:

```bash
# Set in .env
PINOKIO_HOME=/path/to/custom/directory

# Or set temporarily
PINOKIO_HOME=/path/to/custom/directory npm run server:dev
```

### Behind a Proxy

If you're behind a corporate proxy:

```bash
# Set in .env
HTTP_PROXY=http://proxy.company.com:8080
HTTPS_PROXY=http://proxy.company.com:8080
NO_PROXY=localhost,127.0.0.1,.local
```

---

## Security Notes

1. **Never commit `.env` to version control** - It's already in `.gitignore`
2. **Use `env.example`** to document required variables for team members
3. **Production values** should be set in your deployment environment
4. **Sensitive data** (API keys, passwords) should never be hardcoded

---

## See Also

- [PATCH_SETUP.md](../PATCH_SETUP.md) - Pinokio patch setup
- [docs/PINOKIO_PATCH_FIX.md](PINOKIO_PATCH_FIX.md) - Patch fix details
- [env.example](../env.example) - Example environment file

