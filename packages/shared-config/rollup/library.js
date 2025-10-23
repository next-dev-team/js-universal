import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

export default function createLibraryConfig(options = {}) {
  const {
    input = 'src/index.ts',
    outputDir = 'dist',
    packageName,
    external = [],
    globals = {},
    minify = true,
    sourcemap = true,
    declaration = true,
    ...rollupOptions
  } = options;

  const baseConfig = {
    input,
    external: [
      ...external,
      // Common peer dependencies
      'react',
      'react-dom',
      'react/jsx-runtime',
    ],
    plugins: [
      peerDepsExternal(),
      resolve({
        browser: false,
        preferBuiltins: true,
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration,
        declarationDir: `${outputDir}/types`,
        rootDir: 'src',
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
        ...globals,
      },
    });
  }

  // Add minified versions if minify is enabled
  if (minify) {
    const minifiedOutputs = outputs.map(output => ({
      ...output,
      file: output.file.replace(/\.js$/, '.min.js'),
      plugins: [terser()],
    }));
    outputs.push(...minifiedOutputs);
  }

  return {
    ...baseConfig,
    output: outputs,
  };
}

// Default configuration
export const defaultConfig = createLibraryConfig();