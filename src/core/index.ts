import { createUnplugin } from 'unplugin'
import type { ViteDevServer } from 'vite'
import type { Options } from '../types'
import watchIconDir from './watcher'
import { compileComponent, genDts } from './component'
import createSvgSprite, { svgSymbols, symbolIds } from './sprite'
import { LOAD_EVENT, MODULE_NAME, UPDATE_EVENT } from './constants'

let TransformPluginContext

export default createUnplugin<Options | undefined>(options => ({
  name: 'unplugin-svg-component',
  resolveId(id: string) {
    if (id === MODULE_NAME)
      return id
  },
  loadInclude(id) {
    return id === MODULE_NAME
  },
  async load() {
    return {
      code: await createCode(options!, false),
    }
  },
  vite: {
    transform(this) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      TransformPluginContext = this
    },
    configureServer(server: ViteDevServer) {
      watchIconDir(options!, server)
      server.middlewares.use(async (req, res, next) => {
        if (req.url === `/@id/${MODULE_NAME}`) {
          const code = await createCode(options!, true)

          const importAnalysisTransform = server.config.plugins.find(
            plugin => plugin.name === 'vite:import-analysis',
          )?.transform as any

          const transformResult = await importAnalysisTransform.apply(
            TransformPluginContext, [code, MODULE_NAME, { ssr: false }],
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

async function createCode(options: Options, hmr: boolean) {
  const componentCode = compileComponent()
  await createSvgSprite(options)

  if (options?.dts)
    genDts(symbolIds, options.dtsDir || process.cwd())

  const hmrCode = `
    if (import.meta.hot) {
      import.meta.hot.on("${LOAD_EVENT}", ({svgSymbolHtml}) => {
        svgDom.innerHTML = svgSymbolHtml
      })

      import.meta.hot.on("${UPDATE_EVENT}", ({symbolId, newSvgSymbol}) => {
        var oldSymbolDom = svgDom.querySelector('#' + symbolId)
        var tempDom = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        tempDom.innerHTML = newSvgSymbol
        var newSymbolDom = tempDom.children[0]
        svgDom.replaceChild(newSymbolDom, oldSymbolDom)
      })
    }
  `

  const code = `
    ${componentCode}
    var svgDom = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    ${hmr ? hmrCode : ''}
    if (typeof window !== 'undefined') {
      function loadSvgs() {
        var body = document.body;
        svgDom.style.position = 'absolute';
        svgDom.style.width = '0';
        svgDom.style.height = '0';
        svgDom.id = '__svg__icons__dom__';
        svgDom.setAttribute('xmlns','http://www.w3.org/2000/svg');
        svgDom.setAttribute('xmlns:link','http://www.w3.org/1999/xlink');
        svgDom.innerHTML = ${JSON.stringify(Array.from(svgSymbols).join('\n'))};
        body.append(svgDom)
      }
      if(document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadSvgs);
      } else {
        loadSvgs()
      }
    }
   `
  return code
}
