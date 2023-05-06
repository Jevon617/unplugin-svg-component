import path from 'node:path'
import { defineConfig } from 'vite'
import UnpluginSvgComponent from 'unplugin-svg-component/vite'
import vitePluginVue2 from '@vitejs/plugin-vue2'

export default defineConfig({
  plugins: [
    vitePluginVue2(),
    UnpluginSvgComponent({
      iconDir: path.resolve(__dirname, './src/icons'),
      vueVersion: 'auto',
      componentName: 'MySvgIcon',
      preserveColor: /vue\.svg$/,
    }),
  ],
})
