import { base, react, typescript } from "@js-universal/shared-config/eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
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
    plugins: {
      ...react.plugins,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...react.rules,
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
];
