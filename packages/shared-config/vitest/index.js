import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default function createVitestConfig(options = {}) {
  const {
    environment = 'jsdom',
    setupFiles = [],
    coverage = {},
    globals = true,
    ...vitestOptions
  } = options;

  return defineConfig({
    test: {
      // Test environment
      environment,

      // Global test APIs
      globals,

      // Setup files
      setupFiles: [
        ...setupFiles,
      ],

      // Coverage configuration
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
        reportsDirectory: 'coverage',
        exclude: [
          'node_modules/',
          'dist/',
          'build/',
          '**/*.d.ts',
          '**/*.stories.{ts,tsx,js,jsx}',
          '**/__tests__/**',
          '**/index.{ts,tsx,js,jsx}',
          '**/*.config.{ts,js}',
          '**/*.example.{ts,tsx,js,jsx}',
        ],
        thresholds: {
          global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
          },
        },
        ...coverage,
      },

      // Include/exclude patterns
      include: [
        'src/**/*.{test,spec}.{ts,tsx,js,jsx}',
        'src/**/__tests__/**/*.{ts,tsx,js,jsx}',
      ],

      exclude: [
        'node_modules/',
        'dist/',
        'build/',
        '**/*.stories.{ts,tsx,js,jsx}',
        '**/*.config.{ts,js}',
      ],

      ...vitestOptions,
    },

    resolve: {
      alias: {
        '@': resolve(process.cwd(), 'src'),
      },
    },
  });
}

// Preset configurations
export const createReactVitestConfig = (options = {}) => createVitestConfig({
  ...options,
  environment: 'jsdom',
  setupFiles: [
    '@testing-library/jest-dom',
    ...options.setupFiles || [],
  ],
});

export const createNodeVitestConfig = (options = {}) => createVitestConfig({
  ...options,
  environment: 'node',
});

export const createLibraryVitestConfig = (options = {}) => createVitestConfig({
  ...options,
  environment: 'jsdom',
  coverage: {
    ...options.coverage,
    exclude: [
      'node_modules/',
      'dist/',
      'build/',
      '**/*.d.ts',
      '**/*.stories.{ts,tsx,js,jsx}',
      '**/__tests__/**',
      '**/index.{ts,tsx,js,jsx}',
      '**/*.config.{ts,js}',
      '**/*.example.{ts,tsx,js,jsx}',
      ...options.coverage?.exclude || [],
    ],
  },
});

// Workspace configuration for monorepos
export const createWorkspaceConfig = (packages = []) => defineConfig({
  test: {
    workspace: packages.map(pkg => ({
      test: {
        name: pkg,
        root: `./packages/${pkg}`,
      },
    })),
  },
});