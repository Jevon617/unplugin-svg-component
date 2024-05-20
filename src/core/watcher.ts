import { sep } from 'node:path'
import type { ViteDevServer } from 'vite'
import SvgCompiler from 'svg-baker'
import type { Options, SvgSpriteInfo } from '../types'
import { debounce } from './utils'
import { genDts as updateDts } from './generator'
import { LOAD_EVENT, UPDATE_EVENT, USED_SVG_NAMES_FLAG } from './constants'
import { createSymbol } from './sprite'

let isWatched = false

export default function watchIconDir(
  options: Options,
  server: ViteDevServer,
  SvgSpriteInfo: SvgSpriteInfo,
) {
  const delay = 200
  const { watcher } = server
  const { iconDir, dts } = options
  const svgCompiler = new SvgCompiler()
  const iconDirs = Array.isArray(iconDir) ? iconDir : [iconDir]
  const { symbols, symbolCache, symbolIds } = SvgSpriteInfo
  const updateDtsDebounce = debounce(updateDts, delay)
  const notifySpriteReloadDebounce = debounce((symbols: Set<string>, server: ViteDevServer) => {
    const svgSymbolHtml = Array.from(symbols).join('\n')
    server.ws.send(LOAD_EVENT, { svgSymbolHtml })
  }, delay)
  const notifySpriteUpdateDebounce = debounce((symbolId: string, newSvgSymbol: string) => {
    server.ws.send(UPDATE_EVENT, { symbolId, newSvgSymbol })
  }, delay)

  if (!isWatched) {
    watcher
      .on('add', handleIconAdd)
      .on('unlink', handleIconUnlink)
      .on('change', handleIconChange)
  }
  isWatched = true

  function isSvgFile(path: string, dir: string) {
    return path.startsWith(dir + sep) && path.endsWith('.svg')
  }

  function genSvgName(path: string, dir: string) {
    return path.replace(`${dir + sep}`, '').replace(/\\/g, '/')
  }

  async function handleIconAdd(path: string) {
    for (let i = 0; i < iconDirs.length; i++) {
      const dir = iconDirs[i]
      if (!isSvgFile(path, dir))
        continue

      const svgName = genSvgName(path, dir)
      const { svgSymbol, symbolId } = await createSymbol(svgName, options, symbolCache, svgCompiler, dir)
      symbolIds.add(symbolId)
      symbols.add(svgSymbol)
    }

    if (dts)
      updateDtsDebounce(symbolIds, options)
    notifySpriteReloadDebounce(symbols, server)
  }

  async function handleIconUnlink(path: string) {
    for (let i = 0; i < iconDirs.length; i++) {
      const dir = iconDirs[i]

      if (!isSvgFile(path, dir))
        continue

      const svgName = genSvgName(path, dir)
      const { svgSymbol, symbolId } = symbolCache.get(svgName)!
      symbolIds.delete(symbolId)
      symbols.delete(svgSymbol)
    }
    if (dts)
      updateDtsDebounce(symbolIds, options)
    notifySpriteReloadDebounce(symbols, server)
  }

  async function handleIconChange(path: string) {
    for (let i = 0; i < iconDirs.length; i++) {
      const dir = iconDirs[i]
      if (!isSvgFile(path, dir))
        continue
      const svgName = genSvgName(path, dir)
      const { svgSymbol: oldSvgSymbol, symbolId } = symbolCache.get(svgName)!
      const { svgSymbol: newSvgSymbol } = await createSymbol(svgName, options, symbolCache, svgCompiler, USED_SVG_NAMES_FLAG, dir)
      symbols.delete(oldSvgSymbol)
      symbols.add(newSvgSymbol)
      notifySpriteUpdateDebounce(symbolId, newSvgSymbol)
    }
  }
}
