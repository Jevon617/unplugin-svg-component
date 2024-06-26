import path from 'node:path'
import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
import vue from '@vitejs/plugin-vue'
import UnpluginSvgComponent from 'unplugin-svg-component/vite'

export default defineConfig({
  plugins: [
    vue(),
    Inspect(),
    UnpluginSvgComponent({
      iconDir: [path.resolve(__dirname, 'icons'), path.resolve(__dirname, 'icons2')],
      dts: true,
      preserveColor: path.resolve(__dirname, 'icons/common'),
      dtsDir: path.resolve(__dirname, 'typing'),
      svgSpriteDomId: 'my-svg-id',
      prefix: 'icon',
      componentName: 'MySvgIcon',
      symbolIdFormatter: (svgName: string, prefix: string): string => {
        const nameArr = svgName.split('/')
        if (prefix)
          nameArr.unshift(prefix)
        return nameArr.join('-').replace(/\.svg$/, '')
      },
      optimizeOptions: undefined,
      vueVersion: 3,
      scanStrategy: 'component',
      treeShaking: true,
      domInsertionStrategy: 'dynamic',
    }),
  ],
  base: './',
})
