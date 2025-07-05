import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'node:path';
import process from 'node:process';
import type { UserConfig, UserConfigFnObject } from 'vite';
import { defineConfig, loadEnv } from 'vite';
import checker from 'vite-plugin-checker';
import svgr from 'vite-plugin-svgr';

export const getViteConfig: UserConfigFnObject = ({ mode }) => {
  // 获取`.env`环境配置文件
  const env = loadEnv(mode, process.cwd());
  const routerBase = env.VITE_BASE_ROUTER_PREFIX;
  const mockProxy: Required<UserConfig>['server']['proxy'] = {
    '/api/': {
      target: `http://0.0.0.0:${env.VITE_MOCK_APP_PORT}`,
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
  };
  const noMockProxy: Required<UserConfig>['server']['proxy'] = {
    '/api/': {
      // 后端服务地址
      target: env.VITE_PROXY_SERVER_URL,
      changeOrigin: true,
    },
  };
  const proxy: Required<UserConfig>['server']['proxy'] =
    env.VITE_HTTP_MOCK_ENV === 'true' ? mockProxy : noMockProxy;

  return {
    base: routerBase,
    plugins: [
      react(),
      svgr(),
      tailwindcss(),
      // 在浏览器中直接看到上报的类型错误（更严格的类型校验）
      checker({
        typescript: true,
        eslint: {
          useFlatConfig: true,
          lintCommand: 'eslint "./src/**/*.{ts,tsx,js,jsx,cjs,mjs}"',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    css: {
      modules: {
        localsConvention: 'camelCase',
      },
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
        },
        scss: {},
      },
    },
    build: {
      target: 'esnext', // 最低 es2015/es6
      outDir: env.VITE_OUT_DIR || 'dist',
      // 单个 chunk 文件的大小超过 2000kB 时发出警告（默认：超过500kb警告）
      chunkSizeWarningLimit: 2000,
      manifest: true,
      rollupOptions: {
        // 分包
        output: {
          chunkFileNames: 'assets/js/[name]-[hash].js', // chunk包输出的文件夹名称
          entryFileNames: 'assets/js/entry-[name]-[hash].js', // 入口文件输出的文件夹名称
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]', // 静态文件输出的文件夹名称
        },
      },
    },
    // 预构建的依赖项，优化开发（该优化器仅在开发环境中使用）
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router',
        'zustand',
        'classnames',
        'immer',
        'axios',
        'optics-ts',
      ],
    },
    server: {
      host: '0.0.0.0',
      port: Number(env.VITE_APP_PORT),
      strictPort: true,
      proxy: proxy,
    },
  };
};

export default defineConfig(getViteConfig);
