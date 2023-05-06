const path = require('node:path')
const { defineConfig } = require('@vue/cli-service')
const UnpluginSvgComponent = require('unplugin-svg-component/webpack').default

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
      UnpluginSvgComponent({
        iconDir: path.resolve(__dirname, './src/icons'),
        componentName: 'MySvgIcon',
        preserveColor: /vue\.svg$/,
        vueVersion: 2,
      }),
    ],
  },
})
