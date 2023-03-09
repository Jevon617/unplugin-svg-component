import cors from 'cors'
import genEtag from 'etag'
import { createUnplugin } from 'unplugin'
import type { Options } from '../types'
import watchIconDir from './watcher'
import { genModuleCode } from './generator'
import { MODULE_NAME, USED_SVG_NAMES_FLAG } from './constants'
import { resolveOptions } from './utils'
import scanUsedSvgNames from './scan'

let isBuild = false
let moduleCode = ''
let transformPluginContext: any
let usedSvgNames: string[] | string = []

const unplugin = createUnplugin<Options>(options => ({
  name: 'unplugin-svg-component',
  async buildStart() {
    options = resolveOptions(options)
    // only scan used icons in build
    if (isBuild)
      usedSvgNames = await scanUsedSvgNames(options)
    else
      usedSvgNames = USED_SVG_NAMES_FLAG

    moduleCode = (await genModuleCode(options, usedSvgNames, false)).code
  },
  resolveId(id: string) {
    if (id === MODULE_NAME)
      return id
  },
  loadInclude(id) {
    return id === MODULE_NAME
  },
  async load() {
    return moduleCode
  },
  webpack(compiler) {
    isBuild = compiler.options.mode === 'production'
  },
  vite: {
    async configResolved(config) {
      isBuild = config.command === 'build'
    },
    async load(id, ssr) {
      if (id === MODULE_NAME)
        return ssr?.ssr ? 'export default {}' : moduleCode
    },
    transform(this) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      transformPluginContext = this
    },
    configureServer(server) {
      server.middlewares.use(cors({ origin: '*' }))
      server.middlewares.use(async (req, res, next) => {
        if (req.url === `/@id/${MODULE_NAME}`) {
          const { code, symbols, symbolCache, symbolIds } = await genModuleCode(options, usedSvgNames, true)
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
