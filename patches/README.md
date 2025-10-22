# Patches

This directory contains patches for npm packages using [patch-package](https://github.com/ds300/patch-package).

## pinokiod+3.170.0.patch

**Issue:** The pinokiod daemon crashes with `ERR_INVALID_ARG_TYPE` when the home directory is not configured in the store.

**Fix:** Automatically sets a default home directory (`~/pinokio`) if none is configured in the store or environment variables.

**Changes:**

- Modified `node_modules/pinokiod/kernel/index.js` to check if `home` is undefined
- If undefined, sets `home` to `path.resolve(os.homedir(), "pinokio")` and saves it to the store
- This ensures the daemon always has a valid home directory to work with

**How it works:**

1. When you run `npm install`, the `postinstall` script automatically applies all patches in this directory
2. The patch modifies the installed `pinokiod` package in `node_modules`
3. No changes to the submodule code are needed

**Updating the patch:**
If you need to update the patch:

1. Make changes to the file in `node_modules/pinokiod/`
2. Run `npx patch-package pinokiod`
3. The patch file will be updated automatically
