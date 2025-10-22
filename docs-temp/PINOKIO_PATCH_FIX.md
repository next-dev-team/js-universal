# Pinokio Daemon Patch Fix

## Problem

The Pinokio daemon was crashing with the following error:

```
TypeError [ERR_INVALID_ARG_TYPE]: The "paths[0]" argument must be of type string. Received undefined
    at Object.resolve (node:path:211:9)
    at Object.get (C:\Users\MT-Staff\Documents\GitHub\electron-conda\pinokiod\kernel\environment.js:407:25)
    at async PeerDiscovery.start (C:\Users\MT-Staff\Documents\GitHub\electron-conda\pinokiod\kernel\peer.js:76:15)
```

**Root Cause:** The pinokiod kernel expects a `home` directory to be configured in its store, but when initialized without one, it would crash when trying to resolve paths.

## Solution

We used `patch-package` to patch the `pinokiod@3.170.0` npm package without modifying the submodule code.

### What We Did

1. **Installed patch-package:**

   ```bash
   npm install --save-dev patch-package
   ```

2. **Modified the pinokiod package in node_modules:**

   - File: `node_modules/pinokiod/kernel/index.js`
   - Added a check in the `init()` method to set a default home directory if none is configured
   - Default location: `~/pinokio`

3. **Created the patch:**

   ```bash
   npx patch-package pinokiod
   ```

   This created: `patches/pinokiod+3.170.0.patch`

4. **Updated package.json:**
   - Modified the `postinstall` script to apply patches automatically:
   ```json
   "postinstall": "patch-package && npm run pinokiod:setup"
   ```

### The Patch

The patch adds the following code to `node_modules/pinokiod/kernel/index.js`:

```javascript
async init(options) {
  let home = this.store.get("home") || process.env.PINOKIO_HOME

  // Set default home directory if not configured
  if (!home) {
    home = path.resolve(os.homedir(), "pinokio")
    this.store.set("home", home)
  }

  // ... rest of init code
}
```

### How It Works

1. When you run `npm install`, the `postinstall` script runs automatically
2. `patch-package` applies all patches from the `patches/` directory
3. The patched code ensures a default home directory is always set
4. The daemon no longer crashes due to undefined paths

### Benefits

✅ **No submodule modification** - The local `pinokiod/` directory remains unchanged  
✅ **Automatic application** - Patches are applied automatically on `npm install`  
✅ **Version controlled** - The patch file is committed to the repo  
✅ **Team friendly** - Everyone gets the fix automatically  
✅ **Upgrade safe** - When upgrading pinokiod, you'll be notified if the patch fails

### Files Modified

- `api/app.ts` - Now uses the npm package `pinokiod/server` instead of local directory
- `package.json` - Updated postinstall script to apply patches
- `patches/pinokiod+3.170.0.patch` - The patch file (auto-generated)
- `patches/README.md` - Documentation for the patches

### Testing

To verify the fix works:

```bash
# Clean install to test the patch
rm -rf node_modules
npm install

# Start the server
npm run server:dev
```

The server should start without the `ERR_INVALID_ARG_TYPE` error.

### Updating the Patch

If you need to modify the patch in the future:

1. Make changes to the file in `node_modules/pinokiod/`
2. Run `npx patch-package pinokiod`
3. Commit the updated patch file

### Alternative: Environment Variable

You can also set the home directory using an environment variable instead of relying on the patch default:

```bash
export PINOKIO_HOME="/path/to/custom/directory"
npm run server:dev
```

The patch ensures there's always a fallback even if neither the store nor environment variable is set.
