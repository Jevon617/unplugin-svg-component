import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import UnpluginSvgComponent from 'unplugin-svg-component/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    UnpluginSvgComponent({
      projectType: 'react',
      iconDir: path.resolve(__dirname, './src/assets'),
      dts: true,
      // preserveColor: path.resolve(__dirname, 'icons/common'),
      dtsDir: path.resolve(__dirname, './src/typing'),
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
    })],
})
