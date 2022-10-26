const path = require('path')
const { defineConfig } = require('@vue/cli-service')
const UnpluginSvgComponent = require('unplugin-svg-component/webpack').default

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
      UnpluginSvgComponent({
        iconDir: path.resolve(__dirname, './src/icons'),
        dts: false,
        componentName: 'MySvgIcon',
      }),
    ],
  },
})
