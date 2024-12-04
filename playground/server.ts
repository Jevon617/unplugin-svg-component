import path, { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'

import unpluginSvgcomponet from 'unplugin-svg-component/vite'
import type { Options } from 'unplugin-svg-component'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export async function createViteServer(options: Partial<Options> & { port: number } = { port: 7070 }) {
  const server = await createServer({
    plugins: [
      vue(),
      unpluginSvgcomponet({
        iconDir: path.resolve(__dirname, './icons'),
        dts: false,
        svgSpriteDomId: 'my-svg-id',
        vueVersion: 3,
        ...options,
      }),
    ],
    server: {
      port: options.port,
    },
    root: path.resolve(__dirname, './'),
  })
  server.listen()

  return server
}
