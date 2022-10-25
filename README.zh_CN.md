# unplugin-svg-component
[English](./README.md) | **中文**

UnpluginSvgComponent 启发于[vite-plugin-svg-icons](https://github.com/vbenjs/vite-plugin-svg-icons), 通过本地的svg文件生成一个vue组件, 通过该组件使用svg图标, 并支持typescript智能提示svg文件名称, 热更新等功能.

## 功能
1. 智能提示svg文件名称
2. 热更新支持

![image](./images/intellisense.jpg)

## 安装 

```shell
yarn add unplugin-svg-component -D
# or
npm i unplugin-svg-component -D
# or
pnpm install unplugin-svg-component -D
```

## 使用

<details>
<summary>Vite config</summary><br>

```ts
// vite.config.ts
import UnpluginSvgComponent from 'unplugin-svg-component/vite'
export default defineConfig({
  plugins: [
    UnpluginSvgComponent({
      iconDir: path.resolve(__dirname, 'icons'),
      dts: true,
      dtsDir: process.cwd(),
      svgSpriteDomId: '__svg_sprite__dom__',
      componentName: 'SvgIcon',
      componentStyle: 'width: 1em; height: 1em; fill:currentColor;',
      // Usually, the plugin will set SVG's fill and stroke with 'currentColor',
      // use this option to preserve its original color.
      preserveColor: /logo\.svg$/,
    }),
  ],
})
```
<br></details>


<details>
<summary>Vue-cli config</summary><br>

```js
// vue.config.js
const { defineConfig } = require('@vue/cli-service')
const UnpluginSvgComponent = require('unplugin-svg-component/webpack').default

module.exports = defineConfig({
  configureWebpack: {
    plugins: [
      UnpluginSvgComponent({ /* options */ })
    ]
  }
})
```
<br></details>

<details>
<summary>Webpack config</summary><br>

```js
// webpack.config.js
const UnpluginSvgComponent = require('unplugin-svg-component/webpack').default

module.exports = {
  /* ... */
  plugins: [
    UnpluginSvgComponent({ /* options */ }),
  ],
}
```
<br></details>

<details>
<summary>Rollup config</summary><br>

```js
// rollup.config.js
import UnpluginSvgComponent from 'unplugin-svg-component/rollup'

export default {
  plugins: [
    UnpluginSvgComponent({ /* options */ }),
  ],
}
```
<br></details>

<details>
<summary>Esbuild config</summary><br>

```js
// esbuild.config.js
import { build } from 'esbuild'
import UnpluginSvgComponent from 'unplugin-svg-component/esbuild'

build({
  /* ... */
  plugins: [
    UnpluginSvgComponent({
      /* options */
    }),
  ],
})
```
<br></details>


```ts
// main.ts
import SvgIcon from '~virtual/svg-component'
app.component(SvgIcon.name, SvgIcon)
```

## Typescript
```json
// tsconfig.json
{
  "include": ["svg-component.d.ts", "svg-component-global.d.ts"]
}
```

## License
MIT License © 2022-PRESENT [Jevon617](https://github.com/Jevon617)
