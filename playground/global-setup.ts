import path, { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { ViteDevServer } from 'vite'
import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'

import unpluginSvgcomponet from 'unplugin-svg-component/vite'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// eslint-disable-next-line import/no-mutable-exports
export let server: ViteDevServer

async function globalSetup() {
  server = await createServer({
    plugins: [
      vue(),
      unpluginSvgcomponet({
        iconDir: path.resolve(__dirname, './icons'),
        dts: false,
        svgSpriteDomId: 'my-svg-id',
        vueVersion: 3,
      }),
    ],
    server: {
      port: 7070,
    },
    root: path.resolve(__dirname, './'),
  })
  server.listen()
}

export default globalSetup
