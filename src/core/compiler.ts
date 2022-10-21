import path from 'path'
import fs from 'fs/promises'
// import { compileTemplate } from '@vue/compiler-sfc'
import { getPackageInfo, importModule } from 'local-pkg'
import type { Options } from '../types'
import { dts, golbalDts, template } from './code'
import { replace } from './utils'

export async function compileComponent(componentName: string) {
  let code = ''
  const vueVerison = await getVueVersion()

  if (vueVerison === 'vue2') {
    const { compile } = await importModule('vue-template-compiler')
    const transpile = (await importModule('vue-template-es2015-compiler')).default

    const { render } = compile(template)
    const toFunction = (code: string): string => {
      return `function () {${code}}`
    }
    const res = transpile(`var __render__ = ${toFunction(render as any)}\n`, {})
    code = res.replace(/\s__(render|staticRenderFns)__\s/g, ' $1 ')
  }
  else {
    const compilerSfc = await importModule('@vue/compiler-sfc')
    const res = compilerSfc.compileTemplate({
      source: template,
      id: '__svg-icon__',
      filename: 'svg-icon.vue',
    })
    code = res.code.replace(/export/g, '')
  }

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
