import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      'src/**/*.test.{ts,tsx,js}',
      './__test__/**/*.test.{ts,tsx,js}',
      'electron/preload/ipc/**/*.test.{ts,tsx,js}',
    ],
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    css: true,
    alias: {
      '@': path.join(__dirname, './src'),
    },
    globals: true,
    testTimeout: 1000 * 60,
    coverage: {
      provider: 'v8',
      enabled: true,
      include: ['src/**/*.{js,jsx,ts,tsx}'],
      exclude: [
        'src/components/icon/icons-loader.ts', // 排除这个文件
        'src/components/version-update/index.tsx',
      ],
      // thresholds: {
      //   branches: 90,
      //   functions: 90,
      //   lines: 90,
      //   statements: 90,
      // },
    },
  },
});
