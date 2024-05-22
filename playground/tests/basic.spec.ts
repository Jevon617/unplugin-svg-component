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

test.describe('basic', () => {
  let fileNames: string[]

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:7070/')
    fileNames = fs.readdirSync(path.resolve(__dirname, '../icons'))
      .map(name => path.basename(name, '.svg'))
  })

  test('svg sprite should be mounted to document', async ({ page }: { page: Page }) => {
    const svgSpriteEl = await page.$('#my-svg-id')
    const symbolIds = await svgSpriteEl?.$$eval('symbol', nodes => nodes.map(n => n.id))
    expect(symbolIds).toEqual(fileNames)
  })

  test('svg component should render properly', async ({ page }: { page: Page }) => {
    const icons = await page.$$('.icon>use')
    const symbolIds = (await Promise.all(icons.map(icon => icon.getAttribute('xlink:href')))).map((item) => {
      return item?.replace('#', '')
    }).sort()
    expect(symbolIds).toEqual(fileNames)
  })

  test('hmr should work', async ({ page }: { page: Page }) => {
    const path1 = path.resolve(__dirname, '../icons/icon-addUser.svg')
    const path2 = path.resolve(__dirname, '../icons/icon-rename.svg')

    let svgSpriteEl = await page.$('#my-svg-id')
    let symbolIds = await svgSpriteEl?.$$eval('symbol', nodes => nodes.map(n => n.id))
    expect(symbolIds).toEqual(fileNames)
    fs.renameSync(path1, path2)

    await sleep(2000)
    svgSpriteEl = await page.$('#my-svg-id')
    symbolIds = await svgSpriteEl?.$$eval('symbol', nodes => nodes.map(n => n.id))

    expect(symbolIds).toContain('icon-rename')
    fs.renameSync(path2, path1)
  })
})
