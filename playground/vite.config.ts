import path from 'path'
import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
import vue from '@vitejs/plugin-vue'
import Unplugin from '../src/vite'

// 边界条件:
// 1. 重复svg名字
// 2. 重复svg内容, 但是不重复名字

export default defineConfig({
  plugins: [
    vue(),
    Inspect(),
    Unplugin({
      iconDir: path.resolve(__dirname, 'icons'),
      dts: true,
      watch: true,
    }),
  ],
})
