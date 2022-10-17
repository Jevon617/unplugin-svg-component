# unplugin-svg-component
generate a vue component with svg files, and use this component with typescript intellisense.


## usage

```
import UnpluginSvgComponent from 'unplugin-svg-component/vite'

export default defineConfig({
  plugins: [
    UnpluginSvgComponent({
      iconDir: path.resolve(__dirname, 'icons'),
      dts: true,
    }),
  ],
})
```
