import path from 'path'
import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
import vue from '@vitejs/plugin-vue'
import Unplugin from '../dist/vite'

export default defineConfig({
  plugins: [
    vue(),
    Inspect(),
    Unplugin({
      iconDir: path.resolve(__dirname, 'icons'),
      dts: true,
      preserveColor: path.resolve(__dirname, 'icons/common'),
      dtsDir: path.resolve(__dirname, 'typing'),
      svgSpriteDomId: 'my-svg-id',
      prefix: 'icon',
      componentName: 'MySvgIcon',
    }),
  ],
})
