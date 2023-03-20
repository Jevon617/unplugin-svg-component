import type { OptimizeOptions } from 'svgo'

export interface Options {
  iconDir: string
  prefix?: string
  dts?: boolean
  dtsDir?: string
  svgSpriteDomId?: string
  componentName?: string
  preserveColor?: string | RegExp
  componentStyle?: string
  symbolIdFormatter?: (name: string, prefix: string) => string
  optimizeOptions?: OptimizeOptions
  projectType?: 'vue' | 'react' | 'auto'
  vueVersion?: VueVersion
  scanGlob?: string[]
  scanStrategy?: 'text' | 'component' | ((code: string[], options: Options) => string[])
}

export type VueVersion = 2 | 3 | 'auto'
