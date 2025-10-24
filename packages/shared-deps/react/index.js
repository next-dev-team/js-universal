// Shared React dependencies and versions
export const reactDeps = {
  react: "^18.2.0",
  "react-dom": "^18.2.0",
};

export const reactDevDeps = {
  "@types/react": "^18.2.0",
  "@types/react-dom": "^18.2.0",
};

export const reactHooksDeps = {
  "react-hooks": "^4.6.0",
};

export const reactRouterDeps = {
  "react-router-dom": "^7.3.0",
};

// Common React ecosystem dependencies
export const reactEcosystemDeps = {
  clsx: "^2.1.1",
  "tailwind-merge": "^3.0.2",
  zustand: "^5.0.3",
  immer: "^9.0.15",
  uuid: "^8.3.2",
};

export const reactEcosystemDevDeps = {
  "@types/uuid": "^8.3.4",
};

// UI Library dependencies
export const antdDeps = {
  "@ant-design/icons": "^5.5.1",
  "@ant-design/v5-patch-for-react-19": "^1.0.3",
  antd: "^5.22.6",
};

export const lucideDeps = {
  "lucide-react": "^0.511.0",
};

export const fontawesomeDeps = {
  "@fortawesome/fontawesome-svg-core": "^6.1.2",
  "@fortawesome/free-solid-svg-icons": "^6.1.2",
  "@fortawesome/react-fontawesome": "^0.2.0",
};

// DnD Kit dependencies
export const dndKitDeps = {
  "@dnd-kit/core": "^6.0.5",
  "@dnd-kit/sortable": "^7.0.1",
};

// All React dependencies combined
export const allReactDeps = {
  ...reactDeps,
  ...reactRouterDeps,
  ...reactEcosystemDeps,
  ...antdDeps,
  ...lucideDeps,
  ...fontawesomeDeps,
  ...dndKitDeps,
};

export const allReactDevDeps = {
  ...reactDevDeps,
  ...reactEcosystemDevDeps,
};
