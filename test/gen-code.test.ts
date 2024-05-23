import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { genCode } from '../src/core/generator'
import createSvgSprite from '../src/core/sprite'
import type { Options } from '../src/types'

describe('gen-code', () => {
  it('with replaceHtml option', async () => {
    const options: Options = {
      projectType: 'vue',
      vueVersion: 3,
      iconDir: path.resolve(__dirname, './icons'),
      componentName: 'SvgIcon',
      svgSpriteDomId: 'sprite-id',
      symbolIdFormatter(svgName: string, prefix: string) {
        const nameArr = svgName.split('/')
        if (prefix)
          nameArr.unshift(prefix)
        return nameArr.join('-').replace(/\.svg$/, '')
      },
    }
    const spriteInfo = await createSvgSprite(options, true)
    const code = await genCode(options, spriteInfo, true)
    expect(code).not.toContain('mountSvg')
    expect(code).matchSnapshot()
  })

  it('with dynamic option', async () => {
    const options: Options = {
      projectType: 'vue',
      vueVersion: 3,
      iconDir: path.resolve(__dirname, './icons'),
      componentName: 'SvgIcon',
      svgSpriteDomId: 'sprite-id',
      symbolIdFormatter(svgName: string, prefix: string) {
        const nameArr = svgName.split('/')
        if (prefix)
          nameArr.unshift(prefix)
        return nameArr.join('-').replace(/\.svg$/, '')
      },
      domInsertionStrategy: 'dynamic',
    }
    const spriteInfo = await createSvgSprite(options, true)
    const code = await genCode(options, spriteInfo, true)
    expect(code).toContain('mountSvg')
    expect(code).matchSnapshot()
  })
})
