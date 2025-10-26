# @js-universal/shared-config

Shared configuration files for common development tools used across the JS Universal monorepo.

## Installation

```bash
npm install @js-universal/shared-config --save-dev
```

## Available Configurations

### ESLint

```javascript
// eslint.config.js
import { base, react, typescript } from "@js-universal/shared-config/eslint";

export default [
  { ignores: ["dist", "out", "build", "coverage"] },
  {
    ...base,
    files: ["**/*.{js,ts,tsx}"],
  },
  {
    ...typescript,
    files: ["**/*.{ts,tsx}"],
  },
  {
    ...react,
    files: ["**/*.{tsx,jsx}"],
  },
];
```

### Prettier

```javascript
// prettier.config.js
module.exports = require("@js-universal/shared-config/prettier");
```

### TypeScript

```json
// tsconfig.json
{
  "extends": "@js-universal/shared-config/typescript/base.json"
}

// For React projects
{
  "extends": "@js-universal/shared-config/typescript/react.json"
}

// For Node.js projects
{
  "extends": "@js-universal/shared-config/typescript/node.json"
}

// For Electron plugins
{
  "extends": "@js-universal/shared-config/typescript/plugin.json"
}
```

### Vite

```javascript
// vite.config.js
import { createReactApp } from '@js-universal/shared-config/vite/react';

export default createReactApp();

// For React libraries
import { createReactLibrary } from '@js-universal/shared-config/vite/react';

export default createReactLibrary({
  entry: 'src/index.ts',
  name: 'MyReactLibrary',
});

// For Electron plugins
import { createTrelloCloneViteConfig } from '@js-universal/shared-config/vite/plugin';

export default createTrelloCloneViteConfig({
  base: './',
});
```

### Vitest

```javascript
// vitest.config.ts
import { createReactVitestConfig } from "@js-universal/shared-config/vitest";

export default createReactVitestConfig({
  setupFiles: ["./tests/setup.ts"],
  include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
});
```

### Plugin Configuration

```javascript
// Generate plugin package.json
import { createTodoPluginConfig } from "@js-universal/shared-config/plugin";

const packageJson = createTodoPluginConfig({
  name: "my-todo-plugin",
  description: "My custom todo plugin",
});
```

### Workspace Configuration

```javascript
// Generate complete workspace setup
import { generateWorkspaceConfig } from "@js-universal/shared-config/workspace";

const workspaceConfig = generateWorkspaceConfig({
  packages: ["shared-utils", "shared-ui"],
  apps: ["todo-plugin", "trello-clone"],
  plugins: ["counter-plugin"],
});
```

## Configuration Presets

### ESLint Presets

- `base` - Basic JavaScript/TypeScript rules
- `react` - React-specific rules
- `typescript` - TypeScript-specific rules
- `node` - Node.js-specific rules

### TypeScript Presets

- `base.json` - Base TypeScript configuration
- `react.json` - React project configuration
- `node.json` - Node.js project configuration
- `plugin.json` - Electron plugin configuration

### Vite Presets

- `createReactApp()` - React application
- `createReactLibrary()` - React library
- `createTrelloCloneViteConfig()` - Trello clone plugin
- `createTodoPluginViteConfig()` - Todo plugin
- `createCounterPluginViteConfig()` - Counter plugin

### Vitest Presets

- `createReactVitestConfig()` - React testing setup
- `createNodeVitestConfig()` - Node.js testing setup
- `createLibraryVitestConfig()` - Library testing setup

## Plugin Types

### Todo Plugin

```javascript
import { createTodoPluginConfig } from "@js-universal/shared-config/plugin";

const config = createTodoPluginConfig({
  name: "my-todo",
  description: "My todo plugin",
});
```

### Counter Plugin

```javascript
import { createCounterPluginConfig } from "@js-universal/shared-config/plugin";

const config = createCounterPluginConfig({
  name: "my-counter",
  description: "My counter plugin",
});
```

### Trello Clone

```javascript
import { createTrelloCloneConfig } from "@js-universal/shared-config/plugin";

const config = createTrelloCloneConfig({
  name: "my-trello",
  description: "My Trello clone",
});
```

## Benefits

1. **Consistency** - All projects use the same configuration standards
2. **Maintainability** - Update configurations in one place
3. **DRY Principle** - No duplicate configuration code
4. **Type Safety** - TypeScript configurations with proper types
5. **Extensibility** - Easy to extend and customize configurations
6. **Documentation** - Well-documented configuration options

## Contributing

When adding new configurations:

1. Add the configuration to the appropriate directory
2. Update the `package.json` exports
3. Add documentation to this README
4. Test with existing projects
5. Update version and publish

## Version Compatibility

- ESLint: ^9.25.0
- TypeScript: ^5.8.3
- Vite: ^7.1.11
- Vitest: ^3.2.4
- React: ^18.2.0
