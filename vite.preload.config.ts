import { defineConfig } from 'vite'
import path from 'path'

const isDevelopment = process.env.NODE_ENV === 'development'

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/preload/preload.ts'),
      formats: ['cjs'],
      fileName: () => 'preload.js',
    },
    outDir: 'dist-preload',
    sourcemap: isDevelopment,
    minify: isDevelopment ? false : 'esbuild',
    watch: isDevelopment ? {
      include: ['src/preload/**/*', 'shared/**/*'],
      exclude: ['node_modules/**', 'dist-*/**']
    } : null,
    rollupOptions: {
      external: ['electron'],
      output: {
        format: 'cjs',
        entryFileNames: '[name].js',
      },
    },
    target: 'node18',
    reportCompressedSize: !isDevelopment,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
  define: {
    __DEV__: isDevelopment,
  },
})