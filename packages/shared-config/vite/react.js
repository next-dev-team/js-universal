import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default function createReactConfig(options = {}) {
  const {
    entry = 'src/index.ts',
    name,
    fileName = 'index',
    external = [],
    globals = {},
    outDir = 'dist',
    sourcemap = true,
    minify = true,
    declaration = true,
    isLibrary = false,
    ...viteOptions
  } = options;

  const baseConfig = {
    plugins: [
      react({
        jsxRuntime: 'automatic',
      }),
      ...(declaration && isLibrary ? [
        dts({
          insertTypesEntry: true,
          rollupTypes: true,
        }),
      ] : []),
    ],
    resolve: {
      alias: {
        '@': resolve(process.cwd(), 'src'),
      },
    },
    ...viteOptions,
  };

  // Library-specific configuration
  if (isLibrary) {
    return defineConfig({
      ...baseConfig,
      build: {
        lib: {
          entry: resolve(process.cwd(), entry),
          name,
          fileName: (format) => {
            const extension = format === 'es' ? 'mjs' : 'js';
            return `${fileName}.${format}.${extension}`;
          },
          formats: ['es', 'cjs', 'umd'],
        },
        rollupOptions: {
          external: [
            ...external,
            // React peer dependencies
            'react',
            'react-dom',
            'react/jsx-runtime',
            'react/jsx-dev-runtime',
            // Common React ecosystem packages
            'prop-types',
            'classnames',
            'clsx',
          ],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
              'prop-types': 'PropTypes',
              classnames: 'classNames',
              clsx: 'clsx',
              ...globals,
            },
          },
        },
        outDir,
        sourcemap,
        minify,
        emptyOutDir: true,
      },
    });
  }

  // Application-specific configuration
  return defineConfig({
    ...baseConfig,
    build: {
      outDir,
      sourcemap,
      minify,
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
          },
        },
      },
    },
    server: {
      port: 3000,
      open: true,
      host: true,
    },
    preview: {
      port: 3000,
      open: true,
      host: true,
    },
  });
}

// Preset configurations
export const createReactApp = (options = {}) => createReactConfig({
  ...options,
  isLibrary: false,
});

export const createReactLibrary = (options = {}) => createReactConfig({
  ...options,
  isLibrary: true,
  declaration: true,
});

export const createReactComponent = (options = {}) => createReactLibrary({
  ...options,
  external: ['react', 'react-dom'],
});