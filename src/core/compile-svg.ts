import path from 'path'
import fs from 'fs/promises'
import fg from 'fast-glob'
import debug from 'debug'
import { optimize } from 'svgo'
import SvgCompiler from 'svg-baker'
import type { OptimizedSvg } from 'svgo'
import type { Options } from '../types'

const myDebugger = debug('unplugin-svg-component')

export default async function createSvgSprite(options: Options) {
  let svgSprite = ''
  const symbolIds = new Set()
  const { iconDir, prefix = '' } = options
  const svgCompiler = new SvgCompiler()
  const svgNames = fg.sync(['**/*.svg'], { cwd: options.iconDir })

  for (const svgName of svgNames) {
    const svgPath = path.resolve(iconDir, svgName)
    const svgContent = await fs.readFile(svgPath)
    const symbolId = createSymbolId(svgName, prefix)

    let { data: OptimizedSvgContent } = await optimize(svgContent) as OptimizedSvg

    OptimizedSvgContent = OptimizedSvgContent
      .replace(/stroke="[a-zA-Z#0-9]*"/g, 'stroke="currentColor"')
      .replace(/fill="[a-zA-Z#0-9]*"/g, (p: string) => {
        if (p.includes('none'))
          return p
        else
          return 'fill="currentColor"'
      })

    const svgSymbol = await svgCompiler.addSymbol({
      path: svgPath,
      content: OptimizedSvgContent,
      id: symbolId,
    })

    symbolIds.add(symbolId)
    svgSprite += `${svgSymbol.render() || ''}`
  }

  myDebugger(svgSprite)
  myDebugger(symbolIds)
  return {
    symbolIds,
    svgSprite,
  }
}

function createSymbolId(svgName: string, prefix: string) {
  const nameArr = svgName.split('/')
  if (prefix)
    nameArr.unshift(prefix)
  return nameArr.join('-').replace('.svg', '')
}
