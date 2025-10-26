import { defineConfig } from "electron-vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

const isDevelopment = process.env.NODE_ENV === "development";

export default defineConfig({
  main: {
    build: {
      lib: {
        entry: path.resolve(__dirname, "packages/electron/src/main/index.ts"),
      },
      rollupOptions: {
        external: [
          "electron",
          "path",
          "fs",
          "fs/promises",
          "os",
          "@prisma/client",
          "electron-is-dev",
          "crypto",
          "util",
          "events",
          "stream",
          "buffer",
          "url",
          "querystring",
          "dotenv",
          "net",
        ],
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@shared": path.resolve(__dirname, "./shared"),
        "@js-universal/shared-types": path.resolve(
          __dirname,
          "./packages/shared-types/dist/esm/index.js"
        ),
      },
    },
  },
  preload: {
    build: {
      rollupOptions: {
        input: {
          index: path.resolve(
            __dirname,
            "packages/electron/src/preload/index.ts"
          ),
          "plugin-preload": path.resolve(
            __dirname,
            "packages/electron/src/preload/plugin-preload.ts"
          ),
          "dev-plugin-preload": path.resolve(
            __dirname,
            "packages/electron/src/preload/dev-plugin-preload.ts"
          ),
        },
        external: ["electron"],
        output: {
          format: "cjs",
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@shared": path.resolve(__dirname, "./shared"),
        "@js-universal/shared-types": path.resolve(
          __dirname,
          "./packages/shared-types/dist/esm/index.js"
        ),
      },
    },
  },
  renderer: {
    root: path.resolve(__dirname, "packages/electron/src/renderer"),
    plugins: [
      react({
        babel: {
          plugins: isDevelopment ? ["react-dev-locator"] : [],
        },
      }),
      tsconfigPaths(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./packages/electron/src/renderer"),
        "@shared": path.resolve(__dirname, "./shared"),
      },
    },
    build: {
      rollupOptions: {
        input: path.resolve(
          __dirname,
          "packages/electron/src/renderer/index.html"
        ),
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
      port: 5175,
      strictPort: false,
      hmr: {
        port: 5175,
      },
      proxy: {
        "/api": {
          target: "http://localhost:3001",
          changeOrigin: true,
          secure: false,
          configure: isDevelopment
            ? (proxy) => {
                proxy.on("error", (err) => {
                  console.log("proxy error", err);
                });
                proxy.on("proxyReq", (_, req) => {
                  console.log(
                    "Sending Request to the Target:",
                    req.method,
                    req.url
                  );
                });
                proxy.on("proxyRes", (proxyRes, req) => {
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
  },
});
