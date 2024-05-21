import process from 'node:process'
import path from 'node:path'
import Sprite from 'svg-sprite'
import fg from 'fast-glob'
import type { Options, SvgSpriteInfo } from '../types'
import { addSymbol } from './sprite'

export function debounce(fn: (...args: any) => void, delay: number) {
  let timer: NodeJS.Timeout

  return function (...args: any[]) {
    if (timer)
      clearTimeout(timer)
    timer = setTimeout(() => {
      // @ts-expect-error invalid this
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
  ).replace(
    /\$svg_names/g,
    Array.from(symbolIds).join('", "'),
  )
}

export function resolveOptions(options: Options): Options {
  const defaultOptions: Partial<Options> = {
    componentName: 'SvgIcon',
    dtsDir: process.cwd(),
    projectType: 'auto',
    vueVersion: 'auto',
    svgSpriteDomId: '__svg_sprite__dom__',
    componentStyle: 'width: 1em; height: 1em; fill:currentColor;',
    symbolIdFormatter(svgName: string, prefix: string) {
      const nameArr = svgName.split('\\')
      if (prefix)
        nameArr.unshift(prefix)
      return nameArr.join('-').replace(/\.svg$/, '')
    },
    treeShaking: true,
    scanGlob: [
      '**/*.html',
      '**/*.pug',
      '**/*.vue',
      '**/*.js',
      '**/*.ts',
      '**/*.tsx',
      '**/*.jsx',
    ],
    scanStrategy: 'component',
  }
  return {
    ...defaultOptions,
    ...options,
  }
}

export function transformStyleStrToObject(styleStr: string): Record<string, string> {
  return styleStr.replace(/;$/, '').split(';').reduce((ruleMap: Record<string, string>, ruleString) => {
    const rulePair = ruleString.split(':')

    if (!rulePair[0] || !rulePair[1])
      return ruleMap

    ruleMap[rulePair[0].trim()] = rulePair[1].trim()
    return ruleMap
  }, {})
}

export function tranfromToKebabCase(str: string) {
  const arr = str.trim().split('')
  const result = arr.map((item, index) => {
    if (index === 0)
      return `${item.toLowerCase()}`
    else if (item.toUpperCase() === item)
      return `-${item.toLowerCase()}`
    else
      return item
  }).join('')
  return result
}
