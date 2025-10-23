import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';

export default function createReactLibraryConfig(options = {}) {
  const {
    input = 'src/index.ts',
    outputDir = 'dist',
    packageName,
    external = [],
    globals = {},
    minify = true,
    sourcemap = true,
    declaration = true,
    cssModules = false,
    ...rollupOptions
  } = options;

  const baseConfig = {
    input,
    external: [
      ...external,
      // React peer dependencies
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      // Common React ecosystem packages
      'prop-types',
      'classnames',
      'clsx',
    ],
    plugins: [
      peerDepsExternal(),
      resolve({
        browser: true,
        preferBuiltins: false,
      }),
      commonjs({
        include: /node_modules/,
      }),
      postcss({
        extract: true,
        minimize: minify,
        sourceMap: sourcemap,
        modules: cssModules ? {
          generateScopedName: '[name]__[local]___[hash:base64:5]',
        } : false,
        use: [
          ['sass', {
            includePaths: ['./src', './node_modules'],
          }],
        ],
      }),
      typescript({
        tsconfig: './tsconfig.json',
        declaration,
        declarationDir: `${outputDir}/types`,
        rootDir: 'src',
        jsx: 'react-jsx',
        exclude: [
          '**/*.test.ts',
          '**/*.test.tsx',
          '**/*.spec.ts',
          '**/*.spec.tsx',
          '**/*.stories.ts',
          '**/*.stories.tsx',
        ],
      }),
    ],
    ...rollupOptions,
  };

  const outputs = [
    // CommonJS build
    {
      file: `${outputDir}/index.cjs.js`,
      format: 'cjs',
      sourcemap,
      exports: 'auto',
    },
    // ES modules build
    {
      file: `${outputDir}/index.esm.js`,
      format: 'esm',
      sourcemap,
    },
  ];

  // Add UMD build if package name is provided
  if (packageName) {
    outputs.push({
      file: `${outputDir}/index.umd.js`,
      format: 'umd',
      name: packageName,
      sourcemap,
      globals: {
        react: 'React',
        'react-dom': 'ReactDOM',
        'prop-types': 'PropTypes',
        classnames: 'classNames',
        clsx: 'clsx',
        ...globals,
      },
    });
  }

  // Add minified versions if minify is enabled
  if (minify) {
    const minifiedOutputs = outputs.map(output => ({
      ...output,
      file: output.file.replace(/\.js$/, '.min.js'),
      plugins: [terser({
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
        mangle: {
          reserved: ['React', 'ReactDOM'],
        },
      })],
    }));
    outputs.push(...minifiedOutputs);
  }

  return {
    ...baseConfig,
    output: outputs,
  };
}

// Default configuration
export const defaultConfig = createReactLibraryConfig();