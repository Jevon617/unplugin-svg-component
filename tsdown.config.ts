import type { UserConfig } from 'tsdown'

export default <UserConfig>{
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
}
