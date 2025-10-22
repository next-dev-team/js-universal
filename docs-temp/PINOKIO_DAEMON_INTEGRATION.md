# 🚀 Pinokio Daemon Auto-Start Integration

## What Changed

Your Express API server now **automatically starts the Pinokio daemon** when you run `npm run server:dev`! No need to start them separately.

## 🎯 Benefits

### Before

```bash
# Terminal 1 - Start Pinokio daemon manually
cd pinokiod
node server

# Terminal 2 - Start API server
npm run server:dev
```

### After (Now!)

```bash
# Just one command starts BOTH!
npm run server:dev
```

**Result:**

- ✅ Pinokio Daemon running on `http://localhost:42000`
- ✅ API Server running on `http://localhost:3001`
- ✅ Everything ready to go!

## 📊 How It Works

When you run `npm run server:dev`, the server now:

1. **Starts Pinokio Daemon first** (port 42000)
2. **Then starts API Server** (port 3001)
3. **Gracefully shuts down both** on exit (Ctrl+C)

### Server Output

```bash
$ npm run server:dev

🚀 Starting Pinokio Daemon...
Server listening on port 42000
✅ Pinokio Daemon started on http://localhost:42000
==================================================
🎉 API Server is running!
📡 Port: 3001
🌍 Environment: development
🔗 API Health: http://localhost:3001/api/health
🔗 API Docs: http://localhost:3001/api/pterm/version
🔧 Pinokio Daemon: http://localhost:42000
==================================================
```

## 🔧 Technical Details

### Modified File: `api/server.ts`

```typescript
// Auto-start Pinokio daemon
async function startPinokioDaemon() {
  const { createRequire } = await import("module");
  const require = createRequire(import.meta.url);
  const PinokioServer = require("../pinokiod/server/index.js");

  pinokioServer = new PinokioServer();
  await pinokioServer.start(); // Port 42000
}

// Start both servers
await startPinokioDaemon(); // First
const server = app.listen(PORT); // Then
```

### Graceful Shutdown

Both servers shut down cleanly when you stop the process:

```typescript
const cleanup = async () => {
  // Close API server
  await server.close();

  // Close Pinokio daemon
  await pinokioServer.httpTerminator.terminate();

  process.exit(0);
};

process.on("SIGTERM", cleanup);
process.on("SIGINT", cleanup);
```

## 🚀 Usage

### Start Everything

```bash
npm run server:dev
```

### Test It Works

```bash
# Test API
curl http://localhost:3001/api/health

# Test Pinokio Daemon
curl http://localhost:42000/pinokio/version

# Test optimized pterm routes
curl http://localhost:3001/api/pterm/version
```

### Stop Everything

Just press `Ctrl+C` - both servers will shut down gracefully!

## 💡 Why This Matters

### 1. **Convenience**

- One command starts everything
- No manual daemon management
- Perfect for development

### 2. **Reliability**

- Daemon always available when API starts
- No "daemon not running" errors
- Graceful cleanup on exit

### 3. **Better DX**

- Simpler workflow
- Less mental overhead
- Faster iteration

## 🧪 Testing

All tests still work! The test suite starts its own test server:

```bash
npm run test:api
```

Tests use a separate test server on port 3002, so they don't conflict.

## 🔍 Error Handling

If the Pinokio daemon fails to start:

```bash
❌ Failed to start Pinokio Daemon: [error]
⚠️  API will work but some features may not be available
```

The API server will still start, but daemon-dependent features won't work.

## 📝 Configuration

### Change Daemon Port

The Pinokio daemon uses port 42000 by default. To change it, you'd need to modify `pinokiod/server/index.js`:

```javascript
const DEFAULT_PORT = 42000; // Change this
```

### Change API Port

Set the `PORT` environment variable:

```bash
PORT=3002 npm run server:dev
```

Or modify `.env`:

```env
PORT=3002
```

## 🎯 What's Available

With both servers running, you get access to:

### API Server (Port 3001)

- `/api/health` - Health check
- `/api/pterm/version` - Version info (optimized!)
- `/api/pterm/clipboard/*` - Clipboard ops (direct HTTP!)
- `/api/pterm/push` - Notifications (direct HTTP!)
- `/api/pterm/start` - Script management
- `/api/pterm/stop` - Script management
- `/api/pterm/run` - Launcher management

### Pinokio Daemon (Port 42000)

- `/pinokio/version` - Daemon version
- `/clipboard` - Clipboard endpoint (used by API)
- `/push` - Notification endpoint (used by API)
- WebSocket at `ws://localhost:42000` for scripts
- Full Pinokio UI and features

## 🚦 Startup Sequence

```
1. npm run server:dev
   ↓
2. Start Pinokio Daemon (42000)
   ↓
3. Wait for daemon ready
   ↓
4. Start API Server (3001)
   ↓
5. Both running! ✅
```

## 🛑 Shutdown Sequence

```
1. Ctrl+C (SIGINT)
   ↓
2. Cleanup function called
   ↓
3. Close API Server
   ↓
4. Close Pinokio Daemon
   ↓
5. Clean exit ✅
```

## 📚 Related Documentation

- `PTERM_API_SETUP.md` - API setup guide
- `WHY_NO_NPX.md` - Optimization details
- `OPTIMIZATION_SUMMARY.md` - Performance analysis
- `TEST_OPTIMIZATIONS.md` - Testing guide

## ✅ Summary

### What You Get

- ✅ **One command starts both servers**
- ✅ **Automatic daemon management**
- ✅ **Graceful shutdown**
- ✅ **Perfect for development**
- ✅ **All features work immediately**

### How to Use

```bash
# Start everything
npm run server:dev

# Test everything
curl http://localhost:3001/api/pterm/version

# Stop everything
Ctrl+C
```

### Benefits

- 🚀 **Faster workflow** - No manual daemon startup
- 🎯 **More reliable** - Daemon always available
- 💪 **Better DX** - One command does it all
- ✅ **Production ready** - Clean shutdown handling

---

**🎉 Everything is now integrated!** Just run `npm run server:dev` and you're ready to go!
