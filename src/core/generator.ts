import path from 'node:path'
import { pathToFileURL } from 'node:url'
import fs from 'node:fs/promises'
import process from 'node:process'
import { getPackageInfo, importModule, isPackageExists } from 'local-pkg'
import colors from 'picocolors'
import type { Options, VueVersion } from '../types'
import { dts, golbalDts, reactDts, reactTemplate, template } from './snippets'
import { replace, transformStyleStrToObject } from './utils'
import { LOAD_EVENT } from './constants'
import createSvgSprite from './sprite'

export async function genSpriteAndDts(options: Options, isBuild: boolean) {
  const spriteInfo = await createSvgSprite(options, isBuild)
  if (!isBuild && options?.dts)
    genDts(spriteInfo.symbolIds, options)

  return spriteInfo
}

export async function genCode(options: Options, isDev = false) {
  const spriteInfo = await genSpriteAndDts(options, !isDev)
  const { svgSpriteDomId } = options
  const { symbolIds, sprite } = spriteInfo

  const isDynamic = options.domInsertionStrategy === 'dynamic'

  const insertSvgCode = isDynamic ? genInsertSvgCode(sprite) : ''
  const componentCode = await genComponentCode(options)

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
    ${insertSvgCode}
    ${isDev ? hmrCode : ''}
   `
  return code
}

export function genInsertSvgCode(sprite: string) {
  return `
if (typeof window !== 'undefined') {
  function mountSvg() {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = '${sprite.trim()}';
    window.document.body.append(tempDiv.firstElementChild);
  }

  if(document.readyState === 'loading') {
    window.document.addEventListener('DOMContentLoaded', mountSvg);
  } else {
    mountSvg();
  }
}
`
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

export function addClass(template: string, projectType: 'react' | 'vue', cls?: string) {
  return projectType === 'vue'
    ? cls
      ? template.replace(/\$component_class/, `class="${cls}"`)
      : template.replace(/\$component_class/, '')
    : template.replace(/\$component_class/, `"${cls || ''}"`)
}

async function genComponentCode(options: Options) {
  const isVue = isVueProject(options)
  const { componentStyle, componentName, vueVersion, componentClass } = options
  if (!isVue) {
    return addClass(
      reactTemplate.replace(/\$component_name/, componentName!)
        .replace(/\$component_style/, JSON.stringify(transformStyleStrToObject(componentStyle!))),
      'react',
      componentClass,
    )
  }

  const vueMajorVersion = await getVueVersion(vueVersion!)
  if (!vueMajorVersion)
    return 'export default {}'

  const tempTemplate = vueMajorVersion === 'vue3'
    ? template.replace('v-on="$listeners"', '')
    : template

  const replacedTemplate = addClass(
    tempTemplate.replace(/\$component_style/, componentStyle!),
    'vue',
    componentClass,
  )
  const templateCode = await compileVueTemplate(replacedTemplate, vueMajorVersion!)

  return `${templateCode}
\nexport default {
  name: "${componentName}",
  props: {
    name: {
      type: String,
      required: true
    }
  },
  render
}`
}

// getPackageInfo searches from the parent of the startup path upwards; close #39
const VUE_SEARCH_PATHS = [path.resolve(process.cwd(), './virtual')]

async function getVuePackageInfo() {
  return getPackageInfo('vue', { paths: VUE_SEARCH_PATHS })
}

// Vue 3.2.13+ / 2.7.x ship the SFC compiler in the vue package; no need for @vue/compiler-sfc
async function compileVueTemplate(template: string, vueMajorVersion: 'vue2' | 'vue3'): Promise<string> {
  const pkgInfo = (await getVuePackageInfo())!
  const version = pkgInfo.version!
  const isOldVue = version < '2.7.0'
  const compilerInVue = version >= '3.2.13' || (vueMajorVersion === 'vue2' && version >= '2.7.0')

  if (isOldVue)
    throw new Error(colors.red(`[unpluign-svg-component]: unpluign-svg-component requires vue (>=2.7.0) to be present in the dependency tree.`))

  // ESM import() on Windows requires a file:// URL; otherwise "D:\" is parsed as protocol "d:"
  const compilerSfcPath = compilerInVue
    ? pathToFileURL(path.resolve(pkgInfo.rootPath, './compiler-sfc/index.js')).href
    : '@vue/compiler-sfc'
  const pkg = await importModule(compilerSfcPath).catch(() => {
    throw new Error(
      colors.red(`[unpluign-svg-component]: Failed to resolve vue/compiler-sfc. 
      you should install @vue/compiler-sfc@${version} manually or upgrade your vue version to >=3.2.13.`),
    )
  })

  const { compileTemplate } = pkg
  const { code } = compileTemplate({
    source: template,
    id: '__svg-component__',
    filename: 'virtual:svg-component.vue',
  })

  return code.replace(/export/g, '')
}

async function getVueVersion(vueVerison: VueVersion): Promise<'vue2' | 'vue3' | null> {
  if (vueVerison !== 'auto')
    return `vue${vueVerison}`

  try {
    const pkgInfo = await getVuePackageInfo()
    const version = pkgInfo?.version
    if (!version)
      return null
    return version.startsWith('2.') ? 'vue2' : 'vue3'
  }
  catch {
    return null
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
