import fs from 'node:fs'
import path, { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function sleep(delay: number) {
  return new Promise(resolve => setTimeout(resolve, delay))
}

test.describe('hrm', () => {
  let fileNames: string[]
  const path1 = path.resolve(__dirname, '../icons/icon-addUser.svg')
  const path2 = path.resolve(__dirname, '../icons/icon-rename.svg')

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:7070/')
    fileNames = fs.readdirSync(path.resolve(__dirname, '../icons'))
      .map(name => path.basename(name, '.svg'))
  })

  test('hmr should work', async ({ page }: { page: Page }) => {
    let svgSpriteEl = await page.$('#my-svg-id')
    let symbolIds = await svgSpriteEl?.$$eval('symbol', nodes => nodes.map(n => n.id))
    expect(symbolIds).toEqual(fileNames)

    fs.renameSync(path1, path2)

    await sleep(2000)
    svgSpriteEl = await page.$('#my-svg-id')
    symbolIds = await svgSpriteEl?.$$eval('symbol', nodes => nodes.map(n => n.id))

    expect(symbolIds).toContain('icon-rename')
  })

  test.afterEach(() => {
    fs.renameSync(path2, path1)
  })
})
