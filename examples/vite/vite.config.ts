import path from 'path'
import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
import vue from '@vitejs/plugin-vue'
import UnpluginSvgComponent from 'unplugin-svg-component/vite'

export default defineConfig({
  plugins: [
    vue(),
    Inspect(),
    UnpluginSvgComponent({
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
