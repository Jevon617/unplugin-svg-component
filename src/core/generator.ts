import path from 'path'
import fs from 'fs/promises'
import { getPackageInfo, importModule, isPackageExists } from 'local-pkg'
import type { Options, VueVersion } from '../types'
import { dts, golbalDts, reactDts, reactTemplate, template } from './snippets'
import { replace, transformStyleStrToObject } from './utils'
import createSvgSprite from './sprite'
import { LOAD_EVENT, UPDATE_EVENT, XMLNS, XMLNS_LINK } from './constants'

export async function genModuleCode(options: Options, usedSvgNames: string[] | string, hmr: boolean) {
  const isVueProject = detectProjectType(options)
  const component = await genComponent(options, isVueProject)
  const svgSpriteDomId = options.svgSpriteDomId

  const { symbolIds, symbols, symbolCache } = await createSvgSprite(options, usedSvgNames)
  const xmlns = `xmlns="${XMLNS}"`
  const xmlnsLink = `xmlns:xlink="${XMLNS_LINK}"`
  const symbolHtml = Array.from(symbols).join('')
    .replace(new RegExp(xmlns, 'g'), '')
    .replace(new RegExp(xmlnsLink, 'g'), '')

  // only generate dts in serve
  if (options?.dts && !Array.isArray(usedSvgNames))
    genDts(symbolIds, options, isVueProject)

  const hmrCode = `
    if (import.meta.hot) {
      import.meta.hot.on("${LOAD_EVENT}", ({svgSymbolHtml}) => {
        svgDom.innerHTML = svgSymbolHtml
      })

      import.meta.hot.on("${UPDATE_EVENT}", ({symbolId, newSvgSymbol}) => {
        var oldSymbolDom = svgDom.querySelector('#' + symbolId)
        var tempDom = document.createElementNS('${XMLNS}', 'svg');
        tempDom.innerHTML = newSvgSymbol
        var newSymbolDom = tempDom.children[0]
        svgDom.replaceChild(newSymbolDom, oldSymbolDom)
      })
    }
  `
  const code = `
    ${component}

    var svgDom = document.querySelector('#${svgSpriteDomId}') 
      || document.createElementNS('${XMLNS}', 'svg');

    ${hmr ? hmrCode : ''}
    if (typeof window !== 'undefined') {
      function loadSvgs() {
        var body = document.body;
        svgDom.style.position = 'absolute';
        svgDom.style.width = '0';
        svgDom.style.height = '0';
        svgDom.id = '${svgSpriteDomId}';
        svgDom.setAttribute('xmlns','${XMLNS}');
        svgDom.setAttribute('xmlns:link','${XMLNS_LINK}');
        svgDom.innerHTML = ${JSON.stringify(symbolHtml)};
        body.append(svgDom)
      }
      if(document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadSvgs);
      } else {
        loadSvgs()
      }
    }
   `
  return {
    symbolCache,
    symbolIds,
    symbols,
    code,
  }
}

export function genDts(symbolIds: Set<string>, options: Options, isVueProject: boolean) {
  if (isVueProject) {
    fs.writeFile(
      path.resolve(options.dtsDir!, './svg-component.d.ts'),
      replace(dts, symbolIds, options.componentName!),
    )
    fs.writeFile(
      path.resolve(options.dtsDir!, './svg-component-global.d.ts'),
      replace(golbalDts, symbolIds, options.componentName!),
    )
  }
  else {
    fs.writeFile(
      path.resolve(options.dtsDir!, './svg-component.d.ts'),
      replace(reactDts, symbolIds, options.componentName!),
    )
  }
}

async function genComponent(options: Options, isVueProject: boolean) {
  const { componentStyle, componentName, vueVersion } = options
  if (!isVueProject) {
    return reactTemplate.replace(/\$component_name/, componentName!)
      .replace(/\$component_style/, JSON.stringify(transformStyleStrToObject(componentStyle!)))
  }

  const vueVerison = await getVueVersion(vueVersion!)
  if (!vueVerison)
    return 'export default {}'

  const compilers = {
    vue2: compileVue2Template,
    vue3: compileVue3Template,
  }

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

async function getVueVersion(vueVerison: VueVersion): Promise<'vue2' | 'vue3' | null > {
  if (vueVerison === 'auto') {
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
  else {
    return `vue${vueVerison}`
  }
}

function detectProjectType(options: Options) {
  if (options.projectType === 'auto') {
    try {
      if (isPackageExists('vue'))
        return true
      else if (isPackageExists('react'))
        return false
      else
        throw new Error('[unpluign-svg-component] can\'t detect your project type, please set options.projectType.')
    }
    catch {
      throw new Error('[unpluign-svg-component] can\'t detect your project type, please set options.projectType.')
    }
  }
  else {
    return options.projectType === 'vue'
  }
}
