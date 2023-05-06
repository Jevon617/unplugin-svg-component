import path from 'node:path'
import { expect, test } from 'vitest'
import { genCode } from '../src/core/generator'

test('createSprite', async () => {
  const { code } = await genCode({
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
  }, 'all', true)
  expect(code).matchSnapshot()
})
