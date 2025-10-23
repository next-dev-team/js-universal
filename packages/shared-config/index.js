// Main entry point for @js-universal/shared-config
export { default as eslintBase } from './eslint/base.js';
export { default as eslintReact } from './eslint/react.js';
export { default as eslintTypeScript } from './eslint/typescript.js';
export { default as eslintNode } from './eslint/node.js';

export { default as prettierConfig } from './prettier/index.js';

export { default as typescriptBase } from './typescript/base.json' assert { type: 'json' };
export { default as typescriptReact } from './typescript/react.json' assert { type: 'json' };
export { default as typescriptNode } from './typescript/node.json' assert { type: 'json' };

export { default as rollupLibrary } from './rollup/library.js';
export { default as rollupReact } from './rollup/react.js';

export { default as viteLibrary } from './vite/library.js';
export { default as viteReact } from './vite/react.js';

export { default as jestConfig } from './jest/index.js';
export { default as vitestConfig } from './vitest/index.js';