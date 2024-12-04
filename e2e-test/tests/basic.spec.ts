import fs from 'node:fs'
import path from 'node:path'
import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'
import type { ViteDevServer } from 'vite'
import { createViteServer } from '../server'
import { __dirname, sleep } from './utlis'

test.describe('basic', () => {
  let fileNames: string[]
  let server: ViteDevServer

  test.beforeEach(async ({ page }) => {
    server = await createViteServer()
    await sleep(2000)
    await page.goto('http://localhost:7070/')
    fileNames = fs.readdirSync(path.resolve(__dirname, '../icons'))
      .map(name => path.basename(name, '.svg'))
  })

  test.afterEach(() => {
    server.close()
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
})
