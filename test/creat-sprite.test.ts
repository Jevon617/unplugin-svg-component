import path from 'path'
import { expect, test } from 'vitest'
import createSvgSprite from '../src/core/sprite'

test('createSprite', async () => {
  const { symbolIds } = await createSvgSprite({
    iconDir: path.resolve(__dirname, './icons'),
  })
  expect(symbolIds).matchSnapshot()
})
