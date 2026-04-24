import type { UserConfig } from 'tsdown'

export default {
  entry: [
    'src/*.ts',
  ],
  clean: true,
  format: ['cjs', 'esm'],
  dts: true,
  onSuccess: 'npm run build:fix',
  outExtensions({ format }) {
    return {
      js: format === 'cjs' ? '.cjs' : '.js',
    }
  },
} as UserConfig
