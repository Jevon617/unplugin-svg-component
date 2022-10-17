import fs from 'fs/promises'
import path from 'path'
import { compileTemplate } from '@vue/compiler-sfc'
import { dts, template } from './code'
export function compileComponent() {
  let { code } = compileTemplate({
    source: template,
    id: '__svg-icon__',
    filename: 'svg-icon.vue',
  })

  code = code.replace(/export/g, '')
  code += `
    \nexport default{
      name: 'SvgIcon',
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

export function genDts(symbolIds: Set<string>, dtsDir: string) {
  const processedDts = dts.replace(/\$svg_symbolIds/g, Array.from(symbolIds).join('" | "'))
  fs.writeFile(path.resolve(dtsDir, 'svg-icon.d.ts'), processedDts)
}
