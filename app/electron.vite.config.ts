import type { ElectronViteConfig } from 'electron-vite';
import { bytecodePlugin } from 'electron-vite';
import { externalizeDepsPlugin } from 'electron-vite';
import { defineConfig, mergeConfig } from 'electron-vite';
import { resolve } from 'node:path';
import { getViteConfig } from './vite.config';

export default defineConfig((configEnv) => {
  const renderer: ElectronViteConfig['renderer'] = mergeConfig<
    Required<ElectronViteConfig>['renderer'],
    Required<ElectronViteConfig>['renderer']
  >(getViteConfig(configEnv), {
    root: '.',
    build: {
      target: undefined,
      outDir: 'dist-electron/renderer',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'index.html'),
        },
      },
    },
  });

  return {
    main: {
      plugins: [
        externalizeDepsPlugin(),
        bytecodePlugin({ transformArrowFunctions: false }),
      ],
      build: {
        outDir: 'dist-electron/main',
        rollupOptions: {
          input: {
            index: resolve(__dirname, 'electron/main/index.ts'),
          },
          output: {
            format: 'cjs',
          },
        },
      },
    },
    preload: {
      plugins: [externalizeDepsPlugin()],
      build: {
        outDir: 'dist-electron/preload',
        rollupOptions: {
          input: {
            index: resolve(__dirname, 'electron/preload/index.ts'),
          },
          output: {
            format: 'cjs',
          },
        },
      },
    },
    renderer: {
      root: '.',
      ...renderer,
    },
  };
});
