import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default function createLibraryConfig(options = {}) {
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
    ...viteOptions
  } = options;

  return defineConfig({
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
          // Common peer dependencies
          'react',
          'react-dom',
          'react/jsx-runtime',
        ],
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            ...globals,
          },
        },
      },
      outDir,
      sourcemap,
      minify,
      emptyOutDir: true,
    },
    plugins: [
      ...(declaration ? [
        dts({
          insertTypesEntry: true,
          rollupTypes: true,
        }),
      ] : []),
    ],
    ...viteOptions,
  });
}

// Preset configurations
export const createTypeScriptLibrary = (options = {}) => createLibraryConfig({
  ...options,
  declaration: true,
});

export const createJavaScriptLibrary = (options = {}) => createLibraryConfig({
  ...options,
  entry: 'src/index.js',
  declaration: false,
});