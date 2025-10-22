import { defineConfig } from 'vite'
import path from 'path'

const isDevelopment = process.env.NODE_ENV === 'development'

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/main/main.ts'),
      formats: ['es'],
      fileName: () => 'main.js',
    },
    outDir: 'dist-main',
    sourcemap: isDevelopment,
    minify: isDevelopment ? false : 'esbuild',
    watch: isDevelopment ? {
      include: ['src/main/**/*', 'shared/**/*'],
      exclude: ['node_modules/**', 'dist-*/**']
    } : null,
    rollupOptions: {
      external: [
        'electron', 
        'path', 
        'fs', 
        'fs/promises',
        'os', 
        '@prisma/client', 
        'electron-is-dev',
        'electron-reload',
        'crypto',
        'util',
        'events',
        'stream',
        'buffer',
        'url',
        'querystring',
        'dotenv'
      ],
      output: {
        format: 'es',
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
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