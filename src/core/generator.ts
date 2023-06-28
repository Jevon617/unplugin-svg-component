import path from 'node:path'
import fs from 'node:fs/promises'
import { getPackageInfo, importModule, isPackageExists } from 'local-pkg'
import type { Options, VueVersion } from '../types'
import { dts, golbalDts, reactDts, reactTemplate, template } from './snippets'
import { replace, transformStyleStrToObject } from './utils'
import createSvgSprite from './sprite'
import { LOAD_EVENT, UPDATE_EVENT, XMLNS, XMLNS_LINK } from './constants'

export async function genCode(options: Options, usedSvgNames: string[] | string, hmr: boolean) {
  const isVue = isVueProject(options)
  const componentCode = await genComponent(options)
  const { svgSpriteDomId } = options

  const { symbolIds, symbols, symbolCache } = await createSvgSprite(options, usedSvgNames)
  const xmlns = `xmlns="${XMLNS}"`
  const xmlnsLink = `xmlns:xlink="${XMLNS_LINK}"`
  const symbolHtml = Array.from(symbols).join('')
    .replace(new RegExp(xmlns, 'g'), '')
    .replace(new RegExp(xmlnsLink, 'g'), '')

  // only generate dts in serve
  if (options?.dts && !Array.isArray(usedSvgNames))
    genDts(symbolIds, options)

  const hmrCode = `
if (import.meta.hot) {
  var svgDom = document.querySelector('#${svgSpriteDomId}') 
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

  const symbolIdsCode = `
export const svgNames = ["${[...symbolIds].join('","')}"]
`

  const svgSpriteDomStr = `
    <svg 
      id="${svgSpriteDomId}"
      xmlns="${XMLNS}" 
      xmlns:link="${XMLNS_LINK}" 
      style="position: absolute; width: 0px; height: 0px;">
      ${symbolHtml}
    </svg>
  `

  const code = `
    ${componentCode}
    ${symbolIdsCode}
    ${hmr ? hmrCode : ''}
   `
  return {
    symbolCache,
    symbolIds,
    symbols,
    code,
    componentCode,
    svgSpriteDomStr,
  }
}

export function genDts(symbolIds: Set<string>, options: Options) {
  const isVue = isVueProject(options)
  if (isVue) {
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

async function genComponent(options: Options) {
  const isVue = isVueProject(options)
  const { componentStyle, componentName, vueVersion } = options
  if (!isVue) {
    return reactTemplate.replace(/\$component_name/, componentName!)
      .replace(/\$component_style/, JSON.stringify(transformStyleStrToObject(componentStyle!)))
  }

  const vueVerison = await getVueVersion(vueVersion!)
  if (!vueVerison)
    return 'export default {}'

  const tempTemplate = vueVerison === 'vue3'
    ? template.replace('v-on="$listeners"', '')
    : template

  const processedTemplate = tempTemplate.replace(/\$component_style/, componentStyle!)

  let code = await compileVueTemplate(processedTemplate, vueVerison)

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
}`
  return code
}

async function compileVueTemplate(template: string, vueVerison: string): Promise<string> {
  const pkgInfo = await getPackageInfo('@vue/compiler-sfc')
  if (!pkgInfo || pkgInfo?.version[0] !== vueVerison.slice(-1))
    throw new Error(`Cannot find module \'@vue/compiler-sfc@${vueVerison.slice(-1)}.x.x\'. Please install it.`)

  const pkg = await importModule('@vue/compiler-sfc')
  const { compileTemplate } = pkg
  const { code } = compileTemplate({
    source: template,
    id: '__svg-component__',
    filename: 'virtual:svg-component.vue',
  })
  return code.replace(/export/g, '')
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

function isVueProject(options: Options) {
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
