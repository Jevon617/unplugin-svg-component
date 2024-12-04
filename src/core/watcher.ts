import { sep } from 'node:path'
import type { ViteDevServer } from 'vite'
import colors from 'picocolors'
import type { Options } from '../types'
import { debounce } from './utils'
import { genSpriteWidthDts, genDts as updateDts } from './generator'
import { LOAD_EVENT } from './constants'

export default function watchIconDir(
  options: Options,
  server: ViteDevServer,
) {
  const delay = 500
  const { watcher } = server
  const { iconDir, dts } = options

  const iconDirs = Array.isArray(iconDir) ? iconDir : [iconDir]

  const handleIconFilesChangeDebounce = debounce(handleIconFilesChange, delay)

  watcher
    .on('add', handleIconFilesChangeDebounce)
    .on('unlink', handleIconFilesChangeDebounce)
    .on('change', handleIconFilesChangeDebounce)

  function isSvgFile(path: string) {
    const isSvgDir = iconDirs.some(dir => path.startsWith(dir + sep))
    return isSvgDir && path.endsWith('.svg')
  }

  async function handleIconFilesChange(path: string) {
    if (!isSvgFile(path))
      return
    const { symbolIds, sprite } = await genSpriteWidthDts(options, false)

    if (dts)
      updateDts(symbolIds, options)
    notifyClientUpdate(sprite, server)
  }
}

function notifyClientUpdate(sprite: string, { ws, config }: ViteDevServer) {
  config.logger.info(
    colors.green(`unplugin-svg-component reload`),
    { clear: false, timestamp: true },
  )
  ws.send(LOAD_EVENT, { sprite })
}
