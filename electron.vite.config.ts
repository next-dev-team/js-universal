import { defineConfig } from "electron-vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

const isDevelopment = process.env.NODE_ENV === "development";

export default defineConfig({
  main: {
    build: {
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
        ],
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@shared": path.resolve(__dirname, "./shared"),
      },
    },
  },
  preload: {
    build: {
      rollupOptions: {
        input: {
          index: path.resolve(__dirname, "src/preload/index.ts"),
          "plugin-preload": path.resolve(
            __dirname,
            "src/preload/plugin-preload.ts"
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
      },
    },
  },
  renderer: {
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
        "@": path.resolve(__dirname, "./src/renderer"),
        "@shared": path.resolve(__dirname, "./shared"),
      },
    },
    build: {
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
