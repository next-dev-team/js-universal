// Shared testing dependencies and versions
export const vitestDeps = {
  vitest: "^3.2.4",
  "@vitest/ui": "^3.2.4",
  "happy-dom": "^20.0.7",
};

export const testingLibraryDeps = {
  "@testing-library/jest-dom": "^6.9.1",
  "@testing-library/react": "^16.3.0",
  "@testing-library/user-event": "^14.6.1",
};

export const jestDeps = {
  jest: "^29.0.0",
  "@types/jest": "^29.0.0",
};

// All testing dependencies combined
export const allTestingDeps = {
  ...vitestDeps,
  ...testingLibraryDeps,
};

export const allTestingDevDeps = {
  ...jestDeps,
};
