import path from 'path'
import fs from 'fs/promises'
import { compileTemplate } from '@vue/compiler-sfc'
import type { Options } from '../types'
import { dts, golbalDts, template } from './code'
import { replace } from './utils'
export function compileComponent(componentName: string) {
  let { code } = compileTemplate({
    source: template,
    id: '__svg-icon__',
    filename: 'svg-icon.vue',
  })

  code = code.replace(/export/g, '')
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

export function genDts(symbolIds: Set<string>, options: Options) {
  fs.writeFile(
    path.resolve(options.dtsDir!, './svg-icon.d.ts'),
    replace(dts, symbolIds, options.componentName!),
  )
  fs.writeFile(
    path.resolve(options.dtsDir!, './svg-icon-global.d.ts'),
    replace(golbalDts, symbolIds, options.componentName!),
  )
}
