import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// Shared Vite configuration for Electron plugins
export default function createPluginViteConfig(options = {}) {
  const {
    entry = "src/main.tsx",
    outDir = "dist",
    base = "./",
    sourcemap = true,
    minify = true,
    ...viteOptions
  } = options;

  return defineConfig({
    plugins: [
      react({
        jsxRuntime: "automatic",
      }),
    ],
    base,
    build: {
      outDir,
      sourcemap,
      minify,
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: resolve(process.cwd(), entry),
        },
        output: {
          manualChunks: {
            vendor: ["react", "react-dom"],
          },
        },
      },
    },
    server: {
      port: 3000,
      open: false,
      host: true,
    },
    preview: {
      port: 3000,
      open: false,
      host: true,
    },
    resolve: {
      alias: {
        "@": resolve(process.cwd(), "src"),
      },
    },
    ...viteOptions,
  });
}

// Preset configurations for different plugin types
export const createTodoPluginViteConfig = (options = {}) =>
  createPluginViteConfig({
    entry: "src/main.tsx",
    ...options,
  });

export const createTrelloCloneViteConfig = (options = {}) =>
  createPluginViteConfig({
    entry: "src/main.tsx",
    ...options,
  });

export const createCounterPluginViteConfig = (options = {}) =>
  createPluginViteConfig({
    entry: "index.html",
    ...options,
  });
