import path from 'node:path'
import fs from 'node:fs/promises'
import { getPackageInfo, importModule, isPackageExists } from 'local-pkg'
import type { Options, VueVersion } from '../types'
import { dts, golbalDts, reactDts, reactTemplate, template } from './snippets'
import { replace, transformStyleStrToObject } from './utils'
import { LOAD_EVENT } from './constants'

export async function genCode(options: Options, symbolIds: Set<string>, isDev = false) {
  const { svgSpriteDomId } = options
  const componentCode = await genComponentCode(options)

  // only generate dts in serve
  if (options?.dts && isDev)
    genDts(symbolIds, options)

  const hmrCode = `
if (import.meta.hot) {
  import.meta.hot.on("${LOAD_EVENT}", ({ sprite }) => {
    var svgDom = document.querySelector('#${svgSpriteDomId}');
    svgDom.remove();
    var tempDom = document.createElement('div');
    tempDom.innerHTML = sprite; 
    document.body.append(tempDom.firstElementChild);
  })
}
`
  const symbolIdsCode = `
export const svgNames = ["${[...symbolIds].join('","')}"]
`
  const code = `
    ${componentCode}
    ${symbolIdsCode}
    ${isDev ? hmrCode : ''}
   `
  return code
}

export function genDts(symbolIds: Set<string>, options: Options) {
  const isVue = isVueProject(options)
  const dtsPath = path.resolve(options.dtsDir!, './svg-component.d.ts')
  const globalDtsPath = path.resolve(options.dtsDir!, './svg-component-global.d.ts')
  if (isVue) {
    fs.writeFile(
      dtsPath,
      replace(dts, symbolIds, options.componentName!),
    )
    fs.writeFile(
      globalDtsPath,
      replace(golbalDts, symbolIds, options.componentName!),
    )
  }
  else {
    fs.writeFile(
      dtsPath,
      replace(reactDts, symbolIds, options.componentName!),
    )
  }
}

async function genComponentCode(options: Options) {
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

  const replacedTemplate = tempTemplate.replace(/\$component_style/, componentStyle!)

  let code = await compileVueTemplate(replacedTemplate, vueVerison)

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
  if (!pkgInfo || pkgInfo?.version?.[0] !== vueVerison.slice(-1))
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
      return result.version?.startsWith('2.') ? 'vue2' : 'vue3'
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
