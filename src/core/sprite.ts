import path from 'node:path'
import fs from 'node:fs/promises'
import fg from 'fast-glob'
import { optimize } from 'svgo'
import Sprite from 'svg-sprite'
import type { Config as OptimizeOptions, Output as OptimizedSvg } from 'svgo'
import type { Options, SvgSpriteInfo } from '../types'
import scanUsedSvgNames from './scan'

export default async function createSvgSprite(options: Options, isBuild: boolean): Promise<SvgSpriteInfo> {
  // only scan used icons in build
  const usedSvgNames = isBuild && options.treeShaking
    ? (await scanUsedSvgNames(options))
    : undefined

  const svgSpriteInfo = await compileSvgFiles(options, usedSvgNames)
  return svgSpriteInfo
}

export async function compileSvgFiles(options: Options, usedSvgNames?: string[]) {
  const { iconDir } = options

  const svgCompiler = initSvgCompier(options)
  const iconDirs = Array.isArray(iconDir) ? iconDir : [iconDir]
  const symbolIds = new Set<string>()

  for (const dir of iconDirs) {
    const svgNames = fg.sync(['**/*.svg'], { cwd: dir })
    for (const svgName of svgNames) {
      await addSymbol(
        svgCompiler,
        svgName.replace('/', path.sep),
        options,
        dir,
        symbolIds,
        usedSvgNames,
      )
    }
  }

  const { result: compileResult } = await svgCompiler.compileAsync()
  const sprite: string = compileResult.symbol.sprite.contents.toString()
  return {
    symbolIds,
    sprite,
  }

  function initSvgCompier(options: Options) {
    const { svgSpriteDomId, prefix, symbolIdFormatter } = options
    return new Sprite({
      mode: {
        symbol: true,
      },
      svg: {
        xmlDeclaration: false,
        transform: [
          (svg) => {
            const svgStyle = `style="position: absolute; width: 0px; height: 0px;"`
            return svg.replace(/^<svg/, `<svg id="${svgSpriteDomId}" ${svgStyle}`)
          },
        ],
      },
      shape: {
        id: {
          generator(name) {
            return symbolIdFormatter!(name.replace(path.sep, '/'), prefix || '')
          },
        },
      },
    })
  }
}

export async function addSymbol(
  svgCompiler: Sprite.SVGSpriter,
  svgName: string,
  options: Options,
  iconDir: string,
  symbolIds: Set<string>,
  usedSvgNames?: string[] | string,
) {
  const { preserveColor, symbolIdFormatter, optimizeOptions, prefix = '' } = options
  const svgPath = path.resolve(iconDir, svgName)
  const symbolId = symbolIdFormatter!(svgName.replace(path.sep, '/'), prefix)
  const svgContent = await fs.readFile(svgPath, { encoding: 'utf-8' })

  if (Array.isArray(usedSvgNames) && !usedSvgNames.includes(symbolId))
    return

  const isPreserveColor = typeof preserveColor === 'string'
    ? svgPath.startsWith(preserveColor)
    : typeof preserveColor === 'object' && preserveColor.test(svgPath)

  const OptimizedSvgContent = await optimizeSvg(svgContent, isPreserveColor, optimizeOptions)
  symbolIds.add(symbolId)
  svgCompiler.add(svgPath, svgName, OptimizedSvgContent)
}

async function optimizeSvg(source: string, preserveColor: boolean, optimizeOptions?: OptimizeOptions) {
  const { data: optimizedSvgContent } = await optimize(source, optimizeOptions) as OptimizedSvg
  return preserveColor
    ? optimizedSvgContent
    : optimizedSvgContent
      .replace(/stroke="[a-zA-Z#0-9]*"/g, 'stroke="currentColor"')
      .replace(/fill="[a-zA-Z#0-9]*"/g, (p: string) => {
        if (p.includes('none'))
          return p
        else
          return 'fill="currentColor"'
      })
}
