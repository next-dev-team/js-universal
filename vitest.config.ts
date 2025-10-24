import { createReactVitestConfig } from "@js-universal/shared-config/vitest";
import path from "path";

export default createReactVitestConfig({
  setupFiles: ["./tests/setup.ts"],
  include: [
    "tests/**/*.test.ts",
    "tests/**/*.spec.ts",
    "tests/**/*.test.tsx",
    "tests/**/*.spec.tsx",
  ],
  exclude: ["node_modules", "dist*", "build", "coverage"],
  testTimeout: 10000,
  hookTimeout: 10000,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  define: {
    "process.env.NODE_ENV": '"test"',
  },
  esbuild: {
    jsx: "automatic",
  },
});
