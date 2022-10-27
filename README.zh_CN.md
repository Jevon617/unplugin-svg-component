# unplugin-svg-component
[English](./README.md) | **中文**

unplugin-svg-component 启发于[vite-plugin-svg-icons](https://github.com/vbenjs/vite-plugin-svg-icons)。

它将本地的svg文件生成为一个vue组件, 通过该组件结合svg文件的名称使用svg图标。

## 功能

* **智能提示** 使用组件时, 配合 Typescript 会提示出 svg 文件名称
* **热更新** svg文件的增删改操作, 都会实时显示于页面上, 无需刷新浏览器

## 效果

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
    UnpluginSvgComponent({ /* options */ })
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

## 插件配置

```ts
UnpluginSvgComponent({
  iconDir: path.resolve(__dirname, 'icons'),
  dts: false, // 默认值
  dtsDir: process.cwd(), // 默认值
  svgSpriteDomId: '__svg_sprite__dom__', // 默认值
  componentName: 'SvgIcon', // 默认值
  componentStyle: 'width: 1em; height: 1em; fill:currentColor;', // 默认值
  // 通常, 插件会把svg文件的fill, stroke属性替换为'currentColor', 使用这个属性可以让插件保留svg原来的颜色
  preserveColor: /logo\.svg$/,
  prefix: '', // 默认值
  symbolIdFormatter: (svgName: string, prefix: string): string => {
    const nameArr = svgName.split('/')
    if (prefix)
      nameArr.unshift(prefix)
    return nameArr.join('-').replace(/\.svg$/, '')
  }, // 默认值, 自定义symbolId的格式
  optimizeOptions: undefined // 默认值, svgo 优化配置
})
```

## Typescript 支持
```json
// tsconfig.json
{
  "include": ["svg-component.d.ts", "svg-component-global.d.ts"]
}
```

## License
MIT License © 2022-PRESENT [Jevon617](https://github.com/Jevon617)
