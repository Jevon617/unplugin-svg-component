/* eslint-disable ts/no-this-alias */
import cors from 'cors'
import genEtag from 'etag'
import { createUnplugin } from 'unplugin'
import type { Options, SvgSpriteInfo } from '../types'
import { genCode } from './generator'
import { MODULE_NAME, PLUGIN_NAME } from './constants'
import { resolveOptions } from './utils'
import createSvgSprite from './sprite'
import watchIconDir from './watcher'

let isBuild = false
let isWebpack = false
let isDynamicStrategy = false
let spriteInfo: SvgSpriteInfo
let transformPluginContext: any

const unplugin = createUnplugin<Options>(options => ({
  name: PLUGIN_NAME,
  async buildStart() {
    options = resolveOptions(options)
    spriteInfo = await createSvgSprite(options, isBuild)
    isDynamicStrategy = options.domInsertionStrategy === 'dynamic'
  },
  resolveId(id: string) {
    if (id === MODULE_NAME)
      return id
  },
  loadInclude(id) {
    return id === MODULE_NAME
  },
  async load() {
    return isBuild || isWebpack
      ? (await genCode(options, spriteInfo))
      : ''
  },
  webpack(compiler) {
    if (isDynamicStrategy)
      return

    isWebpack = true
    isBuild = compiler.options.mode === 'production'

    compiler.hooks.emit.tapAsync(PLUGIN_NAME, async (compilation, callback) => {
      const assets = compilation.assets as any
      const originHtml = assets['index.html']._value
      const transformedHtml = originHtml.replace(/<\/body>/, `${spriteInfo.sprite}</body>`)
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
      server.middlewares.use(cors({ origin: '*' }))
      server.middlewares.use(async (req, res, next) => {
        // close #22
        const { pathname } = req.url
          ? new URL(req.url, 'https://example.com')
          : { pathname: '' }
        if (pathname.endsWith(`/@id/${MODULE_NAME}`)) {
          watchIconDir(options, server, spriteInfo)

          const code = await genCode(options, spriteInfo, true)
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
      if (isDynamicStrategy || html.includes(options.svgSpriteDomId!))
        return html
      return html.replace(/<\/body>/, `${spriteInfo.sprite}</body>`)
    },
  },
}))

export * from '../types'
export default unplugin
