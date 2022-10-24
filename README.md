# unplugin-svg-component
**English** | [中文](./README.zh_CN.md)

UnpluginSvgComponent inspired by [vite-plugin-icons](https://github.com/vbenjs/vite-plugin-svg-icons), 
it will generate a Vue component with SVG files, and use this component with typescript Intellisense.

## Features
* Use svg component with typescript intellisense
* HMR for svg file
![image](./images/intellisense.jpg)

## Installation 

```shell
yarn add unplugin-svg-component -D
# or
npm i unplugin-svg-component -D
# or
pnpm install unplugin-svg-component -D
```

## Usage

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
MIT License © 2022 Jevon617
