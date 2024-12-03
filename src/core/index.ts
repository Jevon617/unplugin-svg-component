/* eslint-disable ts/no-this-alias */
import cors from 'cors'
import genEtag from 'etag'
import { createUnplugin } from 'unplugin'
import type { ViteDevServer } from 'vite'
import type { Options } from '../types'
import { genCode, genSpriteWidthDts } from './generator'
import { MODULE_NAME, PLUGIN_NAME } from './constants'
import { resolveOptions } from './utils'
import watchIconDir from './watcher'

let isBuild = false
let isWebpack = false

let transformPluginContext: any
let viteDevServer: ViteDevServer

const unplugin = createUnplugin<Options>(options => ({
  name: PLUGIN_NAME,
  async buildStart() {
    options = resolveOptions(options)

    // svg hmr
    if (!isBuild && viteDevServer && options.hmr)
      watchIconDir(options, viteDevServer)
  },
  resolveId(id: string) {
    if (id === MODULE_NAME)
      return id
  },
  loadInclude(id) {
    return id === MODULE_NAME
  },
  async load() {
    return isBuild
      ? (await genCode(options))
      : isWebpack
        ? (await genCode(options, true))
        : ''
  },
  webpack(compiler) {
    isWebpack = true
    isBuild = compiler.options.mode === 'production'

    if (options.domInsertionStrategy === 'dynamic')
      return

    compiler.hooks.emit.tapAsync(PLUGIN_NAME, async (compilation, callback) => {
      const assets = compilation.assets as any
      const originHtml = assets['index.html']._value
      const { sprite } = await genSpriteWidthDts(options, isBuild)
      const transformedHtml = originHtml.replace(/<\/body>/, `${sprite}</body>`)
      assets['index.html'] = {
        source() {
          return transformedHtml
        },
        size() {
          return transformedHtml.length
        },
      }
      callback()
    })
  },
  vite: {
    async configResolved(config) {
      isBuild = config.command === 'build'
    },
    transform() {
      transformPluginContext = this
    },
    configureServer(server) {
      viteDevServer = server
      server.middlewares.use(cors({ origin: '*' }))
      server.middlewares.use(async (req, res, next) => {
        // close #22
        const { pathname } = req.url
          ? new URL(req.url, 'https://example.com')
          : { pathname: '' }
        if (pathname.endsWith(`/@id/${MODULE_NAME}`)) {
          const code = await genCode(options, true)
          const etag = genEtag(code, { weak: true })
          const noneMatch = req.headers['if-none-match'] || req.headers['If-None-Match']

          if (noneMatch === etag || noneMatch === `W/${etag}` || `W/${noneMatch}` === etag) {
            res.statusCode = 304
            res.end()
          }
          else {
            const importAnalysisTransform = server.config.plugins.find(
              plugin => plugin.name === 'vite:import-analysis',
            )?.transform as any

            transformPluginContext.ssr = false
            const { code: transformedCode } = await importAnalysisTransform.apply(
              transformPluginContext,
              [code, MODULE_NAME, { ssr: false }],
            )
            res.statusCode = 200
            res.setHeader('ETag', etag)
            res.setHeader('Content-Type', 'application/javascript')
            res.setHeader('Cache-Control', 'no-cache')
            res.end(transformedCode)
          }
        }
        else {
          next()
        }
      })
    },
    async transformIndexHtml(html) {
      if (options.domInsertionStrategy === 'dynamic' || html.includes(options.svgSpriteDomId!)) {
        return html
      }
      else {
        const { sprite } = await genSpriteWidthDts(options, isBuild)
        return html.replace(/<\/body>/, `${sprite}</body>`)
      }
    },
  },
}))

export * from '../types'
export default unplugin
