// Workspace configuration generator for monorepo setup
import {
  createPluginConfig,
  createTodoPluginConfig,
  createCounterPluginConfig,
  createTrelloCloneConfig,
} from "../plugin/index.js";
import { pluginDeps, pluginDevDeps } from "@js-universal/shared-deps";

// Generate package.json for plugins
export const generatePluginPackageJson = (type, options = {}) => {
  const configs = {
    todo: createTodoPluginConfig,
    counter: createCounterPluginConfig,
    trello: createTrelloCloneConfig,
    default: createPluginConfig,
  };

  const configGenerator = configs[type] || configs.default;
  return configGenerator(options);
};

// Generate tsconfig.json for plugins
export const generatePluginTsConfig = (options = {}) => ({
  extends: "@js-universal/shared-config/typescript/plugin.json",
  compilerOptions: {
    ...options.compilerOptions,
  },
  include: [
    "src/**/*",
    "src/**/*.tsx",
    "src/**/*.ts",
    "**/*.d.ts",
    "index.html",
    ...(options.include || []),
  ],
  exclude: [
    "node_modules",
    "dist",
    "build",
    "coverage",
    "public",
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.spec.tsx",
    "**/*.stories.ts",
    "**/*.stories.tsx",
    ...(options.exclude || []),
  ],
});

// Generate vite.config.js for plugins
export const generatePluginViteConfig = (options = {}) => {
  const {
    createTrelloCloneViteConfig,
    createTodoPluginViteConfig,
    createCounterPluginViteConfig,
  } = require("../vite/plugin.js");

  const configs = {
    trello: createTrelloCloneViteConfig,
    todo: createTodoPluginViteConfig,
    counter: createCounterPluginViteConfig,
  };

  const configGenerator = configs[options.type] || createTrelloCloneViteConfig;
  return configGenerator(options);
};

// Generate eslint.config.js for plugins
export const generatePluginEslintConfig = (options = {}) => {
  const { base, react, typescript } = require("../eslint/index.js");

  return [
    { ignores: ["dist", "out", "build", "coverage"] },
    {
      ...base,
      files: ["**/*.{js,ts,tsx}"],
    },
    {
      ...typescript,
      files: ["**/*.{ts,tsx}"],
    },
    {
      ...react,
      files: ["**/*.{tsx,jsx}"],
    },
  ];
};

// Generate complete plugin setup
export const generatePluginSetup = (type, name, options = {}) => {
  return {
    "package.json": generatePluginPackageJson(type, { name, ...options }),
    "tsconfig.json": generatePluginTsConfig(options.tsconfig),
    "vite.config.ts": generatePluginViteConfig({ type, ...options.vite }),
    "eslint.config.js": generatePluginEslintConfig(options.eslint),
  };
};

// Workspace-level configuration
export const generateWorkspaceConfig = (options = {}) => {
  const {
    packages = [],
    apps = [],
    plugins = [],
    ...workspaceOptions
  } = options;

  return {
    "package.json": {
      name: "js-universal",
      private: true,
      packageManager: "pnpm@10.19.0",
      version: "1.0.0",
      description:
        "A modern Electron app with plugin system built with React and TypeScript",
      author: "JS Universal Team",
      type: "module",
      scripts: {
        "build:workspace": "turbo run build",
        "lint:workspace": "turbo run lint",
        "test:workspace": "turbo run test",
        "dev:workspace": "turbo run dev",
        "clean:workspace": "turbo run clean",
        ...workspaceOptions.scripts,
      },
      devDependencies: {
        turbo: "^2.0.0",
        concurrently: "^9.2.0",
        "patch-package": "^8.0.1",
        ...workspaceOptions.devDependencies,
      },
    },
    "turbo.jsonc": {
      $schema: "https://turborepo.com/schema/2.5.json",
      tasks: {
        build: {
          dependsOn: ["^build"],
          outputs: ["dist/**", "out/**", "build/**"],
          inputs: ["src/**", "tsconfig.json", "package.json"],
        },
        lint: {
          dependsOn: ["^lint"],
          inputs: [
            "src/**",
            "*.js",
            "*.ts",
            "*.tsx",
            ".eslintrc*",
            "eslint.config.*",
          ],
        },
        test: {
          dependsOn: ["^test"],
          outputs: ["coverage/**"],
          inputs: [
            "src/**",
            "test/**",
            "*.test.*",
            "*.spec.*",
            "vitest.config.*",
            "jest.config.*",
          ],
        },
        dev: {
          cache: false,
          persistent: true,
        },
        clean: {
          cache: false,
          outputs: [],
        },
      },
      globalDependencies: ["tsconfig.json", "package.json"],
    },
  };
};
