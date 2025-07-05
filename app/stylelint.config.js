/** @type {import("stylelint").Config} */
export default {
  root: true,
  // 继承某些已有的规则
  extends: [
    'stylelint-config-standard', // css 标准配置
    'stylelint-config-recess-order', // CSS 属性排序配置
  ],
  plugins: ['stylelint-order'],
  overrides: [
    {
      files: ['**/*.less'],
      extends: ['stylelint-config-standard-less'],
    },
    {
      files: ['**/*.scss'],
      extends: ['stylelint-config-standard-scss'],
    },
  ],
  rules: {
    'import-notation': null,
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          /** tailwindcss v4 */
          'theme',
          'source',
          'utility',
          'variant',
          'custom-variant',
          'plugin',
          'reference',
          /** tailwindcss v3 */
          'tailwind',
          'apply',
          'layer',
          'config',
          /** tailwindcss v1, v2 */
          'variants',
          'responsive',
          'screen',
        ],
      },
    ],
    'at-rule-no-deprecated': [
      true,
      {
        ignoreAtRules: ['apply'],
      },
    ],
    'function-no-unknown': [
      true,
      {
        ignoreFunctions: ['theme'],
      },
    ],
  },
  ignoreFiles: [
    '**/*.js',
    '**/*.jsx',
    '**/*.tsx',
    '**/*.ts',
    '**/*.json',
    '**/*.md',
    '**/*.yaml',
    '**/*.cjs',
  ],
};
