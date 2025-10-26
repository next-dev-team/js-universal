// Node.js ESLint configuration
import baseConfig from './base.js';

export default {
  ...baseConfig,
  env: {
    ...baseConfig.env,
    node: true,
    browser: false,
  },
  extends: [
    ...baseConfig.extends,
    'plugin:node/recommended',
  ],
  plugins: ['node'],
  rules: {
    ...baseConfig.rules,
    
    // Node.js specific rules
    'node/callback-return': ['error', ['callback', 'cb', 'next']],
    'node/exports-style': ['error', 'module.exports'],
    'node/file-extension-in-import': ['error', 'always', {
      '.js': 'never',
      '.json': 'never',
      '.node': 'never',
    }],
    'node/global-require': 'error',
    'node/handle-callback-err': ['error', '^(err|error)$'],
    'node/no-callback-literal': 'error',
    'node/no-deprecated-api': 'error',
    'node/no-exports-assign': 'error',
    'node/no-extraneous-import': 'error',
    'node/no-extraneous-require': 'error',
    'node/no-missing-import': 'off', // Handled by TypeScript
    'node/no-missing-require': 'off', // Handled by TypeScript
    'node/no-mixed-requires': ['error', {
      grouping: true,
      allowCall: false,
    }],
    'node/no-new-require': 'error',
    'node/no-path-concat': 'error',
    'node/no-process-env': 'off',
    'node/no-process-exit': 'error',
    'node/no-restricted-import': 'off',
    'node/no-restricted-require': 'off',
    'node/no-sync': 'warn',
    'node/no-unpublished-bin': 'error',
    'node/no-unpublished-import': 'off',
    'node/no-unpublished-require': 'off',
    'node/no-unsupported-features/es-builtins': 'error',
    'node/no-unsupported-features/es-syntax': 'off', // Handled by TypeScript
    'node/no-unsupported-features/node-builtins': 'error',
    'node/prefer-global/buffer': ['error', 'always'],
    'node/prefer-global/console': ['error', 'always'],
    'node/prefer-global/process': ['error', 'always'],
    'node/prefer-global/text-decoder': ['error', 'always'],
    'node/prefer-global/text-encoder': ['error', 'always'],
    'node/prefer-global/url-search-params': ['error', 'always'],
    'node/prefer-global/url': ['error', 'always'],
    'node/prefer-promises/dns': 'error',
    'node/prefer-promises/fs': 'error',
    'node/process-exit-as-throw': 'error',
    'node/shebang': 'error',
    
    // Additional Node.js best practices
    'no-console': 'off', // Console is acceptable in Node.js
    'no-process-env': 'off',
    'no-process-exit': 'off',
    'no-sync': 'warn',
    
    // Buffer and crypto
    'no-buffer-constructor': 'error',
    
    // Async/await patterns
    'prefer-promise-reject-errors': 'error',
    'no-return-await': 'error',
    
    // Error handling
    'handle-callback-err': ['error', '^(err|error)$'],
    
    // Security
    'security/detect-buffer-noassert': 'off',
    'security/detect-child-process': 'warn',
    'security/detect-disable-mustache-escape': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-new-buffer': 'error',
    'security/detect-no-csrf-before-method-override': 'error',
    'security/detect-non-literal-fs-filename': 'warn',
    'security/detect-non-literal-regexp': 'error',
    'security/detect-non-literal-require': 'warn',
    'security/detect-object-injection': 'warn',
    'security/detect-possible-timing-attacks': 'warn',
    'security/detect-pseudoRandomBytes': 'error',
    'security/detect-unsafe-regex': 'error',
  },
};