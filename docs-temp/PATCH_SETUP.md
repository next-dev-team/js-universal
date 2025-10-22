# Pinokio Patch Setup

## Quick Start

The project now uses `patch-package` to fix the Pinokio daemon crash without modifying submodule code.

### Installation

1. **Clean install (recommended after pulling this fix):**

   ```bash
   npm install
   ```

   The `postinstall` script will automatically:

   - Apply the pinokiod patch
   - Setup the local pinokiod directory

2. **Start the server:**

   ```bash
   npm run server:dev
   ```

   The server should now start without the `ERR_INVALID_ARG_TYPE` error! 🎉

### What Was Fixed

- **Error:** `TypeError [ERR_INVALID_ARG_TYPE]: The "paths[0]" argument must be of type string. Received undefined`
- **Fix:** Automatically sets a default home directory (`~/pinokio`) when none is configured
- **Method:** npm patch-package (no submodule modifications)

### Files Changed

```
✅ api/app.ts                       - Uses npm package instead of local directory
✅ package.json                     - Added patch-package to postinstall
✅ patches/pinokiod+3.170.0.patch  - The patch file
✅ patches/README.md                - Patch documentation
✅ docs/PINOKIO_PATCH_FIX.md       - Detailed explanation
```

### Verification

After running `npm install`, you should see:

```
✔ Created file patches/pinokiod+3.170.0.patch
```

Or if the patch was already applied:

```
patch-package: Applying patches...
pinokiod@3.170.0 ✔
```

### Troubleshooting

**Patch fails to apply:**

1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again

**Still getting the error:**

1. Verify the patch was applied: `cat patches/pinokiod+3.170.0.patch`
2. Check `node_modules/pinokiod/kernel/index.js` line ~808 for the default home check
3. Try setting the environment variable:
   ```bash
   export PINOKIO_HOME="$HOME/pinokio"
   npm run server:dev
   ```

### More Information

See [docs/PINOKIO_PATCH_FIX.md](docs/PINOKIO_PATCH_FIX.md) for complete details.
