import type { Options } from '../types'

export function debounce(fn: (...args: any) => void, delay: number) {
  let timer: NodeJS.Timeout

  return function (...args) {
    if (timer)
      clearTimeout(timer)

    timer = setTimeout(() => {
      fn.apply(this, args)
      clearTimeout(timer)
    }, delay)
  }
}

export function replace(dts: string, symbolIds: Set<string>, componentName: string) {
  return dts.replace(
    /\$svg_symbolIds/g,
    Array.from(symbolIds).join('" | "'),
  ).replace(
    /\$component_name/g,
    componentName,
  )
}

export function resolveOptions(options: Options): Options {
  const defaultOptions: Partial<Options> = {
    componentName: 'SvgIcon',
    dtsDir: process.cwd(),
    projectType: 'auto',
    svgSpriteDomId: '__svg_sprite__dom__',
    componentStyle: 'width: 1em; height: 1em; fill:currentColor;',
    symbolIdFormatter(svgName: string, prefix: string) {
      const nameArr = svgName.split('/')
      if (prefix)
        nameArr.unshift(prefix)
      return nameArr.join('-').replace(/\.svg$/, '')
    },
  }
  return {
    ...defaultOptions,
    ...options,
  }
}

export function transformStyleStrToObject(styleStr: string): Record<string, string> {
  return styleStr.replace(/;$/, '').split(';').reduce((ruleMap, ruleString) => {
    const rulePair = ruleString.split(':')
    ruleMap[rulePair[0].trim()] = rulePair[1].trim()
    return ruleMap
  }, {})
}
