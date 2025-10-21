import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/main/main.ts'),
      formats: ['es'],
      fileName: () => 'main.js',
    },
    outDir: 'dist-main',
    rollupOptions: {
      external: [
        'electron', 
        'path', 
        'fs', 
        'fs/promises',
        'os', 
        '@prisma/client', 
        'electron-is-dev',
        'crypto',
        'util',
        'events',
        'stream',
        'buffer',
        'url',
        'querystring'
      ],
    },
    minify: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
})