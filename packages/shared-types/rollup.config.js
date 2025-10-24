import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/cjs/index.js',
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: 'dist/esm/index.js',
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationDir: undefined,
        declarationMap: false,
        compilerOptions: {
          types: []
        }
      }),
    ],
  },
  {
    input: 'src/index.ts',
    output: {
      dir: 'dist/esm/types',
      format: 'esm',
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: './dist/esm/types',
        declarationMap: true,
        emitDeclarationOnly: true,
        compilerOptions: {
          types: [],
          outDir: './dist/esm/types'
        }
      }),
    ],
  },
];