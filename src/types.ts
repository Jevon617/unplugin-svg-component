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
}

