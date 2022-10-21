import { createUnplugin } from 'unplugin'
import type { ViteDevServer } from 'vite'
import type { Options } from '../types'
import watchIconDir from './watcher'
import { compileComponent, genDts } from './compiler'
import createSvgSprite, { svgSymbols, symbolIds } from './sprite'
import { LOAD_EVENT, MODULE_NAME, UPDATE_EVENT } from './constants'

let virtualModuleCode = ''
let TransformPluginContext

function resolveOptions(options: Options): Options {
  const defaultOptions = {
    componentName: 'SvgIcon',
    dtsDir: process.cwd(),
    svgSpriteDomId: '__svg__icons__dom__',
  }
  return {
    ...defaultOptions,
    ...options,
  }
}

export default createUnplugin<Options | undefined>(options => ({
  name: 'unplugin-svg-component',
  async buildStart() {
    options = resolveOptions(options!)
    virtualModuleCode = await createCode(options, false)
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
      code: virtualModuleCode,
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
  const componentCode = await compileComponent(options.componentName!)
  await createSvgSprite(options)
  const svgSpriteDomId = options.svgSpriteDomId || '__svg__icons__dom__'

  if (options?.dts)
    genDts(symbolIds, options)

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

    var svgDom = document.querySelector('#${svgSpriteDomId}') 
      || document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    ${hmr ? hmrCode : ''}
    if (typeof window !== 'undefined') {
      function loadSvgs() {
        var body = document.body;
        svgDom.style.position = 'absolute';
        svgDom.style.width = '0';
        svgDom.style.height = '0';
        svgDom.id = '${svgSpriteDomId}';
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
