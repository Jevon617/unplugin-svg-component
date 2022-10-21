import { createUnplugin } from 'unplugin'
import type { ViteDevServer } from 'vite'
import type { Options } from '../types'
import watchIconDir from './watcher'
import { genModuleCode } from './generator'
import { MODULE_NAME } from './constants'
import { resolveOptions } from './utils'

let moduleCode = ''
let transformPluginContext

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
    transform(this) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      transformPluginContext = this
    },
    configureServer(server: ViteDevServer) {
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
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/javascript')
          res.setHeader('Cache-Control', 'no-cache')
          res.end(transformResult.code)
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
