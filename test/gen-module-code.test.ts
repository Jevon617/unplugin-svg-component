import path from 'path'
import { expect, test } from 'vitest'
import { genModuleCode } from '../src/core/generator'

test('createSprite', async () => {
  const { code } = await genModuleCode({
    iconDir: path.resolve(__dirname, './icons'),
    componentName: 'SvgIcon',
    svgSpriteDomId: 'sprite-id',
  }, true)
  expect(code).matchSnapshot()
})
