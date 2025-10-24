#!/usr/bin/env node

/**
 * Custom package manager checker
 * Ensures only pnpm is used in this monorepo
 */

const { execSync } = require("child_process");
const path = require("path");

// Get the package manager being used
const userAgent = process.env.npm_config_user_agent;

if (!userAgent) {
  console.log("✅ Package manager check passed");
  process.exit(0);
}

const packageManager = userAgent.split("/")[0];

// Check if pnpm is being used
if (packageManager !== "pnpm") {
  console.error(`
❌ ERROR: This project requires pnpm as the package manager.

You are using: ${packageManager}
Required: pnpm

To fix this:
1. Install pnpm: npm install -g pnpm
2. Use pnpm instead: pnpm install

For more information, visit: https://pnpm.io/installation
  `);
  process.exit(1);
}

// Additional check: ensure pnpm version is compatible
try {
  const pnpmVersion = execSync("pnpm --version", { encoding: "utf8" }).trim();
  const majorVersion = parseInt(pnpmVersion.split(".")[0]);

  if (majorVersion < 8) {
    console.error(`
❌ ERROR: pnpm version ${pnpmVersion} is not supported.

Required: pnpm >= 8.0.0
Current: pnpm ${pnpmVersion}

To update pnpm:
npm install -g pnpm@latest
    `);
    process.exit(1);
  }

  console.log(`✅ pnpm ${pnpmVersion} is compatible`);
} catch (error) {
  console.error(`
❌ ERROR: Could not verify pnpm version.

Please ensure pnpm is installed and available in your PATH.
  `);
  process.exit(1);
}

console.log("✅ Package manager check passed");
