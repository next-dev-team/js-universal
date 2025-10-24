// Main exports for shared dependencies
export * from "./react/index.js";
export * from "./vite/index.js";
export * from "./testing/index.js";
export * from "./linting/index.js";

// Combined dependency sets for common use cases
export const pluginDeps = {
  // React dependencies
  react: "^18.2.0",
  "react-dom": "^18.2.0",
  // Build tools
  vite: "^5.0.0",
  "@vitejs/plugin-react": "^4.2.0",
  // Common utilities
  clsx: "^2.1.1",
  "tailwind-merge": "^3.0.2",
  zustand: "^5.0.3",
};

export const pluginDevDeps = {
  "@types/react": "^18.2.0",
  "@types/react-dom": "^18.2.0",
  typescript: "^5.8.3",
  eslint: "^9.25.0",
  prettier: "^3.2.5",
  tailwindcss: "^3.4.17",
  autoprefixer: "^10.4.21",
  postcss: "^8.5.3",
};

export const electronDeps = {
  electron: "^38.3.0",
  "electron-builder": "^25.1.8",
  "electron-vite": "^5.0.0-beta.0",
  "electron-is-dev": "^3.0.1",
};

export const electronDevDeps = {
  "@types/node": "^22.15.30",
};

export const apiDeps = {
  express: "^4.21.2",
  cors: "^2.8.5",
  multer: "^1.4.5-lts.1",
  dotenv: "^17.2.1",
};

export const apiDevDeps = {
  "@types/express": "^4.17.21",
  "@types/cors": "^2.8.19",
  "@types/multer": "^1.4.12",
  "@vercel/node": "^2.3.0",
};

export const databaseDeps = {
  "@prisma/client": "^6.1.0",
  prisma: "^6.1.0",
};

export const monorepoDeps = {
  turbo: "^2.0.0",
  concurrently: "^9.2.0",
  "patch-package": "^8.0.1",
};
