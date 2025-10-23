# @js-universal/shared-config

Shared configuration files for common development tools used across the JS Universal monorepo.

## Installation

```bash
npm install @js-universal/shared-config --save-dev
```

## Available Configurations

### ESLint

```javascript
// .eslintrc.js
const { base, react, typescript, node } = require('@js-universal/shared-config/eslint');

module.exports = {
  ...base,
  // or extend specific configurations
  extends: [
    ...base.extends,
    ...react.extends,
    ...typescript.extends,
  ],
};
```

### Prettier

```javascript
// prettier.config.js
module.exports = require('@js-universal/shared-config/prettier');
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
```

### Rollup

```javascript
// rollup.config.js
import { createLibraryConfig } from '@js-universal/shared-config/rollup/library';

export default createLibraryConfig({
  input: 'src/index.ts',
  packageName: 'MyLibrary',
});

// For React libraries
import { createReactLibraryConfig } from '@js-universal/shared-config/rollup/react';

export default createReactLibraryConfig({
  input: 'src/index.ts',
  packageName: 'MyReactLibrary',
});
```

### Vite

```javascript
// vite.config.js
import { createLibraryConfig } from '@js-universal/shared-config/vite/library';

export default createLibraryConfig({
  entry: 'src/index.ts',
  name: 'MyLibrary',
});

// For React applications
import { createReactApp } from '@js-universal/shared-config/vite/react';

export default createReactApp();

// For React libraries
import { createReactLibrary } from '@js-universal/shared-config/vite/react';

export default createReactLibrary({
  entry: 'src/index.ts',
  name: 'MyReactLibrary',
});
```

### Jest

```javascript
// jest.config.js
import { createJestConfig, createReactJestConfig } from '@js-universal/shared-config/jest';

export default createJestConfig();

// For React projects
export default createReactJestConfig();
```

### Vitest

```javascript
// vitest.config.js
import { createVitestConfig, createReactVitestConfig } from '@js-universal/shared-config/vitest';

export default createVitestConfig();

// For React projects
export default createReactVitestConfig();
```

## Configuration Options

Each configuration function accepts an options object to customize the behavior:

### ESLint Options

- `extends`: Additional ESLint configurations to extend
- `rules`: Custom rules to override
- `env`: Environment settings
- `parserOptions`: Parser configuration

### Rollup/Vite Options

- `input`/`entry`: Entry point file
- `outputDir`/`outDir`: Output directory
- `packageName`/`name`: Package name for UMD builds
- `external`: External dependencies
- `globals`: Global variable mappings
- `minify`: Enable minification
- `sourcemap`: Generate source maps
- `declaration`: Generate TypeScript declarations

### Jest/Vitest Options

- `testEnvironment`/`environment`: Test environment (jsdom, node)
- `setupFilesAfterEnv`/`setupFiles`: Setup files
- `collectCoverageFrom`: Coverage collection patterns
- `coverageThreshold`: Coverage thresholds

## License

MIT