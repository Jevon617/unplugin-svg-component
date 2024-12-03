import { sep } from 'node:path'
import type { ViteDevServer } from 'vite'
import colors from 'picocolors'
import type { Options, SvgSpriteInfo } from '../types'
import { debounce } from './utils'
import { genDts as updateDts } from './generator'
import { LOAD_EVENT } from './constants'
import { compileSvgFiles } from './sprite'

let isWatched = false

export default function watchIconDir(
  options: Options,
  server: ViteDevServer,
  svgSpriteInfo: SvgSpriteInfo,
) {
  const delay = 500
  const { watcher } = server
  const { iconDir, dts } = options

  const iconDirs = Array.isArray(iconDir) ? iconDir : [iconDir]

  const handleIconFilesChangeDebounce = debounce(handleIconFilesChange, delay)

  if (!isWatched) {
    watcher
      .on('add', handleIconFilesChangeDebounce)
      .on('unlink', handleIconFilesChangeDebounce)
      .on('change', handleIconFilesChangeDebounce)
  }
  isWatched = true

  function isSvgFile(path: string) {
    const isSvgDir = iconDirs.some(dir => path.startsWith(dir + sep))
    return isSvgDir && path.endsWith('.svg')
  }

  async function handleIconFilesChange(path: string) {
    if (!isSvgFile(path))
      return

    const { symbolIds, sprite } = await compileSvgFiles(options)

    svgSpriteInfo.symbolIds = symbolIds
    svgSpriteInfo.sprite = sprite

    if (dts)
      updateDts(svgSpriteInfo.symbolIds, options)
    notifyClientUpdate(svgSpriteInfo.sprite, server)
  }
}

function notifyClientUpdate(sprite: string, { ws, config }: ViteDevServer) {
  config.logger.info(
    colors.green(`unplugin-svg-component reload`),
    { clear: false, timestamp: true },
  )
  ws.send(LOAD_EVENT, { sprite })
}
