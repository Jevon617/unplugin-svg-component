import type { ViteDevServer } from 'vite'
import type { Options } from '../types'
import { debounce } from './utils'
import { genDts as updateDts } from './compiler'
import { LOAD_EVENT, UPDATE_EVENT } from './constants'
import { createSymbol, svgSymbolCache, svgSymbols, symbolIds } from './sprite'

export default function watchIconDir(options: Options, server: ViteDevServer) {
  const delay = 200
  const { watcher } = server
  const { iconDir, dts } = options

  const updateDtsDebounce = debounce(updateDts, delay)
  const notifySpriteReloadDebounce = debounce((svgSymbols: Set<string>, server: ViteDevServer) => {
    const svgSymbolHtml = Array.from(svgSymbols).join('\n')
    server.ws.send(LOAD_EVENT, { svgSymbolHtml })
  }, delay)
  const notifySpriteUpdateDebounce = debounce((symbolId: string, newSvgSymbol: string) => {
    server.ws.send(UPDATE_EVENT, { symbolId, newSvgSymbol })
  }, delay)

  watcher
    .on('add', handleIconAdd)
    .on('unlink', handleIconUnlink)
    .on('change', handleIconChange)

  function isSvgFile(path: string) {
    return path.startsWith(iconDir) && path.endsWith('.svg')
  }

  async function handleIconAdd(path: string) {
    if (!isSvgFile(path))
      return
    const svgName = genSvgName(path)
    const { svgSymbol, symbolId } = await createSymbol(svgName, options)
    symbolIds.add(symbolId)
    svgSymbols.add(svgSymbol)
    if (dts)
      updateDtsDebounce(symbolIds, options)
    notifySpriteReloadDebounce(svgSymbols, server)
  }

  async function handleIconUnlink(path: string) {
    if (!isSvgFile(path))
      return
    const svgName = genSvgName(path)
    const { svgSymbol, symbolId } = svgSymbolCache.get(svgName)!
    symbolIds.delete(symbolId)
    svgSymbols.delete(svgSymbol)
    if (dts)
      updateDtsDebounce(symbolIds, options)
    notifySpriteReloadDebounce(svgSymbols, server)
  }

  async function handleIconChange(path: string) {
    if (!isSvgFile(path))
      return
    const svgName = genSvgName(path)
    const { svgSymbol: oldSvgSymbol, symbolId } = svgSymbolCache.get(svgName)!
    const { svgSymbol: newSvgSymbol } = await createSymbol(svgName, options)
    svgSymbols.delete(oldSvgSymbol)
    svgSymbols.add(newSvgSymbol)
    notifySpriteUpdateDebounce(symbolId, newSvgSymbol)
  }

  function genSvgName(path: string) {
    return path.replace(`${iconDir}`, '').slice(1).replace(/\\/g, '/')
  }
}

