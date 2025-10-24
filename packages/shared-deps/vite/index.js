// Shared Vite dependencies and versions
export const viteDeps = {
  vite: "^5.0.0",
  "@vitejs/plugin-react": "^4.2.0",
};

export const viteDevDeps = {
  "vite-plugin-dts": "^4.0.0",
  "vite-tsconfig-paths": "^5.1.4",
};

// Build tool dependencies
export const buildDeps = {
  typescript: "^5.8.3",
  tsx: "^4.20.3",
};

export const buildDevDeps = {
  "@types/node": "^22.15.30",
};

// All Vite dependencies combined
export const allViteDeps = {
  ...viteDeps,
  ...buildDeps,
};

export const allViteDevDeps = {
  ...viteDevDeps,
  ...buildDevDeps,
};
