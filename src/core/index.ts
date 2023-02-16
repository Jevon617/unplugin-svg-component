import cors from 'cors'
import genEtag from 'etag'
import { createUnplugin } from 'unplugin'
import type { ViteDevServer } from 'vite'
import type { TransformPluginContext } from 'rollup'

import type { Options } from '../types'
import watchIconDir from './watcher'
import { genModuleCode } from './generator'
import { MODULE_NAME } from './constants'
import { resolveOptions } from './utils'

let moduleCode = ''
let transformPluginContext: TransformPluginContext

const unplugin = createUnplugin<Options>(options => ({
  name: 'unplugin-svg-component',
  async buildStart() {
    options = resolveOptions(options)
    const { code } = await genModuleCode(options, false)
    moduleCode = code
  },
  resolveId(id: string) {
    if (id === MODULE_NAME)
      return id
  },
  loadInclude(id) {
    return id === MODULE_NAME
  },
  async load() {
    return {
      code: moduleCode,
    }
  },
  vite: {
    async load(id, ssr) {
      if (id === MODULE_NAME) {
        if (ssr?.ssr)
          return null
        return {
          code: moduleCode,
        }
      }
    },
    transform(this) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      transformPluginContext = this
    },
    configureServer(server: ViteDevServer) {
      server.middlewares.use(cors({ origin: '*' }))
      server.middlewares.use(async (req, res, next) => {
        if (req.url === `/@id/${MODULE_NAME}`) {
          const { code, symbols, symbolCache, symbolIds } = await genModuleCode(options, true)
          watchIconDir(options, server, symbols, symbolIds, symbolCache)

          const importAnalysisTransform = server.config.plugins.find(
            plugin => plugin.name === 'vite:import-analysis',
          )?.transform as any

          const transformResult = await importAnalysisTransform.apply(
            transformPluginContext, [code, MODULE_NAME, { ssr: false }],
          )

          const etag = genEtag(transformResult.code, { weak: true })
          const noneMatch = req.headers['if-none-match'] || req.headers['If-None-Match']

          if (noneMatch === etag || noneMatch === `W/${etag}` || `W/${noneMatch}` === etag) {
            res.statusCode = 304
            res.end()
          }
          else {
            res.setHeader('ETag', etag)
            res.setHeader('Content-Type', 'application/javascript')
            res.setHeader('Cache-Control', 'no-cache')
            res.statusCode = 200
            res.end(transformResult.code)
          }
        }
        else {
          next()
        }
      })
    },
  },
}))

export * from '../types'
export default unplugin
