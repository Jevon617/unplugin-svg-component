import type { Config as OptimizeOptions } from 'svgo'

export interface Options {
  iconDir: string | string[]
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
  treeShaking?: boolean
  scanGlob?: string[]
  scanStrategy?: 'text' | 'component' | ((code: string[], options: Options) => string[])
}

export type VueVersion = 2 | 3 | 'auto'

export interface SvgSpriteInfo {
  symbols: Set<string>
  symbolIds: Set<string>
  symbolCache: Map<string, { symbolId: string, svgSymbol: string }>
}
