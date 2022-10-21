import path from 'path'
import fs from 'fs/promises'
import { getPackageInfo, importModule } from 'local-pkg'
import type { Options } from '../types'
import { dts, golbalDts, template } from './snippets'
import { replace } from './utils'
import createSvgSprite, { svgSymbols, symbolIds } from './sprite'
import { LOAD_EVENT, UPDATE_EVENT } from './constants'

export async function genModuleCode(options: Options, hmr: boolean) {
  const component = await genComponent(options)
  const svgSpriteDomId = options.svgSpriteDomId

  await createSvgSprite(options)

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
    ${component}

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

export function genDts(symbolIds: Set<string>, options: Options) {
  fs.writeFile(
    path.resolve(options.dtsDir!, './svg-component.d.ts'),
    replace(dts, symbolIds, options.componentName!),
  )
  fs.writeFile(
    path.resolve(options.dtsDir!, './svg-component-global.d.ts'),
    replace(golbalDts, symbolIds, options.componentName!),
  )
}

async function genComponent(options: Options) {
  const vueVerison = await getVueVersion()
  if (!vueVerison)
    return 'export default {}'

  const compilers = {
    vue2: compileVue2Template,
    vue3: compileVue3Template,
  }

  const { componentStyle, componentName } = options
  const processedTemplate = template.replace(/\$component_style/, componentStyle!)

  let code = await compilers[vueVerison](processedTemplate)

  code += `
    \nexport default{
      name: "${componentName}",
      props: {
        name: {
          type: String,
          required: true
        }
      },
      render
    }
  `
  return code
}

async function compileVue3Template(template: string): Promise<string> {
  const { compileTemplate } = await importModule('@vue/compiler-sfc')
  const { code } = compileTemplate({
    source: template,
    id: '__svg-component__',
    filename: 'virtual:svg-component.vue',
  })
  return code.replace(/export/g, '')
}

async function compileVue2Template(template: string): Promise<string> {
  const { compile } = await importModule('vue-template-compiler')
  const transpile = (await importModule('vue-template-es2015-compiler')).default

  const { render } = compile(template)
  const toFunction = (code: string): string => {
    return `function () {${code}}`
  }
  const res = transpile(`var __render__ = ${toFunction(render as any)}\n`, {})
  const code = res.replace(/\s__(render|staticRenderFns)__\s/g, ' $1 ')

  return code
}

async function getVueVersion() {
  try {
    const result = await getPackageInfo('vue')
    if (!result)
      return null
    return result.version.startsWith('2.') ? 'vue2' : 'vue3'
  }
  catch {
    return null
  }
}

