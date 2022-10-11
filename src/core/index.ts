import { createUnplugin } from 'unplugin'
import type { Options } from '../types'
import createSvgSprite from './compile-svg'

export default createUnplugin<Options | undefined>(options => ({
  name: 'unplugin-svg-component',
  resolveId(id: string) {
    if (id === 'virtual:svg-component')
      return id
  },
  loadInclude(id) {
    return id === 'virtual:svg-component'
  },
  async load() {
    const { svgSprite } = await createSvgSprite(options!)

    const code = `
    if (typeof window !== 'undefined') {
      function loadSvg() {
        var body = document.body;
        var svgDom = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svgDom.style.position = 'absolute';
          svgDom.style.width = '0';
          svgDom.style.height = '0';
          svgDom.id = '__svg__icons__dom__';
          svgDom.setAttribute('xmlns','http://www.w3.org/2000/svg');
          svgDom.setAttribute('xmlns:link','http://www.w3.org/1999/xlink');
          svgDom.innerHTML = ${JSON.stringify(svgSprite)};
        body.append(svgDom)
      }
      if(document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadSvg);
      } else {
        loadSvg()
      }
   }
   export default {}
     `
    return {
      code,
    }
  },
}))
