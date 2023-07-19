import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

export default {
  input: './index.ts',
  output: [{
    file: 'dist/index.cjs',
    format: 'cjs',
    sourcemap: true
  }, {
    file: 'dist/index.js',
    format: 'es',
    sourcemap: true
  }],
  plugins: [
    typescript(),
    nodeResolve({ preferBuiltins: false }),
    commonjs()
  ]
}
