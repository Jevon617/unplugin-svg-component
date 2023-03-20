import fs from 'node:fs/promises'
import path from 'node:path'
import fg from 'fast-glob'
import type { Options } from '../types'

export default async function scanUsedSvgNames(options: Options) {
  const { componentName, scanGlob, iconDir, scanStrategy, symbolIdFormatter, prefix } = options

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

  const code = await Promise.all(filenames.map(async (f) => {
    const code = await fs.readFile(path.resolve(process.cwd(), f), 'utf-8')
    return code
  }))

  function internalScanStrategy() {
    let svgNameMatches = []

    if (scanStrategy === 'component') {
      const svgCompnentRE = new RegExp(
        `\\<\\s*${componentName}[^\\<]+name=[\\"\\'](\\S+)[\\"\\'][^\\<]*\\/\\>`, 'g',
      )
      svgNameMatches = code.map((c) => {
        return Array.from(c.matchAll(svgCompnentRE)).map(match => match[1])
      })
    }
    else {
      const allSvgNames = fg.sync(['**/*.svg'], { cwd: iconDir })
        .map(n => symbolIdFormatter!(n, prefix!))
        .sort((a, b) => b.length - a.length)

      const svgNameRE = new RegExp(`(${allSvgNames.join('|')})`, 'gm')

      svgNameMatches = code.map((c) => {
        return [...(c.match(svgNameRE) || [])]
      })
    }
    return svgNameMatches.flat()
  }

  if (typeof scanStrategy === 'function')
    return scanStrategy(code, options)
  else
    return internalScanStrategy()
}
