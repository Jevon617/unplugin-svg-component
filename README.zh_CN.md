# unplugin-svg-component
[English](./README.md) | **中文**

UnpluginSvgComponent 启发于[vite-plugin-icons](https://github.com/vbenjs/vite-plugin-svg-icons), 通过本地的svg文件生成一个vue组件, 并支持typescript智能提示, 热更新.

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
      // 通常, 插件会把fill, stroke的值替换为'currentColor',
      // 你可以使用这个选项来控制是否保留原来的颜色。
      preserveColor: /logo\.svg$/,
    }),
  ],
})
```
```ts
// main.ts
import SvgIcon from 'virtual:svg-component'
app.component(SvgIcon.name, SvgIcon)
```

## Typescript 支持
```json
// tsconfig.json
{
  "include": ["svg-component.d.ts", "svg-component-global.d.ts"]
}
```

## License
MIT License © 2022 Jevon617
