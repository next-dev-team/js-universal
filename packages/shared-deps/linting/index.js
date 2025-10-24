// Shared linting dependencies and versions
export const eslintDeps = {
  eslint: "^9.25.0",
  "@eslint/js": "^9.25.0",
  globals: "^16.0.0",
  "typescript-eslint": "^8.30.1",
};

export const eslintPluginDeps = {
  "eslint-plugin-react-hooks": "^5.2.0",
  "eslint-plugin-react-refresh": "^0.4.19",
  "eslint-plugin-react": "^7.33.0",
  "eslint-plugin-import": "^2.28.0",
  "eslint-plugin-jsx-a11y": "^6.6.1",
  "eslint-plugin-prettier": "^4.2.1",
};

export const prettierDeps = {
  prettier: "^3.2.5",
  "prettier-plugin-tailwindcss": "^0.6.14",
};

export const styleDeps = {
  tailwindcss: "^3.4.17",
  autoprefixer: "^10.4.21",
  postcss: "^8.5.3",
};

// All linting dependencies combined
export const allLintingDeps = {
  ...eslintDeps,
  ...eslintPluginDeps,
  ...prettierDeps,
  ...styleDeps,
};
