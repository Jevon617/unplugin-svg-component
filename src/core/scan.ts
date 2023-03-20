import fs from 'node:fs/promises'
import path from 'node:path'
import fg from 'fast-glob'
import type { Options } from '../types'

export default async function scanUsedSvgNames(options: Options) {
  const { componentName, scanGlob, iconDir, scanStrategy, symbolIdFormatter, prefix } = options

  const allSvgNames = fg.sync(['**/*.svg'], { cwd: iconDir })
    .map(n => symbolIdFormatter!(n, prefix!))
    .sort((a, b) => b.length - a.length)

  const svgNameRE = new RegExp(`(${allSvgNames.join('|')})`, 'gm')

  const svgCompnentRE = new RegExp(
    `\\<\\s*${componentName}[^\\<]+name=[\\"\\'](\\S+)[\\"\\'][^\\<]*\\/\\>`, 'g',
  )
  const filenames = await fg(scanGlob!, {
    onlyFiles: true,
    ignore: [
      '**/node_modules',
      '**/dist',
      '**/*.d.ts',
      'vite.config.ts',
      'vite.config.js',
    ],
  })

  const scanExecutors = filenames.map(async (f) => {
    const code = await fs.readFile(path.resolve(process.cwd(), f), 'utf-8')

    if (scanStrategy === 'component')
      return Array.from(code.matchAll(svgCompnentRE)).map(match => match[1])
    else
      return [...(code.match(svgNameRE) || [])]
  })

  const svgNames = await Promise.all(scanExecutors)
  return svgNames.flat()
}
