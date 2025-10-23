import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { traeBadgePlugin } from "vite-plugin-trae-solo-badge";
import path from "path";

const isDevelopment = process.env.NODE_ENV === "development";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: isDevelopment ? ["react-dev-locator"] : [],
      },
    }),
    traeBadgePlugin({
      variant: "dark",
      position: "bottom-right",
      prodOnly: true,
      clickable: true,
      clickUrl: "https://www.trae.ai/solo?showJoin=1",
      autoTheme: true,
      autoThemeTarget: "#root",
    }),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  build: {
    outDir: "dist-renderer",
    sourcemap: isDevelopment,
    minify: isDevelopment ? false : "esbuild",
    rollupOptions: {
      external: ["electron"],
      output: {
        manualChunks: isDevelopment
          ? undefined
          : {
              vendor: ["react", "react-dom"],
              antd: ["antd", "@ant-design/icons"],
              router: ["react-router-dom"],
            },
      },
    },
    target: "esnext",
    reportCompressedSize: !isDevelopment,
  },
  server: {
    port: 5174,
    strictPort: true,
    hmr: {
      port: 5174,
    },
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
        configure: isDevelopment
          ? (proxy, _options) => {
              proxy.on("error", (err, _req, _res) => {
                console.log("proxy error", err);
              });
              proxy.on("proxyReq", (proxyReq, req, _res) => {
                console.log(
                  "Sending Request to the Target:",
                  req.method,
                  req.url
                );
              });
              proxy.on("proxyRes", (proxyRes, req, _res) => {
                console.log(
                  "Received Response from the Target:",
                  proxyRes.statusCode,
                  req.url
                );
              });
            }
          : undefined,
      },
    },
  },
  base: "./",
  define: {
    __DEV__: isDevelopment,
  },
});
