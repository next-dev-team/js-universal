import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 3001,
    host: true,
    cors: true,
    hmr: {
      port: 3001,
    },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: "index.html",
    },
  },
  define: {
    __DEV__: true,
  },
});
