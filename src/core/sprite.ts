import path from 'path'
import fs from 'fs/promises'
import fg from 'fast-glob'
import { optimize } from 'svgo'
import SvgCompiler from 'svg-baker'
import type { OptimizedSvg } from 'svgo'
import type { Options } from '../types'

let svgCompiler = new SvgCompiler()
export const symbolIds = new Set<string>()
export const svgSymbols = new Set<string>()
export const svgSymbolCache = new Map<string, { symbolId: string; svgSymbol: string }>()

export default async function createSvgSprite(options: Options) {
  resetGlobalData()
  const { iconDir, prefix = '' } = options
  const svgNames = fg.sync(['**/*.svg'], { cwd: iconDir })

  for (const svgName of svgNames) {
    const { svgSymbol, symbolId } = await createSymbol(svgName, iconDir, prefix)
    symbolIds.add(symbolId)
    svgSymbols.add(svgSymbol)
  }
}

function resetGlobalData() {
  symbolIds.clear()
  svgSymbols.clear()
  svgSymbolCache.clear()
  svgCompiler = new SvgCompiler()
}

export async function createSymbol(svgName: string, iconDir: string, prefix: string) {
  const svgPath = path.resolve(iconDir, svgName)
  const svgContent = await fs.readFile(svgPath)
  const symbolId = createSymbolId(svgName, prefix)
  const OptimizedSvgContent = await optimizeSvg(svgContent)
  const svgSymbol = (await svgCompiler.addSymbol({
    path: svgPath,
    content: OptimizedSvgContent,
    id: symbolId,
  })).render()
  svgSymbolCache.set(svgName, { svgSymbol, symbolId })
  return {
    svgSymbol,
    symbolId,
  }
}

async function optimizeSvg(source: Buffer) {
  const { data: OptimizedSvgContent } = await optimize(source) as OptimizedSvg
  return OptimizedSvgContent
    .replace(/stroke="[a-zA-Z#0-9]*"/g, 'stroke="currentColor"')
    .replace(/fill="[a-zA-Z#0-9]*"/g, (p: string) => {
      if (p.includes('none'))
        return p
      else
        return 'fill="currentColor"'
    })
}

function createSymbolId(svgName: string, prefix: string) {
  const nameArr = svgName.split('/')
  if (prefix)
    nameArr.unshift(prefix)
  return nameArr.join('-').replace(/\.svg$/, '')
}
