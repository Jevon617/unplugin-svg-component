import fs from 'node:fs'
import path, { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'
import { createViteServer } from '../server'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function sleep(delay: number) {
  return new Promise(resolve => setTimeout(resolve, delay))
}

test.describe('prop', () => {
  const port = 7071
  const iconDir = path.resolve(__dirname, '../icons2')

  test('hmr should work', async ({ page }: { page: Page }) => {
    const server = await createViteServer({
      hmr: true,
      domInsertionStrategy: 'replaceHtml',
      iconDir,
      port,
    })

    await page.goto(`http://localhost:${port}/`)

    const path1 = path.resolve(iconDir, './icon-addUser.svg')
    const path2 = path.resolve(iconDir, './icon-rename.svg')
    const fileNames = fs.readdirSync(iconDir)
      .map(name => path.basename(name, '.svg'))

    let svgSpriteEl = await page.$('#my-svg-id')
    let symbolIds = await svgSpriteEl?.$$eval('symbol', nodes => nodes.map(n => n.id))
    expect(symbolIds).toEqual(fileNames)
    fs.renameSync(path1, path2)

    await sleep(2000)
    svgSpriteEl = await page.$('#my-svg-id')
    symbolIds = await svgSpriteEl?.$$eval('symbol', nodes => nodes.map(n => n.id))

    fs.renameSync(path2, path1)
    expect(symbolIds).toContain('icon-rename')

    server.close()
  })

  test('hmr should disabled', async ({ page }: { page: Page }) => {
    const server = await createViteServer({
      hmr: false,
      domInsertionStrategy: 'replaceHtml',
      iconDir,
      port,
    })
    await page.goto(`http://localhost:${port}/`)
    const path1 = path.resolve(iconDir, './icon-addUser.svg')
    const path2 = path.resolve(iconDir, './icon-rename.svg')
    const fileNames = fs.readdirSync(iconDir)
      .map(name => path.basename(name, '.svg'))

    let svgSpriteEl = await page.$('#my-svg-id')
    let symbolIds = await svgSpriteEl?.$$eval('symbol', nodes => nodes.map(n => n.id))
    expect(symbolIds).toEqual(fileNames)
    fs.renameSync(path1, path2)

    await sleep(2000)
    svgSpriteEl = await page.$('#my-svg-id')
    symbolIds = await svgSpriteEl?.$$eval('symbol', nodes => nodes.map(n => n.id))

    expect(symbolIds).not.toContain('icon-rename')
    await page.reload() // refresh

    svgSpriteEl = await page.$('#my-svg-id')
    symbolIds = await svgSpriteEl?.$$eval('symbol', nodes => nodes.map(n => n.id))
    fs.renameSync(path2, path1)
    expect(symbolIds).toContain('icon-rename')

    server.close()
  })
})
