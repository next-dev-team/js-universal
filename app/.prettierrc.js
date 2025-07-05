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
    '^react(.*)$', // React 相关放在最前面
    '<THIRD_PARTY_MODULES>', // 其他第三方模块
    '^@/components/(.*)$', // 全局组件
    '^@/(hooks|store)(.*)$', // 自定义 hooks 和 store 统一分组
    '^@/services/(.*)$', // 接口模块
    '^@/(.*)$', // 其他 @/ 开头的模块
    '^[./]', // 当前文件夹和父文件夹的相对导入
  ],
};
