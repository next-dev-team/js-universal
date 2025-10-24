// Shared plugin configuration for Electron plugin apps
export const createPluginConfig = (options = {}) => {
  const {
    name,
    version = "1.0.0",
    description = "A plugin for the Electron app",
    author = "Plugin Developer",
    category = "utility",
    permissions = ["storage"],
    window = {
      width: 400,
      height: 300,
      minWidth: 300,
      minHeight: 250,
      maxWidth: 600,
      maxHeight: 500,
      resizable: true,
    },
    dependencies = {},
    devDependencies = {},
    scripts = {},
    ...pluginOptions
  } = options;

  return {
    name,
    version,
    description,
    author,
    main: "index.html",
    permissions,
    category,
    dependencies: {
      react: "^18.2.0",
      "react-dom": "^18.2.0",
      ...dependencies,
    },
    devDependencies: {
      "@types/react": "^18.2.0",
      "@types/react-dom": "^18.2.0",
      ...devDependencies,
    },
    scripts: {
      "cp-resources": "cp -r package.json dist/",
      dev: "vite",
      build: "vite build && npm run cp-resources",
      preview: "vite preview",
      ...scripts,
    },
    window,
    ...pluginOptions,
  };
};

// Preset configurations for common plugin types
export const createTodoPluginConfig = (options = {}) =>
  createPluginConfig({
    name: "todo-plugin",
    description:
      "A modern React-based todo app plugin with task management, filtering, and persistent storage",
    category: "productivity",
    window: {
      width: 500,
      height: 600,
      minWidth: 400,
      minHeight: 500,
      maxWidth: 700,
      maxHeight: 800,
      resizable: true,
    },
    dependencies: {
      vite: "^5.0.0",
      "@vitejs/plugin-react": "^4.2.0",
    },
    ...options,
  });

export const createCounterPluginConfig = (options = {}) =>
  createPluginConfig({
    name: "counter-plugin",
    description:
      "A simple counter plugin that demonstrates basic plugin functionality with increment and decrement operations",
    category: "utility",
    window: {
      width: 400,
      height: 300,
      minWidth: 300,
      minHeight: 250,
      maxWidth: 600,
      maxHeight: 500,
      resizable: true,
    },
    dependencies: {},
    scripts: {
      build: "mkdir -p dist && cp -r *.html *.js *.css *.svg dist/",
    },
    ...options,
  });

export const createTrelloCloneConfig = (options = {}) =>
  createPluginConfig({
    name: "trello-clone",
    description: "A clone of the Trello board management tool",
    category: "productivity",
    dependencies: {
      "@dnd-kit/core": "^6.0.5",
      "@dnd-kit/sortable": "^7.0.1",
      "@fortawesome/fontawesome-svg-core": "^6.1.2",
      "@fortawesome/free-solid-svg-icons": "^6.1.2",
      "@fortawesome/react-fontawesome": "^0.2.0",
      immer: "^9.0.15",
      uuid: "^8.3.2",
      zustand: "^4.0.0",
    },
    devDependencies: {
      "@types/uuid": "^8.3.4",
      "@typescript-eslint/eslint-plugin": "^5.32.0",
      "@typescript-eslint/parser": "^5.32.0",
      "@vitejs/plugin-react": "^2.0.0",
      autoprefixer: "^10.4.7",
      eslint: "^8.21.0",
      "eslint-config-prettier": "^8.5.0",
      "eslint-plugin-jsx-a11y": "^6.6.1",
      "eslint-plugin-prettier": "^4.2.1",
      "eslint-plugin-react": "^7.30.1",
      postcss: "^8.4.14",
      prettier: "^2.7.1",
      tailwindcss: "^3.1.6",
      typescript: "^4.6.4",
      vite: "^3.0.0",
    },
    scripts: {
      dev: "vite",
      build: "tsc && vite build && npm run cp-resources",
      preview: "vite preview",
      "cp-resources": "cp -r package.json dist/",
    },
    ...options,
  });
