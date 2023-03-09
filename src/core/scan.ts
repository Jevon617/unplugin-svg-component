import fs from 'node:fs/promises'
import path from 'node:path'
import fg from 'fast-glob'
import type { Options } from '../types'

export default async function scanUsedSvgNames(options: Options) {
  const { componentName, scanGlob } = options
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
    return Array.from(code.matchAll(svgCompnentRE)).map(match => match[1])
  })

  const svgNames = await Promise.all(scanExecutors)
  return svgNames.flat()
}
