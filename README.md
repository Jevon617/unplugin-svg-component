# unplugin-svg-component
generate a vue component with svg files, and use this component with typescript intellisense.

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
import SvgIcon from 'virtual:svg-component'
app.component(SvgIcon.name, SvgIcon)
```

## Typescript intellisense
```json
// tsconfig.json
{
  "include": ["svg-component.d.ts", "svg-component-global.d.ts"]
}
```

