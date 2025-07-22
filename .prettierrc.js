export default {
  printWidth: 80,
  singleQuote: true,
  trailingComma: 'all',
  proseWrap: 'never',
  endOfLine: 'lf',
  overrides: [{ files: '.prettierrc', options: { parser: 'json' } }],
  plugins: [
    'prettier-plugin-packagejson',
    '@trivago/prettier-plugin-sort-imports',
    'prettier-plugin-tailwindcss', // MUST come last
  ],
  importOrderSeparation: false,
  importOrderSortSpecifiers: true,
  importOrder: [
    '^react(.*)$', // React related modules first
    '<THIRD_PARTY_MODULES>', // Other third party modules
    '^@/components/(.*)$', // Global components
    '^@/(hooks|store)(.*)$', // Custom hooks and store grouped together
    '^@/services/(.*)$', // API services module
    '^@/(.*)$', // Other modules starting with @/
    '^[./]', // Relative imports from current and parent folders
  ],
};
