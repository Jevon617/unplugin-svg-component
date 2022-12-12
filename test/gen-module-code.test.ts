import path from 'path'
import { expect, test } from 'vitest'
import { genModuleCode } from '../src/core/generator'

test('createSprite', async () => {
  const { code } = await genModuleCode({
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
  }, true)
  expect(code).matchSnapshot()
})
