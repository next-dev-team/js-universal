export default function createJestConfig(options = {}) {
  const {
    testEnvironment = 'jsdom',
    setupFilesAfterEnv = [],
    moduleNameMapping = {},
    collectCoverageFrom = [],
    coverageThreshold = {},
    ...jestOptions
  } = options;

  return {
    // Test environment
    testEnvironment,

    // Setup files
    setupFilesAfterEnv: [
      ...setupFilesAfterEnv,
    ],

    // Module resolution
    moduleNameMapping: {
      '^@/(.*)$': '<rootDir>/src/$1',
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
      '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'jest-transform-stub',
      ...moduleNameMapping,
    },

    // Transform files
    transform: {
      '^.+\\.(ts|tsx)$': ['ts-jest', {
        useESM: true,
        tsconfig: {
          jsx: 'react-jsx',
        },
      }],
      '^.+\\.(js|jsx)$': ['babel-jest', {
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' } }],
          ['@babel/preset-react', { runtime: 'automatic' }],
        ],
      }],
    },

    // File extensions
    moduleFileExtensions: [
      'ts',
      'tsx',
      'js',
      'jsx',
      'json',
      'node',
    ],

    // Test patterns
    testMatch: [
      '<rootDir>/src/**/__tests__/**/*.(ts|tsx|js|jsx)',
      '<rootDir>/src/**/*.(test|spec).(ts|tsx|js|jsx)',
    ],

    // Ignore patterns
    testPathIgnorePatterns: [
      '<rootDir>/node_modules/',
      '<rootDir>/dist/',
      '<rootDir>/build/',
    ],

    // Coverage
    collectCoverageFrom: [
      'src/**/*.(ts|tsx|js|jsx)',
      '!src/**/*.d.ts',
      '!src/**/*.stories.(ts|tsx|js|jsx)',
      '!src/**/__tests__/**',
      '!src/**/index.(ts|tsx|js|jsx)',
      ...collectCoverageFrom,
    ],

    coverageDirectory: 'coverage',

    coverageReporters: [
      'text',
      'lcov',
      'html',
      'json-summary',
    ],

    coverageThreshold: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
        ...coverageThreshold.global,
      },
      ...coverageThreshold,
    },

    // Other options
    clearMocks: true,
    restoreMocks: true,
    verbose: true,

    ...jestOptions,
  };
}

// Preset configurations
export const createReactJestConfig = (options = {}) => createJestConfig({
  ...options,
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [
    '@testing-library/jest-dom',
    ...options.setupFilesAfterEnv || [],
  ],
});

export const createNodeJestConfig = (options = {}) => createJestConfig({
  ...options,
  testEnvironment: 'node',
});

export const createLibraryJestConfig = (options = {}) => createJestConfig({
  ...options,
  testEnvironment: 'jsdom',
  collectCoverageFrom: [
    'src/**/*.(ts|tsx|js|jsx)',
    '!src/**/*.d.ts',
    '!src/**/*.stories.(ts|tsx|js|jsx)',
    '!src/**/__tests__/**',
    '!src/**/index.(ts|tsx|js|jsx)',
    '!src/**/*.example.(ts|tsx|js|jsx)',
    ...options.collectCoverageFrom || [],
  ],
});