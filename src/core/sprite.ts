import path from 'path'
import fs from 'fs/promises'
import fg from 'fast-glob'
import { optimize } from 'svgo'
import SvgCompiler from 'svg-baker'
import type { OptimizeOptions, OptimizedSvg } from 'svgo'
import type { Options } from '../types'

export default async function createSvgSprite(options: Options, usedIcons: string[] | string) {
  const { iconDir } = options
  const symbols = new Set<string>()
  const symbolIds = new Set<string>()
  const symbolCache = new Map<string, { symbolId: string; svgSymbol: string }>()
  const svgCompiler = new SvgCompiler()

  const svgNames = fg.sync(['**/*.svg'], { cwd: iconDir })
  for (const svgName of svgNames) {
    const { svgSymbol, symbolId } = await createSymbol(svgName, options, symbolCache, svgCompiler, usedIcons)
    if (svgSymbol) {
      symbolIds.add(symbolId)
      symbols.add(svgSymbol)
    }
  }

  return {
    symbols,
    symbolIds,
    symbolCache,
  }
}

export async function createSymbol(
  svgName: string,
  options: Options,
  symbolCache: Map<string, {
    symbolId: string
    svgSymbol: string
  }>,
  svgCompiler: any,
  usedIcons: string[] | string,
) {
  const { iconDir, prefix = '', preserveColor, symbolIdFormatter, optimizeOptions } = options

  const svgPath = path.resolve(iconDir, svgName)
  const svgContent = await fs.readFile(svgPath)
  const symbolId = symbolIdFormatter!(svgName, prefix)

  if (Array.isArray(usedIcons) && !usedIcons.includes(symbolId)) {
    return {
      svgSymbol: null,
      symbolId: '',
    }
  }

  let isPreserveColor = false
  if (typeof preserveColor === 'string')
    isPreserveColor = svgPath.startsWith(preserveColor)
  else if (typeof preserveColor === 'object')
    isPreserveColor = preserveColor.test(svgPath)

  const OptimizedSvgContent = await optimizeSvg(svgContent, isPreserveColor, optimizeOptions)
  const svgSymbol = (await svgCompiler.addSymbol({
    path: svgPath,
    content: OptimizedSvgContent,
    id: symbolId,
  })).render()
  symbolCache.set(svgName, { svgSymbol, symbolId })
  return {
    svgSymbol,
    symbolId,
  }
}

async function optimizeSvg(source: Buffer, preserveColor: boolean, optimizeOptions?: OptimizeOptions) {
  const { data: optimizedSvgContent } = await optimize(source, optimizeOptions) as OptimizedSvg
  if (preserveColor) {
    return optimizedSvgContent
  }
  else {
    return optimizedSvgContent
      .replace(/stroke="[a-zA-Z#0-9]*"/g, 'stroke="currentColor"')
      .replace(/fill="[a-zA-Z#0-9]*"/g, (p: string) => {
        if (p.includes('none'))
          return p
        else
          return 'fill="currentColor"'
      })
  }
}
