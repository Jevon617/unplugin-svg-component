import path from 'path'
import fs from 'fs/promises'
import fg from 'fast-glob'
import { optimize } from 'svgo'
import SvgCompiler from 'svg-baker'
import type { OptimizedSvg } from 'svgo'
import type { Options } from '../types'

export default async function createSvgSprite(options: Options) {
  const { iconDir } = options
  const symbols = new Set<string>()
  const symbolIds = new Set<string>()
  const symbolCache = new Map<string, { symbolId: string; svgSymbol: string }>()
  const svgCompiler = new SvgCompiler()

  const svgNames = fg.sync(['**/*.svg'], { cwd: iconDir })

  for (const svgName of svgNames) {
    const { svgSymbol, symbolId } = await createSymbol(svgName, options, symbolCache, svgCompiler)
    symbolIds.add(symbolId)
    symbols.add(svgSymbol)
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
  svgCompiler,
) {
  const { iconDir, prefix = '', preserveColor, symbolIdFormatter } = options

  const svgPath = path.resolve(iconDir, svgName)
  const svgContent = await fs.readFile(svgPath)
  const symbolId = symbolIdFormatter ? symbolIdFormatter(svgName, prefix) : createSymbolId(svgName, prefix)

  let isPreserveColor = false
  if (typeof preserveColor === 'string')
    isPreserveColor = svgPath.startsWith(preserveColor)
  else if (typeof preserveColor === 'object')
    isPreserveColor = preserveColor.test(svgPath)

  const OptimizedSvgContent = await optimizeSvg(svgContent, isPreserveColor)
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

async function optimizeSvg(source: Buffer, preserveColor: boolean) {
  const { data: optimizedSvgContent } = await optimize(source) as OptimizedSvg
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

function createSymbolId(svgName: string, prefix: string) {
  const nameArr = svgName.split('/')
  if (prefix)
    nameArr.unshift(prefix)
  return nameArr.join('-').replace(/\.svg$/, '')
}
